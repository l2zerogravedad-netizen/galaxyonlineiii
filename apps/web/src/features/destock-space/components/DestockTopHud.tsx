'use client';

import type { EmpireProfile, Resources } from '../types';

const RES_KEYS = [
  { key: 'metal' as const, label: 'Metal', cls: 'ds-res--metal', icon: 'Fe' },
  { key: 'crystal' as const, label: 'Cristal', cls: 'ds-res--crystal', icon: '◆' },
  { key: 'energy' as const, label: 'Energía', cls: 'ds-res--energy', icon: '⚡' },
  { key: 'nova' as const, label: 'Nova', cls: 'ds-res--nova', icon: '✦' },
  { key: 'credits' as const, label: 'Créditos', cls: 'ds-res--credits', icon: '¤' },
];

export function DestockTopHud({
  empire,
  resources,
  notifCount,
  onNotifClick,
}: {
  empire: EmpireProfile;
  resources: Resources;
  notifCount: number;
  onNotifClick: () => void;
}) {
  return (
    <header className="ds-top-hud">
      <div className="ds-empire">
        <div className="ds-avatar" aria-hidden>
          {empire.tag}
        </div>
        <div>
          <div className="ds-empire-name">{empire.name}</div>
          <div className="ds-empire-meta">
            Nv.{empire.level} · {empire.xp.toLocaleString('es-ES')}/{empire.xpMax} XP
          </div>
        </div>
      </div>
      <div className="ds-resources">
        {RES_KEYS.map((r) => (
          <div key={r.key} className={`ds-res ${r.cls}`} title={r.label}>
            <span className="ds-res-icon">{r.icon}</span>
            <span>{resources[r.key].toLocaleString('es-ES')}</span>
          </div>
        ))}
      </div>
      <button type="button" className="ds-notif-btn" onClick={onNotifClick}>
        Alertas
        {notifCount > 0 ? <span className="ds-notif-badge">{notifCount}</span> : null}
      </button>
    </header>
  );
}
