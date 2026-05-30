import axios from 'axios';
import type { CombatUnit } from './useDestockCombat';

// Entrada del simulador de combate (idéntico a combatSim de GO II).
// Definido localmente: fix-lock @galaxy/shared no expone este tipo.
export interface CombatUnitInput {
  id: string;
  side: 'player' | 'enemy';
  attack: number;
  defense: number;
  hp: number;
  shield: number;
}

export interface CombatSimApiResponse {
  rulesetVersion: string;
  seed: number;
  winner: 'player' | 'enemy' | 'timeout';
  rounds: number;
  playerSurvivors: number;
  enemySurvivors: number;
  log: string[];
}

export function unitsToSimInput(units: CombatUnit[]): CombatUnitInput[] {
  return units.map((u, i) => ({
    id: u.uid || `${u.side}-${i}`,
    side: u.side,
    attack: u.attack,
    defense: u.defense,
    hp: u.maxHp,
    shield: u.maxShield,
  }));
}

export async function simulateCombatViaApi(payload: {
  player: CombatUnit[];
  enemies: CombatUnit[];
  maxRounds: number;
  seed: number;
}): Promise<CombatSimApiResponse | null> {
  try {
    const { data } = await axios.post<CombatSimApiResponse>('/api/combat/simulate', {
      player: unitsToSimInput(payload.player),
      enemy: unitsToSimInput(payload.enemies),
      maxRounds: payload.maxRounds,
      seed: payload.seed,
    });
    return data;
  } catch {
    return null;
  }
}

export function clientOutcomeToWinner(
  phase: 'victory' | 'defeat'
): 'player' | 'enemy' {
  return phase === 'victory' ? 'player' : 'enemy';
}

/** Cliente usa oleadas; API simula todas las fuerzas a la vez — solo exigimos acuerdo de ganador. */
export function apiMatchesClient(
  api: CombatSimApiResponse,
  clientPhase: 'victory' | 'defeat'
): boolean {
  const clientWinner = clientOutcomeToWinner(clientPhase);
  if (api.winner === 'timeout') return clientPhase === 'defeat';
  return api.winner === clientWinner;
}
