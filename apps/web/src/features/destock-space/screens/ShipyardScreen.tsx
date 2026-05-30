'use client';

import { useState } from 'react';
import { Go2IconFrame } from '@/components/game/go2/Go2IconFrame';
import { DestockGo2Shell } from '../components/DestockGo2Shell';
import { useDestockShipyard } from '../useDestockShipyard';

const TABS = [
  { id: 'frigate', label: 'Fragatas' },
  { id: 'cruiser', label: 'Cruceros' },
  { id: 'battleship', label: 'Acorazados' },
] as const;

export function ShipyardScreen() {
  const { blueprints, inventory, activeJob, timeLabel, startBuild } = useDestockShipyard();
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('frigate');
  const [selected, setSelected] = useState(blueprints[0]?.id ?? '');

  const hull = blueprints.find((b) => b.id === selected) ?? blueprints[0];

  return (
    <DestockGo2Shell title="Doca de Forja · Astillero">
      {activeJob ? (
        <div className="go2-shipyard-queue go2-queue-panel">
          <div className="go2-queue-title">Cola de producción</div>
          <div className="go2-queue-slot">
            <div>{activeJob.name}</div>
            <div className="go2-queue-time">{timeLabel}</div>
          </div>
          <div className="go2-queue-slot go2-queue-slot--empty">Vacío</div>
        </div>
      ) : null}
      <div className="go2-screen-layout go2-screen-layout--triple">
        <div className="go2-panel">
          <div className="go2-market-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={['go2-build-tab', tab === t.id ? 'go2-build-tab--on' : ''].join(' ')}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="go2-panel-body" style={{ padding: 0 }}>
            {blueprints.map((b) => (
              <button
                key={b.id}
                type="button"
                className={['go2-list-row', selected === b.id ? 'go2-list-row--on' : ''].join(' ')}
                style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }}
                onClick={() => setSelected(b.id)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Go2IconFrame icon="ship" size="sm" rarity="uncommon" />
                  {b.name}
                </span>
                <span>x{inventory[b.id] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="go2-panel">
          <div className="go2-panel-head">{hull?.name ?? '—'}</div>
          <div className="go2-panel-body">
            {hull ? (
              <>
                <p style={{ fontSize: 10, color: '#a8a29e', marginBottom: 8 }}>{hull.description}</p>
                <div className="go2-build-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', padding: 0 }}>
                  {[
                    { l: 'Estructura', v: hull.stats.structure },
                    { l: 'Estabilidad', v: hull.stats.stability },
                    { l: 'Velocidad', v: hull.stats.speed },
                  ].map((s) => (
                    <div
                      key={s.l}
                      className="go2-build-item"
                      style={{ cursor: 'default' }}
                    >
                      <span style={{ fontWeight: 800 }}>{s.v}</span>
                      <span>{s.l}</span>
                    </div>
                  ))}
                </div>
                <div className="go2-detail-stat" style={{ marginTop: 12 }}>
                  <span>Metal</span>
                  <span>{hull.buildCost.metal?.toLocaleString('es-ES')}</span>
                </div>
                <div className="go2-detail-stat">
                  <span>He3</span>
                  <span>{hull.buildCost.plasma?.toLocaleString('es-ES')}</span>
                </div>
                <div className="go2-detail-stat">
                  <span>Créditos</span>
                  <span>{hull.buildCost.credits?.toLocaleString('es-ES')}</span>
                </div>
                <div className="go2-detail-stat">
                  <span>Tiempo</span>
                  <span>{hull.buildTimeMinutes} min</span>
                </div>
                <button
                  type="button"
                  className="go2-btn-primary"
                  disabled={!!activeJob}
                  onClick={() => hull && startBuild(hull)}
                >
                  Construir nave
                </button>
              </>
            ) : null}
          </div>
        </div>
        <div className="go2-panel">
          <div className="go2-panel-head">Inventario</div>
          <div className="go2-panel-body" style={{ padding: 0 }}>
            {blueprints.map((b) => (
              <div key={b.id} className="go2-list-row">
                <span>{b.name}</span>
                <span>x{inventory[b.id] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DestockGo2Shell>
  );
}
