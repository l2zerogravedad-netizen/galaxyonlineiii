'use client';

import type { ResourcesData } from '../types';

const RES = [
  { key: 'credits' as const, label: 'Créditos', icon: '🪙', bg: 'linear-gradient(135deg,#fbbf24,#b45309)' },
  { key: 'metal' as const, label: 'Metal', icon: '⛏', bg: 'linear-gradient(135deg,#ef4444,#991b1b)' },
  { key: 'plasma' as const, label: 'He3', icon: '💎', bg: 'linear-gradient(135deg,#38bdf8,#1d4ed8)' },
  { key: 'premium' as const, label: 'Premium', icon: '💚', bg: 'linear-gradient(135deg,#4ade80,#15803d)' },
];

export function Go2ResourceHud({ resources }: { resources: ResourcesData }) {
  const values: Record<string, number> = {
    metal: resources.metal,
    credits: resources.credits,
    plasma: resources.plasma,
    premium: 0,
  };

  return (
    <div className="go2-hud-resources" role="region" aria-label="Recursos">
      {RES.map((r) => (
        <div key={r.key} className="go2-res-pill" title={r.label}>
          <div className="go2-res-icon" style={{ background: r.bg }}>
            {r.icon}
          </div>
          <span className="go2-res-val">{values[r.key]?.toLocaleString('es-ES') ?? '0'}</span>
        </div>
      ))}
    </div>
  );
}
