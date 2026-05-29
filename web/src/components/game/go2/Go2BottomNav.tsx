'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Swords,
  Rocket,
  Globe,
  ShoppingCart,
  Trophy,
  Users,
  Target,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Configuracion de navegacion                                        */
/* ------------------------------------------------------------------ */

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  exact?: boolean;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    exact: true,
  },
  {
    label: 'Batalla',
    icon: Swords,
    href: '/dashboard/battle',
  },
  {
    label: 'Flotas',
    icon: Rocket,
    href: '/dashboard/fleet',
  },
  {
    label: 'Galaxia',
    icon: Globe,
    href: '/dashboard/galaxy',
  },
  {
    label: 'Misiones',
    icon: Target,
    href: '/dashboard/missions',
  },
  {
    label: 'Mercado',
    icon: ShoppingCart,
    href: '/dashboard/market',
  },
  {
    label: 'Ranking',
    icon: Trophy,
    href: '/dashboard/leaderboard',
  },
  {
    label: 'Alianzas',
    icon: Users,
    href: '/dashboard/alliances',
  },
];

/* ------------------------------------------------------------------ */
/*  Componente: Marcas de esquina (sci-fi)                             */
/* ------------------------------------------------------------------ */

function CornerMarks() {
  return (
    <>
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/40 rounded-tl-sm" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/40 rounded-tr-sm" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500/40 rounded-bl-sm" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/40 rounded-br-sm" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Componente: Go2BottomNav                                           */
/* ------------------------------------------------------------------ */

export function Go2BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  /* -- Determinar si un item esta activo -- */
  const isActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <nav className="shrink-0 sticky bottom-0 z-40 bg-[#020814]/90 backdrop-blur-xl border-t border-white/10">
      {/* Linea brillante superior */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

      <div className="grid grid-cols-4 gap-1 p-2 lg:gap-2 lg:p-3">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          const btnClass = active
            ? 'relative flex h-12 items-center justify-center gap-1.5 overflow-hidden rounded-lg border px-1 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 lg:h-14 lg:gap-2 lg:text-xs border-cyan-400/40 bg-cyan-500/10 text-cyan-300 shadow-[0_0_16px_rgba(0,212,255,0.12)]'
            : 'relative flex h-12 items-center justify-center gap-1.5 overflow-hidden rounded-lg border px-1 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 lg:h-14 lg:gap-2 lg:text-xs border-transparent bg-[#0a1628]/60 text-slate-500 hover:border-cyan-500/15 hover:bg-cyan-500/5 hover:text-slate-400';

          const iconClass = active
            ? 'w-4 h-4 shrink-0 lg:w-5 lg:h-5 text-cyan-400'
            : 'w-4 h-4 shrink-0 lg:w-5 lg:h-5 text-slate-600';

          return (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className={btnClass}
            >
              <CornerMarks />
              <Icon className={iconClass} />
              <span className="hidden sm:inline">{item.label}</span>
              {/* Indicador activo (punto) */}
              {active && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,212,255,0.6)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Safe area para dispositivos moviles */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
