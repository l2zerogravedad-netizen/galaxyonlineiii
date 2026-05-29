import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Tx } from "@/lib/prisma";
import { verifyAuth, handleApiError } from '@/lib/api-auth';

// ============================================================
// GET /api/shipyard/queue — Ver cola de construcción activa
// ============================================================
export async function GET(request: Request) {
  try {
    const user = verifyAuth(request);

    const now = new Date();

    // Obtener todas las construcciones del imperio
    const constructions = await prisma.shipConstruction.findMany({
      where: {
        empireId: user.empireId,
      },
      include: {
        blueprint: true,
      },
      orderBy: {
        startedAt: 'asc',
      },
    });

    // Separar en activas, completadas y building
    const active = constructions.filter((c) => c.status === 'BUILDING');
    const completed = constructions.filter(
      (c) => c.status === 'COMPLETED' || (c.endsAt && new Date(c.endsAt) <= now)
    );

    // Formatear respuesta
    const formatConstruction = (c: (typeof constructions)[0]) => {
      const end = c.endsAt ? new Date(c.endsAt).getTime() : 0;
      const start = c.startedAt ? new Date(c.startedAt).getTime() : 0;
      const nowMs = now.getTime();
      const totalTime = end - start;
      const elapsed = nowMs - start;
      const progress =
        totalTime > 0 ? Math.min(100, Math.max(0, (elapsed / totalTime) * 100)) : 0;
      const remainingSeconds = Math.max(0, Math.floor((end - nowMs) / 1000));

      return {
        id: c.id,
        blueprintId: c.blueprintId,
        blueprintName: c.blueprint.name,
        blueprintKey: c.blueprint.key,
        quantity: c.quantity,
        status: c.status,
        startedAt: c.startedAt?.toISOString() ?? null,
        endsAt: c.endsAt?.toISOString() ?? null,
        completedAt: c.completedAt?.toISOString() ?? null,
        progress: Math.round(progress * 100) / 100,
        remainingSeconds,
        remainingMinutes: Math.ceil(remainingSeconds / 60),
      };
    };

    // Auto-completar construcciones que ya pasaron su tiempo
    for (const c of constructions) {
      if (c.status === 'BUILDING' && c.endsAt && new Date(c.endsAt) <= now) {
        // Completar: añadir naves al inventario
        await prisma.$transaction(async (tx: Tx) => {
          // Buscar si ya existe un Ship para este blueprint
          const existingShip = await tx.ship.findFirst({
            where: {
              empireId: user.empireId,
              blueprintId: c.blueprintId,
              status: 'AVAILABLE',
            },
          });

          if (existingShip) {
            await tx.ship.update({
              where: { id: existingShip.id },
              data: { quantity: { increment: c.quantity } },
            });
          } else {
            await tx.ship.create({
              data: {
                empireId: user.empireId,
                blueprintId: c.blueprintId,
                quantity: c.quantity,
                status: 'AVAILABLE',
              },
            });
          }

          // Marcar construcción como completada
          await tx.shipConstruction.update({
            where: { id: c.id },
            data: {
              status: 'COMPLETED',
              completedAt: now,
            },
          });
        });
      }
    }

    // Refetch después de completar
    const updatedConstructions = await prisma.shipConstruction.findMany({
      where: { empireId: user.empireId },
      include: { blueprint: true },
      orderBy: { startedAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        active: updatedConstructions
          .filter((c) => c.status === 'BUILDING')
          .map(formatConstruction),
        completed: updatedConstructions
          .filter((c) => c.status === 'COMPLETED')
          .map(formatConstruction),
        total: updatedConstructions.length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
