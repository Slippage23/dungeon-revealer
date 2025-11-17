/**
 * Token Management Type Definitions
 * Defines interfaces for enhanced token functionality
 */

/**
 * Status conditions that can be applied to tokens
 */
export type TokenCondition =
  | "blinded"
  | "charmed"
  | "deafened"
  | "exhausted"
  | "frightened"
  | "grappled"
  | "incapacitated"
  | "invisible"
  | "paralyzed"
  | "petrified"
  | "poisoned"
  | "prone"
  | "restrained"
  | "stunned"
  | "unconscious"
  | "concentrating"
  | "blessed"
  | "cursed"
  | "hasted"
  | "slowed"
  | "raging";

/**
 * Core token data stored in database
 */
export interface TokenData {
  id: number;
  tokenId: string; // References the token in the map system
  mapId: string; // Which map this token belongs to
  currentHp: number | null;
  maxHp: number | null;
  tempHp: number;
  armorClass: number | null;
  speed: number | null;
  initiativeModifier: number;
  conditions: TokenCondition[]; // Stored as JSON string in DB
  notes: string | null;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}

/**
 * Input for creating or updating token data
 */
export interface TokenDataInput {
  tokenId: string;
  mapId: string;
  currentHp?: number | null;
  maxHp?: number | null;
  tempHp?: number;
  armorClass?: number | null;
  speed?: number | null;
  initiativeModifier?: number;
  conditions?: TokenCondition[];
  notes?: string | null;
}

/**
 * Initiative tracker entry
 */
export interface InitiativeEntry {
  id: number;
  mapId: string;
  tokenId: string;
  initiativeValue: number;
  isActive: boolean; // Is it this token's turn?
  roundNumber: number;
  orderIndex: number; // Position in initiative order
  createdAt: number;
  updatedAt: number;
}

/**
 * Input for setting initiative
 */
export interface InitiativeInput {
  mapId: string;
  tokenId: string;
  initiativeValue: number;
}

/**
 * Combat state for a map
 */
export interface CombatState {
  mapId: string;
  isActive: boolean;
  currentRound: number;
  activeTokenId: string | null;
  initiatives: InitiativeEntry[];
}

/**
 * Damage/healing application
 */
export interface DamageInput {
  tokenId: string;
  amount: number; // Positive = damage, negative = healing
  damageType?: "normal" | "temp"; // Whether to apply to temp HP first
}

/**
 * Enhanced token with all combat data
 */
export interface EnhancedToken {
  tokenId: string;
  mapId: string;
  data: TokenData | null;
  initiative: InitiativeEntry | null;
}
