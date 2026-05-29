/**
 * AAA sci-fi menu icons — hand-crafted SVG (vector, transparent, crisp at any size).
 * Replaces the baked-background Meshy PNGs: no square frame, no scaling artifacts.
 * Each icon uses layered radial/linear gradients, rim glow and a specular highlight
 * for a glossy 3D look that sits cleanly on the round glowing buttons.
 *
 * Drop-in: same API as the old SVGs — pass `className` (e.g. "w-9 h-9").
 */
import React from 'react';

type IconProps = { className?: string };

/** Shared defs: soft drop glow used by all icons. */
const Glow = ({ id, color }: { id: string; color: string }) => (
  <filter id={id} x="-40%" y="-40%" width="180%" height="180%">
    <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={color} floodOpacity="0.9" />
  </filter>
);

/* ── 1. Research (atom + flask) ───────────────────────────────────────────── */
export const AAAResearchIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="rsFlask" cx="50%" cy="35%" r="75%">
        <stop offset="0%" stopColor="#bdf0ff" /><stop offset="55%" stopColor="#4fb6ff" /><stop offset="100%" stopColor="#1c5fae" />
      </radialGradient>
      <Glow id="rsGlow" color="#46c8ff" />
    </defs>
    <g filter="url(#rsGlow)">
      {/* atom */}
      <g stroke="#9fe5ff" strokeWidth="3" opacity="0.95">
        <ellipse cx="37" cy="34" rx="20" ry="8" />
        <ellipse cx="37" cy="34" rx="20" ry="8" transform="rotate(60 37 34)" />
        <ellipse cx="37" cy="34" rx="20" ry="8" transform="rotate(-60 37 34)" />
      </g>
      <circle cx="37" cy="34" r="5" fill="#eaffff" />
      {/* flask */}
      <path d="M58 40 h16 v12 l12 26 a8 8 0 0 1 -7 12 h-26 a8 8 0 0 1 -7 -12 l12 -26 z"
        fill="url(#rsFlask)" stroke="#cdeeff" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M62 70 h22" stroke="#dff6ff" strokeWidth="3" opacity="0.7" />
      <circle cx="68" cy="78" r="2.5" fill="#eaffff" opacity="0.9" />
      <circle cx="78" cy="74" r="1.8" fill="#eaffff" opacity="0.7" />
    </g>
    <ellipse cx="44" cy="22" rx="14" ry="6" fill="#ffffff" opacity="0.18" />
  </svg>
);

/* ── 2. Reactor (glowing nuclear core) ────────────────────────────────────── */
export const AAAReactorIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="rcDisc" cx="50%" cy="40%" r="65%">
        <stop offset="0%" stopColor="#cfe8ff" /><stop offset="60%" stopColor="#5a9bdd" /><stop offset="100%" stopColor="#1b3f6e" />
      </radialGradient>
      <radialGradient id="rcCore" cx="50%" cy="45%" r="60%">
        <stop offset="0%" stopColor="#fff6c8" /><stop offset="45%" stopColor="#ffb43c" /><stop offset="100%" stopColor="#d8731a" />
      </radialGradient>
      <Glow id="rcGlow" color="#ffb43c" />
    </defs>
    <g filter="url(#rcGlow)">
      <circle cx="50" cy="50" r="34" fill="url(#rcDisc)" stroke="#bfe0ff" strokeWidth="2.5" />
      {/* radiation blades */}
      <g fill="#0e2c4f" opacity="0.85">
        <path d="M50 50 L66 24 A30 30 0 0 0 34 24 Z" />
        <path d="M50 50 L78 64 A30 30 0 0 0 78 36 Z" transform="rotate(120 50 50)" />
        <path d="M50 50 L78 64 A30 30 0 0 0 78 36 Z" transform="rotate(240 50 50)" />
      </g>
      <circle cx="50" cy="50" r="11" fill="url(#rcCore)" stroke="#fff2c0" strokeWidth="2" />
    </g>
    <ellipse cx="42" cy="34" rx="16" ry="7" fill="#ffffff" opacity="0.2" />
  </svg>
);

/* ── 3. Shipyard (jet + wrench) ───────────────────────────────────────────── */
export const AAAShipIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="shJet" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#9ccbff" /><stop offset="100%" stopColor="#2563c8" />
      </linearGradient>
      <linearGradient id="shWr" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#eef4ff" /><stop offset="100%" stopColor="#9fb3cf" />
      </linearGradient>
      <Glow id="shGlow" color="#4f9bff" />
    </defs>
    <g filter="url(#shGlow)">
      {/* jet */}
      <path d="M50 16 L60 52 L84 66 L60 70 L50 90 L40 70 L16 66 L40 52 Z"
        fill="url(#shJet)" stroke="#cfe2ff" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M50 26 L55 52 L50 80 L45 52 Z" fill="#dbeaff" opacity="0.6" />
      {/* wrench */}
      <g transform="rotate(-35 70 32)">
        <rect x="64" y="20" width="9" height="30" rx="4" fill="url(#shWr)" stroke="#7c93b3" strokeWidth="1.5" />
        <path d="M62 18 a9 9 0 1 1 13 0 l-4 4 -5 -3 -4 3 z" fill="url(#shWr)" stroke="#7c93b3" strokeWidth="1.5" />
      </g>
    </g>
  </svg>
);

/* ── 4. Base (isometric buildings on a plate) ─────────────────────────────── */
export const AAABaseIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="bsPlate" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3ddc84" /><stop offset="100%" stopColor="#178a4e" />
      </linearGradient>
      <linearGradient id="bsWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f1f5fb" /><stop offset="100%" stopColor="#b8c6da" />
      </linearGradient>
      <Glow id="bsGlow" color="#3ddc84" />
    </defs>
    <g filter="url(#bsGlow)">
      {/* ground plate */}
      <path d="M50 74 L86 56 L50 38 L14 56 Z" fill="url(#bsPlate)" stroke="#0f6b3c" strokeWidth="2" />
      {/* big building */}
      <path d="M34 58 L34 36 L50 28 L50 50 Z" fill="url(#bsWall)" />
      <path d="M50 50 L50 28 L62 34 L62 56 Z" fill="#9fb0c8" />
      <path d="M34 36 L50 28 L62 34 L50 42 Z" fill="#5b8cff" />
      {/* small building */}
      <path d="M52 62 L52 48 L62 43 L62 57 Z" fill="url(#bsWall)" />
      <path d="M62 57 L62 43 L70 47 L70 61 Z" fill="#9fb0c8" />
      <circle cx="44" cy="33" r="2.2" fill="#ffe27a" />
    </g>
  </svg>
);

/* ── 5. Alliance (people over a network globe) ────────────────────────────── */
export const AAAAllianceIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="alGlobe" cx="50%" cy="40%" r="65%">
        <stop offset="0%" stopColor="#7fe0ff" /><stop offset="60%" stopColor="#2c8fd6" /><stop offset="100%" stopColor="#123f6e" />
      </radialGradient>
      <Glow id="alGlow" color="#46c8ff" />
    </defs>
    <g filter="url(#alGlow)">
      <circle cx="50" cy="56" r="30" fill="url(#alGlobe)" stroke="#bfe6ff" strokeWidth="2" />
      <g stroke="#bfe6ff" strokeWidth="1.4" opacity="0.6" fill="none">
        <ellipse cx="50" cy="56" rx="30" ry="11" /><ellipse cx="50" cy="56" rx="14" ry="30" /><path d="M20 56 h60" />
      </g>
      {/* two figures */}
      <g fill="#eef7ff" stroke="#1a4e7a" strokeWidth="1.5">
        <circle cx="40" cy="42" r="7" /><path d="M28 60 a12 12 0 0 1 24 0 z" />
        <circle cx="60" cy="46" r="6" /><path d="M50 62 a11 11 0 0 1 21 0 z" />
      </g>
    </g>
    <ellipse cx="42" cy="40" rx="14" ry="6" fill="#ffffff" opacity="0.18" />
  </svg>
);

/* ── 6. Main / Galaxy (network globe in a ring) ───────────────────────────── */
export const AAAMainIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="mnGlobe" cx="50%" cy="38%" r="68%">
        <stop offset="0%" stopColor="#9fe9ff" /><stop offset="55%" stopColor="#2f9bff" /><stop offset="100%" stopColor="#0f2f66" />
      </radialGradient>
      <linearGradient id="mnRing" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#7fd0ff" /><stop offset="100%" stopColor="#2563c8" />
      </linearGradient>
      <Glow id="mnGlow" color="#4fb6ff" />
    </defs>
    <g filter="url(#mnGlow)">
      <circle cx="50" cy="50" r="36" fill="none" stroke="url(#mnRing)" strokeWidth="5" />
      <circle cx="50" cy="50" r="26" fill="url(#mnGlobe)" stroke="#cdeeff" strokeWidth="1.5" />
      <g stroke="#dff4ff" strokeWidth="1.3" opacity="0.7" fill="none">
        <ellipse cx="50" cy="50" rx="26" ry="10" /><ellipse cx="50" cy="50" rx="11" ry="26" /><path d="M24 50 h52" />
      </g>
      {/* node dots */}
      <g fill="#eaffff">
        <circle cx="38" cy="40" r="2.4" /><circle cx="62" cy="44" r="2.4" /><circle cx="50" cy="62" r="2.4" />
      </g>
    </g>
    <ellipse cx="42" cy="34" rx="15" ry="6" fill="#ffffff" opacity="0.22" />
  </svg>
);
