'use client';

/**
 * Go2PreBattle.tsx
 *
 * Pre-battle deployment screen for Galaxy Online 2.
 *
 * ┌─ DEPLOY FLEET ──────────────────────────────────────────────┐
 * │  Enemy: [PlayerName]  Planet: [PlanetName]                  │
 * │                                                             │
 * │  ┌─ Enemy Preview ───┐  ┌─ Your Formation ──┐              │
 * │  │ Commander: Gastaf │  │ [1] [2] [3]       │              │
 * │  │ Lv.38 ★★★★★      │  │ [4] [5] [6]       │              │
 * │  │                   │  │ [7] [8] [9]       │              │
 * │  │ Ships:            │  │                   │              │
 * │  │ ⚔️ 9 stacks       │  │ Commander: Reggie │              │
 * │  │ 💀 High threat    │  │ Lv.5 ★★          │              │
 * │  │                   │  │ [Select Cmder ▼]  │              │
 * │  │ [Intel Report]    │  └───────────────────┘              │
 * │  └───────────────────┘                                     │
 * │                                                             │
 * │  Targeting: [Closest ▼]  Range: [Min ▼]                     │
 * │                                                             │
 * │  Estimated:                                                 │
 * │  ⚔️ Your Power: 45,000    🛡 Enemy Power: 67,000            │
 * │  📊 Win Chance: 35% [████████░░░░░░░░░░]                    │
 * │                                                             │
 * │              [⚔️ ATTACK]  [🏃 RETREAT]                      │
 * └─────────────────────────────────────────────────────────────┘
 */

import { useState, useMemo } from 'react';
import { type Commander, RARITY_COLORS } from './go2-commander-data';

/* ─── types ─── */

export interface ShipStack {
  id: string;
  name: string;
  icon: string;
  count: number;
  attack: number;
  defense: number;
}

export interface BattleFleet {
  playerName: string;
  planetName?: string;
  commander: Commander | null;
  stacks: ShipStack[];
  totalPower: number;
}

export interface FormationSlot {
  index: number;
  ship: ShipStack | null;
}

export type TargetingStrategy = 'closest' | 'maxAttack' | 'minAttack' | 'commander';
export type RangeStrategy = 'min' | 'med' | 'max';

export interface BattleSettings {
  targeting: TargetingStrategy;
  range: RangeStrategy;
  commander: Commander | null;
  formation: FormationSlot[];
}

export interface Go2PreBattleProps {
  enemyFleet: BattleFleet;
  availableCommanders: Commander[];
  availableShips: ShipStack[];
  yourPower: number;
  enemyPower: number;
  winChance: number; // 0–100
  onAttack: (settings: BattleSettings) => void;
  onRetreat: () => void;
  onIntelReport?: () => void;
}

/* ─── constants ─── */

const GO2_BLUE = '#0066CC';
const GO2_DARK = '#000044';
const FORMATION_SLOTS = 9;

const TARGETING_LABELS: Record<TargetingStrategy, string> = {
  closest: 'Closest',
  maxAttack: 'Max Attack',
  minAttack: 'Min Attack',
  commander: 'Commander',
};

const RANGE_LABELS: Record<RangeStrategy, string> = {
  min: 'Min',
  med: 'Med',
  max: 'Max',
};

/* ─── helpers ─── */

function StarDisplay({ count, max = 9 }: { count: number; max?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className="text-[11px]"
          style={{ color: i < count ? '#ffd54f' : 'rgba(255,255,255,0.15)' }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function ThreatBadge({ power }: { power: number }) {
  let label = 'Low';
  let color = '#4caf50';
  if (power > 100000) {
    label = 'EXTREME';
    color = '#f44336';
  } else if (power > 60000) {
    label = 'High';
    color = '#ff5722';
  } else if (power > 30000) {
    label = 'Moderate';
    color = '#ff9800';
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold" style={{ color }}>
      💀 {label} threat
    </span>
  );
}

function WinChanceBar({ chance }: { chance: number }) {
  const pct = Math.max(0, Math.min(100, chance));
  let barColor = '#4caf50';
  if (pct < 30) barColor = '#f44336';
  else if (pct < 60) barColor = '#ff9800';
  return (
    <div className="flex items-center gap-2">
      <span className="min-w-[3.5rem] text-right text-xs font-bold text-white/80">
        {pct}%
      </span>
      <div className="h-4 flex-1 overflow-hidden rounded-sm border border-white/20 bg-black/40">
        <div
          className="h-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

/* ─── sub-components ─── */

function FormationGrid({
  slots,
  onSlotClick,
  selectedShip,
}: {
  slots: FormationSlot[];
  onSlotClick: (index: number) => void;
  selectedShip: ShipStack | null;
}) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {slots.map((slot) => {
        const hasShip = slot.ship !== null;
        const isHighlighted = selectedShip && !hasShip;
        return (
          <button
            key={slot.index}
            onClick={() => onSlotClick(slot.index)}
            className="relative flex h-12 w-12 flex-col items-center justify-center rounded border text-[10px] font-bold transition-all"
            style={{
              borderColor: isHighlighted
                ? '#ffd54f'
                : hasShip
                  ? 'rgba(0,102,204,0.7)'
                  : 'rgba(255,255,255,0.2)',
              backgroundColor: isHighlighted
                ? 'rgba(255,213,79,0.15)'
                : hasShip
                  ? 'rgba(0,102,204,0.25)'
                  : 'rgba(0,0,68,0.5)',
              color: hasShip ? '#fff' : 'rgba(255,255,255,0.3)',
            }}
          >
            {hasShip ? (
              <>
                <span className="truncate px-0.5 text-[8px]">{slot.ship!.name}</span>
                <span className="text-[7px] text-white/60">{slot.ship!.count.toLocaleString()}</span>
              </>
            ) : (
              <span className="text-xs">{slot.index + 1}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ShipInventory({
  ships,
  selectedId,
  onSelect,
}: {
  ships: ShipStack[];
  selectedId: string | null;
  onSelect: (ship: ShipStack) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {ships.map((ship) => {
        const isSelected = ship.id === selectedId;
        return (
          <button
            key={ship.id}
            onClick={() => onSelect(ship)}
            className="rounded border px-1.5 py-1 text-[9px] font-bold transition-all"
            style={{
              borderColor: isSelected ? '#ffd54f' : 'rgba(255,255,255,0.2)',
              backgroundColor: isSelected ? 'rgba(255,213,79,0.2)' : 'rgba(0,0,68,0.5)',
              color: isSelected ? '#ffd54f' : '#fff',
            }}
          >
            <div>{ship.icon}</div>
            <div>{ship.name}</div>
            <div className="text-white/50">{ship.count.toLocaleString()}</div>
          </button>
        );
      })}
    </div>
  );
}

/* ─── main component ─── */

export function Go2PreBattle({
  enemyFleet,
  availableCommanders,
  availableShips,
  yourPower,
  enemyPower,
  winChance,
  onAttack,
  onRetreat,
  onIntelReport,
}: Go2PreBattleProps) {
  const [selectedCommanderId, setSelectedCommanderId] = useState<string>('');
  const [showCommanderDropdown, setShowCommanderDropdown] = useState(false);
  const [targeting, setTargeting] = useState<TargetingStrategy>('closest');
  const [range, setRange] = useState<RangeStrategy>('min');
  const [formation, setFormation] = useState<FormationSlot[]>(
    Array.from({ length: FORMATION_SLOTS }, (_, i) => ({ index: i, ship: null }))
  );
  const [selectedShip, setSelectedShip] = useState<ShipStack | null>(null);
  const [showTargetingDropdown, setShowTargetingDropdown] = useState(false);
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);

  const selectedCommander = useMemo(
    () => availableCommanders.find((c) => c.id === selectedCommanderId) || null,
    [availableCommanders, selectedCommanderId]
  );

  const handleSlotClick = (index: number) => {
    if (selectedShip) {
      setFormation((prev) =>
        prev.map((slot) =>
          slot.index === index ? { ...slot, ship: selectedShip } : slot
        )
      );
      setSelectedShip(null);
    }
  };

  const handleAttack = () => {
    onAttack({
      targeting,
      range,
      commander: selectedCommander,
      formation,
    });
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    zIndex: 50,
    backgroundColor: GO2_DARK,
    border: `1px solid ${GO2_BLUE}`,
    borderRadius: '4px',
    overflow: 'hidden',
    minWidth: '140px',
  };

  return (
    <div className="flex justify-center p-4">
      <div
        className="w-full max-w-[720px] rounded-lg border-2 p-4 shadow-2xl"
        style={{
          backgroundColor: '#000033',
          borderColor: GO2_BLUE,
          fontFamily: 'monospace',
        }}
      >
        {/* ── Title ── */}
        <div
          className="mb-3 border-b-2 pb-2 text-center text-sm font-bold uppercase tracking-widest"
          style={{ borderColor: GO2_BLUE, color: '#64b5f6' }}
        >
          ⚔️ Deploy Fleet
        </div>

        {/* ── Enemy Info ── */}
        <div className="mb-3 flex items-center gap-4 px-1 text-xs">
          <span className="font-bold text-white/90">
            Enemy: <span className="text-[#ff9800]">{enemyFleet.playerName}</span>
          </span>
          {enemyFleet.planetName && (
            <span className="font-bold text-white/60">
              Planet: <span className="text-[#4caf50]">{enemyFleet.planetName}</span>
            </span>
          )}
        </div>

        {/* ── Main Grid: Enemy Preview + Formation ── */}
        <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* ─ Enemy Preview ─ */}
          <div
            className="rounded border p-3"
            style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,68,0.4)' }}
          >
            <div
              className="mb-2 border-b pb-1 text-xs font-bold uppercase"
              style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#64b5f6' }}
            >
              Enemy Preview
            </div>

            {enemyFleet.commander ? (
              <div className="mb-2">
                <div className="text-xs font-bold text-white/90">
                  Commander:{' '}
                  <span style={{ color: RARITY_COLORS[enemyFleet.commander.rarity] }}>
                    {enemyFleet.commander.name}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] text-white/60">
                  Lv.{enemyFleet.commander.level}{' '}
                  <StarDisplay count={enemyFleet.commander.stars} />
                </div>
              </div>
            ) : (
              <div className="mb-2 text-[11px] italic text-white/40">No commander detected</div>
            )}

            <div className="mb-2 text-xs text-white/70">
              <div className="flex items-center gap-1">⚔️ {enemyFleet.stacks.length} stacks</div>
            </div>

            <div className="mb-3">
              <ThreatBadge power={enemyPower} />
            </div>

            <button
              onClick={onIntelReport}
              className="rounded border px-3 py-1 text-[10px] font-bold uppercase transition-colors hover:bg-[#0066CC]/20"
              style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#64b5f6' }}
            >
              📋 Intel Report
            </button>
          </div>

          {/* ─ Your Formation ─ */}
          <div
            className="rounded border p-3"
            style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,68,0.4)' }}
          >
            <div
              className="mb-2 border-b pb-1 text-xs font-bold uppercase"
              style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#64b5f6' }}
            >
              Your Formation
            </div>

            <FormationGrid slots={formation} onSlotClick={handleSlotClick} selectedShip={selectedShip} />

            {/* Commander Selection */}
            <div className="mt-3">
              {selectedCommander ? (
                <div className="mb-2">
                  <div className="text-xs font-bold text-white/90">
                    Commander:{' '}
                    <span style={{ color: RARITY_COLORS[selectedCommander.rarity] }}>
                      {selectedCommander.name}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-white/60">
                    Lv.{selectedCommander.level} <StarDisplay count={selectedCommander.stars} />
                  </div>
                </div>
              ) : (
                <div className="mb-2 text-[11px] italic text-white/40">No commander selected</div>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowCommanderDropdown(!showCommanderDropdown)}
                  className="flex w-full items-center justify-between rounded border px-2 py-1 text-[10px] font-bold transition-colors hover:bg-[#0066CC]/20"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}
                >
                  <span>Select Commander ▼</span>
                </button>
                {showCommanderDropdown && (
                  <div style={dropdownStyle}>
                    {availableCommanders.map((cmd) => (
                      <button
                        key={cmd.id}
                        onClick={() => {
                          setSelectedCommanderId(cmd.id);
                          setShowCommanderDropdown(false);
                        }}
                        className="flex w-full items-center gap-2 border-b border-white/10 px-2 py-1.5 text-left text-[10px] hover:bg-[#0066CC]/30"
                        style={{ color: RARITY_COLORS[cmd.rarity] }}
                      >
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: RARITY_COLORS[cmd.rarity] }}
                        />
                        {cmd.name} (Lv.{cmd.level})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Strategy Selectors ── */}
        <div className="mb-3 flex flex-wrap gap-4 px-1">
          {/* Targeting */}
          <div className="relative">
            <span className="mr-2 text-[10px] font-bold uppercase text-white/50">Targeting:</span>
            <button
              onClick={() => setShowTargetingDropdown(!showTargetingDropdown)}
              className="rounded border px-2 py-1 text-[10px] font-bold transition-colors hover:bg-[#0066CC]/20"
              style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#64b5f6' }}
            >
              {TARGETING_LABELS[targeting]} ▼
            </button>
            {showTargetingDropdown && (
              <div style={dropdownStyle}>
                {(Object.keys(TARGETING_LABELS) as TargetingStrategy[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setTargeting(key);
                      setShowTargetingDropdown(false);
                    }}
                    className="block w-full px-2 py-1.5 text-left text-[10px] text-white/80 hover:bg-[#0066CC]/30"
                  >
                    {TARGETING_LABELS[key]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Range */}
          <div className="relative">
            <span className="mr-2 text-[10px] font-bold uppercase text-white/50">Range:</span>
            <button
              onClick={() => setShowRangeDropdown(!showRangeDropdown)}
              className="rounded border px-2 py-1 text-[10px] font-bold transition-colors hover:bg-[#0066CC]/20"
              style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#64b5f6' }}
            >
              {RANGE_LABELS[range]} ▼
            </button>
            {showRangeDropdown && (
              <div style={dropdownStyle}>
                {(Object.keys(RANGE_LABELS) as RangeStrategy[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setRange(key);
                      setShowRangeDropdown(false);
                    }}
                    className="block w-full px-2 py-1.5 text-left text-[10px] text-white/80 hover:bg-[#0066CC]/30"
                  >
                    {RANGE_LABELS[key]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Ship Inventory ── */}
        <div className="mb-3">
          <div
            className="mb-1 text-[10px] font-bold uppercase text-white/50"
          >
            Ships Available (click to select, then click a slot):
          </div>
          <ShipInventory
            ships={availableShips}
            selectedId={selectedShip?.id ?? null}
            onSelect={setSelectedShip}
          />
        </div>

        {/* ── Power Estimate ── */}
        <div
          className="mb-4 rounded border p-3"
          style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(0,0,68,0.4)' }}
        >
          <div className="mb-2 text-xs font-bold uppercase" style={{ color: '#64b5f6' }}>
            Estimated Outcome
          </div>
          <div className="mb-2 grid grid-cols-2 gap-3 text-xs">
            <div className="text-white/70">
              ⚔️ Your Power:{' '}
              <span className="font-bold text-[#4caf50]">{yourPower.toLocaleString()}</span>
            </div>
            <div className="text-white/70">
              🛡 Enemy Power:{' '}
              <span className="font-bold text-[#f44336]">{enemyPower.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span className="shrink-0">📊 Win Chance:</span>
            <WinChanceBar chance={winChance} />
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleAttack}
            className="rounded border-2 px-8 py-2.5 text-sm font-bold uppercase tracking-wider transition-all hover:brightness-110 active:scale-95"
            style={{
              backgroundColor: 'rgba(244,67,54,0.2)',
              borderColor: '#f44336',
              color: '#f44336',
            }}
          >
            ⚔️ Attack
          </button>
          <button
            onClick={onRetreat}
            className="rounded border-2 px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all hover:brightness-110 active:scale-95"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderColor: 'rgba(255,255,255,0.4)',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            🏃 Retreat
          </button>
        </div>
      </div>
    </div>
  );
}

export default Go2PreBattle;
