'use client';

/**
 * Go2PostBattle.tsx
 *
 * Post-battle result screen for Galaxy Online 2.
 *
 * ┌─ BATTLE RESULT ─────────────────────────────────────────────┐
 * │              ╔═════════╗                                    │
 * │              ║  WIN!   ║  ← or LOSE                        │
 * │              ╚═════════╝                                    │
 * │                                                             │
 * │  Ships Sent:     45,000     Ships Sent:     67,000         │
 * │  Ships Lost:     12,500     Ships Lost:     67,000         │
 * │  Ships Survived: 32,500     Ships Survived: 0              │
 * │                                                             │
 * │  ┌─ Fallen Ships ───────┐  ┌─ EXP Gained ──────┐          │
 * │  │ 1. Valkyrie ×450     │  │ Commander: +2,450 │          │
 * │  │ 2. Titan-Mk2 ×200    │  │ Level: 5 → 6      │          │
 * │  │ 3. Kirov ×50         │  │                   │          │
 * │  └───────────────────────┘  └───────────────────┘          │
 * │                                                             │
 * │  ┌─ Rewards ──────────────┐                                 │
 * │  │ 💎 He3: +12,500        │                                 │
 * │  │ 🪙 Gold: +8,200        │                                 │
 * │  │ 📦 Loot: Gem ×2        │                                 │
 * │  └─────────────────────────┘                                 │
 * │                                                             │
 * │  Highest Damage: Kirov stack (15,200 damage)               │
 * │                                                             │
 * │  [📜 Battle Log]  [🔁 Replay]  [⬅ Back to Galaxy]         │
 * │                                                             │
 * └─────────────────────────────────────────────────────────────┘
 */

import { useState } from 'react';
import { type Commander, RARITY_COLORS } from './go2-commander-data';
import type { FatalityResult } from './Go2FatalitySystem';

/* ─── types ─── */

export type BattleOutcome = 'win' | 'lose' | 'draw';

export interface FallenShip {
  id: string;
  name: string;
  count: number;
}

export interface BattleReward {
  type: 'he3' | 'gold' | 'loot' | 'exp';
  name: string;
  amount: number;
  itemCount?: number;
}

export interface SideStats {
  playerName: string;
  shipsSent: number;
  shipsLost: number;
  shipsSurvived: number;
}

export interface CommanderExpInfo {
  commander: Commander | null;
  expGained: number;
  levelBefore: number;
  levelAfter: number;
}

export interface HighestDamageInfo {
  shipName: string;
  stackIndex: number;
  damage: number;
}

export interface BattleResult {
  outcome: BattleOutcome;
  attackerStats: SideStats;
  defenderStats: SideStats;
  fallenShips: FallenShip[];
  commanderExp: CommanderExpInfo | null;
  rewards: BattleReward[];
  highestDamage: HighestDamageInfo | null;
  fatalityResult: FatalityResult | null;
  battleLog: string[];
}

export interface Go2PostBattleProps {
  result: BattleResult;
  onBattleLog: () => void;
  onReplay: () => void;
  onBackToGalaxy: () => void;
}

/* ─── constants ─── */

const GO2_BLUE = '#0066CC';

const OUTCOME_CONFIG: Record<
  BattleOutcome,
  { label: string; bgColor: string; borderColor: string; textColor: string }
> = {
  win: {
    label: '★ VICTORY ★',
    bgColor: 'rgba(76,175,80,0.2)',
    borderColor: '#4caf50',
    textColor: '#4caf50',
  },
  lose: {
    label: '★ DEFEAT ★',
    bgColor: 'rgba(244,67,54,0.2)',
    borderColor: '#f44336',
    textColor: '#f44336',
  },
  draw: {
    label: '★ DRAW ★',
    bgColor: 'rgba(33,150,243,0.2)',
    borderColor: '#2196f3',
    textColor: '#2196f3',
  },
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

function RewardIcon({ type }: { type: BattleReward['type'] }) {
  switch (type) {
    case 'he3':
      return '💎';
    case 'gold':
      return '🪙';
    case 'loot':
      return '📦';
    case 'exp':
      return '✨';
    default:
      return '🎁';
  }
}

/* ─── sub-components ─── */

function OutcomeBanner({ outcome }: { outcome: BattleOutcome }) {
  const config = OUTCOME_CONFIG[outcome];
  return (
    <div className="flex justify-center py-3">
      <div
        className="rounded border-2 px-10 py-3 text-center shadow-lg"
        style={{
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
        }}
      >
        <div
          className="text-2xl font-black uppercase tracking-[0.2em]"
          style={{ color: config.textColor }}
        >
          {config.label}
        </div>
      </div>
    </div>
  );
}

function StatsRow({
  attackerStats,
  defenderStats,
}: {
  attackerStats: SideStats;
  defenderStats: SideStats;
}) {
  return (
    <div className="mb-3 grid grid-cols-2 gap-4">
      {/* Attacker column */}
      <div
        className="rounded border p-3"
        style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(0,0,68,0.4)' }}
      >
        <div className="mb-2 border-b border-white/10 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#64b5f6]">
          Your Forces — {attackerStats.playerName}
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-white/70">
            <span>Ships Sent:</span>
            <span className="font-bold text-white/90">
              {attackerStats.shipsSent.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-white/70">
            <span>Ships Lost:</span>
            <span className="font-bold text-[#f44336]">
              {attackerStats.shipsLost.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-1 text-white/70">
            <span>Ships Survived:</span>
            <span className="font-bold text-[#4caf50]">
              {attackerStats.shipsSurvived.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Defender column */}
      <div
        className="rounded border p-3"
        style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(0,0,68,0.4)' }}
      >
        <div className="mb-2 border-b border-white/10 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#f44336]">
          Enemy Forces — {defenderStats.playerName}
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-white/70">
            <span>Ships Sent:</span>
            <span className="font-bold text-white/90">
              {defenderStats.shipsSent.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-white/70">
            <span>Ships Lost:</span>
            <span className="font-bold text-[#4caf50]">
              {defenderStats.shipsLost.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-1 text-white/70">
            <span>Ships Survived:</span>
            <span className="font-bold text-[#f44336]">
              {defenderStats.shipsSurvived.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FallenShipsPanel({ ships }: { ships: FallenShip[] }) {
  if (ships.length === 0) {
    return (
      <div
        className="rounded border p-3"
        style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(0,0,68,0.4)' }}
      >
        <div className="mb-2 border-b border-white/10 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#f44336]">
          Fallen Ships
        </div>
        <div className="py-2 text-center text-[11px] italic text-white/40">No ships lost!</div>
      </div>
    );
  }

  return (
    <div
      className="rounded border p-3"
      style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(0,0,68,0.4)' }}
    >
      <div className="mb-2 border-b border-white/10 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#f44336]">
        Fallen Ships ({ships.length})
      </div>
      <div className="max-h-[140px] overflow-y-auto">
        {ships.map((ship, idx) => (
          <div
            key={ship.id}
            className="flex items-center justify-between border-b border-white/5 py-1 text-xs last:border-b-0"
          >
            <span className="text-white/70">
              <span className="mr-1 text-white/30">{idx + 1}.</span>
              {ship.name}
            </span>
            <span className="font-bold text-[#f44336]">×{ship.count.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExpGainedPanel({ expInfo }: { expInfo: CommanderExpInfo | null }) {
  return (
    <div
      className="rounded border p-3"
      style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(0,0,68,0.4)' }}
    >
      <div className="mb-2 border-b border-white/10 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#4caf50]">
        EXP Gained
      </div>
      {expInfo && expInfo.commander ? (
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-white/80">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: RARITY_COLORS[expInfo.commander.rarity] }}
            />
            <span style={{ color: RARITY_COLORS[expInfo.commander.rarity] }}>
              {expInfo.commander.name}
            </span>
          </div>
          <div className="text-[#ffd54f]">✨ +{expInfo.expGained.toLocaleString()} EXP</div>
          {expInfo.levelBefore < expInfo.levelAfter ? (
            <div className="rounded border border-[#ffd54f]/30 bg-[#ffd54f]/10 px-2 py-1 text-center font-bold text-[#ffd54f]">
              ⬆️ Level {expInfo.levelBefore} → {expInfo.levelAfter}
            </div>
          ) : (
            <div className="text-white/50">
              Level: {expInfo.levelAfter}{' '}
              <span className="text-white/30">(no level up)</span>
            </div>
          )}
          {expInfo.commander && (
            <div className="pt-1 text-[10px] text-white/40">
              <StarDisplay count={expInfo.commander.stars} />
            </div>
          )}
        </div>
      ) : (
        <div className="py-2 text-center text-[11px] italic text-white/40">
          No commander deployed
        </div>
      )}
    </div>
  );
}

function RewardsPanel({ rewards }: { rewards: BattleReward[] }) {
  if (rewards.length === 0) {
    return (
      <div
        className="rounded border p-3"
        style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(0,0,68,0.4)' }}
      >
        <div className="mb-2 border-b border-white/10 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#ffd54f]">
          Rewards
        </div>
        <div className="py-2 text-center text-[11px] italic text-white/40">No rewards</div>
      </div>
    );
  }

  return (
    <div
      className="rounded border p-3"
      style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(0,0,68,0.4)' }}
    >
      <div className="mb-2 border-b border-white/10 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#ffd54f]">
        Rewards
      </div>
      <div className="space-y-1">
        {rewards.map((reward, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs text-white/80">
            <span className="text-base">{RewardIcon(reward.type)}</span>
            <span className="font-bold">{reward.name}:</span>
            <span className="font-bold text-[#4caf50]">
              +{reward.amount.toLocaleString()}
              {reward.itemCount ? ` ×${reward.itemCount}` : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FatalityPanel({ fatality }: { fatality: FatalityResult | null }) {
  if (!fatality) return null;

  return (
    <div
      className="mb-3 rounded border p-3"
      style={{
        borderColor: fatality.fatalityTriggered ? '#f44336' : 'rgba(255,255,255,0.15)',
        backgroundColor: fatality.fatalityTriggered ? 'rgba(244,67,54,0.15)' : 'rgba(0,0,68,0.4)',
      }}
    >
      <div
        className="mb-2 border-b border-white/10 pb-1 text-[10px] font-bold uppercase tracking-wider"
        style={{ color: fatality.fatalityTriggered ? '#f44336' : '#64b5f6' }}
      >
        ⚠️ Commander Fatality Check
      </div>
      {fatality.fatalityTriggered ? (
        <div className="space-y-1 text-xs">
          <div className="font-black uppercase text-[#f44336]">
            ☠️ {fatality.commanderName} has fallen in battle!
          </div>
          <div className="text-white/60">
            Roll: {(fatality.roll * 100).toFixed(1)}% vs Chance:{' '}
            {(fatality.finalChance * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-white/40">
            Rarity: {fatality.commanderRarity} — The commander is permanently lost.
          </div>
        </div>
      ) : (
        <div className="space-y-1 text-xs">
          <div className="font-bold text-[#4caf50]">
            ✓ {fatality.commanderName} survived the battle.
          </div>
          <div className="text-white/60">
            Roll: {(fatality.roll * 100).toFixed(1)}% vs Chance:{' '}
            {(fatality.finalChance * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-white/40">
            Rarity: {fatality.commanderRarity} — Commander is safe.
          </div>
        </div>
      )}
    </div>
  );
}

function HighestDamagePanel({ info }: { info: HighestDamageInfo | null }) {
  if (!info) return null;

  return (
    <div
      className="mb-3 rounded border p-3"
      style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(0,0,68,0.4)' }}
    >
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#ff9800]">
        🏆 Highest Damage
      </div>
      <div className="text-xs text-white/80">
        <span className="font-bold text-white">{info.shipName}</span>{' '}
        <span className="text-white/50">(stack #{info.stackIndex})</span>
      </div>
      <div className="text-sm font-black text-[#ff9800]">
        {info.damage.toLocaleString()} damage
      </div>
    </div>
  );
}

/* ─── main component ─── */

export function Go2PostBattle({
  result,
  onBattleLog,
  onReplay,
  onBackToGalaxy,
}: Go2PostBattleProps) {
  const [showLog, setShowLog] = useState(false);

  return (
    <div className="flex justify-center p-4">
      <div
        className="w-full max-w-[680px] rounded-lg border-2 p-4 shadow-2xl"
        style={{
          backgroundColor: '#000033',
          borderColor: GO2_BLUE,
          fontFamily: 'monospace',
        }}
      >
        {/* ── Title ── */}
        <div
          className="mb-2 border-b-2 pb-2 text-center text-sm font-bold uppercase tracking-widest"
          style={{ borderColor: GO2_BLUE, color: '#64b5f6' }}
        >
          ⚔️ Battle Result
        </div>

        {/* ── Win/Lose/Draw Banner ── */}
        <OutcomeBanner outcome={result.outcome} />

        {/* ── Side-by-side stats ── */}
        <StatsRow attackerStats={result.attackerStats} defenderStats={result.defenderStats} />

        {/* ── Fallen Ships + EXP ── */}
        <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <FallenShipsPanel ships={result.fallenShips} />
          <ExpGainedPanel expInfo={result.commanderExp} />
        </div>

        {/* ── Rewards ── */}
        <div className="mb-3">
          <RewardsPanel rewards={result.rewards} />
        </div>

        {/* ── Highest Damage ── */}
        <HighestDamagePanel info={result.highestDamage} />

        {/* ── Fatality Check ── */}
        <FatalityPanel fatality={result.fatalityResult} />

        {/* ── Battle Log (toggleable) ── */}
        {showLog && result.battleLog.length > 0 && (
          <div
            className="mb-3 rounded border p-3"
            style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(0,0,68,0.4)' }}
          >
            <div className="mb-2 border-b border-white/10 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#64b5f6]">
              📜 Battle Log
            </div>
            <div className="max-h-[160px] overflow-y-auto space-y-0.5 text-[10px]">
              {result.battleLog.map((entry, idx) => (
                <div key={idx} className="border-b border-white/5 py-0.5 text-white/60 last:border-b-0">
                  <span className="mr-1 text-white/30">#{idx + 1}</span>
                  {entry}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            onClick={() => {
              setShowLog(!showLog);
              if (!showLog) onBattleLog();
            }}
            className="rounded border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all hover:brightness-110 active:scale-95"
            style={{
              backgroundColor: 'rgba(100,181,246,0.1)',
              borderColor: 'rgba(100,181,246,0.4)',
              color: '#64b5f6',
            }}
          >
            📜 {showLog ? 'Hide' : 'Battle'} Log
          </button>
          <button
            onClick={onReplay}
            className="rounded border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all hover:brightness-110 active:scale-95"
            style={{
              backgroundColor: 'rgba(255,152,0,0.1)',
              borderColor: 'rgba(255,152,0,0.4)',
              color: '#ff9800',
            }}
          >
            🔁 Replay
          </button>
          <button
            onClick={onBackToGalaxy}
            className="rounded border-2 px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all hover:brightness-110 active:scale-95"
            style={{
              backgroundColor: 'rgba(0,102,204,0.2)',
              borderColor: GO2_BLUE,
              color: '#64b5f6',
            }}
          >
            ⬅ Back to Galaxy
          </button>
        </div>
      </div>
    </div>
  );
}

export default Go2PostBattle;
