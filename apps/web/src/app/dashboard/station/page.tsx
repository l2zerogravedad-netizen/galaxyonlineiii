'use client';

import Link from 'next/link';
import { Go2ScreenShell } from '@/components/game/go2/Go2ScreenShell';

/** Estación — hub de navegación a los servicios del imperio (tema GO2). */

const MODULES: { href: string; label: string; sub: string; accent: string }[] = [
  { href: '/dashboard', label: 'Planeta', sub: 'Base y construcción', accent: '#4ade80' },
  { href: '/dashboard/galaxy', label: 'Galaxia', sub: 'Mapa estelar', accent: '#7fd0ff' },
  { href: '/dashboard/market', label: 'Mercado', sub: 'Compra/venta de recursos', accent: '#fcd34d' },
  { href: '/shipyard', label: 'Astillero', sub: 'Construcción de naves', accent: '#5b9bd5' },
  { href: '/research', label: 'Investigación', sub: 'Árbol tecnológico', accent: '#a78bfa' },
  { href: '/missions', label: 'Misiones', sub: 'Campaña PvE', accent: '#fb923c' },
];

export default function StationPage() {
  return (
    <Go2ScreenShell title="Estación Espacial" subtitle="Centro de servicios del imperio">
      <div className="go2-grid go2-grid--3">
        {MODULES.map((m) => (
          <Link key={m.href} href={m.href} className="go2-card" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: m.accent, boxShadow: `0 0 10px ${m.accent}` }} />
              <span className="go2-card-title">{m.label}</span>
            </div>
            <div className="go2-card-sub">{m.sub}</div>
          </Link>
        ))}
      </div>
    </Go2ScreenShell>
  );
}
