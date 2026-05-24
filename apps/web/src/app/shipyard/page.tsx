'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

interface Blueprint {
  id: string;
  key: string;
  name: string;
  type: string;
  category: string;
  description: string;
  stats: {
    attack: number;
    defense: number;
    hp: number;
    speed: number;
    cargoCapacity: number;
  };
  costs: {
    metal: number;
    plasma: number;
    credits: number;
  };
  buildTime: number;
  unlocked: boolean;
  unlockRequirements: {
    tech: string | null;
    building: string | null;
  };
  inventory: number;
  activeConstruction: {
    id: string;
    quantity: number;
    timeRemaining: number;
    progress: number;
    endsAt: string;
  } | null;
}

interface Resource {
  type: string;
  amount: number;
  capacity: number;
}

const categoryNames: Record<string, string> = {
  COMBAT: 'Combate',
  CIVIL: 'Civil',
  TRANSPORT: 'Transporte',
};

const categoryColors: Record<string, string> = {
  COMBAT: 'text-red-400',
  CIVIL: 'text-blue-400',
  TRANSPORT: 'text-green-400',
};

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
    if (!token) {
      router.push('/');
      return;
    }

    fetchData();

    // Sync construction every 10 seconds
    const syncInterval = setInterval(() => {
      syncConstruction();
    }, 10000);

    return () => clearInterval(syncInterval);
  }, [router]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const [shipyardRes, resourceRes] = await Promise.all([
        axios.get('/api/shipyard', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/empire/resources', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setBlueprints(shipyardRes.data.blueprints);
      setHasShipyard(shipyardRes.data.hasShipyard);
      setResources(resourceRes.data);
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
      const response = await axios.post(
        '/api/shipyard/sync',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.completedCount > 0) {
        fetchData();
      }
    } catch (err) {
      // Silent fail
    }
  };

  const startConstruction = async (blueprintId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setBuildingId(blueprintId);
    setError('');

    try {
      await axios.post(
        '/api/shipyard/build',
        { blueprintId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

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
    const plasma = resources.find((r) => r.type === 'PLASMA')?.amount || 0;
    const credits = resources.find((r) => r.type === 'CREDITS')?.amount || 0;
    return (
      metal >= costs.metal * quantity &&
      plasma >= costs.plasma * quantity &&
      credits >= costs.credits * quantity
    );
  };

  const hasActiveConstruction = blueprints.some((b) => b.activeConstruction);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!hasShipyard) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded">
              ← Volver
            </Link>
            <h1 className="text-2xl font-bold">Astillero</h1>
          </div>
          <div className="bg-red-900/50 border border-red-500 p-6 rounded-lg text-center">
            <p className="text-red-200 text-lg">
              🔧 Necesitas construir un <strong>Astillero</strong> en tu planeta para desbloquear esta funcionalidad.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Group by category
  const groupedBlueprints = blueprints.reduce((acc, bp) => {
    const cat = bp.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(bp);
    return acc;
  }, {} as Record<string, Blueprint[]>);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded">
              ← Volver
            </Link>
            <h1 className="text-2xl font-bold">Astillero</h1>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              router.push('/');
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
          >
            Salir
          </button>
        </div>

        {/* Resources */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800 p-4 rounded-lg">
            <p className="text-gray-400">Metal</p>
            <p className="text-xl font-bold">
              {Math.floor(resources.find((r) => r.type === 'METAL')?.amount || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-800 p-4 rounded-lg">
            <p className="text-gray-400">Plasma</p>
            <p className="text-xl font-bold">
              {Math.floor(resources.find((r) => r.type === 'PLASMA')?.amount || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-800 p-4 rounded-lg">
            <p className="text-gray-400">Créditos</p>
            <p className="text-xl font-bold">
              {Math.floor(resources.find((r) => r.type === 'CREDITS')?.amount || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Quantity selector */}
        <div className="bg-slate-800 p-4 rounded-lg mb-6">
          <label className="text-sm text-gray-400">Cantidad a construir:</label>
          <div className="flex items-center gap-4 mt-2">
            <input
              type="range"
              min="1"
              max="10"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-xl font-bold w-12 text-center">{quantity}</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Blueprints by Category */}
        {Object.entries(groupedBlueprints).map(([category, bps]) => (
          <div key={category} className="mb-8">
            <h2 className={`text-lg font-semibold mb-4 ${categoryColors[category] || 'text-gray-400'}`}>
              {categoryNames[category] || category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bps.map((bp) => {
                const affordable = canAfford(bp.costs);
                const isBuilding = !!bp.activeConstruction;
                const isLocked = !bp.unlocked;

                const totalMetal = bp.costs.metal * quantity;
                const totalPlasma = bp.costs.plasma * quantity;
                const totalCredits = bp.costs.credits * quantity;
                const totalTime = bp.buildTime * quantity;

                return (
                  <div
                    key={bp.id}
                    className={`bg-slate-800 p-4 rounded-lg border-2 ${
                      isBuilding
                        ? 'border-yellow-500'
                        : isLocked
                        ? 'border-slate-700 opacity-60'
                        : 'border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{bp.name}</h3>
                        <p className="text-xs text-gray-400">{bp.description}</p>
                      </div>
                      {bp.inventory > 0 && (
                        <span className="text-sm bg-green-900/50 text-green-300 px-2 py-1 rounded">
                          x{bp.inventory}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                      <div className="bg-slate-700 p-1 rounded text-center">
                        <span className="text-red-400">ATK</span>
                        <p>{bp.stats.attack}</p>
                      </div>
                      <div className="bg-slate-700 p-1 rounded text-center">
                        <span className="text-blue-400">DEF</span>
                        <p>{bp.stats.defense}</p>
                      </div>
                      <div className="bg-slate-700 p-1 rounded text-center">
                        <span className="text-green-400">HP</span>
                        <p>{bp.stats.hp}</p>
                      </div>
                    </div>

                    {/* Costs */}
                    {!isLocked && !isBuilding && (
                      <div className="space-y-1 text-sm mb-3">
                        <p className={!affordable ? 'text-red-400' : ''}>
                          Metal: {totalMetal.toLocaleString()}
                        </p>
                        <p className={!affordable ? 'text-red-400' : ''}>
                          Plasma: {totalPlasma.toLocaleString()}
                        </p>
                        <p className={!affordable ? 'text-red-400' : ''}>
                          Créditos: {totalCredits.toLocaleString()}
                        </p>
                        <p className="text-gray-400">Tiempo: {formatTime(totalTime)}</p>
                      </div>
                    )}

                    {/* Status/Action */}
                    {isBuilding ? (
                      <div className="text-center">
                        <p className="text-yellow-400">
                          Construyendo {bp.activeConstruction?.quantity} unidad(es)...
                        </p>
                        <p className="text-yellow-400 font-mono">
                          {formatTime(Math.floor((bp.activeConstruction?.timeRemaining || 0) / 1000))}
                        </p>
                        <div className="w-full h-2 bg-slate-700 rounded-full mt-2">
                          <div
                            className="h-full bg-yellow-500 rounded-full transition-all"
                            style={{ width: `${bp.activeConstruction?.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    ) : isLocked ? (
                      <div className="text-center text-red-400">
                        <p>Bloqueado</p>
                        {bp.unlockRequirements.tech && (
                          <p className="text-xs">Requiere: {bp.unlockRequirements.tech}</p>
                        )}
                      </div>
                    ) : hasActiveConstruction ? (
                      <div className="text-center text-gray-500">
                        Otra construcción en curso
                      </div>
                    ) : (
                      <button
                        onClick={() => startConstruction(bp.id)}
                        disabled={buildingId === bp.id || !affordable}
                        className={`w-full py-2 rounded font-medium ${
                          !affordable
                            ? 'bg-red-900/50 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {!affordable
                          ? 'Recursos insuficientes'
                          : buildingId === bp.id
                          ? 'Construyendo...'
                          : 'Construir'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
