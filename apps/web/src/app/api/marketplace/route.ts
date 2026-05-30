import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Tx } from '@/lib/prisma';
import { verifyAuth, handleApiError, ApiError } from '@/lib/api-auth';

/**
 * Marketplace — resource exchange against an NPC market (no P2P order book yet, which
 * keeps it self-contained and always liquid). GO2 has a market screen; this gives it a
 * working backend backed by the real Resource model.
 *
 * GET  /api/marketplace            → fixed NPC listings + the player's current resources
 * POST /api/marketplace { action:'buy'|'sell', resource:'METAL'|'GAS'|'HE3', amount }
 *   buy  : spend CREDITS → gain `resource`
 *   sell : spend `resource` → gain CREDITS (at 80% of buy price)
 */

const PRICE_PER_UNIT: Record<string, number> = {
  METAL: 2, // credits per unit
  GAS: 3,
  HE3: 5,
};
const SELL_RATIO = 0.8;

function listings() {
  return Object.entries(PRICE_PER_UNIT).map(([resource, price]) => ({
    resource,
    buyPricePerUnit: price,
    sellPricePerUnit: Math.floor(price * SELL_RATIO),
    name:
      resource === 'METAL' ? 'Metal' : resource === 'GAS' ? 'Plasma' : 'He3',
  }));
}

export async function GET(request: Request) {
  try {
    const user = verifyAuth(request);
    const resources = await prisma.resource.findMany({ where: { empireId: user.empireId } });
    const wallet: Record<string, number> = {};
    for (const r of resources) wallet[r.type] = Math.floor(r.amount);
    return NextResponse.json({
      success: true,
      data: { listings: listings(), wallet },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = verifyAuth(request);
    const body = (await request.json().catch(() => ({}))) as {
      action?: 'buy' | 'sell';
      resource?: string;
      amount?: number;
    };

    const action = body.action;
    const resource = String(body.resource ?? '').toUpperCase();
    const amount = Math.floor(Number(body.amount));

    if (action !== 'buy' && action !== 'sell') throw new ApiError(400, "action debe ser 'buy' o 'sell'");
    if (!PRICE_PER_UNIT[resource]) throw new ApiError(400, 'Recurso no comerciable');
    if (!Number.isFinite(amount) || amount <= 0) throw new ApiError(400, 'amount inválido');

    const rows = await prisma.resource.findMany({ where: { empireId: user.empireId } });
    const credits = rows.find((r) => r.type === 'CREDITS');
    const target = rows.find((r) => r.type === resource);
    if (!credits || !target) throw new ApiError(400, 'Recursos no encontrados');

    const unit = PRICE_PER_UNIT[resource];

    if (action === 'buy') {
      const cost = unit * amount;
      if (credits.amount < cost) throw new ApiError(400, 'Créditos insuficientes');
      const headroom = Math.max(0, target.capacity - target.amount);
      const buyable = Math.min(amount, Math.floor(headroom));
      if (buyable <= 0) throw new ApiError(400, 'Almacén lleno para ese recurso');
      const realCost = unit * buyable;
      await prisma.$transaction(async (tx: Tx) => {
        await tx.resource.update({ where: { id: credits.id }, data: { amount: { decrement: realCost } } });
        await tx.resource.update({ where: { id: target.id }, data: { amount: { increment: buyable } } });
      });
      return NextResponse.json({
        success: true,
        data: { action, resource, amount: buyable, creditsSpent: realCost },
      });
    }

    // sell
    if (target.amount < amount) throw new ApiError(400, `${resource} insuficiente`);
    const gain = Math.floor(unit * SELL_RATIO) * amount;
    await prisma.$transaction(async (tx: Tx) => {
      await tx.resource.update({ where: { id: target.id }, data: { amount: { decrement: amount } } });
      await tx.resource.update({ where: { id: credits.id }, data: { amount: { increment: gain } } });
    });
    return NextResponse.json({
      success: true,
      data: { action, resource, amount, creditsGained: gain },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
