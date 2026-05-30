'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Mercado — conectado a /api/marketplace (intercambio de recursos NPC).
 * GET listings + wallet; POST buy/sell. Recursos reales del imperio.
 */

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
    <div style={{ padding: 24, color: '#dbe9ff', maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Mercado Galáctico</h1>
      <p style={{ marginTop: 4, color: '#9fb6d4', fontSize: 13 }}>
        Intercambio de recursos con el mercado NPC. Créditos:{' '}
        <b style={{ color: '#fcd34d' }}>{(wallet.CREDITS ?? 0).toLocaleString('es-ES')}</b>
      </p>

      <div style={{ margin: '16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ fontSize: 13 }}>Cantidad:</label>
        <input
          type="number"
          min={1}
          value={amount}
          onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
          style={{
            width: 120,
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid #2f6fb0',
            background: '#0b1830',
            color: '#dbe9ff',
          }}
        />
      </div>

      {loading ? (
        <p style={{ color: '#9fb6d4' }}>Cargando mercado…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {listings.map((l) => (
            <div
              key={l.resource}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px solid #1f4e7a',
                background: 'linear-gradient(180deg,rgba(14,34,64,0.7),rgba(8,18,36,0.7))',
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>{l.name}</div>
                <div style={{ fontSize: 12, color: '#9fb6d4' }}>
                  Tienes: {(wallet[l.resource] ?? 0).toLocaleString('es-ES')} · compra{' '}
                  {l.buyPricePerUnit} cr · venta {l.sellPricePerUnit} cr
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => void trade('buy', l.resource)} style={btn('#2563eb')}>
                  Comprar
                </button>
                <button type="button" onClick={() => void trade('sell', l.resource)} style={btn('#b45309')}>
                  Vender
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast ? (
        <div
          style={{
            marginTop: 16,
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(34,197,94,0.15)',
            border: '1px solid #16a34a',
            color: '#bbf7d0',
            fontSize: 13,
          }}
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function btn(bg: string): React.CSSProperties {
  return {
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    background: bg,
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
  };
}
