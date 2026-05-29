/**
 * =======================================================================
 * Galaxy Online 3 — Battle Client
 * =======================================================================
 * Cliente HTTP para consumir la API REST de batallas del backend.
 * Todas las operaciones de batalla (iniciar, simular ronda, guardar
 * resultado, historial) se centralizan aqui.
 *
 * @module lib/game/battleClient
 * =======================================================================
 */

import axios from 'axios';
import { API_BASE_URL } from '@/lib/apiBase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BattleResult {
  id: string;
  attackerId: string;
  defenderId: string;
  attackerFleetId: string;
  winner: 'attacker' | 'defender' | 'draw';
  roundsPlayed: number;
  seed: number;
  status: 'in_progress' | 'finished';
  createdAt: string;
  updatedAt: string;
}

export interface BattleLoss {
  blueprintId: string;
  quantity: number;
}

export interface RoundResult {
  round: number;
  events: Array<Record<string, unknown>>;
  attackerStacks: Array<Record<string, unknown>>;
  defenderStacks: Array<Record<string, unknown>>;
  battleOver: boolean;
  winner: 'attacker' | 'defender' | 'draw' | null;
}

export interface DevSimulateResult {
  battleId: string;
  winner: 'attacker' | 'defender' | 'draw';
  roundsPlayed: number;
  totalDamageAttacker: number;
  totalDamageDefender: number;
  events: Array<Record<string, unknown>>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function authHeaders(): Record<string, string> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

/**
 * Inicia una batalla PvP contra otro jugador.
 * El backend genera un seed RNG y devuelve el battleId.
 */
export async function initiateBattle(
  attackerFleetId: string,
  defenderId: string
): Promise<BattleResult> {
  const { data } = await axios.post(
    `${API_BASE_URL}/api/battles`,
    { attackerFleetId, defenderId },
    { headers: authHeaders() }
  );
  return data.data;
}

/**
 * Simula una ronda especifica de una batalla activa.
 * El backend usa el seed fijado al iniciar para determinismo.
 */
export async function simulateRound(
  battleId: string,
  round: number
): Promise<RoundResult> {
  const { data } = await axios.post(
    `${API_BASE_URL}/api/battles/${battleId}`,
    { round },
    { headers: authHeaders() }
  );
  return data.data;
}

/**
 * Obtiene el estado completo de una batalla por su ID.
 */
export async function getBattleState(battleId: string): Promise<BattleResult> {
  const { data } = await axios.get(
    `${API_BASE_URL}/api/battles/${battleId}`,
    { headers: authHeaders() }
  );
  return data.data;
}

/**
 * Guarda el resultado final de una batalla, incluyendo perdidas.
 * Marca la batalla como 'finished' en el backend.
 */
export async function saveBattleResult(
  battleId: string,
  result: 'WIN' | 'LOSS' | 'DRAW',
  roundsPlayed: number,
  losses: BattleLoss[]
): Promise<{ success: boolean; battle: BattleResult }> {
  const { data } = await axios.post(
    `${API_BASE_URL}/api/battles/${battleId}/result`,
    { result, roundsPlayed, losses },
    { headers: authHeaders() }
  );
  return data.data;
}

/**
 * Endpoint de desarrollo: simula una batalla completa sin auth.
 * Util para testing y balanceo de combate.
 */
export async function devSimulateBattle(
  attackerStacks: unknown[],
  defenderStacks: unknown[]
): Promise<DevSimulateResult> {
  const { data } = await axios.post(
    `${API_BASE_URL}/api/battles/dev-simulate`,
    { attackerStacks, defenderStacks }
  );
  return data.data;
}

/**
 * Lista todas las batallas del jugador autenticado.
 * Devuelve el historial ordenado por fecha descendente.
 */
export async function getBattles(): Promise<BattleResult[]> {
  const { data } = await axios.get(`${API_BASE_URL}/api/battles`, {
    headers: authHeaders(),
  });
  return data.data;
}
