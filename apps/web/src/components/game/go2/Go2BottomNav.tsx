'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Globe2, Satellite, Store, Rocket } from 'lucide-react';

const NAV = [
  { id: 'planet', href: '/dashboard', label: 'Planeta', icon: Home },
  { id: 'galaxy', href: '/dashboard/galaxy', label: 'Galaxia', icon: Globe2 },
  { id: 'station', href: '/dashboard/station', label: 'Estación', icon: Satellite },
  { id: 'market', href: '/dashboard/market', label: 'Mercado', icon: Store },
  { id: 'fleets', href: '/fleets', label: 'Flotas', icon: Rocket },
] as const;

export function Go2BottomNav() {
  const pathname = usePathname() ?? '';

  return (
    <nav className="go2-bottom-nav" aria-label="Navegación GO">
      {NAV.map((item) => {
        const active =
          item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={['go2-nav-btn', active ? 'go2-nav-btn--active' : ''].join(' ')}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
