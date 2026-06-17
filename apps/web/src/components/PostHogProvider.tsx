'use client';

/**
 * PostHogProvider — wrapper global de analytics.
 * • Inicializa PostHog una sola vez al montar.
 * • Trackea pageviews en cada cambio de ruta (App Router).
 * • Auto-detecta clics en CTAs por texto/href (WhatsApp, vender, comprar…).
 * • Usa Suspense para cumplir con requisito de useSearchParams en Next.js 13+.
 * • Sin claves reales — lee de NEXT_PUBLIC_POSTHOG_KEY en .env.local.
 */

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { initPostHog, trackEvent } from '@/lib/posthog';

// ─── Tipos de página para enriquecer eventos ──────────────────────────────────
function detectPageType(pathname: string): string {
  if (pathname === '/')                  return 'login';
  if (pathname.startsWith('/dashboard')) return 'dashboard';
  if (pathname.startsWith('/planet'))    return 'planet';
  if (pathname.startsWith('/fleets'))    return 'fleets';
  if (pathname.startsWith('/research'))  return 'research';
  if (pathname.startsWith('/shipyard'))  return 'shipyard';
  if (pathname.startsWith('/missions'))  return 'missions';
  if (pathname.startsWith('/go3'))       return 'galaxy_3d';
  if (pathname.startsWith('/destock'))   return 'destock';
  if (pathname.startsWith('/demo'))      return 'demo';
  return 'other';
}

// ─── Reglas de auto-detección CTA ─────────────────────────────────────────────
const CTA_RULES: Array<{ pattern: RegExp; event: string }> = [
  { pattern: /whatsapp|wa\.me|api\.whatsapp/i,             event: 'click_whatsapp'     },
  { pattern: /\bvender\b|\bpublicar\b/i,                   event: 'click_vender'       },
  { pattern: /\bcomprar\b/i,                               event: 'click_comprar'      },
  { pattern: /registr(?:arme|arse|ación|o)\b/i,            event: 'click_registro'     },
  { pattern: /\bcontacto\b|\bconsultar\b|\bconsulta\b/i,   event: 'formulario_enviado' },
];

// ─── Tracker de pageviews (requiere Suspense por useSearchParams) ─────────────
function PageViewTracker() {
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    posthog.capture('$pageview', {
      $current_url: window.location.href,
      page_type:    detectPageType(pathname),
    });
  }, [pathname, searchParams]);

  return null;
}

// ─── Tracker global de clics CTA ─────────────────────────────────────────────
function ClickAutoTracker() {
  useEffect(() => {
    function onGlobalClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const el     = target.closest('a, button') as HTMLAnchorElement | HTMLButtonElement | null;
      if (!el) return;

      const text    = el.textContent?.trim() ?? '';
      const href    = (el as HTMLAnchorElement).href ?? '';
      const testStr = `${text} ${href}`;

      for (const { pattern, event } of CTA_RULES) {
        if (pattern.test(testStr)) {
          trackEvent(event, {
            button_text: text.slice(0, 120),
            destination: href || null,
            page_type:   detectPageType(window.location.pathname),
          });
          break;
        }
      }
    }

    document.addEventListener('click', onGlobalClick, true);
    return () => document.removeEventListener('click', onGlobalClick, true);
  }, []);

  return null;
}

// ─── Provider raíz ───────────────────────────────────────────────────────────
export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    initPostHog();
  }, []);

  return (
    <>
      {/* Suspense requerido por Next.js cuando se usa useSearchParams en Server context */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      <ClickAutoTracker />
      {children}
    </>
  );
}
