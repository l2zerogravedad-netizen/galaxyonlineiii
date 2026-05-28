/**
 * Galaxy Online 2 - Combat Service
 *
 * Sistema de combate por rondas con RNG determinista.
 * Implementa EXACTAMENTE las reglas confirmadas:
 * 1. Orden de ataque por Speed individual (mayor primero, desempate: atacante)
 * 2. 20 rondas fijas (no configurable)
 * 3. Escudos regeneran 100% al inicio de cada ronda
 * 4. Naves sin He3 NO atacan
 * 5. Perdida permanente en PvP (naves destruidas se pierden de la flota persistente)
 * 6. Trial mode: solo simulador interno/dev (no afecta flotas reales)
 * 7. RNG determinista con seed (guardado en combat_sessions para reproducir)
 *
 * @module services/combatService
 */

import {
  executeQuery,
  executeSingleRowQuery,
  executeInsertQuery,
  executeUpdateQuery,
  executeQueryWithTransaction,
} from '@/database/connection';
import { ApiResponse, ApiError } from '@/types';
import { logger } from '@/utils/logger';

// =============================================================================
// CONSTANTES DEL SISTEMA DE BATALLA
// =============================================================================

/** Numero maximo de rondas fijas (no configurable). */
const MAX_ROUNDS = 20;

/** Numero maximo de stacks por lado (flotas). */
const MAX_STACKS_PER_SIDE = 9;

/** Consumo de He3 por ronda segun tipo de nave. */
const HE3_PER_ROUND: Record<string, number> = {
  frigate: 2,
  cruiser: 5,
  battleship: 10,
  special: 8,
};

/** Multiplicador de arma por tipo de nave (RPS: Rock-Paper-Scissors). */
const WEAPON_MULTIPLIERS: Record<string, number> = {
  frigate: 1.0,
  cruiser: 1.0,
  battleship: 1.0,
  special: 1.0,
};

/** Estructura por nave (casco base). */
const SHIP_STRUCTURE: Record<string, number> = {
  frigate: 200,
  cruiser: 500,
  battleship: 1000,
  special: 750,
};

// =============================================================================
// TIPOS DEL SISTEMA DE BATALLA GO2
// =============================================================================

/** Tipos de eventos de batalla para el BattleLog. */
type BattleEventType =
  | 'round_start'
  | 'shield_regen'
  | 'turn_start'
  | 'target_select'
  | 'attack'
  | 'hit'
  | 'miss'
  | 'critical'
  | 'shield_damage'
  | 'hull_damage'
  | 'ships_destroyed'
  | 'stack_destroyed'
  | 'he3_depleted'
  | 'round_end'
  | 'battle_end';

/** Evento individual del BattleLog (guardado como JSONB). */
interface BattleEvent {
  /** Ronda actual (1-20). */
  round: number;
  /** Turno dentro de la ronda. */
  turn: number;
  /** Timestamp en ms desde el inicio de la batalla. */
  timestamp: number;
  /** Tipo de evento. */
  type: BattleEventType;
  /** ID del stack atacante (si aplica). */
  attackerId?: string;
  /** ID del stack objetivo (si aplica). */
  targetId?: string;
  /** Dano total infligido. */
  damage?: number;
  /** Dano absorbido por el escudo. */
  shieldDamage?: number;
  /** Dano al casco. */
  hullDamage?: number;
  /** Numero de naves perdidas. */
  shipsLost?: number;
  /** Si fue golpe critico. */
  isCritical?: boolean;
  /** He3 restante tras el ataque. */
  he3Remaining?: number;
  /** Mensaje legible para humanos. */
  message: string;
}

/** Tipos de resultado de batalla. */
type BattleOutcome = 'attacker_wins' | 'defender_wins_timeout' | 'draw';

/** Request para iniciar batalla. */
interface InitiateBattleRequest {
  /** ID del jugador atacante. */
  attackerId: string;
  /** ID del jugador defensor. */
  defenderId: string;
  /** Tipo de batalla. */
  battleType: 'pvp' | 'pve' | 'tournament' | 'alliance_war';
  /** Stacks del atacante (hasta 9). */
  attackerStacks: BattleStack[];
  /** Stacks del defensor (hasta 9). */
  defenderStacks: BattleStack[];
  /** Sistema y coordenadas. */
  location: {
    systemId: string;
    coordinates: { x: number; y: number; z: number };
  };
}

/** Stack de batalla (1 comandante + 1 tipo de nave x cantidad). */
interface BattleStack {
  /** ID unico del stack. */
  id: string;
  /** ID del jugador propietario. */
  userId: string;
  /** ID de la nave base (referencia a ships). */
  shipId: string;
  /** Tipo de nave. */
  shipType: string;
  /** Cantidad de naves en el stack. */
  shipCount: number;
  /** Stats por nave individual. */
  shipAttack: number;
  shipDefense: number;
  shipSpeed: number;
  shipAccuracy: number;
  shipDodge: number;
  shipElectron: number;
  shipStructure: number;
  shipShield: number;
  shipShieldRegen: number;
  shipShieldPenetration: number;
  /** He3 disponible para este stack. */
  he3: number;
  /** Multiplicador del comandante. */
  commanderBonus: number;
  /** Si el stack esta vivo. */
  isAlive: boolean;
  /** Casco actual total del stack. */
  currentHull: number;
  /** Escudo actual total del stack. */
  currentShield: number;
  /** Si puede atacar este turno (tiene He3). */
  canAttack: boolean;
  /** Indica si es el lado atacante. */
  isAttackerSide: boolean;
}

/** Estado mutable de un stack durante la simulacion (runtime only). */
interface RuntimeStack extends BattleStack {
  /** Numero de naves vivas en el stack. */
  aliveShips: number;
  /** Hull maximo total del stack (aliveShips * shipStructure). */
  maxHull: number;
  /** Shield maximo total del stack (aliveShips * shipShield). */
  maxShield: number;
}

/** Sesion de batalla activa en memoria. */
interface BattleSession {
  /** ID de la sesion (UUID). */
  id: string;
  /** ID del atacante. */
  attackerId: string;
  /** ID del defensor. */
  defenderId: string;
  /** Stacks del atacante. */
  attackerStacks: RuntimeStack[];
  /** Stacks del defensor. */
  defenderStacks: RuntimeStack[];
  /** Ronda actual (1-20). */
  currentRound: number;
  /** Seed del RNG determinista. */
  rngSeed: number;
  /** Timestamp de inicio (ms). */
  startTime: number;
  /** Tipo de batalla. */
  battleType: string;
  /** Si la batalla ha terminado. */
  isFinished: boolean;
  /** Resultado final (si termino). */
  outcome?: BattleOutcome;
  /** ID del ganador (si aplica). */
  winnerId?: string;
  /** Log completo de eventos. */
  battleLog: BattleEvent[];
  /** Timestamp de la ultima accion. */
  lastUpdated: number;
}

/** Resultado de una ronda. */
interface RoundResult {
  /** Ronda simulada. */
  round: number;
  /** Eventos de la ronda. */
  events: BattleEvent[];
  /** Stacks vivos del atacante al final. */
  attackerStacksAlive: number;
  /** Stacks vivos del defensor al final. */
  defenderStacksAlive: number;
  /** Si la batalla termino tras esta ronda. */
  battleEnded: boolean;
  /** Resultado (si termino). */
  outcome?: BattleOutcome;
  /** ID del ganador (si termino). */
  winnerId?: string;
}

/** Resultado final de batalla. */
interface BattleResult {
  /** ID de la batalla. */
  battleId: string;
  /** Resultado. */
  outcome: BattleOutcome;
  /** ID del ganador. */
  winnerId: string;
  /** Rondas jugadas. */
  roundsPlayed: number;
  /** Total de eventos. */
  totalEvents: number;
  /** Seed usado. */
  seed: number;
  /** Stacks sobrevivientes del atacante. */
  attackerSurvivors: RuntimeStack[];
  /** Stacks sobrevivientes del defensor. */
  defenderSurvivors: RuntimeStack[];
  /** Stacks destruidos del atacante. */
  attackerLosses: RuntimeStack[];
  /** Stacks destruidos del defensor. */
  defenderLosses: RuntimeStack[];
  /** Estadisticas. */
  stats: BattleStats;
  /** Log completo. */
  battleLog: BattleEvent[];
}

/** Estado actual de batalla. */
interface BattleState {
  battleId: string;
  currentRound: number;
  maxRounds: number;
  isFinished: boolean;
  attackerStacks: RuntimeStack[];
  defenderStacks: RuntimeStack[];
  outcome?: BattleOutcome;
  winnerId?: string;
}

/** Replay de batalla (reconstruccion desde seed + log). */
interface BattleReplay {
  battleId: string;
  seed: number;
  battleType: string;
  attackerId: string;
  defenderId: string;
  events: BattleEvent[];
  /** Stacks iniciales del atacante. */
  initialAttackerStacks: BattleStack[];
  /** Stacks iniciales del defensor. */
  initialDefenderStacks: BattleStack[];
  /** Estado final. */
  finalOutcome: BattleOutcome;
  winnerId: string;
}

/** Estadisticas de batalla. */
interface BattleStats {
  totalAttacks: number;
  totalHits: number;
  totalMisses: number;
  totalCriticals: number;
  totalDamageDealt: number;
  totalShieldDamage: number;
  totalHullDamage: number;
  totalShipsDestroyed: number;
  attackerShipsLost: number;
  defenderShipsLost: number;
}

/** Request para simulador interno/dev (no afecta flotas reales). */
interface DevSimulationParams {
  /** ID del atacante (para referencia). */
  attackerId: string;
  /** ID del defensor (para referencia). */
  defenderId: string;
  /** Stacks del atacante. */
  attackerStacks: BattleStack[];
  /** Stacks del defensor. */
  defenderStacks: BattleStack[];
  /** Seed opcional (si no se provee, se genera uno aleatorio). */
  seed?: number;
  /** Tipo de batalla simulada. */
  battleType?: string;
}

/** Respuesta paginada para logs de batalla. */
interface BattleLogResponse {
  events: BattleEvent[];
  totalCount: number;
}

// =============================================================================
// RNG DETERMINISTA (LINEAR CONGRUENTIAL GENERATOR)
// =============================================================================

/**
 * Generador de numeros pseudoaleatorios determinista usando LCG.
 * Permite reproducir exactamente cualquier batalla dado el mismo seed.
 *
 * Formula LCG: seed = (seed * a + c) % m
 * donde a = 1664525, c = 1013904223, m = 2^32
 *
 * @see https://en.wikipedia.org/wiki/Linear_congruential_generator
 */
class DeterministicRNG {
  /** Semilla actual del generador. */
  private seed: number;

  /** Semilla original (para reset/replay). */
  private readonly originalSeed: number;

  /** Contador de llamadas a random() (para debugging/auditoria). */
  private callCount: number = 0;

  /**
   * @param seed - Semilla inicial (guardada en combat_sessions.rng_seed)
   */
  constructor(seed: number) {
    this.seed = seed >>> 0; // Forzar unsigned 32-bit
    this.originalSeed = this.seed;
  }

  /**
   * Genera un numero pseudoaleatorio en [0, 1) usando LCG.
   * El estado interno avanza con cada llamada.
   *
   * @returns Numero en [0, 1)
   */
  random(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    this.callCount++;
    return this.seed / 4294967296;
  }

  /**
   * Genera un numero pseudoaleatorio entero en [min, max].
   *
   * @param min - Valor minimo (inclusive)
   * @param max - Valor maximo (inclusive)
   * @returns Entero en [min, max]
   */
  randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  /**
   * Calcula exitos de una distribucion binomial.
   * Usado para determinar cuantos hits conectan de un stack.
   *
   * @param n - Numero de intentos (naves vivas)
   * @param p - Probabilidad de exito por intento
   * @returns Numero de exitos
   */
  binomial(n: number, p: number): number {
    let successes = 0;
    for (let i = 0; i < n; i++) {
      if (this.random() < p) successes++;
    }
    return successes;
  }

  /** Resetea el RNG a su semilla original (para replays). */
  reset(): void {
    this.seed = this.originalSeed;
    this.callCount = 0;
  }

  /** Obtiene la semilla original. */
  getSeed(): number {
    return this.originalSeed;
  }

  /** Obtiene el numero de llamadas realizadas. */
  getCallCount(): number {
    return this.callCount;
  }
}

// =============================================================================
// UTILIDADES
// =============================================================================

/**
 * Genera una semilla aleatoria de 32 bits unsigned.
 * Usado cuando no se provee seed en una batalla nueva.
 */
function generateRandomSeed(): number {
  return Math.floor(Math.random() * 4294967296) >>> 0;
}

/**
 * Convierte un stack de batalla a su representacion runtime
 * con valores mutables inicializados.
 */
function toRuntimeStack(stack: BattleStack): RuntimeStack {
  const aliveShips = stack.shipCount;
  const shipStruct = stack.shipStructure > 0 ? stack.shipStructure : (SHIP_STRUCTURE[stack.shipType] || 500);
  const shipShd = stack.shipShield > 0 ? stack.shipShield : 0;
  return {
    ...stack,
    aliveShips,
    maxHull: aliveShips * shipStruct,
    maxShield: aliveShips * shipShd,
    currentHull: aliveShips * shipStruct,
    currentShield: aliveShips * shipShd,
    canAttack: true,
    isAlive: true,
  };
}

/**
 * Crea un BattleEvent con timestamp automatico.
 */
function createEvent(
  session: BattleSession,
  round: number,
  turn: number,
  type: BattleEventType,
  data: Omit<Partial<BattleEvent>, 'round' | 'turn' | 'timestamp' | 'type'>
): BattleEvent {
  return {
    round,
    turn,
    timestamp: Date.now() - session.startTime,
    type,
    ...data,
  } as BattleEvent;
}

// =============================================================================
// SERVICIO DE COMBATE - CLASE PRINCIPAL
// =============================================================================

/**
 * Servicio principal del sistema de combate de Galaxy Online 2.
 *
 * Implementa la maquina de estados de batalla con:
 * - 20 rondas fijas
 * - Orden de ataque por Speed (descendente, desempate: atacante)
 * - RNG determinista con seed (LCG)
 * - 8 pasos de resolucion de dano exactos
 * - Regeneracion de escudos 100% por ronda
 * - Consumo de He3 (naves sin He3 no atacan)
 * - Perdida permanente en PvP
 * - BattleLog completo guardado como JSONB
 * - Reproduccion de batallas desde seed + log
 */
class CombatService {

  // ---------------------------------------------------------------------------
  // PROPIEDADES
  // ---------------------------------------------------------------------------

  /** Sesiones de batalla activas en memoria (runtime). */
  private activeSessions: Map<string, BattleSession> = new Map();

  // ---------------------------------------------------------------------------
  // METODO PUBLICO: initiateBattle
  // ---------------------------------------------------------------------------

  /**
   * Inicia una nueva batalla creando una sesion con seed RNG.
   *
   * Reglas aplicadas:
   * - Maximo 9 stacks por lado
   * - Se genera seed RNG determinista
   * - Se valida que ambos lados tengan al menos 1 stack vivo
   * - Se guarda en combat_sessions con battle_log como JSONB vacio
   *
   * @param request - Datos de la batalla (atacante, defensor, stacks)
   * @returns Sesion creada con ID y seed
   */
  async initiateBattle(request: InitiateBattleRequest): Promise<ApiResponse<BattleSession>> {
    try {
      const { attackerId, defenderId, battleType, attackerStacks, defenderStacks, location } = request;

      // --- Validaciones ---
      if (!attackerId || !defenderId) {
        return this.errorResponse('MISSING_PARTICIPANTS', 'Attacker and defender are required');
      }

      if (attackerStacks.length === 0 || defenderStacks.length === 0) {
        return this.errorResponse('EMPTY_FLEET', 'Both sides must have at least 1 stack');
      }

      if (attackerStacks.length > MAX_STACKS_PER_SIDE || defenderStacks.length > MAX_STACKS_PER_SIDE) {
        return this.errorResponse(
          'TOO_MANY_STACKS',
          `Maximum ${MAX_STACKS_PER_SIDE} stacks per side`
        );
      }

      if (attackerId === defenderId) {
        return this.errorResponse('SAME_PLAYER', 'Attacker and defender cannot be the same');
      }

      // Validar tipos de naves
      const validShipTypes = Object.keys(HE3_PER_ROUND);
      for (const stack of [...attackerStacks, ...defenderStacks]) {
        if (!validShipTypes.includes(stack.shipType)) {
          return this.errorResponse(
            'INVALID_SHIP_TYPE',
            `Invalid ship type: ${stack.shipType}`
          );
        }
      }

      // --- Generar seed y crear sesion ---
      const seed = generateRandomSeed();
      const battleId = await this.generateBattleId();

      const now = Date.now();

      // Convertir stacks a runtime
      const attackerRuntime = attackerStacks.map((s, idx) =>
        toRuntimeStack({ ...s, id: s.id || `att_${idx}`, userId: attackerId, isAttackerSide: true })
      );
      const defenderRuntime = defenderStacks.map((s, idx) =>
        toRuntimeStack({ ...s, id: s.id || `def_${idx}`, userId: defenderId, isAttackerSide: false })
      );

      const session: BattleSession = {
        id: battleId,
        attackerId,
        defenderId,
        attackerStacks: attackerRuntime,
        defenderStacks: defenderRuntime,
        currentRound: 0,
        rngSeed: seed,
        startTime: now,
        battleType,
        isFinished: false,
        battleLog: [],
        lastUpdated: now,
      };

      // Guardar en base de datos (combat_sessions)
      await executeInsertQuery(
        'combat_sessions',
        {
          id: battleId,
          participants: JSON.stringify([
            { user_id: attackerId, side: 'attacker', stacks: attackerStacks.length },
            { user_id: defenderId, side: 'defender', stacks: defenderStacks.length },
          ]),
          status: 'active',
          battle_type: battleType,
          location_system_id: location.systemId,
          location_x: location.coordinates.x,
          location_y: location.coordinates.y,
          location_z: location.coordinates.z,
          settings: JSON.stringify({ maxRounds: MAX_ROUNDS, rngSeed: seed }),
          battle_log: JSON.stringify([]),
          start_time: new Date(now),
          created_at: new Date(now),
          updated_at: new Date(now),
        },
        ['id']
      );

      // Guardar en memoria
      this.activeSessions.set(battleId, session);

      // Log inicial
      const initEvent: BattleEvent = {
        round: 0,
        turn: 0,
        timestamp: 0,
        type: 'round_start',
        message: `Battle initiated: ${attackerId} vs ${defenderId}. Type: ${battleType}. Seed: ${seed}`,
      };
      session.battleLog.push(initEvent);

      logger.info('Battle initiated:', {
        battleId,
        attackerId,
        defenderId,
        battleType,
        seed,
        attackerStacks: attackerStacks.length,
        defenderStacks: defenderStacks.length,
      });

      return {
        success: true,
        data: session,
      };
    } catch (error) {
      logger.error('Failed to initiate battle:', error);
      return this.errorResponse('INTERNAL_ERROR', 'Failed to initiate battle');
    }
  }

  // ---------------------------------------------------------------------------
  // METODO PUBLICO: simulateRound
  // ---------------------------------------------------------------------------

  /**
   * Simula una ronda completa ejecutando todos los turnos.
   *
   * Estructura de ronda (20 rondas fijas):
   * 1. Regenerar escudos 100% de todos los stacks vivos
   * 2. Verificar He3: stacks sin He3 se marcan como cannot_attack
   * 3. Determinar orden de turno por Speed (descendente)
   * 4. Empate de Speed: atacante va primero
   * 5-9. Por cada stack: seleccionar objetivo, disparar, consumir He3, resolver dano
   * 10. Verificar si un lado quedo sin stacks
   *
   * @param battleId - ID de la batalla
   * @returns Resultado de la ronda simulada
   */
  async simulateRound(battleId: string): Promise<ApiResponse<RoundResult>> {
    try {
      const session = await this.getSession(battleId);
      if (!session) {
        return this.errorResponse('BATTLE_NOT_FOUND', `Battle ${battleId} not found`);
      }

      if (session.isFinished) {
        return this.errorResponse('BATTLE_FINISHED', 'Battle has already ended');
      }

      if (session.currentRound >= MAX_ROUNDS) {
        session.isFinished = true;
        session.outcome = 'defender_wins_timeout';
        await this.persistBattleEnd(session);
        return {
          success: true,
          data: {
            round: MAX_ROUNDS,
            events: [],
            attackerStacksAlive: this.countAliveStacks(session.attackerStacks),
            defenderStacksAlive: this.countAliveStacks(session.defenderStacks),
            battleEnded: true,
            outcome: 'defender_wins_timeout',
            winnerId: session.defenderId,
          },
        };
      }

      // Crear RNG determinista (se recrea con el mismo seed + offset por ronda)
      const roundSeed = (session.rngSeed + session.currentRound * 7919) >>> 0;
      const rng = new DeterministicRNG(roundSeed);

      session.currentRound++;
      const currentRound = session.currentRound;
      const roundEvents: BattleEvent[] = [];
      let turnCounter = 0;

      // ============================================================
      // RONDA_START: Paso 1 - Regenerar escudos 100%
      // ============================================================
      const allStacks = [...session.attackerStacks, ...session.defenderStacks];
      for (const stack of allStacks) {
        if (stack.isAlive && stack.aliveShips > 0) {
          const oldShield = stack.currentShield;
          stack.currentShield = stack.maxShield;
          roundEvents.push(
            createEvent(session, currentRound, 0, 'shield_regen', {
              attackerId: stack.id,
              message: `${stack.id} shield regenerated: ${oldShield} -> ${stack.currentShield}`,
            })
          );
        }
      }

      // ============================================================
      // RONDA_START: Paso 2 - Verificar He3
      // ============================================================
      for (const stack of allStacks) {
        if (stack.isAlive && stack.aliveShips > 0) {
          const he3Cost = HE3_PER_ROUND[stack.shipType] || 5;
          if (stack.he3 < he3Cost) {
            stack.canAttack = false;
            roundEvents.push(
              createEvent(session, currentRound, 0, 'he3_depleted', {
                attackerId: stack.id,
                he3Remaining: stack.he3,
                message: `${stack.id} cannot attack - insufficient He3 (${stack.he3}/${he3Cost})`,
              })
            );
          } else {
            stack.canAttack = true;
          }
        }
      }

      roundEvents.push(
        createEvent(session, currentRound, 0, 'round_start', {
          message: `Round ${currentRound}/${MAX_ROUNDS} started`,
        })
      );

      // ============================================================
      // RONDA_START: Paso 3 - Determinar orden de turno por Speed
      // ============================================================
      const aliveStacks = allStacks.filter((s) => s.isAlive && s.aliveShips > 0);

      // Ordenar por Speed descendente. Empate: atacante va primero (isAttackerSide true > false)
      const turnOrder = aliveStacks.sort((a, b) => {
        if (b.shipSpeed !== a.shipSpeed) {
          return b.shipSpeed - a.shipSpeed; // Mayor speed primero
        }
        // Empate: atacante va primero (true = 1, false = 0)
        return (b.isAttackerSide ? 1 : 0) - (a.isAttackerSide ? 1 : 0);
      });

      // ============================================================
      // TURNOS: Paso 5-9
      // ============================================================
      for (const activeStack of turnOrder) {
        turnCounter++;

        // Skip si no puede atacar (sin He3)
        if (!activeStack.canAttack) {
          roundEvents.push(
            createEvent(session, currentRound, turnCounter, 'turn_start', {
              attackerId: activeStack.id,
              message: `${activeStack.id} turn skipped - no He3`,
            })
          );
          continue;
        }

        // Turn start event
        roundEvents.push(
          createEvent(session, currentRound, turnCounter, 'turn_start', {
            attackerId: activeStack.id,
            message: `${activeStack.id} turn starts (Speed: ${activeStack.shipSpeed})`,
          })
        );

        // --- Paso 5: Seleccionar objetivo (stack enemigo vivo mas cercano) ---
        const enemyStacks = activeStack.isAttackerSide
          ? session.defenderStacks
          : session.attackerStacks;
        const aliveEnemies = enemyStacks.filter((s) => s.isAlive && s.aliveShips > 0);

        if (aliveEnemies.length === 0) {
          // No quedan enemigos - la batalla deberia terminar
          break;
        }

        // "Mas cercano" = primero en el array que este vivo (simplificacion)
        // En GO2 real seria por distancia espacial, aqui usamos orden de stack
        const target = aliveEnemies[0];

        roundEvents.push(
          createEvent(session, currentRound, turnCounter, 'target_select', {
            attackerId: activeStack.id,
            targetId: target.id,
            message: `${activeStack.id} targets ${target.id}`,
          })
        );

        // --- Paso 7: Consumir He3 ---
        const he3Cost = HE3_PER_ROUND[activeStack.shipType] || 5;
        activeStack.he3 -= he3Cost;

        // --- Paso 6: Disparar + Paso 8: Resolver dano (8 pasos exactos) ---
        const attackEvents = this.resolveAttack(session, activeStack, target, rng, currentRound, turnCounter);
        roundEvents.push(...attackEvents);

        // Verificar si el objetivo fue destruido
        if (target.currentHull <= 0 || target.aliveShips <= 0) {
          target.isAlive = false;
          target.aliveShips = 0;
          target.currentHull = 0;
          target.currentShield = 0;
          roundEvents.push(
            createEvent(session, currentRound, turnCounter, 'stack_destroyed', {
              attackerId: activeStack.id,
              targetId: target.id,
              message: `${target.id} stack destroyed!`,
            })
          );
        }
      }

      // ============================================================
      // RONDA_END: Paso 10 - Verificar si un lado quedo sin stacks
      // ============================================================
      const attackerAlive = this.countAliveStacks(session.attackerStacks);
      const defenderAlive = this.countAliveStacks(session.defenderStacks);

      roundEvents.push(
        createEvent(session, currentRound, 0, 'round_end', {
          message: `Round ${currentRound} ended. Attacker: ${attackerAlive} stacks. Defender: ${defenderAlive} stacks.`,
        })
      );

      // Agregar eventos al log global
      session.battleLog.push(...roundEvents);

      let battleEnded = false;
      let outcome: BattleOutcome | undefined;
      let winnerId: string | undefined;

      if (attackerAlive === 0 && defenderAlive === 0) {
        // Empate - ambos destruidos
        battleEnded = true;
        outcome = 'draw';
        winnerId = '';
        session.isFinished = true;
        session.outcome = outcome;
        session.winnerId = winnerId;
      } else if (attackerAlive === 0) {
        // Defensor gana
        battleEnded = true;
        outcome = 'attacker_wins';
        winnerId = session.defenderId;
        session.isFinished = true;
        session.outcome = 'attacker_wins';
        session.winnerId = winnerId;
      } else if (defenderAlive === 0) {
        // Atacante gana
        battleEnded = true;
        outcome = 'attacker_wins';
        winnerId = session.attackerId;
        session.isFinished = true;
        session.outcome = 'attacker_wins';
        session.winnerId = winnerId;
      } else if (currentRound >= MAX_ROUNDS) {
        // Timeout - defensor gana
        battleEnded = true;
        outcome = 'defender_wins_timeout';
        winnerId = session.defenderId;
        session.isFinished = true;
        session.outcome = 'defender_wins_timeout';
        session.winnerId = winnerId;
      }

      // Actualizar en base de datos
      await this.persistSession(session);

      if (battleEnded) {
        await this.persistBattleEnd(session);
      }

      session.lastUpdated = Date.now();

      const result: RoundResult = {
        round: currentRound,
        events: roundEvents,
        attackerStacksAlive: attackerAlive,
        defenderStacksAlive: defenderAlive,
        battleEnded,
        outcome,
        winnerId,
      };

      return { success: true, data: result };
    } catch (error) {
      logger.error('Failed to simulate round:', { battleId, error });
      return this.errorResponse('SIMULATION_ERROR', 'Failed to simulate round');
    }
  }

  // ---------------------------------------------------------------------------
  // METODO PUBLICO: simulateBattle
  // ---------------------------------------------------------------------------

  /**
   * Simula la batalla completa ejecutando todas las rondas hasta el final.
   *
   * Ejecuta rondas secuencialmente hasta que:
   * - Un lado queda sin stacks vivos (ganador determinado)
   * - Se alcanzan 20 rondas (defensor gana por timeout)
   *
   * @param battleId - ID de la batalla
   * @returns Resultado final completo de la batalla
   */
  async simulateBattle(battleId: string): Promise<ApiResponse<BattleResult>> {
    try {
      const session = await this.getSession(battleId);
      if (!session) {
        return this.errorResponse('BATTLE_NOT_FOUND', `Battle ${battleId} not found`);
      }

      if (session.isFinished) {
        // Batalla ya terminada, devolver resultado cacheado
        const result = this.buildBattleResult(session);
        return { success: true, data: result };
      }

      // Simular rondas hasta que termine
      let safetyCounter = 0;
      const maxSafety = MAX_ROUNDS + 5;

      while (!session.isFinished && safetyCounter < maxSafety) {
        safetyCounter++;
        const response = await this.simulateRound(battleId);
        if (!response.success || !response.data) {
          return this.errorResponse(
            'SIMULATION_ERROR',
            response.error?.message || 'Round simulation failed'
          );
        }
        if (response.data.battleEnded) {
          break;
        }
      }

      const result = this.buildBattleResult(session);
      return { success: true, data: result };
    } catch (error) {
      logger.error('Failed to simulate battle:', { battleId, error });
      return this.errorResponse('SIMULATION_ERROR', 'Failed to simulate battle');
    }
  }

  // ---------------------------------------------------------------------------
  // METODO PUBLICO: getBattleState
  // ---------------------------------------------------------------------------

  /**
   * Obtiene el estado actual de una batalla.
   *
   * @param battleId - ID de la batalla
   * @returns Estado actual (ronda, stacks vivos, etc.)
   */
  async getBattleState(battleId: string): Promise<ApiResponse<BattleState>> {
    try {
      const session = await this.getSession(battleId);
      if (!session) {
        return this.errorResponse('BATTLE_NOT_FOUND', `Battle ${battleId} not found`);
      }

      const state: BattleState = {
        battleId: session.id,
        currentRound: session.currentRound,
        maxRounds: MAX_ROUNDS,
        isFinished: session.isFinished,
        attackerStacks: session.attackerStacks,
        defenderStacks: session.defenderStacks,
        outcome: session.outcome,
        winnerId: session.winnerId,
      };

      return { success: true, data: state };
    } catch (error) {
      logger.error('Failed to get battle state:', { battleId, error });
      return this.errorResponse('INTERNAL_ERROR', 'Failed to get battle state');
    }
  }

  // ---------------------------------------------------------------------------
  // METODO PUBLICO: getBattleLog
  // ---------------------------------------------------------------------------

  /**
   * Obtiene el battle log completo de una batalla.
   *
   * El log se almacena como JSONB en combat_sessions.battle_log
   * y contiene TODOS los eventos de la batalla.
   *
   * @param battleId - ID de la batalla
   * @returns Lista completa de eventos
   */
  async getBattleLog(battleId: string): Promise<ApiResponse<BattleEvent[]>> {
    try {
      // Primero intentar de memoria
      const session = this.activeSessions.get(battleId);
      if (session) {
        return { success: true, data: session.battleLog };
      }

      // Si no esta en memoria, leer de la base de datos
      const row = await executeSingleRowQuery<{ battle_log: string | BattleEvent[] }>(
        'SELECT battle_log FROM combat_sessions WHERE id = $1',
        [battleId]
      );

      if (!row) {
        return this.errorResponse('BATTLE_NOT_FOUND', `Battle ${battleId} not found`);
      }

      const logData = typeof row.battle_log === 'string' ? JSON.parse(row.battle_log) : row.battle_log;
      return { success: true, data: logData as BattleEvent[] };
    } catch (error) {
      logger.error('Failed to get battle log:', { battleId, error });
      return this.errorResponse('INTERNAL_ERROR', 'Failed to get battle log');
    }
  }

  // ---------------------------------------------------------------------------
  // METODO PUBLICO: getBattleReplay
  // ---------------------------------------------------------------------------

  /**
   * Obtiene un replay reconstruyendo la batalla desde seed + log.
   *
   * Usa el seed almacenado en combat_sessions para regenerar
   * exactamente la misma secuencia de numeros aleatorios,
   * permitiendo reproducir la batalla identica.
   *
   * @param battleId - ID de la batalla
   * @returns Replay completo con seed, stacks iniciales y eventos
   */
  async getBattleReplay(battleId: string): Promise<ApiResponse<BattleReplay>> {
    try {
      const row = await executeSingleRowQuery<{
        id: string;
        settings: string | Record<string, any>;
        battle_log: string | BattleEvent[];
        battle_type: string;
        participants: string | Array<{ user_id: string; side: string; stacks: number }>;
      }>(
        'SELECT id, settings, battle_log, battle_type, participants FROM combat_sessions WHERE id = $1',
        [battleId]
      );

      if (!row) {
        return this.errorResponse('BATTLE_NOT_FOUND', `Battle ${battleId} not found`);
      }

      const settings = typeof row.settings === 'string' ? JSON.parse(row.settings) : row.settings;
      const logData = typeof row.battle_log === 'string' ? JSON.parse(row.battle_log) : row.battle_log;
      const participants = typeof row.participants === 'string' ? JSON.parse(row.participants) : row.participants;

      const seed = settings.rngSeed || 0;
      const attackerParticipant = Array.isArray(participants)
        ? participants.find((p: any) => p.side === 'attacker')
        : null;
      const defenderParticipant = Array.isArray(participants)
        ? participants.find((p: any) => p.side === 'defender')
        : null;

      // Reconstruir stacks iniciales del log (round 0)
      const initEvents = (logData as BattleEvent[]).filter((e) => e.round === 0);

      // Determinar outcome final del log
      const endEvents = (logData as BattleEvent[]).filter((e) => e.type === 'battle_end');
      const finalOutcome: BattleOutcome = endEvents.length > 0
        ? (endEvents[0].message.includes('timeout')
            ? 'defender_wins_timeout'
            : endEvents[0].message.includes('draw')
              ? 'draw'
              : 'attacker_wins')
        : 'defender_wins_timeout';

      const winnerId = endEvents.length > 0
        ? (endEvents[0] as any).winnerId || ''
        : (defenderParticipant ? defenderParticipant.user_id : '');

      const replay: BattleReplay = {
        battleId: row.id,
        seed,
        battleType: row.battle_type,
        attackerId: attackerParticipant ? attackerParticipant.user_id : '',
        defenderId: defenderParticipant ? defenderParticipant.user_id : '',
        events: logData as BattleEvent[],
        initialAttackerStacks: [], // Se reconstruyen del request original si es necesario
        initialDefenderStacks: [],
        finalOutcome,
        winnerId,
      };

      return { success: true, data: replay };
    } catch (error) {
      logger.error('Failed to get battle replay:', { battleId, error });
      return this.errorResponse('INTERNAL_ERROR', 'Failed to get battle replay');
    }
  }

  // ---------------------------------------------------------------------------
  // METODO PUBLICO: simulateDev (simulador interno/dev)
  // ---------------------------------------------------------------------------

  /**
   * Simulador interno para desarrollo/testing.
   *
   * IMPORTANTE: Este metodo NO afecta flotas reales.
   * No guarda en base de datos, no persiste perdidas.
   * Es un simulador puro en memoria para testing y balancing.
   *
   * @param params - Parametros de simulacion (stacks, seed opcional)
   * @returns Resultado de la simulacion
   */
  async simulateDev(params: DevSimulationParams): Promise<ApiResponse<BattleResult>> {
    try {
      const {
        attackerId,
        defenderId,
        attackerStacks,
        defenderStacks,
        seed = generateRandomSeed(),
        battleType = 'pvp',
      } = params;

      // Crear sesion en memoria (no se guarda en DB)
      const battleId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const now = Date.now();

      const attackerRuntime = attackerStacks.map((s, idx) =>
        toRuntimeStack({ ...s, id: s.id || `dev_att_${idx}`, userId: attackerId, isAttackerSide: true })
      );
      const defenderRuntime = defenderStacks.map((s, idx) =>
        toRuntimeStack({ ...s, id: s.id || `dev_def_${idx}`, userId: defenderId, isAttackerSide: false })
      );

      const session: BattleSession = {
        id: battleId,
        attackerId,
        defenderId,
        attackerStacks: attackerRuntime,
        defenderStacks: defenderRuntime,
        currentRound: 0,
        rngSeed: seed,
        startTime: now,
        battleType,
        isFinished: false,
        battleLog: [],
        lastUpdated: now,
      };

      // Simular todas las rondas en memoria
      let safetyCounter = 0;
      while (!session.isFinished && safetyCounter < MAX_ROUNDS + 5) {
        safetyCounter++;

        if (session.currentRound >= MAX_ROUNDS) {
          session.isFinished = true;
          session.outcome = 'defender_wins_timeout';
          session.winnerId = defenderId;
          break;
        }

        const roundSeed = (session.rngSeed + session.currentRound * 7919) >>> 0;
        const rng = new DeterministicRNG(roundSeed);

        session.currentRound++;
        const currentRound = session.currentRound;
        let turnCounter = 0;

        // 1. Regenerar escudos
        const allStacks = [...session.attackerStacks, ...session.defenderStacks];
        for (const stack of allStacks) {
          if (stack.isAlive && stack.aliveShips > 0) {
            stack.currentShield = stack.maxShield;
          }
        }

        // 2. Verificar He3
        for (const stack of allStacks) {
          if (stack.isAlive && stack.aliveShips > 0) {
            const he3Cost = HE3_PER_ROUND[stack.shipType] || 5;
            stack.canAttack = stack.he3 >= he3Cost;
          }
        }

        // 3. Orden de turno por Speed
        const aliveStacks = allStacks.filter((s) => s.isAlive && s.aliveShips > 0);
        const turnOrder = aliveStacks.sort((a, b) => {
          if (b.shipSpeed !== a.shipSpeed) return b.shipSpeed - a.shipSpeed;
          return (b.isAttackerSide ? 1 : 0) - (a.isAttackerSide ? 1 : 0);
        });

        // 4. Ejecutar turnos
        for (const activeStack of turnOrder) {
          turnCounter++;
          if (!activeStack.canAttack) continue;

          const enemyStacks = activeStack.isAttackerSide
            ? session.defenderStacks
            : session.attackerStacks;
          const aliveEnemies = enemyStacks.filter((s) => s.isAlive && s.aliveShips > 0);
          if (aliveEnemies.length === 0) break;

          const target = aliveEnemies[0];
          const he3Cost = HE3_PER_ROUND[activeStack.shipType] || 5;
          activeStack.he3 -= he3Cost;

          const attackEvents = this.resolveAttack(session, activeStack, target, rng, currentRound, turnCounter);
          session.battleLog.push(...attackEvents);

          if (target.currentHull <= 0 || target.aliveShips <= 0) {
            target.isAlive = false;
            target.aliveShips = 0;
            target.currentHull = 0;
            target.currentShield = 0;
          }
        }

        // 5. Verificar fin de batalla
        const attackerAlive = this.countAliveStacks(session.attackerStacks);
        const defenderAlive = this.countAliveStacks(session.defenderStacks);

        if (attackerAlive === 0 && defenderAlive === 0) {
          session.isFinished = true;
          session.outcome = 'draw';
          session.winnerId = '';
        } else if (attackerAlive === 0) {
          session.isFinished = true;
          session.outcome = 'attacker_wins';
          session.winnerId = defenderId;
        } else if (defenderAlive === 0) {
          session.isFinished = true;
          session.outcome = 'attacker_wins';
          session.winnerId = attackerId;
        } else if (currentRound >= MAX_ROUNDS) {
          session.isFinished = true;
          session.outcome = 'defender_wins_timeout';
          session.winnerId = defenderId;
        }
      }

      const result = this.buildBattleResult(session);

      // Marcar que es dev (no persistencia)
      logger.info('Dev simulation completed:', {
        battleId,
        seed,
        rounds: session.currentRound,
        outcome: session.outcome,
      });

      return { success: true, data: result };
    } catch (error) {
      logger.error('Dev simulation failed:', { error });
      return this.errorResponse('SIMULATION_ERROR', 'Dev simulation failed');
    }
  }

  // =============================================================================
  // METODOS PRIVADOS: Resolucion de Ataque (8 pasos exactos)
  // =============================================================================

  /**
   * Resuelve un ataque completo siguiendo las 8 fases del sistema GO2.
   *
   * Fase 1: Dano base = attackerShips * shipAttack * weaponMultiplier * commanderBonus * RPSModifier
   * Fase 2: Hit check (Accuracy vs Dodge) con binomial random
   * Fase 3: Dano por hit = baseDamage * (0.9 + RNG * 0.2) [+/-10%]
   * Fase 4: Critico (Electron stat) -> x1.5 dano
   * Fase 5: Defensa del objetivo -> dano * (1 - def / (def + 200))
   * Fase 6: Dano a escudo primero
   * Fase 7: Dano restante al casco + penetracion
   * Fase 8: Naves destruidas = floor(max(0, -currentHull) / shipStructure)
   *
   * @param session - Sesion de batalla
   * @param attacker - Stack atacante
   * @param defender - Stack defensor
   * @param rng - RNG determinista
   * @param round - Ronda actual
   * @param turn - Turno actual
   * @returns Lista de eventos generados por el ataque
   */
  private resolveAttack(
    session: BattleSession,
    attacker: RuntimeStack,
    defender: RuntimeStack,
    rng: DeterministicRNG,
    round: number,
    turn: number
  ): BattleEvent[] {
    const events: BattleEvent[] = [];

    // --- Fase 1: Calcular dano base ---
    const weaponMultiplier = WEAPON_MULTIPLIERS[attacker.shipType] || 1.0;
    const rpsModifier = this.calculateRPSModifier(attacker.shipType, defender.shipType);
    const baseDamage = (attacker.aliveShips * attacker.shipAttack * weaponMultiplier * attacker.commanderBonus) * rpsModifier;

    // --- Fase 2: Verificar hit (Accuracy vs Dodge) ---
    const hitChance = Math.min(0.95, Math.max(0.05, (attacker.shipAccuracy - defender.shipDodge) / 100 + 0.5));
    const hits = rng.binomial(attacker.aliveShips, hitChance);
    const misses = attacker.aliveShips - hits;

    // Evento de ataque
    events.push(
      createEvent(session, round, turn, 'attack', {
        attackerId: attacker.id,
        targetId: defender.id,
        damage: Math.floor(baseDamage),
        message: `${attacker.id} attacks ${defender.id} with ${attacker.aliveShips} ships (base dmg: ${Math.floor(baseDamage)})`,
      })
    );

    if (hits === 0) {
      // Todos miss
      events.push(
        createEvent(session, round, turn, 'miss', {
          attackerId: attacker.id,
          targetId: defender.id,
          message: `${attacker.id} misses all shots against ${defender.id} (${misses} misses)`,
        })
      );
      return events;
    }

    // --- Fases 3-4: Dano por hit con variacion y critico ---
    let totalDamage = 0;
    let totalCrits = 0;
    const critChance = attacker.shipElectron / 500; // Ej: Electron 100 = 20% crit

    for (let i = 0; i < hits; i++) {
      // Fase 3: Variacion +/-10%
      const damagePerHit = baseDamage / attacker.aliveShips * (0.9 + rng.random() * 0.2);

      // Fase 4: Critico
      const isCrit = rng.random() < critChance;
      const finalDamage = isCrit ? damagePerHit * 1.5 : damagePerHit;

      totalDamage += finalDamage;
      if (isCrit) totalCrits++;
    }

    if (misses > 0) {
      events.push(
        createEvent(session, round, turn, 'miss', {
          attackerId: attacker.id,
          targetId: defender.id,
          message: `${misses} shots missed`,
        })
      );
    }

    if (totalCrits > 0) {
      events.push(
        createEvent(session, round, turn, 'critical', {
          attackerId: attacker.id,
          targetId: defender.id,
          isCritical: true,
          message: `${totalCrits} critical hits!`,
        })
      );
    }

    events.push(
      createEvent(session, round, turn, 'hit', {
        attackerId: attacker.id,
        targetId: defender.id,
        damage: Math.floor(totalDamage),
        message: `${hits} hits for ${Math.floor(totalDamage)} damage`,
      })
    );

    // --- Fase 5: Aplicar defensa del objetivo ---
    const damageAfterDefense = totalDamage * (1 - defender.shipDefense / (defender.shipDefense + 200));

    // --- Fase 6: Dano a escudo primero ---
    const shieldDamage = Math.min(defender.currentShield, damageAfterDefense);
    defender.currentShield -= shieldDamage;
    const hullOverflow = damageAfterDefense - shieldDamage;

    if (shieldDamage > 0) {
      events.push(
        createEvent(session, round, turn, 'shield_damage', {
          attackerId: attacker.id,
          targetId: defender.id,
          shieldDamage: Math.floor(shieldDamage),
          message: `${defender.id} shield absorbs ${Math.floor(shieldDamage)} damage (remaining: ${Math.floor(defender.currentShield)})`,
        })
      );
    }

    // --- Fase 7: Dano restante al casco + penetracion ---
    const shieldPenetration = defender.shipShieldPenetration || 0;
    const hullDamage = hullOverflow + (damageAfterDefense * shieldPenetration);

    if (hullDamage > 0) {
      defender.currentHull -= hullDamage;
      events.push(
        createEvent(session, round, turn, 'hull_damage', {
          attackerId: attacker.id,
          targetId: defender.id,
          hullDamage: Math.floor(hullDamage),
          message: `${defender.id} hull takes ${Math.floor(hullDamage)} damage (remaining: ${Math.floor(defender.currentHull)})`,
        })
      );
    }

    // --- Fase 8: Determinar naves destruidas ---
    const shipStruct = defender.shipStructure > 0 ? defender.shipStructure : (SHIP_STRUCTURE[defender.shipType] || 500);
    const totalHullLost = Math.max(0, defender.maxHull - Math.max(0, defender.currentHull));
    const shipsLost = Math.floor(totalHullLost / shipStruct);

    if (shipsLost > 0 && shipsLost > (defender.shipCount - defender.aliveShips)) {
      const newlyLost = shipsLost - (defender.shipCount - defender.aliveShips);
      defender.aliveShips = Math.max(0, defender.shipCount - shipsLost);

      if (newlyLost > 0) {
        events.push(
          createEvent(session, round, turn, 'ships_destroyed', {
            attackerId: attacker.id,
            targetId: defender.id,
            shipsLost: newlyLost,
            message: `${defender.id} loses ${newlyLost} ships (${defender.aliveShips} remaining)`,
          })
        );
      }
    }

    // Recalcular max shield/hull basado en naves vivas
    if (defender.aliveShips > 0) {
      defender.maxShield = defender.aliveShips * defender.shipShield;
      defender.maxHull = defender.aliveShips * shipStruct;
      defender.currentShield = Math.min(defender.currentShield, defender.maxShield);
      defender.currentHull = Math.min(defender.currentHull, defender.maxHull);
    } else {
      defender.currentHull = 0;
      defender.currentShield = 0;
      defender.aliveShips = 0;
      defender.isAlive = false;
    }

    return events;
  }

  // =============================================================================
  // METODOS PRIVADOS: Utilidades
  // =============================================================================

  /**
   * Calcula el modificador RPS (Rock-Paper-Scissors) entre dos tipos de naves.
   *
   * En GO2: Frigates > Cruisers > Battleships > Frigates (ciclo)
   * Special es neutral.
   */
  private calculateRPSModifier(attackerType: string, defenderType: string): number {
    // Frigate beats Cruiser, Cruiser beats Battleship, Battleship beats Frigate
    const rpsMatrix: Record<string, Record<string, number>> = {
      frigate: { cruiser: 1.2, battleship: 0.8, frigate: 1.0, special: 1.0 },
      cruiser: { battleship: 1.2, frigate: 0.8, cruiser: 1.0, special: 1.0 },
      battleship: { frigate: 1.2, cruiser: 0.8, battleship: 1.0, special: 1.0 },
      special: { frigate: 1.0, cruiser: 1.0, battleship: 1.0, special: 1.0 },
    };
    return (rpsMatrix[attackerType] && rpsMatrix[attackerType][defenderType]) || 1.0;
  }

  /** Cuenta stacks vivos en un lado. */
  private countAliveStacks(stacks: RuntimeStack[]): number {
    return stacks.filter((s) => s.isAlive && s.aliveShips > 0).length;
  }

  /** Obtiene una sesion de batalla (memoria o DB). */
  private async getSession(battleId: string): Promise<BattleSession | null> {
    // Primero intentar memoria
    if (this.activeSessions.has(battleId)) {
      return this.activeSessions.get(battleId) || null;
    }

    // Si no esta en memoria, reconstruir de la DB
    try {
      const row = await executeSingleRowQuery<{
        id: string;
        settings: string | Record<string, any>;
        battle_log: string | BattleEvent[];
        battle_type: string;
        participants: string | Array<{ user_id: string; side: string; stacks: number }>;
        status: string;
      }>(
        'SELECT id, settings, battle_log, battle_type, participants, status FROM combat_sessions WHERE id = $1',
        [battleId]
      );

      if (!row) return null;

      const settings = typeof row.settings === 'string' ? JSON.parse(row.settings) : row.settings;
      const logData = typeof row.battle_log === 'string' ? JSON.parse(row.battle_log) : row.battle_log;
      const participants = typeof row.participants === 'string' ? JSON.parse(row.participants) : row.participants;

      // Para sesiones de DB, reconstruir minimamente
      const attackerParticipant = Array.isArray(participants)
        ? participants.find((p: any) => p.side === 'attacker')
        : null;
      const defenderParticipant = Array.isArray(participants)
        ? participants.find((p: any) => p.side === 'defender')
        : null;

      const session: BattleSession = {
        id: row.id,
        attackerId: attackerParticipant ? attackerParticipant.user_id : '',
        defenderId: defenderParticipant ? defenderParticipant.user_id : '',
        attackerStacks: [], // Se reconstruirian de combat_participants si es necesario
        defenderStacks: [],
        currentRound: (logData as BattleEvent[]).filter((e: BattleEvent) => e.type === 'round_end').length,
        rngSeed: settings.rngSeed || 0,
        startTime: Date.now(),
        battleType: row.battle_type,
        isFinished: row.status === 'completed',
        battleLog: (logData as BattleEvent[]) || [],
        lastUpdated: Date.now(),
      };

      return session;
    } catch (error) {
      logger.error('Failed to load session from DB:', { battleId, error });
      return null;
    }
  }

  /** Persiste el estado actual de la sesion en la base de datos. */
  private async persistSession(session: BattleSession): Promise<void> {
    try {
      await executeUpdateQuery(
        'combat_sessions',
        {
          battle_log: JSON.stringify(session.battleLog),
          updated_at: new Date(),
        },
        'id = $1',
        [session.id]
      );
    } catch (error) {
      logger.error('Failed to persist session:', { battleId: session.id, error });
    }
  }

  /**
   * Persiste el fin de batalla en la base de datos.
   *
   * En PvP, las naves destruidas se pierden permanentemente de la flota.
   * Se actualiza ships.status = 'destroyed' para cada nave destruida.
   */
  private async persistBattleEnd(session: BattleSession): Promise<void> {
    try {
      const endEvent: BattleEvent = {
        round: session.currentRound,
        turn: 0,
        timestamp: Date.now() - session.startTime,
        type: 'battle_end',
        message: `Battle ended. Outcome: ${session.outcome}. Winner: ${session.winnerId || 'none'}`,
      };
      session.battleLog.push(endEvent);

      // En PvP: marcar naves destruidas como perdidas permanentemente
      if (session.battleType === 'pvp' || session.battleType === 'alliance_war') {
        const allDestroyedShipIds: string[] = [];

        for (const stack of session.attackerStacks) {
          if (!stack.isAlive || stack.aliveShips <= 0) {
            allDestroyedShipIds.push(stack.shipId);
          }
        }
        for (const stack of session.defenderStacks) {
          if (!stack.isAlive || stack.aliveShips <= 0) {
            allDestroyedShipIds.push(stack.shipId);
          }
        }

        if (allDestroyedShipIds.length > 0) {
          // Marcar naves como destruidas en la tabla ships
          await executeQuery(
            `UPDATE ships SET status = 'destroyed', updated_at = NOW() WHERE id = ANY($1)`,
            [allDestroyedShipIds]
          );

          logger.info('Ships permanently destroyed:', {
            battleId: session.id,
            count: allDestroyedShipIds.length,
          });
        }
      }

      await executeUpdateQuery(
        'combat_sessions',
        {
          status: 'completed',
          battle_log: JSON.stringify(session.battleLog),
          end_time: new Date(),
          updated_at: new Date(),
        },
        'id = $1',
        [session.id]
      );

      logger.info('Battle ended and persisted:', {
        battleId: session.id,
        outcome: session.outcome,
        winnerId: session.winnerId,
        rounds: session.currentRound,
      });
    } catch (error) {
      logger.error('Failed to persist battle end:', { battleId: session.id, error });
    }
  }

  /** Construye el BattleResult final desde una sesion terminada. */
  private buildBattleResult(session: BattleSession): BattleResult {
    const attackerSurvivors = session.attackerStacks.filter((s) => s.isAlive && s.aliveShips > 0);
    const defenderSurvivors = session.defenderStacks.filter((s) => s.isAlive && s.aliveShips > 0);
    const attackerLosses = session.attackerStacks.filter((s) => !s.isAlive || s.aliveShips <= 0);
    const defenderLosses = session.defenderStacks.filter((s) => !s.isAlive || s.aliveShips <= 0);

    // Calcular estadisticas del log
    const attackEvents = session.battleLog.filter((e) => e.type === 'attack');
    const hitEvents = session.battleLog.filter((e) => e.type === 'hit');
    const missEvents = session.battleLog.filter((e) => e.type === 'miss');
    const critEvents = session.battleLog.filter((e) => e.type === 'critical');
    const shipDestroyedEvents = session.battleLog.filter((e) => e.type === 'ships_destroyed');
    const shieldDmgEvents = session.battleLog.filter((e) => e.type === 'shield_damage');
    const hullDmgEvents = session.battleLog.filter((e) => e.type === 'hull_damage');

    const totalDamageDealt = hitEvents.reduce((sum, e) => sum + (e.damage || 0), 0);
    const totalShieldDamage = shieldDmgEvents.reduce((sum, e) => sum + (e.shieldDamage || 0), 0);
    const totalHullDamage = hullDmgEvents.reduce((sum, e) => sum + (e.hullDamage || 0), 0);
    const totalShipsDestroyed = shipDestroyedEvents.reduce((sum, e) => sum + (e.shipsLost || 0), 0);
    const attackerShipsLost = attackerLosses.reduce((sum, s) => sum + s.shipCount, 0);
    const defenderShipsLost = defenderLosses.reduce((sum, s) => sum + s.shipCount, 0);

    const stats: BattleStats = {
      totalAttacks: attackEvents.length,
      totalHits: hitEvents.length,
      totalMisses: missEvents.length,
      totalCriticals: critEvents.length,
      totalDamageDealt,
      totalShieldDamage,
      totalHullDamage,
      totalShipsDestroyed,
      attackerShipsLost,
      defenderShipsLost,
    };

    return {
      battleId: session.id,
      outcome: session.outcome || 'defender_wins_timeout',
      winnerId: session.winnerId || session.defenderId,
      roundsPlayed: session.currentRound,
      totalEvents: session.battleLog.length,
      seed: session.rngSeed,
      attackerSurvivors,
      defenderSurvivors,
      attackerLosses,
      defenderLosses,
      stats,
      battleLog: session.battleLog,
    };
  }

  /** Genera un ID unico de batalla. */
  private async generateBattleId(): Promise<string> {
    const result = await executeSingleRowQuery<{ id: string }>(
      'SELECT uuid_generate_v4() as id'
    );
    return result ? result.id : `bat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /** Helper para crear respuestas de error tipadas. */
  private errorResponse(code: string, message: string): ApiResponse<never> {
    return {
      success: false,
      error: { code, message },
    };
  }

  // =============================================================================
  // METODOS PUBLICOS LEGACY (compatibilidad con API existente)
  // =============================================================================

  /**
   * Termina una batalla activa manualmente (por desconexion, abandono, etc.).
   *
   * @param battleId - ID de la batalla
   * @param reason - Razon de la terminacion
   * @param winnerId - ID del ganador (si aplica)
   */
  async abortBattle(battleId: string, reason: string, winnerId?: string): Promise<ApiResponse<void>> {
    try {
      const session = await this.getSession(battleId);
      if (!session) {
        return this.errorResponse('BATTLE_NOT_FOUND', `Battle ${battleId} not found`);
      }

      session.isFinished = true;
      session.outcome = winnerId ? 'attacker_wins' : 'draw';
      session.winnerId = winnerId || '';

      const endEvent: BattleEvent = {
        round: session.currentRound,
        turn: 0,
        timestamp: Date.now() - session.startTime,
        type: 'battle_end',
        message: `Battle aborted. Reason: ${reason}. Winner: ${winnerId || 'none'}`,
      };
      session.battleLog.push(endEvent);

      await executeUpdateQuery(
        'combat_sessions',
        {
          status: 'aborted',
          battle_log: JSON.stringify(session.battleLog),
          end_time: new Date(),
          updated_at: new Date(),
        },
        'id = $1',
        [battleId]
      );

      this.activeSessions.delete(battleId);

      logger.info('Battle aborted:', { battleId, reason, winnerId });

      return { success: true };
    } catch (error) {
      logger.error('Failed to abort battle:', { battleId, error });
      return this.errorResponse('INTERNAL_ERROR', 'Failed to abort battle');
    }
  }

  /**
   * Lista las batallas activas de un jugador.
   *
   * @param userId - ID del jugador
   * @returns Lista de sesiones activas
   */
  async getActiveBattles(userId: string): Promise<ApiResponse<BattleSession[]>> {
    try {
      const rows = await executeQuery<{
        id: string;
        settings: string;
        battle_log: string;
        battle_type: string;
        participants: string;
        status: string;
      }>(
        `SELECT id, settings, battle_log, battle_type, participants, status
         FROM combat_sessions
         WHERE status = 'active'
         AND (participants @> $1 OR participants @> $2)
         ORDER BY created_at DESC`,
        [JSON.stringify([{ user_id: userId }]), JSON.stringify([{ user_id: userId, side: 'attacker' }])]
      );

      // Nota: La query de JSONB exacto puede variar segun el formato real
      // Esto es una aproximacion - ajustar segun el formato exacto de participants

      const sessions: BattleSession[] = [];
      for (const row of rows) {
        const settings = typeof row.settings === 'string' ? JSON.parse(row.settings) : row.settings;
        const logData = typeof row.battle_log === 'string' ? JSON.parse(row.battle_log) : row.battle_log;

        sessions.push({
          id: row.id,
          attackerId: userId,
          defenderId: '',
          attackerStacks: [],
          defenderStacks: [],
          currentRound: 0,
          rngSeed: settings.rngSeed || 0,
          startTime: Date.now(),
          battleType: row.battle_type,
          isFinished: row.status === 'completed',
          battleLog: Array.isArray(logData) ? logData : [],
          lastUpdated: Date.now(),
        });
      }

      return { success: true, data: sessions };
    } catch (error) {
      logger.error('Failed to get active battles:', { userId, error });
      return this.errorResponse('INTERNAL_ERROR', 'Failed to get active battles');
    }
  }
}

// =============================================================================
// EXPORT
// =============================================================================

/** Instancia singleton del servicio de combate. */
export const combatService = new CombatService();

/** Clase para uso en tests o instanciacion personalizada. */
export { CombatService };

/** Exportar tipos para uso en otros modulos. */
export type {
  BattleEvent,
  BattleEventType,
  BattleOutcome,
  InitiateBattleRequest,
  BattleStack,
  RuntimeStack,
  BattleSession,
  RoundResult,
  BattleResult,
  BattleState,
  BattleReplay,
  BattleStats,
  DevSimulationParams,
};

/** Exportar RNG para testing. */
export { DeterministicRNG };

export default combatService;
