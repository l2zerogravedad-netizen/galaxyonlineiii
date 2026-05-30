import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAuth, handleApiError } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { ensureCommanderStatesTable } from './_lib/commander-state';

// GET /api/commanders — Listar todos los comandantes (JSON público) + estado del jugador
export async function GET(request: Request) {
  try {
    const user = verifyAuth(request);

    // 1. Cargar catálogo de comandantes desde JSON público.
    // En Next standalone el cwd puede variar, así que probamos varias rutas y
    // degradamos a un catálogo vacío en vez de tirar un 500 si no se encuentra.
    const candidatePaths = [
      path.join(process.cwd(), 'public', 'data', 'commanders.json'),
      path.join(process.cwd(), 'apps', 'web', 'public', 'data', 'commanders.json'),
      path.join(process.cwd(), '.next', 'standalone', 'apps', 'web', 'public', 'data', 'commanders.json'),
    ];
    let commandersData: { total?: number; byRarity?: unknown; commanders: Record<string, unknown>[] } = {
      total: 0,
      byRarity: {},
      commanders: [],
    };
    for (const p of candidatePaths) {
      try {
        if (fs.existsSync(p)) {
          commandersData = JSON.parse(fs.readFileSync(p, 'utf-8'));
          break;
        }
      } catch {
        /* try next path */
      }
    }

    // 2. Cargar estado persistente del jugador desde PostgreSQL
    // La tabla commander_states no es un modelo Prisma; asegurarla antes del SELECT
    // (si no existe, el query crudo lanzaría → 500). Las subrutas ya lo hacían.
    await ensureCommanderStatesTable();
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
