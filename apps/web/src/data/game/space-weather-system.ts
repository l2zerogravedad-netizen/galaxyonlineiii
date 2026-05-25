/**
 * SISTEMA DE METEOROLOGÍA ESPACIAL - GALAXY ONLINE II
 * Tormentas solares, asteroides, agujeros negros, nebulosas tóxicas
 */

// ============================================
// TIPOS DE FENÓMENOS ESPACIALES
// ============================================
export type SpaceWeatherType = 
  | 'solar_storm'      // Tormenta solar
  | 'asteroid_field'   // Campo de asteroides
  | 'debris_field'     // Campo de escombros
  | 'radiation_belt'   // Cinturón de radiación
  | 'ion_storm'        // Tormenta iónica
  | 'nebula_cloud'     // Nube de nebulosa
  | 'toxic_nebula'     // Nebulosa tóxica
  | 'magnetic_storm'   // Tormenta magnética
  | 'micrometeorite'   // Micrometeoritos
  | 'solar_flare'      // Llamarada solar
  | 'coronal_mass'     // Eyección de masa coronal
  | 'gravity_well'     // Pozo gravitacional
  | 'temporal_anomaly' // Anomalía temporal
  | 'quantum_storm';   // Tormenta cuántica

export type SpaceWeatherSeverity = 'minor' | 'moderate' | 'severe' | 'extreme' | 'cataclysmic';

// ============================================
// FENÓMENO ESPACIAL
// ============================================
export interface SpaceWeather {
  id: string;
  name: string;
  type: SpaceWeatherType;
  
  // Descripción y lore
  description: string;
  lore: string;
  visualEffects: string[];
  
  // Ubicación
  location: {
    systemId: string;
    coordinates: { x: number; y: number; z?: number };
    radius: number; // Radio de efecto
    affectedSystems: string[];
  };
  
  // Severidad
  severity: {
    current: SpaceWeatherSeverity;
    scale: number; // 1-10
    fluctuation: number; // Variación de severidad
  };
  
  // Temporales
  timing: {
    predictable: boolean;
    cycleDuration?: number; // segundos
    nextOccurrence?: number;
    duration: number; // segundos
    warningTime: number; // segundos de anticipación
  };
  
  // Efectos en naves
  shipEffects: {
    hullDamage: number; // por segundo
    shieldDamage: number;
    systemMalfunction: number; // probabilidad
    navigationDisruption: number; // 0-1
    communicationJamming: number; // 0-1
    sensorInterference: number; // 0-1
  };
  
  // Efectos en tripulación
  crewEffects: {
    radiationExposure: number;
    psychologicalImpact: number;
    physicalStress: number;
  };
  
  // Riesgos específicos
  risks: {
    collisionRisk: number; // 0-1
    engineFailure: number;
    navSystemCrash: boolean;
    trapped: boolean; // Si es posible quedarse atrapado
  };
  
  // Defensas
  countermeasures: {
    shieldBoost: number; // Efectividad de escudos
    armorEffectiveness: number;
    evasionDifficulty: number;
    requiredTechnology: string[];
  };
  
  // Recompensas (exploración riesgo/beneficio)
  rewards?: {
    resources: string[];
    rareMaterials: string[];
    researchData: number;
    discoveryChance: number;
  };
}

// ============================================
// PREDICCIÓN METEOROLÓGICA
// ============================================
export interface WeatherForecast {
  systemId: string;
  generatedAt: number;
  validUntil: number;
  
  // Predicciones
  predictions: {
    phenomenon: SpaceWeatherType;
    probability: number; // 0-1
    expectedSeverity: SpaceWeatherSeverity;
    estimatedTime: number;
    confidence: number; // 0-100
  }[];
  
  // Alertas activas
  activeAlerts: {
    weatherId: string;
    severity: SpaceWeatherSeverity;
    expiresAt: number;
    recommendedAction: string;
  }[];
  
  // Condiciones actuales
  currentConditions: {
    visibility: number; // 0-100
    radiation: number; // 0-100
    magneticInterference: number;
    debrisDensity: number;
    safeNavigation: boolean;
  };
}

// ============================================
// ESTACIONES DE MONITOREO
// ============================================
export interface WeatherStation {
  id: string;
  name: string;
  type: 'automated' | 'manned' | 'relay' | 'deep_space';
  
  // Ubicación
  location: {
    systemId: string;
    coordinates: { x: number; y: number };
    coverageRadius: number;
  };
  
  // Capacidades
  capabilities: {
    detectionRange: number;
    predictionAccuracy: number; // 0-100
    warningTime: number; // segundos
    dataResolution: number; // metros
  };
  
  // Fenómenos detectables
  detectablePhenomena: SpaceWeatherType[];
  
  // Datos actuales
  currentData: {
    lastUpdate: number;
    phenomenaDetected: SpaceWeather[];
    forecast: WeatherForecast;
  };
  
  // Estado
  status: 'operational' | 'maintenance' | 'damaged' | 'offline';
  
  // Costo de acceso
  accessFee: number;
  subscriptionAvailable: boolean;
  subscriptionCost: number;
}

// ============================================
// FENÓMENOS PREDEFINIDOS
// ============================================
export const SPACE_WEATHER_PHENOMENA: SpaceWeather[] = [
  {
    id: 'storm_solaris_major',
    name: 'Tormenta Solar Mayor Solaris',
    type: 'solar_storm',
    description: 'Intensa tormenta de radiación solar con eyecciones de masa coronal',
    lore: 'Estas tormentas son comunes en sistemas con estrellas jóvenes y pueden deshabilitar sistemas electrónicos no protegidos',
    visualEffects: ['aurora_displays', 'electrical_arcs', 'static_discharge'],
    location: {
      systemId: 'sys_solaris_prime',
      coordinates: { x: 0, y: 0 },
      radius: 1000000,
      affectedSystems: ['sys_solaris_prime', 'sys_solaris_beta']
    },
    severity: { current: 'severe', scale: 8, fluctuation: 2 },
    timing: {
      predictable: true,
      cycleDuration: 864000,
      nextOccurrence: Date.now() + 432000,
      duration: 86400,
      warningTime: 3600
    },
    shipEffects: {
      hullDamage: 0.1,
      shieldDamage: 5,
      systemMalfunction: 0.15,
      navigationDisruption: 0.3,
      communicationJamming: 0.5,
      sensorInterference: 0.4
    },
    crewEffects: { radiationExposure: 30, psychologicalImpact: 10, physicalStress: 15 },
    risks: { collisionRisk: 0, engineFailure: 0.05, navSystemCrash: false, trapped: false },
    countermeasures: { shieldBoost: 2.0, armorEffectiveness: 0.5, evasionDifficulty: 0.8, requiredTechnology: ['radiation_shielding', 'hardened_systems'] },
    rewards: { resources: ['solar_particles', 'ionized_gas'], rareMaterials: ['coronal_dust'], researchData: 500, discoveryChance: 0.1 }
  },
  {
    id: 'field_asteroid_belt_7',
    name: 'Cinturón de Asteroides Peligroso 7',
    type: 'asteroid_field',
    description: 'Denso cinturón de asteroides con movimiento caótico y campos gravitacionales inestables',
    lore: 'Antiguos restos de formación planetaria, este cinturón es imposible de navegar para naves no especializadas',
    visualEffects: ['dust_clouds', 'debris_trails', 'collision_flashes'],
    location: {
      systemId: 'sys_asteroid_sector',
      coordinates: { x: 500, y: -300 },
      radius: 500000,
      affectedSystems: ['sys_asteroid_sector']
    },
    severity: { current: 'moderate', scale: 5, fluctuation: 3 },
    timing: { predictable: false, duration: 0, warningTime: 0 },
    shipEffects: {
      hullDamage: 50,
      shieldDamage: 100,
      systemMalfunction: 0.3,
      navigationDisruption: 0.9,
      communicationJamming: 0.2,
      sensorInterference: 0.6
    },
    crewEffects: { radiationExposure: 0, psychologicalImpact: 25, physicalStress: 10 },
    risks: { collisionRisk: 0.8, engineFailure: 0.1, navSystemCrash: true, trapped: true },
    countermeasures: { shieldBoost: 1.5, armorEffectiveness: 1.2, evasionDifficulty: 0.2, requiredTechnology: ['advanced_sensors', 'maneuvering_thrusters'] },
    rewards: { resources: ['metal', 'minerals'], rareMaterials: ['precious_ores', 'exotic_isotopes'], researchData: 200, discoveryChance: 0.05 }
  },
  {
    id: 'nebula_toxic_crimson',
    name: 'Nebulosa Carmesí Tóxica',
    type: 'toxic_nebula',
    description: 'Nebulosa de gas ionizado que corroe blindajes y es letal para tripulaciones no protegidas',
    lore: 'Formada por la supernova de una estrella masiva, esta nebulosa contiene elementos radiactivos y compuestos corrosivos',
    visualEffects: ['red_glow', 'lightning_bolts', 'particle_storms'],
    location: {
      systemId: 'sys_crimson_reach',
      coordinates: { x: -800, y: 600 },
      radius: 2000000,
      affectedSystems: ['sys_crimson_reach', 'sys_nebula_edge']
    },
    severity: { current: 'extreme', scale: 9, fluctuation: 1 },
    timing: { predictable: true, duration: 0, warningTime: 0 },
    shipEffects: {
      hullDamage: 2,
      shieldDamage: 3,
      systemMalfunction: 0.25,
      navigationDisruption: 0.7,
      communicationJamming: 0.8,
      sensorInterference: 0.9
    },
    crewEffects: { radiationExposure: 80, psychologicalImpact: 40, physicalStress: 50 },
    risks: { collisionRisk: 0.1, engineFailure: 0.2, navSystemCrash: false, trapped: true },
    countermeasures: { shieldBoost: 3.0, armorEffectiveness: 0.3, evasionDifficulty: 0.9, requiredTechnology: ['toxic_shielding', 'hull_regeneration', 'life_support_v'] },
    rewards: { resources: ['nebula_gas', 'ionized_particles'], rareMaterials: ['anti_matter_traces'], researchData: 1000, discoveryChance: 0.2 }
  },
  {
    id: 'storm_ion_perseus',
    name: 'Tormenta Iónica de Perseo',
    type: 'ion_storm',
    description: 'Tormenta de partículas ionizadas que interfiere con sistemas eléctricos y comunicaciones',
    lore: 'Común en la frontera de la galaxia, estas tormentas pueden dejar naves sin energía',
    visualEffects: ['electrical_discharges', 'blue_lightning', 'static_buildup'],
    location: {
      systemId: 'sys_perseus_frontier',
      coordinates: { x: 1000, y: 500 },
      radius: 1500000,
      affectedSystems: ['sys_perseus_frontier']
    },
    severity: { current: 'moderate', scale: 6, fluctuation: 4 },
    timing: {
      predictable: false,
      duration: 36000,
      warningTime: 1800
    },
    shipEffects: {
      hullDamage: 0,
      shieldDamage: 10,
      systemMalfunction: 0.4,
      navigationDisruption: 0.5,
      communicationJamming: 0.9,
      sensorInterference: 0.7
    },
    crewEffects: { radiationExposure: 20, psychologicalImpact: 20, physicalStress: 5 },
    risks: { collisionRisk: 0, engineFailure: 0.15, navSystemCrash: false, trapped: false },
    countermeasures: { shieldBoost: 2.5, armorEffectiveness: 0.8, evasionDifficulty: 0.6, requiredTechnology: ['faraday_cage', 'insulated_systems'] },
    rewards: { resources: ['ionized_particles', 'charged_dust'], rareMaterials: [], researchData: 300, discoveryChance: 0.05 }
  }
];

// ============================================
// ESTACIONES DE MONITOREO
// ============================================
export const WEATHER_STATIONS: WeatherStation[] = [
  {
    id: 'station_alpha_forecast',
    name: 'Estación Meteorológica Alpha',
    type: 'manned',
    location: { systemId: 'sys_alpha_prime', coordinates: { x: 100, y: 100 }, coverageRadius: 10000000 },
    capabilities: { detectionRange: 5000000, predictionAccuracy: 85, warningTime: 7200, dataResolution: 1000 },
    detectablePhenomena: ['solar_storm', 'ion_storm', 'radiation_belt', 'magnetic_storm'],
    currentData: { lastUpdate: Date.now(), phenomenaDetected: [], forecast: null as any },
    status: 'operational',
    accessFee: 500,
    subscriptionAvailable: true,
    subscriptionCost: 5000
  },
  {
    id: 'station_frontier_relay',
    name: 'Relé del Borde Profundo',
    type: 'automated',
    location: { systemId: 'sys_perseus_frontier', coordinates: { x: 950, y: 450 }, coverageRadius: 5000000 },
    capabilities: { detectionRange: 3000000, predictionAccuracy: 60, warningTime: 3600, dataResolution: 5000 },
    detectablePhenomena: ['ion_storm', 'nebula_cloud', 'toxic_nebula', 'quantum_storm'],
    currentData: { lastUpdate: Date.now(), phenomenaDetected: [], forecast: null as any },
    status: 'operational',
    accessFee: 200,
    subscriptionAvailable: true,
    subscriptionCost: 2000
  }
];

// ============================================
// SISTEMA DE NAVEGACIÓN EN CLIMA ESPACIAL
// ============================================
export interface WeatherNavigation {
  // Riesgo calculado para una ruta
  routeRisk: {
    path: string[];
    totalRisk: number; // 0-100
    segments: {
      systemId: string;
      risk: number;
      phenomena: SpaceWeather[];
      recommendation: 'safe' | 'caution' | 'dangerous' | 'avoid';
    }[];
  };
  
  // Ventana de oportunidad
  window: {
    available: boolean;
    startTime: number;
    duration: number;
    quality: 'optimal' | 'good' | 'fair' | 'poor';
    reason: string;
  };
  
  // Recomendaciones
  recommendations: {
    delayDeparture: boolean;
    alternateRoute: boolean;
    alternateRoutePath?: string[];
    requiredPreparations: string[];
    abortRecommended: boolean;
  };
}

// ============================================
// HELPERS
// ============================================
export function calculateWeatherRisk(
  ship: { shieldStrength: number; armor: number; techLevel: number },
  phenomena: SpaceWeather[]
): { totalRisk: number; survivalChance: number; warnings: string[] } {
  let totalRisk = 0;
  const warnings: string[] = [];
  
  phenomena.forEach(p => {
    let phenomenonRisk = p.severity.scale * 10;
    
    // Reducir riesgo por preparación
    const hasShielding = p.countermeasures.requiredTechnology.every(tech => ship.techLevel > 5);
    if (hasShielding) phenomenonRisk *= 0.6;
    
    totalRisk += phenomenonRisk;
    
    if (p.risks.trapped) warnings.push(`Peligro de quedar atrapado en ${p.name}`);
    if (p.shipEffects.hullDamage > 10) warnings.push(`Daño severo al casco esperado`);
    if (p.crewEffects.radiationExposure > 50) warnings.push(`Niveles letales de radiación`);
  });
  
  const survivalChance = Math.max(0, 100 - totalRisk + (ship.shieldStrength / 100) * 10);
  
  return { totalRisk, survivalChance, warnings };
}

export function getWeatherBySystem(systemId: string): SpaceWeather[] {
  return SPACE_WEATHER_PHENOMENA.filter(w => w.location.affectedSystems.includes(systemId));
}

export function getWeatherStationBySystem(systemId: string): WeatherStation | undefined {
  return WEATHER_STATIONS.find(s => s.location.systemId === systemId);
}

export function predictWeatherWindow(
  systemId: string,
  departureTime: number
): WeatherNavigation['window'] {
  const phenomena = getWeatherBySystem(systemId);
  
  if (phenomena.length === 0) {
    return { available: true, startTime: departureTime, duration: 86400, quality: 'optimal', reason: 'Sin fenómenos detectados' };
  }
  
  const severePhenomena = phenomena.filter(p => p.severity.scale > 7);
  
  if (severePhenomena.length > 0) {
    // Encontrar próxima ventana segura
    const nextSafe = severePhenomena
      .filter(p => p.timing.predictable && p.timing.nextOccurrence)
      .map(p => p.timing.nextOccurrence! + p.timing.duration)
      .sort((a, b) => a - b)[0];
    
    if (nextSafe) {
      return {
        available: false,
        startTime: nextSafe,
        duration: 3600,
        quality: 'fair',
        reason: 'Fenómenos severos activos'
      };
    }
  }
  
  return { available: true, startTime: departureTime, duration: 3600, quality: 'fair', reason: 'Fenómenos moderados presentes' };
}

export const SpaceWeatherSystem = {
  SPACE_WEATHER_PHENOMENA,
  WEATHER_STATIONS,
  calculateWeatherRisk,
  getWeatherBySystem,
  getWeatherStationBySystem,
  predictWeatherWindow
};
