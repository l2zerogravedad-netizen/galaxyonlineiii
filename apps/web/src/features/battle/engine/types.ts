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
export type BattlePhase =
  | 'ROUND_START'
  | 'MOVEMENT'
  | 'INITIATIVE'
  | 'ATTACK'
  | 'DEFENSE'
  | 'RESOLUTION'
  | 'ROUND_END';

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

/** Tipos de efectos de skill */
export type SkillEffectType =
  | 'damage_boost_weapon'   // Bonus de daño por tipo de arma (pasivo)
  | 'damage_boost_all'      // Bonus de daño general (pasivo)
  | 'shield_absorption'     // Bonus de absorción de escudo (pasivo)
  | 'speed_boost'           // Bonus de velocidad (pasivo)
  | 'paralyze'              // Paralizar stack enemigo (activo)
  | 'lucky_strike'          // Daño crítico extra (activo)
  | 'overdrive'             // Atacar 2 veces (activo)
  | 'shield_boost'          // Regenerar escudo (activo)
  | 'none';                 // Sin efecto

/** Tipo de skill: pasiva (siempre activa) o activa (chance por ronda) */
export type SkillType = 'passive_damage' | 'passive_defense' | 'passive_speed' | 'active_debuff' | 'active_burst';

/** Efecto individual de una skill */
export interface SkillEffect {
  /** Estadística afectada o mecánica */
  stat: string;
  /** Valor numérico del efecto (ej: 0.25 = +25%) */
  value: number;
  /** Target del efecto */
  target: 'self' | 'enemy';
  /** Duración en rondas (0 = instantáneo/permanente) */
  duration: number;
  /** Tipo de efecto para categorización */
  effectType: SkillEffectType;
  /** Filtro de arma afectada (para pasivas de tipo de arma) */
  weaponType?: WeaponType;
}

/** Definición de una skill de comandante */
export interface CommanderSkill {
  /** Nombre de la skill (ej: 'Ballistic Master') */
  name: string;
  /** Categoría de la skill */
  type: SkillType;
  /** Probabilidad de activación [0-1] (solo para activas) */
  triggerChance: number;
  /** Descripción legible */
  description: string;
  /** Efectos que aplica esta skill */
  effects: SkillEffect[];
  /** Stat del comandante que afecta la activación */
  affectedBy?: string;
}

/** Estado de una skill activa en el stack (para duraciones > 0) */
export interface ActiveSkillState {
  skillName: string;
  effect: SkillEffect;
  /** Rondas restantes */
  remainingRounds: number;
  /** Stack que aplicó el efecto */
  sourceStackId: string;
}

/** Grado de expertise de un comandante (S mejor, D peor). GO2: D02/D03. */
export type ExpertiseGrade = 'S' | 'A' | 'B' | 'C' | 'D';

/** Expertise del comandante por tipo de arma. */
export type WeaponExpertise = Record<WeaponType, ExpertiseGrade>;

/** Expertise del comandante por clase de nave. */
export interface ShipExpertise {
  frigate: ExpertiseGrade;
  cruiser: ExpertiseGrade;
  battleship: ExpertiseGrade;
}

/** Datos de un comandante asignado a un stack */
export interface Commander {
  id: string;
  name: string;
  level: number;
  stars: number;

  /** Precisión: 0-100, afecta hit chance */
  accuracy: number;
  /** Velocidad: 0-100, determina orden de ataque y successive strikes */
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

  /** Expertise por tipo de arma (D02) */
  weaponExpertise?: WeaponExpertise;
  /** Expertise por clase de nave (D03) */
  shipExpertise?: ShipExpertise;

  /** Skill parseada del comandante (pasiva/activa) */
  skill?: CommanderSkill;

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
  /** Negación de daño (Heat Diffusion Shield, etc). Reduce daño ANTES de escudos */
  damageNegation: number;
  /** Negación de daño al casco (reduce daño que llega al hull) */
  hullNegation: number;

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

  /** Número de módulos PPC equipados (cada uno 55% de interceptar 1 misil). Default 0 */
  ppcCount: number;
  /** Tipo de armadura del stack (afecta multiplicador de daño). Default 'regen' */
  armorType: ArmorType;

  /** Skills activas con duración aplicadas a este stack */
  activeSkillStates: ActiveSkillState[];
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
  | { type: 'LUCKY_STRIKE'; stackId: string; damage: number; multiplier: number }
  | { type: 'DODGE'; stackId: string; attackerId: string }
  | { type: 'SUCCESSIVE_STRIKE'; stackId: string; attackNumber: number; commanderName: string; speed: number }
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

/** Movimiento por tipo de nave (GO2 balance) */
export const MOVEMENT_BY_SHIP_TYPE: Record<ShipType, number> = {
  frigate: 5,
  cruiser: 4,
  battleship: 3,
};

/** Movimiento mínimo recomendado por tipo de arma (GO2 balance - D05) */
export const MOVEMENT_BY_WEAPON_TYPE: Record<WeaponType, number> = {
  ballistic: 4,
  directional: 4,
  missile: 5,
  ship_based: 6,
};

/**
 * Obtiene el movimiento mínimo recomendado para un tipo de arma.
 * D05: GO2 recomienda:
 *   - Ballistic weapons: al menos 4 movement
 *   - Directional weapons: al menos 4 movement
 *   - Missile weapons: al menos 5 movement
 *   - Ship-Based weapons: al menos 6 movement
 */
export function getMinMovementForWeapon(weaponType: WeaponType): number {
  return MOVEMENT_BY_WEAPON_TYPE[weaponType] ?? 4;
}

/** Máximo de successive strikes por stack por ronda */
export const MAX_SUCCESSIVE_STRIKES = 3;

/** Chance base de successive strike por punto de speed (0.05%) */
export const SUCCESSIVE_STRIKE_CHANCE_PER_SPEED = 0.0005;

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

/** Interfaz del generador de numeros aleatorios */
export interface RNG {
  next(): number;
  nextInt(min: number, max: number): number;
  chance(probability: number): boolean;
}
