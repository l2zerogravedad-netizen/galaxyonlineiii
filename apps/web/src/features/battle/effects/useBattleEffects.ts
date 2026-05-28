/**
 * ====================================================================
 * useBattleEffects — React hook for visual battle effects
 * Controls the ParticleSystem and triggers visual feedback.
 * ====================================================================
 */

import { useCallback, useRef, useState } from 'react';
import type { BattleEvent } from '../engine/types';

export type BattleAction =
  | { type: 'SHAKE'; intensity: number; duration: number }
  | { type: 'FLASH'; color: string; duration: number }
  | { type: 'PROJECTILE'; fromX: number; fromY: number; toX: number; toY: number; weaponType: string }
  | { type: 'EXPLOSION'; x: number; y: number; size: number }
  | { type: 'SHIELD_HIT'; x: number; y: number };

export interface BattleEffectsAPI {
  /** Procesa un evento del engine y lanza efectos visuales */
  processEvent: (event: BattleEvent) => void;
  /** Activa el efecto de shake de pantalla */
  triggerShake: (intensity: number) => void;
  /** Activa efecto de flash */
  triggerFlash: (color: string) => void;
  /** Activa una explosion en coordenadas */
  triggerExplosion: (x: number, y: number, size?: number) => void;
  /** Si hay algun efecto activo */
  hasActiveEffects: boolean;
  /** Acciones pendientes de renderizar (consumidas por el sistema de particulas) */
  pendingActions: BattleAction[];
  /** Limpia acciones procesadas */
  clearActions: () => void;
}

export function useBattleEffects(): BattleEffectsAPI {
  const [pendingActions, setPendingActions] = useState<BattleAction[]>([]);
  const [hasActiveEffects, setHasActiveEffects] = useState(false);

  const addAction = useCallback((action: BattleAction) => {
    setPendingActions((prev) => [...prev, action]);
    setHasActiveEffects(true);
  }, []);

  const processEvent = useCallback(
    (event: BattleEvent) => {
      switch (event.type) {
        case 'WEAPON_FIRE':
          addAction({
            type: 'PROJECTILE',
            fromX: Math.random() * 30 + 10,
            fromY: Math.random() * 40 + 20,
            toX: Math.random() * 30 + 55,
            toY: Math.random() * 40 + 20,
            weaponType: event.weaponType,
          });
          break;

        case 'PROJECTILE_HIT':
        case 'HULL_DAMAGE':
        case 'CRITICAL_HIT':
          addAction({
            type: 'EXPLOSION',
            x: Math.random() * 40 + 30,
            y: Math.random() * 30 + 30,
            size: event.type === 'CRITICAL_HIT' ? 3 : 1.5,
          });
          if (event.type === 'CRITICAL_HIT') {
            addAction({ type: 'SHAKE', intensity: 8, duration: 300 });
            addAction({ type: 'FLASH', color: '#ff4444', duration: 150 });
          }
          break;

        case 'SHIELD_HIT':
        case 'SHIELD_DEPLETED':
          addAction({
            type: 'SHIELD_HIT',
            x: Math.random() * 40 + 30,
            y: Math.random() * 30 + 30,
          });
          break;

        case 'STACK_DESTROYED':
          addAction({ type: 'SHAKE', intensity: 12, duration: 400 });
          addAction({ type: 'FLASH', color: '#ff6600', duration: 200 });
          addAction({ type: 'EXPLOSION', x: 50, y: 50, size: 4 });
          break;

        case 'BATTLE_END':
          addAction({ type: 'FLASH', color: '#ffffff', duration: 500 });
          break;

        default:
          break;
      }
    },
    [addAction]
  );

  const triggerShake = useCallback(
    (intensity: number) => {
      addAction({ type: 'SHAKE', intensity, duration: 300 });
    },
    [addAction]
  );

  const triggerFlash = useCallback(
    (color: string) => {
      addAction({ type: 'FLASH', color, duration: 200 });
    },
    [addAction]
  );

  const triggerExplosion = useCallback(
    (x: number, y: number, size: number = 2) => {
      addAction({ type: 'EXPLOSION', x, y, size });
    },
    [addAction]
  );

  const clearActions = useCallback(() => {
    setPendingActions([]);
    setHasActiveEffects(false);
  }, []);

  return {
    processEvent,
    triggerShake,
    triggerFlash,
    triggerExplosion,
    hasActiveEffects,
    pendingActions,
    clearActions,
  };
}
