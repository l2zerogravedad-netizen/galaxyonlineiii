'use client';

/**
 * Estado local con la misma API que useGameDashboard + UI idéntica al video GO II.
 * Catálogo y menús: mockData / WINDSURF (nombres y pestañas del juego original).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  GO2_CONSTRUCTION_QUEUE_SIZE,
  getBuildingLevelCost,
  type Go2ConstructionQueueItemDto,
} from '@galaxy/shared';
import { PLANET_BUILDING_SLOTS } from '@galaxy/shared';
import { useGameDashboard, type GameDashboardState } from '@/lib/game/useGameDashboard';
import type { BuildingDefinition, GridSlot, ResourcesData } from '@/components/game/types';
import { BUILDING_CATALOG, DEFAULT_PLAYER, DEFAULT_RESOURCES } from '@/components/game/mockData';
import { getMockDashboardState } from '@/lib/game/mapGameData';

const STORAGE_KEY = 'destock-go2-identical-v1';

const UNLOCK: Record<string, { buildingId: string; level: number; label: string }> = {
  control_center: { buildingId: 'energy_generator', level: 1, label: 'Generador de Energía' },
  research_lab: { buildingId: 'control_center', level: 1, label: 'Centro de Control' },
  trading_center: { buildingId: 'control_center', level: 1, label: 'Centro de Control' },
  radar: { buildingId: 'control_center', level: 1, label: 'Centro de Control' },
  shipyard: { buildingId: 'control_center', level: 1, label: 'Centro de Control' },
  hangar: { buildingId: 'shipyard', level: 1, label: 'Astillero' },
  defense_turret: { buildingId: 'research_lab', level: 1, label: 'Laboratorio' },
};

interface SlotPlacement {
  instanceId: string;
  slotIndex: number;
  catalogId: string;
  type: string;
  level: number;
  status: 'active' | 'upgrading';
  constructionEndsAt: string | null;
}

interface QueueJob {
  id: string;
  catalogId: string;
  type: string;
  buildingName: string;
  slotIndex: number;
  targetLevel: number;
  endsAt: number;
  mode: 'build' | 'upgrade';
}

interface Persist {
  resources: ResourcesData;
  placements: SlotPlacement[];
  queue: QueueJob[];
}

function initialPlacements(): SlotPlacement[] {
  return BUILDING_CATALOG.filter((b) => b.slotIndex != null && b.level > 0).map((b) => ({
    instanceId: `init-${b.id}`,
    slotIndex: b.slotIndex!,
    catalogId: b.id,
    type: b.type,
    level: b.level,
    status: 'active' as const,
    constructionEndsAt: null,
  }));
}

function loadPersist(): Persist {
  const m = getMockDashboardState();
  const base = { resources: m.resources, placements: initialPlacements(), queue: [] as QueueJob[] };
  if (typeof window === 'undefined') return base;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    return JSON.parse(raw) as Persist;
  } catch {
    return base;
  }
}

function emptyGrid(): GridSlot[] {
  return Array.from({ length: PLANET_BUILDING_SLOTS }, (_, slotIndex) => ({
    slotIndex,
    buildingId: null,
  }));
}

function menuTemplates(): BuildingDefinition[] {
  return BUILDING_CATALOG.map((t) => ({
    ...t,
    level: t.level > 0 ? t.level : 0,
    status: t.status,
    upgradeCost: (() => {
      const c = getBuildingLevelCost(t.type, 1, true);
      return { metal: c.metal, plasma: c.plasma, credits: c.credits };
    })(),
  }));
}

function countType(type: string, placements: SlotPlacement[], queue: QueueJob[]) {
  return (
    placements.filter((p) => p.type === type).length +
    queue.filter((q) => q.type === type).length
  );
}

function isUnlocked(type: string, placements: SlotPlacement[]): { ok: true } | { ok: false; reason: string } {
  const rule = UNLOCK[type];
  if (!rule) return { ok: true };
  const found = placements.find((p) => p.type === rule.buildingId && p.level >= rule.level && p.status === 'active');
  if (found) return { ok: true };
  return { ok: false, reason: `Requiere ${rule.label}` };
}

/**
 * Public hook for the DESTOCK planet screen.
 * Logged in (token present) → delegates to the REAL backend dashboard hook
 * (verified E2E: real resources, persistent /api/planets/:id/build, live queue).
 * Guest (no token) → keeps the local mock so the screen still renders.
 * Both inner hooks are always called (Rules of Hooks); we only choose which to return.
 */
export function useDestockGo2Dashboard(): GameDashboardState {
  const [hasToken, setHasToken] = useState(false);
  useEffect(() => {
    try {
      setHasToken(!!localStorage.getItem('token'));
    } catch {
      /* ignore */
    }
  }, []);
  const real = useGameDashboard(hasToken);
  const mock = useDestockGo2DashboardMock();
  return hasToken ? real : mock;
}

function useDestockGo2DashboardMock(): GameDashboardState {
  const [persist, setPersist] = useState<Persist>(loadPersist);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        let placements = [...prev.placements];
        for (const job of done) {
          if (job.mode === 'upgrade') {
            placements = placements.map((p) =>
              p.slotIndex === job.slotIndex ? { ...p, level: job.targetLevel, status: 'active', constructionEndsAt: null } : p
            );
          } else {
            const idx = placements.findIndex((p) => p.instanceId === `pending-${job.id}`);
            if (idx >= 0) {
              placements[idx] = { ...placements[idx], status: 'active', constructionEndsAt: null };
            }
          }
        }
        return { ...prev, placements, queue: prev.queue.filter((q) => q.endsAt > now) };
      });
    }, 400);
    return () => clearInterval(id);
  }, []);

  const showToast = useCallback((message: string) => {
    setActionToast(message);
    window.setTimeout(() => setActionToast(null), 2800);
  }, []);

  const grid = useMemo(() => {
    const g = emptyGrid();
    for (const p of persist.placements) {
      if (p.status === 'active' || p.status === 'upgrading') {
        g[p.slotIndex] = { slotIndex: p.slotIndex, buildingId: p.catalogId };
      }
    }
    return g;
  }, [persist.placements]);

  const buildings = useMemo((): BuildingDefinition[] => {
    const active = persist.placements.filter((p) => p.status === 'active');
    return menuTemplates().map((t) => {
      const unlock = isUnlocked(t.type, active);
      const built = countType(t.type, persist.placements, persist.queue);
      const max = t.maxPerPlanet ?? 99;
      return {
        ...t,
        status: !unlock.ok ? ('locked' as const) : ('empty' as const),
        unlockRequirement: !unlock.ok ? unlock.reason : undefined,
        level: built > 0 ? 1 : 0,
      };
    });
  }, [persist, tick]);

  const constructionQueue = useMemo((): Go2ConstructionQueueItemDto[] => {
    const now = Date.now();
    return persist.queue.map((q) => {
      const cost = getBuildingLevelCost(q.type, q.targetLevel, true);
      const durationMs = cost.time * 1000;
      const startedAt = q.endsAt - durationMs;
      return {
        id: q.id,
        buildingType: q.type,
        buildingName: q.buildingName,
        level: q.targetLevel - 1,
        targetLevel: q.targetLevel,
        slotIndex: q.slotIndex,
        status: q.mode === 'upgrade' ? 'UPGRADING' : 'CONSTRUCTING',
        endsAt: new Date(q.endsAt).toISOString(),
        progressPct: Math.min(100, Math.max(0, ((now - startedAt) / durationMs) * 100)),
      };
    });
  }, [persist.queue, tick]);

  const enqueue = useCallback(
    (slotIndex: number, catalogId: string, type: string, targetLevel: number, mode: 'build' | 'upgrade') => {
      const template = BUILDING_CATALOG.find((b) => b.id === catalogId);
      if (!template) return;
      const active = persist.placements.filter((p) => p.status === 'active');
      const unlock = isUnlocked(type, active);
      if (!unlock.ok) {
        showToast(unlock.reason);
        return;
      }
      if (mode === 'build' && persist.placements.some((p) => p.slotIndex === slotIndex)) {
        showToast('Celda ocupada');
        return;
      }
      if (countType(type, persist.placements, persist.queue) >= (template.maxPerPlanet ?? 99)) {
        showToast('Límite en planeta');
        return;
      }
      if (persist.queue.length >= GO2_CONSTRUCTION_QUEUE_SIZE) {
        showToast('Cola llena (5)');
        return;
      }
      const cost = getBuildingLevelCost(type, targetLevel, true);
      const { resources } = persist;
      if (
        resources.metal < cost.metal ||
        resources.plasma < cost.plasma ||
        resources.credits < cost.credits
      ) {
        showToast('Recursos insuficientes');
        return;
      }
      const endsAt = Date.now() + cost.time * 1000;
      const jobId = `job_${Date.now()}`;

      setPersist((prev) => ({
        resources: {
          ...prev.resources,
          metal: prev.resources.metal - cost.metal,
          plasma: prev.resources.plasma - cost.plasma,
          credits: prev.resources.credits - cost.credits,
        },
        queue: [
          ...prev.queue,
          {
            id: jobId,
            catalogId,
            type,
            buildingName: template.name,
            slotIndex,
            targetLevel,
            endsAt,
            mode,
          },
        ],
        placements:
          mode === 'build'
            ? [
                ...prev.placements,
                {
                  instanceId: `pending-${jobId}`,
                  slotIndex,
                  catalogId,
                  type,
                  level: targetLevel,
                  status: 'upgrading',
                  constructionEndsAt: new Date(endsAt).toISOString(),
                },
              ]
            : prev.placements.map((p) =>
                p.slotIndex === slotIndex
                  ? { ...p, status: 'upgrading', constructionEndsAt: new Date(endsAt).toISOString() }
                  : p
              ),
      }));
      showToast(`${template.name} Nv.${targetLevel} en cola`);
    },
    [persist, showToast]
  );

  const upgradeSelected = useCallback(
    async (params: {
      slotIndex: number;
      type: string;
      apiBuildingId?: string;
      catalogId?: string;
    }) => {
      const catalogId = params.catalogId ?? BUILDING_CATALOG.find((b) => b.type === params.type)?.id;
      if (!catalogId) return;
      const existing = persist.placements.find((p) => p.slotIndex === params.slotIndex && p.status === 'active');
      const level = existing ? existing.level + 1 : 1;
      enqueue(params.slotIndex, catalogId, params.type, level, existing ? 'upgrade' : 'build');
    },
    [persist, enqueue]
  );

  const collectResources = useCallback(async () => {
    setPersist((prev) => ({
      ...prev,
      resources: {
        ...prev.resources,
        metal: Math.min(
          prev.resources.metalCapacity ?? 50_000,
          prev.resources.metal + (prev.resources.metalProduction ?? 100)
        ),
        plasma: Math.min(
          prev.resources.plasmaCapacity ?? 50_000,
          prev.resources.plasma + (prev.resources.plasmaProduction ?? 50)
        ),
      },
    }));
    showToast('Recursos recolectados');
  }, [showToast]);

  const refresh = useCallback(async () => {
    /* local */
  }, []);

  return {
    player: DEFAULT_PLAYER,
    resources: persist.resources,
    planetId: 'destock-local',
    planetName: 'Planeta Principal',
    planetType: 'HABITABLE',
    grid,
    buildings,
    constructionQueue,
    usingMock: false,
    loading,
    error,
    actionToast,
    showToast,
    collectResources,
    refresh,
    upgradeSelected,
  };
}

export function resetDestockGo2Save(): void {
  localStorage.removeItem(STORAGE_KEY);
}
