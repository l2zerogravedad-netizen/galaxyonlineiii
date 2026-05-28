/**
 * ========================================================================
 * Battle Engine — Unit Tests
 * ========================================================================
 * Tests unitarios para las fórmulas core del BattleEngine.
 * Se ejecutan con: npx tsx BattleEngine.test.ts
 * ========================================================================
 */

import {
  BattlePhase,
  BattleState,
  BASE_EFFECTIVE_STACK,
  EOS_TRIGGER_CHANCE,
} from './types';

import {
  getArmorMultiplier,
  createBallisticWeapon,
  createDirectionalWeapon,
  createMissileWeapon,
  createShipBasedWeapon,
  isInRange,
  getAvailableWeapons,
  consumeHe3,
} from './WeaponSystem';

import {
  getEffectiveStack,
  getStackBonusByStars,
  calculateInitiativeOrder,
  calculateCritChance,
  calculateCritMultiplier,
  createCommander,
  createAttackCommander,
  createDefenseCommander,
  createBalancedCommander,
} from './CommanderSystem';

import {
  regenerateShields,
  applyHullDamage,
  applyShieldDamage,
  applyDamage,
  isStackAlive,
  countAliveStacks,
  isFleetDestroyed,
  processEOS,
  createShipStack,
} from './ShieldSystem';

import {
  SeededRNG,
  calculateHitChance,
  binomialHits,
  rollDamage,
  applyCritical,
  applyShieldPenetration,
  calculateAttack,
  aggregateDamage,
} from './DamageSystem';

import { BattleEngine, createBattleEngine } from './BattleEngine';

// ============================================================================
// MINI TEST RUNNER
// ============================================================================

const tests: Array<{ name: string; fn: () => void }> = [];
let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  tests.push({ name, fn });
}

function assertEqual(actual: unknown, expected: unknown, msg?: string): void {
  if (actual !== expected) {
    throw new Error(
      `${msg ?? 'Assertion failed'}: expected ${expected}, got ${actual}`
    );
  }
}

function assertTrue(value: boolean, msg?: string): void {
  if (!value) {
    throw new Error(msg ?? 'Expected true, got false');
  }
}

function assertFalse(value: boolean, msg?: string): void {
  if (value) {
    throw new Error(msg ?? 'Expected false, got true');
  }
}

function assertGreaterThan(actual: number, min: number, msg?: string): void {
  if (!(actual > min)) {
    throw new Error(
      `${msg ?? 'Assertion failed'}: expected ${actual} > ${min}`
    );
  }
}

// ============================================================================
// TESTS: WeaponSystem
// ============================================================================

test('WeaponSystem: create ballistic weapon has correct defaults', () => {
  const w = createBallisticWeapon();
  assertEqual(w.type, 'ballistic');
  assertEqual(w.range[0], 1);
  assertEqual(w.range[1], 2);
  assertEqual(w.cooldown, 0);
  assertEqual(w.he3Consumption, 5);
  assertEqual(w.interceptable, false);
  assertTrue(w.pierceChance === 0.10);
  assertTrue(w.scatterRange === 1);
});

test('WeaponSystem: create directional weapon has correct defaults', () => {
  const w = createDirectionalWeapon();
  assertEqual(w.type, 'directional');
  assertEqual(w.range[0], 1);
  assertEqual(w.range[1], 5);
  assertEqual(w.cooldown, 1);
  assertEqual(w.he3Consumption, 15);
  assertEqual(w.pierceChance, 0.20);
});

test('WeaponSystem: create missile weapon is interceptable', () => {
  const w = createMissileWeapon();
  assertEqual(w.type, 'missile');
  assertEqual(w.interceptable, true);
  assertEqual(w.range[0], 4);
  assertEqual(w.range[1], 8);
  assertEqual(w.cooldown, 2);
});

test('WeaponSystem: create ship-based weapon has long range', () => {
  const w = createShipBasedWeapon();
  assertEqual(w.type, 'ship_based');
  assertEqual(w.range[0], 6);
  assertEqual(w.range[1], 10);
  assertEqual(w.cooldown, 3);
  assertEqual(w.he3Consumption, 50);
});

// Armor-Damage Matrix
test('WeaponSystem: Regen armor weak to heat (x2.0)', () => {
  assertEqual(getArmorMultiplier('regen', 'heat'), 2.0);
});

test('WeaponSystem: Regen armor strong vs kinetic (x0.5)', () => {
  assertEqual(getArmorMultiplier('regen', 'kinetic'), 0.5);
});

test('WeaponSystem: Neutralizing armor weak to kinetic (x2.0)', () => {
  assertEqual(getArmorMultiplier('neutralizing', 'kinetic'), 2.0);
});

test('WeaponSystem: Nano armor weak to magnetic (x2.0)', () => {
  assertEqual(getArmorMultiplier('nano', 'magnetic'), 2.0);
});

test('WeaponSystem: Chrome armor weak to explosive (x2.0)', () => {
  assertEqual(getArmorMultiplier('chrome', 'explosive'), 2.0);
});

test('WeaponSystem: Chrome armor strong vs magnetic (x0.5)', () => {
  assertEqual(getArmorMultiplier('chrome', 'magnetic'), 0.5);
});

test('WeaponSystem: isInRange works correctly', () => {
  assertTrue(isInRange(1, 3, [1, 5]));
  assertFalse(isInRange(1, 10, [1, 5]));
  assertTrue(isInRange(5, 10, [4, 8]));
  assertFalse(isInRange(5, 10, [1, 2]));
});

// ============================================================================
// TESTS: CommanderSystem
// ============================================================================

test('CommanderSystem: effective stack bonus by stars', () => {
  assertEqual(getStackBonusByStars(1), 100);
  assertEqual(getStackBonusByStars(3), 450);
  assertEqual(getStackBonusByStars(5), 1000);
});

test('CommanderSystem: effective stack clamps at 5 stars', () => {
  assertEqual(getStackBonusByStars(10), 1000);
});

test('CommanderSystem: initiative order by speed', () => {
  const stacks = [
    createShipStack({
      id: 's1',
      shipType: 'cruiser',
      totalShips: 100,
      position: 1,
      faction: 'attacker',
      commander: createAttackCommander('Fast', 3), // speed ~55
    }),
    createShipStack({
      id: 's2',
      shipType: 'cruiser',
      totalShips: 100,
      position: 13,
      faction: 'defender',
      commander: createDefenseCommander('Slow', 1), // speed ~65
    }),
  ];

  const order = calculateInitiativeOrder(stacks);
  assertTrue(order.length === 2);
  assertTrue(order[0].stackId === 's2');
  assertTrue(order[1].stackId === 's1');
});

test('CommanderSystem: crit chance formula', () => {
  const cmd = createCommander({
    id: 'c1',
    name: 'Test',
    stars: 5,
    accuracy: 50,
    speed: 50,
    dodge: 50,
    electron: 100,
  });
  const chance = calculateCritChance(cmd);
  assertEqual(chance, 100 / 200); // 0.5
});

test('CommanderSystem: crit chance capped at 50%', () => {
  const cmd = createCommander({
    id: 'c2',
    name: 'Test',
    stars: 5,
    accuracy: 50,
    speed: 50,
    dodge: 50,
    electron: 200,
  });
  const chance = calculateCritChance(cmd);
  assertEqual(chance, 0.50);
});

test('CommanderSystem: crit multiplier formula', () => {
  const cmd = createCommander({
    id: 'c3',
    name: 'Test',
    stars: 3,
    accuracy: 50,
    speed: 50,
    dodge: 50,
    electron: 50,
  });
  const mult = calculateCritMultiplier(cmd);
  assertEqual(mult, 1.5 + 50 / 100); // 2.0
});

// ============================================================================
// TESTS: ShieldSystem
// ============================================================================

test('ShieldSystem: createShipStack sets defaults', () => {
  const stack = createShipStack({
    id: 'test1',
    shipType: 'frigate',
    totalShips: 100,
    position: 1,
    faction: 'attacker',
  });
  assertEqual(stack.currentShips, 100);
  assertEqual(stack.hullPoints, 400);
  assertEqual(stack.totalShield, 200 * 100);
  assertTrue(isStackAlive(stack));
});

test('ShieldSystem: regenerateShields restores to full', () => {
  let stack = createShipStack({
    id: 'test2',
    shipType: 'frigate',
    totalShips: 100,
    position: 1,
    faction: 'attacker',
  });
  // Simular daño a escudos
  stack = { ...stack, totalShield: 5000 };
  const regenerated = regenerateShields(stack);
  assertEqual(regenerated.totalShield, 200 * 100); // shieldPoints * currentShips
});

test('ShieldSystem: applyHullDamage destroys ships', () => {
  const stack = createShipStack({
    id: 'test3',
    shipType: 'frigate',
    totalShips: 100,
    position: 1,
    faction: 'attacker',
  });
  // Daño suficiente para destruir naves
  const result = applyHullDamage(stack, 50000);
  assertTrue(result.shipsDestroyed > 0);
  assertTrue(result.stack.currentShips < 100);
});

test('ShieldSystem: applyShieldDamage absorbs and overflows', () => {
  const stack = createShipStack({
    id: 'test4',
    shipType: 'frigate',
    totalShips: 10,
    position: 1,
    faction: 'attacker',
  });
  // Shield total = 200 * 10 = 2000
  const result = applyShieldDamage(stack, 2500);
  assertEqual(result.absorbed, 2000);
  assertEqual(result.overflow, 500);
  assertTrue(result.depleted);
});

test('ShieldSystem: fleet destruction check', () => {
  const alive = createShipStack({
    id: 'a1',
    shipType: 'frigate',
    totalShips: 10,
    position: 1,
    faction: 'attacker',
  });
  const dead = { ...alive, currentShips: 0 };
  assertFalse(isFleetDestroyed([alive]));
  assertTrue(isFleetDestroyed([dead]));
});

test('ShieldSystem: countAliveStacks', () => {
  const s1 = createShipStack({
    id: 'c1',
    shipType: 'frigate',
    totalShips: 10,
    position: 1,
    faction: 'attacker',
  });
  const s2 = { ...s1, id: 'c2', currentShips: 0 };
  const s3 = { ...s1, id: 'c3', currentShips: 5 };
  assertEqual(countAliveStacks([s1, s2, s3]), 2);
});

// ============================================================================
// TESTS: DamageSystem
// ============================================================================

test('DamageSystem: SeededRNG is deterministic', () => {
  const rng1 = new SeededRNG(42);
  const rng2 = new SeededRNG(42);
  const v1 = rng1.next();
  const v2 = rng2.next();
  assertEqual(v1, v2);
});

test('DamageSystem: hit chance base is 70%', () => {
  const chance = calculateHitChance(undefined, undefined, 0.70);
  assertEqual(chance, 0.70);
});

test('DamageSystem: hit chance affected by accuracy and dodge', () => {
  const attacker = createCommander({
    id: 'a1',
    name: 'A',
    stars: 3,
    accuracy: 80,
    speed: 50,
    dodge: 30,
    electron: 50,
  });
  const defender = createCommander({
    id: 'd1',
    name: 'D',
    stars: 3,
    accuracy: 50,
    speed: 50,
    dodge: 60,
    electron: 50,
  });
  const chance = calculateHitChance(attacker, defender, 0.70);
  // 0.70 + (80 - 60) * 0.01 = 0.70 + 0.20 = 0.90
  assertTrue(Math.abs(chance - 0.90) < 0.001);
});

test('DamageSystem: hit chance clamped at 95%', () => {
  const attacker = createCommander({
    id: 'a2',
    name: 'A',
    stars: 5,
    accuracy: 200,
    speed: 50,
    dodge: 0,
    electron: 50,
  });
  const chance = calculateHitChance(attacker, undefined, 0.70);
  assertEqual(chance, 0.95);
});

test('DamageSystem: hit chance minimum 5%', () => {
  const defender = createCommander({
    id: 'd2',
    name: 'D',
    stars: 5,
    accuracy: 0,
    speed: 50,
    dodge: 200,
    electron: 50,
  });
  const chance = calculateHitChance(undefined, defender, 0.70);
  assertEqual(chance, 0.05);
});

test('DamageSystem: rollDamage within range', () => {
  const rng = new SeededRNG(123);
  const weapon = createBallisticWeapon(50, 100);
  for (let i = 0; i < 20; i++) {
    const dmg = rollDamage(weapon, rng);
    assertTrue(dmg >= 50 && dmg <= 100);
  }
});

test('DamageSystem: applyCritical with high electron', () => {
  const rng = new SeededRNG(1);
  const commander = createCommander({
    id: 'c1',
    name: 'Crit',
    stars: 5,
    accuracy: 50,
    speed: 50,
    dodge: 50,
    electron: 200, // 100% crit chance
  });
  const result = applyCritical(100, commander, rng);
  assertTrue(result.isCritical);
  assertTrue(result.multiplier > 1.5);
});

test('DamageSystem: shield penetration with 100% pierce', () => {
  const weapon = { ...createDirectionalWeapon(), pierceChance: 1.0 };
  const result = applyShieldPenetration(100, weapon, 50);
  assertTrue(result.isPierce);
  assertTrue(result.pierceDamage > 0);
});

test('DamageSystem: shield penetration with 0% pierce', () => {
  const weapon = { ...createBallisticWeapon(), pierceChance: 0 };
  const result = applyShieldPenetration(100, weapon, 50);
  assertFalse(result.isPierce);
  assertEqual(result.pierceDamage, 0);
});

test('DamageSystem: aggregateDamage sums correctly', () => {
  const results = [
    { hullDamage: 100, shieldDamage: 50, pierceDamage: 0, isCritical: false, criticalMultiplier: 1, isPierce: false, shipsDestroyed: 1, scatterResults: [] },
    { hullDamage: 200, shieldDamage: 100, pierceDamage: 20, isCritical: true, criticalMultiplier: 2, isPierce: true, shipsDestroyed: 2, scatterResults: [] },
  ];
  const agg = aggregateDamage(results);
  assertEqual(agg.totalHullDamage, 300);
  assertEqual(agg.totalShieldDamage, 150);
  assertEqual(agg.totalPierceDamage, 20);
  assertEqual(agg.totalShipsDestroyed, 3);
  assertEqual(agg.criticalCount, 1);
  assertEqual(agg.pierceCount, 1);
});

// ============================================================================
// TESTS: BattleEngine
// ============================================================================

test('BattleEngine: initializes with correct state', () => {
  const attacker = createShipStack({
    id: 'atk1',
    shipType: 'frigate',
    totalShips: 50,
    position: 1,
    faction: 'attacker',
    weapons: [createBallisticWeapon()],
  });
  const defender = createShipStack({
    id: 'def1',
    shipType: 'frigate',
    totalShips: 50,
    position: 13,
    faction: 'defender',
    weapons: [createBallisticWeapon()],
  });

  const engine = createBattleEngine({
    attackerStacks: [attacker],
    defenderStacks: [defender],
  });

  assertEqual(engine.getState(), BattleState.IN_PROGRESS);
  assertEqual(engine.getCurrentRound(), 0);
  assertEqual(engine.getMaxRounds(), 22); // 20 + 1 + 1 = 22
});

test('BattleEngine: event listener receives events', () => {
  const attacker = createShipStack({
    id: 'atk2',
    shipType: 'frigate',
    totalShips: 20,
    position: 1,
    faction: 'attacker',
    weapons: [createBallisticWeapon()],
  });
  const defender = createShipStack({
    id: 'def2',
    shipType: 'frigate',
    totalShips: 20,
    position: 13,
    faction: 'defender',
    weapons: [createBallisticWeapon()],
  });

  const engine = createBattleEngine({
    attackerStacks: [attacker],
    defenderStacks: [defender],
  });

  let eventCount = 0;
  engine.onEvent(() => {
    eventCount++;
  });

  engine.processRound();
  assertTrue(eventCount > 0);
});

test('BattleEngine: battle ends with a winner', () => {
  const attacker = createShipStack({
    id: 'atk3',
    shipType: 'battleship',
    totalShips: 200,
    position: 1,
    faction: 'attacker',
    weapons: [createBallisticWeapon(100, 200)],
  });
  const defender = createShipStack({
    id: 'def3',
    shipType: 'frigate',
    totalShips: 50,
    position: 13,
    faction: 'defender',
    weapons: [createBallisticWeapon()],
  });

  const engine = createBattleEngine({
    attackerStacks: [attacker],
    defenderStacks: [defender],
    seed: 42,
  });

  const result = engine.runBattle();
  assertTrue(result.winner === 'attacker' || result.winner === 'defender' || result.winner === 'draw');
  assertTrue(result.finalRound > 0);
});

test('BattleEngine: draw when both fleets are equal', () => {
  // Flotas idénticas con misma semilla deberían terminar en draw o un ganador
  const attacker = createShipStack({
    id: 'atk4',
    shipType: 'cruiser',
    totalShips: 50,
    position: 1,
    faction: 'attacker',
    weapons: [createBallisticWeapon()],
  });
  const defender = createShipStack({
    id: 'def4',
    shipType: 'cruiser',
    totalShips: 50,
    position: 13,
    faction: 'defender',
    weapons: [createBallisticWeapon()],
  });

  const engine = createBattleEngine({
    attackerStacks: [attacker],
    defenderStacks: [defender],
    maxRounds: 5, // Forzar límite bajo
    seed: 42,
  });

  const result = engine.runBattle();
  assertTrue(result.finalRound <= 5);
});

test('BattleEngine: snapshot returns current state', () => {
  const attacker = createShipStack({
    id: 'atk5',
    shipType: 'frigate',
    totalShips: 10,
    position: 1,
    faction: 'attacker',
    weapons: [],
  });
  const defender = createShipStack({
    id: 'def5',
    shipType: 'frigate',
    totalShips: 10,
    position: 13,
    faction: 'defender',
    weapons: [],
  });

  const engine = createBattleEngine({
    attackerStacks: [attacker],
    defenderStacks: [defender],
  });

  const snap = engine.getSnapshot();
  assertEqual(snap.state, BattleState.IN_PROGRESS);
  assertEqual(snap.round, 0);
  assertEqual(snap.attackerStacks.length, 1);
  assertEqual(snap.defenderStacks.length, 1);
});

test('BattleEngine: maxRounds formula', () => {
  const s1 = createShipStack({
    id: 's1',
    shipType: 'frigate',
    totalShips: 10,
    position: 1,
    faction: 'attacker',
    weapons: [],
  });
  const s2 = createShipStack({
    id: 's2',
    shipType: 'frigate',
    totalShips: 10,
    position: 2,
    faction: 'attacker',
    weapons: [],
  });
  const s3 = createShipStack({
    id: 's3',
    shipType: 'frigate',
    totalShips: 10,
    position: 13,
    faction: 'defender',
    weapons: [],
  });

  const engine = createBattleEngine({
    attackerStacks: [s1, s2],
    defenderStacks: [s3],
  });

  // Math.min(20 + 2 + 1, 99) = 23
  assertEqual(engine.getMaxRounds(), 23);
});

test('BattleEngine: maxRounds capped at 99', () => {
  const stacks: ShipStack[] = [];
  for (let i = 0; i < 50; i++) {
    stacks.push(
      createShipStack({
        id: `s${i}`,
        shipType: 'frigate',
        totalShips: 10,
        position: i + 1,
        faction: 'attacker',
        weapons: [],
      })
    );
  }

  const engine = createBattleEngine({
    attackerStacks: stacks,
    defenderStacks: stacks,
  });

  assertEqual(engine.getMaxRounds(), 99);
});

test('BattleEngine: isBattleOver returns false at start', () => {
  const s = createShipStack({
    id: 's',
    shipType: 'frigate',
    totalShips: 10,
    position: 1,
    faction: 'attacker',
    weapons: [],
  });

  const engine = createBattleEngine({
    attackerStacks: [s],
    defenderStacks: [{ ...s, id: 'd', faction: 'defender', position: 13 }],
  });

  assertFalse(engine.isBattleOver());
});

// ============================================================================
// TESTS: Effective Stack
// ============================================================================

test('EffectiveStack: frigate base is 1100', () => {
  const stack = createShipStack({
    id: 'es1',
    shipType: 'frigate',
    totalShips: 2000,
    position: 1,
    faction: 'attacker',
  });
  assertEqual(getEffectiveStack(stack), 1100);
});

test('EffectiveStack: cruiser base is 1000', () => {
  const stack = createShipStack({
    id: 'es2',
    shipType: 'cruiser',
    totalShips: 2000,
    position: 1,
    faction: 'attacker',
  });
  assertEqual(getEffectiveStack(stack), 1000);
});

test('EffectiveStack: battleship base is 900', () => {
  const stack = createShipStack({
    id: 'es3',
    shipType: 'battleship',
    totalShips: 2000,
    position: 1,
    faction: 'attacker',
  });
  assertEqual(getEffectiveStack(stack), 900);
});

test('EffectiveStack: commander bonus increases effective', () => {
  const stack = createShipStack({
    id: 'es4',
    shipType: 'frigate',
    totalShips: 2000,
    position: 1,
    faction: 'attacker',
    commander: createCommander({
      id: 'cmd',
      name: 'Test',
      stars: 5,
      accuracy: 50,
      speed: 50,
      dodge: 50,
      electron: 50,
      effectiveStackBonus: 1000,
    }),
  });
  // min(currentShips=2000, base+bonus=2100) = 2000
  assertEqual(getEffectiveStack(stack), 2000);
  assertEqual(getEffectiveStack(stack), 2000);
});

test('EffectiveStack: limited by currentShips', () => {
  const stack = createShipStack({
    id: 'es5',
    shipType: 'frigate',
    totalShips: 500,
    position: 1,
    faction: 'attacker',
  });
  assertEqual(getEffectiveStack(stack), 500); // currentShips < base
});

// ============================================================================
// TESTS: He3 Consumption
// ============================================================================

test('He3: consume reduces fuel', () => {
  const stack = createShipStack({
    id: 'h1',
    shipType: 'frigate',
    totalShips: 10,
    position: 1,
    faction: 'attacker',
    he3: 100,
  });
  const result = consumeHe3(stack, 30);
  assertEqual(result.consumed, 30);
  assertEqual(result.stack.he3, 70);
  assertFalse(result.depleted);
});

test('He3: consume depletes fuel', () => {
  const stack = createShipStack({
    id: 'h2',
    shipType: 'frigate',
    totalShips: 10,
    position: 1,
    faction: 'attacker',
    he3: 20,
  });
  const result = consumeHe3(stack, 50);
  assertEqual(result.consumed, 20);
  assertEqual(result.stack.he3, 0);
  assertTrue(result.depleted);
});

// ============================================================================
// RUN ALL TESTS
// ============================================================================

console.log('='.repeat(60));
console.log('Galaxy Online 3 — BattleEngine Unit Tests');
console.log('='.repeat(60));

const startTime = Date.now();

for (const { name, fn } of tests) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (err) {
    failed++;
    console.error(`  FAIL: ${name}`);
    console.error(`    ${(err as Error).message}`);
  }
}

const elapsed = Date.now() - startTime;

console.log('='.repeat(60));
console.log(`Results: ${passed} passed, ${failed} failed (${tests.length} total)`);
console.log(`Time: ${elapsed}ms`);
console.log('='.repeat(60));

if (failed > 0) {
  process.exit(1);
}