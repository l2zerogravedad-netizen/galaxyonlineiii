'use client';

import React, { useState, useEffect } from 'react';
import { Ship, CombatSession } from '@/types';
import { useInventoryStore, useAuthStore } from '@/store';
import toast from 'react-hot-toast';

interface CombatTrainingProps {
  className?: string;
}

const CombatTraining: React.FC<CombatTrainingProps> = ({ className = '' }) => {
  const { user } = useAuthStore();
  const { items: inventoryItems } = useInventoryStore();
  const [selectedShip, setSelectedShip] = useState<string>('');
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [trainingResults, setTrainingResults] = useState<any>(null);

  // Mock training scenarios
  const trainingScenarios = [
    {
      id: 'basic_combat',
      name: 'Combate Básico',
      description: 'Aprende los fundamentos del combate espacial',
      difficulty: 'easy',
      duration: '5-10 min',
      objectives: ['Realizar 10 ataques', 'Activar escudos 3 veces', 'Usar 1 habilidad especial'],
      rewards: { experience: 50, credits: 100 },
    },
    {
      id: 'advanced_tactics',
      name: 'Tácticas Avanzadas',
      description: 'Domina técnicas de combate avanzadas',
      difficulty: 'medium',
      duration: '10-15 min',
      objectives: ['Lograr 5 golpes críticos', 'Esquivar 3 ataques', 'Completar sin recibir daño crítico'],
      rewards: { experience: 100, credits: 200 },
    },
    {
      id: 'survival_mode',
      name: 'Modo Supervivencia',
      description: 'Sobrevive a oleadas de enemigos',
      difficulty: 'hard',
      duration: '15-20 min',
      objectives: ['Sobrevivir 5 oleadas', 'Mantener salud por encima del 50%', 'Derrotar al jefe final'],
      rewards: { experience: 200, credits: 500 },
    },
    {
      id: 'target_practice',
      name: 'Práctica de Tiro',
      description: 'Mejora tu precisión y tiempo de reacción',
      difficulty: 'easy',
      duration: '5 min',
      objectives: ['Alcanzar 80% de precisión', 'Completar en menos de 3 minutos', 'Lograr 10 impactos consecutivos'],
      rewards: { experience: 75, credits: 150 },
    },
    {
      id: 'defensive_maneuvers',
      name: 'Maniobras Defensivas',
      description: 'Aprende a defenderte eficazmente',
      difficulty: 'medium',
      duration: '8-12 min',
      objectives: ['Bloquear 15 ataques', 'Usar reparaciones 2 veces', 'Mantener escudos activos 60% del tiempo'],
      rewards: { experience: 125, credits: 250 },
    },
  ];

  // Mock player ships
  const playerShips: Ship[] = [
    {
      id: 'ship1',
      userId: user?.id || '',
      name: 'Nave de Entrenamiento MK1',
      type: 'fighter',
      class: 'light',
      level: 1,
      experience: 0,
      health: {
        current: 100,
        max: 100,
        shield: 50,
        maxShield: 50,
        regeneration: 1,
        shieldRegeneration: 2,
      },
      stats: {
        attackPower: 15,
        defense: 10,
        speed: 25,
        maneuverability: 20,
        cargoCapacity: 5,
        sensorRange: 10,
        stealth: 5,
      },
      equipment: {
        weapons: [],
        armor: [],
        modules: [],
      },
      crew: {
        commander: undefined,
        officers: [],
        crew: 2,
        maxCrew: 3,
        morale: 80,
      },
      position: {
        x: 0,
        y: 0,
        z: 0,
        systemId: 'training',
        rotation: { x: 0, y: 0, z: 0, w: 1 },
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ship2',
      userId: user?.id || '',
      name: 'Nave de Entrenamiento MK2',
      type: 'fighter',
      class: 'medium',
      level: 3,
      experience: 500,
      health: {
        current: 150,
        max: 150,
        shield: 75,
        maxShield: 75,
        regeneration: 2,
        shieldRegeneration: 3,
      },
      stats: {
        attackPower: 25,
        defense: 20,
        speed: 20,
        maneuverability: 15,
        cargoCapacity: 10,
        sensorRange: 15,
        stealth: 3,
      },
      equipment: {
        weapons: [],
        armor: [],
        modules: [],
      },
      crew: {
        commander: undefined,
        officers: [],
        crew: 4,
        maxCrew: 6,
        morale: 85,
      },
      position: {
        x: 0,
        y: 0,
        z: 0,
        systemId: 'training',
        rotation: { x: 0, y: 0, z: 0, w: 1 },
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const startTraining = () => {
    if (!selectedShip || !selectedScenario) {
      toast.error('Por favor selecciona una nave y un escenario');
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);
    setShowResults(false);

    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          completeTraining();
          return 100;
        }
        return prev + 10;
      });
    }, 1000);
  };

  const completeTraining = () => {
    const scenario = trainingScenarios.find(s => s.id === selectedScenario);
    const ship = playerShips.find(s => s.id === selectedShip);
    
    const results = {
      scenario: scenario,
      ship: ship,
      completed: true,
      score: Math.floor(Math.random() * 50) + 50, // 50-100 score
      objectivesCompleted: Math.floor(Math.random() * 3) + 1, // 1-3 objectives
      timeElapsed: Math.floor(Math.random() * 300) + 120, // 2-7 minutes
      accuracy: Math.floor(Math.random() * 30) + 70, // 70-100% accuracy
      damageDealt: Math.floor(Math.random() * 500) + 200,
      damageReceived: Math.floor(Math.random() * 200) + 50,
      experience: scenario?.rewards.experience || 0,
      credits: scenario?.rewards.credits || 0,
    };

    setTrainingResults(results);
    setIsTraining(false);
    setShowResults(true);
    
    toast.success(`Entrenamiento completado! +${results.experience} EXP, +${results.credits} créditos`);
  };

  const resetTraining = () => {
    setSelectedShip('');
    setSelectedScenario('');
    setDifficulty('medium');
    setIsTraining(false);
    setTrainingProgress(0);
    setShowResults(false);
    setTrainingResults(null);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'text-green-400 bg-green-900/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/30';
      case 'hard': return 'text-red-400 bg-red-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getDifficultyText = (diff: string) => {
    switch (diff) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Medio';
      case 'hard': return 'Difícil';
      default: return diff;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-purple-400';
    if (score >= 80) return 'text-green-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'S';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
        <h2 className="text-2xl font-bold text-white mb-2">Centro de Entrenamiento</h2>
        <p className="text-gray-300">
          Mejora tus habilidades de combate en escenarios controlados
        </p>
      </div>

      {/* Training Setup */}
      {!isTraining && !showResults && (
        <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
          <h3 className="text-xl font-bold text-white mb-4">Configurar Entrenamiento</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ship Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Seleccionar Nave
              </label>
              <div className="space-y-2">
                {playerShips.map((ship) => (
                  <div
                    key={ship.id}
                    onClick={() => setSelectedShip(ship.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedShip === ship.id
                        ? 'bg-primary-600/20 border-primary-500'
                        : 'bg-secondary-700 border-secondary-600 hover:border-secondary-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">{ship.name}</h4>
                        <p className="text-sm text-gray-300">
                          Nivel {ship.level} • {ship.class} • {ship.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-300">Ataque</div>
                        <div className="text-white font-medium">{ship.stats.attackPower}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scenario Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Seleccionar Escenario
              </label>
              <div className="space-y-2">
                {trainingScenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    onClick={() => setSelectedScenario(scenario.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedScenario === scenario.id
                        ? 'bg-primary-600/20 border-primary-500'
                        : 'bg-secondary-700 border-secondary-600 hover:border-secondary-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{scenario.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(scenario.difficulty)}`}>
                        {getDifficultyText(scenario.difficulty)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{scenario.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Duración: {scenario.duration}</span>
                      <span className="text-green-400">
                        +{scenario.rewards.experience} EXP • +{scenario.rewards.credits} créditos
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={startTraining}
              disabled={!selectedShip || !selectedScenario}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Comenzar Entrenamiento
            </button>
          </div>
        </div>
      )}

      {/* Training Progress */}
      {isTraining && (
        <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
          <h3 className="text-xl font-bold text-white mb-4">Entrenamiento en Progreso</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Progreso</span>
                <span className="text-white font-medium">{trainingProgress}%</span>
              </div>
              <div className="w-full bg-secondary-700 rounded-full h-3">
                <div
                  className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${trainingProgress}%` }}
                />
              </div>
            </div>
            
            <div className="text-center py-4">
              <div className="text-6xl mb-4">🚀</div>
              <p className="text-white font-medium">Entrenando...</p>
              <p className="text-sm text-gray-300">
                {trainingScenarios.find(s => s.id === selectedScenario)?.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Training Results */}
      {showResults && trainingResults && (
        <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
          <h3 className="text-xl font-bold text-white mb-4">Resultados del Entrenamiento</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Score */}
            <div className="text-center">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(trainingResults.score)}`}>
                {getScoreGrade(trainingResults.score)}
              </div>
              <div className="text-2xl text-white font-medium mb-1">
                {trainingResults.score}/100
              </div>
              <div className="text-sm text-gray-300">Puntuación Final</div>
            </div>

            {/* Rewards */}
            <div className="text-center">
              <div className="text-4xl mb-2">🎁</div>
              <div className="space-y-1">
                <div className="text-green-400 font-medium">+{trainingResults.experience} EXP</div>
                <div className="text-yellow-400 font-medium">+{trainingResults.credits} créditos</div>
              </div>
              <div className="text-sm text-gray-300">Recompensas</div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-secondary-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {trainingResults.objectivesCompleted}/3
              </div>
              <div className="text-sm text-gray-300">Objetivos Completados</div>
            </div>
            <div className="bg-secondary-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {Math.floor(trainingResults.timeElapsed / 60)}:{(trainingResults.timeElapsed % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-300">Tiempo</div>
            </div>
            <div className="bg-secondary-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {trainingResults.accuracy}%
              </div>
              <div className="text-sm text-gray-300">Precisión</div>
            </div>
            <div className="bg-secondary-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {trainingResults.damageDealt}
              </div>
              <div className="text-sm text-gray-300">Daño Infligido</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={resetTraining}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Nuevo Entrenamiento
            </button>
            <button
              onClick={() => setShowResults(false)}
              className="px-6 py-2 bg-secondary-600 text-white rounded-lg font-medium hover:bg-secondary-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Training Tips */}
      <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
        <h3 className="text-xl font-bold text-white mb-4">Consejos de Entrenamiento</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-secondary-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-2 flex items-center">
              <span className="text-blue-400 mr-2">💡</span>
              Para Principiantes
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Comienza con escenarios fáciles para aprender los controles</li>
              <li>• Practica el tiempo de reacción y la precisión</li>
              <li>• Aprende a cuándo activar escudos</li>
              <li>• Familiarízate con las diferentes habilidades</li>
            </ul>
          </div>
          
          <div className="bg-secondary-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-2 flex items-center">
              <span className="text-purple-400 mr-2">⚡</span>
              Tácticas Avanzadas
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Combina ataques para maximizar daño</li>
              <li>• Usa el entorno a tu ventaja</li>
              <li>• Gestiona tu energía y recursos</li>
              <li>• Aprende patrones de movimiento enemigos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombatTraining;
