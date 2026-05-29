/**
 * SeedService — Inicialización de datos para nuevos jugadores.
 *
 * Este servicio utiliza Prisma ORM (vía @galaxy/database) para crear
 * los datos iniciales de un usuario tras su registro exitoso en el
 * backend principal (que usa SQL raw).
 *
 * Es la contraparte del backend para `apps/web/src/lib/seed.ts`.
 * Ambos comparten la misma lógica y se mantienen sincronizados.
 *
 * ## Idempotencia
 * Si un usuario ya tiene un Empire creado, la función detecta la
 * existencia y retorna sin duplicar datos.
 *
 * ## Transaccionalidad
 * Todos los datos de usuario (empire, recursos, planeta, edificios)
 * se crean dentro de una única transacción Prisma. Los datos globales
 * (blueprints, misiones) se manejan fuera con upsert.
 */

import { prisma } from '@galaxy/database';
import { logger } from '@/utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

/** Recursos iniciales del MVP (10,000 unidades cada uno) */
const INITIAL_RESOURCES = [
  { type: 'METAL',   amount: 10000, capacity: 50000, productionPerHour: 100 },
  { type: 'PLASMA',  amount: 10000, capacity: 50000, productionPerHour: 80 },
  { type: 'CREDITS', amount: 10000, capacity: 50000, productionPerHour: 60 },
] as const;

/** Edificios iniciales del planeta principal */
const INITIAL_BUILDINGS = [
  { type: 'COMMAND_CENTER',   slotIndex: 40, status: 'IDLE' as const },
  { type: 'METAL_MINE',       slotIndex: 10, status: 'IDLE' as const },
  { type: 'PLASMA_EXTRACTOR', slotIndex: 11, status: 'IDLE' as const },
  { type: 'CREDIT_MINT',      slotIndex: 12, status: 'IDLE' as const },
  { type: 'SHIPYARD',         slotIndex: 30, status: 'IDLE' as const },
  { type: 'RESEARCH_LAB',     slotIndex: 31, status: 'IDLE' as const },
] as const;

/** Blueprints de naves base (datos globales) */
const DEFAULT_BLUEPRINTS = [
  {
    name: 'Explorador', key: 'EXPLORER', type: 'LIGHT', description: 'Nave ligera diseñada para exploración y reconocimiento.',
    category: 'CIVIL', requiredBuildingType: 'SHIPYARD', costMetal: 1, costPlasma: 1, costCredits: 1,
    buildTime: 20, attack: 2, hp: 20, defense: 1, speed: 40, cargoCapacity: 50,
  },
  {
    name: 'Fragata MK-I', key: 'FRIGATE', type: 'COMBAT_LIGHT', description: 'Nave de combate ligera, versátil y económica.',
    category: 'COMBAT', requiredBuildingType: 'SHIPYARD', costMetal: 100, costPlasma: 50, costCredits: 0,
    buildTime: 60, attack: 15, hp: 80, defense: 8, speed: 25, cargoCapacity: 100,
  },
  {
    name: 'Crucero MK-I', key: 'CRUISER', type: 'COMBAT_MEDIUM', description: 'Nave de combate equilibrada. Columna vertebral de la flota.',
    category: 'COMBAT', requiredBuildingType: 'SHIPYARD', costMetal: 300, costPlasma: 150, costCredits: 50,
    buildTime: 120, attack: 40, hp: 200, defense: 20, speed: 15, cargoCapacity: 300,
  },
  {
    name: 'Acorazado MK-I', key: 'BATTLESHIP', type: 'COMBAT_HEAVY', description: 'Nave de guerra pesada con blindaje masivo.',
    category: 'COMBAT', requiredBuildingType: 'SHIPYARD', costMetal: 800, costPlasma: 400, costCredits: 200,
    buildTime: 300, attack: 80, hp: 500, defense: 50, speed: 6, cargoCapacity: 500,
  },
] as const;

/** Misiones PvE iniciales (datos globales) */
const DEFAULT_MISSIONS = [
  {
    id: 'mission-tutorial', name: 'Tutorial: Primeros Pasos',
    description: 'Construye tu primer edificio y familiarízate con la interfaz de comando.',
    difficulty: 1, durationSeconds: 60, minShipsRequired: 0, recommendedPower: 0,
    enemyFleetConfig: '{}', rewardMetal: 500, rewardPlasma: 200, rewardXp: 100, rewardCredits: 100,
  },
  {
    id: 'mission-patrol', name: 'Patrulla de Seguridad',
    description: 'Envía una flota a patrullar el sector cercano a tu planeta.',
    difficulty: 1, durationSeconds: 180, minShipsRequired: 1, recommendedPower: 100,
    enemyFleetConfig: '{"FRIGATE": 2}', rewardMetal: 800, rewardPlasma: 400, rewardXp: 200, rewardCredits: 150,
  },
  {
    id: 'mission-anomaly', name: 'Investigación Anómala',
    description: 'Investiga una señal anómala detectada en el sector vecino.',
    difficulty: 2, durationSeconds: 300, minShipsRequired: 2, recommendedPower: 300,
    enemyFleetConfig: '{"FRIGATE": 5, "CRUISER": 1}', rewardMetal: 1500, rewardPlasma: 800, rewardXp: 500, rewardCredits: 400,
  },
  {
    id: 'mission-defense', name: 'Defensa del Sector',
    description: 'Defiende el sector de una incursión enemiga hostil.',
    difficulty: 3, durationSeconds: 600, minShipsRequired: 3, recommendedPower: 800,
    enemyFleetConfig: '{"CRUISER": 3, "BATTLESHIP": 1}', rewardMetal: 3000, rewardPlasma: 1500, rewardXp: 1000, rewardCredits: 800,
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

/** Resultado de la inicialización de un nuevo usuario */
export interface SeedNewUserResult {
  empireId: string;
  planetId: string;
  resourcesCreated: number;
  buildingsCreated: number;
  alreadyExisted: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICIO
// ─────────────────────────────────────────────────────────────────────────────

class SeedService {

  /**
   * Inicializa todos los datos de un nuevo jugador.
   *
   * Flujo:
   * 1. Verifica si el usuario ya tiene un Empire (idempotencia).
   * 2. Crea Empire + Resources + Planet + Buildings en transacción.
   * 3. Upsertea blueprints y misiones globales (fuera de la transacción).
   *
   * @param userId   UUID del usuario (debe existir en tabla `users`)
   * @param username Nombre de usuario para personalizar el imperio
   * @returns Datos del seed realizado
   */
  async initializeNewUser(
    userId: string,
    username: string,
  ): Promise<SeedNewUserResult> {
    // ── Validación ──────────────────────────────────────────────────────
    if (!userId || typeof userId !== 'string') {
      throw new SeedServiceError('INVALID_USER_ID', 'userId es requerido');
    }
    if (!username || typeof username !== 'string') {
      throw new SeedServiceError('INVALID_USERNAME', 'username es requerido');
    }

    // ── Idempotencia: ¿ya existe empire para este userId? ──────────────
    const existing = await prisma.empire.findUnique({ where: { userId } });
    if (existing) {
      const planet = await prisma.planet.findFirst({ where: { empireId: existing.id } });
      logger.info(`[SeedService] Usuario ${userId} ya tiene empire ${existing.id}, skip.`);
      return {
        empireId: existing.id,
        planetId: planet?.id ?? '',
        resourcesCreated: 0,
        buildingsCreated: 0,
        alreadyExisted: true,
      };
    }

    // ── Transacción: datos del usuario ─────────────────────────────────
    const result = await prisma.$transaction(async (tx) => {
      // 1. Empire
      const empire = await tx.empire.create({
        data: { userId, name: `Imperio de ${username}`, level: 1, experience: 0 },
      });

      // 2. Recursos iniciales
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

      // 3. Planeta principal
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

      // 4. Edificios iniciales
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

      return { empireId: empire.id, planetId: planet.id, resourcesCreated, buildingsCreated };
    }, { maxWait: 10000, timeout: 15000 });

    logger.info(`[SeedService] Empire creado para ${userId}: empire=${result.empireId} planet=${result.planetId}`);

    // ── Datos globales (blueprints + misiones) ─────────────────────────
    // Se ejecutan fuera de la transacción; fallos individuales no afectan
    // al usuario. Son idempotentes por naturaleza (upsert por key/id).
    await this.upsertGlobalData();

    return { ...result, alreadyExisted: false };
  }

  /**
   * Inicializa solo los datos globales: blueprints de naves y misiones PvE.
   * Útil para `prisma db seed` o para poblar una base de datos limpia.
   */
  async upsertGlobalData(): Promise<{
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
        logger.warn(`[SeedService] Blueprint upsert falló para ${bp.key}:`, err);
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
        logger.warn(`[SeedService] Mission upsert falló para ${m.id}:`, err);
      }
    }

    logger.info(`[SeedService] Datos globales: ${blueprintsUpserted} blueprints, ${missionsUpserted} misiones.`);
    return { blueprintsUpserted, missionsUpserted };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ERROR PERSONALIZADO
// ─────────────────────────────────────────────────────────────────────────────

/** Error semántico del servicio de seed */
export class SeedServiceError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'SeedServiceError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SeedServiceError);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT SINGLETON
// ─────────────────────────────────────────────────────────────────────────────

export const seedService = new SeedService();
export default seedService;
