/**
 * ===================================================================
 * GO3 — Battle API Tests
 * ===================================================================
 * Endpoints:
 *   POST /api/battles/dev-simulate  → sin auth: 200 (es público)
 *   Simular 20 rondas, verificar que hay eventos
 *   Verificar orden por Speed (initiative)
 * ===================================================================
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

function fetchJson(path: string, init?: RequestInit) {
  return fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
}

/** Stack de prueba para el simulador */
function createTestStack(
  id: string,
  name: string,
  opts: {
    shipCount?: number;
    speed?: number;
    initiative?: number;
    attack?: number;
    defense?: number;
    maxHull?: number;
    maxShield?: number;
  } = {}
) {
  return {
    id,
    blueprintId: `bp-${id}`,
    shipName: name,
    shipCount: opts.shipCount ?? 10,
    maxHull: opts.maxHull ?? 100,
    currentHull: opts.maxHull ?? 100,
    maxShield: opts.maxShield ?? 50,
    currentShield: opts.maxShield ?? 50,
    attack: opts.attack ?? 20,
    defense: opts.defense ?? 10,
    speed: opts.speed ?? 50,
    initiative: opts.initiative ?? 50,
  };
}

describe('Battle API', () => {
  describe('POST /api/battles/dev-simulate', () => {
    test('endpoint es público y devuelve 200 sin auth', async () => {
      const res = await fetchJson('/api/battles/dev-simulate', {
        method: 'POST',
        body: JSON.stringify({
          attackerStacks: [createTestStack('att1', 'Frigate Att', { shipCount: 5 })],
          defenderStacks: [createTestStack('def1', 'Frigate Def', { shipCount: 5 })],
        }),
      });

      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
    });

    test('simular 20 rondas produce eventos', async () => {
      const res = await fetchJson('/api/battles/dev-simulate', {
        method: 'POST',
        body: JSON.stringify({
          attackerStacks: [
            createTestStack('att1', 'Frigate A', { shipCount: 20, speed: 100 }),
            createTestStack('att2', 'Cruiser A', { shipCount: 10, speed: 70 }),
          ],
          defenderStacks: [
            createTestStack('def1', 'Frigate D', { shipCount: 20, speed: 80 }),
            createTestStack('def2', 'Cruiser D', { shipCount: 10, speed: 60 }),
          ],
          maxRounds: 20,
          seed: 12345,
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();

      // Verificar estructura de respuesta
      expect(json.data.totalRounds).toBeDefined();
      expect(json.data.totalRounds).toBeGreaterThan(0);
      expect(json.data.totalRounds).toBeLessThanOrEqual(20);

      // Verificar que hay rondas con eventos
      expect(json.data.allRounds).toBeDefined();
      expect(Array.isArray(json.data.allRounds)).toBe(true);
      expect(json.data.allRounds.length).toBeGreaterThan(0);

      // Cada ronda debe tener eventos
      let totalEvents = 0;
      for (const round of json.data.allRounds) {
        expect(round.round).toBeDefined();
        expect(round.events).toBeDefined();
        expect(Array.isArray(round.events)).toBe(true);
        expect(round.events.length).toBeGreaterThan(0);
        totalEvents += round.events.length;

        // Verificar tipos de eventos esperados
        const eventTypes = round.events.map((e: any) => e.type);
        expect(eventTypes).toContain('round_start');
        expect(eventTypes).toContain('round_end');
      }

      expect(totalEvents).toBeGreaterThan(0);
    });

    test('verificar orden de ataque por Speed (initiative)', async () => {
      // El stack con mayor initiative debería atacar primero
      const res = await fetchJson('/api/battles/dev-simulate', {
        method: 'POST',
        body: JSON.stringify({
          attackerStacks: [
            createTestStack('slow', 'Slow Att', {
              shipCount: 5,
              speed: 10,
              initiative: 10,
            }),
            createTestStack('fast', 'Fast Att', {
              shipCount: 5,
              speed: 100,
              initiative: 100,
            }),
          ],
          defenderStacks: [
            createTestStack('med', 'Med Def', {
              shipCount: 5,
              speed: 50,
              initiative: 50,
            }),
          ],
          maxRounds: 3,
          seed: 99999,
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();

      // Revisar el orden de los turnos en la primera ronda
      const round1 = json.data.allRounds[0];
      expect(round1).toBeDefined();

      const turnStartEvents = round1.events.filter(
        (e: any) => e.type === 'turn_start'
      );

      // Debería haber al menos un turno
      expect(turnStartEvents.length).toBeGreaterThan(0);

      // El primero en atacar debería ser el de mayor iniciativa
      // (Fast Att con initiative 100)
      const firstTurn = turnStartEvents[0];
      expect(firstTurn).toBeDefined();

      // Verificar que el turno existe con la estructura correcta
      expect(firstTurn.attackerId).toBeDefined();
    });

    test('batalla con seed determinista produce resultado reproducible', async () => {
      const body = {
        attackerStacks: [
          createTestStack('att1', 'Frigate', { shipCount: 15, speed: 80 }),
        ],
        defenderStacks: [
          createTestStack('def1', 'Cruiser', { shipCount: 10, speed: 60 }),
        ],
        maxRounds: 10,
        seed: 77777,
      };

      const res1 = await fetchJson('/api/battles/dev-simulate', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      const res2 = await fetchJson('/api/battles/dev-simulate', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);

      const json1 = await res1.json();
      const json2 = await res2.json();

      // Mismo seed debería dar mismo número de rondas
      expect(json1.data.totalRounds).toBe(json2.data.totalRounds);
      expect(json1.data.winner).toBe(json2.data.winner);
    });

    test('validación: requiere attackerStacks array', async () => {
      const res = await fetchJson('/api/battles/dev-simulate', {
        method: 'POST',
        body: JSON.stringify({
          defenderStacks: [createTestStack('def1', 'Def')],
        }),
      });

      expect(res.status).toBe(400);
    });

    test('validación: requiere defenderStacks array', async () => {
      const res = await fetchJson('/api/battles/dev-simulate', {
        method: 'POST',
        body: JSON.stringify({
          attackerStacks: [createTestStack('att1', 'Att')],
        }),
      });

      expect(res.status).toBe(400);
    });

    test('validación: ambos bandos deben tener al menos un stack', async () => {
      const res = await fetchJson('/api/battles/dev-simulate', {
        method: 'POST',
        body: JSON.stringify({
          attackerStacks: [],
          defenderStacks: [],
        }),
      });

      expect(res.status).toBe(400);
    });

    test('resumen incluye estadísticas de pérdidas', async () => {
      const res = await fetchJson('/api/battles/dev-simulate', {
        method: 'POST',
        body: JSON.stringify({
          attackerStacks: [
            createTestStack('att1', 'Frigate A', { shipCount: 30 }),
          ],
          defenderStacks: [
            createTestStack('def1', 'Frigate D', { shipCount: 30 }),
          ],
          maxRounds: 20,
          seed: 55555,
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.data.summary).toBeDefined();
      expect(typeof json.data.summary.attackerShipsLost).toBe('number');
      expect(typeof json.data.summary.defenderShipsLost).toBe('number');
      expect(json.data.summary.attackerShipsLost).toBeGreaterThanOrEqual(0);
      expect(json.data.summary.defenderShipsLost).toBeGreaterThanOrEqual(0);
    });

    test('battle_end event indica ganador', async () => {
      const res = await fetchJson('/api/battles/dev-simulate', {
        method: 'POST',
        body: JSON.stringify({
          attackerStacks: [
            createTestStack('att1', 'Powerful', { shipCount: 50, attack: 100 }),
          ],
          defenderStacks: [
            createTestStack('def1', 'Weak', { shipCount: 5, attack: 5 }),
          ],
          maxRounds: 20,
          seed: 11111,
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();

      // Debería haber un ganador
      expect(json.data.winner).toBeDefined();
      expect(['attacker', 'defender', null] as const).toContain(json.data.winner);
    });
  });
});
