'use client';

import { useCallback, useEffect, useState } from 'react';
import { Go2ScreenShell } from '@/components/game/go2/Go2ScreenShell';

/** Mercado — conectado a /api/marketplace (intercambio de recursos NPC), tema GO2. */

interface Listing {
  resource: string;
  name: string;
  buyPricePerUnit: number;
  sellPricePerUnit: number;
}

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

export default function MarketPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [wallet, setWallet] = useState<Record<string, number>>({});
  const [amount, setAmount] = useState(100);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/marketplace', { headers: authHeaders() });
      const json = await res.json();
      if (json?.data) {
        setListings(json.data.listings ?? []);
        setWallet(json.data.wallet ?? {});
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const trade = useCallback(
    async (action: 'buy' | 'sell', resource: string) => {
      try {
        const res = await fetch('/api/marketplace', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ action, resource, amount }),
        });
        const json = await res.json();
        if (json?.success) {
          setToast(
            action === 'buy'
              ? `Compraste ${json.data.amount} ${resource} (−${json.data.creditsSpent} cr)`
              : `Vendiste ${json.data.amount} ${resource} (+${json.data.creditsGained} cr)`
          );
          await refresh();
        } else {
          setToast(json?.error ?? 'Operación fallida');
        }
      } catch {
        setToast('Error de red');
      }
      window.setTimeout(() => setToast(null), 2600);
    },
    [amount, refresh]
  );

  return (
    <Go2ScreenShell title="Mercado Galáctico" subtitle="Intercambio de recursos con el mercado NPC">
      <div className="go2-panel" style={{ maxWidth: 640 }}>
        <div className="go2-panel-head">Comerciar</div>
        <div className="go2-panel-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: 'var(--go2-dim)' }}>Cantidad</span>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              style={{
                width: 120, padding: '6px 10px', borderRadius: 8,
                border: '1px solid var(--go2-line)', background: 'rgba(2,8,18,0.6)', color: 'var(--go2-txt)',
              }}
            />
          </div>

          {loading ? (
            <div className="go2-loading">Cargando mercado…</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {listings.map((l) => (
                <div key={l.resource} className="go2-card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', cursor: 'default' }}>
                  <div>
                    <div className="go2-card-title">{l.name}</div>
                    <div className="go2-card-sub">
                      Tienes {(wallet[l.resource] ?? 0).toLocaleString('es-ES')} · compra {l.buyPricePerUnit} · venta {l.sellPricePerUnit} cr
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="go2-btn" onClick={() => void trade('buy', l.resource)}>Comprar</button>
                    <button type="button" className="go2-btn go2-btn--gold" onClick={() => void trade('sell', l.resource)}>Vender</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {toast ? <div className="go2-toast">{toast}</div> : null}
    </Go2ScreenShell>
  );
}
