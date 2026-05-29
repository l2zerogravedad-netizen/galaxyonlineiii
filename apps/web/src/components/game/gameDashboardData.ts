export type ResourceKey = "metal" | "plasma" | "credits" | "energy";

export type BuildingCategory = "production" | "storage" | "defense" | "infrastructure" | "military" | "research";
export type BuildingStatus = "active" | "locked" | "building" | "available" | "maxed";

export type BuildingType =
  | "metal_extractor"
  | "plasma_refinery"
  | "warehouse"
  | "energy_generator"
  | "control_center"
  | "shipyard"
  | "research_lab"
  | "hangar"
  | "defense_turret"
  | "missile_silo"
  | "radar_tower"
  | "aerial_platform"
  | "empty";

export type GlowVariant = "cyan" | "purple" | "gold" | "red" | "orange" | "green" | "none";

export interface Building {
  id: string;
  type: BuildingType;
  name: string;
  level: number;
  maxLevel: number;
  description: string;
  category: BuildingCategory;
  status: BuildingStatus;
  image: string;
  webpName: string;
  glow: GlowVariant;
  production?: {
    metal?: number;
    plasma?: number;
    energy?: number;
    credits?: number;
  };
  consumption?: {
    energy?: number;
  };
  capacity?: {
    metal?: number;
    plasma?: number;
  };
  health: number;
  maxHealth: number;
  defense?: number;
  upgradeCost: Partial<Record<ResourceKey, number>>;
  unlockRequirement?: {
    buildingType?: BuildingType;
    level?: number;
    researchId?: string;
  };
  buildTime?: number;
}

export interface Player {
  id: string;
  name: string;
  level: number;
  xp: number;
  xpMax: number;
  avatar?: string;
}

export interface Resource {
  key: ResourceKey;
  label: string;
  value: number;
  max: number;
  rate: number;
  tone: "cyan" | "purple" | "gold" | "green";
  webpName: string;
  icon: string;
}

export interface Planet {
  id: string;
  name: string;
  type: "terran" | "barren" | "ice" | "lava" | "gas";
  image: string;
  webpName: string;
  population: number;
  maxPopulation: number;
  temperature: number;
  gravity: number;
  slots: number;
  usedSlots: number;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: "ship" | "research" | "fleet" | "mission" | "empire" | "market";
  href: string;
  badge?: number;
  disabled?: boolean;
  status?: "active" | "coming-soon";
}

// Player data
export const player: Player = {
  id: "p1",
  name: "ZIEGLER",
  level: 1,
  xp: 120,
  xpMax: 300,
};

// Resources data
export const resources: Resource[] = [
  {
    key: "metal",
    label: "Metal",
    value: 1000,
    max: 1000,
    rate: 100,
    tone: "cyan",
    webpName: "resource-metal",
    icon: "⚙️",
  },
  {
    key: "plasma",
    label: "Gas",
    value: 831,
    max: 1000,
    rate: 50,
    tone: "purple",
    webpName: "resource-plasma",
    icon: "⚡",
  },
  {
    key: "credits",
    label: "Créditos",
    value: 1000,
    max: 999999999,
    rate: 0,
    tone: "gold",
    webpName: "resource-credits",
    icon: "💰",
  },
  {
    key: "energy",
    label: "Energía",
    value: 80,
    max: 100,
    rate: 20,
    tone: "green",
    webpName: "resource-energy",
    icon: "🔋",
  },
];

// Planet data
export const planet: Planet = {
  id: "planet_1",
  name: "Planeta Principal",
  type: "terran",
  image: "/game/assets/planets/main-planet.webp",
  webpName: "main-planet",
  population: 5000,
  maxPopulation: 10000,
  temperature: 22,
  gravity: 1.0,
  slots: 9,
  usedSlots: 5,
};

// All buildings definition
export const allBuildings: Building[] = [
  {
    id: "b1",
    type: "metal_extractor",
    name: "Extractor de Metal",
    level: 1,
    maxLevel: 20,
    description: "Extrae minerales metálicos desde la corteza del planeta para su uso en construcción y fabricación de naves.",
    category: "production",
    status: "active",
    image: "/game/assets/buildings/metal-extractor.webp",
    webpName: "metal-extractor",
    glow: "cyan",
    production: { metal: 100 },
    consumption: { energy: 10 },
    health: 1000,
    maxHealth: 1000,
    upgradeCost: { metal: 500, plasma: 80, credits: 120 },
    buildTime: 60,
  },
  {
    id: "b2",
    type: "gas_refinery",
    name: "Refinería de Gas",
    level: 1,
    maxLevel: 20,
    description: "Procesa gas bruto extraído del subsuelo para su uso en tecnologías avanzadas y construcción.",
    category: "production",
    status: "active",
    image: "/game/assets/buildings/gas-refinery.webp",
    webpName: "gas-refinery",
    glow: "purple",
    production: { plasma: 50 },
    consumption: { energy: 15 },
    health: 1000,
    maxHealth: 1000,
    upgradeCost: { metal: 500, plasma: 250, credits: 100 },
    buildTime: 90,
  },
  {
    id: "b3",
    type: "warehouse",
    name: "Almacén",
    level: 1,
    maxLevel: 15,
    description: "Aumenta la capacidad máxima de almacenamiento de recursos metálicos y de plasma.",
    category: "storage",
    status: "active",
    image: "/game/assets/buildings/warehouse.webp",
    webpName: "warehouse",
    glow: "gold",
    capacity: { metal: 500, plasma: 300 },
    health: 800,
    maxHealth: 800,
    upgradeCost: { metal: 200, plasma: 150, credits: 250 },
    buildTime: 45,
  },
  {
    id: "b4",
    type: "energy_generator",
    name: "Generador de Energía",
    level: 1,
    maxLevel: 20,
    description: "Genera energía eléctrica para mantener operativas todas las estructuras de la colonia.",
    category: "infrastructure",
    status: "active",
    image: "/game/assets/buildings/energy-generator.webp",
    webpName: "energy-generator",
    glow: "green",
    production: { energy: 20 },
    health: 700,
    maxHealth: 700,
    upgradeCost: { metal: 350, plasma: 200, credits: 100 },
    buildTime: 30,
  },
  {
    id: "b5",
    type: "control_center",
    name: "Centro de Control",
    level: 1,
    maxLevel: 10,
    description: "Coordina la defensa, la construcción y la investigación en la base. Necesario para desbloquear edificios avanzados.",
    category: "infrastructure",
    status: "active",
    image: "/game/assets/buildings/control-center.webp",
    webpName: "control-center",
    glow: "cyan",
    production: { credits: 10 },
    consumption: { energy: 20 },
    health: 1200,
    maxHealth: 1200,
    upgradeCost: { metal: 700, plasma: 300, credits: 350 },
    unlockRequirement: { buildingType: "energy_generator", level: 1 },
    buildTime: 120,
  },
  {
    id: "b6",
    type: "shipyard",
    name: "Astillero",
    level: 0,
    maxLevel: 15,
    description: "Permite construir y reparar naves espaciales para tu flota. Necesario para misiones militares.",
    category: "military",
    status: "locked",
    image: "/game/assets/buildings/shipyard.webp",
    webpName: "shipyard",
    glow: "orange",
    consumption: { energy: 50 },
    health: 1500,
    maxHealth: 1500,
    upgradeCost: { metal: 1000, plasma: 500, credits: 800 },
    unlockRequirement: { buildingType: "control_center", level: 2 },
    buildTime: 300,
  },
  {
    id: "b7",
    type: "research_lab",
    name: "Laboratorio de Investigación",
    level: 0,
    maxLevel: 20,
    description: "Desarrolla nuevas tecnologías, mejoras para edificios y capacidades de combate.",
    category: "research",
    status: "locked",
    image: "/game/assets/buildings/research-lab.webp",
    webpName: "research-lab",
    glow: "purple",
    consumption: { energy: 40 },
    health: 900,
    maxHealth: 900,
    upgradeCost: { metal: 800, plasma: 600, credits: 700 },
    unlockRequirement: { buildingType: "control_center", level: 2 },
    buildTime: 240,
  },
  {
    id: "b8",
    type: "hangar",
    name: "Hangar",
    level: 0,
    maxLevel: 15,
    description: "Almacena y despliega flotas de combate. Cada nivel aumenta la capacidad de naves.",
    category: "military",
    status: "locked",
    image: "/game/assets/buildings/hangar.webp",
    webpName: "hangar",
    glow: "cyan",
    consumption: { energy: 30 },
    health: 1000,
    maxHealth: 1000,
    upgradeCost: { metal: 600, plasma: 400, credits: 500 },
    unlockRequirement: { buildingType: "shipyard", level: 1 },
    buildTime: 180,
  },
  {
    id: "b9",
    type: "defense_turret",
    name: "Torre de Defensa",
    level: 0,
    maxLevel: 10,
    description: "Sistema de defensa orbital que protege la base de ataques enemigos.",
    category: "defense",
    status: "locked",
    image: "/game/assets/buildings/defense-turret.webp",
    webpName: "defense-turret",
    glow: "red",
    defense: 100,
    consumption: { energy: 25 },
    health: 800,
    maxHealth: 800,
    upgradeCost: { metal: 900, plasma: 300, credits: 400 },
    unlockRequirement: { buildingType: "research_lab", level: 1 },
    buildTime: 200,
  },
];

// Empty slots for construction
export const emptySlots = [
  { id: "empty_1", type: "empty" as const, name: "Espacio Disponible", level: 0, description: "Haz clic para construir", webpName: "empty" },
  { id: "empty_2", type: "empty" as const, name: "Espacio Disponible", level: 0, description: "Haz clic para construir", webpName: "empty" },
  { id: "empty_3", type: "empty" as const, name: "Espacio Disponible", level: 0, description: "Haz clic para construir", webpName: "empty" },
  { id: "empty_4", type: "empty" as const, name: "Espacio Disponible", level: 0, description: "Haz clic para construir", webpName: "empty" },
];

// Initial buildings shown on grid (built + empty slots)
export const builtIds = new Set(["b1", "b2", "b3", "b4", "b5"]);
export const initialBuildings = allBuildings.filter((b) => builtIds.has(b.id));

// Navigation items
export const navigationItems: NavigationItem[] = [
  { id: "shipyard", label: "Astillero", icon: "ship", href: "/shipyard" },
  { id: "research", label: "Investigación", icon: "research", href: "/research" },
  { id: "fleet", label: "Flotas", icon: "fleet", href: "/fleets", status: "coming-soon", disabled: true },
  { id: "missions", label: "Misiones", icon: "mission", href: "/missions", status: "coming-soon", disabled: true },
];

// Format helpers
export const fmt = (n: number) => new Intl.NumberFormat("es-AR").format(n);
export const fmtCompact = (n: number) => new Intl.NumberFormat("es-AR", { notation: "compact" }).format(n);
export const pct = (v: number, m: number) => (!m ? 0 : Math.min(100, Math.max(0, (v / m) * 100)));
export const fmtTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
};
