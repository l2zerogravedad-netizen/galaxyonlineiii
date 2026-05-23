'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

interface Technology {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
  currentLevel: number;
  maxLevel: number;
  status: string;
  isMaxLevel: boolean;
  prerequisiteMet: boolean;
  prerequisiteName: string | null;
  costs: {
    metal: number;
    plasma: number;
    time: number;
  };
  effects: {
    type: string;
    value: number;
    description: string;
  };
  researchStatus: {
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
  PRODUCTION: 'Producción',
  CONSTRUCTION: 'Construcción',
  MILITARY: 'Militar',
  LOGISTICS: 'Logística',
  PROPULSION: 'Propulsión',
  GENERAL: 'General',
};

const categoryColors: Record<string, string> = {
  PRODUCTION: 'text-green-400',
  CONSTRUCTION: 'text-yellow-400',
  MILITARY: 'text-red-400',
  LOGISTICS: 'text-blue-400',
  PROPULSION: 'text-purple-400',
  GENERAL: 'text-gray-400',
};

export default function ResearchPage() {
  const router = useRouter();
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [researchingId, setResearchingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [activeResearch, setActiveResearch] = useState<Technology | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    fetchData();

    // Sync research completion every 10 seconds
    const syncInterval = setInterval(() => {
      syncResearch();
    }, 10000);

    return () => clearInterval(syncInterval);
  }, [router]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const [techRes, resourceRes] = await Promise.all([
        axios.get('/api/research', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/empire/resources', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const techs = techRes.data.technologies;
      setTechnologies(techs);
      setResources(resourceRes.data);

      // Check for active research
      const active = techs.find((t: Technology) => t.status === 'RESEARCHING');
      setActiveResearch(active || null);

      setLoading(false);
    } catch (err) {
      setError('Error al cargar datos');
      setLoading(false);
    }
  };

  const syncResearch = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.post(
        '/api/research/sync',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.completedCount > 0) {
        // Refresh data to show completed research
        fetchData();
      }
    } catch (err) {
      // Silent fail for auto-sync
    }
  };

  const startResearch = async (technologyId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setResearchingId(technologyId);
    setError('');

    try {
      await axios.post(
        `/api/research/${technologyId}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh data
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar investigación');
      setResearchingId(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const canAfford = (costs: { metal: number; plasma: number }) => {
    const metal = resources.find((r) => r.type === 'METAL')?.amount || 0;
    const plasma = resources.find((r) => r.type === 'PLASMA')?.amount || 0;
    return metal >= costs.metal && plasma >= costs.plasma;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  // Group technologies by category
  const groupedTechs = technologies.reduce((acc, tech) => {
    const cat = tech.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tech);
    return acc;
  }, {} as Record<string, Technology[]>);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded"
            >
              ← Volver
            </Link>
            <h1 className="text-2xl font-bold">Centro de Investigación</h1>
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

        {/* Active Research */}
        {activeResearch && (
          <div className="bg-yellow-900/30 border border-yellow-500 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-yellow-400 mb-2">
              🔬 Investigación en Progreso
            </h2>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{activeResearch.name}</p>
                <p className="text-sm text-gray-400">
                  Nivel {activeResearch.currentLevel} → {activeResearch.currentLevel + 1}
                </p>
              </div>
              <div className="text-right">
                <p className="text-yellow-400 font-mono">
                  {activeResearch.researchStatus &&
                    formatTime(Math.floor(activeResearch.researchStatus.timeRemaining / 1000))}
                </p>
                <div className="w-32 h-2 bg-slate-700 rounded-full mt-1">
                  <div
                    className="h-full bg-yellow-500 rounded-full transition-all"
                    style={{ width: `${activeResearch.researchStatus?.progress || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Technologies by Category */}
        {Object.entries(groupedTechs).map(([category, techs]) => (
          <div key={category} className="mb-8">
            <h2 className={`text-lg font-semibold mb-4 ${categoryColors[category] || 'text-gray-400'}`}>
              {categoryNames[category] || category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {techs.map((tech) => {
                const affordable = canAfford(tech.costs);
                const isResearching = tech.status === 'RESEARCHING';
                const isLocked = tech.status === 'LOCKED' || !tech.prerequisiteMet;
                const isAvailable = tech.status === 'AVAILABLE' || tech.status === 'COMPLETED';

                return (
                  <div
                    key={tech.id}
                    className={`bg-slate-800 p-4 rounded-lg border-2 ${
                      isResearching
                        ? 'border-yellow-500'
                        : isLocked
                        ? 'border-slate-700 opacity-60'
                        : tech.isMaxLevel
                        ? 'border-green-500'
                        : 'border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{tech.name}</h3>
                        <p className="text-xs text-gray-400">{tech.description}</p>
                      </div>
                      <span className="text-sm font-mono">
                        Nv. {tech.currentLevel}/{tech.maxLevel}
                      </span>
                    </div>

                    {/* Effects */}
                    <div className="text-sm mb-3">
                      <p className="text-green-400">{tech.effects.description}</p>
                    </div>

                    {/* Costs */}
                    {!tech.isMaxLevel && !isResearching && (
                      <div className="space-y-1 text-sm mb-3">
                        <p className={!affordable ? 'text-red-400' : ''}>
                          Metal: {tech.costs.metal.toLocaleString()}
                        </p>
                        <p className={!affordable ? 'text-red-400' : ''}>
                          Plasma: {tech.costs.plasma.toLocaleString()}
                        </p>
                        <p className="text-gray-400">
                          Tiempo: {formatTime(tech.costs.time)}
                        </p>
                      </div>
                    )}

                    {/* Status/Action */}
                    {isResearching ? (
                      <div className="text-center">
                        <p className="text-yellow-400">Investigando...</p>
                        <div className="w-full h-2 bg-slate-700 rounded-full mt-2">
                          <div
                            className="h-full bg-yellow-500 rounded-full transition-all"
                            style={{ width: `${tech.researchStatus?.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    ) : isLocked ? (
                      <div className="text-center text-red-400">
                        <p>Bloqueado</p>
                        {tech.prerequisiteName && (
                          <p className="text-xs">Requiere: {tech.prerequisiteName}</p>
                        )}
                      </div>
                    ) : tech.isMaxLevel ? (
                      <div className="text-center text-green-400 font-semibold">
                        ✓ Nivel Máximo
                      </div>
                    ) : activeResearch ? (
                      <div className="text-center text-gray-500">
                        Otra investigación en curso
                      </div>
                    ) : (
                      <button
                        onClick={() => startResearch(tech.id)}
                        disabled={researchingId === tech.id || !affordable}
                        className={`w-full py-2 rounded font-medium ${
                          !affordable
                            ? 'bg-red-900/50 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {!affordable
                          ? 'Recursos insuficientes'
                          : researchingId === tech.id
                          ? 'Iniciando...'
                          : 'Investigar'}
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
