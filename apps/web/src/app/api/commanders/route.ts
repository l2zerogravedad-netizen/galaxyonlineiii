import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAuth, handleApiError } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

// GET /api/commanders — Listar todos los comandantes (JSON público) + estado del jugador
export async function GET(request: Request) {
  try {
    const user = verifyAuth(request);

    // 1. Cargar catálogo de comandantes desde JSON público
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'commanders.json');
    const commandersData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    // 2. Cargar estado persistente del jugador desde PostgreSQL
    const rows = await prisma.$queryRaw<
      Array<{
        commander_id: string;
        gems: unknown;
        equipment: unknown;
        hospital: unknown;
      }>
    >
      `SELECT commander_id, gems, equipment, hospital
       FROM commander_states
       WHERE empire_id = ${user.empireId}`;

    const stateMap = new Map<
      string,
      { gems: unknown; equipment: unknown; hospital: unknown }
    >();
    for (const r of rows) {
      stateMap.set(r.commander_id, {
        gems: r.gems,
        equipment: r.equipment,
        hospital: r.hospital,
      });
    }

    // 3. Fusionar catálogo + estado
    const merged = commandersData.commanders.map((cmd: Record<string, unknown>) => {
      const state = stateMap.get(cmd.id as string);
      return {
        ...cmd,
        gems: state?.gems ?? { slots: [null, null, null] },
        equipment:
          state?.equipment ?? {
            weapons: [null, null, null, null],
            defense: [null, null, null, null],
          },
        hospital: state?.hospital ?? { status: 'HEALTHY', recoveryEndsAt: null },
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        total: commandersData.total,
        byRarity: commandersData.byRarity,
        commanders: merged,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
