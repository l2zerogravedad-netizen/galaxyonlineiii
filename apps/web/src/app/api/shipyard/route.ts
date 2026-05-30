import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, handleApiError } from '@/lib/api-auth';

/**
 * GET /api/shipyard — Shipyard catalog for the empire:
 *  - blueprints: every ship blueprint the player can build (with cost/stats)
 *  - ships:      the player's current ship inventory (counts per blueprint)
 *  - queue:      active ship constructions
 *  - hasShipyard: whether any planet has a SHIPYARD building (build gating)
 *
 * Fills the gap where only /api/shipyard/queue + /build existed (no way to LIST blueprints).
 */
export async function GET(request: Request) {
  try {
    const user = verifyAuth(request);

    const [blueprints, ships, constructions, empire] = await Promise.all([
      prisma.blueprint.findMany({ orderBy: { costMetal: 'asc' } }),
      prisma.ship.findMany({
        where: { empireId: user.empireId, status: 'AVAILABLE' },
      }),
      prisma.shipConstruction.findMany({
        where: { empireId: user.empireId, status: 'BUILDING' },
        include: { blueprint: true },
        orderBy: { startedAt: 'asc' },
      }),
      prisma.empire.findUnique({
        where: { id: user.empireId },
        include: { planets: { include: { buildings: true } } },
      }),
    ]);

    const hasShipyard = (empire?.planets ?? []).some((p) =>
      p.buildings.some((b) => b.type === 'SHIPYARD' || b.type === 'shipyard')
    );

    const now = Date.now();

    return NextResponse.json({
      success: true,
      data: {
        hasShipyard,
        blueprints: blueprints.map((b) => ({
          id: b.id,
          key: b.key,
          name: b.name,
          type: b.type,
          class: b.type,
          category: b.category,
          description: b.description,
          hull: b.hull,
          shield: b.shield,
          attack: b.attack,
          hp: b.hp,
          defense: b.defense,
          speed: b.speed,
          initiative: b.initiative,
          ppcCount: b.ppcCount,
          weaponSlots: b.weaponSlots,
          moduleSlots: b.moduleSlots,
          he3Consumption: b.he3Consumption,
          metalCost: b.costMetal,
          plasmaCost: b.costPlasma,
          creditsCost: b.costCredits,
          buildTimeSeconds: b.buildTime,
          requiredTechId: b.requiredTechId,
          requiredBuildingType: b.requiredBuildingType,
        })),
        ships: ships.map((s) => ({
          id: s.id,
          blueprintId: s.blueprintId,
          quantity: s.quantity,
        })),
        queue: constructions.map((c) => ({
          id: c.id,
          blueprintId: c.blueprintId,
          blueprintName: c.blueprint.name,
          quantity: c.quantity,
          status: c.status,
          endsAt: c.endsAt?.toISOString() ?? null,
          remainingSeconds: c.endsAt
            ? Math.max(0, Math.floor((new Date(c.endsAt).getTime() - now) / 1000))
            : 0,
        })),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
