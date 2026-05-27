// ============================================================
// GO2 BATTLE ENGINE — Turn-based space combat system
// Galaxy Online 2-style combat with full formula implementation
// ============================================================

import type { Commander, CommanderStats } from './go2-commander-data';

// ============================================================
// TYPES & INTERFACES
// ============================================================

export type HullClass = 'frigate' | 'cruiser' | 'battleship';
export type AttackType = 'ballistic' | 'directional' | 'missile' | 'ship-based';
export type BattleSide = 'attacker' | 'defender';
export type BattleOutcome = 'attacker' | 'defender' | 'draw';

export interface ShipType {
  id: string;
  name: string;
  hull: HullClass;
  structure: number;
  shield: number;
  attack: number;
  attackType: AttackType;
  minRange: number;
  maxRange: number;
  agility: number;
  defense: number;
  stability: number;
  speed: number;
  He3Cost: number;
}

export interface Position {
  row: number;
  col: number;
}

export interface ShipStack {
  shipType: ShipType;
  count: number;
  currentStructure: number;
  currentShield: number;
  position: Position;
}

export interface BattleFleet {
  side: BattleSide;
  commander: Commander;
  stacks: ShipStack[];
  totalHe3: number;
}

export interface BattleState {
  round: number;
  maxRounds: number;
  attacker: BattleFleet;
  defender: BattleFleet;
  log: BattleLogEntry[];
  isFinished: boolean;
  winner: BattleOutcome | null;
}

export interface BattleAction {
  type: 'fire' | 'skill' | 'move' | 'destroy' | 'explosion' | 'scatter';
  source: { side: BattleSide; stackIndex: number };
  target?: { side: BattleSide; stackIndex: number };
  damage?: number;
  shipsDestroyed?: number;
  isCritical?: boolean;
  skillTriggered?: string;
  scatterDamage?: number;
  remainingDamage?: number;
  shieldDamage?: number;
}

export interface BattleLogEntry {
  round: number;
  timestamp: number;
  message: string;
  actions: BattleAction[];
}

export interface BattleRoundResult {
  round: number;
  actions: BattleAction[];
  attackerStacksAfter: ShipStack[];
  defenderStacksAfter: ShipStack[];
}

export interface LootItem {
  type: 'resources' | 'ship' | 'equipment' | 'gem';
  id: string;
  quantity: number;
}

export interface BattleResult {
  winner: BattleOutcome;
  rounds: number;
  attackerShipsLost: number;
  defenderShipsLost: number;
  attackerHe3Lost: number;
  defenderHe3Lost: number;
  commanderExpGained: number;
  loot: LootItem[];
  log: BattleLogEntry[];
}

export interface DamageParams {
  attacker: Commander;
  defender: Commander;
  shipType: ShipType;
  targetStack: ShipStack;
  slotPosition: Position;
  isCritical?: boolean;
  techLevel?: number;
}

export interface DamageResult {
  totalDamage: number;
  shieldDamage: number;
  structureDamage: number;
  shipsDestroyed: number;
  isCritical: boolean;
  scatterDamage: number;
}

export interface TargetChoice {
  stackIndex: number;
  priority: number;
}

// ============================================================
// SHIP TYPE DATABASE — GO2 Originals
// ============================================================

export const SHIP_TYPES: ShipType[] = [
  // ─── Frigates (light, fast, low HP) ───
  {
    id: 'f1',
    name: 'Valkyrie',
    hull: 'frigate',
    structure: 200,
    shield: 100,
    attack: 80,
    attackType: 'ballistic',
    minRange: 1,
    maxRange: 2,
    agility: 60,
    defense: 20,
    stability: 30,
    speed: 3,
    He3Cost: 5,
  },
  {
    id: 'f2',
    name: 'Helios',
    hull: 'frigate',
    structure: 180,
    shield: 120,
    attack: 70,
    attackType: 'directional',
    minRange: 1,
    maxRange: 3,
    agility: 70,
    defense: 15,
    stability: 25,
    speed: 4,
    He3Cost: 4,
  },
  {
    id: 'f3',
    name: 'Nemesis',
    hull: 'frigate',
    structure: 150,
    shield: 80,
    attack: 100,
    attackType: 'missile',
    minRange: 2,
    maxRange: 3,
    agility: 50,
    defense: 10,
    stability: 20,
    speed: 2,
    He3Cost: 6,
  },

  // ─── Cruisers (balanced) ───
  {
    id: 'c1',
    name: 'Titan-Mk2',
    hull: 'cruiser',
    structure: 500,
    shield: 300,
    attack: 200,
    attackType: 'ballistic',
    minRange: 1,
    maxRange: 2,
    agility: 40,
    defense: 50,
    stability: 40,
    speed: 2,
    He3Cost: 12,
  },
  {
    id: 'c2',
    name: 'Shadow',
    hull: 'cruiser',
    structure: 400,
    shield: 400,
    attack: 180,
    attackType: 'directional',
    minRange: 1,
    maxRange: 3,
    agility: 50,
    defense: 40,
    stability: 50,
    speed: 3,
    He3Cost: 10,
  },
  {
    id: 'c3',
    name: 'Destroyer',
    hull: 'cruiser',
    structure: 450,
    shield: 250,
    attack: 250,
    attackType: 'missile',
    minRange: 2,
    maxRange: 3,
    agility: 35,
    defense: 45,
    stability: 35,
    speed: 2,
    He3Cost: 15,
  },

  // ─── Battleships (heavy, slow, high HP/damage) ───
  {
    id: 'b1',
    name: 'Kirov',
    hull: 'battleship',
    structure: 1200,
    shield: 800,
    attack: 500,
    attackType: 'ballistic',
    minRange: 1,
    maxRange: 2,
    agility: 20,
    defense: 80,
    stability: 60,
    speed: 1,
    He3Cost: 25,
  },
  {
    id: 'b2',
    name: 'Doomstar',
    hull: 'battleship',
    structure: 1500,
    shield: 1000,
    attack: 600,
    attackType: 'ship-based',
    minRange: 1,
    maxRange: 3,
    agility: 15,
    defense: 90,
    stability: 70,
    speed: 1,
    He3Cost: 30,
  },
  {
    id: 'b3',
    name: 'Thunder',
    hull: 'battleship',
    structure: 1000,
    shield: 600,
    attack: 700,
    attackType: 'missile',
    minRange: 2,
    maxRange: 3,
    agility: 25,
    defense: 60,
    stability: 45,
    speed: 1,
    He3Cost: 28,
  },
];

// ============================================================
// SLOT POSITION MODIFIERS — GO2 Original
// ============================================================

export const SLOT_MODIFIERS: Record<string, number> = {
  '0,0': 1.0, // center
  '0,1': 1.1, // front
  '0,2': 1.0, // center-right
  '1,0': 0.9, // left
  '1,1': 0.8, // back
  '1,2': 0.9, // right
  '2,0': 0.85, // far-left
  '2,1': 0.75, // far-back
  '2,2': 0.85, // far-right
};

// ============================================================
// SCATTER DAMAGE PERCENTAGES BY ATTACK TYPE
// ============================================================

export const SCATTER_PERCENT: Record<AttackType, number> = {
  ballistic: 15,
  directional: 10,
  missile: 25,
  'ship-based': 5,
};

// ============================================================
// STAR BONUS FOR EFFECTIVE STACK
// ============================================================

export const STAR_BONUS: Record<number, number> = {
  1: 0.0,
  2: 0.05,
  3: 0.1,
  4: 0.15,
  5: 0.2,
  6: 0.25,
  7: 0.3,
  8: 0.35,
  9: 0.4,
};

// ============================================================
// CONSTANTS
// ============================================================

const MIN_HIT_CHANCE = 5;
const MAX_HIT_CHANCE = 95;
const CRIT_CHANCE_CAP = 50;
const CRIT_MULTIPLIER_BASE = 1.5;
const MAX_ROUNDS = 20;
const EXPLOSION_THRESHOLD = 0.7; // structure < 70% of max = explosion chance
const BASE_STACK_LIMIT = 500;
const STACK_PER_LEVEL = 10;

// ============================================================
// RNG UTILITY
// ============================================================

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getCombatRNG(round: number, actionIndex: number): number {
  const seed = round * 1000 + actionIndex;
  return seededRandom(seed)();
}

function roll(percentChance: number, rng: () => number): boolean {
  return rng() * 100 < percentChance;
}

// ============================================================
// DEEP CLONE UTILITIES
// ============================================================

function cloneStack(stack: ShipStack): ShipStack {
  return {
    shipType: { ...stack.shipType },
    count: stack.count,
    currentStructure: stack.currentStructure,
    currentShield: stack.currentShield,
    position: { ...stack.position },
  };
}

function cloneFleet(fleet: BattleFleet): BattleFleet {
  return {
    side: fleet.side,
    commander: { ...fleet.commander },
    stacks: fleet.stacks.map(cloneStack),
    totalHe3: fleet.totalHe3,
  };
}

function cloneState(state: BattleState): BattleState {
  return {
    round: state.round,
    maxRounds: state.maxRounds,
    attacker: cloneFleet(state.attacker),
    defender: cloneFleet(state.defender),
    log: state.log.map((e) => ({ ...e, actions: [...e.actions] })),
    isFinished: state.isFinished,
    winner: state.winner,
  };
}

// ============================================================
// CORE COMBAT FORMULAS
// ============================================================

/**
 * Calculate hit chance between attacker accuracy and target dodge.
 * Formula: (accuracy / (accuracy + dodge)) * 100%, clamped [5%, 95%]
 */
export function calculateHitChance(attackerAcc: number, targetDodge: number): number {
  const sum = attackerAcc + targetDodge;
  if (sum <= 0) return MIN_HIT_CHANCE;
  const raw = (attackerAcc / sum) * 100;
  return Math.max(MIN_HIT_CHANCE, Math.min(MAX_HIT_CHANCE, raw));
}

/**
 * Get the slot position damage modifier.
 */
export function getSlotModifier(position: Position): number {
  const key = `${position.row},${position.col}`;
  return SLOT_MODIFIERS[key] ?? 1.0;
}

/**
 * Calculate the base scatter percentage for an attack type.
 * Optional techLevel can increase missile scatter up to 54%.
 */
export function getScatterPercent(
  attackType: AttackType,
  techLevel: number = 0
): number {
  const base = SCATTER_PERCENT[attackType] ?? 10;
  if (attackType === 'missile') {
    // Missile scatter increases with tech: up to +29 extra (from 25 to 54)
    return Math.min(54, base + techLevel * 0.29);
  }
  return base;
}

/**
 * Calculate effective stack size (max ships per slot) based on commander.
 * Formula: (500 + level * 10) * (1 + starBonus)
 */
export function getEffectiveStack(commander: Commander): number {
  const base = BASE_STACK_LIMIT + commander.level * STACK_PER_LEVEL;
  const bonus = STAR_BONUS[commander.stars] ?? 0;
  return Math.floor(base * (1 + bonus));
}

/**
 * Calculate critical hit chance from commander electron stat.
 * Formula: min(electron / 10, 50%)
 */
export function calculateCritChance(commander: Commander): number {
  const raw = commander.stats.electron / 10;
  return Math.min(CRIT_CHANCE_CAP, raw);
}

/**
 * Calculate the critical hit damage multiplier.
 * Formula: 1.5 + (electron / 100)
 */
export function calculateCritMultiplier(commander: Commander): number {
  return CRIT_MULTIPLIER_BASE + commander.stats.electron / 100;
}

/**
 * Check if a commander skill triggers this round.
 * Formula: baseChance * (affectingStat / 100)
 */
export function checkSkillTrigger(
  commander: Commander,
  baseChance: number = 0.15,
  rng: () => number
): boolean {
  const statKey = commander.skillAffectedBy.toLowerCase() as keyof CommanderStats;
  const statValue = commander.stats[statKey] ?? 10;
  const chance = baseChance * (statValue / 100);
  return roll(chance * 100, rng);
}

/**
 * Calculate commander accuracy value (used as attacker accuracy in hit chance).
 */
export function getCommanderAccuracy(commander: Commander): number {
  return commander.stats.accuracy;
}

/**
 * Calculate commander dodge value (used for target dodge in hit chance).
 */
export function getCommanderDodge(commander: Commander): number {
  return commander.stats.dodge;
}

// ============================================================
// DAMAGE CALCULATION
// ============================================================

/**
 * Calculate complete damage result for a single shot.
 * Handles: base damage, slot modifiers, crits, shields, structure, scatter.
 */
export function calculateDamage(params: DamageParams): DamageResult {
  const {
    attacker,
    shipType,
    targetStack,
    slotPosition,
    isCritical = false,
    techLevel = 0,
  } = params;

  // 1. Base damage per ship
  let baseDamage = shipType.attack * (1 + attacker.stats.accuracy / 100);

  // 2. Apply slot position modifier
  const slotMod = getSlotModifier(slotPosition);
  baseDamage *= slotMod;

  // 3. Apply critical hit multiplier
  let actualCrit = isCritical;
  let critMult = 1;
  if (isCritical) {
    critMult = calculateCritMultiplier(attacker);
    baseDamage *= critMult;
  }

  // 4. Damage to shields first
  let remainingDamage = baseDamage;
  let shieldDamage = 0;

  if (targetStack.currentShield > 0) {
    // Shield damage reduced by target stability
    const stabilityFactor = 1 - shipType.stability / 200;
    shieldDamage = baseDamage * stabilityFactor;
    const actualShieldDamage = Math.min(shieldDamage, targetStack.currentShield);
    remainingDamage = baseDamage - actualShieldDamage;
    shieldDamage = actualShieldDamage;
  }

  // 5. Damage to structure
  const structureDamage =
    remainingDamage * (1 - shipType.defense / 200);

  // 6. Ships destroyed
  const perShipStructure = targetStack.shipType.structure;
  const shipsDestroyed = Math.floor(structureDamage / perShipStructure);
  const actualShipsDestroyed = Math.min(shipsDestroyed, targetStack.count);

  // 7. Scatter damage (applied to other enemy stacks)
  const scatterPercent = getScatterPercent(shipType.attackType, techLevel);
  const scatterDamage = (baseDamage * scatterPercent) / 100;

  return {
    totalDamage: baseDamage,
    shieldDamage,
    structureDamage,
    shipsDestroyed: actualShipsDestroyed,
    isCritical: actualCrit,
    scatterDamage,
  };
}

// ============================================================
// TARGETING SYSTEM
// ============================================================

/**
 * Choose a target stack index for an attacker.
 * Strategy: prefer closest position, then highest threat (attack power).
 */
export function chooseTarget(
  attackerStack: ShipStack,
  enemyStacks: ShipStack[],
  strategy: 'closest' | 'maxAttack' | 'weakest' = 'closest'
): number {
  const aliveStacks = enemyStacks
    .map((s, i) => ({ stack: s, index: i }))
    .filter((s) => s.stack.count > 0 && s.stack.currentStructure > 0);

  if (aliveStacks.length === 0) return -1;

  if (strategy === 'closest') {
    // Distance: manhattan distance from attacker position
    return aliveStacks.reduce((best, current) => {
      const distCurrent =
        Math.abs(attackerStack.position.row - current.stack.position.row) +
        Math.abs(attackerStack.position.col - current.stack.position.col);
      const distBest =
        Math.abs(attackerStack.position.row - best.stack.position.row) +
        Math.abs(attackerStack.position.col - best.stack.position.col);
      return distCurrent < distBest ? current : best;
    }).index;
  }

  if (strategy === 'maxAttack') {
    // Target stack with highest total attack power
    return aliveStacks.reduce((best, current) => {
      const threatCurrent = current.stack.shipType.attack * current.stack.count;
      const threatBest = best.stack.shipType.attack * best.stack.count;
      return threatCurrent > threatBest ? current : best;
    }).index;
  }

  if (strategy === 'weakest') {
    // Target stack with lowest total structure remaining
    return aliveStacks.reduce((best, current) => {
      const hpCurrent = current.stack.currentStructure + current.stack.currentShield;
      const hpBest = best.stack.currentStructure + best.stack.currentShield;
      return hpCurrent < hpBest ? current : best;
    }).index;
  }

  return aliveStacks[0].index;
}

// ============================================================
// STACK STATE HELPERS
// ============================================================

/**
 * Check if a stack is alive (has ships remaining and positive structure).
 */
export function isStackAlive(stack: ShipStack): boolean {
  return stack.count > 0 && stack.currentStructure > 0;
}

/**
 * Get total ships count in a fleet.
 */
export function countFleetShips(fleet: BattleFleet): number {
  return fleet.stacks.reduce((sum, s) => sum + s.count, 0);
}

/**
 * Get total initial ships in a fleet (for tracking losses).
 */
export function countInitialShips(fleet: BattleFleet): number {
  return fleet.stacks.reduce(
    (sum, s) => sum + s.count,
    0
  );
}

/**
 * Get max possible structure for a stack.
 */
export function getMaxStackStructure(stack: ShipStack): number {
  return stack.shipType.structure * stack.count;
}

/**
 * Get max possible shield for a stack.
 */
export function getMaxStackShield(stack: ShipStack): number {
  return stack.shipType.shield * stack.count;
}

/**
 * Check if a fleet is completely destroyed.
 */
export function isFleetDestroyed(fleet: BattleFleet): boolean {
  return fleet.stacks.every((s) => !isStackAlive(s));
}

/**
 * Get adjacent stack indices for scatter damage.
 * Adjacent = any other enemy stack (simplified). In full GO2,
 * scatter hits all other enemy stacks.
 */
export function getScatterTargets(
  _sourceIndex: number,
  enemyStacks: ShipStack[]
): number[] {
  return enemyStacks
    .map((s, i) => i)
    .filter((i) => isStackAlive(enemyStacks[i]));
}

// ============================================================
// BATTLE STATE MANAGEMENT
// ============================================================

/**
 * Create a fresh battle state from two fleets.
 */
export function createBattle(
  attacker: BattleFleet,
  defender: BattleFleet
): BattleState {
  return {
    round: 0,
    maxRounds: MAX_ROUNDS,
    attacker: cloneFleet(attacker),
    defender: cloneFleet(defender),
    log: [],
    isFinished: false,
    winner: null,
  };
}

/**
 * Create initial ship stack with full HP.
 */
export function createShipStack(
  shipType: ShipType,
  count: number,
  position: Position
): ShipStack {
  return {
    shipType,
    count,
    currentStructure: shipType.structure * count,
    currentShield: shipType.shield * count,
    position,
  };
}

// ============================================================
// ROUND PROCESSING
// ============================================================

/**
 * Process a single round of combat.
 * Returns round result and mutates the state.
 */
export function processRound(state: BattleState): BattleRoundResult {
  const actions: BattleAction[] = [];
  const rng = seededRandom(state.round * 7919); // deterministic seed per round
  let actionIndex = 0;
  const getRng = () => getCombatRNG(state.round, actionIndex++);

  state.round++;
  const round = state.round;

  // ── 1. Movement phase (simplified: ships already in range for now) ──
  // In full GO2, ships move to get in range. We assume range 3 covers all.

  // ── 2. Determine fire order by commander speed (higher = first) ──
  const attackerSpeed = state.attacker.commander.stats.speed;
  const defenderSpeed = state.defender.commander.stats.speed;

  type FireOrderEntry = {
    side: BattleSide;
    stackIndex: number;
    speed: number;
  };

  const fireOrder: FireOrderEntry[] = [];

  // Add attacker stacks
  state.attacker.stacks.forEach((stack, i) => {
    if (isStackAlive(stack)) {
      fireOrder.push({
        side: 'attacker',
        stackIndex: i,
        speed: stack.shipType.speed + attackerSpeed,
      });
    }
  });

  // Add defender stacks
  state.defender.stacks.forEach((stack, i) => {
    if (isStackAlive(stack)) {
      fireOrder.push({
        side: 'defender',
        stackIndex: i,
        speed: stack.shipType.speed + defenderSpeed,
      });
    }
  });

  // Sort by speed descending
  fireOrder.sort((a, b) => b.speed - a.speed);

  // ── 3. Process each stack's attack ──
  for (const entry of fireOrder) {
    if (state.isFinished) break;

    const myFleet = entry.side === 'attacker' ? state.attacker : state.defender;
    const enemyFleet = entry.side === 'attacker' ? state.defender : state.attacker;

    const myStack = myFleet.stacks[entry.stackIndex];
    if (!myStack || !isStackAlive(myStack)) continue;

    const myCommander = myFleet.commander;
    const enemyCommander = enemyFleet.commander;

    // Choose target
    const targetIndex = chooseTarget(myStack, enemyFleet.stacks, 'closest');
    if (targetIndex < 0) continue;

    const targetStack = enemyFleet.stacks[targetIndex];
    if (!isStackAlive(targetStack)) continue;

    // ── Check hit chance ──
    const attackerAcc = getCommanderAccuracy(myCommander);
    const targetDodge = getCommanderDodge(enemyCommander);
    const hitChance = calculateHitChance(attackerAcc, targetDodge);
    const hit = roll(hitChance, getRng);

    if (!hit) {
      actions.push({
        type: 'fire',
        source: { side: entry.side, stackIndex: entry.stackIndex },
        target: { side: entry.side === 'attacker' ? 'defender' : 'attacker', stackIndex: targetIndex },
        damage: 0,
      });
      continue;
    }

    // ── Check critical ──
    const critChance = calculateCritChance(myCommander);
    const isCrit = roll(critChance, getRng);

    // ── Check skill trigger ──
    let skillTriggered: string | undefined;
    if (checkSkillTrigger(myCommander, 0.12, getRng)) {
      skillTriggered = myCommander.skill;
    }

    // ── Calculate damage ──
    const damageResult = calculateDamage({
      attacker: myCommander,
      defender: enemyCommander,
      shipType: myStack.shipType,
      targetStack,
      slotPosition: myStack.position,
      isCritical: isCrit,
    });

    // ── Apply shield damage ──
    if (damageResult.shieldDamage > 0 && targetStack.currentShield > 0) {
      targetStack.currentShield = Math.max(
        0,
        targetStack.currentShield - damageResult.shieldDamage
      );
    }

    // ── Apply structure damage ──
    const oldStructure = targetStack.currentStructure;
    targetStack.currentStructure = Math.max(
      0,
      targetStack.currentStructure - damageResult.structureDamage
    );

    // ── Recalculate ships remaining ──
    const oldCount = targetStack.count;
    const perShipStruct = targetStack.shipType.structure;
    const maxShips = Math.ceil(targetStack.currentStructure / perShipStruct);
    targetStack.count = Math.min(targetStack.count, Math.max(0, maxShips));

    const shipsLost = oldCount - targetStack.count;

    // ── Record fire action ──
    actions.push({
      type: 'fire',
      source: { side: entry.side, stackIndex: entry.stackIndex },
      target: { side: entry.side === 'attacker' ? 'defender' : 'attacker', stackIndex: targetIndex },
      damage: damageResult.totalDamage,
      shieldDamage: damageResult.shieldDamage,
      remainingDamage: damageResult.structureDamage,
      shipsDestroyed: shipsLost,
      isCritical: damageResult.isCritical,
      skillTriggered,
    });

    // ── Scatter damage to other enemy stacks ──
    const scatterTargets = getScatterTargets(targetIndex, enemyFleet.stacks);
    for (const scatterIdx of scatterTargets) {
      if (scatterIdx === targetIndex) continue;
      const scatterStack = enemyFleet.stacks[scatterIdx];
      if (!isStackAlive(scatterStack)) continue;

      // Apply scatter: half to shield, half to structure
      const scatterDmg = damageResult.scatterDamage;
      if (scatterStack.currentShield > 0) {
        const shieldAbsorb = Math.min(scatterDmg * 0.5, scatterStack.currentShield);
        scatterStack.currentShield -= shieldAbsorb;
        scatterStack.currentStructure -= Math.max(0, scatterDmg * 0.5);
      } else {
        scatterStack.currentStructure -= scatterDmg;
      }

      // Recount ships after scatter
      const sMaxShips = Math.ceil(
        scatterStack.currentStructure / scatterStack.shipType.structure
      );
      scatterStack.count = Math.min(scatterStack.count, Math.max(0, sMaxShips));

      actions.push({
        type: 'scatter',
        source: { side: entry.side, stackIndex: entry.stackIndex },
        target: {
          side: entry.side === 'attacker' ? 'defender' : 'attacker',
          stackIndex: scatterIdx,
        },
        scatterDamage: scatterDmg,
      });
    }

    // ── Check explosion (structure < 70% of max) ──
    const maxStruct = targetStack.shipType.structure * oldCount;
    if (targetStack.currentStructure < maxStruct * EXPLOSION_THRESHOLD) {
      const explosionRoll = getRng();
      if (explosionRoll < 0.3) {
        // 30% chance: additional damage from explosion
        const explosionDmg = targetStack.shipType.structure * 0.5;
        targetStack.currentStructure = Math.max(0, targetStack.currentStructure - explosionDmg);
        targetStack.count = Math.max(
          0,
          Math.ceil(targetStack.currentStructure / targetStack.shipType.structure)
        );
        actions.push({
          type: 'explosion',
          source: { side: entry.side, stackIndex: entry.stackIndex },
          target: {
            side: entry.side === 'attacker' ? 'defender' : 'attacker',
            stackIndex: targetIndex,
          },
          damage: explosionDmg,
        });
      }
    }

    // ── Deduct He3 cost ──
    const he3Cost = myStack.shipType.He3Cost * myStack.count;
    myFleet.totalHe3 = Math.max(0, myFleet.totalHe3 - he3Cost);

    // ── Check if fleet destroyed ──
    if (isFleetDestroyed(enemyFleet)) {
      state.isFinished = true;
      state.winner = entry.side;
      break;
    }
  }

  // ── 4. Post-round checks ──
  if (!state.isFinished) {
    // Check if both fleets destroyed
    const attackerDead = isFleetDestroyed(state.attacker);
    const defenderDead = isFleetDestroyed(state.defender);

    if (attackerDead && defenderDead) {
      state.isFinished = true;
      state.winner = 'draw';
    } else if (attackerDead) {
      state.isFinished = true;
      state.winner = 'defender';
    } else if (defenderDead) {
      state.isFinished = true;
      state.winner = 'attacker';
    } else if (round >= state.maxRounds) {
      // Max rounds reached
      state.isFinished = true;
      state.winner = 'draw';
    }
  }

  // ── Log entry ──
  const logEntry: BattleLogEntry = {
    round,
    timestamp: Date.now(),
    message: `Round ${round}: ${actions.length} actions`,
    actions: [...actions],
  };
  state.log.push(logEntry);

  return {
    round,
    actions,
    attackerStacksAfter: state.attacker.stacks.map(cloneStack),
    defenderStacksAfter: state.defender.stacks.map(cloneStack),
  };
}

// ============================================================
// FULL BATTLE SIMULATION
// ============================================================

/**
 * Run the complete battle (all rounds until completion).
 */
export function runBattle(state: BattleState): BattleResult {
  // Track initial counts for loss calculation
  const attackerInitialShips = countFleetShips(state.attacker);
  const defenderInitialShips = countFleetShips(state.defender);
  const attackerInitialHe3 = state.attacker.totalHe3;
  const defenderInitialHe3 = state.defender.totalHe3;

  // Process rounds
  while (!state.isFinished && state.round < state.maxRounds) {
    processRound(state);
  }

  // If somehow not finished, mark as draw
  if (!state.isFinished) {
    state.isFinished = true;
    state.winner = 'draw';
  }

  // Calculate results
  const attackerFinalShips = countFleetShips(state.attacker);
  const defenderFinalShips = countFleetShips(state.defender);
  const attackerShipsLost = attackerInitialShips - attackerFinalShips;
  const defenderShipsLost = defenderInitialShips - defenderFinalShips;
  const attackerHe3Lost = attackerInitialHe3 - state.attacker.totalHe3;
  const defenderHe3Lost = defenderInitialHe3 - state.defender.totalHe3;

  // Calculate commander EXP gained
  let commanderExpGained = 0;
  if (state.winner === 'attacker') {
    commanderExpGained = Math.floor(
      (defenderShipsLost * 10 + state.round * 5) * 1.2
    );
  } else if (state.winner === 'defender') {
    commanderExpGained = Math.floor(attackerShipsLost * 10 + state.round * 5);
  } else {
    commanderExpGained = Math.floor(
      ((attackerShipsLost + defenderShipsLost) * 5 + state.round * 2) * 0.5
    );
  }

  // Generate loot (simplified)
  const loot: LootItem[] = [];
  if (state.winner === 'attacker') {
    const resources = defenderShipsLost * 100;
    loot.push({ type: 'resources', id: 'metal', quantity: resources });
    loot.push({ type: 'resources', id: 'He3', quantity: defenderHe3Lost });
  }

  return {
    winner: state.winner ?? 'draw',
    rounds: state.round,
    attackerShipsLost,
    defenderShipsLost,
    attackerHe3Lost,
    defenderHe3Lost,
    commanderExpGained,
    loot,
    log: state.log,
  };
}

// ============================================================
// QUICK BATTLE: one-shot battle from two fleet configs
// ============================================================

/**
 * Simulate a complete battle from fleet configs in one call.
 * Creates the battle, runs all rounds, returns the result.
 */
export function simulateBattle(
  attacker: BattleFleet,
  defender: BattleFleet
): BattleResult {
  const state = createBattle(attacker, defender);
  return runBattle(state);
}

// ============================================================
// BUILDER HELPERS
// ============================================================

/**
 * Create a fleet with commander and ship stacks.
 */
export function createFleet(
  side: BattleSide,
  commander: Commander,
  stacks: ShipStack[],
  totalHe3: number
): BattleFleet {
  return { side, commander, stacks, totalHe3 };
}

/**
 * Build stacks from a ship-type and count specification.
 * Spreads ships across positions in 3x3 formation.
 */
export function buildStacks(
  shipType: ShipType,
  totalCount: number,
  commander: Commander
): ShipStack[] {
  const maxStack = getEffectiveStack(commander);
  const stacks: ShipStack[] = [];
  let remaining = totalCount;
  let posIdx = 0;

  const positions: Position[] = [
    { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
    { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
    { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 },
  ];

  while (remaining > 0 && posIdx < positions.length) {
    const count = Math.min(maxStack, remaining);
    stacks.push(createShipStack(shipType, count, positions[posIdx]));
    remaining -= count;
    posIdx++;
  }

  return stacks;
}

/**
 * Build a mixed fleet with multiple ship types.
 * ships: array of { shipType, count } pairs.
 */
export function buildMixedStacks(
  ships: { shipType: ShipType; count: number }[],
  commander: Commander
): ShipStack[] {
  const maxStack = getEffectiveStack(commander);
  const stacks: ShipStack[] = [];
  let posIdx = 0;

  const positions: Position[] = [
    { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
    { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
    { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 },
  ];

  for (const ship of ships) {
    let remaining = ship.count;
    while (remaining > 0 && posIdx < positions.length) {
      const count = Math.min(maxStack, remaining);
      stacks.push(createShipStack(ship.shipType, count, positions[posIdx]));
      remaining -= count;
      posIdx++;
    }
  }

  return stacks;
}

// ============================================================
// ADDITIONAL EXPORTS
// ============================================================

/**
 * Get ship type by ID.
 */
export function getShipType(id: string): ShipType | undefined {
  return SHIP_TYPES.find((s) => s.id === id);
}

/**
 * Get all ship types of a hull class.
 */
export function getShipsByHull(hull: HullClass): ShipType[] {
  return SHIP_TYPES.filter((s) => s.hull === hull);
}

/**
 * Get all ship types by attack type.
 */
export function getShipsByAttackType(attackType: AttackType): ShipType[] {
  return SHIP_TYPES.filter((s) => s.attackType === attackType);
}

/**
 * Format a stack summary for display.
 */
export function formatStackSummary(stack: ShipStack): string {
  return `${stack.shipType.name} x${stack.count} [S:${Math.round(stack.currentShield)}/St:${Math.round(stack.currentStructure)}]`;
}

/**
 * Format a fleet summary for display.
 */
export function formatFleetSummary(fleet: BattleFleet): string {
  const side = fleet.side === 'attacker' ? 'ATT' : 'DEF';
  const totalShips = countFleetShips(fleet);
  const commanderName = fleet.commander.name;
  return `[${side}] ${commanderName}: ${totalShips} ships, ${fleet.stacks.length} stacks, He3:${fleet.totalHe3}`;
}

/**
 * Export all ship types map by ID.
 */
export const SHIP_TYPES_MAP: Record<string, ShipType> = SHIP_TYPES.reduce(
  (map, ship) => {
    map[ship.id] = ship;
    return map;
  },
  {} as Record<string, ShipType>
);

// ============================================================
// DEFAULT EXPORTS
// ============================================================

export default {
  SHIP_TYPES,
  SHIP_TYPES_MAP,
  SLOT_MODIFIERS,
  SCATTER_PERCENT,
  STAR_BONUS,
  MAX_ROUNDS,
  BASE_STACK_LIMIT,
  EXPLOSION_THRESHOLD,
  createBattle,
  processRound,
  runBattle,
  simulateBattle,
  calculateHitChance,
  calculateDamage,
  calculateCritChance,
  calculateCritMultiplier,
  checkSkillTrigger,
  getEffectiveStack,
  getSlotModifier,
  getScatterPercent,
  getCommanderAccuracy,
  getCommanderDodge,
  chooseTarget,
  isStackAlive,
  isFleetDestroyed,
  countFleetShips,
  createShipStack,
  createFleet,
  buildStacks,
  buildMixedStacks,
  getShipType,
  getShipsByHull,
  getShipsByAttackType,
  formatStackSummary,
  formatFleetSummary,
};
