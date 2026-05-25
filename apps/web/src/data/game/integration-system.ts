/**
 * SISTEMA DE INTEGRACIONES EXTERNAS - GALAXY ONLINE II
 * Integraciones con plataformas externas, Discord, Twitch, etc.
 */

// ============================================
// TIPOS DE INTEGRACIONES
// ============================================
export type IntegrationType = 
  | 'discord'           // Discord
  | 'twitch'           // Twitch
  | 'youtube'          // YouTube
  | 'twitter'          // Twitter/X
  | 'reddit'           // Reddit
  | 'steam'            // Steam
  | 'epic'             // Epic Games
  | 'google'           // Google
  | 'facebook'         // Facebook
  | 'instagram'        // Instagram
  | 'tiktok'           // TikTok
  | 'spotify'          // Spotify
  | 'patreon'          // Patreon
  | 'github'           // GitHub
  | 'custom';          // Personalizado

export type IntegrationStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'expired';

// ============================================
// INTEGRACIÓN
// ============================================
export interface Integration {
  id: string;
  playerId: string;
  
  // Información básica
  info: {
    type: IntegrationType;
    name: string;
    description: string;
    version: string;
    
    // Estado
    status: IntegrationStatus;
    enabled: boolean;
    
    // Fechas
    connectedAt?: number;
    lastSync?: number;
    expiresAt?: number;
  };
  
  // Configuración
  config: {
    // Autenticación
    authentication: {
      type: 'oauth2' | 'api_key' | 'webhook' | 'custom';
      
      // OAuth2
      oauth2?: {
        accessToken: string;
        refreshToken?: string;
        tokenType: string;
        scope: string[];
        expiresAt: number;
      };
      
      // API Key
      apiKey?: {
        key: string;
        secret?: string;
        permissions: string[];
      };
      
      // Webhook
      webhook?: {
        url: string;
        secret: string;
        events: string[];
      };
    };
    
    // Sincronización
    sync: {
      enabled: boolean;
      interval: number; // minutos
      bidirectional: boolean;
      
      // Datos a sincronizar
      dataTypes: string[];
      
      // Filtros
      filters: {
        includePrivate: boolean;
        dateRange?: {
          start: number;
          end: number;
        };
      };
    };
    
    // Notificaciones
    notifications: {
      enabled: boolean;
      
      // Eventos a notificar
      events: {
        achievement: boolean;
        levelUp: boolean;
        combat: boolean;
        social: boolean;
        custom: string[];
      }[];
      
      // Formato
      format: {
        template: string;
        includeImages: boolean;
        includeLinks: boolean;
        customMessage?: string;
      };
    };
  };
  
  // Permisos
  permissions: {
    // Lectura
    read: {
      profile: boolean;
      activity: boolean;
      friends: boolean;
      content: boolean;
      statistics: boolean;
    };
    
    // Escritura
    write: {
      post: boolean;
      update: boolean;
      message: boolean;
      invite: boolean;
    };
    
    // Personalizados
    custom: Record<string, boolean>;
  };
  
  // Estadísticas
  statistics: {
    // Uso
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    
    // Datos
    dataSynced: number;
    lastSyncSize: number;
    
    // Errores
    lastError?: string;
    errorCount: number;
  };
  
  // Metadatos
  metadata: {
    // Plataforma
    platform: {
      id: string;
      name: string;
      version: string;
    };
    
    // Usuario
    user: {
      id: string;
      username: string;
      displayName?: string;
      avatar?: string;
    };
    
    // Configuración específica
    settings: Record<string, any>;
  };
}

// ============================================
// INTEGRACIÓN DE DISCORD
// ============================================
export interface DiscordIntegration extends Integration {
  info: Integration['info'] & {
    type: 'discord';
  };
  
  config: Integration['config'] & {
    // Discord específico
    discord: {
      // Servidor
      serverId: string;
      
      // Canales
      channels: {
        announcements?: string;
        general?: string;
        combat?: string;
        screenshots?: string;
        voice?: string;
      };
      
      // Roles
      roles: {
        linked: string;
        levelBased: Record<number, string>;
        achievementBased: Record<string, string>;
      };
      
      // Bot
      bot: {
        enabled: boolean;
        commands: boolean;
        presence: boolean;
      };
      
      // Rich Presence
      richPresence: {
        enabled: boolean;
        showLevel: boolean;
        showFaction: boolean;
        showActivity: boolean;
        customStatus?: string;
      };
    };
  };
}

// ============================================
// INTEGRACIÓN DE TWITCH
// ============================================
export interface TwitchIntegration extends Integration {
  info: Integration['info'] & {
    type: 'twitch';
  };
  
  config: Integration['config'] & {
    // Twitch específico
    twitch: {
      // Canal
      channelId: string;
      
      // Streaming
      streaming: {
        enabled: boolean;
        autoStart: boolean;
        quality: '720p' | '1080p' | '4k';
        
        // Overlay
        overlay: {
          showGameplay: boolean;
          showWebcam: boolean;
          showChat: boolean;
          showStats: boolean;
        };
      };
      
      // Chat
      chat: {
        enabled: boolean;
        commands: boolean;
        moderation: boolean;
        
        // Comandos personalizados
        customCommands: {
          command: string;
          response: string;
          permission: 'everyone' | 'subscriber' | 'moderator' | 'vip';
        }[];
      };
      
      // Extensions
      extensions: {
        leaderboard: boolean;
        predictions: boolean;
        polls: boolean;
        drops: boolean;
      };
    };
  };
}

// ============================================
// INTEGRACIÓN DE YOUTUBE
// ============================================
export interface YouTubeIntegration extends Integration {
  info: Integration['info'] & {
    type: 'youtube';
  };
  
  config: Integration['config'] & {
    // YouTube específico
    youtube: {
      // Canal
      channelId: string;
      
      // Videos
      videos: {
        autoUpload: boolean;
        category: string;
        privacy: 'public' | 'unlisted' | 'private';
        
        // Plantillas
        templates: {
          title: string;
          description: string;
          tags: string[];
        };
      };
      
      // Streaming
      streaming: {
        enabled: boolean;
        autoStream: boolean;
        thumbnail: boolean;
        
        // Configuración
        settings: {
          title: string;
          description: string;
          category: string;
          madeForKids: boolean;
        };
      };
      
      // Community
      community: {
        enabled: boolean;
        autoPost: boolean;
        postTypes: ('text' | 'image' | 'video' | 'poll')[];
      };
    };
  };
}

// ============================================
// WEBHOOK DE INTEGRACIÓN
// ============================================
export interface IntegrationWebhook {
  id: string;
  integrationId: string;
  
  // Configuración
  config: {
    // URL
    url: string;
    
    // Eventos
    events: string[];
    
    // Seguridad
    secret?: string;
    
    // Formato
    format: 'json' | 'form' | 'xml';
    
    // Headers
    headers: Record<string, string>;
  };
  
  // Transformación
  transformation: {
    // Mapeo de campos
    fieldMapping: Record<string, string>;
    
    // Template
    template?: string;
    
    // Filtros
    filters: {
      field: string;
      operator: string;
      value: any;
    }[];
  };
  
  // Estado
  status: {
    active: boolean;
    created: number;
    lastTriggered?: number;
    
    // Estadísticas
    totalSent: number;
    totalFailed: number;
    successRate: number;
    
    // Errores
    lastErrors: {
      timestamp: number;
      error: string;
      statusCode?: number;
    }[];
  };
}

// ============================================
// SISTEMA DE SINCRONIZACIÓN
// ============================================
export interface IntegrationSync {
  // Configuración
  config: {
    // Intervalo
    interval: number; // minutos
    
    // Tipos de datos
    dataTypes: {
      profile: boolean;
      achievements: boolean;
      statistics: boolean;
      activity: boolean;
      content: boolean;
    };
    
    // Dirección
    direction: 'import' | 'export' | 'bidirectional';
    
    // Conflictos
    conflictResolution: 'local' | 'remote' | 'merge' | 'prompt';
  };
  
  // Estado
  status: {
    lastSync: number;
    nextSync: number;
    inProgress: boolean;
    
    // Progreso
    progress: {
      total: number;
      completed: number;
      failed: number;
      percentage: number;
    };
    
    // Errores
    errors: {
      type: string;
      message: string;
      timestamp: number;
    }[];
  };
  
  // Historial
  history: {
    timestamp: number;
    type: 'full' | 'incremental';
    items: {
      dataType: string;
      action: 'created' | 'updated' | 'deleted';
      id: string;
    }[];
    duration: number;
    success: boolean;
  }[];
}

// ============================================
// CENTRO DE INTEGRACIONES
// ============================================
export interface IntegrationHub {
  // Integraciones disponibles
  available: {
    type: IntegrationType;
    name: string;
    description: string;
    icon: string;
    color: string;
    
    // Características
    features: string[];
    
    // Requisitos
    requirements: {
      authentication: string[];
      permissions: string[];
      scopes: string[];
    };
    
    // Estado
    available: boolean;
    beta: boolean;
    deprecated: boolean;
  }[];
  
  // Integraciones del jugador
  integrations: Integration[];
  
  // Configuración global
  config: {
    // General
    autoSync: boolean;
    syncInterval: number;
    
    // Privacidad
    sharePrivateData: boolean;
    anonymizeData: boolean;
    
    // Notificaciones
    enableNotifications: boolean;
    notificationChannels: string[];
  };
  
  // Estadísticas
  statistics: {
    totalIntegrations: number;
    activeIntegrations: number;
    
    // Por tipo
    byType: Record<IntegrationType, number>;
    
    // Uso
    totalSyncs: number;
    successfulSyncs: number;
    failedSyncs: number;
  };
}

// ============================================
// INTEGRACIONES PREDEFINIDAS
// ============================================
export const PREDEFINED_INTEGRATIONS: IntegrationHub['available'][] = [
  {
    type: 'discord',
    name: 'Discord',
    description: 'Conecta tu cuenta de Discord para sincronizar actividad y recibir notificaciones',
    icon: '/icons/integrations/discord.svg',
    color: '#5865F2',
    features: [
      'Sincronización de perfil',
      'Notificaciones de logros',
      'Rich Presence',
      'Roles automáticos',
      'Bot de servidor'
    ],
    requirements: {
      authentication: ['oauth2'],
      permissions: ['identify', 'email', 'guilds.join'],
      scopes: ['bot', 'applications.commands']
    },
    available: true,
    beta: false,
    deprecated: false
  },
  {
    type: 'twitch',
    name: 'Twitch',
    description: 'Integra tu canal de Twitch para streaming y chat interactivo',
    icon: '/icons/integrations/twitch.svg',
    color: '#9146FF',
    features: [
      'Streaming integrado',
      'Comandos de chat',
      'Extensiones',
      'Sincronización de estadísticas',
      'Drops y recompensas'
    ],
    requirements: {
      authentication: ['oauth2'],
      permissions: ['channel:read:stream_key', 'chat:read', 'chat:edit'],
      scopes: ['channel:manage:broadcast', 'moderation:read']
    },
    available: true,
    beta: false,
    deprecated: false
  },
  {
    type: 'youtube',
    name: 'YouTube',
    description: 'Conecta tu canal de YouTube para subir videos y streaming',
    icon: '/icons/integrations/youtube.svg',
    color: '#FF0000',
    features: [
      'Subida automática de videos',
      'Streaming en vivo',
      'Posts en Community',
      'Gestión de playlists',
      'Estadísticas integradas'
    ],
    requirements: {
      authentication: ['oauth2'],
      permissions: ['youtube.readonly', 'youtube.upload'],
      scopes: ['https://www.googleapis.com/auth/youtube.upload']
    },
    available: true,
    beta: true,
    deprecated: false
  },
  {
    type: 'steam',
    name: 'Steam',
    description: 'Conecta tu cuenta de Steam para sincronización de logros y estadísticas',
    icon: '/icons/integrations/steam.svg',
    color: '#00ADFF',
    features: [
      'Sincronización de logros',
      'Estadísticas de juego',
      'Comparación con amigos',
      'Screenshots compartidas',
      'Tienda integrada'
    ],
    requirements: {
      authentication: ['oauth2'],
      permissions: ['identity', 'playerstats'],
      scopes: ['userstats', 'usergames']
    },
    available: true,
    beta: false,
    deprecated: false
  }
];

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================
export interface IntegrationSystemConfig {
  // General
  general: {
    // Integraciones máximas
    maxIntegrations: number;
    
    // Sincronización
    defaultSyncInterval: number; // minutos
    maxSyncInterval: number;
    
    // Privacidad
    requireConsent: boolean;
    dataRetentionDays: number;
  };
  
  // Seguridad
  security: {
    // Tokens
    tokenExpiration: number; // días
    refreshTokenExpiration: number; // días
    
    // Validación
    validateTokens: boolean;
    revokeOnDisconnect: boolean;
    
    // Almacenamiento
    encryptCredentials: boolean;
    keyRotationDays: number;
  };
  
  // API
  api: {
    // Rate limiting
    rateLimitPerIntegration: number;
    rateLimitPerUser: number;
    
    // Timeouts
    connectionTimeout: number; // segundos
    requestTimeout: number;
    
    // Reintentos
    maxRetries: number;
    retryDelay: number;
  };
  
  // Notificaciones
  notifications: {
    // Eventos
    enabledEvents: string[];
    
    // Formato
    defaultTemplate: string;
    includeImages: boolean;
    
    // Frecuencia
    maxPerHour: number;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
}

// ============================================
// HELPERS
// ============================================
export function createIntegration(
  playerId: string,
  type: IntegrationType,
  name: string,
  description: string
): Integration {
  return {
    id: `integration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    playerId,
    info: {
      type,
      name,
      description,
      version: '1.0.0',
      status: 'disconnected',
      enabled: false
    },
    config: {
      authentication: {
        type: 'oauth2'
      },
      sync: {
        enabled: false,
        interval: 60,
        bidirectional: false,
        dataTypes: [],
        filters: {
          includePrivate: false
        }
      },
      notifications: {
        enabled: false,
        events: []
      },
      format: {
        template: '',
        includeImages: false,
        includeLinks: false
      }
    },
    permissions: {
      read: {
        profile: false,
        activity: false,
        friends: false,
        content: false,
        statistics: false
      },
      write: {
        post: false,
        update: false,
        message: false,
        invite: false
      },
      custom: {}
    },
    statistics: {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      dataSynced: 0,
      lastSyncSize: 0,
      errorCount: 0
    },
    metadata: {
      platform: {
        id: '',
        name: '',
        version: ''
      },
      user: {
        id: '',
        username: ''
      },
      settings: {}
    }
  };
}

export function createDiscordIntegration(
  playerId: string,
  serverId: string
): DiscordIntegration {
  const base = createIntegration(playerId, 'discord', 'Discord', 'Integración con Discord');
  
  return {
    ...base,
    info: {
      ...base.info,
      type: 'discord'
    },
    config: {
      ...base.config,
      discord: {
        serverId,
        channels: {},
        roles: {
          linked: '',
          levelBased: {},
          achievementBased: {}
        },
        bot: {
          enabled: false,
          commands: false,
          presence: false
        },
        richPresence: {
          enabled: false,
          showLevel: true,
          showFaction: true,
          showActivity: true
        }
      }
    }
  };
}

export function createTwitchIntegration(
  playerId: string,
  channelId: string
): TwitchIntegration {
  const base = createIntegration(playerId, 'twitch', 'Twitch', 'Integración con Twitch');
  
  return {
    ...base,
    info: {
      ...base.info,
      type: 'twitch'
    },
    config: {
      ...base.config,
      twitch: {
        channelId,
        streaming: {
          enabled: false,
          autoStart: false,
          quality: '1080p',
          overlay: {
            showGameplay: true,
            showWebcam: false,
            showChat: true,
            showStats: false
          }
        },
        chat: {
          enabled: false,
          commands: false,
          moderation: false,
          customCommands: []
        },
        extensions: {
          leaderboard: false,
          predictions: false,
          polls: false,
          drops: false
        }
      }
    }
  };
}

export function connectIntegration(
  integration: Integration,
  authentication: Integration['config']['authentication']
): Integration {
  return {
    ...integration,
    info: {
      ...integration.info,
      status: 'connected',
      connectedAt: Date.now()
    },
    config: {
      ...integration.config,
      authentication
    }
  };
}

export function disconnectIntegration(integration: Integration): Integration {
  return {
    ...integration,
    info: {
      ...integration.info,
      status: 'disconnected',
      enabled: false
    },
    config: {
      ...integration.config,
      authentication: {
        type: 'oauth2'
      }
    }
  };
}

export function updateIntegrationPermissions(
  integration: Integration,
  permissions: Partial<Integration['permissions']>
): Integration {
  return {
    ...integration,
    permissions: {
      ...integration.permissions,
      ...permissions
    }
  };
}

export function getIntegrationByType(
  integrations: Integration[],
  type: IntegrationType
): Integration | undefined {
  return integrations.find(integration => integration.info.type === type);
}

export function getActiveIntegrations(integrations: Integration[]): Integration[] {
  return integrations.filter(integration => 
    integration.info.status === 'connected' && integration.info.enabled
  );
}

export function calculateIntegrationHealth(integration: Integration): number {
  const { statistics } = integration;
  
  if (statistics.totalRequests === 0) return 100;
  
  const successRate = statistics.successfulRequests / statistics.totalRequests;
  const errorPenalty = Math.min(statistics.errorCount * 0.1, 0.5);
  
  return Math.max(0, (successRate - errorPenalty) * 100);
}

export function createIntegrationWebhook(
  integrationId: string,
  url: string,
  events: string[]
): IntegrationWebhook {
  return {
    id: `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    integrationId,
    config: {
      url,
      events,
      format: 'json',
      headers: {}
    },
    transformation: {
      fieldMapping: {},
      filters: []
    },
    status: {
      active: true,
      created: Date.now(),
      totalSent: 0,
      totalFailed: 0,
      successRate: 0,
      lastErrors: []
    }
  };
}

export const IntegrationSystem = {
  PREDEFINED_INTEGRATIONS,
  createIntegration,
  createDiscordIntegration,
  createTwitchIntegration,
  connectIntegration,
  disconnectIntegration,
  updateIntegrationPermissions,
  getIntegrationByType,
  getActiveIntegrations,
  calculateIntegrationHealth,
  createIntegrationWebhook
};
