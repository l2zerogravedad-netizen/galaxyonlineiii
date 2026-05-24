'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AssetImage } from './AssetImage';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Planeta', icon: '/game/assets/ui/info.webp', emoji: '🪐' },
  { href: '/shipyard', label: 'Astillero', icon: '/game/assets/ui/build.webp', emoji: '🚀' },
  { href: '/research', label: 'Investigación', icon: '/game/assets/ui/research.webp', emoji: '🔬' },
  { href: '/fleets', label: 'Flotas', icon: '/game/assets/ui/defense.webp', emoji: '⚔' },
  { href: '/missions', label: 'Misiones', icon: '/game/assets/ui/info.webp', emoji: '📡' },
] as const;

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="game-panel flex items-stretch justify-around gap-1 p-1 md:p-2">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
        <Link
          key={item.href}
          href={item.href}
          className={`flex flex-col items-center justify-center flex-1 min-w-0 py-2 px-1 rounded-lg transition ${
            active
              ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-200'
              : 'hover:bg-slate-800/60 text-slate-400 hover:text-cyan-200'
          }`}
        >
          <AssetImage src={item.icon} alt={item.label} className="w-6 h-6" glow="cyan" icon={item.emoji} />
          <span className="text-[9px] md:text-[10px] mt-1 uppercase tracking-wide truncate w-full text-center">
            {item.label}
          </span>
        </Link>
        );
      })}
    </nav>
  );
}
