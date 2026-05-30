import type { ReactNode } from 'react';
import type { BuildingId } from './types';

const GLYPHS: Record<BuildingId, { paths: ReactNode; glow: string }> = {
  core_drill: {
    glow: '#38bdf8',
    paths: <polygon points="36,8 52,28 20,28" fill="#0ea5e9" />,
  },
  crystal_lattice: {
    glow: '#a78bfa',
    paths: <rect x="14" y="22" width="44" height="18" rx="3" fill="#7c3aed" />,
  },
  flux_reactor: {
    glow: '#4ade80',
    paths: <circle cx="36" cy="20" r="10" fill="#22c55e" />,
  },
  nova_collider: {
    glow: '#f472b6',
    paths: <ellipse cx="36" cy="24" rx="20" ry="12" fill="#db2777" />,
  },
  vault_silo: {
    glow: '#fbbf24',
    paths: <rect x="12" y="18" width="48" height="24" rx="4" fill="#b45309" />,
  },
  habitat_pod: {
    glow: '#86efac',
    paths: (
      <>
        <rect x="10" y="26" width="14" height="14" fill="#15803d" />
        <rect x="28" y="22" width="16" height="18" fill="#166534" />
      </>
    ),
  },
  blueforge_citadel: {
    glow: '#818cf8',
    paths: <polygon points="36,4 62,24 62,44 10,44 10,24" fill="#4338ca" />,
  },
  nexus_spire: {
    glow: '#818cf8',
    paths: <polygon points="36,6 58,22 58,40 14,40 14,22" fill="#4f46e5" />,
  },
  prism_lab: {
    glow: '#c4b5fd',
    paths: <rect x="16" y="20" width="40" height="22" rx="3" fill="#6366f1" />,
  },
  trade_nexus: {
    glow: '#fcd34d',
    paths: <circle cx="36" cy="22" r="12" fill="#eab308" />,
  },
  forge_dock: {
    glow: '#60a5fa',
    paths: <polygon points="36,10 62,28 10,28" fill="#2563eb" />,
  },
  launch_ring: {
    glow: '#7dd3fc',
    paths: <ellipse cx="36" cy="26" rx="28" ry="10" fill="none" stroke="#38bdf8" strokeWidth="4" />,
  },
  pulse_turret: {
    glow: '#f87171',
    paths: <rect x="28" y="16" width="16" height="20" fill="#dc2626" />,
  },
  sweep_array: {
    glow: '#94a3b8',
    paths: <polygon points="36,12 54,32 18,32" fill="#475569" />,
  },
};

export function StructureGlyph({
  id,
  className = '',
}: {
  id: BuildingId;
  className?: string;
}) {
  const g = GLYPHS[id];
  return (
    <svg viewBox="0 0 72 44" className={className} aria-hidden>
      <g style={{ filter: `drop-shadow(0 0 6px ${g.glow})` }}>{g.paths}</g>
    </svg>
  );
}
