/**
 * PostHog — inicialización global y utilidades de tracking.
 * Se inicializa una sola vez; seguro para SSR (Next.js App Router).
 */
import posthog from 'posthog-js';

const POSTHOG_KEY  = process.env.NEXT_PUBLIC_POSTHOG_KEY  ?? '';
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

let initialized = false;

export function initPostHog(): void {
  if (typeof window === 'undefined') return;  // SSR guard
  if (!POSTHOG_KEY)  return;                  // Sin key → sin tracking
  if (initialized)   return;                  // Ya inicializado
  initialized = true;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    ui_host: 'https://us.posthog.com',

    // Pageviews manuales para evitar doble conteo en SPA/App Router
    capture_pageview: false,
    capture_pageleave: true,

    // Autocapture básico — solo clics en a y button
    autocapture: {
      dom_event_allowlist: ['click'],
      element_allowlist:   ['a', 'button'],
    },

    // Session replay con privacidad máxima
    session_recording: {
      maskAllInputs: true,
      maskInputOptions: {
        password: true,
        email:    true,
        tel:      true,
        number:   true,
        search:   true,
        text:     true,
      },
    },

    // Elimina campos sensibles antes de enviar a PostHog
    sanitize_properties(props) {
      const SENSITIVE = [
        'password', 'email', 'dni', 'cuit', 'cuil',
        'tarjeta', 'card', 'cvv', 'pin', 'token', 'secret',
      ];
      for (const key of SENSITIVE) {
        if (key in props) delete props[key];
      }
      return props;
    },

    loaded(ph) {
      if (process.env.NODE_ENV === 'development') ph.debug();
    },
  });
}

// ─── Utilidad principal ──────────────────────────────────────────────────────

/**
 * Envía un evento personalizado a PostHog.
 *
 * @example
 * trackEvent('click_whatsapp', { source: 'boton_principal', page: '/dashboard' })
 */
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return;
  if (!initialized) return;
  try {
    posthog.capture(event, {
      timestamp: new Date().toISOString(),
      page:      window.location.pathname,
      ...properties,
    });
  } catch {
    // Falla silenciosamente — no rompe la app
  }
}

/**
 * Asocia el usuario actual con su ID (post-login).
 */
export function identifyUser(
  userId: string,
  traits?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined' || !initialized) return;
  posthog.identify(userId, traits);
}

/**
 * Limpia identidad (post-logout).
 */
export function resetUser(): void {
  if (typeof window === 'undefined' || !initialized) return;
  posthog.reset();
}

export { posthog };
