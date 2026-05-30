'use client';

import type { PlayerData } from '@/components/game/types';
import { Go2IconFrame } from '@/components/game/go2/Go2IconFrame';
import '@/components/game/go2/go2-visual.css';

export function Go2DestockHeader({
  player,
  onCollect,
  onReset,
  collecting,
}: {
  player: PlayerData;
  onCollect: () => void;
  onReset: () => void;
  collecting?: boolean;
}) {
  return (
    <header className="go2-planet-header">
      <div className="go2-empire-badge">
        <Go2IconFrame icon="clan" size="md" rarity="epic" />
        <div>
          <p className="text-[10px] uppercase tracking-wider text-amber-200/70">Imperio</p>
          <h1 className="font-display text-sm font-black text-amber-100">{player.name}</h1>
          <p className="text-[10px] text-stone-400">
            Nv.{player.level} · {player.xp}/{player.xpMax} XP
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="go2-header-btn"
          disabled={collecting}
          onClick={onCollect}
        >
          {collecting ? '…' : 'Recolectar'}
        </button>
        <button type="button" className="go2-header-btn go2-header-btn--danger" onClick={onReset}>
          Reiniciar
        </button>
      </div>
    </header>
  );
}
