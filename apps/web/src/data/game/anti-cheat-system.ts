/**
 * SISTEMA DE ANTI-CHEAT - GALAXY ONLINE II
 * Detección trampas, reportes, sanciones
 */

// ============================================
// TIPOS DE TRAMPAS
// ============================================
export type CheatType = 
  | 'aimbot'           // Apuntado automático
  | 'wallhack'         // Ver a través de paredes
  | 'speed_hack'       // Velocidad alterada
  | 'god_mode'         // Invencibilidad
  | 'resource_hack'    // Recursos infinitos
  | 'teleport'         // Teletransportación
  | 'radar_hack'       // Radar mejorado
  | 'macro'            // Macros automatizados
  | 'exploit'          // Explotar bugs
  | 'ddos'             // Ataques DDoS
  | 'botting'          // Uso de bots
  | 'account_sharing'  // Compartir cuenta
  | 'elo_boosting'     // Manipulación de ranking
  | 'reverse_boosting' // Manipulación inversa
  | 'currency_fraud'   // Fraude de moneda
  | 'chargeback';      // Chargebacks

export type DetectionConfidence = 'low' | 'medium' | 'high' | 'confirmed';

// ============================================
// DETECCIÓN DE TRAMPA
// ============================================
export interface CheatDetection {
  id: string;
  timestamp: number;
  
  // Jugador sospechoso
  suspect: {
    playerId: string;
    playerName: string;
    accountAge: number; // días
    previousViolations: number;
    trustScore: number; // 0-100
  };
  
  // Tipo de trampa
  cheatType: CheatType;
  confidence: DetectionConfidence;
  
  // Evidencia
  evidence: {
    videoClips: string[];
    replayIds: string[];
    statisticalAnomalies: {
      metric: string;
      expected: number;
      actual: number;
      deviation: number; // desviaciones estándar
    }[];
    behavioralPatterns: string[];
    timestamps: number[];
  };
  
  // Contexto
  context: {
    matchId?: string;
    systemId?: string;
    gameMode?: string;
    otherPlayers: string[];
    serverLogs: string[];
  };
  
  // Detección
  detection: {
    method: 'automated' | 'manual' | 'report_based' | 'statistical' | 'heuristic';
    detectorVersion: string;
    falsePositiveProbability: number;
    relatedDetections: string[];
  };
  
  // Estado
  status: 'pending' | 'under_review' | 'confirmed' | 'false_positive' | 'appealed';
}

// ============================================
// SISTEMA DE DETECCIÓN AUTOMÁTICA
// ============================================
export interface AutomatedDetection {
  // Módulos de detección
  modules: {
    aimbot: {
      enabled: boolean;
      sensitivity: number;
      maxReactionTime: number; // ms
      suspiciousPatterns: string[];
    };
    
    movement: {
      enabled: boolean;
      maxSpeed: number;
      maxAcceleration: number;
      teleportThreshold: number;
    };
    
    statistical: {
      enabled: boolean;
      baselineSamples: number;
      anomalyThreshold: number; // desviaciones estándar
      metrics: string[];
    };
    
    behavioral: {
      enabled: boolean;
      sessionAnalysis: boolean;
      patternRecognition: boolean;
      mlModelVersion: string;
    };
  };
  
  // Umbrales
  thresholds: {
    warning: number;
    kick: number;
    ban: number;
  };
  
  // Respuesta automática
  autoResponse: {
    enabled: boolean;
    actions: {
      onWarning: string[];
      onKick: string[];
      onBan: string[];
    };
  };
}

// ============================================
// REPORTE DE JUGADOR
// ============================================
export interface PlayerReport {
  id: string;
  timestamp: number;
  
  // Reportante
  reporter: {
    playerId: string;
    playerName: string;
    reputation: number;
    previousReportsAccuracy: number;
  };
  
  // Reportado
  reported: {
    playerId: string;
    playerName: string;
    matchId?: string;
  };
  
  // Tipo de reporte
  type: 'cheating' | 'toxicity' | 'griefing' | 'afk' | 'exploiting' | 'other';
  
  // Detalles
  details: {
    description: string;
    timestamp?: number;
    videoEvidence?: string[];
    screenshotEvidence?: string[];
    chatLogs?: string[];
  };
  
  // Estado
  status: {
    state: 'pending' | 'under_review' | 'action_taken' | 'dismissed';
    assignedTo?: string;
    reviewedAt?: number;
    actionTaken?: string;
  };
}

// ============================================
// SANCIONES
// ============================================
export interface Sanction {
  id: string;
  timestamp: number;
  
  // Sancionado
  player: {
    playerId: string;
    playerName: string;
    previousSanctions: number;
  };
  
  // Tipo de sanción
  type: 'warning' | 'kick' | 'temporary_ban' | 'permanent_ban' | 'shadow_ban' | 'account_reset' | 'legal_action';
  
  // Razón
  reason: {
    primary: CheatType | string;
    description: string;
    evidenceIds: string[];
    detectionId?: string;
    reportId?: string;
  };
  
  // Duración (si aplica)
  duration?: {
    start: number;
    end?: number;
    permanent: boolean;
  };
  
  // Alcance
  scope: {
    gameMode?: string[];
    features?: string[];
    global: boolean;
  };
  
  // Apelación
  appeal: {
    allowed: boolean;
    submitted?: boolean;
    submittedAt?: number;
    reason?: string;
    status?: 'pending' | 'approved' | 'denied';
    reviewedBy?: string;
    reviewedAt?: number;
  };
  
  // Ejecución
  execution: {
    executedAt: number;
    executedBy: string;
    automated: boolean;
    effective: boolean;
  };
}

// ============================================
// HISTORIAL DE SANCIONES
// ============================================
export interface SanctionHistory {
  playerId: string;
  
  // Sanciones
  sanctions: Sanction[];
  
  // Resumen
  summary: {
    totalSanctions: number;
    activeSanctions: number;
    warnings: number;
    kicks: number;
    temporaryBans: number;
    permanentBans: number;
    lastSanctionAt?: number;
    escalationLevel: number;
  };
  
  // Evaluación de riesgo
  riskAssessment: {
    score: number; // 0-100
    likelihoodOfReoffense: number;
    recommendedAction: string;
    reviewPriority: 'low' | 'medium' | 'high' | 'urgent';
  };
}

// ============================================
// ANÁLISIS ESTADÍSTICO
// ============================================
export interface StatisticalAnalysis {
  // Métricas del jugador
  playerMetrics: {
    playerId: string;
    accuracy: number;
    reactionTime: number;
    headshotRate: number;
    movementConsistency: number;
    winRate: number;
    kda: number;
  };
  
  // Comparación con baseline
  comparison: {
    percentile: number;
    zScore: number; // desviaciones estándar de la media
    anomalies: string[];
    confidence: DetectionConfidence;
  };
  
  // Baseline poblacional
  baseline: {
    sampleSize: number;
    mean: number;
    median: number;
    stdDev: number;
    percentiles: Record<number, number>;
  };
}

// ============================================
// CONFIGURACIÓN DE ANTI-CHEAT
// ============================================
export interface AntiCheatConfig {
  // Niveles de detección
  detection: {
    strictness: 'lenient' | 'normal' | 'strict' | 'aggressive';
    realTimeAnalysis: boolean;
    replayAnalysis: boolean;
    mlEnabled: boolean;
  };
  
  // Sanciones automáticas
  autoSanctions: {
    enabled: boolean;
    requireConfirmation: boolean;
    thresholds: {
      warning: number;
      kick: number;
      temporaryBan: number;
      permanentBan: number;
    };
  };
  
  // Reportes
  reports: {
    minReporterReputation: number;
    minReportsForReview: number;
    falseReportPenalty: boolean;
    rewardAccurateReports: boolean;
  };
  
  // Privacidad
  privacy: {
    scanMemory: boolean;
    scanProcesses: boolean;
    collectHardwareId: boolean;
    encryptData: boolean;
  };
}

// ============================================
// REGISTRO DE SANCIONES PREDEFINIDAS
// ============================================
export const SANCTION_TEMPLATES: Record<CheatType, { type: Sanction['type']; duration?: number; description: string }> = {
  'aimbot': { type: 'permanent_ban', description: 'Uso de software de apuntado automático detectado' },
  'wallhack': { type: 'permanent_ban', description: 'Modificación de cliente para ver a través de objetos' },
  'speed_hack': { type: 'temporary_ban', duration: 2592000000, description: 'Alteración de velocidad de juego' },
  'god_mode': { type: 'permanent_ban', description: 'Modificación de valores de invencibilidad' },
  'resource_hack': { type: 'permanent_ban', description: 'Generación ilegal de recursos' },
  'teleport': { type: 'temporary_ban', duration: 604800000, description: 'Teletransportación no autorizada' },
  'radar_hack': { type: 'temporary_ban', duration: 1209600000, description: 'Radar mejorado ilegal' },
  'macro': { type: 'warning', description: 'Uso de macros detectado - advertencia' },
  'exploit': { type: 'temporary_ban', duration: 604800000, description: 'Explotación de bugs del juego' },
  'ddos': { type: 'permanent_ban', description: 'Ataque DDoS contra servidores' },
  'botting': { type: 'permanent_ban', description: 'Uso de bots automatizados' },
  'account_sharing': { type: 'temporary_ban', duration: 2592000000, description: 'Compartir cuenta con otros jugadores' },
  'elo_boosting': { type: 'temporary_ban', duration: 7776000000, description: 'Manipulación de ranking' },
  'reverse_boosting': { type: 'temporary_ban', duration: 7776000000, description: 'Manipulación inversa de ranking' },
  'currency_fraud': { type: 'permanent_ban', description: 'Fraude de moneda del juego' },
  'chargeback': { type: 'account_reset', description: 'Chargebacks múltiples detectados' }
};

// ============================================
// HELPERS
// ============================================
export function calculateTrustScore(
  accountAge: number,
  playTime: number,
  previousViolations: number,
  reports: number
): number {
  let score = 50; // Base
  
  // Bonus por antigüedad
  score += Math.min(20, accountAge / 30);
  
  // Bonus por tiempo de juego
  score += Math.min(15, playTime / 3600);
  
  // Penalización por violaciones previas
  score -= previousViolations * 15;
  
  // Penalización por reportes
  score -= reports * 2;
  
  return Math.max(0, Math.min(100, score));
}

export function determineSanction(
  detection: CheatDetection,
  history: SanctionHistory
): Sanction['type'] {
  const template = SANCTION_TEMPLATES[detection.cheatType];
  if (!template) return 'warning';
  
  // Escalar si hay historial
  if (history.summary.totalSanctions > 2) {
    if (template.type === 'warning') return 'kick';
    if (template.type === 'kick') return 'temporary_ban';
    if (template.type === 'temporary_ban') return 'permanent_ban';
  }
  
  return template.type;
}

export function analyzeStatisticalAnomaly(
  metric: string,
  playerValue: number,
  populationMean: number,
  populationStdDev: number
): StatisticalAnalysis['comparison'] {
  const zScore = (playerValue - populationMean) / (populationStdDev || 1);
  
  let confidence: DetectionConfidence = 'low';
  if (Math.abs(zScore) > 3) confidence = 'confirmed';
  else if (Math.abs(zScore) > 2.5) confidence = 'high';
  else if (Math.abs(zScore) > 2) confidence = 'medium';
  
  const percentile = zScore > 0 
    ? 50 + (zScore * 34) // Aproximación
    : 50 - (Math.abs(zScore) * 34);
  
  return {
    percentile: Math.max(0, Math.min(100, percentile)),
    zScore,
    anomalies: Math.abs(zScore) > 2 ? [`${metric} anómalo: ${zScore.toFixed(2)}σ`] : [],
    confidence
  };
}

export function canAppeal(sanction: Sanction): boolean {
  return sanction.appeal.allowed && 
         !sanction.appeal.submitted && 
         sanction.type !== 'permanent_ban' ||
         (sanction.type === 'permanent_ban' && sanction.execution.executedBy !== 'automated');
}

export function getSanctionDuration(type: Sanction['type'], cheatType: CheatType): number | undefined {
  const template = SANCTION_TEMPLATES[cheatType];
  if (!template || template.type !== type) return undefined;
  return template.duration;
}

export const AntiCheatSystem = {
  SANCTION_TEMPLATES,
  calculateTrustScore,
  determineSanction,
  analyzeStatisticalAnomaly,
  canAppeal,
  getSanctionDuration
};
