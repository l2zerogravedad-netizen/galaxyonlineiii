import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, handleApiError } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(200, parseInt(searchParams.get('limit') || '100'));

    const empires = await prisma.empire.findMany({
      select: {
        id: true, name: true, level: true, experience: true,
        user: { select: { username: true } },
        _count: { select: { planets: true, fleets: true } },
      },
      orderBy: [{ level: 'desc' }, { experience: 'desc' }],
      take: limit,
    });

    const leaderboard = empires.map((e, i) => ({
      rank: i + 1,
      empireId: e.id,
      name: e.name,
      username: e.user.username,
      level: e.level,
      experience: e.experience,
      planets: e._count.planets,
      fleets: e._count.fleets,
      score: e.level * 1000 + e.experience,
    }));

    return NextResponse.json({ success: true, data: leaderboard });
  } catch (error) {
    return handleApiError(error);
  }
}
