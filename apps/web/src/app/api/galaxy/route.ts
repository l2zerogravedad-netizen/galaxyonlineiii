import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, handleApiError } from '@/lib/api-auth';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SectorResponse {
  success: true;
  data: {
    center: { x: number; y: number };
    myPlanets: MyPlanet[];
    npcPlanets: NpcPlanet[];
    radius: number;
  };
}

interface MyPlanet {
  id: string;
  name: string;
  galaxyX: number;
  galaxyY: number;
  type: string;
}

export interface NpcPlanet {
  id: string;
  name: string;
  galaxyX: number;
  galaxyY: number;
  type: string;
  owner: string | null;
  difficulty: number;
}

// ─── GET: Obtener sector galáctico visible ───────────────────────────────────

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const user = verifyAuth(request);
    const { searchParams } = new URL(request.url);
    const cx = parseInt(searchParams.get('x') ?? '0', 10);
    const cy = parseInt(searchParams.get('y') ?? '0', 10);
    const radius = Math.min(parseInt(searchParams.get('radius') ?? '5', 10), 20); // max 20

    // ── 1. Planetas del jugador ─────────────────────────────────────────────
    const myPlanets: MyPlanet[] = await prisma.planet.findMany({
      where: { empireId: user.empireId },
      select: {
        id: true,
        name: true,
        galaxyX: true,
        galaxyY: true,
        type: true,
      },
    });

    // ── 2. Planetas NPC deterministas en el sector ──────────────────────────
    const npcPlanets = generateSector(cx, cy, radius, user.empireId);

    const response: SectorResponse = {
      success: true,
      data: {
        center: { x: cx, y: cy },
        myPlanets,
        npcPlanets,
        radius,
      },
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

// ─── Deterministic pseudo-random generator (mulberry32) ──────────────────────

function mulberry32(seed: number): () => number {
  return function (): number {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Sector Generator ────────────────────────────────────────────────────────

function generateSector(
  cx: number,
  cy: number,
  radius: number,
  _empireId: string
): NpcPlanet[] {
  const planets: NpcPlanet[] = [];
  const rng = mulberry32(cx * 100_000 + cy + 42);

  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      const x = cx + dx;
      const y = cy + dy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) continue;

      // Skip if this cell overlaps with a known player planet — we will filter
      // later; for now just generate.

      // Deterministic per-coordinate hash using a seeded RNG
      const cellSeed = (x * 73856093) ^ (y * 19349663);
      const cellRng = mulberry32(cellSeed + 12345);
      const roll = cellRng();

      if (roll < 0.30) {
        // 30 % chance of celestial body
        const types: NpcPlanet['type'][] = [
          'HABITABLE',
          'MINERAL_RICH',
          'GAS_GIANT',
          'DEAD',
          'ICE',
        ];
        const type = types[Math.floor(cellRng() * types.length)];
        const owned = cellRng() < 0.05; // 5 % owned by AI

        planets.push({
          id: `npc_${x}_${y}`,
          name: `Sistema ${x},${y}`,
          galaxyX: x,
          galaxyY: y,
          type,
          owner: owned ? 'enemy_ai' : null,
          difficulty: Math.max(1, Math.floor(dist) + 1),
        });
      }
    }
  }

  return planets;
}
