import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAuth, handleApiError } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

// GET /api/commanders/[id] — Detalle de un comandante + estado del jugador
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = verifyAuth(request);
    const { id } = await params;

    // 1. Cargar catálogo
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'commanders.json');
    const commandersData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const commander = commandersData.commanders.find(
      (c: Record<string, unknown>) => c.id === id
    );
    if (!commander) {
      return NextResponse.json(
        { success: false, error: 'Comandante no encontrado' },
        { status: 404 }
      );
    }

    // 2. Cargar estado persistente
    const rows = await prisma.$queryRaw<
      Array<{
        gems: unknown;
        equipment: unknown;
        hospital: unknown;
      }>
    >
      `SELECT gems, equipment, hospital
       FROM commander_states
       WHERE empire_id = ${user.empireId}
         AND commander_id = ${id}
       LIMIT 1`;

    const state = rows[0];

    return NextResponse.json({
      success: true,
      data: {
        ...commander,
        gems: state?.gems ?? { slots: [null, null, null] },
        equipment:
          state?.equipment ?? {
            weapons: [null, null, null, null],
            defense: [null, null, null, null],
          },
        hospital: state?.hospital ?? { status: 'HEALTHY', recoveryEndsAt: null },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
