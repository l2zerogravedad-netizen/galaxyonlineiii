/**
 * SISTEMA DE NOTIFICACIONES Y ALERTAS - GALAXY ONLINE II
 * Notificaciones push, alertas en juego, sistema de recordatorios
 */

// ============================================
// TIPOS DE NOTIFICACIONES
// ============================================
export type NotificationType = 
  | 'system'           // Sistema
  | 'game'             // Juego
  | 'social'           // Social
  | 'combat'           // Combate
  | 'economy'          // Económico
  | 'mission'          // Misión
  | 'achievement'      // Logro
  | 'event'            // Evento
  | 'maintenance'      // Mantenimiento
  | 'security'         // Seguridad
  | 'promotion'        // Promoción
  | 'reminder'         // Recordatorio
  | 'update'           // Actualización
  | 'custom';          // Personalizado

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';

export type NotificationChannel = 'in_game' | 'push' | 'email' | 'sms' | 'discord' | 'webhook';

// ============================================
// NOTIFICACIÓN
// ============================================
export interface Notification {
  id: string;
  playerId: string;
  
  // Información básica
  info: {
    type: NotificationType;
    priority: NotificationPriority;
    category: string;
    
    // Título y contenido
    title: string;
    message: string;
    description?: string;
    
    // Acciones
    actions?: {
      id: string;
      label: string;
      type: 'button' | 'link' | 'input' | 'confirm';
      style: 'primary' | 'secondary' | 'danger' | 'success';
      url?: string;
      data?: Record<string, any>;
    }[];
    
    // Iconos y media
    icon?: string;
    image?: string;
    video?: string;
    sound?: string;
  };
  
  // Temporalidad
  timing: {
    createdAt: number;
    scheduledFor?: number;
    expiresAt?: number;
    
    // Recordatorios
    reminders?: {
      at: number;
      message?: string;
    }[];
    
    // Repetición
    repeat?: {
      type: 'daily' | 'weekly' | 'monthly' | 'custom';
      interval: number;
      endDate?: number;
    };
  };
  
  // Entrega
  delivery: {
    // Canales
    channels: NotificationChannel[];
    
    // Estado por canal
    status: Record<NotificationChannel, {
      sent: boolean;
      sentAt?: number;
      delivered: boolean;
      deliveredAt?: number;
      read: boolean;
      readAt?: number;
      failed: boolean;
      error?: string;
    }>;
    
    // Configuración específica
    channelConfig: Partial<Record<NotificationChannel, {
      // Push
      push?: {
        title: string;
        body: string;
        badge?: string;
        sound?: string;
        data?: Record<string, any>;
      };
      
      // Email
      email?: {
        subject: string;
        template: string;
        variables: Record<string, any>;
      };
      
      // SMS
      sms?: {
        message: string;
        shortened: boolean;
      };
      
      // Discord
      discord?: {
        channelId: string;
        embed: {
          title: string;
          description: string;
          color: number;
          fields?: Array<{
            name: string;
            value: string;
            inline?: boolean;
          }>;
        };
      };
    }>>;
  };
  
  // Contexto
  context: {
    // Origen
    source: {
      system: string;
      component?: string;
      feature?: string;
    };
    
    // Datos relacionados
    relatedData: {
      type: string;
      id: string;
      data?: Record<string, any>;
    }[];
    
    // Ubicación
    location?: {
      system: string;
      planet?: string;
      coordinates: { x: number; y: number; z: number };
    };
  };
  
  // Personalización
  personalization: {
    // Idioma
    language: string;
    
    // Zona horaria
    timezone: string;
    
    // Preferencias
    preferences: {
      quietHours: {
        enabled: boolean;
        start: string; // HH:MM
        end: string;   // HH:MM
      };
      doNotDisturb: boolean;
      frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
    };
  };
  
  // Interacción
  interaction: {
    // Estado
    read: boolean;
    readAt?: number;
    
    // Acciones del usuario
    userActions: {
      actionId: string;
      timestamp: number;
      data?: Record<string, any>;
    }[];
    
    // Feedback
    feedback?: {
      type: 'helpful' | 'not_helpful' | 'spam' | 'inappropriate';
      timestamp: number;
      comment?: string;
    };
  };
  
  // Estado
  status: {
    active: boolean;
    cancelled: boolean;
    completed: boolean;
    
    // Contadores
    sentCount: number;
    readCount: number;
    actionCount: number;
    
    // Moderación
    moderated: boolean;
    moderatedAt?: number;
    moderatedBy?: string;
    reason?: string;
  };
}

// ============================================
// PLANTILLA DE NOTIFICACIÓN
// ============================================
export interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  
  // Tipo
  type: NotificationType;
  category: string;
  
  // Contenido
  content: {
    // Variables
    variables: {
      name: string;
      type: 'string' | 'number' | 'boolean' | 'date' | 'object';
      required: boolean;
      defaultValue?: any;
      description: string;
    }[];
    
    // Plantillas
    templates: {
      language: string;
      title: string;
      message: string;
      description?: string;
    }[];
    
    // Acciones
    actions: {
      id: string;
      label: string;
      type: string;
      condition?: string; // expresión para mostrar
    }[];
  };
  
  // Configuración
  config: {
    // Prioridad por defecto
    defaultPriority: NotificationPriority;
    
    // Canales por defecto
    defaultChannels: NotificationChannel[];
    
    // Tiempo de vida
    ttl?: number; // segundos
    
    // Repetición
    allowRepeat: boolean;
    repeatInterval?: number; // segundos
  };
  
  // Condiciones
  conditions: {
    // Cuándo usar esta plantilla
    triggers: {
      event: string;
      conditions: Record<string, any>;
    }[];
    
    // Audiencia
    audience: {
      type: 'all' | 'segment' | 'individual';
      criteria?: Record<string, any>;
    };
  };
  
  // Localización
  localization: {
    supportedLanguages: string[];
    defaultLanguage: string;
    autoTranslate: boolean;
  };
}

// ============================================
// SISTEMA DE SUSCRIPCIÓN
// ============================================
export interface NotificationSubscription {
  id: string;
  playerId: string;
  
  // Configuración
  config: {
    // Canales habilitados
    enabledChannels: NotificationChannel[];
    
    // Tipos de notificación
    notificationTypes: {
      type: NotificationType;
      enabled: boolean;
      channels: NotificationChannel[];
      priority: NotificationPriority;
    }[];
    
    // Horario
    schedule: {
      quietHours: {
        enabled: boolean;
        start: string;
        end: string;
        timezone: string;
      };
      
      // Frecuencia
      batchFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
      
      // Límites
      maxPerDay: number;
      maxPerHour: number;
    };
  };
  
  // Preferencias específicas
  preferences: {
    // Sonido
    sound: {
      enabled: boolean;
      volume: number;
      customSound?: string;
    };
    
    // Visual
    visual: {
      enabled: boolean;
      position: 'top_right' | 'top_left' | 'bottom_right' | 'bottom_left' | 'center';
      duration: number; // segundos
      animation: 'fade' | 'slide' | 'bounce' | 'none';
    };
    
    // Vibración
    vibration: {
      enabled: boolean;
      pattern: number[]; // patrón de vibración
    };
    
    // Resumen
    summary: {
      enabled: boolean;
      frequency: 'daily' | 'weekly';
      time: string; // HH:MM
    };
  };
  
  // Segmentos
  segments: {
    id: string;
    name: string;
    conditions: Record<string, any>;
    enabled: boolean;
  }[];
  
  // Estado
  status: {
    active: boolean;
    created: number;
    lastModified: number;
    
    // Estadísticas
    totalReceived: number;
    totalRead: number;
    totalActed: number;
  };
}

// ============================================
// CAMPAÑA DE NOTIFICACIONES
// ============================================
export interface NotificationCampaign {
  id: string;
  name: string;
  description: string;
  
  // Configuración
  config: {
    // Tipo de campaña
    type: 'announcement' | 'promotion' | 'reminder' | 'survey' | 'emergency';
    
    // Audiencia
    audience: {
      type: 'all' | 'segment' | 'individual' | 'custom';
      criteria?: Record<string, any>;
      playerIds?: string[];
      
      // Exclusiones
      excludeCriteria?: Record<string, any>;
      excludePlayerIds?: string[];
    };
    
    // Temporalidad
    schedule: {
      startAt: number;
      endAt?: number;
      
      // Envío por lotes
      batchSize: number;
      batchDelay: number; // segundos entre lotes
      
      // Zonas horarias
      respectTimezones: boolean;
      optimalSendTime: boolean;
    };
  };
  
  // Contenido
  content: {
    // Plantilla base
    template: string;
    
    // Personalización
    personalization: {
      variables: Record<string, any>;
      dynamicContent: {
        condition: string;
        content: any;
      }[];
    };
    
    // Pruebas A/B
    abTest?: {
      enabled: boolean;
      variants: {
        id: string;
        weight: number; // 0-1
        content: any;
      }[];
    };
  };
  
  // Entrega
  delivery: {
    // Canales
    channels: NotificationChannel[];
    
    // Prioridad
    priority: NotificationPriority;
    
    // Reintentos
    retries: {
      maxAttempts: number;
      backoff: 'linear' | 'exponential';
      delay: number;
    };
    
    // Limitación
    rateLimit: {
      perSecond: number;
      perMinute: number;
      perHour: number;
    };
  };
  
  // Seguimiento
  tracking: {
    // Métricas
    metrics: {
      sent: number;
      delivered: number;
      read: number;
      clicked: number;
      converted: number;
      failed: number;
    };
    
    // Eventos
    events: {
      playerId: string;
      event: string;
      timestamp: number;
      data?: Record<string, any>;
    }[];
    
    // Conversiones
    conversions: {
      type: string;
      count: number;
      revenue?: number;
    }[];
  };
  
  // Estado
  status: {
    created: number;
    createdBy: string;
    
    // Estados
    draft: boolean;
    scheduled: boolean;
    active: boolean;
    paused: boolean;
    completed: boolean;
    cancelled: boolean;
    
    // Timestamps
    startedAt?: number;
    completedAt?: number;
    cancelledAt?: number;
    
    // Progreso
    progress: {
      total: number;
      sent: number;
      delivered: number;
      failed: number;
      percentage: number;
    };
  };
}

// ============================================
// CENTRO DE NOTIFICACIONES
// ============================================
export interface NotificationCenter {
  // Configuración
  config: {
    // General
    maxNotifications: number;
    retentionDays: number;
    
    // Agrupación
    grouping: {
      enabled: boolean;
      maxGroupSize: number;
      groupBy: 'type' | 'source' | 'priority' | 'time';
    };
    
    // Filtrado
    filtering: {
      spamFilter: boolean;
      duplicateFilter: boolean;
      relevanceFilter: boolean;
    };
  };
  
  // Notificaciones
  notifications: Notification[];
  
  // Categorías
  categories: {
    id: string;
    name: string;
    color: string;
    icon: string;
    priority: NotificationPriority;
    channels: NotificationChannel[];
  }[];
  
  // Filtros activos
  filters: {
    types: NotificationType[];
    priorities: NotificationPriority[];
    dateRange?: {
      start: number;
      end: number;
    };
    read: boolean | null;
    search?: string;
  };
  
  // Estadísticas
  statistics: {
    total: number;
    unread: number;
    byType: Record<NotificationType, number>;
    byPriority: Record<NotificationPriority, number>;
    byChannel: Record<NotificationChannel, number>;
  };
  
  // Configuración de usuario
  userSettings: {
    playerId: string;
    subscriptions: NotificationSubscription[];
    preferences: {
      sound: boolean;
      vibration: boolean;
      desktop: boolean;
      mobile: boolean;
    };
  };
}

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================
export interface NotificationSystemConfig {
  // General
  general: {
    maxNotificationsPerPlayer: number;
    defaultRetentionDays: number;
    batchSize: number;
    
    // Limites
    rateLimitPerPlayer: number;
    rateLimitGlobal: number;
  };
  
  // Canales
  channels: {
    // Push
    push: {
      enabled: boolean;
      provider: 'fcm' | 'apns' | 'web';
      credentials: Record<string, any>;
      ttl: number;
    };
    
    // Email
    email: {
      enabled: boolean;
      provider: 'smtp' | 'ses' | 'sendgrid';
      templates: string;
      maxPerHour: number;
    };
    
    // SMS
    sms: {
      enabled: boolean;
      provider: 'twilio' | 'aws_sns';
      maxPerDay: number;
    };
    
    // Discord
    discord: {
      enabled: boolean;
      botToken: string;
      maxChannels: number;
    };
  };
  
  // Seguridad
  security: {
    // Autenticación
    requireAuth: boolean;
    
    // Validación
    validateRecipients: boolean;
    preventSpoofing: boolean;
    
    // Moderación
    autoModeration: boolean;
    blockedWords: string[];
  };
  
  // Análisis
  analytics: {
    enabled: boolean;
    trackEvents: boolean;
    trackConversions: boolean;
    
    // Reportes
    reportFrequency: 'hourly' | 'daily' | 'weekly';
    retentionDays: number;
  };
}

// ============================================
// HELPERS
// ============================================
export function createNotification(
  playerId: string,
  type: NotificationType,
  title: string,
  message: string,
  priority: NotificationPriority = 'medium'
): Notification {
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    playerId,
    info: {
      type,
      priority,
      category: 'general',
      title,
      message
    },
    timing: {
      createdAt: Date.now()
    },
    delivery: {
      channels: ['in_game'],
      status: {
        in_game: { sent: false, delivered: false, read: false, failed: false },
        push: { sent: false, delivered: false, read: false, failed: false },
        email: { sent: false, delivered: false, read: false, failed: false },
        sms: { sent: false, delivered: false, read: false, failed: false },
        discord: { sent: false, delivered: false, read: false, failed: false },
        webhook: { sent: false, delivered: false, read: false, failed: false }
      },
      channelConfig: {}
    },
    context: {
      source: {
        system: 'game'
      },
      relatedData: []
    },
    personalization: {
      language: 'es',
      timezone: 'UTC',
      preferences: {
        quietHours: { enabled: false, start: '22:00', end: '08:00' },
        doNotDisturb: false,
        frequency: 'immediate'
      }
    },
    interaction: {
      read: false,
      userActions: []
    },
    status: {
      active: true,
      cancelled: false,
      completed: false,
      sentCount: 0,
      readCount: 0,
      actionCount: 0,
      moderated: false
    }
  };
}

export function scheduleNotification(
  notification: Notification,
  scheduledFor: number
): Notification {
  return {
    ...notification,
    timing: {
      ...notification.timing,
      scheduledFor
    }
  };
}

export function addNotificationAction(
  notification: Notification,
  action: NonNullable<Notification['info']['actions']>[0]
): Notification {
  return {
    ...notification,
    info: {
      ...notification.info,
      actions: [...(notification.info.actions || []), action]
    }
  };
}

export function markNotificationAsRead(
  notification: Notification,
  timestamp: number = Date.now()
): Notification {
  return {
    ...notification,
    interaction: {
      ...notification.interaction,
      read: true,
      readAt: timestamp
    },
    status: {
      ...notification.status,
      readCount: notification.status.readCount + 1
    }
  };
}

export function recordNotificationAction(
  notification: Notification,
  actionId: string,
  data?: Record<string, any>
): Notification {
  return {
    ...notification,
    interaction: {
      ...notification.interaction,
      userActions: [
        ...notification.interaction.userActions,
        {
          actionId,
          timestamp: Date.now(),
          data
        }
      ]
    },
    status: {
      ...notification.status,
      actionCount: notification.status.actionCount + 1
    }
  };
}

export function filterNotifications(
  notifications: Notification[],
  filters: NotificationCenter['filters']
): Notification[] {
  return notifications.filter(notification => {
    // Filtrar por tipo
    if (filters.types.length > 0 && !filters.types.includes(notification.info.type)) {
      return false;
    }
    
    // Filtrar por prioridad
    if (filters.priorities.length > 0 && !filters.priorities.includes(notification.info.priority)) {
      return false;
    }
    
    // Filtrar por rango de fechas
    if (filters.dateRange) {
      if (notification.timing.createdAt < filters.dateRange.start ||
          notification.timing.createdAt > filters.dateRange.end) {
        return false;
      }
    }
    
    // Filtrar por estado de lectura
    if (filters.read !== null && notification.interaction.read !== filters.read) {
      return false;
    }
    
    // Filtrar por búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = notification.info.title.toLowerCase().includes(searchLower);
      const messageMatch = notification.info.message.toLowerCase().includes(searchLower);
      
      if (!titleMatch && !messageMatch) {
        return false;
      }
    }
    
    return true;
  });
}

export function getUnreadCount(notifications: Notification[]): number {
  return notifications.filter(notification => !notification.interaction.read).length;
}

export function groupNotifications(
  notifications: Notification[],
  groupBy: 'type' | 'source' | 'priority' | 'time'
): Record<string, Notification[]> {
  const groups: Record<string, Notification[]> = {};
  
  notifications.forEach(notification => {
    let key: string;
    
    switch (groupBy) {
      case 'type':
        key = notification.info.type;
        break;
      case 'source':
        key = notification.context.source.system;
        break;
      case 'priority':
        key = notification.info.priority;
        break;
      case 'time':
        const date = new Date(notification.timing.createdAt);
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        break;
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    
    groups[key].push(notification);
  });
  
  return groups;
}

export function createNotificationTemplate(
  name: string,
  type: NotificationType,
  templates: NotificationTemplate['content']['templates']
): NotificationTemplate {
  return {
    id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description: '',
    type,
    category: 'general',
    content: {
      variables: [],
      templates,
      actions: []
    },
    config: {
      defaultPriority: 'medium',
      defaultChannels: ['in_game'],
      allowRepeat: false
    },
    conditions: {
      triggers: [],
      audience: {
        type: 'all'
      }
    },
    localization: {
      supportedLanguages: ['es'],
      defaultLanguage: 'es',
      autoTranslate: false
    }
  };
}

export const NotificationSystem = {
  createNotification,
  scheduleNotification,
  addNotificationAction,
  markNotificationAsRead,
  recordNotificationAction,
  filterNotifications,
  getUnreadCount,
  groupNotifications,
  createNotificationTemplate
};
