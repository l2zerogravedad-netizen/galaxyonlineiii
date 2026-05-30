'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatGo2Countdown, useDestockShared } from './useDestockShared';

const STORAGE_KEY = 'destock-go2-research-v1';

export interface DestockTech {
  id: string;
  name: string;
  category: string;
  level: number;
  maxLevel: number;
  metal: number;
  plasma: number;
  timeSec: number;
}

const TECH_TREE: DestockTech[] = [
  { id: 'prod_metal', name: 'Extracción de metal', category: 'PRODUCTION', level: 0, maxLevel: 10, metal: 500, plasma: 200, timeSec: 60 },
  { id: 'prod_plasma', name: 'Refinado de cristal', category: 'PRODUCTION', level: 0, maxLevel: 10, metal: 400, plasma: 300, timeSec: 90 },
  { id: 'build_speed', name: 'Construcción rápida', category: 'CONSTRUCTION', level: 0, maxLevel: 5, metal: 800, plasma: 400, timeSec: 120 },
  { id: 'ship_defense', name: 'Defensa naval', category: 'MILITARY', level: 0, maxLevel: 10, metal: 1000, plasma: 600, timeSec: 180 },
  { id: 'warp_drive', name: 'Motor de salto', category: 'PROPULSION', level: 0, maxLevel: 8, metal: 1200, plasma: 900, timeSec: 240 },
];

const CAT_LABEL: Record<string, string> = {
  PRODUCTION: 'Producción',
  CONSTRUCTION: 'Construcción',
  MILITARY: 'Militar',
  PROPULSION: 'Propulsión',
};

interface ResearchPersist {
  levels: Record<string, number>;
  active: { techId: string; endsAt: number } | null;
}

function load(): ResearchPersist {
  if (typeof window === 'undefined') return { levels: {}, active: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { levels: {}, active: null };
    return JSON.parse(raw) as ResearchPersist;
  } catch {
    return { levels: {}, active: null };
  }
}

/**
 * Research hook. Resources are real (useDestockShared → /api/empire), so starting a
 * research spends real metal/plasma. Levels/timer are tracked locally because the
 * deployed backend has no /api/research endpoint yet (backend gap, see
 * DESTOCK_BACKEND_CONEXION.md). When that route exists this becomes a thin client.
 */
export function useDestockResearch() {
  const { spend, showToast } = useDestockShared();
  const [persist, setPersist] = useState<ResearchPersist>(load);
  const [, setTick] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
  }, [persist]);

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setTick(now);
      setPersist((prev) => {
        if (!prev.active || prev.active.endsAt > now) return prev;
        const levels = { ...prev.levels };
        levels[prev.active.techId] = (levels[prev.active.techId] ?? 0) + 1;
        showToast('Investigación completada');
        return { levels, active: null };
      });
    }, 400);
    return () => clearInterval(id);
  }, [showToast]);

  const techs = TECH_TREE.map((t) => ({
    ...t,
    level: persist.levels[t.id] ?? 0,
  }));

  const startResearch = useCallback(
    (tech: DestockTech) => {
      // Logged in → resources are server-owned and there's no /api/research endpoint
      // yet, so a local spend would snap back on the next /api/empire poll. Be honest
      // instead of faking it; guests use the local sandbox.
      let isGuest = true;
      try {
        isGuest = !localStorage.getItem('token');
      } catch {
        /* treat as guest */
      }
      if (!isGuest) {
        showToast(`${tech.name}: investigación en servidor próximamente`);
        return;
      }
      if (persist.active) {
        showToast('Ya hay investigación en curso');
        return;
      }
      if (tech.level >= tech.maxLevel) {
        showToast('Nivel máximo');
        return;
      }
      if (!spend({ metal: tech.metal, plasma: tech.plasma, credits: 0 })) return;
      setPersist((prev) => ({
        ...prev,
        active: { techId: tech.id, endsAt: Date.now() + tech.timeSec * 1000 },
      }));
      showToast(`Investigando: ${tech.name}`);
    },
    [persist.active, spend, showToast]
  );

  const activeTech = persist.active
    ? techs.find((t) => t.id === persist.active!.techId)
    : null;
  const timeLabel =
    persist.active && activeTech
      ? formatGo2Countdown(persist.active.endsAt - Date.now())
      : null;

  return { techs, categories: CAT_LABEL, activeTech, timeLabel, startResearch };
}
