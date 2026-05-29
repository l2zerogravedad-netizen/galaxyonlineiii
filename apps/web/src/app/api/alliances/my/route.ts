import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, handleApiError } from '@/lib/api-auth';

// GET: Obtener la alianza del jugador actual
export async function GET(request: Request) {
  try {
    const user = verifyAuth(request);

    const member = await prisma.allianceMember.findFirst({
      where: { empireId: user.empireId },
      include: {
        alliance: {
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
        },
      },
    });

    if (!member) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: member.alliance });
  } catch (error) {
    return handleApiError(error);
  }
}
