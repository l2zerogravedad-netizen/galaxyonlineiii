import axios from 'axios';
import '@/lib/apiBase';

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface FormationSlotPayload {
  slotIndex: number;
  shipId: string;
  quantity: number;
}

export interface FleetData {
  id: string;
  name: string;
  planetId: string;
  commanderId?: string;
  formationSlots: FormationSlotPayload[];
  unlocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** GET /api/fleets — List all fleets for the current player */
export async function getFleets(): Promise<FleetData[]> {
  const { data } = await axios.get('/api/fleets', { headers: authHeaders() });
  return data.data ?? data;
}

/** POST /api/fleets — Create a new fleet */
export async function createFleet(
  name: string,
  planetId: string,
  formationSlots: FormationSlotPayload[]
): Promise<FleetData> {
  const { data } = await axios.post(
    '/api/fleets',
    { name, planetId, formationSlots },
    { headers: authHeaders() }
  );
  return data.data ?? data;
}

/** GET /api/fleets/:id — Get a single fleet by ID */
export async function getFleet(id: string): Promise<FleetData> {
  const { data } = await axios.get(`/api/fleets/${id}`, { headers: authHeaders() });
  return data.data ?? data;
}

/** DELETE /api/fleets/:id — Delete a fleet */
export async function deleteFleet(id: string): Promise<FleetData> {
  const { data } = await axios.delete(`/api/fleets/${id}`, { headers: authHeaders() });
  return data.data ?? data;
}
