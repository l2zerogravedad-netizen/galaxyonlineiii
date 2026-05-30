'use client';

/**
 * Pantalla planeta — réplica del video GO II (eYxe2OR5FN8).
 * Mismos componentes go2-*, misma disposición, mismos menús.
 */

import '@/components/game/go2/go2-planet.css';
import '@/components/game/go2/go2-visual.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Go2IconFrame } from '@/components/game/go2/Go2IconFrame';
import { CATALOG_ID_TO_TYPE } from '@/lib/game/buildingMap';
import {
  buildGridCellBuildings,
  findBuildingForSelection,
} from '@/components/game/dashboard/adapters';
import { ActionToast } from '@/components/game/dashboard/ActionToast';
import { Go2ConstructionMenu } from '@/components/game/go2/Go2ConstructionMenu';
import { Go2ConstructionQueue } from '@/components/game/go2/Go2ConstructionQueue';
import { Go2IsometricGrid } from '@/components/game/go2/Go2IsometricGrid';
import { Go2ResourceHud } from '@/components/game/go2/Go2ResourceHud';
import { Go2SlotDetail } from '@/components/game/go2/Go2SlotDetail';
import { Go2DestockBottomNav } from '../components/Go2DestockBottomNav';
import { Go2DestockHeader } from '../components/Go2DestockHeader';
import { Go2TerraformOverlay } from '@/components/game/go2/Go2TerraformOverlay';
import {
  computeTerraformVisual,
  terraformStyleVars,
} from '@/lib/game/terraformVisual';
import { resetDestockGo2Save, useDestockGo2Dashboard } from '../useDestockGo2Dashboard';
import { GO2_TEST_GLB_BUILDING } from '@/lib/destockHdAssets';
import { preloadGlb } from '@/lib/glbModelCache';

export function PlanetScreen() {
  const game = useDestockGo2Dashboard();
  const [collecting, setCollecting] = useState(false);
  const [buildMenuOpen, setBuildMenuOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(0);
  const [pendingCatalogId, setPendingCatalogId] = useState<string | null>(null);

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

  const terraform = useMemo(() => {
    const placements: { type: string; status: string }[] = [];
    for (const slot of game.grid) {
      if (!slot.buildingId) continue;
      const def = game.buildings.find((b) => b.id === slot.buildingId);
      if (!def || def.type === 'EMPTY') continue;
      placements.push({
        type: def.type,
        status: def.status === 'upgrading' ? 'upgrading' : 'active',
      });
    }
    return computeTerraformVisual({
      placements,
      queueLength: game.constructionQueue?.length ?? 0,
    });
  }, [game.grid, game.buildings, game.constructionQueue]);

  const terraformStyle = useMemo(
    () => terraformStyleVars(terraform.level),
    [terraform.level]
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
            void game.upgradeSelected({
              slotIndex,
              type,
              catalogId: pendingCatalogId,
            });
            setPendingCatalogId(null);
            setBuildMenuOpen(false);
          }
          return;
        }
      }
      setPendingCatalogId(null);
    },
    [pendingCatalogId, gridCells, game]
  );

  const handleBuild = useCallback(() => {
    if (selectedSlot == null || !pendingCatalogId) return;
    const type = CATALOG_ID_TO_TYPE[pendingCatalogId];
    if (!type) return;
    void game.upgradeSelected({
      slotIndex: selectedSlot,
      type,
      catalogId: pendingCatalogId,
    });
    setPendingCatalogId(null);
    setBuildMenuOpen(false);
  }, [game, selectedSlot, pendingCatalogId]);

  const handleUpgrade = useCallback(() => {
    if (selectedSlot == null) return;
    const cell = gridCells.find((c) => c.slotIndex === selectedSlot);
    if (!cell || cell.type === 'EMPTY') return;
    void game.upgradeSelected({
      slotIndex: selectedSlot,
      type: cell.type,
      apiBuildingId: cell.apiBuildingId,
      catalogId: cell.id,
    });
  }, [game, selectedSlot, gridCells]);

  const handleCollect = useCallback(async () => {
    setCollecting(true);
    try {
      await game.collectResources();
    } finally {
      setCollecting(false);
    }
  }, [game]);

  const handleReset = useCallback(() => {
    resetDestockGo2Save();
    window.location.reload();
  }, []);

  useEffect(() => {
    preloadGlb(GO2_TEST_GLB_BUILDING.url);
  }, []);

  return (
    <div
      className={[
        'go2-planet-root',
        'go2-planet-root--polish',
        'go2-planet-root--terraform',
        `go2-planet-root--tf-${terraform.stage}`,
      ].join(' ')}
      style={terraformStyle}
    >
      <Go2TerraformOverlay state={terraform} />
      <ActionToast message={game.actionToast} />
      <Go2DestockHeader
        player={game.player}
        onCollect={() => void handleCollect()}
        onReset={handleReset}
        collecting={collecting}
      />
      <Go2ResourceHud resources={game.resources} />
      <Go2ConstructionQueue items={game.constructionQueue ?? []} />

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
        usingMock={false}
        onBuild={handleBuild}
        onUpgrade={() => void handleUpgrade()}
      />

      <button
        type="button"
        className="go2-hammer-btn"
        aria-label="Construir"
        onClick={() => setBuildMenuOpen(true)}
      >
        <Go2IconFrame icon="hammer" size="lg" rarity="legendary" />
      </button>

      <Go2DestockBottomNav />

      <Go2ConstructionMenu
        open={buildMenuOpen}
        buildings={game.buildings}
        onClose={() => setBuildMenuOpen(false)}
        onPick={onPickBuilding}
      />
    </div>
  );
}
