'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Go2IconFrame } from '@/components/game/go2/Go2IconFrame';
import type { Go2IconName } from '@/components/game/go2/Go2Icons';
import { DestockGo2Shell } from '../components/DestockGo2Shell';
import { destockHasToken, loadGalaxy } from '../destockApi';

type CellOwner = 'empty' | 'self' | 'ally' | 'enemy';

interface GalaxyCell {
  id: number;
  coord: string;
  name: string;
  owner: CellOwner;
  level?: number;
}

const GRID_W = 12;
const GRID_H = 10;

function buildGalaxy(): GalaxyCell[] {
  return Array.from({ length: GRID_W * GRID_H }, (_, i) => {
    const x = (i % GRID_W) + 1;
    const y = Math.floor(i / GRID_W) + 1;
    let owner: CellOwner = 'empty';
    if (i === 42) owner = 'self';
    else if (i % 19 === 0) owner = 'enemy';
    else if (i % 11 === 0) owner = 'ally';
    return {
      id: i,
      coord: `${x}:${y}`,
      name: owner === 'self' ? 'Planeta Principal' : `Sector ${1000 + i}`,
      owner,
      level: owner !== 'empty' ? 1 + (i % 5) : undefined,
    };
  });
}

const MOCK_GALAXY = buildGalaxy();

export function GalaxyScreen() {
  const [cells, setCells] = useState<GalaxyCell[]>(MOCK_GALAXY);
  const [selected, setSelected] = useState(42);
  const router = useRouter();

  // Logged in → overlay the REAL sector planets from /api/galaxy onto the grid.
  // Backend coords (galaxyX/galaxyY) are centered at 0,0 and can be negative, so we
  // map them onto the visible grid with the center at (6,5).
  useEffect(() => {
    if (!destockHasToken()) return;
    let cancelled = false;
    const CX = Math.floor(GRID_W / 2); // 6
    const CY = Math.floor(GRID_H / 2); // 5
    void (async () => {
      try {
        const g = await loadGalaxy();
        const own = g?.myPlanets ?? [];
        const npc = g?.npcPlanets ?? [];
        if (cancelled || (own.length === 0 && npc.length === 0)) return;
        const grid = buildGalaxy().map((c) => ({
          ...c,
          owner: 'empty' as CellOwner,
          level: undefined as number | undefined,
        }));
        const place = (x: number, y: number, owner: CellOwner, name: string, level?: number) => {
          const col = Math.min(GRID_W - 1, Math.max(0, CX + x));
          const row = Math.min(GRID_H - 1, Math.max(0, CY + y));
          const idx = row * GRID_W + col;
          if (idx < 0 || idx >= grid.length) return;
          grid[idx] = { id: idx, coord: `${col + 1}:${row + 1}`, name, owner, level };
        };
        for (const p of npc) {
          place(p.galaxyX, p.galaxyY, p.owner ? 'enemy' : 'ally', p.name, p.difficulty);
        }
        for (const p of own) {
          place(p.galaxyX, p.galaxyY, 'self', p.name); // own last → wins ties
        }
        const firstOwn = grid.find((c) => c.owner === 'self');
        setCells(grid);
        if (firstOwn) setSelected(firstOwn.id);
      } catch {
        /* keep mock */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const GALAXY = cells;
  const cell = useMemo(() => GALAXY.find((c) => c.id === selected) ?? GALAXY[0], [GALAXY, selected]);

  const cellIcon: Go2IconName =
    cell.owner === 'self'
      ? 'star-self'
      : cell.owner === 'enemy'
        ? 'star-enemy'
        : cell.owner === 'ally'
          ? 'star-ally'
          : 'star-empty';

  return (
    <DestockGo2Shell title="Galaxia · Mapa estelar">
      <div className="go2-screen-layout go2-screen-layout--galaxy">
        <div className="go2-panel">
          <div className="go2-panel-head">Sistema Orion · Región 7</div>
          <div className="go2-panel-body">
            <div className="go2-galaxy-map">
              {GALAXY.map((c) => {
                const icon: Go2IconName =
                  c.owner === 'self'
                    ? 'star-self'
                    : c.owner === 'enemy'
                      ? 'star-enemy'
                      : c.owner === 'ally'
                        ? 'star-ally'
                        : 'star-empty';
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={[
                      'go2-galaxy-cell',
                      c.owner !== 'empty' ? `go2-galaxy-cell--${c.owner}` : '',
                      selected === c.id ? 'go2-galaxy-cell--selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => setSelected(c.id)}
                    title={c.name}
                  >
                    <Go2IconFrame
                      icon={icon}
                      size="sm"
                      rarity={
                        c.owner === 'self'
                          ? 'rare'
                          : c.owner === 'enemy'
                            ? 'epic'
                            : c.owner === 'ally'
                              ? 'uncommon'
                              : 'common'
                      }
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="go2-panel">
          <div className="go2-panel-head">Detalle</div>
          <div className="go2-panel-body">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <Go2IconFrame icon={cellIcon} size="lg" rarity="rare" />
            </div>
            <p className="go2-coords">[{cell.coord}]</p>
            <p style={{ marginTop: 8, fontSize: 13, fontWeight: 800, color: '#fef3c7' }}>{cell.name}</p>
            <div className="go2-detail-stat" style={{ marginTop: 12 }}>
              <span>Propietario</span>
              <span>
                {cell.owner === 'self'
                  ? 'Tu imperio'
                  : cell.owner === 'enemy'
                    ? 'Hostil'
                    : cell.owner === 'ally'
                      ? 'Aliado'
                      : 'Vacío'}
              </span>
            </div>
            {cell.level != null ? (
              <div className="go2-detail-stat">
                <span>Nivel planeta</span>
                <span>{cell.level}</span>
              </div>
            ) : null}
            <div className="go2-detail-stat">
              <span>Recursos</span>
              <span>—</span>
            </div>
            {cell.owner === 'self' ? (
              <Link href="/destock" className="go2-btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                Ir al planeta
              </Link>
            ) : (
              <button
                type="button"
                className="go2-btn-primary"
                disabled={cell.owner === 'empty'}
                onClick={() => {
                  if (cell.owner === 'empty') return;
                  // Atacar el sector → lanza el combate. La misión escala con el nivel
                  // del planeta (1–4, las misiones definidas en destockCombatData).
                  const mission = Math.min(4, Math.max(1, cell.level ?? 1));
                  router.push(`/destock/combat?mission=${mission}`);
                }}
              >
                {cell.owner === 'empty' ? 'Sector vacío' : 'Espiar / Atacar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </DestockGo2Shell>
  );
}
