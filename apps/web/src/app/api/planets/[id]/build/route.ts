import { NextResponse } from 'next/server';
import {
  normalizeBuildingType,
  API_BUILDABLE_TYPES,
  PLANET_BUILDING_SLOTS,
} from '@galaxy/shared';
import { verifyAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import type { Tx } from "@/lib/prisma";
import {
  syncEmpireGameState,
  finalizeCompletedBuildings,
  validateBuildRequest,
  buildCostForLevel,
  recalculateEmpireProduction,
} from '@/lib/empire-sync';

interface BuildBody {
  slotIndex: number;
  type: string;
}

function validateBody(body: unknown): BuildBody {
  if (typeof body !== 'object' || body === null) {
    throw new Error('Invalid body: expected object');
  }
  const b = body as Record<string, unknown>;

  const slotIndex = Number(b.slotIndex);
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= PLANET_BUILDING_SLOTS) {
    throw new Error(`Invalid slotIndex: must be integer 0-${PLANET_BUILDING_SLOTS - 1}`);
  }

  const type = String(b.type ?? '');
  if (!type || type.length === 0) {
    throw new Error('Invalid type: must be non-empty string');
  }

  return { slotIndex, type };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { empireId } = verifyAuth(request);
    const { id: planetId } = await params;

    // Parse and validate body
    let body: BuildBody;
    try {
      const raw = await request.json();
      body = validateBody(raw);
    } catch (parseErr) {
      const msg = parseErr instanceof Error ? parseErr.message : 'Invalid body';
      return NextResponse.json(
        { success: false, error: msg },
        { status: 400 }
      );
    }

    const canonicalInput = normalizeBuildingType(body.type);

    // Validate buildable type
    if (!API_BUILDABLE_TYPES.has(canonicalInput)) {
      return NextResponse.json(
        { success: false, error: 'Invalid building type' },
        { status: 400 }
      );
    }

    // Verify planet belongs to empire
    const planet = await prisma.planet.findFirst({
      where: { id: planetId, empireId },
      include: { buildings: true },
    });

    if (!planet) {
      return NextResponse.json(
        { success: false, error: 'Planet not found' },
        { status: 404 }
      );
    }

    // Sync game state and finalize completed buildings before proceeding
    await syncEmpireGameState(empireId);
    const buildings = await finalizeCompletedBuildings(planetId);

    // Validate build request (slot, queue limit, placement rules)
    const validation = validateBuildRequest(
      canonicalInput,
      body.slotIndex,
      buildings
    );
    if (!validation.ok) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const canonicalType = validation.canonicalType;

    // Check for existing building at slot
    const existingBuilding = buildings.find(
      (b) => b.slotIndex === body.slotIndex
    );

    // Get resources
    const resources = await prisma.resource.findMany({ where: { empireId } });
    const metal = resources.find(
      (r: { type: string }) => r.type === 'METAL'
    );
    const plasma = resources.find(
      (r: { type: string }) => r.type === 'GAS'
    );
    const credits = resources.find(
      (r: { type: string }) => r.type === 'CREDITS'
    );

    if (!metal || !plasma || !credits) {
      return NextResponse.json(
        { success: false, error: 'Resources not found' },
        { status: 400 }
      );
    }

    const isUpgrade = existingBuilding !== undefined;
    const targetLevel = isUpgrade ? existingBuilding.level + 1 : 1;

    if (targetLevel > 30) {
      return NextResponse.json(
        { success: false, error: 'Maximum level reached (30)' },
        { status: 400 }
      );
    }

    const totalCost = buildCostForLevel(canonicalType, targetLevel);

    // Check sufficient resources
    if (
      metal.amount < totalCost.metal ||
      plasma.amount < totalCost.plasma ||
      credits.amount < totalCost.credits
    ) {
      return NextResponse.json(
        { success: false, error: 'Insufficient resources' },
        { status: 400 }
      );
    }

    const endsAt = new Date(Date.now() + totalCost.time * 1000);

    // Execute transaction: deduct resources + create/update building
    const result = await prisma.$transaction(async (tx: Tx) => {
      await tx.resource.update({
        where: { id: metal.id },
        data: { amount: { decrement: totalCost.metal } },
      });
      await tx.resource.update({
        where: { id: plasma.id },
        data: { amount: { decrement: totalCost.plasma } },
      });
      if (totalCost.credits > 0) {
        await tx.resource.update({
          where: { id: credits.id },
          data: { amount: { decrement: totalCost.credits } },
        });
      }

      if (isUpgrade) {
        return tx.building.update({
          where: { id: existingBuilding!.id },
          data: {
            type: canonicalType,
            level: existingBuilding!.level,
            status: 'UPGRADING',
            constructionEndsAt: endsAt,
          },
        });
      }

      return tx.building.create({
        data: {
          planetId,
          type: canonicalType,
          slotIndex: body.slotIndex,
          status: 'CONSTRUCTING',
          constructionEndsAt: endsAt,
        },
      });
    });

    // Recalculate production after building changes
    await recalculateEmpireProduction(empireId);

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        constructionEndsAt: result.constructionEndsAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error('[POST /api/planets/:id/build]', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to build' },
      { status: 500 }
    );
  }
}
