/**
 * ========================================================================
 * Galaxy Online 3 — Commander System
 * ========================================================================
 * Gestiona las estadísticas, effective stack bonus, y habilidades
 * especiales de los comandantes.
 *
 * @module battle/engine/CommanderSystem
 * ========================================================================
 */

import type {
  Commander,
  ShipStack,
  ShipType,
  WeaponType,
  CommanderSkill,
  SkillEffect,
  SkillType,
  ActiveSkillState,
  RNG,
  ExpertiseGrade,
  WeaponExpertise,
  ShipExpertise,
} from './types';

// ============================================================================
// EFFECTIVE STACK
// ============================================================================

/** Effective stack base por tipo de nave */
const EFFECTIVE_STACK_BASE: Record<ShipType, number> = {
  frigate: 1100,
  cruiser: 1000,
  battleship: 900,
};

/**
 * Calcula el effective stack de un ShipStack.
 * El effective stack limita cuántas naves pueden participar en
 * cada ronda de ataque, incentivando tener comandantes fuertes.
 *
 * Fórmula: min(currentShips, base[shipType] + commanderBonus)
 *
 * @param stack - Stack de naves
 * @returns Número de naves efectivas para ataque
 */
export function getEffectiveStack(stack: ShipStack): number {
  const base = EFFECTIVE_STACK_BASE[stack.shipType];
  const commanderBonus = stack.commander?.effectiveStackBonus ?? 0;
  return Math.min(stack.currentShips, base + commanderBonus);
}

/**
 * Calcula el bonus al effective stack por estrellas del comandante.
 * Fórmula GO2: cada estrella otorga +100 al effective stack base.
 *
 * @param stars - Número de estrellas (1-5)
 * @returns Bonus adicional al effective stack
 */
export function getStackBonusByStars(stars: number): number {
  const clampedStars = Math.min(5, Math.max(1, stars));
  return clampedStars * 100;
}

/**
 * Crea un comandante con valores calculados.
 */
export function createCommander(partial: {
  id: string;
  name: string;
  level?: number;
  stars: number;
  accuracy: number;
  speed: number;
  dodge: number;
  electron: number;
  hasEOS?: boolean;
  eosMultiplier?: number;
  specialAbility?: Commander['specialAbility'];
  weaponExpertise?: WeaponExpertise;
  shipExpertise?: ShipExpertise;
}): Commander {
  const stars = Math.min(5, Math.max(1, partial.stars));
  return {
    ...partial,
    level: partial.level ?? 1,
    stars,
    effectiveStackBonus: getStackBonusByStars(stars),
    hasEOS: partial.hasEOS ?? false,
    eosMultiplier: partial.eosMultiplier ?? 2.0,
    weaponExpertise: partial.weaponExpertise ?? { ...DEFAULT_WEAPON_EXPERTISE },
    shipExpertise: partial.shipExpertise ?? { ...DEFAULT_SHIP_EXPERTISE },
  };
}

// ============================================================================
// EXPERTISE CONSTANTS (D02 & D03)
// ============================================================================

/** D02 — Bonus de daño por Weapon Expertise según grado (afecta daño infligido).
 *  S: +30%, A: +10%, B: 0%, C: -10%, D: -30%  */
const WEAPON_EXPERTISE_BONUS: Record<ExpertiseGrade, number> = {
  S: 0.30,
  A: 0.10,
  B: 0.00,
  C: -0.10,
  D: -0.30,
};

/** D03 — Bonus de daño por Ship Expertise según grado (afecta daño infligido).
 *  S: +10%, A: +5%, B: 0%, C: -5%, D: -10%  */
const SHIP_EXPERTISE_DAMAGE_BONUS: Record<ExpertiseGrade, number> = {
  S: 0.10,
  A: 0.05,
  B: 0.00,
  C: -0.05,
  D: -0.10,
};

/** D03 — Bonus de defensa por Ship Expertise según grado (afecta daño recibido).
 *  S: -10% daño recibido, A: -10% daño recibido, B: 0%, C: +10% daño recibido, D: +10% daño recibido  */
const SHIP_EXPERTISE_DEFENSE_BONUS: Record<ExpertiseGrade, number> = {
  S: 0.10,
  A: 0.10,
  B: 0.00,
  C: -0.10,
  D: -0.10,
};

/**
 * D02 — Obtiene el bonus de daño de Weapon Expertise para un tipo de arma.
 * Aplica al daño infligido.
 *
 * @param commander — Comandante atacante
 * @param weaponType — Tipo de arma usada
 * @returns Multiplicador de bonus (ej: 0.30 = +30% daño)
 */
export function getWeaponDamageBonus(
  commander: Commander | undefined,
  weaponType: WeaponType
): number {
  if (!commander) return 0;
  const grade = (commander.weaponExpertise ?? DEFAULT_WEAPON_EXPERTISE)[weaponType];
  return WEAPON_EXPERTISE_BONUS[grade] ?? 0;
}

/**
 * D03 — Obtiene el bonus de daño de Ship Expertise para un tipo de nave.
 * Aplica al daño infligido por el atacante.
 *
 * @param commander — Comandante atacante
 * @param shipType — Tipo de nave del stack atacante
 * @returns Multiplicador de bonus (ej: 0.10 = +10% daño)
 */
export function getShipDamageBonus(
  commander: Commander | undefined,
  shipType: ShipType
): number {
  if (!commander) return 0;
  const grade = (commander.shipExpertise ?? DEFAULT_SHIP_EXPERTISE)[shipType as keyof ShipExpertise];
  return SHIP_EXPERTISE_DAMAGE_BONUS[grade] ?? 0;
}

/**
 * D03 — Obtiene el bonus de defensa de Ship Expertise para un tipo de nave.
 * Aplica como reducción/aumento al daño recibido.
 *
 * @param commander — Comandante defensor
 * @param shipType — Tipo de nave del stack defensor
 * @returns Multiplicador de defensa (ej: 0.10 = -10% daño recibido)
 */
export function getShipDefenseBonus(
  commander: Commander | undefined,
  shipType: ShipType
): number {
  if (!commander) return 0;
  const grade = (commander.shipExpertise ?? DEFAULT_SHIP_EXPERTISE)[shipType as keyof ShipExpertise];
  return SHIP_EXPERTISE_DEFENSE_BONUS[grade] ?? 0;
}

/** Expertise por defecto (grado B en todo) para inicialización */
export const DEFAULT_WEAPON_EXPERTISE: WeaponExpertise = {
  ballistic: 'B',
  directional: 'B',
  missile: 'B',
  ship_based: 'B',
};

/** Expertise de nave por defecto (grado B en todo) */
export const DEFAULT_SHIP_EXPERTISE: ShipExpertise = {
  frigate: 'B',
  cruiser: 'B',
  battleship: 'B',
};

/**
 * Deriva expertise de comandante a partir de sus stats base.
 * Regla: attack > 6 → S, > 4 → A, > 2 → B, else C (para arma principal).
 * Por ahora asigna B por defecto a todo; se puede extender con datos GO2.
 *
 * @param _commander — Datos raw del comandante
 * @returns WeaponExpertise y ShipExpertise derivados
 */
export function deriveExpertiseFromStats(_commander?: {
  attack?: number;
  primaryWeapon?: WeaponType;
}): { weapon: WeaponExpertise; ship: ShipExpertise } {
  // TODO: extender con datos reales de go2-commander-data.ts
  // Por ahora todo a grado B (neutral)
  void _commander;
  return {
    weapon: { ...DEFAULT_WEAPON_EXPERTISE },
    ship: { ...DEFAULT_SHIP_EXPERTISE },
  };
}

// ============================================================================
// INITIATIVE ORDER
// ============================================================================

/**
 * Ordena stacks por velocidad de comandante para determinar
 * el orden de ataque en la fase de iniciativa.
 * Mayor velocidad ataca primero. En empate, atacante gana.
 *
 * @param stacks - Todos los stacks participantes
 * @returns Array ordenado por velocidad descendente
 */
export function calculateInitiativeOrder(
  stacks: ShipStack[]
): Array<{ stackId: string; speed: number; faction: 'attacker' | 'defender'; commanderName: string }> {
  return stacks
    .filter((s) => s.currentShips > 0)
    .map((s) => ({
      stackId: s.id,
      speed: s.commander?.speed ?? 0,
      faction: s.faction,
      commanderName: s.commander?.name ?? 'Sin comandante',
    }))
    .sort((a, b) => {
      // Mayor velocidad primero
      if (b.speed !== a.speed) return b.speed - a.speed;
      // En empate, atacante tiene prioridad
      if (a.faction !== b.faction) {
        return a.faction === 'attacker' ? -1 : 1;
      }
      return 0;
    });
}

// ============================================================================
// STAT CALCULATIONS
// ============================================================================

/**
 * Calcula la precisión efectiva de un atacante contra un defensor.
 *
 * @param attacker - Comandante atacante
 * @param defender - Comandante defensor
 * @returns Precisión base ajustada
 */
export function calculateEffectiveAccuracy(
  attacker: Commander,
  defender: Commander
): number {
  return attacker.accuracy - defender.dodge * 0.5;
}

/**
 * Calcula la probabilidad de golpe crítico.
 *
 * @param commander - Comandante atacante
 * @returns Probabilidad [0, 1]
 */
export function calculateCritChance(commander: Commander): number {
  return Math.min(0.50, commander.electron / 200);
}

/**
 * Calcula el multiplicador de daño crítico.
 *
 * @param commander - Comandante atacante
 * @returns Multiplicador (ej: 1.5, 2.0)
 */
export function calculateCritMultiplier(commander: Commander): number {
  return 1.5 + commander.electron / 100;
}

/**
 * Calcula la evasión efectiva.
 *
 * @param commander - Comandante defensor
 * @returns Valor de dodge efectivo
 */
export function calculateEffectiveDodge(commander: Commander): number {
  return commander.dodge;
}

// ============================================================================
// ABILITY CHECKS
// ============================================================================

/**
 * Verifica si la habilidad especial del comandante se activa.
 *
 * @param commander - Comandante a verificar
 * @param triggerType - Tipo de evento que activa la habilidad
 * @returns true si la habilidad se activa
 */
export function checkAbilityTrigger(
  commander: Commander | undefined,
  triggerType: Commander['specialAbility'] extends { trigger: infer T } ? T : never
): boolean {
  if (!commander?.specialAbility) return false;
  if (commander.specialAbility.trigger !== triggerType) return false;
  const chance = commander.specialAbility.effect.procChance ?? 0.20;
  return Math.random() < chance;
}

// ============================================================================
// COMMANDER PRESETS
// ============================================================================

/** Preset: Comandante de ataque (alta precisión y electrón) */
export function createAttackCommander(
  name: string,
  stars: number = 3
): Commander {
  return createCommander({
    id: `cmd_atk_${name.toLowerCase().replace(/\s/g, '_')}`,
    name,
    stars,
    accuracy: 60 + stars * 8,
    speed: 40 + stars * 5,
    dodge: 30 + stars * 3,
    electron: 70 + stars * 6,
  });
}

/** Preset: Comandante defensivo (alta evasión y velocidad) */
export function createDefenseCommander(
  name: string,
  stars: number = 3
): Commander {
  return createCommander({
    id: `cmd_def_${name.toLowerCase().replace(/\s/g, '_')}`,
    name,
    stars,
    accuracy: 40 + stars * 5,
    speed: 60 + stars * 6,
    dodge: 70 + stars * 6,
    electron: 30 + stars * 3,
  });
}

/** Preset: Comandante equilibrado */
export function createBalancedCommander(
  name: string,
  stars: number = 3
): Commander {
  return createCommander({
    id: `cmd_bal_${name.toLowerCase().replace(/\s/g, '_')}`,
    name,
    stars,
    accuracy: 50 + stars * 5,
    speed: 50 + stars * 5,
    dodge: 50 + stars * 5,
    electron: 50 + stars * 5,
  });
}

// ============================================================================
// COMMANDER SKILLS DATABASE & SYSTEM
// ============================================================================

/**
 * Base de datos de skills de comandantes.
 * Mapea nombres de skills desde go2-commander-data.ts a definiciones
 * tipadas con efectos y probabilidades.
 */
export const SKILL_DATABASE: Record<string, CommanderSkill> = {
  // --- Tier 1: Pasivas de daño por tipo de arma ---
  'Ballistic Master': {
    name: 'Ballistic Master',
    type: 'passive_damage',
    triggerChance: 1.0,
    description: 'Increases Ballistic damage dealt by 25%',
    effects: [
      {
        stat: 'damage_multiplier',
        value: 0.25,
        target: 'self',
        duration: 0,
        effectType: 'damage_boost_weapon',
        weaponType: 'ballistic',
      },
    ],
  },
  'Ballistic Expertise': {
    name: 'Ballistic Expertise',
    type: 'passive_damage',
    triggerChance: 1.0,
    description: 'Increases the damage of ballistic weapons',
    effects: [
      {
        stat: 'damage_multiplier',
        value: 0.20,
        target: 'self',
        duration: 0,
        effectType: 'damage_boost_weapon',
        weaponType: 'ballistic',
      },
    ],
  },
  'Directional Specialist': {
    name: 'Directional Specialist',
    type: 'passive_damage',
    triggerChance: 1.0,
    description: 'Increases Directional damage dealt by 20%',
    effects: [
      {
        stat: 'damage_multiplier',
        value: 0.20,
        target: 'self',
        duration: 0,
        effectType: 'damage_boost_weapon',
        weaponType: 'directional',
      },
    ],
  },
  'Directional Expertise': {
    name: 'Directional Expertise',
    type: 'passive_damage',
    triggerChance: 1.0,
    description: 'Increases the damage of Directional Weapons',
    effects: [
      {
        stat: 'damage_multiplier',
        value: 0.20,
        target: 'self',
        duration: 0,
        effectType: 'damage_boost_weapon',
        weaponType: 'directional',
      },
    ],
  },
  'Missile Expert': {
    name: 'Missile Expert',
    type: 'passive_damage',
    triggerChance: 1.0,
    description: 'Increases Missile damage dealt by 30%',
    effects: [
      {
        stat: 'damage_multiplier',
        value: 0.30,
        target: 'self',
        duration: 0,
        effectType: 'damage_boost_weapon',
        weaponType: 'missile',
      },
    ],
  },
  'Missile Expertise': {
    name: 'Missile Expertise',
    type: 'passive_damage',
    triggerChance: 1.0,
    description: 'Increases the damage of missiles',
    effects: [
      {
        stat: 'damage_multiplier',
        value: 0.25,
        target: 'self',
        duration: 0,
        effectType: 'damage_boost_weapon',
        weaponType: 'missile',
      },
    ],
  },
  'Ship-Based Specialist': {
    name: 'Ship-Based Specialist',
    type: 'passive_damage',
    triggerChance: 1.0,
    description: 'Increases Ship-Based damage dealt by 15%',
    effects: [
      {
        stat: 'damage_multiplier',
        value: 0.15,
        target: 'self',
        duration: 0,
        effectType: 'damage_boost_weapon',
        weaponType: 'ship_based',
      },
    ],
  },
  'Ship-based Expertise': {
    name: 'Ship-based Expertise',
    type: 'passive_damage',
    triggerChance: 1.0,
    description: 'Increases the damage of Ship-based Weapons',
    effects: [
      {
        stat: 'damage_multiplier',
        value: 0.15,
        target: 'self',
        duration: 0,
        effectType: 'damage_boost_weapon',
        weaponType: 'ship_based',
      },
    ],
  },
  // --- Tier 1: Pasivas de defensa ---
  'Shield Master': {
    name: 'Shield Master',
    type: 'passive_defense',
    triggerChance: 1.0,
    description: 'Increases shield absorption by 20%',
    effects: [
      {
        stat: 'shield_absorption',
        value: 0.20,
        target: 'self',
        duration: 0,
        effectType: 'shield_absorption',
      },
    ],
  },
  // --- Tier 1: Pasivas de velocidad ---
  'Speed Demon': {
    name: 'Speed Demon',
    type: 'passive_speed',
    triggerChance: 1.0,
    description: 'Increases fleet speed by 30%',
    effects: [
      {
        stat: 'speed_multiplier',
        value: 0.30,
        target: 'self',
        duration: 0,
        effectType: 'speed_boost',
      },
    ],
  },
  // --- Tier 2: Skills activas (chance por ronda) ---
  'Paralyze': {
    name: 'Paralyze',
    type: 'active_debuff',
    triggerChance: 0.10,
    description: '10% chance to paralyze an enemy stack (cannot attack this round)',
    effects: [
      {
        stat: 'paralyze',
        value: 1,
        target: 'enemy',
        duration: 1,
        effectType: 'paralyze',
      },
    ],
    affectedBy: 'Electron',
  },
  'Lucky Strike': {
    name: 'Lucky Strike',
    type: 'active_burst',
    triggerChance: 0.15,
    description: '15% chance to deal +100% critical damage',
    effects: [
      {
        stat: 'critical_damage',
        value: 1.0,
        target: 'self',
        duration: 0,
        effectType: 'lucky_strike',
      },
    ],
    affectedBy: 'Accuracy',
  },
  'Lucky Shot': {
    name: 'Lucky Shot',
    type: 'active_burst',
    triggerChance: 0.15,
    description: 'Has a chance to deal Lucky Shot, which increases the chance of shooting down a target by 50%',
    effects: [
      {
        stat: 'damage_multiplier',
        value: 0.50,
        target: 'self',
        duration: 0,
        effectType: 'lucky_strike',
      },
    ],
    affectedBy: 'Accuracy',
  },
  'Lucky Hit': {
    name: 'Lucky Hit',
    type: 'active_burst',
    triggerChance: 0.12,
    description: 'Has a chance to deal double damage to the enemy',
    effects: [
      {
        stat: 'damage_multiplier',
        value: 1.0,
        target: 'self',
        duration: 0,
        effectType: 'lucky_strike',
      },
    ],
    affectedBy: 'Accuracy',
  },
  'Overdrive': {
    name: 'Overdrive',
    type: 'active_burst',
    triggerChance: 0.05,
    description: '5% chance to attack 2 times',
    effects: [
      {
        stat: 'extra_attacks',
        value: 1,
        target: 'self',
        duration: 0,
        effectType: 'overdrive',
      },
    ],
    affectedBy: 'Speed',
  },
  'Consecutive Strike': {
    name: 'Consecutive Strike',
    type: 'active_burst',
    triggerChance: 0.10,
    description: 'While attacking, there is a chance of attacking the target twice',
    effects: [
      {
        stat: 'extra_attacks',
        value: 1,
        target: 'self',
        duration: 0,
        effectType: 'overdrive',
      },
    ],
    affectedBy: 'Accuracy',
  },
  'Shield Boost': {
    name: 'Shield Boost',
    type: 'active_burst',
    triggerChance: 0.10,
    description: '10% chance to regenerate 50% extra shield at round start',
    effects: [
      {
        stat: 'shield_regen',
        value: 0.50,
        target: 'self',
        duration: 0,
        effectType: 'shield_boost',
      },
    ],
    affectedBy: 'Speed',
  },
  'Defensive Intensity': {
    name: 'Defensive Intensity',
    type: 'active_burst',
    triggerChance: 0.10,
    description: 'Has a chance to restore 15% of maximum Shields at the start of each round',
    effects: [
      {
        stat: 'shield_regen',
        value: 0.15,
        target: 'self',
        duration: 0,
        effectType: 'shield_boost',
      },
    ],
    affectedBy: 'Speed',
  },
  'Inspiration': {
    name: 'Inspiration',
    type: 'passive_damage',
    triggerChance: 0.15,
    description: 'Has a chance to increase the damage dealt by the ship in the next slot of the formation by 30%',
    effects: [
      {
        stat: 'damage_multiplier',
        value: 0.30,
        target: 'self',
        duration: 0,
        effectType: 'damage_boost_all',
      },
    ],
    affectedBy: 'Accuracy',
  },
  'Deadly Strike': {
    name: 'Deadly Strike',
    type: 'active_burst',
    triggerChance: 0.15,
    description: 'Has an increased chance to deal critical strikes',
    effects: [
      {
        stat: 'critical_damage',
        value: 0.50,
        target: 'self',
        duration: 0,
        effectType: 'lucky_strike',
      },
    ],
    affectedBy: 'Accuracy',
  },
  'Pierce': {
    name: 'Pierce',
    type: 'active_burst',
    triggerChance: 0.15,
    description: 'Attacks have a chance to deal an extra 40% Piercing damage',
    effects: [
      {
        stat: 'pierce_damage',
        value: 0.40,
        target: 'self',
        duration: 0,
        effectType: 'damage_boost_all',
      },
    ],
    affectedBy: 'Accuracy',
  },
  // --- Fallback: skill no reconocida ---
  'Unknown': {
    name: 'Unknown',
    type: 'passive_damage',
    triggerChance: 0.0,
    description: 'Unrecognized skill',
    effects: [],
  },
};

/**
 * Busca una skill en la base de datos por nombre.
 * Soporta variaciones de nombre y normalización.
 */
export function lookupSkill(skillName: string): CommanderSkill | undefined {
  if (!skillName) return undefined;
  // Búsqueda exacta primero
  if (SKILL_DATABASE[skillName]) return SKILL_DATABASE[skillName];
  // Búsqueda case-insensitive
  const normalized = skillName.toLowerCase().trim();
  for (const [key, skill] of Object.entries(SKILL_DATABASE)) {
    if (key.toLowerCase() === normalized) return skill;
  }
  return undefined;
}

/**
 * Convierte datos de comandante GO2 (skill string + descripción)
 * en una CommanderSkill tipada.
 */
export function parseCommanderSkill(
  skillName: string,
  description?: string
): CommanderSkill {
  const existing = lookupSkill(skillName);
  if (existing) return existing;

  // Intentar extraer el tipo de skill de la descripción
  const desc = (description ?? '').toLowerCase();

  // Detectar pasivas de daño por tipo de arma
  const weaponMatch = desc.match(
    /(ballistic|directional|missile|ship[\s-]*based)/i
  );
  if (weaponMatch) {
    const weaponType = weaponMatch[1].toLowerCase().replace(/\s/g, '_') as WeaponType;
    const validWeaponType: WeaponType = ['ballistic', 'directional', 'missile', 'ship_based'].includes(weaponType)
      ? weaponType
      : 'ship_based';

    // Extraer porcentaje de la descripción
    const pctMatch = desc.match(/(\d+)%?/);
    const pct = pctMatch ? parseInt(pctMatch[1], 10) / 100 : 0.20;

    return {
      name: skillName,
      type: 'passive_damage',
      triggerChance: 1.0,
      description: description ?? `Boosts ${weaponMatch[1]} damage`,
      effects: [
        {
          stat: 'damage_multiplier',
          value: pct,
          target: 'self',
          duration: 0,
          effectType: 'damage_boost_weapon',
          weaponType: validWeaponType,
        },
      ],
    };
  }

  // Detectar shield boost/regen
  if (desc.includes('shield') || desc.includes('restore')) {
    const pctMatch = desc.match(/(\d+)%?/);
    const pct = pctMatch ? parseInt(pctMatch[1], 10) / 100 : 0.15;
    return {
      name: skillName,
      type: desc.includes('chance') ? 'active_burst' : 'passive_defense',
      triggerChance: desc.includes('chance') ? 0.10 : 1.0,
      description: description ?? 'Shield effect',
      effects: [
        {
          stat: 'shield_regen',
          value: pct,
          target: 'self',
          duration: 0,
          effectType: desc.includes('chance') ? 'shield_boost' : 'shield_absorption',
        },
      ],
    };
  }

  // Detectar paralyze
  if (desc.includes('paraly') || desc.includes('block')) {
    return {
      name: skillName,
      type: 'active_debuff',
      triggerChance: 0.10,
      description: description ?? 'Paralysis effect',
      effects: [
        {
          stat: 'paralyze',
          value: 1,
          target: 'enemy',
          duration: 1,
          effectType: 'paralyze',
        },
      ],
    };
  }

  // Detectar lucky strike / double damage
  if (desc.includes('lucky') || desc.includes('double') || desc.includes('critical')) {
    const pctMatch = desc.match(/(\d+)%?/);
    const pct = pctMatch ? parseInt(pctMatch[1], 10) / 100 : 1.0;
    return {
      name: skillName,
      type: 'active_burst',
      triggerChance: 0.15,
      description: description ?? 'Critical damage boost',
      effects: [
        {
          stat: 'damage_multiplier',
          value: pct,
          target: 'self',
          duration: 0,
          effectType: 'lucky_strike',
        },
      ],
    };
  }

  // Detectar overdrive / consecutive strike
  if (desc.includes('twice') || desc.includes('consecutive') || desc.includes('attack') && desc.includes('times')) {
    return {
      name: skillName,
      type: 'active_burst',
      triggerChance: 0.10,
      description: description ?? 'Extra attack',
      effects: [
        {
          stat: 'extra_attacks',
          value: 1,
          target: 'self',
          duration: 0,
          effectType: 'overdrive',
        },
      ],
    };
  }

  // Fallback: skill genérica de daño pasivo
  return {
    name: skillName,
    type: 'passive_damage',
    triggerChance: desc.includes('chance') ? 0.15 : 1.0,
    description: description ?? `Skill: ${skillName}`,
    effects: [
      {
        stat: 'damage_multiplier',
        value: 0.10,
        target: 'self',
        duration: 0,
        effectType: 'damage_boost_all',
      },
    ],
  };
}

/**
 * Devuelve la lista de efectos activos (pasivos) del comandante de un stack,
 * filtrados opcionalmente por tipo de arma.
 *
 * @param stack - Stack de naves
 * @param weaponType - Tipo de arma usada (para filtrar pasivas de arma)
 * @returns Lista de SkillEffect activos
 */
export function getSkillEffects(
  stack: ShipStack,
  weaponType?: WeaponType
): SkillEffect[] {
  if (!stack.commander?.skill) return [];
  const skill = stack.commander.skill;

  // Solo efectos pasivos (siempre activos)
  if (skill.type.startsWith('active_')) return [];

  const effects = skill.effects;

  // Si se especifica weaponType, filtrar efectos que apliquen
  if (weaponType) {
    return effects.filter(
      (e) =>
        e.effectType !== 'damage_boost_weapon' || e.weaponType === weaponType
    );
  }

  return effects;
}

/**
 * Calcula el bonus de daño multiplicativo total de las skills pasivas
 * de un stack para un tipo de arma específico.
 *
 * @param stack - Stack atacante
 * @param weaponType - Tipo de arma usada
 * @returns Multiplicador total (ej: 0.25 = +25% daño)
 */
export function getPassiveDamageBonus(
  stack: ShipStack,
  weaponType?: WeaponType
): number {
  const effects = getSkillEffects(stack, weaponType);
  return effects
    .filter(
      (e) =>
        e.stat === 'damage_multiplier' ||
        e.effectType === 'damage_boost_weapon' ||
        e.effectType === 'damage_boost_all'
    )
    .reduce((sum, e) => sum + e.value, 0);
}

/**
 * Calcula el bonus de absorción de escudo de las skills pasivas.
 *
 * @param stack - Stack defensor
 * @returns Multiplicador de absorción (ej: 0.20 = +20%)
 */
export function getPassiveShieldBonus(stack: ShipStack): number {
  if (!stack.commander?.skill) return 0;
  const skill = stack.commander.skill;
  if (skill.type.startsWith('active_')) return 0;

  return skill.effects
    .filter(
      (e) =>
        e.stat === 'shield_absorption' ||
        e.effectType === 'shield_absorption'
    )
    .reduce((sum, e) => sum + e.value, 0);
}

/**
 * Calcula el bonus de velocidad de las skills pasivas.
 *
 * @param stack - Stack
 * @returns Multiplicador de velocidad (ej: 0.30 = +30%)
 */
export function getPassiveSpeedBonus(stack: ShipStack): number {
  if (!stack.commander?.skill) return 0;
  const skill = stack.commander.skill;
  if (skill.type.startsWith('active_')) return 0;

  return skill.effects
    .filter(
      (e) => e.stat === 'speed_multiplier' || e.effectType === 'speed_boost'
    )
    .reduce((sum, e) => sum + e.value, 0);
}

/**
 * Determina si una skill activa se dispara esta ronda.
 *
 * @param skill - Skill activa a verificar
 * @param rng - Generador RNG
 * @param electron - Stat de electrón del comandante (mejora chance)
 * @returns true si la skill se activa
 */
export function shouldTriggerSkill(
  skill: CommanderSkill,
  rng: RNG,
  electron: number = 0
): boolean {
  if (!skill.type.startsWith('active_')) return true; // Pasivas siempre activan

  // El electrón mejora ligeramente la probabilidad
  // Cada 10 puntos de electrón = +1% chance (máx +5%)
  const electronBonus = Math.min(0.05, electron / 1000);
  const finalChance = Math.min(1.0, skill.triggerChance + electronBonus);

  return rng.chance(finalChance);
}

/**
 * Verifica si un stack está paralizado (no puede atacar esta ronda).
 *
 * @param stack - Stack a verificar
 * @returns true si el stack está paralizado
 */
export function isStackParalyzed(stack: ShipStack): boolean {
  return stack.activeSkillStates.some(
    (s) => s.effect.effectType === 'paralyze' && s.remainingRounds > 0
  );
}

/**
 * Obtiene el bonus crítico adicional de skills (Lucky Strike).
 *
 * @param stack - Stack atacante
 * @returns Bonus multiplicativo (ej: 1.0 = +100%)
 */
export function getCriticalBonusFromSkills(stack: ShipStack): number {
  if (!stack.commander?.skill) return 0;
  const skill = stack.commander.skill;
  const critSkills = skill.effects.filter(
    (e) => e.effectType === 'lucky_strike' || e.stat === 'critical_damage'
  );
  return critSkills.reduce((sum, e) => sum + e.value, 0);
}