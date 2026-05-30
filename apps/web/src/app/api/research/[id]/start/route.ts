import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Tx } from '@/lib/prisma';
import { verifyAuth, handleApiError, ApiError } from '@/lib/api-auth';

/**
 * POST /api/research/[id]/start — start researching a technology.
 * Matches the path the deployed standalone /research page calls
 * (`/api/research/${techId}/start`). Same logic as POST /api/research.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = verifyAuth(request);
    const { id: technologyId } = await params;
    if (!technologyId) throw new ApiError(400, 'technologyId requerido');

    const technology = await prisma.technology.findUnique({ where: { id: technologyId } });
    if (!technology) throw new ApiError(404, 'Tecnología no encontrada');

    const active = await prisma.empireTechnology.findFirst({
      where: { empireId: user.empireId, status: 'RESEARCHING' },
    });
    if (active) throw new ApiError(400, 'Ya hay una investigación en curso');

    const existing = await prisma.empireTechnology.findUnique({
      where: { empireId_technologyId: { empireId: user.empireId, technologyId } },
    });
    const currentLevel = existing?.level ?? 0;
    if (currentLevel >= technology.maxLevel) throw new ApiError(400, 'Nivel máximo alcanzado');

    if (technology.requiredTechId) {
      const prereq = await prisma.empireTechnology.findUnique({
        where: {
          empireId_technologyId: {
            empireId: user.empireId,
            technologyId: technology.requiredTechId,
          },
        },
      });
      if (!prereq || prereq.level === 0) throw new ApiError(400, 'Requisito tecnológico no cumplido');
    }

    const nextLevel = currentLevel + 1;
    const costMetal = technology.baseCostMetal * nextLevel;
    const costPlasma = technology.baseCostPlasma * nextLevel;
    const seconds = technology.baseResearchTime * nextLevel;

    const resources = await prisma.resource.findMany({ where: { empireId: user.empireId } });
    const metal = resources.find((r) => r.type === 'METAL');
    const plasma = resources.find((r) => r.type === 'GAS') ?? resources.find((r) => r.type === 'PLASMA');
    if (!metal || !plasma) throw new ApiError(400, 'Recursos no encontrados');
    if (metal.amount < costMetal || plasma.amount < costPlasma) {
      throw new ApiError(400, 'Recursos insuficientes');
    }

    const endsAt = new Date(Date.now() + seconds * 1000);
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
