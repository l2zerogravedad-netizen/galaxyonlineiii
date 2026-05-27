'use client';

/**
 * Go2BattleScreen.tsx
 *
 * Main battle orchestrator for Galaxy Online 2.
 *
 * Manages the full battle lifecycle:
 *   'preparing' → Go2PreBattle   (formation editor)
 *   'fighting'  → Go2BattleCanvas (battle animation - placeholder)
 *   'ended'     → Go2PostBattle  (result screen)
 *
 * ┌─ BATTLE SCREEN ───────────────────────────────────────────┐
 * │                                                            │
 * │  Phase 1: Formation selection + commander assignment       │
 * │     ↓ ATTACK clicked                                       │
 * │  Phase 2: Battle animation (canvas / engine running)       │
 * │     ↓ battle engine completes                              │
 * │  Phase 3: Results with stats, rewards, fatality check      │
 * │                                                            │
 * └────────────────────────────────────────────────────────────┘
 */

import { useState, useCallback, useRef } from 'react';
import { type Commander } from './go2-commander-data';
import type { FatalityResult } from './Go2FatalitySystem';
import { checkFatality } from './Go2FatalitySystem';
import {
  Go2PreBattle,
  type BattleFleet,
  type BattleSettings,
  type ShipStack,
  type FormationSlot,
} from './Go2PreBattle';
import {
  Go2PostBattle,
  type BattleResult,
  type BattleOutcome,
  type FallenShip,
  type BattleReward,
  type SideStats,
  type CommanderExpInfo,
  type HighestDamageInfo,
} from './Go2PostBattle';

/* ─── re-export types used by consumers ─── */

export type {
  BattleFleet,
  ShipStack,
  FormationSlot,
  BattleSettings,
  BattleResult,
  BattleOutcome,
  FallenShip,
  BattleReward,
  SideStats,
  CommanderExpInfo,
  HighestDamageInfo,
};

/* ─── battle phase ─── */

export type BattlePhase = 'preparing' | 'fighting' | 'ended';

/* ─── props ─── */

export interface Go2BattleScreenProps {
  attackerFleet: BattleFleet;
  defenderFleet: BattleFleet;
  availableCommanders: Commander[];
  availableShips: ShipStack[];
  yourPower: number;
  enemyPower: number;
  winChance: number; // 0–100
  hospitalAvailable: boolean;
  onBattleEnd: (result: BattleResult) => void;
  onExit: () => void;
}

/* ─── mock battle engine (placeholder) ─── */

interface BattleEngineInput {
  attacker: BattleFleet;
  defender: BattleFleet;
  settings: BattleSettings;
  attackerPower: number;
  defenderPower: number;
  hospitalAvailable: boolean;
}

function runBattleEngine(input: BattleEngineInput): BattleResult {
  const { attacker, defender, settings, attackerPower, defenderPower, hospitalAvailable } = input;

  // Determine outcome based on power comparison + some randomness
  const powerDiff = attackerPower - defenderPower;
  const randomFactor = (Math.random() - 0.5) * 0.4; // ±20%
  const winProbability = 0.5 + powerDiff / (attackerPower + defenderPower + 1) + randomFactor;
  const roll = Math.random();

  let outcome: BattleOutcome;
  if (roll < winProbability - 0.1) {
    outcome = 'win';
  } else if (roll > winProbability + 0.1) {
    outcome = 'lose';
  } else {
    outcome = roll < winProbability ? 'win' : 'draw';
  }

  // Calculate ships
  const attackLossRate = outcome === 'win' ? 0.1 + Math.random() * 0.15 : outcome === 'draw' ? 0.3 + Math.random() * 0.2 : 0.6 + Math.random() * 0.3;
  const defendLossRate = outcome === 'win' ? 0.7 + Math.random() * 0.25 : outcome === 'draw' ? 0.3 + Math.random() * 0.2 : 0.1 + Math.random() * 0.15;

  const attackerLost = Math.floor(attackerPower * attackLossRate);
  const defenderLost = Math.floor(defenderPower * defendLossRate);

  const attackerStats: SideStats = {
    playerName: attacker.playerName,
    shipsSent: attackerPower,
    shipsLost: Math.min(attackerLost, attackerPower),
    shipsSurvived: Math.max(0, attackerPower - attackerLost),
  };

  const defenderStats: SideStats = {
    playerName: defender.playerName,
    shipsSent: defenderPower,
    shipsLost: Math.min(defenderLost, defenderPower),
    shipsSurvived: Math.max(0, defenderPower - defenderLost),
  };

  // Fallen ships (sample)
  const shipTypes = ['Valkyrie', 'Titan-Mk2', 'Kirov', 'Paladin', 'Cerberus', 'Neptune', 'Hunter'];
  const fallenShips: FallenShip[] = [];
  if (attackerStats.shipsLost > 0) {
    const numFallen = 1 + Math.floor(Math.random() * Math.min(5, settings.formation.filter((s) => s.ship).length || 3));
    for (let i = 0; i < numFallen; i++) {
      const name = shipTypes[Math.floor(Math.random() * shipTypes.length)];
      const maxLost = Math.floor(attackerStats.shipsLost / numFallen);
      const count = 10 + Math.floor(Math.random() * Math.max(500, maxLost));
      fallenShips.push({
        id: `fallen_${i}`,
        name: `${name}`,
        count: Math.min(count, maxLost),
      });
    }
  }

  // Commander EXP
  let commanderExp: CommanderExpInfo | null = null;
  if (settings.commander) {
    const baseExp = outcome === 'win' ? 5000 : outcome === 'draw' ? 2000 : 500;
    const expMultiplier = 0.5 + Math.random();
    const expGained = Math.floor(baseExp * expMultiplier);
    const levelsGained = Math.floor(expGained / 3000);
    commanderExp = {
      commander: settings.commander,
      expGained,
      levelBefore: settings.commander.level,
      levelAfter: settings.commander.level + levelsGained,
    };
  }

  // Rewards (only on win)
  const rewards: BattleReward[] = [];
  if (outcome === 'win') {
    rewards.push({ type: 'he3', name: 'He3', amount: Math.floor(5000 + Math.random() * 20000) });
    rewards.push({ type: 'gold', name: 'Gold', amount: Math.floor(3000 + Math.random() * 15000) });
    if (Math.random() > 0.5) {
      rewards.push({ type: 'loot', name: 'Gem', amount: 1, itemCount: Math.floor(1 + Math.random() * 3) });
    }
  }

  // Highest damage
  const highestDamage: HighestDamageInfo | null = {
    shipName: shipTypes[Math.floor(Math.random() * shipTypes.length)],
    stackIndex: 1 + Math.floor(Math.random() * 9),
    damage: Math.floor(5000 + Math.random() * 30000),
  };

  // Fatality check
  let fatalityResult: FatalityResult | null = null;
  if (settings.commander && attackerStats.shipsSurvived === 0) {
    fatalityResult = checkFatality(
      settings.commander.rarity,
      settings.commander.stars,
      settings.commander.skill.toLowerCase().includes('angla'),
      hospitalAvailable,
      settings.commander.name
    );
  }

  // Battle log
  const battleLog: string[] = [
    `Battle initiated: ${attacker.playerName} vs ${defender.playerName}`,
    `Attacker power: ${attackerPower.toLocaleString()} — Defender power: ${defenderPower.toLocaleString()}`,
    `Targeting strategy: ${settings.targeting} — Range: ${settings.range}`,
    outcome === 'win'
      ? `Victory! ${attacker.playerName} destroyed the enemy fleet.`
      : outcome === 'lose'
        ? `Defeat! ${attacker.playerName}'s fleet was destroyed.`
        : `Draw! Both fleets retreated.`,
    `Attacker lost: ${attackerStats.shipsLost.toLocaleString()} ships`,
    `Defender lost: ${defenderStats.shipsLost.toLocaleString()} ships`,
    ...(settings.commander ? [`Commander ${settings.commander.name} gained ${commanderExp?.expGained.toLocaleString() ?? 0} EXP.`] : []),
    ...(fatalityResult?.fatalityTriggered
      ? [`FATALITY: ${settings.commander!.name} died in battle!`]
      : fatalityResult
        ? [`${settings.commander!.name} survived the fatality check.`]
        : []),
  ];

  return {
    outcome,
    attackerStats,
    defenderStats,
    fallenShips,
    commanderExp,
    rewards,
    highestDamage,
    fatalityResult,
    battleLog,
  };
}

/* ─── battle canvas placeholder ─── */

function Go2BattleCanvas({
  attackerName,
  defenderName,
  onComplete,
}: {
  attackerName: string;
  defenderName: string;
  onComplete: () => void;
}) {
  const [tick, setTick] = useState(0);
  const messages = [
    'Initializing battle engine...',
    `Deploying ${attackerName}'s fleet...`,
    `Enemy fleet ${defenderName} detected!`,
    'Calculating targeting solutions...',
    '⚔️ First salvo fired!',
    '💥 Combat in progress...',
    'Assessing battle damage...',
    'Finalizing results...',
  ];

  // Auto-advance and complete
  const hasScheduled = useRef(false);
  if (!hasScheduled.current) {
    hasScheduled.current = true;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setTick(step);
      if (step >= messages.length - 1) {
        clearInterval(interval);
        setTimeout(() => onComplete(), 600);
      }
    }, 350);
  }

  const currentMessage = messages[Math.min(tick, messages.length - 1)];

  return (
    <div className="flex min-h-[500px] items-center justify-center">
      <div
        className="w-full max-w-[600px] rounded-lg border-2 p-6 text-center shadow-2xl"
        style={{
          backgroundColor: '#000033',
          borderColor: '#0066CC',
          fontFamily: 'monospace',
        }}
      >
        <div className="mb-4 text-sm font-bold uppercase tracking-widest text-[#64b5f6]">
          ⚔️ Battle In Progress
        </div>
        <div className="mb-4 flex items-center justify-center gap-6 text-xs text-white/60">
          <span className="font-bold text-[#4caf50]">{attackerName}</span>
          <span className="text-lg">⚔️</span>
          <span className="font-bold text-[#f44336]">{defenderName}</span>
        </div>
        <div className="mx-auto mb-4 h-2 w-64 overflow-hidden rounded-full bg-black/40">
          <div
            className="h-full bg-[#0066CC] transition-all"
            style={{ width: `${((tick + 1) / messages.length) * 100}%` }}
          />
        </div>
        <div className="mb-6 text-lg font-bold text-white/80">{currentMessage}</div>
        <div className="flex justify-center gap-1">
          {Array.from({ length: 3 }, (_, i) => (
            <span
              key={i}
              className="inline-block h-2 w-2 rounded-full bg-[#0066CC]"
              style={{
                animation: `pulse 1s ease-in-out ${i * 0.2}s infinite`,
                opacity: 0.4 + (i * 0.3),
              }}
            />
          ))}
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.4; }
            50% { transform: scale(1.4); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}

/* ─── main component ─── */

export function Go2BattleScreen({
  attackerFleet,
  defenderFleet,
  availableCommanders,
  availableShips,
  yourPower,
  enemyPower,
  winChance,
  hospitalAvailable,
  onBattleEnd,
  onExit,
}: Go2BattleScreenProps) {
  const [phase, setPhase] = useState<BattlePhase>('preparing');
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const storedSettings = useRef<BattleSettings | null>(null);

  // Phase 1: Pre-battle — user configures formation
  const handleAttack = useCallback(
    (settings: BattleSettings) => {
      storedSettings.current = settings;
      setPhase('fighting');
    },
    []
  );

  const handleRetreat = useCallback(() => {
    onExit();
  }, [onExit]);

  // Phase 2: Battle animation complete — run engine
  const handleBattleComplete = useCallback(() => {
    if (!storedSettings.current) return;

    const result = runBattleEngine({
      attacker: attackerFleet,
      defender: defenderFleet,
      settings: storedSettings.current,
      attackerPower: yourPower,
      defenderPower: enemyPower,
      hospitalAvailable,
    });

    setBattleResult(result);
    setPhase('ended');
    onBattleEnd(result);
  }, [attackerFleet, defenderFleet, yourPower, enemyPower, hospitalAvailable, onBattleEnd]);

  // Phase 3: Post-battle actions
  const handleBattleLog = useCallback(() => {
    // Battle log is shown inline in Go2PostBattle
  }, []);

  const handleReplay = useCallback(() => {
    setBattleResult(null);
    setPhase('preparing');
    storedSettings.current = null;
  }, []);

  const handleBackToGalaxy = useCallback(() => {
    onExit();
  }, [onExit]);

  const handleIntelReport = useCallback(() => {
    // Could open an intel modal
    alert(
      `Intel Report:\n\nEnemy: ${defenderFleet.playerName}\nCommander: ${defenderFleet.commander?.name ?? 'None'}\nStacks: ${defenderFleet.stacks.length}\nEstimated Power: ${enemyPower.toLocaleString()}\n\nReconnaissance suggests ${winChance > 50 ? 'favorable' : 'unfavorable'} odds.`
    );
  }, [defenderFleet, enemyPower, winChance]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#000022' }}>
      {phase === 'preparing' && (
        <Go2PreBattle
          enemyFleet={defenderFleet}
          availableCommanders={availableCommanders}
          availableShips={availableShips}
          yourPower={yourPower}
          enemyPower={enemyPower}
          winChance={winChance}
          onAttack={handleAttack}
          onRetreat={handleRetreat}
          onIntelReport={handleIntelReport}
        />
      )}

      {phase === 'fighting' && (
        <Go2BattleCanvas
          attackerName={attackerFleet.playerName}
          defenderName={defenderFleet.playerName}
          onComplete={handleBattleComplete}
        />
      )}

      {phase === 'ended' && battleResult && (
        <Go2PostBattle
          result={battleResult}
          onBattleLog={handleBattleLog}
          onReplay={handleReplay}
          onBackToGalaxy={handleBackToGalaxy}
        />
      )}
    </div>
  );
}

export default Go2BattleScreen;
