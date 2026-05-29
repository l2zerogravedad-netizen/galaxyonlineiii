import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, username } = body;

    if (!email || !password || !username) {
      return NextResponse.json({ success: false, error: 'Datos incompletos' }, { status: 400 });
    }

    // Verificar si usuario ya existe
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Usuario ya existe' }, { status: 409 });
    }

    // Crear usuario con Empire + Planeta + Recursos + Edificios
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Usuario
      const user = await tx.user.create({
        data: { email, passwordHash, username },
      });

      // 2. Empire
      const empire = await tx.empire.create({
        data: { userId: user.id, name: `Imperio de ${username}`, level: 1, experience: 0 },
      });

      // 3. Recursos iniciales (10,000 como dice MVP)
      await tx.resource.createMany({
        data: [
          { empireId: empire.id, type: 'METAL', amount: 10000, capacity: 50000, productionPerHour: 100 },
          { empireId: empire.id, type: 'PLASMA', amount: 10000, capacity: 50000, productionPerHour: 80 },
          { empireId: empire.id, type: 'CREDITS', amount: 10000, capacity: 50000, productionPerHour: 60 },
        ],
      });

      // 4. Planeta inicial
      const planet = await tx.planet.create({
        data: {
          empireId: empire.id,
          name: 'Planeta Principal',
          type: 'HABITABLE',
          galaxyX: 0,
          galaxyY: 0,
          maxBuildingSlots: 80,
        },
      });

      // 5. Edificios iniciales
      await tx.building.createMany({
        data: [
          { planetId: planet.id, type: 'COMMAND_CENTER', level: 1, slotIndex: 40, status: 'IDLE' },
          { planetId: planet.id, type: 'METAL_MINE', level: 1, slotIndex: 10, status: 'IDLE' },
          { planetId: planet.id, type: 'PLASMA_EXTRACTOR', level: 1, slotIndex: 11, status: 'IDLE' },
          { planetId: planet.id, type: 'CREDIT_MINT', level: 1, slotIndex: 12, status: 'IDLE' },
          { planetId: planet.id, type: 'SHIPYARD', level: 1, slotIndex: 30, status: 'IDLE' },
          { planetId: planet.id, type: 'RESEARCH_LAB', level: 1, slotIndex: 31, status: 'IDLE' },
        ],
      });

      // 6. Blueprints básicos
      const blueprints = [
        { name: 'Frigate MK-I', key: 'frigate-mk1', type: 'COMBAT', attack: 30, hp: 80, defense: 15, speed: 100, costMetal: 100, costPlasma: 50, costCredits: 0, buildTime: 60 },
        { name: 'Cruiser MK-I', key: 'cruiser-mk1', type: 'COMBAT', attack: 60, hp: 150, defense: 40, speed: 70, costMetal: 300, costPlasma: 150, costCredits: 50, buildTime: 120 },
        { name: 'Battleship MK-I', key: 'battleship-mk1', type: 'COMBAT', attack: 100, hp: 250, defense: 70, speed: 40, costMetal: 800, costPlasma: 400, costCredits: 200, buildTime: 300 },
      ];
      for (const bp of blueprints) {
        await tx.blueprint.upsert({ where: { key: bp.key }, update: {}, create: bp });
      }

      // 7. Misiones iniciales
      const missions = [
        { name: 'Tutorial: Primeros Pasos', description: 'Construye tu primer edificio.', difficulty: 1, durationSeconds: 60, minShipsRequired: 0, recommendedPower: 0, enemyFleetConfig: '{}', rewardMetal: 500, rewardPlasma: 200, rewardXp: 100, rewardCredits: 100 },
        { name: 'Patrulla de Seguridad', description: 'Envia una flota a patrullar el sector.', difficulty: 1, durationSeconds: 180, minShipsRequired: 1, recommendedPower: 100, enemyFleetConfig: '{"frigate": 2}', rewardMetal: 800, rewardPlasma: 400, rewardXp: 200, rewardCredits: 150 },
        { name: 'Investigacion Anomala', description: 'Investiga una senal anomala.', difficulty: 2, durationSeconds: 300, minShipsRequired: 2, recommendedPower: 300, enemyFleetConfig: '{"frigate": 5, "cruiser": 1}', rewardMetal: 1500, rewardPlasma: 800, rewardXp: 500, rewardCredits: 400 },
        { name: 'Defensa del Sector', description: 'Defiende el sector de una incursion.', difficulty: 3, durationSeconds: 600, minShipsRequired: 3, recommendedPower: 800, enemyFleetConfig: '{"cruiser": 3, "battleship": 1}', rewardMetal: 3000, rewardPlasma: 1500, rewardXp: 1000, rewardCredits: 800 },
      ];
      for (const m of missions) {
        await tx.mission.create({ data: m });
      }

      // 8. Naves iniciales
      const frigateBp = await tx.blueprint.findUnique({ where: { key: 'frigate-mk1' } });
      if (frigateBp) {
        await tx.ship.create({
          data: { empireId: empire.id, blueprintId: frigateBp.id, quantity: 10, status: 'AVAILABLE' },
        });
      }

      return { user, empire, planet };
    });

    // Generar token JWT
    const token = jwt.sign(
      { userId: result.user.id, empireId: result.empire.id, email, username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: { id: result.user.id, email, username },
        empire: { id: result.empire.id, name: result.empire.name },
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ success: false, error: 'Error al registrar' }, { status: 500 });
  }
}
