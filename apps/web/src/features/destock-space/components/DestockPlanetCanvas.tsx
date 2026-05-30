'use client';

import { useMemo, useRef, useState } from 'react';
import { GRID_COLS, GRID_ROWS, TILE_H, TILE_W, getSpec } from '../catalog';
import {
  canPlace,
  cellKey,
  cellsForPlacement,
  footprintSize,
  occupancy,
  screenToGrid,
} from '../gridUtils';
import { BOARD_H, BOARD_W, rectFor, rectForStructure } from '../layoutUtils';
import { StructureGlyph } from '../StructureGlyph';
import type {
  BuildJob,
  BuildingId,
  DragState,
  GridCell,
  PlacedStructure,
  Rotation,
} from '../types';

export function DestockPlanetCanvas({
  structures,
  queue,
  selectedInstance,
  onSelectInstance,
  drag,
  onHoverCell,
  hoverCell,
  onDropAt,
  previewValid,
  now,
}: {
  structures: PlacedStructure[];
  queue: BuildJob[];
  selectedInstance: string | null;
  onSelectInstance: (id: string | null) => void;
  drag: DragState | null;
  onHoverCell: (cell: GridCell | null) => void;
  hoverCell: GridCell | null;
  onDropAt: (col: number, row: number) => void;
  previewValid: boolean;
  now: number;
}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.82);
  const [panning, setPanning] = useState(false);
  const panRef = useRef({ x: 0, y: 0, px: 0, py: 0 });

  const occ = useMemo(() => occupancy(structures, queue), [structures, queue]);

  const preview = useMemo(() => {
    if (!drag || !hoverCell) return null;
    const spec = getSpec(drag.buildingId);
    if (!spec) return null;
    const { w, h } = footprintSize(spec, drag.rotation);
    return {
      cells: cellsForPlacement(hoverCell.col, hoverCell.row, w, h),
      spec,
    };
  }, [drag, hoverCell]);

  const previewKeys = useMemo(
    () => new Set(preview?.cells.map((c) => cellKey(c.col, c.row)) ?? []),
    [preview]
  );

  const updateHover = (clientX: number, clientY: number) => {
    const board = boardRef.current;
    if (!board) return;
    const rect = board.getBoundingClientRect();
    onHoverCell(screenToGrid(clientX - rect.left, clientY - rect.top, TILE_W, TILE_H));
  };

  return (
    <div
      className={['ds-planet-viewport', panning ? 'ds-planet-viewport--drag' : ''].join(' ')}
      onWheel={(e) => {
        e.preventDefault();
        setZoom((z) => Math.max(0.45, Math.min(1.3, z + (e.deltaY > 0 ? -0.06 : 0.06))));
      }}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest('.ds-iso-cell, .ds-structure, .ds-ghost')) return;
        setPanning(true);
        panRef.current = { x: pan.x, y: pan.y, px: e.clientX, py: e.clientY };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (panning) {
          setPan({
            x: panRef.current.x + e.clientX - panRef.current.px,
            y: panRef.current.y + e.clientY - panRef.current.py,
          });
        }
        updateHover(e.clientX, e.clientY);
      }}
      onPointerUp={() => setPanning(false)}
      onPointerLeave={() => onHoverCell(null)}
    >
      <div className="ds-planet-bg" aria-hidden />
      <div
        className="ds-planet-stage"
        style={{
          transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
        }}
      >
        <div ref={boardRef} className="ds-board" style={{ width: BOARD_W, height: BOARD_H }}>
          {Array.from({ length: GRID_ROWS }, (_, row) => (
            <div key={row} className="ds-iso-row">
              {Array.from({ length: GRID_COLS }, (_, col) => {
                const key = cellKey(col, row);
                const cls = [
                  'ds-iso-cell',
                  previewKeys.has(key)
                    ? previewValid
                      ? 'ds-iso-cell--ok'
                      : 'ds-iso-cell--bad'
                    : hoverCell?.col === col && hoverCell?.row === row
                      ? 'ds-iso-cell--hover'
                      : '',
                ].join(' ');
                return (
                  <button
                    key={key}
                    type="button"
                    className={cls}
                    onPointerDown={() => drag && onDropAt(col, row)}
                  />
                );
              })}
            </div>
          ))}

          {queue
            .filter((j) => j.mode === 'build')
            .map((j) => {
              const spec = getSpec(j.buildingId);
              if (!spec) return null;
              const prog = Math.min(1, (now - j.startedAt) / j.durationMs);
              return (
                <div key={j.jobId} className="ds-scaffold" style={rectFor(j.col, j.row, spec, j.rotation)}>
                  <StructureGlyph id={j.buildingId} className="ds-glyph" />
                  <div className="ds-bar">
                    <div className="ds-bar-fill" style={{ width: `${prog * 100}%` }} />
                  </div>
                </div>
              );
            })}

          {drag && preview && hoverCell ? (
            <div
              className={['ds-ghost', previewValid ? '' : 'ds-ghost--bad'].join(' ')}
              style={rectFor(hoverCell.col, hoverCell.row, preview.spec, drag.rotation)}
            >
              <StructureGlyph id={drag.buildingId} className="ds-glyph" />
            </div>
          ) : null}

          {structures.map((s) => {
            const isNew = s.spawnAt && now - s.spawnAt < 600;
            const upgrading = queue.some(
              (j) => j.mode === 'upgrade' && j.instanceId === s.instanceId
            );
            return (
              <div
                key={s.instanceId}
                role="button"
                tabIndex={0}
                className={[
                  'ds-structure',
                  selectedInstance === s.instanceId ? 'ds-structure--selected' : '',
                  isNew ? 'ds-structure--spawn' : '',
                ].join(' ')}
                style={rectForStructure(s)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectInstance(s.instanceId);
                }}
              >
                <StructureGlyph id={s.buildingId} className="ds-glyph" />
                <span style={{ fontSize: 9, fontWeight: 800 }}>Nv.{s.level}</span>
                {upgrading ? (
                  <div className="ds-bar">
                    <div className="ds-bar-fill" style={{ width: '45%' }} />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
