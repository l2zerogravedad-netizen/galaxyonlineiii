'use client';

import './construction-demo.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BUILDING_CATALOG,
  GRID_COLS,
  GRID_ROWS,
  getCatalogItem,
} from './catalog';
import {
  buildOccupancyMap,
  canPlaceAt,
  cellKey,
  cellsForPlacement,
  countTypeOnMap,
  footprintSize,
  screenToGrid,
} from './gridUtils';
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
  DragState,
  GridCell,
  PlacedBuilding,
  Resources,
  Rotation,
} from './types';

const TILE_W = 76;
const TILE_H = 40;

function formatCost(c: Resources): string {
  const parts: string[] = [];
  if (c.metal) parts.push(`${c.metal} M`);
  if (c.energy) parts.push(`${c.energy} E`);
  if (c.crystal) parts.push(`${c.crystal} C`);
  return parts.join(' · ') || '—';
}

function nextRotation(r: Rotation): Rotation {
  return r === 0 ? 90 : r === 90 ? 180 : r === 180 ? 270 : 0;
}

export function ConstructionDemoPage() {
  const [resources, setResources] = useState<Resources>(() => loadSave().resources);
  const [buildings, setBuildings] = useState<PlacedBuilding[]>(() => loadSave().buildings);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [hoverCell, setHoverCell] = useState<GridCell | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const hoverRef = useRef<GridCell | null>(null);
  dragRef.current = drag;
  hoverRef.current = hoverCell;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  useEffect(() => {
    persistSave({ version: 1, resources, buildings });
  }, [resources, buildings]);

  const occupancy = useMemo(() => buildOccupancyMap(buildings), [buildings]);

  const placementPreview = useMemo(() => {
    if (!drag || !hoverCell) return null;
    const def = getCatalogItem(drag.typeId);
    if (!def) return null;
    const { w, h } = footprintSize(def, drag.rotation);
    const place = canPlaceAt(hoverCell.col, hoverCell.row, w, h, occupancy);
    const afford = canAfford(resources, def.cost);
    const maxOk =
      def.maxOnMap == null || countTypeOnMap(buildings, def.id) < def.maxOnMap;
    return {
      cells: cellsForPlacement(hoverCell.col, hoverCell.row, w, h),
      valid: place.ok && afford && maxOk,
      reason: !afford
        ? 'Recursos insuficientes'
        : !maxOk
          ? 'Límite alcanzado'
          : !place.ok
            ? place.reason
            : null,
    };
  }, [drag, hoverCell, occupancy, resources, buildings]);

  const previewKeys = useMemo(() => {
    if (!placementPreview) return new Set<string>();
    return new Set(placementPreview.cells.map((c) => cellKey(c.col, c.row)));
  }, [placementPreview]);

  const cancelDrag = useCallback(() => {
    setDrag(null);
    setHoverCell(null);
  }, []);

  const startDrag = useCallback(
    (typeId: BuildingTypeId) => {
      const def = getCatalogItem(typeId);
      if (!def) return;
      if (!canAfford(resources, def.cost)) {
        showToast('Recursos insuficientes');
        return;
      }
      if (def.maxOnMap != null && countTypeOnMap(buildings, typeId) >= def.maxOnMap) {
        showToast(`Máximo ${def.maxOnMap} en el mapa`);
        return;
      }
      const initial: DragState = { typeId, rotation: 0 };
      setDrag(initial);
      dragRef.current = initial;
      setSelectedId(null);
      showToast(`${def.name}: arrastra a la grilla (R rotar, ESC cancelar)`);

      const onMove = (e: PointerEvent) => {
        const board = boardRef.current;
        if (!board) return;
        const rect = board.getBoundingClientRect();
        const cell = screenToGrid(
          e.clientX - rect.left,
          e.clientY - rect.top,
          TILE_W,
          TILE_H
        );
        hoverRef.current = cell;
        setHoverCell(cell);
      };

      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        const d = dragRef.current;
        const h = hoverRef.current;
        if (d && h) {
          const defUp = getCatalogItem(d.typeId);
          if (defUp) {
            const { w, h: fh } = footprintSize(defUp, d.rotation);
            const occ = buildOccupancyMap(buildings);
            const place = canPlaceAt(h.col, h.row, w, fh, occ);
            const afford = canAfford(resources, defUp.cost);
            const maxOk =
              defUp.maxOnMap == null ||
              countTypeOnMap(buildings, d.typeId) < defUp.maxOnMap;
            if (place.ok && afford && maxOk) {
              const placed: PlacedBuilding = {
                instanceId: newInstanceId(),
                typeId: d.typeId,
                col: h.col,
                row: h.row,
                rotation: d.rotation,
              };
              setBuildings((prev) => [...prev, placed]);
              setResources((r) => spend(r, defUp.cost));
              showToast(`${defUp.name} construido`);
            } else {
              showToast(
                !afford
                  ? 'Recursos insuficientes'
                  : !maxOk
                    ? 'Límite alcanzado'
                    : !place.ok
                      ? place.reason
                      : 'No se puede colocar'
              );
            }
          }
        }
        dragRef.current = null;
        setDrag(null);
        setHoverCell(null);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp, { once: true });
    },
    [resources, buildings, showToast]
  );

  const placeAt = useCallback(
    (col: number, row: number) => {
      if (!drag) return;
      const def = getCatalogItem(drag.typeId);
      if (!def) return;
      const { w, h } = footprintSize(def, drag.rotation);
      const place = canPlaceAt(col, row, w, h, occupancy);
      if (!place.ok) {
        showToast(place.reason);
        return;
      }
      if (!canAfford(resources, def.cost)) {
        showToast('Recursos insuficientes');
        return;
      }
      if (def.maxOnMap != null && countTypeOnMap(buildings, drag.typeId) >= def.maxOnMap) {
        showToast(`Máximo ${def.maxOnMap} en el mapa`);
        return;
      }

      const placed: PlacedBuilding = {
        instanceId: newInstanceId(),
        typeId: drag.typeId,
        col,
        row,
        rotation: drag.rotation,
      };
      setBuildings((prev) => [...prev, placed]);
      setResources((r) => spend(r, def.cost));
      showToast(`${def.name} construido`);
      cancelDrag();
    },
    [drag, occupancy, resources, buildings, showToast, cancelDrag]
  );

  const deleteSelected = useCallback(() => {
    if (!selectedId) {
      showToast('Selecciona un edificio en el mapa');
      return;
    }
    const target = buildings.find((b) => b.instanceId === selectedId);
    if (!target) return;
    const def = getCatalogItem(target.typeId);
    setBuildings((prev) => prev.filter((b) => b.instanceId !== selectedId));
    if (def) setResources((r) => refund(r, def.cost));
    setSelectedId(null);
    showToast('Edificio eliminado (recursos devueltos)');
  }, [selectedId, buildings, showToast]);

  const handleReset = useCallback(() => {
    const fresh = resetSave();
    setResources(fresh.resources);
    setBuildings(fresh.buildings);
    cancelDrag();
    setSelectedId(null);
    showToast('Partida reiniciada');
  }, [cancelDrag, showToast]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelDrag();
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        if (!drag) return;
        const next = nextRotation(drag.rotation);
        setDrag({ ...drag, rotation: next });
        dragRef.current = { ...drag, rotation: next };
        showToast(`Rotación ${next}°`);
      }
      if (e.key === 'Delete' && selectedId) {
        deleteSelected();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drag, cancelDrag, showToast, selectedId, deleteSelected]);

  const updateHoverFromEvent = useCallback((clientX: number, clientY: number) => {
    const board = boardRef.current;
    if (!board) return;
    const rect = board.getBoundingClientRect();
    const cell = screenToGrid(
      clientX - rect.left,
      clientY - rect.top,
      TILE_W,
      TILE_H
    );
    setHoverCell(cell);
  }, []);

  const buildingStyle = (b: PlacedBuilding): React.CSSProperties => {
    const def = getCatalogItem(b.typeId);
    if (!def) return {};
    const { w, h } = footprintSize(def, b.rotation);
    const left = b.col * TILE_W + (b.row % 2 === 0 ? 0 : TILE_W * 0.5);
    const top = b.row * (TILE_H * 0.5);
    const width = w * TILE_W - 4;
    const height = h * (TILE_H * 0.5) + (h - 1) * 8 + 24;
    return {
      left,
      top,
      width,
      height,
      background: `linear-gradient(160deg, ${def.accent} 0%, ${def.color} 100%)`,
    };
  };

  return (
    <div className="cd-root">
      <header className="cd-topbar">
        <div className="cd-resources">
          <div className="cd-res cd-res--metal">
            <span>⛏</span> Metal {resources.metal.toLocaleString('es-ES')}
          </div>
          <div className="cd-res cd-res--energy">
            <span>⚡</span> Energía {resources.energy.toLocaleString('es-ES')}
          </div>
          <div className="cd-res cd-res--crystal">
            <span>💎</span> Cristal {resources.crystal.toLocaleString('es-ES')}
          </div>
        </div>
        <div className="cd-actions">
          <button
            type="button"
            className="cd-btn cd-btn--danger"
            disabled={!selectedId}
            onClick={deleteSelected}
          >
            Eliminar edificio
          </button>
          <button type="button" className="cd-btn" onClick={handleReset}>
            Reiniciar demo
          </button>
        </div>
      </header>

      <div className="cd-body">
        <aside className="cd-sidebar">
          <h2>Edificios</h2>
          {BUILDING_CATALOG.map((item) => {
            const afford = canAfford(resources, item.cost);
            const atMax =
              item.maxOnMap != null &&
              countTypeOnMap(buildings, item.id) >= item.maxOnMap;
            const disabled = !afford || atMax;
            return (
              <button
                key={item.id}
                type="button"
                className={[
                  'cd-palette-item',
                  drag?.typeId === item.id ? 'cd-palette-item--active' : '',
                  disabled ? 'cd-palette-item--disabled' : '',
                ].join(' ')}
                disabled={disabled}
                onPointerDown={(e) => {
                  if (disabled) return;
                  e.preventDefault();
                  startDrag(item.id);
                }}
              >
                <div
                  className="cd-palette-icon"
                  style={{
                    background: `linear-gradient(135deg, ${item.accent}, ${item.color})`,
                  }}
                >
                  {item.icon}
                </div>
                <div className="cd-palette-meta">
                  <div className="cd-palette-name">{item.name}</div>
                  <div className="cd-palette-cost">{formatCost(item.cost)}</div>
                  {item.maxOnMap != null ? (
                    <div className="cd-palette-cost">
                      {countTypeOnMap(buildings, item.id)}/{item.maxOnMap} en mapa
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </aside>

        <main className="cd-board-wrap">
          <p className="cd-hints">
            Arrastra desde el panel · <kbd>R</kbd> rotar · <kbd>ESC</kbd> cancelar · Clic en
            edificio para seleccionar · <kbd>Supr</kbd> eliminar
          </p>
          <div
            ref={boardRef}
            className="cd-board"
            style={{
              width: GRID_COLS * TILE_W + TILE_W * 0.5,
              height: GRID_ROWS * (TILE_H * 0.5) + 60,
            }}
            onPointerMove={(e) => drag && updateHoverFromEvent(e.clientX, e.clientY)}
          >
            {Array.from({ length: GRID_ROWS }, (_, row) => (
              <div key={row} className="cd-iso-row">
                {Array.from({ length: GRID_COLS }, (_, col) => {
                  const key = cellKey(col, row);
                  const isGhost = previewKeys.has(key);
                  const ghostClass = isGhost
                    ? placementPreview?.valid
                      ? 'cd-iso-cell--valid'
                      : 'cd-iso-cell--invalid'
                    : '';
                  return (
                    <button
                      key={key}
                      type="button"
                      className={['cd-iso-cell', ghostClass].filter(Boolean).join(' ')}
                      aria-label={`Celda ${col},${row}`}
                      onPointerDown={(e) => {
                        if (!drag) return;
                        e.preventDefault();
                        placeAt(col, row);
                      }}
                    />
                  );
                })}
              </div>
            ))}

            {buildings.map((b) => {
              const def = getCatalogItem(b.typeId);
              if (!def) return null;
              return (
                <div
                  key={b.instanceId}
                  role="button"
                  tabIndex={0}
                  className={[
                    'cd-building',
                    selectedId === b.instanceId ? 'cd-building--selected' : '',
                  ].join(' ')}
                  style={buildingStyle(b)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(b.instanceId);
                    cancelDrag();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setSelectedId(b.instanceId);
                  }}
                >
                  <span>
                    {def.icon} {def.name}
                    <br />
                    <small>{b.rotation}°</small>
                  </span>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {toast ? <div className="cd-toast">{toast}</div> : null}
    </div>
  );
}
