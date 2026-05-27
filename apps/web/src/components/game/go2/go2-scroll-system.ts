// ============================================================
// GO2 SCROLL SYSTEM — Merge Scrolls for Commander Merging
// ============================================================
// Scrolls are inventory items consumed during commander merges.
// Types match commander rarity:
//   - Skill Merge Scroll    (green)  — free / common drop
//   - Super Merge Scroll    (blue)   — 50 Corsairs' Gold
//   - Legendary Merge Scroll (purple)— 150 Corsairs' Gold
//   - Divine Merge Scroll   (gold)   — 300 Corsairs' Gold
// ============================================================

import { Rarity, RARITY_COLORS } from './go2-commander-data';

// ------------------------------------------------------------------
// TYPES
// ------------------------------------------------------------------

/** Scroll rarity uses "skill" instead of "common" to match GO2 naming */
export type ScrollRarity = 'skill' | 'super' | 'legendary' | 'divine';

/** A merge scroll item stored in the player's inventory */
export interface MergeScroll {
  id: string;
  rarity: ScrollRarity;
  name: string;
  description: string;
  quantity: number;
}

// ------------------------------------------------------------------
// CONSTANTS
// ------------------------------------------------------------------

/** Corsairs' Gold cost to purchase one scroll of each rarity */
export const SCROLL_COSTS: Record<ScrollRarity, number> = {
  skill: 0,       // Free — common drop from rewards / events
  super: 50,      // Corsairs' Gold
  legendary: 150, // Corsairs' Gold
  divine: 300,    // Corsairs' Gold
};

/** Human-readable names for each scroll type */
export const SCROLL_NAMES: Record<ScrollRarity, string> = {
  skill: 'Skill Merge Scroll',
  super: 'Super Merge Scroll',
  legendary: 'Legendary Merge Scroll',
  divine: 'Divine Merge Scroll',
};

/** Display colors for each scroll rarity */
export const SCROLL_COLORS: Record<ScrollRarity, string> = {
  skill: '#4caf50',
  super: '#2196f3',
  legendary: '#9c27b0',
  divine: '#ff9800',
};

// ------------------------------------------------------------------
// RARITY MAPPING
// ------------------------------------------------------------------

/**
 * Map commander Rarity to scroll ScrollRarity.
 * "common" commanders use "skill" scrolls.
 */
export function toScrollRarity(rarity: Rarity): ScrollRarity {
  if (rarity === 'common') return 'skill';
  return rarity;
}

/**
 * Map scroll ScrollRarity back to commander Rarity.
 * "skill" scrolls are used for "common" commanders.
 */
export function toCommanderRarity(scrollRarity: ScrollRarity): Rarity {
  if (scrollRarity === 'skill') return 'common';
  return scrollRarity;
}

/** Get the display color for a scroll rarity */
export function getScrollColor(rarity: ScrollRarity): string {
  return SCROLL_COLORS[rarity];
}

/** Fallback to RARITY_COLORS from commander data */
export function getRarityColor(rarity: Rarity | ScrollRarity): string {
  if (rarity === 'skill') return SCROLL_COLORS.skill;
  return RARITY_COLORS[rarity as Rarity] ?? '#999';
}

// ------------------------------------------------------------------
// SCROLL OPERATIONS
// ------------------------------------------------------------------

/**
 * Check if the player has at least one scroll matching the commander rarity.
 * @param commanderRarity — rarity of the commander being merged
 * @param scrolls — player's current scroll inventory
 */
export function canMerge(commanderRarity: Rarity, scrolls: MergeScroll[]): boolean {
  const scrollRarity = toScrollRarity(commanderRarity);
  const needed = scrolls.find(s => s.rarity === scrollRarity);
  return (needed?.quantity ?? 0) > 0;
}

/**
 * Consume one scroll of the given rarity.
 * @returns true if a scroll was consumed, false if none available
 */
export function consumeScroll(rarity: ScrollRarity, scrolls: MergeScroll[]): boolean {
  const scroll = scrolls.find(s => s.rarity === rarity);
  if (scroll && scroll.quantity > 0) {
    scroll.quantity--;
    return true;
  }
  return false;
}

/**
 * Consume one scroll matching the commander's rarity.
 * @returns true if a scroll was consumed, false if none available
 */
export function consumeScrollForCommander(commanderRarity: Rarity, scrolls: MergeScroll[]): boolean {
  return consumeScroll(toScrollRarity(commanderRarity), scrolls);
}

/**
 * Add scrolls to inventory (e.g. from rewards, mall, events, combat drops).
 * @returns the updated scroll entry
 */
export function addScrolls(
  rarity: ScrollRarity,
  amount: number,
  scrolls: MergeScroll[],
): MergeScroll {
  let scroll = scrolls.find(s => s.rarity === rarity);
  if (!scroll) {
    scroll = {
      id: `scroll_${rarity}`,
      rarity,
      name: SCROLL_NAMES[rarity],
      description: `A scroll used to merge ${SCROLL_NAMES[rarity].replace(' Merge Scroll', '')} commanders.`,
      quantity: 0,
    };
    scrolls.push(scroll);
  }
  scroll.quantity += amount;
  return scroll;
}

// ------------------------------------------------------------------
// SCROLL ACQUISITION SOURCES
// ------------------------------------------------------------------

export type ScrollSource = 'daily_reward' | 'mall' | 'event' | 'combat_drop' | 'purchase';

/** Check if a scroll can be obtained from a given source */
export function canObtainScroll(
  rarity: ScrollRarity,
  source: ScrollSource,
): boolean {
  // Skill scrolls drop everywhere; others require higher-tier sources
  switch (source) {
    case 'daily_reward':
      return rarity === 'skill' || rarity === 'super';
    case 'mall':
      return true; // All rarities available in mall
    case 'event':
      return true; // All rarities from events
    case 'combat_drop':
      return rarity === 'skill' || rarity === 'super'; // Legendary+ rare drops
    case 'purchase':
      return true;
    default:
      return false;
  }
}

// ------------------------------------------------------------------
// DEFAULT SCROLL INVENTORY (starter kit)
// ------------------------------------------------------------------

/** Creates a fresh scroll inventory with 0 of each type */
export function createEmptyScrollInventory(): MergeScroll[] {
  return [
    {
      id: 'scroll_skill',
      rarity: 'skill',
      name: 'Skill Merge Scroll',
      description: 'A scroll used to merge Skill commanders. Obtained freely from daily rewards and combat drops.',
      quantity: 0,
    },
    {
      id: 'scroll_super',
      rarity: 'super',
      name: 'Super Merge Scroll',
      description: 'A scroll used to merge Super commanders. Costs 50 Corsairs\' Gold.',
      quantity: 0,
    },
    {
      id: 'scroll_legendary',
      rarity: 'legendary',
      name: 'Legendary Merge Scroll',
      description: 'A scroll used to merge Legendary commanders. Costs 150 Corsairs\' Gold.',
      quantity: 0,
    },
    {
      id: 'scroll_divine',
      rarity: 'divine',
      name: 'Divine Merge Scroll',
      description: 'A scroll used to merge Divine commanders. Costs 300 Corsairs\' Gold.',
      quantity: 0,
    },
  ];
}
