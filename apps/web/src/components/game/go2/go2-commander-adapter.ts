/**
 * ADAPTADOR: Comandantes GO2 → Sistema de Combate de Claude
 * 
 * Mapea los 100 comandantes con stats (Accuracy/Speed/Dodge/Electron)
 * al formato que espera combat-system.ts (Attack/Defense/Speed/Structure/Shield/Stability)
 * 
 * Fórmulas basadas en el wiki de GO2:
 * - Accuracy → Ataque (hit chance + daño)
 * - Speed → Velocidad (orden de combate)
 * - Dodge → Defensa (evasión + reducción de daño)
 * - Electron → Estabilidad (críticos + resistencia)
 */

import type { Commander } from './go2-commander-data';

// Tipo que espera combat-system.ts de Claude
export interface ClaudeCommanderStats {
  attack: number;
  defense: number;
  speed: number;
  structure: number;
  shield: number;
  stability: number;
}

export interface ClaudeCommanderAbility {
  id: string;
  name: string;
  description: string;
  effect: {
    type: 'damage_boost' | 'defense_boost' | 'speed_boost' | 'critical_chance' | 'shield_regen' | 'structure_regen' | 'accuracy' | 'evasion';
    target: 'self' | 'fleet' | 'enemy';
    value: number;
    duration?: number;
  };
  cooldown?: number;
  trigger?: 'passive' | 'active' | 'on_hit' | 'on_damage';
}

export interface ClaudeCommander {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'divine' | 'super';
  role: 'attack' | 'defense' | 'speed' | 'support' | 'balanced';
  baseStats: ClaudeCommanderStats;
  maxStats: ClaudeCommanderStats;
  abilities: ClaudeCommanderAbility[];
  maxGems: number;
  maxChips: number;
  description: string;
  icon: string;
}

// ============================================
// MAPEO DE STATS
// ============================================

/**
 * Convierte stats GO2 (Acc/Spd/Ddg/Elec) → stats Claude (Atk/Def/Spd/Str/Shd/Stb)
 * 
 * Fórmulas del wiki de GO2:
 * - Accuracy → Attack: accuracy × 3 (cada punto de acc = +3 ataque)
 * - Speed → Speed: speed × 8 (cada punto de spd = +8 velocidad)
 * - Dodge → Defense: dodge × 2.5 (cada punto de ddg = +2.5 defensa)
 * - Electron → Stability: electron × 4 (cada punto de elec = +4 estabilidad)
 * 
 * Structure y Shield se calculan por rareza (base hull stats)
 */
export function convertStats(cmd: Commander): ClaudeCommanderStats {
  const { accuracy, speed, dodge, electron } = cmd.stats;

  return {
    attack: Math.round(accuracy * 3),
    defense: Math.round(dodge * 2.5),
    speed: Math.round(speed * 8),
    structure: getBaseStructure(cmd.rarity),
    shield: getBaseShield(cmd.rarity),
    stability: Math.round(electron * 4),
  };
}

function getBaseStructure(rarity: string): number {
  switch (rarity) {
    case 'common': return 200;
    case 'super': return 350;
    case 'legendary': return 500;
    case 'divine': return 800;
    default: return 200;
  }
}

function getBaseShield(rarity: string): number {
  switch (rarity) {
    case 'common': return 100;
    case 'super': return 200;
    case 'legendary': return 350;
    case 'divine': return 600;
    default: return 100;
  }
}

// ============================================
// MAPEO DE SKILLS → ABILITIES
// ============================================

/**
 * Convierte las skills GO2 a abilities del formato de Claude
 * basado en el tipo de skill y affectedBy
 */
export function convertSkillToAbility(cmd: Commander): ClaudeCommanderAbility {
  const skillName = cmd.skill;
  const skillDesc = cmd.skillDescription;
  const affectedBy = cmd.skillAffectedBy;

  // Determinar tipo de efecto basado en el nombre de la skill
  const effectType = determineEffectType(skillName, skillDesc);
  const value = calculateSkillValue(cmd);

  return {
    id: `skill_${cmd.id}`,
    name: skillName,
    description: skillDesc,
    effect: {
      type: effectType,
      target: determineTarget(skillName, skillDesc),
      value: value,
    },
    trigger: 'passive',
  };
}

function determineEffectType(skillName: string, skillDesc: string): ClaudeCommanderAbility['effect']['type'] {
  const desc = skillDesc.toLowerCase();
  const name = skillName.toLowerCase();

  if (name.includes('strike') || name.includes('attack') || name.includes('damage') || name.includes('fire') || name.includes('barrage') || name.includes('hit') || name.includes('smite')) return 'damage_boost';
  if (name.includes('shield') || name.includes('aegis') || name.includes('barrier') || name.includes('guard')) return 'shield_regen';
  if (name.includes('speed') || name.includes('dash') || name.includes('rush') || name.includes('charge') || name.includes('prowl')) return 'speed_boost';
  if (name.includes('crit') || name.includes('deadly') || name.includes('precision')) return 'critical_chance';
  if (name.includes('defense') || name.includes('armor') || name.includes('fortress') || name.includes('immunity') || name.includes('regen')) return 'defense_boost';
  if (name.includes('evasion') || name.includes('dodge') || name.includes('phantom') || name.includes('phase')) return 'evasion';
  if (name.includes('accuracy') || name.includes('aim') || name.includes('target')) return 'accuracy';
  if (desc.includes('damage')) return 'damage_boost';
  if (desc.includes('shield') || desc.includes('restore')) return 'shield_regen';
  if (desc.includes('defense') || desc.includes('reduce')) return 'defense_boost';
  if (desc.includes('critical') || desc.includes('crit')) return 'critical_chance';

  return 'damage_boost'; // Default
}

function determineTarget(skillName: string, skillDesc: string): 'self' | 'fleet' | 'enemy' {
  const desc = skillDesc.toLowerCase();
  if (desc.includes('enemy') || desc.includes('hostile') || desc.includes('reduce') || desc.includes('lower')) return 'enemy';
  if (desc.includes('friendly') || desc.includes('allied') || desc.includes('fleet') || desc.includes('all')) return 'fleet';
  return 'self';
}

function calculateSkillValue(cmd: Commander): number {
  // El valor depende de la rareza y los stats del comandante
  const baseValue = { common: 5, super: 10, legendary: 15, divine: 25 }[cmd.rarity] || 5;
  
  // Multiplicador por nivel de estrellas
  const starMultiplier = 1 + (cmd.stars - 1) * 0.1;
  
  return Math.round(baseValue * starMultiplier);
}

// ============================================
// MAPEO DE RAREZA
// ============================================

function convertRarity(rarity: string): ClaudeCommander['rarity'] {
  switch (rarity) {
    case 'common': return 'common';
    case 'super': return 'super';
    case 'legendary': return 'legendary';
    case 'divine': return 'divine';
    default: return 'common';
  }
}

function determineRole(cmd: Commander): ClaudeCommander['role'] {
  const effectType = determineEffectType(cmd.skill, cmd.skillDescription);
  switch (effectType) {
    case 'damage_boost': case 'critical_chance': return 'attack';
    case 'defense_boost': case 'shield_regen': return 'defense';
    case 'speed_boost': return 'speed';
    case 'evasion': case 'accuracy': return 'support';
    default: return 'balanced';
  }
}

function getMaxGems(rarity: string): number {
  switch (rarity) {
    case 'common': return 1;
    case 'super': return 2;
    case 'legendary': return 2;
    case 'divine': return 3;
    default: return 1;
  }
}

function getMaxChips(rarity: string): number {
  switch (rarity) {
    case 'common': return 0;
    case 'super': return 1;
    case 'legendary': return 2;
    case 'divine': return 3;
    default: return 0;
  }
}

// ============================================
// CONVERSIÓN COMPLETA
// ============================================

/**
 * Convierte un comandante GO2 al formato de Claude
 */
export function convertCommander(cmd: Commander): ClaudeCommander {
  const convertedStats = convertStats(cmd);
  const rarity = convertRarity(cmd.rarity);
  
  // Max stats = base × 3 (at level 50)
  const maxStats: ClaudeCommanderStats = {
    attack: Math.round(convertedStats.attack * 3),
    defense: Math.round(convertedStats.defense * 3),
    speed: Math.round(convertedStats.speed * 3),
    structure: Math.round(convertedStats.structure * 2.5),
    shield: Math.round(convertedStats.shield * 2.5),
    stability: Math.round(convertedStats.stability * 3),
  };

  return {
    id: cmd.id,
    name: cmd.name,
    rarity,
    role: determineRole(cmd),
    baseStats: convertedStats,
    maxStats,
    abilities: [convertSkillToAbility(cmd)],
    maxGems: getMaxGems(cmd.rarity),
    maxChips: getMaxChips(cmd.rarity),
    description: `${cmd.name} - ${cmd.skill}: ${cmd.skillDescription}`,
    icon: `/assets/cmd_${cmd.id}.webp`,
  };
}

/**
 * Calcula los stats de combate de una nave aplicando los bonos del comandante
 * Usa las funciones de combat-system.ts
 */
export function getShipCombatStatsWithCommander(
  cmd: Commander
): { attack: number; defense: number; speed: number; accuracy: number; criticalChance: number } {
  const converted = convertStats(cmd);
  
  return {
    attack: converted.attack,
    defense: converted.defense,
    speed: converted.speed,
    accuracy: cmd.stats.accuracy * 2, // Accuracy del comandante → hit chance
    criticalChance: cmd.stats.electron * 1.5, // Electron → crit chance
  };
}

/**
 * Calcula el Effective Stack (máximo de naves por slot)
 * basado en el nivel y estrellas del comandante
 */
export function getEffectiveStack(cmd: Commander): number {
  const baseStack = 500 + (cmd.level * 10);
  const starBonus = [0, 0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40];
  const rarityBonus = { common: 0, super: 0.10, legendary: 0.20, divine: 0.30 };
  
  return Math.floor(baseStack * (1 + starBonus[cmd.stars] + (rarityBonus[cmd.rarity] || 0)));
}
