'use client';

import { useEffect, useState } from 'react';
import { Go2IconFrame } from '@/components/game/go2/Go2IconFrame';
import { DestockGo2Shell } from '../components/DestockGo2Shell';
import { CLAN_MOCK } from '../data/destockInventoryData';
import {
  destockHasToken,
  loadAlliances,
  loadLeaderboard,
  type ApiLeaderboardRow,
} from '../destockApi';

const MOCK_MEMBERS = [
  { name: 'Comandante Orion', role: 'Líder', level: 24 },
  { name: 'Nexus-7', role: 'Oficial', level: 19 },
  { name: 'Vega Strike', role: 'Miembro', level: 16 },
  { name: 'Tú (Destock)', role: 'Miembro', level: 7, self: true },
];

interface ClanInfo {
  name: string;
  tag: string;
  level: number;
  members: number;
  maxMembers: number;
  leader: string;
  bonus: string;
  wars: number;
}

export function ClanScreen() {
  const [clan, setClan] = useState<ClanInfo>(CLAN_MOCK);
  const [ranking, setRanking] = useState<ApiLeaderboardRow[]>([]);

  // Logged in → real alliance (if any) + the real galaxy leaderboard as the member/rank list.
  useEffect(() => {
    if (!destockHasToken()) return;
    let cancelled = false;
    void (async () => {
      try {
        const [alliances, board] = await Promise.all([
          loadAlliances().catch(() => []),
          loadLeaderboard().catch(() => []),
        ]);
        if (cancelled) return;
        if (Array.isArray(board) && board.length) setRanking(board.slice(0, 20));
        const a = Array.isArray(alliances) ? alliances[0] : undefined;
        if (a) {
          setClan({
            name: a.name,
            tag: a.tag,
            level: a.level ?? 1,
            members: a.memberCount ?? 1,
            maxMembers: a.maxMembers ?? 40,
            leader: a.leaderName ?? '—',
            bonus: '+ producción de alianza',
            wars: 0,
          });
        }
      } catch {
        /* keep mock */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const useRealRanking = ranking.length > 0;

  return (
    <DestockGo2Shell title="Alianza · Clan">
      <div className="go2-screen-layout go2-screen-layout--triple">
        <div className="go2-panel">
          <div className="go2-panel-body" style={{ textAlign: 'center' }}>
            <Go2IconFrame icon="clan" size="xl" rarity="legendary" className="go2-clan-emblem" />
            <h2 style={{ fontSize: 14, fontWeight: 900, color: '#fef3c7' }}>{clan.name}</h2>
            <p className="go2-coords" style={{ marginTop: 4 }}>
              [{clan.tag}] · Nv.{clan.level}
            </p>
            <div className="go2-detail-stat" style={{ marginTop: 12 }}>
              <span>Miembros</span>
              <span>
                {clan.members}/{clan.maxMembers}
              </span>
            </div>
            <div className="go2-detail-stat">
              <span>Líder</span>
              <span>{clan.leader}</span>
            </div>
            <div className="go2-detail-stat">
              <span>Bonificación</span>
              <span style={{ color: '#4ade80' }}>{clan.bonus}</span>
            </div>
            <div className="go2-detail-stat">
              <span>Guerras activas</span>
              <span>{clan.wars}</span>
            </div>
          </div>
        </div>
        <div className="go2-panel">
          <div className="go2-panel-head">{useRealRanking ? 'Ranking de imperios' : 'Miembros'}</div>
          <div className="go2-panel-body" style={{ padding: 0 }}>
            {useRealRanking
              ? ranking.map((r) => (
                  <div key={r.empireId} className="go2-list-row">
                    <span style={{ color: '#e7e5e4' }}>
                      #{r.rank} {r.name}
                    </span>
                    <span>
                      Nv.{r.level} · {r.score.toLocaleString('es-ES')} pts
                    </span>
                  </div>
                ))
              : MOCK_MEMBERS.map((m) => (
                  <div
                    key={m.name}
                    className="go2-list-row"
                    style={m.self ? { background: 'rgba(251,191,36,0.08)' } : undefined}
                  >
                    <span style={{ color: m.self ? '#fcd34d' : '#e7e5e4' }}>{m.name}</span>
                    <span>
                      {m.role} · Nv.{m.level}
                    </span>
                  </div>
                ))}
          </div>
        </div>
        <div className="go2-panel">
          <div className="go2-panel-head">Acciones</div>
          <div className="go2-panel-body">
            <button type="button" className="go2-btn-primary">
              Donar recursos
            </button>
            <button type="button" className="go2-btn-primary" style={{ marginTop: 8 }}>
              Chat de alianza
            </button>
            <button type="button" className="go2-btn-primary" style={{ marginTop: 8 }}>
              Ver territorios
            </button>
            <p style={{ marginTop: 12, fontSize: 9, color: '#78716c' }}>
              {useRealRanking
                ? 'Ranking en vivo desde el servidor.'
                : 'Cooperación entre imperios — identidad DESTOCK SPACE.'}
            </p>
          </div>
        </div>
      </div>
    </DestockGo2Shell>
  );
}
