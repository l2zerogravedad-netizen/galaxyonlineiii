'use client';

import { useCallback, useEffect, useState } from 'react';
import { MAX_QUEUE, STARTING_RESOURCES, getSpec } from './catalog';
import { canPlace, countType, footprintSize, occupancy } from './gridUtils';
import type {
  BuildJob,
  BuildingId,
  EmpireProfile,
  PlacedStructure,
  PlanetSave,
  Resources,
  Rotation,
} from './types';

const STORAGE_KEY = 'destock-space-planet-v1';

const DEFAULT_EMPIRE: EmpireProfile = {
  name: 'Sector Orion',
  tag: 'DSX',
  level: 7,
  xp: 2400,
  xpMax: 5000,
};

function defaultSave(): PlanetSave {
  return {
    version: 1,
    resources: { ...STARTING_RESOURCES },
    structures: [],
    queue: [],
    notifications: [],
  };
}

function loadSave(): PlanetSave {
  if (typeof window === 'undefined') return defaultSave();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSave();
    const p = JSON.parse(raw) as PlanetSave;
    if (p.version !== 1 || !p.resources) return defaultSave();
    return { ...defaultSave(), ...p, queue: p.queue ?? [], structures: p.structures ?? [] };
  } catch {
    return defaultSave();
  }
}

function canAfford(r: Resources, cost: Resources) {
  return (
    r.metal >= cost.metal &&
    r.crystal >= cost.crystal &&
    r.energy >= cost.energy &&
    r.nova >= cost.nova &&
    r.credits >= cost.credits
  );
}

function spend(r: Resources, cost: Resources): Resources {
  return {
    metal: r.metal - cost.metal,
    crystal: r.crystal - cost.crystal,
    energy: r.energy - cost.energy,
    nova: r.nova - cost.nova,
    credits: r.credits - cost.credits,
  };
}

function refund(r: Resources, cost: Partial<Resources>): Resources {
  return {
    metal: r.metal + (cost.metal ?? 0),
    crystal: r.crystal + (cost.crystal ?? 0),
    energy: r.energy + (cost.energy ?? 0),
    nova: r.nova + (cost.nova ?? 0),
    credits: r.credits + (cost.credits ?? 0),
  };
}

function halfCost(cost: Resources): Resources {
  return {
    metal: Math.floor(cost.metal * 0.5),
    crystal: Math.floor(cost.crystal * 0.5),
    energy: Math.floor(cost.energy * 0.5),
    nova: Math.floor(cost.nova * 0.5),
    credits: Math.floor(cost.credits * 0.5),
  };
}

function isUnlocked(spec: ReturnType<typeof getSpec>, structures: PlacedStructure[]) {
  if (!spec?.unlock) return { ok: true as const };
  const found = structures.find(
    (s) => s.buildingId === spec.unlock!.buildingId && s.level >= spec.unlock!.level
  );
  if (found) return { ok: true as const };
  return { ok: false as const, reason: `Requiere ${spec.unlock.label}` };
}

export function usePlanetState() {
  const [save, setSave] = useState<PlanetSave>(loadSave);
  const [toast, setToast] = useState<string | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => setNow(Date.now()), []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  }, [save]);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    setSave((s) => ({
      ...s,
      notifications: [...s.notifications.slice(-4), msg],
    }));
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      setSave((prev) => {
        const done = prev.queue.filter((j) => t >= j.startedAt + j.durationMs);
        if (!done.length) return prev;
        let structures = [...prev.structures];
        for (const job of done) {
          if (job.mode === 'upgrade' && job.instanceId) {
            structures = structures.map((s) =>
              s.instanceId === job.instanceId
                ? { ...s, level: job.targetLevel, spawnAt: t }
                : s
            );
          } else {
            structures.push({
              instanceId: `st_${t}_${Math.random().toString(36).slice(2, 7)}`,
              buildingId: job.buildingId,
              col: job.col,
              row: job.row,
              rotation: job.rotation,
              level: job.targetLevel,
              spawnAt: t,
            });
          }
        }
        return { ...prev, structures, queue: prev.queue.filter((j) => t < j.startedAt + j.durationMs) };
      });
    }, 300);
    return () => clearInterval(id);
  }, []);

  const enqueueBuild = useCallback(
    (buildingId: BuildingId, col: number, row: number, rotation: Rotation) => {
      const spec = getSpec(buildingId);
      if (!spec) return false;
      const { w, h } = footprintSize(spec, rotation);
      const occ = occupancy(save.structures, save.queue);
      const place = canPlace(col, row, w, h, occ);
      if (!place.ok) {
        notify(place.reason);
        return false;
      }
      const unlock = isUnlocked(spec, save.structures);
      if (!unlock.ok) {
        notify(unlock.reason);
        return false;
      }
      if (countType(buildingId, save.structures, save.queue) >= spec.maxOnBase) {
        notify('Límite en base');
        return false;
      }
      if (save.queue.length >= MAX_QUEUE) {
        notify('Cola llena (5)');
        return false;
      }
      if (!canAfford(save.resources, spec.cost)) {
        notify('Recursos insuficientes');
        return false;
      }
      const job: BuildJob = {
        jobId: `job_${Date.now()}`,
        buildingId,
        col,
        row,
        rotation,
        targetLevel: 1,
        startedAt: Date.now(),
        durationMs: spec.buildSeconds * 1000,
        mode: 'build',
      };
      setSave((s) => ({
        ...s,
        resources: spend(s.resources, spec.cost),
        queue: [...s.queue, job],
      }));
      notify(`${spec.name} en cola`);
      return true;
    },
    [save, notify]
  );

  const upgradeStructure = useCallback(
    (instanceId: string) => {
      const st = save.structures.find((s) => s.instanceId === instanceId);
      if (!st) return;
      const spec = getSpec(st.buildingId);
      if (!spec) return;
      const nextLevel = st.level + 1;
      const cost: Resources = {
        metal: Math.floor(spec.cost.metal * nextLevel * 0.8),
        crystal: Math.floor(spec.cost.crystal * nextLevel * 0.8),
        energy: Math.floor(spec.cost.energy * nextLevel * 0.5),
        nova: Math.floor(spec.cost.nova * nextLevel * 0.5),
        credits: Math.floor(spec.cost.credits * nextLevel),
      };
      if (!canAfford(save.resources, cost)) {
        notify('Recursos insuficientes');
        return;
      }
      if (save.queue.length >= MAX_QUEUE) {
        notify('Cola llena');
        return;
      }
      const job: BuildJob = {
        jobId: `job_${Date.now()}`,
        buildingId: st.buildingId,
        col: st.col,
        row: st.row,
        rotation: st.rotation,
        targetLevel: nextLevel,
        startedAt: Date.now(),
        durationMs: Math.max(5000, spec.buildSeconds * 1000 * 0.6),
        mode: 'upgrade',
        instanceId,
      };
      setSave((s) => ({
        ...s,
        resources: spend(s.resources, cost),
        queue: [...s.queue, job],
      }));
      notify(`Mejora ${spec.name} → Nv.${nextLevel}`);
    },
    [save, notify]
  );

  const cancelJob = useCallback(
    (jobId: string) => {
      const job = save.queue.find((j) => j.jobId === jobId);
      if (!job) return;
      const spec = getSpec(job.buildingId);
      setSave((s) => ({
        ...s,
        queue: s.queue.filter((j) => j.jobId !== jobId),
        resources: spec ? refund(s.resources, halfCost(spec.cost)) : s.resources,
      }));
      notify('Construcción cancelada');
    },
    [save, notify]
  );

  const deleteStructure = useCallback(
    (instanceId: string) => {
      const st = save.structures.find((s) => s.instanceId === instanceId);
      const spec = st ? getSpec(st.buildingId) : undefined;
      setSave((s) => ({
        ...s,
        structures: s.structures.filter((x) => x.instanceId !== instanceId),
        resources: spec ? refund(s.resources, halfCost(spec.cost)) : s.resources,
      }));
      notify('Módulo desmontado');
    },
    [notify]
  );

  const resetBase = useCallback(() => {
    setSave(defaultSave());
    notify('Base reiniciada');
  }, [notify]);

  return {
    empire: DEFAULT_EMPIRE,
    resources: save.resources,
    structures: save.structures,
    queue: save.queue,
    notifications: save.notifications,
    toast,
    now,
    notify,
    enqueueBuild,
    upgradeStructure,
    cancelJob,
    deleteStructure,
    resetBase,
    isUnlocked: (id: BuildingId) => isUnlocked(getSpec(id), save.structures).ok,
    canAfford: (cost: Resources) => canAfford(save.resources, cost),
  };
}
