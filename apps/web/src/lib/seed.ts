/**
 * Seed de datos iniciales para nuevos usuarios del MMO.
 *
 * Este módulo proporciona funciones idempotentes para inicializar
 * todos los datos necesarios cuando un nuevo jugador se registra:
 * - Imperio (Empire)
 * - Recursos iniciales (10,000 de cada tipo según el MVP)
 * - Planeta principal con edificios nivel 1
 * - Blueprints de naves (datos globales, upsert)
 * - Misiones PvE (datos globales, upsert)
 *
 * Todas las operaciones son atómicas dentro de una transacción Prisma.
 * Si un usuario ya tiene datos, la función detecta el empire existente
 * y retorna sin duplicar información.
 */

import { prisma } from './prisma';

// =============================================================================
// TIPOS
// =============================================================================

/** Resultado del seed de un nuevo usuario */
export interface SeedResult {
  empireId: string;
  planetId: string;
  resourcesCreated: number;
  buildingsCreated: number;
  blueprintsUpserted: number;
  missionsUpserted: number;
  alreadyExisted: boolean;
}

/** Datos de un blueprint de nave */
interface BlueprintData {
  name: string;
  key: string;
  type: string;
  description: string;
  category: string;
  requiredTechId?: string;
  requiredBuildingType?: string;
  costMetal: number;
  costPlasma: number;
  costCredits: number;
  buildTime: number;
  attack: number;
  hp: number;
  defense: number;
  speed: number;
  cargoCapacity: number;
}

/** Datos de una misión PvE */
interface MissionData {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  durationSeconds: number;
  minShipsRequired: number;
  recommendedPower: number;
  enemyFleetConfig: string;
  rewardMetal: number;
  rewardPlasma: number;
  rewardXp: number;
  rewardCredits: number;
}

// =============================================================================
// CONFIGURACIÓN — BLUEPRINTS DE NAVES
// =============================================================================

/**
 * Blueprints de naves disponibles en el juego.
 * Datos globales: se hacen upsert por `key`, por lo que ejecutar
 * múltiples veces no crea duplicados.
 */
const DEFAULT_BLUEPRINTS: BlueprintData[] = [
  {
    name: 'Explorador',
    key: 'EXPLORER',
    type: 'LIGHT',
    description: 'Nave ligera diseñada para exploración y reconocimiento. Rápida pero vulnerable.',
    category: 'CIVIL',
    requiredBuildingType: 'SHIPYARD',
    costMetal: 1,
    costPlasma: 1,
    costCredits: 1,
    buildTime: 20,
    attack: 2,
    hp: 20,
    defense: 1,
    speed: 40,
    cargoCapacity: 50,
  },
  {
    name: 'Fragata MK-I',
    key: 'FRIGATE',
    type: 'COMBAT_LIGHT',
    description: 'Nave de combate ligera, versátil y económica. Ideal para flotas de reconocimiento armado.',
    category: 'COMBAT',
    requiredBuildingType: 'SHIPYARD',
    costMetal: 100,
    costPlasma: 50,
    costCredits: 0,
    buildTime: 60,
    attack: 15,
    hp: 80,
    defense: 8,
    speed: 25,
    cargoCapacity: 100,
  },
  {
    name: 'Crucero MK-I',
    key: 'CRUISER',
    type: 'COMBAT_MEDIUM',
    description: 'Nave de combate equilibrada con buen armamento y defensa. Columna vertebral de la flota.',
    category: 'COMBAT',
    requiredBuildingType: 'SHIPYARD',
    costMetal: 300,
    costPlasma: 150,
    costCredits: 50,
    buildTime: 120,
    attack: 40,
    hp: 200,
    defense: 20,
    speed: 15,
    cargoCapacity: 300,
  },
  {
    name: 'Acorazado MK-I',
    key: 'BATTLESHIP',
    type: 'COMBAT_HEAVY',
    description: 'Nave de guerra pesada con blindaje masivo y armamento devastador. Lenta pero imparable.',
    category: 'COMBAT',
    requiredBuildingType: 'SHIPYARD',
    costMetal: 800,
    costPlasma: 400,
    costCredits: 200,
    buildTime: 300,
    attack: 80,
    hp: 500,
    defense: 50,
    speed: 6,
    cargoCapacity: 500,
  },
];

// =============================================================================
// CONFIGURACIÓN — MISIONES PvE
// =============================================================================

/**
 * Misiones PvE disponibles en el juego.
 * Datos globales: se hacen upsert por `id`, por lo que ejecutar
 * múltiples veces no crea duplicados.
 */
const DEFAULT_MISSIONS: MissionData[] = [
  {
    id: 'mission-tutorial',
    name: 'Tutorial: Primeros Pasos',
    description: 'Construye tu primer edificio y familiarízate con la interfaz de comando.',
    difficulty: 1,
    durationSeconds: 60,
    minShipsRequired: 0,
    recommendedPower: 0,
    enemyFleetConfig: '{}',
    rewardMetal: 500,
    rewardPlasma: 200,
    rewardXp: 100,
    rewardCredits: 100,
  },
  {
    id: 'mission-patrol',
    name: 'Patrulla de Seguridad',
    description: 'Envía una flota a patrullar el sector cercano a tu planeta.',
    difficulty: 1,
    durationSeconds: 180,
    minShipsRequired: 1,
    recommendedPower: 100,
    enemyFleetConfig: '{"FRIGATE": 2}',
    rewardMetal: 800,
    rewardPlasma: 400,
    rewardXp: 200,
    rewardCredits: 150,
  },
  {
    id: 'mission-anomaly',
    name: 'Investigación Anómala',
    description: 'Investiga una señal anómala detectada en el sector vecino.',
    difficulty: 2,
    durationSeconds: 300,
    minShipsRequired: 2,
    recommendedPower: 300,
    enemyFleetConfig: '{"FRIGATE": 5, "CRUISER": 1}',
    rewardMetal: 1500,
    rewardPlasma: 800,
    rewardXp: 500,
    rewardCredits: 400,
  },
  {
    id: 'mission-defense',
    name: 'Defensa del Sector',
    description: 'Defiende el sector de una incursión enemiga hostil.',
    difficulty: 3,
    durationSeconds: 600,
    minShipsRequired: 3,
    recommendedPower: 800,
    enemyFleetConfig: '{"CRUISER": 3, "BATTLESHIP": 1}',
    rewardMetal: 3000,
    rewardPlasma: 1500,
    rewardXp: 1000,
    rewardCredits: 800,
  },
];

// =============================================================================
// CONFIGURACIÓN — RECURSOS INICIALES (MVP: 10,000 cada uno)
// =============================================================================

/** Recursos iniciales que recibe todo nuevo jugador */
const INITIAL_RESOURCES = [
  { type: 'METAL',  amount: 10000, capacity: 50000, productionPerHour: 100 },
  { type: 'PLASMA', amount: 10000, capacity: 50000, productionPerHour: 80 },
  { type: 'CREDITS',amount: 10000, capacity: 50000, productionPerHour: 60 },
] as const;

/** Edificios iniciales del planeta principal (nivel 1) */
const INITIAL_BUILDINGS = [
  { type: 'COMMAND_CENTER',  slotIndex: 40, status: 'IDLE' as const },
  { type: 'METAL_MINE',      slotIndex: 10, status: 'IDLE' as const },
  { type: 'PLASMA_EXTRACTOR',slotIndex: 11, status: 'IDLE' as const },
  { type: 'CREDIT_MINT',     slotIndex: 12, status: 'IDLE' as const },
  { type: 'SHIPYARD',        slotIndex: 30, status: 'IDLE' as const },
  { type: 'RESEARCH_LAB',    slotIndex: 31, status: 'IDLE' as const },
] as const;

// =============================================================================
// FUNCIONES PÚBLICAS
// =============================================================================

/**
 * Inicializa todos los datos de un nuevo usuario: imperio, recursos,
 * planeta, edificios, blueprints globales y misiones globales.
 *
 * La función es **idempotente**: si el usuario ya tiene un empire creado,
 * detecta la existencia y retorna sin duplicar datos.
 *
 * @param userId   UUID del usuario recién registrado
 * @param username Nombre de usuario para personalizar el imperio
 * @returns Objeto con los IDs creados y contadores de registros
 *
 * @example
 * ```typescript
 * const result = await seedNewUser('uuid-aqui', 'ComandanteX');
 * if (result.alreadyExisted) {
 *   console.log('El usuario ya tenía datos inicializados');
 * }
 * ```
 */
export async function seedNewUser(
  userId: string,
  username: string,
): Promise<SeedResult> {
  // ── Validación de entrada ──────────────────────────────────────────────
  if (!userId || typeof userId !== 'string') {
    throw new SeedError('INVALID_USER_ID', 'userId es requerido y debe ser un string');
  }
  if (!username || typeof username !== 'string') {
    throw new SeedError('INVALID_USERNAME', 'username es requerido y debe ser un string');
  }

  // ── Idempotencia: verificar si el usuario ya tiene empire ─────────────
  const existingEmpire = await prisma.empire.findUnique({
    where: { userId },
  });

  if (existingEmpire) {
    // Buscar el planeta principal para devolver su ID
    const existingPlanet = await prisma.planet.findFirst({
      where: { empireId: existingEmpire.id },
    });

    return {
      empireId: existingEmpire.id,
      planetId: existingPlanet?.id ?? '',
      resourcesCreated: 0,
      buildingsCreated: 0,
      blueprintsUpserted: 0,
      missionsUpserted: 0,
      alreadyExisted: true,
    };
  }

  // ── Ejecutar todo dentro de una transacción ────────────────────────────
  const result = await prisma.$transaction(async (tx) => {
    // ── 1. Crear Empire ──────────────────────────────────────────────────
    const empire = await tx.empire.create({
      data: {
        userId,
        name: `Imperio de ${username}`,
        level: 1,
        experience: 0,
      },
    });

    // ── 2. Crear recursos iniciales ──────────────────────────────────────
    // createMany no es soportado dentro de $transaction con el PrismaClient
    // estándar en algunas versiones, así que usamos create individuales.
    let resourcesCreated = 0;
    for (const res of INITIAL_RESOURCES) {
      await tx.resource.create({
        data: {
          empireId: empire.id,
          type: res.type,
          amount: res.amount,
          capacity: res.capacity,
          productionPerHour: res.productionPerHour,
        },
      });
      resourcesCreated++;
    }

    // ── 3. Crear planeta inicial ─────────────────────────────────────────
    const planet = await tx.planet.create({
      data: {
        empireId: empire.id,
        name: 'Planeta Principal',
        type: 'HABITABLE',
        galaxyX: 0,
        galaxyY: 0,
        maxBuildingSlots: 80,
      },
    });

    // ── 4. Crear edificios iniciales (nivel 1) ───────────────────────────
    let buildingsCreated = 0;
    for (const bld of INITIAL_BUILDINGS) {
      await tx.building.create({
        data: {
          planetId: planet.id,
          type: bld.type,
          level: 1,
          slotIndex: bld.slotIndex,
          status: bld.status,
        },
      });
      buildingsCreated++;
    }

    return {
      empireId: empire.id,
      planetId: planet.id,
      resourcesCreated,
      buildingsCreated,
    };
  }, {
    // Opciones de la transacción: máximo 10 segundos de espera
    maxWait: 10000,
    timeout: 15000,
  });

  // ── 5. Blueprints de naves (globales, fuera de la transacción) ─────────
  // Los blueprints son datos globales del juego. Usamos upsert para no
  // duplicarlos si ya existen (ej: seed ejecutado para otro usuario previo).
  let blueprintsUpserted = 0;
  for (const bp of DEFAULT_BLUEPRINTS) {
    try {
      await prisma.blueprint.upsert({
        where: { key: bp.key },
        update: {}, // No actualizamos nada si ya existe
        create: bp,
      });
      blueprintsUpserted++;
    } catch (err) {
      // Si falla un blueprint individual, logueamos pero no detenemos el proceso
      console.warn(`[seed] Blueprint upsert skipped for key="${bp.key}":`, err instanceof Error ? err.message : String(err));
    }
  }

  // ── 6. Misiones PvE (globales, fuera de la transacción) ────────────────
  let missionsUpserted = 0;
  for (const m of DEFAULT_MISSIONS) {
    try {
      await prisma.mission.upsert({
        where: { id: m.id },
        update: {}, // No actualizamos si ya existe
        create: m,
      });
      missionsUpserted++;
    } catch (err) {
      console.warn(`[seed] Mission upsert skipped for id="${m.id}":`, err instanceof Error ? err.message : String(err));
    }
  }

  // ── Resultado ──────────────────────────────────────────────────────────
  return {
    empireId: result.empireId,
    planetId: result.planetId,
    resourcesCreated: result.resourcesCreated,
    buildingsCreated: result.buildingsCreated,
    blueprintsUpserted,
    missionsUpserted,
    alreadyExisted: false,
  };
}

/**
 * Inicializa únicamente los datos globales del juego:
 * - Blueprints de naves
 * - Misiones PvE
 *
 * Útil para ejecutar en el seed inicial de la base de datos
 * (prisma db seed) antes de que existan usuarios.
 *
 * @returns Contadores de registros procesados
 */
export async function seedGlobalData(): Promise<{
  blueprintsUpserted: number;
  missionsUpserted: number;
}> {
  let blueprintsUpserted = 0;
  let missionsUpserted = 0;

  for (const bp of DEFAULT_BLUEPRINTS) {
    try {
      await prisma.blueprint.upsert({
        where: { key: bp.key },
        update: {},
        create: bp,
      });
      blueprintsUpserted++;
    } catch (err) {
      console.warn(`[seedGlobal] Blueprint skipped key="${bp.key}":`, err instanceof Error ? err.message : String(err));
    }
  }

  for (const m of DEFAULT_MISSIONS) {
    try {
      await prisma.mission.upsert({
        where: { id: m.id },
        update: {},
        create: m,
      });
      missionsUpserted++;
    } catch (err) {
      console.warn(`[seedGlobal] Mission skipped id="${m.id}":`, err instanceof Error ? err.message : String(err));
    }
  }

  return { blueprintsUpserted, missionsUpserted };
}

// =============================================================================
// MANEJO DE ERRORES PERSONALIZADO
// =============================================================================

/** Error específico del sistema de seed con código semántico */
export class SeedError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'SeedError';

    // Mantener el stack trace en V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SeedError);
    }
  }
}

// =============================================================================
// DEBUG / CLI
// =============================================================================

/**
 * Punto de entrada para ejecución directa vía CLI (tsx).
 *
 * Uso:
 *   npx tsx apps/web/src/lib/seed.ts <userId> <username>
 *
 * Ejemplo:
 *   npx tsx apps/web/src/lib/seed.ts 550e8400-e29b-41d4-a716-446655440000 ComandanteX
 */
async function main() {
  const [, , userId, username] = process.argv;

  if (!userId || !username) {
    console.error('Uso: npx tsx seed.ts <userId> <username>');
    console.error('  userId:   UUID del usuario');
    console.error('  username: Nombre del comandante');
    process.exit(1);
  }

  console.log(`[seed] Inicializando datos para usuario "${username}" (${userId})...`);

  try {
    const result = await seedNewUser(userId, username);

    if (result.alreadyExisted) {
      console.log('[seed] ⚠️ El usuario ya tenía datos inicializados.');
    } else {
      console.log('[seed] ✅ Seed completado exitosamente:');
    }

    console.log(`       Empire:        ${result.empireId}`);
    console.log(`       Planet:        ${result.planetId}`);
    console.log(`       Resources:     ${result.resourcesCreated} creados`);
    console.log(`       Buildings:     ${result.buildingsCreated} creados`);
    console.log(`       Blueprints:    ${result.blueprintsUpserted} upserteados`);
    console.log(`       Missions:      ${result.missionsUpserted} upserteadas`);
  } catch (error) {
    console.error('[seed] ❌ Error durante el seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar solo si se llama directamente (no al importar)
if (require.main === module) {
  main();
}
