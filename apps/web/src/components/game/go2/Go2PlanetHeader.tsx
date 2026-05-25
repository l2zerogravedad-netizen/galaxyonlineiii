'use client';

import { useRouter } from 'next/navigation';
import type { PlayerData } from '../types';

export function Go2PlanetHeader({
  player,
  usingMock,
  onCollect,
  collecting,
}: {
  player: PlayerData;
  usingMock: boolean;
  onCollect: () => void;
  collecting?: boolean;
}) {
  const router = useRouter();

  return (
    <header className="go2-planet-header">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-amber-200/70">Imperio</p>
        <h1 className="font-display text-sm font-black text-amber-100">{player.name}</h1>
        <p className="text-[10px] text-stone-400">
          Nv.{player.level} · {player.xp}/{player.xpMax} XP
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="go2-header-btn"
          disabled={usingMock || collecting}
          onClick={onCollect}
        >
          {collecting ? '…' : 'Recolectar'}
        </button>
        <button
          type="button"
          className="go2-header-btn go2-header-btn--danger"
          onClick={() => {
            localStorage.removeItem('token');
            router.replace('/');
          }}
        >
          Salir
        </button>
      </div>
    </header>
  );
}
