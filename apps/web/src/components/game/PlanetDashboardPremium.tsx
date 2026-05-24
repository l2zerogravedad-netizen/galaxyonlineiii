'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BuildingDefinition, GridSlot, PlayerData, ResourcesData } from './types';
import { getBuildingById } from './mockData';
import { GameHeader } from './GameHeader';
import { ResourceCard } from './ResourceCard';
import { PlanetPanel } from './PlanetPanel';
import { BuildingGrid } from './BuildingGrid';
import { BuildingDetailPanel } from './BuildingDetailPanel';
import { StructureLibrary } from './StructureLibrary';
import { BottomNavigation } from './BottomNavigation';
import { isApiBuildable } from '@/lib/game/buildingMap';

export interface PlanetDashboardPremiumProps {
  player: PlayerData;
  resources: ResourcesData;
  planetName: string;
  planetType?: string;
  planetId?: string | null;
  grid: GridSlot[];
  buildings: BuildingDefinition[];
  usingMock?: boolean;
  apiError?: string | null;
  onRefresh?: () => Promise<void>;
  onUpgradeBuilding?: (params: {
    slotIndex: number;
    type: string;
    apiBuildingId?: string;
  }) => Promise<void>;
  onLogout: () => void;
}

export function PlanetDashboardPremium({
  player,
  resources,
  planetName,
  planetType,
  planetId,
  grid,
  buildings,
  usingMock = false,
  apiError,
  onRefresh,
  onUpgradeBuilding,
  onLogout,
}: PlanetDashboardPremiumProps) {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(4);
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>('control-center');
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setActionError(apiError ?? null);
  }, [apiError]);

  const selectedBuilding = useMemo(() => {
    if (selectedSlotIndex != null) {
      const slot = grid.find((s) => s.slotIndex === selectedSlotIndex);
      if (slot?.buildingId) {
        const b = getBuildingById(slot.buildingId);
        const live = buildings.find((x) => x.id === slot.buildingId);
        if (b) return { ...b, ...live };
      }
      return {
        id: `empty-${selectedSlotIndex}`,
        name: 'Espacio vacío',
        type: 'EMPTY',
        level: 0,
        image: '',
        description: 'Slot libre para nueva construcción.',
        production: '—',
        capacity: '—',
        health: 0,
        category: 'core' as const,
        upgradeCost: { metal: 0, plasma: 0, credits: 0 },
        status: 'empty' as const,
        slotIndex: selectedSlotIndex,
      };
    }
    if (selectedLibraryId) {
      return buildings.find((b) => b.id === selectedLibraryId) ?? null;
    }
    return null;
  }, [selectedSlotIndex, selectedLibraryId, grid, buildings]);

  const handleSelectSlot = useCallback(
    (slotIndex: number) => {
      setSelectedSlotIndex(slotIndex);
      const slot = grid.find((s) => s.slotIndex === slotIndex);
      if (slot?.buildingId) setSelectedLibraryId(slot.buildingId);
    },
    [grid]
  );

  const handleSelectLibrary = useCallback((id: string) => {
    setSelectedLibraryId(id);
    const def = buildings.find((b) => b.id === id) ?? getBuildingById(id);
    if (def?.slotIndex != null) setSelectedSlotIndex(def.slotIndex);
  }, [buildings]);

  const handleUpgradeOrBuild = useCallback(async () => {
    if (!selectedBuilding || usingMock || !planetId || !onUpgradeBuilding) return;

    const slotIndex = selectedSlotIndex ?? selectedBuilding.slotIndex;
    if (slotIndex == null) return;
    if (!isApiBuildable(selectedBuilding.type)) {
      setActionError('Este edificio aún no está disponible en el servidor.');
      return;
    }

    const canUpgrade = selectedBuilding.status === 'active';
    const canBuild =
      selectedBuilding.status === 'empty' && !selectedBuilding.id.startsWith('empty-');

    if (!canUpgrade && !canBuild) return;

    setActionPending(true);
    setActionError(null);
    try {
      await onUpgradeBuilding({
        slotIndex,
        type: selectedBuilding.type,
        apiBuildingId: selectedBuilding.apiBuildingId,
      });
      await onRefresh?.();
    } catch {
      /* error surfaced via apiError / hook */
    } finally {
      setActionPending(false);
    }
  }, [
    selectedBuilding,
    usingMock,
    planetId,
    onUpgradeBuilding,
    selectedSlotIndex,
    onRefresh,
  ]);

  return (
    <div className="planet-dashboard min-h-screen flex flex-col gap-2 md:gap-3 p-2 md:p-3 max-h-screen overflow-hidden">
      <GameHeader player={player} planetName={planetName} onLogout={onLogout} />

      {(usingMock || actionError) && (
        <p
          className={`text-center text-[11px] px-2 py-1 rounded ${
            usingMock
              ? 'text-amber-300/90 bg-amber-950/40 border border-amber-500/30'
              : 'text-red-300/90 bg-red-950/40 border border-red-500/30'
          }`}
          role="status"
        >
          {usingMock
            ? 'Modo demostración: no se pudo conectar con el servidor. Mostrando datos de ejemplo.'
            : actionError}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <ResourceCard
          label="Metal"
          amount={resources.metal}
          capacity={resources.metalCapacity}
          production={resources.metalProduction}
          iconSrc="/game/assets/ui/resource-metal.webp"
          iconFallback="⚙"
          accent="cyan"
        />
        <ResourceCard
          label="Plasma"
          amount={resources.plasma}
          capacity={resources.plasmaCapacity}
          production={resources.plasmaProduction}
          iconSrc="/game/assets/ui/resource-plasma.webp"
          iconFallback="⚡"
          accent="purple"
        />
        <ResourceCard
          label="Créditos"
          amount={resources.credits}
          iconSrc="/game/assets/ui/resource-credits.webp"
          iconFallback="◈"
          accent="gold"
        />
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(180px,220px)_1fr_minmax(240px,280px)] gap-2 md:gap-3 min-h-0 overflow-hidden">
        <PlanetPanel planetName={planetName} planetType={planetType} />
        <BuildingGrid
          grid={grid}
          selectedSlotIndex={selectedSlotIndex}
          onSelectSlot={handleSelectSlot}
        />
        <BuildingDetailPanel
          building={selectedBuilding}
          onUpgrade={handleUpgradeOrBuild}
          onBuild={handleUpgradeOrBuild}
          pending={actionPending}
          liveMode={!usingMock && Boolean(planetId)}
        />
      </div>

      <StructureLibrary
        buildings={buildings}
        selectedBuildingId={selectedLibraryId}
        onSelectBuilding={handleSelectLibrary}
      />

      <BottomNavigation />
    </div>
  );
}
