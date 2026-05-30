'use client';

import Link from 'next/link';
import { Go2IconFrame } from '@/components/game/go2/Go2IconFrame';
import { DestockGo2Shell } from '../components/DestockGo2Shell';
import type { Go2IconName } from '@/components/game/go2/Go2Icons';

const MODULES: { href: string; icon: Go2IconName; label: string; sub: string; rarity: 'rare' | 'epic' | 'uncommon' | 'legendary' }[] = [
  { href: '/destock/building-preview', icon: 'hammer', label: 'Vista edificio', sub: 'Prueba HD · zoom', rarity: 'rare' },
  { href: '/destock/shipyard', icon: 'ship', label: 'Doca de Forja', sub: 'Astillero · naves', rarity: 'epic' },
  { href: '/destock/research', icon: 'research', label: 'Nexo Cognitivo', sub: 'Investigación', rarity: 'rare' },
  { href: '/destock/inventory', icon: 'inventory', label: 'Bóveda Orbital', sub: 'Inventario', rarity: 'uncommon' },
  { href: '/destock/missions', icon: 'mission', label: 'Mando Táctico', sub: 'Misiones', rarity: 'legendary' },
  { href: '/destock/clan', icon: 'clan', label: 'Alianza DSX', sub: 'Clan / cooperación', rarity: 'legendary' },
];

export function StationScreen() {
  return (
    <DestockGo2Shell title="Estación espacial">
      <div className="go2-panel" style={{ maxWidth: 640, margin: '0 auto', height: '100%' }}>
        <div className="go2-panel-head">Módulos de estación</div>
        <div className="go2-panel-body">
          <div className="go2-station-grid">
            {MODULES.map((m) => (
              <Link key={m.href} href={m.href} className="go2-station-tile">
                <Go2IconFrame icon={m.icon} size="lg" rarity={m.rarity} />
                <span>{m.label}</span>
                <span style={{ fontSize: 9, fontWeight: 500, color: '#a8a29e', textTransform: 'none' }}>
                  {m.sub}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DestockGo2Shell>
  );
}
