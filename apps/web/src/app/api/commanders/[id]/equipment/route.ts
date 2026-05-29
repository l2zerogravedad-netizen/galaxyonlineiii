import { NextResponse } from 'next/server';
import { verifyAuth, handleApiError } from '@/lib/api-auth';
import {
  getEquipment,
  setEquipment,
  type EquipmentItemData,
  type EquipmentPayload,
} from '../../_lib/commander-state';

// ============================================================
// GET /api/commanders/[id]/equipment — Equipamiento del comandante
// ============================================================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = verifyAuth(request);
    const { id: commanderId } = await params;

    const equipment = await getEquipment(user.empireId, commanderId);

    // Calcular bonus totales
    const bonuses = calculateBonuses(equipment);

    return NextResponse.json({
      success: true,
      data: {
        commanderId,
        equipment,
        bonuses,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================================
// POST /api/commanders/[id]/equipment — Equipar / desequipar item
// Body: { action: 'equip', slotType: 'weapon'|'defense', slotIndex: 0-3, item: EquipmentItemData }
//       { action: 'unequip', slotType: 'weapon'|'defense', slotIndex: 0-3 }
//       { action: 'replace', equipment: EquipmentPayload }
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
      slotType?: 'weapon' | 'defense';
      slotIndex?: number;
      item?: EquipmentItemData;
      equipment?: EquipmentPayload;
    };

    const current = await getEquipment(user.empireId, commanderId);
    let updated: EquipmentPayload;

    switch (body.action) {
      case 'equip': {
        if (!body.slotType || !['weapon', 'defense'].includes(body.slotType)) {
          return NextResponse.json(
            { success: false, error: 'slotType debe ser weapon o defense' },
            { status: 400 }
          );
        }
        if (
          body.slotIndex === undefined ||
          body.slotIndex < 0 ||
          body.slotIndex > 3
        ) {
          return NextResponse.json(
            { success: false, error: 'slotIndex debe ser 0-3' },
            { status: 400 }
          );
        }
        if (!body.item) {
          return NextResponse.json(
            { success: false, error: 'item es requerido para equipar' },
            { status: 400 }
          );
        }
        // Validar calidad
        const validQualities = ['S', 'A', 'B', 'C', 'D'];
        if (!validQualities.includes(body.item.quality)) {
          return NextResponse.json(
            {
              success: false,
              error: `Calidad inválida. Valores: ${validQualities.join(', ')}`,
            },
            { status: 400 }
          );
        }

        updated = {
          weapons: [...current.weapons],
          defense: [...current.defense],
        };
        if (body.slotType === 'weapon') {
          updated.weapons[body.slotIndex] = body.item;
        } else {
          updated.defense[body.slotIndex] = body.item;
        }
        break;
      }

      case 'unequip': {
        if (!body.slotType || !['weapon', 'defense'].includes(body.slotType)) {
          return NextResponse.json(
            { success: false, error: 'slotType debe ser weapon o defense' },
            { status: 400 }
          );
        }
        if (
          body.slotIndex === undefined ||
          body.slotIndex < 0 ||
          body.slotIndex > 3
        ) {
          return NextResponse.json(
            { success: false, error: 'slotIndex debe ser 0-3' },
            { status: 400 }
          );
        }

        updated = {
          weapons: [...current.weapons],
          defense: [...current.defense],
        };
        if (body.slotType === 'weapon') {
          updated.weapons[body.slotIndex] = null;
        } else {
          updated.defense[body.slotIndex] = null;
        }
        break;
      }

      case 'replace': {
        if (!body.equipment) {
          return NextResponse.json(
            { success: false, error: 'equipment payload requerido' },
            { status: 400 }
          );
        }
        const weapons = (body.equipment.weapons ?? []).slice(0, 4);
        const defense = (body.equipment.defense ?? []).slice(0, 4);
        while (weapons.length < 4) weapons.push(null);
        while (defense.length < 4) defense.push(null);
        updated = { weapons, defense };
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

    await setEquipment(user.empireId, commanderId, updated);
    const bonuses = calculateBonuses(updated);

    return NextResponse.json({
      success: true,
      data: {
        commanderId,
        equipment: updated,
        bonuses,
        action: body.action,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ---- Bonus calculation (mirrors go2-commander-data.ts) -----

const WEAPON_QUALITY_BONUS: Record<string, number> = {
  S: 25,
  A: 20,
  B: 15,
  C: 10,
  D: 5,
};

const DEFENSE_QUALITY_BONUS: Record<string, number> = {
  S: 20,
  A: 15,
  B: 10,
  C: 7,
  D: 3,
};

function calculateBonuses(equipment: EquipmentPayload) {
  let accuracyBonus = 0;
  let electronBonus = 0;
  let dodgeBonus = 0;
  let speedBonus = 0;

  for (const item of equipment.weapons) {
    if (!item) continue;
    const bonus = WEAPON_QUALITY_BONUS[item.quality] ?? 0;
    accuracyBonus += bonus;
    electronBonus += Math.floor(bonus * 0.5);
  }

  for (const item of equipment.defense) {
    if (!item) continue;
    const bonus = DEFENSE_QUALITY_BONUS[item.quality] ?? 0;
    dodgeBonus += bonus;
    speedBonus += Math.floor(bonus * 0.5);
  }

  return {
    accuracyBonus,
    electronBonus,
    dodgeBonus,
    speedBonus,
  };
}
