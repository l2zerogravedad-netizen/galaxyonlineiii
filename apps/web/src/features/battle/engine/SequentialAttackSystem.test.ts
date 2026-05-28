/**
 * ============================================================================
 * T E S T S   —   S E Q U E N T I A L   A T T A C K   S Y S T E M
 * ============================================================================
 *
 * Tests exhaustivos para el sistema de ataque secuencial.
 * Ejecutar con: npx tsx SequentialAttackSystem.test.ts
 * ============================================================================
 */

import {
  // Funciones principales
  sortBySpeed,
  gridDistance,
  findTarget,
  createProjectiles,
  updateProjectiles,
  getProjectilePosition,
  applyDamageToSquadron,
  executeAttack,
  createAttackSequence,
  advanceToNextSquadron,
  removeDeadSquadrons,
  getCurrentAttacker,
  computeAttackOrder,
  getSquadronsByFaction,
  countAliveShips,
  getSquadronTotalHp,
  // Factories
  createTestSquadron,
  createTestWeapon,
  // Clases
  SequentialAttackEngine,
  AttackEventEmitter,
  // Constantes
  WEAPON_RANGE,
  PROJECTILE_SPEED,
  PHASE_DURATIONS,
  CRIT_MULTIPLIER,
  // Tipos
  type Squadron,
  type Weapon,
  type AttackEvent,
} from './SequentialAttackSystem';

// =============================================================================
// UTILIDAD DE TESTING
// =============================================================================

let testsPassed = 0;
let testsFailed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    testsPassed++;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`  ❌ ${name}`);
    console.log(`     Error: ${message}`);
    testsFailed++;
  }
}

function assertEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(
      message ??
      `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

function assertTrue(value: boolean, message?: string): void {
  if (!value) {
    throw new Error(message ?? `Expected true, got ${value}`);
  }
}

function assertFalse(value: boolean, message?: string): void {
  if (value) {
    throw new Error(message ?? `Expected false, got ${value}`);
  }
}

function assertGreaterThan(actual: number, expected: number, message?: string): void {
  if (!(actual > expected)) {
    throw new Error(message ?? `Expected ${actual} > ${expected}`);
  }
}

function assertLessThanOrEqual(actual: number, expected: number, message?: string): void {
  if (actual > expected) {
    throw new Error(message ?? `Expected ${actual} <= ${expected}`);
  }
}

function assertArrayLength<T>(arr: T[], length: number, message?: string): void {
  if (arr.length !== length) {
    throw new Error(message ?? `Expected array length ${length}, got ${arr.length}`);
  }
}

// =============================================================================
// TEST SUITE
// =============================================================================

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  SEQUENTIAL ATTACK SYSTEM — TEST SUITE');
console.log('═══════════════════════════════════════════════════════════════\n');

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: sortBySpeed
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n📦 SUITE 1: sortBySpeed — Orden de ataque por velocidad');

test('ordena por speed descendente (mayor primero)', () => {
  const s1 = createTestSquadron('s1', { commander: { speed: 50 } });
  const s2 = createTestSquadron('s2', { commander: { speed: 200 } });
  const s3 = createTestSquadron('s3', { commander: { speed: 100 } });

  const sorted = sortBySpeed([s1, s2, s3]);

  assertEqual(sorted[0].id, 's2', 's2 (speed 200) debería ser primero');
  assertEqual(sorted[1].id, 's3', 's3 (speed 100) debería ser segundo');
  assertEqual(sorted[2].id, 's1', 's1 (speed 50) debería ser tercero');
});

test('no modifica el array original', () => {
  const s1 = createTestSquadron('s1', { commander: { speed: 100 } });
  const s2 = createTestSquadron('s2', { commander: { speed: 200 } });
  const original = [s1, s2];

  sortBySpeed(original);

  assertEqual(original[0].id, 's1', 'array original no debe cambiar');
  assertEqual(original[1].id, 's2', 'array original no debe cambiar');
});

test('desempate: atacante va primero si mismo speed', () => {
  const attacker = createTestSquadron('att', { faction: 'attacker', commander: { speed: 100 } });
  const defender = createTestSquadron('def', { faction: 'defender', commander: { speed: 100 } });

  const sorted = sortBySpeed([defender, attacker]);

  assertEqual(sorted[0].id, 'att', 'atacante debería ir primero en desempate');
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: gridDistance
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n📦 SUITE 2: gridDistance — Distancia Manhattan');

test('calcula distancia correctamente (mismo punto)', () => {
  assertEqual(gridDistance({ x: 0, y: 0 }, { x: 0, y: 0 }), 0);
});

test('calcula distancia correctamente (adyacente)', () => {
  assertEqual(gridDistance({ x: 0, y: 0 }, { x: 1, y: 0 }), 1);
  assertEqual(gridDistance({ x: 0, y: 0 }, { x: 0, y: 1 }), 1);
});

test('calcula distancia correctamente (diagonal)', () => {
  assertEqual(gridDistance({ x: 0, y: 0 }, { x: 3, y: 4 }), 7);
  assertEqual(gridDistance({ x: 1, y: 2 }, { x: 4, y: 6 }), 7);
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3: findTarget
// ─────────────────────────────────────────────────────────────────────────────

test('encuentra objetivo en rango con menos HP', () => {
  const attacker = createTestSquadron('att', {
    position: { x: 0, y: 0 },
    faction: 'attacker',
  });

  const weakTarget = createTestSquadron('weak', {
    position: { x: 1, y: 0 },
    faction: 'defender',
    shipCount: 1,
  });
  weakTarget.ships[0].hull = 100;
  weakTarget.ships[0].shield = 0;

  const strongTarget = createTestSquadron('strong', {
    position: { x: 1, y: 0 },
    faction: 'defender',
    shipCount: 1,
  });
  strongTarget.ships[0].hull = 1000;
  strongTarget.ships[0].shield = 500;

  const target = findTarget(attacker, [strongTarget, weakTarget], 'ballistic');

  assertEqual(target?.id, 'weak', 'debería elegir el objetivo más débil');
});

test('no encuentra objetivo si todos están muertos', () => {
  const attacker = createTestSquadron('att', {
    position: { x: 0, y: 0 },
    faction: 'attacker',
  });

  const dead = createTestSquadron('dead', {
    position: { x: 1, y: 0 },
    faction: 'defender',
    shipCount: 1,
  });
  dead.ships[0].isAlive = false;
  dead.ships[0].hull = 0;

  const target = findTarget(attacker, [dead], 'ballistic');

  assertEqual(target, null, 'no debería encontrar objetivo muerto');
});

test('respeta el rango del arma — ballistic=2', () => {
  const attacker = createTestSquadron('att', {
    position: { x: 0, y: 0 },
    faction: 'attacker',
  });

  const inRange = createTestSquadron('inRange', {
    position: { x: 2, y: 0 }, // distancia = 2, dentro del rango
    faction: 'defender',
  });

  const outOfRange = createTestSquadron('outOfRange', {
    position: { x: 5, y: 0 }, // distancia = 5, fuera de rango
    faction: 'defender',
  });

  const target = findTarget(attacker, [outOfRange, inRange], 'ballistic');

  assertEqual(target?.id, 'inRange', 'debería elegir objetivo en rango');
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 4: createProjectiles
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n📦 SUITE 4: createProjectiles — Generación de proyectiles');

test('crea proyectiles proporcional a naves vivas × hits', () => {
  const attacker = createTestSquadron('att', {
    position: { x: 0, y: 0 },
    shipCount: 3,
  });
  const target = createTestSquadron('tgt', {
    position: { x: 5, y: 5 },
  });
  const weapon = createTestWeapon({ hits: 2, damage: 100, type: 'ballistic' });

  const projectiles = createProjectiles(attacker, target, weapon);

  // 3 naves × 2 hits = 6 proyectiles
  assertEqual(projectiles.length, 6, 'debería crear 3 naves × 2 hits = 6 proyectiles');
});

test('proyectiles tienen posición de origen y destino', () => {
  const attacker = createTestSquadron('att', {
    position: { x: 1, y: 2 },
    shipCount: 1,
  });
  const target = createTestSquadron('tgt', {
    position: { x: 5, y: 5 },
  });
  const weapon = createTestWeapon({ type: 'missile' });

  const projectiles = createProjectiles(attacker, target, weapon);

  assertGreaterThan(projectiles[0].fromX, 0, 'fromX debería estar cerca del atacante');
  assertGreaterThan(projectiles[0].toX, 4, 'toX debería estar cerca del objetivo');
  assertEqual(projectiles[0].progress, 0, 'progreso inicial debe ser 0');
  assertEqual(projectiles[0].weaponType, 'missile', 'tipo de arma correcto');
});

test('proyectiles con crítico se marcan correctamente', () => {
  const attacker = createTestSquadron('att', {
    position: { x: 0, y: 0 },
    commander: { critRate: 1.0 }, // 100% crítico
    shipCount: 10,
  });
  const target = createTestSquadron('tgt', {
    position: { x: 5, y: 5 },
  });
  const weapon = createTestWeapon({ hits: 1 });

  const projectiles = createProjectiles(attacker, target, weapon);

  // Con critRate=1.0, todos deberían ser críticos
  const critCount = projectiles.filter(p => p.isCritical).length;
  assertGreaterThan(critCount, 5, 'con critRate=1.0, la mayoría debería ser crítico');
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 5: updateProjectiles
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n📦 SUITE 5: updateProjectiles — Actualización por frame');

test('proyectil avanza según velocidad y delta time', () => {
  const proj = {
    id: 'test',
    fromX: 0, fromY: 0,
    toX: 10, toY: 0,
    progress: 0,
    speed: 2, // 2 unidades/segundo
    weaponType: 'ballistic' as const,
    damage: 100,
    isCritical: false,
    shipIndex: 0,
  };

  const { active, hits } = updateProjectiles([proj], 0.5); // 0.5 segundos

  assertEqual(hits.length, 0, 'no debería haber impactado todavía');
  assertEqual(active.length, 1, 'debería seguir activo');
  assertEqual(active[0].progress, 1.0, 'progreso debería ser 2 × 0.5 = 1.0');
});

test('proyectil impacta cuando progreso >= 1', () => {
  const proj = {
    id: 'test',
    fromX: 0, fromY: 0,
    toX: 10, toY: 0,
    progress: 0.9,
    speed: 1,
    weaponType: 'ballistic' as const,
    damage: 100,
    isCritical: false,
    shipIndex: 0,
  };

  const { active, hits } = updateProjectiles([proj], 0.2); // avanza 0.2

  assertEqual(active.length, 0, 'no debería quedar activo');
  assertEqual(hits.length, 1, 'debería haber impactado');
  assertEqual(hits[0].damage, 100, 'daño correcto');
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 6: getProjectilePosition
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n📦 SUITE 6: getProjectilePosition — Posición visual');

test('posición inicial (progreso 0)', () => {
  const pos = getProjectilePosition({
    id: 'p', fromX: 0, fromY: 0, toX: 10, toY: 10,
    progress: 0, speed: 1, weaponType: 'ballistic',
    damage: 10, isCritical: false, shipIndex: 0,
  });
  assertEqual(pos.x, 0, 'x inicial');
  assertEqual(pos.y, 0, 'y inicial');
});

test('posición media (progreso 0.5)', () => {
  const pos = getProjectilePosition({
    id: 'p', fromX: 0, fromY: 0, toX: 10, toY: 10,
    progress: 0.5, speed: 1, weaponType: 'ballistic',
    damage: 10, isCritical: false, shipIndex: 0,
  });
  assertEqual(pos.x, 5, 'x media');
  assertEqual(pos.y, 5, 'y media');
});

test('posición final (progreso 1)', () => {
  const pos = getProjectilePosition({
    id: 'p', fromX: 0, fromY: 0, toX: 10, toY: 10,
    progress: 1, speed: 1, weaponType: 'ballistic',
    damage: 10, isCritical: false, shipIndex: 0,
  });
  assertEqual(pos.x, 10, 'x final');
  assertEqual(pos.y, 10, 'y final');
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 7: applyDamageToSquadron
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n📦 SUITE 7: applyDamageToSquadron — Aplicación de daño');

test('daño consume escudo primero', () => {
  const squadron = createTestSquadron('s1', {
    shipCount: 1,
  });
  squadron.ships[0].shield = 500;
  squadron.ships[0].hull = 1000;

  const result = applyDamageToSquadron(squadron, 200);

  assertEqual(result.shieldDamage, 200, 'daño al escudo');
  assertEqual(result.hullDamage, 0, 'sin daño al casco');
  assertEqual(squadron.ships[0].shield, 300, 'escudo reducido');
  assertEqual(squadron.ships[0].hull, 1000, 'casco intacto');
});

test('daño excesivo de escudo va al casco', () => {
  const squadron = createTestSquadron('s1', {
    shipCount: 1,
  });
  squadron.ships[0].shield = 100;
  squadron.ships[0].hull = 1000;

  const result = applyDamageToSquadron(squadron, 300);

  assertEqual(result.shieldDamage, 100, 'todo el escudo destruido');
  assertEqual(result.hullDamage, 200, 'resto al casco');
  assertEqual(squadron.ships[0].shield, 0, 'escudo en 0');
  assertEqual(squadron.ships[0].hull, 800, 'casco dañado');
  assertTrue(result.shieldDepleted, 'escudo debería estar depletado');
});

test('nave muere cuando hull llega a 0', () => {
  const squadron = createTestSquadron('s1', {
    shipCount: 2,
  });
  squadron.ships[0].shield = 0;
  squadron.ships[0].hull = 100;
  squadron.ships[1].shield = 0;
  squadron.ships[1].hull = 1000;

  const result = applyDamageToSquadron(squadron, 500);

  assertEqual(result.shipsDestroyed, 1, 'una nave destruida');
  assertFalse(squadron.ships[0].isAlive, 'nave 0 debería estar muerta');
  assertTrue(squadron.ships[1].isAlive, 'nave 1 debería seguir viva');
});

test('daño se distribuye entre naves vivas', () => {
  const squadron = createTestSquadron('s1', {
    shipCount: 2,
  });
  squadron.ships[0].shield = 0;
  squadron.ships[0].hull = 1000;
  squadron.ships[1].shield = 0;
  squadron.ships[1].hull = 1000;

  const result = applyDamageToSquadron(squadron, 400);

  // 400 / 2 naves = 200 cada una
  assertEqual(result.hullDamage, 400, 'daño total al casco');
  assertEqual(squadron.ships[0].hull, 800, 'nave 0 recibió 200');
  assertEqual(squadron.ships[1].hull, 800, 'nave 1 recibió 200');
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 8: executeAttack
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n📦 SUITE 8: executeAttack — Ataque completo');

test('ataque básico genera proyectiles y aplica daño', () => {
  const attacker = createTestSquadron('att', {
    position: { x: 0, y: 0 },
    shipCount: 1,
  });
  const target = createTestSquadron('tgt', {
    position: { x: 5, y: 0 },
    shipCount: 1,
  });
  target.ships[0].shield = 0;
  target.ships[0].hull = 500;

  const weapon = createTestWeapon({ damage: 100, hits: 1 });
  const result = executeAttack(attacker, target, weapon);

  assertGreaterThan(result.hits, 0, 'debería tener hits');
  assertGreaterThan(result.hullDamage, 0, 'debería hacer daño al casco');
  assertGreaterThan(result.projectiles.length, 0, 'debería generar proyectiles');
});

test('ataque destruye objetivo si daño es suficiente', () => {
  const attacker = createTestSquadron('att', {
    position: { x: 0, y: 0 },
    shipCount: 3,
  });
  const target = createTestSquadron('tgt', {
    position: { x: 5, y: 0 },
    shipCount: 1,
  });
  target.ships[0].shield = 0;
  target.ships[0].hull = 50; // Muy poco HP

  const weapon = createTestWeapon({ damage: 100, hits: 1 });
  const result = executeAttack(attacker, target, weapon);

  assertTrue(result.targetDestroyed, 'objetivo debería estar destruido');
  assertTrue(target.ships.every(s => !s.isAlive), 'todas las naves muertas');
});

test('ataque reporta daño de escudo correctamente', () => {
  const attacker = createTestSquadron('att', {
    position: { x: 0, y: 0 },
    shipCount: 1,
  });
  const target = createTestSquadron('tgt', {
    position: { x: 5, y: 0 },
    shipCount: 1,
  });
  target.ships[0].shield = 200;
  target.ships[0].hull = 1000;

  const weapon = createTestWeapon({ damage: 100, hits: 1 });
  const result = executeAttack(attacker, target, weapon);

  assertGreaterThan(result.shieldDamage, 0, 'debería dañar escudo');
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 9: createAttackSequence
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n📦 SUITE 9: createAttackSequence — Secuencia de ataque');

test('crea secuencia ordenada por speed', () => {
  const s1 = createTestSquadron('s1', { commander: { speed: 50 } });
  const s2 = createTestSquadron('s2', { commander: { speed: 200 } });
  const s3 = createTestSquadron('s3', { commander: { speed: 100 } });

  const seq = createAttackSequence([s1, s2, s3]);

  assertEqual(seq.squadrons[0].id, 's2');
  assertEqual(seq.squadrons[1].id, 's3');
  assertEqual(seq.squadrons[2].id, 's1');
  assertEqual(seq.state, 'idle');
  assertEqual(seq.currentIndex, 0);
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 10: advanceToNextSquadron
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n📦 SUITE 10: advanceToNextSquadron — Avance de turno');

test('avanza al siguiente escuadrón', () => {
  const s1 = createTestSquadron('s1', { commander: { speed: 300 } });
  const s2 = createTestSquadron('s2', { commander: { speed: 200 } });

  let seq = createAttackSequence([s1, s2]);
  seq = advanceToNextSquadron(seq);

  assertEqual(seq.currentIndex, 1, 'debería estar en el segundo escuadrón');
});

test('vuelve al inicio al completar todos', () => {
  const s1 = createTestSquadron('s1', { commander: { speed: 300 } });
  const s2 = createTestSquadron('s2', { commander: { speed: 200 } });

  let seq = createAttackSequence([s1, s2]);
  seq = { ...seq, currentIndex: 1 }; // En el último
  seq = advanceToNextSquadron(seq);

  assertEqual(seq.currentIndex, 0, 'debería volver al primero');
  assertEqual(seq.completedCycles, 1, 'debería completar un ciclo');
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 11: removeDeadSquadrons
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n📦 SUITE 11: removeDeadSquadrons — Limpieza de escuadrones muertos');

test('elimina escuadrones con todas las naves muertas', () => {
  const alive = createTestSquadron('alive', { commander: { speed: 300 } });
  const dead = createTestSquadron('dead', { commander: { speed: 200 } });
  dead.ships.forEach(s => { s.isAlive = false; s.hull = 0; });

  let seq = createAttackSequence([alive, dead]);
  seq = removeDeadSquadrons(seq);

  assertEqual(seq.squadrons.length, 1, 'debería quedar solo 1 escuadrón');
  assertEqual(seq.squadrons[0].id, 'alive');
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 12: computeAttackOrder
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n📦 SUITE 12: computeAttackOrder — Números de orden');

test('asigna números 1-based correctamente', () => {
  const s1 = createTestSquadron('s1', { commander: { speed: 50 } });
  const s2 = createTestSquadron('s2', { commander: { speed: 200 } });
  const s3 = createTestSquadron('s3', { commander: { speed: 100 } });

  const order = computeAttackOrder([s1, s2, s3]);

  assertEqual(order.get('s2'), 1, 's2 (más rápido) = #1');
  assertEqual(order.get('s3'), 2, 's3 = #2');
  assertEqual(order.get('s1'), 3, 's1 (más lento) = #3');
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 13: SequentialAttackEngine
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n📦 SUITE 13: SequentialAttackEngine — Motor principal');

test('engine inicializa correctamente', () => {
  const s1 = createTestSquadron('s1', { commander: { speed: 100 } });
  const s2 = createTestSquadron('s2', { faction: 'defender', commander: { speed: 50 } });

  const engine = new SequentialAttackEngine([s1, s2]);

  assertEqual(engine.getCurrentTurnNumber(), 1, 'turno inicial = 1');
  assertFalse(engine.isBattleOver(), 'batalla no debería estar terminada');
});

test('engine emite eventos al iniciar', () => {
  const s1 = createTestSquadron('s1', {
    commander: { speed: 100, name: 'Zhang' },
    faction: 'attacker',
  });
  const s2 = createTestSquadron('s2', {
    faction: 'defender',
    commander: { speed: 50 },
    position: { x: 2, y: 0 },
  });

  const engine = new SequentialAttackEngine([s1, s2]);
  const events: AttackEvent[] = [];

  engine.onEvent((e) => events.push(e));
  engine.start();

  // Simular el paso del tiempo para completar fases
  // highlighting dura 300ms
  engine.update(300); // highlighting completo

  const turnStart = events.find(e => e.type === 'TURN_START');
  const highlight = events.find(e => e.type === 'SQUADRON_HIGHLIGHT');

  assertTrue(!!turnStart, 'debería emitir TURN_START');
  assertTrue(!!highlight, 'debería emitir SQUADRON_HIGHLIGHT');

  if (turnStart && turnStart.type === 'TURN_START') {
    assertEqual(turnStart.commanderName, 'Zhang', 'nombre del comandante');
    assertEqual(turnStart.squadronId, 's1', 'id del escuadrón');
  }
});

test('engine detecta batalla terminada', () => {
  const attacker = createTestSquadron('att', { faction: 'attacker' });
  const defender = createTestSquadron('def', { faction: 'defender' });
  defender.ships.forEach(s => { s.isAlive = false; s.hull = 0; });

  const engine = new SequentialAttackEngine([attacker, defender]);

  assertTrue(engine.isBattleOver(), 'batalla debería estar terminada');
  assertEqual(engine.getWinners(), 'attacker', 'atacante gana');
});

test('engine avanza correctamente por las fases', () => {
  const s1 = createTestSquadron('s1', {
    commander: { speed: 100 },
    faction: 'attacker',
  });
  const s2 = createTestSquadron('s2', {
    faction: 'defender',
    commander: { speed: 50 },
    position: { x: 2, y: 0 },
  });

  const engine = new SequentialAttackEngine([s1, s2]);
  const phaseChanges: string[] = [];

  engine.onEvent((e) => {
    if (e.type === 'PHASE_CHANGED') {
      phaseChanges.push(`${e.from} → ${e.to}`);
    }
  });

  engine.start();

  // Avanzar manualmente por cada fase
  engine.update(300); // highlighting done
  engine.update(100); // selecting_weapon done
  engine.update(100); // firing done

  assertTrue(phaseChanges.length >= 3, `debería haber al menos 3 cambios de fase, hubo ${phaseChanges.length}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 14: Constantes
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n📦 SUITE 14: Constantes del sistema');

test('rangos de arma son correctos', () => {
  assertEqual(WEAPON_RANGE.ballistic, 2);
  assertEqual(WEAPON_RANGE.directional, 5);
  assertEqual(WEAPON_RANGE.missile, 8);
  assertEqual(WEAPON_RANGE.shipBased, 10);
});

test('velocidades de proyectil son positivas', () => {
  for (const [type, speed] of Object.entries(PROJECTILE_SPEED)) {
    assertGreaterThan(speed, 0, `velocidad de ${type} debe ser positiva`);
  }
});

test('duraciones de fase son positivas', () => {
  for (const [phase, duration] of Object.entries(PHASE_DURATIONS)) {
    assertGreaterThan(duration, 0, `duración de ${phase} debe ser positiva`);
  }
});

test('multiplicador de crítico > 1', () => {
  assertGreaterThan(CRIT_MULTIPLIER, 1);
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 15: Utility functions
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n📦 SUITE 15: Utility functions');

test('getSquadronsByFaction filtra correctamente', () => {
  const attackers = [
    createTestSquadron('a1', { faction: 'attacker' }),
    createTestSquadron('a2', { faction: 'attacker' }),
  ];
  const defenders = [
    createTestSquadron('d1', { faction: 'defender' }),
  ];

  const result = getSquadronsByFaction([...attackers, ...defenders], 'attacker');

  assertEqual(result.length, 2);
  assertEqual(result[0].faction, 'attacker');
  assertEqual(result[1].faction, 'attacker');
});

test('countAliveShips cuenta correctamente', () => {
  const sq = createTestSquadron('s1', { shipCount: 3 });
  sq.ships[0].isAlive = false;

  assertEqual(countAliveShips(sq), 2);
});

test('getSquadronTotalHp calcula HP total', () => {
  const sq = createTestSquadron('s1', { shipCount: 2 });
  sq.ships[0].hull = 500;
  sq.ships[0].shield = 100;
  sq.ships[1].hull = 300;
  sq.ships[1].shield = 200;

  const hp = getSquadronTotalHp(sq);

  assertEqual(hp.hull, 800);
  assertEqual(hp.shield, 300);
});

// ─────────────────────────────────────────────────────────────────────────────
// RESUMEN
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`  RESULTADOS: ${testsPassed} passed, ${testsFailed} failed`);
console.log('═══════════════════════════════════════════════════════════════\n');

if (testsFailed > 0) {
  process.exit(1);
}
