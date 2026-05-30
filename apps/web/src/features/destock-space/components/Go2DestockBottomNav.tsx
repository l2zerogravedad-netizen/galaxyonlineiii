'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Go2IconFrame } from '@/components/game/go2/Go2IconFrame';
import type { Go2IconName } from '@/components/game/go2/Go2Icons';
import '@/components/game/go2/go2-visual.css';

function buildNav(planetHref: string) {
  return [
    { id: 'planet', href: planetHref, label: 'Planeta', icon: 'nav-planet' as const },
    { id: 'galaxy', href: '/destock/galaxy', label: 'Galaxia', icon: 'nav-galaxy' as const },
    { id: 'station', href: '/destock/station', label: 'Estación', icon: 'nav-station' as const },
    { id: 'market', href: '/destock/marketplace', label: 'Mercado', icon: 'nav-market' as const },
    { id: 'fleets', href: '/destock/fleets', label: 'Flotas', icon: 'nav-fleets' as const },
  ];
}

/** Nav inferior GO II — Planeta + Galaxia + Estación + Mercado + Flotas */
export function Go2DestockBottomNav({ planetHref = '/destock' }: { planetHref?: string }) {
  const pathname = usePathname() ?? '';
  const nav = buildNav(planetHref);

  return (
    <nav className="go2-bottom-nav" aria-label="Navegación GO">
      {nav.map((item) => {
        const active =
          item.id === 'planet'
            ? pathname === planetHref || pathname === '/destock'
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.id}
            href={item.href}
            className={['go2-nav-btn', active ? 'go2-nav-btn--active' : ''].join(' ')}
          >
            <Go2IconFrame icon={item.icon} size="sm" rarity={active ? 'rare' : 'common'} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
