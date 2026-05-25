/**
 * SISTEMA DE FATIGA - GALAXY ONLINE II
 * Naves y tropas necesitan descanso, mantenimiento, reparación
 */

// ============================================
// TIPOS DE FATIGA
// ============================================
export type FatigueType = 
  | 'combat'        // Fatiga de combate
  | 'travel'        // Fatiga de viaje
  | 'operational'   // Fatiga operacional
  | 'crew'          // Fatiga de tripulación
  | 'mechanical';   // Desgaste mecánico

// ============================================
// SISTEMA DE FATIGA DE NAVES
// ============================================
export interface ShipFatigue {
  shipId: string;
  shipName: string;
  shipClass: string;
  
  // Niveles de fatiga (0-100, 0 = descansado, 100 = crítico)
  fatigueLevels: {
    combat: number;
    travel: number;
    operational: number;
    mechanical: number;
  };
  
  // Efectos acumulados
  accumulatedEffects: {
    performancePenalty: number; // 0-1 (porcentaje de reducción)
    malfunctionChance: number; // 0-1
    crewEfficiencyPenalty: number; // 0-1
    repairTimeMultiplier: number;
    fuelConsumptionMultiplier: number;
  };
  
  // Estado de mantenimiento
  maintenanceStatus: {
    lastMaintenance: number;
    nextScheduled: number;
    overdue: boolean;
    criticalSystemsNeedingRepair: string[];
  };
  
  // Historial
  history: {
    battlesSinceRest: number;
    distanceTraveled: number;
    timeInSpace: number; // segundos
    totalFatigueAccumulated: number;
    maintenanceCount: number;
  };
  
  // Modificadores
  modifiers: {
    crewQuality: number; // -20 a +20
    shipAge: number; // -10 a 0
    maintenanceQuality: number; // -20 a +20
    techLevel: number; // -30 a +10
  };
}

// ============================================
// SISTEMA DE FATIGA DE TRIPULACIÓN
// ============================================
export interface CrewFatigue {
  crewId: string;
  assignment: {
    shipId: string;
    role: string;
    department: 'bridge' | 'engineering' | 'weapons' | 'medical' | 'security' | 'support';
  };
  
  // Fatiga individual
  fatigue: {
    physical: number; // 0-100
    mental: number; // 0-100
    stress: number; // 0-100
    morale: number; // 0-100 (inverso a fatiga)
  };
  
  // Horario
  schedule: {
    shiftLength: number; // segundos
    restPeriod: number; // segundos
    overtimeAccumulated: number;
    lastRest: number;
    consecutiveWorkTime: number;
  };
  
  // Efectos en performance
  performance: {
    reactionTime: number; // modificador (1.0 = normal)
    accuracy: number;
    decisionQuality: number;
    errorRate: number;
    injuryRisk: number;
  };
  
  // Estado especial
  status: 'rested' | 'working' | 'tired' | 'exhausted' | 'incapacitated';
  
  // Recuperación
  recovery: {
    restEfficiency: number; // 0-2.0
    preferredRestLocation: string;
    medicalNeeds: string[];
  };
}

// ============================================
// MANTENIMIENTO Y REPARACIÓN
// ============================================
export interface MaintenanceTask {
  id: string;
  shipId: string;
  
  // Tipo de mantenimiento
  type: 'routine' | 'repair' | 'overhaul' | 'refit' | 'emergency';
  
  // Prioridad
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Sistemas afectados
  systems: {
    name: string;
    currentCondition: number; // 0-100
    requiredCondition: number;
    estimatedRepairTime: number;
  }[];
  
  // Recursos necesarios
  resources: {
    credits: number;
    metal: number;
    plasma: number;
    components: string[];
    specializedCrew: number;
  };
  
  // Tiempo
  duration: {
    estimated: number;
    actual?: number;
    startTime?: number;
    completionTime?: number;
  };
  
  // Ubicación
  location: {
    facilityType: 'shipyard' | 'station' | 'mobile_repair' | 'field_kit';
    facilityId: string;
    quality: number; // 0-100
  };
  
  // Estado
  status: 'queued' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
  progress: number; // 0-100
  
  // Resultado
  result?: {
    systemsRestored: string[];
    fatigueReduced: number;
    performanceImprovement: number;
    issuesFound: string[];
  };
}

// ============================================
// INSTALACIONES DE MANTENIMIENTO
// ============================================
export interface MaintenanceFacility {
  id: string;
  name: string;
  
  // Tipo
  type: 'shipyard' | 'repair_station' | 'drydock' | 'mobile_unit';
  
  // Ubicación
  location: {
    systemId: string;
    coordinates: { x: number; y: number };
    securityLevel: number;
  };
  
  // Capacidades
  capabilities: {
    maxShipSize: string; // class
    maxShipsConcurrent: number;
    specializedIn: string[];
    techLevel: number;
    automationLevel: number;
  };
  
  // Calidad
  quality: {
    repairSpeed: number; // 0.5-2.0
    repairQuality: number; // 0.5-1.5
    costMultiplier: number;
    partsAvailability: number;
  };
  
  // Servicios
  services: {
    repairs: boolean;
    refits: boolean;
    upgrades: boolean;
    painting: boolean;
    crewRest: boolean;
    medical: boolean;
  };
  
  // Tarifas
  rates: {
    hourlyLabor: number;
    partsMarkup: number;
    rushFee: number;
    dockingFee: number;
  };
  
  // Disponibilidad
  availability: {
    currentQueue: number;
    estimatedWait: number;
    emergencySlots: number;
    vipAvailable: boolean;
  };
}

// ============================================
// ESTRATEGIAS DE DESCANSO
// ============================================
export interface RestStrategy {
  id: string;
  name: string;
  description: string;
  
  // Aplicabilidad
  applicableTo: ('ships' | 'crew' | 'both')[];
  
  // Método
  method: {
    type: 'docking' | 'patrol_rotation' | 'shore_leave' | 'cold_storage' | 'field_rest';
    duration: number;
    location: string[];
    requirements: string[];
  };
  
  // Efectividad
  effectiveness: {
    fatigueRecoveryRate: number; // por hora
    moraleBonus: number;
    cost: number;
    timeRequired: number;
  };
  
  // Riesgos
  risks: {
    vulnerabilityDuringRest: number;
    crewDesertionRisk: number;
    equipmentDegradation: number;
  };
}

// ============================================
// MECÁNICAS DE FATIGA
// ============================================
export const FATIGUE_MECHANICS = {
  // Acumulación de fatiga
  accumulation: {
    combatPerBattle: 15,
    travelPerHour: 2,
    operationalPerHour: 1,
    mechanicalPerHour: 0.5,
    criticalThreshold: 80,
    breakdownThreshold: 95
  },
  
  // Efectos por nivel de fatiga
  effects: {
    mild: {
      threshold: 30,
      performancePenalty: 0.05,
      malfunctionChance: 0.02,
      crewEfficiencyPenalty: 0.03,
      repairTimeMultiplier: 1.0,
      fuelConsumptionMultiplier: 1.0
    },
    moderate: {
      threshold: 50,
      performancePenalty: 0.15,
      malfunctionChance: 0.08,
      crewEfficiencyPenalty: 0.10,
      repairTimeMultiplier: 1.2,
      fuelConsumptionMultiplier: 1.1
    },
    severe: {
      threshold: 70,
      performancePenalty: 0.30,
      malfunctionChance: 0.20,
      crewEfficiencyPenalty: 0.20,
      repairTimeMultiplier: 1.5,
      fuelConsumptionMultiplier: 1.3
    },
    critical: {
      threshold: 90,
      performancePenalty: 0.50,
      malfunctionChance: 0.40,
      crewEfficiencyPenalty: 0.35,
      repairTimeMultiplier: 2.0,
      fuelConsumptionMultiplier: 1.5
    }
  },
  
  // Recuperación
  recovery: {
    baseRate: 5, // por hora de descanso
    maintenanceBonus: 10,
    crewQualityBonus: 2,
    facilityQualityBonus: 3,
    shoreLeaveBonus: 15
  }
};

// ============================================
// ESTRATEGIAS DE DESCANSO PREDEFINIDAS
// ============================================
export const REST_STRATEGIES: RestStrategy[] = [
  {
    id: 'strategy_dock_maintenance',
    name: 'Mantenimiento en Puerto',
    description: 'Dockear en estación para mantenimiento completo',
    applicableTo: ['ships', 'crew'],
    method: { type: 'docking', duration: 86400, location: ['station', 'shipyard'], requirements: ['available_dock', 'credits'] },
    effectiveness: { fatigueRecoveryRate: 10, moraleBonus: 10, cost: 10000, timeRequired: 24 },
    risks: { vulnerabilityDuringRest: 10, crewDesertionRisk: 5, equipmentDegradation: 0 }
  },
  {
    id: 'strategy_patrol_rotation',
    name: 'Rotación de Patrulla',
    description: 'Rotar naves entre patrulla activa y descanso',
    applicableTo: ['ships', 'crew'],
    method: { type: 'patrol_rotation', duration: 43200, location: ['any'], requirements: ['fleet_size_3+', 'safe_zone'] },
    effectiveness: { fatigueRecoveryRate: 5, moraleBonus: 5, cost: 0, timeRequired: 12 },
    risks: { vulnerabilityDuringRest: 30, crewDesertionRisk: 0, equipmentDegradation: 0 }
  },
  {
    id: 'strategy_shore_leave',
    name: 'Permiso en Planeta',
    description: 'Tripulación descansa en instalaciones planetarias',
    applicableTo: ['crew'],
    method: { type: 'shore_leave', duration: 172800, location: ['planet', 'colony'], requirements: ['friendly_territory', 'habitable_planet'] },
    effectiveness: { fatigueRecoveryRate: 15, moraleBonus: 25, cost: 5000, timeRequired: 48 },
    risks: { vulnerabilityDuringRest: 20, crewDesertionRisk: 15, equipmentDegradation: 0 }
  },
  {
    id: 'strategy_cold_storage',
    name: 'Almacenamiento en Frío',
    description: 'Desactivar sistemas no esenciales para preservar recursos',
    applicableTo: ['ships'],
    method: { type: 'cold_storage', duration: 604800, location: ['any'], requirements: ['safe_zone'] },
    effectiveness: { fatigueRecoveryRate: 3, moraleBonus: 0, cost: 1000, timeRequired: 168 },
    risks: { vulnerabilityDuringRest: 60, crewDesertionRisk: 0, equipmentDegradation: 5 }
  }
];

// ============================================
// INSTALACIONES DE MANTENIMIENTO PREDEFINIDAS
// ============================================
export const MAINTENANCE_FACILITIES: MaintenanceFacility[] = [
  {
    id: 'facility_alpha_shipyard',
    name: 'Astillero Alpha Prime',
    type: 'shipyard',
    location: { systemId: 'sys_alpha_prime', coordinates: { x: 0, y: 0 }, securityLevel: 95 },
    capabilities: { maxShipSize: 'titan', maxShipsConcurrent: 20, specializedIn: ['all'], techLevel: 10, automationLevel: 90 },
    quality: { repairSpeed: 1.5, repairQuality: 1.2, costMultiplier: 1.5, partsAvailability: 95 },
    services: { repairs: true, refits: true, upgrades: true, painting: true, crewRest: true, medical: true },
    rates: { hourlyLabor: 1000, partsMarkup: 1.3, rushFee: 2.0, dockingFee: 5000 },
    availability: { currentQueue: 15, estimatedWait: 86400, emergencySlots: 3, vipAvailable: true }
  },
  {
    id: 'facility_frontier_repair',
    name: 'Estación de Reparación Fronteriza',
    type: 'repair_station',
    location: { systemId: 'sys_frontier_outpost', coordinates: { x: 500, y: -200 }, securityLevel: 40 },
    capabilities: { maxShipSize: 'battleship', maxShipsConcurrent: 5, specializedIn: ['emergency_repair', 'patch_jobs'], techLevel: 6, automationLevel: 50 },
    quality: { repairSpeed: 0.8, repairQuality: 0.9, costMultiplier: 1.2, partsAvailability: 40 },
    services: { repairs: true, refits: false, upgrades: false, painting: false, crewRest: true, medical: true },
    rates: { hourlyLabor: 500, partsMarkup: 1.5, rushFee: 1.5, dockingFee: 2000 },
    availability: { currentQueue: 2, estimatedWait: 3600, emergencySlots: 2, vipAvailable: false }
  }
];

// ============================================
// HELPERS
// ============================================
export function calculateFatigueEffects(
  fatigueLevels: ShipFatigue['fatigueLevels']
): ShipFatigue['accumulatedEffects'] {
  const avgFatigue = Object.values(fatigueLevels).reduce((a, b) => a + b, 0) / 4;
  
  let effects: ShipFatigue['accumulatedEffects'] = {
    performancePenalty: 0,
    malfunctionChance: 0,
    crewEfficiencyPenalty: 0,
    repairTimeMultiplier: 1,
    fuelConsumptionMultiplier: 1
  };
  
  if (avgFatigue >= FATIGUE_MECHANICS.effects.critical.threshold) {
    effects = { ...FATIGUE_MECHANICS.effects.critical };
    delete (effects as any).threshold;
  } else if (avgFatigue >= FATIGUE_MECHANICS.effects.severe.threshold) {
    effects = { ...FATIGUE_MECHANICS.effects.severe };
    delete (effects as any).threshold;
  } else if (avgFatigue >= FATIGUE_MECHANICS.effects.moderate.threshold) {
    effects = { ...FATIGUE_MECHANICS.effects.moderate };
    delete (effects as any).threshold;
  } else if (avgFatigue >= FATIGUE_MECHANICS.effects.mild.threshold) {
    effects = { ...FATIGUE_MECHANICS.effects.mild };
    delete (effects as any).threshold;
  }
  
  return effects;
}

export function calculateRecoveryTime(
  currentFatigue: number,
  strategy: RestStrategy,
  facility?: MaintenanceFacility
): number {
  let baseRate = strategy.effectiveness.fatigueRecoveryRate;
  
  if (facility) {
    baseRate += FATIGUE_MECHANICS.recovery.facilityQualityBonus * facility.quality.repairQuality;
  }
  
  const hoursNeeded = Math.ceil(currentFatigue / baseRate);
  return hoursNeeded * 3600; // Convertir a segundos
}

export function getFacilityBySystem(systemId: string): MaintenanceFacility | undefined {
  return MAINTENANCE_FACILITIES.find(f => f.location.systemId === systemId);
}

export function getBestStrategyForSituation(
  situation: { dangerLevel: number; crewAvailable: boolean; credits: number; timeAvailable: number }
): RestStrategy | undefined {
  if (situation.dangerLevel > 50) {
    return REST_STRATEGIES.find(s => s.id === 'strategy_cold_storage');
  }
  
  if (situation.crewAvailable && situation.timeAvailable > 172800) {
    return REST_STRATEGIES.find(s => s.id === 'strategy_shore_leave');
  }
  
  if (situation.credits > 10000) {
    return REST_STRATEGIES.find(s => s.id === 'strategy_dock_maintenance');
  }
  
  return REST_STRATEGIES.find(s => s.id === 'strategy_patrol_rotation');
}

export const FatigueSystem = {
  FATIGUE_MECHANICS,
  REST_STRATEGIES,
  MAINTENANCE_FACILITIES,
  calculateFatigueEffects,
  calculateRecoveryTime,
  getFacilityBySystem,
  getBestStrategyForSituation
};
