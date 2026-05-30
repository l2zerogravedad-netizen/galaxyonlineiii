/**
 * Terraformación reactiva — inspirado en Project Tomorrow (video KuWTf7KrF6Y ~5:11).
 * El entorno se deriva del estado de juego (reglas), no de assets fijos por mano.
 */

import { PLANET_BUILDING_SLOTS } from '@galaxy/shared';

export type TerraformStage = 'barren' | 'recovering' | 'habitable' | 'thriving';

export interface TerraformVisualState {
  level: number;
  stage: TerraformStage;
  label: string;
  activeBuildings: number;
  inQueue: number;
}

const STAGE_LABEL: Record<TerraformStage, string> = {
  barren: 'Suelo árido',
  recovering: 'Recuperación en curso',
  habitable: 'Biósfera estable',
  thriving: 'Planeta revitalizado',
};

/** Peso por tipo de edificio (más construcción / producción = más “cura” visual). */
const TYPE_WEIGHT: Record<string, number> = {
  metal_extractor: 1.2,
  plasma_refinery: 1.2,
  energy_generator: 1.5,
  control_center: 2,
  research_lab: 1.8,
  shipyard: 1.4,
  warehouse: 1,
  trading_center: 1.1,
  radar: 1,
  defense_turret: 0.8,
  hangar: 1.2,
};

export function stageFromLevel(level: number): TerraformStage {
  if (level < 22) return 'barren';
  if (level < 48) return 'recovering';
  if (level < 75) return 'habitable';
  return 'thriving';
}

export function computeTerraformVisual(input: {
  placements: { type: string; status: string }[];
  queueLength: number;
}): TerraformVisualState {
  const active = input.placements.filter((p) => p.status === 'active' || p.status === 'upgrading');
  let score = 0;
  for (const p of active) {
    score += TYPE_WEIGHT[p.type] ?? 1;
  }
  score += input.queueLength * 1.5;

  const maxScore = Math.max(12, PLANET_BUILDING_SLOTS * 0.18);
  const level = Math.min(100, Math.round((score / maxScore) * 100));
  const stage = stageFromLevel(level);

  return {
    level,
    stage,
    label: STAGE_LABEL[stage],
    activeBuildings: active.length,
    inQueue: input.queueLength,
  };
}

/** Variables CSS para fondo del planeta (0–100). */
export function terraformStyleVars(level: number): Record<string, string | number> {
  const t = level / 100;
  return {
    '--tf-level': level,
    '--tf-green': `${Math.round(45 + t * 40)}%`,
    '--tf-saturation': `${Math.min(100, Math.round(35 + t * 65))}%`,
    '--tf-water': Math.min(1, Math.max(0, (level - 55) / 45)),
    '--tf-vegetation': Math.min(1, Math.max(0, (level - 30) / 50)),
  };
}
