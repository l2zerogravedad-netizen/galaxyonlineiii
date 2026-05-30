'use client';

import { useEffect, useState } from 'react';
import { MAX_QUEUE } from '../catalog';
import { getSpec } from '../catalog';
import type { BuildJob } from '../types';

function formatTime(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, '0')).join(':');
}

export function DestockVideoQueue({
  queue,
  now,
  onCancel,
}: {
  queue: BuildJob[];
  now: number;
  onCancel: (jobId: string) => void;
}) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const slots: (BuildJob | null)[] = [];
  for (let i = 0; i < MAX_QUEUE; i++) slots.push(queue[i] ?? null);

  return (
    <aside className="ds-video-queue" aria-label="Cola de construcción">
      <p className="ds-video-queue-title">Cola de construcción</p>
      {slots.map((job, idx) =>
        job ? (
          <div key={job.jobId} className="ds-video-queue-slot">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span>
                {getSpec(job.buildingId)?.name} Nv.{job.targetLevel}
              </span>
              <span className="ds-video-queue-time">
                {formatTime(job.startedAt + job.durationMs - now)}
              </span>
            </div>
            <div className="ds-video-build-bar" style={{ position: 'relative', marginTop: 4 }}>
              <div
                className="ds-video-build-bar-fill"
                style={{
                  width: `${Math.min(100, ((now - job.startedAt) / job.durationMs) * 100)}%`,
                }}
              />
            </div>
            <button
              type="button"
              style={{
                marginTop: 4,
                fontSize: 9,
                color: '#f87171',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => onCancel(job.jobId)}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div key={`e-${idx}`} className="ds-video-queue-slot" style={{ color: '#64748b', fontStyle: 'italic' }}>
            [{idx + 1}] Vacío
          </div>
        )
      )}
    </aside>
  );
}
