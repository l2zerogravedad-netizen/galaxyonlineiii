/**
 * SISTEMA DE CALENDARIO Y EVENTOS ESTACIONALES - GALAXY ONLINE II
 * Calendario en juego, eventos estacionales, festivales
 */

// ============================================
// TIPOS DE EVENTOS ESTACIONALES
// ============================================
export type SeasonalEventType = 
  | 'holiday'           // Festividad (Navidad, Año Nuevo, etc.)
  | 'season'            // Cambio de estación
  | 'festival'          // Festival temático
  | 'anniversary'       // Aniversario del juego
  | 'cosmetic_event'    // Evento cosmético
  | 'double_xp'         // Doble experiencia
  | 'resource_bonus'    // Bonificación de recursos
  | 'special_mission'   // Misión especial
  | 'tournament'        // Torneo especial
  | 'community_day'     // Día de la comunidad
  | 'charity_event'     // Evento benéfico
  | 'lore_event'        // Evento de lore
  | 'crossover';        // Evento crossover

export type EventFrequency = 'once' | 'yearly' | 'monthly' | 'weekly' | 'custom';

// ============================================
// EVENTO ESTACIONAL
// ============================================
export interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  
  // Temporalidad
  timing: {
    frequency: EventFrequency;
    startDate: number;
    endDate: number;
    timezone: string;
    
    // Recurrencia
    recurrence?: {
      type: 'yearly' | 'monthly' | 'weekly';
      interval: number;
      endDate?: number;
      daysOfWeek?: number[]; // 0-6 (Domingo-Sábado)
      dayOfMonth?: number;   // 1-31
      month?: number;       // 0-11
    };
    
    // Zonas horarias específicas
    regionOverrides?: {
      region: string;
      startDate: number;
      endDate: number;
    }[];
  };
  
  // Contenido del evento
  content: {
    theme: string;
    story?: string;
    visualTheme: {
      primaryColor: string;
      secondaryColor: string;
      backgroundImage?: string;
      musicTracks?: string[];
      particleEffects?: string[];
    };
    
    // Actividades
    activities: {
      id: string;
      name: string;
      type: 'mission' | 'minigame' | 'collection' | 'crafting' | 'social';
      description: string;
      requirements?: {
        minLevel: number;
        prerequisites: string[];
        faction?: string;
      };
      rewards: {
        experience?: number;
        currency?: number;
        items?: string[];
        cosmetics?: string[];
        titles?: string[];
      };
      repeatable: boolean;
      cooldown?: number; // segundos
    }[];
    
    // Tienda especial
    specialShop?: {
      id: string;
      name: string;
      items: {
        itemId: string;
        price: number;
        currency: 'credits' | 'premium' | 'event_currency';
        limited: boolean;
        maxPurchase?: number;
        discount?: number; // porcentaje
      }[];
      eventCurrency: {
        name: string;
        icon: string;
        sources: string[];
      };
    };
  };
  
  // Bonificaciones
  bonuses: {
    experienceMultiplier?: number;
    resourceMultipliers?: Record<string, number>;
    dropRateBonus?: number;
    craftingSpeedBonus?: number;
    researchSpeedBonus?: number;
    discountPercentage?: number;
  };
  
  // Logros del evento
  achievements: {
    id: string;
    name: string;
    description: string;
    requirement: {
      type: 'complete_activities' | 'collect_items' | 'reach_score' | 'social_interactions';
      target: number;
      parameters?: Record<string, any>;
    };
    rewards: {
      experience?: number;
      items?: string[];
      cosmetics?: string[];
      titles?: string[];
    };
    points: number; // puntos para tabla de clasificación
  }[];
  
  // Tabla de clasificación
  leaderboard?: {
    id: string;
    name: string;
    type: 'individual' | 'corporation' | 'alliance';
    scoring: 'points' | 'time' | 'completion';
    rewards: {
      rank: number;
      rewards: string[];
    }[];
    refreshInterval: number; // segundos
  };
  
  // Estado
  status: {
    active: boolean;
    visible: boolean;
    completed: boolean;
    
    // Participación
    participants: number;
    completionRate: number;
    
    // Configuración
    autoStart: boolean;
    autoEnd: boolean;
    sendReminders: boolean;
  };
  
  // Localización
  localization: {
    availableLanguages: string[];
    defaultLanguage: string;
    translations: Partial<Record<string, {
      name: string;
      description: string;
      story?: string;
    }>>;
  };
}

// ============================================
// CALENDARIO EN JUEGO
// ============================================
export interface GameCalendar {
  // Configuración
  config: {
    timezone: string;
    firstDayOfWeek: 'monday' | 'sunday';
    dateFormat: string;
    
    // Visibilidad
    showEvents: boolean;
    showHolidays: boolean;
    showPersonalEvents: boolean;
    showServerEvents: boolean;
  };
  
  // Eventos
  events: {
    // Estacionales
    seasonal: SeasonalEvent[];
    
    // Personales
    personal: {
      id: string;
      title: string;
      date: number;
      type: 'reminder' | 'appointment' | 'deadline' | 'celebration';
      description?: string;
      repeats?: 'daily' | 'weekly' | 'monthly' | 'yearly';
      notification: boolean;
    }[];
    
    // Del servidor
    server: {
      id: string;
      title: string;
      date: number;
      type: 'maintenance' | 'update' | 'tournament' | 'special_event';
      description: string;
      affects: string[]; // sistemas afectados
      duration?: number;
    }[];
  };
  
  // Vista actual
  currentView: {
    month: number; // 0-11
    year: number;
    selectedDate?: number;
  };
  
  // Filtros
  filters: {
    eventTypes: SeasonalEventType[];
    showCompleted: boolean;
    showInactive: boolean;
    regions: string[];
  };
}

// ============================================
// FESTIVIDADES PREDEFINIDAS
// ============================================
export const PREDEFINED_HOLIDAYS: SeasonalEvent[] = [
  {
    id: 'event_new_year_2025',
    name: 'Año Nuevo Galáctico 2025',
    description: 'Celebra el año nuevo con fuegos artificiales espaciales y recompensas especiales',
    timing: {
      frequency: 'yearly',
      startDate: new Date('2025-01-01T00:00:00Z').getTime(),
      endDate: new Date('2025-01-03T23:59:59Z').getTime(),
      timezone: 'UTC',
      recurrence: {
        type: 'yearly',
        interval: 1
      }
    },
    content: {
      theme: 'celebración espacial',
      story: 'La galaxia celebra un nuevo ciclo de exploración y conquista...',
      visualTheme: {
        primaryColor: '#FFD700',
        secondaryColor: '#FF6B6B',
        musicTracks: ['celebration_01', 'fireworks_ambient'],
        particleEffects: ['fireworks', 'sparkles']
      },
      activities: [
        {
          id: 'fireworks_display',
          name: 'Espectáculo de Fuegos Artificiales',
          type: 'social',
          description: 'Participa en el espectáculo de fuegos artificiales espaciales',
          rewards: {
            experience: 1000,
            currency: 500,
            cosmetics: ['new_year_hat_2025']
          },
          repeatable: true,
          cooldown: 3600
        }
      ],
      specialShop: {
        id: 'new_year_shop_2025',
        name: 'Tienda de Año Nuevo',
        items: [
          {
            itemId: 'fireworks_launcher_2025',
            price: 1000,
            currency: 'event_currency',
            limited: true,
            maxPurchase: 3
          }
        ],
        eventCurrency: {
          name: 'Estrellas de Año Nuevo',
          icon: '/icons/currency/star_2025.png',
          sources: ['fireworks_display', 'login_bonus']
        }
      }
    },
    bonuses: {
      experienceMultiplier: 1.5,
      resourceMultipliers: { credits: 1.25, materials: 1.25 },
      dropRateBonus: 0.1
    },
    achievements: [
      {
        id: 'new_year_celebrant',
        name: 'Celebrante del Año Nuevo',
        description: 'Participa en 3 actividades de Año Nuevo',
        requirement: {
          type: 'complete_activities',
          target: 3
        },
        rewards: {
          experience: 5000,
          cosmetics: ['new_year_title_2025'],
          titles: ['Celebrante del 2025']
        },
        points: 100
      }
    ],
    status: {
      active: false,
      visible: true,
      completed: false,
      participants: 0,
      completionRate: 0,
      autoStart: true,
      autoEnd: true,
      sendReminders: true
    },
    localization: {
      availableLanguages: ['es', 'en', 'de', 'fr'],
      defaultLanguage: 'es',
      translations: {}
    }
  },
  {
    id: 'event_winter_festival',
    name: 'Festival de Invierno',
    description: 'Festival invernal con nieve espacial y eventos temáticos',
    timing: {
      frequency: 'yearly',
      startDate: new Date('2024-12-15T00:00:00Z').getTime(),
      endDate: new Date('2025-01-15T23:59:59Z').getTime(),
      timezone: 'UTC',
      recurrence: {
        type: 'yearly',
        interval: 1
      }
    },
    content: {
      theme: 'invierno espacial',
      story: 'El invierno llega a la galaxia con nieve de cristal y auroras cósmicas...',
      visualTheme: {
        primaryColor: '#87CEEB',
        secondaryColor: '#4682B4',
        musicTracks: ['winter_wonderland', 'snow_ambient'],
        particleEffects: ['snow', 'aurora']
      },
      activities: [
        {
          id: 'snowball_fight',
          name: 'Batalla de Bolas de Nieve',
          type: 'minigame',
          description: 'Participa en batallas de bolas de nieve espaciales',
          requirements: {
            minLevel: 10,
            prerequisites: []
          },
          rewards: {
            experience: 500,
            currency: 250,
            items: ['snowball_launcher']
          },
          repeatable: true,
          cooldown: 1800
        }
      ]
    },
    bonuses: {
      experienceMultiplier: 1.25,
      resourceMultipliers: { ice_crystals: 2.0 }
    },
    achievements: [
      {
        id: 'winter_warrior',
        name: 'Guerrero del Invierno',
        description: 'Gana 10 batallas de bolas de nieve',
        requirement: {
          type: 'complete_activities',
          target: 10
        },
        rewards: {
          cosmetics: ['winter_warrior_badge'],
          titles: ['Guerrero Invernal']
        },
        points: 150
      }
    ],
    status: {
      active: false,
      visible: true,
      completed: false,
      participants: 0,
      completionRate: 0,
      autoStart: true,
      autoEnd: true,
      sendReminders: true
    },
    localization: {
      availableLanguages: ['es', 'en', 'de', 'fr'],
      defaultLanguage: 'es',
      translations: {}
    }
  }
];

// ============================================
// SISTEMA DE NOTIFICACIONES DE EVENTOS
// ============================================
export interface EventNotification {
  id: string;
  eventId: string;
  
  // Tipo de notificación
  type: 'starting_soon' | 'started' | 'ending_soon' | 'ended' | 'reminder' | 'achievement_unlocked';
  
  // Temporalidad
  timing: {
    triggerTime: number;
    advanceNotice?: number; // segundos antes del evento
  };
  
  // Contenido
  content: {
    title: string;
    message: string;
    icon?: string;
    image?: string;
    
    // Acciones
    actions?: {
      label: string;
      action: 'open_event' | 'view_calendar' | 'dismiss';
      data?: Record<string, any>;
    }[];
  };
  
  // Destinatarios
  recipients: {
    type: 'all' | 'participants' | 'eligible' | 'custom';
    criteria?: {
      minLevel?: number;
      previousParticipation?: boolean;
      preferences?: string[];
    };
    playerIds?: string[];
  };
  
  // Canales
  channels: ('in_game' | 'push' | 'email' | 'discord')[];
  
  // Estado
  status: {
    sent: boolean;
    sentAt?: number;
    delivered: number;
    opened: number;
    clicked: number;
  };
}

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================
export interface CalendarSystemConfig {
  // General
  general: {
    defaultTimezone: string;
    eventAdvanceNotice: number; // días
    maxActiveEvents: number;
    allowEventOverlap: boolean;
  };
  
  // Participación
  participation: {
    requireOptIn: boolean;
    autoEnrollNewPlayers: boolean;
    minLevelForEvents: number;
    trackParticipationStats: boolean;
  };
  
  // Notificaciones
  notifications: {
    enabled: boolean;
    channels: ('in_game' | 'push' | 'email' | 'discord')[];
    defaultAdvanceNotice: number; // horas
    
    // Tipos de notificaciones
    types: {
      startingSoon: boolean;
      started: boolean;
      endingSoon: boolean;
      ended: boolean;
      reminders: boolean;
      achievements: boolean;
    };
  };
  
  // Recompensas
  rewards: {
    autoDistribute: boolean;
    expireAfterDays: number;
    allowRedemptionLater: boolean;
    notifyOnReward: boolean;
  };
}

// ============================================
// HELPERS
// ============================================
export function createSeasonalEvent(
  name: string,
  description: string,
  startDate: Date,
  endDate: Date,
  type: SeasonalEventType
): SeasonalEvent {
  return {
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    timing: {
      frequency: 'once',
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
      timezone: 'UTC'
    },
    content: {
      theme: type,
      visualTheme: {
        primaryColor: '#4A90E2',
        secondaryColor: '#7B68EE'
      },
      activities: []
    },
    bonuses: {},
    achievements: [],
    status: {
      active: false,
      visible: true,
      completed: false,
      participants: 0,
      completionRate: 0,
      autoStart: true,
      autoEnd: true,
      sendReminders: true
    },
    localization: {
      availableLanguages: ['es'],
      defaultLanguage: 'es',
      translations: {}
    }
  };
}

export function isEventActive(event: SeasonalEvent, currentTime: number = Date.now()): boolean {
  return currentTime >= event.timing.startDate && currentTime <= event.timing.endDate;
}

export function getActiveEvents(events: SeasonalEvent[], currentTime: number = Date.now()): SeasonalEvent[] {
  return events.filter(event => isEventActive(event, currentTime) && event.status.active);
}

export function getUpcomingEvents(
  events: SeasonalEvent[],
  daysAhead: number = 7,
  currentTime: number = Date.now()
): SeasonalEvent[] {
  const cutoff = currentTime + (daysAhead * 24 * 60 * 60 * 1000);
  
  return events
    .filter(event => 
      event.timing.startDate > currentTime && 
      event.timing.startDate <= cutoff &&
      event.status.visible
    )
    .sort((a, b) => a.timing.startDate - b.timing.startDate);
}

export function getEventsInMonth(
  events: SeasonalEvent[],
  year: number,
  month: number // 0-11
): SeasonalEvent[] {
  const monthStart = new Date(year, month, 1).getTime();
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59).getTime();
  
  return events.filter(event => {
    // Eventos que ocurren durante este mes
    return (event.timing.startDate <= monthEnd && event.timing.endDate >= monthStart) ||
           // Eventos recurrentes que caen en este mes
           (event.timing.recurrence && shouldRecurInMonth(event, year, month));
  });
}

function shouldRecurInMonth(event: SeasonalEvent, year: number, month: number): boolean {
  if (!event.timing.recurrence) return false;
  
  const recurrence = event.timing.recurrence;
  
  if (recurrence.type === 'yearly' && recurrence.month === month) {
    return true;
  }
  
  if (recurrence.type === 'monthly') {
    return true;
  }
  
  return false;
}

export function calculateEventProgress(event: SeasonalEvent, currentTime: number = Date.now()): number {
  if (!isEventActive(event, currentTime)) {
    return currentTime < event.timing.startDate ? 0 : 100;
  }
  
  const total = event.timing.endDate - event.timing.startDate;
  const elapsed = currentTime - event.timing.startDate;
  
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

export function formatEventDuration(startDate: number, endDate: number): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const diffMs = endDate - startDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} día${diffDays > 1 ? 's' : ''}${diffHours > 0 ? ` y ${diffHours} hora${diffHours > 1 ? 's' : ''}` : ''}`;
  } else if (diffHours > 0) {
    return `${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  } else {
    return 'Menos de 1 hora';
  }
}

export function createEventNotification(
  eventId: string,
  type: EventNotification['type'],
  title: string,
  message: string,
  triggerTime: number
): EventNotification {
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    eventId,
    type,
    timing: {
      triggerTime
    },
    content: {
      title,
      message,
      actions: [{
        label: 'Ver Evento',
        action: 'open_event',
        data: { eventId }
      }]
    },
    recipients: {
      type: 'eligible'
    },
    channels: ['in_game', 'push'],
    status: {
      sent: false,
      delivered: 0,
      opened: 0,
      clicked: 0
    }
  };
}

export const CalendarSystem = {
  PREDEFINED_HOLIDAYS,
  createSeasonalEvent,
  isEventActive,
  getActiveEvents,
  getUpcomingEvents,
  getEventsInMonth,
  calculateEventProgress,
  formatEventDuration,
  createEventNotification
};
