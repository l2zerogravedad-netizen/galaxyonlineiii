'use client';

import React, { useState, useEffect } from 'react';
import { CombatSession, CombatStatus } from '@/types';
import { useCombatStore } from '@/store';
import toast from 'react-hot-toast';

interface CombatHistoryProps {
  className?: string;
}

const CombatHistory: React.FC<CombatHistoryProps> = ({ className = '' }) => {
  const { combatSessions, fetchCombatSessions, isLoading } = useCombatStore();
  const [filter, setFilter] = useState<'all' | 'completed' | 'active' | 'aborted'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'performance'>('date');

  useEffect(() => {
    fetchCombatSessions();
  }, [fetchCombatSessions]);

  // Mock historical combat data
  const historicalCombats: CombatSession[] = [
    {
      id: 'combat_001',
      participants: [
        { userId: 'user1', ships: ['ship1'], ready: true },
        { userId: 'opponent1', ships: ['ship2'], ready: true },
      ],
      status: 'completed',
      location: {
        systemId: 'alpha_centauri',
        coordinates: { x: 100, y: 50, z: 25 },
        terrain: 'asteroid_field',
      },
      startTime: '2024-01-15T14:30:00Z',
      endTime: '2024-01-15T14:45:30Z',
      createdAt: '2024-01-15T14:30:00Z',
      updatedAt: '2024-01-15T14:45:30Z',
    },
    {
      id: 'combat_002',
      participants: [
        { userId: 'user1', ships: ['ship1'], ready: true },
        { userId: 'opponent2', ships: ['ship3'], ready: true },
      ],
      status: 'completed',
      location: {
        systemId: 'beta_system',
        coordinates: { x: -50, y: 75, z: -30 },
        terrain: 'nebula',
      },
      startTime: '2024-01-14T10:15:00Z',
      endTime: '2024-01-14T10:28:45Z',
      createdAt: '2024-01-14T10:15:00Z',
      updatedAt: '2024-01-14T10:28:45Z',
    },
    {
      id: 'combat_003',
      participants: [
        { userId: 'user1', ships: ['ship1'], ready: true },
        { userId: 'opponent3', ships: ['ship4'], ready: false },
      ],
      status: 'aborted',
      location: {
        systemId: 'gamma_sector',
        coordinates: { x: 0, y: 0, z: 0 },
      },
      startTime: '2024-01-13T18:45:00Z',
      endTime: '2024-01-13T19:02:15Z',
      createdAt: '2024-01-13T18:45:00Z',
      updatedAt: '2024-01-13T19:02:15Z',
    },
  ];

  // Mock combat results
  const combatResults: { [key: string]: any } = {
    'combat_001': {
      winner: 'user1',
      experience: 250,
      credits: 500,
      items: 2,
      performance: 'A',
      totalDamage: 1250,
      damageReceived: 890,
      duration: '00:15:30',
    },
    'combat_002': {
      winner: 'opponent2',
      experience: 100,
      credits: 200,
      items: 1,
      performance: 'C',
      totalDamage: 980,
      damageReceived: 1150,
      duration: '00:13:45',
    },
    'combat_003': {
      winner: null,
      experience: 50,
      credits: 100,
      items: 0,
      performance: 'D',
      totalDamage: 450,
      damageReceived: 320,
      duration: '00:17:15',
    },
  };

  const allCombats = [...combatSessions, ...historicalCombats];

  const filteredCombats = allCombats.filter(combat => {
    if (filter === 'all') return true;
    return combat.status === filter;
  });

  const sortedCombats = [...filteredCombats].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'duration':
        const aDuration = combatResults[a.id]?.duration || '00:00:00';
        const bDuration = combatResults[b.id]?.duration || '00:00:00';
        return bDuration.localeCompare(aDuration);
      case 'performance':
        const performanceOrder = { 'S': 4, 'A': 3, 'B': 2, 'C': 1, 'D': 0 };
        const aPerf = performanceOrder[combatResults[a.id]?.performance || 'D'] || 0;
        const bPerf = performanceOrder[combatResults[b.id]?.performance || 'D'] || 0;
        return bPerf - aPerf;
      default:
        return 0;
    }
  });

  const getStatusColor = (status: CombatStatus) => {
    switch (status) {
      case 'waiting':
        return 'text-yellow-400 bg-yellow-900/30';
      case 'active':
        return 'text-green-400 bg-green-900/30';
      case 'paused':
        return 'text-blue-400 bg-blue-900/30';
      case 'completed':
        return 'text-gray-400 bg-gray-900/30';
      case 'aborted':
        return 'text-red-400 bg-red-900/30';
      default:
        return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getStatusText = (status: CombatStatus) => {
    switch (status) {
      case 'waiting':
        return 'Esperando';
      case 'active':
        return 'Activo';
      case 'paused':
        return 'Pausado';
      case 'completed':
        return 'Completado';
      case 'aborted':
        return 'Abortado';
      default:
        return status;
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'S': return 'text-purple-400 bg-purple-900/30';
      case 'A': return 'text-green-400 bg-green-900/30';
      case 'B': return 'text-blue-400 bg-blue-900/30';
      case 'C': return 'text-yellow-400 bg-yellow-900/30';
      case 'D': return 'text-red-400 bg-red-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTotalStats = () => {
    return sortedCombats.reduce((acc, combat) => {
      const result = combatResults[combat.id];
      if (result) {
        acc.totalCombats++;
        acc.totalExperience += result.experience;
        acc.totalCredits += result.credits;
        acc.totalItems += result.items;
        acc.totalDamage += result.totalDamage;
        acc.totalDamageReceived += result.damageReceived;
        if (result.winner === 'user1') acc.victories++;
        if (result.winner && result.winner !== 'user1') acc.defeats++;
        if (!result.winner) acc.aborted++;
      }
      return acc;
    }, {
      totalCombats: 0,
      victories: 0,
      defeats: 0,
      aborted: 0,
      totalExperience: 0,
      totalCredits: 0,
      totalItems: 0,
      totalDamage: 0,
      totalDamageReceived: 0,
    });
  };

  const totalStats = getTotalStats();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
        <h2 className="text-2xl font-bold text-white mb-2">Historial de Combates</h2>
        <p className="text-gray-300">
          Revisa tu historial completo de batallas y estadísticas acumuladas
        </p>
      </div>

      {/* Total Statistics */}
      <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
        <h3 className="text-xl font-bold text-white mb-4">Estadísticas Generales</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-secondary-700 rounded-lg p-4">
            <div className="text-3xl font-bold text-white mb-1">{totalStats.totalCombats}</div>
            <div className="text-sm text-gray-300">Total de Combates</div>
          </div>
          <div className="bg-secondary-700 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-400 mb-1">{totalStats.victories}</div>
            <div className="text-sm text-gray-300">Victorias</div>
          </div>
          <div className="bg-secondary-700 rounded-lg p-4">
            <div className="text-3xl font-bold text-red-400 mb-1">{totalStats.defeats}</div>
            <div className="text-sm text-gray-300">Derrotas</div>
          </div>
          <div className="bg-secondary-700 rounded-lg p-4">
            <div className="text-3xl font-bold text-yellow-400 mb-1">{totalStats.totalExperience}</div>
            <div className="text-sm text-gray-300">Experiencia Total</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-secondary-700 rounded-lg p-4">
            <div className="text-xl font-bold text-yellow-400 mb-1">{totalStats.totalCredits}</div>
            <div className="text-sm text-gray-300">Créditos Ganados</div>
          </div>
          <div className="bg-secondary-700 rounded-lg p-4">
            <div className="text-xl font-bold text-purple-400 mb-1">{totalStats.totalItems}</div>
            <div className="text-sm text-gray-300">Ítems Obtenidos</div>
          </div>
          <div className="bg-secondary-700 rounded-lg p-4">
            <div className="text-xl font-bold text-blue-400 mb-1">{totalStats.totalDamage}</div>
            <div className="text-sm text-gray-300">Daño Total Infligido</div>
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Filtrar por Estado
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todos</option>
                <option value="completed">Completados</option>
                <option value="active">Activos</option>
                <option value="aborted">Abortados</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="date">Fecha</option>
                <option value="duration">Duración</option>
                <option value="performance">Rendimiento</option>
              </select>
            </div>
          </div>
          
          <div className="text-sm text-gray-300">
            Mostrando {sortedCombats.length} de {allCombats.length} combates
          </div>
        </div>
      </div>

      {/* Combat List */}
      <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
        {sortedCombats.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No hay combates que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedCombats.map((combat) => {
              const result = combatResults[combat.id];
              return (
                <div
                  key={combat.id}
                  className="bg-secondary-700 rounded-lg p-4 border border-secondary-600 hover:border-secondary-500 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-white">
                          Combate #{combat.id.slice(-6)}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(combat.status)}`}>
                          {getStatusText(combat.status)}
                        </span>
                        {result && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(result.performance)}`}>
                            Rendimiento: {result.performance}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Fecha:</span>
                          <span className="text-white ml-1">{formatDate(combat.createdAt)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Participantes:</span>
                          <span className="text-white ml-1">{combat.participants?.length || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Sistema:</span>
                          <span className="text-white ml-1">{combat.location?.systemId || 'Desconocido'}</span>
                        </div>
                        {result && (
                          <div>
                            <span className="text-gray-400">Duración:</span>
                            <span className="text-white ml-1">{result.duration}</span>
                          </div>
                        )}
                      </div>
                      
                      {result && (
                        <div className="mt-3 pt-3 border-t border-secondary-600">
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Resultado:</span>
                              <span className={`ml-1 font-medium ${
                                result.winner === 'user1' ? 'text-green-400' : 
                                result.winner ? 'text-red-400' : 'text-yellow-400'
                              }`}>
                                {result.winner === 'user1' ? 'Victoria' : 
                                 result.winner ? 'Derrota' : 'Abortado'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Experiencia:</span>
                              <span className="text-green-400 ml-1">+{result.experience}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Créditos:</span>
                              <span className="text-yellow-400 ml-1">+{result.credits}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Ítems:</span>
                              <span className="text-purple-400 ml-1">{result.items}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Daño:</span>
                              <span className="text-red-400 ml-1">{result.totalDamage}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CombatHistory;
