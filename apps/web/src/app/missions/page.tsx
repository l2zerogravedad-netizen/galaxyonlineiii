'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Go2ScreenShell } from '@/components/game/go2/Go2ScreenShell';

interface Mission {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  durationSeconds: number;
  minShipsRequired: number;
  recommendedPower: number;
  rewardMetal: number;
  rewardPlasma: number;
  rewardCredits: number;
  rewardXp: number;
}

interface Fleet { id: string; name: string; status: string; totalPower: number; formations: any[] }

interface ActiveMission {
  id: string; status: string; mission: Mission; fleet: Fleet;
  startedAt: string; endsAt: string; remainingSeconds: number; isComplete: boolean;
}

interface MissionHistory {
  id: string; status: string; result: string; mission: Mission; fleet: Fleet; completedAt: string;
}

export default function MissionsPage() {
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [activeMissions, setActiveMissions] = useState<ActiveMission[]>([]);
  const [history, setHistory] = useState<MissionHistory[]>([]);
  const [selectedFleet, setSelectedFleet] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
    const interval = setInterval(() => syncMissions(), 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/'); return; }
      const headers = { Authorization: `Bearer ${token}` };
      const [missionsRes, fleetsRes, activeRes, historyRes] = await Promise.all([
        axios.get('/api/missions', { headers }),
        axios.get('/api/fleets', { headers }),
        axios.get('/api/missions/active', { headers }).catch(() => ({ data: {} })),
        axios.get('/api/missions/history', { headers }).catch(() => ({ data: {} })),
      ]);
      setMissions(missionsRes.data.data ?? missionsRes.data.missions ?? []);
      setFleets(fleetsRes.data.data ?? fleetsRes.data.fleets ?? []);
      setActiveMissions(activeRes.data.activeMissions || []);
      setHistory(historyRes.data.history || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar misiones');
      setLoading(false);
    }
  };

  const syncMissions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post('/api/missions/sync', {}, { headers });
      if (res.data.completed?.length > 0) loadData();
    } catch { /* silent */ }
  };

  const startMission = async (missionId: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`/api/missions/${missionId}/start`, selectedFleet ? { fleetId: selectedFleet } : {}, { headers });
      setSelectedFleet('');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo iniciar la misión');
    }
  };

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}m ${seconds % 60}s`;

  const difficultyColor = (d: number) => (d <= 1 ? '#4ade80' : d <= 2 ? '#fcd34d' : d <= 3 ? '#fb923c' : '#f87171');
  const idleFleets = fleets.filter((f) => f.status === 'IDLE' && (f.formations?.length ?? 0) > 0);

  if (loading) {
    return <Go2ScreenShell title="Misiones" subtitle="Mando Táctico · campaña PvE"><div className="go2-loading">Cargando…</div></Go2ScreenShell>;
  }

  return (
    <Go2ScreenShell title="Misiones" subtitle="Mando Táctico · campaña PvE">
      {error && <div className="go2-panel" style={{ marginBottom: 12, borderColor: '#b91c1c' }}><div className="go2-panel-body" style={{ color: 'var(--go2-red)' }}>{error}</div></div>}

      {activeMissions.length > 0 && (
        <div className="go2-panel" style={{ marginBottom: 12 }}>
          <div className="go2-panel-head">Misiones en curso</div>
          <div className="go2-panel-body go2-queue">
            {activeMissions.map((m) => (
              <div key={m.id} className="go2-queue-item">
                <div>
                  <div style={{ fontWeight: 700 }}>{m.mission.name}</div>
                  <div className="go2-card-sub">Flota: {m.fleet?.name}</div>
                </div>
                {m.isComplete ? <span className="go2-badge go2-badge--ok">¡Completa!</span> : <span className="go2-queue-time">{formatTime(m.remainingSeconds)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fleet selector */}
      <div className="go2-panel" style={{ marginBottom: 12 }}>
        <div className="go2-panel-head">Seleccionar flota</div>
        <div className="go2-panel-body">
          {idleFleets.length === 0 ? (
            <div className="go2-card-sub">No hay flotas inactivas. Crea una flota con naves en el astillero primero. (Sin flota se usará la primera disponible.)</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {idleFleets.map((fleet) => (
                <button key={fleet.id} className={['go2-btn', selectedFleet === fleet.id ? '' : ''].join(' ')} style={{ background: selectedFleet === fleet.id ? undefined : 'linear-gradient(180deg, rgba(20,40,70,0.6), rgba(10,22,42,0.6))', borderColor: selectedFleet === fleet.id ? 'var(--go2-cyan)' : 'var(--go2-line)' }} onClick={() => setSelectedFleet(fleet.id)}>
                  {fleet.name} ({fleet.totalPower} poder)
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Available missions */}
      <div className="go2-grid go2-grid--2">
        {missions.map((mission) => (
          <div key={mission.id} className="go2-card" style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="go2-card-title">{mission.name}</div>
              <span className="go2-badge" style={{ color: difficultyColor(mission.difficulty), background: 'rgba(0,0,0,0.3)' }}>Dif. {mission.difficulty}</span>
            </div>
            <div className="go2-card-sub">{mission.description}</div>
            <div style={{ marginTop: 6 }}>
              <div className="go2-stat"><span>Duración</span><span>{formatTime(mission.durationSeconds)}</span></div>
              <div className="go2-stat"><span>Naves mín.</span><span>{mission.minShipsRequired}</span></div>
              <div className="go2-stat"><span>Poder rec.</span><span>{mission.recommendedPower}</span></div>
              <div className="go2-stat"><span>Recompensa</span><span style={{ color: 'var(--go2-gold)' }}>{mission.rewardMetal}M · {mission.rewardPlasma}G · {mission.rewardCredits}C</span></div>
            </div>
            <button className="go2-btn go2-btn--block go2-btn--gold" style={{ marginTop: 8 }} onClick={() => startMission(mission.id)}>
              Lanzar misión
            </button>
          </div>
        ))}
      </div>

      {history.length > 0 && (
        <div className="go2-panel" style={{ marginTop: 12 }}>
          <div className="go2-panel-head">Historial</div>
          <div className="go2-panel-body">
            {history.map((entry) => (
              <div key={entry.id} className="go2-stat">
                <span>{entry.mission.name} · {entry.fleet?.name}</span>
                <span style={{ color: entry.result === 'WIN' ? 'var(--go2-green)' : 'var(--go2-red)' }}>{entry.result}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Go2ScreenShell>
  );
}
