import axios from 'axios';
import '@/lib/apiBase';

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface GalaxyPlanetData {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'ice' | 'earth' | 'fire' | 'gas' | 'lava' | 'resource';
  alliance: string;
  allianceTag: string;
  playerName: string;
  level: number;
  buildings: number;
  hasMilitary: boolean;
  hasShield: boolean;
}

export interface GalaxySectorData {
  planets: GalaxyPlanetData[];
  fleets: GalaxyFleetData[];
  centerX: number;
  centerY: number;
  radius: number;
}

export interface GalaxyFleetData {
  id: string;
  name: string;
  x: number;
  y: number;
  commanderName?: string;
  alliance?: string;
  shipCount?: number;
}

export interface PlanetDetailData {
  id: string;
  name: string;
  x: number;
  y: number;
  type: string;
  ownerId?: string;
  ownerName?: string;
  alliance?: string;
  level: number;
  resources?: {
    metal?: number;
    gas?: number;
    energy?: number;
  };
  buildings?: Array<{
    id: string;
    type: string;
    level: number;
  }>;
}

export interface MoveFleetResult {
  fleetId: string;
  targetX: number;
  targetY: number;
  arrivalTime?: string;
  travelTimeSeconds?: number;
}

/** GET /api/galaxy?x=0&y=0&radius=5 — Get galactic sector */
export async function getGalaxySector(
  x: number,
  y: number,
  radius: number = 5
): Promise<GalaxySectorData> {
  const { data } = await axios.get(`/api/galaxy?x=${x}&y=${y}&radius=${radius}`, {
    headers: authHeaders(),
  });
  return data.data ?? data;
}

/** GET /api/galaxy/planets/:id — Get planet details */
export async function getPlanet(planetId: string): Promise<PlanetDetailData> {
  const { data } = await axios.get(`/api/galaxy/planets/${planetId}`, {
    headers: authHeaders(),
  });
  return data.data ?? data;
}

/** POST /api/galaxy/move — Move fleet to coordinates */
export async function moveFleet(
  fleetId: string,
  targetX: number,
  targetY: number
): Promise<MoveFleetResult> {
  const { data } = await axios.post(
    '/api/galaxy/move',
    { fleetId, targetX, targetY },
    { headers: authHeaders() }
  );
  return data.data ?? data;
}
