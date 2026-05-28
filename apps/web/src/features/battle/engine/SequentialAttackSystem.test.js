/**
 * ============================================================================
 * T E S T S   —   S E Q U E N T I A L   A T T A C K   S Y S T E M
 * ============================================================================
 *
 * Tests exhaustivos para el sistema de ataque secuencial.
 * Ejecutar con: node SequentialAttackSystem.test.js
 * ============================================================================
 */

const {
  sortBySpeed, gridDistance, findTarget, createProjectiles,
  updateProjectiles, getProjectilePosition, applyDamageToSquadron,
  executeAttack, createAttackSequence, advanceToNextSquadron,
  removeDeadSquadrons, getCurrentAttacker, computeAttackOrder,
  getSquadronsByFaction, countAliveShips, getSquadronTotalHp,
  createTestSquadron, createTestWeapon,
  SequentialAttackEngine, AttackEventEmitter,
  WEAPON_RANGE, PROJECTILE_SPEED, PHASE_DURATIONS, CRIT_MULTIPLIER,
} = require('./SequentialAttackSystem');

// =============================================================================
// UTILIDAD DE TESTING
// =============================================================================

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS  ${name}`);
    testsPassed++;
  } catch (err) {
    console.log(`  FAIL  ${name}`);
    console.log(`        Error: ${err.message}`);
    testsFailed++;
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertTrue(value, message) {
  if (!value) throw new Error(message || `Expected true, got ${value}`);
}

function assertFalse(value, message) {
  if (value) throw new Error(message || `Expected false, got ${value}`);
}

function assertGreaterThan(actual, expected, message) {
  if (!(actual > expected)) throw new Error(message || `Expected ${actual} > ${expected}`);
}

function assertArrayLength(arr, length, message) {
  if (arr.length !== length) throw new Error(message || `Expected length ${length}, got ${arr.length}`);
}

// =============================================================================
// TEST SUITE
// =============================================================================

console.log('\n===============================================================');
console.log('  SEQUENTIAL ATTACK SYSTEM - TEST SUITE');
console.log('===============================================================\n');

// SUITE 1: sortBySpeed
console.log('\n[SUITE 1] sortBySpeed - Orden de ataque por velocidad');

test('ordena por speed descendente (mayor primero)', () => {
  const s1 = createTestSquadron('s1', { commander: { speed: 50 } });
  const s2 = createTestSquadron('s2', { commander: { speed: 200 } });
  const s3 = createTestSquadron('s3', { commander: { speed: 100 } });
  const sorted = sortBySpeed([s1, s2, s3]);
  assertEqual(sorted[0].id, 's2', 's2 (speed 200) primero');
  assertEqual(sorted[1].id, 's3', 's3 (speed 100) segundo');
  assertEqual(sorted[2].id, 's1', 's1 (speed 50) tercero');
});

test('no modifica array original', () => {
  const s1 = createTestSquadron('s1', { commander: { speed: 100 } });
  const s2 = createTestSquadron('s2', { commander: { speed: 200 } });
  const original = [s1, s2];
  sortBySpeed(original);
  assertEqual(original[0].id, 's1');
  assertEqual(original[1].id, 's2');
});

test('desempate: atacante va primero si mismo speed', () => {
  const attacker = createTestSquadron('att', { faction: 'attacker', commander: { speed: 100 } });
  const defender = createTestSquadron('def', { faction: 'defender', commander: { speed: 100 } });
  const sorted = sortBySpeed([defender, attacker]);
  assertEqual(sorted[0].id, 'att');
});

// SUITE 2: gridDistance
console.log('\n[SUITE 2] gridDistance - Distancia Manhattan');

test('distancia cero en mismo punto', () => {
  assertEqual(gridDistance({ x: 0, y: 0 }, { x: 0, y: 0 }), 0);
});

test('distancia adyacente', () => {
  assertEqual(gridDistance({ x: 0, y: 0 }, { x: 1, y: 0 }), 1);
  assertEqual(gridDistance({ x: 0, y: 0 }, { x: 0, y: 1 }), 1);
});

test('distancia diagonal', () => {
  assertEqual(gridDistance({ x: 0, y: 0 }, { x: 3, y: 4 }), 7);
});

// SUITE 3: findTarget
console.log('\n[SUITE 3] findTarget - Seleccion de objetivo');

test('encuentra objetivo en rango con menos HP', () => {
  const attacker = createTestSquadron('att', { position: { x: 0, y: 0 }, faction: 'attacker' });
  const weak = createTestSquadron('weak', { position: { x: 1, y: 0 }, faction: 'defender', shipCount: 1 });
  weak.ships[0].hull = 100; weak.ships[0].shield = 0;
  const strong = createTestSquadron('strong', { position: { x: 1, y: 0 }, faction: 'defender', shipCount: 1 });
  strong.ships[0].hull = 1000; strong.ships[0].shield = 500;
  const target = findTarget(attacker, [strong, weak], 'ballistic');
  assertEqual(target.id, 'weak');
});

test('no encuentra objetivo si todos muertos', () => {
  const attacker = createTestSquadron('att', { position: { x: 0, y: 0 }, faction: 'attacker' });
  const dead = createTestSquadron('dead', { position: { x: 1, y: 0 }, faction: 'defender', shipCount: 1 });
  dead.ships[0].isAlive = false; dead.ships[0].hull = 0;
  const target = findTarget(attacker, [dead], 'ballistic');
  assertEqual(target, null);
});

test('respeta rango del arma - ballistic=2', () => {
  const attacker = createTestSquadron('att', { position: { x: 0, y: 0 }, faction: 'attacker' });
  const inRange = createTestSquadron('inRange', { position: { x: 2, y: 0 }, faction: 'defender' });
  const outOfRange = createTestSquadron('outOfRange', { position: { x: 5, y: 0 }, faction: 'defender' });
  const target = findTarget(attacker, [outOfRange, inRange], 'ballistic');
  assertEqual(target.id, 'inRange');
});

// SUITE 4: createProjectiles
console.log('\n[SUITE 4] createProjectiles - Generacion de proyectiles');

test('crea proyectiles = naves * hits', () => {
  const attacker = createTestSquadron('att', { position: { x: 0, y: 0 }, shipCount: 3 });
  const target = createTestSquadron('tgt', { position: { x: 5, y: 5 } });
  const weapon = createTestWeapon({ hits: 2, damage: 100, type: 'ballistic' });
  const projectiles = createProjectiles(attacker, target, weapon);
  assertEqual(projectiles.length, 6, '3 naves * 2 hits = 6');
});

test('proyectiles tienen origen y destino', () => {
  const attacker = createTestSquadron('att', { position: { x: 1, y: 2 }, shipCount: 1 });
  const target = createTestSquadron('tgt', { position: { x: 5, y: 5 } });
  const weapon = createTestWeapon({ type: 'missile' });
  const projectiles = createProjectiles(attacker, target, weapon);
  assertTrue(projectiles[0].fromX !== 0);
  assertTrue(projectiles[0].toX > 4);
  assertEqual(projectiles[0].progress, 0);
  assertEqual(projectiles[0].weaponType, 'missile');
});

// SUITE 5: updateProjectiles
console.log('\n[SUITE 5] updateProjectiles - Actualizacion por frame');

test('proyectil avanza segun velocidad', () => {
  const proj = {
    id: 'test', fromX: 0, fromY: 0, toX: 10, toY: 0,
    progress: 0, speed: 2, weaponType: 'ballistic',
    damage: 100, isCritical: false, shipIndex: 0,
  };
  const { active, hits } = updateProjectiles([proj], 0.3); // dt=0.3s -> progress = 0.6
  assertEqual(hits.length, 0, 'no deberia haber impactado todavia');
  assertEqual(active.length, 1, 'deberia seguir activo');
  assertEqual(active[0].progress, 0.6, 'progreso = speed * dt = 2 * 0.3 = 0.6');
});

test('proyectil impacta al llegar a progreso 1', () => {
  const proj = {
    id: 'test', fromX: 0, fromY: 0, toX: 10, toY: 0,
    progress: 0.9, speed: 1, weaponType: 'ballistic',
    damage: 100, isCritical: false, shipIndex: 0,
  };
  const { active, hits } = updateProjectiles([proj], 0.2);
  assertEqual(active.length, 0);
  assertEqual(hits.length, 1);
  assertEqual(hits[0].damage, 100);
});

// SUITE 6: getProjectilePosition
console.log('\n[SUITE 6] getProjectilePosition - Posicion visual');

test('posicion inicial (progreso 0)', () => {
  const pos = getProjectilePosition({
    id: 'p', fromX: 0, fromY: 0, toX: 10, toY: 10,
    progress: 0, speed: 1, weaponType: 'ballistic',
    damage: 10, isCritical: false, shipIndex: 0,
  });
  assertEqual(pos.x, 0);
  assertEqual(pos.y, 0);
});

test('posicion media (progreso 0.5)', () => {
  const pos = getProjectilePosition({
    id: 'p', fromX: 0, fromY: 0, toX: 10, toY: 10,
    progress: 0.5, speed: 1, weaponType: 'ballistic',
    damage: 10, isCritical: false, shipIndex: 0,
  });
  assertEqual(pos.x, 5);
  assertEqual(pos.y, 5);
});

// SUITE 7: applyDamageToSquadron
console.log('\n[SUITE 7] applyDamageToSquadron - Aplicacion de danio');

test('danio consume escudo primero', () => {
  const sq = createTestSquadron('s1', { shipCount: 1 });
  sq.ships[0].shield = 500; sq.ships[0].hull = 1000;
  const result = applyDamageToSquadron(sq, 200);
  assertEqual(result.shieldDamage, 200);
  assertEqual(result.hullDamage, 0);
  assertEqual(sq.ships[0].shield, 300);
  assertEqual(sq.ships[0].hull, 1000);
});

test('danio excesivo de escudo va al casco', () => {
  const sq = createTestSquadron('s1', { shipCount: 1 });
  sq.ships[0].shield = 100; sq.ships[0].hull = 1000;
  const result = applyDamageToSquadron(sq, 300);
  assertEqual(result.shieldDamage, 100);
  assertEqual(result.hullDamage, 200);
  assertEqual(sq.ships[0].shield, 0);
  assertEqual(sq.ships[0].hull, 800);
  assertTrue(result.shieldDepleted);
});

test('nave muere cuando hull llega a 0', () => {
  const sq = createTestSquadron('s1', { shipCount: 2 });
  sq.ships[0].shield = 0; sq.ships[0].hull = 100;
  sq.ships[1].shield = 0; sq.ships[1].hull = 1000;
  const result = applyDamageToSquadron(sq, 500);
  assertEqual(result.shipsDestroyed, 1);
  assertFalse(sq.ships[0].isAlive);
  assertTrue(sq.ships[1].isAlive);
});

test('danio se distribuye entre naves vivas', () => {
  const sq = createTestSquadron('s1', { shipCount: 2 });
  sq.ships[0].shield = 0; sq.ships[0].hull = 1000;
  sq.ships[1].shield = 0; sq.ships[1].hull = 1000;
  const result = applyDamageToSquadron(sq, 400);
  assertEqual(result.hullDamage, 400);
  assertEqual(sq.ships[0].hull, 800);
  assertEqual(sq.ships[1].hull, 800);
});

// SUITE 8: executeAttack
console.log('\n[SUITE 8] executeAttack - Ataque completo');

test('ataque basico genera proyectiles y danio', () => {
  const attacker = createTestSquadron('att', { position: { x: 0, y: 0 }, shipCount: 1 });
  const target = createTestSquadron('tgt', { position: { x: 5, y: 0 }, shipCount: 1 });
  target.ships[0].shield = 0; target.ships[0].hull = 500;
  const weapon = createTestWeapon({ damage: 100, hits: 1 });
  const result = executeAttack(attacker, target, weapon);
  assertTrue(result.hits > 0);
  assertTrue(result.hullDamage > 0);
  assertTrue(result.projectiles.length > 0);
});

test('ataque destruye objetivo si danio suficiente', () => {
  const attacker = createTestSquadron('att', { position: { x: 0, y: 0 }, shipCount: 3 });
  const target = createTestSquadron('tgt', { position: { x: 5, y: 0 }, shipCount: 1 });
  target.ships[0].shield = 0; target.ships[0].hull = 50;
  const weapon = createTestWeapon({ damage: 100, hits: 1 });
  const result = executeAttack(attacker, target, weapon);
  assertTrue(result.targetDestroyed);
  assertTrue(target.ships.every(s => !s.isAlive));
});

test('ataque reporta danio de escudo', () => {
  const attacker = createTestSquadron('att', { position: { x: 0, y: 0 }, shipCount: 1 });
  const target = createTestSquadron('tgt', { position: { x: 5, y: 0 }, shipCount: 1 });
  target.ships[0].shield = 200; target.ships[0].hull = 1000;
  const weapon = createTestWeapon({ damage: 100, hits: 1 });
  const result = executeAttack(attacker, target, weapon);
  assertTrue(result.shieldDamage > 0);
});

// SUITE 9: createAttackSequence
console.log('\n[SUITE 9] createAttackSequence');

test('crea secuencia ordenada por speed', () => {
  const s1 = createTestSquadron('s1', { commander: { speed: 50 } });
  const s2 = createTestSquadron('s2', { commander: { speed: 200 } });
  const s3 = createTestSquadron('s3', { commander: { speed: 100 } });
  const seq = createAttackSequence([s1, s2, s3]);
  assertEqual(seq.squadrons[0].id, 's2');
  assertEqual(seq.squadrons[1].id, 's3');
  assertEqual(seq.squadrons[2].id, 's1');
  assertEqual(seq.state, 'idle');
});

// SUITE 10: advanceToNextSquadron
console.log('\n[SUITE 10] advanceToNextSquadron');

test('avanza al siguiente escuadron', () => {
  const s1 = createTestSquadron('s1', { commander: { speed: 300 } });
  const s2 = createTestSquadron('s2', { commander: { speed: 200 } });
  let seq = createAttackSequence([s1, s2]);
  seq = advanceToNextSquadron(seq);
  assertEqual(seq.currentIndex, 1);
});

test('vuelve al inicio al completar todos', () => {
  const s1 = createTestSquadron('s1', { commander: { speed: 300 } });
  const s2 = createTestSquadron('s2', { commander: { speed: 200 } });
  let seq = createAttackSequence([s1, s2]);
  seq = { ...seq, currentIndex: 1 };
  seq = advanceToNextSquadron(seq);
  assertEqual(seq.currentIndex, 0);
  assertEqual(seq.completedCycles, 1);
});

// SUITE 11: removeDeadSquadrons
console.log('\n[SUITE 11] removeDeadSquadrons');

test('elimina escuadrones muertos', () => {
  const alive = createTestSquadron('alive', { commander: { speed: 300 } });
  const dead = createTestSquadron('dead', { commander: { speed: 200 } });
  dead.ships.forEach(s => { s.isAlive = false; s.hull = 0; });
  let seq = createAttackSequence([alive, dead]);
  seq = removeDeadSquadrons(seq);
  assertEqual(seq.squadrons.length, 1);
  assertEqual(seq.squadrons[0].id, 'alive');
});

// SUITE 12: computeAttackOrder
console.log('\n[SUITE 12] computeAttackOrder');

test('asigna numeros 1-based correctamente', () => {
  const s1 = createTestSquadron('s1', { commander: { speed: 50 } });
  const s2 = createTestSquadron('s2', { commander: { speed: 200 } });
  const s3 = createTestSquadron('s3', { commander: { speed: 100 } });
  const order = computeAttackOrder([s1, s2, s3]);
  assertEqual(order.get('s2'), 1);
  assertEqual(order.get('s3'), 2);
  assertEqual(order.get('s1'), 3);
});

// SUITE 13: SequentialAttackEngine
console.log('\n[SUITE 13] SequentialAttackEngine - Motor principal');

test('engine inicializa correctamente', () => {
  const s1 = createTestSquadron('s1', { commander: { speed: 100 } });
  const s2 = createTestSquadron('s2', { faction: 'defender', commander: { speed: 50 } });
  const engine = new SequentialAttackEngine([s1, s2]);
  assertEqual(engine.getCurrentTurnNumber(), 1);
  assertFalse(engine.isBattleOver());
});

test('engine emite eventos al iniciar', () => {
  const s1 = createTestSquadron('s1', { commander: { speed: 100, name: 'Zhang' }, faction: 'attacker' });
  const s2 = createTestSquadron('s2', { faction: 'defender', commander: { speed: 50 }, position: { x: 2, y: 0 } });
  const engine = new SequentialAttackEngine([s1, s2]);
  const events = [];
  engine.onEvent((e) => events.push(e));
  engine.start();
  engine.update(300); // highlighting completo
  const turnStart = events.find(e => e.type === 'TURN_START');
  const highlight = events.find(e => e.type === 'SQUADRON_HIGHLIGHT');
  assertTrue(!!turnStart, 'debe emitir TURN_START');
  assertTrue(!!highlight, 'debe emitir SQUADRON_HIGHLIGHT');
  if (turnStart) assertEqual(turnStart.commanderName, 'Zhang');
});

test('engine detecta batalla terminada', () => {
  const attacker = createTestSquadron('att', { faction: 'attacker' });
  const defender = createTestSquadron('def', { faction: 'defender' });
  defender.ships.forEach(s => { s.isAlive = false; s.hull = 0; });
  const engine = new SequentialAttackEngine([attacker, defender]);
  assertTrue(engine.isBattleOver());
  assertEqual(engine.getWinners(), 'attacker');
});

test('engine avanza por las fases', () => {
  const s1 = createTestSquadron('s1', { commander: { speed: 100 }, faction: 'attacker' });
  const s2 = createTestSquadron('s2', { faction: 'defender', commander: { speed: 50 }, position: { x: 2, y: 0 } });
  const engine = new SequentialAttackEngine([s1, s2]);
  const phaseChanges = [];
  engine.onEvent((e) => { if (e.type === 'PHASE_CHANGED') phaseChanges.push(`${e.from}->${e.to}`); });
  engine.start();
  engine.update(300);
  engine.update(100);
  engine.update(100);
  assertTrue(phaseChanges.length >= 3, `debe haber >=3 cambios, hubo ${phaseChanges.length}`);
});

// SUITE 14: Constantes
console.log('\n[SUITE 14] Constantes del sistema');

test('rangos de arma correctos', () => {
  assertEqual(WEAPON_RANGE.ballistic, 2);
  assertEqual(WEAPON_RANGE.directional, 5);
  assertEqual(WEAPON_RANGE.missile, 8);
  assertEqual(WEAPON_RANGE.shipBased, 10);
});

test('velocidades de proyectil positivas', () => {
  for (const [type, speed] of Object.entries(PROJECTILE_SPEED)) {
    assertTrue(speed > 0, `velocidad ${type} > 0`);
  }
});

test('duraciones de fase positivas', () => {
  for (const [phase, duration] of Object.entries(PHASE_DURATIONS)) {
    assertTrue(duration > 0, `fase ${phase} > 0`);
  }
});

test('multiplicador critico > 1', () => {
  assertTrue(CRIT_MULTIPLIER > 1);
});

// SUITE 15: Utility functions
console.log('\n[SUITE 15] Utility functions');

test('getSquadronsByFaction filtra correctamente', () => {
  const a1 = createTestSquadron('a1', { faction: 'attacker' });
  const a2 = createTestSquadron('a2', { faction: 'attacker' });
  const d1 = createTestSquadron('d1', { faction: 'defender' });
  const result = getSquadronsByFaction([a1, a2, d1], 'attacker');
  assertEqual(result.length, 2);
});

test('countAliveShips cuenta correctamente', () => {
  const sq = createTestSquadron('s1', { shipCount: 3 });
  sq.ships[0].isAlive = false;
  assertEqual(countAliveShips(sq), 2);
});

test('getSquadronTotalHp calcula HP total', () => {
  const sq = createTestSquadron('s1', { shipCount: 2 });
  sq.ships[0].hull = 500; sq.ships[0].shield = 100;
  sq.ships[1].hull = 300; sq.ships[1].shield = 200;
  const hp = getSquadronTotalHp(sq);
  assertEqual(hp.hull, 800);
  assertEqual(hp.shield, 300);
});

// =============================================================================
// RESUMEN
// =============================================================================

console.log('\n===============================================================');
console.log(`  RESULTADOS: ${testsPassed} passed, ${testsFailed} failed`);
console.log('===============================================================\n');

process.exit(testsFailed > 0 ? 1 : 0);
