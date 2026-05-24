import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // =====================================================
  // TECNOLOGÍAS - Sistema de Investigación Fase 2
  // =====================================================

  // Tier 1: Tecnologías básicas (sin requisitos)
  const techMaterials = await prisma.technology.upsert({
    where: { id: 'tech-materials-engineering' },
    update: {},
    create: {
      id: 'tech-materials-engineering',
      key: 'MATERIALS_ENGINEERING',
      name: 'Ingeniería de Materiales',
      description: 'Mejora la eficiencia en la extracción y procesamiento de minerales.',
      category: 'PRODUCTION',
      baseCostMetal: 200,
      baseCostPlasma: 100,
      baseResearchTime: 300,
      maxLevel: 5,
      effectType: 'METAL_PRODUCTION',
      effectValue: 0.10,
      effectDescription: '+10% producción de metal por nivel',
    },
  });

  const techPlasma = await prisma.technology.upsert({
    where: { id: 'tech-plasma-energy' },
    update: {},
    create: {
      id: 'tech-plasma-energy',
      key: 'PLASMA_ENERGY',
      name: 'Energía de Plasma',
      description: 'Tecnología avanzada para extraer y estabilizar plasma.',
      category: 'PRODUCTION',
      baseCostMetal: 200,
      baseCostPlasma: 100,
      baseResearchTime: 300,
      maxLevel: 5,
      effectType: 'PLASMA_PRODUCTION',
      effectValue: 0.10,
      effectDescription: '+10% producción de plasma por nivel',
    },
  });

  const techLogistics = await prisma.technology.upsert({
    where: { id: 'tech-space-logistics' },
    update: {},
    create: {
      id: 'tech-space-logistics',
      key: 'SPACE_LOGISTICS',
      name: 'Logística Espacial',
      description: 'Optimización de rutas y transporte de recursos.',
      category: 'LOGISTICS',
      baseCostMetal: 300,
      baseCostPlasma: 150,
      baseResearchTime: 450,
      maxLevel: 3,
      effectType: 'FLEET_CAPACITY',
      effectValue: 0.15,
      effectDescription: '+15% capacidad de carga por nivel (futuro sistema de flotas)',
    },
  });

  // Tier 2: Requieren Tier 1
  const techAutomation = await prisma.technology.upsert({
    where: { id: 'tech-industrial-automation' },
    update: {},
    create: {
      id: 'tech-industrial-automation',
      key: 'INDUSTRIAL_AUTOMATION',
      name: 'Automatización Industrial',
      description: 'Robots y sistemas automatizados aceleran la construcción.',
      category: 'CONSTRUCTION',
      requiredTechId: techMaterials.id,
      baseCostMetal: 400,
      baseCostPlasma: 200,
      baseResearchTime: 600,
      maxLevel: 3,
      effectType: 'BUILD_TIME_REDUCTION',
      effectValue: 0.10,
      effectDescription: '-10% tiempo de construcción por nivel',
    },
  });

  const techTactical = await prisma.technology.upsert({
    where: { id: 'tech-tactical-computing' },
    update: {},
    create: {
      id: 'tech-tactical-computing',
      key: 'TACTICAL_COMPUTING',
      name: 'Computación Táctica',
      description: 'Procesamiento avanzado para coordinación de flotas.',
      category: 'MILITARY',
      requiredTechId: techLogistics.id,
      baseCostMetal: 350,
      baseCostPlasma: 250,
      baseResearchTime: 550,
      maxLevel: 3,
      effectType: 'COMMAND_CAPACITY',
      effectValue: 1,
      effectDescription: '+1 flota comandable por nivel (futuro sistema)',
    },
  });

  // Tier 3: Militar y Defensa
  const techArmor = await prisma.technology.upsert({
    where: { id: 'tech-light-armor' },
    update: {},
    create: {
      id: 'tech-light-armor',
      key: 'LIGHT_ARMOR',
      name: 'Blindaje Ligero',
      description: 'Aleaciones resistentes para protección de naves.',
      category: 'MILITARY',
      requiredTechId: techMaterials.id,
      baseCostMetal: 500,
      baseCostPlasma: 200,
      baseResearchTime: 700,
      maxLevel: 5,
      effectType: 'SHIP_HP',
      effectValue: 0.08,
      effectDescription: '+8% HP de naves por nivel (futuro sistema de combate)',
    },
  });

  const techLaser = await prisma.technology.upsert({
    where: { id: 'tech-laser-weapons' },
    update: {},
    create: {
      id: 'tech-laser-weapons',
      key: 'LASER_WEAPONS',
      name: 'Armamento Láser',
      description: 'Sistemas de armas de energía para naves de combate.',
      category: 'MILITARY',
      requiredTechId: techPlasma.id,
      baseCostMetal: 450,
      baseCostPlasma: 350,
      baseResearchTime: 750,
      maxLevel: 5,
      effectType: 'SHIP_ATTACK',
      effectValue: 0.10,
      effectDescription: '+10% ataque de naves por nivel (futuro sistema de combate)',
    },
  });

  // Tier 4: Propulsión avanzada (requiere varias techs)
  const techPropulsion = await prisma.technology.upsert({
    where: { id: 'tech-basic-propulsion' },
    update: {},
    create: {
      id: 'tech-basic-propulsion',
      key: 'BASIC_PROPULSION',
      name: 'Propulsión Básica',
      description: 'Motores de impulso para naves espaciales.',
      category: 'PROPULSION',
      requiredTechId: techPlasma.id,
      baseCostMetal: 600,
      baseCostPlasma: 400,
      baseResearchTime: 900,
      maxLevel: 3,
      effectType: 'SHIP_SPEED',
      effectValue: 0.10,
      effectDescription: '+10% velocidad de naves por nivel (futuro sistema de flotas)',
    },
  });

  // =====================================================
  // NAVES (Blueprints) - Sistema Astillero Fase 3
  // =====================================================

  // Nave 1: Explorador - Disponible desde inicio, muy barata y rápida
  const explorer = await prisma.blueprint.upsert({
    where: { id: 'bp-explorer' },
    update: {},
    create: {
      id: 'bp-explorer',
      key: 'EXPLORER',
      name: 'Explorador',
      type: 'LIGHT',
      category: 'CIVIL',
      description: 'Nave ligera diseñada para exploración y reconocimiento. Rápida pero vulnerable.',
      requiredBuildingType: 'SHIPYARD',
      costMetal: 1,
      costPlasma: 1,
      costCredits: 1,
      buildTime: 20,
      attack: 2,
      hp: 20,
      defense: 1,
      speed: 40,
      cargoCapacity: 50,
    },
  });

  // Nave 2: Fragata - Disponible desde inicio, básica de combate
  const frigate = await prisma.blueprint.upsert({
    where: { id: 'bp-frigate' },
    update: {},
    create: {
      id: 'bp-frigate',
      key: 'FRIGATE',
      name: 'Fragata',
      type: 'COMBAT_LIGHT',
      category: 'COMBAT',
      description: 'Nave de combate ligera, versátil y económica. Ideal para flotas de reconocimiento armado.',
      requiredBuildingType: 'SHIPYARD',
      costMetal: 1,
      costPlasma: 1,
      costCredits: 1,
      buildTime: 60,
      attack: 15,
      hp: 80,
      defense: 8,
      speed: 25,
      cargoCapacity: 100,
    },
  });

  // Nave 3: Interceptor - Requiere Propulsión Básica, muy rápido
  const interceptor = await prisma.blueprint.upsert({
    where: { id: 'bp-interceptor' },
    update: {},
    create: {
      id: 'bp-interceptor',
      key: 'INTERCEPTOR',
      name: 'Interceptor',
      type: 'COMBAT_FAST',
      category: 'COMBAT',
      description: 'Nave de asalto ultrarrápida diseñada para perseguir y destruir objetivos prioritarios.',
      requiredTechId: techPropulsion.id,
      requiredBuildingType: 'SHIPYARD',
      costMetal: 1,
      costPlasma: 1,
      costCredits: 1,
      buildTime: 90,
      attack: 20,
      hp: 40,
      defense: 3,
      speed: 50,
      cargoCapacity: 30,
    },
  });

  // Nave 4: Carguero - Requiere Logística Espacial, transporte masivo
  const cargoShip = await prisma.blueprint.upsert({
    where: { id: 'bp-cargo' },
    update: {},
    create: {
      id: 'bp-cargo',
      key: 'CARGO_SHIP',
      name: 'Carguero',
      type: 'TRANSPORT',
      category: 'TRANSPORT',
      description: 'Nave de carga especializada para transportar grandes volúmenes de recursos entre planetas.',
      requiredTechId: techLogistics.id,
      requiredBuildingType: 'SHIPYARD',
      costMetal: 1,
      costPlasma: 1,
      costCredits: 1,
      buildTime: 120,
      attack: 0,
      hp: 150,
      defense: 5,
      speed: 8,
      cargoCapacity: 2000,
    },
  });

  // Nave 5: Crucero - Requiere Armamento Láser, nave media de combate
  const cruiser = await prisma.blueprint.upsert({
    where: { id: 'bp-cruiser' },
    update: {},
    create: {
      id: 'bp-cruiser',
      key: 'CRUISER',
      name: 'Crucero',
      type: 'COMBAT_MEDIUM',
      category: 'COMBAT',
      description: 'Nave de combate equilibrada con buen armamento y defensa. Columna vertebral de la flota.',
      requiredTechId: techLaser.id,
      requiredBuildingType: 'SHIPYARD',
      costMetal: 1,
      costPlasma: 1,
      costCredits: 1,
      buildTime: 180,
      attack: 40,
      hp: 200,
      defense: 20,
      speed: 15,
      cargoCapacity: 300,
    },
  });

  // Nave 6: Acorazado - Requiere Blindaje Ligero, nave pesada de combate
  const battleship = await prisma.blueprint.upsert({
    where: { id: 'bp-battleship' },
    update: {},
    create: {
      id: 'bp-battleship',
      key: 'BATTLESHIP',
      name: 'Acorazado',
      type: 'COMBAT_HEAVY',
      category: 'COMBAT',
      description: 'Nave de guerra pesada con blindaje masivo y armamento devastador. Lenta pero imparable.',
      requiredTechId: techArmor.id,
      requiredBuildingType: 'SHIPYARD',
      costMetal: 1,
      costPlasma: 1,
      costCredits: 1,
      buildTime: 360,
      attack: 80,
      hp: 500,
      defense: 50,
      speed: 6,
      cargoCapacity: 500,
    },
  });

  // =====================================================
  // MISIONES PvE
  // =====================================================

  await prisma.mission.upsert({
    where: { id: 'mission-1' },
    update: {},
    create: {
      id: 'mission-1',
      name: 'Sector Periférico',
      description: 'Zona segura con poca resistencia. Ideal para entrenamiento.',
      difficulty: 1,
      recommendedPower: 300,
      enemyFleetConfig: JSON.stringify({ frigates: 20 }),
      rewardXp: 100,
      rewardCredits: 50,
    },
  });

  await prisma.mission.upsert({
    where: { id: 'mission-2' },
    update: {},
    create: {
      id: 'mission-2',
      name: 'Cinturón de Asteroides',
      description: 'Naves piratas se ocultan entre los asteroides.',
      difficulty: 2,
      recommendedPower: 600,
      enemyFleetConfig: JSON.stringify({ frigates: 30, cruisers: 10 }),
      rewardXp: 250,
      rewardCredits: 100,
    },
  });

  await prisma.mission.upsert({
    where: { id: 'mission-3' },
    update: {},
    create: {
      id: 'mission-3',
      name: 'Nebulosa Tóxica',
      description: 'Ambiente hostil con enemigos moderados.',
      difficulty: 3,
      recommendedPower: 1000,
      enemyFleetConfig: JSON.stringify({ cruisers: 20, battleships: 5 }),
      rewardXp: 500,
      rewardCredits: 200,
    },
  });

  await prisma.mission.upsert({
    where: { id: 'mission-4' },
    update: {},
    create: {
      id: 'mission-4',
      name: 'Campo de Deriva',
      description: 'Escombros y naves abandonadas hostiles.',
      difficulty: 4,
      recommendedPower: 1500,
      enemyFleetConfig: JSON.stringify({ cruisers: 30, battleships: 15 }),
      rewardXp: 800,
      rewardCredits: 350,
    },
  });

  await prisma.mission.upsert({
    where: { id: 'mission-5' },
    update: {},
    create: {
      id: 'mission-5',
      name: 'Estación Abandonada',
      description: 'Defensas automáticas aún activas. Alto riesgo.',
      difficulty: 5,
      recommendedPower: 2000,
      enemyFleetConfig: JSON.stringify({ battleships: 25, frigates: 50 }),
      rewardXp: 1200,
      rewardCredits: 500,
    },
  });

  console.log('Seeding completed!');
  console.log('Created:');
  console.log(`- ${await prisma.technology.count()} technologies`);
  console.log(`- ${await prisma.blueprint.count()} blueprints`);
  console.log(`- ${await prisma.mission.count()} missions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
