'use client';

import { useEffect, useState } from 'react';
import {
  GO2_CONSTRUCTION_QUEUE_SIZE,
  type Go2ConstructionQueueItemDto,
} from '@galaxy/shared';

function formatTime(endsAt: string | null): string {
  if (!endsAt) return '--:--:--';
  const ms = new Date(endsAt).getTime() - Date.now();
  if (ms <= 0) return '00:00:00';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, '0')).join(':');
}

export function Go2ConstructionQueue({
  items,
}: {
  items: Go2ConstructionQueueItemDto[];
}) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const slots: (Go2ConstructionQueueItemDto | null)[] = [];
  for (let i = 0; i < GO2_CONSTRUCTION_QUEUE_SIZE; i++) {
    slots.push(items[i] ?? null);
  }

  return (
    <aside className="go2-queue-panel" aria-label="Cola de construcción">
      <p className="go2-queue-title">Cola de construcción</p>
      {slots.map((item, idx) =>
        item ? (
          <div key={item.id} className="go2-queue-slot">
            <div>
              {item.buildingName} Nv.{item.targetLevel}
            </div>
            <div className="go2-build-bar mt-1">
              <div
                className="go2-build-bar-fill"
                style={{ width: `${item.progressPct}%` }}
              />
            </div>
            <span className="go2-queue-time">{formatTime(item.endsAt)}</span>
          </div>
        ) : (
          <div key={`empty-${idx}`} className="go2-queue-slot go2-queue-slot--empty">
            [{idx + 1}] Vacío
          </div>
        )
      )}
    </aside>
  );
}
