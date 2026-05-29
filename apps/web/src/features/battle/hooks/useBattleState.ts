/**
 * ========================================================================
 * Galaxy Online 3 — useBattleState Hook
 * ========================================================================
 * Hook principal que conecta el BattleEngine con React.
 * Gestiona el estado completo de la batalla, auto-play, eventos,
 * efectos visuales y seleccion de stacks.
 *
 * @module battle/hooks/useBattleState
 * ========================================================================
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type { BattleEngine } from '../engine';
import { createBattleEngine } from '../engine';
import type {
  BattleEvent,
  BattlePhase,
  ShipStack,
  BattleState,
} from '../engine/types';
import { useBattleEffects } from '../effects/useBattleEffects';
import type { FloatingDamageItem } from '../components/FloatingDamage';
import {
  initiateBattle,
  saveBattleResult,
  getBattles,
  devSimulateBattle,
  simulateRound,
  getBattleState as getBattleStateApi,
} from '@/lib/game/battleClient';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Intervalo base entre steps en ms */
const BASE_STEP_INTERVAL = 800;

/** Maximo de eventos en el log */
const MAX_EVENT_LOG = 100;

/** Maximo de floating damages visibles */
const MAX_FLOATING_DAMAGES = 20;

// ============================================================================
// TYPES
// ============================================================================

export interface UseBattleStateReturn {
  // --- Estado de la batalla ---
  battleState: BattleState;
  currentRound: number;
  maxRounds: number;
  currentPhase: BattlePhase;
  attackerStacks: ShipStack[];
  defenderStacks: ShipStack[];
  events: BattleEvent[];

  // --- Control de reproduccion ---
  isPaused: boolean;
  speed: number;

  // --- Seleccion ---
  selectedStack: string | null;

  // --- Efectos visuales ---
  floatingDamages: FloatingDamageItem[];

  // --- Acciones ---
  initBattle: (attacker: ShipStack[], defender: ShipStack[]) => void;
  step: () => void;
  togglePause: () => void;
  setPlaybackSpeed: (speed: number) => void;
  selectStack: (stackId: string) => void;
  resetBattle: () => void;

  // --- Integracion con Backend ---
  battleId: string | null;
  battleHistory: Array<{
    id: string;
    attackerId: string;
    defenderId: string;
    winner: string;
    roundsPlayed: number;
    status: string;
    createdAt: string;
  }>;
  startBattleWithBackend: (
    attackerFleetId: string,
    defenderId: string
  ) => Promise<{ battleId: string } | null>;
  endBattleWithBackend: (result: 'WIN' | 'LOSS' | 'DRAW') => Promise<void>;
  loadBattleHistory: () => Promise<void>;
  devSimulate: (
    attacker: ShipStack[],
    defender: ShipStack[]
  ) => Promise<unknown>;

  // --- Informacion adicional ---
  winner: 'attacker' | 'defender' | 'draw' | null;
  isBattleOver: boolean;
  totalAttackerShips: number;
  totalDefenderShips: number;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Genera un ID unico para floating damage items.
 */
let _floatingIdCounter = 0;
function nextFloatingId(): string {
  return `fd_${++_floatingIdCounter}_${Date.now()}`;
}

/**
 * Procesa un evento del engine para extraer floating damages.
 */
function extractFloatingDamage(event: BattleEvent): FloatingDamageItem | null {
  switch (event.type) {
    case 'PROJECTILE_HIT':
      return {
        id: nextFloatingId(),
        value: event.damage,
        x: 30 + Math.random() * 40,
        y: 30 + Math.random() * 30,
        isCritical: event.isCritical,
        timestamp: Date.now(),
      };

    case 'HULL_DAMAGE':
      return {
        id: nextFloatingId(),
        value: event.damage,
        x: 25 + Math.random() * 50,
        y: 35 + Math.random() * 25,
        isCritical: false,
        timestamp: Date.now(),
      };

    case 'SHIELD_HIT':
      return {
        id: nextFloatingId(),
        value: event.absorbed,
        x: 20 + Math.random() * 60,
        y: 25 + Math.random() * 35,
        isHeal: true,
        timestamp: Date.now(),
      };

    case 'CRITICAL_HIT':
      return {
        id: nextFloatingId(),
        value: event.damage,
        x: 35 + Math.random() * 30,
        y: 20 + Math.random() * 40,
        isCritical: true,
        timestamp: Date.now(),
      };

    case 'SCATTER_DAMAGE':
      return {
        id: nextFloatingId(),
        value: event.damage,
        x: 15 + Math.random() * 70,
        y: 40 + Math.random() * 30,
        timestamp: Date.now(),
      };

    default:
      return null;
  }
}

// ============================================================================
// HOOK
// ============================================================================

export function useBattleState(): UseBattleStateReturn {
  // --- Engine ref (no dispara re-renders) ---
  const engineRef = useRef<BattleEngine | null>(null);

  // --- Sistema de efectos ---
  const effects = useBattleEffects();

  // --- Estado React ---
  const [battleState, setBattleState] = useState<BattleState>('SETUP');
  const [currentRound, setCurrentRound] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<BattlePhase>('ROUND_START');
  const [maxRounds, setMaxRounds] = useState(25);
  const [attackerStacks, setAttackerStacks] = useState<ShipStack[]>([]);
  const [defenderStacks, setDefenderStacks] = useState<ShipStack[]>([]);
  const [events, setEvents] = useState<BattleEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selectedStack, setSelectedStack] = useState<string | null>(null);
  const [floatingDamages, setFloatingDamages] = useState<FloatingDamageItem[]>([]);
  const [winner, setWinner] = useState<'attacker' | 'defender' | 'draw' | null>(null);

  // --- Backend integration state ---
  const [battleId, setBattleId] = useState<string | null>(null);
  const [battleHistory, setBattleHistory] = useState<
    Array<{
      id: string;
      attackerId: string;
      defenderId: string;
      winner: string;
      roundsPlayed: number;
      status: string;
      createdAt: string;
    }>
  >([]);

  // --- Refs para control de auto-play ---
  const isPausedRef = useRef(isPaused);
  const speedRef = useRef(speed);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Refs para tracking de ships iniciales (perdidas) ---
  const initialAttackerShipsRef = useRef<number>(0);
  const initialDefenderShipsRef = useRef<number>(0);

  // Sincronizar refs con estado
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // --- Sync state from engine ---
  const syncFromEngine = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const snapshot = engine.getSnapshot();
    setBattleState(snapshot.state);
    setCurrentRound(snapshot.round);
    setMaxRounds(snapshot.maxRounds);
    setCurrentPhase(snapshot.phase);
    setAttackerStacks([...snapshot.attackerStacks]);
    setDefenderStacks([...snapshot.defenderStacks]);

    // Check battle end
    if (snapshot.state === 'ATTACKER_WINS') {
      setWinner('attacker');
    } else if (snapshot.state === 'DEFENDER_WINS') {
      setWinner('defender');
    } else if (snapshot.state === 'DRAW') {
      setWinner('draw');
    }
  }, []);

  // --- Process engine event ---
  const handleEngineEvent = useCallback(
    (event: BattleEvent) => {
      // Agregar al log
      setEvents((prev) => {
        const next = [...prev, event];
        return next.length > MAX_EVENT_LOG ? next.slice(-MAX_EVENT_LOG) : next;
      });

      // Extraer floating damage
      const fd = extractFloatingDamage(event);
      if (fd) {
        setFloatingDamages((prev) => {
          const next = [...prev, fd];
          return next.length > MAX_FLOATING_DAMAGES ? next.slice(-MAX_FLOATING_DAMAGES) : next;
        });
      }

      // Procesar efectos visuales
      effects.processEvent(event);

      // Sync estado tras ciertos eventos
      if (
        event.type === 'ROUND_START' ||
        event.type === 'PHASE_CHANGE' ||
        event.type === 'HULL_DAMAGE' ||
        event.type === 'SHIPS_DESTROYED' ||
        event.type === 'STACK_DESTROYED' ||
        event.type === 'BATTLE_END'
      ) {
        syncFromEngine();
      }
    },
    [effects, syncFromEngine]
  );

  // --- initBattle ---
  const initBattle = useCallback(
    (attacker: ShipStack[], defender: ShipStack[]) => {
      // Limpiar interval anterior
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Limpiar estado
      setEvents([]);
      setFloatingDamages([]);
      setSelectedStack(null);
      setWinner(null);
      setIsPaused(true);
      setBattleId(null);

      // Guardar ships iniciales para calcular perdidas
      initialAttackerShipsRef.current = attacker.reduce(
        (sum, s) => sum + s.totalShips,
        0
      );
      initialDefenderShipsRef.current = defender.reduce(
        (sum, s) => sum + s.totalShips,
        0
      );

      // Crear engine
      const engine = createBattleEngine({
        attackerStacks: attacker,
        defenderStacks: defender,
        seed: Math.floor(Math.random() * 100000),
      });

      // Suscribir a eventos
      engine.onEvent(handleEngineEvent);

      // Guardar ref
      engineRef.current = engine;

      // Sync inicial
      syncFromEngine();

      // Auto-start
      setIsPaused(false);
    },
    [handleEngineEvent, syncFromEngine]
  );

  // --- step (avanza una ronda) ---
  const step = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || engine.isBattleOver()) return;

    engine.processRound();
    syncFromEngine();
  }, [syncFromEngine]);

  // --- togglePause ---
  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      const next = !prev;
      isPausedRef.current = next;
      return next;
    });
  }, []);

  // --- setPlaybackSpeed ---
  const setPlaybackSpeed = useCallback((newSpeed: number) => {
    const clamped = Math.max(0.5, Math.min(4, newSpeed));
    setSpeed(clamped);
    speedRef.current = clamped;
  }, []);

  // --- selectStack ---
  const selectStack = useCallback((stackId: string) => {
    setSelectedStack((prev) => (prev === stackId ? null : stackId));
  }, []);

  // --- resetBattle ---
  const resetBattle = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    engineRef.current = null;
    setBattleState('SETUP');
    setCurrentRound(0);
    setCurrentPhase('ROUND_START');
    setMaxRounds(25);
    setAttackerStacks([]);
    setDefenderStacks([]);
    setEvents([]);
    setIsPaused(false);
    setSpeed(1);
    setSelectedStack(null);
    setFloatingDamages([]);
    setWinner(null);
    setBattleId(null);
    initialAttackerShipsRef.current = 0;
    initialDefenderShipsRef.current = 0;
  }, []);

  // ============================================================================
  // BACKEND INTEGRATION
  // ============================================================================

  /**
   * Inicia una batalla en el backend contra otro jugador.
   * Guarda el battleId para operaciones posteriores.
   */
  const startBattleWithBackend = useCallback(
    async (attackerFleetId: string, defenderId: string) => {
      try {
        const result = await initiateBattle(attackerFleetId, defenderId);
        if (result?.id) {
          setBattleId(result.id);
          return { battleId: result.id };
        }
        return null;
      } catch (e) {
        console.warn('[useBattleState] Backend battle init failed:', e);
        return null;
      }
    },
    []
  );

  /**
   * Calcula las perdidas comparando ships iniciales vs actuales.
   */
  const computeLosses = useCallback(() => {
    const losses: Array<{ blueprintId: string; quantity: number }> = [];
    // Para el atacante: recorrer stacks actuales y calcular diferencia
    const currentAttackerIds = new Set(attackerStacks.map((s) => s.id));
    // Nota: Necesitariamos los stacks iniciales para calcular perdidas exactas.
    // Como simplificacion, usamos los stacks actuales del engine.
    attackerStacks.forEach((stack) => {
      if (stack.currentShips < stack.totalShips) {
        losses.push({
          blueprintId: stack.shipType,
          quantity: stack.totalShips - stack.currentShips,
        });
      }
    });
    defenderStacks.forEach((stack) => {
      if (stack.currentShips < stack.totalShips) {
        losses.push({
          blueprintId: stack.shipType,
          quantity: stack.totalShips - stack.currentShips,
        });
      }
    });
    return losses;
  }, [attackerStacks, defenderStacks]);

  /**
   * Guarda el resultado de la batalla en el backend.
   * Solo funciona si hay un battleId activo.
   */
  const endBattleWithBackend = useCallback(
    async (result: 'WIN' | 'LOSS' | 'DRAW') => {
      if (!battleId) {
        console.warn('[useBattleState] No battleId to save result');
        return;
      }
      try {
        const losses = computeLosses();
        await saveBattleResult(battleId, result, currentRound, losses);
        console.log('[useBattleState] Battle result saved:', battleId);
      } catch (e) {
        console.warn('[useBattleState] Failed to save battle result:', e);
      }
    },
    [battleId, currentRound, computeLosses]
  );

  /**
   * Carga el historial de batallas del jugador desde el backend.
   */
  const loadBattleHistory = useCallback(async () => {
    try {
      const battles = await getBattles();
      setBattleHistory(battles || []);
    } catch (e) {
      console.warn('[useBattleState] Failed to load battle history:', e);
      setBattleHistory([]);
    }
  }, []);

  /**
   * Simula una batalla completa via endpoint dev (sin auth).
   * Util para testing y balanceo.
   */
  const devSimulate = useCallback(
    async (attacker: ShipStack[], defender: ShipStack[]) => {
      try {
        const result = await devSimulateBattle(attacker, defender);
        return result;
      } catch (e) {
        console.warn('[useBattleState] Dev simulate failed:', e);
        throw e;
      }
    },
    []
  );

  // --- Cargar historial al montar el hook ---
  useEffect(() => {
    loadBattleHistory();
  }, [loadBattleHistory]);

  // --- Auto-play loop ---
  useEffect(() => {
    // Limpiar interval anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const engine = engineRef.current;
    if (!engine) return;

    // Crear nuevo interval basado en speed
    const intervalMs = BASE_STEP_INTERVAL / speedRef.current;

    intervalRef.current = setInterval(() => {
      if (isPausedRef.current) return;

      const eng = engineRef.current;
      if (!eng || eng.isBattleOver()) {
        // Detener auto-play cuando termina
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsPaused(true);
        isPausedRef.current = true;
        return;
      }

      eng.processRound();
      syncFromEngine();
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [battleState, syncFromEngine]); // Re-crear cuando cambia battleState (engine nuevo)

  // --- Computed values ---
  const isBattleOver =
    battleState === 'ATTACKER_WINS' ||
    battleState === 'DEFENDER_WINS' ||
    battleState === 'DRAW';

  const totalAttackerShips = attackerStacks.reduce(
    (sum, s) => sum + s.currentShips,
    0
  );
  const totalDefenderShips = defenderStacks.reduce(
    (sum, s) => sum + s.currentShips,
    0
  );

  return {
    // --- Estado de la batalla ---
    battleState,
    currentRound,
    maxRounds,
    currentPhase,
    attackerStacks,
    defenderStacks,
    events,
    isPaused,
    speed,
    selectedStack,
    floatingDamages,

    // --- Acciones ---
    initBattle,
    step,
    togglePause,
    setPlaybackSpeed,
    selectStack,
    resetBattle,

    // --- Backend integration ---
    battleId,
    battleHistory,
    startBattleWithBackend,
    endBattleWithBackend,
    loadBattleHistory,
    devSimulate,

    // --- Informacion adicional ---
    winner,
    isBattleOver,
    totalAttackerShips,
    totalDefenderShips,
  };
}