/**
 * SISTEMA DE A/B TESTING - GALAXY ONLINE II
 * Experimentos, variantes, métricas
 */

// ============================================
// TIPOS DE EXPERIMENTOS
// ============================================
export type ExperimentType = 
  | 'ui'               // Cambios en interfaz
  | 'gameplay'         // Cambios en mecánicas
  | 'economy'          // Cambios económicos
  | 'progression'      // Cambios en progresión
  | 'monetization'     // Cambios en monetización
  | 'onboarding'       // Cambios en tutorial
  | 'social'           // Cambios en features sociales
  | 'performance';     // Cambios de rendimiento

export type ExperimentStatus = 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';

// ============================================
// EXPERIMENTO
// ============================================
export interface Experiment {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  
  // Tipo y categoría
  type: ExperimentType;
  category: string;
  
  // Variantes
  variants: {
    control: Variant;
    treatments: Variant[];
  };
  
  // Métricas
  metrics: {
    primary: MetricConfig;
    secondary: MetricConfig[];
    guardrail: MetricConfig[]; // Métricas que no deben empeorar
  };
  
  // Audiencia
  audience: {
    segmentation: SegmentConfig;
    sampleSize: number;
    trafficAllocation: number; // 0-1
  };
  
  // Duración
  duration: {
    startDate: number;
    endDate?: number;
    minDuration: number; // segundos
    maxDuration: number;
    earlyStoppingEnabled: boolean;
  };
  
  // Estado
  status: ExperimentStatus;
  
  // Resultados
  results?: ExperimentResults;
}

// ============================================
// VARIANTE
// ============================================
export interface Variant {
  id: string;
  name: string;
  description: string;
  
  // Configuración
  isControl: boolean;
  trafficAllocation: number; // 0-1
  
  // Cambios
  changes: {
    type: 'value' | 'feature_flag' | 'ui_element' | 'algorithm' | 'config';
    target: string;
    before?: any;
    after: any;
  }[];
  
  // Estado
  status: 'active' | 'disabled';
}

// ============================================
// CONFIGURACIÓN DE MÉTRICA
// ============================================
export interface MetricConfig {
  name: string;
  description: string;
  
  // Tipo
  type: 'conversion' | 'retention' | 'engagement' | 'revenue' | 'performance' | 'satisfaction';
  
  // Cálculo
  calculation: {
    event: string;
    aggregation: 'count' | 'sum' | 'avg' | 'rate' | 'ratio';
    numerator?: string;
    denominator?: string;
  };
  
  // Objetivo
  target: {
    direction: 'increase' | 'decrease';
    minimumDetectableEffect: number; // % mínimo de cambio a detectar
    baselineValue?: number;
  };
  
  // Estadísticas
  statistics: {
    requiredSampleSize: number;
    confidenceLevel: number; // 0.95 = 95%
    power: number; // 0.8 = 80%
  };
}

// ============================================
// CONFIGURACIÓN DE SEGMENTO
// ============================================
export interface SegmentConfig {
  // Inclusiones
  include: {
    platforms?: string[];
    regions?: string[];
    languages?: string[];
    playerLevels?: { min: number; max: number };
    accountAge?: { min: number; max: number }; // días
    cohorts?: string[];
  };
  
  // Exclusiones
  exclude: {
    playerIds?: string[];
    corporations?: string[];
    previousExperiments?: string[];
    internalAccounts?: boolean;
  };
  
  // Criterios adicionales
  criteria: {
    minPlayTime?: number;
    minSessions?: number;
    minSpend?: number;
    mustHaveFeature?: string[];
    mustNotHaveFeature?: string[];
  };
}

// ============================================
// RESULTADOS DE EXPERIMENTO
// ============================================
export interface ExperimentResults {
  // Estado
  status: 'inconclusive' | 'winner_found' | 'loser_found' | 'tie';
  
  // Tamaño de muestra
  sampleSize: {
    control: number;
    treatments: Record<string, number>;
    total: number;
    targetReached: boolean;
  };
  
  // Métricas
  metrics: {
    primary: MetricResult;
    secondary: MetricResult[];
    guardrail: MetricResult[];
  };
  
  // Ganador
  winner?: {
    variantId: string;
    confidence: number;
    lift: number; // % de mejora
    probability: number; // probabilidad de ser mejor
  };
  
  // Estadísticas
  statistics: {
    pValue: number;
    confidenceInterval: [number, number];
    statisticalPower: number;
    effectSize: number;
  };
  
  // Tiempo
  timing: {
    startedAt: number;
    endedAt: number;
    duration: number;
    targetDuration: number;
  };
  
  // Recomendación
  recommendation: {
    action: 'rollout' | 'rollback' | 'extend' | 'iterate';
    reasoning: string;
    confidence: number;
    risks: string[];
  };
}

// ============================================
// RESULTADO DE MÉTRICA
// ============================================
export interface MetricResult {
  name: string;
  variantId: string;
  
  // Valores
  value: number;
  baselineValue: number;
  absoluteChange: number;
  relativeChange: number; // %
  
  // Estadísticas
  statistics: {
    mean: number;
    stdDev: number;
    median: number;
    percentiles: Record<number, number>;
  };
  
  // Significancia
  significance: {
    pValue: number;
    isSignificant: boolean;
    confidenceInterval: [number, number];
    uplift: {
      min: number;
      max: number;
      expected: number;
    };
  };
  
  // Tamaño de muestra
  sampleSize: number;
  requiredSampleSize: number;
  
  // Gráficos
  timeline: { timestamp: number; value: number; cumulative: boolean }[];
  distribution: { bucket: string; count: number; percentage: number }[];
}

// ============================================
// ASIGNACIÓN DE VARIANTE
// ============================================
export interface VariantAssignment {
  experimentId: string;
  playerId: string;
  
  // Variante asignada
  variantId: string;
  isControl: boolean;
  
  // Timestamp
  assignedAt: number;
  firstExposureAt?: number;
  
  // Persistencia
  persistent: boolean;
  storedIn: 'cookie' | 'localStorage' | 'server' | 'url';
  
  // Consistencia
  crossDevice: boolean;
  crossSession: boolean;
}

// ============================================
// EVENTO DE EXPERIMENTO
// ============================================
export interface ExperimentEvent {
  id: string;
  timestamp: number;
  
  // Contexto
  experimentId: string;
  variantId: string;
  playerId: string;
  
  // Evento
  type: 'exposure' | 'conversion' | 'goal' | 'drop_off' | 'interaction';
  name: string;
  
  // Datos
  data: Record<string, any>;
  
  // Atributos del usuario
  userAttributes: {
    platform: string;
    version: string;
    language: string;
    level: number;
    sessionNumber: number;
  };
}

// ============================================
// CONFIGURACIÓN DE SISTEMA
// ============================================
export interface ABTestConfig {
  // General
  general: {
    enabled: boolean;
    defaultConfidenceLevel: number;
    defaultPower: number;
    minSampleSize: number;
  };
  
  // Asignación
  assignment: {
    method: 'random' | 'hash' | 'weighted' | 'bandit';
    persistAcrossSessions: boolean;
    persistAcrossDevices: boolean;
    sticky: boolean;
  };
  
  // Segmentación
  targeting: {
    realTimeEvaluation: boolean;
    allowOverlappingExperiments: boolean;
    maxConcurrentExperiments: number;
    priorityRules: string[];
  };
  
  // Análisis
  analysis: {
    realTimeResults: boolean;
    automaticWinnerSelection: boolean;
    earlyStoppingEnabled: boolean;
    sequentialTesting: boolean;
    bonferroniCorrection: boolean;
  };
  
  // Integración
  integration: {
    analyticsProvider: string;
    dataWarehouseSync: boolean;
    eventTracking: boolean;
    notificationWebhooks: string[];
  };
}

// ============================================
// EXPERIMENTOS DE EJEMPLO
// ============================================
export const SAMPLE_EXPERIMENTS: Experiment[] = [
  {
    id: 'exp_ui_button_color',
    name: 'Color de Botón de Compra',
    description: 'Probar si botones verdes aumentan conversiones vs azules',
    hypothesis: 'Los botones verdes tendrán 15% más conversiones que azules',
    type: 'ui',
    category: 'monetization',
    variants: {
      control: {
        id: 'control',
        name: 'Botón Azul',
        description: 'Color actual del botón',
        isControl: true,
        trafficAllocation: 0.5,
        changes: [{
          type: 'ui_element',
          target: 'purchase_button',
          after: { color: '#2196F3', text: 'Comprar' }
        }],
        status: 'active'
      },
      treatments: [{
        id: 'treatment_green',
        name: 'Botón Verde',
        description: 'Nuevo color verde para el botón',
        isControl: false,
        trafficAllocation: 0.5,
        changes: [{
          type: 'ui_element',
          target: 'purchase_button',
          after: { color: '#4CAF50', text: 'Comprar Ahora' }
        }],
        status: 'active'
      }]
    },
    metrics: {
      primary: {
        name: 'purchase_conversion',
        description: 'Tasa de conversión de compra',
        type: 'conversion',
        calculation: {
          event: 'purchase_complete',
          aggregation: 'rate',
          numerator: 'purchase_complete',
          denominator: 'purchase_button_click'
        },
        target: {
          direction: 'increase',
          minimumDetectableEffect: 0.15
        },
        statistics: {
          requiredSampleSize: 5000,
          confidenceLevel: 0.95,
          power: 0.8
        }
      },
      secondary: [],
      guardrail: []
    },
    audience: {
      segmentation: {
        include: {},
        exclude: {},
        criteria: {}
      },
      sampleSize: 10000,
      trafficAllocation: 1
    },
    duration: {
      startDate: Date.now(),
      minDuration: 604800,
      maxDuration: 2592000,
      earlyStoppingEnabled: true
    },
    status: 'running'
  }
];

// ============================================
// HELPERS
// ============================================
export function assignVariant(
  experiment: Experiment,
  playerId: string,
  method: 'random' | 'hash' = 'hash'
): VariantAssignment {
  // Calcular hash del playerId + experimentId para consistencia
  const hash = hashString(`${playerId}_${experiment.id}`);
  
  // Determinar variante basado en hash
  const allVariants = [experiment.variants.control, ...experiment.variants.treatments];
  let cumulativeAllocation = 0;
  
  for (const variant of allVariants) {
    cumulativeAllocation += variant.trafficAllocation;
    if (hash <= cumulativeAllocation) {
      return {
        experimentId: experiment.id,
        playerId,
        variantId: variant.id,
        isControl: variant.isControl,
        assignedAt: Date.now(),
        persistent: true,
        storedIn: 'server',
        crossDevice: true,
        crossSession: true
      };
    }
  }
  
  // Fallback a control
  return {
    experimentId: experiment.id,
    playerId,
    variantId: experiment.variants.control.id,
    isControl: true,
    assignedAt: Date.now(),
    persistent: true,
    storedIn: 'server',
    crossDevice: true,
    crossSession: true
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % 100 / 100;
}

export function calculateSampleSize(
  baselineConversion: number,
  minimumDetectableEffect: number,
  confidenceLevel: number = 0.95,
  power: number = 0.8
): number {
  // Fórmula simplificada de tamaño de muestra
  const zAlpha = 1.96; // 95% confidence
  const zBeta = 0.84; // 80% power
  
  const p1 = baselineConversion;
  const p2 = baselineConversion * (1 + minimumDetectableEffect);
  const pPooled = (p1 + p2) / 2;
  
  const numerator = 2 * pPooled * (1 - pPooled) * Math.pow(zAlpha + zBeta, 2);
  const denominator = Math.pow(p1 - p2, 2);
  
  return Math.ceil(numerator / denominator);
}

export function isExperimentValid(experiment: Experiment): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Verificar que suma de allocations sea 1
  const totalAllocation = experiment.variants.control.trafficAllocation + 
    experiment.variants.treatments.reduce((sum, v) => sum + v.trafficAllocation, 0);
  
  if (Math.abs(totalAllocation - 1) > 0.001) {
    errors.push(`Traffic allocations must sum to 1, got ${totalAllocation}`);
  }
  
  // Verificar que haya métrica primaria
  if (!experiment.metrics.primary) {
    errors.push('Primary metric is required');
  }
  
  // Verificar fechas
  if (experiment.duration.endDate && experiment.duration.endDate < experiment.duration.startDate) {
    errors.push('End date must be after start date');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function determineWinner(results: ExperimentResults): { winnerId: string | null; confidence: number } {
  // Si hay un ganador claro
  if (results.winner) {
    return {
      winnerId: results.winner.variantId,
      confidence: results.winner.confidence
    };
  }
  
  // Si no hay significancia estadística
  if (results.statistics.pValue > 0.05) {
    return {
      winnerId: null,
      confidence: 0
    };
  }
  
  return {
    winnerId: null,
    confidence: 0
  };
}

export function shouldStopEarly(
  results: ExperimentResults,
  minSampleSize: number
): { stop: boolean; reason?: string } {
  // Si no tenemos suficiente muestra, continuar
  if (results.sampleSize.total < minSampleSize) {
    return { stop: false };
  }
  
  // Si hay significancia estadística clara
  if (results.statistics.pValue < 0.001) {
    return { stop: true, reason: 'Statistical significance reached' };
  }
  
  // Si hay efecto negativo significativo
  if (results.metrics.guardrail.some(m => m.relativeChange < -0.2)) {
    return { stop: true, reason: 'Guardrail metric violated' };
  }
  
  return { stop: false };
}

export const ABTestingSystem = {
  SAMPLE_EXPERIMENTS,
  assignVariant,
  calculateSampleSize,
  isExperimentValid,
  determineWinner,
  shouldStopEarly
};
