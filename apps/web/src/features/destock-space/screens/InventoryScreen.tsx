'use client';

import { useEffect, useMemo, useState } from 'react';
import { Go2IconFrame } from '@/components/game/go2/Go2IconFrame';
import { DestockGo2Shell } from '../components/DestockGo2Shell';
import { INVENTORY_ITEMS, type DestockInventoryItem } from '../data/destockInventoryData';
import { destockHasToken } from '../destockApi';

const CAT_LABEL: Record<DestockInventoryItem['category'], string> = {
  resource: 'Recursos',
  module: 'Módulos',
  blueprint: 'Planos',
  consumable: 'Consumibles',
};

export function InventoryScreen() {
  const [tab, setTab] = useState<DestockInventoryItem['category'] | 'all'>('all');
  const [selected, setSelected] = useState(INVENTORY_ITEMS[0].id);
  const [allItems, setAllItems] = useState<DestockInventoryItem[]>(INVENTORY_ITEMS);

  // Logged in → mostrar el inventario REAL del jugador (GET /api/inventory devuelve
  // { id, name, category, qty, icon, rarity, description }, la misma forma que
  // DestockInventoryItem). Invitado → queda el catálogo de muestra.
  useEffect(() => {
    if (!destockHasToken()) return;
    let cancelled = false;
    void (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/inventory', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        const apiItems = json?.data?.items;
        if (cancelled || !Array.isArray(apiItems) || apiItems.length === 0) return;
        setAllItems(apiItems as DestockInventoryItem[]);
        setSelected(apiItems[0].id);
      } catch {
        /* mantener el catálogo de muestra */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => (tab === 'all' ? allItems : allItems.filter((i) => i.category === tab)),
    [tab, allItems]
  );
  const item = allItems.find((i) => i.id === selected) ?? filtered[0];

  return (
    <DestockGo2Shell title="Bóveda Orbital · Inventario">
      <div className="go2-screen-layout go2-screen-layout--galaxy">
        <div className="go2-panel">
          <div className="go2-market-tabs" style={{ flexWrap: 'wrap' }}>
            <button
              type="button"
              className={['go2-build-tab', tab === 'all' ? 'go2-build-tab--on' : ''].join(' ')}
              onClick={() => setTab('all')}
            >
              Todo
            </button>
            {(Object.keys(CAT_LABEL) as DestockInventoryItem['category'][]).map((c) => (
              <button
                key={c}
                type="button"
                className={['go2-build-tab', tab === c ? 'go2-build-tab--on' : ''].join(' ')}
                onClick={() => setTab(c)}
              >
                {CAT_LABEL[c]}
              </button>
            ))}
          </div>
          <div className="go2-panel-body">
            <div className="go2-inventory-grid">
              {filtered.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  className={['go2-inv-slot', selected === i.id ? 'go2-inv-slot--on' : ''].join(' ')}
                  onClick={() => setSelected(i.id)}
                >
                  <Go2IconFrame icon={i.icon} size="md" rarity={i.rarity} />
                  <span className="go2-inv-qty">×{i.qty.toLocaleString('es-ES')}</span>
                  <span className="go2-inv-name">{i.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="go2-panel">
          <div className="go2-panel-head">Detalle</div>
          <div className="go2-panel-body" style={{ textAlign: 'center' }}>
            {item ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Go2IconFrame icon={item.icon} size="xl" rarity={item.rarity} />
                </div>
                <p style={{ marginTop: 12, fontWeight: 800, color: '#fef3c7' }}>{item.name}</p>
                <p style={{ marginTop: 6, fontSize: 10, color: '#a8a29e' }}>{item.description}</p>
                <div className="go2-detail-stat" style={{ marginTop: 12 }}>
                  <span>Cantidad</span>
                  <span>{item.qty.toLocaleString('es-ES')}</span>
                </div>
                <div className="go2-detail-stat">
                  <span>Categoría</span>
                  <span>{CAT_LABEL[item.category]}</span>
                </div>
                <button type="button" className="go2-btn-primary">
                  Usar / Equipar
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </DestockGo2Shell>
  );
}
