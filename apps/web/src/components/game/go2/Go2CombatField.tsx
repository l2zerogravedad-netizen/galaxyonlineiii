'use client';

import { useMemo } from 'react';
import type { CombatBeam, CombatUnit } from '@/features/destock-space/combat/useDestockCombat';

const SIZE = 9;
const CELL = 28;
const GAP = 2;
const PAD = 8;
const STEP = CELL + GAP;

function cellCenter(cell: number): { x: number; y: number } {
  const col = cell % SIZE;
  const row = Math.floor(cell / SIZE);
  return {
    x: PAD + col * STEP + CELL / 2,
    y: PAD + row * STEP + CELL / 2,
  };
}

const SVG_W = PAD * 2 + SIZE * STEP - GAP;
const SVG_H = SVG_W;

export function Go2CombatField({
  units,
  beams,
  focusCell,
  phase,
  showCornerMarkers = false,
  onFocusEnemy,
}: {
  units: CombatUnit[];
  beams: CombatBeam[];
  focusCell: number | null;
  phase: string;
  showCornerMarkers?: boolean;
  onFocusEnemy: (cell: number) => void;
}) {
  const corners = new Set([0, 8, 72, 80]);
  const hitCells = useMemo(() => new Set(beams.map((b) => b.toCell)), [beams]);

  const byCell = useMemo(() => {
    const m = new Map<number, CombatUnit>();
    for (const u of units) {
      if (u.hp > 0) m.set(u.cell, u);
    }
    return m;
  }, [units]);

  return (
    <div className="go2-combat-field-wrap">
      <p className="go2-combat-side-label go2-combat-side-label--enemy">
        Campo de batalla — clic en enemigo para foco
      </p>
      <div className="go2-combat-grid-block go2-combat-grid-block--field">
        <svg
          className="go2-combat-beams-svg"
          width={SVG_W}
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          aria-hidden
        >
          <defs>
            <linearGradient id="go2-beam-player" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#7dd3fc" stopOpacity="1" />
              <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="go2-beam-enemy" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ea580c" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
              <stop offset="100%" stopColor="#fef3c7" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="go2-beam-crit" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fff" />
            </linearGradient>
          </defs>
          {beams.map((b) => {
            const from = cellCenter(b.fromCell);
            const to = cellCenter(b.toCell);
            const stroke =
              b.kind === 'crit'
                ? 'url(#go2-beam-crit)'
                : b.side === 'player'
                  ? 'url(#go2-beam-player)'
                  : 'url(#go2-beam-enemy)';
            return (
              <g key={b.id} className="go2-beam-stroke">
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={stroke}
                  strokeWidth={b.kind === 'crit' ? 3 : 2}
                  strokeLinecap="round"
                />
                <circle cx={to.x} cy={to.y} r={b.kind === 'crit' ? 5 : 3} fill={stroke} opacity={0.85} />
              </g>
            );
          })}
        </svg>
        <div
          className="go2-combat-grid-inner inline-grid gap-0.5"
          style={{ gridTemplateColumns: `repeat(${SIZE}, ${CELL}px)` }}
        >
          {Array.from({ length: SIZE * SIZE }, (_, i) => {
            const u = byCell.get(i);
            const isEnemy = u?.side === 'enemy';
            const isPlayer = u?.side === 'player';
            const pct = u ? Math.round((u.hp / u.maxHp) * 100) : 0;
            const canTarget = phase === 'fighting' && isEnemy;
            const cornerSpawn = showCornerMarkers && corners.has(i) && !u;

            return (
              <div
                key={i}
                className={[
                  'go2-combat-cell',
                  isPlayer ? 'go2-combat-cell--player' : '',
                  isEnemy ? 'go2-combat-cell--enemy' : '',
                  canTarget ? 'go2-combat-cell--enemy-target' : '',
                  focusCell === i && isEnemy ? 'go2-combat-cell--focus' : '',
                  hitCells.has(i) ? 'go2-combat-flash' : '',
                  cornerSpawn ? 'go2-combat-cell--corner' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => canTarget && onFocusEnemy(i)}
                role={canTarget ? 'button' : undefined}
                tabIndex={canTarget ? 0 : undefined}
              >
                {u ? (
                  <div className="go2-combat-ship">
                    <div className="go2-combat-hp">
                      <div className="go2-combat-hp-fill" style={{ width: `${pct}%` }} />
                    </div>
                    {u.shield > 0 ? (
                      <div
                        className="go2-combat-shield"
                        style={{
                          width: `${Math.round((u.shield / u.maxShield) * 70)}%`,
                          margin: '0 auto',
                        }}
                      />
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
