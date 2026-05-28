// ============================================================
//  Battle Effects — Visual Effects System for GO2 Battle Viewer
//  Barrel export: ParticleSystem + useBattleEffects + types
// ============================================================

// Core particle system
export { ParticleSystem } from "./ParticleSystem";

// React hook
export { useBattleEffects } from "./useBattleEffects";

// ---- Types exported from ParticleSystem ----
export type {
  Particle,
  Projectile,
  Shockwave,
  ShieldRipple,
  FloatingText,
  WeaponType,
  DamageType,
  BattleEvent,
} from "./ParticleSystem";

// ---- Types exported from useBattleEffects ----
export type {
  BattleEffectsAPI,
  BattleAction,
} from "./useBattleEffects";
