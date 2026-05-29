import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, handleApiError } from '@/lib/api-auth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MoveFleetBody {
  fleetId: string;
  targetX: number;
  targetY: number;
  action?: 'move' | 'attack' | 'colonize' | 'transport';
}

export interface FleetMovementResponse {
  success: true;
  data: {
    fleetId: string;
    status: 'MOVING';
    action: string;
    origin: { x: number; y: number };
    target: { x: number; y: number };
    distance: number;
    travelSeconds: number;
    departsAt: string;
    arrivesAt: string;
  };
}

// ─── POST: Mover flota a coordenadas ─────────────────────────────────────────

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const user = verifyAuth(request);
    const body = (await request.json()) as MoveFleetBody;

    const { fleetId, targetX, targetY } = body;
    const action = body.action ?? 'move';

    // ── Validaciones básicas ────────────────────────────────────────────────
    if (!fleetId || typeof targetX !== 'number' || typeof targetY !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Se requieren fleetId, targetX y targetY' },
        { status: 400 }
      );
    }

    if (targetX < -1000 || targetX > 1000 || targetY < -1000 || targetY > 1000) {
      return NextResponse.json(
        { success: false, error: 'Coordenadas fuera de rango válido (-1000 a 1000)' },
        { status: 400 }
      );
    }

    // ── Verificar que la flota pertenece al jugador y está IDLE ─────────────
    const fleet = await prisma.fleet.findFirst({
      where: {
        id: fleetId,
        empireId: user.empireId,
        status: 'IDLE',
      },
      include: {
        planet: {
          select: {
            galaxyX: true,
            galaxyY: true,
            name: true,
          },
        },
      },
    });

    if (!fleet) {
      return NextResponse.json(
        { success: false, error: 'Fleet not available or already moving' },
        { status: 400 }
      );
    }

    // ── Calcular distancia y tiempo de viaje ────────────────────────────────
    const originX = fleet.planet?.galaxyX ?? 0;
    const originY = fleet.planet?.galaxyY ?? 0;
    const distance = Math.sqrt((targetX - originX) ** 2 + (targetY - originY) ** 2);

    if (distance === 0) {
      return NextResponse.json(
        { success: false, error: 'El destino es el mismo que el origen' },
        { status: 400 }
      );
    }

    const travelSeconds = Math.max(30, Math.floor(distance * 60)); // 1 unit = 60s, min 30s
    const now = Date.now();
    const arrivesAt = new Date(now + travelSeconds * 1000);

    // ── Actualizar flota ────────────────────────────────────────────────────
    await prisma.fleet.update({
      where: { id: fleetId },
      data: {
        status: 'MOVING',
        updatedAt: new Date(),
      },
    });

    // ── Registrar movimiento en log del imperio (audit trail) ───────────────
    await prisma.empireLog.create({
      data: {
        empireId: user.empireId,
        type: 'FLEET_MOVEMENT',
        message: `Flota moviéndose desde (${originX},${originY}) hacia (${targetX},${targetY}) — ${action}`,
        metadata: JSON.stringify({
          fleetId,
          origin: { x: originX, y: originY },
          target: { x: targetX, y: targetY },
          distance,
          travelSeconds,
          action,
        }),
      },
    });

    const response: FleetMovementResponse = {
      success: true,
      data: {
        fleetId,
        status: 'MOVING',
        action,
        origin: { x: originX, y: originY },
        target: { x: targetX, y: targetY },
        distance: Math.floor(distance * 100) / 100,
        travelSeconds,
        departsAt: new Date(now).toISOString(),
        arrivesAt: arrivesAt.toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
