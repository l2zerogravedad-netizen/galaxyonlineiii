import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, handleApiError, ApiError } from '@/lib/api-auth';

/**
 * POST /api/missions/[id]/start — launch a PvE mission run.
 * Body: { fleetId?: string }.
 *
 * The MissionRun model requires a fleet (non-nullable FK) — matching GO2's rule that a
 * mission needs a fleet to send. If no fleetId is given we use the empire's first fleet;
 * if the empire has none, we return a clear 400. Fields match the schema exactly
 * (status, startedAt; there is no endsAt on MissionRun).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = verifyAuth(request);
    const { id: missionId } = await params;
    const body = (await request.json().catch(() => ({}))) as { fleetId?: string };

    const mission = await prisma.mission.findUnique({ where: { id: missionId } });
    if (!mission) throw new ApiError(404, 'Misión no encontrada');

    // Already running this mission?
    const active = await prisma.missionRun.findFirst({
      where: { empireId: user.empireId, missionId, status: 'RUNNING' },
    });
    if (active) throw new ApiError(400, 'Esta misión ya está en curso');

    // Resolve a fleet (required by the schema and by the game rule).
    let fleetId = body.fleetId;
    if (fleetId) {
      const fleet = await prisma.fleet.findFirst({
        where: { id: fleetId, empireId: user.empireId },
      });
      if (!fleet) throw new ApiError(404, 'Flota no encontrada');
    } else {
      const firstFleet = await prisma.fleet.findFirst({
        where: { empireId: user.empireId },
        orderBy: { createdAt: 'asc' },
      });
      if (!firstFleet) {
        throw new ApiError(400, 'Necesitas una flota para iniciar la misión (construye naves y crea una flota)');
      }
      fleetId = firstFleet.id;
    }

    const run = await prisma.missionRun.create({
      data: {
        empireId: user.empireId,
        missionId,
        fleetId,
        status: 'RUNNING',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: run.id,
        missionId: run.missionId,
        fleetId: run.fleetId,
        status: run.status,
        startedAt: run.startedAt.toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
