/**
 * SISTEMA PvP EN TIEMPO REAL - GALAXY ONLINE II
 * VS, combates síncronos, arenas en vivo, espectador
 */

// ============================================
// TIPOS DE COMBATE PvP
// ============================================
export type RealTimePvPType = 
  | 'arena_1v1'       // Arena 1 vs 1
  | 'arena_3v3'       // Arena equipo 3 vs 3
  | 'arena_5v5'       // Arena equipo 5 vs 5
  | 'free_for_all'    // Todos contra todos
  | 'capture_flag'    // Capturar la bandera
  | 'domination'      // Control de puntos
  | 'elimination'     // Eliminación
  | 'tournament';     // Torneo bracket

export type MatchStatus = 
  | 'queueing' 
  | 'matchmaking' 
  | 'loading' 
  | 'in_progress' 
  | 'paused' 
  | 'finished' 
  | 'aborted';

// ============================================
// ESTRUCTURA DE PARTIDA
// ============================================
export interface RealTimePlayer {
  id: string;
  name: string;
  level: number;
  corpTag?: string;
  title?: string;
  avatar: string;
  fleet: {
    ships: {
      hullId: string;
      modules: string[];
      count: number;
    }[];
    commanderId?: string;
  };
  stats: {
    wins: number;
    losses: number;
    rating: number;
  };
  status: 'ready' | 'not_ready' | 'disconnected';
  ping: number;
}

export interface RealTimeMatch {
  id: string;
  type: RealTimePvPType;
  status: MatchStatus;
  
  // Configuración
  map: string;
  maxPlayers: number;
  timeLimit: number; // segundos
  scoreLimit?: number;
  
  // Equipos
  teams: {
    id: string;
    name: string;
    color: string;
    players: RealTimePlayer[];
    score: number;
  }[];
  
  // Estado
  startTime?: number;
  endTime?: number;
  duration: number;
  
  // Objetivos (según modo)
  objectives?: {
    id: string;
    type: 'capture_point' | 'flag' | 'zone';
    position: { x: number; y: number };
    controlledBy?: string;
    captureProgress: number;
  }[];
  
  // Espectadores
  spectators: number;
  maxSpectators: number;
  
  // Replay
  replayAvailable: boolean;
  replayId?: string;
}

// ============================================
// MAPAS PvP
// ============================================
export interface PvPMap {
  id: string;
  name: string;
  description: string;
  size: 'small' | 'medium' | 'large';
  maxPlayers: number;
  gameModes: RealTimePvPType[];
  
  // Características
  features: {
    asteroids: boolean;
    nebulas: boolean;
    stations: boolean;
    wormholes: boolean;
    debris: boolean;
  };
  
  // Objetivos posicionados
  objectives: {
    type: 'capture' | 'flag' | 'zone';
    position: { x: number; y: number };
    radius: number;
  }[];
  
  // Spawns
  spawnPoints: {
    teamId: string;
    position: { x: number; y: number };
    rotation: number;
  }[];
  
  // Ambiente
  background: string;
  music: string;
  lighting: 'bright' | 'normal' | 'dark';
}

export const PVP_MAPS: PvPMap[] = [
  {
    id: 'map_asteroid_field',
    name: 'Campo de Asteroides',
    description: 'Terreno denso con asteroides como cobertura.',
    size: 'medium',
    maxPlayers: 10,
    gameModes: ['arena_1v1', 'arena_3v3', 'arena_5v5', 'free_for_all'],
    features: { asteroids: true, nebulas: false, stations: false, wormholes: false, debris: true },
    objectives: [
      { type: 'capture', position: { x: 0, y: 0 }, radius: 100 }
    ],
    spawnPoints: [
      { teamId: 'team1', position: { x: -500, y: 0 }, rotation: 0 },
      { teamId: 'team2', position: { x: 500, y: 0 }, rotation: 180 }
    ],
    background: 'asteroid_field_bg.jpg',
    music: 'combat_asteroid.mp3',
    lighting: 'normal'
  },
  {
    id: 'map_nebula_void',
    name: 'Vacío Nebular',
    description: 'Nebulas que reducen visibilidad y radar.',
    size: 'large',
    maxPlayers: 20,
    gameModes: ['arena_3v3', 'arena_5v5', 'free_for_all', 'domination'],
    features: { asteroids: false, nebulas: true, stations: false, wormholes: true, debris: false },
    objectives: [
      { type: 'zone', position: { x: -300, y: -300 }, radius: 150 },
      { type: 'zone', position: { x: 300, y: 300 }, radius: 150 },
      { type: 'zone', position: { x: 0, y: 0 }, radius: 200 }
    ],
    spawnPoints: [
      { teamId: 'team1', position: { x: -600, y: -600 }, rotation: 45 },
      { teamId: 'team2', position: { x: 600, y: 600 }, rotation: 225 },
      { teamId: 'team3', position: { x: -600, y: 600 }, rotation: -45 },
      { teamId: 'team4', position: { x: 600, y: -600 }, rotation: -225 }
    ],
    background: 'nebula_purple_bg.jpg',
    music: 'combat_nebula.mp3',
    lighting: 'dark'
  },
  {
    id: 'map_station_sector',
    name: 'Sector Estación',
    description: 'Combate cerca de una estación espacial abandonada.',
    size: 'medium',
    maxPlayers: 12,
    gameModes: ['arena_3v3', 'arena_5v5', 'capture_flag', 'domination'],
    features: { asteroids: true, nebulas: false, stations: true, wormholes: false, debris: true },
    objectives: [
      { type: 'flag', position: { x: 0, y: 0 }, radius: 50 },
      { type: 'zone', position: { x: -200, y: 200 }, radius: 100 },
      { type: 'zone', position: { x: 200, y: -200 }, radius: 100 }
    ],
    spawnPoints: [
      { teamId: 'team1', position: { x: -400, y: 0 }, rotation: 0 },
      { teamId: 'team2', position: { x: 400, y: 0 }, rotation: 180 }
    ],
    background: 'station_sector_bg.jpg',
    music: 'combat_station.mp3',
    lighting: 'bright'
  },
  {
    id: 'map_void_arena',
    name: 'Arena del Vacío',
    description: 'Espacio abierto sin cobertura. Puro skill.',
    size: 'small',
    maxPlayers: 6,
    gameModes: ['arena_1v1', 'arena_3v3', 'elimination'],
    features: { asteroids: false, nebulas: false, stations: false, wormholes: false, debris: false },
    objectives: [],
    spawnPoints: [
      { teamId: 'team1', position: { x: -300, y: 0 }, rotation: 0 },
      { teamId: 'team2', position: { x: 300, y: 0 }, rotation: 180 }
    ],
    background: 'deep_space_bg.jpg',
    music: 'combat_intense.mp3',
    lighting: 'normal'
  }
];

// ============================================
// CONFIGURACIONES DE MODO
// ============================================
export interface GameModeConfig {
  type: RealTimePvPType;
  name: string;
  description: string;
  teamSize: number;
  teamCount: number;
  totalPlayers: number;
  
  rules: {
    respawn: boolean;
    respawnDelay: number;
    friendlyFire: boolean;
    scoreLimit?: number;
    timeLimit: number;
    suddentDeath: boolean;
    powerups: boolean;
  };
  
  scoring: {
    kill: number;
    assist: number;
    death: number;
    objective: number;
    win: number;
    mvp: number;
  };
  
  rewards: {
    win: { credits: number; honor: number; xp: number };
    loss: { credits: number; honor: number; xp: number };
    draw: { credits: number; honor: number; xp: number };
  };
}

export const GAME_MODE_CONFIGS: Record<RealTimePvPType, GameModeConfig> = {
  arena_1v1: {
    type: 'arena_1v1',
    name: 'Duelo',
    description: '1 vs 1. El mejor gana.',
    teamSize: 1,
    teamCount: 2,
    totalPlayers: 2,
    rules: {
      respawn: false,
      respawnDelay: 0,
      friendlyFire: false,
      timeLimit: 600,
      suddentDeath: true,
      powerups: false
    },
    scoring: {
      kill: 100,
      assist: 0,
      death: -50,
      objective: 0,
      win: 500,
      mvp: 200
    },
    rewards: {
      win: { credits: 10000, honor: 100, xp: 1000 },
      loss: { credits: 2000, honor: 10, xp: 200 },
      draw: { credits: 5000, honor: 50, xp: 500 }
    }
  },
  
  arena_3v3: {
    type: 'arena_3v3',
    name: 'Arena 3v3',
    description: 'Combate en equipo de 3 jugadores.',
    teamSize: 3,
    teamCount: 2,
    totalPlayers: 6,
    rules: {
      respawn: true,
      respawnDelay: 5,
      friendlyFire: false,
      scoreLimit: 20,
      timeLimit: 900,
      suddentDeath: false,
      powerups: true
    },
    scoring: {
      kill: 50,
      assist: 25,
      death: -25,
      objective: 100,
      win: 300,
      mvp: 150
    },
    rewards: {
      win: { credits: 15000, honor: 150, xp: 1500 },
      loss: { credits: 5000, honor: 30, xp: 500 },
      draw: { credits: 8000, honor: 80, xp: 800 }
    }
  },
  
  arena_5v5: {
    type: 'arena_5v5',
    name: 'Arena 5v5',
    description: 'Combate épico en equipo de 5.',
    teamSize: 5,
    teamCount: 2,
    totalPlayers: 10,
    rules: {
      respawn: true,
      respawnDelay: 10,
      friendlyFire: false,
      scoreLimit: 50,
      timeLimit: 1200,
      suddentDeath: true,
      powerups: true
    },
    scoring: {
      kill: 25,
      assist: 15,
      death: -15,
      objective: 50,
      win: 200,
      mvp: 100
    },
    rewards: {
      win: { credits: 25000, honor: 250, xp: 2500 },
      loss: { credits: 8000, honor: 50, xp: 800 },
      draw: { credits: 15000, honor: 150, xp: 1500 }
    }
  },
  
  free_for_all: {
    type: 'free_for_all',
    name: 'Todos Contra Todos',
    description: 'No hay equipos. Sobrevive.',
    teamSize: 1,
    teamCount: 10,
    totalPlayers: 10,
    rules: {
      respawn: true,
      respawnDelay: 3,
      friendlyFire: true,
      scoreLimit: 30,
      timeLimit: 600,
      suddentDeath: true,
      powerups: true
    },
    scoring: {
      kill: 50,
      assist: 0,
      death: -30,
      objective: 0,
      win: 400,
      mvp: 200
    },
    rewards: {
      win: { credits: 20000, honor: 200, xp: 2000 },
      loss: { credits: 5000, honor: 30, xp: 300 },
      draw: { credits: 10000, honor: 100, xp: 1000 }
    }
  },
  
  capture_flag: {
    type: 'capture_flag',
    name: 'Capturar la Bandera',
    description: 'Captura la bandera enemiga y defiende la tuya.',
    teamSize: 5,
    teamCount: 2,
    totalPlayers: 10,
    rules: {
      respawn: true,
      respawnDelay: 8,
      friendlyFire: false,
      scoreLimit: 3,
      timeLimit: 900,
      suddentDeath: false,
      powerups: false
    },
    scoring: {
      kill: 10,
      assist: 5,
      death: -5,
      objective: 500,
      win: 300,
      mvp: 150
    },
    rewards: {
      win: { credits: 30000, honor: 300, xp: 3000 },
      loss: { credits: 10000, honor: 60, xp: 1000 },
      draw: { credits: 18000, honor: 180, xp: 1800 }
    }
  },
  
  domination: {
    type: 'domination',
    name: 'Dominación',
    description: 'Controla los puntos estratégicos.',
    teamSize: 5,
    teamCount: 2,
    totalPlayers: 10,
    rules: {
      respawn: true,
      respawnDelay: 8,
      friendlyFire: false,
      scoreLimit: 500,
      timeLimit: 900,
      suddentDeath: false,
      powerups: false
    },
    scoring: {
      kill: 20,
      assist: 10,
      death: -10,
      objective: 5, // Por segundo controlado
      win: 300,
      mvp: 150
    },
    rewards: {
      win: { credits: 25000, honor: 250, xp: 2500 },
      loss: { credits: 8000, honor: 50, xp: 800 },
      draw: { credits: 15000, honor: 150, xp: 1500 }
    }
  },
  
  elimination: {
    type: 'elimination',
    name: 'Eliminación',
    description: 'Sin respawn. Último en pie gana.',
    teamSize: 5,
    teamCount: 2,
    totalPlayers: 10,
    rules: {
      respawn: false,
      respawnDelay: 0,
      friendlyFire: false,
      timeLimit: 300,
      suddentDeath: true,
      powerups: false
    },
    scoring: {
      kill: 100,
      assist: 50,
      death: -100,
      objective: 0,
      win: 500,
      mvp: 250
    },
    rewards: {
      win: { credits: 35000, honor: 350, xp: 3500 },
      loss: { credits: 10000, honor: 40, xp: 1000 },
      draw: { credits: 20000, honor: 200, xp: 2000 }
    }
  },
  
  tournament: {
    type: 'tournament',
    name: 'Torneo',
    description: 'Bracket de eliminación simple.',
    teamSize: 1,
    teamCount: 16,
    totalPlayers: 16,
    rules: {
      respawn: false,
      respawnDelay: 0,
      friendlyFire: false,
      timeLimit: 600,
      suddentDeath: true,
      powerups: false
    },
    scoring: {
      kill: 0,
      assist: 0,
      death: 0,
      objective: 0,
      win: 1000,
      mvp: 500
    },
    rewards: {
      win: { credits: 100000, honor: 1000, xp: 10000 },
      loss: { credits: 5000, honor: 20, xp: 500 },
      draw: { credits: 0, honor: 0, xp: 0 }
    }
  }
};

// ============================================
// SISTEMA DE ESPECTADOR
// ============================================
export interface SpectatorMode {
  enabled: boolean;
  delay: number; // Segundos de delay para evitar cheating
  maxSpectators: number;
  chatEnabled: boolean;
  cameraModes: ('free' | 'follow' | 'top_down' | 'cinematic')[];
  uiElements: {
    showHealth: boolean;
    showNames: boolean;
    showScores: boolean;
    showMinimap: boolean;
  };
}

export const SPECTATOR_CONFIG: SpectatorMode = {
  enabled: true,
  delay: 30,
  maxSpectators: 50,
  chatEnabled: true,
  cameraModes: ['free', 'follow', 'top_down'],
  uiElements: {
    showHealth: true,
    showNames: true,
    showScores: true,
    showMinimap: true
  }
};

// ============================================
// HELPERS
// ============================================
export function getMapById(id: string): PvPMap | undefined {
  return PVP_MAPS.find(m => m.id === id);
}

export function getMapsByMode(mode: RealTimePvPType): PvPMap[] {
  return PVP_MAPS.filter(m => m.gameModes.includes(mode));
}

export function getGameModeConfig(type: RealTimePvPType): GameModeConfig {
  return GAME_MODE_CONFIGS[type];
}

export function calculateMatchDuration(players: number, mode: RealTimePvPType): number {
  const baseDuration = GAME_MODE_CONFIGS[mode].rules.timeLimit;
  return Math.min(baseDuration, players * 60); // Máximo 1 minuto por jugador
}

export const PvPRealTimeSystem = {
  PVP_MAPS,
  GAME_MODE_CONFIGS,
  SPECTATOR_CONFIG,
  getMapById,
  getMapsByMode,
  getGameModeConfig,
  calculateMatchDuration
};
