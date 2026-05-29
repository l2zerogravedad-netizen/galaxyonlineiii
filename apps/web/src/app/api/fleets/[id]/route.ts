import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, handleApiError } from '@/lib/api-auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = verifyAuth(request);
    const fleet = await prisma.fleet.findFirst({
      where: { id, empireId: user.empireId },
      include: {
        formations: { include: { ship: { include: { blueprint: true } } } },
        missionRuns: { include: { mission: true } },
      },
    });
    if (!fleet) return NextResponse.json({ success: false, error: 'Flota no encontrada' }, { status: 404 });
    return NextResponse.json({ success: true, data: fleet });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = verifyAuth(request);
    const fleet = await prisma.fleet.findFirst({
      where: { id, empireId: user.empireId },
    });
    if (!fleet) return NextResponse.json({ success: false, error: 'Flota no encontrada' }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      const formations = await tx.fleetFormation.findMany({ where: { fleetId: id } });
      for (const f of formations) {
        await tx.ship.update({ where: { id: f.shipId }, data: { quantity: { increment: f.quantity }, fleetId: null } });
      }
      await tx.fleetFormation.deleteMany({ where: { fleetId: id } });
      await tx.fleet.delete({ where: { id } });
    });

    return NextResponse.json({ success: true, message: 'Flota eliminada' });
  } catch (error) {
    return handleApiError(error);
  }
}
