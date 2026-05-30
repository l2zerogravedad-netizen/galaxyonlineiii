'use client';

import { useMemo } from 'react';
import { GRID_COLS, GRID_ROWS, TILE_H, TILE_W, getSpec } from '../catalog';
import {
  cellKey,
  cellsForPlacement,
  footprintSize,
  screenToGrid,
} from '../gridUtils';
import { BOARD_H, BOARD_W, rectFor, rectForStructure } from '../layoutUtils';
import { StructureGlyph } from '../StructureGlyph';
import type {
  BuildJob,
  DragState,
  GridCell,
  PlacedStructure,
} from '../types';

export function DestockVideoGrid({
  structures,
  queue,
  drag,
  hoverCell,
  targetCell,
  previewValid,
  selectedInstance,
  onSelectInstance,
  onCellClick,
  onHover,
  now,
}: {
  structures: PlacedStructure[];
  queue: BuildJob[];
  drag: DragState | null;
  hoverCell: GridCell | null;
  targetCell: GridCell | null;
  previewValid: boolean;
  selectedInstance: string | null;
  onSelectInstance: (id: string | null) => void;
  onCellClick: (col: number, row: number) => void;
  onHover: (cell: GridCell | null) => void;
  now: number;
}) {
  const previewKeys = useMemo(() => {
    if (!drag || !hoverCell) return new Set<string>();
    const spec = getSpec(drag.buildingId);
    if (!spec) return new Set<string>();
    const { w, h } = footprintSize(spec, drag.rotation);
    return new Set(
      cellsForPlacement(hoverCell.col, hoverCell.row, w, h).map((c) => cellKey(c.col, c.row))
    );
  }, [drag, hoverCell]);

  return (
    <div
      className="ds-video-terrain"
      onPointerMove={(e) => {
        const board = e.currentTarget.querySelector('.ds-video-board');
        if (!board) return;
        const rect = board.getBoundingClientRect();
        onHover(
          screenToGrid(e.clientX - rect.left, e.clientY - rect.top, TILE_W, TILE_H)
        );
      }}
      onPointerLeave={() => onHover(null)}
    >
      <div className="ds-video-board" style={{ width: BOARD_W, height: BOARD_H }}>
        {Array.from({ length: GRID_ROWS }, (_, row) => (
          <div key={row} className="ds-video-iso-row">
            {Array.from({ length: GRID_COLS }, (_, col) => {
              const key = cellKey(col, row);
              const isTarget =
                targetCell?.col === col && targetCell?.row === row && drag;
              const ghost = previewKeys.has(key);
              const cls = [
                'ds-video-tile',
                'ds-video-tile--grid',
                isTarget ? 'ds-video-tile--target' : '',
                ghost
                  ? previewValid
                    ? 'ds-video-tile--ghost-ok'
                    : 'ds-video-tile--ghost-bad'
                  : '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <button
                  key={key}
                  type="button"
                  className={cls}
                  onClick={() => onCellClick(col, row)}
                >
                  {isTarget ? <span className="ds-video-pending-q">?</span> : null}
                </button>
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
              <div
                key={j.jobId}
                className="ds-video-structure"
                style={rectFor(j.col, j.row, spec, j.rotation)}
              >
                <StructureGlyph id={j.buildingId} className="ds-glyph" />
                <div className="ds-video-build-bar">
                  <div className="ds-video-build-bar-fill" style={{ width: `${prog * 100}%` }} />
                </div>
              </div>
            );
          })}

        {drag && hoverCell && previewValid ? (
          <div
            className="ds-video-ghost"
            style={rectFor(
              hoverCell.col,
              hoverCell.row,
              getSpec(drag.buildingId)!,
              drag.rotation
            )}
          >
            <StructureGlyph id={drag.buildingId} className="ds-glyph" />
          </div>
        ) : null}

        {structures.map((s) => {
          const spec = getSpec(s.buildingId);
          const upgrading = queue.some(
            (j) => j.mode === 'upgrade' && j.instanceId === s.instanceId
          );
          return (
            <div
              key={s.instanceId}
              className={[
                'ds-video-structure',
                selectedInstance === s.instanceId ? 'ds-video-structure--sel' : '',
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
                <div className="ds-video-build-bar">
                  <div className="ds-video-build-bar-fill" style={{ width: '40%' }} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
