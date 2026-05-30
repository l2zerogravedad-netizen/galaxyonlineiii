'use client';

import { useCallback, useEffect, useState } from 'react';
import { frigates } from '@/data/game/ships-complete';
import type { ShipHull } from '@/data/game/ships-complete';
import { formatGo2Countdown, useDestockShared } from './useDestockShared';

const STORAGE_KEY = 'destock-go2-shipyard-v1';

interface ShipJob {
  hullId: string;
  name: string;
  endsAt: number;
}

interface ShipyardPersist {
  inventory: Record<string, number>;
  queue: ShipJob[];
}

function load(): ShipyardPersist {
  if (typeof window === 'undefined') return { inventory: {}, queue: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { inventory: {}, queue: [] };
    return JSON.parse(raw) as ShipyardPersist;
  } catch {
    return { inventory: {}, queue: [] };
  }
}

/**
 * Shipyard data hook.
 * Resources are real (via useDestockShared → /api/empire when logged in), so building
 * a ship actually spends real metal/plasma/credits. The ship catalog (GO2 hulls) and the
 * build queue are tracked locally: the deployed backend has no blueprint-list endpoint and
 * its /api/shipyard/build needs DB blueprint IDs that aren't exposed, so a full server-side
 * shipyard is a backend gap, not a frontend one. Documented in DESTOCK_BACKEND_CONEXION.md.
 */
export function useDestockShipyard() {
  const { spend, showToast, refresh: refreshResources } = useDestockShared();
  const [persist, setPersist] = useState<ShipyardPersist>(load);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
  }, [persist]);

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setTick(now);
      setPersist((prev) => {
        const done = prev.queue.filter((q) => q.endsAt <= now);
        if (!done.length) return prev;
        const inventory = { ...prev.inventory };
        for (const job of done) inventory[job.hullId] = (inventory[job.hullId] ?? 0) + 1;
        refreshResources();
        showToast(`${done.length} nave(s) completada(s)`);
        return { inventory, queue: prev.queue.filter((q) => q.endsAt > now) };
      });
    }, 400);
    return () => clearInterval(id);
  }, [showToast, refreshResources]);

  const blueprints: ShipHull[] = frigates.slice(0, 6);

  const startBuild = useCallback(
    (hull: ShipHull) => {
      // Logged in → resources are server-owned and there's no backend ship-build path
      // with exposed blueprint IDs, so a local spend would snap back on the next
      // /api/empire poll. Be honest instead of faking it; guests use the sandbox.
      let isGuest = true;
      try {
        isGuest = !localStorage.getItem('token');
      } catch {
        /* treat as guest */
      }
      if (!isGuest) {
        showToast(`${hull.name}: astillero en servidor próximamente`);
        return;
      }
      if (persist.queue.length >= 1) {
        showToast('Cola de astillero ocupada');
        return;
      }
      const cost = {
        metal: hull.buildCost.metal ?? 0,
        plasma: hull.buildCost.plasma ?? 0,
        credits: hull.buildCost.credits ?? 0,
      };
      if (!spend(cost)) return;
      const endsAt = Date.now() + hull.buildTimeMinutes * 60 * 1000;
      setPersist((prev) => ({
        ...prev,
        queue: [...prev.queue, { hullId: hull.id, name: hull.name, endsAt }],
      }));
      showToast(`${hull.name} en cola`);
    },
    [persist.queue.length, spend, showToast]
  );

  const activeJob = persist.queue[0];
  const timeLeft = activeJob ? activeJob.endsAt - Date.now() : 0;

  return {
    blueprints,
    inventory: persist.inventory,
    activeJob,
    timeLabel: activeJob ? formatGo2Countdown(timeLeft) : null,
    tick,
    startBuild,
  };
}
