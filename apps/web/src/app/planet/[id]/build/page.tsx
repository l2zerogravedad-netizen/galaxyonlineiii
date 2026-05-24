'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

interface Resource {
  type: string;
  amount: number;
  capacity: number;
}

interface Planet {
  id: string;
  name: string;
  buildings: Building[];
}

interface Building {
  id: string;
  type: string;
  level: number;
  slotIndex: number;
  status: string;
}

const BUILDING_TYPES = [
  { type: 'COMMAND_CENTER', name: 'Centro de Comando', description: 'Edificio principal del planeta' },
  { type: 'METAL_MINE', name: 'Mina de Metal', description: 'Produce metal cada hora' },
  { type: 'PLASMA_EXTRACTOR', name: 'Extractor de Plasma', description: 'Extrae plasma de las profundidades' },
  { type: 'SHIPYARD', name: 'Astillero', description: 'Construye naves espaciales' },
  { type: 'RESEARCH_LAB', name: 'Laboratorio', description: 'Investiga nuevas tecnologías' },
  { type: 'WAREHOUSE', name: 'Almacén', description: 'Aumenta capacidad de recursos' },
  { type: 'ACADEMY', name: 'Academia', description: 'Entrena comandantes' },
];

// NOTE: Frontend uses dev cost estimates for UI display
// Backend validates actual costs based on DEV_CHEAP_COSTS environment variable
const BASE_COSTS: Record<string, { metal: number; plasma: number; time: number }> = {
  COMMAND_CENTER: { metal: 1, plasma: 1, time: 10 },
  METAL_MINE: { metal: 1, plasma: 1, time: 5 },
  PLASMA_EXTRACTOR: { metal: 1, plasma: 1, time: 5 },
  SHIPYARD: { metal: 1, plasma: 1, time: 10 },
  RESEARCH_LAB: { metal: 1, plasma: 1, time: 10 },
  WAREHOUSE: { metal: 1, plasma: 1, time: 10 },
  ACADEMY: { metal: 1, plasma: 1, time: 10 },
};

export default function BuildPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const slotIndex = parseInt(searchParams.get('slot') || '0');
  
  const [planet, setPlanet] = useState<Planet | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [planetRes, resourcesRes] = await Promise.all([
          axios.get(`/api/planets/${params.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('/api/empire/resources', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setPlanet(planetRes.data);
        setResources(resourcesRes.data);
      } catch (err) {
        setError('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  const handleBuild = async (type: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setBuilding(type);
    setError('');

    try {
      await axios.post(
        `/api/planets/${params.id}/build`,
        { type, slotIndex },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al construir');
      setBuilding(null);
    }
  };

  // Variable costs with realistic endings, max level 30
  const getBuildingInfo = (type: string, level: number = 1) => {
    const base = BASE_COSTS[type];
    if (!base || level > 30) return null;
    
    // Exponential growth with pseudo-random endings
    const growthRate = 1.6; // 60% increase per level
    const typeOffset = type.charCodeAt(0) + type.length; // Unique offset per building type
    
    // Generate "realistic" numbers with varied endings like 15455873
    const noiseMetal = ((level * 137 + typeOffset * 53) % 847) + 123;
    const noisePlasma = ((level * 239 + typeOffset * 71) % 623) + 89;
    const noiseTime = ((level * 89 + typeOffset * 41) % 47) + 13;
    
    const metal = Math.floor(base.metal * Math.pow(growthRate, level - 1) * 100 + noiseMetal);
    const plasma = Math.floor(base.plasma * Math.pow(growthRate, level - 1) * 80 + noisePlasma);
    const time = Math.floor(base.time * Math.pow(1.3, level - 1) + noiseTime);
    
    return { metal, plasma, time };
  };

  const hasEnoughResources = (type: string, level: number = 1) => {
    const cost = getBuildingInfo(type, level);
    if (!cost) return false;

    const metal = resources.find((r) => r.type === 'METAL')?.amount || 0;
    const plasma = resources.find((r) => r.type === 'PLASMA')?.amount || 0;

    return metal >= cost.metal && plasma >= cost.plasma;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  const existingBuilding = planet?.buildings.find((b) => b.slotIndex === slotIndex);
  const isUpgrade = !!existingBuilding;
  const nextLevel = isUpgrade ? existingBuilding.level + 1 : 1;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded"
          >
            ← Volver
          </Link>
          <h1 className="text-2xl font-bold">
            {isUpgrade ? `Mejorar ${planet?.name}` : `Construir en ${planet?.name}`}
          </h1>
        </div>

        {/* Slot info */}
        <div className="bg-slate-800 p-4 rounded-lg mb-6">
          <p className="text-gray-400">Espacio {slotIndex + 1} de 9</p>
          {isUpgrade && (
            <p className="text-yellow-400">
              Edificio actual: {BUILDING_TYPES.find(b => b.type === existingBuilding.type)?.name || existingBuilding.type} (Nv. {existingBuilding.level})
            </p>
          )}
        </div>

        {/* Resources */}
        <div className="grid grid-cols-2 gap-4 mb-6">
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
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Building options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BUILDING_TYPES.map((buildingType) => {
            const cost = getBuildingInfo(buildingType.type, nextLevel);
            const canAfford = cost && hasEnoughResources(buildingType.type, nextLevel);
            const isCurrentBuilding = existingBuilding?.type === buildingType.type;
            const isDifferentBuilding = existingBuilding && !isCurrentBuilding;

            return (
              <div
                key={buildingType.type}
                className={`bg-slate-800 p-4 rounded-lg border-2 ${
                  isCurrentBuilding
                    ? 'border-blue-500'
                    : isDifferentBuilding
                    ? 'border-red-900/50 opacity-50'
                    : 'border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{buildingType.name}</h3>
                    <p className="text-sm text-gray-400">{buildingType.description}</p>
                  </div>
                  {isCurrentBuilding && (
                    <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded">
                      Actual
                    </span>
                  )}
                </div>

                {cost && (
                  <div className="space-y-1 text-sm mb-3">
                    <p className={resources.find(r => r.type === 'METAL')!.amount >= cost.metal ? '' : 'text-red-400'}>
                      Metal: {cost.metal.toLocaleString()}
                    </p>
                    <p className={resources.find(r => r.type === 'PLASMA')!.amount >= cost.plasma ? '' : 'text-red-400'}>
                      Plasma: {cost.plasma.toLocaleString()}
                    </p>
                    <p className="text-gray-400">Tiempo: {formatTime(cost.time)}</p>
                    <p className="text-blue-400">Nivel: {nextLevel}</p>
                  </div>
                )}

                <button
                  onClick={() => handleBuild(buildingType.type)}
                  disabled={building === buildingType.type || isDifferentBuilding || !canAfford}
                  className={`w-full py-2 rounded font-medium ${
                    isDifferentBuilding
                      ? 'bg-red-900/50 cursor-not-allowed'
                      : isCurrentBuilding
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-green-600 hover:bg-green-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {building === buildingType.type
                    ? 'Construyendo...'
                    : isDifferentBuilding
                    ? 'Ocupado'
                    : !canAfford
                    ? 'Recursos insuficientes'
                    : isCurrentBuilding
                    ? 'Mejorar'
                    : 'Construir'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
