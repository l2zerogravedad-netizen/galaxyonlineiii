'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface LeaderboardEntry {
  rank: number;
  empireId: string;
  name: string;
  username: string;
  level: number;
  experience: number;
  planets: number;
  fleets: number;
  score: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    axios.get('/api/leaderboard')
      .then(({ data }) => {
        if (data.success) {
          setEntries(data.data);
          // Find my rank
          const myEmpireId = localStorage.getItem('empireId');
          if (myEmpireId) {
            const me = data.data.find((e: LeaderboardEntry) => e.empireId === myEmpireId);
            setMyRank(me || null);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-[#020814] text-white">
      <header className="p-4 border-b border-white/10 bg-[#0a1120]/80">
        <h1 className="text-xl font-bold text-amber-400 tracking-wider">CLASIFICACION</h1>
        <p className="text-sm text-slate-400 mt-1">Los mejores comandantes de la galaxia</p>
      </header>

      {myRank && (
        <div className="mx-4 mt-4 p-3 bg-cyan-900/20 border border-cyan-700/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-800 flex items-center justify-center text-lg font-bold text-cyan-300">
              {myRank.rank}
            </div>
            <div className="flex-1">
              <div className="font-medium text-cyan-300">Tu posicion</div>
              <div className="text-sm text-slate-400">{myRank.name} — Nv. {myRank.level}</div>
            </div>
            <div className="text-right">
              <div className="text-amber-400 font-bold">{myRank.score.toLocaleString()}</div>
              <div className="text-xs text-slate-500">pts</div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 p-4 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-slate-400">Cargando clasificacion...</span>
          </div>
        )}

        <div className="space-y-2">
          {entries.map((e) => (
            <div
              key={e.empireId}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                e.rank <= 3
                  ? 'bg-amber-900/10 border-amber-700/20'
                  : 'bg-[#0a1120] border-white/5 hover:border-white/10'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  e.rank === 1
                    ? 'bg-amber-500 text-black'
                    : e.rank === 2
                    ? 'bg-slate-300 text-black'
                    : e.rank === 3
                    ? 'bg-amber-700 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {e.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{e.name}</div>
                <div className="text-xs text-slate-400">@{e.username}</div>
              </div>
              <div className="text-right text-sm">
                <div className="text-cyan-400 font-bold">Nv. {e.level}</div>
                <div className="text-xs text-slate-500">{e.experience.toLocaleString()} XP</div>
              </div>
            </div>
          ))}
        </div>

        {!loading && entries.length === 0 && (
          <div className="text-center text-slate-500 py-16">
            <p className="text-lg">No hay datos de clasificacion</p>
            <p className="text-sm mt-1">Se el primero en conquistar la galaxia</p>
          </div>
        )}
      </main>

      <nav className="shrink-0 h-14 bg-[#0B1120]/95 border-t border-white/5 backdrop-blur flex items-center justify-around px-2 z-50">
        {[
          { href: '/dashboard', icon: '🏛', label: 'Base' },
          { href: '/dashboard/galaxy', icon: '🌌', label: 'Galaxia' },
          { href: '/dashboard/battle', icon: '⚔', label: 'Batalla' },
          { href: '/dashboard/fleet', icon: '🚀', label: 'Flotas' },
          { href: '/dashboard/missions', icon: '🗺', label: 'Misiones' },
          { href: '/dashboard/market', icon: '💰', label: 'Mercado' },
          { href: '/dashboard/alliances', icon: '🤝', label: 'Alianzas' },
          { href: '/dashboard/leaderboard', icon: '🏆', label: 'Ranking', active: true },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded transition-colors ${
              item.active ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="text-[10px] leading-none hidden sm:block">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
