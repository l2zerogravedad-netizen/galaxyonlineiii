'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Alliance {
  id: string;
  name: string;
  tag: string;
  description: string | null;
  memberCount: number;
  maxMembers: number;
  leaderId: string;
  createdAt: string;
}

export default function AlliancesPage() {
  const [alliances, setAlliances] = useState<Alliance[]>([]);
  const [myAlliance, setMyAlliance] = useState<Alliance | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'discover' | 'my'>('discover');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', tag: '', description: '' });
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    loadAlliances();
    loadMyAlliance();
  }, []);

  async function loadAlliances() {
    try {
      const { data } = await axios.get('/api/alliances');
      if (data.success) setAlliances(data.data);
    } catch {}
  }

  async function loadMyAlliance() {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('/api/alliances/my', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (data.success) setMyAlliance(data.data);
    } catch {}
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post('/api/alliances', createForm, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (data.success) {
        setShowCreate(false);
        setCreateForm({ name: '', tag: '', description: '' });
        loadAlliances();
        loadMyAlliance();
      }
    } catch (err: any) {
      setCreateError(err.response?.data?.error || 'Error al crear alianza');
    }
  }

  async function handleJoin(allianceId: string) {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/alliances/${allianceId}`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      loadAlliances();
      loadMyAlliance();
    } catch {}
  }

  async function handleLeave(allianceId: string) {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/alliances/${allianceId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setMyAlliance(null);
      loadAlliances();
    } catch {}
  }

  const filtered = alliances.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.tag.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-dvh flex-col bg-[#020814] text-white">
      <header className="p-4 border-b border-white/10 bg-[#0a1120]/80">
        <h1 className="text-xl font-bold text-cyan-400 tracking-wider">ALIANZAS</h1>
        <p className="text-sm text-slate-400 mt-1">Unete a una alianza o crea la tuya</p>
      </header>

      <div className="flex gap-2 px-4 pt-4">
        <button
          onClick={() => setTab('discover')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'discover' ? 'bg-cyan-900/40 text-cyan-300 border border-cyan-700' : 'bg-slate-800/40 text-slate-400 border border-slate-700'
          }`}
        >
          Descubrir
        </button>
        <button
          onClick={() => setTab('my')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'my' ? 'bg-cyan-900/40 text-cyan-300 border border-cyan-700' : 'bg-slate-800/40 text-slate-400 border border-slate-700'
          }`}
        >
          Mi Alianza
        </button>
      </div>

      <main className="flex-1 p-4 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {tab === 'discover' && (
          <>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Buscar alianzas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-[#0a1120] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-700"
              />
              <button
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 bg-cyan-900/40 text-cyan-300 border border-cyan-700 rounded-lg text-sm font-medium hover:bg-cyan-800/40"
              >
                Crear
              </button>
            </div>

            {filtered.map((a) => (
              <div key={a.id} className="bg-[#0a1120] border border-white/10 rounded-lg p-4 mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-cyan-900/40 text-cyan-300 text-xs rounded font-bold">[{a.tag}]</span>
                      <h3 className="font-bold text-white">{a.name}</h3>
                    </div>
                    {a.description && <p className="text-sm text-slate-400 mt-1">{a.description}</p>}
                    <p className="text-xs text-slate-500 mt-1">{a.memberCount} / {a.maxMembers} miembros</p>
                  </div>
                  <button
                    onClick={() => handleJoin(a.id)}
                    disabled={myAlliance !== null}
                    className={`px-3 py-1.5 rounded text-sm font-medium ${
                      myAlliance
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-cyan-900/40 text-cyan-300 border border-cyan-700 hover:bg-cyan-800/40'
                    }`}
                  >
                    {myAlliance ? 'Ya tienes alianza' : 'Unirse'}
                  </button>
                </div>
              </div>
            ))}

            {!loading && filtered.length === 0 && (
              <div className="text-center text-slate-500 py-16">
                {search ? 'No se encontraron alianzas' : 'No hay alianzas disponibles. Crea la primera!'}
              </div>
            )}
          </>
        )}

        {tab === 'my' && (
          <>
            {myAlliance ? (
              <div className="bg-[#0a1120] border border-cyan-700/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-cyan-900/40 text-cyan-300 text-xs rounded font-bold">[{myAlliance.tag}]</span>
                  <h3 className="font-bold text-lg text-white">{myAlliance.name}</h3>
                </div>
                {myAlliance.description && <p className="text-sm text-slate-400 mb-3">{myAlliance.description}</p>}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Miembros: <span className="text-cyan-400">{myAlliance.memberCount} / {myAlliance.maxMembers}</span></span>
                  <span className="text-slate-500">Creada: {new Date(myAlliance.createdAt).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={() => handleLeave(myAlliance.id)}
                  className="mt-4 w-full py-2 bg-red-900/20 text-red-400 border border-red-700/30 rounded-lg text-sm hover:bg-red-800/30"
                >
                  Abandonar Alianza
                </button>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-16">
                <p className="text-lg">No perteneces a ninguna alianza</p>
                <p className="text-sm mt-1">Ve a &quot;Descubrir&quot; para unirte o crear una</p>
              </div>
            )}
          </>
        )}
      </main>

      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a1120] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-cyan-400 mb-4">Crear Alianza</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-sm text-slate-400">Nombre</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full bg-[#020814] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-700"
                  required
                  minLength={3}
                  maxLength={50}
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Tag (2-5 caracteres)</label>
                <input
                  type="text"
                  value={createForm.tag}
                  onChange={(e) => setCreateForm({ ...createForm, tag: e.target.value.toUpperCase() })}
                  className="w-full bg-[#020814] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-700"
                  required
                  minLength={2}
                  maxLength={5}
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Descripcion</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full bg-[#020814] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-700"
                  rows={3}
                />
              </div>
              {createError && <p className="text-red-400 text-sm">{createError}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-cyan-900/40 text-cyan-300 border border-cyan-700 rounded-lg hover:bg-cyan-800/40"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <nav className="shrink-0 h-14 bg-[#0B1120]/95 border-t border-white/5 backdrop-blur flex items-center justify-around px-2 z-50">
        {[
          { href: '/dashboard', icon: '🏛', label: 'Base' },
          { href: '/dashboard/galaxy', icon: '🌌', label: 'Galaxia' },
          { href: '/dashboard/battle', icon: '⚔', label: 'Batalla' },
          { href: '/dashboard/fleet', icon: '🚀', label: 'Flotas' },
          { href: '/dashboard/missions', icon: '🗺', label: 'Misiones' },
          { href: '/dashboard/market', icon: '💰', label: 'Mercado' },
          { href: '/dashboard/alliances', icon: '🤝', label: 'Alianzas', active: true },
          { href: '/dashboard/leaderboard', icon: '🏆', label: 'Ranking' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded transition-colors ${
              item.active ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
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
