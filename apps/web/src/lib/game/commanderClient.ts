import axios from 'axios';
import '@/lib/apiBase';

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ApiCommander {
  id: string;
  name: string;
  rarity: string;
  level: number;
  exp: number;
  expMax: number;
  stars: number;
  skill: string;
  skillDescription: string;
  skillAffectedBy: string;
  status: string;
  stats: {
    accuracy: number;
    speed: number;
    dodge: number;
    electron: number;
  };
  growthRates: {
    accuracy: number;
    speed: number;
    dodge: number;
    electron: number;
  };
  equipment: {
    weapons: (ApiEquipmentItem | null)[];
    defense: (ApiEquipmentItem | null)[];
  };
  gems?: (ApiGem | null)[];
  injuryTime?: number;
  isDead?: boolean;
}

export interface ApiEquipmentItem {
  id: string;
  name: string;
  quality: 'S' | 'A' | 'B' | 'C' | 'D';
  icon: string;
}

export interface ApiGem {
  id: string;
  name: string;
  color: string;
  statBonus: Record<string, number>;
}

export interface GetCommandersResponse {
  commanders: ApiCommander[];
}

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

/**
 * Fetch the full list of commanders from the backend.
 * Falls back to null on failure so the UI can use local data.
 */
export async function getCommanders(): Promise<GetCommandersResponse | null> {
  try {
    const { data } = await axios.get<GetCommandersResponse>('/api/commanders', {
      headers: authHeaders(),
    });
    return data ?? null;
  } catch (e) {
    console.warn('[commanderClient] getCommanders failed:', e);
    return null;
  }
}

/**
 * Refresh commanders data with an optional force flag.
 * Same as getCommanders — provided for semantic clarity in the UI.
 */
export async function refreshCommanders(): Promise<GetCommandersResponse | null> {
  return getCommanders();
}
