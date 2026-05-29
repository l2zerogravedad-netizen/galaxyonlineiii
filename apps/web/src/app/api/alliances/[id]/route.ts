import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, handleApiError } from '@/lib/api-auth';

// GET: Detalle de alianza con miembros
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alliance = await prisma.alliance.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            id: true,
            role: true,
            joinedAt: true,
            empire: {
              select: {
                id: true,
                name: true,
                user: { select: { username: true } },
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });

    if (!alliance) {
      return NextResponse.json(
        { success: false, error: 'Alianza no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: alliance });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST: Unirse a alianza
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = verifyAuth(request);

    // Verificar que no pertenece a otra alianza
    const existing = await prisma.allianceMember.findFirst({
      where: { empireId: user.empireId },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Ya perteneces a una alianza' },
        { status: 409 }
      );
    }

    // Verificar que la alianza existe y tiene espacio
    const alliance = await prisma.alliance.findUnique({
      where: { id },
    });
    if (!alliance) {
      return NextResponse.json(
        { success: false, error: 'Alianza no encontrada' },
        { status: 404 }
      );
    }
    if (alliance.memberCount >= alliance.maxMembers) {
      return NextResponse.json(
        { success: false, error: 'Alianza llena' },
        { status: 409 }
      );
    }

    // Unirse en transaccion atomica
    await prisma.$transaction(async (tx) => {
      await tx.allianceMember.create({
        data: {
          allianceId: id,
          empireId: user.empireId,
          role: 'MEMBER',
        },
      });
      await tx.alliance.update({
        where: { id },
        data: { memberCount: { increment: 1 } },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Te has unido a la alianza',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE: Abandonar alianza
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = verifyAuth(request);

    const member = await prisma.allianceMember.findFirst({
      where: { allianceId: id, empireId: user.empireId },
    });
    if (!member) {
      return NextResponse.json(
        { success: false, error: 'No eres miembro de esta alianza' },
        { status: 403 }
      );
    }

    const alliance = await prisma.alliance.findUnique({
      where: { id },
    });
    if (!alliance) {
      return NextResponse.json(
        { success: false, error: 'Alianza no encontrada' },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.allianceMember.delete({ where: { id: member.id } });

      const newCount = alliance!.memberCount - 1;
      if (newCount <= 0) {
        // Eliminar alianza si no quedan miembros
        await tx.alliance.delete({ where: { id } });
      } else {
        await tx.alliance.update({
          where: { id },
          data: { memberCount: { decrement: 1 } },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Has abandonado la alianza',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
