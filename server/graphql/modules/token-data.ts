/**
 * GraphQL Module for Token Data
 * Exposes token HP, conditions, stats, and initiative tracking
 */

import { pipe } from "fp-ts/lib/function";
import * as RT from "fp-ts/lib/ReaderTask";
import { t } from "..";
import * as tokenDataDb from "../../token-data-db";
import type {
  TokenData,
  InitiativeEntry,
  CombatState,
} from "../../token-types";
import type { TokenCondition, TokenDataInput } from "../../token-types";

// ============================================================================
// Token Condition Enum
// ============================================================================

const GraphQLTokenConditionEnum = t.enumType({
  name: "TokenCondition",
  description: "Status conditions that can be applied to tokens",
  values: [
    { name: "BLINDED", value: "blinded" },
    { name: "CHARMED", value: "charmed" },
    { name: "DEAFENED", value: "deafened" },
    { name: "EXHAUSTED", value: "exhausted" },
    { name: "FRIGHTENED", value: "frightened" },
    { name: "GRAPPLED", value: "grappled" },
    { name: "INCAPACITATED", value: "incapacitated" },
    { name: "INVISIBLE", value: "invisible" },
    { name: "PARALYZED", value: "paralyzed" },
    { name: "PETRIFIED", value: "petrified" },
    { name: "POISONED", value: "poisoned" },
    { name: "PRONE", value: "prone" },
    { name: "RESTRAINED", value: "restrained" },
    { name: "STUNNED", value: "stunned" },
    { name: "UNCONSCIOUS", value: "unconscious" },
    { name: "CONCENTRATING", value: "concentrating" },
    { name: "BLESSED", value: "blessed" },
    { name: "CURSED", value: "cursed" },
    { name: "HASTED", value: "hasted" },
    { name: "SLOWED", value: "slowed" },
    { name: "RAGING", value: "raging" },
  ],
});

// ============================================================================
// Token Data Type
// ============================================================================

const GraphQLTokenDataType = t.objectType<TokenData>({
  name: "TokenData",
  description: "Extended data for a token (HP, conditions, stats)",
  fields: () => [
    t.field({
      name: "id",
      type: t.NonNull(t.ID),
      resolve: (record) => String(record.id),
    }),
    t.field({
      name: "tokenId",
      type: t.String, // CHANGED: Made nullable since tokenData itself can be null
      resolve: (record) => record.tokenId,
    }),
    t.field({
      name: "mapId",
      type: t.String, // CHANGED: Made nullable since tokenData itself can be null
      resolve: (record) => record.mapId,
    }),
    t.field({
      name: "currentHp",
      type: t.Int,
      resolve: (record) => {
        console.log("[GraphQL] currentHp resolver:", {
          value: record.currentHp,
          type: typeof record.currentHp,
        });
        return record.currentHp;
      },
    }),
    t.field({
      name: "maxHp",
      type: t.Int,
      resolve: (record) => {
        console.log("[GraphQL] maxHp resolver:", {
          value: record.maxHp,
          type: typeof record.maxHp,
        });
        return record.maxHp;
      },
    }),
    t.field({
      name: "tempHp",
      type: t.NonNull(t.Int),
      resolve: (record) => {
        console.log("[GraphQL] tempHp resolver:", {
          value: record.tempHp,
          type: typeof record.tempHp,
        });
        return record.tempHp;
      },
    }),
    t.field({
      name: "armorClass",
      type: t.Int,
      resolve: (record) => {
        console.log("[GraphQL] armorClass resolver:", {
          value: record.armorClass,
          type: typeof record.armorClass,
        });
        return record.armorClass;
      },
    }),
    t.field({
      name: "speed",
      type: t.Int,
      resolve: (record) => record.speed,
    }),
    t.field({
      name: "initiativeModifier",
      type: t.NonNull(t.Int),
      resolve: (record) => record.initiativeModifier,
    }),
    t.field({
      name: "conditions",
      type: t.NonNull(t.List(t.NonNull(GraphQLTokenConditionEnum))),
      resolve: (record) => {
        console.log("[GraphQL] conditions resolver:", {
          value: record.conditions,
          type: typeof record.conditions,
          isArray: Array.isArray(record.conditions),
          length: Array.isArray(record.conditions)
            ? record.conditions.length
            : "N/A",
        });
        const result = record.conditions || [];
        console.log("[GraphQL] conditions resolver returning:", result);
        return result;
      },
    }),
    t.field({
      name: "notes",
      type: t.String,
      resolve: (record) => {
        console.log("[GraphQL] notes resolver:", {
          value: record.notes,
          type: typeof record.notes,
        });
        return record.notes;
      },
    }),
    t.field({
      name: "createdAt",
      type: t.NonNull(t.Int),
      resolve: (record) => record.createdAt,
    }),
    t.field({
      name: "updatedAt",
      type: t.NonNull(t.Int),
      resolve: (record) => record.updatedAt,
    }),
  ],
});

// ============================================================================
// Initiative Entry Type
// ============================================================================

const GraphQLInitiativeEntryType = t.objectType<InitiativeEntry>({
  name: "InitiativeEntry",
  description: "Initiative tracker entry for a token",
  fields: () => [
    t.field({
      name: "id",
      type: t.NonNull(t.ID),
      resolve: (record) => String(record.id),
    }),
    t.field({
      name: "mapId",
      type: t.NonNull(t.String),
      resolve: (record) => record.mapId,
    }),
    t.field({
      name: "tokenId",
      type: t.NonNull(t.String),
      resolve: (record) => record.tokenId,
    }),
    t.field({
      name: "initiativeValue",
      type: t.NonNull(t.Int),
      resolve: (record) => record.initiativeValue,
    }),
    t.field({
      name: "isActive",
      type: t.NonNull(t.Boolean),
      resolve: (record) => record.isActive,
    }),
    t.field({
      name: "roundNumber",
      type: t.NonNull(t.Int),
      resolve: (record) => record.roundNumber,
    }),
    t.field({
      name: "orderIndex",
      type: t.NonNull(t.Int),
      resolve: (record) => record.orderIndex,
    }),
  ],
});

// ============================================================================
// Combat State Type
// ============================================================================

const GraphQLCombatStateType = t.objectType<CombatState>({
  name: "CombatState",
  description: "Current combat state for a map",
  fields: () => [
    t.field({
      name: "mapId",
      type: t.NonNull(t.String),
      resolve: (record) => record.mapId,
    }),
    t.field({
      name: "isActive",
      type: t.NonNull(t.Boolean),
      resolve: (record) => record.isActive,
    }),
    t.field({
      name: "currentRound",
      type: t.NonNull(t.Int),
      resolve: (record) => record.currentRound,
    }),
    t.field({
      name: "activeTokenId",
      type: t.String,
      resolve: (record) => record.activeTokenId,
    }),
    t.field({
      name: "initiatives",
      type: t.NonNull(t.List(t.NonNull(GraphQLInitiativeEntryType))),
      resolve: (record) => record.initiatives,
    }),
  ],
});

// ============================================================================
// Input Types
// ============================================================================

const GraphQLTokenDataInput = t.inputObjectType({
  name: "TokenDataInput",
  description: "Input for creating or updating token data",
  fields: () => ({
    tokenId: {
      type: t.NonNullInput(t.String),
    },
    mapId: {
      type: t.NonNullInput(t.String),
    },
    currentHp: {
      type: t.Int,
    },
    maxHp: {
      type: t.Int,
    },
    tempHp: {
      type: t.Int,
    },
    armorClass: {
      type: t.Int,
    },
    speed: {
      type: t.Int,
    },
    initiativeModifier: {
      type: t.Int,
    },
    conditions: {
      type: t.ListInput(t.NonNullInput(GraphQLTokenConditionEnum)),
    },
    notes: {
      type: t.String,
    },
  }),
});

const GraphQLApplyDamageInput = t.inputObjectType({
  name: "ApplyDamageInput",
  fields: () => ({
    tokenId: {
      type: t.NonNullInput(t.String),
    },
    amount: {
      type: t.NonNullInput(t.Int),
      description: "Positive for damage, negative for healing",
    },
  }),
});

const GraphQLToggleConditionInput = t.inputObjectType({
  name: "ToggleConditionInput",
  fields: () => ({
    tokenId: {
      type: t.NonNullInput(t.String),
    },
    condition: {
      type: t.NonNullInput(GraphQLTokenConditionEnum),
    },
  }),
});

const GraphQLSetInitiativeInput = t.inputObjectType({
  name: "SetInitiativeInput",
  fields: () => ({
    mapId: {
      type: t.NonNullInput(t.String),
    },
    tokenId: {
      type: t.NonNullInput(t.String),
    },
    initiativeValue: {
      type: t.NonNullInput(t.Int),
    },
  }),
});

// ============================================================================
// Query Fields
// ============================================================================

export const queryFields = [
  t.field({
    name: "tokenData",
    type: GraphQLTokenDataType,
    description: "Get token data by token ID",
    args: {
      tokenId: t.arg(t.NonNullInput(t.String)),
    },
    resolve: (_, args, context) => {
      console.log("[GraphQL Query] tokenData requested:", {
        tokenId: args.tokenId,
      });
      const result = RT.run(
        pipe(
          RT.fromTask(() => tokenDataDb.getTokenData(context.db, args.tokenId))
        ),
        context
      );
      console.log("[GraphQL Query] tokenData result:", result);
      return result;
    },
  }),
  t.field({
    name: "mapTokenData",
    type: t.NonNull(t.List(t.NonNull(GraphQLTokenDataType))),
    description: "Get all token data for a map",
    args: {
      mapId: t.arg(t.NonNullInput(t.String)),
    },
    resolve: (_, args, context) => {
      console.log("[GraphQL Query] mapTokenData requested:", {
        mapId: args.mapId,
      });
      const result = RT.run(
        pipe(
          RT.fromTask(() => tokenDataDb.getMapTokenData(context.db, args.mapId))
        ),
        context
      );
      console.log(
        "[GraphQL Query] mapTokenData result count:",
        Array.isArray(result) ? result.length : "not an array"
      );
      return result;
    },
  }),
  t.field({
    name: "combatState",
    type: t.NonNull(GraphQLCombatStateType),
    description: "Get current combat state for a map",
    args: {
      mapId: t.arg(t.NonNullInput(t.String)),
    },
    resolve: (_, args, context) =>
      RT.run(
        pipe(
          RT.fromTask(() => tokenDataDb.getCombatState(context.db, args.mapId))
        ),
        context
      ),
  }),
];

// ============================================================================
// Export Token Data Type for use in other modules
// ============================================================================

export { GraphQLTokenDataType };

// ============================================================================
// Mutation Fields
// ============================================================================

export const mutationFields = [
  t.field({
    name: "upsertTokenData",
    type: t.NonNull(GraphQLTokenDataType),
    description: "Create or update token data",
    args: {
      input: t.arg(t.NonNullInput(GraphQLTokenDataInput)),
    },
    resolve: (_, args, context) => {
      console.log(
        "[GraphQL upsertTokenData] Called with full input:",
        args.input
      );
      return RT.run(
        pipe(
          RT.fromTask(() =>
            tokenDataDb.upsertTokenData(context.db, {
              tokenId: args.input.tokenId,
              mapId: args.input.mapId,
              currentHp: args.input.currentHp ?? undefined,
              maxHp: args.input.maxHp ?? undefined,
              tempHp: args.input.tempHp ?? undefined,
              armorClass: args.input.armorClass ?? undefined,
              speed: args.input.speed ?? undefined,
              initiativeModifier: args.input.initiativeModifier ?? undefined,
              conditions:
                (args.input.conditions as TokenCondition[] | undefined) ??
                undefined,
              notes: args.input.notes ?? undefined,
            })
          )
        ),
        context
      );
    },
  }),
  t.field({
    name: "applyDamage",
    type: t.NonNull(GraphQLTokenDataType),
    description: "Apply damage or healing to a token",
    args: {
      input: t.arg(t.NonNullInput(GraphQLApplyDamageInput)),
    },
    resolve: (_, args, context) =>
      RT.run(
        pipe(
          RT.fromTask(() =>
            tokenDataDb.applyDamage(
              context.db,
              args.input.tokenId,
              args.input.amount
            )
          )
        ),
        context
      ),
  }),
  t.field({
    name: "toggleCondition",
    type: t.NonNull(GraphQLTokenDataType),
    description: "Toggle a condition on/off for a token",
    args: {
      input: t.arg(t.NonNullInput(GraphQLToggleConditionInput)),
    },
    resolve: (_, args, context) =>
      RT.run(
        pipe(
          RT.fromTask(() =>
            tokenDataDb.toggleCondition(
              context.db,
              args.input.tokenId,
              args.input.condition as TokenCondition
            )
          )
        ),
        context
      ),
  }),
  t.field({
    name: "deleteTokenData",
    type: t.NonNull(t.Boolean),
    description: "Delete token data",
    args: {
      tokenId: t.arg(t.NonNullInput(t.String)),
    },
    resolve: (_, args, context) =>
      RT.run(
        pipe(
          RT.fromTask(async () => {
            await tokenDataDb.deleteTokenData(context.db, args.tokenId);
            return true;
          })
        ),
        context
      ),
  }),
  t.field({
    name: "setInitiative",
    type: t.NonNull(GraphQLInitiativeEntryType),
    description: "Set initiative value for a token",
    args: {
      input: t.arg(t.NonNullInput(GraphQLSetInitiativeInput)),
    },
    resolve: (_, args, context) =>
      RT.run(
        pipe(
          RT.fromTask(() =>
            tokenDataDb.setInitiative(context.db, {
              mapId: args.input.mapId,
              tokenId: args.input.tokenId,
              initiativeValue: args.input.initiativeValue,
            })
          )
        ),
        context
      ),
  }),
  t.field({
    name: "advanceInitiative",
    type: t.NonNull(GraphQLCombatStateType),
    description: "Advance to next turn in initiative order",
    args: {
      mapId: t.arg(t.NonNullInput(t.String)),
    },
    resolve: (_, args, context) =>
      RT.run(
        pipe(
          RT.fromTask(() =>
            tokenDataDb.advanceInitiative(context.db, args.mapId)
          )
        ),
        context
      ),
  }),
  t.field({
    name: "startCombat",
    type: t.NonNull(GraphQLCombatStateType),
    description: "Start combat (activate first token in initiative)",
    args: {
      mapId: t.arg(t.NonNullInput(t.String)),
    },
    resolve: (_, args, context) =>
      RT.run(
        pipe(
          RT.fromTask(() => tokenDataDb.startCombat(context.db, args.mapId))
        ),
        context
      ),
  }),
  t.field({
    name: "endCombat",
    type: t.NonNull(t.Boolean),
    description: "End combat (clear all initiative)",
    args: {
      mapId: t.arg(t.NonNullInput(t.String)),
    },
    resolve: (_, args, context) =>
      RT.run(
        pipe(
          RT.fromTask(async () => {
            await tokenDataDb.endCombat(context.db, args.mapId);
            return true;
          })
        ),
        context
      ),
  }),
  t.field({
    name: "removeFromInitiative",
    type: t.NonNull(t.Boolean),
    description: "Remove a token from initiative order",
    args: {
      mapId: t.arg(t.NonNullInput(t.String)),
      tokenId: t.arg(t.NonNullInput(t.String)),
    },
    resolve: (_, args, context) =>
      RT.run(
        pipe(
          RT.fromTask(async () => {
            await tokenDataDb.removeFromInitiative(
              context.db,
              args.mapId,
              args.tokenId
            );
            return true;
          })
        ),
        context
      ),
  }),
];

// ============================================================================
// Subscription Fields
// ============================================================================

export const subscriptionFields: any[] = [];
