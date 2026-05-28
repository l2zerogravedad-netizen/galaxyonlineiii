/**
 * ========================================================================
 * Galaxy Online 3 — Battle Engine Core Types
 * ========================================================================
 * Tipos e interfaces para el sistema de batalla por rondas.
 * Basado en las mecánicas de Galaxy Online 2 (GO2).
 *
 * @module battle/engine/types
 * ========================================================================
 */

// ============================================================================
// ENUMS
// ============================================================================

/** Fases de cada ronda de batalla */
export enum BattlePhase {
  ROUND_START = 'ROUND_START',
  MOVEMENT = 'MOVEMENT',
  INITIATIVE = 'INITIATIVE',
  ATTACK = 'ATTACK',
  DEFENSE = 'DEFENSE',
  RESOLUTION = 'RESOLUTION',
  ROUND_END = 'ROUND_END',
}

/** Estados de la batalla */
export enum BattleState {
  SETUP = 'SETUP',
  IN_PROGRESS = 'IN_PROGRESS',
  ATTACKER_WINS = 'ATTACKER_WINS',
  DEFENDER_WINS = 'DEFENDER_WINS',
  DRAW = 'DRAW',
}

/** Tipos de armas disponibles */
export type WeaponType = 'ballistic' | 'directional' | 'missile' | 'ship_based';

/** Tipos de daño */
export type DamageType = 'heat' | 'kinetic' | 'explosive' | 'magnetic';

/** Tipos de armadura */
export type ArmorType = 'regen' | 'neutralizing' | 'nano' | 'chrome';

/** Tipos de nave */
export type ShipType = 'frigate' | 'cruiser' | 'battleship';

// ============================================================================
// WEAPON
// ============================================================================

/** Representa un arma equipada en un stack de naves */
export interface Weapon {
  type: WeaponType;
  damageType: DamageType;
  minDamage: number;
  maxDamage: number;
  range: [number, number];
  cooldown: number;
  he3Consumption: number;
  /** Casillas de scatter (solo ballistic) */
  scatterRange?: number;
  /** Probabilidad de penetrar escudo [0,1] */
  pierceChance: number;
  /** Puede ser interceptado (missiles) */
  interceptable: boolean;
}

// ============================================================================
// COMMANDER
// ============================================================================

/** Habilidad especial de un comandante */
export interface SpecialAbility {
  id: string;
  name: string;
  description: string;
  trigger: 'on_attack' | 'on_defend' | 'on_hit' | 'on_damaged' | 'passive';
  effect: AbilityEffect;
}

/** Efecto de una habilidad especial */
export interface AbilityEffect {
  type: 'damage_boost' | 'shield_boost' | 'dodge_boost' | 'heal' | 'intercept' | 'scatter_resist' | 'eos_shield';
  value: number;
  /** Probabilidad de activación [0,1] */
  procChance?: number;
}

/** Datos de un comandante asignado a un stack */
export interface Commander {
  id: string;
  name: string;
  level: number;
  stars: number;

  /** Precisión: 0-100, afecta hit chance */
  accuracy: number;
  /** Velocidad: 0-100, determina orden de ataque */
  speed: number;
  /** Evasión: 0-100, reduce hit chance del enemigo */
  dodge: number;
  /** Electrón: 0-100, afecta críticos y habilidades */
  electron: number;

  /** Bonus al effective stack por estrellas del comandante */
  effectiveStackBonus: number;

  /** Tiene módulo EOS (Extra Overloading Shield) */
  hasEOS?: boolean;
  /** Multiplicador de absorción EOS (típicamente 2.0) */
  eosMultiplier?: number;

  /** Habilidad especial */
  specialAbility?: SpecialAbility;
}

// ============================================================================
// SHIP STACK
// ============================================================================

/** Stack de naves en el campo de batalla */
export interface ShipStack {
  id: string;
  shipType: ShipType;
  /** Número total de naves al inicio */
  totalShips: number;
  /** Número actual de naves vivas */
  currentShips: number;

  // --- Por nave individual ---
  /** HP por nave (casco) */
  hullPoints: number;
  /** Shield por nave */
  shieldPoints: number;
  /** HP actual promedio por nave */
  currentHull: number;

  // --- Totales del stack ---
  /** Shield total: shieldPoints × currentShips */
  totalShield: number;
  /** HP total: hullPoints × currentShips */
  totalHull: number;

  // --- Stats ---
  /** Factor de supervivencia (0.5 - 2.0) */
  stability: number;
  /** Casillas de movimiento por ronda */
  movement: number;

  // --- Armas equipadas ---
  weapons: Weapon[];

  // --- Comandante ---
  commander?: Commander;

  // --- Estado ---
  /** Combustible He3 restante */
  he3: number;
  /** Cooldowns por tipo de arma */
  weaponCooldowns: Map<WeaponType, number>;

  // --- Posición en el grid (1-12 para atacante, 13-24 para defensor) ---
  position: number;

  /** Facción: atacante o defensor */
  faction: 'attacker' | 'defender';
}

// ============================================================================
// BATTLE EVENTS
// ============================================================================

/** Evento emitido por el BattleEngine para cada acción */
export type BattleEvent =
  | { type: 'ROUND_START'; round: number; maxRounds: number }
  | { type: 'PHASE_CHANGE'; phase: BattlePhase }
  | { type: 'TURN_START'; stackId: string; commanderName: string; speed: number }
  | { type: 'WEAPON_FIRE'; stackId: string; weaponType: WeaponType; targetId: string; hits: number }
  | { type: 'PROJECTILE_HIT'; targetId: string; damage: number; isCritical: boolean; isPierce: boolean }
  | { type: 'SHIELD_HIT'; targetId: string; absorbed: number; remaining: number }
  | { type: 'SHIELD_DEPLETED'; targetId: string }
  | { type: 'HULL_DAMAGE'; targetId: string; damage: number; shipsLost: number }
  | { type: 'SHIPS_DESTROYED'; stackId: string; count: number }
  | { type: 'STACK_DESTROYED'; stackId: string }
  | { type: 'INTERCEPT'; interceptorId: string; targetWeapon: WeaponType; success: boolean }
  | { type: 'SCATTER_DAMAGE'; sourceId: string; targetId: string; damage: number }
  | { type: 'HE3_DEPLETED'; stackId: string }
  | { type: 'EOS_TRIGGER'; stackId: string; absorbed: number }
  | { type: 'CRITICAL_HIT'; stackId: string; damage: number; multiplier: number }
  | { type: 'DODGE'; stackId: string; attackerId: string }
  | { type: 'ROUND_END'; round: number }
  | { type: 'BATTLE_END'; winner: 'attacker' | 'defender' | 'draw'; reason: string };

/** Callback para suscribirse a eventos de batalla */
export type BattleEventListener = (event: BattleEvent) => void;

// ============================================================================
// BATTLE CONFIGURATION
// ============================================================================

/** Configuración inicial de la batalla */
export interface BattleConfig {
  /** Stacks del atacante */
  attackerStacks: ShipStack[];
  /** Stacks del defensor */
  defenderStacks: ShipStack[];
  /** Ronda máxima (opcional, se calcula si no se provee) */
  maxRounds?: number;
  /** Precisión base para cálculo de hits [0,1] */
  baseAccuracy?: number;
  /** Semilla para RNG (opcional) */
  seed?: number;
}

// ============================================================================
// DAMAGE RESULT
// ============================================================================

/** Resultado de un cálculo de daño */
export interface DamageResult {
  /** Daño total al casco */
  hullDamage: number;
  /** Daño al escudo */
  shieldDamage: number;
  /** Daño que penetró el escudo */
  pierceDamage: number;
  /** Si fue golpe crítico */
  isCritical: boolean;
  /** Multiplicador de crítico */
  criticalMultiplier: number;
  /** Si penetró el escudo */
  isPierce: boolean;
  /** Naves destruidas */
  shipsDestroyed: number;
  /** Eventos scatter generados */
  scatterResults: ScatterResult[];
}

/** Resultado de daño scatter */
export interface ScatterResult {
  targetId: string;
  damage: number;
}

/** Resultado de un intento de ataque */
export interface AttackResult {
  hits: number;
  misses: number;
  damageResults: DamageResult[];
  events: BattleEvent[];
  he3Consumed: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Effective stack base por tipo de nave */
export const BASE_EFFECTIVE_STACK: Record<ShipType, number> = {
  frigate: 1100,
  cruiser: 1000,
  battleship: 900,
};

/** Máximo de rondas base */
export const MAX_ROUNDS_BASE = 20;

/** Máximo absoluto de rondas */
export const MAX_ROUNDS_ABSOLUTE = 99;

/** Daño de escudo absorbe doble con EOS */
export const EOS_TRIGGER_CHANCE = 0.30;

/** Multiplicador por defecto de EOS */
export const EOS_DEFAULT_MULTIPLIER = 2.0;

/** Factor de daño crítico base */
export const CRIT_DAMAGE_BASE = 1.5;

/** Factor de daño crítico por electrón */
export const CRIT_DAMAGE_PER_ELECTRON = 0.01;

/** Umbral de crítico: electron / 200 */
export const CRIT_CHANCE_DIVISOR = 200;

/** Porcentaje de scatter por cada casilla adyacente */
export const SCATTER_PERCENT_PER_TILE = 0.15;

/** Movimiento por tipo de nave */
export const MOVEMENT_BY_SHIP_TYPE: Record<ShipType, number> = {
  frigate: 2,
  cruiser: 1,
  battleship: 1,
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** Par de facciones en batalla */
export type Faction = 'attacker' | 'defender';

/** Turno de ataque ordenado por iniciativa */
export interface InitiativeEntry {
  stackId: string;
  speed: number;
  faction: Faction;
  commanderName: string;
}

/** Estado del RNG */
export interface RNGState {
  seed: number;
}
