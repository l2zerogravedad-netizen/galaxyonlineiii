// ============================================================
// GO2 GEM SYSTEM
// Commanders have 3 gem slots that boost various stats.
// Gems come in 5 types, 10 levels, and 3 qualities.
// ============================================================

export type GemType = 'red' | 'blue' | 'green' | 'yellow' | 'purple';
export type GemQuality = 'normal' | 'refined' | 'perfect';

export interface Gem {
  id: string;
  type: GemType;
  level: number; // 1-10
  quality: GemQuality;
}

// ------------------------------------------------------------
// Gem visual colours (hex) matching GO2 original UI
// ------------------------------------------------------------
export const GEM_COLORS: Record<GemType, string> = {
  red: '#ff4444',
  blue: '#4488ff',
  green: '#44ff44',
  yellow: '#ffdd44',
  purple: '#cc44ff',
};

// ------------------------------------------------------------
// Gem background gradients for slot rendering
// ------------------------------------------------------------
export const GEM_GRADIENTS: Record<GemType, string> = {
  red: 'from-[#ff4444] to-[#aa0000]',
  blue: 'from-[#4488ff] to-[#0033aa]',
  green: 'from-[#44ff44] to-[#00aa00]',
  yellow: 'from-[#ffdd44] to-[#cc9900]',
  purple: 'from-[#cc44ff] to-[#7700aa]',
};

// ------------------------------------------------------------
// Which commander stat each gem type boosts
// ------------------------------------------------------------
export const GEM_STAT_BONUSES: Record<GemType, string> = {
  red: 'accuracy',
  blue: 'speed',
  green: 'dodge',
  yellow: 'electron',
  purple: 'all',
};

// ------------------------------------------------------------
// Human-readable labels
// ------------------------------------------------------------
export const GEM_TYPE_LABELS: Record<GemType, string> = {
  red: 'Ruby',
  blue: 'Sapphire',
  green: 'Emerald',
  yellow: 'Topaz',
  purple: 'Amethyst',
};

// ------------------------------------------------------------
// Short stat labels for UI
// ------------------------------------------------------------
export const GEM_STAT_SHORT: Record<GemType, string> = {
  red: 'Acc',
  blue: 'Spd',
  green: 'Ddg',
  yellow: 'Elec',
  purple: 'All',
};

// ------------------------------------------------------------
// Quality multipliers
// ------------------------------------------------------------
export const QUALITY_MULTIPLIERS: Record<GemQuality, number> = {
  normal: 1.0,
  refined: 1.5,
  perfect: 2.0,
};

// ------------------------------------------------------------
// Quality display labels
// ------------------------------------------------------------
export const QUALITY_LABELS: Record<GemQuality, string> = {
  normal: 'Normal',
  refined: 'Refined',
  perfect: 'Perfect',
};

// ------------------------------------------------------------
// Maximum gem slots per commander
// ------------------------------------------------------------
export const MAX_GEM_SLOTS = 3;

// ------------------------------------------------------------
// Gem bonus formula
// Base: +2 at level 1, scaling to +47 at level 10
// Final: base * qualityMultiplier
// Purple gems split bonus across all 4 stats.
// ------------------------------------------------------------
export function calculateGemBonus(gem: Gem): number {
  // Level 1: +2, Level 10: +47 (non-linear curve)
  const base = 2 + (gem.level - 1) * 5;
  return Math.floor(base * QUALITY_MULTIPLIERS[gem.quality]);
}

// ------------------------------------------------------------
// Get the per-stat bonus for a purple gem (split across all stats)
// Purple gives 50% of its total to each stat
// ------------------------------------------------------------
export function calculatePurpleGemPerStatBonus(gem: Gem): number {
  if (gem.type !== 'purple') return 0;
  return Math.floor(calculateGemBonus(gem) * 0.5);
}

// ------------------------------------------------------------
// Calculate total stat bonuses from all equipped gems
// Returns a CommanderStats-like object with accumulated bonuses
// ------------------------------------------------------------
export function calculateTotalGemBonuses(
  gems: (Gem | null)[]
): Record<string, number> {
  const bonuses: Record<string, number> = {
    accuracy: 0,
    speed: 0,
    dodge: 0,
    electron: 0,
  };

  for (const gem of gems) {
    if (!gem) continue;

    const bonus = calculateGemBonus(gem);

    if (gem.type === 'purple') {
      // Purple gems give split bonus to all stats
      const perStat = calculatePurpleGemPerStatBonus(gem);
      bonuses.accuracy += perStat;
      bonuses.speed += perStat;
      bonuses.dodge += perStat;
      bonuses.electron += perStat;
    } else {
      // Other gems give full bonus to their specific stat
      const statKey = GEM_STAT_BONUSES[gem.type];
      if (statKey && statKey !== 'all') {
        bonuses[statKey] += bonus;
      }
    }
  }

  return bonuses;
}

// ------------------------------------------------------------
// Generate a random gem (for loot drops, rewards)
// ------------------------------------------------------------
export function generateRandomGem(
  id: string,
  levelMin = 1,
  levelMax = 5
): Gem {
  const types: GemType[] = ['red', 'blue', 'green', 'yellow', 'purple'];
  const qualities: GemQuality[] = ['normal', 'normal', 'normal', 'refined', 'perfect'];

  const type = types[Math.floor(Math.random() * types.length)];
  const level = Math.floor(Math.random() * (levelMax - levelMin + 1)) + levelMin;
  const quality = qualities[Math.floor(Math.random() * qualities.length)];

  return {
    id,
    type,
    level: Math.max(1, Math.min(10, level)),
    quality,
  };
}

// ------------------------------------------------------------
// Create a gem from parameters
// ------------------------------------------------------------
export function createGem(
  id: string,
  type: GemType,
  level: number,
  quality: GemQuality
): Gem {
  return {
    id,
    type,
    level: Math.max(1, Math.min(10, level)),
    quality,
  };
}

// ------------------------------------------------------------
// Compare two gems for sorting (higher bonus first)
// ------------------------------------------------------------
export function compareGems(a: Gem, b: Gem): number {
  const bonusA = calculateGemBonus(a);
  const bonusB = calculateGemBonus(b);
  return bonusB - bonusA;
}
