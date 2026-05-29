/**
 * ===================================================================
 * GO3 — Missions API Tests
 * ===================================================================
 * Endpoints:
 *   GET /api/missions  → 200, array con al menos 4 misiones
 * Verificaciones:
 *   - Cada misión tiene name, description, difficulty, rewardXp
 *   - Las misiones están ordenadas por difficulty ascendente
 *   - Cada misión tiene playerStatus (AVAILABLE, IN_PROGRESS, COMPLETED)
 * ===================================================================
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

let testCounter = 0;
function uniqueEmail(prefix = 'test'): string {
  testCounter++;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}@go3.test`;
}

function fetchJson(path: string, init?: RequestInit) {
  return fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
}

async function registerAndLogin(): Promise<string> {
  const email = uniqueEmail('missions');
  const username = `missions_${Date.now()}`;
  const password = 'test123456';

  const res = await fetchJson('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, username }),
  });

  if (res.status !== 201) {
    throw new Error(`Register failed: ${res.status}`);
  }

  const json = await res.json();
  return json.data.token;
}

describe('Missions API', () => {
  describe('GET /api/missions', () => {
    test('sin auth devuelve 401', async () => {
      const res = await fetchJson('/api/missions');
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    test('con auth devuelve 200 y array', async () => {
      const token = await registerAndLogin();

      const res = await fetchJson('/api/missions', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });

    test('devuelve al menos 4 misiones', async () => {
      const token = await registerAndLogin();

      const res = await fetchJson('/api/missions', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
      const json = await res.json();

      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data.length).toBeGreaterThanOrEqual(4);
    });

    test('cada misión tiene las propiedades requeridas', async () => {
      const token = await registerAndLogin();

      const res = await fetchJson('/api/missions', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
      const json = await res.json();

      for (const mission of json.data) {
        expect(mission.id).toBeDefined();
        expect(typeof mission.id).toBe('string');

        expect(mission.name).toBeDefined();
        expect(typeof mission.name).toBe('string');
        expect(mission.name.length).toBeGreaterThan(0);

        expect(mission.description).toBeDefined();
        expect(typeof mission.description).toBe('string');

        expect(mission.difficulty).toBeDefined();
        expect(typeof mission.difficulty).toBe('number');
        expect(mission.difficulty).toBeGreaterThanOrEqual(1);

        expect(mission.durationSeconds).toBeDefined();
        expect(typeof mission.durationSeconds).toBe('number');
        expect(mission.durationSeconds).toBeGreaterThan(0);

        expect(mission.rewardXp).toBeDefined();
        expect(typeof mission.rewardXp).toBe('number');
        expect(mission.rewardXp).toBeGreaterThanOrEqual(0);

        expect(mission.rewardMetal).toBeDefined();
        expect(typeof mission.rewardMetal).toBe('number');

        expect(mission.rewardPlasma).toBeDefined();
        expect(typeof mission.rewardPlasma).toBe('number');

        expect(mission.rewardCredits).toBeDefined();
        expect(typeof mission.rewardCredits).toBe('number');
      }
    });

    test('misiones ordenadas por difficulty ascendente', async () => {
      const token = await registerAndLogin();

      const res = await fetchJson('/api/missions', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
      const json = await res.json();

      if (json.data.length >= 2) {
        for (let i = 0; i < json.data.length - 1; i++) {
          expect(json.data[i].difficulty).toBeLessThanOrEqual(
            json.data[i + 1].difficulty
          );
        }
      }
    });

    test('cada misión tiene playerStatus', async () => {
      const token = await registerAndLogin();

      const res = await fetchJson('/api/missions', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
      const json = await res.json();

      for (const mission of json.data) {
        expect(mission.playerStatus).toBeDefined();
        expect(['AVAILABLE', 'IN_PROGRESS', 'COMPLETED']).toContain(
          mission.playerStatus
        );
      }
    });

    test('misiones tienen configuración de enemigos', async () => {
      const token = await registerAndLogin();

      const res = await fetchJson('/api/missions', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
      const json = await res.json();

      for (const mission of json.data) {
        expect(mission.enemyFleetConfig).toBeDefined();
        // Puede ser string JSON o ya parseado
        expect(mission.minShipsRequired).toBeDefined();
        expect(typeof mission.minShipsRequired).toBe('number');
        expect(mission.minShipsRequired).toBeGreaterThanOrEqual(0);

        expect(mission.recommendedPower).toBeDefined();
        expect(typeof mission.recommendedPower).toBe('number');
        expect(mission.recommendedPower).toBeGreaterThanOrEqual(0);
      }
    });

    test('token inválido devuelve 401', async () => {
      const res = await fetchJson('/api/missions', {
        headers: { Authorization: 'Bearer invalid-token' },
      });

      expect(res.status).toBe(401);
    });
  });
});
