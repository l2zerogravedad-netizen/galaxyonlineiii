/**
 * SISTEMA DE EFECTOS VISUALES Y SONIDOS - GALAXY ONLINE II
 * Efectos de combate, habilidades, explosiones y sistema de audio
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
  | 'ui';

export type FXIntensity = 'low' | 'medium' | 'high' | 'epic';

// ============================================
// EFECTOS DE ARMAS
// ============================================
export interface WeaponFX {
  id: string;
  name: string;
  weaponType: 'ballistic' | 'directional' | 'missile' | 'fighter';
  intensity: FXIntensity;
  
  // Visual
  muzzleFlash: {
    color: string;
    size: number;
    duration: number;
    particleCount: number;
  };
  
  projectile: {
    model: string;
    trail: string;
    trailColor: string;
    trailWidth: number;
    speed: number;
    glow: boolean;
  };
  
  impact: {
    effect: string;
    size: number;
    duration: number;
    shake: number;
    particleCount: number;
    color: string;
  };
  
  // Audio
  fireSound: string;
  impactSound: string;
  flybySound?: string;
}

export const WEAPON_FX: Record<string, WeaponFX> = {
  ballistic_cannon: {
    id: 'fx_ballistic_cannon',
    name: 'Cañón Balístico',
    weaponType: 'ballistic',
    intensity: 'medium',
    muzzleFlash: { color: '#FF6600', size: 2, duration: 100, particleCount: 10 },
    projectile: { model: 'shell', trail: 'smoke', trailColor: '#888888', trailWidth: 0.5, speed: 800, glow: false },
    impact: { effect: 'explosion_small', size: 3, duration: 300, shake: 0.2, particleCount: 20, color: '#FF4400' },
    fireSound: 'cannon_fire.mp3',
    impactSound: 'explosion_small.mp3'
  },
  
  ballistic_mass_driver: {
    id: 'fx_ballistic_mass',
    name: 'Cañón de Masa',
    weaponType: 'ballistic',
    intensity: 'high',
    muzzleFlash: { color: '#FF8800', size: 4, duration: 150, particleCount: 20 },
    projectile: { model: 'slug', trail: 'ion', trailColor: '#00FFFF', trailWidth: 1, speed: 1200, glow: true },
    impact: { effect: 'explosion_medium', size: 5, duration: 500, shake: 0.5, particleCount: 40, color: '#FF6600' },
    fireSound: 'mass_driver_fire.mp3',
    impactSound: 'explosion_medium.mp3'
  },
  
  directional_laser: {
    id: 'fx_directional_laser',
    name: 'Láser',
    weaponType: 'directional',
    intensity: 'medium',
    muzzleFlash: { color: '#00FF00', size: 1, duration: 50, particleCount: 5 },
    projectile: { model: 'beam', trail: 'laser', trailColor: '#00FF00', trailWidth: 0.3, speed: 3000, glow: true },
    impact: { effect: 'spark_burst', size: 2, duration: 200, shake: 0.1, particleCount: 15, color: '#00FF00' },
    fireSound: 'laser_fire.mp3',
    impactSound: 'laser_impact.mp3'
  },
  
  directional_plasma: {
    id: 'fx_directional_plasma',
    name: 'Plasma',
    weaponType: 'directional',
    intensity: 'high',
    muzzleFlash: { color: '#FF00FF', size: 3, duration: 200, particleCount: 30 },
    projectile: { model: 'plasma_ball', trail: 'plasma', trailColor: '#FF00FF', trailWidth: 2, speed: 600, glow: true },
    impact: { effect: 'plasma_burst', size: 6, duration: 600, shake: 0.4, particleCount: 60, color: '#FF00FF' },
    fireSound: 'plasma_fire.mp3',
    impactSound: 'plasma_impact.mp3'
  },
  
  directional_particle: {
    id: 'fx_directional_particle',
    name: 'Cañón de Partículas',
    weaponType: 'directional',
    intensity: 'epic',
    muzzleFlash: { color: '#00FFFF', size: 5, duration: 300, particleCount: 50 },
    projectile: { model: 'particle_beam', trail: 'energy', trailColor: '#00FFFF', trailWidth: 3, speed: 2500, glow: true },
    impact: { effect: 'particle_explosion', size: 8, duration: 800, shake: 0.8, particleCount: 100, color: '#00FFFF' },
    fireSound: 'particle_cannon.mp3',
    impactSound: 'particle_impact.mp3'
  },
  
  missile_rocket: {
    id: 'fx_missile_rocket',
    name: 'Cohete',
    weaponType: 'missile',
    intensity: 'medium',
    muzzleFlash: { color: '#FF4400', size: 2, duration: 150, particleCount: 15 },
    projectile: { model: 'missile', trail: 'fire', trailColor: '#FF4400', trailWidth: 1, speed: 400, glow: true },
    impact: { effect: 'explosion_medium', size: 4, duration: 400, shake: 0.3, particleCount: 30, color: '#FF4400' },
    fireSound: 'missile_launch.mp3',
    impactSound: 'explosion_medium.mp3',
    flybySound: 'missile_flyby.mp3'
  },
  
  missile_torpedo: {
    id: 'fx_missile_torpedo',
    name: 'Torpedo',
    weaponType: 'missile',
    intensity: 'high',
    muzzleFlash: { color: '#FF0000', size: 3, duration: 200, particleCount: 25 },
    projectile: { model: 'torpedo', trail: 'heavy_fire', trailColor: '#FF0000', trailWidth: 2, speed: 300, glow: true },
    impact: { effect: 'explosion_large', size: 7, duration: 700, shake: 0.7, particleCount: 80, color: '#FF0000' },
    fireSound: 'torpedo_launch.mp3',
    impactSound: 'explosion_large.mp3'
  },
  
  missile_cruise: {
    id: 'fx_missile_cruise',
    name: 'Misil Crucero',
    weaponType: 'missile',
    intensity: 'epic',
    muzzleFlash: { color: '#FF6600', size: 4, duration: 250, particleCount: 40 },
    projectile: { model: 'cruise_missile', trail: 'smoke_fire', trailColor: '#FF6600', trailWidth: 3, speed: 250, glow: true },
    impact: { effect: 'explosion_massive', size: 10, duration: 1000, shake: 1.0, particleCount: 150, color: '#FF6600' },
    fireSound: 'cruise_launch.mp3',
    impactSound: 'explosion_massive.mp3'
  },
  
  fighter_interceptor: {
    id: 'fx_fighter_interceptor',
    name: 'Interceptor',
    weaponType: 'fighter',
    intensity: 'low',
    muzzleFlash: { color: '#FFFF00', size: 0.5, duration: 50, particleCount: 3 },
    projectile: { model: 'bolt', trail: 'short', trailColor: '#FFFF00', trailWidth: 0.2, speed: 1500, glow: false },
    impact: { effect: 'spark_small', size: 1, duration: 100, shake: 0.05, particleCount: 5, color: '#FFFF00' },
    fireSound: 'fighter_fire.mp3',
    impactSound: 'impact_small.mp3'
  },
  
  fighter_bomber: {
    id: 'fx_fighter_bomber',
    name: 'Bombardero',
    weaponType: 'fighter',
    intensity: 'high',
    muzzleFlash: { color: '#FF8800', size: 1.5, duration: 100, particleCount: 8 },
    projectile: { model: 'bomb', trail: 'none', trailColor: '', trailWidth: 0, speed: 200, glow: false },
    impact: { effect: 'bomb_explosion', size: 5, duration: 500, shake: 0.4, particleCount: 50, color: '#FF8800' },
    fireSound: 'bomber_drop.mp3',
    impactSound: 'explosion_bomb.mp3'
  }
};

// ============================================
// EFECTOS DE EXPLOSIÓN
// ============================================
export interface ExplosionFX {
  id: string;
  name: string;
  size: 'small' | 'medium' | 'large' | 'massive' | 'ship_destroyed';
  duration: number;
  particleCount: number;
  shockwave: boolean;
  debris: boolean;
  colors: string[];
  stages: {
    flash: { duration: number; intensity: number };
    fireball: { duration: number; expansion: number };
    smoke: { duration: number; color: string };
  };
  sound: string;
  cameraShake: number;
  screenFlash: boolean;
}

export const EXPLOSION_FX: Record<string, ExplosionFX> = {
  explosion_small: {
    id: 'explosion_small',
    name: 'Explosión Pequeña',
    size: 'small',
    duration: 300,
    particleCount: 20,
    shockwave: false,
    debris: false,
    colors: ['#FF6600', '#FFAA00', '#888888'],
    stages: {
      flash: { duration: 50, intensity: 0.5 },
      fireball: { duration: 150, expansion: 1.5 },
      smoke: { duration: 100, color: '#444444' }
    },
    sound: 'explosion_small.mp3',
    cameraShake: 0.2,
    screenFlash: false
  },
  
  explosion_medium: {
    id: 'explosion_medium',
    name: 'Explosión Mediana',
    size: 'medium',
    duration: 500,
    particleCount: 50,
    shockwave: true,
    debris: true,
    colors: ['#FF4400', '#FF8800', '#FFAA00'],
    stages: {
      flash: { duration: 100, intensity: 0.7 },
      fireball: { duration: 250, expansion: 2.5 },
      smoke: { duration: 150, color: '#555555' }
    },
    sound: 'explosion_medium.mp3',
    cameraShake: 0.4,
    screenFlash: true
  },
  
  explosion_large: {
    id: 'explosion_large',
    name: 'Explosión Grande',
    size: 'large',
    duration: 800,
    particleCount: 100,
    shockwave: true,
    debris: true,
    colors: ['#FF0000', '#FF4400', '#FF8800', '#FFFFFF'],
    stages: {
      flash: { duration: 150, intensity: 1.0 },
      fireball: { duration: 400, expansion: 4.0 },
      smoke: { duration: 250, color: '#666666' }
    },
    sound: 'explosion_large.mp3',
    cameraShake: 0.7,
    screenFlash: true
  },
  
  explosion_massive: {
    id: 'explosion_massive',
    name: 'Explosión Masiva',
    size: 'massive',
    duration: 1200,
    particleCount: 200,
    shockwave: true,
    debris: true,
    colors: ['#FF0000', '#FF2200', '#FF6600', '#FFAA00', '#FFFFFF'],
    stages: {
      flash: { duration: 200, intensity: 1.5 },
      fireball: { duration: 600, expansion: 6.0 },
      smoke: { duration: 400, color: '#777777' }
    },
    sound: 'explosion_massive.mp3',
    cameraShake: 1.0,
    screenFlash: true
  },
  
  ship_destroyed: {
    id: 'ship_destroyed',
    name: 'Nave Destruida',
    size: 'ship_destroyed',
    duration: 1500,
    particleCount: 300,
    shockwave: true,
    debris: true,
    colors: ['#FF0000', '#FF4400', '#FF6600', '#888888', '#FFFFFF'],
    stages: {
      flash: { duration: 250, intensity: 2.0 },
      fireball: { duration: 700, expansion: 5.0 },
      smoke: { duration: 550, color: '#333333' }
    },
    sound: 'ship_explosion.mp3',
    cameraShake: 1.2,
    screenFlash: true
  }
};

// ============================================
// EFECTOS DE ESCUDO
// ============================================
export interface ShieldFX {
  id: string;
  name: string;
  type: 'hit' | 'absorb' | 'collapse' | 'regen' | 'bubble';
  color: string;
  opacity: number;
  duration: number;
  ripple: boolean;
  distortion: boolean;
  particleCount: number;
  sound: string;
}

export const SHIELD_FX: Record<string, ShieldFX> = {
  shield_hit: {
    id: 'shield_hit',
    name: 'Impacto en Escudo',
    type: 'hit',
    color: '#00FFFF',
    opacity: 0.6,
    duration: 300,
    ripple: true,
    distortion: true,
    particleCount: 10,
    sound: 'shield_hit.mp3'
  },
  
  shield_absorb: {
    id: 'shield_absorb',
    name: 'Absorción',
    type: 'absorb',
    color: '#00FF00',
    opacity: 0.4,
    duration: 500,
    ripple: false,
    distortion: true,
    particleCount: 20,
    sound: 'shield_absorb.mp3'
  },
  
  shield_collapse: {
    id: 'shield_collapse',
    name: 'Colapso de Escudo',
    type: 'collapse',
    color: '#FF0000',
    opacity: 0.8,
    duration: 800,
    ripple: true,
    distortion: true,
    particleCount: 50,
    sound: 'shield_collapse.mp3'
  },
  
  shield_regen: {
    id: 'shield_regen',
    name: 'Regeneración',
    type: 'regen',
    color: '#00AAFF',
    opacity: 0.3,
    duration: 1000,
    ripple: false,
    distortion: false,
    particleCount: 30,
    sound: 'shield_regen.mp3'
  },
  
  shield_bubble: {
    id: 'shield_bubble',
    name: 'Burbuja de Escudo',
    type: 'bubble',
    color: '#0088FF',
    opacity: 0.2,
    duration: 2000,
    ripple: true,
    distortion: false,
    particleCount: 0,
    sound: 'shield_up.mp3'
  }
};

// ============================================
// EFECTOS DE HABILIDADES (COMANDANTES)
// ============================================
export interface AbilityFX {
  id: string;
  name: string;
  abilityType: 'buff' | 'debuff' | 'damage' | 'heal' | 'control' | 'special';
  
  cast: {
    animation: string;
    duration: number;
    sound: string;
    particleEffect: string;
  };
  
  effect: {
    animation: string;
    loop: boolean;
    duration: number;
    sound?: string;
    particleEffect: string;
  };
  
  impact?: {
    animation: string;
    sound: string;
    particleEffect: string;
    screenShake?: number;
  };
  
  color: string;
  icon: string;
}

export const ABILITY_FX: Record<string, AbilityFX> = {
  ability_damage_boost: {
    id: 'ability_damage_boost',
    name: 'Daño Aumentado',
    abilityType: 'buff',
    cast: { animation: 'power_up', duration: 500, sound: 'buff_cast.mp3', particleEffect: 'red_spiral' },
    effect: { animation: 'aura_red', loop: true, duration: 10000, particleEffect: 'red_aura' },
    color: '#FF0000',
    icon: '⚔️'
  },
  
  ability_shield_boost: {
    id: 'ability_shield_boost',
    name: 'Escudo Reforzado',
    abilityType: 'buff',
    cast: { animation: 'shield_up', duration: 600, sound: 'shield_boost.mp3', particleEffect: 'blue_burst' },
    effect: { animation: 'shield_glow', loop: true, duration: 15000, particleEffect: 'blue_shimmer' },
    color: '#0088FF',
    icon: '🛡️'
  },
  
  ability_heal: {
    id: 'ability_heal',
    name: 'Sanación',
    abilityType: 'heal',
    cast: { animation: 'heal_cast', duration: 800, sound: 'heal_cast.mp3', particleEffect: 'green_rays' },
    effect: { animation: 'heal_beam', loop: false, duration: 2000, sound: 'heal_effect.mp3', particleEffect: 'green_sparkles' },
    color: '#00FF00',
    icon: '💚'
  },
  
  ability_stun: {
    id: 'ability_stun',
    name: 'Aturdimiento',
    abilityType: 'control',
    cast: { animation: 'stun_cast', duration: 400, sound: 'stun_cast.mp3', particleEffect: 'yellow_ring' },
    effect: { animation: 'stun_effect', loop: false, duration: 3000, sound: 'stun_impact.mp3', particleEffect: 'yellow_stars' },
    color: '#FFFF00',
    icon: '⚡'
  },
  
  ability_black_hole: {
    id: 'ability_black_hole',
    name: 'Agujero Negro',
    abilityType: 'special',
    cast: { animation: 'black_hole_form', duration: 2000, sound: 'black_hole_cast.mp3', particleEffect: 'purple_vortex' },
    effect: { animation: 'black_hole_loop', loop: true, duration: 8000, sound: 'black_hole_loop.mp3', particleEffect: 'dark_matter' },
    color: '#8800FF',
    icon: '🌑'
  },
  
  ability_rebirth: {
    id: 'ability_rebirth',
    name: 'Renacimiento',
    abilityType: 'special',
    cast: { animation: 'phoenix_rise', duration: 3000, sound: 'rebirth.mp3', particleEffect: 'fire_phoenix' },
    effect: { animation: 'phoenix_aura', loop: true, duration: 5000, particleEffect: 'flame_trail' },
    color: '#FF8800',
    icon: '🔥'
  }
};

// ============================================
// SONIDOS AMBIENTALES Y MÚSICA
// ============================================
export interface AmbientSound {
  id: string;
  name: string;
  file: string;
  type: 'ambient' | 'music' | 'ui' | 'combat';
  loop: boolean;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  conditions: string[];
}

export const AMBIENT_SOUNDS: AmbientSound[] = [
  { id: 'ambient_space', name: 'Espacio', file: 'space_ambient.mp3', type: 'ambient', loop: true, volume: 0.3, fadeIn: 2000, fadeOut: 2000, conditions: ['in_space'] },
  { id: 'ambient_planet', name: 'Planeta', file: 'planet_ambient.mp3', type: 'ambient', loop: true, volume: 0.4, fadeIn: 1000, fadeOut: 1000, conditions: ['near_planet'] },
  { id: 'ambient_station', name: 'Estación', file: 'station_ambient.mp3', type: 'ambient', loop: true, volume: 0.5, fadeIn: 1500, fadeOut: 1500, conditions: ['near_station'] },
  
  { id: 'music_battle', name: 'Batalla', file: 'battle_music.mp3', type: 'music', loop: true, volume: 0.6, fadeIn: 1000, fadeOut: 3000, conditions: ['in_combat'] },
  { id: 'music_victory', name: 'Victoria', file: 'victory_music.mp3', type: 'music', loop: false, volume: 0.7, fadeIn: 0, fadeOut: 5000, conditions: ['combat_won'] },
  { id: 'music_defeat', name: 'Derrota', file: 'defeat_music.mp3', type: 'music', loop: false, volume: 0.6, fadeIn: 0, fadeOut: 3000, conditions: ['combat_lost'] },
  { id: 'music_menu', name: 'Menú', file: 'menu_music.mp3', type: 'music', loop: true, volume: 0.4, fadeIn: 2000, fadeOut: 2000, conditions: ['in_menu'] },
  
  { id: 'ui_click', name: 'Click', file: 'ui_click.mp3', type: 'ui', loop: false, volume: 0.5, fadeIn: 0, fadeOut: 0, conditions: ['ui_interaction'] },
  { id: 'ui_hover', name: 'Hover', file: 'ui_hover.mp3', type: 'ui', loop: false, volume: 0.2, fadeIn: 0, fadeOut: 0, conditions: ['ui_hover'] },
  { id: 'ui_open', name: 'Abrir Panel', file: 'ui_open.mp3', type: 'ui', loop: false, volume: 0.4, fadeIn: 0, fadeOut: 0, conditions: ['open_panel'] },
  { id: 'ui_close', name: 'Cerrar Panel', file: 'ui_close.mp3', type: 'ui', loop: false, volume: 0.4, fadeIn: 0, fadeOut: 0, conditions: ['close_panel'] },
  { id: 'ui_alert', name: 'Alerta', file: 'ui_alert.mp3', type: 'ui', loop: false, volume: 0.8, fadeIn: 0, fadeOut: 0, conditions: ['alert'] },
  { id: 'ui_levelup', name: 'Nivel Up', file: 'level_up.mp3', type: 'ui', loop: false, volume: 0.7, fadeIn: 0, fadeOut: 0, conditions: ['level_up'] },
  { id: 'ui_reward', name: 'Recompensa', file: 'reward.mp3', type: 'ui', loop: false, volume: 0.6, fadeIn: 0, fadeOut: 0, conditions: ['reward_received'] }
];

// ============================================
// SISTEMA DE AUDIO
// ============================================
export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  ambientVolume: number;
  uiVolume: number;
  voiceVolume: number;
  
  // Opciones
  muteOnFocusLost: boolean;
  dynamicRange: 'narrow' | 'normal' | 'wide';
  audioQuality: 'low' | 'medium' | 'high';
  outputDevice: string;
  spatialAudio: boolean;
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  masterVolume: 1.0,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  ambientVolume: 0.4,
  uiVolume: 0.6,
  voiceVolume: 1.0,
  muteOnFocusLost: true,
  dynamicRange: 'normal',
  audioQuality: 'high',
  outputDevice: 'default',
  spatialAudio: true
};

// ============================================
// HELPERS
// ============================================
export function getWeaponFX(weaponId: string): WeaponFX | undefined {
  return WEAPON_FX[weaponId];
}

export function getExplosionFX(size: ExplosionFX['size']): ExplosionFX | undefined {
  return Object.values(EXPLOSION_FX).find(e => e.size === size);
}

export function getShieldFX(type: ShieldFX['type']): ShieldFX | undefined {
  return Object.values(SHIELD_FX).find(s => s.type === type);
}

export function getAbilityFX(abilityId: string): AbilityFX | undefined {
  return ABILITY_FX[abilityId];
}

export function getAmbientSounds(conditions: string[]): AmbientSound[] {
  return AMBIENT_SOUNDS.filter(s => conditions.some(c => s.conditions.includes(c)));
}

export const CombatFXSounds = {
  WEAPON_FX,
  EXPLOSION_FX,
  SHIELD_FX,
  ABILITY_FX,
  AMBIENT_SOUNDS,
  DEFAULT_AUDIO_SETTINGS,
  getWeaponFX,
  getExplosionFX,
  getShieldFX,
  getAbilityFX,
  getAmbientSounds
};
