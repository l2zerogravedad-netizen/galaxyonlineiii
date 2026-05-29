import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, handleApiError } from '@/lib/api-auth';

// GET /api/fleets — Listar flotas del jugador
export async function GET(request: Request) {
  try {
    const user = verifyAuth(request);
    const fleets = await prisma.fleet.findMany({
      where: { empireId: user.empireId },
      include: {
        formations: {
          include: {
            ship: { include: { blueprint: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: fleets });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/fleets — Crear flota
export async function POST(request: Request) {
  try {
    const user = verifyAuth(request);
    const body = await request.json();
    const { name, planetId, formationSlots } = body as {
      name: string;
      planetId: string;
      formationSlots: Array<{ slotIndex: number; shipId: string; quantity: number }>;
    };

    if (!name || name.length < 1 || name.length > 50) {
      return NextResponse.json({ success: false, error: 'Nombre inválido (1-50 caracteres)' }, { status: 400 });
    }
    if (!Array.isArray(formationSlots) || formationSlots.length === 0) {
      return NextResponse.json({ success: false, error: 'Debe incluir al menos una nave' }, { status: 400 });
    }

    // Verificar planet
    const planet = await prisma.planet.findFirst({
      where: { id: planetId, empireId: user.empireId },
    });
    if (!planet) {
      return NextResponse.json({ success: false, error: 'Planeta no encontrado' }, { status: 404 });
    }

    // Verificar ships disponibles
    for (const slot of formationSlots) {
      const ship = await prisma.ship.findFirst({
        where: { id: slot.shipId, empireId: user.empireId },
      });
      if (!ship || ship.quantity < slot.quantity) {
        return NextResponse.json(
          { success: false, error: `Naves insuficientes en slot ${slot.slotIndex}` },
          { status: 400 }
        );
      }
    }

    // Calcular totalPower
    let totalPower = 0;
    for (const slot of formationSlots) {
      const ship = await prisma.ship.findFirst({
        where: { id: slot.shipId },
        include: { blueprint: true },
      });
      if (ship?.blueprint) {
        totalPower += (ship.blueprint.attack + ship.blueprint.hp + ship.blueprint.defense) * slot.quantity;
      }
    }

    // Crear flota con transacción
    const fleet = await prisma.$transaction(async (tx) => {
      // Crear fleet
      const f = await tx.fleet.create({
        data: {
          empireId: user.empireId,
          name,
          status: 'IDLE',
          planetId,
          totalPower,
        },
      });

      // Crear formaciones y descontar ships
      for (const slot of formationSlots) {
        await tx.fleetFormation.create({
          data: {
            fleetId: f.id,
            slotIndex: slot.slotIndex,
            shipId: slot.shipId,
            quantity: slot.quantity,
          },
        });
        await tx.ship.update({
          where: { id: slot.shipId },
          data: { quantity: { decrement: slot.quantity }, fleetId: f.id },
        });
      }

      return f;
    });

    return NextResponse.json({ success: true, data: fleet }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
