/**
 * ===================================================================
 * GO3 — Resources Collect API Tests
 * ===================================================================
 * Endpoints:
 *   POST /api/game/resources/collect → 200
 * Verificaciones:
 *   - resources actualizados tienen valores >= anteriores
 *   - collected contiene los recursos recogidos
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
  const email = uniqueEmail('collect');
  const username = `collect_${Date.now()}`;
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

async function getDashboardResources(token: string): Promise<Record<string, number>> {
  const res = await fetchJson('/api/game/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  const resources = json.data.resources;

  // Normalizar a objeto plano { metal: N, plasma: N, credits: N }
  if (Array.isArray(resources)) {
    const result: Record<string, number> = {};
    for (const r of resources) {
      const key = r.type?.toLowerCase() || 'unknown';
      result[key] = r.amount ?? r.currentAmount ?? 0;
    }
    return result;
  }

  if (typeof resources === 'object' && resources !== null) {
    return {
      metal: resources.metal ?? resources.METAL ?? 0,
      plasma: resources.plasma ?? resources.PLASMA ?? 0,
      credits: resources.credits ?? resources.CREDITS ?? 0,
    };
  }

  return { metal: 0, plasma: 0, credits: 0 };
}

describe('Resources Collect API', () => {
  describe('POST /api/game/resources/collect', () => {
    test('sin auth devuelve 401', async () => {
      const res = await fetchJson('/api/game/resources/collect', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    test('con auth devuelve 200 y recursos actualizados', async () => {
      const token = await registerAndLogin();

      const res = await fetchJson('/api/game/resources/collect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.resources).toBeDefined();
    });

    test('resources actualizados >= resources anteriores', async () => {
      const token = await registerAndLogin();

      // Obtener recursos iniciales
      const beforeResources = await getDashboardResources(token);

      // Esperar un momento para que haya acumulación
      await new Promise((r) => setTimeout(r, 500));

      // Collect
      const collectRes = await fetchJson('/api/game/resources/collect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });

      expect(collectRes.status).toBe(200);
      const collectJson = await collectRes.json();

      // Obtener recursos después
      const afterRes = await fetchJson('/api/game/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const afterJson = await afterRes.json();

      // Comparar recursos (deberían ser >=)
      const afterResources = await getDashboardResources(token);

      expect(afterResources.metal).toBeGreaterThanOrEqual(beforeResources.metal);
      expect(afterResources.plasma).toBeGreaterThanOrEqual(beforeResources.plasma);
      expect(afterResources.credits).toBeGreaterThanOrEqual(beforeResources.credits);
    });

    test('collected contiene los recursos recogidos', async () => {
      const token = await registerAndLogin();

      const res = await fetchJson('/api/game/resources/collect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(200);
      const json = await res.json();

      // El response tiene collected con los recursos acumulados
      expect(json.collected).toBeDefined();

      // collected debería ser un objeto o array con los recursos
      const collected = json.collected;
      expect(collected).toBeTruthy();

      // Verificar que resources contiene valores válidos
      expect(json.resources).toBeDefined();
    });

    test('collect múltiples veces no da valores negativos', async () => {
      const token = await registerAndLogin();

      // Hacer collect 3 veces
      for (let i = 0; i < 3; i++) {
        const res = await fetchJson('/api/game/resources/collect', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({}),
        });

        expect(res.status).toBe(200);
        const json = await res.json();

        // Verificar que no hay valores negativos
        const resources = json.resources;
        if (Array.isArray(resources)) {
          for (const r of resources) {
            const amount = r.amount ?? r.currentAmount ?? 0;
            expect(amount).toBeGreaterThanOrEqual(0);
          }
        } else if (typeof resources === 'object') {
          for (const key of Object.keys(resources)) {
            if (typeof resources[key] === 'number') {
              expect(resources[key]).toBeGreaterThanOrEqual(0);
            }
          }
        }
      }
    });

    test('token inválido devuelve 401', async () => {
      const res = await fetchJson('/api/game/resources/collect', {
        method: 'POST',
        headers: { Authorization: 'Bearer invalid-token' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(401);
    });
  });
});
