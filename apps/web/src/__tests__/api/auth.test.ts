/**
 * ===================================================================
 * GO3 — Auth API Tests
 * ===================================================================
 * Endpoints:
 *   POST /api/auth/register → 201, crea usuario + empire, devuelve token
 *   POST /api/auth/login    → 200, devuelve token
 *   POST /api/auth/login    → 401, credenciales malas
 * ===================================================================
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// Helper para generar emails únicos y evitar conflictos entre runs
let testCounter = 0;
function uniqueEmail(prefix = 'test'): string {
  testCounter++;
  const ts = Date.now();
  const rnd = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${ts}-${rnd}@go3.test`;
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

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    test('crea usuario con empire y devuelve token (201)', async () => {
      const email = uniqueEmail('register');
      const username = `tester_${Date.now()}`;
      const password = 'test123456';

      const res = await fetchJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, username }),
      });

      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(json.data.token).toBeDefined();
      expect(typeof json.data.token).toBe('string');
      expect(json.data.token.length).toBeGreaterThan(0);

      // Verificar estructura de respuesta
      expect(json.data.user).toBeDefined();
      expect(json.data.user.id).toBeDefined();
      expect(json.data.user.email).toBe(email);
      expect(json.data.user.username).toBe(username);

      expect(json.data.empire).toBeDefined();
      expect(json.data.empire.id).toBeDefined();
      expect(json.data.empire.name).toContain(username);
    });

    test('rechaza registro sin datos completos (400)', async () => {
      const res = await fetchJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: 'incomplete@test.com' }),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBeDefined();
    });

    test('rechaza usuario duplicado (409)', async () => {
      const email = uniqueEmail('duplicate');
      const username = `dup_${Date.now()}`;
      const password = 'test123456';

      // Primer registro (éxito)
      const res1 = await fetchJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, username }),
      });
      expect(res1.status).toBe(201);

      // Segundo registro con mismo email (conflicto)
      const res2 = await fetchJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password: 'otropass',
          username: `otro_${Date.now()}`,
        }),
      });

      expect(res2.status).toBe(409);
      const json = await res2.json();
      expect(json.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    test('login con credenciales válidas devuelve token (200)', async () => {
      // 1. Crear usuario primero
      const email = uniqueEmail('login');
      const username = `login_${Date.now()}`;
      const password = 'test123456';

      const registerRes = await fetchJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, username }),
      });
      expect(registerRes.status).toBe(201);

      // 2. Hacer login
      const loginRes = await fetchJson('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      expect(loginRes.status).toBe(200);

      const json = await loginRes.json();
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(json.data.token).toBeDefined();
      expect(typeof json.data.token).toBe('string');
      expect(json.data.token.length).toBeGreaterThan(0);

      // Verificar estructura
      expect(json.data.user).toBeDefined();
      expect(json.data.user.email).toBe(email);
      expect(json.data.user.username).toBe(username);
      expect(json.data.empire).toBeDefined();
    });

    test('login con credenciales malas devuelve 401', async () => {
      const res = await fetchJson('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'noexiste@go3.test',
          password: 'wrongpassword',
        }),
      });

      expect(res.status).toBe(401);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBeDefined();
    });

    test('login con password incorrecto devuelve 401', async () => {
      // Crear usuario
      const email = uniqueEmail('wrongpass');
      const username = `wrong_${Date.now()}`;
      const password = 'correctpass';

      const regRes = await fetchJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, username }),
      });
      expect(regRes.status).toBe(201);

      // Login con password incorrecto
      const loginRes = await fetchJson('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: 'wrongpass' }),
      });

      expect(loginRes.status).toBe(401);
      const json = await loginRes.json();
      expect(json.success).toBe(false);
    });

    test('login sin datos devuelve 400', async () => {
      const res = await fetchJson('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });
  });

  describe('Flujo completo: register + login + token', () => {
    test('el token del login funciona para endpoints protegidos', async () => {
      const email = uniqueEmail('e2e');
      const username = `e2e_${Date.now()}`;
      const password = 'test123456';

      // Register
      const regRes = await fetchJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, username }),
      });
      expect(regRes.status).toBe(201);
      const regJson = await regRes.json();
      const token1 = regJson.data.token;

      // Login
      const loginRes = await fetchJson('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      expect(loginRes.status).toBe(200);
      const loginJson = await loginRes.json();
      const token2 = loginJson.data.token;

      // Ambos tokens son válidos
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1.length).toBeGreaterThan(10);
      expect(token2.length).toBeGreaterThan(10);

      // El token funciona para el dashboard
      const dashRes = await fetchJson('/api/game/dashboard', {
        headers: { Authorization: `Bearer ${token2}` },
      });
      expect(dashRes.status).toBe(200);
      const dashJson = await dashRes.json();
      expect(dashJson.success).toBe(true);
      expect(dashJson.data).toBeDefined();
      expect(dashJson.data.player).toBeDefined();
      expect(dashJson.data.resources).toBeDefined();
    });
  });
});
