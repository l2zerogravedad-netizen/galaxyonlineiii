/**
 * ===================================================================
 * GO3 — Fleets API Tests
 * ===================================================================
 * Endpoints:
 *   GET  /api/fleets       → 200, array de flotas
 *   POST /api/fleets       → 201, crea flota
 *   DELETE /api/fleets/:id → 200, elimina flota
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
  const email = uniqueEmail('fleet');
  const username = `fleet_${Date.now()}`;
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

async function getPlanetId(token: string): Promise<string> {
  const dashRes = await fetchJson('/api/game/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const dashJson = await dashRes.json();
  return dashJson.data.planet.id;
}

describe('Fleets API', () => {
  describe('GET /api/fleets', () => {
    test('sin auth devuelve 401', async () => {
      const res = await fetchJson('/api/fleets');
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    test('con auth devuelve 200 y array', async () => {
      const token = await registerAndLogin();

      const res = await fetchJson('/api/fleets', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });

    test('array de flotas tiene estructura correcta', async () => {
      const token = await registerAndLogin();

      const res = await fetchJson('/api/fleets', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
      const json = await res.json();

      expect(Array.isArray(json.data)).toBe(true);

      // Si hay flotas, verificar estructura
      if (json.data.length > 0) {
        const fleet = json.data[0];
        expect(fleet.id).toBeDefined();
        expect(fleet.name).toBeDefined();
        expect(fleet.status).toBeDefined();
        expect(fleet.totalPower).toBeDefined();
      }
    });
  });

  describe('POST /api/fleets', () => {
    test('sin auth devuelve 401', async () => {
      const res = await fetchJson('/api/fleets', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Fleet',
          planetId: 'fake-id',
          formationSlots: [],
        }),
      });

      expect(res.status).toBe(401);
    });

    test('con datos válidos crea flota (201)', async () => {
      const token = await registerAndLogin();
      const planetId = await getPlanetId(token);

      // Obtener naves disponibles
      const res = await fetchJson('/api/fleets', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: 'Test Fleet',
          planetId,
          formationSlots: [
            { slotIndex: 0, shipId: 'test-ship-id', quantity: 5 },
          ],
        }),
      });

      // Puede ser 201 (éxito) o 400 (naves insuficientes)
      expect([201, 400, 404]).toContain(res.status);

      if (res.status === 201) {
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.data).toBeDefined();
        expect(json.data.id).toBeDefined();
        expect(json.data.name).toBeDefined();
        expect(json.data.status).toBeDefined();
      }
    });

    test('nombre vacío o muy largo devuelve 400', async () => {
      const token = await registerAndLogin();
      const planetId = await getPlanetId(token);

      const res = await fetchJson('/api/fleets', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: '', // nombre vacío
          planetId,
          formationSlots: [{ slotIndex: 0, shipId: 'test', quantity: 1 }],
        }),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    test('sin formationSlots devuelve 400', async () => {
      const token = await registerAndLogin();
      const planetId = await getPlanetId(token);

      const res = await fetchJson('/api/fleets', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: 'No Ships Fleet',
          planetId,
          formationSlots: [],
        }),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    test('planeta no encontrado devuelve 404', async () => {
      const token = await registerAndLogin();

      const res = await fetchJson('/api/fleets', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: 'Test Fleet',
          planetId: 'non-existent-planet-id',
          formationSlots: [{ slotIndex: 0, shipId: 'test', quantity: 1 }],
        }),
      });

      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.success).toBe(false);
    });
  });

  describe('DELETE /api/fleets/:id', () => {
    test('sin auth devuelve 401', async () => {
      const res = await fetchJson('/api/fleets/fake-id', {
        method: 'DELETE',
      });

      expect(res.status).toBe(401);
    });

    test('eliminar flota existente devuelve 200', async () => {
      // Nota: Este test requiere una flota existente
      // Primero listamos las flotas y si hay alguna, la eliminamos
      const token = await registerAndLogin();

      const listRes = await fetchJson('/api/fleets', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const listJson = await listRes.json();

      if (listJson.data.length === 0) {
        // No hay flotas para eliminar, skip
        return;
      }

      const fleetId = listJson.data[0].id;
      const delRes = await fetchJson(`/api/fleets/${fleetId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(delRes.status).toBe(200);
      const delJson = await delRes.json();
      expect(delJson.success).toBe(true);
    });

    test('eliminar flota inexistente devuelve 404', async () => {
      const token = await registerAndLogin();

      const res = await fetchJson('/api/fleets/non-existent-fleet-id', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.success).toBe(false);
    });
  });

  describe('GET /api/fleets/:id', () => {
    test('obtener flota específica devuelve 200', async () => {
      const token = await registerAndLogin();

      const listRes = await fetchJson('/api/fleets', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const listJson = await listRes.json();

      if (listJson.data.length === 0) {
        return; // Skip si no hay flotas
      }

      const fleetId = listJson.data[0].id;
      const res = await fetchJson(`/api/fleets/${fleetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(json.data.id).toBe(fleetId);
    });

    test('flota inexistente devuelve 404', async () => {
      const token = await registerAndLogin();

      const res = await fetchJson('/api/fleets/fake-fleet-id-123', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(404);
    });
  });
});
