import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, handleApiError, ApiError } from '@/lib/api-auth';

/**
 * POST /api/missions/[id]/start — launch a PvE mission run.
 * Body: { fleetId?: string }. Creates a MissionRun (RUNNING) that ends after the
 * mission's durationSeconds. Matches the path the deployed missions page calls.
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

    const active = await prisma.missionRun.findFirst({
      where: { empireId: user.empireId, missionId, status: 'RUNNING' },
    });
    if (active) throw new ApiError(400, 'Esta misión ya está en curso');

    let fleetId: string | null = null;
    if (body.fleetId) {
      const fleet = await prisma.fleet.findFirst({
        where: { id: body.fleetId, empireId: user.empireId },
      });
      if (!fleet) throw new ApiError(404, 'Flota no encontrada');
      fleetId = fleet.id;
    }

    const duration = (mission as { durationSeconds?: number }).durationSeconds ?? 180;
    const endsAt = new Date(Date.now() + duration * 1000);

    const run = await prisma.missionRun.create({
      data: {
        empireId: user.empireId,
        missionId,
        fleetId,
        status: 'RUNNING',
        endsAt,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: run.id,
        missionId: run.missionId,
        status: run.status,
        startedAt: run.startedAt.toISOString(),
        endsAt: run.endsAt.toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
