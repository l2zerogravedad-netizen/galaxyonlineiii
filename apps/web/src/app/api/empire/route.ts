import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import type { ApiEmpire } from '@galaxy/shared';

// Helper to calculate current resources with technology bonuses
function calculateResources(
  resource: {
    id: string;
    type: string;
    amount: number;
    capacity: number;
    productionPerHour: number;
    updatedAt: Date;
  },
  techBonuses: Record<string, number> = {}
) {
  const now = new Date();
  const lastUpdate = new Date(resource.updatedAt);
  const hoursDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

  // Apply technology bonuses
  let effectiveProductionPerHour = resource.productionPerHour;
  if (resource.type === 'METAL' && techBonuses['METAL_PRODUCTION']) {
    effectiveProductionPerHour *= 1 + techBonuses['METAL_PRODUCTION'];
  }
  if (resource.type === 'PLASMA' && techBonuses['PLASMA_PRODUCTION']) {
    effectiveProductionPerHour *= 1 + techBonuses['PLASMA_PRODUCTION'];
  }

  const production = effectiveProductionPerHour * hoursDiff;
  const newAmount = Math.min(resource.amount + production, resource.capacity);

  return {
    ...resource,
    amount: Math.floor(newAmount),
    productionPerHour: Math.floor(effectiveProductionPerHour),
    updatedAt: resource.updatedAt.toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    const { empireId } = verifyAuth(request);

    const empire = await prisma.empire.findUnique({
      where: { id: empireId },
      include: {
        resources: true,
        planets: {
          include: {
            buildings: true,
          },
        },
        technologies: {
          include: {
            technology: true,
          },
        },
      },
    });

    if (!empire) {
      return NextResponse.json(
        { success: false, error: 'Empire not found' },
        { status: 404 }
      );
    }

    // Calculate technology bonuses
    const techBonuses: Record<string, number> = {};
    for (const empireTech of empire.technologies) {
      if (empireTech.level > 0 && empireTech.technology.effectType) {
        techBonuses[empireTech.technology.effectType] =
          (techBonuses[empireTech.technology.effectType] || 0) +
          empireTech.technology.effectValue * empireTech.level;
      }
    }

    // Calculate current resources with bonuses
    const resourcesWithProduction = empire.resources.map(
      (r: {
        id: string;
        type: string;
        amount: number;
        capacity: number;
        productionPerHour: number;
        updatedAt: Date;
      }) => calculateResources(r, techBonuses)
    );

    const result: ApiEmpire = {
      id: empire.id,
      name: empire.name,
      level: empire.level,
      experience: empire.experience,
      resources: resourcesWithProduction,
      planets: empire.planets.map(
        (p: {
          id: string;
          name: string;
          type: string;
          maxBuildingSlots: number;
          buildings: Array<{
            id: string;
            planetId: string;
            type: string;
            level: number;
            slotIndex: number;
            status: string;
            constructionEndsAt: Date | null;
          }>;
        }) => ({
          id: p.id,
          name: p.name,
          type: p.type,
          maxBuildingSlots: p.maxBuildingSlots,
          buildings: p.buildings.map(
            (b: { constructionEndsAt: Date | null }) => ({
              ...b,
              constructionEndsAt: b.constructionEndsAt?.toISOString() ?? null,
            })
          ),
        })
      ),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('[GET /api/empire]', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
