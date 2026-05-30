'use client';

import type { ReactNode } from 'react';
import { GO2_HD_ICON_SRC } from '@/lib/destockHdAssets';

/** Iconografía estilo Galaxy Online II — formas del original, acabado SVG moderno */

export type Go2IconName =
  | 'credits'
  | 'metal'
  | 'plasma'
  | 'premium'
  | 'nav-planet'
  | 'nav-galaxy'
  | 'nav-station'
  | 'nav-market'
  | 'nav-fleets'
  | 'hammer'
  | 'close'
  | 'ship'
  | 'research'
  | 'inventory'
  | 'mission'
  | 'clan'
  | 'star-self'
  | 'star-enemy'
  | 'star-ally'
  | 'star-empty'
  | 'module'
  | 'chest'
  | 'shield'
  | 'energy';

/** IDs estables para gradientes SVG (evita mismatch de hidratación SSR/cliente). */
const gradId = (icon: Go2IconName, suffix: string) => `go2-grad-${icon}-${suffix}`;

function Svg({
  size,
  children,
  viewBox = '0 0 64 64',
}: {
  size: number;
  children: React.ReactNode;
  viewBox?: string;
}) {
  return (
    <svg width={size} height={size} viewBox={viewBox} fill="none" aria-hidden>
      {children}
    </svg>
  );
}

export function Go2Icon({ name, size = 28 }: { name: Go2IconName; size?: number }) {
  const hdSrc = GO2_HD_ICON_SRC[name];
  if (hdSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={hdSrc}
        alt=""
        width={size}
        height={size}
        className="go2-hd-icon"
        draggable={false}
      />
    );
  }

  switch (name) {
    case 'credits': {
      const g = gradId('credits', 'a');
      return (
        <Svg size={size}>
          <defs>
            <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFE566" />
              <stop offset="100%" stopColor="#C47A00" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="48" rx="22" ry="6" fill="#000" opacity="0.25" />
          <circle cx="24" cy="30" r="14" fill={`url(#${g})`} stroke="#FFF0B3" strokeWidth="2" />
          <circle cx="40" cy="26" r="14" fill={`url(#${g})`} stroke="#FFF0B3" strokeWidth="2" />
          <circle cx="32" cy="34" r="14" fill="#FFD54A" stroke="#FFF8DC" strokeWidth="2" />
          <text x="32" y="38" textAnchor="middle" fontSize="14" fontWeight="900" fill="#5C3D00">
            ¢
          </text>
        </Svg>
      );
    }
    case 'metal': {
      const g = gradId('metal', 'm');
      return (
        <Svg size={size}>
          <defs>
            <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF6B5A" />
              <stop offset="100%" stopColor="#9B1C1C" />
            </linearGradient>
          </defs>
          <path
            d="M32 8L52 22V42L32 56L12 42V22L32 8Z"
            fill={`url(#${g})`}
            stroke="#FFC9C2"
            strokeWidth="2"
          />
          <path d="M32 18L42 26V38L32 46L22 38V26L32 18Z" fill="#FF8A7A" opacity="0.9" />
          <path d="M32 22V42M22 32H42" stroke="#5C1010" strokeWidth="2" opacity="0.35" />
        </Svg>
      );
    }
    case 'plasma': {
      const g = gradId('plasma', 'p');
      return (
        <Svg size={size}>
          <defs>
            <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7DD3FC" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>
          <path
            d="M32 6L44 24L58 32L44 40L32 58L20 40L6 32L20 24L32 6Z"
            fill={`url(#${g})`}
            stroke="#E0F2FE"
            strokeWidth="2"
          />
          <path d="M32 16L38 28L50 32L38 36L32 48L26 36L14 32L26 28L32 16Z" fill="#BAE6FD" />
          <circle cx="32" cy="32" r="6" fill="#F0F9FF" opacity="0.9" />
        </Svg>
      );
    }
    case 'premium': {
      const g = gradId('premium', 'v');
      return (
        <Svg size={size}>
          <defs>
            <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#86EFAC" />
              <stop offset="100%" stopColor="#15803D" />
            </linearGradient>
          </defs>
          <path
            d="M32 10L40 26H56L44 38L48 54L32 44L16 54L20 38L8 26H24L32 10Z"
            fill={`url(#${g})`}
            stroke="#DCFCE7"
            strokeWidth="2"
          />
          <path d="M32 20L36 30H46L38 36L40 46L32 40L24 46L26 36L18 30H28L32 20Z" fill="#BBF7D0" />
        </Svg>
      );
    }
    case 'nav-planet':
      return (
        <Svg size={size}>
          <circle cx="32" cy="34" r="18" fill="#22C55E" stroke="#BBF7D0" strokeWidth="2" />
          <ellipse cx="32" cy="34" rx="22" ry="8" stroke="#4ADE80" strokeWidth="2" opacity="0.7" />
          <circle cx="26" cy="30" r="4" fill="#14532D" opacity="0.35" />
        </Svg>
      );
    case 'nav-galaxy':
      return (
        <Svg size={size}>
          <circle cx="32" cy="32" r="10" fill="#FBBF24" stroke="#FEF3C7" strokeWidth="2" />
          <ellipse cx="32" cy="32" rx="26" ry="10" stroke="#A78BFA" strokeWidth="2.5" transform="rotate(-25 32 32)" />
          <ellipse cx="32" cy="32" rx="26" ry="10" stroke="#60A5FA" strokeWidth="2" transform="rotate(35 32 32)" />
          <circle cx="14" cy="18" r="2" fill="#E7E5E4" />
          <circle cx="50" cy="44" r="2" fill="#E7E5E4" />
        </Svg>
      );
    case 'nav-station':
      return (
        <Svg size={size}>
          <rect x="22" y="28" width="20" height="26" rx="3" fill="#64748B" stroke="#CBD5E1" strokeWidth="2" />
          <path d="M32 12V28" stroke="#94A3B8" strokeWidth="4" />
          <circle cx="32" cy="10" r="8" fill="#38BDF8" stroke="#E0F2FE" strokeWidth="2" />
          <rect x="18" y="36" width="8" height="10" rx="1" fill="#475569" />
          <rect x="38" y="36" width="8" height="10" rx="1" fill="#475569" />
        </Svg>
      );
    case 'nav-market':
      return (
        <Svg size={size}>
          <path d="M14 22H50L46 14H18L14 22Z" fill="#D97706" stroke="#FDE68A" strokeWidth="2" />
          <rect x="18" y="22" width="28" height="28" rx="4" fill="#92400E" stroke="#FBBF24" strokeWidth="2" />
          <path d="M26 32H38M26 40H34" stroke="#FEF3C7" strokeWidth="3" strokeLinecap="round" />
        </Svg>
      );
    case 'nav-fleets':
      return (
        <Svg size={size}>
          <path d="M32 8L42 48H32 40L22 48L32 8Z" fill="#0EA5E9" stroke="#BAE6FD" strokeWidth="2" />
          <path d="M14 28L20 50L14 46L8 50L14 28Z" fill="#0369A1" stroke="#7DD3FC" strokeWidth="1.5" />
          <path d="M50 28L56 50L50 46L44 50L50 28Z" fill="#0369A1" stroke="#7DD3FC" strokeWidth="1.5" />
        </Svg>
      );
    case 'hammer':
      return (
        <Svg size={size}>
          <rect x="10" y="34" width="28" height="10" rx="2" fill="#78716C" stroke="#D6D3D1" strokeWidth="2" />
          <path d="M36 14L48 38H40L28 14H36Z" fill="#FBBF24" stroke="#FEF3C7" strokeWidth="2" />
          <path d="M24 14L12 38H20L32 14H24Z" fill="#D97706" stroke="#FDE68A" strokeWidth="2" />
        </Svg>
      );
    case 'close':
      return (
        <Svg size={size} viewBox="0 0 24 24">
          <path d="M6 6L18 18M18 6L6 18" stroke="#FEF3C7" strokeWidth="3" strokeLinecap="round" />
        </Svg>
      );
    case 'ship':
      return (
        <Svg size={size}>
          <path d="M32 6L46 52L32 44L18 52L32 6Z" fill="#38BDF8" stroke="#E0F2FE" strokeWidth="2" />
          <path d="M32 20V40" stroke="#F0F9FF" strokeWidth="3" />
        </Svg>
      );
    case 'research':
      return (
        <Svg size={size}>
          <path
            d="M26 12H38M30 12V28L18 50C16 54 19 58 24 58H40C45 58 48 54 46 50L34 28V12"
            stroke="#A78BFA"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <ellipse cx="32" cy="46" rx="10" ry="4" fill="#7C3AED" opacity="0.5" />
          <circle cx="32" cy="38" r="6" fill="#C4B5FD" />
        </Svg>
      );
    case 'inventory':
      return (
        <Svg size={size}>
          <rect x="14" y="20" width="36" height="32" rx="4" fill="#57534E" stroke="#D6D3D1" strokeWidth="2" />
          <path d="M14 28H50" stroke="#A8A29E" strokeWidth="2" />
          <rect x="22" y="34" width="10" height="10" rx="1" fill="#FBBF24" />
          <rect x="36" y="34" width="10" height="10" rx="1" fill="#38BDF8" />
        </Svg>
      );
    case 'mission':
      return (
        <Svg size={size}>
          <circle cx="32" cy="32" r="22" stroke="#FBBF24" strokeWidth="3" fill="#292524" />
          <path d="M32 16V32L42 38" stroke="#FDE68A" strokeWidth="3" strokeLinecap="round" />
          <circle cx="32" cy="32" r="4" fill="#FBBF24" />
        </Svg>
      );
    case 'clan':
      return (
        <Svg size={size}>
          <path d="M32 8L40 24H56L44 36L48 52L32 44L16 52L20 36L8 24H24L32 8Z" fill="#DC2626" stroke="#FECACA" strokeWidth="2" />
          <circle cx="32" cy="30" r="8" fill="#FBBF24" stroke="#451A03" strokeWidth="2" />
        </Svg>
      );
    case 'star-self':
      return (
        <Svg size={size} viewBox="0 0 32 32">
          <path d="M16 4L19 12H28L21 17L24 26L16 21L8 26L11 17L4 12H13L16 4Z" fill="#22D3EE" stroke="#A5F3FC" strokeWidth="1" />
        </Svg>
      );
    case 'star-enemy':
      return (
        <Svg size={size} viewBox="0 0 32 32">
          <path d="M8 8L24 24M24 8L8 24" stroke="#F87171" strokeWidth="3" strokeLinecap="round" />
          <circle cx="16" cy="16" r="10" stroke="#FCA5A5" strokeWidth="2" fill="#7F1D1D" />
        </Svg>
      );
    case 'star-ally':
      return (
        <Svg size={size} viewBox="0 0 32 32">
          <path d="M16 6L18 14H26L20 18L22 26L16 22L10 26L12 18L6 14H14L16 6Z" fill="#4ADE80" stroke="#BBF7D0" strokeWidth="1" />
        </Svg>
      );
    case 'star-empty':
      return (
        <Svg size={size} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="3" fill="#78716C" />
        </Svg>
      );
    case 'module':
      return (
        <Svg size={size}>
          <rect x="16" y="16" width="32" height="32" rx="4" fill="#334155" stroke="#94A3B8" strokeWidth="2" />
          <circle cx="32" cy="32" r="8" fill="#0EA5E9" stroke="#BAE6FD" strokeWidth="2" />
          <path d="M32 8V16M32 48V56M8 32H16M48 32H56" stroke="#64748B" strokeWidth="3" />
        </Svg>
      );
    case 'chest':
      return (
        <Svg size={size}>
          <rect x="14" y="24" width="36" height="28" rx="4" fill="#92400E" stroke="#FBBF24" strokeWidth="2" />
          <path d="M14 32H50" stroke="#FDE68A" strokeWidth="2" />
          <rect x="26" y="30" width="12" height="10" rx="2" fill="#FBBF24" />
        </Svg>
      );
    case 'shield':
      return (
        <Svg size={size}>
          <path d="M32 8L52 18V34C52 46 32 56 32 56C32 56 12 46 12 34V18L32 8Z" fill="#3B82F6" stroke="#BFDBFE" strokeWidth="2" />
        </Svg>
      );
    case 'energy':
      return (
        <Svg size={size}>
          <path d="M36 8L20 36H30L28 56L44 24H34L36 8Z" fill="#A3E635" stroke="#ECFCCB" strokeWidth="2" />
        </Svg>
      );
    default:
      return null;
  }
}
