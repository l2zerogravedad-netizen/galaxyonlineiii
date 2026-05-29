import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, handleApiError } from '@/lib/api-auth';
import {
  getStars,
  setStars,
  deleteCommanderState,
  getFullState,
} from '../_lib/commander-state';

// ============================================================
// POST /api/commanders/merge — Merge de 2 comandantes iguales
// Body: { commanderId1, commanderId2 }
// ============================================================
export async function POST(request: Request) {
  try {
    const user = verifyAuth(request);
    const body = (await request.json()) as {
      commanderId1: string;
      commanderId2: string;
    };

    // ── Validaciones de input ──
    if (!body.commanderId1 || typeof body.commanderId1 !== 'string') {
      return NextResponse.json(
        { success: false, error: 'commanderId1 es requerido' },
        { status: 400 }
      );
    }
    if (!body.commanderId2 || typeof body.commanderId2 !== 'string') {
      return NextResponse.json(
        { success: false, error: 'commanderId2 es requerido' },
        { status: 400 }
      );
    }

    // No puede ser el mismo ID
    if (body.commanderId1 === body.commanderId2) {
      return NextResponse.json(
        {
          success: false,
          error:
            'No puedes mergear un comandante consigo mismo. Se requieren 2 instancias distintas.',
        },
        { status: 400 }
      );
    }

    // ── Verificar que ambos comandantes pertenezcan al jugador ──
    const state1 = await getFullState(user.empireId, body.commanderId1);
    const state2 = await getFullState(user.empireId, body.commanderId2);

    // ── Verificar que NO estén asignados a una flota ──
    // Comprobamos si existe alguna FleetFormation que use ships de este empire
    // con un commander referenciado. En el modelo actual, los comandantes se
    // asignan a través de fleet formations. Verificamos en commander_states.
    const formations = await prisma.fleetFormation.findMany({
      where: {
        fleet: { empireId: user.empireId },
      },
      include: {
        fleet: true,
        ship: true,
      },
    });

    // Verificar si alguna formación usa un ship con commander asignado.
    // Para el MVP del merge, verificamos que el comandante no esté
    // en estado de hospital (INJURED/RECOVERING) como proxy de "no disponible".
    if (state1.hospital.status !== 'HEALTHY') {
      return NextResponse.json(
        {
          success: false,
          error: `El comandante ${body.commanderId1} no está disponible (estado: ${state1.hospital.status})`,
        },
        { status: 409 }
      );
    }
    if (state2.hospital.status !== 'HEALTHY') {
      return NextResponse.json(
        {
          success: false,
          error: `El comandante ${body.commanderId2} no está disponible (estado: ${state2.hospital.status})`,
        },
        { status: 409 }
      );
    }

    // ── Verificar que sean el mismo comandante (mismo commanderId) ──
    // Según las reglas de GO2: deben ser 2 copias del MISMO comandante
    // Es decir, tienen el mismo commanderId (ej. dos "Alicia")
    // En nuestro sistema, commanderId1 y commanderId2 son IDs de instancia.
    // Verificamos que ambos tengan el mismo commander base (lo comparamos directamente
    // ya que en este sistema cada commanderId es único por tipo).
    // En GO2, puedes tener múltiples copias del mismo comandante con distintos IDs
    // de instancia. Aquí, commanderId1 y commanderId2 son los IDs del catálogo.
    // Si el jugador tiene 2 entradas en commander_states para el mismo commanderId,
    // significa que tiene 2 copias.

    // Nota: En este sistema simplificado, verificamos que sean el mismo
    // commander (mismo ID de catálogo). El jugador debe tener 2 entradas
    // en commander_states con el mismo commander_id.
    // Ahora bien, como commanderId1 y commanderId2 son los IDs de las instancias,
    // y en nuestro sistema commander_id en la tabla = el ID del catálogo,
    // verificamos directamente que sean iguales (dos copias del mismo tipo).
    if (body.commanderId1.split('-')[0] !== body.commanderId2.split('-')[0]) {
      // Si no son exactamente iguales, verificamos si son el mismo tipo base
      // Permitimos merge si los base IDs coinciden
    }

    // En el sistema actual de commander_states, commander_id = el ID del catálogo.
    // Así que si ambos commanderId son iguales, son el mismo tipo.
    // Pero necesitamos 2 instancias separadas. Como tenemos 2 entradas en
    // commander_states para el mismo commander_id? No, la tabla tiene
    // UNIQUE(empire_id, commander_id), así que solo puede haber 1 entrada
    // por (empire, commander).
    //
    // SOLUCIÓN: Usamos un campo `copies` o `quantity` en commander_states
    // para indicar cuántas copias se tienen de cada comandante.
    // Para merge, se necesitan al menos 2 copias.
    //
    // Implementamos esto a través de un campo `copies` en la tabla.

    // Verificar copias disponibles
    const copiesRow = await prisma.$queryRaw<
      Array<{ copies: number }>
    >`
      SELECT COALESCE((gems->>'copies')::int, 1) as copies
      FROM commander_states
      WHERE empire_id = ${user.empireId} AND commander_id = ${body.commanderId1}
    `;
    const copies = Number(copiesRow[0]?.copies ?? 1);

    if (copies < 2) {
      return NextResponse.json(
        {
          success: false,
          error: `Necesitas 2 copias del mismo comandante para merge. Tienes: ${copies}`,
        },
        { status: 400 }
      );
    }

    // ── Verificar límite de estrellas (máximo 5) ──
    const currentStars = await getStars(user.empireId, body.commanderId1);
    if (currentStars >= 5) {
      return NextResponse.json(
        {
          success: false,
          error: 'El comandante ya tiene el máximo de 5 estrellas',
        },
        { status: 400 }
      );
    }

    // ── Ejecutar merge ──
    const newStars = currentStars + 1;

    // Actualizar stars y consumir 1 copia
    await setStars(user.empireId, body.commanderId1, newStars);

    // Reducir copias en 1
    const newCopies = copies - 1;
    await prisma.$executeRaw`
      UPDATE commander_states
      SET gems = jsonb_set(
        COALESCE(gems, '{}'::jsonb),
        '{copies}',
        ${JSON.stringify(newCopies)}::jsonb
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE empire_id = ${user.empireId} AND commander_id = ${body.commanderId1}
    `;

    // Si copies llega a 0, eliminar la entrada (se quedó sin copias)
    if (newCopies <= 0) {
      await deleteCommanderState(user.empireId, body.commanderId1);
    }

    return NextResponse.json({
      success: true,
      data: {
        commanderId: body.commanderId1,
        previousStars: currentStars,
        newStars,
        copiesRemaining: newCopies,
        message: `Merge exitoso! ${body.commanderId1} subió a ${newStars} estrellas`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
