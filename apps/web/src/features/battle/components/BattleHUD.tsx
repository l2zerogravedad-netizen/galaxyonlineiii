'use client';

import React, { useCallback, useMemo } from 'react';
import { BattleTopBar } from './BattleTopBar';
import { HealthBar } from './HealthBar';
import { FloatingDamage } from './FloatingDamage';
import { BattleTimeline } from './BattleTimeline';
import { CommanderPortrait } from './CommanderPortrait';
import { MiniMap } from './MiniMap';
import type { BattleTopBarProps, PlayerInfo, BattlePhase } from './BattleTopBar';
import type { FloatingDamageItem } from './FloatingDamage';
import type { BattleEvent } from './BattleTimeline';
import type { Commander } from './CommanderPortrait';
import type { MapUnit } from './MiniMap';

export type SpeedLevel = 0.5 | 1 | 2 | 4;

export interface BattleState {
  attackerHp: { shield: number; shieldMax: number; hull: number; hullMax: number; he3: number; he3Max: number };
  defenderHp: { shield: number; shieldMax: number; hull: number; hullMax: number; he3: number; he3Max: number };
  attackerCommander: Commander;
  defenderCommander: Commander;
  activeCommanderId: string | null; // whose turn it is
}

export interface BattleHUDProps {
  battleState: BattleState;
  attacker: PlayerInfo;
  defender: PlayerInfo;
  currentRound: number;
  maxRounds: number;
  phase: BattlePhase;
  isPaused: boolean;
  speed: SpeedLevel;
  onPauseToggle: () => void;
  onSpeedChange: (speed: SpeedLevel) => void;
  onSkipRound: () => void;
  events: BattleEvent[];
  floatingDamages: FloatingDamageItem[];
  miniMapUnits?: MapUnit[];
  onMiniMapClick?: (x: number, y: number) => void;
  className?: string;
}

const speedOptions: SpeedLevel[] = [0.5, 1, 2, 4];

function SpeedButton({
  speed,
  isActive,
  onClick,
}: {
  speed: SpeedLevel;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative px-2 py-1 rounded text-[10px] font-bold tracking-wider transition-all duration-200"
      style={{
        color: isActive ? '#ffffff' : '#8b9bb4',
        background: isActive ? '#4488ff44' : '#1e2a4a66',
        border: isActive ? '1px solid #4488ff88' : '1px solid #1e2a4a',
        boxShadow: isActive ? '0 0 8px rgba(68,136,255,0.3)' : 'none',
        textShadow: isActive ? '0 0 4px rgba(68,136,255,0.5)' : 'none',
      }}
    >
      {speed}x
    </button>
  );
}

export function BattleHUD({
  battleState,
  attacker,
  defender,
  currentRound,
  maxRounds,
  phase,
  isPaused,
  speed,
  onPauseToggle,
  onSpeedChange,
  onSkipRound,
  events,
  floatingDamages,
  miniMapUnits = [],
  onMiniMapClick,
  className = '',
}: BattleHUDProps) {
  const { attackerHp, defenderHp, attackerCommander, defenderCommander, activeCommanderId } =
    battleState;

  const isAttackerActive = activeCommanderId === attackerCommander.name;
  const isDefenderActive = activeCommanderId === defenderCommander.name;

  // Demo minimap units if none provided
  const demoUnits: MapUnit[] = useMemo(
    () =>
      miniMapUnits.length > 0
        ? miniMapUnits
        : [
            { id: 'a1', x: 25, y: 40, team: 'ally', type: 'cruiser' },
            { id: 'a2', x: 20, y: 55, team: 'ally', type: 'frigate' },
            { id: 'a3', x: 30, y: 50, team: 'ally', type: 'fighter' },
            { id: 'a4', x: 22, y: 35, team: 'ally', type: 'destroyer', isDamaged: true },
            { id: 'e1', x: 75, y: 45, team: 'enemy', type: 'cruiser' },
            { id: 'e2', x: 80, y: 35, team: 'enemy', type: 'frigate', isDamaged: true },
            { id: 'e3', x: 70, y: 60, team: 'enemy', type: 'fighter' },
            { id: 'e4', x: 78, y: 55, team: 'enemy', type: 'destroyer' },
          ],
    [miniMapUnits]
  );

  return (
    <div
      className={`relative w-full h-full flex flex-col overflow-hidden select-none ${className}`}
      style={{
        background: '#0a0e1a',
        fontFamily: 'Orbitron, Inter, system-ui, sans-serif',
      }}
    >
      {/* ====== TOP BAR ====== */}
      <BattleTopBar
        attacker={attacker}
        defender={defender}
        currentRound={currentRound}
        maxRounds={maxRounds}
        phase={phase}
      />

      {/* ====== MAIN BATTLE AREA (middle section) ====== */}
      <div className="flex-1 relative min-h-0">
        {/* Floating damage numbers layer */}
        <FloatingDamage damages={floatingDamages} />

        {/* Center battle info overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Phase announcement - only show during transitions */}
          {phase === 'approach' && (
            <div
              className="text-center"
              style={{
                animation: 'phaseFadeIn 0.5s ease-out forwards',
              }}
            >
              <div
                className="text-lg font-black tracking-[0.3em] uppercase"
                style={{
                  color: '#4488ff',
                  textShadow: '0 0 20px rgba(68,136,255,0.4)',
                }}
              >
                FASE DE APROXIMACION
              </div>
            </div>
          )}
        </div>

        {/* Bottom-left: Commanders area */}
        <div className="absolute bottom-4 left-4 flex items-end gap-4 pointer-events-auto">
          {/* Attacker Commander */}
          <div className="flex flex-col items-center gap-2">
            <CommanderPortrait
              commander={attackerCommander}
              isActive={isAttackerActive}
              he3Percent={(attackerHp.he3 / attackerHp.he3Max) * 100}
              cooldowns={{}}
            />
            {/* Attacker health bars */}
            <div
              className="flex flex-col gap-1 p-2 rounded-lg"
              style={{
                background: '#12182b88',
                border: '1px solid #1e2a4a',
                backdropFilter: 'blur(8px)',
              }}
            >
              <HealthBar
                current={attackerHp.shield}
                max={attackerHp.shieldMax}
                type="shield"
                width={140}
                showText
              />
              <HealthBar
                current={attackerHp.hull}
                max={attackerHp.hullMax}
                type="hull"
                width={140}
                showText
              />
              <HealthBar
                current={attackerHp.he3}
                max={attackerHp.he3Max}
                type="he3"
                width={140}
                showText
              />
            </div>
          </div>

          {/* VS mini divider */}
          <div
            className="text-lg font-black tracking-widest self-center mb-16"
            style={{
              color: '#1e2a4a',
              textShadow: '0 0 4px rgba(68,136,255,0.2)',
            }}
          >
            VS
          </div>

          {/* Defender Commander */}
          <div className="flex flex-col items-center gap-2">
            <CommanderPortrait
              commander={defenderCommander}
              isActive={isDefenderActive}
              he3Percent={(defenderHp.he3 / defenderHp.he3Max) * 100}
              cooldowns={{}}
            />
            {/* Defender health bars */}
            <div
              className="flex flex-col gap-1 p-2 rounded-lg"
              style={{
                background: '#12182b88',
                border: '1px solid #1e2a4a',
                backdropFilter: 'blur(8px)',
              }}
            >
              <HealthBar
                current={defenderHp.shield}
                max={defenderHp.shieldMax}
                type="shield"
                width={140}
                showText
              />
              <HealthBar
                current={defenderHp.hull}
                max={defenderHp.hullMax}
                type="hull"
                width={140}
                showText
              />
              <HealthBar
                current={defenderHp.he3}
                max={defenderHp.he3Max}
                type="he3"
                width={140}
                showText
              />
            </div>
          </div>
        </div>

        {/* Bottom-right: MiniMap */}
        <div className="absolute bottom-4 right-4 pointer-events-auto">
          <MiniMap
            units={demoUnits}
            viewportX={20}
            viewportY={25}
            viewportW={60}
            viewportH={50}
            onClick={onMiniMapClick}
          />
        </div>

        {/* Top-right: Battle controls */}
        <div
          className="absolute top-4 right-4 flex flex-col items-end gap-2 pointer-events-auto"
        >
          {/* Control panel */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              background: '#12182b88',
              border: '1px solid #1e2a4a',
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* Pause/Play button */}
            <button
              onClick={onPauseToggle}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                background: isPaused ? '#44ff4422' : '#ff444422',
                border: `1.5px solid ${isPaused ? '#44ff44' : '#ff4444'}`,
                boxShadow: `0 0 8px ${isPaused ? 'rgba(68,255,68,0.2)' : 'rgba(255,68,68,0.2)'}`,
              }}
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#44ff44">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff4444">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              )}
            </button>

            {/* Speed controls */}
            <div className="flex items-center gap-1">
              {speedOptions.map((s) => (
                <SpeedButton
                  key={s}
                  speed={s}
                  isActive={speed === s}
                  onClick={() => onSpeedChange(s)}
                />
              ))}
            </div>

            {/* Skip button */}
            <button
              onClick={onSkipRound}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                background: '#ffd54f22',
                border: '1.5px solid #ffd54f',
                boxShadow: '0 0 8px rgba(255,213,79,0.2)',
              }}
              title="Skip Round"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffd54f">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>

          {/* Speed indicator */}
          <div
            className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded"
            style={{
              color: '#8b9bb4',
              background: '#1e2a4a66',
            }}
          >
            SPEED {speed}x
          </div>
        </div>

        {/* Top-left: Pause overlay indicator */}
        {isPaused && (
          <div
            className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              background: 'rgba(255, 68, 68, 0.15)',
              border: '1px solid rgba(255, 68, 68, 0.3)',
              backdropFilter: 'blur(8px)',
              animation: 'pausedPulse 1.5s ease-in-out infinite',
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: '#ff4444',
                boxShadow: '0 0 6px rgba(255,68,68,0.6)',
              }}
            />
            <span
              className="text-[10px] font-bold tracking-[0.15em] uppercase"
              style={{ color: '#ff4444' }}
            >
              PAUSED
            </span>
          </div>
        )}
      </div>

      {/* ====== BOTTOM TIMELINE ====== */}
      <BattleTimeline
        currentRound={currentRound}
        maxRounds={maxRounds}
        events={events}
        phase={phase}
      />

      {/* ====== GLOBAL STYLES ====== */}
      <style jsx global>{`
        @keyframes phaseFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pausedPulse {
          0%,
          100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
