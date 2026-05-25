/**
 * SISTEMA DE STREAMING INTEGRADO - GALAXY ONLINE II
 * Espectador, comentaristas, retransmisiones
 */

// ============================================
// TIPOS DE STREAMING
// ============================================
export type StreamType = 
  | 'live_gameplay'    // Gameplay en vivo
  | 'tournament'       // Torneo oficial
  | 'spectator'        // Modo espectador
  | 'replay'           // Replay con comentarios
  | 'tutorial'         // Tutorial en vivo
  | 'event'            // Evento especial
  | 'pvp_arena'        // Arena PvP
  | 'raid';            // Raid en equipo

export type StreamQuality = 'mobile' | 'sd' | 'hd' | 'full_hd' | '4k';

// ============================================
// STREAM
// ============================================
export interface GameStream {
  id: string;
  title: string;
  type: StreamType;
  
  // Streamer
  streamer: {
    playerId: string;
    playerName: string;
    avatar: string;
    followerCount: number;
    reputation: number;
    isPartner: boolean;
    isAffiliate: boolean;
  };
  
  // Estado
  status: {
    live: boolean;
    startedAt?: number;
    endedAt?: number;
    duration: number;
    viewerCount: number;
    peakViewers: number;
    totalViews: number;
  };
  
  // Configuración técnica
  technical: {
    quality: StreamQuality;
    fps: number;
    bitrate: number;
    latency: 'low' | 'normal' | 'high';
    audioChannels: number;
  };
  
  // Contenido
  content: {
    description: string;
    tags: string[];
    language: string;
    mature: boolean;
    spoilers: boolean;
  };
  
  // Gameplay
  gameplay: {
    gameMode: string;
    shipClass?: string;
    faction?: string;
    location?: string;
    mission?: string;
    teamSize?: number;
    opponents?: number;
  };
  
  // Interactividad
  interactivity: {
    chatEnabled: boolean;
    chatDelay: number; // segundos
    polls: StreamPoll[];
    predictions: StreamPrediction[];
    commands: ChatCommand[];
  };
  
  // Co-streamers
  coStreamers?: {
    playerId: string;
    playerName: string;
    role: 'commentator' | 'analyst' | 'guest' | 'opponent';
    camera: boolean;
    audio: boolean;
  }[];
}

// ============================================
// MODO ESPECTADOR
// ============================================
export interface StreamingSpectatorMode {
  // Información de la partida
  match: {
    matchId: string;
    type: 'pvp' | 'pve' | 'tournament' | 'raid' | 'custom';
    status: 'waiting' | 'in_progress' | 'finished';
    duration: number;
    startTime: number;
  };
  
  // Jugadores
  players: {
    playerId: string;
    playerName: string;
    faction: string;
    corporation?: string;
    shipClass: string;
    shipName: string;
    team: number;
    stats: {
      kills: number;
      deaths: number;
      assists: number;
      damage: number;
      score: number;
    };
    isStreamable: boolean;
  }[];
  
  // Cámaras disponibles
  cameras: {
    id: string;
    name: string;
    type: 'free' | 'player' | 'objective' | 'cinematic';
    target?: string;
    position?: { x: number; y: number; z: number };
    rotation?: { pitch: number; yaw: number; roll: number };
  }[];
  
  // Herramientas de análisis
  analysis: {
    minimap: boolean;
    heatmap: boolean;
    statistics: boolean;
    replayBuffer: boolean;
    slowMotion: boolean;
    frameByFrame: boolean;
  };
  
  // Comentaristas
  commentators: {
    playerId: string;
    playerName: string;
    camera: boolean;
    pictureInPicture: boolean;
    analysisTools: boolean;
  }[];
}

// ============================================
// VOTACIÓN EN STREAM
// ============================================
export interface StreamPoll {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    votes: number;
    percentage: number;
  }[];
  
  config: {
    duration: number;
    multipleChoice: boolean;
    viewerVoting: boolean;
    subscriberOnly: boolean;
  };
  
  status: {
    active: boolean;
    startedAt: number;
    endsAt: number;
    totalVotes: number;
  };
}

// ============================================
// PREDICCIÓN EN STREAM
// ============================================
export interface StreamPrediction {
  id: string;
  title: string;
  description: string;
  
  outcomes: {
    id: string;
    title: string;
    odds: number;
    totalPoints: number;
    bettors: number;
  }[];
  
  config: {
    minBet: number;
    maxBet: number;
    duration: number;
    subscriberOnly: boolean;
  };
  
  status: {
    active: boolean;
    startedAt: number;
    endsAt: number;
    totalPool: number;
    resolved: boolean;
    winningOutcome?: string;
  };
}

// ============================================
// COMANDOS DE CHAT
// ============================================
export interface ChatCommand {
  command: string;
  description: string;
  usage: string;
  permission: 'all' | 'subscriber' | 'moderator' | 'broadcaster';
  cooldown: number;
  response: string | ((args: string[], user: string) => string);
}

// ============================================
// REPLAY CON COMENTARIOS
// ============================================
export interface CommentedReplay {
  replayId: string;
  originalMatchId: string;
  
  // Información
  info: {
    title: string;
    description: string;
    uploader: string;
    uploadDate: number;
    views: number;
    likes: number;
    dislikes: number;
  };
  
  // Marcas de tiempo
  timeline: {
    timestamp: number;
    label: string;
    description: string;
    type: 'kill' | 'death' | 'objective' | 'clutch' | 'funny' | 'important';
  }[];
  
  // Comentarios
  commentary: {
    audioTrack?: string;
    transcripcion?: string;
    language: string;
    commentator: string;
    analysisLevel: 'casual' | 'educational' | 'professional';
  };
  
  // Anotaciones visuales
  annotations: {
    timestamp: number;
    type: 'arrow' | 'circle' | 'highlight' | 'text' | 'slowmo';
    position: { x: number; y: number };
    duration: number;
    content: string;
  }[];
}

// ============================================
// TORNEO EN VIVO
// ============================================
export interface LiveTournament {
  tournamentId: string;
  name: string;
  
  // Estado
  status: {
    phase: 'registration' | 'qualifiers' | 'bracket' | 'finals' | 'finished';
    currentRound: number;
    totalRounds: number;
    live: boolean;
  };
  
  // Cobertura
  coverage: {
    mainStream: GameStream;
    secondaryStreams: GameStream[];
    observerCount: number;
    commentators: string[];
    analysts: string[];
    interviewers: string[];
  };
  
  // Partidas en vivo
  liveMatches: {
    matchId: string;
    players: string[];
    status: 'waiting' | 'in_progress' | 'finished';
    streamUrl: string;
    cameraControlledBy?: string;
  }[];
  
  // Estadísticas en vivo
  stats: {
    totalViewers: number;
    peakViewers: number;
    chatMessagesPerMinute: number;
    activePolls: number;
    ongoingPredictions: number;
  };
}

// ============================================
// CONFIGURACIÓN DE STREAMER
// ============================================
export interface StreamerSettings {
  playerId: string;
  
  // General
  general: {
    titleTemplate: string;
    defaultTags: string[];
    autoRecord: boolean;
    saveReplays: boolean;
  };
  
  // Técnico
  technical: {
    defaultQuality: StreamQuality;
    defaultFps: number;
    bitrate: number;
    encoder: 'hardware' | 'software';
    audioInput: string;
    audioOutput: string;
  };
  
  // Interactividad
  interactivity: {
    chatEnabled: boolean;
    chatCommands: ChatCommand[];
    autoPolls: boolean;
    predictionsEnabled: boolean;
    subscriberOnlyMode: boolean;
    slowMode: number;
  };
  
  // Overlay
  overlay: {
    enabled: boolean;
    style: 'minimal' | 'compact' | 'full' | 'custom';
    elements: {
      webcam: boolean;
      chat: boolean;
      alerts: boolean;
      stats: boolean;
      minimap: boolean;
      teamInfo: boolean;
    };
    customCss?: string;
  };
  
  // Notificaciones
  notifications: {
    newFollower: boolean;
    newSubscriber: boolean;
    donations: boolean;
    raid: boolean;
    host: boolean;
  };
}

// ============================================
// ESPECTADOR
// ============================================
export interface Viewer {
  playerId: string;
  playerName: string;
  
  // Preferencias
  preferences: {
    preferredQuality: StreamQuality;
    autoQuality: boolean;
    chatEnabled: boolean;
    chatSize: 'small' | 'medium' | 'large' | 'hidden';
    theaterMode: boolean;
    notifications: boolean;
  };
  
  // Historial
  history: {
    watchedStreams: string[];
    totalWatchTime: number;
    favoriteStreamers: string[];
    subscribedChannels: string[];
  };
  
  // Interacciones
  interactions: {
    messagesSent: number;
    pollsParticipated: number;
    predictionsMade: number;
    commandsUsed: number;
  };
}

// ============================================
// COMANDOS PREDEFINIDOS
// ============================================
export const DEFAULT_CHAT_COMMANDS: ChatCommand[] = [
  {
    command: '!ship',
    description: 'Muestra información sobre la nave actual del streamer',
    usage: '!ship',
    permission: 'all',
    cooldown: 30,
    response: 'Streamer está pilotando: {{current_ship}} - Clase: {{ship_class}} - Nivel: {{ship_level}}'
  },
  {
    command: '!stats',
    description: 'Muestra estadísticas del streamer',
    usage: '!stats',
    permission: 'all',
    cooldown: 60,
    response: 'Victorias: {{wins}} | Derrotas: {{losses}} | Winrate: {{winrate}}% | Ranking: {{rank}}'
  },
  {
    command: '!rank',
    description: 'Muestra el ranking actual del streamer',
    usage: '!rank',
    permission: 'all',
    cooldown: 60,
    response: 'Streamer está en {{rank_tier}} {{rank_division}} con {{rank_points}} puntos'
  },
  {
    command: '!discord',
    description: 'Enlace al Discord del streamer',
    usage: '!discord',
    permission: 'all',
    cooldown: 300,
    response: 'Únete al Discord: {{discord_link}}'
  },
  {
    command: '!build',
    description: 'Muestra la build actual del streamer',
    usage: '!build [nave]',
    permission: 'subscriber',
    cooldown: 120,
    response: 'Build actual: {{build_name}} - {{build_url}}'
  },
  {
    command: '!tip',
    description: 'Da un consejo aleatorio del juego',
    usage: '!tip',
    permission: 'all',
    cooldown: 60,
    response: () => {
      const tips = [
        'Recuerda siempre revisar tus escudos antes de entrar en combate',
        'El flanqueo puede cambiar el resultado de una batalla',
        'No subestimes la importancia de los módulos de soporte',
        'Las naves rápidas son ideales para reconocimiento',
        'Siempre ten una ruta de escape planeada'
      ];
      return '💡 Tip: ' + tips[Math.floor(Math.random() * tips.length)];
    }
  }
];

// ============================================
// HELPERS
// ============================================
export function calculateStreamScore(stream: GameStream): number {
  let score = 0;
  
  // Factor de espectadores
  score += stream.status.viewerCount * 0.1;
  score += stream.status.peakViewers * 0.05;
  
  // Factor de duración (si no es en vivo)
  if (!stream.status.live) {
    score += stream.status.duration / 60; // 1 punto por minuto
  }
  
  // Factor de interacción
  score += stream.interactivity.polls.length * 5;
  score += stream.interactivity.predictions.length * 10;
  
  // Factor de calidad
  const qualityMultiplier = {
    'mobile': 0.5,
    'sd': 0.8,
    'hd': 1,
    'full_hd': 1.2,
    '4k': 1.5
  }[stream.technical.quality];
  score *= qualityMultiplier;
  
  return score;
}

export function getActiveStreams(streams: GameStream[]): GameStream[] {
  return streams.filter(s => s.status.live);
}

export function getStreamsByType(streams: GameStream[], type: StreamType): GameStream[] {
  return streams.filter(s => s.type === type);
}

export function getRecommendedStreams(
  viewer: Viewer,
  availableStreams: GameStream[]
): GameStream[] {
  // Filtrar por preferencias
  let recommended = availableStreams.filter(s => 
    s.content.language === viewer.preferences.preferredQuality ||
    s.streamer.reputation > 50
  );
  
  // Priorizar streamers favoritos
  const favoriteStreams = recommended.filter(s => 
    viewer.history.favoriteStreamers.includes(s.streamer.playerId)
  );
  
  // Priorizar suscripciones
  const subscribedStreams = recommended.filter(s => 
    viewer.history.subscribedChannels.includes(s.streamer.playerId)
  );
  
  // Combinar y ordenar
  return [...subscribedStreams, ...favoriteStreams, ...recommended]
    .filter((s, i, arr) => arr.findIndex(t => t.id === s.id) === i) // Remover duplicados
    .sort((a, b) => b.status.viewerCount - a.status.viewerCount);
}

export function createSpectatorMode(match: StreamingSpectatorMode['match'], players: StreamingSpectatorMode['players']): StreamingSpectatorMode {
  return {
    match,
    players,
    cameras: [
      { id: 'cam_free', name: 'Cámara Libre', type: 'free' },
      ...players.map((p: StreamingSpectatorMode['players'][0]) => ({
        id: `cam_${p.playerId}`,
        name: `${p.playerName}'s View`,
        type: 'player' as const,
        target: p.playerId
      }))
    ],
    analysis: {
      minimap: true,
      heatmap: true,
      statistics: true,
      replayBuffer: true,
      slowMotion: true,
      frameByFrame: true
    },
    commentators: []
  };
}

export function generateStreamThumbnail(stream: GameStream): string {
  // Generar URL de thumbnail basado en el estado del stream
  const baseUrl = '/api/thumbnails/';
  const params = new URLSearchParams({
    ship: stream.gameplay.shipClass || 'default',
    mode: stream.gameplay.gameMode,
    faction: stream.gameplay.faction || 'neutral',
    live: stream.status.live.toString()
  });
  return `${baseUrl}?${params.toString()}`;
}

export const StreamingSystem = {
  DEFAULT_CHAT_COMMANDS,
  calculateStreamScore,
  getActiveStreams,
  getStreamsByType,
  getRecommendedStreams,
  createSpectatorMode,
  generateStreamThumbnail
};
