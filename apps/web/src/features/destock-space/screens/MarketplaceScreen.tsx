'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Go2IconFrame } from '@/components/game/go2/Go2IconFrame';
import type { Go2IconName } from '@/components/game/go2/Go2Icons';
import { DestockGo2Shell } from '../components/DestockGo2Shell';
import { destockHasToken } from '../destockApi';
import { useDestockShared } from '../useDestockShared';

type MarketTab = 'buy' | 'sell';

// Catálogo de muestra para invitados (sin sesión). Cuando hay sesión se reemplaza
// por los listings reales de GET /api/marketplace.
const GUEST_LISTINGS: {
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

// Forma real de GET /api/marketplace.
interface ApiListing {
  resource: 'METAL' | 'GAS' | 'HE3';
  buyPricePerUnit: number;
  sellPricePerUnit: number;
  name: string;
}

const RES_ICON: Record<ApiListing['resource'], Go2IconName> = {
  METAL: 'metal',
  GAS: 'plasma',
  HE3: 'plasma',
};

function authHeader(): Record<string, string> {
  try {
    const t = localStorage.getItem('token');
    return t ? { Authorization: `Bearer ${t}` } : {};
  } catch {
    return {};
  }
}

export function MarketplaceScreen() {
  const { resources, spend, showToast, refresh } = useDestockShared();
  const loggedIn = destockHasToken();

  const [tab, setTab] = useState<MarketTab>('buy');

  // ---- Modo invitado (sandbox local) ----
  const [guestSelected, setGuestSelected] = useState<string>(GUEST_LISTINGS[0].id);
  const guestItem = useMemo(
    () => GUEST_LISTINGS.find((l) => l.id === guestSelected) ?? GUEST_LISTINGS[0],
    [guestSelected]
  );

  // ---- Modo con sesión (mercado real) ----
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [apiResource, setApiResource] = useState<ApiListing['resource']>('METAL');
  const [amount, setAmount] = useState(10);
  const [busy, setBusy] = useState(false);

  const loadMarket = useCallback(async () => {
    if (!loggedIn) return;
    try {
      const res = await fetch('/api/marketplace', { headers: authHeader() });
      if (!res.ok) return;
      const json = await res.json();
      const l = json?.data?.listings;
      if (Array.isArray(l) && l.length) {
        setListings(l as ApiListing[]);
        setApiResource((prev) => (l.some((x: ApiListing) => x.resource === prev) ? prev : l[0].resource));
      }
    } catch {
      /* mantener lo último */
    }
  }, [loggedIn]);

  useEffect(() => {
    void loadMarket();
  }, [loadMarket]);

  const apiItem = useMemo(
    () => listings.find((l) => l.resource === apiResource) ?? listings[0],
    [listings, apiResource]
  );

  const handleApiTrade = async () => {
    if (!apiItem || busy || amount <= 0) return;
    setBusy(true);
    try {
      const res = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ action: tab, resource: apiItem.resource, amount }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        showToast(json?.error ?? 'Operación rechazada');
        return;
      }
      const d = json?.data ?? {};
      showToast(
        tab === 'buy'
          ? `Compraste ${amount} ${apiItem.name} (−${d.creditsSpent ?? '?'} ¢)`
          : `Vendiste ${amount} ${apiItem.name} (+${d.creditsGained ?? '?'} ¢)`
      );
      refresh(); // reconciliar wallet/recursos desde el servidor
      void loadMarket();
    } catch {
      showToast('Error de red');
    } finally {
      setBusy(false);
    }
  };

  // ---- Modo invitado ----
  const handleGuestTrade = () => {
    if (tab === 'buy') {
      if (!spend({ metal: 0, plasma: 0, credits: guestItem.price })) return;
      showToast(`Comprado: ${guestItem.name}`);
    } else {
      showToast('Publicación de venta (demo)');
    }
  };

  return (
    <DestockGo2Shell title="Mercado galáctico">
      <div className="go2-screen-layout go2-screen-layout--triple">
        <div className="go2-panel">
          <div className="go2-panel-head">Recursos</div>
          <div className="go2-panel-body" style={{ padding: 0 }}>
            {loggedIn
              ? listings.map((l) => (
                  <button
                    key={l.resource}
                    type="button"
                    className={['go2-list-row', apiResource === l.resource ? 'go2-list-row--on' : ''].join(' ')}
                    style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }}
                    onClick={() => setApiResource(l.resource)}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Go2IconFrame icon={RES_ICON[l.resource]} size="sm" rarity="uncommon" />
                      {l.name}
                    </span>
                    <span style={{ color: '#fbbf24' }}>
                      {l.buyPricePerUnit}¢ / {l.sellPricePerUnit}¢
                    </span>
                  </button>
                ))
              : GUEST_LISTINGS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    className={['go2-list-row', guestSelected === l.id ? 'go2-list-row--on' : ''].join(' ')}
                    style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }}
                    onClick={() => setGuestSelected(l.id)}
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
          <div className="go2-panel-body">
            {loggedIn && apiItem ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Go2IconFrame icon={RES_ICON[apiItem.resource]} size="md" rarity="rare" />
                  <p style={{ fontWeight: 800, color: '#fef3c7' }}>{apiItem.name}</p>
                </div>
                <div className="go2-detail-stat">
                  <span>Precio compra</span>
                  <span>{apiItem.buyPricePerUnit} ¢/u</span>
                </div>
                <div className="go2-detail-stat">
                  <span>Precio venta</span>
                  <span>{apiItem.sellPricePerUnit} ¢/u</span>
                </div>
                <div className="go2-detail-stat" style={{ alignItems: 'center' }}>
                  <span>Cantidad</span>
                  <input
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                    style={{
                      width: 90,
                      background: 'rgba(0,0,0,0.35)',
                      border: '1px solid var(--ds-border, #334155)',
                      borderRadius: 6,
                      color: '#fef3c7',
                      padding: '4px 8px',
                      textAlign: 'right',
                    }}
                  />
                </div>
                <div className="go2-detail-stat">
                  <span>{tab === 'buy' ? 'Coste total' : 'Ganancia total'}</span>
                  <span style={{ color: '#fbbf24' }}>
                    {(amount * (tab === 'buy' ? apiItem.buyPricePerUnit : apiItem.sellPricePerUnit)).toLocaleString('es-ES')} ¢
                  </span>
                </div>
                <div className="go2-detail-stat">
                  <span>Tus créditos</span>
                  <span>{resources.credits.toLocaleString('es-ES')}</span>
                </div>
                <button type="button" className="go2-btn-primary" onClick={() => void handleApiTrade()} disabled={busy}>
                  {busy ? '…' : tab === 'buy' ? 'Comprar' : 'Vender'}
                </button>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Go2IconFrame icon={guestItem.res} size="md" rarity="rare" />
                  <p style={{ fontWeight: 800, color: '#fef3c7' }}>{guestItem.name}</p>
                </div>
                <div className="go2-detail-stat">
                  <span>Vendedor</span>
                  <span>{guestItem.seller}</span>
                </div>
                <div className="go2-detail-stat">
                  <span>Cantidad</span>
                  <span>{guestItem.qty.toLocaleString('es-ES')}</span>
                </div>
                <div className="go2-detail-stat">
                  <span>Precio</span>
                  <span>{guestItem.price.toLocaleString('es-ES')} créditos</span>
                </div>
                <div className="go2-detail-stat">
                  <span>Tus créditos</span>
                  <span>{resources.credits.toLocaleString('es-ES')}</span>
                </div>
                <button type="button" className="go2-btn-primary" onClick={handleGuestTrade}>
                  {tab === 'buy' ? 'Comprar' : 'Publicar venta'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="go2-panel">
          <div className="go2-panel-head">Cartera</div>
          <div className="go2-panel-body">
            <div className="go2-detail-stat">
              <span>Metal</span>
              <span>{resources.metal.toLocaleString('es-ES')}</span>
            </div>
            <div className="go2-detail-stat">
              <span>Plasma</span>
              <span>{resources.plasma.toLocaleString('es-ES')}</span>
            </div>
            <div className="go2-detail-stat">
              <span>Créditos</span>
              <span>{resources.credits.toLocaleString('es-ES')}</span>
            </div>
            <p style={{ marginTop: 12, fontSize: 9, color: '#78716c' }}>
              {loggedIn
                ? 'Mercado en vivo — compra/venta contra el servidor (NPC).'
                : 'Modo invitado — inicia sesión para operar en el mercado real.'}
            </p>
          </div>
        </div>
      </div>
    </DestockGo2Shell>
  );
}
