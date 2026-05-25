/**
 * SISTEMA DE NOTAS/REGISTROS - GALAXY ONLINE II
 * Diario de capitán, registro de batallas, historia personal
 */

// ============================================
// TIPOS DE REGISTROS
// ============================================
export type LogType = 
  | 'diary'        // Entrada de diario personal
  | 'battle'       // Registro de batalla
  | 'trade'        // Transacción comercial
  | 'discovery'    // Descubrimiento
  | 'mission'      // Misión completada
  | 'encounter'    // Encuentro memorable
  | 'achievement'  // Logro desbloqueado
  | 'system'       // Evento del sistema
  | 'custom';      // Entrada personalizada

export type LogImportance = 'trivial' | 'minor' | 'normal' | 'major' | 'critical' | 'legendary';

// ============================================
// REGISTRO DEL CAPITÁN
// ============================================
export interface CaptainLog {
  id: string;
  captainId: string;
  captainName: string;
  
  // Metadatos
  type: LogType;
  importance: LogImportance;
  timestamp: number;
  stardate: string;
  
  // Ubicación
  location: {
    systemId: string;
    systemName: string;
    coordinates?: { x: number; y: number };
    sector?: string;
  };
  
  // Contenido
  content: {
    title: string;
    entry: string;
    tags: string[];
    mood?: 'happy' | 'concerned' | 'excited' | 'melancholic' | 'angry' | 'triumphant' | 'neutral';
  };
  
  // Datos adicionales según tipo
  details?: {
    // Para batallas
    battleData?: {
      opponent: string;
      outcome: 'victory' | 'defeat' | 'draw' | 'retreat';
      shipsLost: number;
      shipsDestroyed: number;
      casualties: number;
      loot?: string[];
      notableActions?: string[];
    };
    
    // Para comercio
    tradeData?: {
      goods: string[];
      profit: number;
      partner: string;
      location: string;
    };
    
    // Para descubrimientos
    discoveryData?: {
      type: string;
      name: string;
      significance: number;
      rewards: string[];
    };
    
    // Para misiones
    missionData?: {
      missionId: string;
      missionName: string;
      difficulty: number;
      rewards: string[];
      timeTaken: number;
    };
  };
  
  // Media adjunta
  media?: {
    screenshots: string[];
    videos: string[];
    audioLogs: string[];
    attachments: string[];
  };
  
  // Estado
  status: {
    public: boolean;
    sharedWith: string[];
    bookmarked: boolean;
    edited: boolean;
    editedAt?: number;
  };
}

// ============================================
// DIARIO DEL CAPITÁN
// ============================================
export interface CaptainDiary {
  captainId: string;
  
  // Configuración
  settings: {
    autoLogBattles: boolean;
    autoLogTrades: boolean;
    autoLogDiscoveries: boolean;
    reminderFrequency: 'never' | 'daily' | 'weekly' | 'monthly';
    publicByDefault: boolean;
    template?: string;
  };
  
  // Entradas
  entries: CaptainLog[];
  
  // Organización
  organization: {
    bookmarks: string[];
    categories: Record<string, string[]>;
    tags: string[];
    searchIndex: Record<string, string[]>;
  };
  
  // Estadísticas
  stats: {
    totalEntries: number;
    entriesByType: Record<LogType, number>;
    longestEntry: number;
    writingStreak: number; // Días consecutivos escribiendo
    lastEntryDate: number;
  };
  
  // Logros de escritura
  writingAchievements: {
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
    unlockedAt?: number;
  }[];
}

// ============================================
// REGISTRO DE BATALLAS
// ============================================
export interface BattleRecord {
  id: string;
  timestamp: number;
  stardate: string;
  
  // Ubicación
  location: {
    systemId: string;
    systemName: string;
    sector: string;
    coordinates: { x: number; y: number };
  };
  
  // Participantes
  participants: {
    player: {
      captainId: string;
      captainName: string;
      shipId: string;
      shipName: string;
      shipClass: string;
      fleetSize: number;
      totalPower: number;
    };
    opponent: {
      type: 'player' | 'npc' | 'pirate' | 'faction' | 'alien';
      name: string;
      shipClass?: string;
      fleetSize: number;
      totalPower: number;
      faction?: string;
    };
  };
  
  // Desarrollo de la batalla
  timeline: {
    phase: 'opening' | 'mid' | 'climax' | 'ending';
    timestamp: number;
    description: string;
    playerShips: number;
    enemyShips: number;
    playerShield: number;
    enemyShield: number;
    notableEvents: string[];
  }[];
  
  // Resultado
  outcome: {
    result: 'victory' | 'defeat' | 'draw' | 'retreat' | 'aborted';
    victoryType?: 'decisive' | 'narrow' | 'pyrrhic' | 'flawless';
    duration: number;
    
    // Pérdidas jugador
    playerLosses: {
      shipsDestroyed: number;
      shipsDamaged: number;
      crewKilled: number;
      crewInjured: number;
      resourcesLost: number;
    };
    
    // Pérdidas enemigas
    enemyLosses: {
      shipsDestroyed: number;
      shipsEscaped: number;
      crewKilled: number;
      resourcesRecovered: number;
    };
    
    // Recompensas
    rewards: {
      experience: number;
      credits: number;
      reputation: number;
      items: string[];
      titles?: string[];
    };
    
    // Análisis
    mvpActions: string[];
    mistakes: string[];
    lessons: string[];
  };
  
  // Replay data
  replay: {
    available: boolean;
    replayId: string;
    shareable: boolean;
    downloadUrl?: string;
  };
}

// ============================================
// HISTORIA PERSONAL
// ============================================
export interface PersonalHistory {
  playerId: string;
  playerName: string;
  createdAt: number;
  
  // Resumen de carrera
  career: {
    currentRank: string;
    faction: string;
    corporation?: string;
    totalPlayTime: number;
    
    // Estadísticas globales
    stats: {
      battles: { total: number; won: number; lost: number; winRate: number };
      trading: { totalProfit: number; transactions: number; mostProfitable: number };
      exploration: { systemsVisited: number; planetsScanned: number; anomaliesFound: number };
      social: { alliances: number; enemies: number; reputation: number };
      crafting: { itemsCrafted: number; blueprintsDiscovered: number };
    };
    
    // Logros principales
    majorAchievements: {
      id: string;
      name: string;
      description: string;
      date: number;
      significance: number;
    }[];
    
    // Momentos definitorios
    definingMoments: {
      id: string;
      title: string;
      description: string;
      date: number;
      impact: 'minor' | 'moderate' | 'major' | 'life_changing';
    }[];
  };
  
  // Línea temporal
  timeline: {
    era: string;
    startDate: number;
    endDate?: number;
    description: string;
    keyEvents: string[];
    status: 'current' | 'completed' | 'abandoned';
  }[];
  
  // Relaciones
  relationships: {
    allies: { playerId: string; name: string; since: number; strength: number }[];
    enemies: { playerId: string; name: string; since: number; reason: string }[];
    mentors: { playerId: string; name: string; lessons: string[] }[];
    rivals: { playerId: string; name: string; competitionType: string }[];
  };
  
  // Legado
  legacy: {
    influence: number; // 0-100
    followers: number;
    students: string[];
    contributions: string[];
    memorableQuotes: string[];
    epitaph?: string; // Lo que dirán cuando te vayas
  };
}

// ============================================
// TEMPLATES DE REGISTROS
// ============================================
export const LOG_TEMPLATES: Record<LogType, { title: string; prompts: string[] }> = {
  diary: {
    title: 'Diario Estelar - {{DATE}}',
    prompts: [
      'Hoy me desperté en...',
      'Lo más destacado del día fue...',
      'Mis pensamientos sobre el futuro...',
      'Extraño...',
      'Estoy agradecido por...'
    ]
  },
  battle: {
    title: 'Informe de Batalla: {{OPPONENT}}',
    prompts: [
      'El enemigo tenía...',
      'Mi estrategia fue...',
      'El momento crucial fue cuando...',
      'Lo que salió bien...',
      'Lo que podría haber hecho mejor...'
    ]
  },
  trade: {
    title: 'Registro Comercial - {{LOCATION}}',
    prompts: [
      'Compré...',
      'Vendí...',
      'El mercado estaba...',
      'Aprendí que...',
      'Próxima vez debería...'
    ]
  },
  discovery: {
    title: 'Informe de Descubrimiento: {{NAME}}',
    prompts: [
      'Al principio pensé que era...',
      'Lo que encontré fue...',
      'Su importancia es...',
      'Quiero investigar más sobre...',
      'Esto podría cambiar...'
    ]
  },
  mission: {
    title: 'Informe de Misión: {{MISSION}}',
    prompts: [
      'El objetivo era...',
      'Las dificultades encontradas...',
      'Cómo las superé...',
      'La recompensa valió la pena porque...',
      'Recomendaciones para futuros agentes...'
    ]
  },
  encounter: {
    title: 'Encuentro Memorabile',
    prompts: [
      'Conocí a...',
      'La situación era...',
      'Lo que me impresionó fue...',
      'Aprendí que...',
      'Espero volver a...'
    ]
  },
  achievement: {
    title: '¡Logro Desbloqueado: {{ACHIEVEMENT}}!',
    prompts: [
      'Para conseguir esto tuve que...',
      'El momento de la victoria fue...',
      'Significa para mí...',
      'El siguiente objetivo es...',
      'Agradezco a...'
    ]
  },
  system: {
    title: 'Registro del Sistema',
    prompts: ['Evento automático registrado']
  },
  custom: {
    title: 'Registro Personal',
    prompts: ['Escribe lo que desees recordar...']
  }
};

// ============================================
// HELPERS
// ============================================
export function generateStardate(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear() + 1000; // Futuro!
  const day = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  return `${year}.${day.toString().padStart(3, '0')}`;
}

export function createLogEntry(
  type: LogType,
  captainId: string,
  content: Partial<CaptainLog['content']>,
  location: CaptainLog['location'],
  details?: CaptainLog['details']
): CaptainLog {
  const now = Date.now();
  const template = LOG_TEMPLATES[type];
  
  return {
    id: `log_${now}_${Math.random().toString(36).substr(2, 9)}`,
    captainId,
    captainName: '', // Se llena después
    type,
    importance: 'normal',
    timestamp: now,
    stardate: generateStardate(now),
    location,
    content: {
      title: content.title || template.title,
      entry: content.entry || '',
      tags: content.tags || [],
      mood: content.mood || 'neutral'
    },
    details,
    media: { screenshots: [], videos: [], audioLogs: [], attachments: [] },
    status: { public: false, sharedWith: [], bookmarked: false, edited: false }
  };
}

export function analyzeBattlePerformance(battle: BattleRecord): {
  rating: number;
  analysis: string;
  recommendations: string[];
} {
  let rating = 50; // Base
  const recommendations: string[] = [];
  
  // Factor de resultado
  if (battle.outcome.result === 'victory') {
    rating += 30;
    if (battle.outcome.victoryType === 'flawless') rating += 20;
    if (battle.outcome.victoryType === 'narrow') rating -= 10;
  } else if (battle.outcome.result === 'defeat') {
    rating -= 30;
  }
  
  // Factor de eficiencia
  const efficiency = battle.outcome.enemyLosses.shipsDestroyed / 
    (battle.participants.player.fleetSize || 1);
  rating += efficiency * 20;
  
  // Pérdidas propias
  const lossRatio = battle.outcome.playerLosses.shipsDestroyed / 
    (battle.participants.player.fleetSize || 1);
  rating -= lossRatio * 30;
  
  // Duración (más corto es mejor, hasta cierto punto)
  if (battle.outcome.duration < 300) rating += 10;
  if (battle.outcome.duration > 1800) rating -= 10;
  
  // Generar recomendaciones
  if (lossRatio > 0.3) recommendations.push('Considera mejorar blindaje o escudos');
  if (efficiency < 0.5) recommendations.push('Analiza composición de flota enemiga');
  if (battle.outcome.duration > 1800) recommendations.push('Trabaja en daño por segundo');
  
  return {
    rating: Math.max(0, Math.min(100, rating)),
    analysis: rating > 80 ? 'Excelente desempeño' : rating > 60 ? 'Buen desempeño' : 'Necesita mejora',
    recommendations
  };
}

export function getLogsByType(logs: CaptainLog[], type: LogType): CaptainLog[] {
  return logs.filter(log => log.type === type);
}

export function getLogsByImportance(logs: CaptainLog[], minImportance: LogImportance): CaptainLog[] {
  const importanceOrder = ['trivial', 'minor', 'normal', 'major', 'critical', 'legendary'];
  const minIndex = importanceOrder.indexOf(minImportance);
  return logs.filter(log => importanceOrder.indexOf(log.importance) >= minIndex);
}

export function searchLogs(logs: CaptainLog[], query: string): CaptainLog[] {
  const lowerQuery = query.toLowerCase();
  return logs.filter(log => 
    log.content.title.toLowerCase().includes(lowerQuery) ||
    log.content.entry.toLowerCase().includes(lowerQuery) ||
    log.content.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function calculateWritingStats(diary: CaptainDiary): {
  totalWords: number;
  averageEntryLength: number;
  favoriteTags: string[];
  mostActiveMonth: string;
} {
  const totalWords = diary.entries.reduce((sum, entry) => 
    sum + entry.content.entry.split(/\s+/).length, 0);
  
  const averageEntryLength = diary.entries.length > 0 
    ? totalWords / diary.entries.length 
    : 0;
  
  // Contar tags
  const tagCounts: Record<string, number> = {};
  diary.entries.forEach(entry => {
    entry.content.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const favoriteTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);
  
  // Mes más activo
  const monthCounts: Record<string, number> = {};
  diary.entries.forEach(entry => {
    const month = new Date(entry.timestamp).toLocaleString('default', { month: 'long', year: 'numeric' });
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });
  const mostActiveMonth = Object.entries(monthCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  
  return { totalWords, averageEntryLength, favoriteTags, mostActiveMonth };
}

export const CaptainLogsSystem = {
  LOG_TEMPLATES,
  generateStardate,
  createLogEntry,
  analyzeBattlePerformance,
  getLogsByType,
  getLogsByImportance,
  searchLogs,
  calculateWritingStats
};
