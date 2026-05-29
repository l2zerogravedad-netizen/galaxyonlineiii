import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { syncEmpireGameState } from '@/lib/empire-sync';

export async function POST(request: Request) {
  try {
    const { empireId } = verifyAuth(request);

    const empire = await prisma.empire.findUnique({
      where: { id: empireId },
    });

    if (!empire) {
      return NextResponse.json(
        { success: false, error: 'Empire not found' },
        { status: 404 }
      );
    }

    const result = await syncEmpireGameState(empireId);

    return NextResponse.json({
      success: true,
      resources: result.resources,
      collected: result.collected,
    });
  } catch (error) {
    console.error('[POST /api/game/resources/collect]', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
