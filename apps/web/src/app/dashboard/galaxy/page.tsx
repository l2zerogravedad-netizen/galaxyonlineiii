'use client';

import { useEffect, useState } from 'react';

/** Galaxia — conectado a /api/galaxy (sector real: planetas propios + NPC). */

interface GalaxyPlanet {
  id: string;
  name: string;
  type: string;
  galaxyX: number;
  galaxyY: number;
  owner?: string | null;
  difficulty?: number;
}

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function GalaxyMapPage() {
  const [own, setOwn] = useState<GalaxyPlanet[]>([]);
  const [npc, setNpc] = useState<GalaxyPlanet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/galaxy', { headers: authHeaders() });
        const json = await res.json();
        const d = json?.data ?? json;
        setOwn(d?.myPlanets ?? []);
        setNpc(d?.npcPlanets ?? []);
      } catch {
        setError('No se pudo cargar la galaxia');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24, color: '#dbe9ff', maxWidth: 820, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Galaxia</h1>
      <p style={{ marginTop: 4, color: '#9fb6d4', fontSize: 13 }}>
        Sector estelar. Tus planetas y sistemas NPC cercanos.
      </p>

      {loading ? (
        <p style={{ marginTop: 16, color: '#9fb6d4' }}>Cargando sector…</p>
      ) : error ? (
        <p style={{ marginTop: 16, color: '#fca5a5' }}>{error}</p>
      ) : (
        <>
          <h2 style={{ marginTop: 20, fontSize: 16, color: '#7fd0ff' }}>Tus planetas ({own.length})</h2>
          <div style={grid}>
            {own.map((p) => (
              <Cell key={p.id} title={p.name} sub={`${p.type} · [${p.galaxyX},${p.galaxyY}]`} accent="#22c55e" />
            ))}
          </div>

          <h2 style={{ marginTop: 24, fontSize: 16, color: '#7fd0ff' }}>Sistemas cercanos ({npc.length})</h2>
          <div style={grid}>
            {npc.map((p) => (
              <Cell
                key={p.id}
                title={p.name}
                sub={`${p.type} · [${p.galaxyX},${p.galaxyY}]${p.difficulty ? ` · dif ${p.difficulty}` : ''}`}
                accent={p.owner ? '#ef4444' : '#64748b'}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const grid: React.CSSProperties = {
  marginTop: 10,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: 10,
};

function Cell({ title, sub, accent }: { title: string; sub: string; accent: string }) {
  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 10,
        border: `1px solid ${accent}55`,
        background: 'linear-gradient(180deg,rgba(14,34,64,0.7),rgba(8,18,36,0.7))',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent }} />
        <span style={{ fontWeight: 700, fontSize: 13 }}>{title}</span>
      </div>
      <div style={{ marginTop: 4, fontSize: 11, color: '#9fb6d4' }}>{sub}</div>
    </div>
  );
}
