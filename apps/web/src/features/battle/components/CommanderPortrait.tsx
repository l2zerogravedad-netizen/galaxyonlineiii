'use client';

import React, { useMemo } from 'react';

export type Rarity = 'legendary' | 'epic' | 'rare' | 'common';

export interface Commander {
  id?: string;
  name: string;
  level: number;
  stars: number; // 1-6
  rarity: Rarity;
  avatarUrl?: string;
  faction?: string;
  // Optional combat stats (carried from engine commander; not all consumers use them)
  accuracy?: number;
  speed?: number;
  dodge?: number;
  electron?: number;
  skill?: string;
  activeSkill?: {
    name: string;
    icon: string;
    cooldown: number;
    maxCooldown: number;
  };
}

export interface CommanderPortraitProps {
  commander: Commander;
  isActive: boolean;
  he3Percent?: number; // 0-100
  faction?: 'attacker' | 'defender';
  cooldowns?: Record<string, number>;
  className?: string;
}

const rarityConfig: Record<Rarity, { color: string; glow: string; label: string }> = {
  legendary: {
    color: '#ffd54f',
    glow: 'rgba(255, 213, 79, 0.5)',
    label: 'LEGENDARY',
  },
  epic: {
    color: '#c0c0c0',
    glow: 'rgba(192, 192, 192, 0.4)',
    label: 'EPIC',
  },
  rare: {
    color: '#cd7f32',
    glow: 'rgba(205, 127, 50, 0.4)',
    label: 'RARE',
  },
  common: {
    color: '#8b9bb4',
    glow: 'rgba(139, 155, 180, 0.3)',
    label: 'COMMON',
  },
};

function StarDisplay({ count, color }: { count: number; color: string }) {
  return (
    <div className="flex gap-px justify-center mt-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <svg
          key={i}
          width="8"
          height="8"
          viewBox="0 0 24 24"
          fill={i < count ? color : '#1e2a4a'}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function He3Gauge({ percent }: { percent: number }) {
  const radius = 38;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  // Color transitions from green -> yellow -> orange -> red
  const getHe3Color = (p: number) => {
    if (p > 60) return '#44ff44';
    if (p > 30) return '#ffd54f';
    return '#ff4444';
  };

  const color = getHe3Color(percent);

  return (
    <svg
      width="84"
      height="84"
      className="absolute -inset-0.5"
      style={{ transform: 'rotate(-90deg)' }}
    >
      {/* Background circle */}
      <circle
        cx="42"
        cy="42"
        r={radius}
        fill="none"
        stroke="#1e2a4a"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        cx="42"
        cy="42"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 0 3px ${color}88)`,
          transition: 'stroke-dashoffset 500ms ease-out, stroke 300ms ease',
        }}
      />
    </svg>
  );
}

function CooldownOverlay({
  cooldown,
  maxCooldown,
}: {
  cooldown: number;
  maxCooldown: number;
}) {
  const percent = maxCooldown > 0 ? cooldown / maxCooldown : 0;
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - percent * circumference;

  return (
    <div className="absolute -bottom-1 -right-1 w-8 h-8">
      <svg width="32" height="32" className="absolute" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="16" cy="16" r={radius} fill="#0a0e1a" stroke="#1e2a4a" strokeWidth="2" />
        <circle
          cx="16"
          cy="16"
          r={radius}
          fill="none"
          stroke="#4488ff"
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-[9px] font-bold"
        style={{ color: '#ffffff' }}
      >
        {cooldown > 0 ? cooldown : ''}
      </span>
    </div>
  );
}

export function CommanderPortrait({
  commander,
  isActive,
  he3Percent = 0,
  cooldowns = {},
  className = '',
}: CommanderPortraitProps) {
  const rarity = rarityConfig[commander.rarity];
  const initial = commander.name.charAt(0).toUpperCase();

  // He3 color for text display
  const he3Color = useMemo(() => {
    if (he3Percent > 60) return '#44ff44';
    if (he3Percent > 30) return '#ffd54f';
    return '#ff4444';
  }, [he3Percent]);

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      {/* Portrait container */}
      <div className="relative">
        {/* Active turn indicator arrow */}
        {isActive && (
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2"
            style={{
              animation: 'arrowBounce 0.8s ease-in-out infinite',
            }}
          >
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path
                d="M8 0L16 12H0L8 0Z"
                fill={rarity.color}
                style={{ filter: `drop-shadow(0 0 4px ${rarity.glow})` }}
              />
            </svg>
          </div>
        )}

        {/* Outer glow ring when active */}
        {isActive && (
          <div
            className="absolute -inset-1 rounded-full"
            style={{
              border: `2px solid ${rarity.color}`,
              boxShadow: `0 0 12px ${rarity.glow}, 0 0 24px ${rarity.glow}, inset 0 0 12px ${rarity.glow}`,
              animation: 'activePulse 1.5s ease-in-out infinite',
            }}
          />
        )}

        {/* He3 gauge */}
        <He3Gauge percent={he3Percent} />

        {/* Portrait circle */}
        <div
          className="relative w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
          style={{
            border: `2.5px solid ${rarity.color}`,
            boxShadow: isActive
              ? `0 0 8px ${rarity.glow}`
              : `0 0 4px ${rarity.glow}44`,
            background: `radial-gradient(circle at 40% 35%, ${rarity.color}33, #0a0e1a)`,
          }}
        >
          {commander.avatarUrl ? (
            <img
              src={commander.avatarUrl}
              alt={commander.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span
              className="text-2xl font-black"
              style={{
                color: rarity.color,
                textShadow: `0 0 8px ${rarity.glow}`,
              }}
            >
              {initial}
            </span>
          )}

          {/* Dim overlay when not active */}
          {!isActive && (
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(10, 14, 26, 0.35)' }}
            />
          )}

          {/* Skill cooldown overlay */}
          {commander.activeSkill && cooldowns[commander.activeSkill.name] > 0 && (
            <CooldownOverlay
              cooldown={cooldowns[commander.activeSkill.name]}
              maxCooldown={commander.activeSkill.maxCooldown}
            />
          )}
        </div>
      </div>

      {/* Name */}
      <span
        className="text-[11px] font-bold text-center truncate max-w-[100px] leading-tight"
        style={{ color: '#ffffff' }}
      >
        {commander.name}
      </span>

      {/* Level + rarity tag */}
      <div className="flex items-center gap-1.5">
        <span
          className="text-[9px] font-bold px-1.5 py-px rounded"
          style={{
            color: rarity.color,
            background: `${rarity.color}22`,
            border: `1px solid ${rarity.color}44`,
          }}
        >
          Lv.{commander.level}
        </span>
        <span
          className="text-[8px] font-bold tracking-wider uppercase"
          style={{ color: rarity.color }}
        >
          {rarity.label}
        </span>
      </div>

      {/* Stars */}
      <StarDisplay count={commander.stars} color={rarity.color} />

      {/* He3 text */}
      <div
        className="flex items-center gap-1 mt-0.5"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill={he3Color}>
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        <span
          className="text-[9px] font-bold tabular-nums"
          style={{ color: he3Color }}
        >
          {Math.round(he3Percent)}%
        </span>
      </div>

      {/* CSS Keyframes */}
      <style jsx>{`
        @keyframes activePulse {
          0%,
          100% {
            box-shadow: 0 0 8px ${rarity.glow}, 0 0 16px ${rarity.glow}66, inset 0 0 8px ${rarity.glow}33;
            opacity: 0.8;
          }
          50% {
            box-shadow: 0 0 16px ${rarity.glow}, 0 0 32px ${rarity.glow}88, inset 0 0 16px ${rarity.glow}55;
            opacity: 1;
          }
        }
        @keyframes arrowBounce {
          0%,
          100% {
            transform: translateX(-50%) translateY(0);
          }
          50% {
            transform: translateX(-50%) translateY(-4px);
          }
        }
      `}</style>
    </div>
  );
}
