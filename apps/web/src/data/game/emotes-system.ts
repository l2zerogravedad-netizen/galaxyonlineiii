/**
 * SISTEMA DE EMOTES Y ANIMACIONES - GALAXY ONLINE II
 * Emotes, gestos, animaciones sociales, bailes
 */

// ============================================
// TIPOS DE EMOTES
// ============================================
export type EmoteCategory = 
  | 'greeting'         // Saludos
  | 'farewell'         // Despedidas
  | 'celebration'      // Celebraciones
  | 'approval'         // Aprobación
  | 'disapproval'      // Desaprobación
  | 'dance'            // Bailes
  | 'military'         // Militares
  | 'humor'            // Humorísticos
  | 'romantic'         // Románticos
  | 'aggressive'       // Agresivos
  | 'respect'          // Respeto
  | 'victory'          // Victoria
  | 'defeat'           // Derrota
  | 'custom';          // Personalizados

export type EmoteRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'exclusive';

// ============================================
// EMOTE
// ============================================
export interface Emote {
  id: string;
  name: string;
  description: string;
  
  // Categoría
  category: EmoteCategory;
  rarity: EmoteRarity;
  
  // Animación
  animation: {
    // Archivos
    animationFile: string;
    duration: number; // segundos
    
    // Loop
    loop: boolean;
    loopDuration?: number;
    
    // Transiciones
    enterTransition: number; // segundos
    exitTransition: number;  // segundos
    
    // Partes del cuerpo
    bodyParts: {
      head?: boolean;
      torso?: boolean;
      arms?: boolean;
      legs?: boolean;
      hands?: boolean;
      fullBody?: boolean;
    };
    
    // Sincronización
    syncWithMusic?: boolean;
    tempo?: number; // BPM
  };
  
  // Audio
  audio?: {
    soundFile: string;
    volume: number; // 0-1
    pitch: number;  // 0.5-2.0
    loop: boolean;
    spatial: boolean; // audio 3D
  };
  
  // Efectos visuales
  effects?: {
    particles: {
      type: 'sparkles' | 'hearts' | 'flames' | 'energy' | 'smoke' | 'confetti';
      emitPoint: 'hands' | 'feet' | 'head' | 'body' | 'around';
      color: string;
      intensity: number;
    }[];
    
    lights: {
      type: 'point' | 'spot' | 'area';
      color: string;
      intensity: number;
      radius: number;
    }[];
    
    projections: {
      image: string;
      size: number;
      duration: number;
      position: 'above' | 'below' | 'front' | 'behind';
    }[];
  };
  
  // Restricciones
  restrictions: {
    minLevel?: number;
    requiredFaction?: string;
    requiredRank?: string;
    exclusiveWith?: string[]; // IDs de emotes incompatibles
    
    // Contexto
    allowedInCombat: boolean;
    allowedInMenu: boolean;
    allowedInSocial: boolean;
  };
  
  // Adquisición
  acquisition: {
    type: 'default' | 'purchase' | 'achievement' | 'event' | 'promotion' | 'gift';
    
    // Compra
    price?: {
      currency: 'credits' | 'premium' | 'faction_tokens' | 'event_currency';
      amount: number;
    };
    
    // Logro
    achievement?: {
      id: string;
      name: string;
    };
    
    // Evento
    event?: {
      id: string;
      requirement: string;
    };
  };
  
  // Social
  social: {
    // Interacciones
    canTargetPlayer: boolean;
    canTargetObject: boolean;
    requiresTarget: boolean;
    
    // Respuestas
    triggerResponses: string[]; // IDs de emotes que responde
    
    // Popularidad
    usageCount: number;
    favoriteCount: number;
  };
  
  // Localización
  localization: {
    availableLanguages: string[];
    defaultLanguage: string;
    translations: Partial<Record<string, {
      name: string;
      description: string;
    }>>;
  };
  
  // Estado
  status: {
    active: boolean;
    visible: boolean;
    new: boolean;
    limitedTime?: boolean;
    expiresAt?: number;
  };
}

// ============================================
// SECUENCIA DE EMOTES
// ============================================
export interface EmoteSequence {
  id: string;
  name: string;
  description: string;
  
  // Emotes en secuencia
  emotes: {
    emoteId: string;
    delay: number; // segundos desde el inicio
    duration?: number; // override de duración
    loop?: boolean;   // override de loop
  }[];
  
  // Configuración
  config: {
    autoPlay: boolean;
    interruptible: boolean;
    loopSequence: boolean;
    
    // Transiciones
    transitionType: 'cut' | 'fade' | 'blend';
    transitionDuration: number;
  };
  
  // Gatillos
  triggers: {
    type: 'manual' | 'victory' | 'defeat' | 'level_up' | 'achievement' | 'custom';
    conditions?: Record<string, any>;
  }[];
}

// ============================================
// BAILE PERSONALIZADO
// ============================================
export interface CustomDance {
  id: string;
  name: string;
  creator: string;
  
  // Coreografía
  choreography: {
    duration: number;
    tempo: number; // BPM
    
    // Pasos
    steps: {
      startTime: number;
      endTime: number;
      moveType: 'body' | 'arms' | 'legs' | 'head' | 'hands' | 'full';
      intensity: number; // 0-1
      description: string;
    }[];
    
    // Transiciones
    transitions: {
      fromStep: number;
      toStep: number;
      type: 'smooth' | 'sharp' | 'bounce' | 'slide';
      duration: number;
    }[];
  };
  
  // Música
  music: {
    track?: string;
    customBeat?: boolean;
    beatPattern: {
      beats: number[];
      signature: string;
    };
  };
  
  // Efectos
  effects: {
    particleEffects: string[];
    lightEffects: string[];
    soundEffects: string[];
  };
  
  // Compartición
  sharing: {
    public: boolean;
    shareCode: string;
    downloads: number;
    rating: number;
    tags: string[];
  };
  
  // Estado
  status: {
    created: number;
    lastModified: number;
    verified: boolean;
    featured: boolean;
    reports: number;
  };
}

// ============================================
// SISTEMA DE GESTOS
// ============================================
export interface Gesture {
  id: string;
  name: string;
  
  // Tipo de gesto
  type: 'hand' | 'head' | 'body' | 'facial' | 'combination';
  
  // Animación
  animation: {
    file: string;
    duration: number;
    intensity: number; // 0-1
    
    // Control
    holdToAnimate: boolean;
    cancelOnMove: boolean;
  };
  
  // Contexto
  context: {
    // Cuándo se puede usar
    situations: ('combat' | 'social' | 'menu' | 'exploration')[];
    
    // Objetivo
    target: 'none' | 'self' | 'player' | 'object' | 'location';
  };
  
  // Combinaciones
  combinations?: {
    gesture1: string;
    gesture2: string;
    result: string; // ID del emote resultante
  }[];
}

// ============================================
// CATÁLOGO DE EMOTES
// ============================================
export interface EmoteCatalog {
  // Categorías
  categories: {
    id: EmoteCategory;
    name: string;
    description: string;
    icon: string;
    color: string;
    featured: boolean;
  }[];
  
  // Emotes disponibles
  emotes: Emote[];
  
  // Filtros
  filters: {
    rarity: EmoteRarity[];
    category: EmoteCategory[];
    priceRange: {
      min: number;
      max: number;
    };
    new: boolean;
    onSale: boolean;
  };
  
  // Búsqueda
  search: {
    query: string;
    results: Emote[];
    suggestions: string[];
  };
  
  // Destacados
  featured: {
    weekly: Emote[];
    new: Emote[];
    popular: Emote[];
    seasonal: Emote[];
  };
}

// ============================================
// EMOTES PREDEFINIDOS
// ============================================
export const PREDEFINED_EMOTES: Emote[] = [
  {
    id: 'emote_salute_military',
    name: 'Saludo Militar',
    description: 'Saludo militar formal',
    category: 'military',
    rarity: 'common',
    animation: {
      animationFile: '/animations/emotes/salute_military.fbx',
      duration: 2.0,
      loop: false,
      enterTransition: 0.2,
      exitTransition: 0.3,
      bodyParts: {
        arms: true,
        head: true
      }
    },
    audio: {
      soundFile: '/audio/emotes/salute.wav',
      volume: 0.3,
      pitch: 1.0,
      loop: false,
      spatial: false
    },
    restrictions: {
      allowedInCombat: false,
      allowedInMenu: true,
      allowedInSocial: true
    },
    acquisition: {
      type: 'default'
    },
    social: {
      canTargetPlayer: true,
      canTargetObject: false,
      requiresTarget: false,
      triggerResponses: ['emote_salute_return'],
      usageCount: 0,
      favoriteCount: 0
    },
    localization: {
      availableLanguages: ['es', 'en', 'de', 'fr'],
      defaultLanguage: 'es',
      translations: {}
    },
    status: {
      active: true,
      visible: true,
      new: false
    }
  },
  {
    id: 'emote_dance_robot',
    name: 'Baile del Robot',
    description: 'Clásico baile de robot',
    category: 'dance',
    rarity: 'uncommon',
    animation: {
      animationFile: '/animations/emotes/dance_robot.fbx',
      duration: 8.0,
      loop: true,
      loopDuration: 8.0,
      enterTransition: 0.5,
      exitTransition: 0.5,
      bodyParts: {
        fullBody: true
      }
    },
    audio: {
      soundFile: '/audio/emotes/robot_beat.wav',
      volume: 0.4,
      pitch: 1.0,
      loop: true,
      spatial: false
    },
    effects: {
      particles: [
        {
          type: 'energy',
          emitPoint: 'hands',
          color: '#00FFFF',
          intensity: 0.5
        }
      ],
      lights: [],
      projections: []
    },
    restrictions: {
      minLevel: 5,
      allowedInCombat: false,
      allowedInMenu: false,
      allowedInSocial: true
    },
    acquisition: {
      type: 'purchase',
      price: {
        currency: 'credits',
        amount: 1000
      }
    },
    social: {
      canTargetPlayer: false,
      canTargetObject: false,
      requiresTarget: false,
      triggerResponses: [],
      usageCount: 0,
      favoriteCount: 0
    },
    localization: {
      availableLanguages: ['es', 'en', 'de', 'fr'],
      defaultLanguage: 'es',
      translations: {}
    },
    status: {
      active: true,
      visible: true,
      new: false
    }
  },
  {
    id: 'emote_victory_champion',
    name: 'Victoria de Campeón',
    description: 'Celebración épica de victoria',
    category: 'victory',
    rarity: 'epic',
    animation: {
      animationFile: '/animations/emotes/victory_champion.fbx',
      duration: 5.0,
      loop: false,
      enterTransition: 0.3,
      exitTransition: 0.5,
      bodyParts: {
        fullBody: true
      }
    },
    audio: {
      soundFile: '/audio/emotes/victory_fanfare.wav',
      volume: 0.6,
      pitch: 1.0,
      loop: false,
      spatial: false
    },
    effects: {
      particles: [
        {
          type: 'confetti',
          emitPoint: 'around',
          color: '#FFD700',
          intensity: 1.0
        },
        {
          type: 'sparkles',
          emitPoint: 'body',
          color: '#FFFFFF',
          intensity: 0.8
        }
      ],
      lights: [
        {
          type: 'point',
          color: '#FFD700',
          intensity: 2.0,
          radius: 5.0
        }
      ],
      projections: [
        {
          image: '/textures/emotes/crown.png',
          size: 2.0,
          duration: 5.0,
          position: 'above'
        }
      ]
    },
    restrictions: {
      minLevel: 20,
      allowedInCombat: true,
      allowedInMenu: false,
      allowedInSocial: true
    },
    acquisition: {
      type: 'achievement',
      achievement: {
        id: 'first_pvp_victory',
        name: 'Primera Victoria PvP'
      }
    },
    social: {
      canTargetPlayer: false,
      canTargetObject: false,
      requiresTarget: false,
      triggerResponses: [],
      usageCount: 0,
      favoriteCount: 0
    },
    localization: {
      availableLanguages: ['es', 'en', 'de', 'fr'],
      defaultLanguage: 'es',
      translations: {}
    },
    status: {
      active: true,
      visible: true,
      new: false
    }
  }
];

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================
export interface EmoteSystemConfig {
  // General
  general: {
    maxActiveEmotes: number;
    emoteCooldown: number; // segundos
    allowCustomEmotes: boolean;
    allowEmoteSequences: boolean;
  };
  
  // Social
  social: {
    allowTargeting: boolean;
    showEmoteHistory: boolean;
    allowEmoteReactions: boolean;
    maxFavorites: number;
  };
  
  // Contenido
  content: {
    autoApproveCustomEmotes: boolean;
    requireVerificationForDances: boolean;
    maxCustomDanceDuration: number; // segundos
    allowEmoteSharing: boolean;
  };
  
  // Moderación
  moderation: {
    filterInappropriateEmotes: boolean;
    allowReporting: boolean;
    autoHideReportedEmotes: boolean;
    reviewRequiredForCustom: boolean;
  };
}

// ============================================
// HELPERS
// ============================================
export function createEmote(
  name: string,
  description: string,
  category: EmoteCategory,
  rarity: EmoteRarity
): Emote {
  return {
    id: `emote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    category,
    rarity,
    animation: {
      animationFile: '',
      duration: 2.0,
      loop: false,
      enterTransition: 0.2,
      exitTransition: 0.2,
      bodyParts: {}
    },
    restrictions: {
      allowedInCombat: true,
      allowedInMenu: true,
      allowedInSocial: true
    },
    acquisition: {
      type: 'purchase'
    },
    social: {
      canTargetPlayer: false,
      canTargetObject: false,
      requiresTarget: false,
      triggerResponses: [],
      usageCount: 0,
      favoriteCount: 0
    },
    localization: {
      availableLanguages: ['es'],
      defaultLanguage: 'es',
      translations: {}
    },
    status: {
      active: true,
      visible: true,
      new: false
    }
  };
}

export function canPlayerUseEmote(
  emote: Emote,
  playerLevel: number,
  playerFaction?: string,
  playerRank?: string
): boolean {
  // Verificar nivel
  if (emote.restrictions.minLevel && playerLevel < emote.restrictions.minLevel) {
    return false;
  }
  
  // Verificar facción
  if (emote.restrictions.requiredFaction && 
      playerFaction !== emote.restrictions.requiredFaction) {
    return false;
  }
  
  // Verificar rango
  if (emote.restrictions.requiredRank && 
      playerRank !== emote.restrictions.requiredRank) {
    return false;
  }
  
  return true;
}

export function getEmotesByCategory(emotes: Emote[], category: EmoteCategory): Emote[] {
  return emotes.filter(emote => emote.category === category);
}

export function getEmotesByRarity(emotes: Emote[], rarity: EmoteRarity): Emote[] {
  return emotes.filter(emote => emote.rarity === rarity);
}

export function getAvailableEmotes(
  allEmotes: Emote[],
  playerLevel: number,
  ownedEmotes: string[],
  playerFaction?: string,
  playerRank?: string
): Emote[] {
  return allEmotes.filter(emote => {
    // Verificar si el jugador puede usarlo
    if (!canPlayerUseEmote(emote, playerLevel, playerFaction, playerRank)) {
      return false;
    }
    
    // Verificar si lo posee o es gratuito
    const isOwned = ownedEmotes.includes(emote.id);
    const isFree = emote.acquisition.type === 'default';
    
    return isOwned || isFree;
  });
}

export function createEmoteSequence(
  name: string,
  description: string,
  emotes: EmoteSequence['emotes']
): EmoteSequence {
  return {
    id: `sequence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    emotes,
    config: {
      autoPlay: false,
      interruptible: true,
      loopSequence: false,
      transitionType: 'blend',
      transitionDuration: 0.3
    },
    triggers: [{
      type: 'manual'
    }]
  };
}

export function createCustomDance(
  name: string,
  creator: string,
  choreography: CustomDance['choreography']
): CustomDance {
  return {
    id: `dance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    creator,
    choreography,
    music: {
      beatPattern: {
        beats: [1, 2, 3, 4],
        signature: '4/4'
      }
    },
    effects: {
      particleEffects: [],
      lightEffects: [],
      soundEffects: []
    },
    sharing: {
      public: false,
      shareCode: Math.random().toString(36).substr(2, 8).toUpperCase(),
      downloads: 0,
      rating: 0,
      tags: []
    },
    status: {
      created: Date.now(),
      lastModified: Date.now(),
      verified: false,
      featured: false,
      reports: 0
    }
  };
}

export function searchEmotes(
  emotes: Emote[],
  query: string,
  category?: EmoteCategory,
  rarity?: EmoteRarity
): Emote[] {
  const normalizedQuery = query.toLowerCase();
  
  return emotes.filter(emote => {
    // Filtrar por categoría
    if (category && emote.category !== category) {
      return false;
    }
    
    // Filtrar por rareza
    if (rarity && emote.rarity !== rarity) {
      return false;
    }
    
    // Buscar en nombre y descripción
    const nameMatch = emote.name.toLowerCase().includes(normalizedQuery);
    const descMatch = emote.description.toLowerCase().includes(normalizedQuery);
    
    return nameMatch || descMatch;
  });
}

export function getPopularEmotes(emotes: Emote[], limit: number = 10): Emote[] {
  return emotes
    .sort((a, b) => b.social.usageCount - a.social.usageCount)
    .slice(0, limit);
}

export function getNewEmotes(emotes: Emote[], days: number = 7): Emote[] {
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
  
  return emotes.filter(emote => 
    emote.status.new && 
    emote.status.expiresAt && 
    emote.status.expiresAt > cutoff
  );
}

export const EmoteSystem = {
  PREDEFINED_EMOTES,
  createEmote,
  canPlayerUseEmote,
  getEmotesByCategory,
  getEmotesByRarity,
  getAvailableEmotes,
  createEmoteSequence,
  createCustomDance,
  searchEmotes,
  getPopularEmotes,
  getNewEmotes
};
