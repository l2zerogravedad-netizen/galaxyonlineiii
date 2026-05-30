'use client';

import { getSpec } from '../catalog';
import type { BuildingId, PlacedStructure, Resources } from '../types';

function fmt(n: number) {
  return n.toLocaleString('es-ES');
}

export function DestockSlotPanel({
  pendingId,
  pendingCell,
  selected,
  resources,
  onBuild,
  onUpgrade,
  onDelete,
}: {
  pendingId: BuildingId | null;
  pendingCell: { col: number; row: number } | null;
  selected: PlacedStructure | null;
  resources: Resources;
  onBuild: () => void;
  onUpgrade: () => void;
  onDelete: () => void;
}) {
  if (pendingId && pendingCell) {
    const spec = getSpec(pendingId);
    if (!spec) return null;
    return (
      <div className="ds-video-slot-panel">
        <p style={{ fontWeight: 800, color: '#67e8f9' }}>{spec.name}</p>
        <p style={{ marginTop: 4, color: '#94a3b8' }}>
          Celda {pendingCell.col + 1},{pendingCell.row + 1} · {spec.buildSeconds}s
        </p>
        <p style={{ marginTop: 6, fontSize: 10, color: '#64748b' }}>
          Metal {fmt(spec.cost.metal)} · Cristal {fmt(spec.cost.crystal)} · Créd.{' '}
          {fmt(spec.cost.credits)}
        </p>
        <button
          type="button"
          className="ds-btn"
          style={{ marginTop: 10 }}
          onClick={onBuild}
        >
          Construir
        </button>
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="ds-video-slot-panel">
        <p style={{ fontWeight: 800, color: '#fcd34d' }}>Sector base</p>
        <p style={{ marginTop: 6, color: '#94a3b8', fontSize: 10 }}>
          Martillo → elige módulo → clic en celda libre. <kbd>R</kbd> rotar preview.
        </p>
        <p style={{ marginTop: 8, fontSize: 10, color: '#64748b' }}>
          Almacén: {fmt(resources.metal)} metal · {fmt(resources.crystal)} cristal
        </p>
      </div>
    );
  }

  const spec = getSpec(selected.buildingId);
  return (
    <div className="ds-video-slot-panel">
      <p style={{ fontWeight: 800, color: '#fcd34d' }}>
        {spec?.name} <span style={{ color: '#67e8f9' }}>Nv.{selected.level}</span>
      </p>
      <p style={{ marginTop: 6, fontSize: 10, color: '#94a3b8' }}>{spec?.description}</p>
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        <button type="button" className="ds-btn" onClick={onUpgrade}>
          Mejorar
        </button>
        <button type="button" className="ds-btn ds-btn--danger" onClick={onDelete}>
          Desmontar
        </button>
      </div>
    </div>
  );
}
