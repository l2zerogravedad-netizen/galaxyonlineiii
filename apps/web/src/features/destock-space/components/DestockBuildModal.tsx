'use client';

import { useMemo, useState } from 'react';
import { X, Hammer } from 'lucide-react';
import { BUILD_TABS, getSpec, specsForTab } from '../catalog';
import { countType } from '../gridUtils';
import { StructureGlyph } from '../StructureGlyph';
import type { BuildJob, BuildingId, BuildTabId, PlacedStructure } from '../types';

export function DestockBuildModal({
  open,
  onClose,
  onPick,
  structures,
  queue,
  isUnlocked,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (id: BuildingId) => void;
  structures: PlacedStructure[];
  queue: BuildJob[];
  isUnlocked: (id: BuildingId) => boolean;
}) {
  const [tab, setTab] = useState<BuildTabId>('produccion');
  const items = useMemo(() => specsForTab(tab), [tab]);

  if (!open) return null;

  return (
    <div className="ds-video-build-overlay" role="dialog" aria-label="Construcción DESTOCK">
      <div className="ds-video-build-dialog">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            borderBottom: '1px solid #164e63',
          }}
        >
          <h2
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              fontWeight: 800,
              color: '#67e8f9',
              textTransform: 'uppercase',
            }}
          >
            <Hammer className="h-5 w-5" /> Construcción
          </h2>
          <button type="button" onClick={onClose} style={{ color: '#94a3b8' }} aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="ds-video-build-tabs">
          {BUILD_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={['ds-video-build-tab', tab === t.id ? 'ds-video-build-tab--on' : ''].join(
                ' '
              )}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="ds-video-build-grid">
          {items.map((spec) => {
            const built = countType(spec.id, structures, queue);
            const max = spec.maxOnBase;
            const locked = !isUnlocked(spec.id);
            const cap = built >= max;
            return (
              <button
                key={spec.id}
                type="button"
                disabled={locked || cap}
                className="ds-video-build-item"
                onClick={() => {
                  onPick(spec.id);
                  onClose();
                }}
              >
                <div style={{ width: 48, height: 32 }}>
                  <StructureGlyph id={spec.id} className="ds-glyph" />
                </div>
                <span style={{ textAlign: 'center', fontWeight: 700, lineHeight: 1.2 }}>
                  {spec.name}
                </span>
                <span style={{ color: '#fbbf24', fontFamily: 'monospace' }}>
                  {built}/{max >= 99 ? '∞' : max}
                </span>
                {locked ? <span style={{ color: '#f87171', fontSize: 9 }}>🔒</span> : null}
              </button>
            );
          })}
        </div>
        <p
          style={{
            padding: '8px 12px',
            textAlign: 'center',
            fontSize: 10,
            color: '#64748b',
            borderTop: '1px solid #1e293b',
          }}
        >
          Elige módulo y pulsa una celda libre en el planeta (como en GO II)
        </p>
      </div>
    </div>
  );
}
