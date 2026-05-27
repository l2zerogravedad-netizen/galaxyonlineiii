// ============================================================
// GO2 FATALITY SYSTEM
// When a fleet with a commander is completely destroyed in combat,
// the commander has a chance to suffer permanent death.
// ============================================================

import type { Rarity } from './go2-commander-data';

// ------------------------------------------------------------
// Commander status in the injury cycle
// Normal -> Injured (after combat loss) -> Hospital -> Normal
// Fatality skips the cycle: Normal/Injured -> Dead (permanent)
// ------------------------------------------------------------
export type CommanderStatus = 'Normal' | 'Injured' | 'InHospital' | 'Dead';

// ------------------------------------------------------------
// Base fatality chance by rarity (as decimal, e.g. 0.05 = 5%)
// Lower rarity = higher fatality chance
// ------------------------------------------------------------
export const BASE_FATALITY_CHANCE: Record<Rarity, number> = {
  common: 0.05, // Skill: 5%
  super: 0.03, // Super: 3%
  legendary: 0.02, // Legendary: 2%
  divine: 0.01, // Divine: 1%
};

// ------------------------------------------------------------
// Additional fatality modifier per star level (+1% per star)
// ------------------------------------------------------------
export const FATALITY_PER_STAR = 0.01;

// ------------------------------------------------------------
// Fatality reduction modifiers
// ------------------------------------------------------------
export const FATALITY_REDUCTION_ANGLA = 0.02; // -2% if commander has "Angla" skill
export const FATALITY_REDUCTION_HOSPITAL = 0.02; // -2% if hospital bed available

// ------------------------------------------------------------
// Fatality result types
// ------------------------------------------------------------
export interface FatalityResult {
  fatalityTriggered: boolean;
  roll: number; // The random roll (0-1)
  finalChance: number; // The computed probability
  commanderRarity: Rarity;
  commanderName: string;
}

// ------------------------------------------------------------
// Calculate the final fatality chance for a commander
// after all modifiers are applied.
//
// Parameters:
//   commanderRarity  - the rarity tier of the commander
//   commanderStars   - number of stars (0-N)
//   hasAnglaSkill    - true if commander has the "Angla" skill
//   hospitalAvailable - true if a hospital bed is available
//
// Returns: final probability clamped between 0.1% and 50%
// ------------------------------------------------------------
export function calculateFatalityChance(
  commanderRarity: Rarity,
  commanderStars: number,
  hasAnglaSkill: boolean,
  hospitalAvailable: boolean
): number {
  let chance = BASE_FATALITY_CHANCE[commanderRarity];

  // +1% per star level
  chance += commanderStars * FATALITY_PER_STAR;

  // -2% if commander has "Angla" skill
  if (hasAnglaSkill) {
    chance -= FATALITY_REDUCTION_ANGLA;
  }

  // -2% if hospital bed is available
  if (hospitalAvailable) {
    chance -= FATALITY_REDUCTION_HOSPITAL;
  }

  // Clamp: minimum 0.1%, maximum 50%
  return Math.max(0.001, Math.min(0.5, chance));
}

// ------------------------------------------------------------
// Roll the fatality dice.
// Returns true if the commander dies permanently.
// ------------------------------------------------------------
export function rollFatality(chance: number): boolean {
  return Math.random() < chance;
}

// ------------------------------------------------------------
// Full fatality check — calculates chance + rolls
// Returns a detailed result object for UI display.
// ------------------------------------------------------------
export function checkFatality(
  commanderRarity: Rarity,
  commanderStars: number,
  hasAnglaSkill: boolean,
  hospitalAvailable: boolean,
  commanderName: string
): FatalityResult {
  const finalChance = calculateFatalityChance(
    commanderRarity,
    commanderStars,
    hasAnglaSkill,
    hospitalAvailable
  );
  const roll = Math.random();
  const fatalityTriggered = roll < finalChance;

  return {
    fatalityTriggered,
    roll,
    finalChance,
    commanderRarity,
    commanderName,
  };
}

// ------------------------------------------------------------
// Format fatality chance as a human-readable percentage string
// ------------------------------------------------------------
export function formatFatalityChance(chance: number): string {
  if (chance < 0.01) {
    return `${(chance * 100).toFixed(1)}%`;
  }
  return `${(chance * 100).toFixed(1)}%`;
}

// ------------------------------------------------------------
// Divine commanders can be revived (expensive premium feature)
// Returns the cost in premium currency based on star level
// ------------------------------------------------------------
export function calculateReviveCost(stars: number): number {
  return 500 + stars * 200; // Base 500 + 200 per star
}

// ------------------------------------------------------------
// Check if a commander can be revived
// Only Divine commanders can be revived
// ------------------------------------------------------------
export function canRevive(rarity: Rarity): boolean {
  return rarity === 'divine';
}
