'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Go2FleetFormation } from '@/components/game/go2/Go2FleetFormation';
import { Go2IconFrame } from '@/components/game/go2/Go2IconFrame';
import {
  defaultFleetSave,
  fleetPower,
  hullToCombatStats,
  loadFleetSave,
  saveFleetSave,
  type FleetSave,
} from '../combat/destockFleetStorage';
import { DestockGo2Shell } from '../components/DestockGo2Shell';
import { destockHasToken, loadFleets, type ApiFleet } from '../destockApi';

const FLEET_IDS = ['f1', 'f2', 'f3'] as const;

export function FleetsScreen() {
  const [save, setSave] = useState<FleetSave>(defaultFleetSave);
  const [selectedHull, setSelectedHull] = useState('frigate_t1');
  const [serverFleets, setServerFleets] = useState<ApiFleet[]>([]);

  useEffect(() => {
    setSave(loadFleetSave());
  }, []);

  // Logged in → show the player's REAL fleets from /api/fleets alongside the
  // local 9×9 formation editor (the editor stays local until the backend exposes
  // a formation-by-ship-id write contract).
  useEffect(() => {
    if (!destockHasToken()) return;
    let cancelled = false;
    void (async () => {
      try {
        const f = await loadFleets();
        if (!cancelled && Array.isArray(f)) setServerFleets(f);
      } catch {
        /* keep local only */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fleet = save.fleets[save.activeFleetId] ?? save.fleets.f1;
  const occupied = useMemo(() => new Set(fleet.slots.map((s) => s.cell)), [fleet.slots]);
  const power = fleetPower(fleet.slots);

  const persist = useCallback((next: FleetSave) => {
    setSave(next);
    saveFleetSave(next);
  }, []);

  const setFleetId = (id: string) => {
    persist({ ...save, activeFleetId: id });
  };

  const onCellClick = (cell: number) => {
    const slots = [...fleet.slots];
    const idx = slots.findIndex((s) => s.cell === cell);
    if (idx >= 0) {
      slots.splice(idx, 1);
    } else {
      slots.push({ cell, hullId: selectedHull });
    }
    persist({
      ...save,
      fleets: {
        ...save.fleets,
        [save.activeFleetId]: { ...fleet, slots },
      },
    });
  };

  const slotViews = useMemo(() => {
    const m = new Map<number, { hullId?: string }>();
    for (const s of fleet.slots) m.set(s.cell, { hullId: s.hullId });
    return m;
  }, [fleet.slots]);

  const selectedStats = hullToCombatStats(selectedHull);

  return (
    <DestockGo2Shell title="Flotas · Formación 9×9">
      <div className="go2-screen-layout go2-screen-layout--fleet">
        <div className="go2-panel">
          <div className="go2-panel-head">Flotas</div>
          <div className="go2-panel-body" style={{ padding: 0 }}>
            {FLEET_IDS.map((id) => {
              const f = save.fleets[id];
              return (
                <button
                  key={id}
                  type="button"
                  className={[
                    'go2-list-row',
                    save.activeFleetId === id ? 'go2-list-row--on' : '',
                  ].join(' ')}
                  style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }}
                  onClick={() => setFleetId(id)}
                >
                  <span>{f?.name ?? id}</span>
                  <span>{f?.slots.length ?? 0} naves</span>
                </button>
              );
            })}
          </div>
          {serverFleets.length > 0 ? (
            <div style={{ padding: '4px 8px' }}>
              <div className="go2-coords" style={{ fontSize: 9, marginBottom: 4 }}>
                Flotas en servidor
              </div>
              {serverFleets.map((f) => (
                <div key={f.id} className="go2-list-row" style={{ fontSize: 10 }}>
                  <span>{f.name}</span>
                  <span>{f.shipCount ?? 0} naves</span>
                </div>
              ))}
            </div>
          ) : null}
          <div style={{ padding: 8 }}>
            <Link href="/destock/combat?mission=1" className="go2-btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              Probar en combate
            </Link>
          </div>
        </div>
        <div className="go2-panel">
          <div className="go2-panel-head">{fleet.name}</div>
          <div className="go2-fleet-center">
            <p style={{ fontSize: 10, color: '#a8a29e' }}>
              Clic: colocar / quitar · Tipo de nave abajo
            </p>
            <Go2FleetFormation occupied={occupied} slotViews={slotViews} onCellClick={onCellClick} />
            <p className="go2-coords">Potencia: {power.toLocaleString('es-ES')}</p>
          </div>
        </div>
        <div className="go2-panel">
          <div className="go2-panel-head">Tipo de nave</div>
          <div className="go2-panel-body">
            {(['frigate_t1', 'frigate_t2'] as const).map((hid) => (
              <button
                key={hid}
                type="button"
                className={['go2-list-row', selectedHull === hid ? 'go2-list-row--on' : ''].join(' ')}
                style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }}
                onClick={() => setSelectedHull(hid)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Go2IconFrame icon="ship" size="sm" rarity="uncommon" />
                  {hullToCombatStats(hid).name}
                </span>
              </button>
            ))}
            <div className="go2-detail-stat" style={{ marginTop: 12 }}>
              <span>ATK</span>
              <span>{selectedStats.attack}</span>
            </div>
            <div className="go2-detail-stat">
              <span>DEF</span>
              <span>{selectedStats.defense}</span>
            </div>
            <div className="go2-detail-stat">
              <span>HP</span>
              <span>{selectedStats.hp}</span>
            </div>
            <p style={{ marginTop: 10, fontSize: 9, color: '#78716c' }}>
              La formación se usa automáticamente en /destock/combat
            </p>
          </div>
        </div>
      </div>
    </DestockGo2Shell>
  );
}
