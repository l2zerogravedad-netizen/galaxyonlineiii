/**
 * ============================================================================
 * S E Q U E N T I A L   A T T A C K   S Y S T E M
 * ============================================================================
 *
 * Sistema de ataque por escuadrón secuencial inspirado en Galaxy Online 2.
 *
 * MECÁNICA:
 * 1. Los escuadrones se ordenan por Speed (mayor a menor)
 * 2. Cada escuadrón ataca UNO A LA VEZ en orden secuencial
 * 3. Fases de ataque: HIGHLIGHT (300ms) → FIRE → PROJECTILE (500ms)
 *                     → HIT (200ms) → COOLDOWN (500ms)
 * 4. Selección de objetivo: más débil en rango de arma
 * 5. Proyectiles visibles viajando del atacante al objetivo
 * 6. Eventos emitidos en cada fase para animación de UI
 *
 * Basado en las imágenes de referencia:
 * - image(34).png: números rojos 1-15 = ORDEN DE ATAQUE por Speed
 * - image(35).png: escuadrones atacando uno por uno secuencialmente
 * ============================================================================
 */

// =============================================================================
// TIPOS Y ENUMERACIONES
// =============================================================================

/** Tipos de arma del juego — cada uno tiene rango y velocidad de proyectil distintos */
export type WeaponType = 'ballistic' | 'directional' | 'missile' | 'shipBased';

/** Facción del escuadrón — atacante o defensor */
export type Faction = 'attacker' | 'defender';

/** Estados de la secuencia de ataque — máquina de estados finita */
export type AttackSequenceState =
  | 'idle'              // Esperando iniciar
  | 'highlighting'      // Escuadrón resaltado (300ms)
  | 'selecting_weapon'  // Selección de arma activa
  | 'firing'            // Naves disparando
  | 'projectile_travel' // Proyectiles viajando (500ms)
  | 'hitting'           // Impacto + daño flotante (200ms)
  | 'cooldown';         // Pausa antes del siguiente (500ms)

// =============================================================================
// CONSTANTES DEL SISTEMA
// =============================================================================

/** Rango de alcance para cada tipo de arma (casillas de grid) */
export const WEAPON_RANGE: Record<WeaponType, number> = {
  ballistic:     2,
  directional:   5,
  missile:       8,
  shipBased:    10,
};

/** Velocidad base de proyectil (unidades de progreso por segundo) */
export const PROJECTILE_SPEED: Record<WeaponType, number> = {
  ballistic:    4.0,   // Más lento — cañones pesados
  directional:  6.0,   // Rayos láser — rápidos
  missile:      2.5,   // Misiles — lentos pero seguros
  shipBased:    3.5,   // Cazas — velocidad media
};

/** Duración de cada fase de la secuencia (milisegundos) */
export const PHASE_DURATIONS: Record<Exclude<AttackSequenceState, 'idle'>, number> = {
  highlighting:      300,
  selecting_weapon:  100,
  firing:            100,
  projectile_travel: 500,
  hitting:           200,
  cooldown:          500,
};

/** Probabilidad base de golpe crítico (5%) */
export const BASE_CRIT_CHANCE = 0.05;

/** Multiplicador de daño crítico (1.5x) */
export const CRIT_MULTIPLIER = 1.5;

// =============================================================================
// INTERFACES
// =============================================================================

/** Representa una nave individual dentro de un escuadrón */
export interface Ship {
  id: string;
  name: string;
  hull: number;        // HP actual del casco
  maxHull: number;     // HP máximo del casco
  shield: number;      // Escudo actual
  maxShield: number;   // Escudo máximo
  attack: number;      // Poder de ataque base
  defense: number;     // Defensa base
  isAlive: boolean;
}

/** Comandante del escuadrón — determina Speed y stats */
export interface Commander {
  id: string;
  name: string;
  speed: number;       // Determina ORDEN DE ATAQUE
  accuracy: number;    // Bonus de precisión (0-1)
  dodge: number;       // Bonus de esquiva (0-1)
  critRate: number;    // Bonus de crítico (0-1)
}

/** Arma equipada por el escuadrón */
export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  damage: number;      // Daño base por disparo
  hits: number;        // Número de disparos por ataque
  accuracy: number;    // Precisión base (0-1)
}

/** Escuadrón — unidad de combate que actúa en secuencia */
export interface Squadron {
  id: string;
  ships: Ship[];
  commander: Commander;
  position: { x: number; y: number };
  faction: Faction;
  weapons: Weapon[];
  he3: number;         // Energía He3 disponible
}

/** Proyectil en vuelo — visual y lógico */
export interface Projectile {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number;      // 0.0 (salida) → 1.0 (impacto)
  speed: number;         // Unidades de progreso por segundo
  weaponType: WeaponType;
  damage: number;        // Daño de este proyectil
  isCritical: boolean;
  shipIndex: number;     // Índice de la nave que disparó
}

/** Resultado de un impacto individual */
export interface HitResult {
  projectileId: string;
  damage: number;
  isCritical: boolean;
  shieldDamage: number;
  hullDamage: number;
  shieldDepleted: boolean;
}

/** Resultado completo de un ataque */
export interface AttackResult {
  hits: number;
  damage: number;
  isCritical: boolean;
  shieldDamage: number;
  hullDamage: number;
  shipsDestroyed: number;
  shieldDepleted: boolean;
  targetDestroyed: boolean;
  projectiles: Projectile[];
  hitResults: HitResult[];
}

/** Eventos emitidos durante la secuencia de ataque — la UI se suscribe a estos */
export type AttackEvent =
  | { type: 'TURN_START';           squadronId: string; commanderName: string; speed: number; turnNumber: number }
  | { type: 'SQUADRON_HIGHLIGHT';   squadronId: string; duration: number }
  | { type: 'WEAPON_SELECT';        squadronId: string; weaponType: WeaponType; weaponName: string }
  | { type: 'PROJECTILE_LAUNCH';    projectiles: Projectile[]; fromSquadronId: string }
  | { type: 'PROJECTILE_UPDATE';    projectiles: Projectile[] }
  | { type: 'PROJECTILE_HIT';       targetId: string; projectileId: string; damage: number; isCritical: boolean; x: number; y: number }
  | { type: 'DAMAGE_APPLIED';       targetId: string; shieldDmg: number; hullDmg: number; shipsLost: number; totalHpRemaining: number }
  | { type: 'SHIELD_DEPLETED';      targetId: string; x: number; y: number }
  | { type: 'SHIPS_DESTROYED';      squadronId: string; count: number; x: number; y: number }
  | { type: 'SQUADRON_DESTROYED';   squadronId: string; x: number; y: number }
  | { type: 'TURN_END';             squadronId: string }
  | { type: 'ALL_ATTACKS_DONE';     totalTurns: number }
  | { type: 'PHASE_CHANGED';        from: AttackSequenceState; to: AttackSequenceState; squadronId: string };

/** Secuencia de ataque completa — máquina de estados */
export interface AttackSequence {
  squadrons: Squadron[];              // Ordenados por speed
  currentIndex: number;               // Índice del escuadrón actual
  state: AttackSequenceState;
  currentAttacker: Squadron | null;
  currentTarget: Squadron | null;
  currentWeapon: Weapon | null;
  projectiles: Projectile[];
  elapsedMs: number;                  // Tiempo acumulado en fase actual
  completedCycles: number;            // Rondas completadas
  eventLog: AttackEvent[];            // Historial de eventos
  isRunning: boolean;
}

/** Opciones de configuración del sistema */
export interface SequentialAttackOptions {
  phaseDurations?: Partial<typeof PHASE_DURATIONS>;
  projectileSpeeds?: Partial<typeof PROJECTILE_SPEED>;
  critChance?: number;
  critMultiplier?: number;
  debug?: boolean;
}

/** Listener para eventos de ataque */
type EventListener = (event: AttackEvent) => void;

// =============================================================================
// SISTEMA DE EVENTOS
// =============================================================================

/**
 * Emisor de eventos de ataque — patrón Observer.
 * La UI se suscribe para recibir notificaciones de cada fase del ataque.
 */
export class AttackEventEmitter {
  private listeners: Set<EventListener> = new Set();
  private debug: boolean;

  constructor(options: SequentialAttackOptions = {}) {
    this.debug = options.debug ?? false;
  }

  /** Suscribir un listener a todos los eventos */
  subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Emitir un evento a todos los suscriptores */
  emit(event: AttackEvent): void {
    if (this.debug) {
      console.log(`[AttackEvent] ${event.type}`, event);
    }
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  /** Limpiar todos los listeners */
  clear(): void {
    this.listeners.clear();
  }
}

// =============================================================================
// FUNCIONES DE ORDENAMIENTO
// =============================================================================

/**
 * Ordena escuadrones por Speed del comandante (mayor a menor).
 * El número rojo en la imagen de referencia (1,2,3...15) es este orden.
 *
 * @param squadrons — Lista de escuadrones a ordenar
 * @returns Escuadrones ordenados por speed descendente
 *
 * @example
 * const ordered = sortBySpeed(squadrons);
 * // ordered[0] = escuadrón con comandante más rápido → ataca primero (#1)
 * // ordered[14] = escuadrón más lento → ataca último (#15)
 */
export function sortBySpeed(squadrons: Squadron[]): Squadron[] {
  return [...squadrons].sort((a, b) => {
    const speedDiff = b.commander.speed - a.commander.speed;
    if (speedDiff !== 0) return speedDiff;
    // Desempate: atacante va primero si mismo speed
    if (a.faction === 'attacker' && b.faction === 'defender') return -1;
    if (a.faction === 'defender' && b.faction === 'attacker') return 1;
    // Desempate final: ID consistente
    return a.id.localeCompare(b.id);
  });
}

/**
 * Calcula la distancia Manhattan entre dos posiciones de grid.
 * Usada para determinar si un objetivo está en rango.
 */
export function gridDistance(
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// =============================================================================
// SELECCIÓN DE OBJETIVO
// =============================================================================

/**
 * Encuentra el objetivo más débil en rango para un escuadrón atacante.
 *
 * LÓGICA:
 * 1. Filtrar enemigos dentro del rango del arma
 * 2. Entre los en rango, elegir el que tenga MENOS HP total
 * 3. Si ninguno en rango, elegir el enemigo vivo más cercano
 *
 * @param attacker — Escuadrón que va a atacar
 * @param enemies — Lista de escuadrones enemigos
 * @param weaponType — Tipo de arma (determina el rango)
 * @returns El escuadrón objetivo, o null si no hay enemigos vivos
 *
 * @example
 * const target = findTarget(mySquadron, enemySquadrons, 'ballistic');
 * if (target) { /* atacar *\/ }
 */
export function findTarget(
  attacker: Squadron,
  enemies: Squadron[],
  weaponType: WeaponType = 'ballistic'
): Squadron | null {
  const range = WEAPON_RANGE[weaponType];
  const aliveEnemies = enemies.filter(e =>
    e.ships.some(s => s.isAlive)
  );

  if (aliveEnemies.length === 0) return null;

  // Separar enemigos en rango y fuera de rango
  const inRange: Squadron[] = [];
  const outOfRange: Squadron[] = [];

  for (const enemy of aliveEnemies) {
    const dist = gridDistance(attacker.position, enemy.position);
    if (dist <= range) {
      inRange.push(enemy);
    } else {
      outOfRange.push(enemy);
    }
  }

  // Función para calcular HP total de un escuadrón
  const getTotalHp = (s: Squadron): number =>
    s.ships
      .filter(ship => ship.isAlive)
      .reduce((sum, ship) => sum + ship.hull + ship.shield, 0);

  if (inRange.length > 0) {
    // Atacar al enemigo en rango con MENOS HP total
    return inRange.sort((a, b) => getTotalHp(a) - getTotalHp(b))[0];
  }

  // Si ninguno en rango, atacar al más cercano
  return outOfRange.sort((a, b) => {
    const distA = gridDistance(attacker.position, a.position);
    const distB = gridDistance(attacker.position, b.position);
    return distA - distB;
  })[0];
}

// =============================================================================
// CREACIÓN DE PROYECTILES
// =============================================================================

/**
 * Crea los proyectiles para un ataque desde un escuadrón hacia un objetivo.
 *
 * Cada nave viva genera `weapon.hits` proyectiles.
 * Los proyectiles se distribuyen visualmente desde la posición del escuadrón
 * hacia la posición del objetivo.
 *
 * @param attacker — Escuadrón atacante
 * @param target — Escuadrón objetivo
 * @param weapon — Arma a usar
 * @returns Lista de proyectiles creados
 */
export function createProjectiles(
  attacker: Squadron,
  target: Squadron,
  weapon: Weapon
): Projectile[] {
  const projectiles: Projectile[] = [];
  const speed = PROJECTILE_SPEED[weapon.type];
  let projectileIndex = 0;

  const aliveShips = attacker.ships.filter(s => s.isAlive);

  for (let shipIdx = 0; shipIdx < aliveShips.length; shipIdx++) {
    for (let hit = 0; hit < weapon.hits; hit++) {
      // Calcular posición de origen con dispersión visual
      const spreadX = (Math.random() - 0.5) * 0.4;
      const spreadY = (Math.random() - 0.5) * 0.4;

      // Posición de destino con pequeña dispersión
      const targetSpreadX = (Math.random() - 0.5) * 0.3;
      const targetSpreadY = (Math.random() - 0.5) * 0.3;

      projectiles.push({
        id: `proj_${attacker.id}_${projectileIndex++}_${Date.now()}`,
        fromX: attacker.position.x + spreadX,
        fromY: attacker.position.y + spreadY,
        toX: target.position.x + targetSpreadX,
        toY: target.position.y + targetSpreadY,
        progress: 0,
        speed,
        weaponType: weapon.type,
        damage: weapon.damage,
        isCritical: Math.random() < (BASE_CRIT_CHANCE + attacker.commander.critRate),
        shipIndex: shipIdx,
      });
    }
  }

  return projectiles;
}

// =============================================================================
// ACTUALIZACIÓN DE PROYECTILES (llamar cada frame)
// =============================================================================

/**
 * Actualiza el progreso de todos los proyectiles.
 * Debe llamarse cada frame del game loop con el delta time.
 *
 * @param projectiles — Lista de proyectiles activos
 * @param dtSeconds — Delta time en segundos
 * @returns Proyectiles activos y resultados de impacto
 *
 * @example
 * // En el game loop:
 * const { active, hits } = updateProjectiles(projectiles, deltaTime);
 * projectiles = active;
 * for (const hit of hits) { applyDamage(hit); }
 */
export function updateProjectiles(
  projectiles: Projectile[],
  dtSeconds: number
): { active: Projectile[]; hits: HitResult[] } {
  const active: Projectile[] = [];
  const hits: HitResult[] = [];

  for (const proj of projectiles) {
    const newProgress = proj.progress + proj.speed * dtSeconds;

    if (newProgress >= 1) {
      // Proyectil impactó
      hits.push({
        projectileId: proj.id,
        damage: proj.isCritical ? proj.damage * CRIT_MULTIPLIER : proj.damage,
        isCritical: proj.isCritical,
        shieldDamage: 0, // Se calcula al aplicar daño
        hullDamage: 0,   // Se calcula al aplicar daño
        shieldDepleted: false,
      });
    } else {
      // Proyectil sigue en vuelo
      active.push({
        ...proj,
        progress: newProgress,
      });
    }
  }

  return { active, hits };
}

/**
 * Calcula la posición visual actual de un proyectil.
 * Útil para el renderizado en la UI.
 */
export function getProjectilePosition(proj: Projectile): { x: number; y: number } {
  const t = Math.min(proj.progress, 1);
  return {
    x: proj.fromX + (proj.toX - proj.fromX) * t,
    y: proj.fromY + (proj.toY - proj.fromY) * t,
  };
}

// =============================================================================
// CÁLCULO DE DAÑO
// =============================================================================

/**
 * Aplica daño a un escuadrón objetivo.
 * Primero consume el escudo, luego el casco.
 *
 * @param target — Escuadrón que recibe daño
 * @param rawDamage — Daño bruto a aplicar
 * @returns Información del daño aplicado
 */
export function applyDamageToSquadron(
  target: Squadron,
  rawDamage: number
): { shieldDamage: number; hullDamage: number; shieldDepleted: boolean; shipsDestroyed: number } {
  let remainingDamage = rawDamage;
  let totalShieldDamage = 0;
  let totalHullDamage = 0;
  let shieldDepleted = false;
  let shipsDestroyed = 0;

  // Distribuir daño equitativamente entre naves vivas
  const aliveShips = target.ships.filter(s => s.isAlive);
  if (aliveShips.length === 0) {
    return { shieldDamage: 0, hullDamage: 0, shieldDepleted: false, shipsDestroyed: 0 };
  }

  const damagePerShip = remainingDamage / aliveShips.length;

  for (const ship of target.ships) {
    if (!ship.isAlive) continue;

    let shipDamage = damagePerShip;

    // Primero daño al escudo
    if (ship.shield > 0) {
      const shieldDmg = Math.min(ship.shield, shipDamage);
      ship.shield -= shieldDmg;
      shipDamage -= shieldDmg;
      totalShieldDamage += shieldDmg;

      if (ship.shield <= 0 && shieldDmg > 0) {
        shieldDepleted = true;
      }
    }

    // Daño restante al casco
    if (shipDamage > 0) {
      ship.hull -= shipDamage;
      totalHullDamage += shipDamage;

      if (ship.hull <= 0) {
        ship.hull = 0;
        ship.isAlive = false;
        shipsDestroyed++;
      }
    }
  }

  return {
    shieldDamage: totalShieldDamage,
    hullDamage: totalHullDamage,
    shieldDepleted,
    shipsDestroyed,
  };
}

/**
 * Ejecuta un ataque completo: crea proyectiles y calcula resultado.
 *
 * @param attacker — Escuadrón atacante
 * @param target — Escuadrón objetivo
 * @param weapon — Arma a usar
 * @returns Resultado completo del ataque
 */
export function executeAttack(
  attacker: Squadron,
  target: Squadron,
  weapon: Weapon
): AttackResult {
  const projectiles = createProjectiles(attacker, target, weapon);
  let totalDamage = 0;
  let shieldDamage = 0;
  let hullDamage = 0;
  let shipsDestroyed = 0;
  let shieldDepleted = false;
  let anyCritical = false;
  const hitResults: HitResult[] = [];

  for (const proj of projectiles) {
    const dmg = proj.isCritical ? proj.damage * CRIT_MULTIPLIER : proj.damage;
    totalDamage += proj.damage; // Daño base sin crítico para estadísticas

    const result = applyDamageToSquadron(target, dmg);

    shieldDamage += result.shieldDamage;
    hullDamage += result.hullDamage;
    shipsDestroyed += result.shipsDestroyed;
    if (result.shieldDepleted) shieldDepleted = true;
    if (proj.isCritical) anyCritical = true;

    hitResults.push({
      projectileId: proj.id,
      damage: dmg,
      isCritical: proj.isCritical,
      shieldDamage: result.shieldDamage,
      hullDamage: result.hullDamage,
      shieldDepleted: result.shieldDepleted,
    });
  }

  const allShipsDead = target.ships.every(s => !s.isAlive);

  return {
    hits: projectiles.length,
    damage: totalDamage,
    isCritical: anyCritical,
    shieldDamage,
    hullDamage,
    shipsDestroyed,
    shieldDepleted,
    targetDestroyed: allShipsDead,
    projectiles,
    hitResults,
  };
}

// =============================================================================
// SECUENCIA DE ATAQUE — MÁQUINA DE ESTADOS
// =============================================================================

/**
 * Crea una nueva secuencia de ataque.
 *
 * @param allSquadrons — Todos los escuadrones en el campo de batalla
 * @returns Secuencia inicializada (estado 'idle')
 */
export function createAttackSequence(allSquadrons: Squadron[]): AttackSequence {
  const ordered = sortBySpeed(allSquadrons);
  return {
    squadrons: ordered,
    currentIndex: 0,
    state: 'idle',
    currentAttacker: null,
    currentTarget: null,
    currentWeapon: null,
    projectiles: [],
    elapsedMs: 0,
    completedCycles: 0,
    eventLog: [],
    isRunning: false,
  };
}

/**
 * Obtiene el escuadrón que debe atacar en el turno actual.
 */
export function getCurrentAttacker(seq: AttackSequence): Squadron | null {
  if (seq.currentIndex >= seq.squadrons.length) return null;
  return seq.squadrons[seq.currentIndex];
}

/**
 * Avanza al siguiente escuadrón en la secuencia.
 * Si todos atacaron, vuelve al inicio (siguiente ronda).
 */
export function advanceToNextSquadron(seq: AttackSequence): AttackSequence {
  let nextIndex = seq.currentIndex + 1;
  let cycles = seq.completedCycles;

  if (nextIndex >= seq.squadrons.length) {
    nextIndex = 0;
    cycles += 1;
  }

  return {
    ...seq,
    currentIndex: nextIndex,
    completedCycles: cycles,
    currentAttacker: null,
    currentTarget: null,
    currentWeapon: null,
    projectiles: [],
    elapsedMs: 0,
  };
}

/**
 * Filtra escuadrones vivos y recalcula el orden.
 * Llamar cuando escuadrones son destruidos.
 */
export function removeDeadSquadrons(seq: AttackSequence): AttackSequence {
  const alive = seq.squadrons.filter(s => s.ships.some(ship => ship.isAlive));
  return {
    ...seq,
    squadrons: alive,
    currentIndex: Math.min(seq.currentIndex, Math.max(0, alive.length - 1)),
  };
}

// =============================================================================
// ENGINE PRINCIPAL — ORQUESTADOR DE ATAQUE SECUENCIAL
// =============================================================================

/**
 * Motor de ataque secuencial — coordina toda la secuencia de combate.
 *
 * Patrón: Máquina de estados con eventos.
 * Cada fase emite eventos que la UI consume para animar.
 *
 * FASES:
 *   idle → highlighting (300ms) → selecting_weapon (100ms) → firing (100ms)
 *        → projectile_travel (500ms) → hitting (200ms) → cooldown (500ms)
 *        → siguiente escuadrón → idle
 *
 * USO:
 * ```typescript
 * const engine = new SequentialAttackEngine(squadrons);
 * engine.onEvent((e) => {
 *   if (e.type === 'SQUADRON_HIGHLIGHT') showGlow(e.squadronId);
 *   if (e.type === 'PROJECTILE_LAUNCH') animateProjectiles(e.projectiles);
 *   if (e.type === 'PROJECTILE_HIT') showFloatingDamage(e.damage);
 * });
 * engine.start();
 * // En cada frame:
 * engine.update(dtMilliseconds);
 * ```
 */
export class SequentialAttackEngine {
  private sequence: AttackSequence;
  private emitter: AttackEventEmitter;
  private options: SequentialAttackOptions;
  private phaseTimers: Map<AttackSequenceState, number>;

  constructor(
    allSquadrons: Squadron[],
    options: SequentialAttackOptions = {}
  ) {
    this.sequence = createAttackSequence(allSquadrons);
    this.options = options;
    this.emitter = new AttackEventEmitter(options);
    this.phaseTimers = new Map([
      ['highlighting', options.phaseDurations?.highlighting ?? PHASE_DURATIONS.highlighting],
      ['selecting_weapon', options.phaseDurations?.selecting_weapon ?? PHASE_DURATIONS.selecting_weapon],
      ['firing', options.phaseDurations?.firing ?? PHASE_DURATIONS.firing],
      ['projectile_travel', options.phaseDurations?.projectile_travel ?? PHASE_DURATIONS.projectile_travel],
      ['hitting', options.phaseDurations?.hitting ?? PHASE_DURATIONS.hitting],
      ['cooldown', options.phaseDurations?.cooldown ?? PHASE_DURATIONS.cooldown],
    ]);
  }

  /** Suscribirse a eventos de ataque */
  onEvent(listener: EventListener): () => void {
    return this.emitter.subscribe(listener);
  }

  /** Iniciar la secuencia de ataque */
  start(): void {
    this.sequence = {
      ...this.sequence,
      state: 'idle',
      currentIndex: 0,
      isRunning: true,
      elapsedMs: 0,
    };
    this.transitionTo('highlighting');
  }

  /** Pausar la secuencia */
  pause(): void {
    this.sequence = { ...this.sequence, isRunning: false };
  }

  /** Reanudar la secuencia */
  resume(): void {
    this.sequence = { ...this.sequence, isRunning: true };
  }

  /** Verificar si la batalla ha terminado (solo queda una facción) */
  isBattleOver(): boolean {
    const attackersAlive = this.sequence.squadrons.some(
      s => s.faction === 'attacker' && s.ships.some(ship => ship.isAlive)
    );
    const defendersAlive = this.sequence.squadrons.some(
      s => s.faction === 'defender' && s.ships.some(ship => ship.isAlive)
    );
    return !attackersAlive || !defendersAlive;
  }

  /** Obtener escuadrones ganadores, o null si no ha terminado */
  getWinners(): Faction | null {
    const attackersAlive = this.sequence.squadrons.some(
      s => s.faction === 'attacker' && s.ships.some(ship => ship.isAlive)
    );
    const defendersAlive = this.sequence.squadrons.some(
      s => s.faction === 'defender' && s.ships.some(ship => ship.isAlive)
    );
    if (attackersAlive && !defendersAlive) return 'attacker';
    if (!attackersAlive && defendersAlive) return 'defender';
    if (!attackersAlive && !defendersAlive) return null; // Empate
    return null; // Aún en curso
  }

  /** Obtener estado actual de la secuencia */
  getSequence(): AttackSequence {
    return this.sequence;
  }

  /** Obtener proyectiles activos */
  getActiveProjectiles(): Projectile[] {
    return this.sequence.projectiles;
  }

  /** Obtener escuadrón que está atacando ahora */
  getCurrentAttacker(): Squadron | null {
    return this.sequence.currentAttacker;
  }

  /** Obtener escuadrón siendo atacado ahora */
  getCurrentTarget(): Squadron | null {
    return this.sequence.currentTarget;
  }

  /** Obtener número de turno actual (1-based, para UI) */
  getCurrentTurnNumber(): number {
    return this.sequence.completedCycles * this.sequence.squadrons.length +
      this.sequence.currentIndex + 1;
  }

  // ---------------------------------------------------------------------------
  // MÁQUINA DE ESTADOS — UPDATE PRINCIPAL (llamar cada frame)
  // ---------------------------------------------------------------------------

  /**
   * Actualiza la máquina de estados.
   * LLAMAR ESTO CADA FRAME con el delta time en milisegundos.
   *
   * @param dtMs — Delta time en milisegundos
   */
  update(dtMs: number): void {
    if (!this.sequence.isRunning) return;
    if (this.isBattleOver()) {
      this.emitter.emit({ type: 'ALL_ATTACKS_DONE', totalTurns: this.getCurrentTurnNumber() });
      this.sequence = { ...this.sequence, isRunning: false };
      return;
    }

    // Actualizar proyectiles si están en vuelo
    if (this.sequence.state === 'projectile_travel' && this.sequence.projectiles.length > 0) {
      const dtSec = dtMs / 1000;
      const { active, hits } = updateProjectiles(this.sequence.projectiles, dtSec);
      this.sequence = { ...this.sequence, projectiles: active };

      // Emitir actualización de proyectiles para la UI
      if (active.length > 0) {
        this.emitter.emit({ type: 'PROJECTILE_UPDATE', projectiles: active });
      }

      // Procesar impactos
      for (const hit of hits) {
        if (this.sequence.currentTarget) {
          const target = this.sequence.currentTarget;
          const result = applyDamageToSquadron(target, hit.damage);

          this.emitter.emit({
            type: 'PROJECTILE_HIT',
            targetId: target.id,
            projectileId: hit.projectileId,
            damage: hit.damage,
            isCritical: hit.isCritical,
            x: target.position.x,
            y: target.position.y,
          });

          this.emitter.emit({
            type: 'DAMAGE_APPLIED',
            targetId: target.id,
            shieldDmg: result.shieldDamage,
            hullDmg: result.hullDamage,
            shipsLost: result.shipsDestroyed,
            totalHpRemaining: target.ships
              .filter(s => s.isAlive)
              .reduce((sum, s) => sum + s.hull + s.shield, 0),
          });

          if (result.shieldDepleted) {
            this.emitter.emit({
              type: 'SHIELD_DEPLETED',
              targetId: target.id,
              x: target.position.x,
              y: target.position.y,
            });
          }

          if (result.shipsDestroyed > 0) {
            this.emitter.emit({
              type: 'SHIPS_DESTROYED',
              squadronId: target.id,
              count: result.shipsDestroyed,
              x: target.position.x,
              y: target.position.y,
            });
          }

          // Verificar si el escuadrón fue destruido
          if (target.ships.every(s => !s.isAlive)) {
            this.emitter.emit({
              type: 'SQUADRON_DESTROYED',
              squadronId: target.id,
              x: target.position.x,
              y: target.position.y,
            });
            this.sequence = removeDeadSquadrons(this.sequence);
          }
        }
      }

      // Si todos los proyectiles impactaron o no hay más, avanzar fase
      if (this.sequence.projectiles.length === 0 && hits.length > 0) {
        this.transitionTo('hitting');
        return;
      }
    }

    // Avanzar temporizador de fase
    const newElapsed = this.sequence.elapsedMs + dtMs;
    const phaseDuration = this.phaseTimers.get(this.sequence.state) ?? 300;

    if (newElapsed >= phaseDuration) {
      this.advancePhase();
    } else {
      this.sequence = { ...this.sequence, elapsedMs: newElapsed };
    }
  }

  // ---------------------------------------------------------------------------
  // TRANSICIONES DE ESTADO
  // ---------------------------------------------------------------------------

  private transitionTo(newState: AttackSequenceState): void {
    const oldState = this.sequence.state;
    const attacker = getCurrentAttacker(this.sequence);

    this.emitter.emit({
      type: 'PHASE_CHANGED',
      from: oldState,
      to: newState,
      squadronId: attacker?.id ?? '',
    });

    this.sequence = { ...this.sequence, state: newState, elapsedMs: 0 };

    // Acciones específicas por fase
    switch (newState) {
      case 'highlighting':
        this.onHighlightPhase(attacker);
        break;
      case 'selecting_weapon':
        this.onWeaponSelectPhase(attacker);
        break;
      case 'firing':
        this.onFiringPhase(attacker);
        break;
      case 'projectile_travel':
        // Los proyectiles ya fueron lanzados en 'firing'
        break;
      case 'hitting':
        // El daño ya fue aplicado durante projectile_travel
        break;
      case 'cooldown':
        this.onCooldownPhase(attacker);
        break;
    }
  }

  private advancePhase(): void {
    const transitions: Record<AttackSequenceState, AttackSequenceState | 'NEXT_TURN'> = {
      idle: 'highlighting',
      highlighting: 'selecting_weapon',
      selecting_weapon: 'firing',
      firing: 'projectile_travel',
      projectile_travel: 'hitting',
      hitting: 'cooldown',
      cooldown: 'NEXT_TURN',
    };

    const next = transitions[this.sequence.state];

    if (next === 'NEXT_TURN') {
      // Finalizar turno actual
      const attacker = getCurrentAttacker(this.sequence);
      if (attacker) {
        this.emitter.emit({ type: 'TURN_END', squadronId: attacker.id });
      }

      // Avanzar al siguiente escuadrón
      this.sequence = advanceToNextSquadron(this.sequence);

      // Saltar escuadrones muertos
      while (this.sequence.squadrons.length > 0) {
        const nextAttacker = getCurrentAttacker(this.sequence);
        if (!nextAttacker) break;
        const hasAliveShips = nextAttacker.ships.some(s => s.isAlive);
        if (hasAliveShips) break;
        this.sequence = advanceToNextSquadron(this.sequence);
      }

      if (this.sequence.squadrons.length === 0 || this.isBattleOver()) {
        this.emitter.emit({ type: 'ALL_ATTACKS_DONE', totalTurns: this.getCurrentTurnNumber() });
        this.sequence = { ...this.sequence, isRunning: false, state: 'idle' };
        return;
      }

      this.transitionTo('highlighting');
    } else {
      this.transitionTo(next);
    }
  }

  // ---------------------------------------------------------------------------
  // HANDLERS DE FASE
  // ---------------------------------------------------------------------------

  private onHighlightPhase(attacker: Squadron | null): void {
    if (!attacker) return;

    this.sequence = {
      ...this.sequence,
      currentAttacker: attacker,
    };

    this.emitter.emit({
      type: 'TURN_START',
      squadronId: attacker.id,
      commanderName: attacker.commander.name,
      speed: attacker.commander.speed,
      turnNumber: this.getCurrentTurnNumber(),
    });

    this.emitter.emit({
      type: 'SQUADRON_HIGHLIGHT',
      squadronId: attacker.id,
      duration: this.phaseTimers.get('highlighting') ?? 300,
    });
  }

  private onWeaponSelectPhase(attacker: Squadron | null): void {
    if (!attacker) return;

    // Seleccionar el primer arma disponible (podría ser más sofisticado)
    const weapon = attacker.weapons[0] ?? this.createDefaultWeapon();
    this.sequence = { ...this.sequence, currentWeapon: weapon };

    this.emitter.emit({
      type: 'WEAPON_SELECT',
      squadronId: attacker.id,
      weaponType: weapon.type,
      weaponName: weapon.name,
    });
  }

  private onFiringPhase(attacker: Squadron | null): void {
    if (!attacker) return;

    const weapon = this.sequence.currentWeapon ?? this.createDefaultWeapon();

    // Encontrar enemigos (escuadrones de facción opuesta)
    const enemies = this.sequence.squadrons.filter(
      s => s.faction !== attacker.faction && s.ships.some(ship => ship.isAlive)
    );

    const target = findTarget(attacker, enemies, weapon.type);

    if (!target) {
      // No hay objetivo — skip turno
      this.sequence = { ...this.sequence, elapsedMs: 99999 }; // Forzar avance
      return;
    }

    this.sequence = { ...this.sequence, currentTarget: target };

    // Crear y lanzar proyectiles
    const projectiles = createProjectiles(attacker, target, weapon);
    this.sequence = { ...this.sequence, projectiles };

    this.emitter.emit({
      type: 'PROJECTILE_LAUNCH',
      projectiles: [...projectiles],
      fromSquadronId: attacker.id,
    });
  }

  private onCooldownPhase(attacker: Squadron | null): void {
    if (!attacker) return;
    // Cooldown — solo esperar, no hay acción especial
  }

  private createDefaultWeapon(): Weapon {
    return {
      id: 'default',
      name: 'Pulse Cannon',
      type: 'ballistic',
      damage: 100,
      hits: 1,
      accuracy: 0.9,
    };
  }

  /** Limpiar recursos */
  destroy(): void {
    this.emitter.clear();
    this.sequence = { ...this.sequence, isRunning: false };
  }
}

// =============================================================================
// HELPERS DE BATALLA
// =============================================================================

/**
 * Calcula el número de orden de ataque para cada escuadrón.
 * Útil para mostrar los números rojos 1-15 en la UI.
 *
 * @param squadrons — Todos los escuadrones
 * @returns Mapa squadronId → orden (1-based)
 */
export function computeAttackOrder(squadrons: Squadron[]): Map<string, number> {
  const ordered = sortBySpeed(squadrons);
  const map = new Map<string, number>();
  ordered.forEach((s, i) => map.set(s.id, i + 1));
  return map;
}

/**
 * Obtiene los escuadrones de una facción específica.
 */
export function getSquadronsByFaction(
  squadrons: Squadron[],
  faction: Faction
): Squadron[] {
  return squadrons.filter(s => s.faction === faction);
}

/**
 * Cuenta naves vivas en un escuadrón.
 */
export function countAliveShips(squadron: Squadron): number {
  return squadron.ships.filter(s => s.isAlive).length;
}

/**
 * Calcula HP total de un escuadrón.
 */
export function getSquadronTotalHp(squadron: Squadron): { hull: number; shield: number } {
  return squadron.ships.reduce(
    (acc, ship) => ({
      hull: acc.hull + (ship.isAlive ? ship.hull : 0),
      shield: acc.shield + (ship.isAlive ? ship.shield : 0),
    }),
    { hull: 0, shield: 0 }
  );
}

// =============================================================================
// FACTORY — Utilidades para crear objetos en tests
// =============================================================================

/** Crea un escuadrón para testing */
export function createTestSquadron(
  id: string,
  overrides: Partial<Squadron> & { commander?: Partial<Commander>; shipCount?: number } = {}
): Squadron {
  const shipCount = overrides.shipCount ?? 3;
  const ships: Ship[] = Array.from({ length: shipCount }, (_, i) => ({
    id: `${id}_ship_${i}`,
    name: `Ship ${i}`,
    hull: overrides.ships?.[i]?.hull ?? 1000,
    maxHull: overrides.ships?.[i]?.maxHull ?? 1000,
    shield: overrides.ships?.[i]?.shield ?? 500,
    maxShield: overrides.ships?.[i]?.maxShield ?? 500,
    attack: overrides.ships?.[i]?.attack ?? 100,
    defense: overrides.ships?.[i]?.defense ?? 50,
    isAlive: overrides.ships?.[i]?.isAlive ?? true,
  }));

  return {
    id,
    ships,
    commander: {
      id: `${id}_cmd`,
      name: `Commander ${id}`,
      speed: overrides.commander?.speed ?? 100,
      accuracy: overrides.commander?.accuracy ?? 0,
      dodge: overrides.commander?.dodge ?? 0,
      critRate: overrides.commander?.critRate ?? 0,
    },
    position: overrides.position ?? { x: 0, y: 0 },
    faction: overrides.faction ?? 'attacker',
    weapons: overrides.weapons ?? [{
      id: `${id}_w1`,
      name: 'Test Cannon',
      type: 'ballistic',
      damage: 100,
      hits: 1,
      accuracy: 0.9,
    }],
    he3: overrides.he3 ?? 1000,
  };
}

/** Crea un arma para testing */
export function createTestWeapon(overrides: Partial<Weapon> = {}): Weapon {
  return {
    id: overrides.id ?? 'test_weapon',
    name: overrides.name ?? 'Test Weapon',
    type: overrides.type ?? 'ballistic',
    damage: overrides.damage ?? 100,
    hits: overrides.hits ?? 1,
    accuracy: overrides.accuracy ?? 0.9,
  };
}

// =============================================================================
// EXPORT DEFAULT
// =============================================================================

export default {
  sortBySpeed,
  findTarget,
  createProjectiles,
  updateProjectiles,
  getProjectilePosition,
  applyDamageToSquadron,
  executeAttack,
  createAttackSequence,
  advanceToNextSquadron,
  removeDeadSquadrons,
  getCurrentAttacker,
  computeAttackOrder,
  getSquadronsByFaction,
  countAliveShips,
  getSquadronTotalHp,
  createTestSquadron,
  createTestWeapon,
  SequentialAttackEngine,
  AttackEventEmitter,
  WEAPON_RANGE,
  PROJECTILE_SPEED,
  PHASE_DURATIONS,
  BASE_CRIT_CHANCE,
  CRIT_MULTIPLIER,
};
