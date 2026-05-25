/**
 * SISTEMA DE TELEMETRÍA - GALAXY ONLINE II
 * Analytics, métricas de juego, heatmaps
 */

// ============================================
// TIPOS DE EVENTOS DE TELEMETRÍA
// ============================================
export type TelemetryEventType = 
  | 'session_start'      // Inicio de sesión
  | 'session_end'        // Fin de sesión
  | 'player_action'      // Acción del jugador
  | 'combat_event'       // Evento de combate
  | 'economic_event'     // Transacción económica
  | 'ui_interaction'     // Interacción con UI
  | 'error'              // Error
  | 'performance'        // Métrica de rendimiento
  | 'crash'              // Crash
  | 'feature_usage'      // Uso de característica
  | 'progression'        // Progreso del jugador
  | 'social_event'       // Interacción social
  | 'tutorial_event';    // Evento de tutorial

export type TelemetrySeverity = 'info' | 'warning' | 'error' | 'critical';

// ============================================
// EVENTO DE TELEMETRÍA
// ============================================
export interface TelemetryEvent {
  id: string;
  timestamp: number;
  sessionId: string;
  
  // Jugador
  player: {
    playerId: string;
    accountType: 'registered' | 'guest';
    level: number;
    faction?: string;
    corporation?: string;
  };
  
  // Evento
  type: TelemetryEventType;
  category: string;
  action: string;
  label?: string;
  
  // Datos
  data: Record<string, any>;
  
  // Contexto
  context: {
    location?: {
      systemId: string;
      systemName: string;
      coordinates?: { x: number; y: number };
    };
    gameMode?: string;
    uiState?: string;
    timeInSession: number; // segundos
  };
  
  // Dispositivo
  device: {
    platform: 'pc' | 'mobile' | 'tablet' | 'console';
    os: string;
    browser?: string;
    resolution: string;
    language: string;
  };
  
  // Rendimiento
  performance?: {
    fps: number;
    memoryUsage: number;
    loadTime?: number;
    latency: number;
  };
  
  // Severidad
  severity: TelemetrySeverity;
}

// ============================================
// MÉTRICAS DE JUEGO
// ============================================
export interface GameMetrics {
  // Métricas de sesión
  session: {
    totalSessions: number;
    averageDuration: number; // segundos
    uniquePlayers: number;
    newPlayers: number;
    returningPlayers: number;
    retentionRate: number; // 0-1
  };
  
  // Métricas de engagement
  engagement: {
    dailyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionLength: number;
    sessionsPerPlayer: number;
    averagePlayTimePerDay: number;
  };
  
  // Métricas económicas
  economy: {
    totalTransactions: number;
    totalVolume: number;
    averageTransactionValue: number;
    inflationRate: number;
    activeMarkets: number;
  };
  
  // Métricas de combate
  combat: {
    totalBattles: number;
    averageBattleDuration: number;
    winRate: number;
    mostUsedShips: { shipId: string; count: number }[];
    mostEffectiveTactics: string[];
  };
  
  // Métricas de progresión
  progression: {
    averageLevel: number;
    levelDistribution: Record<number, number>;
    averageTimeToLevel: number;
    completionRates: Record<string, number>;
  };
  
  // Métricas de monetización
  monetization: {
    revenue: number;
    arpu: number; // Average Revenue Per User
    arppu: number; // Average Revenue Per Paying User
    conversionRate: number;
    averagePurchaseValue: number;
  };
}

// ============================================
// HEATMAP
// ============================================
export interface HeatmapData {
  // Ubicación
  systemId: string;
  area: string;
  
  // Tipo de heatmap
  type: 'pvp' | 'traffic' | 'deaths' | 'trading' | 'mining' | 'exploration';
  
  // Datos
  dataPoints: {
    coordinates: { x: number; y: number };
    intensity: number; // 0-100
    frequency: number;
    lastOccurrence: number;
  }[];
  
  // Metadatos
  metadata: {
    totalEvents: number;
    timeRange: { start: number; end: number };
    resolution: number; // metros por celda
    maxIntensity: number;
  };
  
  // Visualización
  visualization: {
    colorScheme: 'standard' | 'thermal' | 'night' | 'ocean';
    opacity: number;
    radius: number;
  };
}

// ============================================
// ANALYTICS EN TIEMPO REAL
// ============================================
export interface RealtimeAnalytics {
  // Jugadores activos
  activePlayers: {
    total: number;
    inCombat: number;
    inTrade: number;
    exploring: number;
    inMenu: number;
  };
  
  // Eventos por segundo
  eventsPerSecond: number;
  
  // Distribución geográfica
  geographicDistribution: Record<string, number>;
  
  // Servidor
  server: {
    cpuUsage: number;
    memoryUsage: number;
    networkIn: number;
    networkOut: number;
    activeConnections: number;
    queueLength: number;
  };
  
  // Problemas en vivo
  liveIssues: {
    type: string;
    severity: TelemetrySeverity;
    count: number;
    affectedPlayers: number;
  }[];
}

// ============================================
// FUNNEL DE CONVERSIÓN
// ============================================
export interface ConversionFunnel {
  id: string;
  name: string;
  
  // Pasos
  steps: {
    name: string;
    order: number;
    users: number;
    dropOff: number;
    conversionRate: number; // desde paso anterior
    averageTime: number; // segundos para completar paso
  }[];
  
  // Totales
  totalUsers: number;
  totalConversions: number;
  overallConversionRate: number;
  
  // Mejoras
  improvements: {
    step: string;
    potentialGain: number;
    suggestions: string[];
  }[];
}

// ============================================
// FUNNELS PREDEFINIDOS
// ============================================
export const PREDEFINED_FUNNELS: ConversionFunnel[] = [
  {
    id: 'funnel_new_player',
    name: 'Onboarding de Nuevos Jugadores',
    steps: [
      { name: 'Instalación', order: 1, users: 10000, dropOff: 500, conversionRate: 0.95, averageTime: 0 },
      { name: 'Tutorial Completado', order: 2, users: 7500, dropOff: 2000, conversionRate: 0.789, averageTime: 900 },
      { name: 'Primera Batalla', order: 3, users: 6000, dropOff: 1500, conversionRate: 0.80, averageTime: 300 },
      { name: 'Primera Victoria', order: 4, users: 4500, dropOff: 1500, conversionRate: 0.75, averageTime: 600 },
      { name: 'Día 7 Retención', order: 5, users: 3000, dropOff: 1500, conversionRate: 0.667, averageTime: 604800 },
      { name: 'Primera Compra', order: 6, users: 500, dropOff: 2500, conversionRate: 0.167, averageTime: 2592000 }
    ],
    totalUsers: 10000,
    totalConversions: 500,
    overallConversionRate: 0.05,
    improvements: [
      { step: 'Tutorial Completado', potentialGain: 1500, suggestions: ['Reducir duración del tutorial', 'Hacerlo más interactivo'] },
      { step: 'Primera Compra', potentialGain: 1500, suggestions: ['Oferta de bienvenida', 'Mejorar valor percibido'] }
    ]
  },
  {
    id: 'funnel_premium_conversion',
    name: 'Conversión a Premium',
    steps: [
      { name: 'Visita Tienda', order: 1, users: 50000, dropOff: 30000, conversionRate: 0.40, averageTime: 0 },
      { name: 'Añade a Carrito', order: 2, users: 15000, dropOff: 5000, conversionRate: 0.30, averageTime: 300 },
      { name: 'Inicia Checkout', order: 3, users: 10000, dropOff: 2000, conversionRate: 0.667, averageTime: 60 },
      { name: 'Pago Completado', order: 4, users: 7500, dropOff: 2500, conversionRate: 0.75, averageTime: 180 },
      { name: 'Segunda Compra', order: 5, users: 4500, dropOff: 3000, conversionRate: 0.60, averageTime: 604800 }
    ],
    totalUsers: 50000,
    totalConversions: 4500,
    overallConversionRate: 0.09,
    improvements: [
      { step: 'Visita Tienda', potentialGain: 10000, suggestions: ['Notificaciones de ofertas', 'UI más visible'] },
      { step: 'Inicia Checkout', potentialGain: 2000, suggestions: ['Simplificar proceso', 'Más métodos de pago'] }
    ]
  }
];

// ============================================
// CONFIGURACIÓN DE TELEMETRÍA
// ============================================
export interface TelemetryConfig {
  // Eventos habilitados
  enabledEvents: TelemetryEventType[];
  
  // Muestreo
  sampling: {
    rate: number; // 0-1
    minSessionDuration: number;
    maxEventsPerSession: number;
  };
  
  // Privacidad
  privacy: {
    anonymizeIp: boolean;
    respectDnt: boolean;
    gdprCompliant: boolean;
    dataRetention: number; // días
  };
  
  // Rendimiento
  performance: {
    batchSize: number;
    flushInterval: number; // milisegundos
    maxRetries: number;
    offlineStorage: boolean;
  };
}

// ============================================
// HELPERS
// ============================================
export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function trackEvent(
  eventType: TelemetryEventType,
  category: string,
  action: string,
  label?: string,
  value?: number,
  data?: Record<string, any>
): TelemetryEvent {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    sessionId: generateSessionId(),
    player: {
      playerId: '',
      accountType: 'registered',
      level: 1
    },
    type: eventType,
    category,
    action,
    label,
    data: { value, ...data },
    context: {
      timeInSession: 0
    },
    device: {
      platform: 'pc',
      os: 'unknown',
      resolution: '1920x1080',
      language: 'es'
    },
    severity: 'info'
  };
}

export function calculateRetentionRate(
  players: { playerId: string; sessions: number[] }[],
  cohortDate: number,
  retentionDays: number
): number {
  const cohortPlayers = players.filter(p => 
    p.sessions.some(s => s >= cohortDate && s < cohortDate + 86400000)
  );
  
  const retainedPlayers = cohortPlayers.filter(p =>
    p.sessions.some(s => s >= cohortDate + (retentionDays * 86400000))
  );
  
  return cohortPlayers.length > 0 ? retainedPlayers.length / cohortPlayers.length : 0;
}

export function getHeatmapForArea(
  heatmaps: HeatmapData[],
  systemId: string,
  type: HeatmapData['type']
): HeatmapData | undefined {
  return heatmaps.find(h => h.systemId === systemId && h.type === type);
}

export function analyzeFunnel(funnel: ConversionFunnel): {
  biggestDropoff: string;
  overallConversion: number;
  recommendations: string[];
} {
  // Encontrar mayor abandono
  let maxDropoff = 0;
  let biggestDropoffStep = '';
  
  funnel.steps.forEach(step => {
    if (step.dropOff > maxDropoff) {
      maxDropoff = step.dropOff;
      biggestDropoffStep = step.name;
    }
  });
  
  return {
    biggestDropoff: biggestDropoffStep,
    overallConversion: funnel.overallConversionRate,
    recommendations: funnel.improvements
      .filter(i => i.step === biggestDropoffStep)
      .flatMap(i => i.suggestions)
  };
}

export function aggregateMetrics(events: TelemetryEvent[]): GameMetrics {
  const metrics: Partial<GameMetrics> = {
    session: { totalSessions: 0, averageDuration: 0, uniquePlayers: 0, newPlayers: 0, returningPlayers: 0, retentionRate: 0 },
    engagement: { dailyActiveUsers: 0, monthlyActiveUsers: 0, averageSessionLength: 0, sessionsPerPlayer: 0, averagePlayTimePerDay: 0 },
    combat: { totalBattles: 0, averageBattleDuration: 0, winRate: 0, mostUsedShips: [], mostEffectiveTactics: [] }
  };
  
  // Contar eventos por tipo
  const eventCounts = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  if (metrics.combat) {
    metrics.combat.totalBattles = eventCounts['combat_event'] || 0;
  }
  
  return metrics as GameMetrics;
}

export const TelemetrySystem = {
  PREDEFINED_FUNNELS,
  generateSessionId,
  trackEvent,
  calculateRetentionRate,
  getHeatmapForArea,
  analyzeFunnel,
  aggregateMetrics
};
