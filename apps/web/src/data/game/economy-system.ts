/**
 * SISTEMA ECONÓMICO COMPLETO - GALAXY ONLINE II
 * Producción, consumo, balance y fórmulas económicas
 * Basado en documentación de Galaxy Online II Wiki (CC BY-SA 3.0)
 */

import type { ResourceKey } from '@/components/game/game-data';

// ============================================
// CONFIGURACIÓN GLOBAL DE ECONOMÍA
// ============================================
export const ECONOMY_CONFIG = {
  // Capacidades
  INITIAL_CAPACITY: 10000,
  MAX_CAPACITY_PER_WAREHOUSE: 10000,
  
  // Recursos iniciales
  INITIAL_RESOURCES: {
    metal: 5000,
    plasma: 5000,
    credits: 5000,
    energy: 100
  },
  
  // Producción base
  BASE_PRODUCTION: {
    metal: 20,    // por nivel de extractor
    plasma: 10,   // por nivel de refinería
    energy: 50,   // por nivel de generador
    credits: 5    // por nivel de centro de control
  },
  
  // Multiplicadores
  PRODUCTION_MULTIPLIER_PER_LEVEL: 1.0,  // +100% por nivel
  COST_MULTIPLIER_PER_LEVEL: 1.5,        // Costos crecen 50% por nivel
  TIME_MULTIPLIER_PER_LEVEL: 1.2,        // Tiempo crece 20% por nivel
  
  // Límites
  MAX_BUILDING_LEVEL: 20,
  MAX_RESEARCH_LEVEL: 20,
  MAX_STORAGE_LEVEL: 15,
  MAX_DEFENSE_LEVEL: 10,
  
  // Velocidades
  GAME_TICK_SECONDS: 1,  // Actualización por segundo
  PRODUCTION_UPDATE_INTERVAL: 60,  // Cada minuto
  
  // Bonuses
  NEW_PLAYER_BONUS_DAYS: 7,
  NEW_PLAYER_PRODUCTION_BONUS: 0.5,  // +50% producción
  
  // Penalizaciones
  ENERGY_SHORTAGE_PENALTY: 0.5,  // -50% producción sin energía
  OVERCAPACITY_PENALTY: true,    // Pérdida de recursos excedentes
};

// ============================================
// FÓRMULAS ECONÓMICAS
// ============================================

/**
 * Calcula producción por hora de un edificio
 */
export function calculateProduction(
  buildingType: 'metal_extractor' | 'plasma_refinery' | 'energy_generator' | 'control_center',
  level: number,
  researchBonus: number = 0,  // Porcentaje de bonus (ej: 0.25 = +25%)
  newPlayerBonus: boolean = false
): number {
  const baseProduction = ECONOMY_CONFIG.BASE_PRODUCTION[buildingType === 'metal_extractor' ? 'metal' : 
                                                     buildingType === 'plasma_refinery' ? 'plasma' :
                                                     buildingType === 'energy_generator' ? 'energy' : 'credits'];
  
  let production = baseProduction * level;
  
  // Aplicar bonus de investigación
  production *= (1 + researchBonus);
  
  // Aplicar bonus de nuevo jugador
  if (newPlayerBonus) {
    production *= (1 + ECONOMY_CONFIG.NEW_PLAYER_PRODUCTION_BONUS);
  }
  
  return Math.floor(production);
}

/**
 * Calcula capacidad de almacenamiento total
 */
export function calculateStorageCapacity(warehouseLevel: number, numWarehouses: number = 1): { metal: number; plasma: number } {
  const baseCapacity = ECONOMY_CONFIG.MAX_CAPACITY_PER_WAREHOUSE;
  const capacityPerWarehouse = baseCapacity * warehouseLevel;
  
  return {
    metal: capacityPerWarehouse * numWarehouses,
    plasma: Math.floor(capacityPerWarehouse * 0.6) * numWarehouses  // Plasma tiene 60% de capacidad
  };
}

/**
 * Calcula costo de mejora de edificio
 */
export function calculateUpgradeCost(
  baseCost: Record<ResourceKey, number>,
  currentLevel: number
): Record<ResourceKey, number> {
  const multiplier = Math.pow(ECONOMY_CONFIG.COST_MULTIPLIER_PER_LEVEL, currentLevel);
  
  return {
    metal: Math.floor(baseCost.metal * multiplier),
    plasma: Math.floor(baseCost.plasma * multiplier),
    credits: Math.floor(baseCost.credits * multiplier),
    energy: 0  // La energía no se consume para mejorar
  };
}

/**
 * Calcula tiempo de construcción
 */
export function calculateBuildTime(
  baseTimeMinutes: number,
  level: number,
  logisticsBonus: number = 0
): number {
  const timeMultiplier = Math.pow(ECONOMY_CONFIG.TIME_MULTIPLIER_PER_LEVEL, level - 1);
  let time = baseTimeMinutes * timeMultiplier;
  
  // Aplicar reducción de tiempo por investigación
  time *= (1 - logisticsBonus);
  
  return Math.max(1, Math.floor(time));
}

// ============================================
// BALANCE DE ENERGÍA
// ============================================

export interface EnergyBalance {
  production: number;
  consumption: number;
  net: number;
  status: 'surplus' | 'balanced' | 'deficit' | 'critical';
}

/**
 * Calcula balance de energía
 */
export function calculateEnergyBalance(
  generators: { level: number; count: number }[],
  buildings: { type: string; level: number; count: number; consumptionPerLevel: number }[]
): EnergyBalance {
  // Producción
  let production = 0;
  for (const gen of generators) {
    production += calculateProduction('energy_generator', gen.level) * gen.count;
  }
  
  // Consumo
  let consumption = 0;
  for (const building of buildings) {
    consumption += building.consumptionPerLevel * building.level * building.count;
  }
  
  const net = production - consumption;
  
  let status: EnergyBalance['status'];
  if (net > production * 0.2) status = 'surplus';
  else if (net >= 0) status = 'balanced';
  else if (net > -production * 0.2) status = 'deficit';
  else status = 'critical';
  
  return { production, consumption, net, status };
}

/**
 * Calcula penalización por falta de energía
 */
export function calculateEnergyPenalty(energyBalance: EnergyBalance): number {
  if (energyBalance.status === 'surplus' || energyBalance.status === 'balanced') {
    return 0; // Sin penalización
  }
  
  if (energyBalance.status === 'deficit') {
    return 0.25; // -25% producción
  }
  
  return ECONOMY_CONFIG.ENERGY_SHORTAGE_PENALTY; // -50% producción
}

// ============================================
// CÁLCULOS DE RECURSOS EN TIEMPO REAL
// ============================================

export interface ResourceSnapshot {
  metal: number;
  plasma: number;
  credits: number;
  energy: number;
  capacity: { metal: number; plasma: number };
}

export interface ProductionSnapshot {
  metalPerHour: number;
  plasmaPerHour: number;
  creditsPerHour: number;
  energyPerHour: number;
}

/**
 * Calcula estado actual de recursos
 */
export function calculateResourceState(
  currentResources: ResourceSnapshot,
  buildings: {
    metalExtractors: { level: number; count: number }[];
    plasmaRefineries: { level: number; count: number }[];
    energyGenerators: { level: number; count: number }[];
    controlCenters: { level: number; count: number }[];
    warehouses: { level: number; count: number }[];
  },
  researchBonus: { production: number; logistics: number },
  timeElapsedMinutes: number
): { resources: ResourceSnapshot; production: ProductionSnapshot } {
  
  // Calcular producción por hora
  let metalPerHour = 0;
  for (const extractor of buildings.metalExtractors) {
    metalPerHour += calculateProduction('metal_extractor', extractor.level, researchBonus.production) * extractor.count;
  }
  
  let plasmaPerHour = 0;
  for (const refinery of buildings.plasmaRefineries) {
    plasmaPerHour += calculateProduction('plasma_refinery', refinery.level, researchBonus.production) * refinery.count;
  }
  
  let energyPerHour = 0;
  for (const generator of buildings.energyGenerators) {
    energyPerHour += calculateProduction('energy_generator', generator.level) * generator.count;
  }
  
  let creditsPerHour = 0;
  for (const center of buildings.controlCenters) {
    creditsPerHour += calculateProduction('control_center', center.level) * center.count;
  }
  
  // Calcular capacidad
  let totalMetalCapacity = ECONOMY_CONFIG.INITIAL_CAPACITY;
  let totalPlasmaCapacity = ECONOMY_CONFIG.INITIAL_CAPACITY;
  
  for (const warehouse of buildings.warehouses) {
    const capacity = calculateStorageCapacity(warehouse.level, warehouse.count);
    totalMetalCapacity += capacity.metal;
    totalPlasmaCapacity += capacity.plasma;
  }
  
  // Aplicar producción basada en tiempo transcurrido
  const hoursElapsed = timeElapsedMinutes / 60;
  
  const newResources = {
    metal: Math.min(totalMetalCapacity, currentResources.metal + Math.floor(metalPerHour * hoursElapsed)),
    plasma: Math.min(totalPlasmaCapacity, currentResources.plasma + Math.floor(plasmaPerHour * hoursElapsed)),
    credits: currentResources.credits + Math.floor(creditsPerHour * hoursElapsed), // Créditos no tienen límite
    energy: currentResources.energy, // La energía no acumula
    capacity: { metal: totalMetalCapacity, plasma: totalPlasmaCapacity }
  };
  
  return {
    resources: newResources,
    production: {
      metalPerHour,
      plasmaPerHour,
      creditsPerHour,
      energyPerHour
    }
  };
}

// ============================================
// SISTEMA DE COSTOS DE NAVES
// ============================================

export interface ShipBuildCost {
  metal: number;
  plasma: number;
  credits: number;
  energy: number;
  timeMinutes: number;
}

export function calculateShipBuildCost(
  hullType: 'frigate' | 'cruiser' | 'battleship' | 'flagship',
  modules: { tier: number; count: number }[]
): ShipBuildCost {
  const baseCosts = {
    frigate: { metal: 500, plasma: 100, credits: 200, time: 5 },
    cruiser: { metal: 1500, plasma: 600, credits: 1000, time: 15 },
    battleship: { metal: 5000, plasma: 2500, credits: 4000, time: 45 },
    flagship: { metal: 100000, plasma: 50000, credits: 80000, time: 360 }
  };
  
  const base = baseCosts[hullType];
  
  // Costo adicional por módulos
  let moduleMetal = 0;
  let modulePlasma = 0;
  let moduleCredits = 0;
  
  for (const mod of modules) {
    const tierMultiplier = Math.pow(1.5, mod.tier - 1);
    moduleMetal += 50 * tierMultiplier * mod.count;
    modulePlasma += 30 * tierMultiplier * mod.count;
    moduleCredits += 40 * tierMultiplier * mod.count;
  }
  
  return {
    metal: Math.floor(base.metal + moduleMetal),
    plasma: Math.floor(base.plasma + modulePlasma),
    credits: Math.floor(base.credits + moduleCredits),
    energy: 0,
    timeMinutes: base.time + Math.floor(moduleMetal / 100)
  };
}

// ============================================
// SISTEMA DE COMERCIO
// ============================================

export interface TradeRate {
  from: ResourceKey;
  to: ResourceKey;
  rate: number; // Cuántos "to" por 1 "from"
  fee: number;  // Porcentaje de fee
}

export const BASE_TRADE_RATES: TradeRate[] = [
  { from: 'metal', to: 'credits', rate: 0.8, fee: 0.1 },   // 1 metal = 0.8 créditos (10% fee)
  { from: 'plasma', to: 'credits', rate: 2.0, fee: 0.1 },  // 1 plasma = 2 créditos
  { from: 'metal', to: 'plasma', rate: 0.4, fee: 0.15 },   // 1 metal = 0.4 plasma
];

export function calculateTrade(
  amount: number,
  from: ResourceKey,
  to: ResourceKey
): { receive: number; fee: number } {
  const rate = BASE_TRADE_RATES.find(r => r.from === from && r.to === to);
  if (!rate) return { receive: 0, fee: 0 };
  
  const gross = amount * rate.rate;
  const fee = gross * rate.fee;
  const receive = gross - fee;
  
  return {
    receive: Math.floor(receive),
    fee: Math.floor(fee)
  };
}

// ============================================
// VALIDACIONES ECONÓMICAS
// ============================================

export interface EconomyValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEconomyState(
  resources: ResourceSnapshot,
  buildings: any,
  energyBalance: EnergyBalance
): EconomyValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validar capacidad
  if (resources.metal > resources.capacity.metal) {
    errors.push(`Metal excede capacidad: ${resources.metal}/${resources.capacity.metal}`);
  }
  if (resources.plasma > resources.capacity.plasma) {
    errors.push(`Plasma excede capacidad: ${resources.plasma}/${resources.capacity.plasma}`);
  }
  
  // Validar energía
  if (energyBalance.status === 'critical') {
    errors.push('¡Crítico! Déficit severo de energía. Producción reducida 50%.');
  } else if (energyBalance.status === 'deficit') {
    warnings.push('Déficit de energía. Producción reducida 25%.');
  }
  
  // Validar recursos negativos
  if (resources.metal < 0) errors.push('Metal negativo');
  if (resources.plasma < 0) errors.push('Plasma negativo');
  if (resources.credits < 0) errors.push('Créditos negativos');
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// ============================================
// EXPORTACIONES
// ============================================
export const EconomySystem = {
  config: ECONOMY_CONFIG,
  calculateProduction,
  calculateStorageCapacity,
  calculateUpgradeCost,
  calculateBuildTime,
  calculateEnergyBalance,
  calculateResourceState,
  calculateShipBuildCost,
  calculateTrade,
  validateEconomyState
};
