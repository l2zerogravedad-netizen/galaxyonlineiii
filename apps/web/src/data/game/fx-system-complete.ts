/**
 * SISTEMA COMPLETO DE FX - GALAXY ONLINE II
 * Efectos visuales, optimización, estrategias, estética y mecánicas
 */

// ============================================
// CATEGORÍAS DE EFECTOS VISUALES
// ============================================
export type FXCategory = 
  | 'weapon_fire' 
  | 'explosion' 
  | 'shield' 
  | 'engine' 
  | 'ability'
  | 'environment'
  | 'ui'
  | 'destruction'
  | 'formation'
  | 'critical_hit'
  | 'buff_debuff';

export type FXPriority = 'critical' | 'high' | 'medium' | 'low' | 'ambient';
export type FXComplexity = 'simple' | 'moderate' | 'complex' | 'epic';

// ============================================
// CONFIGURACIÓN DE RENDIMIENTO Y OPTIMIZACIÓN
// ============================================
export interface FXPerformanceConfig {
  // Niveles de calidad
  qualityLevels: {
    low: {
      particleCount: number;
      textureResolution: number;
      shadowQuality: 'none' | 'low' | 'medium' | 'high';
      bloomIntensity: number;
      anisotropicFiltering: boolean;
      antiAliasing: 'none' | 'fxaa' | 'msaa2x' | 'msaa4x';
    };
    medium: {
      particleCount: number;
      textureResolution: number;
      shadowQuality: 'none' | 'low' | 'medium' | 'high';
      bloomIntensity: number;
      anisotropicFiltering: boolean;
      antiAliasing: 'none' | 'fxaa' | 'msaa2x' | 'msaa4x';
    };
    high: {
      particleCount: number;
      textureResolution: number;
      shadowQuality: 'none' | 'low' | 'medium' | 'high';
      bloomIntensity: number;
      anisotropicFiltering: boolean;
      antiAliasing: 'none' | 'fxaa' | 'msaa2x' | 'msaa4x';
    };
    ultra: {
      particleCount: number;
      textureResolution: number;
      shadowQuality: 'none' | 'low' | 'medium' | 'high';
      bloomIntensity: number;
      anisotropicFiltering: boolean;
      antiAliasing: 'none' | 'fxaa' | 'msaa2x' | 'msaa4x';
    };
  };
  
  // Optimizaciones por cantidad de naves
  shipCountThresholds: {
    small: { max: number; lodDistance: number; particleScale: number };
    medium: { max: number; lodDistance: number; particleScale: number };
    large: { max: number; lodDistance: number; particleScale: number };
    massive: { max: number; lodDistance: number; particleScale: number };
  };
  
  // Técnicas de optimización
  optimizations: {
    objectPooling: boolean;
    gpuInstancing: boolean;
    textureAtlasing: boolean;
    levelOfDetail: boolean;
    frustumCulling: boolean;
    occlusionCulling: boolean;
    particleCulling: boolean;
    dynamicResolution: boolean;
  };
  
  // Límites por escena
  limits: {
    maxParticles: number;
    maxLights: number;
    maxShadowCasters: number;
    maxDecals: number;
    maxScreenSpaceEffects: number;
  };
}

export const FX_PERFORMANCE_CONFIG: FXPerformanceConfig = {
  qualityLevels: {
    low: {
      particleCount: 100,
      textureResolution: 512,
      shadowQuality: 'none',
      bloomIntensity: 0.5,
      anisotropicFiltering: false,
      antiAliasing: 'none'
    },
    medium: {
      particleCount: 500,
      textureResolution: 1024,
      shadowQuality: 'low',
      bloomIntensity: 1.0,
      anisotropicFiltering: true,
      antiAliasing: 'fxaa'
    },
    high: {
      particleCount: 2000,
      textureResolution: 2048,
      shadowQuality: 'medium',
      bloomIntensity: 1.5,
      anisotropicFiltering: true,
      antiAliasing: 'msaa2x'
    },
    ultra: {
      particleCount: 5000,
      textureResolution: 4096,
      shadowQuality: 'high',
      bloomIntensity: 2.0,
      anisotropicFiltering: true,
      antiAliasing: 'msaa4x'
    }
  },
  
  shipCountThresholds: {
    small: { max: 50, lodDistance: 500, particleScale: 1.0 },
    medium: { max: 200, lodDistance: 1000, particleScale: 0.8 },
    large: { max: 1000, lodDistance: 2000, particleScale: 0.5 },
    massive: { max: 5000, lodDistance: 5000, particleScale: 0.3 }
  },
  
  optimizations: {
    objectPooling: true,
    gpuInstancing: true,
    textureAtlasing: true,
    levelOfDetail: true,
    frustumCulling: true,
    occlusionCulling: true,
    particleCulling: true,
    dynamicResolution: true
  },
  
  limits: {
    maxParticles: 10000,
    maxLights: 50,
    maxShadowCasters: 20,
    maxDecals: 100,
    maxScreenSpaceEffects: 10
  }
};

// ============================================
// SISTEMA DE ESCUDOS COMPLETO
// ============================================
export interface ShieldSystem {
  id: string;
  name: string;
  type: 'bubble' | 'layered' | 'directional' | 'personal';
  
  // Propiedades visuales
  visual: {
    color: { r: number; g: number; b: number; a: number };
    intensity: number;
    texture: string;
    shader: string;
    distortion: number;
    fresnelPower: number;
    rimLight: boolean;
    glowStrength: number;
    pulseSpeed: number;
    pulseIntensity: number;
    hexPattern: boolean;
    energyField: boolean;
  };
  
  // Efectos de impacto
  impactFX: {
    flashDuration: number;
    rippleDuration: number;
    particleCount: number;
    particleColor: string;
    soundEffect: string;
    screenShake: number;
    decal: boolean;
  };
  
  // Estados
  states: {
    active: {
      animation: string;
      sound: string;
      energyCost: number;
    };
    damaged: {
      animation: string;
      flickerRate: number;
      colorShift: string;
    };
    critical: {
      animation: string;
      flickerRate: number;
      warningSound: string;
    };
    collapsed: {
      animation: string;
      sound: string;
      particleExplosion: boolean;
      shockwave: boolean;
    };
    regenerating: {
      animation: string;
      rate: number;
      sound: string;
    };
  };
  
  // Mecánicas
  mechanics: {
    maxHealth: number;
    regenerationRate: number;
    regenerationDelay: number;
    resistance: {
      ballistic: number;
      directional: number;
      missile: number;
    };
    weaknesses: string[];
    immunities: string[];
  };
}

export const SHIELD_SYSTEMS: Record<string, ShieldSystem> = {
  standard_bubble: {
    id: 'shield_standard',
    name: 'Escudo de Burbuja Estándar',
    type: 'bubble',
    visual: {
      color: { r: 0, g: 150, b: 255, a: 100 },
      intensity: 0.7,
      texture: 'shield_hex_pattern.png',
      shader: 'shield_bubble_standard',
      distortion: 0.3,
      fresnelPower: 2.0,
      rimLight: true,
      glowStrength: 1.5,
      pulseSpeed: 2.0,
      pulseIntensity: 0.2,
      hexPattern: true,
      energyField: true
    },
    impactFX: {
      flashDuration: 200,
      rippleDuration: 500,
      particleCount: 20,
      particleColor: '#00FFAA',
      soundEffect: 'shield_hit_standard.mp3',
      screenShake: 0.1,
      decal: true
    },
    states: {
      active: {
        animation: 'shield_bubble_idle',
        sound: 'shield_hum_low.mp3',
        energyCost: 10
      },
      damaged: {
        animation: 'shield_bubble_flicker',
        flickerRate: 0.5,
        colorShift: '#FFAA00'
      },
      critical: {
        animation: 'shield_bubble_critical',
        flickerRate: 0.8,
        warningSound: 'shield_warning.mp3'
      },
      collapsed: {
        animation: 'shield_bubble_break',
        sound: 'shield_down.mp3',
        particleExplosion: true,
        shockwave: true
      },
      regenerating: {
        animation: 'shield_bubble_rebuild',
        rate: 50,
        sound: 'shield_recharge.mp3'
      }
    },
    mechanics: {
      maxHealth: 1000,
      regenerationRate: 25,
      regenerationDelay: 5000,
      resistance: { ballistic: 1.0, directional: 1.0, missile: 1.0 },
      weaknesses: ['emp', 'shield_bypass'],
      immunities: ['critical_hits']
    }
  },
  
  reinforced_layered: {
    id: 'shield_reinforced',
    name: 'Escudo Reforzado por Capas',
    type: 'layered',
    visual: {
      color: { r: 0, g: 100, b: 200, a: 180 },
      intensity: 1.0,
      texture: 'shield_layer_pattern.png',
      shader: 'shield_layered_reinforced',
      distortion: 0.5,
      fresnelPower: 3.0,
      rimLight: true,
      glowStrength: 2.0,
      pulseSpeed: 1.0,
      pulseIntensity: 0.3,
      hexPattern: true,
      energyField: true
    },
    impactFX: {
      flashDuration: 300,
      rippleDuration: 800,
      particleCount: 40,
      particleColor: '#0088FF',
      soundEffect: 'shield_hit_heavy.mp3',
      screenShake: 0.2,
      decal: true
    },
    states: {
      active: {
        animation: 'shield_layer_idle',
        sound: 'shield_hum_medium.mp3',
        energyCost: 20
      },
      damaged: {
        animation: 'shield_layer_flicker',
        flickerRate: 0.4,
        colorShift: '#FF6600'
      },
      critical: {
        animation: 'shield_layer_critical',
        flickerRate: 0.9,
        warningSound: 'shield_critical.mp3'
      },
      collapsed: {
        animation: 'shield_layer_break',
        sound: 'shield_collapse.mp3',
        particleExplosion: true,
        shockwave: true
      },
      regenerating: {
        animation: 'shield_layer_rebuild',
        rate: 30,
        sound: 'shield_restore.mp3'
      }
    },
    mechanics: {
      maxHealth: 2500,
      regenerationRate: 15,
      regenerationDelay: 8000,
      resistance: { ballistic: 0.8, directional: 1.2, missile: 0.9 },
      weaknesses: ['armor_piercing'],
      immunities: ['shield_drain']
    }
  },
  
  directional_deflector: {
    id: 'shield_directional',
    name: 'Escudo Direccional Deflector',
    type: 'directional',
    visual: {
      color: { r: 150, g: 255, b: 100, a: 120 },
      intensity: 0.8,
      texture: 'shield_directional.png',
      shader: 'shield_directional_arc',
      distortion: 0.4,
      fresnelPower: 2.5,
      rimLight: true,
      glowStrength: 1.8,
      pulseSpeed: 3.0,
      pulseIntensity: 0.25,
      hexPattern: false,
      energyField: true
    },
    impactFX: {
      flashDuration: 150,
      rippleDuration: 400,
      particleCount: 15,
      particleColor: '#AAFF00',
      soundEffect: 'shield_deflect.mp3',
      screenShake: 0.05,
      decal: false
    },
    states: {
      active: {
        animation: 'shield_arc_active',
        sound: 'shield_deflector_hum.mp3',
        energyCost: 15
      },
      damaged: {
        animation: 'shield_arc_damaged',
        flickerRate: 0.6,
        colorShift: '#FFCC00'
      },
      critical: {
        animation: 'shield_arc_failing',
        flickerRate: 1.0,
        warningSound: 'shield_arc_alarm.mp3'
      },
      collapsed: {
        animation: 'shield_arc_fail',
        sound: 'shield_arc_down.mp3',
        particleExplosion: false,
        shockwave: false
      },
      regenerating: {
        animation: 'shield_arc_reform',
        rate: 40,
        sound: 'shield_arc_rebuild.mp3'
      }
    },
    mechanics: {
      maxHealth: 800,
      regenerationRate: 35,
      regenerationDelay: 3000,
      resistance: { ballistic: 1.5, directional: 0.6, missile: 1.3 },
      weaknesses: ['flanking', 'aoe'],
      immunities: ['frontal_attacks']
    }
  }
};

// ============================================
// SISTEMA DE EXPLOSIONES COMPLETO
// ============================================
export interface ExplosionSystem {
  id: string;
  name: string;
  category: 'small' | 'medium' | 'large' | 'massive' | 'nuclear' | 'ship_death';
  
  // Fases de explosión
  phases: {
    initial: {
      duration: number;
      flashColor: string;
      flashIntensity: number;
      coreSize: number;
      particleCount: number;
      particleVelocity: number;
      soundStart: string;
    };
    expansion: {
      duration: number;
      fireballSize: number;
      fireballColor: string;
      turbulence: number;
      smokeAmount: number;
      debrisCount: number;
    };
    peak: {
      duration: number;
      shockwave: boolean;
      shockwaveSpeed: number;
      lightRadius: number;
      maxBrightness: number;
      particleSpread: number;
    };
    dissipation: {
      duration: number;
      smokeLinger: number;
      coolingRate: number;
      residualGlow: boolean;
      crater: boolean;
    };
  };
  
  // Efectos visuales
  visual: {
    coreTexture: string;
    fireballTexture: string;
    smokeTexture: string;
    debrisModels: string[];
    sparkTexture: string;
    shader: string;
    distortionStrength: number;
    chromaticAberration: boolean;
  };
  
  // Efectos de sonido
  audio: {
    explosionSound: string;
    debrisSound: string;
    secondaryExplosions: boolean;
    echo: boolean;
    lowPassFilter: boolean;
    reverb: number;
  };
  
  // Impacto ambiental
  environmental: {
    screenShake: number;
    screenFlash: number;
    radiationPulse: boolean;
    emp: boolean;
    fireZone: boolean;
    fireDuration: number;
    decal: {
      enabled: boolean;
      texture: string;
      size: number;
      duration: number;
    };
  };
  
  // Daño área
  aoe: {
    radius: number;
    damage: number;
    damageFalloff: 'linear' | 'exponential' | 'none';
    pushForce: number;
    stunDuration: number;
  };
}

export const EXPLOSION_SYSTEMS: Record<string, ExplosionSystem> = {
  small_impact: {
    id: 'explosion_small',
    name: 'Explosión de Impacto Pequeña',
    category: 'small',
    phases: {
      initial: {
        duration: 100,
        flashColor: '#FF6600',
        flashIntensity: 0.8,
        coreSize: 2,
        particleCount: 20,
        particleVelocity: 50,
        soundStart: 'explosion_small_start.mp3'
      },
      expansion: {
        duration: 300,
        fireballSize: 5,
        fireballColor: '#FF4400',
        turbulence: 0.3,
        smokeAmount: 10,
        debrisCount: 3
      },
      peak: {
        duration: 200,
        shockwave: false,
        shockwaveSpeed: 0,
        lightRadius: 20,
        maxBrightness: 1.0,
        particleSpread: 30
      },
      dissipation: {
        duration: 400,
        smokeLinger: 200,
        coolingRate: 0.8,
        residualGlow: false,
        crater: false
      }
    },
    visual: {
      coreTexture: 'explosion_core_small.png',
      fireballTexture: 'fireball_small.png',
      smokeTexture: 'smoke_puff.png',
      debrisModels: ['debris_tiny_01', 'debris_tiny_02'],
      sparkTexture: 'sparks_small.png',
      shader: 'explosion_standard',
      distortionStrength: 0.2,
      chromaticAberration: false
    },
    audio: {
      explosionSound: 'explosion_small.mp3',
      debrisSound: 'debris_scatter.mp3',
      secondaryExplosions: false,
      echo: false,
      lowPassFilter: false,
      reverb: 0.2
    },
    environmental: {
      screenShake: 0.1,
      screenFlash: 0.3,
      radiationPulse: false,
      emp: false,
      fireZone: false,
      fireDuration: 0,
      decal: {
        enabled: true,
        texture: 'scorch_small.png',
        size: 3,
        duration: 30000
      }
    },
    aoe: {
      radius: 10,
      damage: 50,
      damageFalloff: 'linear',
      pushForce: 20,
      stunDuration: 0
    }
  },
  
  medium_explosion: {
    id: 'explosion_medium',
    name: 'Explosión Mediana',
    category: 'medium',
    phases: {
      initial: {
        duration: 150,
        flashColor: '#FF4400',
        flashIntensity: 1.2,
        coreSize: 5,
        particleCount: 50,
        particleVelocity: 80,
        soundStart: 'explosion_medium_start.mp3'
      },
      expansion: {
        duration: 500,
        fireballSize: 12,
        fireballColor: '#FF2200',
        turbulence: 0.5,
        smokeAmount: 30,
        debrisCount: 8
      },
      peak: {
        duration: 400,
        shockwave: true,
        shockwaveSpeed: 100,
        lightRadius: 50,
        maxBrightness: 1.5,
        particleSpread: 60
      },
      dissipation: {
        duration: 800,
        smokeLinger: 600,
        coolingRate: 0.6,
        residualGlow: true,
        crater: false
      }
    },
    visual: {
      coreTexture: 'explosion_core_medium.png',
      fireballTexture: 'fireball_medium.png',
      smokeTexture: 'smoke_column.png',
      debrisModels: ['debris_small_01', 'debris_small_02', 'debris_small_03'],
      sparkTexture: 'sparks_medium.png',
      shader: 'explosion_advanced',
      distortionStrength: 0.4,
      chromaticAberration: true
    },
    audio: {
      explosionSound: 'explosion_medium.mp3',
      debrisSound: 'debris_medium.mp3',
      secondaryExplosions: true,
      echo: true,
      lowPassFilter: true,
      reverb: 0.4
    },
    environmental: {
      screenShake: 0.3,
      screenFlash: 0.6,
      radiationPulse: false,
      emp: false,
      fireZone: true,
      fireDuration: 5000,
      decal: {
        enabled: true,
        texture: 'scorch_medium.png',
        size: 8,
        duration: 60000
      }
    },
    aoe: {
      radius: 25,
      damage: 200,
      damageFalloff: 'exponential',
      pushForce: 50,
      stunDuration: 1000
    }
  },
  
  ship_destruction: {
    id: 'explosion_ship_death',
    name: 'Destrucción de Nave',
    category: 'ship_death',
    phases: {
      initial: {
        duration: 300,
        flashColor: '#FF0000',
        flashIntensity: 2.0,
        coreSize: 15,
        particleCount: 200,
        particleVelocity: 150,
        soundStart: 'ship_explosion_start.mp3'
      },
      expansion: {
        duration: 800,
        fireballSize: 30,
        fireballColor: '#FF6600',
        turbulence: 0.8,
        smokeAmount: 100,
        debrisCount: 30
      },
      peak: {
        duration: 600,
        shockwave: true,
        shockwaveSpeed: 200,
        lightRadius: 100,
        maxBrightness: 2.0,
        particleSpread: 120
      },
      dissipation: {
        duration: 1500,
        smokeLinger: 1200,
        coolingRate: 0.4,
        residualGlow: true,
        crater: false
      }
    },
    visual: {
      coreTexture: 'explosion_core_ship.png',
      fireballTexture: 'fireball_ship.png',
      smokeTexture: 'smoke_heavy.png',
      debrisModels: ['ship_debris_01', 'ship_debris_02', 'ship_debris_03', 'ship_chunk_01', 'ship_chunk_02'],
      sparkTexture: 'sparks_intense.png',
      shader: 'explosion_ship_cinematic',
      distortionStrength: 0.8,
      chromaticAberration: true
    },
    audio: {
      explosionSound: 'ship_explosion.mp3',
      debrisSound: 'ship_breakup.mp3',
      secondaryExplosions: true,
      echo: true,
      lowPassFilter: true,
      reverb: 0.6
    },
    environmental: {
      screenShake: 0.8,
      screenFlash: 1.0,
      radiationPulse: true,
      emp: true,
      fireZone: true,
      fireDuration: 10000,
      decal: {
        enabled: false,
        texture: '',
        size: 0,
        duration: 0
      }
    },
    aoe: {
      radius: 50,
      damage: 500,
      damageFalloff: 'exponential',
      pushForce: 100,
      stunDuration: 2000
    }
  },
  
  massive_nuclear: {
    id: 'explosion_nuclear',
    name: 'Explosión Nuclear',
    category: 'nuclear',
    phases: {
      initial: {
        duration: 500,
        flashColor: '#FFFFFF',
        flashIntensity: 3.0,
        coreSize: 50,
        particleCount: 1000,
        particleVelocity: 300,
        soundStart: 'nuclear_start.mp3'
      },
      expansion: {
        duration: 2000,
        fireballSize: 100,
        fireballColor: '#FFAA00',
        turbulence: 1.0,
        smokeAmount: 500,
        debrisCount: 100
      },
      peak: {
        duration: 1500,
        shockwave: true,
        shockwaveSpeed: 500,
        lightRadius: 500,
        maxBrightness: 3.0,
        particleSpread: 300
      },
      dissipation: {
        duration: 5000,
        smokeLinger: 3000,
        coolingRate: 0.2,
        residualGlow: true,
        crater: true
      }
    },
    visual: {
      coreTexture: 'explosion_core_nuclear.png',
      fireballTexture: 'fireball_nuclear.png',
      smokeTexture: 'smoke_nuclear.png',
      debrisModels: ['debris_massive_01', 'debris_massive_02', 'debris_massive_03'],
      sparkTexture: 'sparks_nuclear.png',
      shader: 'explosion_nuclear',
      distortionStrength: 1.5,
      chromaticAberration: true
    },
    audio: {
      explosionSound: 'nuclear_explosion.mp3',
      debrisSound: 'massive_debris.mp3',
      secondaryExplosions: true,
      echo: true,
      lowPassFilter: true,
      reverb: 1.0
    },
    environmental: {
      screenShake: 1.5,
      screenFlash: 2.0,
      radiationPulse: true,
      emp: true,
      fireZone: true,
      fireDuration: 30000,
      decal: {
        enabled: true,
        texture: 'nuclear_crater.png',
        size: 100,
        duration: 300000
      }
    },
    aoe: {
      radius: 200,
      damage: 5000,
      damageFalloff: 'exponential',
      pushForce: 500,
      stunDuration: 5000
    }
  }
};

// ============================================
// ESTRATEGIAS VISUALES Y MECÁNICAS
// ============================================
export interface VisualStrategy {
  id: string;
  name: string;
  description: string;
  category: 'offensive' | 'defensive' | 'support' | 'control';
  
  // Indicadores visuales
  indicators: {
    allyHighlight: { color: string; pulse: boolean; icon: string };
    enemyHighlight: { color: string; pulse: boolean; icon: string };
    objectiveMarker: { color: string; shape: string; animation: string };
    threatIndicator: { color: string; intensity: number; sound: string };
  };
  
  // Feedback visual
  feedback: {
    success: { particles: string; sound: string; screenEffect: string };
    failure: { particles: string; sound: string; screenEffect: string };
    critical: { particles: string; sound: string; screenEffect: string; timeSlow: number };
  };
  
  // Mecánicas asociadas
  mechanics: {
    triggers: string[];
    conditions: string[];
    cooldownVisual: { bar: boolean; color: string; animation: string };
    chargeUp: { duration: number; visual: string; sound: string };
    comboVisuals: { enabled: boolean; maxCombo: number; visualProgression: string[] };
  };
  
  // Optimización
  optimization: {
    priority: FXPriority;
    cullDistance: number;
    lodLevels: number;
    particleBudget: number;
  };
}

export const VISUAL_STRATEGIES: Record<string, VisualStrategy> = {
  alpha_strike: {
    id: 'strategy_alpha',
    name: 'Ataque Alpha',
    description: 'Concentración de fuego masivo en objetivo único',
    category: 'offensive',
    indicators: {
      allyHighlight: { color: '#00FF00', pulse: true, icon: 'target_lock' },
      enemyHighlight: { color: '#FF0000', pulse: true, icon: 'priority_target' },
      objectiveMarker: { color: '#FF6600', shape: 'diamond', animation: 'pulse_fast' },
      threatIndicator: { color: '#FF0000', intensity: 1.0, sound: 'threat_high.mp3' }
    },
    feedback: {
      success: { particles: 'impact_mega', sound: 'alpha_hit.mp3', screenEffect: 'flash_white' },
      failure: { particles: 'miss_burst', sound: 'alpha_miss.mp3', screenEffect: 'shake' },
      critical: { particles: 'critical_explosion', sound: 'alpha_crit.mp3', screenEffect: 'time_slow_0.5', timeSlow: 0.5 }
    },
    mechanics: {
      triggers: ['target_lock', 'fleet_concentration'],
      conditions: ['min_3_ships', 'target_in_range'],
      cooldownVisual: { bar: true, color: '#FF4400', animation: 'radial_fill' },
      chargeUp: { duration: 2000, visual: 'laser_charge', sound: 'charging.mp3' },
      comboVisuals: { enabled: true, maxCombo: 5, visualProgression: ['combo_x2', 'combo_x3', 'combo_x4', 'combo_x5', 'combo_omega'] }
    },
    optimization: {
      priority: 'critical',
      cullDistance: 5000,
      lodLevels: 3,
      particleBudget: 500
    }
  },
  
  shield_wall: {
    id: 'strategy_shield',
    name: 'Muro de Escudos',
    description: 'Formación defensiva con superposición de escudos',
    category: 'defensive',
    indicators: {
      allyHighlight: { color: '#0088FF', pulse: true, icon: 'shield_link' },
      enemyHighlight: { color: '#FF8800', pulse: false, icon: 'blocked' },
      objectiveMarker: { color: '#00AAFF', shape: 'shield', animation: 'rotate_slow' },
      threatIndicator: { color: '#0088FF', intensity: 0.7, sound: 'shield_active.mp3' }
    },
    feedback: {
      success: { particles: 'shield_absorb', sound: 'shield_block.mp3', screenEffect: 'blue_tint' },
      failure: { particles: 'shield_break', sound: 'shield_fail.mp3', screenEffect: 'red_flash' },
      critical: { particles: 'shield_overload', sound: 'shield_critical.mp3', screenEffect: 'pulse_red', timeSlow: 0.3 }
    },
    mechanics: {
      triggers: ['formation_sphere', 'shield_overlap'],
      conditions: ['min_5_ships', 'shields_active'],
      cooldownVisual: { bar: false, color: '#0088FF', animation: 'shield_pulse' },
      chargeUp: { duration: 0, visual: 'none', sound: 'shield_up.mp3' },
      comboVisuals: { enabled: false, maxCombo: 0, visualProgression: [] }
    },
    optimization: {
      priority: 'high',
      cullDistance: 3000,
      lodLevels: 2,
      particleBudget: 300
    }
  }
};

// ============================================
// TIPOS DE DIFICULTAD Y AJUSTES VISUALES
// ============================================
export interface DifficultyVisualSettings {
  difficulty: 'casual' | 'normal' | 'hard' | 'insane';
  
  // Efectos de daño al jugador
  playerDamageFeedback: {
    screenRedIntensity: number;
    vignetteStrength: number;
    heartbeatEffect: boolean;
    warningSounds: boolean;
    directionalIndicators: boolean;
  };
  
  // Efectos enemigos
  enemyVisuals: {
    glowIntensity: number;
    particleTrails: boolean;
    attackTelegraph: 'none' | 'subtle' | 'clear' | 'very_clear';
    healthBarVisibility: 'never' | 'damaged' | 'always' | 'full_info';
  };
  
  // Ayudas visuales
  assists: {
    aimAssistIndicator: boolean;
    optimalRangeHighlight: boolean;
    weakPointGlow: boolean;
    trajectoryPrediction: boolean;
    threatRadar: boolean;
  };
  
  // Efectos ambientales
  environmental: {
    hazardVisibility: 'subtle' | 'normal' | 'enhanced';
    resourceGlow: boolean;
    pathfindingHints: boolean;
    objectiveCompass: boolean;
  };
}

export const DIFFICULTY_VISUAL_SETTINGS: Record<string, DifficultyVisualSettings> = {
  casual: {
    difficulty: 'casual',
    playerDamageFeedback: {
      screenRedIntensity: 0.3,
      vignetteStrength: 0.2,
      heartbeatEffect: false,
      warningSounds: true,
      directionalIndicators: true
    },
    enemyVisuals: {
      glowIntensity: 1.5,
      particleTrails: true,
      attackTelegraph: 'very_clear',
      healthBarVisibility: 'full_info'
    },
    assists: {
      aimAssistIndicator: true,
      optimalRangeHighlight: true,
      weakPointGlow: true,
      trajectoryPrediction: true,
      threatRadar: true
    },
    environmental: {
      hazardVisibility: 'enhanced',
      resourceGlow: true,
      pathfindingHints: true,
      objectiveCompass: true
    }
  },
  
  normal: {
    difficulty: 'normal',
    playerDamageFeedback: {
      screenRedIntensity: 0.5,
      vignetteStrength: 0.4,
      heartbeatEffect: true,
      warningSounds: true,
      directionalIndicators: true
    },
    enemyVisuals: {
      glowIntensity: 1.0,
      particleTrails: true,
      attackTelegraph: 'clear',
      healthBarVisibility: 'damaged'
    },
    assists: {
      aimAssistIndicator: false,
      optimalRangeHighlight: true,
      weakPointGlow: false,
      trajectoryPrediction: false,
      threatRadar: true
    },
    environmental: {
      hazardVisibility: 'normal',
      resourceGlow: true,
      pathfindingHints: false,
      objectiveCompass: true
    }
  },
  
  hard: {
    difficulty: 'hard',
    playerDamageFeedback: {
      screenRedIntensity: 0.7,
      vignetteStrength: 0.6,
      heartbeatEffect: true,
      warningSounds: true,
      directionalIndicators: false
    },
    enemyVisuals: {
      glowIntensity: 0.7,
      particleTrails: false,
      attackTelegraph: 'subtle',
      healthBarVisibility: 'never'
    },
    assists: {
      aimAssistIndicator: false,
      optimalRangeHighlight: false,
      weakPointGlow: false,
      trajectoryPrediction: false,
      threatRadar: false
    },
    environmental: {
      hazardVisibility: 'subtle',
      resourceGlow: false,
      pathfindingHints: false,
      objectiveCompass: false
    }
  },
  
  insane: {
    difficulty: 'insane',
    playerDamageFeedback: {
      screenRedIntensity: 1.0,
      vignetteStrength: 0.8,
      heartbeatEffect: true,
      warningSounds: false,
      directionalIndicators: false
    },
    enemyVisuals: {
      glowIntensity: 0.5,
      particleTrails: false,
      attackTelegraph: 'none',
      healthBarVisibility: 'never'
    },
    assists: {
      aimAssistIndicator: false,
      optimalRangeHighlight: false,
      weakPointGlow: false,
      trajectoryPrediction: false,
      threatRadar: false
    },
    environmental: {
      hazardVisibility: 'subtle',
      resourceGlow: false,
      pathfindingHints: false,
      objectiveCompass: false
    }
  }
};

// ============================================
// ESTÉTICA VISUAL Y DIRECCIÓN DE ARTE
// ============================================
export interface VisualDirection {
  // Paleta de colores
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    warning: string;
    success: string;
    danger: string;
    neutral: string;
    background: string;
  };
  
  // Estilo visual
  style: {
    theme: 'sci-fi' | 'cyberpunk' | 'space-opera' | 'military';
    realism: 'cartoon' | 'stylized' | 'semi-realistic' | 'realistic';
    detailLevel: 'low' | 'medium' | 'high' | 'ultra';
    lightingStyle: 'dramatic' | 'natural' | 'studio' | 'neon';
  };
  
  // Efectos atmosféricos
  atmosphere: {
    nebulaDensity: number;
    starField: boolean;
    dustParticles: boolean;
    lensFlare: boolean;
    chromaticAberration: number;
    filmGrain: number;
    vignette: number;
    bloom: number;
  };
  
  // Animación
  animation: {
    style: 'snappy' | 'smooth' | 'weighty' | 'exaggerated';
    uiTransitions: number;
    combatPacing: 'slow' | 'normal' | 'fast' | 'chaotic';
    cameraShake: 'minimal' | 'standard' | 'heavy' | 'extreme';
  };
}

export const GAME_VISUAL_DIRECTION: VisualDirection = {
  colorPalette: {
    primary: '#00A8FF',
    secondary: '#FF6600',
    accent: '#FFCC00',
    warning: '#FF4400',
    success: '#00FF88',
    danger: '#FF0044',
    neutral: '#888888',
    background: '#0A0A1A'
  },
  style: {
    theme: 'sci-fi',
    realism: 'semi-realistic',
    detailLevel: 'high',
    lightingStyle: 'dramatic'
  },
  atmosphere: {
    nebulaDensity: 0.3,
    starField: true,
    dustParticles: true,
    lensFlare: true,
    chromaticAberration: 0.02,
    filmGrain: 0.05,
    vignette: 0.2,
    bloom: 1.2
  },
  animation: {
    style: 'snappy',
    uiTransitions: 300,
    combatPacing: 'fast',
    cameraShake: 'standard'
  }
};

// ============================================
// TECNOLOGÍAS Y MÉTODOS DE PROGRAMACIÓN
// ============================================
export interface FXProgrammingMethods {
  // Técnicas de renderizado
  rendering: {
    forwardRendering: { useCase: string; pros: string[]; cons: string[] };
    deferredRendering: { useCase: string; pros: string[]; cons: string[] };
    forwardPlus: { useCase: string; pros: string[]; cons: string[] };
    clustered: { useCase: string; pros: string[]; cons: string[] };
  };
  
  // Sistemas de partículas
  particleSystems: {
    cpu: { useCase: string; maxParticles: number; features: string[] };
    gpu: { useCase: string; maxParticles: number; features: string[] };
    hybrid: { useCase: string; maxParticles: number; features: string[] };
    compute: { useCase: string; maxParticles: number; features: string[] };
  };
  
  // Post-procesado
  postProcessing: {
    techniques: string[];
    order: string[];
    performance: { high: string[]; medium: string[]; low: string[] };
  };
  
  // Shaders
  shaders: {
    vertex: string[];
    fragment: string[];
    compute: string[];
    geometry: string[];
  };
}

export const FX_PROGRAMMING_METHODS: FXProgrammingMethods = {
  rendering: {
    forwardRendering: {
      useCase: 'Menos de 100 luces dinámicas, transparencias complejas',
      pros: ['Simple', 'Bueno para transparencias', 'Menor uso memoria'],
      cons: ['Lento con muchas luces', 'Overdraw', 'No escala bien']
    },
    deferredRendering: {
      useCase: 'Muchas luces, escenas complejas, poca transparencia',
      pros: ['Escalable con luces', 'Mejor rendimiento complejo', 'MSAA disponible'],
      cons: ['Transparencias difíciles', 'Alto uso memoria', 'G-buffer costoso']
    },
    forwardPlus: {
      useCase: 'Balance entre luces y transparencias',
      pros: ['1000+ luces', 'Transparencias funcionan', 'Buen balance'],
      cons: ['Complejo de implementar', 'Tile artifacts', 'Overhead CPU']
    },
    clustered: {
      useCase: 'Miles de luces, VR, escenarios masivos',
      pros: ['10000+ luces', '3D culling', 'Muy escalable'],
      cons: ['Muy complejo', 'Memoria clusters', 'Setup costoso']
    }
  },
  
  particleSystems: {
    cpu: {
      useCase: 'Pocos sistemas, física compleja, colisiones precisas',
      maxParticles: 10000,
      features: ['Física compleja', 'Colisiones', 'Animación procedural']
    },
    gpu: {
      useCase: 'Muchas partículas simples, billboards',
      maxParticles: 1000000,
      features: ['Vertex shaders', 'Billboarding', 'Texture animation']
    },
    hybrid: {
      useCase: 'Balance física y cantidad',
      maxParticles: 100000,
      features: ['CPU physics', 'GPU rendering', 'Spawn control']
    },
    compute: {
      useCase: 'Simulaciones masivas, fluidos, cloth',
      maxParticles: 10000000,
      features: ['Parallel simulation', 'Complex physics', 'GPU collisions']
    }
  },
  
  postProcessing: {
    techniques: [
      'Bloom', 'Tone Mapping', 'Color Grading', 'SSAO', 'SSR',
      'Depth of Field', 'Motion Blur', 'Chromatic Aberration',
      'Vignette', 'Film Grain', 'Lens Distortion', 'TAA'
    ],
    order: [
      'DepthPrepass', 'SSAO', 'SSR', 'BaseRendering',
      'Bloom', 'DepthOfField', 'MotionBlur', 'ToneMapping',
      'ColorGrading', 'FinalEffects', 'UI'
    ],
    performance: {
      high: ['SSAO', 'SSR', 'Motion Blur', 'High Quality Bloom'],
      medium: ['SSAO Low', 'SSR Low', 'Simple Bloom', 'TAA'],
      low: ['Tone Mapping', 'Basic Bloom', 'Color Grading']
    }
  },
  
  shaders: {
    vertex: [
      'Displacement mapping',
      'Vertex animation',
      'Billboarding',
      'Skinning',
      'Tessellation'
    ],
    fragment: [
      'PBR lighting',
      'Normal mapping',
      'Parallax mapping',
      'Subsurface scattering',
      'Anisotropic materials'
    ],
    compute: [
      'Particle simulation',
      'Fluid dynamics',
      'Culling',
      'Occlusion',
      'FFT'
    ],
    geometry: [
      'Explosion debris',
      'Fur/Grass',
      'Wireframe',
      'Silhouette',
      'Outline'
    ]
  }
};

// ============================================
// OPTIMIZACIÓN AVANZADA
// ============================================
export interface FXOptimizationTechniques {
  cpu: {
    objectPooling: {
      enabled: boolean;
      poolSizes: Record<string, number>;
      strategy: 'fixed' | 'dynamic' | 'hybrid';
    };
    culling: {
      frustum: boolean;
      occlusion: boolean;
      distance: boolean;
      predicted: boolean;
    };
    batching: {
      static: boolean;
      dynamic: boolean;
      gpuInstancing: boolean;
      indirect: boolean;
    };
  };
  
  gpu: {
    lod: {
      enabled: boolean;
      distances: number[];
      qualitySteps: number;
    };
    textureStreaming: {
      enabled: boolean;
      poolSize: number;
      async: boolean;
    };
    memoryManagement: {
      garbageCollection: 'manual' | 'automatic';
      bufferReuse: boolean;
      textureAtlasing: boolean;
    };
  };
  
  rendering: {
    earlyZ: boolean;
    hiZOcclusion: boolean;
    gpuCulling: boolean;
    variableRateShading: boolean;
    dynamicResolution: {
      enabled: boolean;
      minScale: number;
      maxScale: number;
      targetFPS: number;
    };
  };
}

export const FX_OPTIMIZATION_TECHNIQUES: FXOptimizationTechniques = {
  cpu: {
    objectPooling: {
      enabled: true,
      poolSizes: {
        projectiles: 500,
        explosions: 50,
        particles: 1000,
        decals: 200,
        sounds: 100
      },
      strategy: 'hybrid'
    },
    culling: {
      frustum: true,
      occlusion: true,
      distance: true,
      predicted: true
    },
    batching: {
      static: true,
      dynamic: true,
      gpuInstancing: true,
      indirect: false
    }
  },
  
  gpu: {
    lod: {
      enabled: true,
      distances: [100, 500, 2000, 5000],
      qualitySteps: 4
    },
    textureStreaming: {
      enabled: true,
      poolSize: 2048,
      async: true
    },
    memoryManagement: {
      garbageCollection: 'manual',
      bufferReuse: true,
      textureAtlasing: true
    }
  },
  
  rendering: {
    earlyZ: true,
    hiZOcclusion: true,
    gpuCulling: true,
    variableRateShading: true,
    dynamicResolution: {
      enabled: true,
      minScale: 0.5,
      maxScale: 1.0,
      targetFPS: 60
    }
  }
};

// ============================================
// HELPERS
// ============================================
export function getExplosionByCategory(category: ExplosionSystem['category']): ExplosionSystem[] {
  return Object.values(EXPLOSION_SYSTEMS).filter(e => e.category === category);
}

export function getShieldByType(type: ShieldSystem['type']): ShieldSystem[] {
  return Object.values(SHIELD_SYSTEMS).filter(s => s.type === type);
}

export function getVisualStrategyByCategory(category: VisualStrategy['category']): VisualStrategy[] {
  return Object.values(VISUAL_STRATEGIES).filter(s => s.category === category);
}

export function getOptimizationForQuality(quality: keyof FXPerformanceConfig['qualityLevels']): FXPerformanceConfig['qualityLevels'][typeof quality] {
  return FX_PERFORMANCE_CONFIG.qualityLevels[quality];
}

export function calculateFXBudget(
  shipCount: number,
  quality: keyof FXPerformanceConfig['qualityLevels']
): { particles: number; lights: number; decals: number } {
  const baseConfig = FX_PERFORMANCE_CONFIG.qualityLevels[quality];
  const threshold = FX_PERFORMANCE_CONFIG.shipCountThresholds;
  
  let scale = 1.0;
  if (shipCount > threshold.massive.max) scale = 0.3;
  else if (shipCount > threshold.large.max) scale = 0.5;
  else if (shipCount > threshold.medium.max) scale = 0.8;
  
  return {
    particles: Math.floor(baseConfig.particleCount * scale),
    lights: Math.floor(FX_PERFORMANCE_CONFIG.limits.maxLights * scale),
    decals: Math.floor(FX_PERFORMANCE_CONFIG.limits.maxDecals * scale)
  };
}

export const FXSystemComplete = {
  FX_PERFORMANCE_CONFIG,
  SHIELD_SYSTEMS,
  EXPLOSION_SYSTEMS,
  VISUAL_STRATEGIES,
  DIFFICULTY_VISUAL_SETTINGS,
  GAME_VISUAL_DIRECTION,
  FX_PROGRAMMING_METHODS,
  FX_OPTIMIZATION_TECHNIQUES,
  getExplosionByCategory,
  getShieldByType,
  getVisualStrategyByCategory,
  getOptimizationForQuality,
  calculateFXBudget
};
