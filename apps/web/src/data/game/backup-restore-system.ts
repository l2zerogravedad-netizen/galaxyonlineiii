/**
 * SISTEMA DE BACKUP/RESTORE - GALAXY ONLINE II
 * Guardado progreso, migración, rollback
 */

// ============================================
// TIPOS DE BACKUP
// ============================================
export type BackupType = 
  | 'manual'           // Backup manual del jugador
  | 'auto_save'        // Guardado automático
  | 'checkpoint'       // Punto de control
  | 'scheduled'      // Programado
  | 'pre_update'     // Antes de actualización
  | 'migration'      // Para migración
  | 'rollback_point' // Punto de rollback
  | 'archive';       // Archivo histórico

export type BackupScope = 'account' | 'character' | 'corporation' | 'alliance' | 'server' | 'global';

// ============================================
// BACKUP
// ============================================
export interface Backup {
  id: string;
  timestamp: number;
  
  // Metadatos
  type: BackupType;
  scope: BackupScope;
  
  // Propietario
  owner: {
    playerId?: string;
    corporationId?: string;
    allianceId?: string;
    serverId?: string;
  };
  
  // Datos
  data: {
    version: string;
    size: number; // bytes
    checksum: string;
    compression: 'none' | 'gzip' | 'lz4' | 'zstd';
    encryption: boolean;
  };
  
  // Contenido
  content: {
    account?: AccountData;
    characters?: CharacterData[];
    inventory?: InventoryData;
    progress?: ProgressData;
    settings?: SettingsData;
    achievements?: AchievementData[];
    relations?: RelationsData;
  };
  
  // Estado
  status: {
    valid: boolean;
    corrupted: boolean;
    incomplete: boolean;
    restorationCount: number;
    lastRestoredAt?: number;
  };
  
  // Almacenamiento
  storage: {
    location: string;
    replicas: number;
    retentionUntil: number;
    autoDelete: boolean;
  };
  
  // Notas
  notes?: {
    title?: string;
    description?: string;
    tags: string[];
    createdBy: string;
  };
}

// ============================================
// DATOS DE CUENTA
// ============================================
export interface AccountData {
  accountId: string;
  email: string;
  registrationDate: number;
  lastLogin: number;
  
  // Configuración
  settings: {
    language: string;
    region: string;
    timezone: string;
    notificationPreferences: Record<string, boolean>;
    privacySettings: Record<string, boolean>;
  };
  
  // Seguridad
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: number;
    trustedDevices: string[];
    loginHistory: { timestamp: number; ip: string; device: string }[];
  };
  
  // Monetización
  monetization: {
    totalSpent: number;
    currency: string;
    paymentMethods: string[];
    transactionHistory: { id: string; amount: number; date: number; status: string }[];
  };
}

// ============================================
// DATOS DE PERSONAJE
// ============================================
export interface CharacterData {
  characterId: string;
  name: string;
  
  // Progresión
  level: number;
  experience: number;
  skillPoints: number;
  
  // Atributos
  stats: {
    strength: number;
    intelligence: number;
    agility: number;
    charisma: number;
    luck: number;
  };
  
  // Nave
  ship: {
    shipId: string;
    class: string;
    level: number;
    equipment: string[];
    cargo: { itemId: string; quantity: number }[];
    stats: Record<string, number>;
  };
  
  // Ubicación
  location: {
    systemId: string;
    coordinates: { x: number; y: number; z: number };
    stationId?: string;
  };
  
  // Estado
  health: number;
  energy: number;
  statusEffects: string[];
}

// ============================================
// DATOS DE INVENTARIO
// ============================================
export interface InventoryData {
  items: {
    itemId: string;
    quantity: number;
    quality: number;
    durability?: number;
    modifications?: string[];
    location: 'inventory' | 'ship' | 'station' | 'market';
  }[];
  
  currencies: {
    credits: number;
    premium: number;
    reputation: number;
    other: Record<string, number>;
  };
  
  resources: {
    resourceId: string;
    quantity: number;
    storageLocation: string;
  }[];
}

// ============================================
// DATOS DE PROGRESO
// ============================================
export interface ProgressData {
  // Misiones
  missions: {
    completed: string[];
    active: { missionId: string; progress: number; startedAt: number }[];
    failed: string[];
  };
  
  // Historia
  story: {
    chapter: number;
    scene: number;
    choices: Record<string, string>;
    unlockedContent: string[];
  };
  
  // Exploración
  exploration: {
    discoveredSystems: string[];
    visitedPlanets: string[];
    scannedAnomalies: string[];
    completedDungeons: string[];
  };
  
  // Relaciones
  relations: {
    faction: Record<string, number>; // standing con facciones
    reputation: number;
    titles: string[];
    allies: string[];
    enemies: string[];
  };
}

// ============================================
// DATOS DE CONFIGURACIÓN
// ============================================
export interface SettingsData {
  // Gráficos
  graphics: {
    quality: 'low' | 'medium' | 'high' | 'ultra';
    resolution: string;
    fullscreen: boolean;
    vsync: boolean;
    frameRateLimit: number;
  };
  
  // Audio
  audio: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    voiceVolume: number;
    muteOnFocusLoss: boolean;
  };
  
  // Controles
  controls: {
    keybindings: Record<string, string>;
    mouseSensitivity: number;
    invertY: boolean;
    controllerEnabled: boolean;
  };
  
  // UI
  ui: {
    scale: number;
    theme: string;
    minimapEnabled: boolean;
    damageNumbers: boolean;
    floatingText: boolean;
  };
  
  // Juego
  gameplay: {
    autoSave: boolean;
    autoSaveInterval: number;
    tutorialEnabled: boolean;
    difficulty: 'easy' | 'normal' | 'hard' | 'nightmare';
    permadeath: boolean;
  };
}

// ============================================
// DATOS DE LOGROS
// ============================================
export interface AchievementData {
  achievementId: string;
  unlockedAt: number;
  progress: number;
  maxProgress: number;
  
  // Meta-achievements
  related: string[];
  prerequisites: string[];
  
  // Recompensas reclamadas
  rewardsClaimed: boolean;
  rewards: {
    credits?: number;
    items?: string[];
    titles?: string[];
    cosmetics?: string[];
  };
}

// ============================================
// DATOS DE RELACIONES
// ============================================
export interface RelationsData {
  // Corporación
  corporation?: {
    corpId: string;
    rank: string;
    joinedAt: number;
    contributions: number;
    permissions: string[];
  };
  
  // Alianza
  alliance?: {
    allianceId: string;
    role: string;
    joinedAt: number;
    diplomaticStanding: string;
  };
  
  // Amigos
  friends: {
    playerId: string;
    friendSince: number;
    notes?: string;
    favorite: boolean;
  }[];
  
  // Bloqueados
  blocked: {
    playerId: string;
    blockedAt: number;
    reason?: string;
  }[];
}

// ============================================
// SISTEMA DE MIGRACIÓN
// ============================================
export interface MigrationData {
  // Origen
  source: {
    platform: string;
    region: string;
    server: string;
    accountId: string;
  };
  
  // Destino
  destination: {
    platform: string;
    region: string;
    server: string;
    accountId: string;
  };
  
  // Datos a migrar
  data: {
    account: boolean;
    characters: string[]; // IDs de personajes
    inventory: boolean;
    progress: boolean;
    achievements: boolean;
    purchases: boolean;
    friends: boolean;
  };
  
  // Estado
  status: {
    initiatedAt: number;
    completedAt?: number;
    failedAt?: number;
    failureReason?: string;
    verificationStatus: 'pending' | 'verified' | 'failed';
  };
  
  // Transformaciones
  transformations: {
    nameChanges: { old: string; new: string }[];
    currencyConversions: { from: string; to: string; rate: number }[];
    itemConversions: { from: string; to: string; quantity: number }[];
  };
}

// ============================================
// SISTEMA DE ROLLBACK
// ============================================
export interface RollbackSystem {
  // Punto de rollback
  checkpoint: {
    backupId: string;
    timestamp: number;
    reason: string;
    scope: BackupScope;
  };
  
  // Alcance
  affectedEntities: {
    players: string[];
    corporations: string[];
    alliances: string[];
    markets: string[];
    systems: string[];
  };
  
  // Proceso
  execution: {
    initiatedBy: string;
    initiatedAt: number;
    completedAt?: number;
    status: 'planning' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
    currentStep: string;
    progress: number; // 0-100
  };
  
  // Compensaciones
  compensations: {
    playerId: string;
    type: string;
    amount: number;
    reason: string;
    distributed: boolean;
  }[];
  
  // Comunicación
  communication: {
    announcements: { timestamp: number; message: string; channels: string[] }[];
    supportTickets: string[];
    playerNotifications: string[];
  };
}

// ============================================
// CONFIGURACIÓN DE BACKUP
// ============================================
export interface BackupConfig {
  // Auto-guardado
  autoSave: {
    enabled: boolean;
    interval: number; // segundos
    maxSlots: number;
    onExit: boolean;
    onCombatEnd: boolean;
    onTradeComplete: boolean;
  };
  
  // Backups programados
  scheduled: {
    enabled: boolean;
    frequency: 'hourly' | 'daily' | 'weekly';
    timeOfDay?: number; // hora del día
    dayOfWeek?: number; // día de la semana
    retention: number; // días
  };
  
  // Versionado
  versioning: {
    enabled: boolean;
    maxVersions: number;
    minVersionAge: number; // segundos
  };
  
  // Cloud
  cloud: {
    enabled: boolean;
    provider: string;
    encryption: boolean;
    compression: boolean;
    autoSync: boolean;
  };
  
  // Compresión
  compression: {
    algorithm: 'none' | 'gzip' | 'lz4' | 'zstd';
    level: number; // 0-9
  };
}

// ============================================
// HELPERS
// ============================================
export function createBackup(
  type: BackupType,
  scope: BackupScope,
  owner: Backup['owner'],
  data: Backup['content'],
  notes?: { title: string; description: string; tags: string[] }
): Backup {
  const now = Date.now();
  
  return {
    id: `backup_${now}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: now,
    type,
    scope,
    owner,
    data: {
      version: '1.0',
      size: 0,
      checksum: '',
      compression: 'gzip',
      encryption: true
    },
    content: data,
    status: {
      valid: true,
      corrupted: false,
      incomplete: false,
      restorationCount: 0
    },
    storage: {
      location: 'local',
      replicas: 1,
      retentionUntil: now + 2592000000, // 30 días
      autoDelete: type === 'auto_save'
    },
    notes: notes ? {
      title: notes.title,
      description: notes.description,
      tags: notes.tags,
      createdBy: owner.playerId || 'system'
    } : undefined
  };
}

export function validateBackup(backup: Backup): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Verificar checksum
  if (!backup.data.checksum) {
    errors.push('Missing checksum');
  }
  
  // Verificar datos corruptos
  if (backup.status.corrupted) {
    errors.push('Backup marked as corrupted');
  }
  
  // Verificar completitud
  if (backup.status.incomplete) {
    errors.push('Backup marked as incomplete');
  }
  
  // Verificar versión
  if (!backup.data.version) {
    errors.push('Missing version information');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function restoreBackup(
  backup: Backup,
  targetScope: BackupScope,
  mergeStrategy: 'overwrite' | 'merge' | 'selective'
): { success: boolean; restored: string[]; conflicts: string[] } {
  const restored: string[] = [];
  const conflicts: string[] = [];
  
  // Simular restauración
  if (backup.content.account) {
    restored.push('account');
  }
  
  if (backup.content.characters) {
    restored.push(`characters (${backup.content.characters.length})`);
  }
  
  return {
    success: true,
    restored,
    conflicts
  };
}

export function migrateData(
  source: MigrationData['source'],
  destination: MigrationData['destination'],
  data: MigrationData['data']
): MigrationData {
  return {
    source,
    destination,
    data,
    status: {
      initiatedAt: Date.now(),
      verificationStatus: 'pending'
    },
    transformations: {
      nameChanges: [],
      currencyConversions: [],
      itemConversions: []
    }
  };
}

export function calculateRollbackImpact(
  checkpoint: Backup,
  currentTime: number
): { affectedPlayers: number; dataLoss: number; compensationEstimate: number } {
  const timeDiff = currentTime - checkpoint.timestamp;
  
  // Estimaciones basadas en tiempo transcurrido
  const affectedPlayers = checkpoint.scope === 'server' ? 1000 : 1;
  const dataLoss = timeDiff / 3600000; // por hora
  const compensationEstimate = dataLoss * 100; // créditos por hora
  
  return {
    affectedPlayers,
    dataLoss,
    compensationEstimate
  };
}

export const BackupRestoreSystem = {
  createBackup,
  validateBackup,
  restoreBackup,
  migrateData,
  calculateRollbackImpact
};
