import { NextResponse } from 'next/server';
import { verifyAuth, handleApiError } from '@/lib/api-auth';
import {
  getGems,
  setGems,
  type GemData,
  type GemsPayload,
} from '../../_lib/commander-state';

// ============================================================
// GET /api/commanders/[id]/gems — Gemas equipadas del comandante
// ============================================================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = verifyAuth(request);
    const { id: commanderId } = await params;

    const gems = await getGems(user.empireId, commanderId);

    return NextResponse.json({
      success: true,
      data: {
        commanderId,
        gems,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================================
// POST /api/commanders/[id]/gems — Equipar / desequipar gema
// Body: { action: 'equip', slotIndex: 0|1|2, gem: GemData }
//       { action: 'unequip', slotIndex: 0|1|2 }
//       { action: 'replace', slots: (GemData|null)[] }
// ============================================================
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = verifyAuth(request);
    const { id: commanderId } = await params;
    const body = (await request.json()) as {
      action: 'equip' | 'unequip' | 'replace';
      slotIndex?: number;
      gem?: GemData;
      slots?: (GemData | null)[];
    };

    const current = await getGems(user.empireId, commanderId);
    let updated: GemsPayload;

    switch (body.action) {
      case 'equip': {
        if (
          body.slotIndex === undefined ||
          body.slotIndex < 0 ||
          body.slotIndex > 2
        ) {
          return NextResponse.json(
            { success: false, error: 'slotIndex debe ser 0, 1 o 2' },
            { status: 400 }
          );
        }
        if (!body.gem) {
          return NextResponse.json(
            { success: false, error: 'gem es requerida para equipar' },
            { status: 400 }
          );
        }
        // Validar tipo de gema
        const validTypes = ['red', 'blue', 'green', 'yellow', 'purple'];
        if (!validTypes.includes(body.gem.type)) {
          return NextResponse.json(
            {
              success: false,
              error: `Tipo de gema inválido. Valores: ${validTypes.join(', ')}`,
            },
            { status: 400 }
          );
        }
        // Validar nivel
        if (body.gem.level < 1 || body.gem.level > 10) {
          return NextResponse.json(
            { success: false, error: 'Nivel de gema debe ser 1-10' },
            { status: 400 }
          );
        }
        // Validar calidad
        const validQualities = ['normal', 'refined', 'perfect'];
        if (!validQualities.includes(body.gem.quality)) {
          return NextResponse.json(
            {
              success: false,
              error: `Calidad inválida. Valores: ${validQualities.join(', ')}`,
            },
            { status: 400 }
          );
        }

        const newSlots = [...current.slots];
        newSlots[body.slotIndex] = body.gem;
        updated = { slots: newSlots };
        break;
      }

      case 'unequip': {
        if (
          body.slotIndex === undefined ||
          body.slotIndex < 0 ||
          body.slotIndex > 2
        ) {
          return NextResponse.json(
            { success: false, error: 'slotIndex debe ser 0, 1 o 2' },
            { status: 400 }
          );
        }
        const newSlots = [...current.slots];
        newSlots[body.slotIndex] = null;
        updated = { slots: newSlots };
        break;
      }

      case 'replace': {
        if (!body.slots || !Array.isArray(body.slots)) {
          return NextResponse.json(
            { success: false, error: 'slots array requerido' },
            { status: 400 }
          );
        }
        // Normalizar a exactamente 3 slots
        const normalized = body.slots.slice(0, 3);
        while (normalized.length < 3) normalized.push(null);
        updated = { slots: normalized };
        break;
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Acción inválida. Usa: equip, unequip, replace',
          },
          { status: 400 }
        );
    }

    await setGems(user.empireId, commanderId, updated);

    return NextResponse.json({
      success: true,
      data: {
        commanderId,
        gems: updated,
        action: body.action,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
