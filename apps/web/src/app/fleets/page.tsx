'use client';

import { useCallback, useEffect, useState } from 'react';

/** Flotas — conectado a /api/fleets (GET lista, DELETE disolver). */

interface Fleet {
  id: string;
  name: string;
  status?: string;
  totalPower?: number;
  shipCount?: number;
}

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function FleetsPage() {
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/fleets', { headers: authHeaders() });
      const json = await res.json();
      setFleets(json?.data ?? json ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const dissolve = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/fleets/${id}`, { method: 'DELETE', headers: authHeaders() });
        const json = await res.json();
        setToast(json?.success ? 'Flota disuelta' : (json?.error ?? 'No se pudo disolver'));
        await refresh();
      } catch {
        setToast('Error de red');
      }
      window.setTimeout(() => setToast(null), 2400);
    },
    [refresh]
  );

  return (
    <div style={{ padding: 24, color: '#dbe9ff', maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Flotas</h1>
      <p style={{ marginTop: 4, color: '#9fb6d4', fontSize: 13 }}>
        Tus flotas de combate. Construye naves en el astillero para formar nuevas.
      </p>

      {loading ? (
        <p style={{ marginTop: 16, color: '#9fb6d4' }}>Cargando flotas…</p>
      ) : fleets.length === 0 ? (
        <div
          style={{
            marginTop: 18,
            padding: 20,
            borderRadius: 12,
            border: '1px dashed #2f6fb0',
            color: '#9fb6d4',
            textAlign: 'center',
          }}
        >
          No tienes flotas todavía. Construye naves en el{' '}
          <a href="/shipyard" style={{ color: '#7fd0ff' }}>
            Astillero
          </a>{' '}
          y agrúpalas en una flota.
        </div>
      ) : (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {fleets.map((f) => (
            <div
              key={f.id}
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
                <div style={{ fontWeight: 700 }}>{f.name}</div>
                <div style={{ fontSize: 12, color: '#9fb6d4' }}>
                  {f.status ?? 'IDLE'}
                  {f.totalPower != null ? ` · poder ${f.totalPower.toLocaleString('es-ES')}` : ''}
                  {f.shipCount != null ? ` · ${f.shipCount} naves` : ''}
                </div>
              </div>
              <button
                type="button"
                onClick={() => void dissolve(f.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid #b91c1c',
                  background: 'transparent',
                  color: '#fca5a5',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Disolver
              </button>
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
