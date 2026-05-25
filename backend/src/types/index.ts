// Common types for DESTOCK SPACE Backend

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  level: number;
  experience: number;
  credits: number;
  avatar?: string;
  title?: string;
  allianceId?: string;
  statistics: UserStatistics;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  isBanned: boolean;
  banReason?: string;
  banExpiresAt?: Date;
}

export interface UserStatistics {
  totalPlayTime: number;
  battlesWon: number;
  battlesLost: number;
  resourcesCollected: number;
  itemsCrafted: number;
  transactionsCompleted: number;
  achievementsUnlocked: number;
  currentStreak: number;
  longestStreak: number;
}

export interface UserPreferences {
  language: string;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  game: GamePreferences;
}

export interface NotificationPreferences {
  combat: boolean;
  trade: boolean;
  alliance: boolean;
  system: boolean;
  marketing: boolean;
}

export interface PrivacyPreferences {
  profileVisible: boolean;
  showOnlineStatus: boolean;
  allowFriendRequests: boolean;
  showStatistics: boolean;
}

export interface GamePreferences {
  autoSave: boolean;
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
  soundVolume: number;
  musicVolume: number;
  cameraMode: 'follow' | 'free' | 'tactical';
}

export interface Resource {
  id: string;
  userId: string;
  type: ResourceType;
  amount: number;
  maxAmount: number;
  productionRate: number;
  lastUpdated: Date;
}

export type ResourceType = 
  | 'metal'
  | 'plasma'
  | 'energy'
  | 'crystals'
  | 'exotics'
  | 'quantum'
  | 'dark_matter'
  | 'credits';

export interface InventoryItem {
  id: string;
  userId: string;
  itemId: ItemType;
  name: string;
  type: ItemTypeCategory;
  rarity: ItemRarity;
  quantity: number;
  quality: number;
  properties: ItemProperties;
  equipped: boolean;
  slot?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export type ItemType = 
  // Weapons
  | 'weapon_laser_cannon_mk1'
  | 'weapon_laser_cannon_mk2'
  | 'weapon_laser_cannon_mk3'
  | 'weapon_plasma_cannon_mk1'
  | 'weapon_plasma_cannon_mk2'
  | 'weapon_missile_launcher_mk1'
  | 'weapon_torpedo_launcher_mk1'
  | 'weapon_railgun_mk1'
  // Armor
  | 'armor_basic_plate'
  | 'armor_titanium_plate_mk1'
  | 'armor_titanium_plate_mk2'
  | 'armor_composite_plate_mk1'
  // Modules
  | 'module_shield_generator_mk1'
  | 'module_shield_generator_mk2'
  | 'module_engine_boost_mk1'
  | 'module_warp_drive_mk1'
  | 'module_cargo_expansion_mk1'
  | 'module_mining_laser_mk1'
  | 'module_targeting_computer_mk1'
  | 'module_ecm_system_mk1'
  // Resources
  | 'resource_battery_cell'
  | 'resource_plasma_cell'
  | 'resource_quantum_core'
  | 'resource_metal_ore'
  | 'resource_titanium_ore'
  | 'resource_composite_metal';

export type ItemTypeCategory = 'weapon' | 'armor' | 'module' | 'resource';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface ItemProperties {
  // Weapon properties
  damage?: number;
  range?: number;
  fireRate?: number;
  energyCost?: number;
  accuracy?: number;
  projectileSpeed?: number;
  tracking?: boolean;
  explosionRadius?: number;
  armorPiercing?: number;
  shieldPiercing?: number;
  dotDamage?: number;
  chargeTime?: number;
  
  // Armor properties
  defense?: number;
  weight?: number;
  durability?: number;
  energyResistance?: number;
  kineticResistance?: number;
  heatResistance?: number;
  radiationResistance?: number;
  selfRepair?: number;
  
  // Module properties
  shieldCapacity?: number;
  rechargeRate?: number;
  rechargeDelay?: number;
  speedBonus?: number;
  accelerationBonus?: number;
  warpSpeed?: number;
  warpDistance?: number;
  capacityBonus?: number;
  miningPower?: number;
  efficiency?: number;
  accuracyBonus?: number;
  lockOnRangeBonus?: number;
  lockOnTimeReduction?: number;
  jammingStrength?: number;
  stealthBonus?: number;
  duration?: number;
  cooldown?: number;
  
  // Resource properties
  energyContent?: number;
  purity?: number;
  stackable?: boolean;
  maxStack?: number;
  specialProperties?: string[];
  
  // Common properties
  [key: string]: any;
}

export interface Ship {
  id: string;
  userId: string;
  name: string;
  type: ShipType;
  class: ShipClass;
  level: number;
  experience: number;
  health: ShipHealth;
  stats: ShipStats;
  equipment: ShipEquipment;
  crew: ShipCrew;
  position: ShipPosition;
  status: ShipStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ShipType = 
  | 'fighter'
  | 'cruiser'
  | 'battleship'
  | 'carrier'
  | 'frigate'
  | 'destroyer'
  | 'explorer'
  | 'miner';

export type ShipClass = 'light' | 'medium' | 'heavy' | 'capital';

export interface ShipHealth {
  current: number;
  max: number;
  regeneration: number;
  shield: number;
  maxShield: number;
  shieldRegeneration: number;
}

export interface ShipStats {
  attackPower: number;
  defense: number;
  speed: number;
  maneuverability: number;
  cargoCapacity: number;
  sensorRange: number;
  stealth: number;
}

export interface ShipEquipment {
  weapons: ShipEquipmentSlot[];
  armor: ShipEquipmentSlot[];
  modules: ShipEquipmentSlot[];
}

export interface ShipEquipmentSlot {
  id: string;
  itemId: ItemType;
  slot: string;
  durability?: number;
  maxDurability?: number;
}

export interface ShipCrew {
  commander?: CrewMember;
  officers: CrewMember[];
  crew: number;
  maxCrew: number;
  morale: number;
}

export interface CrewMember {
  id: string;
  name: string;
  role: CrewRole;
  level: number;
  experience: number;
  skills: string[];
  efficiency: number;
}

export type CrewRole = 
  | 'commander'
  | 'pilot'
  | 'gunner'
  | 'engineer'
  | 'science'
  | 'medical'
  | 'security'
  | 'navigation';

export interface ShipPosition {
  x: number;
  y: number;
  z: number;
  systemId: string;
  rotation: {
    x: number;
    y: number;
    z: number;
    w: number;
  };
}

export type ShipStatus = 
  | 'active'
  | 'inactive'
  | 'combat'
  | 'docked'
  | 'traveling'
  | 'destroyed'
  | 'repairing';

export interface MarketplaceListing {
  id: string;
  sellerId: string;
  itemId: ItemType;
  quantity: number;
  price: number;
  currency: 'credits' | ResourceType;
  status: MarketplaceStatus;
  createdAt: Date;
  expiresAt: Date;
  views: number;
  offers?: MarketplaceOffer[];
}

export type MarketplaceStatus = 
  | 'active'
  | 'sold'
  | 'expired'
  | 'cancelled'
  | 'pending';

export interface MarketplaceOffer {
  id: string;
  buyerId: string;
  amount: number;
  currency: 'credits' | ResourceType;
  message?: string;
  createdAt: Date;
}

export interface CombatSession {
  id: string;
  participants: CombatParticipant[];
  status: CombatStatus;
  currentTurn?: string;
  turnOrder: CombatTurn[];
  startTime: Date;
  endTime?: Date;
  timeLimit: number;
  location: CombatLocation;
  battleType: BattleType;
  settings: CombatSettings;
  battleLog: CombatLogEntry[];
  rewards?: CombatRewards;
}

export interface CombatParticipant {
  userId: string;
  ships: string[];
  ready: boolean;
  disconnected?: boolean;
  lastAction?: Date;
}

export type CombatStatus = 
  | 'waiting'
  | 'active'
  | 'paused'
  | 'completed'
  | 'aborted';

export interface CombatTurn {
  userId: string;
  shipId: string;
  initiative: number;
  order: number;
}

export interface CombatLocation {
  systemId: string;
  coordinates: {
    x: number;
    y: number;
    z: number;
  };
  terrain?: string;
  environmentalEffects?: string[];
}

export type BattleType = 
  | 'pvp'
  | 'pve'
  | 'tournament'
  | 'training'
  | 'alliance_war';

export interface CombatSettings {
  turnTimeLimit: number;
  allowSpectators: boolean;
  maxParticipants: number;
  shipLevelRestriction?: {
    min: number;
    max: number;
  };
  weaponRestrictions?: string[];
  environmentModifiers?: {
    damage: number;
    speed: number;
    visibility: number;
  };
}

export interface CombatLogEntry {
  timestamp: Date;
  type: CombatLogType;
  actorId: string;
  targetId?: string;
  action: string;
  result?: any;
  metadata?: any;
}

export type CombatLogType = 
  | 'attack'
  | 'move'
  | 'defend'
  | 'special'
  | 'system'
  | 'error';

export interface CombatRewards {
  winner: string;
  experience: number;
  credits: number;
  items: {
    itemId: ItemType;
    quantity: number;
  }[];
  reputation: number;
}

export interface Transaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  type: TransactionType;
  resourceType?: ResourceType;
  amount: number;
  fee: number;
  status: TransactionStatus;
  reason?: string;
  createdAt: Date;
  completedAt?: Date;
  metadata?: any;
}

export type TransactionType = 
  | 'transfer'
  | 'purchase'
  | 'sale'
  | 'reward'
  | 'penalty'
  | 'refund';

export type TransactionStatus = 
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'disputed';

export interface Alliance {
  id: string;
  name: string;
  tag: string;
  description?: string;
  leaderId: string;
  members: AllianceMember[];
  level: number;
  experience: number;
  resources: AllianceResources;
  settings: AllianceSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface AllianceMember {
  userId: string;
  rank: AllianceRank;
  joinedAt: Date;
  contribution: number;
  lastActive: Date;
}

export type AllianceRank = 
  | 'leader'
  | 'officer'
  | 'veteran'
  | 'member'
  | 'recruit';

export interface AllianceResources {
  credits: number;
  metal: number;
  plasma: number;
  energy: number;
  crystals: number;
}

export interface AllianceSettings {
  openRecruitment: boolean;
  minimumLevel: number;
  taxRate: number;
  permissions: AlliancePermissions;
}

export interface AlliancePermissions {
  canInvite: AllianceRank[];
  canKick: AllianceRank[];
  canManageResources: AllianceRank[];
  canDeclareWar: AllianceRank[];
  canManageSettings: AllianceRank[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  type: AchievementType;
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
  points: number;
  isHidden: boolean;
  isRepeatable: boolean;
  createdAt: Date;
}

export type AchievementCategory = 
  | 'combat'
  | 'economy'
  | 'exploration'
  | 'social'
  | 'special';

export type AchievementType = 
  | 'progressive'
  | 'cumulative'
  | 'conditional'
  | 'time_based';

export interface AchievementRequirement {
  type: string;
  value: number;
  operator: 'eq' | 'gt' | 'gte' | 'lt' | 'lte';
  parameters?: any;
}

export interface AchievementReward {
  type: 'experience' | 'credits' | 'item' | 'title' | 'badge';
  value: any;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  progress: number;
  completed: boolean;
  completedAt?: Date;
  rewardsClaimed: boolean;
  claimedAt?: Date;
}

// API Request/Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  field?: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  hasMore: boolean;
  limit: number;
  offset: number;
}

// WebSocket Event Types
export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export interface ResourceUpdateEvent extends WebSocketEvent {
  type: 'resource:update';
  data: {
    userId: string;
    resources: Resource[];
    changes: {
      type: ResourceType;
      previous: number;
      current: number;
      reason: string;
    }[];
  };
}

export interface InventoryUpdateEvent extends WebSocketEvent {
  type: 'inventory:update';
  data: {
    userId: string;
    inventory: InventoryItem[];
    changes: {
      action: 'added' | 'removed' | 'updated' | 'equipped' | 'unequipped';
      item: InventoryItem;
    }[];
  };
}

export interface CombatInitiatedEvent extends WebSocketEvent {
  type: 'combat:initiated';
  data: {
    combatId: string;
    participants: string[];
    location: CombatLocation;
    battleType: BattleType;
  };
}

export interface CombatActionEvent extends WebSocketEvent {
  type: 'combat:action';
  data: {
    combatId: string;
    actorId: string;
    action: any;
    result: any;
    turnTime: number;
  };
}

export interface MarketplaceUpdateEvent extends WebSocketEvent {
  type: 'marketplace:update';
  data: {
    action: 'created' | 'updated' | 'sold' | 'expired' | 'cancelled';
    listing: MarketplaceListing;
  };
}

export interface UserOnlineEvent extends WebSocketEvent {
  type: 'user:online';
  data: {
    userId: string;
    username: string;
    status: 'online' | 'away' | 'busy';
    location?: string;
  };
}

export interface UserOfflineEvent extends WebSocketEvent {
  type: 'user:offline';
  data: {
    userId: string;
    username: string;
    reason: 'logout' | 'timeout' | 'disconnect';
  };
}

// Database Entity Types
export interface DatabaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeletableEntity extends DatabaseEntity {
  deletedAt?: Date;
  isDeleted: boolean;
}

// Cache Types
export interface CacheKey {
  user: (userId: string) => string;
  resources: (userId: string) => string;
  inventory: (userId: string) => string;
  ships: (userId: string) => string;
  alliance: (allianceId: string) => string;
  combat: (combatId: string) => string;
  marketplace: (filters: any) => string;
}

// Configuration Types
export interface GameConfig {
  economy: {
    baseProductionRates: Record<ResourceType, number>;
    storageMultipliers: Record<ResourceType, number>;
    transactionFees: {
      transfer: number;
      marketplace: number;
      currency: number;
    };
    limits: {
      maxTransferPerDay: number;
      maxMarketplaceListings: number;
      minListingPrice: number;
      maxTransactionAmount: number;
    };
  };
  combat: {
    maxParticipants: number;
    turnTimeLimit: number;
    damageFormulas: {
      base: (attacker: any, defender: any) => number;
      critical: (base: number) => number;
      miss: (accuracy: number) => boolean;
    };
  };
  items: {
    rarityMultipliers: Record<ItemRarity, number>;
    qualityRange: {
      min: number;
      max: number;
    };
    durabilityLoss: {
      combat: number;
      mining: number;
      travel: number;
    };
  };
}

// Export utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
