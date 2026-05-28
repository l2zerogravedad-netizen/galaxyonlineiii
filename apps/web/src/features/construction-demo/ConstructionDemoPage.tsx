'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getCatalogItem } from './catalog';
import {
  canAfford,
  loadSave,
  newInstanceId,
  persistSave,
  refund,
  resetSave,
  spend,
} from './storage';
import type {
  BuildingTypeId,
  PlacedBuilding,
  Resources,
  Rotation,
} from './types';

/* ─── Dynamic import of 3D planet (client-only, heavy Three.js) ─── */
const Go2Planet3D = dynamic(
  () => import('@/components/game/go2/planet').then((mod) => ({ default: mod.Go2Planet3D })),
  {
    ssr: false,
    loading: () => (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: '#050a14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#8bb3d9',
        fontSize: 16,
        fontFamily: 'sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>🌍</div>
          <div>Cargando planeta 3D...</div>
          <div style={{ fontSize: 12, color: '#4a6a8a', marginTop: 8 }}>Preparando terreno y modelos</div>
        </div>
      </div>
    ),
  }
);

export function ConstructionDemoPage() {
  const [resources, setResources] = useState<Resources>(() => loadSave().resources);
  const [buildings, setBuildings] = useState<PlacedBuilding[]>(() => loadSave().buildings);

  // Persist on change
  useEffect(() => {
    persistSave({ version: 1, resources, buildings });
  }, [resources, buildings]);

  const handleBuild = useCallback((
    typeId: BuildingTypeId,
    col: number,
    row: number,
    rotation: Rotation
  ) => {
    const def = getCatalogItem(typeId);
    if (!def) return;
    const placed: PlacedBuilding = {
      instanceId: newInstanceId(),
      typeId,
      col,
      row,
      rotation,
    };
    setBuildings((prev) => [...prev, placed]);
    setResources((r) => spend(r, def.cost));
  }, []);

  const handleDelete = useCallback((instanceId: string) => {
    const target = buildings.find((b) => b.instanceId === instanceId);
    if (!target) return;
    const def = getCatalogItem(target.typeId);
    setBuildings((prev) => prev.filter((b) => b.instanceId !== instanceId));
    if (def) setResources((r) => refund(r, def.cost));
  }, [buildings]);

  const handleReset = useCallback(() => {
    const fresh = resetSave();
    setResources(fresh.resources);
    setBuildings(fresh.buildings);
  }, []);

  const handleCanAfford = useCallback((cost: Resources) => {
    return canAfford(resources, cost);
  }, [resources]);

  return (
    <Go2Planet3D
      resources={resources}
      buildings={buildings}
      onBuild={handleBuild}
      onDelete={handleDelete}
      onReset={handleReset}
      canAfford={handleCanAfford}
      spendResources={(cost) => setResources((r) => spend(r, cost))}
      refundResources={(cost) => setResources((r) => refund(r, cost))}
      getBuildingCost={(typeId) => {
        const def = getCatalogItem(typeId);
        return def ? def.cost : null;
      }}
    />
  );
}
