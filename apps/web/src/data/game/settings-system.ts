/**
 * SISTEMA DE CONFIGURACIÓN Y PREFERENCIAS - GALAXY ONLINE II
 * Configuración del juego, preferencias de usuario, perfiles
 */

// ============================================
// CATEGORÍAS DE CONFIGURACIÓN
// ============================================
export type SettingsCategory = 
  | 'graphics'         // Gráficos
  | 'audio'            // Audio
  | 'controls'         // Controles
  | 'interface'        // Interfaz
  | 'gameplay'         // Jugabilidad
  | 'social'           // Social
  | 'privacy'          // Privacidad
  | 'accessibility'    // Accesibilidad
  | 'notifications'    // Notificaciones
  | 'performance'      // Rendimiento
  | 'language'         // Idioma
  | 'account'          // Cuenta
  | 'advanced';        // Avanzado

// ============================================
// CONFIGURACIÓN DE GRÁFICOS
// ============================================
export interface GraphicsSettings {
  // Calidad general
  quality: {
    preset: 'low' | 'medium' | 'high' | 'ultra' | 'custom';
    overallScale: number; // 0.5-2.0
  };
  
  // Resolución
  resolution: {
    width: number;
    height: number;
    fullscreen: boolean;
    borderless: boolean;
    refreshRate: number;
  };
  
  // Renderizado
  rendering: {
    vsync: boolean;
    frameRateLimit: number;
    antiAliasing: 'none' | 'fxaa' | 'msaa_2x' | 'msaa_4x' | 'msaa_8x';
    anisotropicFiltering: number; // 1-16
    
    // Sombras
    shadows: 'low' | 'medium' | 'high' | 'ultra';
    shadowDistance: number;
    shadowQuality: number;
    
    // Iluminación
    lighting: 'low' | 'medium' | 'high' | 'ultra';
    globalIllumination: boolean;
    ambientOcclusion: 'none' | 'ssao' | 'hbao';
    
    // Texturas
    textureQuality: 'low' | 'medium' | 'high' | 'ultra';
    textureFiltering: 'bilinear' | 'trilinear' | 'anisotropic';
    textureResolution: number; // 0.5-2.0
    
    // Efectos
    postProcessing: boolean;
    bloom: boolean;
    motionBlur: boolean;
    depthOfField: boolean;
    lensFlare: boolean;
    
    // Partículas
    particleQuality: 'low' | 'medium' | 'high' | 'ultra';
    particleDensity: number; // 0.1-2.0
  };
  
  // UI
  ui: {
    scale: number; // 0.5-2.0
    resolution: 'auto' | 'native' | 'custom';
    customScale: number;
    
    // Animaciones
    animations: boolean;
    animationSpeed: number; // 0.1-2.0
    
    // Transiciones
    transitions: boolean;
    transitionSpeed: number; // 0.1-2.0
  };
  
  // VR
  vr: {
    enabled: boolean;
    resolutionScale: number;
    supersampling: number;
    comfortMode: boolean;
  };
}

// ============================================
// CONFIGURACIÓN DE AUDIO
// ============================================
export interface AudioSettings {
  // General
  master: {
    volume: number; // 0-100
    mute: boolean;
  };
  
  // Categorías
  categories: {
    music: {
      volume: number;
      mute: boolean;
      ducking: boolean; // bajar volumen en eventos
    };
    
    sfx: {
      volume: number;
      mute: boolean;
    };
    
    voice: {
      volume: number;
      mute: boolean;
      inputGain: number;
      outputGain: number;
    };
    
    ambient: {
      volume: number;
      mute: boolean;
    };
    
    ui: {
      volume: number;
      mute: boolean;
    };
  };
  
  // Calidad
  quality: {
    sampleRate: number; // 22050, 44100, 48000
    bitrate: number;
    compression: 'none' | 'low' | 'medium' | 'high';
  };
  
  // Espacial
  spatial: {
    enabled: boolean;
    hrtf: boolean;
    reverb: boolean;
    occlusion: boolean;
  };
  
  // Dispositivos
  devices: {
    output: string;
    input: string;
    communication: string;
  };
  
  // Chat de voz
  voiceChat: {
    pushToTalk: boolean;
    pushToTalkKey: string;
    voiceActivation: boolean;
    activationThreshold: number;
    
    // Efectos
    noiseSuppression: boolean;
    echoCancellation: boolean;
    autoGainControl: boolean;
  };
}

// ============================================
// CONFIGURACIÓN DE CONTROLES
// ============================================
export interface ControlsSettings {
  // General
  general: {
    sensitivity: number;
    invertY: boolean;
    invertX: boolean;
    
    // Mouse
    mouseAcceleration: boolean;
    rawInput: boolean;
    cursorSensitivity: number;
  };
  
  // Mapeo de teclas
  keybindings: {
    // Movimiento
    moveForward: string;
    moveBackward: string;
    moveLeft: string;
    moveRight: string;
    jump: string;
    crouch: string;
    sprint: string;
    
    // Acciones
    interact: string;
    attack: string;
    block: string;
    reload: string;
    useAbility: string;
    
    // Navegación
    map: string;
    inventory: string;
    character: string;
    skills: string;
    quest: string;
    
    // Cámara
    cameraUp: string;
    cameraDown: string;
    cameraLeft: string;
    cameraRight: string;
    zoomIn: string;
    zoomOut: string;
    
    // Social
    chat: string;
    voiceChat: string;
    emotes: string;
    
    // Sistema
    settings: string;
    screenshot: string;
    pause: string;
  };
  
  // Mando
  gamepad: {
    enabled: boolean;
    vibration: boolean;
    vibrationIntensity: number;
    
    // Sensibilidad
    stickSensitivity: number;
    triggerSensitivity: number;
    
    // Dead zones
    leftStickDeadzone: number;
    rightStickDeadzone: number;
    triggerDeadzone: number;
  };
  
  // Accesibilidad
  accessibility: {
    oneHandedMode: boolean;
    simplifiedControls: boolean;
    autoAim: boolean;
    aimAssist: boolean;
  };
}

// ============================================
// CONFIGURACIÓN DE INTERFAZ
// ============================================
export interface InterfaceSettings {
  // General
  general: {
    language: string;
    region: string;
    timezone: string;
    
    // Escala
    uiScale: number;
    textScale: number;
    iconScale: number;
  };
  
  // HUD
  hud: {
    visibility: {
      health: boolean;
      shield: boolean;
      energy: boolean;
      minimap: boolean;
      compass: boolean;
      objectives: boolean;
      chat: boolean;
      notifications: boolean;
    };
    
    // Posición
    position: {
      minimap: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';
      chat: 'bottom_left' | 'bottom_right' | 'top_left' | 'top_right';
      objectives: 'left' | 'right' | 'top' | 'bottom';
    };
    
    // Estilo
    style: {
      opacity: number;
      backgroundOpacity: number;
      showBorders: boolean;
      roundedCorners: boolean;
    };
  };
  
  // Menús
  menus: {
    animationSpeed: number;
    showTooltips: boolean;
    tooltipDelay: number;
    
    // Navegación
    keyboardNavigation: boolean;
    escapeClosesAll: boolean;
    confirmOnExit: boolean;
  };
  
  // Chat
  chat: {
    fontSize: number;
    fontFamily: string;
    opacity: number;
    
    // Colores
    colors: {
      system: string;
      chat: string;
      whisper: string;
      party: string;
      guild: string;
      alliance: string;
      systemMessages: string;
      error: string;
    };
    
    // Filtros
    profanityFilter: boolean;
    timestamps: boolean;
    playerNames: boolean;
  };
  
  // Minimapa
  minimap: {
    size: number;
    zoom: number;
    rotation: boolean;
    
    // Elementos
    showPlayers: boolean;
    showEnemies: boolean;
    showObjectives: boolean;
    showResources: boolean;
    showQuests: boolean;
  };
  
  // Notificaciones
  notifications: {
    position: 'top_right' | 'top_left' | 'bottom_right' | 'bottom_left' | 'center';
    duration: number;
    maxVisible: number;
    
    // Tipos
    showSystem: boolean;
    showSocial: boolean;
    showCombat: boolean;
    showEconomy: boolean;
  };
}

// ============================================
// CONFIGURACIÓN DE JUGABILIDAD
// ============================================
export interface GameplaySettings {
  // General
  general: {
    difficulty: 'easy' | 'normal' | 'hard' | 'extreme';
    autoSave: boolean;
    autoSaveInterval: number; // minutos
    
    // Tutorial
    showTutorialHints: boolean;
    showHelpTooltips: boolean;
    advancedTooltips: boolean;
  };
  
  // Combate
  combat: {
    autoTarget: boolean;
    targetNearest: boolean;
    autoAttack: boolean;
    
    // Indicadores
    showDamageNumbers: boolean;
    showHealthBars: boolean;
    showCombatLog: boolean;
    
    // Ayudas
    aimAssist: boolean;
    dodgeAssist: boolean;
    comboAssist: boolean;
  };
  
  // Cámara
  camera: {
    mode: 'first_person' | 'third_person' | 'isometric' | 'top_down';
    followSpeed: number;
    distance: number;
    height: number;
    
    // Colisión
    collision: boolean;
    clipThrough: boolean;
  };
  
  // Movimiento
  movement: {
    autoRun: boolean;
    doubleTapToSprint: boolean;
    autoJump: boolean;
    
    // Navegación
    pathfinding: boolean;
    showPath: boolean;
    autoNavigate: boolean;
  };
  
  // Economía
  economy: {
    autoSell: boolean;
    autoRepair: boolean;
    confirmPurchases: boolean;
    confirmTrades: boolean;
    
    // Precios
    showTax: boolean;
    showDiscounts: boolean;
    showTotalValue: boolean;
  };
  
  // Social
  social: {
    autoAcceptFriends: boolean;
    autoAcceptGuild: boolean;
    showOnlineStatus: boolean;
    showActivity: boolean;
    
    // Privacidad
    allowInvites: boolean;
    allowMessages: boolean;
    allowFriendRequests: boolean;
  };
}

// ============================================
// PERFIL DE CONFIGURACIÓN
// ============================================
export interface SettingsProfile {
  id: string;
  name: string;
  description: string;
  
  // Configuraciones
  settings: {
    graphics: GraphicsSettings;
    audio: AudioSettings;
    controls: ControlsSettings;
    interface: InterfaceSettings;
    gameplay: GameplaySettings;
  };
  
  // Metadatos
  metadata: {
    created: number;
    lastModified: number;
    version: string;
    
    // Compatibilidad
    gameVersion: string;
    platform: string;
    
    // Tipo
    type: 'user' | 'preset' | 'synced';
    
    // Compartición
    shared: boolean;
    shareCode?: string;
    downloads: number;
    rating: number;
  };
  
  // Estado
  status: {
    active: boolean;
    default: boolean;
    readonly: boolean;
    locked: boolean;
  };
}

// ============================================
// SISTEMA DE SINCRONIZACIÓN
// ============================================
export interface SettingsSync {
  // Configuración
  config: {
    enabled: boolean;
    autoSync: boolean;
    syncInterval: number; // minutos
    
    // Dispositivos
    devices: {
      id: string;
      name: string;
      type: 'pc' | 'mobile' | 'console';
      lastSync: number;
      active: boolean;
    }[];
  };
  
  // Categorías a sincronizar
  syncCategories: SettingsCategory[];
  
  // Conflictos
  conflictResolution: 'local' | 'remote' | 'merge' | 'prompt';
  
  // Estado
  status: {
    lastSync: number;
    pendingSync: boolean;
    conflicts: {
      category: SettingsCategory;
      localValue: any;
      remoteValue: any;
      timestamp: number;
    }[];
  };
}

// ============================================
// CONFIGURACIÓN COMPLETA
// ============================================
export interface GameSettings {
  playerId: string;
  
  // Perfil activo
  activeProfile: string;
  
  // Configuraciones actuales
  current: {
    graphics: GraphicsSettings;
    audio: AudioSettings;
    controls: ControlsSettings;
    interface: InterfaceSettings;
    gameplay: GameplaySettings;
  };
  
  // Perfiles
  profiles: SettingsProfile[];
  
  // Sincronización
  sync: SettingsSync;
  
  // Metadatos
  metadata: {
    version: string;
    platform: string;
    lastModified: number;
    
    // Validación
    validated: boolean;
    corrupted: boolean;
    
    // Importación/Exportación
    imported: boolean;
    exported: boolean;
  };
}

// ============================================
// CONFIGURACIÓN POR DEFECTO
// ============================================
export const DEFAULT_SETTINGS: GameSettings = {
  playerId: '',
  activeProfile: 'default',
  current: {
    graphics: {
      quality: {
        preset: 'high',
        overallScale: 1.0
      },
      resolution: {
        width: 1920,
        height: 1080,
        fullscreen: true,
        borderless: false,
        refreshRate: 60
      },
      rendering: {
        vsync: true,
        frameRateLimit: 60,
        antiAliasing: 'fxaa',
        anisotropicFiltering: 8,
        shadows: 'high',
        shadowDistance: 100,
        shadowQuality: 0.8,
        lighting: 'high',
        globalIllumination: true,
        ambientOcclusion: 'ssao',
        textureQuality: 'high',
        textureFiltering: 'anisotropic',
        textureResolution: 1.0,
        postProcessing: true,
        bloom: true,
        motionBlur: false,
        depthOfField: true,
        lensFlare: true,
        particleQuality: 'high',
        particleDensity: 1.0
      },
      ui: {
        scale: 1.0,
        resolution: 'auto',
        customScale: 1.0,
        animations: true,
        animationSpeed: 1.0,
        transitions: true,
        transitionSpeed: 1.0
      },
      vr: {
        enabled: false,
        resolutionScale: 1.0,
        supersampling: 1.0,
        comfortMode: true
      }
    },
    audio: {
      master: {
        volume: 80,
        mute: false
      },
      categories: {
        music: { volume: 70, mute: false, ducking: true },
        sfx: { volume: 80, mute: false },
        voice: { volume: 90, mute: false, inputGain: 50, outputGain: 80 },
        ambient: { volume: 60, mute: false },
        ui: { volume: 75, mute: false }
      },
      quality: {
        sampleRate: 44100,
        bitrate: 128,
        compression: 'medium'
      },
      spatial: {
        enabled: true,
        hrtf: true,
        reverb: true,
        occlusion: true
      },
      devices: {
        output: 'default',
        input: 'default',
        communication: 'default'
      },
      voiceChat: {
        pushToTalk: false,
        pushToTalkKey: 'V',
        voiceActivation: true,
        activationThreshold: 0.5,
        noiseSuppression: true,
        echoCancellation: true,
        autoGainControl: true
      }
    },
    controls: {
      general: {
        sensitivity: 1.0,
        invertY: false,
        invertX: false,
        mouseAcceleration: false,
        rawInput: true,
        cursorSensitivity: 1.0
      },
      keybindings: {
        moveForward: 'W',
        moveBackward: 'S',
        moveLeft: 'A',
        moveRight: 'D',
        jump: 'Space',
        crouch: 'C',
        sprint: 'Shift',
        interact: 'E',
        attack: 'Mouse1',
        block: 'Mouse2',
        reload: 'R',
        useAbility: 'Q',
        map: 'M',
        inventory: 'I',
        character: 'C',
        skills: 'K',
        quest: 'L',
        cameraUp: 'Up',
        cameraDown: 'Down',
        cameraLeft: 'Left',
        cameraRight: 'Right',
        zoomIn: 'MouseWheelUp',
        zoomOut: 'MouseWheelDown',
        chat: 'Enter',
        voiceChat: 'V',
        emotes: 'B',
        settings: 'Escape',
        screenshot: 'F12',
        pause: 'P'
      },
      gamepad: {
        enabled: true,
        vibration: true,
        vibrationIntensity: 0.7,
        stickSensitivity: 1.0,
        triggerSensitivity: 1.0,
        leftStickDeadzone: 0.1,
        rightStickDeadzone: 0.1,
        triggerDeadzone: 0.05
      },
      accessibility: {
        oneHandedMode: false,
        simplifiedControls: false,
        autoAim: false,
        aimAssist: false
      }
    },
    interface: {
      general: {
        language: 'es',
        region: 'US',
        timezone: 'America/New_York',
        uiScale: 1.0,
        textScale: 1.0,
        iconScale: 1.0
      },
      hud: {
        visibility: {
          health: true,
          shield: true,
          energy: true,
          minimap: true,
          compass: true,
          objectives: true,
          chat: true,
          notifications: true
        },
        position: {
          minimap: 'top_right',
          chat: 'bottom_left',
          objectives: 'left'
        },
        style: {
          opacity: 0.9,
          backgroundOpacity: 0.8,
          showBorders: true,
          roundedCorners: true
        }
      },
      menus: {
        animationSpeed: 1.0,
        showTooltips: true,
        tooltipDelay: 0.5,
        keyboardNavigation: true,
        escapeClosesAll: true,
        confirmOnExit: true
      },
      chat: {
        fontSize: 14,
        fontFamily: 'Arial',
        opacity: 0.9,
        colors: {
          system: '#FFFFFF',
          chat: '#CCCCCC',
          whisper: '#FF00FF',
          party: '#00FF00',
          guild: '#00FFFF',
          alliance: '#FFFF00',
          systemMessages: '#FFFFFF',
          error: '#FF0000'
        },
        profanityFilter: true,
        timestamps: true,
        playerNames: true
      },
      minimap: {
        size: 150,
        zoom: 1.0,
        rotation: false,
        showPlayers: true,
        showEnemies: true,
        showObjectives: true,
        showResources: true,
        showQuests: true
      },
      notifications: {
        position: 'top_right',
        duration: 3,
        maxVisible: 5,
        showSystem: true,
        showSocial: true,
        showCombat: true,
        showEconomy: true
      }
    },
    gameplay: {
      general: {
        difficulty: 'normal',
        autoSave: true,
        autoSaveInterval: 10,
        showTutorialHints: true,
        showHelpTooltips: true,
        advancedTooltips: false
      },
      combat: {
        autoTarget: true,
        targetNearest: true,
        autoAttack: false,
        showDamageNumbers: true,
        showHealthBars: true,
        showCombatLog: true,
        aimAssist: false,
        dodgeAssist: false,
        comboAssist: false
      },
      camera: {
        mode: 'third_person',
        followSpeed: 5.0,
        distance: 5.0,
        height: 2.0,
        collision: true,
        clipThrough: false
      },
      movement: {
        autoRun: false,
        doubleTapToSprint: true,
        autoJump: false,
        pathfinding: true,
        showPath: true,
        autoNavigate: false
      },
      economy: {
        autoSell: false,
        autoRepair: true,
        confirmPurchases: true,
        confirmTrades: true,
        showTax: true,
        showDiscounts: true,
        showTotalValue: true
      },
      social: {
        autoAcceptFriends: false,
        autoAcceptGuild: false,
        showOnlineStatus: true,
        showActivity: true,
        allowInvites: true,
        allowMessages: true,
        allowFriendRequests: true
      }
    }
  },
  profiles: [],
  sync: {
    config: {
      enabled: false,
      autoSync: false,
      syncInterval: 30,
      devices: []
    },
    syncCategories: ['graphics', 'audio', 'controls', 'interface', 'gameplay'],
    conflictResolution: 'prompt',
    status: {
      lastSync: 0,
      pendingSync: false,
      conflicts: []
    }
  },
  metadata: {
    version: '1.0.0',
    platform: 'PC',
    lastModified: Date.now(),
    validated: true,
    corrupted: false,
    imported: false,
    exported: false
  }
};

// ============================================
// HELPERS
// ============================================
export function createSettingsProfile(
  name: string,
  description: string,
  settings: SettingsProfile['settings']
): SettingsProfile {
  return {
    id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    settings,
    metadata: {
      created: Date.now(),
      lastModified: Date.now(),
      version: '1.0.0',
      gameVersion: '2.5.0',
      platform: 'PC',
      type: 'user',
      shared: false,
      downloads: 0,
      rating: 0
    },
    status: {
      active: false,
      default: false,
      readonly: false,
      locked: false
    }
  };
}

export function applySettingsProfile(
  gameSettings: GameSettings,
  profileId: string
): GameSettings {
  const profile = gameSettings.profiles.find(p => p.id === profileId);
  if (!profile) return gameSettings;
  
  return {
    ...gameSettings,
    activeProfile: profileId,
    current: profile.settings,
    metadata: {
      ...gameSettings.metadata,
      lastModified: Date.now()
    }
  };
}

export function resetSettingsToDefault(
  category?: SettingsCategory
): Partial<GameSettings['current']> {
  if (!category) {
    return DEFAULT_SETTINGS.current;
  }
  
  const categorySettings = DEFAULT_SETTINGS.current[category as keyof typeof DEFAULT_SETTINGS.current];
  return {
    [category]: categorySettings
  } as Partial<GameSettings['current']>;
}

export function validateSettings(
  settings: GameSettings['current']
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validar gráficos
  if (settings.graphics.resolution.width <= 0 || 
      settings.graphics.resolution.height <= 0) {
    errors.push('La resolución debe ser válida');
  }
  
  // Validar gráficos
  if (settings.graphics.quality.overallScale < 0.5 || 
      settings.graphics.quality.overallScale > 2.0) {
    errors.push('La escala de calidad debe estar entre 0.5 y 2.0');
  }
  
  // Validar audio
  if (settings.audio.master.volume < 0 || 
      settings.audio.master.volume > 100) {
    errors.push('El volumen maestro debe estar entre 0 y 100');
  }
  
  // Validar controles
  const keybinds = Object.values(settings.controls.keybindings);
  const duplicates = keybinds.filter((key, index) => 
    keybinds.indexOf(key) !== index && key !== ''
  );
  
  if (duplicates.length > 0) {
    errors.push(`Hay teclas duplicadas: ${duplicates.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function exportSettings(settings: GameSettings): string {
  return JSON.stringify(settings, null, 2);
}

export function importSettings(jsonString: string): GameSettings | null {
  try {
    const settings = JSON.parse(jsonString);
    const validation = validateSettings(settings.current);
    
    if (!validation.valid) {
      console.error('Errores de validación:', validation.errors);
      return null;
    }
    
    return settings;
  } catch (error) {
    console.error('Error al importar configuración:', error);
    return null;
  }
}

export function optimizeSettingsForHardware(
  settings: GraphicsSettings,
  hardwareInfo: {
    gpu: string;
    vram: number;
    ram: number;
    cpu: string;
  }
): GraphicsSettings {
  const optimized = { ...settings };
  
  // Basado en VRAM
  if (hardwareInfo.vram < 2048) { // Menos de 2GB
    optimized.rendering.textureQuality = 'low';
    optimized.rendering.shadows = 'low';
    optimized.rendering.particleQuality = 'low';
  } else if (hardwareInfo.vram < 4096) { // Menos de 4GB
    optimized.rendering.textureQuality = 'medium';
    optimized.rendering.shadows = 'medium';
    optimized.rendering.particleQuality = 'medium';
  }
  
  // Basado en RAM
  if (hardwareInfo.ram < 8192) { // Menos de 8GB
    optimized.rendering.globalIllumination = false;
    optimized.rendering.ambientOcclusion = 'none';
  }
  
  // Basado en GPU
  if (hardwareInfo.gpu.toLowerCase().includes('integrated')) {
    optimized.quality.preset = 'low';
    optimized.rendering.antiAliasing = 'none';
    optimized.rendering.postProcessing = false;
  }
  
  return optimized;
}

export const SettingsSystem = {
  DEFAULT_SETTINGS,
  createSettingsProfile,
  applySettingsProfile,
  resetSettingsToDefault,
  validateSettings,
  exportSettings,
  importSettings,
  optimizeSettingsForHardware
};
