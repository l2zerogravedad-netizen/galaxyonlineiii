/**
 * ===================================================================
 * GO3 — Dashboard API Tests
 * ===================================================================
 * Endpoints:
 *   GET /api/game/dashboard  → sin auth: 401
 *   GET /api/game/dashboard  → con auth: 200, tiene player, resources, planet
 * Verificaciones:
 *   - resources.metal > 0
 *   - Estructura completa del dashboard
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
  const email = uniqueEmail('dashboard');
  const username = `dash_${Date.now()}`;
  const password = 'test123456';

  const res = await fetchJson('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, username }),
  });

  if (res.status !== 201) {
    throw new Error(`Failed to register test user: ${res.status}`);
  }

  const json = await res.json();
  return json.data.token;
}

describe('Dashboard API', () => {
  describe('GET /api/game/dashboard', () => {
    test('sin auth devuelve 401', async () => {
      const res = await fetchJson('/api/game/dashboard');
      expect(res.status).toBe(401);

      const json = await res.json();
      expect(json.success).toBe(false);
    });

    test('con auth devuelve 200 y estructura completa', async () => {
      const token = await registerAndLogin();

      const res = await fetchJson('/api/game/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();

      // Verificar player
      expect(json.data.player).toBeDefined();
      expect(json.data.player.empireId).toBeDefined();
      expect(json.data.player.name).toBeDefined();
      expect(json.data.player.level).toBeDefined();
      expect(json.data.player.xp).toBeDefined();
      expect(json.data.player.xpMax).toBeDefined();
      expect(json.data.player.xpMax).toBeGreaterThan(0);
      expect(json.data.player.level).toBeGreaterThanOrEqual(1);

      // Verificar resources
      expect(json.data.resources).toBeDefined();

      // Buscar metal en resources (puede ser array o objeto)
      let metalValue: number;
      if (Array.isArray(json.data.resources)) {
        const metalResource = json.data.resources.find(
          (r: any) => r.type === 'METAL' || r.resourceType === 'METAL'
        );
        expect(metalResource).toBeDefined();
        metalValue = metalResource.amount ?? metalResource.currentAmount ?? 0;
      } else {
        metalValue = json.data.resources.metal ?? json.data.resources.METAL ?? 0;
      }

      expect(metalValue).toBeGreaterThanOrEqual(0);

      // Verificar planet
      expect(json.data.planet).toBeDefined();
      expect(json.data.planet.id).toBeDefined();
      expect(json.data.planet.name).toBeDefined();
      expect(json.data.planet.type).toBeDefined();
      expect(json.data.planet.maxBuildingSlots).toBeDefined();
      expect(json.data.planet.maxBuildingSlots).toBeGreaterThan(0);

      // Verificar buildings (array)
      expect(json.data.planet.buildings).toBeDefined();
      expect(Array.isArray(json.data.planet.buildings)).toBe(true);
      expect(json.data.planet.buildings.length).toBeGreaterThanOrEqual(0);

      // Verificar constructionQueue
      expect(json.data.constructionQueue).toBeDefined();
    });

    test('resources.metal es mayor a 0 después del registro', async () => {
      const token = await registerAndLogin();

      const res = await fetchJson('/api/game/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
      const json = await res.json();

      // El registro da 10,000 de cada recurso
      let metalValue: number;
      if (Array.isArray(json.data.resources)) {
        const metalResource = json.data.resources.find(
          (r: any) => r.type === 'METAL'
        );
        metalValue = metalResource?.amount ?? 0;
      } else if (json.data.resources && typeof json.data.resources === 'object') {
        // Puede ser { metal: 10000, plasma: 10000, credits: 10000 }
        metalValue = json.data.resources.metal ?? 0;
        // O con mayúsculas
        if (metalValue === 0) {
          metalValue = json.data.resources.METAL ?? 0;
        }
      } else {
        metalValue = 0;
      }

      // Al menos debe tener algunos recursos (el registro da 10,000)
      expect(metalValue).toBeGreaterThan(0);
    });

    test('dashboard incluye edificios iniciales del planeta', async () => {
      const token = await registerAndLogin();

      const res = await fetchJson('/api/game/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
      const json = await res.json();

      const buildings = json.data.planet.buildings;
      expect(Array.isArray(buildings)).toBe(true);

      // El registro crea 6 edificios iniciales:
      // COMMAND_CENTER, METAL_MINE, GAS_EXTRACTOR, CREDIT_MINT, SHIPYARD, RESEARCH_LAB
      expect(buildings.length).toBeGreaterThanOrEqual(1);

      // Verificar que cada edificio tiene la estructura correcta
      for (const building of buildings) {
        expect(building.id).toBeDefined();
        expect(building.type).toBeDefined();
        expect(building.level).toBeDefined();
        expect(building.level).toBeGreaterThanOrEqual(1);
        expect(building.slotIndex).toBeDefined();
      }
    });

    test('token inválido devuelve 401', async () => {
      const res = await fetchJson('/api/game/dashboard', {
        headers: { Authorization: 'Bearer token-invalido-fake' },
      });

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    test('token mal formado devuelve 401', async () => {
      const res = await fetchJson('/api/game/dashboard', {
        headers: { Authorization: 'Basic wrong-format' },
      });

      expect(res.status).toBe(401);
    });
  });
});
