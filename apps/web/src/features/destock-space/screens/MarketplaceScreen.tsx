'use client';

import { useMemo, useState } from 'react';
import { Go2IconFrame } from '@/components/game/go2/Go2IconFrame';
import type { Go2IconName } from '@/components/game/go2/Go2Icons';
import { DestockGo2Shell } from '../components/DestockGo2Shell';
import { useDestockShared } from '../useDestockShared';

type MarketTab = 'buy' | 'sell';

const LISTINGS: {
  id: string;
  name: string;
  res: Go2IconName;
  qty: number;
  price: number;
  seller: string;
}[] = [
  { id: 'm1', name: 'Lote Metal x5000', res: 'metal', qty: 5000, price: 1200, seller: 'Comerciante-47' },
  { id: 'm2', name: 'Cristal x2000', res: 'plasma', qty: 2000, price: 2400, seller: 'Orion Trade' },
  { id: 'm3', name: 'Créditos x10000', res: 'credits', qty: 10000, price: 800, seller: 'Banco Sector' },
  { id: 'm4', name: 'Módulo escudo T1', res: 'shield', qty: 1, price: 4500, seller: 'Arsenal DSX' },
];

export function MarketplaceScreen() {
  const { resources, spend, showToast } = useDestockShared();
  const [tab, setTab] = useState<MarketTab>('buy');
  const [selected, setSelected] = useState<string>(LISTINGS[0].id);

  const item = useMemo(() => LISTINGS.find((l) => l.id === selected) ?? LISTINGS[0], [selected]);

  const handleTrade = () => {
    // No market endpoint exists on the backend yet. For a logged-in player the HUD is
    // server-owned (polls /api/empire), so a local spend would just snap back in 5s and
    // nothing would actually be bought — misleading. Be honest there; let guests trade
    // in their local sandbox.
    let isGuest = true;
    try {
      isGuest = !localStorage.getItem('token');
    } catch {
      /* treat as guest */
    }
    if (tab === 'buy') {
      if (!isGuest) {
        showToast(`${item.name}: mercado en servidor próximamente`);
        return;
      }
      if (!spend({ metal: 0, plasma: 0, credits: item.price })) return;
      showToast(`Comprado: ${item.name}`);
    } else {
      showToast('Publicación de venta (demo)');
    }
  };

  return (
    <DestockGo2Shell title="Mercado galáctico">
      <div className="go2-screen-layout go2-screen-layout--triple">
        <div className="go2-panel">
          <div className="go2-panel-head">Categorías</div>
          <div className="go2-panel-body" style={{ padding: 0 }}>
            {(
              [
                { label: 'Recursos', icon: 'metal' as const },
                { label: 'Componentes', icon: 'module' as const },
                { label: 'Naves', icon: 'ship' as const },
                { label: 'Módulos', icon: 'shield' as const },
              ] as const
            ).map((c) => (
              <div key={c.label} className="go2-list-row">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Go2IconFrame icon={c.icon} size="sm" rarity="common" />
                  {c.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="go2-panel">
          <div className="go2-market-tabs">
            <button
              type="button"
              className={['go2-build-tab', tab === 'buy' ? 'go2-build-tab--on' : ''].join(' ')}
              onClick={() => setTab('buy')}
            >
              Comprar
            </button>
            <button
              type="button"
              className={['go2-build-tab', tab === 'sell' ? 'go2-build-tab--on' : ''].join(' ')}
              onClick={() => setTab('sell')}
            >
              Vender
            </button>
          </div>
          <div className="go2-panel-body" style={{ padding: 0 }}>
            {LISTINGS.map((l) => (
              <button
                key={l.id}
                type="button"
                className={['go2-list-row', selected === l.id ? 'go2-list-row--on' : ''].join(' ')}
                style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }}
                onClick={() => setSelected(l.id)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Go2IconFrame icon={l.res} size="sm" rarity="uncommon" />
                  {l.name}
                </span>
                <span style={{ color: '#fbbf24' }}>{l.price.toLocaleString('es-ES')} ¢</span>
              </button>
            ))}
          </div>
        </div>
        <div className="go2-panel">
          <div className="go2-panel-head">Oferta</div>
          <div className="go2-panel-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Go2IconFrame icon={item.res} size="md" rarity="rare" />
              <p style={{ fontWeight: 800, color: '#fef3c7' }}>{item.name}</p>
            </div>
            <div className="go2-detail-stat">
              <span>Vendedor</span>
              <span>{item.seller}</span>
            </div>
            <div className="go2-detail-stat">
              <span>Cantidad</span>
              <span>{item.qty.toLocaleString('es-ES')}</span>
            </div>
            <div className="go2-detail-stat">
              <span>Precio</span>
              <span>{item.price.toLocaleString('es-ES')} créditos</span>
            </div>
            <div className="go2-detail-stat">
              <span>Tus créditos</span>
              <span>{resources.credits.toLocaleString('es-ES')}</span>
            </div>
            <button type="button" className="go2-btn-primary" onClick={handleTrade}>
              {tab === 'buy' ? 'Comprar' : 'Publicar venta'}
            </button>
          </div>
        </div>
      </div>
    </DestockGo2Shell>
  );
}
