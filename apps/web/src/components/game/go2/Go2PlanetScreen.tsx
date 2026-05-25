'use client';

import './go2-planet.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hammer } from 'lucide-react';
import { useGameDashboard } from '@/lib/game/useGameDashboard';
import { CATALOG_ID_TO_TYPE } from '@/lib/game/buildingMap';
import {
  buildGridCellBuildings,
  findBuildingForSelection,
} from '../dashboard/adapters';
import { Go2ResourceHud } from './Go2ResourceHud';
import { Go2ConstructionQueue } from './Go2ConstructionQueue';
import { Go2ConstructionMenu } from './Go2ConstructionMenu';
import { Go2IsometricGrid } from './Go2IsometricGrid';
import { Go2BottomNav } from './Go2BottomNav';
import { Go2SlotDetail } from './Go2SlotDetail';
import { ActionToast } from '../dashboard/ActionToast';
import { Go2PlanetHeader } from './Go2PlanetHeader';

export function Go2PlanetScreen() {
  const router = useRouter();
  const game = useGameDashboard(true);
  const [collecting, setCollecting] = useState(false);
  const [buildMenuOpen, setBuildMenuOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(0);
  const [pendingCatalogId, setPendingCatalogId] = useState<string | null>(null);

  useEffect(() => {
    if (!localStorage.getItem('token')) router.replace('/');
  }, [router]);

  const gridCells = useMemo(
    () => buildGridCellBuildings(game.grid, game.buildings),
    [game.grid, game.buildings]
  );

  const selectedBuilding = useMemo(() => {
    const id = selectedSlot != null ? `slot-${selectedSlot}` : gridCells[0]?.id;
    return findBuildingForSelection(id ?? '', gridCells, game.buildings);
  }, [selectedSlot, gridCells, game.buildings]);

  const pendingBuild = useMemo(
    () => (pendingCatalogId ? game.buildings.find((b) => b.id === pendingCatalogId) : null),
    [pendingCatalogId, game.buildings]
  );

  const onPickBuilding = useCallback(
    (catalogId: string) => {
      const def = game.buildings.find((b) => b.id === catalogId);
      if (def?.status === 'locked') {
        game.showToast(def.unlockRequirement ?? 'Bloqueado');
        return;
      }
      setPendingCatalogId(catalogId);
      setBuildMenuOpen(false);
      const empty = gridCells.find((c) => c.status === 'empty');
      if (empty?.slotIndex != null) setSelectedSlot(empty.slotIndex);
      game.showToast(`${def?.name ?? 'Edificio'}: elige celda en el mapa`);
    },
    [game, gridCells]
  );

  const onSelectSlot = useCallback(
    (slotIndex: number) => {
      setSelectedSlot(slotIndex);
      if (pendingCatalogId) {
        const cell = gridCells.find((c) => c.slotIndex === slotIndex);
        if (cell?.status === 'empty' || cell?.type === 'EMPTY') {
          const type = CATALOG_ID_TO_TYPE[pendingCatalogId];
          if (type) {
            void game
              .upgradeSelected({
                slotIndex,
                type,
                catalogId: pendingCatalogId,
              })
              .then(() => {
                setPendingCatalogId(null);
                setBuildMenuOpen(false);
              });
          }
          return;
        }
      }
      setPendingCatalogId(null);
    },
    [pendingCatalogId, gridCells, game]
  );

  const handleBuild = useCallback(async () => {
    if (selectedSlot == null || !pendingCatalogId) return;
    const type = CATALOG_ID_TO_TYPE[pendingCatalogId];
    if (!type) return;
    await game.upgradeSelected({
      slotIndex: selectedSlot,
      type,
      catalogId: pendingCatalogId,
    });
    setPendingCatalogId(null);
    setBuildMenuOpen(false);
  }, [game, selectedSlot, pendingCatalogId]);

  const handleUpgrade = useCallback(async () => {
    if (selectedSlot == null) return;
    const cell = gridCells.find((c) => c.slotIndex === selectedSlot);
    if (!cell || cell.type === 'EMPTY') return;
    await game.upgradeSelected({
      slotIndex: selectedSlot,
      type: cell.type,
      apiBuildingId: cell.apiBuildingId,
      catalogId: cell.id,
    });
  }, [game, selectedSlot, gridCells]);

  const queue = game.constructionQueue ?? [];

  const handleCollect = useCallback(async () => {
    setCollecting(true);
    try {
      await game.collectResources();
    } finally {
      setCollecting(false);
    }
  }, [game]);

  return (
    <div className="go2-planet-root">
      <ActionToast message={game.actionToast} />
      <Go2PlanetHeader
        player={game.player}
        usingMock={game.usingMock}
        onCollect={() => void handleCollect()}
        collecting={collecting}
      />
      <Go2ResourceHud resources={game.resources} />
      <Go2ConstructionQueue items={queue} />

      <div className="go2-terrain-scroll">
        <Go2IsometricGrid
          grid={game.grid}
          buildings={game.buildings}
          selectedSlotIndex={selectedSlot}
          buildTargetSlotIndex={pendingCatalogId ? selectedSlot : null}
          pendingCatalogId={pendingCatalogId}
          onSelectSlot={onSelectSlot}
        />
      </div>

      <Go2SlotDetail
        building={selectedBuilding}
        pendingCatalogId={pendingCatalogId}
        pendingBuild={pendingBuild ?? null}
        resources={game.resources}
        usingMock={game.usingMock}
        onBuild={() => void handleBuild()}
        onUpgrade={() => void handleUpgrade()}
      />

      <button
        type="button"
        className="go2-hammer-btn"
        aria-label="Construir"
        onClick={() => setBuildMenuOpen(true)}
      >
        <Hammer className="h-7 w-7" />
      </button>

      <Go2BottomNav />

      <Go2ConstructionMenu
        open={buildMenuOpen}
        buildings={game.buildings}
        onClose={() => setBuildMenuOpen(false)}
        onPick={onPickBuilding}
      />

      {game.error ? (
        <p className="pointer-events-none absolute left-2 top-2 z-40 max-w-[240px] rounded bg-red-950/90 px-2 py-1 text-[10px] text-red-200">
          {game.error}
        </p>
      ) : null}
      {game.loading ? (
        <p className="pointer-events-none absolute inset-0 z-40 grid place-items-center bg-black/30 text-sm text-amber-100">
          Cargando planeta…
        </p>
      ) : null}
    </div>
  );
}
