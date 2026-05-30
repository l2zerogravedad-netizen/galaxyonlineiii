import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-auth';

/**
 * POST /api/admin/seed — one-time, idempotent seeding of the GO2 Technology tree and
 * ship Blueprint catalog. Runs INSIDE the deployed container (private Postgres reachable).
 * Guard: header `x-seed-secret` must equal env SEED_SECRET; if SEED_SECRET is unset it is
 * allowed only while both tables are empty (first-run bootstrap). Idempotent (upsert by key).
 *
 * NOTE: the production DB was already seeded via this route (research=8/shipyard=9 live).
 * Kept for reproducibility / fresh environments.
 */

const TECHNOLOGIES = [
  { key: 'metal_extraction', name: 'Extracción de Metal', description: 'Aumenta la producción de metal.', category: 'ECONOMY', baseCostMetal: 400, baseCostPlasma: 150, baseResearchTime: 120, maxLevel: 10, effectType: 'metal_production', effectValue: 0.1, effectDescription: '+10% metal/nivel' },
  { key: 'gas_refining', name: 'Refinado de Gas', description: 'Mejora las refinerías de gas.', category: 'ECONOMY', baseCostMetal: 350, baseCostPlasma: 250, baseResearchTime: 150, maxLevel: 10, effectType: 'gas_production', effectValue: 0.1, effectDescription: '+10% gas/nivel' },
  { key: 'energy_systems', name: 'Sistemas de Energía', description: 'Optimiza generadores.', category: 'ECONOMY', baseCostMetal: 500, baseCostPlasma: 200, baseResearchTime: 180, maxLevel: 8, effectType: 'energy_production', effectValue: 0.12, effectDescription: '+12% energía/nivel' },
  { key: 'construction_eng', name: 'Ingeniería de Construcción', description: 'Reduce tiempos de construcción.', category: 'CONSTRUCTION', baseCostMetal: 800, baseCostPlasma: 400, baseResearchTime: 240, maxLevel: 5, effectType: 'build_speed', effectValue: 0.08, effectDescription: '-8% tiempo/nivel' },
  { key: 'storage_tech', name: 'Tecnología de Almacenamiento', description: 'Más capacidad de almacenes.', category: 'CONSTRUCTION', baseCostMetal: 600, baseCostPlasma: 300, baseResearchTime: 200, maxLevel: 8, effectType: 'storage_capacity', effectValue: 0.15, effectDescription: '+15% capacidad/nivel' },
  { key: 'weapons_tech', name: 'Tecnología de Armas', description: 'Mejora el ataque de las naves.', category: 'MILITARY', baseCostMetal: 1000, baseCostPlasma: 600, baseResearchTime: 300, maxLevel: 10, effectType: 'ship_attack', effectValue: 0.1, effectDescription: '+10% ataque/nivel' },
  { key: 'armor_tech', name: 'Blindaje Naval', description: 'Refuerza el casco.', category: 'MILITARY', baseCostMetal: 1000, baseCostPlasma: 500, baseResearchTime: 300, maxLevel: 10, effectType: 'ship_hp', effectValue: 0.1, effectDescription: '+10% estructura/nivel' },
  { key: 'shield_tech', name: 'Escudos Deflectores', description: 'Aumenta los escudos.', category: 'DEFENSE', baseCostMetal: 900, baseCostPlasma: 700, baseResearchTime: 320, maxLevel: 8, effectType: 'ship_shield', effectValue: 0.12, effectDescription: '+12% escudo/nivel' },
  { key: 'navigation', name: 'Navegación Estelar', description: 'Más velocidad de flota.', category: 'NAVIGATION', baseCostMetal: 700, baseCostPlasma: 500, baseResearchTime: 260, maxLevel: 8, effectType: 'fleet_speed', effectValue: 0.1, effectDescription: '+10% velocidad/nivel' },
  { key: 'warp_drive', name: 'Motor de Salto', description: 'Saltos interestelares más largos.', category: 'NAVIGATION', baseCostMetal: 1500, baseCostPlasma: 1000, baseResearchTime: 480, maxLevel: 5, effectType: 'warp_range', effectValue: 0.2, effectDescription: '+20% rango/nivel' },
];

const BLUEPRINTS = [
  { key: 'scout', name: 'Explorador', type: 'frigate', description: 'Reconocimiento rápido y barato.', category: 'COMBAT', costMetal: 300, costPlasma: 80, costCredits: 100, buildTime: 120, attack: 8, hp: 60, defense: 4, speed: 20, hull: 60, shield: 10, initiative: 18, ppcCount: 1, he3Consumption: 2 },
  { key: 'frigate_light', name: 'Fragata Ligera', type: 'frigate', description: 'Fragata equilibrada.', category: 'COMBAT', costMetal: 500, costPlasma: 150, costCredits: 200, buildTime: 240, attack: 18, hp: 120, defense: 8, speed: 14, hull: 120, shield: 25, initiative: 12, ppcCount: 2, he3Consumption: 4 },
  { key: 'frigate_heavy', name: 'Fragata Pesada', type: 'frigate', description: 'Más blindaje y armamento.', category: 'COMBAT', costMetal: 1200, costPlasma: 400, costCredits: 600, buildTime: 480, attack: 32, hp: 220, defense: 14, speed: 11, hull: 220, shield: 45, initiative: 10, ppcCount: 3, he3Consumption: 7 },
  { key: 'cruiser', name: 'Crucero', type: 'cruiser', description: 'Buque de línea versátil.', category: 'COMBAT', costMetal: 2500, costPlasma: 1000, costCredits: 1200, buildTime: 900, attack: 60, hp: 450, defense: 24, speed: 9, hull: 450, shield: 90, initiative: 8, ppcCount: 4, he3Consumption: 12 },
  { key: 'battleship', name: 'Acorazado', type: 'battleship', description: 'Nave capital de gran poder.', category: 'COMBAT', costMetal: 6000, costPlasma: 2800, costCredits: 3000, buildTime: 1800, attack: 140, hp: 1100, defense: 50, speed: 6, hull: 1100, shield: 220, initiative: 6, ppcCount: 6, he3Consumption: 25 },
  { key: 'colonizer', name: 'Colonizador', type: 'special', description: 'Coloniza planetas vacíos.', category: 'CIVIL', costMetal: 4000, costPlasma: 1500, costCredits: 2000, buildTime: 1200, attack: 0, hp: 300, defense: 10, speed: 8, hull: 300, shield: 40, initiative: 4, ppcCount: 0, he3Consumption: 15 },
  { key: 'transport', name: 'Transporte', type: 'special', description: 'Carga recursos entre planetas.', category: 'TRANSPORT', costMetal: 1500, costPlasma: 500, costCredits: 600, buildTime: 600, attack: 4, hp: 250, defense: 12, speed: 10, hull: 250, shield: 30, initiative: 5, ppcCount: 0, he3Consumption: 8 },
];

export async function POST(request: Request) {
  try {
    const secret = process.env.SEED_SECRET;
    const provided = request.headers.get('x-seed-secret');
    const [techCount, bpCount] = await Promise.all([
      prisma.technology.count(),
      prisma.blueprint.count(),
    ]);
    const isFirstRun = techCount === 0 && bpCount === 0;
    const authorized = (secret && provided === secret) || (!secret && isFirstRun);
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: 'Forbidden (set x-seed-secret or seed only when empty)' },
        { status: 403 }
      );
    }

    for (const t of TECHNOLOGIES) {
      await prisma.technology.upsert({ where: { key: t.key }, create: t, update: {} });
    }
    for (const b of BLUEPRINTS) {
      await prisma.blueprint.upsert({ where: { key: b.key }, create: b, update: {} });
    }

    const [finalTech, finalBp] = await Promise.all([
      prisma.technology.count(),
      prisma.blueprint.count(),
    ]);
    return NextResponse.json({
      success: true,
      data: { totals: { technologies: finalTech, blueprints: finalBp } },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
