'use client';

/**
 * DESTOCK SPACE — central backend client.
 * Calls go through the relative `/api/*` path (same-origin in a merged deploy, or
 * proxied by next.config rewrites to the live API). Every helper is token-gated by
 * the caller via `destockHasToken()`; without a token the screens keep their local
 * mock so guests still see a working UI.
 *
 * Only endpoints that ACTUALLY exist on the deployed backend are wrapped here
 * (verified live, all return `{ success, data }`):
 *  - GET /api/galaxy       → { center, myPlanets[], npcPlanets[] }
 *  - GET /api/alliances    → Alliance[]
 *  - GET /api/leaderboard  → LeaderboardRow[]
 *  - GET /api/fleets       → Fleet[]
 * (No /api/research and no shipyard blueprint-list endpoint exist yet — those
 *  screens stay local until the backend exposes them.)
 */

export function destockHasToken(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return !!localStorage.getItem('token');
  } catch {
    return false;
  }
}

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

/** Unwraps `{ success, data }` envelopes; throws on HTTP or success:false. */
async function unwrap<T>(res: Response): Promise<T> {
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    /* empty/non-json body (e.g. a 404 HTML page) */
  }
  if (!res.ok) {
    const err = (json as { error?: string })?.error;
    throw new Error(err ?? `HTTP ${res.status}`);
  }
  if (json && typeof json === 'object' && 'success' in json) {
    const env = json as { success: boolean; data?: T; error?: string };
    if (env.success === false) throw new Error(env.error ?? 'Request failed');
    return env.data as T;
  }
  return json as T;
}

async function apiGet<T>(path: string): Promise<T> {
  return unwrap<T>(await fetch(path, { headers: authHeaders() }));
}

/* ───────────────────────── Galaxy ───────────────────────── */

export interface ApiGalaxyPlanet {
  id: string;
  name: string;
  type: string;
  galaxyX: number;
  galaxyY: number;
  owner?: string | null;
  difficulty?: number;
}

export interface ApiGalaxy {
  center: { x: number; y: number };
  myPlanets: ApiGalaxyPlanet[];
  npcPlanets: ApiGalaxyPlanet[];
}

export function loadGalaxy(): Promise<ApiGalaxy> {
  return apiGet<ApiGalaxy>('/api/galaxy');
}

/* ───────────────────────── Alliance / Leaderboard ───────────────────────── */

export interface ApiAlliance {
  id: string;
  name: string;
  tag: string;
  level?: number;
  memberCount?: number;
  maxMembers?: number;
  leaderName?: string;
}

export interface ApiLeaderboardRow {
  rank: number;
  empireId: string;
  name: string;
  username?: string;
  level: number;
  experience?: number;
  planets: number;
  fleets?: number;
  score: number;
}

export function loadAlliances(): Promise<ApiAlliance[]> {
  return apiGet<ApiAlliance[]>('/api/alliances');
}

export function loadLeaderboard(): Promise<ApiLeaderboardRow[]> {
  return apiGet<ApiLeaderboardRow[]>('/api/leaderboard');
}

/* ───────────────────────── Fleets ───────────────────────── */

export interface ApiFleet {
  id: string;
  name: string;
  status?: string;
  shipCount?: number;
  power?: number;
}

export function loadFleets(): Promise<ApiFleet[]> {
  return apiGet<ApiFleet[]>('/api/fleets');
}
