'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Go2BottomNav } from '@/components/game/go2/Go2BottomNav';
import {
  Users,
  Shield,
  Crown,
  Swords,
  Star,
  Search,
  Plus,
  X,
  ChevronRight,
  Globe,
  Lock,
  Loader2,
  UserPlus,
  LogOut,
  Settings,
  Trophy,
  Zap,
  CrownIcon,
  Flag,
  UserMinus,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ------------------------------------------------------------------ */
/*  Tipos                                                              */
/* ------------------------------------------------------------------ */

interface Alliance {
  id: string;
  name: string;
  tag: string;
  description: string;
  isPublic: boolean;
  level: number;
  experience: number;
  maxMembers: number;
  memberCount: number;
  totalPower: number;
  leaderName: string;
  leaderId: string;
  createdAt: string;
  members?: AllianceMember[];
}

interface AllianceMember {
  id: string;
  name: string;
  username: string;
  level: number;
  experience: number;
  power: number;
  role: 'LEADER' | 'OFFICER' | 'MEMBER';
  joinedAt: string;
  planets: number;
  isOnline: boolean;
}

interface MyAlliance {
  alliance: Alliance;
  members: AllianceMember[];
  myRole: 'LEADER' | 'OFFICER' | 'MEMBER';
}

/* ------------------------------------------------------------------ */
/*  Componente                                                         */
/* ------------------------------------------------------------------ */

export default function AlliancesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  /* -- Estado -- */
  const [alliances, setAlliances] = useState<Alliance[]>([]);
  const [myAlliance, setMyAlliance] = useState<MyAlliance | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAlliance, setSelectedAlliance] = useState<Alliance | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  /* -- Formulario de creacion -- */
  const [createForm, setCreateForm] = useState({
    name: '',
    tag: '',
    description: '',
    isPublic: true,
  });
  const [creating, setCreating] = useState(false);

  /* -- Tab activo -- */
  const [activeTab, setActiveTab] = useState<'discover' | 'my-alliance'>('discover');

  /* -- Verificar autenticacion -- */
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  /* -- Cargar datos -- */
  useEffect(() => {
    if (!isAuthenticated) return;
    loadAlliances();
  }, [isAuthenticated]);

  async function loadAlliances() {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');

      // Cargar "mi alianza" primero
      try {
        const { data: myData } = await axios.get('/api/alliances/my', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (myData.success && myData.data) {
          setMyAlliance(myData.data);
          setActiveTab('my-alliance');
        }
      } catch {
        // No tiene alianza, esta bien
        setMyAlliance(null);
      }

      // Cargar lista de alianzas
      const { data } = await axios.get('/api/alliances', {
        params: { search: searchQuery || undefined },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (data.success) {
        setAlliances(data.data || []);
      }
    } catch (e: any) {
      toast.error('Error al cargar alianzas');
    } finally {
      setLoading(false);
    }
  }

  /* -- Crear alianza -- */
  async function handleCreateAlliance(e: React.FormEvent) {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.tag.trim()) {
      toast.error('Nombre y tag son obligatorios');
      return;
    }
    if (createForm.tag.length > 5) {
      toast.error('El tag debe tener maximo 5 caracteres');
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem('access_token');
      const { data } = await axios.post(
        '/api/alliances',
        {
          name: createForm.name.trim(),
          tag: createForm.tag.trim().toUpperCase(),
          description: createForm.description.trim(),
          isPublic: createForm.isPublic,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (data.success) {
        toast.success('Alianza creada exitosamente');
        setShowCreateModal(false);
        setCreateForm({ name: '', tag: '', description: '', isPublic: true });
        await loadAlliances();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.error?.message || 'Error al crear alianza');
    } finally {
      setCreating(false);
    }
  }

  /* -- Unirse a alianza -- */
  async function handleJoinAlliance(allianceId: string) {
    setJoiningId(allianceId);
    try {
      const token = localStorage.getItem('access_token');
      const { data } = await axios.post(
        `/api/alliances/${allianceId}/join`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (data.success) {
        toast.success('Te has unido a la alianza');
        await loadAlliances();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.error?.message || 'Error al unirse');
    } finally {
      setJoiningId(null);
    }
  }

  /* -- Abandonar alianza -- */
  async function handleLeaveAlliance() {
    if (!myAlliance) return;
    if (!confirm('Estas seguro de que quieres abandonar la alianza?')) return;

    setLeaving(true);
    try {
      const token = localStorage.getItem('access_token');
      const { data } = await axios.post(
        `/api/alliances/${myAlliance.alliance.id}/leave`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (data.success) {
        toast.success('Has abandonado la alianza');
        setMyAlliance(null);
        setActiveTab('discover');
        await loadAlliances();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.error?.message || 'Error al salir');
    } finally {
      setLeaving(false);
    }
  }

  /* -- Expulsar miembro -- */
  async function handleKickMember(memberId: string) {
    if (!myAlliance) return;
    if (!confirm('Expulsar a este miembro?')) return;

    try {
      const token = localStorage.getItem('access_token');
      const { data } = await axios.post(
        `/api/alliances/${myAlliance.alliance.id}/members/${memberId}/kick`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (data.success) {
        toast.success('Miembro expulsado');
        await loadAlliances();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.error?.message || 'Error al expulsar');
    }
  }

  /* -- Ver detalle de alianza -- */
  async function handleViewAlliance(alliance: Alliance) {
    setSelectedAlliance(alliance);
    setShowDetailModal(true);
    // Si no tiene miembros cargados, intentar cargarlos
    if (!alliance.members) {
      try {
        const token = localStorage.getItem('access_token');
        const { data } = await axios.get(`/api/alliances/${alliance.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (data.success && data.data) {
          setSelectedAlliance(data.data);
        }
      } catch (e) {
        console.error('Error cargando detalle de alianza', e);
      }
    }
  }

  /* -- Buscar -- */
  const filteredAlliances = alliances.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.tag.toLowerCase().includes(q) ||
      a.leaderName.toLowerCase().includes(q)
    );
  });

  /* -- Helpers -- */
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'LEADER':
        return <Crown className="w-3.5 h-3.5 text-amber-400" />;
      case 'OFFICER':
        return <Shield className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Users className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'LEADER':
        return 'Lider';
      case 'OFFICER':
        return 'Oficial';
      default:
        return 'Miembro';
    }
  };

  const getProgressToNextLevel = (xp: number, level: number) => {
    const required = level * 1000;
    return Math.min(100, (xp / required) * 100);
  };

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
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="relative p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/5 border border-cyan-500/20">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-amber-400 uppercase">
                  Alianzas
                </h1>
                <p className="text-xs text-slate-400">
                  Une fuerzas con otros comandantes
                </p>
              </div>
            </div>

            {/* Boton crear alianza */}
            {!myAlliance && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-900/50 text-cyan-400 border border-cyan-700 hover:bg-cyan-800/60 active:scale-95 transition-all text-xs font-bold uppercase"
              >
                <Plus className="w-4 h-4" />
                Crear
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ===== Tabs ===== */}
      <div className="px-4 pt-3">
        <div className="flex rounded-xl bg-[#0a1120] border border-white/5 p-1">
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
              activeTab === 'discover'
                ? 'bg-cyan-500/15 text-cyan-300'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Descubrir
          </button>
          <button
            onClick={() => setActiveTab('my-alliance')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
              activeTab === 'my-alliance'
                ? 'bg-cyan-500/15 text-cyan-300'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Mi Alianza
            {myAlliance && (
              <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[9px]">
                {myAlliance.alliance.memberCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ===== Contenido: Descubrir ===== */}
      {activeTab === 'discover' && (
        <main className="flex-1 p-4 space-y-3 overflow-y-auto">
          {/* Buscar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar alianzas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0a1120] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all"
            />
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              <span className="text-slate-400 text-sm">Cargando...</span>
            </div>
          )}

          {/* Lista de alianzas */}
          {!loading &&
            filteredAlliances.map((alliance) => (
              <div
                key={alliance.id}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#0a1120]/90 backdrop-blur-sm transition-all hover:border-cyan-500/20"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                </div>

                <div className="relative p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Icono / Tag */}
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-600/5 border border-cyan-500/15 shrink-0">
                        <span className="text-sm font-black text-cyan-400">
                          {alliance.tag}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-sm truncate">
                            {alliance.name}
                          </h3>
                          {alliance.isPublic ? (
                            <Globe className="w-3 h-3 text-emerald-400 shrink-0" />
                          ) : (
                            <Lock className="w-3 h-3 text-red-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {alliance.description || 'Sin descripcion'}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-500" />
                            {alliance.leaderName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-cyan-500" />
                            {alliance.memberCount}/{alliance.maxMembers}
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-purple-500" />
                            {(alliance.totalPower || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-slate-400 border border-white/5">
                        Nv. {alliance.level}
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleViewAlliance(alliance)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-all active:scale-95"
                        >
                          Ver
                        </button>
                        {!myAlliance && (
                          <button
                            onClick={() => handleJoinAlliance(alliance.id)}
                            disabled={joiningId === alliance.id || !alliance.isPublic}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95 ${
                              joiningId === alliance.id
                                ? 'bg-slate-700 text-slate-400'
                                : alliance.isPublic
                                  ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-700 hover:bg-cyan-800/60'
                                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                            }`}
                          >
                            {joiningId === alliance.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <UserPlus className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Barra de nivel */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[9px] text-slate-500 mb-1">
                      <span>Nivel {alliance.level}</span>
                      <span>
                        {alliance.experience.toLocaleString()} /{' '}
                        {(alliance.level * 1000).toLocaleString()} XP
                      </span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300"
                        style={{
                          width: `${getProgressToNextLevel(alliance.experience, alliance.level)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

          {!loading && filteredAlliances.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Shield className="w-12 h-12 text-slate-700" />
              <p className="text-slate-500 text-sm">
                {searchQuery
                  ? 'No se encontraron alianzas'
                  : 'No hay alianzas disponibles'}
              </p>
            </div>
          )}
        </main>
      )}

      {/* ===== Contenido: Mi Alianza ===== */}
      {activeTab === 'my-alliance' && (
        <main className="flex-1 overflow-y-auto">
          {myAlliance ? (
            <div className="space-y-4">
              {/* Banner / Info principal */}
              <div className="relative overflow-hidden bg-gradient-to-b from-cyan-900/20 to-[#0a1120] border-b border-white/10 p-4">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/10 border border-cyan-500/20">
                      <span className="text-lg font-black text-cyan-400">
                        {myAlliance.alliance.tag}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-lg text-white truncate">
                        {myAlliance.alliance.name}
                      </h2>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-500" />
                          {myAlliance.alliance.leaderName}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-cyan-500" />
                          {myAlliance.alliance.memberCount}/
                          {myAlliance.alliance.maxMembers}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-slate-500">
                        Tu rol
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                        {getRoleIcon(myAlliance.myRole)}
                        {getRoleLabel(myAlliance.myRole)}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="flex flex-col items-center p-2 rounded-lg bg-white/5 border border-white/5">
                      <Zap className="w-4 h-4 text-purple-400 mb-1" />
                      <span className="text-sm font-bold text-white">
                        {(myAlliance.alliance.totalPower || 0).toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-500 uppercase">
                        Poder
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-white/5 border border-white/5">
                      <Star className="w-4 h-4 text-amber-400 mb-1" />
                      <span className="text-sm font-bold text-white">
                        Nivel {myAlliance.alliance.level}
                      </span>
                      <span className="text-[9px] text-slate-500 uppercase">
                        Nivel
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-white/5 border border-white/5">
                      <Trophy className="w-4 h-4 text-emerald-400 mb-1" />
                      <span className="text-sm font-bold text-white">
                        {myAlliance.alliance.experience.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-500 uppercase">
                        XP
                      </span>
                    </div>
                  </div>

                  {/* Barra de nivel alianza */}
                  <div className="mt-3">
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-400"
                        style={{
                          width: `${getProgressToNextLevel(myAlliance.alliance.experience, myAlliance.alliance.level)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Boton abandonar */}
                  <button
                    onClick={handleLeaveAlliance}
                    disabled={leaving}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-900/20 text-red-400 border border-red-800/30 hover:bg-red-900/30 active:scale-95 transition-all text-xs font-bold uppercase"
                  >
                    {leaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <LogOut className="w-3.5 h-3.5" />
                    )}
                    Abandonar Alianza
                  </button>
                </div>
              </div>

              {/* Lista de miembros */}
              <div className="px-4 pb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Miembros ({myAlliance.members?.length || 0})
                </h3>
                <div className="space-y-1.5">
                  {myAlliance.members?.map((member) => (
                    <div
                      key={member.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        member.id === user?.id
                          ? 'bg-cyan-900/10 border-cyan-500/15'
                          : 'bg-[#0a1120]/60 border-white/5'
                      }`}
                    >
                      {/* Avatar / Online indicator */}
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                          <span className="text-xs font-bold text-slate-300">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a1120] ${
                            member.isOnline
                              ? 'bg-emerald-400'
                              : 'bg-slate-600'
                          }`}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-sm text-white truncate">
                            {member.name}
                          </span>
                          {getRoleIcon(member.role)}
                          <span className="text-[10px] text-slate-500">
                            {getRoleLabel(member.role)}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          @{member.username} · Nv. {member.level} ·{' '}
                          {member.planets} planetas
                        </div>
                      </div>

                      {/* Poder */}
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-purple-400">
                          {member.power.toLocaleString()}
                        </div>
                        <div className="text-[9px] text-slate-500 uppercase">
                          poder
                        </div>
                      </div>

                      {/* Acciones de lider/oficial */}
                      {(myAlliance.myRole === 'LEADER' ||
                        myAlliance.myRole === 'OFFICER') &&
                        member.role !== 'LEADER' &&
                        member.id !== user?.id && (
                          <button
                            onClick={() => handleKickMember(member.id)}
                            className="p-1.5 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-900/30 transition-all active:scale-95 shrink-0"
                            title="Expulsar miembro"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 gap-4">
              <Shield className="w-16 h-16 text-slate-700" />
              <div className="text-center">
                <p className="text-slate-400 font-medium">
                  No perteneces a ninguna alianza
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  Unete a una alianza o crea la tuya propia
                </p>
              </div>
              <button
                onClick={() => setActiveTab('discover')}
                className="px-6 py-2.5 rounded-xl bg-cyan-900/50 text-cyan-400 border border-cyan-700 hover:bg-cyan-800/60 active:scale-95 transition-all text-sm font-bold uppercase"
              >
                Explorar Alianzas
              </button>
            </div>
          )}
        </main>
      )}

      {/* ===== Modal: Crear Alianza ===== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0a1120] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <h2 className="font-bold text-lg text-white">
                  Crear Alianza
                </h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleCreateAlliance} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nombre de la Alianza
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Ej: Los conquistadores del espacio"
                  required
                  maxLength={50}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#020814] border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Tag{' '}
                  <span className="text-slate-600">(max 5 caracteres)</span>
                </label>
                <input
                  type="text"
                  value={createForm.tag}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      tag: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="EJ: GALAX"
                  required
                  maxLength={5}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#020814] border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all font-bold tracking-wider"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Descripcion
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe tu alianza..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#020814] border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <button
                  type="button"
                  onClick={() =>
                    setCreateForm((f) => ({ ...f, isPublic: !f.isPublic }))
                  }
                  className={`relative w-11 h-6 rounded-full transition-all ${
                    createForm.isPublic ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      createForm.isPublic ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">
                    {createForm.isPublic
                      ? 'Alianza Publica'
                      : 'Alianza Privada'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {createForm.isPublic
                      ? 'Cualquiera puede unirse'
                      : 'Solo con invitacion'}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-cyan-600 text-white font-bold uppercase tracking-wider text-sm hover:bg-cyan-500 active:scale-95 transition-all disabled:opacity-60"
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Flag className="w-4 h-4" />
                )}
                {creating ? 'Creando...' : 'Crear Alianza'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== Modal: Detalle de Alianza ===== */}
      {showDetailModal && selectedAlliance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0a1120] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="relative p-4 border-b border-white/10 bg-gradient-to-b from-cyan-900/20 to-[#0a1120]">
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/10 border border-cyan-500/20">
                  <span className="text-lg font-black text-cyan-400">
                    {selectedAlliance.tag}
                  </span>
                </div>
                <div>
                  <h2 className="font-bold text-lg text-white">
                    {selectedAlliance.name}
                  </h2>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-500" />
                      {selectedAlliance.leaderName}
                    </span>
                    {selectedAlliance.isPublic ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Globe className="w-3 h-3" />
                        Publica
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-400">
                        <Lock className="w-3 h-3" />
                        Privada
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {selectedAlliance.description && (
                <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                  {selectedAlliance.description}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className="flex flex-col items-center p-2 rounded-lg bg-white/5">
                  <Users className="w-4 h-4 text-cyan-400 mb-1" />
                  <span className="text-sm font-bold text-white">
                    {selectedAlliance.memberCount}
                  </span>
                  <span className="text-[8px] text-slate-500 uppercase">
                    Miembros
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-white/5">
                  <Zap className="w-4 h-4 text-purple-400 mb-1" />
                  <span className="text-sm font-bold text-white">
                    {(selectedAlliance.totalPower || 0).toLocaleString()}
                  </span>
                  <span className="text-[8px] text-slate-500 uppercase">
                    Poder
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-white/5">
                  <Star className="w-4 h-4 text-amber-400 mb-1" />
                  <span className="text-sm font-bold text-white">
                    Nivel {selectedAlliance.level}
                  </span>
                  <span className="text-[8px] text-slate-500 uppercase">
                    Nivel
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-white/5">
                  <Trophy className="w-4 h-4 text-emerald-400 mb-1" />
                  <span className="text-sm font-bold text-white">
                    {selectedAlliance.experience.toLocaleString()}
                  </span>
                  <span className="text-[8px] text-slate-500 uppercase">
                    XP
                  </span>
                </div>
              </div>

              {/* Boton unirse */}
              {!myAlliance && (
                <button
                  onClick={() => {
                    handleJoinAlliance(selectedAlliance.id);
                    setShowDetailModal(false);
                  }}
                  disabled={
                    joiningId === selectedAlliance.id ||
                    !selectedAlliance.isPublic
                  }
                  className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold uppercase transition-all active:scale-95 ${
                    !selectedAlliance.isPublic
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : 'bg-cyan-900/50 text-cyan-400 border border-cyan-700 hover:bg-cyan-800/60'
                  }`}
                >
                  {joiningId === selectedAlliance.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  {!selectedAlliance.isPublic
                    ? 'Alianza Privada'
                    : 'Unirse a la Alianza'}
                </button>
              )}
            </div>

            {/* Miembros */}
            {selectedAlliance.members &&
              selectedAlliance.members.length > 0 && (
                <div className="flex-1 overflow-y-auto p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Miembros ({selectedAlliance.members.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedAlliance.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-slate-300">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-sm text-white truncate">
                              {member.name}
                            </span>
                            {getRoleIcon(member.role)}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            @{member.username} · Nv. {member.level}
                          </div>
                        </div>
                        <div className="text-xs font-bold text-purple-400">
                          {member.power.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      <Go2BottomNav />
    </div>
  );
}
