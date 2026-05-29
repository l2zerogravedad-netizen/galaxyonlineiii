/**
 * ========================================================================
 * Galaxy Online 3 — Battle Engine
 * ========================================================================
 * Máquina de estados principal que orquesta el combate por rondas.
 * Coordina todas las fases: ROUND_START → MOVEMENT → INITIATIVE →
 * ATTACK → DEFENSE → RESOLUTION → ROUND_END.
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
  ArmorType,
} from './types';
import { BattleState } from './types';
import { SeededRNG } from './DamageSystem';
import {
  calculateAttack,
  aggregateDamage,
  computeBinomialHits,
} from './DamageSystem';
import {
  calculateInitiativeOrder,
  getEffectiveStack,
  getPassiveDamageBonus,
  getPassiveShieldBonus,
  getPassiveSpeedBonus,
  getCriticalBonusFromSkills,
  getExtraAttacksFromSkills,
  shouldTriggerSkill,
  isStackParalyzed,
  applySkillEffect,
  decrementSkillDurations,
  getSkillEffects,
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
  applyWeaponCooldown,
  decrementCooldowns,
  getArmorMultiplier,
  attemptPPCIntercept,
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

  /**
   * Crea una nueva instancia del motor de batalla.
   *
   * @param config - Configuración de la batalla
   */
  constructor(config: BattleConfig) {
    this.attackerStacks = config.attackerStacks.map((s) => ({
      ...s,
      weaponCooldowns: new Map(s.weaponCooldowns),
      activeSkillStates: s.activeSkillStates ?? [],
    }));
    this.defenderStacks = config.defenderStacks.map((s) => ({
      ...s,
      weaponCooldowns: new Map(s.weaponCooldowns),
      activeSkillStates: s.activeSkillStates ?? [],
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

  /** Fase ROUND_START: regenerar escudos, aplicar buffs, skills activas de defensa */
  private phaseRoundStart(): void {
    // Regenerar escudos base
    this.attackerStacks = regenerateAllShields(this.attackerStacks);
    this.defenderStacks = regenerateAllShields(this.defenderStacks);

    // Aplicar skills activas de defensa (Shield Boost) en ambos bandos
    this.attackerStacks = this.attackerStacks.map((s) =>
      this.processRoundStartSkills(s)
    );
    this.defenderStacks = this.defenderStacks.map((s) =>
      this.processRoundStartSkills(s)
    );
  }

  /**
   * Procesa skills activas de defensa al inicio de ronda (Shield Boost, etc).
   * Verifica si la skill se activa y aplica el efecto.
   */
  private processRoundStartSkills(stack: ShipStack): ShipStack {
    if (!stack.commander?.skill || stack.currentShips <= 0) return stack;

    const skill = stack.commander.skill;

    // Solo skills activas de tipo burst/defensa
    if (skill.type !== 'active_burst' && skill.type !== 'passive_defense')
      return stack;

    // Verificar si tiene efecto de shield
    const shieldEffects = skill.effects.filter(
      (e) => e.effectType === 'shield_boost' || e.stat === 'shield_regen'
    );

    if (shieldEffects.length === 0) return stack;

    // Verificar activación (para activas)
    if (
      skill.type === 'active_burst' &&
      !shouldTriggerSkill(
        skill,
        this.rng,
        stack.commander.electron
      )
    ) {
      return stack;
    }

    // Aplicar efecto de regeneración de escudo
    let currentStack = { ...stack };
    for (const effect of shieldEffects) {
      const result = applySkillEffect(effect, currentStack, currentStack);
      currentStack = result.stack;
      for (const ev of result.events) {
        this.emit(ev);
      }
    }

    // Emitir evento de skill triggered
    this.emit({
      type: 'SKILL_TRIGGER',
      stackId: stack.id,
      skillName: skill.name,
      description: `${stack.commander.name} triggers ${skill.name}: ${skill.description}`,
    });

    return currentStack;
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

    // Decrementar duraciones de skills activas antes de atacar
    this.attackerStacks = this.attackerStacks.map(decrementSkillDurations);
    this.defenderStacks = this.defenderStacks.map(decrementSkillDurations);

    // Recalcular stacks vivos después de decrementar
    const refreshedStacks = this.getAllAliveStacks();
    const initiativeOrder = calculateInitiativeOrder(refreshedStacks);

    for (const entry of initiativeOrder) {
      if (this.isBattleOver()) break;

      const stack = refreshedStacks.find((s) => s.id === entry.stackId);
      if (!stack || stack.currentShips <= 0) continue;

      // === CHECK PARALYZE: Stack paralizado no ataca esta ronda ===
      if (isStackParalyzed(stack)) {
        this.emit({
          type: 'TURN_START',
          stackId: stack.id,
          commanderName: entry.commanderName,
          speed: entry.speed,
        });
        // Stack paralizado: salta su turno
        continue;
      }

      this.emit({
        type: 'TURN_START',
        stackId: stack.id,
        commanderName: entry.commanderName,
        speed: entry.speed,
      });

      // Ejecutar ataque del stack con skills
      this.executeStackAttack(stack);
    }
  }

  /**
   * Ejecuta el ataque de un stack contra el enemigo más débil disponible.
   * Integra skills pasivas (daño, velocidad) y activas (Paralyze, Lucky Strike, Overdrive).
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

    // === SKILLS ACTIVAS BURST: Verificar activación antes de atacar ===
    const commanderSkill = attacker.commander?.skill;
    let extraCritMultiplier = 0;
    let extraAttacks = 0;

    if (commanderSkill?.type.startsWith('active_') && attacker.commander) {
      if (
        shouldTriggerSkill(
          commanderSkill,
          this.rng,
          attacker.commander.electron
        )
      ) {
        // Lucky Strike / Deadly Strike / Lucky Shot: bonus crítico
        const critBonus = getCriticalBonusFromSkills(attacker);
        if (critBonus > 0) {
          extraCritMultiplier = critBonus;
        }

        // Overdrive / Consecutive Strike: ataques extra
        const extraAtk = getExtraAttacksFromSkills(attacker);
        if (extraAtk > 0) {
          extraAttacks = extraAtk;
          this.emit({
            type: 'OVERDRIVE',
            stackId: attacker.id,
            extraAttacks: extraAttacks,
          });
        }

        // Paralyze: aplicar a enemigo aleatorio
        if (commanderSkill.effects.some((e) => e.effectType === 'paralyze')) {
          const target = this.pickRandomEnemy(aliveEnemies);
          if (target) {
            const paraEffect = commanderSkill.effects.find(
              (e) => e.effectType === 'paralyze'
            );
            if (paraEffect) {
              const result = applySkillEffect(paraEffect, attacker, target);
              this.updateStack(result.stack);
              for (const ev of result.events) this.emit(ev);
            }
          }
        }

        // Emitir evento de skill activada
        this.emit({
          type: 'SKILL_TRIGGER',
          stackId: attacker.id,
          skillName: commanderSkill.name,
          description: `${attacker.commander?.name} triggers ${commanderSkill.name}: ${commanderSkill.description}`,
        });
      }
    }

    // Por cada arma disponible, atacar
    for (const weapon of weapons) {
      if (attacker.he3 < weapon.he3Consumption) continue;

      // === BONUS PASIVO DE DAÑO POR TIPO DE ARMA ===
      // Skills como Ballistic Master, Missile Expert, etc.
      const passiveDamageBonus = getPassiveDamageBonus(attacker, weapon.type);

      // Encontrar objetivos en rango
      const validTargets = findValidTargets(attacker, aliveEnemies, weapon);
      if (validTargets.length === 0) continue;

      // Seleccionar objetivo (más débil por defecto)
      const target = selectWeakestTarget(validTargets);
      if (!target) continue;

      // Consumir He3
      const he3Result = consumeHe3(attacker, weapon.he3Consumption);
      attacker = he3Result.stack;
      this.updateStack(attacker);

      if (he3Result.depleted) {
        this.emit({ type: 'HE3_DEPLETED', stackId: attacker.id });
      }

      // Calcular armor type del defensor (default regen si no está seteado)
      const armorType: ArmorType = target.armorType ?? 'regen';

      // PPC Intercept (GO2): cada PPC del defensor tiene 55% de destruir UN misil
      let forcedHits: number | undefined;
      if (isInterceptable(weapon) && target.ppcCount > 0) {
        const hitResult = computeBinomialHits(
          attacker,
          target,
          this.baseAccuracy,
          this.rng
        );
        const incomingMissiles = hitResult.hits;

        if (incomingMissiles > 0) {
          const missilesDestroyed = attemptPPCIntercept(
            target.ppcCount,
            incomingMissiles,
            this.rng
          );

          // Emitir eventos de intercept
          for (let i = 0; i < missilesDestroyed; i++) {
            this.emit({
              type: 'INTERCEPT',
              interceptorId: target.id,
              targetWeapon: weapon.type,
              success: true,
            });
          }

          forcedHits = incomingMissiles - missilesDestroyed;
        }
      }

      // === EJECUTAR ATAQUE CON BONUS DE SKILLS ===
      const numAttacks = 1 + extraAttacks;
      for (let atkIdx = 0; atkIdx < numAttacks; atkIdx++) {
        // Refrescar target (podría haber sido destruido)
        const refreshedTarget = this.findStackById(target.id);
        if (!refreshedTarget || refreshedTarget.currentShips <= 0) break;

        const attackResult = calculateAttack(
          attacker,
          refreshedTarget,
          weapon,
          this.baseAccuracy,
          armorType,
          this.rng,
          atkIdx === 0 ? forcedHits : undefined,
          passiveDamageBonus,
          extraCritMultiplier
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
          const updatedTarget = this.applyDamageToStack(
            refreshedTarget,
            totalDamage
          );
          this.updateStack(updatedTarget);
        }

        // Scatter damage (ballistic only)
        if (weapon.type === 'ballistic' && weapon.scatterRange) {
          const currentEnemies =
            attacker.faction === 'attacker'
              ? this.defenderStacks
              : this.attackerStacks;
          const currentAlive = currentEnemies.filter((e) => e.currentShips > 0);
          this.applyScatterDamage(
            aggregated.totalHullDamage + aggregated.totalShieldDamage,
            attacker,
            refreshedTarget,
            currentAlive
          );
        }

        // Verificar victoria después de cada ataque
        if (this.checkVictoryConditions()) return;
      }

      // Aplicar cooldown
      const withCd = applyWeaponCooldown(attacker, weapon);
      attacker = withCd;
      this.updateStack(attacker);
    }
  }

  /**
   * Encuentra un stack por ID en cualquiera de los dos bandos.
   */
  private findStackById(id: string): ShipStack | undefined {
    return (
      this.attackerStacks.find((s) => s.id === id) ??
      this.defenderStacks.find((s) => s.id === id)
    );
  }

  /**
   * Selecciona un enemigo aleatorio para aplicar debuffs (Paralyze).
   */
  private pickRandomEnemy(enemies: ShipStack[]): ShipStack | undefined {
    if (enemies.length === 0) return undefined;
    const idx = Math.floor(Math.random() * enemies.length);
    return enemies[idx];
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
   * Scatter IGNORA escudos — daño directo al casco (GO2 mechanic).
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

      // 15% base del daño original, modificable por tech/Sandora en el futuro
      const scatterPercent = 0.15;
      const scatterDamage = Math.floor(sourceDamage * scatterPercent);
      if (scatterDamage <= 0) continue;

      this.emit({
        type: 'SCATTER_DAMAGE',
        sourceId: primaryTarget.id,
        targetId: adjacent.id,
        damage: scatterDamage,
      });

      // Scatter CANNOT be absorbed/mitigated by defenses — direct hull damage
      const hullResult = applyHullDamage(adjacent, scatterDamage);
      for (const ev of hullResult.events) this.emit(ev);
      this.updateStack(hullResult.stack);
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
   * Intenta interceptar un misil en vuelo usando PPC (Particle Protection Cannon).
   * En GO2, cada módulo PPC tiene 55% de destruir UN misil entrante.
   * No depende de Speed.
   *
   * @param interceptor - Stack defensor con módulos PPC
   * @param weapon - Arma entrante (debe ser interceptable, ej: missile)
   * @returns Número de misiles interceptados (destruidos)
   */
  public attemptIntercept(
    interceptor: ShipStack,
    weapon: Weapon,
    incomingMissiles: number = 1
  ): number {
    if (!isInterceptable(weapon)) return 0;
    if (interceptor.ppcCount <= 0 || incomingMissiles <= 0) return 0;

    const missilesDestroyed = attemptPPCIntercept(
      interceptor.ppcCount,
      incomingMissiles,
      this.rng
    );

    // Emitir eventos de intercept
    for (let i = 0; i < missilesDestroyed; i++) {
      this.emit({
        type: 'INTERCEPT',
        interceptorId: interceptor.id,
        targetWeapon: weapon.type,
        success: true,
      });
    }

    return missilesDestroyed;
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
