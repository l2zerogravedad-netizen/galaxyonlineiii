'use client';

import Link from 'next/link';

/** Estación — hub de navegación a los servicios del imperio (todos conectados al backend). */

const MODULES: { href: string; label: string; sub: string; accent: string }[] = [
  { href: '/dashboard', label: 'Planeta', sub: 'Base y construcción', accent: '#22c55e' },
  { href: '/dashboard/galaxy', label: 'Galaxia', sub: 'Mapa estelar', accent: '#38bdf8' },
  { href: '/dashboard/market', label: 'Mercado', sub: 'Compra/venta de recursos', accent: '#fcd34d' },
  { href: '/shipyard', label: 'Astillero', sub: 'Construcción de naves', accent: '#60a5fa' },
  { href: '/research', label: 'Investigación', sub: 'Árbol tecnológico', accent: '#a78bfa' },
  { href: '/missions', label: 'Misiones', sub: 'Campaña PvE', accent: '#fb923c' },
];

export default function StationPage() {
  return (
    <div style={{ padding: 24, color: '#dbe9ff', maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Estación Espacial</h1>
      <p style={{ marginTop: 4, color: '#9fb6d4', fontSize: 13 }}>Centro de servicios del imperio.</p>
      <div
        style={{
          marginTop: 18,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 12,
        }}
      >
        {MODULES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            style={{
              display: 'block',
              padding: '16px',
              borderRadius: 12,
              border: `1px solid ${m.accent}55`,
              background: 'linear-gradient(180deg,rgba(14,34,64,0.7),rgba(8,18,36,0.7))',
              textDecoration: 'none',
              color: '#dbe9ff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: m.accent }} />
              <span style={{ fontWeight: 800 }}>{m.label}</span>
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: '#9fb6d4' }}>{m.sub}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
