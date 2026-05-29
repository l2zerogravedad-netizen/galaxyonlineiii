import { NextResponse } from 'next/server';
import {
  normalizeBuildingType,
  PLANET_BUILDING_SLOTS,
  buildGo2ConstructionQueue,
  type GameDashboardDto,
} from '@galaxy/shared';
import { verifyAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import {
  syncEmpireGameState,
  finalizeCompletedBuildings,
  isDevCheap,
} from '@/lib/empire-sync';

function xpMaxForLevel(level: number): number {
  return Math.max(level * 1000, 1000);
}

export async function GET(request: Request) {
  try {
    const { empireId } = verifyAuth(request);

    const synced = await syncEmpireGameState(empireId);

    const empire = await prisma.empire.findUnique({
      where: { id: empireId },
      include: {
        planets: {
          include: { buildings: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!empire) {
      return NextResponse.json(
        { success: false, error: 'Empire not found' },
        { status: 404 }
      );
    }

    const planet = empire.planets[0];
    let buildings = planet?.buildings ?? [];
    if (planet) {
      buildings = (await finalizeCompletedBuildings(planet.id)) as typeof buildings;
    }

    const normalized = buildings.map((b: { id: string; planetId: string; type: string; level: number; slotIndex: number; status: string; constructionEndsAt: Date | string | null }) => ({
      id: b.id,
      planetId: b.planetId,
      type: normalizeBuildingType(b.type),
      level: b.level,
      slotIndex: b.slotIndex,
      status: b.status,
      constructionEndsAt:
        b.constructionEndsAt instanceof Date
          ? b.constructionEndsAt.toISOString()
          : (b.constructionEndsAt as string | null) ?? null,
    }));

    const constructionQueue = buildGo2ConstructionQueue(normalized, isDevCheap);

    const dashboard: GameDashboardDto = {
      player: {
        empireId: empire.id,
        name: empire.name,
        level: empire.level,
        xp: empire.experience,
        xpMax: xpMaxForLevel(empire.level),
      },
      resources: synced.resources,
      planet: {
        id: planet?.id ?? '',
        name: planet?.name ?? 'Planeta Principal',
        type: planet?.type ?? 'HABITABLE',
        maxBuildingSlots: planet?.maxBuildingSlots ?? PLANET_BUILDING_SLOTS,
        buildings: normalized,
      },
      constructionQueue,
    };

    return NextResponse.json({ success: true, data: dashboard });
  } catch (error) {
    console.error('[GET /api/game/dashboard]', error);

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
