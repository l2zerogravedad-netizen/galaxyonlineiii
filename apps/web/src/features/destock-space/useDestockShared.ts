'use client';

import { useCallback, useEffect, useState } from 'react';
import type { PlayerData, ResourcesData } from '@/components/game/types';
import { DEFAULT_PLAYER, DEFAULT_RESOURCES } from '@/components/game/mockData';
import { loadDashboardData, mapDashboardToUi } from '@/lib/game/gameClient';

export const DESTOCK_STORAGE_KEY = 'destock-go2-identical-v1';

interface PersistSlice {
  resources: ResourcesData;
}

function hasToken(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return !!localStorage.getItem('token');
  } catch {
    return false;
  }
}

function readResources(): ResourcesData {
  if (typeof window === 'undefined') return DEFAULT_RESOURCES;
  try {
    const raw = localStorage.getItem(DESTOCK_STORAGE_KEY);
    if (!raw) return DEFAULT_RESOURCES;
    const p = JSON.parse(raw) as PersistSlice;
    return p.resources ?? DEFAULT_RESOURCES;
  } catch {
    return DEFAULT_RESOURCES;
  }
}

function writeResources(resources: ResourcesData): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(DESTOCK_STORAGE_KEY);
    const base = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    localStorage.setItem(
      DESTOCK_STORAGE_KEY,
      JSON.stringify({ ...base, resources })
    );
  } catch {
    /* ignore */
  }
}

/**
 * Shared resource/player HUD for every DESTOCK screen (shipyard, research, combat,
 * marketplace, missions, shell). Logged in → pulls REAL resources + player from
 * /api/empire (via the verified gameClient) and polls; guest → local mock in
 * localStorage. `spend()` updates optimistically; the next backend poll reconciles.
 */
export function useDestockShared() {
  const [resources, setResourcesState] = useState<ResourcesData>(DEFAULT_RESOURCES);
  const [player, setPlayer] = useState<PlayerData>(DEFAULT_PLAYER);
  const [toast, setToast] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (hasToken()) {
      // real backend: source of truth
      void (async () => {
        try {
          const ui = mapDashboardToUi(await loadDashboardData());
          setResourcesState(ui.resources);
          setPlayer(ui.player);
        } catch {
          /* network hiccup → keep last known values */
        }
      })();
      return;
    }
    // guest: local sandbox
    setResourcesState(readResources());
  }, []);

  useEffect(() => {
    refresh();
    // poll faster locally, slower against the network
    const id = setInterval(refresh, hasToken() ? 5000 : 800);
    return () => clearInterval(id);
  }, [refresh]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const setResources = useCallback(
    (next: ResourcesData | ((prev: ResourcesData) => ResourcesData)) => {
      setResourcesState((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
        // Only persist to localStorage for guests; logged-in state is server-owned
        // and would otherwise be clobbered on the next /api/empire poll anyway.
        if (!hasToken()) writeResources(resolved);
        return resolved;
      });
    },
    []
  );

  const spend = useCallback(
    (cost: { metal: number; plasma: number; credits: number }) => {
      if (
        resources.metal < cost.metal ||
        resources.plasma < cost.plasma ||
        resources.credits < cost.credits
      ) {
        showToast('Recursos insuficientes');
        return false;
      }
      setResources({
        ...resources,
        metal: resources.metal - cost.metal,
        plasma: resources.plasma - cost.plasma,
        credits: resources.credits - cost.credits,
      });
      return true;
    },
    [resources, setResources, showToast]
  );

  return {
    player,
    resources,
    setResources,
    spend,
    toast,
    showToast,
    refresh,
  };
}

export function formatGo2Countdown(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, '0')).join(':');
}
