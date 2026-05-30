'use client';

import { useEffect, useState, type ReactNode } from 'react';
import './go2-theme.css';
import { Go2BottomNav } from './Go2BottomNav';

/**
 * Go2ScreenShell — the shared Galaxy Online II chrome for every non-base screen
 * (galaxy / market / station / fleets / research / shipyard / missions).
 *
 * Renders: deep-space gradient background, a top bar with the screen title + a live
 * resource HUD pulled from /api/empire, the page body, and the GO2 bottom nav.
 * The terrestrial base does NOT use this shell.
 */

interface Resources {
  metal: number;
  gas: number;
  credits: number;
  he3: number;
}

function authToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

export function Go2ScreenShell({
  title,
  subtitle,
  children,
  showResources = true,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showResources?: boolean;
}) {
  const [res, setRes] = useState<Resources | null>(null);

  useEffect(() => {
    if (!showResources) return;
    const token = authToken();
    if (!token) return;
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch('/api/empire', { headers: { Authorization: `Bearer ${token}` } });
        if (!r.ok) return;
        const d = await r.json();
        const rows = d.resources ?? [];
        const find = (t: string) => Math.floor(rows.find((x: { type: string }) => x.type === t)?.amount ?? 0);
        if (cancelled) return;
        setRes({
          metal: find('METAL'),
          gas: find('GAS') || find('PLASMA'),
          credits: find('CREDITS'),
          he3: find('HE3'),
        });
      } catch {
        /* keep last */
      }
    };
    void load();
    const id = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [showResources]);

  const fmt = (n: number) => n.toLocaleString('en-US');

  return (
    <div className="go2-screen">
      <header className="go2-topbar">
        <div>
          <h1 className="go2-title">{title}</h1>
          {subtitle ? <div className="go2-subtitle">{subtitle}</div> : null}
        </div>
        {showResources && res ? (
          <div className="go2-res-hud">
            <div className="go2-res"><span className="go2-res-dot go2-res-dot--metal" /><span className="go2-res-val">{fmt(res.metal)}</span></div>
            <div className="go2-res"><span className="go2-res-dot go2-res-dot--gas" /><span className="go2-res-val">{fmt(res.gas)}</span></div>
            <div className="go2-res"><span className="go2-res-dot go2-res-dot--credits" /><span className="go2-res-val">{fmt(res.credits)}</span></div>
            <div className="go2-res"><span className="go2-res-dot go2-res-dot--he3" /><span className="go2-res-val">{fmt(res.he3)}</span></div>
          </div>
        ) : null}
      </header>

      <div className="go2-body">{children}</div>

      <Go2BottomNav />
    </div>
  );
}
