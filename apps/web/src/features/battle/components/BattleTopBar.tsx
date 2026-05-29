/**
 * ====================================================================
 * BattleTopBar — Stub component
 * Barra superior de la batalla
 * Será reemplazado por el agente de UI de batalla
 * ====================================================================
 */

import React from 'react';

export interface PlayerInfo {
  name: string;
  ships: number;
  maxShips: number;
}

export type BattlePhase = string;

export interface BattleTopBarProps {
  attacker: PlayerInfo;
  defender: PlayerInfo;
  currentRound: number;
  maxRounds: number;
  phase: BattlePhase;
  battleState?: string;
}

export function BattleTopBar({
  attacker,
  defender,
  currentRound,
  maxRounds,
  phase,
  battleState = 'IN_PROGRESS',
}: BattleTopBarProps) {
  return (
    <div className="h-12 bg-[#0c1325] border-b border-[#1a2d4f] flex items-center justify-between px-6">
      {/* Attacker info */}
      <div className="flex items-center gap-3">
        <div className="text-cyan-400 font-bold text-sm">Attacker</div>
        <div className="text-cyan-300 text-xs">
          {attacker.ships.toLocaleString()} / {attacker.maxShips.toLocaleString()} ships
        </div>
        <div className="w-24 h-2 bg-[#1a2d4f] rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500 rounded-full transition-all"
            style={{
              width: `${attacker.maxShips > 0 ? (attacker.ships / attacker.maxShips) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Center: Round & Phase */}
      <div className="flex items-center gap-4">
        <div className="text-[#4a6a8a] text-xs uppercase tracking-wider">Round</div>
        <div className="text-white font-bold text-lg">
          {currentRound} <span className="text-[#3a5a7a] text-xs">/ {maxRounds}</span>
        </div>
        <div className="px-2 py-0.5 rounded bg-[#1a2d4f] text-cyan-400 text-[10px] font-bold uppercase">
          {phase.replace('_', ' ')}
        </div>
        <div
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
            battleState === 'IN_PROGRESS'
              ? 'bg-yellow-500/20 text-yellow-400'
              : battleState === 'ATTACKER_WINS'
              ? 'bg-cyan-500/20 text-cyan-400'
              : battleState === 'DEFENDER_WINS'
              ? 'bg-rose-500/20 text-rose-400'
              : 'bg-gray-500/20 text-gray-400'
          }`}
        >
          {battleState.replace('_', ' ')}
        </div>
      </div>

      {/* Defender info */}
      <div className="flex items-center gap-3">
        <div className="w-24 h-2 bg-[#2a1d2f] rounded-full overflow-hidden">
          <div
            className="h-full bg-rose-500 rounded-full transition-all"
            style={{
              width: `${defender.maxShips > 0 ? (defender.ships / defender.maxShips) * 100 : 0}%`,
            }}
          />
        </div>
        <div className="text-rose-300 text-xs">
          {defender.ships.toLocaleString()} / {defender.maxShips.toLocaleString()} ships
        </div>
        <div className="text-rose-400 font-bold text-sm">Defender</div>
      </div>
    </div>
  );
}
