'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';

interface CombatLeaderboardProps {
  className?: string;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  level: number;
  totalCombats: number;
  victories: number;
  defeats: number;
  winRate: number;
  totalDamage: number;
  averageAccuracy: number;
  experience: number;
  credits: number;
  alliance?: string;
  status: 'online' | 'offline' | 'in_combat';
}

const CombatLeaderboard: React.FC<CombatLeaderboardProps> = ({ className = '' }) => {
  const { user } = useAuthStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all_time'>('weekly');
  const [selectedCategory, setSelectedCategory] = useState<'victories' | 'damage' | 'accuracy' | 'experience'>('victories');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock leaderboard data
  const mockLeaderboardData: { [key: string]: LeaderboardEntry[] } = {
    daily: [
      {
        rank: 1,
        userId: 'user1',
        username: 'AlphaCommander',
        level: 25,
        totalCombats: 15,
        victories: 12,
        defeats: 3,
        winRate: 80,
        totalDamage: 8500,
        averageAccuracy: 85,
        experience: 1200,
        credits: 2500,
        alliance: 'Elite Squadron',
        status: 'online',
      },
      {
        rank: 2,
        userId: 'user2',
        username: 'BetaPilot',
        level: 22,
        totalCombats: 12,
        victories: 9,
        defeats: 3,
        winRate: 75,
        totalDamage: 7200,
        averageAccuracy: 82,
        experience: 950,
        credits: 2000,
        alliance: 'Elite Squadron',
        status: 'in_combat',
      },
      {
        rank: 3,
        userId: 'user3',
        username: 'GammaStriker',
        level: 20,
        totalCombats: 10,
        victories: 7,
        defeats: 3,
        winRate: 70,
        totalDamage: 6800,
        averageAccuracy: 78,
        experience: 800,
        credits: 1800,
        status: 'online',
      },
      {
        rank: 4,
        userId: 'user4',
        username: 'DeltaHunter',
        level: 18,
        totalCombats: 8,
        victories: 5,
        defeats: 3,
        winRate: 62.5,
        totalDamage: 5500,
        averageAccuracy: 75,
        experience: 650,
        credits: 1500,
        alliance: 'Shadow Fleet',
        status: 'offline',
      },
      {
        rank: 5,
        userId: 'user5',
        username: 'EpsilonWarrior',
        level: 19,
        totalCombats: 9,
        victories: 5,
        defeats: 4,
        winRate: 55.6,
        totalDamage: 5200,
        averageAccuracy: 73,
        experience: 600,
        credits: 1400,
        status: 'online',
      },
    ],
    weekly: [
      {
        rank: 1,
        userId: 'user1',
        username: 'StarDestroyer',
        level: 28,
        totalCombats: 45,
        victories: 38,
        defeats: 7,
        winRate: 84.4,
        totalDamage: 25000,
        averageAccuracy: 88,
        experience: 4500,
        credits: 8000,
        alliance: 'Galactic Empire',
        status: 'online',
      },
      {
        rank: 2,
        userId: 'user2',
        username: 'NovaPilot',
        level: 26,
        totalCombats: 42,
        victories: 35,
        defeats: 7,
        winRate: 83.3,
        totalDamage: 23500,
        averageAccuracy: 86,
        experience: 4200,
        credits: 7500,
        alliance: 'Rebel Alliance',
        status: 'in_combat',
      },
      {
        rank: 3,
        userId: 'user3',
        username: 'CosmicRaider',
        level: 24,
        totalCombats: 38,
        victories: 30,
        defeats: 8,
        winRate: 78.9,
        totalDamage: 21000,
        averageAccuracy: 84,
        experience: 3800,
        credits: 6800,
        alliance: 'Pirate Guild',
        status: 'online',
      },
    ],
    monthly: [
      {
        rank: 1,
        userId: 'user1',
        username: 'GalaxyConqueror',
        level: 35,
        totalCombats: 120,
        victories: 95,
        defeats: 25,
        winRate: 79.2,
        totalDamage: 65000,
        averageAccuracy: 87,
        experience: 12000,
        credits: 20000,
        alliance: 'Imperial Fleet',
        status: 'online',
      },
      {
        rank: 2,
        userId: 'user2',
        username: 'VoidMaster',
        level: 33,
        totalCombats: 115,
        victories: 90,
        defeats: 25,
        winRate: 78.3,
        totalDamage: 62000,
        averageAccuracy: 85,
        experience: 11500,
        credits: 19000,
        alliance: 'Void Walkers',
        status: 'offline',
      },
    ],
    all_time: [
      {
        rank: 1,
        userId: 'legend1',
        username: 'LegendaryAce',
        level: 50,
        totalCombats: 500,
        victories: 420,
        defeats: 80,
        winRate: 84,
        totalDamage: 280000,
        averageAccuracy: 92,
        experience: 50000,
        credits: 85000,
        alliance: 'Hall of Fame',
        status: 'online',
      },
      {
        rank: 2,
        userId: 'legend2',
        username: 'MythicWarrior',
        level: 48,
        totalCombats: 480,
        victories: 395,
        defeats: 85,
        winRate: 82.3,
        totalDamage: 265000,
        averageAccuracy: 90,
        experience: 48000,
        credits: 82000,
        alliance: 'Hall of Fame',
        status: 'online',
      },
    ],
  };

  useEffect(() => {
    loadLeaderboard();
  }, [selectedPeriod, selectedCategory]);

  const loadLeaderboard = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      let data = mockLeaderboardData[selectedPeriod] || mockLeaderboardData.weekly;
      
      // Sort by selected category
      data = [...data].sort((a, b) => {
        switch (selectedCategory) {
          case 'victories':
            return b.victories - a.victories;
          case 'damage':
            return b.totalDamage - a.totalDamage;
          case 'accuracy':
            return b.averageAccuracy - a.averageAccuracy;
          case 'experience':
            return b.experience - a.experience;
          default:
            return b.victories - a.victories;
        }
      });
      
      // Update ranks
      data = data.map((entry, index) => ({ ...entry, rank: index + 1 }));
      
      setLeaderboard(data);
      setIsLoading(false);
    }, 500);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-400 bg-yellow-900/30';
      case 2:
        return 'text-gray-300 bg-gray-900/30';
      case 3:
        return 'text-orange-600 bg-orange-900/30';
      default:
        return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'in_combat':
        return 'bg-red-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'victories':
        return 'Victorias';
      case 'damage':
        return 'Daño Total';
      case 'accuracy':
        return 'Precisión';
      case 'experience':
        return 'Experiencia';
      default:
        return category;
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'daily':
        return 'Diario';
      case 'weekly':
        return 'Semanal';
      case 'monthly':
        return 'Mensual';
      case 'all_time':
        return 'Histórico';
      default:
        return period;
    }
  };

  const currentUserRank = leaderboard.find(entry => entry.userId === user?.id);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
        <h2 className="text-2xl font-bold text-white mb-2">Tabla de Clasificación</h2>
        <p className="text-gray-300">
          Los mejores pilotos de combate del universo
        </p>
      </div>

      {/* Filters */}
      <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Período
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
                <option value="all_time">Histórico</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Categoría
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="victories">Victorias</option>
                <option value="damage">Daño Total</option>
                <option value="accuracy">Precisión</option>
                <option value="experience">Experiencia</option>
              </select>
            </div>
          </div>
          
          <div className="text-sm text-gray-300">
            Clasificación por: <span className="text-white font-medium">{getCategoryLabel(selectedCategory)}</span>
          </div>
        </div>
      </div>

      {/* Current User Rank */}
      {currentUserRank && (
        <div className="bg-primary-900/20 rounded-lg p-6 border border-primary-600">
          <h3 className="text-lg font-bold text-white mb-4">Tu Posición</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${getRankColor(currentUserRank.rank)}`}>
                {getRankIcon(currentUserRank.rank)}
              </div>
              <div>
                <h4 className="text-white font-medium">{currentUserRank.username}</h4>
                <p className="text-sm text-gray-300">Nivel {currentUserRank.level}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {selectedCategory === 'victories' && currentUserRank.victories}
                {selectedCategory === 'damage' && currentUserRank.totalDamage.toLocaleString()}
                {selectedCategory === 'accuracy' && `${currentUserRank.averageAccuracy}%`}
                {selectedCategory === 'experience' && currentUserRank.experience.toLocaleString()}
              </div>
              <div className="text-sm text-gray-300">{getCategoryLabel(selectedCategory)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="text-gray-300 mt-2">Cargando clasificación...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-600">
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Rango</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Piloto</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Nivel</th>
                  <th className="text-center py-3 px-4 text-gray-300 font-medium">Combates</th>
                  <th className="text-center py-3 px-4 text-gray-300 font-medium">V/D</th>
                  <th className="text-center py-3 px-4 text-gray-300 font-medium">%Vict</th>
                  <th className="text-center py-3 px-4 text-gray-300 font-medium">Daño</th>
                  <th className="text-center py-3 px-4 text-gray-300 font-medium">Precisión</th>
                  <th className="text-center py-3 px-4 text-gray-300 font-medium">EXP</th>
                  <th className="text-center py-3 px-4 text-gray-300 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.userId}
                    className={`border-b border-secondary-700 hover:bg-secondary-700/50 transition-colors ${
                      entry.userId === user?.id ? 'bg-primary-900/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRankColor(entry.rank)}`}>
                        {getRankIcon(entry.rank)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {entry.username.charAt(0).toUpperCase()}
                          </div>
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-secondary-800 ${getStatusColor(entry.status)}`}></div>
                        </div>
                        <div>
                          <div className="text-white font-medium">{entry.username}</div>
                          {entry.alliance && (
                            <div className="text-xs text-gray-400">{entry.alliance}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white">{entry.level}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-white">{entry.totalCombats}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-white">
                        <span className="text-green-400">{entry.victories}</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span className="text-red-400">{entry.defeats}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-white">{entry.winRate.toFixed(1)}%</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-white">{entry.totalDamage.toLocaleString()}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-white">{entry.averageAccuracy}%</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-green-400">{entry.experience.toLocaleString()}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.status === 'online' ? 'bg-green-900/30 text-green-400' :
                        entry.status === 'in_combat' ? 'bg-red-900/30 text-red-400' :
                        'bg-gray-900/30 text-gray-400'
                      }`}>
                        {entry.status === 'online' ? 'En línea' :
                         entry.status === 'in_combat' ? 'En combate' : 'Desconectado'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistics Summary */}
      <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
        <h3 className="text-xl font-bold text-white mb-4">Estadísticas del Período</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-secondary-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {leaderboard.length}
            </div>
            <div className="text-sm text-gray-300">Pilotos Activos</div>
          </div>
          <div className="bg-secondary-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {leaderboard.reduce((sum, entry) => sum + entry.victories, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-300">Victorias Totales</div>
          </div>
          <div className="bg-secondary-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400 mb-1">
              {leaderboard.reduce((sum, entry) => sum + entry.totalDamage, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-300">Daño Total</div>
          </div>
          <div className="bg-secondary-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {(leaderboard.reduce((sum, entry) => sum + entry.experience, 0) / leaderboard.length).toFixed(0)}
            </div>
            <div className="text-sm text-gray-300">EXP Promedio</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombatLeaderboard;
