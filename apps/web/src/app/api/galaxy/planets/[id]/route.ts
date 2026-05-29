import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, handleApiError } from '@/lib/api-auth';

// ─── Route Params ─────────────────────────────────────────────────────────────

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ─── GET: Info de un planeta específico ──────────────────────────────────────

export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const user = verifyAuth(request);
    const { id: planetId } = await params;

    // ── 1. Buscar como planeta propio del jugador ───────────────────────────
    const planet = await prisma.planet.findFirst({
      where: { id: planetId, empireId: user.empireId },
      include: {
        buildings: { orderBy: { createdAt: 'asc' } },
        fleets: { where: { status: 'IDLE' } },
      },
    });

    if (planet) {
      return NextResponse.json({
        success: true,
        data: {
          ...planet,
          owner: 'self',
        },
      });
    }

    // ── 2. Buscar como planeta NPC ──────────────────────────────────────────
    if (planetId.startsWith('npc_')) {
      const parts = planetId.split('_');
      if (parts.length >= 3) {
        const x = parseInt(parts[1], 10);
        const y = parseInt(parts[2], 10);

        if (!isNaN(x) && !isNaN(y)) {
          // Deterministic type resolution (same algorithm as sector generator)
          const cellSeed = (x * 73856093) ^ (y * 19349663);
          const mulberry32 = (s: number) => () => {
            let t = (s += 0x6d2b79f5);
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
          };
          const rng = mulberry32(cellSeed + 12345);
          rng(); // first roll — planet exists check
          const types = ['HABITABLE', 'MINERAL_RICH', 'GAS_GIANT', 'DEAD', 'ICE'];
          const type = types[Math.floor(rng() * types.length)] as string;
          const owned = rng() < 0.05;

          return NextResponse.json({
            success: true,
            data: {
              id: planetId,
              name: `Sistema ${x},${y}`,
              galaxyX: x,
              galaxyY: y,
              type,
              owner: owned ? 'enemy_ai' : null,
              colonizable: !owned,
              difficulty: 1,
            },
          });
        }
      }
    }

    // ── 3. Planeta de otro jugador (sin detalle) ────────────────────────────
    const otherPlanet = await prisma.planet.findUnique({
      where: { id: planetId },
      select: {
        id: true,
        name: true,
        galaxyX: true,
        galaxyY: true,
        type: true,
        empireId: true,
        empire: { select: { name: true, level: true } },
      },
    });

    if (otherPlanet) {
      return NextResponse.json({
        success: true,
        data: {
          id: otherPlanet.id,
          name: otherPlanet.name,
          galaxyX: otherPlanet.galaxyX,
          galaxyY: otherPlanet.galaxyY,
          type: otherPlanet.type,
          owner: 'player',
          ownerEmpire: otherPlanet.empire?.name ?? 'Unknown',
          ownerLevel: otherPlanet.empire?.level ?? 0,
          colonizable: false,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Planet not found' },
      { status: 404 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

// ─── POST: Colonizar planeta NPC (enviar flota) ──────────────────────────────

export async function POST(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const user = verifyAuth(request);
    const { id: planetId } = await params;
    const body = (await request.json()) as {
      fleetId?: string;
      action?: 'colonize' | 'attack' | 'scout';
    };

    if (!planetId.startsWith('npc_')) {
      return NextResponse.json(
        { success: false, error: 'Este planeta no puede ser colonizado directamente' },
        { status: 400 }
      );
    }

    const parts = planetId.split('_');
    if (parts.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Invalid NPC planet ID' },
        { status: 400 }
      );
    }

    const targetX = parseInt(parts[1], 10);
    const targetY = parseInt(parts[2], 10);
    const fleetId = body.fleetId;
    const action = body.action ?? 'colonize';

    if (!fleetId) {
      return NextResponse.json(
        { success: false, error: 'Se requiere fleetId para la misión' },
        { status: 400 }
      );
    }

    // Verificar que la flota pertenece al jugador y está IDLE
    const fleet = await prisma.fleet.findFirst({
      where: {
        id: fleetId,
        empireId: user.empireId,
        status: 'IDLE',
      },
      include: { planet: { select: { galaxyX: true, galaxyY: true } } },
    });

    if (!fleet) {
      return NextResponse.json(
        { success: false, error: 'Fleet not available or already moving' },
        { status: 400 }
      );
    }

    // Calcular tiempo de viaje
    const originX = fleet.planet?.galaxyX ?? 0;
    const originY = fleet.planet?.galaxyY ?? 0;
    const distance = Math.sqrt(
      (targetX - originX) ** 2 + (targetY - originY) ** 2
    );
    const travelSeconds = Math.max(30, Math.floor(distance * 60)); // 1 unit = 60s
    const arrivesAt = new Date(Date.now() + travelSeconds * 1000);

    // Marcar flota como en movimiento
    const updatedFleet = await prisma.fleet.update({
      where: { id: fleetId },
      data: {
        status: 'MOVING',
        // Usamos updatedAt como proxy de startTime, target en metadata
        updatedAt: new Date(),
      },
    });

    // Crear registro de misión (opcional, depende del schema)
    // Por ahora devolvemos la info de la misión calculada

    return NextResponse.json({
      success: true,
      data: {
        mission: {
          fleetId: updatedFleet.id,
          action,
          targetPlanetId: planetId,
          target: { x: targetX, y: targetY },
          origin: { x: originX, y: originY },
          distance: Math.floor(distance * 100) / 100,
          travelSeconds,
          departsAt: new Date().toISOString(),
          arrivesAt: arrivesAt.toISOString(),
          status: 'EN_ROUTE',
        },
      },
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
