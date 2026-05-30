'use client';

import { useCallback, useEffect, useState } from 'react';
import { Go2ScreenShell } from '@/components/game/go2/Go2ScreenShell';

/** Flotas — conectado a /api/fleets (GET lista, DELETE disolver), tema GO2. */

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
    <Go2ScreenShell title="Flotas" subtitle="Tus flotas de combate">
      {loading ? (
        <div className="go2-loading">Cargando flotas…</div>
      ) : fleets.length === 0 ? (
        <div className="go2-empty">
          No tienes flotas todavía. Construye naves en el{' '}
          <a href="/shipyard" style={{ color: 'var(--go2-cyan)' }}>Astillero</a> y agrúpalas en una flota.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 640 }}>
          {fleets.map((f) => (
            <div key={f.id} className="go2-card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', cursor: 'default' }}>
              <div>
                <div className="go2-card-title">{f.name}</div>
                <div className="go2-card-sub">
                  {f.status ?? 'IDLE'}
                  {f.totalPower != null ? ` · poder ${f.totalPower.toLocaleString('es-ES')}` : ''}
                  {f.shipCount != null ? ` · ${f.shipCount} naves` : ''}
                </div>
              </div>
              <button type="button" className="go2-btn go2-btn--danger" onClick={() => void dissolve(f.id)}>
                Disolver
              </button>
            </div>
          ))}
        </div>
      )}
      {toast ? <div className="go2-toast">{toast}</div> : null}
    </Go2ScreenShell>
  );
}
