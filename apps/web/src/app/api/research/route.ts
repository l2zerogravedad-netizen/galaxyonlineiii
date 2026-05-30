import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Tx } from '@/lib/prisma';
import { verifyAuth, handleApiError, ApiError } from '@/lib/api-auth';

/**
 * GET /api/research — Tech tree for the empire (all technologies + the empire's level/status).
 * POST /api/research — Start researching a technology. Body: { technologyId }.
 *
 * Ported from the undeployed Fastify service (apps/api/src/routes/research.ts) into the
 * Next.js app that is actually deployed, so /api/research stops 404-ing. Backed by the
 * Technology + EmpireTechnology Prisma models.
 */

export async function GET(request: Request) {
  try {
    const user = verifyAuth(request);

    const [empireTechs, allTechnologies] = await Promise.all([
      prisma.empireTechnology.findMany({
        where: { empireId: user.empireId },
        include: { technology: { include: { requiredTech: true } } },
      }),
      prisma.technology.findMany({ include: { requiredTech: true } }),
    ]);

    const now = Date.now();
    const technologies = allTechnologies.map((tech) => {
      const et = empireTechs.find((e) => e.technologyId === tech.id);
      const currentLevel = et?.level ?? 0;
      const status = et?.status ?? 'LOCKED';
      const isResearching = status === 'RESEARCHING';

      let prerequisiteMet = true;
      let prerequisiteName: string | null = null;
      if (tech.requiredTechId) {
        const prereq = empireTechs.find((e) => e.technologyId === tech.requiredTechId);
        if (!prereq || prereq.level === 0) {
          prerequisiteMet = false;
          prerequisiteName = tech.requiredTech?.name ?? null;
        }
      }

      const nextLevel = currentLevel + 1;
      const costMetal = tech.baseCostMetal * nextLevel;
      const costPlasma = tech.baseCostPlasma * nextLevel;
      const researchTime = tech.baseResearchTime * nextLevel;

      let timeRemaining = 0;
      let progress = 0;
      if (isResearching && et?.researchStartedAt && et?.researchEndsAt) {
        const start = new Date(et.researchStartedAt).getTime();
        const end = new Date(et.researchEndsAt).getTime();
        const total = end - start;
        timeRemaining = Math.max(0, end - now);
        progress = total > 0 ? Math.min(100, ((now - start) / total) * 100) : 0;
      }

      return {
        id: tech.id,
        key: tech.key,
        name: tech.name,
        description: tech.description,
        category: tech.category,
        currentLevel,
        level: currentLevel,
        maxLevel: tech.maxLevel,
        status,
        isMaxLevel: currentLevel >= tech.maxLevel,
        prerequisiteMet,
        prerequisiteName,
        requiredTechId: tech.requiredTechId,
        currentMetalCost: costMetal,
        currentPlasmaCost: costPlasma,
        currentResearchaTimeSeconds: researchTime,
        costs: { metal: costMetal, plasma: costPlasma, time: researchTime },
        effects: {
          type: tech.effectType,
          value: tech.effectValue,
          description: tech.effectDescription,
        },
        researchStatus: isResearching
          ? { timeRemaining, progress, endsAt: et?.researchEndsAt?.toISOString() ?? null }
          : null,
      };
    });

    return NextResponse.json({ success: true, data: { technologies } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = verifyAuth(request);
    const body = (await request.json().catch(() => ({}))) as { technologyId?: string };
    const technologyId = body.technologyId;
    if (!technologyId || typeof technologyId !== 'string') {
      throw new ApiError(400, 'technologyId es requerido');
    }

    const technology = await prisma.technology.findUnique({ where: { id: technologyId } });
    if (!technology) throw new ApiError(404, 'Tecnología no encontrada');

    // One research at a time
    const active = await prisma.empireTechnology.findFirst({
      where: { empireId: user.empireId, status: 'RESEARCHING' },
    });
    if (active) throw new ApiError(400, 'Ya hay una investigación en curso');

    const existing = await prisma.empireTechnology.findUnique({
      where: { empireId_technologyId: { empireId: user.empireId, technologyId } },
    });
    const currentLevel = existing?.level ?? 0;
    if (currentLevel >= technology.maxLevel) throw new ApiError(400, 'Nivel máximo alcanzado');

    // Prerequisite check
    if (technology.requiredTechId) {
      const prereq = await prisma.empireTechnology.findUnique({
        where: {
          empireId_technologyId: { empireId: user.empireId, technologyId: technology.requiredTechId },
        },
      });
      if (!prereq || prereq.level === 0) {
        throw new ApiError(400, 'Requisito tecnológico no cumplido');
      }
    }

    const nextLevel = currentLevel + 1;
    const costMetal = technology.baseCostMetal * nextLevel;
    const costPlasma = technology.baseCostPlasma * nextLevel;
    const researchSeconds = technology.baseResearchTime * nextLevel;

    // Resources (METAL + GAS) — GAS is the canonical plasma type
    const resources = await prisma.resource.findMany({ where: { empireId: user.empireId } });
    const metal = resources.find((r) => r.type === 'METAL');
    const plasma = resources.find((r) => r.type === 'GAS') ?? resources.find((r) => r.type === 'PLASMA');
    if (!metal || !plasma) throw new ApiError(400, 'Recursos no encontrados');
    if (metal.amount < costMetal || plasma.amount < costPlasma) {
      throw new ApiError(400, 'Recursos insuficientes');
    }

    const endsAt = new Date(Date.now() + researchSeconds * 1000);

    const result = await prisma.$transaction(async (tx: Tx) => {
      await tx.resource.update({ where: { id: metal.id }, data: { amount: { decrement: costMetal } } });
      await tx.resource.update({ where: { id: plasma.id }, data: { amount: { decrement: costPlasma } } });
      return tx.empireTechnology.upsert({
        where: { empireId_technologyId: { empireId: user.empireId, technologyId } },
        create: {
          empireId: user.empireId,
          technologyId,
          level: currentLevel,
          status: 'RESEARCHING',
          researchStartedAt: new Date(),
          researchEndsAt: endsAt,
        },
        update: {
          status: 'RESEARCHING',
          researchStartedAt: new Date(),
          researchEndsAt: endsAt,
        },
      });
    });

    return NextResponse.json({
      success: true,
      data: { ...result, researchEndsAt: result.researchEndsAt?.toISOString() ?? null },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
