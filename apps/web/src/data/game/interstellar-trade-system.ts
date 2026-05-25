/**
 * SISTEMA DE COMERCIO INTERESTELAR - GALAXY ONLINE II
 * Rutas comerciales, caravanas, mercados regionales, fluctuación de precios
 */

// ============================================
// RUTAS COMERCIALES INTERESTELARES
// ============================================
export interface InterstellarTradeRoute {
  id: string;
  name: string;
  code: string; // Código de ruta (ej: "RT-ALP-001")
  
  // Origen y destino
  origin: {
    systemId: string;
    stationId?: string;
    planetId?: string;
    name: string;
    faction: string;
    resources: string[]; // Recursos producidos
  };
  
  destination: {
    systemId: string;
    stationId?: string;
    planetId?: string;
    name: string;
    faction: string;
    demand: string[]; // Recursos demandados
  };
  
  // Características de la ruta
  characteristics: {
    distance: number; // unidades astronómicas
    baseTravelTime: number; // segundos
    fuelConsumption: number;
    dangerLevel: number; // 0-100 (piratas, anomalías)
    navHazards: string[]; // Peligros de navegación
    checkpoints: string[]; // Sistemas intermedios
  };
  
  // Seguridad
  security: {
    patrolPresence: number; // 0-100
    convoyEscortAvailable: boolean;
    insuranceRate: number; // porcentaje
    lastPirateAttack: number;
    policeResponseTime: number; // segundos
  };
  
  // Rentabilidad
  profitability: {
    baseProfitMargin: number; // porcentaje
    demandMultiplier: number;
    competitionLevel: number; // 0-100
    seasonalBonus?: number;
    currentTrend: 'rising' | 'stable' | 'falling';
  };
  
  // Volumen
  volume: {
    dailyShips: number;
    dailyCargo: number; // toneladas
    capacity: number;
    currentUtilization: number; // 0-100
  };
  
  // Estado
  status: 'active' | 'disrupted' | 'closed' | 'seasonal';
  disruptionReason?: string;
  estimatedReopening?: number;
}

// ============================================
// CARAVANAS COMERCIALES
// ============================================
export interface TradeCaravan {
  id: string;
  name: string;
  
  // Organización
  owner: {
    type: 'player' | 'corporation' | 'npc';
    id: string;
    name: string;
  };
  
  // Composición
  composition: {
    cargoShips: {
      count: number;
      class: string;
      capacity: number;
      currentLoad: number;
    }[];
    escorts: {
      count: number;
      class: string;
      combatRating: number;
    }[];
    support: {
      repair: number;
      fuel: number;
      medical: number;
    };
  };
  
  // Carga
  cargo: {
    goods: {
      goodId: string;
      quantity: number;
      value: number;
      origin: string;
      destination: string;
    }[];
    totalValue: number;
    totalVolume: number;
    perishables: boolean;
    hazardous: boolean;
    highValue: boolean;
  };
  
  // Ruta actual
  route: {
    planned: InterstellarTradeRoute;
    currentPosition: { systemId: string; coordinates: { x: number; y: number } };
    progress: number; // 0-100
    nextStop: string;
    estimatedArrival: number;
  };
  
  // Estado
  status: 'forming' | 'departing' | 'en_route' | 'stopped' | 'under_attack' | 'arrived' | 'disbanded';
  
  // Eventos
  events: {
    piratesEncountered: number;
    shipsLost: number;
    cargoLost: number;
    delays: number;
    emergencies: string[];
  };
  
  // Finanzas
  finances: {
    operatingCost: number; // por viaje
    projectedRevenue: number;
    actualRevenue?: number;
    profitMargin: number;
    insuranceCost: number;
    escortCost: number;
  };
  
  // Programación
  schedule: {
    departure: number;
    expectedArrival: number;
    frequency: 'one_time' | 'daily' | 'weekly' | 'monthly';
    nextDeparture?: number;
  };
}

// ============================================
// MERCADOS REGIONALES
// ============================================
export interface RegionalMarket {
  id: string;
  name: string;
  
  // Ubicación
  location: {
    systemId: string;
    region: string; // Sector espacial
    coordinates: { x: number; y: number; z?: number };
    connectedSystems: string[];
  };
  
  // Tipo de mercado
  type: 'hub' | 'specialized' | 'agricultural' | 'industrial' | 'tech' | 'frontier';
  
  // Escala
  scale: 'local' | 'planetary' | 'system' | 'sector' | 'galactic';
  
  // Recursos disponibles
  supply: {
    resourceId: string;
    name: string;
    category: 'raw' | 'processed' | 'manufactured' | 'tech' | 'luxury';
    quantity: number;
    productionRate: number; // por día
    basePrice: number;
    currentPrice: number;
    priceTrend: 'rising' | 'stable' | 'falling';
    quality: number; // 0-100
  }[];
  
  // Demanda
  demand: {
    resourceId: string;
    name: string;
    quantity: number;
    consumptionRate: number; // por día
    urgency: number; // 0-100 (afecta precio)
    currentPrice: number;
    maxPrice: number; // Precio máximo que pagarán
  }[];
  
  // Comerciantes
  traders: {
    playerId: string;
    corporationId?: string;
    activeRoutes: string[];
    dailyVolume: number;
    reputation: number;
  }[];
  
  // Estadísticas
  stats: {
    dailyVolume: number;
    dailyTrades: number;
    avgTradeValue: number;
    priceVolatility: number; // 0-100
    marketSentiment: 'bullish' | 'neutral' | 'bearish';
  };
  
  // Regulaciones
  regulations: {
    tariffs: {
      import: number; // porcentaje
      export: number;
      interstellar: number;
    };
    taxes: {
      sales: number;
      transaction: number;
      corporate: number;
    };
    restrictions: {
      bannedGoods: string[];
      quotaLimited: { goodId: string; maxAmount: number }[];
      licenseRequired: string[];
    };
    subsidies: {
      encouragedGoods: string[];
      bonusRate: number;
    };
  };
  
  // Eventos de mercado
  events: {
    id: string;
    type: 'boom' | 'recession' | 'shortage' | 'surplus' | 'speculation' | 'embargo';
    affectedGoods: string[];
    priceModifier: number;
    startTime: number;
    duration: number;
    description: string;
  }[];
}

// ============================================
// SISTEMA DE PRECIOS Y FLUCTUACIÓN
// ============================================
export interface PriceSystem {
  // Bienes rastreados
  trackedGoods: TrackedGood[];
  
  // Factores globales
  globalFactors: {
    economicCycle: 'expansion' | 'peak' | 'contraction' | 'trough';
    inflationRate: number; // porcentaje mensual
    currencyStrength: number; // 0-100
    tradeVolume: number; // índice
    politicalStability: number; // 0-100
  };
  
  // Herramientas de análisis
  analysis: {
    movingAverages: { goodId: string; ma7: number; ma30: number; ma90: number }[];
    volatilityIndex: number; // 0-100
    correlations: { pair: [string, string]; correlation: number }[];
    predictions: { goodId: string; predictedPrice: number; confidence: number }[];
  };
}

export interface TrackedGood {
  id: string;
  name: string;
  category: string;
  
  // Precio base y actual
  basePrice: number;
  currentPrice: number;
  priceHistory: { timestamp: number; price: number; volume: number }[];
  
  // Volatilidad
  volatility: {
    daily: number; // cambio máximo diario permitido
    volatility30d: number; // desviación estándar 30 días
    volatilityIndex: 'low' | 'medium' | 'high' | 'extreme';
  };
  
  // Factores de precio
  priceFactors: {
    supply: number; // 0-100 (0=escasez, 100=sobrante)
    demand: number; // 0-100
    productionCost: number; // 0-100
    transportCost: number; // 0-100
    speculation: number; // 0-100
    seasonal: number; // -50 a +50
    events: number; // -100 a +100
  };
  
  // Límites
  limits: {
    minPrice: number; // Precio mínimo (intervención)
    maxPrice: number; // Precio máximo (intervención)
    historicalMin: number;
    historicalMax: number;
  };
  
  // Derivados
  derivatives: {
    futures: boolean;
    options: boolean;
    shorts: boolean;
  };
}

// ============================================
// RUTAS COMERCIALES PREDEFINIDAS
// ============================================
export const MAJOR_TRADE_ROUTES: InterstellarTradeRoute[] = [
  {
    id: 'route_alpha_prime',
    name: 'Corredor Alpha Prime',
    code: 'RT-ALP-001',
    origin: {
      systemId: 'sys_alpha_prime',
      stationId: 'station_central_hub',
      name: 'Alpha Prime Central',
      faction: 'galactic_trade_union',
      resources: ['tech', 'manufactured_goods', 'luxury']
    },
    destination: {
      systemId: 'sys_beta_sector',
      stationId: 'station_industrial_complex',
      name: 'Beta Industrial',
      faction: 'industrial_coalition',
      demand: ['tech', 'luxury', 'rare_materials']
    },
    characteristics: {
      distance: 45,
      baseTravelTime: 7200,
      fuelConsumption: 150,
      dangerLevel: 20,
      navHazards: ['asteroid_field_minor'],
      checkpoints: ['sys_checkpoint_4', 'sys_waystation_7']
    },
    security: {
      patrolPresence: 80,
      convoyEscortAvailable: true,
      insuranceRate: 0.05,
      lastPirateAttack: Date.now() - 86400000 * 30,
      policeResponseTime: 300
    },
    profitability: {
      baseProfitMargin: 15,
      demandMultiplier: 1.2,
      competitionLevel: 60,
      currentTrend: 'stable'
    },
    volume: {
      dailyShips: 150,
      dailyCargo: 50000,
      capacity: 100000,
      currentUtilization: 50
    },
    status: 'active'
  },
  {
    id: 'route_metal_run',
    name: 'Ruta del Metal',
    code: 'RT-MTL-003',
    origin: {
      systemId: 'sys_asteroid_belt_3',
      planetId: 'planet_mining_prime',
      name: 'Mining Prime',
      faction: 'mining_guild',
      resources: ['metal', 'minerals', 'rare_earth']
    },
    destination: {
      systemId: 'sys_forgeworld',
      stationId: 'station_manufacturing_hub',
      name: 'Forgeworld Manufacturing',
      faction: 'industrial_coalition',
      demand: ['metal', 'minerals', 'energy']
    },
    characteristics: {
      distance: 78,
      baseTravelTime: 10800,
      fuelConsumption: 220,
      dangerLevel: 65,
      navHazards: ['pirate_territory', 'nebula_interference'],
      checkpoints: []
    },
    security: {
      patrolPresence: 30,
      convoyEscortAvailable: true,
      insuranceRate: 0.15,
      lastPirateAttack: Date.now() - 86400000 * 2,
      policeResponseTime: 900
    },
    profitability: {
      baseProfitMargin: 35,
      demandMultiplier: 1.5,
      competitionLevel: 40,
      currentTrend: 'rising'
    },
    volume: {
      dailyShips: 80,
      dailyCargo: 120000,
      capacity: 200000,
      currentUtilization: 60
    },
    status: 'active'
  },
  {
    id: 'route_tech_corridor',
    name: 'Corredor Tecnológico',
    code: 'RT-TEC-007',
    origin: {
      systemId: 'sys_research_alpha',
      stationId: 'station_tech_exchange',
      name: 'Research Alpha Exchange',
      faction: 'science_directorate',
      resources: ['research_data', 'prototypes', 'high_tech']
    },
    destination: {
      systemId: 'sys_capitol_prime',
      stationId: 'station_imperial_market',
      name: 'Capitol Prime Market',
      faction: 'galactic_empire',
      demand: ['high_tech', 'luxury', 'weapons']
    },
    characteristics: {
      distance: 120,
      baseTravelTime: 18000,
      fuelConsumption: 300,
      dangerLevel: 10,
      navHazards: [],
      checkpoints: ['sys_security_12', 'sys_patrol_23', 'sys_checkpoint_45']
    },
    security: {
      patrolPresence: 95,
      convoyEscortAvailable: true,
      insuranceRate: 0.03,
      lastPirateAttack: Date.now() - 86400000 * 180,
      policeResponseTime: 120
    },
    profitability: {
      baseProfitMargin: 25,
      demandMultiplier: 1.3,
      competitionLevel: 75,
      currentTrend: 'stable'
    },
    volume: {
      dailyShips: 200,
      dailyCargo: 30000,
      capacity: 50000,
      currentUtilization: 60
    },
    status: 'active'
  }
];

// ============================================
// MERCADOS REGIONALES PREDEFINIDOS
// ============================================
export const REGIONAL_MARKETS: RegionalMarket[] = [
  {
    id: 'market_alpha_hub',
    name: 'Hub Comercial Alpha',
    location: {
      systemId: 'sys_alpha_prime',
      region: 'Sector Alpha',
      coordinates: { x: 0, y: 0 },
      connectedSystems: ['sys_beta_sector', 'sys_gamma_quadrant', 'sys_delta_cluster']
    },
    type: 'hub',
    scale: 'galactic',
    supply: [
      { resourceId: 'res_tech_components', name: 'Componentes Tecnológicos', category: 'tech', quantity: 50000, productionRate: 2000, basePrice: 1000, currentPrice: 1100, priceTrend: 'rising', quality: 90 },
      { resourceId: 'res_manufactured_goods', name: 'Bienes Manufacturados', category: 'manufactured', quantity: 100000, productionRate: 5000, basePrice: 500, currentPrice: 500, priceTrend: 'stable', quality: 85 },
      { resourceId: 'res_luxury_items', name: 'Artículos de Lujo', category: 'luxury', quantity: 10000, productionRate: 200, basePrice: 5000, currentPrice: 5500, priceTrend: 'rising', quality: 95 }
    ],
    demand: [
      { resourceId: 'res_raw_metal', name: 'Metal Crudo', quantity: 200000, consumptionRate: 8000, urgency: 60, currentPrice: 150, maxPrice: 200 },
      { resourceId: 'res_plasma', name: 'Plasma', quantity: 50000, consumptionRate: 2000, urgency: 70, currentPrice: 800, maxPrice: 1200 },
      { resourceId: 'res_rare_minerals', name: 'Minerales Raros', quantity: 10000, consumptionRate: 500, urgency: 90, currentPrice: 3000, maxPrice: 5000 }
    ],
    traders: [],
    stats: {
      dailyVolume: 10000000,
      dailyTrades: 5000,
      avgTradeValue: 2000,
      priceVolatility: 15,
      marketSentiment: 'bullish'
    },
    regulations: {
      tariffs: { import: 0.1, export: 0.05, interstellar: 0.08 },
      taxes: { sales: 0.08, transaction: 0.02, corporate: 0.15 },
      restrictions: { bannedGoods: ['weapons_class_x'], quotaLimited: [], licenseRequired: ['military_tech'] },
      subsidies: { encouragedGoods: ['food', 'medicine'], bonusRate: 0.1 }
    },
    events: []
  },
  {
    id: 'market_mining_sector',
    name: 'Mercado del Sector Minero',
    location: {
      systemId: 'sys_asteroid_belt_3',
      region: 'Cinturón de Asteroides',
      coordinates: { x: 150, y: -200 },
      connectedSystems: ['sys_alpha_prime', 'sys_forgeworld']
    },
    type: 'specialized',
    scale: 'sector',
    supply: [
      { resourceId: 'res_raw_metal', name: 'Metal Crudo', category: 'raw', quantity: 1000000, productionRate: 50000, basePrice: 100, currentPrice: 80, priceTrend: 'falling', quality: 80 },
      { resourceId: 'res_precious_metals', name: 'Metales Preciosos', category: 'raw', quantity: 50000, productionRate: 1000, basePrice: 2000, currentPrice: 2200, priceTrend: 'rising', quality: 95 },
      { resourceId: 'res_rare_earth', name: 'Tierras Raras', category: 'raw', quantity: 20000, productionRate: 500, basePrice: 5000, currentPrice: 4800, priceTrend: 'falling', quality: 90 }
    ],
    demand: [
      { resourceId: 'res_mining_equipment', name: 'Equipamiento Minero', quantity: 5000, consumptionRate: 200, urgency: 80, currentPrice: 10000, maxPrice: 15000 },
      { resourceId: 'res_food', name: 'Alimentos', quantity: 100000, consumptionRate: 5000, urgency: 90, currentPrice: 50, maxPrice: 100 },
      { resourceId: 'res_luxury_items', name: 'Artículos de Lujo', quantity: 2000, consumptionRate: 100, urgency: 40, currentPrice: 6000, maxPrice: 8000 }
    ],
    traders: [],
    stats: {
      dailyVolume: 5000000,
      dailyTrades: 3000,
      avgTradeValue: 1666,
      priceVolatility: 25,
      marketSentiment: 'neutral'
    },
    regulations: {
      tariffs: { import: 0.15, export: 0.02, interstellar: 0.05 },
      taxes: { sales: 0.05, transaction: 0.01, corporate: 0.1 },
      restrictions: { bannedGoods: [], quotaLimited: [{ goodId: 'res_rare_earth', maxAmount: 10000 }], licenseRequired: ['mining_rights'] },
      subsidies: { encouragedGoods: ['mining_equipment'], bonusRate: 0.15 }
    },
    events: []
  }
];

// ============================================
// BIENES COMERCIALES PREDEFINIDOS
// ============================================
export const TRADE_GOODS: TrackedGood[] = [
  {
    id: 'good_metal',
    name: 'Metal Estándar',
    category: 'raw_material',
    basePrice: 100,
    currentPrice: 100,
    priceHistory: [],
    volatility: { daily: 5, volatility30d: 8, volatilityIndex: 'low' },
    priceFactors: { supply: 70, demand: 60, productionCost: 50, transportCost: 40, speculation: 10, seasonal: 0, events: 0 },
    limits: { minPrice: 80, maxPrice: 150, historicalMin: 70, historicalMax: 200 },
    derivatives: { futures: true, options: false, shorts: false }
  },
  {
    id: 'good_plasma',
    name: 'Plasma Energético',
    category: 'energy',
    basePrice: 800,
    currentPrice: 850,
    priceHistory: [],
    volatility: { daily: 15, volatility30d: 20, volatilityIndex: 'medium' },
    priceFactors: { supply: 50, demand: 80, productionCost: 60, transportCost: 70, speculation: 30, seasonal: 10, events: 0 },
    limits: { minPrice: 600, maxPrice: 1200, historicalMin: 500, historicalMax: 1500 },
    derivatives: { futures: true, options: true, shorts: false }
  },
  {
    id: 'good_tech_components',
    name: 'Componentes Tecnológicos',
    category: 'manufactured',
    basePrice: 1000,
    currentPrice: 1100,
    priceHistory: [],
    volatility: { daily: 10, volatility30d: 15, volatilityIndex: 'medium' },
    priceFactors: { supply: 60, demand: 75, productionCost: 70, transportCost: 30, speculation: 40, seasonal: -5, events: 20 },
    limits: { minPrice: 800, maxPrice: 1500, historicalMin: 700, historicalMax: 2000 },
    derivatives: { futures: true, options: true, shorts: true }
  },
  {
    id: 'good_luxury_goods',
    name: 'Bienes de Lujo',
    category: 'luxury',
    basePrice: 5000,
    currentPrice: 5500,
    priceHistory: [],
    volatility: { daily: 20, volatility30d: 35, volatilityIndex: 'high' },
    priceFactors: { supply: 30, demand: 40, productionCost: 80, transportCost: 20, speculation: 60, seasonal: 30, events: 10 },
    limits: { minPrice: 3000, maxPrice: 10000, historicalMin: 2500, historicalMax: 15000 },
    derivatives: { futures: false, options: true, shorts: true }
  }
];

// ============================================
// HELPERS
// ============================================
export function calculateTradeProfit(
  route: InterstellarTradeRoute,
  cargo: { goodId: string; quantity: number; unitCost: number }[],
  shipSpecs: { fuelEfficiency: number; cargoCapacity: number; speed: number }
): { 
  grossProfit: number;
  costs: { fuel: number; maintenance: number; escort: number; insurance: number; taxes: number };
  netProfit: number;
  profitMargin: number;
  roi: number;
  riskScore: number;
} {
  // Calcular ingresos
  const grossProfit = cargo.reduce((total, item) => {
    const good = TRADE_GOODS.find(g => g.id === item.goodId);
    if (!good) return total;
    return total + ((good.currentPrice - item.unitCost) * item.quantity);
  }, 0);
  
  // Calcular costos
  const fuelCost = route.characteristics.fuelConsumption * shipSpecs.fuelEfficiency * 2; // ida y vuelta
  const maintenanceCost = route.characteristics.baseTravelTime * 0.01 * cargo.length;
  const escortCost = route.security.convoyEscortAvailable ? 5000 : 0;
  const insuranceCost = grossProfit * route.security.insuranceRate;
  const taxCost = grossProfit * (route.destination.faction === route.origin.faction ? 0.05 : 0.15);
  
  const totalCosts = fuelCost + maintenanceCost + escortCost + insuranceCost + taxCost;
  const netProfit = grossProfit - totalCosts;
  const profitMargin = (netProfit / grossProfit) * 100;
  
  // Calcular ROI
  const totalInvestment = cargo.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0) + totalCosts;
  const roi = (netProfit / totalInvestment) * 100;
  
  // Calcular riesgo
  const riskScore = route.characteristics.dangerLevel + (100 - route.security.patrolPresence) + (route.profitability.competitionLevel / 2);
  
  return {
    grossProfit,
    costs: { fuel: fuelCost, maintenance: maintenanceCost, escort: escortCost, insurance: insuranceCost, taxes: taxCost },
    netProfit,
    profitMargin,
    roi,
    riskScore: Math.min(100, riskScore)
  };
}

export function findBestTradeRoute(
  fromSystem: string,
  toSystem: string,
  cargoType: string,
  riskTolerance: 'low' | 'medium' | 'high'
): InterstellarTradeRoute | undefined {
  const routes = MAJOR_TRADE_ROUTES.filter(r => 
    r.origin.systemId === fromSystem && 
    r.destination.systemId === toSystem &&
    r.status === 'active'
  );
  
  if (riskTolerance === 'low') {
    return routes.filter(r => r.characteristics.dangerLevel < 30)
      .sort((a, b) => b.security.patrolPresence - a.security.patrolPresence)[0];
  } else if (riskTolerance === 'medium') {
    return routes.sort((a, b) => b.profitability.baseProfitMargin - a.profitability.baseProfitMargin)[0];
  } else {
    return routes.sort((a, b) => b.profitability.baseProfitMargin - a.profitability.baseProfitMargin)[0];
  }
}

export function predictPrice(
  good: TrackedGood,
  days: number
): { predicted: number; confidence: number; factors: string[] } {
  const recentTrend = good.priceHistory.slice(-7).reduce((sum, p, i, arr) => {
    if (i === 0) return 0;
    return sum + (p.price - arr[i-1].price);
  }, 0) / 6;
  
  const predicted = good.currentPrice + (recentTrend * days);
  const bounded = Math.max(good.limits.minPrice, Math.min(good.limits.maxPrice, predicted));
  
  const confidence = 100 - (good.volatility.volatility30d * 2);
  
  const factors = [];
  if (good.priceFactors.supply < 30) factors.push('Escasez de suministro');
  if (good.priceFactors.demand > 80) factors.push('Alta demanda');
  if (good.priceFactors.events !== 0) factors.push('Eventos de mercado activos');
  if (good.priceFactors.speculation > 50) factors.push('Alta especulación');
  
  return { predicted: bounded, confidence, factors };
}

export function getMarketBySystem(systemId: string): RegionalMarket | undefined {
  return REGIONAL_MARKETS.find(m => m.location.systemId === systemId);
}

export function getRoutesFromSystem(systemId: string): InterstellarTradeRoute[] {
  return MAJOR_TRADE_ROUTES.filter(r => r.origin.systemId === systemId);
}

export const InterstellarTradeSystem = {
  MAJOR_TRADE_ROUTES,
  REGIONAL_MARKETS,
  TRADE_GOODS,
  calculateTradeProfit,
  findBestTradeRoute,
  predictPrice,
  getMarketBySystem,
  getRoutesFromSystem
};
