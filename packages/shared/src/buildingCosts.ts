import { normalizeBuildingType } from './legacyBuildingTypes';
import type { CanonicalBuildingTypeId } from './planetLayout';

export interface BuildCostResult {
  metal: number;
  plasma: number;
  credits: number;
  /** Duración en segundos */
  time: number;
}

type CostCurve = {
  baseMetal: number;
  basePlasma: number;
  baseCredits: number;
  growth: number;
  baseMinutes: number;
  minuteScale: number;
};

const CURVES: Record<CanonicalBuildingTypeId, CostCurve> = {
  metal_extractor: { baseMetal: 60, basePlasma: 10, baseCredits: 50, growth: 1.5, baseMinutes: 1, minuteScale: 1 },
  plasma_refinery: { baseMetal: 100, basePlasma: 50, baseCredits: 80, growth: 1.6, baseMinutes: 2, minuteScale: 1 },
  warehouse: { baseMetal: 200, basePlasma: 100, baseCredits: 150, growth: 1.4, baseMinutes: 1, minuteScale: 1.2 },
  energy_generator: { baseMetal: 150, basePlasma: 80, baseCredits: 120, growth: 1.45, baseMinutes: 1, minuteScale: 1.3 },
  control_center: { baseMetal: 500, basePlasma: 300, baseCredits: 400, growth: 2, baseMinutes: 5, minuteScale: 5 },
  shipyard: { baseMetal: 1000, basePlasma: 600, baseCredits: 800, growth: 1.8, baseMinutes: 10, minuteScale: 10 },
  research_lab: { baseMetal: 800, basePlasma: 500, baseCredits: 700, growth: 1.6, baseMinutes: 8, minuteScale: 8 },
  hangar: { baseMetal: 600, basePlasma: 400, baseCredits: 500, growth: 1.5, baseMinutes: 6, minuteScale: 6 },
  defense_turret: { baseMetal: 900, basePlasma: 300, baseCredits: 400, growth: 1.7, baseMinutes: 12, minuteScale: 12 },
  trading_center: { baseMetal: 400, basePlasma: 200, baseCredits: 600, growth: 1.5, baseMinutes: 7, minuteScale: 7 },
  radar: { baseMetal: 300, basePlasma: 100, baseCredits: 200, growth: 1.4, baseMinutes: 4, minuteScale: 4 },
  residential_area: { baseMetal: 150, basePlasma: 50, baseCredits: 100, growth: 1.3, baseMinutes: 1, minuteScale: 1 },
  he3_extractor: { baseMetal: 80, basePlasma: 40, baseCredits: 60, growth: 1.5, baseMinutes: 1, minuteScale: 1 },
};

export function getBuildingLevelCost(
  rawType: string,
  targetLevel: number,
  devCheap = false
): BuildCostResult {
  const type = normalizeBuildingType(rawType) as CanonicalBuildingTypeId;
  const curve = CURVES[type];
  if (!curve || targetLevel < 1) {
    return { metal: 0, plasma: 0, credits: 0, time: 60 };
  }

  const level = Math.min(targetLevel, 30);
  const mult = Math.pow(curve.growth, level - 1);

  if (devCheap) {
    return {
      metal: curve.baseMetal * level,
      plasma: curve.basePlasma * level,
      credits: 0,
      time: Math.max(5, curve.baseMinutes * level),
    };
  }

  const minutes =
    level <= 5
      ? curve.baseMinutes * level
      : Math.floor(curve.baseMinutes + (level - 1) * curve.minuteScale);

  return {
    metal: Math.floor(curve.baseMetal * mult),
    plasma: Math.floor(curve.basePlasma * mult),
    credits: Math.floor(curve.baseCredits * mult),
    time: Math.max(30, minutes * 60),
  };
}
