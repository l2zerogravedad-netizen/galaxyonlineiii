'use client';

import React from 'react';
import { CombatSession, CombatStatus } from '@/types';

interface CombatStatsProps {
  combatSession: CombatSession;
  className?: string;
}

const CombatStats: React.FC<CombatStatsProps> = ({ combatSession, className = '' }) => {
  // Mock combat statistics
  const combatStats = {
    totalDamage: 1250,
    damageReceived: 890,
    shieldsAbsorbed: 450,
    criticalHits: 8,
    missedAttacks: 3,
    specialAbilitiesUsed: 5,
    repairsPerformed: 2,
    escapeAttempts: 1,
    combatDuration: '00:12:45',
    experienceGained: 250,
    creditsEarned: 500,
    itemsDropped: 2,
  };

  const getStatusIcon = (status: CombatStatus) => {
    switch (status) {
      case 'waiting':
        return '⏳';
      case 'active':
        return '⚔️';
      case 'paused':
        return '⏸️';
      case 'completed':
        return '✅';
      case 'aborted':
        return '❌';
      default:
        return '❓';
    }
  };

  const getPerformanceRating = () => {
    const damageRatio = combatStats.totalDamage / Math.max(combatStats.damageReceived, 1);
    const accuracy = combatStats.criticalHits / Math.max(combatStats.criticalHits + combatStats.missedAttacks, 1);
    
    if (damageRatio > 1.5 && accuracy > 0.7) return { rating: 'S', color: 'text-purple-400', bg: 'bg-purple-900/30' };
    if (damageRatio > 1.2 && accuracy > 0.6) return { rating: 'A', color: 'text-green-400', bg: 'bg-green-900/30' };
    if (damageRatio > 1.0 && accuracy > 0.5) return { rating: 'B', color: 'text-blue-400', bg: 'bg-blue-900/30' };
    if (damageRatio > 0.8 && accuracy > 0.4) return { rating: 'C', color: 'text-yellow-400', bg: 'bg-yellow-900/30' };
    return { rating: 'D', color: 'text-red-400', bg: 'bg-red-900/30' };
  };

  const performance = getPerformanceRating();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Combat Overview */}
      <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Resumen del Combate</h3>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getStatusIcon(combatSession.status)}</span>
            <div className={`px-3 py-1 rounded-lg font-bold text-lg ${performance.bg} ${performance.color}`}>
              Rendimiento: {performance.rating}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-secondary-700 rounded-lg p-4">
            <div className="text-3xl font-bold text-white mb-1">{combatStats.totalDamage}</div>
            <div className="text-sm text-gray-300">Daño Total</div>
          </div>
          <div className="bg-secondary-700 rounded-lg p-4">
            <div className="text-3xl font-bold text-red-400 mb-1">{combatStats.damageReceived}</div>
            <div className="text-sm text-gray-300">Daño Recibido</div>
          </div>
          <div className="bg-secondary-700 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-400 mb-1">{combatStats.shieldsAbsorbed}</div>
            <div className="text-sm text-gray-300">Escudos Absorbidos</div>
          </div>
          <div className="bg-secondary-700 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-400 mb-1">{combatStats.experienceGained}</div>
            <div className="text-sm text-gray-300">Experiencia</div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
        <h3 className="text-xl font-bold text-white mb-4">Estadísticas Detalladas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Offensive Stats */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
              <span className="text-red-400 mr-2">⚔️</span>
              Estadísticas Ofensivas
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Golpes Críticos</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-secondary-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${(combatStats.criticalHits / (combatStats.criticalHits + combatStats.missedAttacks)) * 100}%` }}
                    />
                  </div>
                  <span className="text-white font-medium">{combatStats.criticalHits}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Ataques Fallidos</span>
                <span className="text-white font-medium">{combatStats.missedAttacks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Habilidades Especiales</span>
                <span className="text-white font-medium">{combatStats.specialAbilitiesUsed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Precisión</span>
                <span className="text-green-400 font-medium">
                  {Math.round((combatStats.criticalHits / Math.max(combatStats.criticalHits + combatStats.missedAttacks, 1)) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Defensive Stats */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
              <span className="text-blue-400 mr-2">🛡️</span>
              Estadísticas Defensivas
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Daño Mitigado</span>
                <span className="text-white font-medium">{combatStats.shieldsAbsorbed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Reparaciones</span>
                <span className="text-white font-medium">{combatStats.repairsPerformed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Intentos de Escape</span>
                <span className="text-white font-medium">{combatStats.escapeAttempts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Supervivencia</span>
                <span className="text-green-400 font-medium">
                  {Math.round(((combatStats.totalDamage - combatStats.damageReceived) / Math.max(combatStats.totalDamage, 1)) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards and Progress */}
      <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
        <h3 className="text-xl font-bold text-white mb-4">Recompensas y Progreso</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Experience Progress */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Experiencia Ganada</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Base</span>
                <span className="text-white font-medium">+200</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Bonificación de Rendimiento</span>
                <span className="text-green-400 font-medium">+{combatStats.experienceGained - 200}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total</span>
                <span className="text-green-400 font-bold text-lg">+{combatStats.experienceGained}</span>
              </div>
            </div>
          </div>

          {/* Credits Earned */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Créditos Ganados</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Por Victoria</span>
                <span className="text-white font-medium">+300</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Por Daño</span>
                <span className="text-white font-medium">+{combatStats.creditsEarned - 300}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total</span>
                <span className="text-yellow-400 font-bold text-lg">+{combatStats.creditsEarned}</span>
              </div>
            </div>
          </div>

          {/* Items Dropped */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Ítems Obtenidos</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Materiales</span>
                <span className="text-white font-medium">{combatStats.itemsDropped}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Equipamiento</span>
                <span className="text-white font-medium">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Rareza</span>
                <span className="text-purple-400 font-medium">Común</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Combat Timeline */}
      <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
        <h3 className="text-xl font-bold text-white mb-4">Línea de Tiempo del Combate</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 text-sm text-gray-400">00:00</div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-white">Inicio del combate</p>
              <p className="text-sm text-gray-400">Sesión {combatSession.id.slice(-8)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 text-sm text-gray-400">00:05</div>
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-white">Primer impacto crítico</p>
              <p className="text-sm text-gray-400">+50 daño adicional</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 text-sm text-gray-400">00:08</div>
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-white">Escudos activados</p>
              <p className="text-sm text-gray-400">Absorbieron 150 de daño</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 text-sm text-gray-400">00:12</div>
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-white">Habilidad especial utilizada</p>
              <p className="text-sm text-gray-400">Láser de plasma mejorado</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 text-sm text-gray-400">{combatStats.combatDuration}</div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-white">Victoria obtenida</p>
              <p className="text-sm text-gray-400">Combate completado</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombatStats;
