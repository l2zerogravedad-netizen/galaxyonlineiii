"use client";

import type { BuildingType, GlowVariant } from "./game-data";

interface PlaceholderBuildingProps {
  type: BuildingType;
  glow?: GlowVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const glowColors: Record<GlowVariant, string> = {
  cyan: "#22d3ee",
  purple: "#a855f7",
  gold: "#fbbf24",
  red: "#f87171",
  orange: "#fb923c",
  green: "#4ade80",
  none: "#6b7280",
};

const sizeConfig = {
  sm: { width: 48, height: 48, stroke: 1.5 },
  md: { width: 72, height: 72, stroke: 2 },
  lg: { width: 120, height: 120, stroke: 2.5 },
};

export default function PlaceholderBuilding({
  type,
  glow = "cyan",
  size = "md",
  className = "",
}: PlaceholderBuildingProps) {
  const { width, height, stroke } = sizeConfig[size];
  const color = glowColors[glow];

  const renderBuilding = () => {
    switch (type) {
      case "metal_extractor":
        return (
          <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
            {/* Shadow */}
            <ellipse cx="60" cy="98" rx="40" ry="10" fill={color} opacity="0.12" />
            {/* Base */}
            <path d="M24 84H96L84 56H36L24 84Z" fill="#1e293b" stroke={color} strokeWidth={stroke} opacity="0.8" />
            {/* Detail */}
            <path d="M34 58H86V84H34V58Z" fill="#334155" opacity="0.6" />
            {/* Chimneys */}
            <path d="M43 48H53V58H43V48Z" fill={color} opacity="0.9" />
            <path d="M67 45H77V58H67V45Z" fill={color} opacity="0.9" />
            {/* Glow line */}
            <path d="M44 68H76" stroke={color} strokeWidth="3" opacity="0.5" />
          </svg>
        );

      case "plasma_refinery":
        return (
          <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
            <ellipse cx="60" cy="98" rx="40" ry="10" fill={color} opacity="0.15" />
            {/* Main structure */}
            <path d="M30 86H90V58H30V86Z" fill="#162d54" stroke={color} strokeWidth={stroke} opacity="0.8" />
            {/* Plasma chamber */}
            <rect x="50" y="28" width="20" height="58" rx="8" fill={color} opacity="0.3" stroke={color} strokeWidth={stroke} />
            {/* Glow core */}
            <circle cx="60" cy="34" r="11" fill={color} opacity="0.6">
              <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>
        );

      case "warehouse":
        return (
          <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
            <ellipse cx="60" cy="98" rx="40" ry="10" fill={color} opacity="0.10" />
            {/* Main box */}
            <rect x="28" y="52" width="64" height="38" rx="6" fill="#26374d" stroke={color} strokeWidth={stroke} opacity="0.8" />
            {/* Top */}
            <path d="M34 46H86V56H34V46Z" fill={color} opacity="0.3" />
            {/* Door line */}
            <path d="M43 68H77" stroke={color} strokeWidth="3" opacity="0.7" />
          </svg>
        );

      case "energy_generator":
        return (
          <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
            <ellipse cx="60" cy="98" rx="40" ry="10" fill={color} opacity="0.15" />
            {/* Core sphere */}
            <path d="M34 86H86V54C86 38 74 28 60 28C46 28 34 38 34 54V86Z" fill="#4736b9" stroke={color} strokeWidth={stroke} opacity="0.8" />
            {/* Antenna */}
            <path d="M60 20V42" stroke={color} strokeWidth="4" />
            {/* Core glow */}
            <circle cx="60" cy="48" r="11" fill={color} opacity="0.5">
              <animate attributeName="opacity" values="0.5;0.8;0.5" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </svg>
        );

      case "control_center":
        return (
          <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
            <ellipse cx="60" cy="98" rx="40" ry="10" fill={color} opacity="0.10" />
            {/* Base */}
            <rect x="36" y="44" width="48" height="44" rx="4" fill="#2d3f55" stroke={color} strokeWidth={stroke} opacity="0.8" />
            {/* Windows */}
            <path d="M46 55H56V66H46V55ZM64 55H74V66H64V55ZM46 72H56V83H46V72ZM64 72H74V83H64V72Z" fill={color} opacity="0.5" />
            {/* Antenna */}
            <path d="M60 44V25" stroke={color} strokeWidth="4" />
            <circle cx="60" cy="24" r="6" fill="#ef4444" />
          </svg>
        );

      case "shipyard":
        return (
          <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
            <ellipse cx="60" cy="98" rx="40" ry="10" fill={color} opacity="0.15" />
            {/* Main structure */}
            <path d="M20 88H100V60L90 50H30L20 60V88Z" fill="#1e293b" stroke={color} strokeWidth={stroke} opacity="0.8" />
            {/* Dock doors */}
            <path d="M30 88V70H50V88H30ZM70 88V70H90V88H70Z" fill={color} opacity="0.3" />
            {/* Ship silhouette */}
            <path d="M45 58L55 45L65 45L75 58H45Z" fill={color} opacity="0.4" />
          </svg>
        );

      case "research_lab":
        return (
          <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
            <ellipse cx="60" cy="98" rx="40" ry="10" fill={color} opacity="0.15" />
            {/* Dome */}
            <path d="M30 88H90V60C90 40 75 25 60 25C45 25 30 40 30 60V88Z" fill="#2d3f55" stroke={color} strokeWidth={stroke} opacity="0.8" />
            {/* Holographic display */}
            <ellipse cx="60" cy="50" rx="20" ry="10" fill={color} opacity="0.3">
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
            </ellipse>
            {/* Data lines */}
            <path d="M40 70H80M45 78H75" stroke={color} strokeWidth="2" opacity="0.5" />
          </svg>
        );

      case "hangar":
        return (
          <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
            <ellipse cx="60" cy="98" rx="40" ry="10" fill={color} opacity="0.12" />
            {/* Main structure */}
            <path d="M25 88H95V65C95 55 85 48 75 48H45C35 48 25 55 25 65V88Z" fill="#1e293b" stroke={color} strokeWidth={stroke} opacity="0.8" />
            {/* Open bay */}
            <path d="M35 88V68H85V88H35Z" fill="#0f172a" stroke={color} strokeWidth={stroke} opacity="0.6" />
            {/* Ships inside */}
            <path d="M45 75L55 65L65 65L75 75H45Z" fill={color} opacity="0.4" />
          </svg>
        );

      case "defense_turret":
        return (
          <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
            <ellipse cx="60" cy="98" rx="35" ry="8" fill={color} opacity="0.15" />
            {/* Base */}
            <rect x="35" y="70" width="50" height="20" rx="4" fill="#2d3f55" stroke={color} strokeWidth={stroke} opacity="0.8" />
            {/* Turret */}
            <circle cx="60" cy="65" r="18" fill={color} opacity="0.3" stroke={color} strokeWidth={stroke} />
            {/* Barrel */}
            <path d="M60 65L80 55L85 45" stroke={color} strokeWidth="4" strokeLinecap="round" />
            <circle cx="85" cy="45" r="4" fill={color} opacity="0.8">
              <animate attributeName="opacity" values="0.8;1;0.8" dur="1s" repeatCount="indefinite" />
            </circle>
          </svg>
        );

      case "empty":
        return (
          <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
            {/* Subtle square */}
            <rect x="30" y="40" width="60" height="50" rx="8" stroke={color} strokeWidth={stroke} opacity="0.3" strokeDasharray="4 4" />
            {/* Plus sign */}
            <path d="M60 50V80M45 65H75" stroke={color} strokeWidth={stroke} opacity="0.5" strokeLinecap="round" />
          </svg>
        );

      default:
        return (
          <svg width={width} height={height} viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="30" stroke={color} strokeWidth={stroke} opacity="0.25" />
            <path d="M60 42V78M42 60H78" stroke={color} strokeWidth="4" opacity="0.5" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {renderBuilding()}
    </div>
  );
}
