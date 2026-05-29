import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, handleApiError } from '@/lib/api-auth';

// GET: Listar alianzas con opcion de busqueda
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const alliances = await prisma.alliance.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { tag: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      select: {
        id: true,
        name: true,
        tag: true,
        description: true,
        leaderId: true,
        memberCount: true,
        maxMembers: true,
        createdAt: true,
      },
      orderBy: { memberCount: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, data: alliances });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST: Crear alianza
export async function POST(request: Request) {
  try {
    const user = verifyAuth(request);
    const body = await request.json();
    const { name, tag, description } = body as {
      name: string;
      tag: string;
      description?: string;
    };

    // Validar nombre
    if (!name || name.length < 3 || name.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Nombre invalido (3-50 caracteres)' },
        { status: 400 }
      );
    }

    // Validar tag
    if (!tag || tag.length < 2 || tag.length > 5) {
      return NextResponse.json(
        { success: false, error: 'Tag invalido (2-5 caracteres)' },
        { status: 400 }
      );
    }

    // Verificar que el usuario no pertenece ya a una alianza
    const existing = await prisma.allianceMember.findFirst({
      where: { empireId: user.empireId },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Ya perteneces a una alianza' },
        { status: 409 }
      );
    }

    // Crear alianza + miembro lider en transaccion atomica
    const alliance = await prisma.$transaction(async (tx) => {
      const a = await tx.alliance.create({
        data: {
          name,
          tag: tag.toUpperCase(),
          description: description || '',
          leaderId: user.empireId,
          memberCount: 1,
          maxMembers: 50,
        },
      });

      await tx.allianceMember.create({
        data: {
          allianceId: a.id,
          empireId: user.empireId,
          role: 'LEADER',
        },
      });

      return a;
    });

    return NextResponse.json({ success: true, data: alliance }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
