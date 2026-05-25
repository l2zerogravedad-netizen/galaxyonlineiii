/**
 * SISTEMA DE MOVIMIENTO Y NAVEGACIÓN - GALAXY ONLINE II
 * Movimiento de naves, velocidad, rotación, trayectorias y sistemas de vuelo
 */

// ============================================
// TIPOS DE MOVIMIENTO
// ============================================
export type MovementMode = 'subspace' | 'warp' | 'impulse' | 'combat' | 'formation' | 'docking';

export interface MovementStats {
  baseSpeed: number;        // Unidades por segundo
  maxSpeed: number;
  acceleration: number;     // Unidades/s²
  deceleration: number;
  turnRate: number;       // Grados por segundo
  rotationSpeed: number;
  mass: number;           // Afecta inercia
  inertia: number;        // 0-1, menor = más responsive
}

// ============================================
// MODOS DE MOVIMIENTO
// ============================================
export const MOVEMENT_MODES: Record<MovementMode, {
  name: string;
  description: string;
  speedMultiplier: number;
  fuelConsumption: number;
  turnPenalty: number;
  canCombat: boolean;
  canScan: boolean;
  canTrade: boolean;
  visualEffect: string;
}> = {
  subspace: {
    name: 'Subspace',
    description: 'Viaje rápido entre sistemas cercanos.',
    speedMultiplier: 5.0,
    fuelConsumption: 1.0,
    turnPenalty: 0.8,
    canCombat: false,
    canScan: true,
    canTrade: false,
    visualEffect: 'blue_trail'
  },
  warp: {
    name: 'Warp',
    description: 'Viaje interestelar de larga distancia.',
    speedMultiplier: 50.0,
    fuelConsumption: 5.0,
    turnPenalty: 1.0, // No puede girar
    canCombat: false,
    canScan: false,
    canTrade: false,
    visualEffect: 'warp_tunnel'
  },
  impulse: {
    name: 'Impulso',
    description: 'Movimiento normal dentro de sistema.',
    speedMultiplier: 1.0,
    fuelConsumption: 0.1,
    turnPenalty: 0.0,
    canCombat: true,
    canScan: true,
    canTrade: true,
    visualEffect: 'engine_glow'
  },
  combat: {
    name: 'Combate',
    description: 'Maniobras tácticas de combate.',
    speedMultiplier: 0.5,
    fuelConsumption: 0.5,
    turnPenalty: 0.0,
    canCombat: true,
    canScan: true,
    canTrade: false,
    visualEffect: 'combat_thrusters'
  },
  formation: {
    name: 'Formación',
    description: 'Movimiento sincronizado con flota.',
    speedMultiplier: 0.8,
    fuelConsumption: 0.2,
    turnPenalty: 0.3,
    canCombat: true,
    canScan: true,
    canTrade: false,
    visualEffect: 'formation_lines'
  },
  docking: {
    name: 'Atraque',
    description: 'Movimiento lento para atraque.',
    speedMultiplier: 0.1,
    fuelConsumption: 0.05,
    turnPenalty: 0.0,
    canCombat: false,
    canScan: false,
    canTrade: false,
    visualEffect: 'docking_lights'
  }
};

// ============================================
// TIPOS DE TRAYECTORIA
// ============================================
export type TrajectoryType = 'direct' | 'intercept' | 'orbit' | 'evade' | 'flank';

export interface Trajectory {
  type: TrajectoryType;
  startPoint: { x: number; y: number; z: number };
  endPoint: { x: number; y: number; z: number };
  waypoints: { x: number; y: number; z: number }[];
  totalDistance: number;
  estimatedTime: number;
  fuelRequired: number;
}

export const TRAJECTORY_TYPES: Record<TrajectoryType, {
  name: string;
  description: string;
  aiUsage: string;
  advantages: string[];
  disadvantages: string[];
}> = {
  direct: {
    name: 'Directa',
    description: 'Línea recta del punto A al B.',
    aiUsage: 'Naves básicas, transporte',
    advantages: ['Más corta', 'Menor consumo'],
    disadvantages: ['Predecible', 'Vulnerable a emboscadas']
  },
  intercept: {
    name: 'Intercepción',
    description: 'Cálculo de encuentro con objetivo móvil.',
    aiUsage: 'Cazas, naves rápidas',
    advantages: ['Efectiva contra objetivos móviles', 'Rápida'],
    disadvantages: ['Requiere predicción', 'Puede fallar']
  },
  orbit: {
    name: 'Órbita',
    description: 'Círculo alrededor de punto objetivo.',
    aiUsage: 'Defensa, bombardeo',
    advantages: ['Mantiene distancia', 'Difícil de predecir'],
    disadvantages: ['No avanza', 'Consumo continuo']
  },
  evade: {
    name: 'Evasiva',
    description: 'Patrón zig-zag para evadir fuego.',
    aiUsage: 'Naves dañadas, retirada',
    advantages: ['Reduce daño recibido', 'Difícil de impactar'],
    disadvantages: ['Más lenta', 'Alto consumo']
  },
  flank: {
    name: 'Flanqueo',
    description: 'Aproximación lateral al objetivo.',
    aiUsage: 'Naves de asalto',
    advantages: ['Sorpresa', 'Ángulo débil enemigo'],
    disadvantages: ['Más distancia', 'Toma tiempo']
  }
};

// ============================================
// SISTEMA DE FORMATIONS
// ============================================
export type FormationType = 
  | 'line' 
  | 'wedge' 
  | 'sphere' 
  | 'column' 
  | 'diamond'
  | 'echelon'
  | 'v_formation';

export interface Formation {
  type: FormationType;
  name: string;
  description: string;
  bonus: {
    attack?: number;
    defense?: number;
    speed?: number;
    accuracy?: number;
    evasion?: number;
  };
  positions: { x: number; y: number; leader: boolean }[];
  maxShips: number;
}

export const FORMATIONS: Record<FormationType, Formation> = {
  line: {
    type: 'line',
    name: 'Línea',
    description: 'Naves en fila horizontal.',
    bonus: { attack: 10, accuracy: 5 },
    positions: [
      { x: 0, y: 0, leader: true },
      { x: -1, y: 0, leader: false },
      { x: 1, y: 0, leader: false },
      { x: -2, y: 0, leader: false },
      { x: 2, y: 0, leader: false }
    ],
    maxShips: 10
  },
  wedge: {
    type: 'wedge',
    name: 'Cuña',
    description: 'Formación en V invertida.',
    bonus: { attack: 15, speed: 5 },
    positions: [
      { x: 0, y: 0, leader: true },
      { x: -0.5, y: 1, leader: false },
      { x: 0.5, y: 1, leader: false },
      { x: -1, y: 2, leader: false },
      { x: 1, y: 2, leader: false }
    ],
    maxShips: 15
  },
  sphere: {
    type: 'sphere',
    name: 'Esfera',
    description: 'Naves en círculo defensivo.',
    bonus: { defense: 20, evasion: 10 },
    positions: [
      { x: 0, y: 0, leader: true },
      { x: 1, y: 0, leader: false },
      { x: -1, y: 0, leader: false },
      { x: 0, y: 1, leader: false },
      { x: 0, y: -1, leader: false }
    ],
    maxShips: 20
  },
  column: {
    type: 'column',
    name: 'Columna',
    description: 'Naves en fila vertical.',
    bonus: { speed: 10, defense: 5 },
    positions: [
      { x: 0, y: 0, leader: true },
      { x: 0, y: -1, leader: false },
      { x: 0, y: 1, leader: false },
      { x: 0, y: -2, leader: false },
      { x: 0, y: 2, leader: false }
    ],
    maxShips: 10
  },
  diamond: {
    type: 'diamond',
    name: 'Diamante',
    description: 'Formación rombo balanceada.',
    bonus: { attack: 10, defense: 10, accuracy: 5 },
    positions: [
      { x: 0, y: 0, leader: true },
      { x: -1, y: 0, leader: false },
      { x: 1, y: 0, leader: false },
      { x: 0, y: -1, leader: false },
      { x: 0, y: 1, leader: false }
    ],
    maxShips: 13
  },
  echelon: {
    type: 'echelon',
    name: 'Escalón',
    description: 'Formación diagonal escalonada.',
    bonus: { attack: 20, speed: 10 },
    positions: [
      { x: 0, y: 0, leader: true },
      { x: 1, y: -1, leader: false },
      { x: 2, y: -2, leader: false },
      { x: 3, y: -3, leader: false },
      { x: 4, y: -4, leader: false }
    ],
    maxShips: 10
  },
  v_formation: {
    type: 'v_formation',
    name: 'V de Ganso',
    description: 'Formación en V clásica.',
    bonus: { speed: 15, evasion: 10 },
    positions: [
      { x: 0, y: 0, leader: true },
      { x: -1, y: 1, leader: false },
      { x: 1, y: 1, leader: false },
      { x: -2, y: 2, leader: false },
      { x: 2, y: 2, leader: false }
    ],
    maxShips: 15
  }
};

// ============================================
// EFECTOS DE MOVIMIENTO
// ============================================
export interface MovementEffect {
  id: string;
  name: string;
  description: string;
  visualEffect: string;
  soundEffect: string;
  particleEffect: string;
  duration: number;
  conditions: string[];
}

export const MOVEMENT_EFFECTS: MovementEffect[] = [
  {
    id: 'warp_entry',
    name: 'Entrada Warp',
    description: 'Efecto visual de entrada a velocidad warp.',
    visualEffect: 'warp_tunnel_blue',
    soundEffect: 'warp_activate',
    particleEffect: 'stars_stretch',
    duration: 2000,
    conditions: ['warp_mode', 'subspace_mode']
  },
  {
    id: 'afterburner',
    name: 'Postquemador',
    description: 'Aceleración máxima con llama trasera.',
    visualEffect: 'engine_flame_orange',
    soundEffect: 'afterburner_ignite',
    particleEffect: 'exhaust_fire',
    duration: 5000,
    conditions: ['combat_mode', 'max_speed']
  },
  {
    id: 'evade_roll',
    name: 'Evasión',
    description: 'Giro rápido para evadir.',
    visualEffect: 'ship_roll',
    soundEffect: 'thruster_burst',
    particleEffect: 'directional_trail',
    duration: 500,
    conditions: ['evasion_ability']
  },
  {
    id: 'boost_pulse',
    name: 'Pulso de Velocidad',
    description: 'Aumento temporal de velocidad.',
    visualEffect: 'speed_lines',
    soundEffect: 'boost_charge',
    particleEffect: 'energy_wake',
    duration: 3000,
    conditions: ['boost_ability']
  }
];

// ============================================
// SONIDOS DE MOVIMIENTO
// ============================================
export interface MovementSound {
  id: string;
  name: string;
  file: string;
  volume: number;
  pitch: number;
  loop: boolean;
  conditions: string[];
}

export const MOVEMENT_SOUNDS: MovementSound[] = [
  { id: 'engine_idle', name: 'Motor Idle', file: 'engine_idle.mp3', volume: 0.3, pitch: 1.0, loop: true, conditions: ['always'] },
  { id: 'engine_thrust', name: 'Propulsión', file: 'engine_thrust.mp3', volume: 0.5, pitch: 1.0, loop: true, conditions: ['moving'] },
  { id: 'warp_start', name: 'Warp Inicio', file: 'warp_start.mp3', volume: 0.8, pitch: 1.2, loop: false, conditions: ['warp_enter'] },
  { id: 'warp_loop', name: 'Warp Loop', file: 'warp_loop.mp3', volume: 0.6, pitch: 1.0, loop: true, conditions: ['warp_travel'] },
  { id: 'warp_exit', name: 'Warp Fin', file: 'warp_exit.mp3', volume: 0.8, pitch: 0.8, loop: false, conditions: ['warp_exit'] },
  { id: 'boost', name: 'Boost', file: 'boost.mp3', volume: 0.7, pitch: 1.3, loop: false, conditions: ['boost_active'] },
  { id: 'turn', name: 'Giro', file: 'thruster_turn.mp3', volume: 0.4, pitch: 1.0, loop: false, conditions: ['turning'] },
  { id: 'brake', name: 'Frenado', file: 'brake.mp3', volume: 0.5, pitch: 0.9, loop: false, conditions: ['decelerating'] }
];

// ============================================
// HELPERS
// ============================================
export function calculateTravelTime(
  distance: number,
  baseSpeed: number,
  mode: MovementMode
): number {
  const multiplier = MOVEMENT_MODES[mode].speedMultiplier;
  return distance / (baseSpeed * multiplier);
}

export function calculateFuelConsumption(
  distance: number,
  mode: MovementMode,
  shipMass: number
): number {
  const consumption = MOVEMENT_MODES[mode].fuelConsumption;
  return distance * consumption * (shipMass / 1000);
}

export function getOptimalTrajectory(
  start: { x: number; y: number; z: number },
  end: { x: number; y: number; z: number },
  obstacles?: { x: number; y: number; z: number; radius: number }[]
): Trajectory {
  // Simplificación - en realidad sería pathfinding
  const distance = Math.sqrt(
    Math.pow(end.x - start.x, 2) +
    Math.pow(end.y - start.y, 2) +
    Math.pow(end.z - start.z, 2)
  );
  
  return {
    type: 'direct',
    startPoint: start,
    endPoint: end,
    waypoints: [],
    totalDistance: distance,
    estimatedTime: distance / 100, // Asumiendo velocidad base 100
    fuelRequired: distance * 0.1
  };
}

export function getFormationBonus(formation: FormationType): Formation['bonus'] {
  return FORMATIONS[formation].bonus;
}

export const ShipMovementSystem = {
  MOVEMENT_MODES,
  TRAJECTORY_TYPES,
  FORMATIONS,
  MOVEMENT_EFFECTS,
  MOVEMENT_SOUNDS,
  calculateTravelTime,
  calculateFuelConsumption,
  getOptimalTrajectory,
  getFormationBonus
};
