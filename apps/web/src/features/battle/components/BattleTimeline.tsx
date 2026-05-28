/**
 * ====================================================================
 * BattleTimeline — Stub component
 * Timeline de eventos de batalla
 * Será reemplazado por el agente de UI de batalla
 * ====================================================================
 */

import React from 'react';
import type { BattleEvent as EngineBattleEvent } from '../engine/types';

export type EventType = EngineBattleEvent['type'];
export type BattleEvent = EngineBattleEvent;

export interface BattleTimelineProps {
  round: number;
  maxRounds: number;
  events: BattleEvent[];
}

const EVENT_COLORS: Record<string, string> = {
  ROUND_START: 'text-cyan-400',
  PHASE_CHANGE: 'text-blue-400',
  TURN_START: 'text-yellow-400',
  WEAPON_FIRE: 'text-orange-400',
  PROJECTILE_HIT: 'text-red-400',
  SHIELD_HIT: 'text-blue-300',
  SHIELD_DEPLETED: 'text-purple-400',
  HULL_DAMAGE: 'text-red-500',
  SHIPS_DESTROYED: 'text-red-600',
  STACK_DESTROYED: 'text-red-700 font-bold',
  INTERCEPT: 'text-green-400',
  SCATTER_DAMAGE: 'text-orange-300',
  HE3_DEPLETED: 'text-gray-400',
  EOS_TRIGGER: 'text-purple-300',
  CRITICAL_HIT: 'text-yellow-500 font-bold',
  DODGE: 'text-green-300',
  ROUND_END: 'text-cyan-500',
  BATTLE_END: 'text-white font-bold',
};

export function BattleTimeline({ round, maxRounds, events }: BattleTimelineProps) {
  const latestEvents = events.slice(-8).reverse();

  return (
    <div className="flex items-center gap-3 overflow-hidden">
      <div className="text-[#4a6a8a] text-[10px] uppercase tracking-wider whitespace-nowrap">
        Log
      </div>
      <div className="flex gap-1.5 overflow-x-auto">
        {latestEvents.map((ev, i) => (
          <div
            key={`${ev.type}-${i}`}
            className={`px-2 py-0.5 rounded bg-[#1a2d4f] text-[10px] whitespace-nowrap border border-[#2a3d5f] ${
              EVENT_COLORS[ev.type] || 'text-gray-400'
            }`}
          >
            {ev.type === 'ROUND_START' && `R${ev.round} Start`}
            {ev.type === 'PHASE_CHANGE' && ev.phase}
            {ev.type === 'TURN_START' && `${ev.commanderName}`}
            {ev.type === 'WEAPON_FIRE' && `Fire`}
            {ev.type === 'PROJECTILE_HIT' && `Hit ${ev.damage}`}
            {ev.type === 'SHIELD_HIT' && `Shield -${ev.absorbed}`}
            {ev.type === 'SHIELD_DEPLETED' && `Shield Down`}
            {ev.type === 'HULL_DAMAGE' && `Hull -${ev.damage}`}
            {ev.type === 'SHIPS_DESTROYED' && `${ev.count} Destroyed`}
            {ev.type === 'STACK_DESTROYED' && `Stack Destroyed`}
            {ev.type === 'INTERCEPT' && (ev.success ? 'Intercept OK' : 'Intercept Fail')}
            {ev.type === 'SCATTER_DAMAGE' && `Scatter ${ev.damage}`}
            {ev.type === 'HE3_DEPLETED' && `He3 Empty`}
            {ev.type === 'EOS_TRIGGER' && `EOS!`}
            {ev.type === 'CRITICAL_HIT' && `CRIT x${ev.multiplier}`}
            {ev.type === 'DODGE' && `Dodge!`}
            {ev.type === 'ROUND_END' && `R${ev.round} End`}
            {ev.type === 'BATTLE_END' && `WINNER: ${ev.winner}`}
          </div>
        ))}
        {latestEvents.length === 0 && (
          <div className="text-[#3a5a6f] text-[10px] italic">Waiting for battle events...</div>
        )}
      </div>
    </div>
  );
}
