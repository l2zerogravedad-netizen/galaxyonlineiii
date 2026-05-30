import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, handleApiError } from '@/lib/api-auth';

/**
 * GET /api/inventory — the empire's owned items, derived from real game state:
 *  - resources (METAL / GAS / HE3 / CREDITS) as resource items
 *  - ships (by blueprint) as ship items
 *  - blueprints the empire has built at least once, as blueprint items
 *
 * GO2 has a unified inventory/vault screen; there is no dedicated item table yet, so we
 * synthesize the inventory from the existing models. Read-only.
 */
export async function GET(request: Request) {
  try {
    const user = verifyAuth(request);

    const [resources, ships] = await Promise.all([
      prisma.resource.findMany({ where: { empireId: user.empireId } }),
      prisma.ship.findMany({
        where: { empireId: user.empireId },
        include: { blueprint: true },
      }),
    ]);

    const resourceMeta: Record<string, { name: string; icon: string; rarity: string }> = {
      METAL: { name: 'Metal', icon: 'metal', rarity: 'common' },
      GAS: { name: 'Plasma', icon: 'plasma', rarity: 'uncommon' },
      PLASMA: { name: 'Plasma', icon: 'plasma', rarity: 'uncommon' },
      HE3: { name: 'He3', icon: 'plasma', rarity: 'rare' },
      CREDITS: { name: 'Créditos', icon: 'credits', rarity: 'rare' },
    };

    const items: {
      id: string;
      name: string;
      category: 'resource' | 'ship' | 'blueprint';
      qty: number;
      icon: string;
      rarity: string;
      description: string;
    }[] = [];

    for (const r of resources) {
      const meta = resourceMeta[r.type] ?? { name: r.type, icon: 'metal', rarity: 'common' };
      items.push({
        id: `res-${r.type}`,
        name: meta.name,
        category: 'resource',
        qty: Math.floor(r.amount),
        icon: meta.icon,
        rarity: meta.rarity,
        description: `Recurso ${meta.name}. Capacidad ${Math.floor(r.capacity).toLocaleString('es-ES')}.`,
      });
    }

    // Aggregate ships by blueprint
    const shipAgg = new Map<string, { name: string; qty: number }>();
    for (const s of ships) {
      const cur = shipAgg.get(s.blueprintId) ?? { name: s.blueprint.name, qty: 0 };
      cur.qty += s.quantity;
      shipAgg.set(s.blueprintId, cur);
    }
    for (const [bpId, agg] of shipAgg) {
      if (agg.qty <= 0) continue;
      items.push({
        id: `ship-${bpId}`,
        name: agg.name,
        category: 'ship',
        qty: agg.qty,
        icon: 'ship',
        rarity: 'uncommon',
        description: `Nave ${agg.name} disponible en el hangar.`,
      });
    }

    // Distinct blueprints the empire owns ships of (acts as owned designs)
    const ownedBlueprints = new Set(ships.map((s) => s.blueprintId));
    for (const bpId of ownedBlueprints) {
      const bp = ships.find((s) => s.blueprintId === bpId)?.blueprint;
      if (!bp) continue;
      items.push({
        id: `bp-${bpId}`,
        name: `Plano: ${bp.name}`,
        category: 'blueprint',
        qty: 1,
        icon: 'ship',
        rarity: 'legendary',
        description: bp.description ?? 'Plano de nave.',
      });
    }

    return NextResponse.json({ success: true, data: { items } });
  } catch (error) {
    return handleApiError(error);
  }
}
