'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Go2BottomNav } from '@/components/game/go2/Go2BottomNav';
import {
  Star,
  Clock,
  Swords,
  Shield,
  Zap,
  Trophy,
  Coins,
  Play,
  CheckCircle2,
  Timer,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ------------------------------------------------------------------ */
/*  Tipos                                                              */
/* ------------------------------------------------------------------ */

interface Mission {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  durationSeconds: number;
  recommendedPower: number;
  rewardMetal: number;
  rewardPlasma: number;
  rewardEnergy: number;
  rewardXp: number;
  rewardCredits: number;
  playerStatus: 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' | 'LOCKED';
  activeRunId: string | null;
  completedRuns: number;
  maxRuns: number;
  cooldownSeconds: number;
  type: 'COMBAT' | 'ESCORT' | 'MINING' | 'EXPLORATION' | 'SIEGE';
}

interface MissionRun {
  id: string;
  missionId: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  progressPercent: number;
  startedAt: string;
  endsAt: string;
}

/* ------------------------------------------------------------------ */
/*  Componente                                                         */
/* ------------------------------------------------------------------ */

export default function MissionsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [missions, setMissions] = useState<Mission[]>([]);
  const [activeRuns, setActiveRuns] = useState<MissionRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  /* -- Verificar autenticación -- */
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  /* -- Cargar misiones -- */
  useEffect(() => {
    if (!isAuthenticated) return;

    async function load() {
      try {
        const token = localStorage.getItem('access_token');
        const { data } = await axios.get('/api/missions', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (data.success) {
          setMissions(data.data.missions || data.data || []);
          setActiveRuns(data.data.activeRuns || []);
        }
      } catch (e: any) {
        setError('Error al cargar misiones');
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [isAuthenticated]);

  /* -- Temporizador para misiones en progreso -- */
  useEffect(() => {
    if (activeRuns.length === 0) return;
    const interval = setInterval(() => {
      setActiveRuns((prev) =>
        prev.map((run) => {
          const now = Date.now();
          const end = new Date(run.endsAt).getTime();
          const start = new Date(run.startedAt).getTime();
          const progress = Math.min(100, ((now - start) / (end - start)) * 100);
          return { ...run, progressPercent: Math.floor(progress) };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [activeRuns.length]);

  /* -- Iniciar misión -- */
  async function handleStartMission(missionId: string) {
    setStartingId(missionId);
    try {
      const token = localStorage.getItem('access_token');
      const { data } = await axios.post(
        `/api/missions/${missionId}/start`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (data.success) {
        toast.success('Mision iniciada');
        // Actualizar estado local
        setMissions((prev) =>
          prev.map((m) =>
            m.id === missionId
              ? { ...m, playerStatus: 'IN_PROGRESS' as const, activeRunId: data.data.runId }
              : m
          )
        );
        if (data.data.run) {
          setActiveRuns((prev) => [...prev, data.data.run]);
        }
      } else {
        toast.error(data.error?.message || 'No se pudo iniciar la misión');
      }
    } catch (e: any) {
      toast.error(e.response?.data?.error?.message || 'Error al iniciar misión');
    } finally {
      setStartingId(null);
    }
  }

  /* -- Reclamar recompensa -- */
  async function handleClaimReward(missionId: string, runId: string) {
    try {
      const token = localStorage.getItem('access_token');
      const { data } = await axios.post(
        `/api/missions/${missionId}/claim`,
        { runId },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (data.success) {
        toast.success('Recompensa reclamada');
        setMissions((prev) =>
          prev.map((m) =>
            m.id === missionId
              ? {
                  ...m,
                  playerStatus: 'AVAILABLE' as const,
                  activeRunId: null,
                  completedRuns: m.completedRuns + 1,
                }
              : m
          )
        );
        setActiveRuns((prev) => prev.filter((r) => r.id !== runId));
      }
    } catch (e: any) {
      toast.error(e.response?.data?.error?.message || 'Error al reclamar');
    }
  }

  /* -- Helpers -- */
  const getMissionTypeIcon = (type: string) => {
    switch (type) {
      case 'COMBAT':
        return <Swords className="w-4 h-4 text-red-400" />;
      case 'ESCORT':
        return <Shield className="w-4 h-4 text-blue-400" />;
      case 'MINING':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'EXPLORATION':
        return <Trophy className="w-4 h-4 text-emerald-400" />;
      case 'SIEGE':
        return <Star className="w-4 h-4 text-purple-400" />;
      default:
        return <Star className="w-4 h-4 text-slate-400" />;
    }
  };

  const getMissionTypeLabel = (type: string) => {
    switch (type) {
      case 'COMBAT':
        return 'Combate';
      case 'ESCORT':
        return 'Escolta';
      case 'MINING':
        return 'Mineria';
      case 'EXPLORATION':
        return 'Exploracion';
      case 'SIEGE':
        return 'Asedio';
      default:
        return type;
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-emerald-400';
    if (difficulty <= 3) return 'text-amber-400';
    if (difficulty <= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStatusConfig = (status: string, progress?: number) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          label: 'Iniciar',
          icon: <Play className="w-3.5 h-3.5" />,
          className:
            'bg-cyan-900/50 text-cyan-400 border border-cyan-700 hover:bg-cyan-800/60 active:scale-95',
          disabled: false,
        };
      case 'IN_PROGRESS':
        return {
          label: `En Progreso ${progress ?? 0}%`,
          icon: <Timer className="w-3.5 h-3.5" />,
          className:
            'bg-amber-900/50 text-amber-400 border border-amber-700 cursor-default',
          disabled: true,
        };
      case 'COMPLETED':
        return {
          label: 'Reclamar',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          className:
            'bg-emerald-900/50 text-emerald-400 border border-emerald-700 hover:bg-emerald-800/60 active:scale-95',
          disabled: false,
        };
      case 'LOCKED':
        return {
          label: 'Bloqueada',
          icon: <Shield className="w-3.5 h-3.5" />,
          className:
            'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed',
          disabled: true,
        };
      default:
        return {
          label: 'Iniciar',
          icon: <Play className="w-3.5 h-3.5" />,
          className:
            'bg-cyan-900/50 text-cyan-400 border border-cyan-700 hover:bg-cyan-800/60',
          disabled: false,
        };
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m >= 60) {
      const h = Math.floor(m / 60);
      return `${h}h ${m % 60}m`;
    }
    return s > 0 ? `${m}m ${s}s` : `${m} min`;
  };

  /* -- Filtrar misiones -- */
  const filteredMissions =
    filterType === 'ALL'
      ? missions
      : missions.filter((m) => m.type === filterType);

  const missionTypes = ['ALL', 'COMBAT', 'ESCORT', 'MINING', 'EXPLORATION', 'SIEGE'];

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
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-amber-500/5 pointer-events-none" />
        <div className="relative p-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/5 border border-cyan-500/20">
              <Swords className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-amber-400 uppercase">
                Misiones PvE
              </h1>
              <p className="text-xs text-slate-400">
                Completa misiones para ganar recursos y experiencia
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Filtros ===== */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
          {missionTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 ${
                filterType === type
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-[#0a1120] text-slate-400 border border-white/5 hover:border-white/10 hover:text-slate-300'
              }`}
            >
              {type === 'ALL' ? 'Todas' : getMissionTypeLabel(type)}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Misiones en progreso ===== */}
      {activeRuns.length > 0 && (
        <div className="px-4 py-2 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400/80">
            En Progreso ({activeRuns.length})
          </h2>
          {activeRuns.map((run) => {
            const mission = missions.find((m) => m.id === run.missionId);
            if (!mission) return null;
            return (
              <div
                key={run.id}
                className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-900/20 to-[#0a1120] p-3"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
                <div className="relative flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Timer className="w-5 h-5 text-amber-400 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-amber-300 truncate">
                      {mission.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {getMissionTypeLabel(mission.type)} · Nv.{mission.difficulty}
                    </div>
                    {/* Barra de progreso */}
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-1000 ease-linear"
                        style={{ width: `${run.progressPercent}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-amber-400">
                      {run.progressPercent}%
                    </div>
                    {run.progressPercent >= 100 && (
                      <button
                        onClick={() => handleClaimReward(mission.id, run.id)}
                        className="mt-1 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 active:scale-95 transition-all"
                      >
                        Reclamar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== Lista de misiones ===== */}
      <main className="flex-1 p-4 space-y-3 overflow-y-auto">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <span className="text-slate-400 text-sm">Cargando misiones...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-red-900/20 border border-red-700/30 text-red-400 text-sm">
              <span className="text-lg">⚠</span> {error}
            </div>
          </div>
        )}

        {!loading &&
          filteredMissions.map((m) => {
            const statusCfg = getStatusConfig(
              m.playerStatus,
              activeRuns.find((r) => r.missionId === m.id)?.progressPercent
            );
            return (
              <div
                key={m.id}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#0a1120]/90 backdrop-blur-sm transition-all hover:border-cyan-500/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.05)]"
              >
                {/* Efecto de borde brillante en hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                </div>

                <div className="relative p-4">
                  {/* Header de la mision */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-white/5">
                          {getMissionTypeIcon(m.type)}
                          {getMissionTypeLabel(m.type)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {m.completedRuns}/{m.maxRuns} completadas
                        </span>
                      </div>
                      <h3 className="font-bold text-cyan-400 text-base leading-tight">
                        {m.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {m.description}
                      </p>
                    </div>
                    {/* Dificultad */}
                    <div className="flex flex-col items-center gap-0.5 shrink-0">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < m.difficulty
                                ? getDifficultyColor(m.difficulty)
                                : 'text-slate-700'
                            }`}
                            fill={i < m.difficulty ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                      <span className="text-[9px] text-slate-500 uppercase font-bold">
                        Dif.
                      </span>
                    </div>
                  </div>

                  {/* Stats bar */}
                  <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{formatDuration(m.durationSeconds)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-slate-500" />
                      <span>Poder {m.recommendedPower.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Recompensas */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {m.rewardMetal > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/60 border border-white/5 text-[11px] font-medium text-slate-300">
                        <Zap className="w-3 h-3 text-amber-500" />
                        {m.rewardMetal.toLocaleString()} Metal
                      </span>
                    )}
                    {m.rewardPlasma > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/60 border border-white/5 text-[11px] font-medium text-slate-300">
                        <Zap className="w-3 h-3 text-purple-400" />
                        {m.rewardPlasma.toLocaleString()} Plasma
                      </span>
                    )}
                    {m.rewardEnergy > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/60 border border-white/5 text-[11px] font-medium text-slate-300">
                        <Zap className="w-3 h-3 text-cyan-400" />
                        {m.rewardEnergy.toLocaleString()} Energia
                      </span>
                    )}
                    {m.rewardXp > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-900/20 border border-amber-700/20 text-[11px] font-medium text-amber-400">
                        <Trophy className="w-3 h-3" />
                        +{m.rewardXp.toLocaleString()} XP
                      </span>
                    )}
                    {m.rewardCredits > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-900/20 border border-emerald-700/20 text-[11px] font-medium text-emerald-400">
                        <Coins className="w-3 h-3" />
                        +{m.rewardCredits.toLocaleString()} Creditos
                      </span>
                    )}
                  </div>

                  {/* Boton de accion */}
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        if (m.playerStatus === 'COMPLETED') {
                          if (m.activeRunId)
                            handleClaimReward(m.id, m.activeRunId);
                        } else if (m.playerStatus === 'AVAILABLE') {
                          handleStartMission(m.id);
                        }
                      }}
                      disabled={statusCfg.disabled || startingId === m.id}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${statusCfg.className} ${
                        startingId === m.id ? 'opacity-70' : ''
                      }`}
                    >
                      {startingId === m.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Iniciando...
                        </>
                      ) : (
                        <>
                          {statusCfg.icon}
                          {statusCfg.label}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

        {!loading && filteredMissions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Shield className="w-12 h-12 text-slate-700" />
            <p className="text-slate-500 text-sm">
              {filterType === 'ALL'
                ? 'No hay misiones disponibles'
                : `No hay misiones de tipo ${getMissionTypeLabel(filterType)}`}
            </p>
          </div>
        )}
      </main>

      <Go2BottomNav />
    </div>
  );
}
