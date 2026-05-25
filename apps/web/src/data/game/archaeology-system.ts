/**
 * SISTEMA DE ARQUEOLOGÍA ESPACIAL - GALAXY ONLINE II
 * Excavar ruinas, descubrir tecnologías antiguas, reliquias
 */

// ============================================
// TIPOS DE SITIOS ARQUEOLÓGICOS
// ============================================
export type ArchaeologicalSiteType = 
  | 'ruins'            // Ruinas urbanas
  | 'temple'           // Templo religioso
  | 'tomb'             // Tumba/tumba real
  | 'laboratory'       // Laboratorio antiguo
  | 'shipwreck'        // Naufragio espacial
  | 'battlefield'      // Campo de batalla
  | 'colony'           // Colonia abandonada
  | 'outpost'          // Puesto de avanzada
  | 'monument'         // Monumento
  | 'city'             // Ciudad entera
  | 'vault'            // Cámara acorazada
  | 'forge';           // Forja/instalación industrial

export type SiteAge = 'recent' | 'ancient' | 'prehistoric' | 'precursor' | 'unknown';

// ============================================
// SITIO ARQUEOLÓGICO
// ============================================
export interface ArchaeologicalSite {
  id: string;
  name: string;
  codename: string;
  type: ArchaeologicalSiteType;
  
  // Civilización
  civilization: {
    name: string;
    era: SiteAge;
    techLevel: number; // 0-10 comparado con actual
    extinctionCause?: string;
    knownTraits: string[];
  };
  
  // Ubicación
  location: {
    systemId: string;
    planetId?: string;
    moonId?: string;
    asteroidId?: string;
    coordinates: { x: number; y: number };
    hidden: boolean;
    detectionDifficulty: number; // 0-100
  };
  
  // Estado
  condition: {
    preservation: number; // 0-100
    looting: number; // 0-100 (cuánto saqueado)
    structuralIntegrity: number; // 0-100
    hazards: string[];
  };
  
  // Tamaño y complejidad
  scale: {
    size: 'small' | 'medium' | 'large' | 'massive';
    levels: number; // Niveles subterráneos/estructuras
    areas: number; // Zonas a explorar
    estimatedExcavationTime: number; // segundos
  };
  
  // Descubrimientos potenciales
  artifacts: {
    common: string[];
    uncommon: string[];
    rare: string[];
    legendary: string[];
    guaranteed?: string[];
  };
  
  technologies: {
    known: string[];
    unknown: string[]; // Tech que se puede descubrir
    researchPotential: number; // 0-100
  };
  
  // Seguridad y peligros
  security: {
    traps: boolean;
    automatedDefenses: boolean;
    biologicalHazards: boolean;
    radiation: boolean;
    structuralCollapse: boolean;
    guardianEntities?: boolean;
  };
  
  // Requisitos de excavación
  requirements: {
    excavationEquipment: string[];
    scientificSkills: string[];
    securityPersonnel: number;
    minTeamSize: number;
    permitsRequired: string[];
  };
  
  // Historial
  history: {
    discoveredBy?: string;
    discoveredAt?: number;
    previousExpeditions: number;
    artifactsRecovered: number;
    lastExcavation?: number;
  };
}

// ============================================
// EXPEDICIÓN ARQUEOLÓGICA
// ============================================
export interface ArchaeologicalExpedition {
  id: string;
  siteId: string;
  name: string;
  
  // Equipo
  team: {
    leader: string;
    archaeologists: number;
    engineers: number;
    security: number;
    scientists: number;
    specialists: string[];
    totalSize: number;
  };
  
  // Recursos
  resources: {
    funding: number;
    equipment: string[];
    vehicles: string[];
    supplies: number; // Días de operación
  };
  
  // Fases de excavación
  phases: {
    current: 'survey' | 'clearance' | 'excavation' | 'analysis' | 'preservation' | 'completed';
    completed: string[];
    progress: number; // 0-100
  };
  
  // Áreas
  areas: {
    areaId: string;
    name: string;
    status: 'unexplored' | 'exploring' | 'excavated' | 'cleared';
    discoveries: string[];
    dangersEncountered: string[];
  }[];
  
  // Descubrimientos
  discoveries: {
    artifacts: ExcavatedArtifact[];
    technologies: string[];
    knowledge: string[];
    historicalData: number;
  };
  
  // Estado
  status: 'planning' | 'in_field' | 'analysis' | 'completed' | 'aborted' | 'disaster';
  
  // Cronograma
  schedule: {
    startDate: number;
    estimatedEnd: number;
    actualEnd?: number;
    daysInField: number;
  };
  
  // Resultados
  results: {
    success: boolean;
    rating: number; // 0-100
    scientificValue: number;
    artifactsRecovered: number;
    crewCasualties: number;
    publications: string[];
    reputationGain: number;
  };
}

// ============================================
// ARTEFACTOS EXCAVADOS
// ============================================
export interface ExcavatedArtifact {
  id: string;
  name: string;
  siteId: string;
  expeditionId: string;
  
  // Clasificación
  category: 'tool' | 'weapon' | 'art' | 'technology' | 'document' | 'biological' | 'unknown';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'unique';
  
  // Estado
  condition: 'pristine' | 'good' | 'damaged' | 'fragmented' | 'corrupted';
  restorationNeeded: boolean;
  restorationDifficulty: number; // 0-100
  
  // Valor
  value: {
    historical: number; // 0-100
    scientific: number;
    monetary: number;
    cultural: number;
  };
  
  // Propiedades
  properties: {
    age: number; // años
    material: string;
    dimensions: { length: number; width: number; height: number };
    weight: number;
    specialFeatures: string[];
  };
  
  // Efectos
  effects?: {
    passive: string[];
    active: string[];
    research: string[];
    display: string[];
  };
  
  // Investigación
  research: {
    decoded: boolean;
    translation?: string;
    purpose?: string;
    origin?: string;
    significance?: string;
  };
  
  // Almacenamiento
  storage: {
    location: string;
    securityLevel: number;
    displayStatus: 'stored' | 'restoring' | 'exhibited' | 'researching' | 'destroyed';
  };
}

// ============================================
// SITIOS ARQUEOLÓGICOS PREDEFINIDOS
// ============================================
export const ARCHAEOLOGICAL_SITES: ArchaeologicalSite[] = [
  {
    id: 'site_precursor_city',
    name: 'Ciudad de los Precursores',
    codename: 'ATLANTIS',
    type: 'city',
    civilization: {
      name: 'Precursores',
      era: 'precursor',
      techLevel: 12,
      extinctionCause: 'Desconocida - posible ascensión dimensional',
      knownTraits: ['telepathy', 'gravity_control', 'dimensional_engineering']
    },
    location: {
      systemId: 'sys_precursor_sector',
      planetId: 'planet_precursor_prime',
      coordinates: { x: -2000, y: 1500 },
      hidden: true,
      detectionDifficulty: 90
    },
    condition: {
      preservation: 85,
      looting: 5,
      structuralIntegrity: 70,
      hazards: ['automated_defenses', 'dimensional_instability', 'psychic_residue']
    },
    scale: {
      size: 'massive',
      levels: 15,
      areas: 50,
      estimatedExcavationTime: 2592000
    },
    artifacts: {
      common: ['precursor_fragments', 'energy_cells'],
      uncommon: ['gravity_tools', 'psychic_amplifiers'],
      rare: ['dimensional_keys', 'consciousness_containers'],
      legendary: ['ascension_device', 'reality_anchor']
    },
    technologies: {
      known: ['anti_gravity', 'psychic_interface'],
      unknown: ['dimensional_travel', 'consciousness_transfer', 'reality_manipulation'],
      researchPotential: 100
    },
    security: {
      traps: true,
      automatedDefenses: true,
      biologicalHazards: false,
      radiation: true,
      structuralCollapse: false,
      guardianEntities: true
    },
    requirements: {
      excavationEquipment: ['archaeology_drone', 'dimensional_scanner', 'psychic_shield'],
      scientificSkills: ['archaeology', 'xenolinguistics', 'dimensional_physics'],
      securityPersonnel: 20,
      minTeamSize: 50,
      permitsRequired: ['galactic_council_approval', 'precursor_research_license']
    },
    history: {
      previousExpeditions: 0,
      artifactsRecovered: 0
    }
  },
  {
    id: 'site_forge_world',
    name: 'Mundo Forja Abandonado',
    codename: 'VULCAN',
    type: 'forge',
    civilization: {
      name: 'Constructores de Hierro',
      era: 'ancient',
      techLevel: 7,
      extinctionCause: 'Guerra civil industrial',
      knownTraits: ['master_engineers', 'automation', 'mega_structures']
    },
    location: {
      systemId: 'sys_forge_system',
      asteroidId: 'asteroid_forge_prime',
      coordinates: { x: 800, y: -400 },
      hidden: false,
      detectionDifficulty: 30
    },
    condition: {
      preservation: 60,
      looting: 40,
      structuralIntegrity: 50,
      hazards: ['unstable_machinery', 'toxic_waste', 'structural_collapse']
    },
    scale: {
      size: 'large',
      levels: 8,
      areas: 20,
      estimatedExcavationTime: 604800
    },
    artifacts: {
      common: ['industrial_tools', 'metal_alloys'],
      uncommon: ['automation_chips', 'construction_plans'],
      rare: ['nano_forge', 'molecular_assembler'],
      legendary: ['star_forge_blueprint']
    },
    technologies: {
      known: ['advanced_metallurgy', 'automation'],
      unknown: ['nano_construction', 'self_repairing_materials'],
      researchPotential: 70
    },
    security: {
      traps: false,
      automatedDefenses: true,
      biologicalHazards: true,
      radiation: false,
      structuralCollapse: true,
      guardianEntities: false
    },
    requirements: {
      excavationEquipment: ['heavy_excavator', 'hazmat_suit', 'structural_scanner'],
      scientificSkills: ['archaeology', 'industrial_history', 'materials_science'],
      securityPersonnel: 10,
      minTeamSize: 20,
      permitsRequired: ['industrial_site_clearance']
    },
    history: {
      previousExpeditions: 5,
      artifactsRecovered: 150
    }
  },
  {
    id: 'site_temple_eternal',
    name: 'Templo de la Eternidad',
    codename: 'OLYMPUS',
    type: 'temple',
    civilization: {
      name: 'Semidioses Estelares',
      era: 'prehistoric',
      techLevel: 9,
      extinctionCause: 'Colapso de su estrella fuente',
      knownTraits: ['religious_fanaticism', 'bio_engineering', 'consciousness_preservation']
    },
    location: {
      systemId: 'sys_temple_system',
      moonId: 'moon_temple_base',
      coordinates: { x: -500, y: 200 },
      hidden: false,
      detectionDifficulty: 50
    },
    condition: {
      preservation: 90,
      looting: 10,
      structuralIntegrity: 95,
      hazards: ['psychic_traps', 'biological_defenses', 'consciousness_tests']
    },
    scale: {
      size: 'medium',
      levels: 5,
      areas: 12,
      estimatedExcavationTime: 432000
    },
    artifacts: {
      common: ['religious_symbols', 'prayer_devices'],
      uncommon: ['consciousness_records', 'bio_samples'],
      rare: ['eternity_chambers', 'ascension_artifacts'],
      legendary: ['god_seed', 'immortality_device']
    },
    technologies: {
      known: ['consciousness_preservation'],
      unknown: ['true_immortality', 'divine_ascension', 'reality_warping'],
      researchPotential: 85
    },
    security: {
      traps: true,
      automatedDefenses: false,
      biologicalHazards: true,
      radiation: false,
      structuralCollapse: false,
      guardianEntities: true
    },
    requirements: {
      excavationEquipment: ['archaeology_kit', 'psychic_detector', 'bio_filter'],
      scientificSkills: ['archaeology', 'religious_studies', 'psychology', 'xenobiology'],
      securityPersonnel: 15,
      minTeamSize: 30,
      permitsRequired: ['religious_site_protocol', 'biohazard_clearance']
    },
    history: {
      previousExpeditions: 2,
      artifactsRecovered: 45
    }
  },
  {
    id: 'site_battlefield_giants',
    name: 'Campo de Batalla de los Gigantes',
    codename: 'ARMAGEDDON',
    type: 'battlefield',
    civilization: {
      name: 'Múltiples - Federación vs Imperio',
      era: 'ancient',
      techLevel: 8,
      extinctionCause: 'Guerra de aniquilación mutua',
      knownTraits: ['advanced_warfare', 'mega_weapons', 'tactical_brilliance']
    },
    location: {
      systemId: 'sys_battlefield_sector',
      coordinates: { x: 1200, y: 800 },
      hidden: false,
      detectionDifficulty: 20
    },
    condition: {
      preservation: 40,
      looting: 70,
      structuralIntegrity: 30,
      hazards: ['active_mines', 'radiation', 'unstable_weapons', 'debris_field']
    },
    scale: {
      size: 'massive',
      levels: 0,
      areas: 100,
      estimatedExcavationTime: 1728000
    },
    artifacts: {
      common: ['weapon_fragments', 'ship_debris', 'armor_pieces'],
      uncommon: ['battle_logs', 'tactical_computers', 'weapon_systems'],
      rare: ['mega_weapon_cores', 'flagship_remnants', 'experimental_tech'],
      legendary: ['doomsday_device', 'time_weapon', 'reality_bomb']
    },
    technologies: {
      known: ['advanced_weapons', 'shield_tech'],
      unknown: ['doomsday_weapons', 'temporal_warfare', 'reality_disruption'],
      researchPotential: 75
    },
    security: {
      traps: true,
      automatedDefenses: true,
      biologicalHazards: false,
      radiation: true,
      structuralCollapse: true,
      guardianEntities: false
    },
    requirements: {
      excavationEquipment: ['salvage_drone', 'radiation_suit', 'mine_detector'],
      scientificSkills: ['archaeology', 'military_history', 'weapons_expert'],
      securityPersonnel: 25,
      minTeamSize: 40,
      permitsRequired: ['war_zone_clearance', 'weapons_disposal_license']
    },
    history: {
      previousExpeditions: 20,
      artifactsRecovered: 2000
    }
  }
];

// ============================================
// MUSEO Y CONSERVACIÓN
// ============================================
export interface Museum {
  id: string;
  name: string;
  location: {
    systemId: string;
    stationId?: string;
    planetId?: string;
  };
  
  // Colección
  collection: {
    artifacts: ExcavatedArtifact[];
    totalValue: number;
    historicalSignificance: number;
    visitorCount: number;
  };
  
  // Exposiciones
  exhibits: {
    id: string;
    name: string;
    theme: string;
    artifacts: string[];
    interactive: boolean;
    popularity: number;
    revenue: number;
  }[];
  
  // Instalaciones
  facilities: {
    restorationLab: boolean;
    researchCenter: boolean;
    storageVault: boolean;
    educationalCenter: boolean;
    giftShop: boolean;
  };
  
  // Personal
  staff: {
    curators: number;
    researchers: number;
    security: number;
    educators: number;
    restorationExperts: number;
  };
  
  // Finanzas
  finances: {
    funding: number;
    ticketSales: number;
    grants: number;
    donations: number;
    operationalCosts: number;
  };
}

// ============================================
// TECNOLOGÍAS ANTIGUAS DESBLOQUEABLES
// ============================================
export const ANCIENT_TECHNOLOGIES: Record<string, {
  name: string;
  description: string;
  origin: string;
  requirements: string[];
  effects: string[];
  researchTime: number;
  value: number;
}> = {
  'gravity_manipulation': {
    name: 'Manipulación Gravitacional',
    description: 'Control directo de campos gravitacionales',
    origin: 'Precursores',
    requirements: ['site_precursor_city', 'artifact_gravity_core'],
    effects: ['anti_gravity_propulsion', 'gravity_weapons', 'planetary_terraforming'],
    researchTime: 1728000,
    value: 1000000
  },
  'consciousness_preservation': {
    name: 'Preservación de Conciencia',
    description: 'Almacenamiento y transferencia de mentes',
    origin: 'Semidioses Estelares',
    requirements: ['site_temple_eternal', 'artifact_eternity_chamber'],
    effects: ['immortality', 'mind_uploading', 'consciousness_merging'],
    researchTime: 2592000,
    value: 2000000
  },
  'nano_construction': {
    name: 'Construcción Nano',
    description: 'Ensamblaje molecular instantáneo',
    origin: 'Constructores de Hierro',
    requirements: ['site_forge_world', 'artifact_nano_forge'],
    effects: ['instant_repair', 'self_healing_materials', 'adaptive_armor'],
    researchTime: 1209600,
    value: 500000
  },
  'dimensional_travel': {
    name: 'Viaje Dimensional',
    description: 'Navegación entre dimensiones paralelas',
    origin: 'Precursores',
    requirements: ['site_precursor_city', 'artifact_dimensional_key'],
    effects: ['interdimensional_jump', 'alternate_reality_exploration', 'dimensional_shielding'],
    researchTime: 3456000,
    value: 5000000
  }
};

// ============================================
// HELPERS
// ============================================
export function calculateExcavationSuccess(
  site: ArchaeologicalSite,
  team: { size: number; skill: number; equipment: number }
): { successChance: number; timeMultiplier: number; riskLevel: string } {
  const baseSuccess = (team.skill + team.equipment) / 2;
  const sizeBonus = Math.min(20, (team.size / site.requirements.minTeamSize) * 10);
  const preservationFactor = site.condition.preservation / 100;
  
  const successChance = Math.min(95, baseSuccess * preservationFactor + sizeBonus);
  const timeMultiplier = 2 - (team.skill / 100) - (team.equipment / 100);
  
  const hazards = Object.values(site.security).filter(Boolean).length;
  let riskLevel = 'low';
  if (hazards > 5) riskLevel = 'extreme';
  else if (hazards > 3) riskLevel = 'high';
  else if (hazards > 1) riskLevel = 'medium';
  
  return { successChance, timeMultiplier, riskLevel };
}

export function getSiteBySystem(systemId: string): ArchaeologicalSite[] {
  return ARCHAEOLOGICAL_SITES.filter(s => s.location.systemId === systemId);
}

export function getSitesByCivilization(civName: string): ArchaeologicalSite[] {
  return ARCHAEOLOGICAL_SITES.filter(s => s.civilization.name === civName);
}

export function getUndiscoveredSites(discoveredIds: string[]): ArchaeologicalSite[] {
  return ARCHAEOLOGICAL_SITES.filter(s => !discoveredIds.includes(s.id));
}

export function calculateArtifactValue(
  artifact: ExcavatedArtifact
): number {
  let baseValue = artifact.value.monetary;
  
  // Multiplicadores por rareza
  const rarityMultiplier = {
    'common': 1,
    'uncommon': 2,
    'rare': 5,
    'epic': 10,
    'legendary': 50,
    'unique': 100
  }[artifact.rarity];
  
  // Multiplicador por condición
  const conditionMultiplier = {
    'pristine': 2,
    'good': 1.5,
    'damaged': 1,
    'fragmented': 0.5,
    'corrupted': 0.2
  }[artifact.condition];
  
  return Math.floor(baseValue * rarityMultiplier * conditionMultiplier);
}

export function canUnlockTechnology(
  techId: string,
  discoveredSites: string[],
  recoveredArtifacts: string[]
): { canUnlock: boolean; missingRequirements: string[] } {
  const tech = ANCIENT_TECHNOLOGIES[techId];
  if (!tech) return { canUnlock: false, missingRequirements: [] };
  
  const missingRequirements = tech.requirements.filter(req => {
    if (req.startsWith('site_')) {
      return !discoveredSites.includes(req);
    }
    if (req.startsWith('artifact_')) {
      return !recoveredArtifacts.includes(req);
    }
    return false;
  });
  
  return { canUnlock: missingRequirements.length === 0, missingRequirements };
}

export const ArchaeologySystem = {
  ARCHAEOLOGICAL_SITES,
  ANCIENT_TECHNOLOGIES,
  calculateExcavationSuccess,
  getSiteBySystem,
  getSitesByCivilization,
  getUndiscoveredSites,
  calculateArtifactValue,
  canUnlockTechnology
};
