/**
 * Token Data Database Layer
 * Handles all database operations for token HP, conditions, and stats
 */

import * as sqlite from "sqlite";
import {
  TokenData,
  TokenDataInput,
  TokenCondition,
  InitiativeEntry,
  InitiativeInput,
  CombatState,
} from "./token-types";

/**
 * Convert database row to TokenData object
 */
const rowToTokenData = (row: any): TokenData => {
  console.log("[TokenData] rowToTokenData input:", {
    token_id: row.token_id,
    has_conditions: !!row.conditions,
    conditions_value: row.conditions,
    current_hp: row.current_hp,
    max_hp: row.max_hp,
    armor_class: row.armor_class,
  });

  let conditions: TokenCondition[] = [];
  if (row.conditions) {
    try {
      const parsed = JSON.parse(row.conditions);
      // Ensure it's an array of strings, filter out any non-string values
      conditions = (
        Array.isArray(parsed)
          ? parsed.filter((c: any) => typeof c === "string")
          : []
      ) as TokenCondition[];
      console.log("[TokenData] Parsed conditions:", conditions);
    } catch (e) {
      console.error(
        `[TokenData] Failed to parse conditions for token ${row.token_id}:`,
        e,
        "Raw value:",
        row.conditions
      );
      conditions = [];
    }
  }

  const result: TokenData = {
    id: row.id,
    tokenId: row.token_id,
    mapId: row.map_id,
    currentHp: row.current_hp ?? null,
    maxHp: row.max_hp ?? null,
    tempHp: row.temp_hp || 0,
    armorClass: row.armor_class ?? null,
    speed: row.speed ?? null,
    initiativeModifier: row.initiative_modifier || 0,
    conditions,
    notes: row.notes ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  console.log("[TokenData] rowToTokenData output:", {
    id: result.id,
    tokenId: result.tokenId,
    mapId: result.mapId,
    currentHp: result.currentHp,
    maxHp: result.maxHp,
    armorClass: result.armorClass,
    conditions: result.conditions,
  });

  return result;
};

/**
 * Convert database row to InitiativeEntry object
 */
const rowToInitiativeEntry = (row: any): InitiativeEntry => ({
  id: row.id,
  mapId: row.map_id,
  tokenId: row.token_id,
  initiativeValue: row.initiative_value,
  isActive: Boolean(row.is_active),
  roundNumber: row.round_number || 1,
  orderIndex: row.order_index,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/**
 * Get token data by token ID
 */
export const getTokenData = async (
  db: sqlite.Database,
  tokenId: string
): Promise<TokenData | null> => {
  console.log("[TokenDataDb] getTokenData requested:", { tokenId });
  const row = await db.get(
    `SELECT * FROM token_data WHERE token_id = ?`,
    tokenId
  );
  console.log("[TokenDataDb] getTokenData row:", row);
  const result = row ? rowToTokenData(row) : null;
  console.log("[TokenDataDb] getTokenData returning:", result);
  return result;
};

/**
 * Get all token data for a specific map
 */
export const getMapTokenData = async (
  db: sqlite.Database,
  mapId: string
): Promise<TokenData[]> => {
  console.log("[TokenDataDb] getMapTokenData requested:", { mapId });
  const rows = await db.all(
    `SELECT * FROM token_data WHERE map_id = ? ORDER BY updated_at DESC`,
    mapId
  );
  console.log(
    "[TokenDataDb] getMapTokenData rows count:",
    rows ? rows.length : 0
  );
  const result = rows.map(rowToTokenData);
  console.log("[TokenDataDb] getMapTokenData returning count:", result.length);
  return result;
};

/**
 * Create or update token data
 */
export const upsertTokenData = async (
  db: sqlite.Database,
  input: TokenDataInput
): Promise<TokenData> => {
  const now = Date.now();
  const conditions = JSON.stringify(input.conditions || []);

  const existing = await getTokenData(db, input.tokenId);

  if (existing) {
    // Update existing
    await db.run(
      `UPDATE token_data 
       SET current_hp = ?, max_hp = ?, temp_hp = ?, armor_class = ?, 
           speed = ?, initiative_modifier = ?, conditions = ?, notes = ?, updated_at = ?
       WHERE token_id = ?`,
      input.currentHp ?? existing.currentHp,
      input.maxHp ?? existing.maxHp,
      input.tempHp ?? existing.tempHp,
      input.armorClass ?? existing.armorClass,
      input.speed ?? existing.speed,
      input.initiativeModifier ?? existing.initiativeModifier,
      conditions,
      input.notes ?? existing.notes,
      now,
      input.tokenId
    );
  } else {
    // Insert new
    await db.run(
      `INSERT INTO token_data 
       (token_id, map_id, current_hp, max_hp, temp_hp, armor_class, speed, initiative_modifier, conditions, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      input.tokenId,
      input.mapId,
      input.currentHp ?? null,
      input.maxHp ?? null,
      input.tempHp ?? 0,
      input.armorClass ?? null,
      input.speed ?? null,
      input.initiativeModifier ?? 0,
      conditions,
      input.notes ?? null,
      now,
      now
    );
  }

  const result = await getTokenData(db, input.tokenId);
  if (!result) throw new Error("Failed to create/update token data");
  return result;
};

/**
 * Apply damage or healing to a token
 */
export const applyDamage = async (
  db: sqlite.Database,
  tokenId: string,
  amount: number
): Promise<TokenData> => {
  const tokenData = await getTokenData(db, tokenId);
  if (!tokenData) {
    throw new Error(`Token ${tokenId} not found`);
  }

  let currentHp = tokenData.currentHp ?? 0;
  let tempHp = tokenData.tempHp;

  if (amount > 0) {
    // Taking damage - apply to temp HP first
    if (tempHp > 0) {
      const tempDamage = Math.min(tempHp, amount);
      tempHp -= tempDamage;
      amount -= tempDamage;
    }
    // Remaining damage to regular HP
    currentHp = Math.max(0, currentHp - amount);
  } else {
    // Healing (negative amount)
    const maxHp = tokenData.maxHp ?? currentHp;
    currentHp = Math.min(maxHp, currentHp - amount);
  }

  return upsertTokenData(db, {
    tokenId,
    mapId: tokenData.mapId,
    currentHp,
    tempHp,
    conditions: tokenData.conditions, // PRESERVE existing conditions
  });
};

/**
 * Add or remove a condition from a token
 */
export const toggleCondition = async (
  db: sqlite.Database,
  tokenId: string,
  condition: TokenCondition
): Promise<TokenData> => {
  const tokenData = await getTokenData(db, tokenId);
  if (!tokenData) {
    throw new Error(`Token ${tokenId} not found`);
  }

  const conditions = new Set(tokenData.conditions);
  if (conditions.has(condition)) {
    conditions.delete(condition);
  } else {
    conditions.add(condition);
  }

  return upsertTokenData(db, {
    tokenId,
    mapId: tokenData.mapId,
    conditions: Array.from(conditions),
  });
};

/**
 * Delete token data
 */
export const deleteTokenData = async (
  db: sqlite.Database,
  tokenId: string
): Promise<void> => {
  await db.run(`DELETE FROM token_data WHERE token_id = ?`, tokenId);
};

// ============================================================================
// Initiative Tracker Functions
// ============================================================================

/**
 * Get initiative entry for a token
 */
export const getInitiativeEntry = async (
  db: sqlite.Database,
  mapId: string,
  tokenId: string
): Promise<InitiativeEntry | null> => {
  const row = await db.get(
    `SELECT * FROM initiative_order WHERE map_id = ? AND token_id = ?`,
    mapId,
    tokenId
  );
  return row ? rowToInitiativeEntry(row) : null;
};

/**
 * Get all initiative entries for a map (sorted by initiative value, descending)
 */
export const getMapInitiativeOrder = async (
  db: sqlite.Database,
  mapId: string
): Promise<InitiativeEntry[]> => {
  const rows = await db.all(
    `SELECT * FROM initiative_order 
     WHERE map_id = ? 
     ORDER BY initiative_value DESC, order_index ASC`,
    mapId
  );
  return rows.map(rowToInitiativeEntry);
};

/**
 * Set initiative for a token
 */
export const setInitiative = async (
  db: sqlite.Database,
  input: InitiativeInput
): Promise<InitiativeEntry> => {
  const now = Date.now();
  const existing = await getInitiativeEntry(db, input.mapId, input.tokenId);

  if (existing) {
    await db.run(
      `UPDATE initiative_order 
       SET initiative_value = ?, updated_at = ?
       WHERE map_id = ? AND token_id = ?`,
      input.initiativeValue,
      now,
      input.mapId,
      input.tokenId
    );
  } else {
    // Calculate order index
    const allEntries = await getMapInitiativeOrder(db, input.mapId);
    const orderIndex = allEntries.length;

    await db.run(
      `INSERT INTO initiative_order 
       (map_id, token_id, initiative_value, is_active, round_number, order_index, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      input.mapId,
      input.tokenId,
      input.initiativeValue,
      0,
      1,
      orderIndex,
      now,
      now
    );
  }

  const result = await getInitiativeEntry(db, input.mapId, input.tokenId);
  if (!result) throw new Error("Failed to set initiative");
  return result;
};

/**
 * Get current combat state for a map
 */
export const getCombatState = async (
  db: sqlite.Database,
  mapId: string
): Promise<CombatState> => {
  const initiatives = await getMapInitiativeOrder(db, mapId);
  const activeEntry = initiatives.find((e) => e.isActive);

  return {
    mapId,
    isActive: initiatives.length > 0,
    currentRound: activeEntry?.roundNumber || 1,
    activeTokenId: activeEntry?.tokenId || null,
    initiatives,
  };
};

/**
 * Advance to next turn in initiative
 */
export const advanceInitiative = async (
  db: sqlite.Database,
  mapId: string
): Promise<CombatState> => {
  const initiatives = await getMapInitiativeOrder(db, mapId);
  if (initiatives.length === 0) {
    return getCombatState(db, mapId);
  }

  const now = Date.now();
  const currentActiveIndex = initiatives.findIndex((e) => e.isActive);
  const nextIndex = (currentActiveIndex + 1) % initiatives.length;
  const isNewRound = nextIndex === 0 && currentActiveIndex >= 0;

  // Deactivate all
  await db.run(
    `UPDATE initiative_order SET is_active = 0 WHERE map_id = ?`,
    mapId
  );

  // Activate next
  const nextEntry = initiatives[nextIndex];
  const newRound = isNewRound
    ? nextEntry.roundNumber + 1
    : nextEntry.roundNumber;

  await db.run(
    `UPDATE initiative_order 
     SET is_active = 1, round_number = ?, updated_at = ?
     WHERE map_id = ? AND token_id = ?`,
    newRound,
    now,
    mapId,
    nextEntry.tokenId
  );

  // If new round, update all entries to new round number
  if (isNewRound) {
    await db.run(
      `UPDATE initiative_order SET round_number = ? WHERE map_id = ?`,
      newRound,
      mapId
    );
  }

  return getCombatState(db, mapId);
};

/**
 * Start combat (activate first token in initiative order)
 */
export const startCombat = async (
  db: sqlite.Database,
  mapId: string
): Promise<CombatState> => {
  const initiatives = await getMapInitiativeOrder(db, mapId);
  if (initiatives.length === 0) {
    throw new Error("No tokens in initiative order");
  }

  const now = Date.now();

  // Reset all to inactive, round 1
  await db.run(
    `UPDATE initiative_order SET is_active = 0, round_number = 1, updated_at = ? WHERE map_id = ?`,
    now,
    mapId
  );

  // Activate first token
  const firstToken = initiatives[0];
  await db.run(
    `UPDATE initiative_order SET is_active = 1, updated_at = ? WHERE map_id = ? AND token_id = ?`,
    now,
    mapId,
    firstToken.tokenId
  );

  return getCombatState(db, mapId);
};

/**
 * End combat (clear all initiative)
 */
export const endCombat = async (
  db: sqlite.Database,
  mapId: string
): Promise<void> => {
  await db.run(`DELETE FROM initiative_order WHERE map_id = ?`, mapId);
};

/**
 * Remove token from initiative
 */
export const removeFromInitiative = async (
  db: sqlite.Database,
  mapId: string,
  tokenId: string
): Promise<void> => {
  await db.run(
    `DELETE FROM initiative_order WHERE map_id = ? AND token_id = ?`,
    mapId,
    tokenId
  );
};
