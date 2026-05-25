/**
 * SISTEMA DE PERSONALIZACIÓN DE AVATAR - GALAXY ONLINE II
 * Avatares 3D, personalización, ropa, accesorios
 */

// ============================================
// TIPOS DE PERSONALIZACIÓN
// ============================================
export type AvatarSlot = 
  | 'head'             // Cabeza
  | 'face'             // Cara
  | 'hair'             // Cabello
  | 'facial_hair'      // Vello facial
  | 'torso'            // Torso
  | 'arms'             // Brazos
  | 'hands'            // Manos
  | 'legs'             // Piernas
  | 'feet'             // Pies
  | 'back'             // Espalda
  | 'accessory_1'      // Accesorio 1
  | 'accessory_2'      // Accesorio 2
  | 'weapon'           // Arma
  | 'effect';          // Efecto visual

export type AvatarGender = 'male' | 'female' | 'non_binary' | 'custom';

export type AvatarRace = 
  | 'human'            // Humano
  | 'cyborg'           // Ciborg
  | 'alien_humanoid'   // Alienoide
  | 'robot'            // Robot
  | 'energy_being'     // Ser de energía
  | 'synthetic'        // Sintético
  | 'genetic_engineered' // Genéticamente modificado;

// ============================================
// COMPONENTE DE AVATAR
// ============================================
export interface AvatarComponent {
  id: string;
  name: string;
  description: string;
  
  // Tipo
  type: {
    slot: AvatarSlot;
    category: string;
    subcategory?: string;
  };
  
  // Visual
  visual: {
    model3d: string;
    textures: {
      diffuse?: string;
      normal?: string;
      specular?: string;
      emissive?: string;
    };
    
    // Colores personalizables
    customizableColors: {
      id: string;
      name: string;
      defaultColor: string;
      type: 'primary' | 'secondary' | 'accent' | 'detail';
    }[];
    
    // Materiales
    material: {
      type: 'metal' | 'fabric' | 'plastic' | 'energy' | 'crystal' | 'organic';
      properties: {
        shininess: number;
        roughness: number;
        metallic: number;
        emissive: number;
      };
    };
    
    // Animaciones
    animations?: {
      idle?: string;
      walk?: string;
      run?: string;
      action?: string;
    }[];
  };
  
  // Restricciones
  restrictions: {
    gender?: AvatarGender[];
    race?: AvatarRace[];
    minLevel?: number;
    requiredFaction?: string;
    exclusiveWith?: string[]; // IDs de componentes incompatibles
    requiredComponents?: string[]; // IDs de componentes necesarios
  };
  
  // Adquisición
  acquisition: {
    type: 'purchase' | 'unlock' | 'achievement' | 'event' | 'starter' | 'premium';
    
    // Compra
    price?: {
      currency: 'credits' | 'premium' | 'faction_tokens' | 'event_currency';
      amount: number;
      discount?: number;
    };
    
    // Desbloqueo
    unlockConditions?: {
      type: 'level' | 'achievement' | 'quest' | 'faction';
      value: string | number;
    };
    
    // Evento
    eventDetails?: {
      eventId: string;
      requirement: string;
    };
  };
  
  // Rareza
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  
  // Estadísticas
  stats?: {
    charisma?: number;
    intimidation?: number;
    diplomacy?: number;
    leadership?: number;
    reputation?: number;
  };
  
  // Efectos
  effects?: {
    passive?: {
      type: string;
      value: number;
      condition?: string;
    }[];
    active?: {
      type: string;
      value: number;
      duration: number;
      cooldown: number;
    }[];
  };
  
  // Estado
  status: {
    active: boolean;
    visible: boolean;
    animated: boolean;
    glowing?: boolean;
    scale: number;
    rotation: { x: number; y: number; z: number };
  };
}

// ============================================
// AVATAR COMPLETO
// ============================================
export interface Avatar {
  id: string;
  playerId: string;
  
  // Información básica
  info: {
    name: string;
    gender: AvatarGender;
    race: AvatarRace;
    height: number; // 0.5 a 2.0
    bodyType: 'ectomorph' | 'mesomorph' | 'endomorph' | 'custom';
    
    // Edad aparente
    age: {
      appearance: number;
      category: 'young' | 'adult' | 'middle_aged' | 'elder';
    };
  };
  
  // Componentes equipados
  equipped: {
    [K in AvatarSlot]?: string; // ID del componente
  };
  
  // Personalización de colores
  colors: {
    [colorId: string]: string;
  };
  
  // Expresiones y animaciones
  expressions: {
    default: string;
    mood: 'happy' | 'neutral' | 'serious' | 'angry' | 'excited' | 'sad';
    customAnimations: string[];
  };
  
  // Poses
  poses: {
    idle: string;
    walking: string;
    running: string;
    combat: string;
    social: string;
    custom: string[];
  };
  
  // Efectos visuales
  effects: {
    active: {
      id: string;
      type: 'particle' | 'glow' | 'aura' | 'trail' | 'projection';
      intensity: number;
      color: string;
    }[];
    
    unlocked: string[]; // IDs de efectos desbloqueados
  };
  
  // Inventario de avatar
  inventory: {
    owned: string[]; // IDs de componentes poseídos
    favorites: string[];
    presets: AvatarPreset[];
  };
  
  // Estadísticas
  stats: {
    totalValue: number; // Valor total en créditos
    rarityDistribution: Record<string, number>;
    completionPercentage: number;
    customizationsApplied: number;
  };
  
  // Configuración
  settings: {
    autoEquip: boolean;
    showEffects: boolean;
    animateIdle: boolean;
    syncWithOutfit: boolean;
  };
  
  // Estado
  status: {
    lastUpdated: number;
    version: string;
    public: boolean;
    shareable: boolean;
  };
}

// ============================================
// PRESET DE AVATAR
// ============================================
export interface AvatarPreset {
  id: string;
  name: string;
  description: string;
  
  // Componentes
  components: {
    [K in AvatarSlot]?: string;
  };
  
  // Colores
  colors: {
    [colorId: string]: string;
  };
  
  // Efectos
  effects: string[];
  
  // Metadatos
  metadata: {
    created: number;
    lastUsed?: number;
    uses: number;
    favorite: boolean;
    shared: boolean;
    tags: string[];
  };
  
  // Compartición
  sharing: {
    public: boolean;
    shareCode?: string;
    downloads: number;
    rating?: number;
  };
}

// ============================================
// SISTEMA DE FOTOGRAFÍA DE AVATAR
// ============================================
export interface AvatarPhoto {
  id: string;
  avatarId: string;
  
  // Configuración de la foto
  config: {
    pose: string;
    expression: string;
    background: string;
    lighting: string;
    camera: {
      angle: { x: number; y: number; z: number };
      distance: number;
      fov: number;
    };
    
    // Filtros
    filters: {
      brightness: number;
      contrast: number;
      saturation: number;
      blur: number;
      vignette: number;
    };
  };
  
  // Resultado
  result: {
    imageUrl: string;
    thumbnailUrl: string;
    width: number;
    height: number;
    fileSize: number;
  };
  
  // Metadatos
  metadata: {
    created: number;
    location?: string;
    event?: string;
    tags: string[];
    featured: boolean;
  };
  
  // Social
  social: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
}

// ============================================
// TIENDA DE AVATARES
// ============================================
export interface AvatarShop {
  // Categorías
  categories: {
    id: string;
    name: string;
    description: string;
    icon: string;
    slots: AvatarSlot[];
  }[];
  
  // Productos
  products: {
    componentId: string;
    category: string;
    featured: boolean;
    new: boolean;
    sale: boolean;
    
    // Precios
    pricing: {
      regular: {
        currency: string;
        amount: number;
      };
      discounted?: {
        currency: string;
        amount: number;
        percentage: number;
        validUntil: number;
      };
      
      // Suscripción
      subscriptionOnly: boolean;
      bundle?: {
        items: string[];
        totalPrice: number;
        savings: number;
      };
    };
    
    // Rotación
    rotation?: {
      type: 'daily' | 'weekly' | 'monthly';
      startDate: number;
      endDate: number;
    };
  }[];
  
  // Ofertas especiales
  specialOffers: {
    id: string;
    name: string;
    description: string;
    
    // Tipo de oferta
    type: 'bundle' | 'mystery_box' | 'limited_time' | 'seasonal';
    
    // Contenido
    contents: {
      guaranteed: string[];
      chance: {
        itemId: string;
        probability: number;
      }[];
    };
    
    // Limitaciones
    limitations: {
      maxPurchase: number;
      perPlayer: boolean;
      duration: number;
    };
    
    // Precio
    price: {
      currency: string;
      amount: number;
    };
  }[];
}

// ============================================
// COMPONENTES PREDEFINIDOS
// ============================================
export const PREDEFINED_AVATAR_COMPONENTS: AvatarComponent[] = [
  {
    id: 'avatar_head_human_male_01',
    name: 'Cabeza Humana Masculina 01',
    description: 'Cabeza base para avatar humano masculino',
    type: {
      slot: 'head',
      category: 'base',
      subcategory: 'human'
    },
    visual: {
      model3d: '/models/avatars/head_human_male_01.fbx',
      textures: {
        diffuse: '/textures/avatars/head_human_male_01_diffuse.png',
        normal: '/textures/avatars/head_human_male_01_normal.png'
      },
      customizableColors: [
        {
          id: 'skin_tone',
          name: 'Tono de piel',
          defaultColor: '#FDBCB4',
          type: 'primary'
        }
      ],
      material: {
        type: 'organic',
        properties: {
          shininess: 0.1,
          roughness: 0.8,
          metallic: 0,
          emissive: 0
        }
      }
    },
    restrictions: {
      gender: ['male'],
      race: ['human']
    },
    acquisition: {
      type: 'starter'
    },
    rarity: 'common',
    status: {
      active: true,
      visible: true,
      animated: false,
      scale: 1,
      rotation: { x: 0, y: 0, z: 0 }
    }
  },
  {
    id: 'avatar_torso_uniform_captain',
    name: 'Uniforme de Capitán',
    description: 'Uniforme oficial de capitán de flota',
    type: {
      slot: 'torso',
      category: 'clothing',
      subcategory: 'uniform'
    },
    visual: {
      model3d: '/models/avatars/uniform_captain.fbx',
      textures: {
        diffuse: '/textures/avatars/uniform_captain_diffuse.png',
        normal: '/textures/avatars/uniform_captain_normal.png',
        specular: '/textures/avatars/uniform_captain_specular.png'
      },
      customizableColors: [
        {
          id: 'primary_color',
          name: 'Color primario',
          defaultColor: '#1E3A8A',
          type: 'primary'
        },
        {
          id: 'secondary_color',
          name: 'Color secundario',
          defaultColor: '#DC2626',
          type: 'secondary'
        }
      ],
      material: {
        type: 'fabric',
        properties: {
          shininess: 0.2,
          roughness: 0.9,
          metallic: 0,
          emissive: 0
        }
      }
    },
    restrictions: {
      minLevel: 10
    },
    acquisition: {
      type: 'purchase',
      price: {
        currency: 'credits',
        amount: 5000
      }
    },
    rarity: 'uncommon',
    stats: {
      leadership: 5,
      charisma: 3
    },
    status: {
      active: true,
      visible: true,
      animated: false,
      scale: 1,
      rotation: { x: 0, y: 0, z: 0 }
    }
  },
  {
    id: 'avatar_effect_aura_commander',
    name: 'Aura de Comandante',
    description: 'Aura energética que rodea al comandante',
    type: {
      slot: 'effect',
      category: 'effect',
      subcategory: 'aura'
    },
    visual: {
      model3d: '/models/avatars/aura_commander.fbx',
      textures: {
        emissive: '/textures/avatars/aura_commander_emissive.png'
      },
      customizableColors: [
        {
          id: 'aura_color',
          name: 'Color del aura',
          defaultColor: '#00D4FF',
          type: 'primary'
        }
      ],
      material: {
        type: 'energy',
        properties: {
          shininess: 1,
          roughness: 0,
          metallic: 0.8,
          emissive: 0.9
        }
      }
    },
    restrictions: {
      minLevel: 25
    },
    acquisition: {
      type: 'achievement',
      unlockConditions: {
        type: 'achievement',
        value: 'veteran_commander'
      }
    },
    rarity: 'epic',
    effects: {
      passive: [
        {
          type: 'leadership_bonus',
          value: 10,
          condition: 'in_fleet_command'
        }
      ]
    },
    status: {
      active: true,
      visible: true,
      animated: true,
      glowing: true,
      scale: 1.2,
      rotation: { x: 0, y: 0.5, z: 0 }
    }
  }
];

// ============================================
// HELPERS
// ============================================
export function createAvatar(
  playerId: string,
  name: string,
  gender: AvatarGender,
  race: AvatarRace
): Avatar {
  return {
    id: `avatar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    playerId,
    info: {
      name,
      gender,
      race,
      height: 1.0,
      bodyType: 'mesomorph',
      age: {
        appearance: 25,
        category: 'adult'
      }
    },
    equipped: {},
    colors: {},
    expressions: {
      default: 'neutral',
      mood: 'neutral',
      customAnimations: []
    },
    poses: {
      idle: 'idle_default',
      walking: 'walk_default',
      running: 'run_default',
      combat: 'combat_ready',
      social: 'social_neutral',
      custom: []
    },
    effects: {
      active: [],
      unlocked: []
    },
    inventory: {
      owned: [],
      favorites: [],
      presets: []
    },
    stats: {
      totalValue: 0,
      rarityDistribution: {},
      completionPercentage: 0,
      customizationsApplied: 0
    },
    settings: {
      autoEquip: false,
      showEffects: true,
      animateIdle: true,
      syncWithOutfit: false
    },
    status: {
      lastUpdated: Date.now(),
      version: '1.0.0',
      public: false,
      shareable: false
    }
  };
}

export function equipComponent(
  avatar: Avatar,
  slot: AvatarSlot,
  componentId: string
): Avatar {
  return {
    ...avatar,
    equipped: {
      ...avatar.equipped,
      [slot]: componentId
    },
    status: {
      ...avatar.status,
      lastUpdated: Date.now()
    }
  };
}

export function unequipComponent(avatar: Avatar, slot: AvatarSlot): Avatar {
  const newEquipped = { ...avatar.equipped };
  delete newEquipped[slot];
  
  return {
    ...avatar,
    equipped: newEquipped,
    status: {
      ...avatar.status,
      lastUpdated: Date.now()
    }
  };
}

export function updateAvatarColor(
  avatar: Avatar,
  colorId: string,
  color: string
): Avatar {
  return {
    ...avatar,
    colors: {
      ...avatar.colors,
      [colorId]: color
    },
    status: {
      ...avatar.status,
      lastUpdated: Date.now()
    }
  };
}

export function createAvatarPreset(
  name: string,
  description: string,
  components: Avatar['equipped'],
  colors: Avatar['colors']
): AvatarPreset {
  return {
    id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    components,
    colors,
    effects: [],
    metadata: {
      created: Date.now(),
      uses: 0,
      favorite: false,
      shared: false,
      tags: []
    },
    sharing: {
      public: false,
      downloads: 0
    }
  };
}

export function applyAvatarPreset(avatar: Avatar, preset: AvatarPreset): Avatar {
  return {
    ...avatar,
    equipped: preset.components,
    colors: preset.colors,
    effects: {
      ...avatar.effects,
      active: preset.effects.map(effectId => ({
        id: effectId,
        type: 'aura' as const,
        intensity: 1,
        color: '#FFFFFF'
      }))
    },
    status: {
      ...avatar.status,
      lastUpdated: Date.now()
    }
  };
}

export function getComponentsBySlot(
  components: AvatarComponent[],
  slot: AvatarSlot
): AvatarComponent[] {
  return components.filter(component => component.type.slot === slot);
}

export function getComponentsByRarity(
  components: AvatarComponent[],
  rarity: AvatarComponent['rarity']
): AvatarComponent[] {
  return components.filter(component => component.rarity === rarity);
}

export function canPlayerUseComponent(
  component: AvatarComponent,
  playerLevel: number,
  playerGender: AvatarGender,
  playerRace: AvatarRace,
  playerFaction?: string
): boolean {
  // Verificar género
  if (component.restrictions.gender && 
      !component.restrictions.gender.includes(playerGender)) {
    return false;
  }
  
  // Verificar raza
  if (component.restrictions.race && 
      !component.restrictions.race.includes(playerRace)) {
    return false;
  }
  
  // Verificar nivel
  if (component.restrictions.minLevel && 
      playerLevel < component.restrictions.minLevel) {
    return false;
  }
  
  // Verificar facción
  if (component.restrictions.requiredFaction && 
      playerFaction !== component.restrictions.requiredFaction) {
    return false;
  }
  
  return true;
}

export function calculateAvatarValue(
  avatar: Avatar,
  allComponents: AvatarComponent[]
): number {
  let totalValue = 0;
  
  // Sumar valor de componentes equipados
  Object.values(avatar.equipped).forEach(componentId => {
    const component = allComponents.find(c => c.id === componentId);
    if (component && component.acquisition.price) {
      totalValue += component.acquisition.price.amount;
    }
  });
  
  // Sumar valor de componentes en inventario
  avatar.inventory.owned.forEach(componentId => {
    const component = allComponents.find(c => c.id === componentId);
    if (component && component.acquisition.price) {
      totalValue += component.acquisition.price.amount;
    }
  });
  
  return totalValue;
}

export function calculateCompletionPercentage(
  avatar: Avatar,
  allComponents: AvatarComponent[]
): number {
  const totalComponents = allComponents.length;
  const ownedComponents = avatar.inventory.owned.length;
  
  return Math.min(100, Math.round((ownedComponents / totalComponents) * 100));
}

export const AvatarSystem = {
  PREDEFINED_AVATAR_COMPONENTS,
  createAvatar,
  equipComponent,
  unequipComponent,
  updateAvatarColor,
  createAvatarPreset,
  applyAvatarPreset,
  getComponentsBySlot,
  getComponentsByRarity,
  canPlayerUseComponent,
  calculateAvatarValue,
  calculateCompletionPercentage
};
