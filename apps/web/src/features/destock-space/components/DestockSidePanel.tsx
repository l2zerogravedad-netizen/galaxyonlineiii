'use client';

import { getSpec } from '../catalog';
import type { BuildJob, PlacedStructure } from '../types';

function formatTime(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, '0')).join(':');
}

export function DestockSidePanel({
  queue,
  now,
  selected,
  onCancelJob,
  onUpgrade,
  onDelete,
  onReset,
}: {
  queue: BuildJob[];
  now: number;
  selected: PlacedStructure | null;
  onCancelJob: (id: string) => void;
  onUpgrade: () => void;
  onDelete: () => void;
  onReset: () => void;
}) {
  return (
    <aside className="ds-panel ds-panel-right">
      <div className="ds-panel-head">Cola · Acciones</div>
      <div className="ds-panel-body">
        <p style={{ fontSize: 10, color: 'var(--ds-muted)', marginBottom: 8 }}>
          Cola de construcción ({queue.length}/5)
        </p>
        {queue.length === 0 ? (
          <p style={{ fontSize: 10, fontStyle: 'italic', color: 'var(--ds-muted)' }}>Sin trabajos activos</p>
        ) : (
          queue.map((j, i) => {
            const spec = getSpec(j.buildingId);
            const left = j.startedAt + j.durationMs - now;
            const prog = Math.min(100, ((now - j.startedAt) / j.durationMs) * 100);
            return (
              <div key={j.jobId} className="ds-queue-item">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    {i + 1}. {spec?.name ?? j.buildingId} Nv.{j.targetLevel}
                  </span>
                  <span style={{ color: 'var(--ds-accent)', fontFamily: 'monospace' }}>
                    {formatTime(left)}
                  </span>
                </div>
                <div className="ds-bar" style={{ width: '100%', marginTop: 4 }}>
                  <div className="ds-bar-fill" style={{ width: `${prog}%` }} />
                </div>
                <button
                  type="button"
                  className="ds-btn ds-btn--danger"
                  style={{ marginTop: 6, padding: 4 }}
                  onClick={() => onCancelJob(j.jobId)}
                >
                  Cancelar
                </button>
              </div>
            );
          })
        )}

        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--ds-border)' }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--ds-accent)' }}>Módulo seleccionado</p>
          {selected ? (
            <>
              <p style={{ fontSize: 11, marginTop: 6 }}>
                {getSpec(selected.buildingId)?.name} · Nv.{selected.level}
              </p>
              <div className="ds-action-row">
                <button type="button" className="ds-btn" onClick={onUpgrade}>
                  Mejorar
                </button>
                <button type="button" className="ds-btn ds-btn--danger" onClick={onDelete}>
                  Desmontar
                </button>
              </div>
            </>
          ) : (
            <p style={{ fontSize: 10, color: 'var(--ds-muted)', marginTop: 6 }}>
              Clic en un módulo del sector
            </p>
          )}
        </div>

        <button type="button" className="ds-btn ds-btn--ghost" style={{ marginTop: 12 }} onClick={onReset}>
          Reiniciar sector demo
        </button>
      </div>
    </aside>
  );
}
