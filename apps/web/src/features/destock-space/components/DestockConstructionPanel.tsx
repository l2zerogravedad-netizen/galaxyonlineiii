'use client';

import { useMemo } from 'react';
import { hasGlbBuilding } from '@/lib/buildingGlbAssets';
import { BUILD_TABS, getSpec, specsForTab } from '../catalog';
import { countType } from '../gridUtils';
import { StructureGlyph } from '../StructureGlyph';
import type { BuildJob, BuildingId, BuildTabId, PlacedStructure, Resources } from '../types';

function fmtCost(c: Resources): string {
  const p: string[] = [];
  if (c.metal) p.push(`${c.metal} Fe`);
  if (c.crystal) p.push(`${c.crystal} Cr`);
  if (c.energy) p.push(`${c.energy} En`);
  if (c.nova) p.push(`${c.nova} Nv`);
  if (c.credits) p.push(`${c.credits} ¤`);
  return p.join(' · ');
}

export function DestockConstructionPanel({
  tab,
  onTab,
  selectedId,
  onSelect,
  structures,
  queue,
  canAfford,
  isUnlocked,
  onConfirmPlace,
  pendingCell,
}: {
  tab: BuildTabId;
  onTab: (t: BuildTabId) => void;
  selectedId: BuildingId | null;
  onSelect: (id: BuildingId) => void;
  structures: PlacedStructure[];
  queue: BuildJob[];
  canAfford: (c: Resources) => boolean;
  isUnlocked: (id: BuildingId) => boolean;
  onConfirmPlace: () => void;
  pendingCell: boolean;
}) {
  const items = useMemo(() => specsForTab(tab), [tab]);
  const sel = selectedId ? getSpec(selectedId) : null;

  return (
    <aside className="ds-panel ds-panel-left">
      <div className="ds-panel-head">Módulos · Construcción</div>
      <div className="ds-build-tabs">
        {BUILD_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={['ds-build-tab', tab === t.id ? 'ds-build-tab--on' : ''].join(' ')}
            onClick={() => onTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="ds-panel-body">
        <div className="ds-build-list">
          {items.map((spec) => {
            const built = countType(spec.id, structures, queue);
            const locked = !isUnlocked(spec.id);
            const cap = built >= spec.maxOnBase;
            const afford = canAfford(spec.cost);
            const off = locked || cap || !afford;
            return (
              <button
                key={spec.id}
                type="button"
                className={[
                  'ds-build-card',
                  selectedId === spec.id ? 'ds-build-card--on' : '',
                  off ? 'ds-build-card--off' : '',
                ].join(' ')}
                disabled={off}
                onPointerDown={(e) => {
                  if (off) return;
                  e.preventDefault();
                  onSelect(spec.id);
                }}
              >
                <div style={{ width: 48, height: 32 }}>
                  <StructureGlyph id={spec.id} className="ds-glyph" />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800 }}>
                    {spec.name}
                    {hasGlbBuilding(spec.id) ? (
                      <span style={{ marginLeft: 6, color: 'var(--ds-accent)', fontSize: 9 }}>
                        3D GLB
                      </span>
                    ) : null}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--ds-muted)' }}>
                    {spec.footprint.w}×{spec.footprint.h} · {built}/
                    {spec.maxOnBase >= 99 ? '∞' : spec.maxOnBase}
                  </div>
                  {locked ? (
                    <div style={{ fontSize: 9, color: 'var(--ds-warn)' }}>🔒 {spec.unlock?.label}</div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
        {sel ? (
          <div className="ds-build-detail">
            <strong>{sel.name}</strong>
            <p style={{ marginTop: 4, color: 'var(--ds-muted)' }}>{sel.description}</p>
            <p>Coste: {fmtCost(sel.cost)}</p>
            <p>Tiempo: {sel.buildSeconds}s</p>
            <p>Arrastra al sector o confirma celda seleccionada.</p>
            <button
              type="button"
              className="ds-btn"
              disabled={!pendingCell}
              onClick={onConfirmPlace}
            >
              Confirmar construcción
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
