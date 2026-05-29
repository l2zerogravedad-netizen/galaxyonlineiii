export type ResourceKey = "metal" | "plasma" | "credits" | "energy";

export type BuildingCategory = "production" | "storage" | "defense" | "infrastructure" | "military" | "research";
export type BuildingStatus = "active" | "locked" | "building" | "available" | "maxed";
export type GlowVariant = "cyan" | "purple" | "gold" | "red" | "orange" | "green" | "none";

export type BuildingType =
  | "metal_extractor"
  | "gas_refinery"
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

export type Building = {
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
  upgradeCost: Partial<Record<ResourceKey, number>>;
  unlockRequirement?: {
    buildingType?: BuildingType;
    level?: number;
    researchId?: string;
  };
  buildTime?: number;
};

export type Player = { name: string; level: number; xp: number; xpMax: number };

export type Resource = {
  key: ResourceKey;
  label: string;
  value: number;
  max: number;
  rate: number;
  tone: "cyan" | "purple" | "gold" | "green";
  webpName: string;
  icon: string;
};

export const player: Player = { name: "ZIEGLER", level: 1, xp: 120, xpMax: 300 };

export const resources: Resource[] = [
  { key: "metal", label: "METAL", value: 5000, max: 10000, rate: 100, tone: "cyan", webpName: "resource-metal", icon: "⚙️" },
  { key: "plasma", label: "GAS", value: 5000, max: 10000, rate: 50, tone: "purple", webpName: "resource-gas", icon: "⚡" },
  { key: "credits", label: "CRÉDITOS", value: 5000, max: 999999999, rate: 0, tone: "gold", webpName: "resource-credits", icon: "💰" },
  { key: "energy", label: "ENERGÍA", value: 80, max: 100, rate: 20, tone: "green", webpName: "resource-energy", icon: "🔋" },
];

export const allBuildings: Building[] = [
  {
    id: "b1",
    type: "metal_extractor",
    name: "EXTRACTOR DE METAL",
    level: 1,
    maxLevel: 20,
    description: "Extrae minerales metálicos desde la corteza del planeta para su uso en construcción y fabricación.",
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
    name: "REFINERÍA DE GAS",
    level: 1,
    maxLevel: 20,
    description: "Procesa gas bruto para su uso en tecnologías avanzadas y construcción de estructuras.",
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
    name: "ALMACÉN",
    level: 1,
    maxLevel: 15,
    description: "Aumenta la capacidad máxima de almacenamiento de recursos.",
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
    name: "GENERADOR DE ENERGÍA",
    level: 1,
    maxLevel: 20,
    description: "Genera energía para mantener operativa la colonia y sus estructuras.",
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
    name: "CENTRO DE CONTROL",
    level: 1,
    maxLevel: 10,
    description: "Coordina defensa, construcción e investigación en la base.",
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
    buildTime: 120,
  },
  {
    id: "b6",
    type: "shipyard",
    name: "ASTILLERO",
    level: 0,
    maxLevel: 15,
    description: "Construye y repara naves espaciales.",
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
    name: "LABORATORIO",
    level: 0,
    maxLevel: 20,
    description: "Desarrolla tecnologías y mejoras.",
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
    name: "HANGAR",
    level: 0,
    maxLevel: 15,
    description: "Almacena y despliega flotas de combate.",
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
    name: "TORRE DE DEFENSA",
    level: 0,
    maxLevel: 10,
    description: "Defiende la base de ataques enemigos.",
    category: "defense",
    status: "locked",
    image: "/game/assets/buildings/defense-turret.webp",
    webpName: "defense-turret",
    glow: "red",
    consumption: { energy: 25 },
    health: 800,
    maxHealth: 800,
    upgradeCost: { metal: 900, plasma: 300, credits: 400 },
    unlockRequirement: { buildingType: "research_lab", level: 1 },
    buildTime: 200,
  },
];

// Empty slots for construction
export const emptySlots: Building[] = [
  { id: "empty_1", type: "empty", name: "CONSTRUIR", level: 0, maxLevel: 0, description: "Espacio disponible para construir.", category: "infrastructure", status: "available", image: "", webpName: "empty", glow: "none", health: 0, maxHealth: 0, upgradeCost: {} },
  { id: "empty_2", type: "empty", name: "CONSTRUIR", level: 0, maxLevel: 0, description: "Espacio disponible para construir.", category: "infrastructure", status: "available", image: "", webpName: "empty", glow: "none", health: 0, maxHealth: 0, upgradeCost: {} },
  { id: "empty_3", type: "empty", name: "CONSTRUIR", level: 0, maxLevel: 0, description: "Espacio disponible para construir.", category: "infrastructure", status: "available", image: "", webpName: "empty", glow: "none", health: 0, maxHealth: 0, upgradeCost: {} },
  { id: "empty_4", type: "empty", name: "CONSTRUIR", level: 0, maxLevel: 0, description: "Espacio disponible para construir.", category: "infrastructure", status: "available", image: "", webpName: "empty", glow: "none", health: 0, maxHealth: 0, upgradeCost: {} },
];

export const builtIds = new Set(["b1", "b2", "b3", "b4", "b5"]);
export const initialBuildings = allBuildings.filter((b) => builtIds.has(b.id) || b.type === "empty");

export const fmt = (n: number) => new Intl.NumberFormat("es-AR").format(n);
export const pct = (v: number, m: number) => (!m ? 0 : Math.min(100, Math.max(0, (v / m) * 100)));
