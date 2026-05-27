'use client';

import { useState, useEffect, useCallback } from 'react';

// ------------------------------------------------------------
// Hospital bed — holds one injured commander
// ------------------------------------------------------------
export interface HospitalBed {
  commanderId: string;
  commanderName: string;
  rarity: 'common' | 'super' | 'legendary' | 'divine';
  totalHealingTime: number; // total seconds to heal
  remainingTime: number; // seconds remaining
  startTime: number; // timestamp when healing started
}

// ------------------------------------------------------------
// Hospital configuration
// ------------------------------------------------------------
export interface HospitalConfig {
  totalBeds: number;
  bedsInUse: number;
}

// ------------------------------------------------------------
// Props
// ------------------------------------------------------------
interface Go2HospitalProps {
  beds: HospitalBed[];
  totalBeds: number;
  onSpeedUp: (commanderId: string, cost: number) => void;
  onUpgradeHospital: () => void;
  upgradeCost: number;
  premiumCurrency: number; // player's current premium currency
  onHealComplete: (commanderId: string) => void;
}

/* ────────────────────────── helpers ────────────────────────── */

function formatTime(seconds: number): string {
  if (seconds <= 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const h = Math.floor(m / 60);
  if (h > 0) {
    const remM = m % 60;
    return `${h}:${remM.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'divine':
      return '#ff9800';
    case 'legendary':
      return '#9c27b0';
    case 'super':
      return '#2196f3';
    default:
      return '#4caf50';
  }
}

function getSpeedUpCost(remainingSeconds: number): number {
  // 1 premium currency per minute remaining, minimum 1
  return Math.max(1, Math.ceil(remainingSeconds / 60));
}

function BedCard({
  bed,
  onSpeedUp,
  canAfford,
}: {
  bed: HospitalBed;
  onSpeedUp: (id: string, cost: number) => void;
  canAfford: boolean;
}) {
  const [displayTime, setDisplayTime] = useState(bed.remainingTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayTime((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const speedUpCost = getSpeedUpCost(displayTime);
  const progress =
    bed.totalHealingTime > 0
      ? ((bed.totalHealingTime - displayTime) / bed.totalHealingTime) * 100
      : 100;
  const rarityColor = getRarityColor(bed.rarity);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[#1976d2]/25 bg-gradient-to-b from-[#0d2b5e]/50 to-[#081428]/70 p-3">
      {/* Commander info */}
      <div className="flex items-center gap-2.5">
        {/* Rarity dot */}
        <div
          className="h-3 w-3 shrink-0 rounded-full shadow"
          style={{ backgroundColor: rarityColor, boxShadow: `0 0 6px ${rarityColor}` }}
        />

        <div className="flex flex-col">
          <span className="text-[12px] font-bold text-white">{bed.commanderName}</span>
          <span className="text-[9px] font-semibold uppercase tracking-wider text-white/40">
            {bed.rarity}
          </span>
        </div>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff4444] opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff4444]" />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff6b6b]">
          Recovering
        </span>
      </div>

      {/* Timer */}
      <div className="flex items-center gap-2">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-white/40"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12,6 12,12 16,14" />
        </svg>
        <span
          className={`font-mono text-[14px] font-bold ${
            displayTime < 60 ? 'text-[#ff6b6b]' : 'text-[#64b5f6]'
          }`}
        >
          {formatTime(displayTime)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#1976d2] to-[#64b5f6] transition-all duration-1000"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>

      {/* Speed up button */}
      <button
        onClick={() => onSpeedUp(bed.commanderId, speedUpCost)}
        disabled={!canAfford || displayTime <= 0}
        className={`mt-1 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-150 ${
          canAfford && displayTime > 0
            ? 'border-[#ffd54f]/40 bg-[#ffd54f]/10 text-[#ffd54f] hover:bg-[#ffd54f]/20 hover:shadow-[0_0_12px_rgba(255,213,79,0.2)]'
            : 'cursor-not-allowed border-white/5 bg-white/5 text-white/20'
        }`}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
        </svg>
        Speed Up ({speedUpCost} ★)
      </button>
    </div>
  );
}

/* ────────────────────────── main component ────────────────────────── */

export default function Go2Hospital({
  beds,
  totalBeds,
  onSpeedUp,
  onUpgradeHospital,
  upgradeCost,
  premiumCurrency,
  onHealComplete,
}: Go2HospitalProps) {
  // Check for completed heals every second
  useEffect(() => {
    const interval = setInterval(() => {
      for (const bed of beds) {
        if (bed.remainingTime <= 0) {
          onHealComplete(bed.commanderId);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [beds, onHealComplete]);

  const freeBeds = totalBeds - beds.length;
  const canAffordUpgrade = premiumCurrency >= upgradeCost;

  return (
    <div className="flex w-[380px] flex-col gap-3 overflow-hidden rounded-xl border border-[#1976d2]/30 bg-gradient-to-b from-[#0a1f44] to-[#060e1f] shadow-2xl">
      {/* ─── Header ─── */}
      <div className="border-b border-[#1976d2]/30 bg-[#0d2b5e]/60 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#64b5f6]">
            Hospital
          </h3>
          {/* Bed count indicator */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalBeds }, (_, i) => (
              <div
                key={i}
                className={`h-3 w-6 rounded-sm border ${
                  i < beds.length
                    ? 'border-[#ff6b6b]/40 bg-[#ff6b6b]/20'
                    : 'border-[#4caf50]/40 bg-[#4caf50]/20'
                }`}
                title={i < beds.length ? 'Occupied' : 'Available'}
              />
            ))}
          </div>
        </div>
        <p className="mt-1 text-[10px] text-white/40">
          {beds.length}/{totalBeds} beds in use
          {freeBeds > 0 && (
            <span className="ml-1 text-[#4caf50]">
              ({freeBeds} available)
            </span>
          )}
        </p>
      </div>

      {/* ─── No injured message ─── */}
      {beds.length === 0 && (
        <div className="flex flex-col items-center gap-2 px-4 py-8">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-[#4caf50]/50"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          <span className="text-[12px] font-bold text-white/50">
            No injured commanders
          </span>
          <span className="text-center text-[10px] leading-relaxed text-white/30">
            Injured commanders will appear here after combat.
            <br />
            They cannot be used in fleets until fully healed.
          </span>
        </div>
      )}

      {/* ─── Bed cards ─── */}
      {beds.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5 px-4 pb-2">
          {beds.map((bed) => (
            <BedCard
              key={bed.commanderId}
              bed={bed}
              onSpeedUp={onSpeedUp}
              canAfford={premiumCurrency >= getSpeedUpCost(bed.remainingTime)}
            />
          ))}
        </div>
      )}

      {/* ─── Divider ─── */}
      <div className="mx-4 border-t border-[#1976d2]/20" />

      {/* ─── Upgrade Section ─── */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
            Hospital Level
          </span>
          <span className="text-[12px] text-white/60">
            {totalBeds} beds
          </span>
        </div>
        <button
          onClick={onUpgradeHospital}
          disabled={!canAffordUpgrade}
          className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-150 ${
            canAffordUpgrade
              ? 'border-[#4caf50]/40 bg-[#4caf50]/10 text-[#4caf50] hover:bg-[#4caf50]/20 hover:shadow-[0_0_12px_rgba(76,175,80,0.2)]'
              : 'cursor-not-allowed border-white/5 bg-white/5 text-white/20'
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          Upgrade ({upgradeCost} ★)
        </button>
      </div>

      {/* ─── Info ─── */}
      <div className="border-t border-[#1976d2]/20 bg-[#081428]/40 px-4 py-2.5">
        <p className="text-center text-[9px] leading-relaxed text-white/30">
          Commanders are injured when their fleet is destroyed in combat.
          <br />
          Injured commanders cannot be assigned to fleets until recovered.
          <br />
          Healing time: 5 minutes per injury severity level.
        </p>
      </div>
    </div>
  );
}
