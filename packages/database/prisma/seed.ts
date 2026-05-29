import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// COMMANDER DATA - 101 commanders from go2-commander-data.ts
// Format: 4-stats GO2 (accuracy, speed, dodge, electron)
// ============================================================

interface CommanderSeedData {
  name: string;
  rarity: string;
  skill: string;
  accuracy: number;
  speed: number;
  dodge: number;
  electron: number;
}

const COMMANDERS: CommanderSeedData[] = [
  // --- COMMON (22) ---
  { name: 'Alicia', rarity: 'common', skill: 'Inspiration', accuracy: 9, speed: 3, dodge: 7, electron: 5 },
  { name: 'Angla', rarity: 'common', skill: 'Fleet EMT', accuracy: 4, speed: 4, dodge: 5, electron: 7 },
  { name: 'Donna', rarity: 'common', skill: 'Defensive Intensity', accuracy: 7, speed: 4, dodge: 4, electron: 8 },
  { name: 'Essido', rarity: 'common', skill: 'Ship-based Expertise', accuracy: 8, speed: 5, dodge: 6, electron: 8 },
  { name: 'Heloyce', rarity: 'common', skill: 'Stability', accuracy: 7, speed: 2, dodge: 8, electron: 4 },
  { name: 'Jason', rarity: 'common', skill: 'Save Energy', accuracy: 4, speed: 2, dodge: 5, electron: 5 },
  { name: 'Jerome', rarity: 'common', skill: 'Curse', accuracy: 5, speed: 8, dodge: 2, electron: 5 },
  { name: 'Kelly', rarity: 'common', skill: 'Resourceful', accuracy: 3, speed: 9, dodge: 6, electron: 5 },
  { name: 'Lawrence', rarity: 'common', skill: 'Ballistic Expertise', accuracy: 9, speed: 4, dodge: 6, electron: 8 },
  { name: 'Mantie', rarity: 'common', skill: 'Command Strike', accuracy: 14, speed: 14, dodge: 14, electron: 14 },
  { name: 'Maxius', rarity: 'common', skill: 'Allied Strike', accuracy: 10, speed: 0, dodge: 5, electron: 5 },
  { name: 'Motima', rarity: 'common', skill: 'Accuracy', accuracy: 8, speed: 2, dodge: 6, electron: 6 },
  { name: 'Natiya', rarity: 'common', skill: 'First Strike', accuracy: 8, speed: 8, dodge: 6, electron: 8 },
  { name: 'Panis', rarity: 'common', skill: 'Intercept', accuracy: 5, speed: 5, dodge: 6, electron: 12 },
  { name: 'Rayllf', rarity: 'common', skill: 'Armor Repair', accuracy: 6, speed: 8, dodge: 7, electron: 7 },
  { name: 'Reggie', rarity: 'common', skill: 'Paralyze', accuracy: 5, speed: 3, dodge: 8, electron: 4 },
  { name: 'Shaba', rarity: 'common', skill: 'Allied Evasion', accuracy: 8, speed: 10, dodge: 5, electron: 5 },
  { name: 'Sofia', rarity: 'common', skill: 'Maneuvering', accuracy: 7, speed: 5, dodge: 11, electron: 6 },
  { name: 'Taude', rarity: 'common', skill: 'Lucky Shot', accuracy: 7, speed: 7, dodge: 4, electron: 4 },
  { name: 'Tyren', rarity: 'common', skill: 'Missile Expertise', accuracy: 10, speed: 5, dodge: 7, electron: 5 },
  { name: 'Vinna', rarity: 'common', skill: 'Cunning', accuracy: 6, speed: 6, dodge: 6, electron: 6 },
  { name: 'Wayne', rarity: 'common', skill: 'Lucky Hit', accuracy: 8, speed: 4, dodge: 9, electron: 2 },

  // --- SUPER (20) ---
  { name: 'Andrew', rarity: 'super', skill: 'Acrobatics', accuracy: 5, speed: 10, dodge: 6, electron: 1 },
  { name: 'Anna', rarity: 'super', skill: 'Pierce', accuracy: 9, speed: 8, dodge: 10, electron: 5 },
  { name: 'Annata', rarity: 'super', skill: 'Allied Support', accuracy: 10, speed: 8, dodge: 5, electron: 8 },
  { name: 'Bruce', rarity: 'super', skill: 'Drain Supplies', accuracy: 6, speed: 8, dodge: 8, electron: 12 },
  { name: 'Eveline', rarity: 'super', skill: 'Find Weakness', accuracy: 7, speed: 6, dodge: 9, electron: 5 },
  { name: 'Evi', rarity: 'super', skill: 'Directional Expertise', accuracy: 8, speed: 5, dodge: 9, electron: 5 },
  { name: 'Gastaf', rarity: 'super', skill: 'Deadly Strike', accuracy: 12, speed: 0, dodge: 10, electron: 7 },
  { name: 'Jakar', rarity: 'super', skill: 'Aegis Shatter', accuracy: 9, speed: 3, dodge: 5, electron: 4 },
  { name: 'Joseph', rarity: 'super', skill: 'Vengeance', accuracy: 4, speed: 10, dodge: 7, electron: 17 },
  { name: 'Leo', rarity: 'super', skill: 'Intimidate', accuracy: 5, speed: 9, dodge: 6, electron: 8 },
  { name: 'Linda', rarity: 'super', skill: 'Broadside', accuracy: 10, speed: 9, dodge: 7, electron: 7 },
  { name: 'Lynn', rarity: 'super', skill: 'Victory Rush', accuracy: 8, speed: 5, dodge: 6, electron: 3 },
  { name: 'Nick', rarity: 'super', skill: 'Divine Intervention', accuracy: 5, speed: 4, dodge: 5, electron: 2 },
  { name: 'Penni', rarity: 'super', skill: 'Last Stand', accuracy: 10, speed: 10, dodge: 10, electron: 10 },
  { name: 'Raslin', rarity: 'super', skill: 'Fear', accuracy: 8, speed: 7, dodge: 9, electron: 10 },
  { name: 'Ringel', rarity: 'super', skill: 'Ignite', accuracy: 9, speed: 5, dodge: 9, electron: 3 },
  { name: 'Rocky', rarity: 'super', skill: 'Brutal Strength', accuracy: 12, speed: 4, dodge: 8, electron: 5 },
  { name: 'Sylva', rarity: 'super', skill: 'Smash', accuracy: 7, speed: 5, dodge: 5, electron: 2 },
  { name: 'Sylla', rarity: 'super', skill: 'Fleet Link', accuracy: 5, speed: 9, dodge: 5, electron: 5 },
  { name: 'Todd', rarity: 'super', skill: 'Consecutive Strike', accuracy: 30, speed: 8, dodge: 5, electron: 6 },

  // --- LEGENDARY (24) ---
  { name: 'Aileen', rarity: 'legendary', skill: 'Command Break', accuracy: 8, speed: 8, dodge: 8, electron: 8 },
  { name: 'Bain', rarity: 'legendary', skill: 'Reckoning', accuracy: 14, speed: 12, dodge: 18, electron: 16 },
  { name: 'Bart', rarity: 'legendary', skill: 'Raid', accuracy: 5, speed: 3, dodge: 5, electron: 3 },
  { name: 'Callisto', rarity: 'legendary', skill: 'A Fire Rises', accuracy: 14, speed: 20, dodge: 15, electron: 20 },
  { name: 'Carlos', rarity: 'legendary', skill: 'Fear Fiend', accuracy: 15, speed: 5, dodge: 10, electron: 10 },
  { name: 'Cassius', rarity: 'legendary', skill: 'Knockout Blow', accuracy: 15, speed: 15, dodge: 15, electron: 15 },
  { name: 'Circe', rarity: 'legendary', skill: 'Hex', accuracy: 15, speed: 10, dodge: 12, electron: 22 },
  { name: 'Dilira', rarity: 'legendary', skill: 'Renewal', accuracy: 10, speed: 15, dodge: 10, electron: 12 },
  { name: 'Hellen', rarity: 'legendary', skill: 'Rapid Reload', accuracy: 11, speed: 5, dodge: 7, electron: 16 },
  { name: 'Krina Klaus', rarity: 'legendary', skill: "Winter's Gift", accuracy: 20, speed: 20, dodge: 20, electron: 20 },
  { name: 'Maletiz', rarity: 'legendary', skill: 'Revenge', accuracy: 2, speed: 2, dodge: 2, electron: 2 },
  { name: 'Marcus', rarity: 'legendary', skill: 'Breakthrough', accuracy: 8, speed: 6, dodge: 8, electron: 3 },
  { name: 'Medusa', rarity: 'legendary', skill: 'Gorgon Gaze', accuracy: 20, speed: 14, dodge: 18, electron: 12 },
  { name: 'Miller', rarity: 'legendary', skill: 'Pulverizer', accuracy: 0, speed: 0, dodge: 0, electron: 0 },
  { name: 'Nora', rarity: 'legendary', skill: 'Massacre', accuracy: 9, speed: 4, dodge: 8, electron: 3 },
  { name: 'Rafia', rarity: 'legendary', skill: 'Stability Control', accuracy: 3, speed: 3, dodge: 5, electron: 2 },
  { name: 'Rayo', rarity: 'legendary', skill: 'Superior Command', accuracy: 13, speed: 13, dodge: 13, electron: 13 },
  { name: 'Robert', rarity: 'legendary', skill: 'Massacre', accuracy: 20, speed: 4, dodge: 10, electron: 5 },
  { name: 'Sandora', rarity: 'legendary', skill: 'Lucky Strike', accuracy: 9, speed: 7, dodge: 8, electron: 7 },
  { name: 'Singhri', rarity: 'legendary', skill: 'Copycat', accuracy: 12, speed: 12, dodge: 12, electron: 12 },
  { name: 'Stani', rarity: 'legendary', skill: 'Interference', accuracy: 5, speed: 8, dodge: 5, electron: 10 },
  { name: 'Titan', rarity: 'legendary', skill: 'Adaptive Mutualism', accuracy: 35, speed: 35, dodge: 35, electron: 35 },
  { name: 'Venus', rarity: 'legendary', skill: 'Gift of Romance', accuracy: 15, speed: 23, dodge: 24, electron: 12 },

  // --- DIVINE (35) ---
  { name: 'Carbuncle Cohort', rarity: 'divine', skill: 'Corrosive Coil', accuracy: 9, speed: 22, dodge: 11, electron: 15 },
  { name: 'Deadly Duo', rarity: 'divine', skill: 'Crucifer Sweep', accuracy: 19, speed: 17, dodge: 17, electron: 12 },
  { name: 'Death from Above', rarity: 'divine', skill: "Death's Clutches", accuracy: 24, speed: 24, dodge: 24, electron: 24 },
  { name: 'Desolate Prayers', rarity: 'divine', skill: 'Decaying Wane', accuracy: 20, speed: 20, dodge: 13, electron: 18 },
  { name: 'Dopplegangers', rarity: 'divine', skill: 'Fierce Mutation', accuracy: 34, speed: 45, dodge: 44, electron: 45 },
  { name: 'Enduring Chorus', rarity: 'divine', skill: 'Renewed Faith', accuracy: 8, speed: 19, dodge: 21, electron: 6 },
  { name: 'Ererbus Errants', rarity: 'divine', skill: 'Shadow Storm', accuracy: 31, speed: 22, dodge: 11, electron: 34 },
  { name: 'Eschaton Adventists', rarity: 'divine', skill: 'Abject Humiliation', accuracy: 38, speed: 30, dodge: 31, electron: 25 },
  { name: 'Eternal Terrors', rarity: 'divine', skill: 'Battle Preparations', accuracy: 29, speed: 10, dodge: 11, electron: 23 },
  { name: 'Fairy & Fiend', rarity: 'divine', skill: 'Double Whammy', accuracy: 22, speed: 10, dodge: 20, electron: 10 },
  { name: 'Fatal Furies', rarity: 'divine', skill: 'Battering Barrage', accuracy: 30, speed: 15, dodge: 14, electron: 12 },
  { name: 'Fearmongers', rarity: 'divine', skill: 'Omen of Doom', accuracy: 19, speed: 15, dodge: 12, electron: 21 },
  { name: 'Feral Raptors', rarity: 'divine', skill: 'Suicide Strike', accuracy: 18, speed: 14, dodge: 20, electron: 10 },
  { name: 'Frontline Surge', rarity: 'divine', skill: 'Pioneer Prowl', accuracy: 15, speed: 10, dodge: 17, electron: 3 },
  { name: 'Hand of Lelantos', rarity: 'divine', skill: 'Unseen Strike', accuracy: 36, speed: 34, dodge: 32, electron: 34 },
  { name: 'Hekatian Witnesses', rarity: 'divine', skill: 'Hekatian Edict', accuracy: 36, speed: 37, dodge: 35, electron: 34 },
  { name: 'Homeric Hellions', rarity: 'divine', skill: 'TBD', accuracy: 38, speed: 45, dodge: 25, electron: 12 },
  { name: 'Impending Doom', rarity: 'divine', skill: 'Insidious Infliction', accuracy: 10, speed: 12, dodge: 7, electron: 17 },
  { name: 'Indomitable Duo', rarity: 'divine', skill: 'Divine Barrier', accuracy: 12, speed: 25, dodge: 17, electron: 14 },
  { name: 'Iron Maidens', rarity: 'divine', skill: 'Fountain of Youth', accuracy: 10, speed: 21, dodge: 19, electron: 5 },
  { name: 'Kismet Beams', rarity: 'divine', skill: 'Supreme Smite', accuracy: 25, speed: 20, dodge: 10, electron: 5 },
  { name: 'Leech Lurkers', rarity: 'divine', skill: 'Covert Syphon', accuracy: 17, speed: 12, dodge: 32, electron: 13 },
  { name: 'Light & Darkness', rarity: 'divine', skill: 'Darkened Halo', accuracy: 12, speed: 15, dodge: 21, electron: 3 },
  { name: 'Lurking Light', rarity: 'divine', skill: 'Phasing Halo', accuracy: 11, speed: 7, dodge: 24, electron: 12 },
  { name: 'Pernicious Princes', rarity: 'divine', skill: 'Chain Vortex', accuracy: 20, speed: 20, dodge: 20, electron: 20 },
  { name: 'Rays of Destiny', rarity: 'divine', skill: 'Judgement', accuracy: 21, speed: 12, dodge: 15, electron: 9 },
  { name: 'Rex Scuta', rarity: 'divine', skill: 'Immunity', accuracy: 18, speed: 21, dodge: 15, electron: 18 },
  { name: 'The Ravagers', rarity: 'divine', skill: 'Smash and Grab', accuracy: 14, speed: 10, dodge: 13, electron: 11 },
  { name: 'Suicidal Sirens', rarity: 'divine', skill: 'Risky Surge', accuracy: 31, speed: 3, dodge: 12, electron: 20 },
  { name: 'Summa Cum Laude', rarity: 'divine', skill: 'Verdant Force', accuracy: 24, speed: 9, dodge: 23, electron: 12 },
  { name: 'Tactical Wizards', rarity: 'divine', skill: 'Bamboozle', accuracy: 9, speed: 16, dodge: 12, electron: 22 },
  { name: 'The Twin Torpedoes', rarity: 'divine', skill: 'Sharpshooter Storm', accuracy: 30, speed: 0, dodge: 10, electron: 7 },
  { name: 'Victory Roar', rarity: 'divine', skill: 'Eradicate', accuracy: 17, speed: 16, dodge: 19, electron: 15 },
  { name: 'Wildfire', rarity: 'divine', skill: 'Trigger Happy', accuracy: 35, speed: 5, dodge: 9, electron: 18 },
  { name: 'Winter Knights', rarity: 'divine', skill: 'TBD', accuracy: 15, speed: 34, dodge: 30, electron: 20 },
];

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
      key: 'GAS_ENERGY',
      name: 'Energía de Gas',
      description: 'Tecnología avanzada para extraer y estabilizar gas.'
      category: 'PRODUCTION',
      baseCostMetal: 200,
      baseCostPlasma: 100,
      baseResearchTime: 300,
      maxLevel: 5,
      effectType: 'GAS_PRODUCTION',
      effectValue: 0.10,
      effectDescription: '+10% producción de gas por nivel',
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

  console.log(`- ${await prisma.technology.count()} technologies seeded`);

  // =====================================================
  // NAVES (Blueprints) - Sistema Astillero Fase 3 + GO2
  // =====================================================

  // Nave 1: Explorador - Disponible desde inicio
  await prisma.blueprint.upsert({
    where: { id: 'bp-explorer' },
    update: {
      ppcCount: 1,
      armorType: 'regen',
      weaponSlots: JSON.stringify({ ballistic: 1, directional: 0, missile: 0, shipBased: 0 }),
      moduleSlots: JSON.stringify({ attack: 0, defense: 0, support: 0 }),
      he3Consumption: 5,
    },
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
      ppcCount: 1,
      armorType: 'regen',
      weaponSlots: JSON.stringify({ ballistic: 1, directional: 0, missile: 0, shipBased: 0 }),
      moduleSlots: JSON.stringify({ attack: 0, defense: 0, support: 0 }),
      he3Consumption: 5,
    },
  });

  // Nave 2: Fragata - Básica de combate
  await prisma.blueprint.upsert({
    where: { id: 'bp-frigate' },
    update: {
      ppcCount: 2,
      armorType: 'regen',
      weaponSlots: JSON.stringify({ ballistic: 1, directional: 1, missile: 0, shipBased: 0 }),
      moduleSlots: JSON.stringify({ attack: 0, defense: 1, support: 0 }),
      he3Consumption: 15,
    },
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
      ppcCount: 2,
      armorType: 'regen',
      weaponSlots: JSON.stringify({ ballistic: 1, directional: 1, missile: 0, shipBased: 0 }),
      moduleSlots: JSON.stringify({ attack: 0, defense: 1, support: 0 }),
      he3Consumption: 15,
    },
  });

  // Nave 3: Interceptor - Requiere Propulsión Básica
  await prisma.blueprint.upsert({
    where: { id: 'bp-interceptor' },
    update: {
      ppcCount: 1,
      armorType: 'nano',
      weaponSlots: JSON.stringify({ ballistic: 0, directional: 2, missile: 0, shipBased: 0 }),
      moduleSlots: JSON.stringify({ attack: 1, defense: 0, support: 0 }),
      he3Consumption: 20,
    },
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
      ppcCount: 1,
      armorType: 'nano',
      weaponSlots: JSON.stringify({ ballistic: 0, directional: 2, missile: 0, shipBased: 0 }),
      moduleSlots: JSON.stringify({ attack: 1, defense: 0, support: 0 }),
      he3Consumption: 20,
    },
  });

  // Nave 4: Carguero - Requiere Logística Espacial
  await prisma.blueprint.upsert({
    where: { id: 'bp-cargo' },
    update: {
      ppcCount: 1,
      armorType: 'regen',
      weaponSlots: JSON.stringify({ ballistic: 0, directional: 0, missile: 0, shipBased: 0 }),
      moduleSlots: JSON.stringify({ attack: 0, defense: 0, support: 1 }),
      he3Consumption: 8,
    },
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
      ppcCount: 1,
      armorType: 'regen',
      weaponSlots: JSON.stringify({ ballistic: 0, directional: 0, missile: 0, shipBased: 0 }),
      moduleSlots: JSON.stringify({ attack: 0, defense: 0, support: 1 }),
      he3Consumption: 8,
    },
  });

  // Nave 5: Crucero - Requiere Armamento Láser
  await prisma.blueprint.upsert({
    where: { id: 'bp-cruiser' },
    update: {
      ppcCount: 3,
      armorType: 'neutralizing',
      weaponSlots: JSON.stringify({ ballistic: 1, directional: 1, missile: 1, shipBased: 0 }),
      moduleSlots: JSON.stringify({ attack: 1, defense: 1, support: 0 }),
      he3Consumption: 40,
    },
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
      ppcCount: 3,
      armorType: 'neutralizing',
      weaponSlots: JSON.stringify({ ballistic: 1, directional: 1, missile: 1, shipBased: 0 }),
      moduleSlots: JSON.stringify({ attack: 1, defense: 1, support: 0 }),
      he3Consumption: 40,
    },
  });

  // Nave 6: Acorazado - Requiere Blindaje Ligero
  await prisma.blueprint.upsert({
    where: { id: 'bp-battleship' },
    update: {
      ppcCount: 4,
      armorType: 'chrome',
      weaponSlots: JSON.stringify({ ballistic: 2, directional: 1, missile: 1, shipBased: 0 }),
      moduleSlots: JSON.stringify({ attack: 1, defense: 2, support: 0 }),
      he3Consumption: 80,
    },
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
      ppcCount: 4,
      armorType: 'chrome',
      weaponSlots: JSON.stringify({ ballistic: 2, directional: 1, missile: 1, shipBased: 0 }),
      moduleSlots: JSON.stringify({ attack: 1, defense: 2, support: 0 }),
      he3Consumption: 80,
    },
  });

  // Nave 7: Bombardero - Nuevo blueprint para GO2
  await prisma.blueprint.upsert({
    where: { id: 'bp-bomber' },
    update: {},
    create: {
      id: 'bp-bomber',
      key: 'BOMBER',
      name: 'Bombardero',
      type: 'COMBAT_HEAVY',
      category: 'COMBAT',
      description: 'Nave de asedio especializada en destruir fortalezas y estructuras estacionarias. Gran poder de fuego pero vulnerable.',
      requiredTechId: techLaser.id,
      requiredBuildingType: 'SHIPYARD',
      costMetal: 1,
      costPlasma: 1,
      costCredits: 1,
      buildTime: 240,
      attack: 120,
      hp: 100,
      defense: 5,
      speed: 10,
      cargoCapacity: 50,
      ppcCount: 2,
      armorType: 'regen',
      weaponSlots: JSON.stringify({ ballistic: 0, directional: 0, missile: 2, shipBased: 0 }),
      moduleSlots: JSON.stringify({ attack: 2, defense: 0, support: 0 }),
      he3Consumption: 60,
    },
  });

  // Nave 8: Portanaves - Nuevo blueprint para GO2
  await prisma.blueprint.upsert({
    where: { id: 'bp-carrier' },
    update: {},
    create: {
      id: 'bp-carrier',
      key: 'CARRIER',
      name: 'Portanaves',
      type: 'COMBAT_HEAVY',
      category: 'COMBAT',
      description: 'Nave capital que despliega cazas interceptores. Débil por sí sola pero potente con escolta.',
      requiredTechId: techPropulsion.id,
      requiredBuildingType: 'SHIPYARD',
      costMetal: 1,
      costPlasma: 1,
      costCredits: 1,
      buildTime: 420,
      attack: 10,
      hp: 400,
      defense: 30,
      speed: 8,
      cargoCapacity: 100,
      ppcCount: 3,
      armorType: 'nano',
      weaponSlots: JSON.stringify({ ballistic: 0, directional: 0, missile: 0, shipBased: 3 }),
      moduleSlots: JSON.stringify({ attack: 0, defense: 1, support: 2 }),
      he3Consumption: 70,
    },
  });

  console.log(`- ${await prisma.blueprint.count()} blueprints seeded`);

  // =====================================================
  // MISIONES PvE
  // =====================================================

  await prisma.mission.upsert({
    where: { id: 'mission-1' },
    update: {},
    create: {
      id: 'mission-1',
      name: 'Patrulla Orbital',
      description: 'Patrulla simple alrededor del planeta. Seguro y rápido.',
      difficulty: 1,
      durationSeconds: 60,
      minShipsRequired: 1,
      recommendedPower: 50,
      enemyFleetConfig: JSON.stringify({ explorer: 5 }),
      rewardMetal: 50,
      rewardPlasma: 25,
      rewardXp: 50,
      rewardCredits: 20,
    },
  });

  await prisma.mission.upsert({
    where: { id: 'mission-2' },
    update: {},
    create: {
      id: 'mission-2',
      name: 'Exploración de Asteroides',
      description: 'Explorar un campo de asteroides cercano. Riesgo bajo.',
      difficulty: 1,
      durationSeconds: 120,
      minShipsRequired: 2,
      recommendedPower: 100,
      enemyFleetConfig: JSON.stringify({ explorer: 10 }),
      rewardMetal: 100,
      rewardPlasma: 50,
      rewardXp: 100,
      rewardCredits: 40,
    },
  });

  await prisma.mission.upsert({
    where: { id: 'mission-3' },
    update: {},
    create: {
      id: 'mission-3',
      name: 'Recuperación de Chatarra',
      description: 'Recuperar materiales de un campo de batalla abandonado.',
      difficulty: 2,
      durationSeconds: 180,
      minShipsRequired: 3,
      recommendedPower: 200,
      enemyFleetConfig: JSON.stringify({ frigate: 5 }),
      rewardMetal: 200,
      rewardPlasma: 100,
      rewardXp: 150,
      rewardCredits: 60,
    },
  });

  await prisma.mission.upsert({
    where: { id: 'mission-4' },
    update: {},
    create: {
      id: 'mission-4',
      name: 'Señal Desconocida',
      description: 'Investigar una señal de socorro. Posible encuentro hostil.',
      difficulty: 3,
      durationSeconds: 300,
      minShipsRequired: 5,
      recommendedPower: 400,
      enemyFleetConfig: JSON.stringify({ frigate: 15 }),
      rewardMetal: 300,
      rewardPlasma: 150,
      rewardXp: 250,
      rewardCredits: 100,
    },
  });

  await prisma.mission.upsert({
    where: { id: 'mission-5' },
    update: {},
    create: {
      id: 'mission-5',
      name: 'Escolta de Carguero',
      description: 'Proteger un carguero civil de piratas espaciales.',
      difficulty: 4,
      durationSeconds: 480,
      minShipsRequired: 8,
      recommendedPower: 800,
      enemyFleetConfig: JSON.stringify({ frigate: 20, cruiser: 5 }),
      rewardMetal: 500,
      rewardPlasma: 250,
      rewardXp: 400,
      rewardCredits: 200,
    },
  });

  console.log(`- ${await prisma.mission.count()} missions seeded`);

  // =====================================================
  // COMMANDERS - 101 commanders from GO2 data
  // =====================================================

  // Check if we have at least one empire to attach commanders to
  const empireCount = await prisma.empire.count();

  if (empireCount > 0) {
    // Get the first empire to attach commanders
    const firstEmpire = await prisma.empire.findFirst({ orderBy: { createdAt: 'asc' } });

    if (firstEmpire) {
      // Seed commanders attached to the first empire
      for (const cmd of COMMANDERS) {
        const commanderId = `cmd-${cmd.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`;

        await prisma.commander.upsert({
          where: { id: commanderId },
          update: {},
          create: {
            id: commanderId,
            empireId: firstEmpire.id,
            name: cmd.name,
            rarity: cmd.rarity,
            level: 1,
            stars: 1,
            accuracy: cmd.accuracy,
            speed: cmd.speed,
            dodge: cmd.dodge,
            electron: cmd.electron,
            skill: cmd.skill,
            status: 'AVAILABLE',
            gemSlots: JSON.stringify({ red: null, blue: null, green: null, diamond: null }),
          },
        });
      }

      console.log(`- ${await prisma.commander.count()} commanders seeded (attached to empire: ${firstEmpire.id})`);
    }
  } else {
    console.log('- No empires found. Skipping commander seed (commanders require an empire).');
    console.log('  Commanders will be seeded when an empire is created.');
  }

  // =====================================================
  // SUMMARY
  // =====================================================
  console.log('\n========================================');
  console.log('SEEDING COMPLETED SUCCESSFULLY!');
  console.log('========================================');
  console.log(`Technologies : ${await prisma.technology.count()}`);
  console.log(`Blueprints   : ${await prisma.blueprint.count()}`);
  console.log(`Missions     : ${await prisma.mission.count()}`);
  console.log(`Commanders   : ${await prisma.commander.count()}`);
  console.log('========================================');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
