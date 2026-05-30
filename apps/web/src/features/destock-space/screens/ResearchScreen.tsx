'use client';

import { useMemo, useState } from 'react';
import { DestockGo2Shell } from '../components/DestockGo2Shell';
import { useDestockResearch } from '../useDestockResearch';

export function ResearchScreen() {
  const { techs, categories, activeTech, timeLabel, startResearch } = useDestockResearch();
  const cats = useMemo(() => [...new Set(techs.map((t) => t.category))], [techs]);
  const [tab, setTab] = useState(cats[0] ?? 'PRODUCTION');
  const [selected, setSelected] = useState(techs[0]?.id ?? '');

  const tech = techs.find((t) => t.id === selected) ?? techs.filter((t) => t.category === tab)[0];
  const filtered = techs.filter((t) => t.category === tab);

  return (
    <DestockGo2Shell title="Nexo Cognitivo · Investigación">
      {activeTech && timeLabel ? (
        <div className="go2-shipyard-queue go2-queue-panel">
          <div className="go2-queue-title">Investigación</div>
          <div className="go2-queue-slot">
            <div>
              {activeTech.name} Nv.{activeTech.level + 1}
            </div>
            <div className="go2-queue-time">{timeLabel}</div>
          </div>
        </div>
      ) : null}
      <div className="go2-screen-layout go2-screen-layout--triple">
        <div className="go2-panel">
          <div className="go2-market-tabs" style={{ flexWrap: 'wrap' }}>
            {cats.map((c) => (
              <button
                key={c}
                type="button"
                className={['go2-build-tab', tab === c ? 'go2-build-tab--on' : ''].join(' ')}
                onClick={() => setTab(c)}
              >
                {categories[c] ?? c}
              </button>
            ))}
          </div>
          <div className="go2-panel-body" style={{ padding: 0 }}>
            {filtered.map((t) => (
              <button
                key={t.id}
                type="button"
                className={['go2-list-row', selected === t.id ? 'go2-list-row--on' : ''].join(' ')}
                style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }}
                onClick={() => setSelected(t.id)}
              >
                <span>{t.name}</span>
                <span>
                  {t.level}/{t.maxLevel}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="go2-panel">
          <div className="go2-panel-head">{tech?.name ?? '—'}</div>
          <div className="go2-panel-body">
            {tech ? (
              <>
                <div className="go2-detail-stat">
                  <span>Nivel actual</span>
                  <span>
                    {tech.level} / {tech.maxLevel}
                  </span>
                </div>
                <div className="go2-detail-stat">
                  <span>Metal</span>
                  <span>{tech.metal.toLocaleString('es-ES')}</span>
                </div>
                <div className="go2-detail-stat">
                  <span>He3</span>
                  <span>{tech.plasma.toLocaleString('es-ES')}</span>
                </div>
                <div className="go2-detail-stat">
                  <span>Tiempo</span>
                  <span>{tech.timeSec}s</span>
                </div>
                <button
                  type="button"
                  className="go2-btn-primary"
                  disabled={!!activeTech || tech.level >= tech.maxLevel}
                  onClick={() => startResearch(tech)}
                >
                  Investigar
                </button>
              </>
            ) : null}
          </div>
        </div>
        <div className="go2-panel">
          <div className="go2-panel-head">Árbol</div>
          <div className="go2-panel-body">
            {techs.map((t) => (
              <div key={t.id} className="go2-detail-stat">
                <span>{t.name}</span>
                <span>
                  Nv.{t.level}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DestockGo2Shell>
  );
}
