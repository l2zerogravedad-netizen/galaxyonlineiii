import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Tx } from "@/lib/prisma";
import { verifyAuth, handleApiError, ApiError } from '@/lib/api-auth';

// ============================================================
// POST /api/shipyard/build — Iniciar construcción de naves
// Body: { blueprintId: string, quantity: number }
// ============================================================
export async function POST(request: Request) {
  try {
    const user = verifyAuth(request);
    const body = (await request.json()) as {
      blueprintId: string;
      quantity: number;
    };

    // ── Validaciones ──
    if (!body.blueprintId || typeof body.blueprintId !== 'string') {
      throw new ApiError(400, 'blueprintId es requerido');
    }
    const quantity = Math.max(1, Math.min(100, Math.floor(body.quantity ?? 1)));

    // ── Obtener blueprint ──
    const blueprint = await prisma.blueprint.findUnique({
      where: { id: body.blueprintId },
    });
    if (!blueprint) {
      throw new ApiError(404, 'Blueprint no encontrado');
    }

    // ── Obtener imperio con recursos ──
    const empire = await prisma.empire.findUnique({
      where: { id: user.empireId },
      include: {
        resources: true,
        planets: { include: { buildings: true } },
        technologies: { include: { technology: true } },
        shipConstructions: {
          where: { status: 'BUILDING' },
        },
      },
    });
    if (!empire) {
      throw new ApiError(404, 'Imperio no encontrado');
    }

    // ── Verificar shipyard ──
    const hasShipyard = empire.planets.some((planet) =>
      planet.buildings.some(
        (b) =>
          b.type === 'SHIPYARD' ||
          b.type === 'shipyard'
      )
    );
    if (blueprint.requiredBuildingType && !hasShipyard) {
      throw new ApiError(400, 'Se requiere un Shipyard para construir esta nave');
    }

    // ── Verificar tecnología requerida ──
    if (blueprint.requiredTechId) {
      const hasTech = empire.technologies.some(
        (t) => t.technologyId === blueprint.requiredTechId && t.level > 0
      );
      if (!hasTech) {
        throw new ApiError(400, 'Tecnología requerida no investigada');
      }
    }

    // ── Verificar cola de construcción ──
    if (empire.shipConstructions.length > 0) {
      throw new ApiError(
        409,
        'Ya hay una construcción en progreso. Espera a que termine.'
      );
    }

    // ── Calcular costos totales ──
    const isDevCheapCosts = process.env.DEV_CHEAP_COSTS === 'true';
    const costMultiplier = isDevCheapCosts ? 0.01 : 1;

    const totalCostMetal = Math.max(
      1,
      Math.floor(blueprint.costMetal * quantity * costMultiplier)
    );
    const totalCostPlasma = Math.max(
      1,
      Math.floor(blueprint.costPlasma * quantity * costMultiplier)
    );
    const totalCostCredits = Math.max(
      1,
      Math.floor(blueprint.costCredits * quantity * costMultiplier)
    );

    // ── Aplicar reducción de tiempo por tecnología ──
    let effectiveBuildTime = blueprint.buildTime;
    const automationTech = empire.technologies.find(
      (t) => t.technology.key === 'INDUSTRIAL_AUTOMATION'
    );
    if (automationTech && automationTech.level > 0) {
      const reduction = automationTech.level * 0.1; // 10% por nivel
      effectiveBuildTime = Math.floor(effectiveBuildTime * (1 - reduction));
    }

    const timeMultiplier = process.env.DEV_FAST_TIMERS === 'true' ? 0.1 : 1;
    const totalBuildTime = Math.floor(
      effectiveBuildTime * quantity * timeMultiplier
    );

    // ── Verificar recursos suficientes ──
    const metal = empire.resources.find((r) => r.type === 'METAL');
    const plasma = empire.resources.find((r) => r.type === 'GAS');
    const credits = empire.resources.find((r) => r.type === 'CREDITS');

    if (!metal || metal.amount < totalCostMetal) {
      throw new ApiError(
        400,
        `Metal insuficiente. Necesitas ${totalCostMetal}, tienes ${metal?.amount ?? 0}`
      );
    }
    if (!plasma || plasma.amount < totalCostPlasma) {
      throw new ApiError(
        400,
        `Gas insuficiente. Necesitas ${totalCostPlasma}, tienes ${plasma?.amount ?? 0}`
      );
    }
    if (!credits || credits.amount < totalCostCredits) {
      throw new ApiError(
        400,
        `Créditos insuficientes. Necesitas ${totalCostCredits}, tienes ${credits?.amount ?? 0}`
      );
    }

    // ── Ejecutar: descontar recursos y crear cola ──
    const now = new Date();
    const endsAt = new Date(now.getTime() + totalBuildTime * 1000);

    const result = await prisma.$transaction(async (tx: Tx) => {
      // Descontar recursos
      await tx.resource.update({
        where: { id: metal.id },
        data: { amount: { decrement: totalCostMetal } },
      });
      await tx.resource.update({
        where: { id: plasma.id },
        data: { amount: { decrement: totalCostPlasma } },
      });
      await tx.resource.update({
        where: { id: credits.id },
        data: { amount: { decrement: totalCostCredits } },
      });

      // Crear entrada en cola de construcción
      const construction = await tx.shipConstruction.create({
        data: {
          empireId: user.empireId,
          blueprintId: blueprint.id,
          quantity,
          status: 'BUILDING',
          startedAt: now,
          endsAt,
        },
      });

      return construction;
    });

    return NextResponse.json({
      success: true,
      data: {
        constructionId: result.id,
        blueprintId: blueprint.id,
        blueprintName: blueprint.name,
        quantity,
        costs: {
          metal: totalCostMetal,
          plasma: totalCostPlasma,
          credits: totalCostCredits,
        },
        buildTimeSeconds: totalBuildTime,
        buildTimeMinutes: Math.ceil(totalBuildTime / 60),
        startedAt: now.toISOString(),
        endsAt: endsAt.toISOString(),
        message: `Construcción iniciada: ${quantity} ${blueprint.name}(s)`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
