/**
 * Icons for the dropdown action menus, Quest modal and Construct-Buildings modal.
 * User-provided AAA SVG designs, adapted to TS. Pure presentational.
 */
import React from 'react';

type IconProps = { className?: string };

export const QuestAvatarIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" fill="#1e1b4b" />
    <path d="M32 64 C32 40 10 30 10 10 C10 0 54 0 54 10 C54 30 32 40 32 64 Z" fill="#312e81" />
    <circle cx="32" cy="24" r="12" fill="#a5b4fc" />
    <path d="M25 24 Q32 30 39 24" stroke="#4f46e5" strokeWidth="2" fill="none" />
    <circle cx="28" cy="20" r="2" fill="#ec4899" />
    <circle cx="36" cy="20" r="2" fill="#ec4899" />
    <path d="M20 10 Q10 15 5 5" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
    <path d="M44 10 Q54 15 59 5" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
    <rect width="64" height="64" stroke="#8b5cf6" strokeWidth="2" fill="none" opacity="0.5" />
  </svg>
);

export const IsometricBuilding = ({ className, type }: IconProps & { type?: string }) => {
  const isTech = type === 'tech';
  const isComp = type === 'comp';
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      <polygon points="50,70 90,50 50,30 10,50" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
      <polygon points="50,75 90,55 90,50 50,70" fill="#0f172a" />
      <polygon points="10,55 50,75 50,70 10,50" fill="#334155" />
      {isTech && (
        <>
          <polygon points="50,60 70,50 50,40 30,50" fill="#0ea5e9" opacity="0.8" />
          <polygon points="50,40 55,25 45,25" fill="#22c55e" />
          <circle cx="50" cy="20" r="4" fill="#a3e635" />
        </>
      )}
      {isComp && (
        <>
          <path d="M40 55 L40 30 C40 25 60 25 60 30 L60 45 Z" fill="#64748b" />
          <ellipse cx="50" cy="30" rx="10" ry="4" fill="#94a3b8" />
          <path d="M30 60 L30 45 A5 2 0 0 1 40 45 L40 55 Z" fill="#3b82f6" />
        </>
      )}
      {!isTech && !isComp && (
        <>
          <polygon points="50,55 65,45 50,35 35,45" fill="#f59e0b" />
          <polygon points="50,35 55,15 45,15" fill="#38bdf8" />
          <polygon points="35,45 30,25 40,35" fill="#38bdf8" />
          <polygon points="65,45 70,25 60,35" fill="#38bdf8" />
        </>
      )}
    </svg>
  );
};

export const ScienceAtomIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" fill="#38bdf8" />
    <ellipse cx="12" cy="12" rx="9" ry="3" stroke="#38bdf8" strokeWidth="1.5" transform="rotate(30 12 12)" />
    <ellipse cx="12" cy="12" rx="9" ry="3" stroke="#38bdf8" strokeWidth="1.5" transform="rotate(-30 12 12)" />
    <ellipse cx="12" cy="12" rx="9" ry="3" stroke="#38bdf8" strokeWidth="1.5" transform="rotate(90 12 12)" />
  </svg>
);

export const PieChartIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" />
    <path d="M12 12 L12 3 A9 9 0 0 1 20.48 9 L12 12 Z" fill="#facc15" />
    <path d="M12 12 L20.48 9 A9 9 0 0 1 12 21 L12 12 Z" fill="#60a5fa" />
    <circle cx="12" cy="12" r="3" fill="#0f172a" stroke="#3b82f6" strokeWidth="1" />
  </svg>
);

export const WarshipToolsIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M7 17 L15 9 M9 15 L17 7" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
    <circle cx="16" cy="8" r="2" fill="#3b82f6" />
    <path d="M5 19 L11 13" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
    <path d="M15 15 L19 19 M19 15 L15 19" stroke="#38bdf8" strokeWidth="1.5" />
  </svg>
);

export const ConstructBuildingIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <polygon points="12,21 19,18 12,15 5,18" fill="#22c55e" stroke="#16a34a" strokeWidth="1" />
    <rect x="8" y="9" width="8" height="8" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" />
    <polygon points="6,9 12,5 18,9" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" />
    <path d="M10 17 L10 13 H14 L14 17" fill="#94a3b8" />
  </svg>
);

export const HelmetIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <polygon points="12,21 19,18 12,15 5,18" fill="#22c55e" stroke="#16a34a" strokeWidth="1" />
    <path d="M12 6 C8 6 8 12 8 12 L16 12 C16 12 16 6 12 6 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
    <path d="M12 6 L12 3" stroke="#cbd5e1" strokeWidth="2" />
    <path d="M8 10 C5 10 3 6 3 6 C3 6 5 8 8 8" fill="#e2e8f0" />
    <path d="M16 10 C19 10 21 6 21 6 C21 6 19 8 16 8" fill="#e2e8f0" />
    <path d="M9 12 L9 16 M12 12 L12 17 M15 12 L15 16" stroke="#94a3b8" strokeWidth="1.5" />
  </svg>
);

export const QuestBoardIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect x="7" y="4" width="12" height="16" rx="1" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
    <rect x="8" y="6" width="10" height="12" fill="#f8fafc" />
    <path d="M10 8H16 M10 11H16 M10 14H14" stroke="#cbd5e1" strokeWidth="1" />
    <rect x="10" y="2" width="6" height="4" rx="1" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
    <path d="M3 8 L3 14" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
    <circle cx="3" cy="18" r="1.5" fill="#eab308" />
  </svg>
);

export const MailEnvelopeIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="7" width="18" height="12" rx="1" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
    <path d="M3 7 L12 13 L21 7" stroke="#94a3b8" strokeWidth="1.5" />
    <circle cx="19" cy="5" r="3" fill="#ef4444" stroke="#dc2626" strokeWidth="1" />
  </svg>
);

export const CubeItemIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <polygon points="12,5 19,9 12,13 5,9" fill="#60a5fa" stroke="#3b82f6" strokeWidth="1" />
    <polygon points="5,9 12,13 12,21 5,17" fill="#3b82f6" stroke="#2563eb" strokeWidth="1" />
    <polygon points="19,9 12,13 12,21 19,17" fill="#1e40af" stroke="#1d4ed8" strokeWidth="1" />
    <polygon points="12,7 16,9 12,11 8,9" fill="#bfdbfe" opacity="0.5" />
  </svg>
);
