'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Go2IconFrame } from '@/components/game/go2/Go2IconFrame';
import { formatGo2Countdown } from '../useDestockShared';
import { DestockGo2Shell } from '../components/DestockGo2Shell';
import { MISSIONS, type DestockMission } from '../data/destockInventoryData';

const STORAGE_KEY = 'destock-go2-missions-v1';

function hasToken(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return !!localStorage.getItem('token');
  } catch {
    return false;
  }
}

/** Map a real /api/missions row to the screen's DestockMission shape. */
function apiMissionToDestock(m: Record<string, unknown>): DestockMission {
  const rewards: DestockMission['rewards'] = [];
  const metal = Number(m.rewardMetal ?? 0);
  const plasma = Number(m.rewardPlasma ?? 0);
  const credits = Number(m.rewardCredits ?? 0);
  if (metal > 0) rewards.push({ icon: 'metal', label: 'Metal', amount: metal });
  if (plasma > 0) rewards.push({ icon: 'plasma', label: 'Plasma', amount: plasma });
  if (credits > 0) rewards.push({ icon: 'credits', label: 'Créditos', amount: credits });
  const status = String(m.playerStatus ?? 'AVAILABLE').toUpperCase();
  return {
    id: String(m.id),
    title: String(m.name ?? 'Misión'),
    description: String(m.description ?? ''),
    timeSec: Number(m.durationSeconds ?? 180),
    rewards,
    status: status === 'COMPLETED' ? 'done' : status === 'ACTIVE' ? 'active' : 'available',
  };
}

export function MissionsScreen() {
  const router = useRouter();
  const [missions, setMissions] = useState<DestockMission[]>(MISSIONS);
  const [selected, setSelected] = useState(MISSIONS[0].id);
  const [activeEnds, setActiveEnds] = useState<number | null>(null);
  const [, setTick] = useState(0);

  // Logged in → load the REAL mission list from /api/missions; guest keeps the mock.
  useEffect(() => {
    if (!hasToken()) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/missions', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        const rows: Record<string, unknown>[] = json?.data ?? json ?? [];
        if (cancelled || !Array.isArray(rows) || rows.length === 0) return;
        const mapped = rows.map(apiMissionToDestock);
        setMissions(mapped);
        setSelected(mapped[0].id);
      } catch {
        /* keep mock on any failure */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as { activeId: string | null; endsAt: number | null };
        if (p.endsAt && p.endsAt > Date.now()) setActiveEnds(p.endsAt);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!activeEnds) return;
    const id = setInterval(() => {
      const now = Date.now();
      setTick(now);
      if (activeEnds <= now) {
        setActiveEnds(null);
        setMissions((prev) =>
          prev.map((m) => (m.status === 'active' ? { ...m, status: 'done' as const } : m))
        );
        localStorage.removeItem(STORAGE_KEY);
      }
    }, 400);
    return () => clearInterval(id);
  }, [activeEnds]);

  const mission = missions.find((m) => m.id === selected) ?? missions[0];

  const startMission = useCallback(() => {
    if (activeEnds) return;
    const endsAt = Date.now() + mission.timeSec * 1000;
    setActiveEnds(endsAt);
    setMissions((prev) =>
      prev.map((m) =>
        m.id === mission.id ? { ...m, status: 'active' as const } : m
      )
    );
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ activeId: mission.id, endsAt })
    );
  }, [activeEnds, mission]);

  return (
    <DestockGo2Shell title="Mando Táctico · Misiones">
      {activeEnds ? (
        <div className="go2-shipyard-queue go2-queue-panel">
          <div className="go2-queue-title">Misión en curso</div>
          <div className="go2-queue-slot">
            <div>{mission.title}</div>
            <div className="go2-queue-time">{formatGo2Countdown(activeEnds - Date.now())}</div>
          </div>
        </div>
      ) : null}
      <div className="go2-screen-layout go2-screen-layout--triple">
        <div className="go2-panel">
          <div className="go2-panel-head">Contratos del sector</div>
          <div className="go2-panel-body" style={{ padding: 0 }}>
            {missions.map((m) => (
              <button
                key={m.id}
                type="button"
                className={[
                  'go2-mission-card w-full text-left',
                  selected === m.id ? 'go2-mission-card--on' : '',
                ].join(' ')}
                style={{ border: 'none', background: 'transparent' }}
                onClick={() => setSelected(m.id)}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Go2IconFrame icon="mission" size="sm" rarity={m.status === 'done' ? 'common' : 'rare'} />
                  <div>
                    <p style={{ fontWeight: 800, color: '#fef3c7', fontSize: 11 }}>{m.title}</p>
                    <p style={{ fontSize: 9, color: '#78716c' }}>
                      {m.status === 'done' ? 'Completada' : m.status === 'active' ? 'En curso' : `${m.timeSec}s`}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="go2-panel go2-mission-preview">
          <div className="go2-panel-head">Sector</div>
          <div className="go2-panel-body go2-mission-preview-body">
            <Go2IconFrame icon="mission" size="xl" rarity="legendary" />
            <p style={{ marginTop: 12, fontWeight: 800, color: '#fef3c7', fontSize: 12 }}>{mission.title}</p>
            <p style={{ marginTop: 6, fontSize: 10, color: '#78716c' }}>{mission.timeSec}s estimados</p>
          </div>
        </div>
        <div className="go2-panel">
          <div className="go2-panel-head">Briefing</div>
          <div className="go2-panel-body">
            <p style={{ fontWeight: 800, color: '#fef3c7' }}>{mission.title}</p>
            <p style={{ marginTop: 8, fontSize: 11, color: '#a8a29e', lineHeight: 1.5 }}>
              {mission.description}
            </p>
            <div className="go2-mission-rewards">
              {mission.rewards.map((r) => (
                <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Go2IconFrame icon={r.icon} size="sm" rarity="uncommon" />
                  <span style={{ fontSize: 10, color: '#fcd34d' }}>
                    {r.amount} {r.label}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="go2-btn-primary"
              disabled={!!activeEnds}
              onClick={() => {
                // Derive the combat scenario (1..4) from the mission's position so it
                // works for both the real /api/missions list (UUID ids) and the mock.
                const idx = missions.findIndex((m) => m.id === mission.id);
                const combatId = Math.min(4, Math.max(1, (idx < 0 ? 0 : idx) + 1));
                router.push(`/destock/combat?mission=${combatId}`);
              }}
            >
              {activeEnds ? 'Misión en curso…' : 'Entrar al combate'}
            </button>
            <p style={{ marginTop: 8, fontSize: 9, color: '#78716c' }}>
              Instancia PvE — ref. GO II Misión 1 (video)
            </p>
          </div>
        </div>
      </div>
    </DestockGo2Shell>
  );
}
