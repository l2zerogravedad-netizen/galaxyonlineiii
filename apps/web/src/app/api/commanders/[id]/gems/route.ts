import { NextResponse } from 'next/server';
import { verifyAuth, handleApiError } from '@/lib/api-auth';
import {
  getGo2Gems,
  setGo2Gems,
  type Go2GemSlot,
  type Go2GemData,
  GO2_GEM_SLOT_STATS,
  GO2_GEM_BONUS_PER_SLOT,
} from '../../_lib/commander-state';

// ============================================================
// GET /api/commanders/[id]/gems — Listar gemas equipadas (GO2)
// Returns 4 slots: red, blue, green, diamond + stat bonuses
// ============================================================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = verifyAuth(request);
    const { id: commanderId } = await params;

    const gemState = await getGo2Gems(user.empireId, commanderId);

    // Calculate stat bonuses
    const bonuses: Record<string, number> = {
      accuracy: 0,
      speed: 0,
      dodge: 0,
      electron: 0,
    };

    for (const [slot, gem] of Object.entries(gemState.slots)) {
      if (gem) {
        const stat = GO2_GEM_SLOT_STATS[slot as Go2GemSlot];
        if (stat) {
          bonuses[stat] += GO2_GEM_BONUS_PER_SLOT;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        commanderId,
        gems: gemState.slots,
        bonuses,
        totalBonus: Object.values(bonuses).reduce((a, b) => a + b, 0),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================================
// POST /api/commanders/[id]/gems — Equipar gema
// Body: { slot: 'red' | 'blue' | 'green' | 'diamond', gemId: string }
// ============================================================
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = verifyAuth(request);
    const { id: commanderId } = await params;
    const body = (await request.json()) as {
      slot: Go2GemSlot;
      gemId: string;
    };

    // Validate slot
    const validSlots: Go2GemSlot[] = ['red', 'blue', 'green', 'diamond'];
    if (!body.slot || !validSlots.includes(body.slot)) {
      return NextResponse.json(
        {
          success: false,
          error: `Slot inválido. Valores válidos: ${validSlots.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate gemId
    if (!body.gemId || typeof body.gemId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'gemId es requerido y debe ser un string' },
        { status: 400 }
      );
    }

    const current = await getGo2Gems(user.empireId, commanderId);

    // Equip gem in the specified slot
    const updatedSlots = { ...current.slots };
    updatedSlots[body.slot] = { gemId: body.gemId, slot: body.slot };

    await setGo2Gems(user.empireId, commanderId, { slots: updatedSlots });

    // Calculate updated bonuses
    const bonuses: Record<string, number> = {
      accuracy: 0,
      speed: 0,
      dodge: 0,
      electron: 0,
    };
    for (const [slot, gem] of Object.entries(updatedSlots)) {
      if (gem) {
        const stat = GO2_GEM_SLOT_STATS[slot as Go2GemSlot];
        if (stat) bonuses[stat] += GO2_GEM_BONUS_PER_SLOT;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        commanderId,
        gems: updatedSlots,
        equipped: { slot: body.slot, gemId: body.gemId },
        bonuses,
        message: `Gema equipada en slot ${body.slot} (+10 ${GO2_GEM_SLOT_STATS[body.slot]})`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================================
// DELETE /api/commanders/[id]/gems — Desequipar gema
// Body: { slot: 'red' | 'blue' | 'green' | 'diamond' }
// ============================================================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = verifyAuth(request);
    const { id: commanderId } = await params;
    const body = (await request.json()) as { slot: Go2GemSlot };

    // Validate slot
    const validSlots: Go2GemSlot[] = ['red', 'blue', 'green', 'diamond'];
    if (!body.slot || !validSlots.includes(body.slot)) {
      return NextResponse.json(
        {
          success: false,
          error: `Slot inválido. Valores válidos: ${validSlots.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const current = await getGo2Gems(user.empireId, commanderId);

    // Check if slot has a gem equipped
    if (!current.slots[body.slot]) {
      return NextResponse.json(
        {
          success: false,
          error: `No hay gema equipada en el slot ${body.slot}`,
        },
        { status: 404 }
      );
    }

    const removedGem = current.slots[body.slot];

    // Unequip gem from the specified slot
    const updatedSlots = { ...current.slots };
    updatedSlots[body.slot] = null;

    await setGo2Gems(user.empireId, commanderId, { slots: updatedSlots });

    // Calculate updated bonuses
    const bonuses: Record<string, number> = {
      accuracy: 0,
      speed: 0,
      dodge: 0,
      electron: 0,
    };
    for (const [slot, gem] of Object.entries(updatedSlots)) {
      if (gem) {
        const stat = GO2_GEM_SLOT_STATS[slot as Go2GemSlot];
        if (stat) bonuses[stat] += GO2_GEM_BONUS_PER_SLOT;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        commanderId,
        gems: updatedSlots,
        removed: removedGem,
        bonuses,
        message: `Gema desequipada del slot ${body.slot}`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
