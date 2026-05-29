'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Go2BottomNav } from '@/components/game/go2/Go2BottomNav';
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Users,
  Shield,
  Star,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ------------------------------------------------------------------ */
/*  Tipos                                                              */
/* ------------------------------------------------------------------ */

interface LeaderboardEntry {
  rank: number;
  previousRank: number;
  empireId: string;
  name: string;
  username: string;
  level: number;
  experience: number;
  planets: number;
  fleets: number;
  totalPower: number;
  score: number;
  allianceTag?: string;
  avatar?: string;
}

interface LeaderboardCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Componente                                                         */
/* ------------------------------------------------------------------ */

export default function LeaderboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('general');
  const [timeframe, setTimeframe] = useState<string>('all');
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null);

  const categories: LeaderboardCategory[] = [
    {
      id: 'general',
      label: 'General',
      icon: <Trophy className="w-4 h-4" />,
    },
    {
      id: 'power',
      label: 'Poder',
      icon: <Shield className="w-4 h-4" />,
    },
    {
      id: 'wealth',
      label: 'Riqueza',
      icon: <Star className="w-4 h-4" />,
    },
    {
      id: 'planets',
      label: 'Planetas',
      icon: <Medal className="w-4 h-4" />,
    },
  ];

  const timeframes = [
    { id: 'all', label: 'Todo' },
    { id: 'week', label: 'Semana' },
    { id: 'month', label: 'Mes' },
  ];

  /* -- Verificar autenticación -- */
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  /* -- Cargar leaderboard -- */
  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    axios
      .get('/api/leaderboard', {
        params: { category, timeframe },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
      })
      .then(({ data }) => {
        if (data.success) {
          setEntries(data.data.entries || data.data || []);
          if (data.data.myRank) {
            setMyRank(data.data.myRank);
          }
        }
      })
      .catch(() => {
        toast.error('Error al cargar clasificacion');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isAuthenticated, category, timeframe]);

  /* -- Helper: tendencia de rank -- */
  const getRankTrend = (current: number, previous: number) => {
    if (previous === 0 || previous === current) {
      return <Minus className="w-3 h-3 text-slate-500" />;
    }
    if (current < previous) {
      return <ArrowUpRight className="w-3 h-3 text-emerald-400" />;
    }
    return <ArrowDownRight className="w-3 h-3 text-red-400" />;
  };

  /* -- Helper: fondo del rank -- */
  const getRankBadgeStyle = (rank: number) => {
    if (rank === 1) {
      return {
        wrapper:
          'bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-[0_0_16px_rgba(245,158,11,0.35)]',
        glow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]',
      };
    }
    if (rank === 2) {
      return {
        wrapper:
          'bg-gradient-to-br from-slate-300 to-slate-400 text-black shadow-[0_0_16px_rgba(148,163,184,0.25)]',
        glow: 'shadow-[0_0_20px_rgba(148,163,184,0.1)]',
      };
    }
    if (rank === 3) {
      return {
        wrapper:
          'bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-[0_0_16px_rgba(180,83,9,0.25)]',
        glow: 'shadow-[0_0_20px_rgba(180,83,9,0.1)]',
      };
    }
    return {
      wrapper: 'bg-slate-800 text-slate-400 border border-slate-700',
      glow: '',
    };
  };

  /* -- Helper: card de top 3 -- */
  const getTop3CardStyle = (rank: number) => {
    if (rank === 1) {
      return 'bg-gradient-to-b from-amber-900/30 to-[#0a1120] border-amber-500/20';
    }
    if (rank === 2) {
      return 'bg-gradient-to-b from-slate-500/10 to-[#0a1120] border-slate-400/15';
    }
    if (rank === 3) {
      return 'bg-gradient-to-b from-amber-800/20 to-[#0a1120] border-amber-700/15';
    }
    return 'bg-[#0a1120] border-white/5';
  };

  /* -- Verificar si es el usuario actual -- */
  const isCurrentUser = (entry: LeaderboardEntry) => {
    return user?.id === entry.empireId || user?.username === entry.username;
  };

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#020814]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#020814] text-white">
      {/* ===== Header ===== */}
      <header className="relative overflow-hidden border-b border-white/10 bg-[#0a1120]/80 backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
        <div className="relative p-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/20">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-amber-400 uppercase">
                Clasificacion
              </h1>
              <p className="text-xs text-slate-400">
                Los mejores comandantes de la galaxia
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Mi Rank ===== */}
      {myRank && (
        <div className="mx-4 mt-3 p-3 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-900/20 to-[#0a1120]">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${
                getRankBadgeStyle(myRank.rank).wrapper
              }`}
            >
              {myRank.rank <= 3 ? (
                <Crown className="w-4 h-4" />
              ) : (
                myRank.rank
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-cyan-400 text-sm truncate">
                Tu posicion
              </div>
              <div className="text-[11px] text-slate-400">
                @{user?.username} · Nv. {myRank.level}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-amber-400">
                {myRank.score.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">
                Puntos
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Categorias ===== */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 ${
                category === cat.id
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'bg-[#0a1120] text-slate-400 border border-white/5 hover:border-white/10 hover:text-slate-300'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Timeframe ===== */}
      <div className="px-4 pb-2">
        <div className="flex gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
                timeframe === tf.id
                  ? 'bg-white/10 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Contenido ===== */}
      <main className="flex-1 p-4 space-y-3 overflow-y-auto">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <span className="text-slate-400 text-sm">
              Cargando clasificacion...
            </span>
          </div>
        )}

        {/* Top 3 - Cards especiales */}
        {!loading && top3.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {top3.map((entry) => {
              const styles = getRankBadgeStyle(entry.rank);
              const cardStyle = getTop3CardStyle(entry.rank);
              const isMe = isCurrentUser(entry);
              return (
                <div
                  key={entry.empireId}
                  className={`relative flex flex-col items-center p-3 rounded-xl border ${cardStyle} ${
                    isMe ? 'ring-1 ring-cyan-400/40' : ''
                  } ${styles.glow}`}
                >
                  {/* Rank badge */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${styles.wrapper}`}
                  >
                    {entry.rank <= 3 ? (
                      <Crown className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-xs font-bold">{entry.rank}</span>
                    )}
                  </div>

                  {/* Nombre */}
                  <div className="text-center w-full">
                    <div className="font-bold text-xs text-white truncate">
                      {entry.name}
                    </div>
                    <div className="text-[9px] text-slate-500 truncate">
                      @{entry.username}
                    </div>
                  </div>

                  {/* Alliance tag */}
                  {entry.allianceTag && (
                    <span className="mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-900/30 text-cyan-400 border border-cyan-700/20">
                      [{entry.allianceTag}]
                    </span>
                  )}

                  {/* Level & Score */}
                  <div className="mt-2 text-center">
                    <div className="text-lg font-black text-amber-400 leading-none">
                      {entry.score.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold mt-0.5">
                      Nivel {entry.level}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-2 mt-2 text-[9px] text-slate-400">
                    <span className="flex items-center gap-0.5">
                      <Shield className="w-2.5 h-2.5" />
                      {entry.totalPower?.toLocaleString() || 0}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Users className="w-2.5 h-2.5" />
                      {entry.planets}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Resto de entradas */}
        <div className="space-y-1.5">
          {rest.map((entry) => {
            const styles = getRankBadgeStyle(entry.rank);
            const trend = getRankTrend(entry.rank, entry.previousRank);
            const isMe = isCurrentUser(entry);
            return (
              <div
                key={entry.empireId}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isMe
                    ? 'bg-cyan-900/15 border-cyan-500/20 shadow-[0_0_12px_rgba(0,212,255,0.06)]'
                    : 'bg-[#0a1120]/80 border-white/5 hover:border-white/10'
                }`}
              >
                {/* Rank */}
                <div className="flex items-center gap-1 shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${styles.wrapper}`}
                  >
                    {entry.rank}
                  </div>
                  <div className="flex flex-col items-center">
                    {trend}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-sm text-white truncate">
                      {entry.name}
                    </span>
                    {isMe && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
                        TU
                      </span>
                    )}
                    {entry.allianceTag && (
                      <span className="text-[10px] text-cyan-500/70 font-bold shrink-0">
                        [{entry.allianceTag}]
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    @{entry.username}
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right shrink-0">
                  <div className="text-cyan-400 font-bold text-sm">
                    Nv. {entry.level}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {entry.experience.toLocaleString()} XP
                  </div>
                </div>

                {/* Score */}
                <div className="text-right shrink-0 min-w-[60px]">
                  <div className="text-amber-400 font-bold text-sm">
                    {entry.score >= 1000000
                      ? `${(entry.score / 1000000).toFixed(1)}M`
                      : entry.score >= 1000
                        ? `${(entry.score / 1000).toFixed(1)}K`
                        : entry.score.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-slate-500 uppercase font-bold">
                    pts
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!loading && entries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Trophy className="w-12 h-12 text-slate-700" />
            <p className="text-slate-500 text-sm">
              No hay datos de clasificacion
            </p>
          </div>
        )}
      </main>

      <Go2BottomNav />
    </div>
  );
}
