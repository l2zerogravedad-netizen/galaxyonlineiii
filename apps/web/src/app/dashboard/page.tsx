'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlanetDashboardPremium } from '@/components/game/PlanetDashboardPremium';
import { useGameDashboard } from '@/lib/game/useGameDashboard';

export default function DashboardPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    setAuthed(true);
  }, [router]);

  const game = useGameDashboard(authed);

  if (game.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-cyan-300 animate-pulse">Sincronizando imperio…</p>
      </div>
    );
  }

  return (
    <PlanetDashboardPremium
      player={game.player}
      resources={game.resources}
      planetName={game.planetName}
      planetType={game.planetType}
      planetId={game.planetId}
      grid={game.grid}
      buildings={game.buildings}
      usingMock={game.usingMock}
      apiError={game.error}
      onRefresh={game.refresh}
      onUpgradeBuilding={game.upgradeSelected}
      onLogout={() => {
        localStorage.removeItem('token');
        router.push('/');
      }}
    />
  );
}
