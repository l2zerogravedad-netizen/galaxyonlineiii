'use client';

import '@/components/game/go2/go2-combat.css';
import '@/components/game/go2/go2-visual.css';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Go2CombatField } from '@/components/game/go2/Go2CombatField';
import { Go2IconFrame } from '@/components/game/go2/Go2IconFrame';
import {
  apiMatchesClient,
  simulateCombatViaApi,
  type CombatSimApiResponse,
} from '../combat/combatApi';
import { useDestockCombat } from '../combat/useDestockCombat';
import { useDestockShared } from '../useDestockShared';

type ApiValidation =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; api: CombatSimApiResponse }
  | { status: 'mismatch'; api: CombatSimApiResponse }
  | { status: 'offline' };

export function CombatScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const missionId = Math.max(1, parseInt(params.get('mission') ?? '1', 10) || 1);
  const combat = useDestockCombat(missionId);
  const { setResources, showToast } = useDestockShared();
  const rewarded = useRef(false);
  const validated = useRef(false);
  const [apiValidation, setApiValidation] = useState<ApiValidation>({ status: 'idle' });

  useEffect(() => {
    if (combat.phase !== 'victory' || rewarded.current) return;
    rewarded.current = true;
    // Logged in → resources are server-owned (HUD polls /api/empire every 5s), so a
    // local credit would just be wiped on the next poll and mislead the player. The
    // deployed backend has no "claim combat reward" endpoint, so we only show an
    // honest message. Guests (local sandbox) get the reward credited to localStorage.
    let isGuest = true;
    try {
      isGuest = !localStorage.getItem('token');
    } catch {
      /* treat as guest */
    }
    if (isGuest) {
      setResources((prev) => {
        let next = { ...prev };
        for (const r of combat.mission.rewards) {
          if (r.icon === 'metal') next = { ...next, metal: next.metal + r.amount };
          if (r.icon === 'plasma') next = { ...next, plasma: next.plasma + r.amount };
          if (r.icon === 'credits') next = { ...next, credits: next.credits + r.amount };
        }
        return next;
      });
      showToast('Recompensas de misión recibidas');
    } else {
      showToast('¡Victoria! (recompensas de combate: próximamente en servidor)');
    }
  }, [combat.phase, combat.mission.rewards, setResources, showToast]);

  useEffect(() => {
    if (combat.phase !== 'victory' && combat.phase !== 'defeat') return;
    if (validated.current) return;
    validated.current = true;

    const snap = combat.getBattleSnapshot();
    if (!snap?.player.length || !snap.enemies.length) {
      setApiValidation({ status: 'offline' });
      return;
    }

    setApiValidation({ status: 'loading' });
    void (async () => {
      const api = await simulateCombatViaApi({
        player: snap.player,
        enemies: snap.enemies,
        maxRounds: combat.mission.maxRounds,
        seed: combat.combatSeed,
      });
      if (!api) {
        setApiValidation({ status: 'offline' });
        return;
      }
      const outcome = combat.phase as 'victory' | 'defeat';
      if (apiMatchesClient(api, outcome)) {
        setApiValidation({ status: 'ok', api });
        showToast(`Servidor confirma: ${api.winner} en ${api.rounds} rondas`);
      } else {
        setApiValidation({ status: 'mismatch', api });
        showToast('Divergencia cliente/servidor (demo)');
      }
    })();
  }, [combat.phase, combat.combatSeed, combat.mission.maxRounds, combat.getBattleSnapshot, showToast]);

  const logClass = (tone: string) => {
    if (tone === 'crit') return 'go2-log-line--crit';
    if (tone === 'hit') return 'go2-log-line--hit';
    if (tone === 'kill') return 'go2-log-line--kill';
    if (tone === 'warn') return 'go2-log-line--warn';
    return 'go2-log-line--info';
  };

  const validationLabel = () => {
    if (apiValidation.status === 'loading') return 'Validando con servidor…';
    if (apiValidation.status === 'ok')
      return `✓ API: victoria ${apiValidation.api.winner} · ${apiValidation.api.rounds} rondas`;
    if (apiValidation.status === 'mismatch')
      return `⚠ API: ${apiValidation.api.winner} (cliente: ${combat.phase})`;
    if (apiValidation.status === 'offline') return 'Modo local — API no respondió';
    return null;
  };

  return (
    <div className="go2-combat-root">
      <header className="go2-combat-topbar">
        <div>
          <p className="go2-combat-title">{combat.mission.title} / 30</p>
          <p className="go2-combat-sub">
            {combat.mission.subtitle}
            {combat.mission.mode === 'base_defense' ? ' · Defensa 4 esquinas' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="go2-coords">Ronda {combat.round}</span>
          <button
            type="button"
            className={['go2-combat-auto', combat.auto ? 'go2-combat-auto--on' : ''].join(' ')}
            onClick={() => combat.setAuto((a) => !a)}
            disabled={combat.phase !== 'fighting'}
          >
            Auto
          </button>
        </div>
      </header>

      <div className="go2-combat-body">
        <div>
          {combat.phase === 'deploy' ? (
            <div style={{ marginBottom: 8, padding: '0 4px', fontSize: 10, color: '#a8a29e' }}>
              Flota: {combat.playerDeployCount} naves ·{' '}
              <Link href="/destock/fleets" style={{ color: '#fcd34d' }}>
                Editar formación
              </Link>
              {' · '}
              <button
                type="button"
                style={{ color: '#67e8f9', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={combat.refreshFleet}
              >
                Recargar
              </button>
            </div>
          ) : null}
          <Go2CombatField
            units={combat.units}
            beams={combat.beams}
            focusCell={combat.focusCell}
            phase={combat.phase}
            showCornerMarkers={combat.mission.mode === 'base_defense'}
            onFocusEnemy={combat.setFocusCell}
          />
        </div>
        <aside className="go2-combat-log">
          <div className="go2-combat-log-head">Registro de combate</div>
          <div className="go2-combat-log-body scrollbar-game">
            {combat.log.map((line) => (
              <p key={line.id} className={logClass(line.tone)}>
                {line.text}
              </p>
            ))}
          </div>
        </aside>
      </div>

      <footer className="go2-combat-footer go2-combat-footer--actions">
        <Link
          href="/destock/missions"
          className="go2-header-btn go2-combat-exit"
          style={{ textDecoration: 'none' }}
        >
          Salir
        </Link>
        {combat.phase === 'deploy' ? (
          <button type="button" className="go2-btn-primary go2-combat-start" onClick={combat.startBattle}>
            Iniciar combate
          </button>
        ) : null}
        {combat.phase === 'fighting' && !combat.auto ? (
          <button type="button" className="go2-btn-primary go2-combat-start" onClick={combat.tick}>
            Siguiente ronda
          </button>
        ) : null}
        {combat.phase === 'fighting' ? (
          <span className="go2-coords" style={{ fontSize: 10 }}>
            Ronda {combat.round} · {combat.auto ? 'Auto' : 'Manual'}
          </span>
        ) : null}
        <Link href="/destock/missions" className="go2-header-btn" style={{ textDecoration: 'none' }}>
          Retirada
        </Link>
      </footer>

      {combat.phase === 'victory' || combat.phase === 'defeat' ? (
        <div className="go2-combat-overlay">
          <div className="go2-combat-result">
            <Go2IconFrame
              icon={combat.phase === 'victory' ? 'star-self' : 'star-enemy'}
              size="xl"
              rarity={combat.phase === 'victory' ? 'legendary' : 'epic'}
            />
            <h2 style={{ marginTop: 12 }}>{combat.phase === 'victory' ? 'Victoria' : 'Derrota'}</h2>
            {validationLabel() ? (
              <p
                style={{
                  marginTop: 10,
                  fontSize: 10,
                  color:
                    apiValidation.status === 'ok'
                      ? '#4ade80'
                      : apiValidation.status === 'mismatch'
                        ? '#fb923c'
                        : '#a8a29e',
                }}
              >
                {validationLabel()}
              </p>
            ) : null}
            {combat.phase === 'victory' ? (
              <div className="go2-mission-rewards" style={{ justifyContent: 'center', marginTop: 12 }}>
                {combat.mission.rewards.map((r) => (
                  <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Go2IconFrame icon={r.icon} size="sm" rarity="rare" />
                    <span style={{ fontSize: 10, color: '#fcd34d' }}>
                      +{r.amount} {r.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
            <button
              type="button"
              className="go2-btn-primary"
              style={{ marginTop: 16 }}
              onClick={() => router.push('/destock/missions')}
            >
              Volver a misiones
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
