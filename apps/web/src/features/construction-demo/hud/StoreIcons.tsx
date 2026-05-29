/**
 * Custom AAA-quality SVG icons for the GO2-style store and HUD.
 * Pure presentational components — no state, no deps beyond React.
 */
import React from 'react';

type IconProps = { className?: string };

export const CouponIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="14" rx="2" fill="url(#couponGrad)" stroke="#d8b4fe" strokeWidth="1" />
    <path d="M3 12H21" stroke="#9333ea" strokeWidth="2" strokeDasharray="2 2" />
    <circle cx="12" cy="12" r="3" fill="#c084fc" stroke="#f3e8ff" strokeWidth="1" />
    <defs>
      <linearGradient id="couponGrad" x1="3" y1="5" x2="21" y2="19">
        <stop stopColor="#4c1d95" />
        <stop offset="1" stopColor="#7e22ce" />
      </linearGradient>
    </defs>
  </svg>
);

export const BlueprintIcon = ({ className, color = '#06b6d4' }: IconProps & { color?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4" width="20" height="16" rx="1" fill="#082f49" stroke={color} strokeWidth="1" />
    <path d="M2 8H22M2 12H22M2 16H22M6 4V20M12 4V20M18 4V20" stroke={color} strokeWidth="0.5" opacity="0.3" />
    <path d="M5 12L10 8L15 10L19 7L17 16H8L5 12Z" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="10" cy="8" r="1" fill={color} />
    <circle cx="19" cy="7" r="1" fill={color} />
  </svg>
);

export const BookIcon = ({ className, color = '#22c55e', inner = '#166534' }: IconProps & { color?: string; inner?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect x="5" y="3" width="14" height="18" rx="1" fill={inner} stroke={color} strokeWidth="1.5" />
    <path d="M7 3V21" stroke={color} strokeWidth="1" />
    <path d="M12 8L14 12H10L12 8Z" fill={color} />
    <circle cx="12" cy="15" r="1.5" fill={color} />
    <path d="M16 6H18M16 10H18" stroke={color} strokeWidth="1" opacity="0.5" />
  </svg>
);

export const GemIcon = ({ className, color = '#ef4444', highlight = '#fca5a5' }: IconProps & { color?: string; highlight?: string }) => {
  const gid = `gemGrad-${color.replace('#', '')}`;
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <polygon points="12,2 19,8 16,20 8,20 5,8" fill={`url(#${gid})`} stroke={color} strokeWidth="1" />
      <polygon points="12,6 16,10 13,17 11,17 8,10" fill="none" stroke={highlight} strokeWidth="0.5" opacity="0.8" />
      <path d="M5 8L12 6L19 8" stroke={highlight} strokeWidth="0.5" />
      <defs>
        <radialGradient id={gid} cx="50%" cy="30%" r="70%">
          <stop stopColor={highlight} />
          <stop offset="50%" stopColor={color} />
          <stop offset="100%" stopColor="#450a0a" />
        </radialGradient>
      </defs>
    </svg>
  );
};

type PlanetType = 'lux' | 'met' | 'gas';
export const PlanetIcon = ({ className, type = 'lux' }: IconProps & { type?: PlanetType }) => {
  const colors: Record<PlanetType, { start: string; mid: string; end: string; stroke: string }> = {
    lux: { start: '#fca5a5', mid: '#ef4444', end: '#7f1d1d', stroke: '#f87171' },
    met: { start: '#fde047', mid: '#b45309', end: '#451a03', stroke: '#fcd34d' },
    gas: { start: '#86efac', mid: '#22c55e', end: '#14532d', stroke: '#4ade80' },
  };
  const c = colors[type];
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill={`url(#planetGrad-${type})`} stroke={c.stroke} strokeWidth="0.5" />
      {type === 'gas' ? (
        <path d="M3.5 10C8 11 16 11 20.5 10M4 14C8 15 16 15 20 14" stroke="#000" strokeWidth="1.5" opacity="0.3" />
      ) : (
        <path d="M5 10C8 12 16 12 19 10" stroke="#000" strokeWidth="2" opacity="0.4" />
      )}
      <defs>
        <radialGradient id={`planetGrad-${type}`} cx="30%" cy="30%" r="70%">
          <stop stopColor={c.start} /><stop offset="50%" stopColor={c.mid} /><stop offset="100%" stopColor={c.end} />
        </radialGradient>
      </defs>
    </svg>
  );
};

export const CardIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="6" width="18" height="12" rx="1" fill="#1e40af" stroke="#60a5fa" strokeWidth="1.5" transform="rotate(-10 12 12)" />
    <path d="M8 8L16 16M16 8L8 16" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
    <circle cx="12" cy="12" r="4" fill="#1e3a8a" opacity="0.5" />
  </svg>
);

export const ChipIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect x="5" y="5" width="14" height="14" rx="1" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" />
    <rect x="8" y="8" width="8" height="8" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" />
    <path d="M12 8V5M12 19V16M8 12H5M19 12H16" stroke="#38bdf8" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="1.5" fill="#bae6fd" />
  </svg>
);

export const RingPlanetIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <ellipse cx="12" cy="12" rx="10" ry="3" stroke="#38bdf8" strokeWidth="1.5" transform="rotate(-20 12 12)" fill="rgba(56,189,248,0.2)" />
    <circle cx="12" cy="12" r="5" fill="url(#greenPlanet)" />
    <defs>
      <radialGradient id="greenPlanet" cx="30%" cy="30%" r="70%">
        <stop stopColor="#86efac" />
        <stop offset="60%" stopColor="#22c55e" />
        <stop offset="100%" stopColor="#14532d" />
      </radialGradient>
    </defs>
  </svg>
);

export const SolarSystemIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" fill="#fbbf24" />
    <ellipse cx="12" cy="12" rx="8" ry="4" stroke="#60a5fa" strokeWidth="0.5" transform="rotate(15 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="5" stroke="#a78bfa" strokeWidth="0.5" transform="rotate(-25 12 12)" />
    <circle cx="5" cy="10" r="1.5" fill="#a78bfa" />
    <circle cx="19" cy="15" r="1" fill="#60a5fa" />
  </svg>
);

export const BaseHomeIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 3 L2 11 L4 11 L4 20 L20 20 L20 11 L22 11 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
    <rect x="10" y="14" width="4" height="6" fill="#1e293b" />
    <path d="M12 2 L22 10 H2 Z" fill="#3b82f6" opacity="0.5" />
    <circle cx="12" cy="7" r="1.5" fill="#fde047" />
  </svg>
);

export const FactoryIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect x="6" y="8" width="5" height="12" rx="1" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
    <rect x="13" y="12" width="5" height="8" rx="1" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
    <path d="M8 8 L8 4 M15 12 L15 8" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const NetworkGlobeIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="8" stroke="#38bdf8" strokeWidth="1.5" fill="#0c4a6e" opacity="0.8" />
    <path d="M12 4 C8 8 8 16 12 20 M12 4 C16 8 16 16 12 20 M4 12 H20" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
    <path d="M2 12 L8 6 L12 2 L16 6 L22 12 L16 18 L12 22 L8 18 Z" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="1 2" />
  </svg>
);

export const JetIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 2 L14 10 L22 14 L14 16 L12 22 L10 16 L2 14 L10 10 Z" fill="#2563eb" stroke="#60a5fa" strokeWidth="1" strokeLinejoin="round" />
    <path d="M12 6 L13 10 L12 18 L11 10 Z" fill="#93c5fd" opacity="0.5" />
  </svg>
);

export const AllianceIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="8" cy="8" r="3" fill="#4ade80" />
    <path d="M3 20 C3 14 13 14 13 20" fill="#22c55e" stroke="#166534" strokeWidth="1" />
    <circle cx="16" cy="10" r="3" fill="#60a5fa" />
    <path d="M11 20 C11 15 21 15 21 20" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="1" />
  </svg>
);

export const RadarIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M6 20 L10 14" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
    <path d="M18 6 A8 8 0 0 0 4 12" stroke="#cbd5e1" strokeWidth="2" fill="none" />
    <path d="M22 2 A12 12 0 0 0 2 14" stroke="#64748b" strokeWidth="1.5" fill="none" opacity="0.6" />
    <circle cx="10" cy="14" r="2" fill="#38bdf8" />
    <line x1="10" y1="14" x2="16" y2="8" stroke="#38bdf8" strokeWidth="2" />
    <circle cx="16" cy="8" r="1.5" fill="#fde047" />
  </svg>
);
