import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, handleApiError } from '@/lib/api-auth';

// GET /api/missions — Listar misiones disponibles
export async function GET(request: Request) {
  try {
    const user = verifyAuth(request);

    const missions = await prisma.mission.findMany({
      orderBy: { difficulty: 'asc' },
    });

    // Obtener progreso del jugador
    const playerRuns = await prisma.missionRun.findMany({
      where: { empireId: user.empireId },
      select: { missionId: true, status: true, result: true },
    });

    const missionsWithStatus = missions.map((m) => {
      const runs = playerRuns.filter((r) => r.missionId === m.id);
      const activeRun = runs.find((r) => r.status === 'RUNNING');
      const completedRuns = runs.filter((r) => r.result === 'WIN').length;

      let playerStatus = 'AVAILABLE';
      if (activeRun) playerStatus = 'IN_PROGRESS';
      else if (completedRuns > 0) playerStatus = 'COMPLETED';

      return {
        ...m,
        playerStatus,
        completedRuns,
        activeRunId: activeRun ? activeRun.missionId : null,
      };
    });

    return NextResponse.json({ success: true, data: missionsWithStatus });
  } catch (error) {
    return handleApiError(error);
  }
}
