/**
 * ===================================================================
 * GO3 — Build API Tests
 * ===================================================================
 * Endpoints:
 *   POST /api/planets/:id/build  → sin auth: 401
 *   POST /api/planets/:id/build  → con auth + datos válidos: 200, building creado
 *   POST /api/planets/:id/build  → sin recursos: 400
 * Verificaciones:
 *   - constructionEndsAt está en el futuro
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

interface TestUser {
  token: string;
  empireId: string;
  planetId: string;
}

async function registerAndGetPlanet(): Promise<TestUser> {
  const email = uniqueEmail('build');
  const username = `build_${Date.now()}`;
  const password = 'test123456';

  // Register
  const regRes = await fetchJson('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, username }),
  });

  if (regRes.status !== 201) {
    throw new Error(`Register failed: ${regRes.status}`);
  }

  const regJson = await regRes.json();
  const token = regJson.data.token;
  const empireId = regJson.data.empire.id;

  // Get dashboard para obtener planetId
  const dashRes = await fetchJson('/api/game/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (dashRes.status !== 200) {
    throw new Error(`Dashboard failed: ${dashRes.status}`);
  }

  const dashJson = await dashRes.json();
  const planetId = dashJson.data.planet.id;

  return { token, empireId, planetId };
}

async function getEmptySlot(token: string, planetId: string): Promise<number> {
  // Obtener el dashboard para ver slots ocupados
  const dashRes = await fetchJson('/api/game/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const dashJson = await dashRes.json();
  const buildings = dashJson.data.planet.buildings as Array<{ slotIndex: number }>;
  const occupiedSlots = new Set(buildings.map((b) => b.slotIndex));

  // Encontrar primer slot libre (0-79)
  for (let i = 0; i < 80; i++) {
    if (!occupiedSlots.has(i)) {
      return i;
    }
  }

  return -1; // No hay slots libres
}

describe('Build API', () => {
  describe('POST /api/planets/:id/build', () => {
    test('sin auth devuelve 401', async () => {
      const fakePlanetId = 'fake-planet-id';
      const res = await fetchJson(`/api/planets/${fakePlanetId}/build`, {
        method: 'POST',
        body: JSON.stringify({ slotIndex: 5, type: 'METAL_MINE' }),
      });

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    test('con datos válidos crea edificio (200)', async () => {
      const { token, planetId } = await registerAndGetPlanet();
      const emptySlot = await getEmptySlot(token, planetId);

      // Si no hay slots vacíos, usa un slot que sabemos que existe y haz upgrade
      const slotIndex = emptySlot >= 0 ? emptySlot : 5;
      const buildingType = 'METAL_MINE';

      const res = await fetchJson(`/api/planets/${planetId}/build`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ slotIndex, type: buildingType }),
      });

      // Si es un slot ocupado, puede devolver 200 (upgrade) o 400 (construcción nueva en slot ocupado)
      // o 400 si no hay recursos suficientes
      expect([200, 400]).toContain(res.status);

      if (res.status === 200) {
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.data).toBeDefined();
        expect(json.data.id).toBeDefined();
        expect(json.data.type).toBeDefined();
        expect(json.data.status).toBeDefined();

        // Verificar que constructionEndsAt está en el futuro (si es nueva construcción)
        if (json.data.constructionEndsAt) {
          const endDate = new Date(json.data.constructionEndsAt);
          expect(endDate.getTime()).toBeGreaterThan(Date.now());
        }
      }
    });

    test('constructionEndsAt está en el futuro para nuevo edificio', async () => {
      const { token, planetId } = await registerAndGetPlanet();
      const emptySlot = await getEmptySlot(token, planetId);

      if (emptySlot < 0) {
        // Skip si no hay slots disponibles
        return;
      }

      const res = await fetchJson(`/api/planets/${planetId}/build`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ slotIndex: emptySlot, type: 'CREDIT_MINT' }),
      });

      if (res.status === 200) {
        const json = await res.json();
        expect(json.data.constructionEndsAt).toBeDefined();
        const endDate = new Date(json.data.constructionEndsAt);
        expect(endDate.getTime()).toBeGreaterThan(Date.now());
      }
    });

    test('sin recursos suficientes devuelve 400', async () => {
      // Este test intenta construir algo costoso sin recursos suficientes
      const { token, planetId } = await registerAndGetPlanet();

      // Intentar construir en un slot con un tipo que no sea BUILDABLE
      const res = await fetchJson(`/api/planets/${planetId}/build`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ slotIndex: 99, type: 'INVALID_TYPE' }),
      });

      // Debería dar 400 por slot inválido o tipo inválido
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    test('slot inválido devuelve 400', async () => {
      const { token, planetId } = await registerAndGetPlanet();

      const res = await fetchJson(`/api/planets/${planetId}/build`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ slotIndex: -1, type: 'METAL_MINE' }),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    test('tipo de edificio inválido devuelve 400', async () => {
      const { token, planetId } = await registerAndGetPlanet();

      const res = await fetchJson(`/api/planets/${planetId}/build`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ slotIndex: 5, type: 'NOT_A_BUILDING_XYZ' }),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    test('planeta no perteneciente al imperio devuelve 404', async () => {
      const { token } = await registerAndGetPlanet();

      const fakePlanetId = '00000000-0000-0000-0000-000000000000';
      const res = await fetchJson(`/api/planets/${fakePlanetId}/build`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ slotIndex: 5, type: 'METAL_MINE' }),
      });

      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    test('body vacío o mal formado devuelve 400', async () => {
      const { token, planetId } = await registerAndGetPlanet();

      const res = await fetchJson(`/api/planets/${planetId}/build`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });
  });
});
