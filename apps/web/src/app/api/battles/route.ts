import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, handleApiError, ApiError } from '@/lib/api-auth';

// ─────────────────────────────────────────────
// POST /api/battles — Iniciar batalla PvP
// Body: { attackerFleetId: string, defenderId: string }
// ─────────────────────────────────────────────
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const user = verifyAuth(request);
    const body = await request.json();

    // ── Validaciones ──
    if (!body.attackerFleetId || typeof body.attackerFleetId !== 'string') {
      throw new ApiError(400, 'attackerFleetId es requerido y debe ser string');
    }
    if (!body.defenderId || typeof body.defenderId !== 'string') {
      throw new ApiError(400, 'defenderId es requerido y debe ser string');
    }

    // ── Verificar que la flota pertenece al imperio del jugador ──
    const fleet = await prisma.fleet.findFirst({
      where: {
        id: body.attackerFleetId,
        empireId: user.empireId,
      },
      include: {
        formations: {
          include: {
            ship: {
              include: {
                blueprint: true,
              },
            },
          },
        },
      },
    });

    if (!fleet) {
      throw new ApiError(404, 'Flota no encontrada o no pertenece al imperio');
    }

    if (fleet.formations.length === 0) {
      throw new ApiError(400, 'La flota no tiene formaciones');
    }

    // ── Generar seed RNG determinista (uint32) ──
    const seed = Math.floor(Math.random() * 4294967296);

    // ── Crear registro de batalla ──
    const battle = await prisma.battle.create({
      data: {
        empireId: user.empireId,
        fleetId: body.attackerFleetId,
        defenderId: body.defenderId,
        seed: seed.toString(),
        result: 'IN_PROGRESS',
        rounds: '0',
        xpGained: 0,
        creditsGained: 0,
      },
    });

    // ── Construir estado inicial para el frontend ──
    const attackerStacks = fleet.formations.map((formation) => ({
      stackId: formation.id,
      blueprintId: formation.ship.blueprintId,
      shipName: formation.ship.blueprint.name,
      shipCount: formation.shipCount,
      currentCount: formation.shipCount,
      maxHull: formation.ship.blueprint.hull ?? 100,
      currentHull: formation.ship.blueprint.hull ?? 100,
      maxShield: formation.ship.blueprint.shield ?? 0,
      currentShield: formation.ship.blueprint.shield ?? 0,
      attack: formation.ship.blueprint.attack ?? 10,
      defense: formation.ship.blueprint.defense ?? 5,
      speed: formation.ship.blueprint.speed ?? 10,
      initiative: formation.ship.blueprint.initiative ?? 10,
      position: formation.position ?? 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        battleId: battle.id,
        seed,
        initialState: {
          attackerStacks,
          defenderStacks: [], // Se poblaran en el frontend con datos del defensor
          currentRound: 0,
          maxRounds: 20,
          status: 'IN_PROGRESS',
        },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ─────────────────────────────────────────────
// GET /api/battles — Listar batallas del jugador
// Query opcional: ?limit=20&offset=0&status=IN_PROGRESS
// ─────────────────────────────────────────────
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const user = verifyAuth(request);

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const statusParam = searchParams.get('status');

    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 50;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

    if (isNaN(limit) || limit < 1) {
      throw new ApiError(400, 'limit debe ser un numero positivo');
    }
    if (isNaN(offset) || offset < 0) {
      throw new ApiError(400, 'offset debe ser un numero >= 0');
    }

    const whereClause: Record<string, unknown> = {
      empireId: user.empireId,
    };

    if (statusParam) {
      whereClause.result = statusParam;
    }

    const [battles, total] = await Promise.all([
      prisma.battle.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          losses: {
            select: {
              blueprintId: true,
              quantity: true,
            },
          },
          _count: {
            select: { losses: true },
          },
        },
      }),
      prisma.battle.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: battles,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + battles.length < total,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
