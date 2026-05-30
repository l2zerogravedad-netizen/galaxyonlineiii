'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Go2ScreenShell } from '@/components/game/go2/Go2ScreenShell';

interface Blueprint {
  id: string;
  key: string;
  name: string;
  type: string;
  category: string;
  description: string;
  stats: { attack: number; defense: number; hp: number; speed: number; cargoCapacity: number };
  costs: { metal: number; plasma: number; credits: number };
  buildTime: number;
  unlocked: boolean;
  unlockRequirements: { tech: string | null; building: string | null };
  inventory: number;
  activeConstruction: { id: string; quantity: number; timeRemaining: number; progress: number; endsAt: string } | null;
}

interface Resource { type: string; amount: number; capacity: number }

const categoryNames: Record<string, string> = { COMBAT: 'Combate', CIVIL: 'Civil', TRANSPORT: 'Transporte' };

export default function ShipyardPage() {
  const router = useRouter();
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [hasShipyard, setHasShipyard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buildingId, setBuildingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/'); return; }
    fetchData();
    const syncInterval = setInterval(() => syncConstruction(), 10000);
    return () => clearInterval(syncInterval);
  }, [router]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const [shipyardRes, resourceRes] = await Promise.all([
        axios.get('/api/shipyard', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/empire', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const d = shipyardRes.data.data ?? shipyardRes.data;
      setBlueprints(d.blueprints ?? []);
      setHasShipyard(d.hasShipyard ?? false);
      setResources(resourceRes.data.resources ?? []);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar datos');
      setLoading(false);
    }
  };

  const syncConstruction = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.post('/api/shipyard/sync', {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch { fetchData(); }
  };

  const startConstruction = async (blueprintId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setBuildingId(blueprintId);
    setError('');
    try {
      await axios.post('/api/shipyard/build', { blueprintId, quantity }, { headers: { Authorization: `Bearer ${token}` } });
      setQuantity(1);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al construir nave');
      setBuildingId(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const canAfford = (costs: { metal: number; plasma: number; credits: number }) => {
    const metal = resources.find((r) => r.type === 'METAL')?.amount || 0;
    const plasma = resources.find((r) => r.type === 'GAS')?.amount || 0;
    const credits = resources.find((r) => r.type === 'CREDITS')?.amount || 0;
    return metal >= costs.metal * quantity && plasma >= costs.plasma * quantity && credits >= costs.credits * quantity;
  };

  const hasActiveConstruction = blueprints.some((b) => b.activeConstruction);

  if (loading) {
    return <Go2ScreenShell title="Astillero" subtitle="Doca de Forja"><div className="go2-loading">Cargando…</div></Go2ScreenShell>;
  }

  if (!hasShipyard) {
    return (
      <Go2ScreenShell title="Astillero" subtitle="Doca de Forja">
        <div className="go2-empty">🔧 Necesitas construir un <strong>Astillero</strong> en tu planeta para desbloquear esta funcionalidad.</div>
      </Go2ScreenShell>
    );
  }

  const grouped = blueprints.reduce((acc, bp) => {
    (acc[bp.category] ||= []).push(bp);
    return acc;
  }, {} as Record<string, Blueprint[]>);

  return (
    <Go2ScreenShell title="Astillero" subtitle="Doca de Forja · construcción de naves">
      {/* Quantity selector */}
      <div className="go2-panel" style={{ marginBottom: 12, maxWidth: 420 }}>
        <div className="go2-panel-body" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--go2-dim)' }}>Cantidad</span>
          <input type="range" min={1} max={10} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} style={{ flex: 1 }} />
          <span style={{ fontWeight: 800, width: 28, textAlign: 'center' }}>{quantity}</span>
        </div>
      </div>

      {error && <div className="go2-panel" style={{ marginBottom: 12, borderColor: '#b91c1c' }}><div className="go2-panel-body" style={{ color: 'var(--go2-red)' }}>{error}</div></div>}

      {Object.entries(grouped).map(([category, bps]) => (
        <div key={category} style={{ marginBottom: 18 }}>
          <div className="go2-panel-head" style={{ borderRadius: 8, border: '1px solid var(--go2-line-soft)', marginBottom: 10 }}>{categoryNames[category] || category}</div>
          <div className="go2-grid go2-grid--2">
            {bps.map((bp) => {
              const affordable = canAfford(bp.costs);
              const isBuilding = !!bp.activeConstruction;
              const isLocked = !bp.unlocked;
              const totalMetal = bp.costs.metal * quantity;
              const totalPlasma = bp.costs.plasma * quantity;
              const totalCredits = bp.costs.credits * quantity;
              const totalTime = bp.buildTime * quantity;
              return (
                <div key={bp.id} className={['go2-card', isLocked ? 'go2-card--locked' : ''].join(' ')} style={{ cursor: 'default', borderColor: isBuilding ? 'var(--go2-gold)' : undefined }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="go2-card-title">{bp.name}</div>
                      <div className="go2-card-sub">{bp.description}</div>
                    </div>
                    {bp.inventory > 0 && <span className="go2-badge go2-badge--ok">x{bp.inventory}</span>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginTop: 6 }}>
                    <div className="go2-stat" style={{ flexDirection: 'column', borderBottom: 'none', padding: '4px', background: 'rgba(0,0,0,0.25)', borderRadius: 6, textAlign: 'center' }}><span style={{ color: '#f87171' }}>ATK</span><span>{bp.stats.attack}</span></div>
                    <div className="go2-stat" style={{ flexDirection: 'column', borderBottom: 'none', padding: '4px', background: 'rgba(0,0,0,0.25)', borderRadius: 6, textAlign: 'center' }}><span style={{ color: '#7fd0ff' }}>DEF</span><span>{bp.stats.defense}</span></div>
                    <div className="go2-stat" style={{ flexDirection: 'column', borderBottom: 'none', padding: '4px', background: 'rgba(0,0,0,0.25)', borderRadius: 6, textAlign: 'center' }}><span style={{ color: '#4ade80' }}>HP</span><span>{bp.stats.hp}</span></div>
                  </div>
                  {!isLocked && !isBuilding && (
                    <div style={{ marginTop: 8 }}>
                      <div className="go2-stat"><span>Metal</span><span style={{ color: affordable ? undefined : 'var(--go2-red)' }}>{totalMetal.toLocaleString()}</span></div>
                      <div className="go2-stat"><span>Gas</span><span style={{ color: affordable ? undefined : 'var(--go2-red)' }}>{totalPlasma.toLocaleString()}</span></div>
                      <div className="go2-stat"><span>Créditos</span><span style={{ color: affordable ? undefined : 'var(--go2-red)' }}>{totalCredits.toLocaleString()}</span></div>
                      <div className="go2-stat"><span>Tiempo</span><span>{formatTime(totalTime)}</span></div>
                    </div>
                  )}
                  {isBuilding ? (
                    <div style={{ marginTop: 8, textAlign: 'center' }}>
                      <div style={{ color: 'var(--go2-gold)', fontSize: 12 }}>Construyendo {bp.activeConstruction?.quantity} ud.</div>
                      <div className="go2-queue-time">{formatTime(Math.floor((bp.activeConstruction?.timeRemaining || 0) / 1000))}</div>
                      <div className="go2-progress"><div className="go2-progress-fill" style={{ width: `${bp.activeConstruction?.progress || 0}%` }} /></div>
                    </div>
                  ) : isLocked ? (
                    <div style={{ marginTop: 8, textAlign: 'center', color: 'var(--go2-dim)' }}>
                      <span className="go2-badge go2-badge--locked">Bloqueado</span>
                      {bp.unlockRequirements.tech && <div className="go2-card-sub" style={{ marginTop: 4 }}>Requiere: {bp.unlockRequirements.tech}</div>}
                    </div>
                  ) : hasActiveConstruction ? (
                    <div style={{ marginTop: 8, textAlign: 'center', color: 'var(--go2-dim)', fontSize: 12 }}>Otra construcción en curso</div>
                  ) : (
                    <button className="go2-btn go2-btn--block" style={{ marginTop: 8 }} onClick={() => startConstruction(bp.id)} disabled={buildingId === bp.id || !affordable}>
                      {!affordable ? 'Recursos insuficientes' : buildingId === bp.id ? 'Construyendo…' : 'Construir'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </Go2ScreenShell>
  );
}
