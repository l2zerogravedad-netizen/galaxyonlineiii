'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { id: 'planet', href: '/destock', label: 'Planeta', icon: '⌂' },
  { id: 'build', href: '/destock', label: 'Construcción', icon: '⚙' },
  { id: 'shipyard', href: '/destock/shipyard', label: 'Astillero', icon: '🛸' },
  { id: 'research', href: '/destock/research', label: 'Investigación', icon: '◇' },
  { id: 'fleets', href: '/destock/fleets', label: 'Flotas', icon: '✦' },
  { id: 'galaxy', href: '/destock/galaxy', label: 'Galaxia', icon: '◈' },
  { id: 'inventory', href: '/destock/inventory', label: 'Inventario', icon: '▣' },
  { id: 'market', href: '/destock/marketplace', label: 'Market', icon: '¤' },
  { id: 'missions', href: '/destock/missions', label: 'Misiones', icon: '!' },
  { id: 'clan', href: '/destock/clan', label: 'Clan', icon: '⚔' },
] as const;

/** Nav inferior — misma disposición que el video GO II */
export function DestockBottomNav() {
  const pathname = usePathname() ?? '';

  return (
    <>
      {NAV.map((item) => {
        const active =
          item.href === '/destock'
            ? pathname === '/destock'
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.id}
            href={item.href}
            className={['ds-video-nav-btn', active ? 'ds-video-nav-btn--on' : ''].join(' ')}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}
