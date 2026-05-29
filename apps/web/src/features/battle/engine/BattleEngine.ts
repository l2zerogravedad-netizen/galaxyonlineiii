/**
 * ========================================================================
 * Galaxy Online 3 — Battle Engine
 * ========================================================================
 * Máquina de estados principal que orquesta el combate por rondas.
 * Coordina todas las fases: ROUND_START → MOVEMENT → INITIATIVE →
 * ATTACK → DEFENSE → RESOLUTION → ROUND_END.
 *
 * Incluye mecánica de Successive Strikes (M08):
 * - Cada punto de Speed del comandante da +0.05% chance de ataque adicional
 * - Máximo 3 ataques sucesivos por stack por ronda
 * - Evento SUCCESSIVE_STRIKE emitido para animación en frontend
 *
 * Basado en las mecánicas de Galaxy Online 2 (GO2).
 *
 * @module battle/engine/BattleEngine
 * ========================================================================
 */

import type {
  ShipStack,
  BattleConfig,
  BattleEvent,
  BattleEventListener,
  Weapon,
  BattlePhase,
  Faction,
} from './types';
import { BattleState, MAX_SUCCESSIVE_STRIKES, SUCCESSIVE_STRIKE_CHANCE_PER_SPEED } from './types';
import { SeededRNG } from './DamageSystem';
import { calculateAttack, aggregateDamage } from './DamageSystem';
import {
  calculateInitiativeOrder,
  getEffectiveStack,
} from './CommanderSystem';
import {
  regenerateAllShields,
  applyHullDamage,
  applyShieldDamage,
  isStackAlive,
  countAliveStacks,
  checkDefeat,
  processEOS,
} from './ShieldSystem';
import {
  getAvailableWeapons,
  findValidTargets,
  selectWeakestTarget,
  consumeHe3,
  isInterceptable,
  calculateInterceptChance,
  applyWeaponCooldown,
  decrementCooldowns,
  getArmorMultiplier,
} from './WeaponSystem';

// ============================================================================
// PHASE ARRAY
// ============================================================================

/** Orden de fases en cada ronda */
const PHASE_ORDER: BattlePhase[] = [
  'ROUND_START',
  'MOVEMENT',
  'INITIATIVE',
  'ATTACK',
  'DEFENSE',
  'RESOLUTION',
  'ROUND_END',
];

// ============================================================================
// BATTLE ENGINE CLASS
// ============================================================================

export class BattleEngine {
  // --- Estado ---
  private state: BattleState = BattleState.SETUP;
  private currentRound: number = 0;
  private maxRounds: number = 99;
  private currentPhase: BattlePhase = 'ROUND_START';
  private phaseIndex: number = 0;

  // --- Stacks ---
  private attackerStacks: ShipStack[] = [];
  private defenderStacks: ShipStack[] = [];

  // --- RNG ---
  private rng: SeededRNG;

  // --- Config ---
  private baseAccuracy: number = 0.70;

  // --- Eventos ---
  private listeners: Set<BattleEventListener> = new Set();

  // --- Battle log ---
  private eventLog: BattleEvent[] = [];

  // --- Debug ---
  private debugMode: boolean = false;

  // --- Successive Strike tracking (M08) ---
  /** Map<stackId, strikesUsedThisRound> para tracking de successive strikes */
  private successiveStrikesUsed: Map<string, number> = new Map();

  /**
   * Crea una nueva instancia del motor de batalla.
   *
   * @param config - Configuración de la batalla
   */
  constructor(config: BattleConfig) {
    this.attackerStacks = config.attackerStacks.map((s) => ({
      ...s,
      weaponCooldowns: new Map(s.weaponCooldowns),
    }));
    this.defenderStacks = config.defenderStacks.map((s) => ({
      ...s,
      weaponCooldowns: new Map(s.weaponCooldowns),
    }));
    this.rng = new SeededRNG(config.seed);
    this.baseAccuracy = config.baseAccuracy ?? 0.70;

    // Calcular maxRounds
    const attackerCount = config.attackerStacks.filter(
      (s) => s.currentShips > 0
    ).length;
    const defenderCount = config.defenderStacks.filter(
      (s) => s.currentShips > 0
    ).length;
    this.maxRounds =
      config.maxRounds ??
      Math.min(20 + attackerCount + defenderCount, 99);

    this.state = BattleState.IN_PROGRESS;
    this.debugMode = false;
  }

  // ============================================================================
  // EVENT SYSTEM
  // ============================================================================

  /**
   * Suscribe un listener a eventos de batalla.
   * Retorna función para desuscribirse.
   */
  public onEvent(listener: BattleEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Emite un evento a todos los listeners */
  private emit(event: BattleEvent): void {
    this.eventLog.push(event);
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        // No dejar que un listener falle afecte a otros
        if (this.debugMode) {
          console.error('BattleEvent listener error:', err);
        }
      }
    }
  }

  /** Activa/desactiva modo debug */
  public setDebug(enabled: boolean): void {
    this.debugMode = enabled;
  }

  // ============================================================================
  // GETTERS
  // ============================================================================

  /** Estado actual de la batalla */
  public getState(): BattleState {
    return this.state;
  }

  /** Ronda actual */
  public getCurrentRound(): number {
    return this.currentRound;
  }

  /** Máximo de rondas */
  public getMaxRounds(): number {
    return this.maxRounds;
  }

  /** Fase actual */
  public getCurrentPhase(): BattlePhase {
    return this.currentPhase;
  }

  /** Stacks del atacante */
  public getAttackerStacks(): readonly ShipStack[] {
    return this.attackerStacks;
  }

  /** Stacks del defensor */
  public getDefenderStacks(): readonly ShipStack[] {
    return this.defenderStacks;
  }

  /** Todos los stacks vivos */
  public getAllAliveStacks(): ShipStack[] {
    return [
      ...this.attackerStacks.filter(isStackAlive),
      ...this.defenderStacks.filter(isStackAlive),
    ];
  }

  /** Log de eventos completo */
  public getEventLog(): readonly BattleEvent[] {
    return this.eventLog;
  }

  /** Verifica si la batalla ha terminado */
  public isBattleOver(): boolean {
    return (
      this.state === BattleState.ATTACKER_WINS ||
      this.state === BattleState.DEFENDER_WINS ||
      this.state === BattleState.DRAW
    );
  }

  // ============================================================================
  // ROUND PROCESSING
  // ============================================================================

  /**
   * Ejecuta una ronda completa automáticamente.
   * Retorna true si la batalla sigue en curso.
   */
  public processRound(): boolean {
    if (this.isBattleOver()) return false;

    this.currentRound++;

    // Reiniciar tracking de successive strikes al inicio de cada ronda
    this.successiveStrikesUsed.clear();

    // Verificar límite de rondas
    if (this.currentRound > this.maxRounds) {
      this.state = BattleState.DRAW;
      this.emit({
        type: 'BATTLE_END',
        winner: 'draw',
        reason: `Round limit reached (${this.maxRounds})`,
      });
      return false;
    }

    this.emit({
      type: 'ROUND_START',
      round: this.currentRound,
      maxRounds: this.maxRounds,
    });

    // Ejecutar cada fase en orden
    this.phaseIndex = 0;
    for (const phase of PHASE_ORDER) {
      this.currentPhase = phase;
      this.emit({ type: 'PHASE_CHANGE', phase });
      this.executePhase(phase);

      // Verificar victoria después de fases críticas
      if (
        phase === 'RESOLUTION' ||
        phase === 'ROUND_END'
      ) {
        if (this.checkVictoryConditions()) {
          return false;
        }
      }
    }

    this.emit({ type: 'ROUND_END', round: this.currentRound });

    return !this.isBattleOver();
  }

  /**
   * Ejecuta la batalla completa hasta el final.
   * Retorna el resultado final.
   */
  public runBattle(): {
    winner: 'attacker' | 'defender' | 'draw';
    finalRound: number;
    attackerRemaining: number;
    defenderRemaining: number;
  } {
    while (!this.isBattleOver()) {
      this.processRound();
    }

    const attackerRemaining = countAliveStacks(this.attackerStacks);
    const defenderRemaining = countAliveStacks(this.defenderStacks);

    let winner: 'attacker' | 'defender' | 'draw';
    switch (this.state) {
      case BattleState.ATTACKER_WINS:
        winner = 'attacker';
        break;
      case BattleState.DEFENDER_WINS:
        winner = 'defender';
        break;
      default:
        winner = 'draw';
    }

    return {
      winner,
      finalRound: this.currentRound,
      attackerRemaining,
      defenderRemaining,
    };
  }

  // ============================================================================
  // PHASE EXECUTION
  // ============================================================================

  /** Ejecuta una fase específica */
  private executePhase(phase: BattlePhase): void {
    switch (phase) {
      case 'ROUND_START':
        this.phaseRoundStart();
        break;
      case 'MOVEMENT':
        this.phaseMovement();
        break;
      case 'INITIATIVE':
        this.phaseInitiative();
        break;
      case 'ATTACK':
        this.phaseAttack();
        break;
      case 'DEFENSE':
        this.phaseDefense();
        break;
      case 'RESOLUTION':
        this.phaseResolution();
        break;
      case 'ROUND_END':
        this.phaseRoundEnd();
        break;
      default:
        // Exhaustive check
        const _exhaustive: never = phase;
        throw new Error(`Unknown phase: ${_exhaustive}`);
    }
  }

  /** Fase ROUND_START: regenerar escudos, aplicar buffs */
  private phaseRoundStart(): void {
    this.attackerStacks = regenerateAllShields(this.attackerStacks);
    this.defenderStacks = regenerateAllShields(this.defenderStacks);
  }

  /** Fase MOVEMENT: naves se mueven hacia el enemigo */
  private phaseMovement(): void {
    // Movimiento simplificado: avanzar hacia el centro
    const moveStack = (stack: ShipStack): ShipStack => {
      if (stack.currentShips <= 0) return stack;

      const isAttacker = stack.faction === 'attacker';
      const moveDistance = stack.movement;

      // Atacante avanza hacia posiciones mayores (hacia 12)
      // Defensor avanza hacia posiciones menores (hacia 13)
      let newPos: number;
      if (isAttacker) {
        newPos = Math.min(12, stack.position + moveDistance);
      } else {
        newPos = Math.max(13, stack.position - moveDistance);
      }

      return { ...stack, position: newPos };
    };

    this.attackerStacks = this.attackerStacks.map(moveStack);
    this.defenderStacks = this.defenderStacks.map(moveStack);
  }

  /** Fase INITIATIVE: calcular orden de ataque */
  private phaseInitiative(): void {
    // El orden de iniciativa se calcula en la fase ATTACK
    // Aquí podrían aplicarse habilidades que afectan iniciativa
  }

  /** Fase ATTACK: ejecutar ataques en orden de iniciativa */
  private phaseAttack(): void {
    const allStacks = this.getAllAliveStacks();
    const initiativeOrder = calculateInitiativeOrder(allStacks);

    for (const entry of initiativeOrder) {
      if (this.isBattleOver()) break;

      const stack = allStacks.find((s) => s.id === entry.stackId);
      if (!stack || stack.currentShips <= 0) continue;

      this.emit({
        type: 'TURN_START',
        stackId: stack.id,
        commanderName: entry.commanderName,
        speed: entry.speed,
      });

      // Ejecutar ataque del stack
      this.executeStackAttack(stack);

      // ── M08: Successive Strikes ────────────────────────────────────────
      // Después del ataque inicial, intentar ataques adicionales basados
      // en la velocidad del comandante.
      this.processSuccessiveStrikes(stack);
    }
  }

  // ============================================================================
  // SUCCESSIVE STRIKES (M08)
  // ============================================================================

  /**
   * Procesa los successive strikes para un stack después de su ataque inicial.
   *
   * Mecánica GO2: "Successive Strike Rate: The chance to attack multiple times
   * per round. 1 speed = +0.05% chance"
   *
   * - chance = commander.speed * 0.0005 (0.05% por punto de speed)
   * - Máximo 3 ataques sucesivos por stack por ronda
   * - Emite evento SUCCESSIVE_STRIKE para animación en frontend
   */
  private processSuccessiveStrikes(originalStack: ShipStack): void {
    // Solo si el stack tiene comandante
    if (!originalStack.commander) return;

    const commanderSpeed = originalStack.commander.speed;
    if (commanderSpeed <= 0) return;

    // Calcular chance base: speed * 0.05%
    const strikeChance = commanderSpeed * SUCCESSIVE_STRIKE_CHANCE_PER_SPEED;

    for (
      let strikeNumber = 2;
      strikeNumber <= MAX_SUCCESSIVE_STRIKES;
      strikeNumber++
    ) {
      if (this.isBattleOver()) break;

      // Verificar que el stack sigue vivo (obtener versión actualizada)
      const currentStack = this.findStackById(originalStack.id);
      if (!currentStack || currentStack.currentShips <= 0) break;

      // Verificar límite de strikes para este stack en esta ronda
      const strikesUsed = this.successiveStrikesUsed.get(originalStack.id) ?? 0;
      if (strikesUsed >= MAX_SUCCESSIVE_STRIKES - 1) break; // -1 porque el ataque inicial no cuenta

      // RNG check para successive strike
      if (!this.rng.chance(strikeChance)) {
        // Falló el RNG, no hay strike adicional
        break;
      }

      // ── Successive Strike exitoso ─────────────────────────────────────

      // Incrementar contador
      this.successiveStrikesUsed.set(originalStack.id, strikesUsed + 1);

      // Emitir evento SUCCESSIVE_STRIKE para animación frontend
      this.emit({
        type: 'SUCCESSIVE_STRIKE',
        stackId: currentStack.id,
        attackNumber: strikeNumber,
        commanderName: currentStack.commander?.name ?? 'Unknown',
        speed: commanderSpeed,
      });

      // Ejecutar ataque adicional
      this.executeStackAttack(currentStack);
    }
  }

  /** Busca un stack por ID en los arrays de atacante o defensor */
  private findStackById(stackId: string): ShipStack | undefined {
    return (
      this.attackerStacks.find((s) => s.id === stackId) ??
      this.defenderStacks.find((s) => s.id === stackId)
    );
  }

  // ============================================================================
  // STACK ATTACK
  // ============================================================================

  /**
   * D05: Calcula la distancia entre dos posiciones en el grid.
   */
  private calculateDistance(posA: number, posB: number): number {
    return Math.abs(posA - posB);
  }

  /**
   * D05: Selecciona el objetivo más débil que esté dentro del rango de movement.
   * Naves con menos movement no pueden alcanzar objetivos lejanos.
   */
  private selectTarget(attacker: ShipStack, enemies: ShipStack[]): ShipStack | null {
    // Encontrar enemigos en rango (movement del atacante)
    const inRange = enemies.filter((e) => {
      const distance = this.calculateDistance(attacker.position, e.position);
      return distance <= attacker.movement && e.currentShips > 0;
    });

    if (inRange.length === 0) return null;

    // Seleccionar el más débil (menor currentHull)
    return inRange.sort((a, b) => a.currentHull - b.currentHull)[0];
  }

  /**
   * Ejecuta el ataque de un stack contra el enemigo más débil disponible.
   */
  private executeStackAttack(attacker: ShipStack): void {
    const enemies =
      attacker.faction === 'attacker'
        ? this.defenderStacks
        : this.attackerStacks;

    const aliveEnemies = enemies.filter((e) => e.currentShips > 0);
    if (aliveEnemies.length === 0) return;

    // Obtener armas disponibles
    const weapons = getAvailableWeapons(attacker);
    if (weapons.length === 0) {
      // Sin He3 o todas en cooldown
      if (attacker.he3 <= 0) {
        this.emit({ type: 'HE3_DEPLETED', stackId: attacker.id });
      }
      return;
    }

    // Por cada arma disponible, atacar
    for (const weapon of weapons) {
      if (attacker.he3 < weapon.he3Consumption) continue;

      // Encontrar objetivos en rango (arma + movement)
      const validTargets = findValidTargets(attacker, aliveEnemies, weapon);
      if (validTargets.length === 0) continue;

      // Seleccionar objetivo (más débil en rango de movement)
      const target = selectWeakestTarget(validTargets);
      if (!target) continue;

      // Consumir He3
      const he3Result = consumeHe3(attacker, weapon.he3Consumption);
      attacker = he3Result.stack;
      this.updateStack(attacker);

      if (he3Result.depleted) {
        this.emit({ type: 'HE3_DEPLETED', stackId: attacker.id });
      }

      // Calcular armor type del defensor (default regen)
      const armorType = 'regen' as const;

      // Ejecutar ataque
      const attackResult = calculateAttack(
        attacker,
        target,
        weapon,
        this.baseAccuracy,
        armorType,
        this.rng
      );

      // Emitir eventos del ataque
      for (const event of attackResult.events) {
        this.emit(event);
      }

      // Aplicar daño al defensor
      const aggregated = aggregateDamage(attackResult.damageResults);

      if (aggregated.totalHullDamage > 0 || aggregated.totalShieldDamage > 0) {
        // Aplicar daño combinado
        const totalDamage =
          aggregated.totalHullDamage + aggregated.totalShieldDamage;
        const updatedTarget = this.applyDamageToStack(target, totalDamage);
        this.updateStack(updatedTarget);
      }

      // Aplicar cooldown
      const withCd = applyWeaponCooldown(attacker, weapon);
      attacker = withCd;
      this.updateStack(attacker);

      // Scatter damage (ballistic only)
      if (weapon.type === 'ballistic' && weapon.scatterRange) {
        this.applyScatterDamage(
          aggregated.totalHullDamage + aggregated.totalShieldDamage,
          attacker,
          target,
          aliveEnemies
        );
      }

      // Verificar victoria después de cada ataque
      if (this.checkVictoryConditions()) break;
    }
  }

  /** Fase DEFENSE: intercept, shield effects */
  private phaseDefense(): void {
    // Los intercepts se procesan durante la fase ATTACK
    // Aquí podrían aplicarse efectos defensivos pasivos
  }

  /** Fase RESOLUTION: limpieza de stacks destruidos */
  private phaseResolution(): void {
    // Los stacks ya se actualizan durante ATTACK
    // Aquí se limpian stacks con 0 naves
    this.attackerStacks = this.attackerStacks.filter(isStackAlive);
    this.defenderStacks = this.defenderStacks.filter(isStackAlive);
  }

  /** Fase ROUND_END: decrementar CDs, check victoria */
  private phaseRoundEnd(): void {
    // Decrementar cooldowns
    this.attackerStacks = this.attackerStacks.map(decrementCooldowns);
    this.defenderStacks = this.defenderStacks.map(decrementCooldowns);
  }

  // ============================================================================
  // DAMAGE APPLICATION
  // ============================================================================

  /**
   * Aplica daño total a un stack (escudo + casco).
   */
  private applyDamageToStack(
    target: ShipStack,
    totalDamage: number
  ): ShipStack {
    if (totalDamage <= 0 || target.currentShips <= 0) return target;

    // 1. Aplicar a escudos
    const shieldResult = applyShieldDamage(target, totalDamage);
    for (const ev of shieldResult.events) this.emit(ev);

    let currentStack = shieldResult.stack;

    // 2. Overflow al casco
    if (shieldResult.overflow > 0) {
      const hullResult = applyHullDamage(currentStack, shieldResult.overflow);
      for (const ev of hullResult.events) this.emit(ev);
      currentStack = hullResult.stack;
    }

    return currentStack;
  }

  /**
   * Aplica daño scatter a stacks adyacentes.
   */
  private applyScatterDamage(
    sourceDamage: number,
    _attacker: ShipStack,
    primaryTarget: ShipStack,
    allEnemies: ShipStack[]
  ): void {
    if (sourceDamage <= 0) return;

    const adjacentPositions = [
      primaryTarget.position - 1,
      primaryTarget.position + 1,
    ];

    for (const adjPos of adjacentPositions) {
      const adjacent = allEnemies.find(
        (e) => e.position === adjPos && e.currentShips > 0
      );
      if (!adjacent || adjacent.id === primaryTarget.id) continue;

      const scatterDamage = Math.floor(sourceDamage * 0.15);
      if (scatterDamage <= 0) continue;

      this.emit({
        type: 'SCATTER_DAMAGE',
        sourceId: primaryTarget.id,
        targetId: adjacent.id,
        damage: scatterDamage,
      });

      const updated = this.applyDamageToStack(adjacent, scatterDamage);
      this.updateStack(updated);
    }
  }

  // ============================================================================
  // VICTORY CONDITIONS
  // ============================================================================

  /**
   * Verifica condiciones de victoria y actualiza el estado.
   * @returns true si la batalla ha terminado
   */
  private checkVictoryConditions(): boolean {
    const attackerAlive = countAliveStacks(this.attackerStacks);
    const defenderAlive = countAliveStacks(this.defenderStacks);

    if (attackerAlive === 0 && defenderAlive === 0) {
      this.state = BattleState.DRAW;
      this.emit({
        type: 'BATTLE_END',
        winner: 'draw',
        reason: 'Mutual annihilation',
      });
      return true;
    }

    if (defenderAlive === 0) {
      this.state = BattleState.ATTACKER_WINS;
      this.emit({
        type: 'BATTLE_END',
        winner: 'attacker',
        reason: `All defender stacks destroyed at round ${this.currentRound}`,
      });
      return true;
    }

    if (attackerAlive === 0) {
      this.state = BattleState.DEFENDER_WINS;
      this.emit({
        type: 'BATTLE_END',
        winner: 'defender',
        reason: `All attacker stacks destroyed at round ${this.currentRound}`,
      });
      return true;
    }

    if (this.currentRound >= this.maxRounds) {
      this.state = BattleState.DRAW;
      this.emit({
        type: 'BATTLE_END',
        winner: 'draw',
        reason: `Round limit reached (${this.maxRounds})`,
      });
      return true;
    }

    return false;
  }

  // ============================================================================
  // STACK MANAGEMENT
  // ============================================================================

  /** Actualiza un stack en el array correspondiente */
  private updateStack(updated: ShipStack): void {
    if (updated.faction === 'attacker') {
      const idx = this.attackerStacks.findIndex((s) => s.id === updated.id);
      if (idx >= 0) {
        this.attackerStacks[idx] = updated;
      }
    } else {
      const idx = this.defenderStacks.findIndex((s) => s.id === updated.id);
      if (idx >= 0) {
        this.defenderStacks[idx] = updated;
      }
    }
  }

  // ============================================================================
  // INTERCEPT
  // ============================================================================

  /**
   * Intenta interceptar un misil en vuelo.
   * @returns true si el intercept fue exitoso
   */
  public attemptIntercept(
    interceptor: ShipStack,
    weapon: Weapon,
    attacker: ShipStack
  ): boolean {
    if (!isInterceptable(weapon)) return false;

    const chance = calculateInterceptChance();

    const success = this.rng.chance(chance);

    this.emit({
      type: 'INTERCEPT',
      interceptorId: interceptor.id,
      targetWeapon: weapon.type,
      success,
    });

    return success;
  }

  // ============================================================================
  // SNAPSHOT / SERIALIZATION
  // ============================================================================

  /**
   * Toma una instantánea del estado actual de la batalla.
   */
  public getSnapshot(): {
    state: BattleState;
    round: number;
    maxRounds: number;
    phase: BattlePhase;
    attackerStacks: ShipStack[];
    defenderStacks: ShipStack[];
  } {
    return {
      state: this.state,
      round: this.currentRound,
      maxRounds: this.maxRounds,
      phase: this.currentPhase,
      attackerStacks: this.attackerStacks.map((s) => ({ ...s })),
      defenderStacks: this.defenderStacks.map((s) => ({ ...s })),
    };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Crea y configura un BattleEngine listo para usar.
 *
 * @param config - Configuración de la batalla
 * @returns Instancia de BattleEngine
 */
export function createBattleEngine(config: BattleConfig): BattleEngine {
  return new BattleEngine(config);
}
