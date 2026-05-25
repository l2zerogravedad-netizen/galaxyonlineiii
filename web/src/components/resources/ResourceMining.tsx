'use client';

import React, { useState, useEffect } from 'react';
import { useResourceStore, useAuthStore, useInventoryStore } from '@/store';
import { ResourceType, Ship } from '@/types';
import toast from 'react-hot-toast';

interface ResourceMiningProps {
  className?: string;
}

interface MiningLocation {
  id: string;
  name: string;
  type: 'asteroid' | 'planet' | 'nebula' | 'station';
  coordinates: { x: number; y: number; z: number };
  resources: {
    type: ResourceType;
    abundance: number;
    difficulty: number;
    yield: number;
  }[];
  danger: number;
  requirements: {
    shipLevel: number;
    equipment: string[];
  };
  rewards: {
    baseYield: number;
    bonusMultiplier: number;
    experience: number;
  };
}

const ResourceMining: React.FC<ResourceMiningProps> = ({ className = '' }) => {
  const { user } = useAuthStore();
  const { items: inventoryItems } = useInventoryStore();
  const { resources, fetchResources, updateResource } = useResourceStore();
  const [selectedLocation, setSelectedLocation] = useState<MiningLocation | null>(null);
  const [selectedShip, setSelectedShip] = useState<string>('');
  const [isMining, setIsMining] = useState(false);
  const [miningProgress, setMiningProgress] = useState(0);
  const [miningResults, setMiningResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  // Mock mining locations
  const miningLocations: MiningLocation[] = [
    {
      id: 'asteroid_belt_1',
      name: 'Cinturón de Asteroides Alpha',
      type: 'asteroid',
      coordinates: { x: 100, y: 50, z: 25 },
      resources: [
        { type: 'metal', abundance: 80, difficulty: 2, yield: 150 },
        { type: 'crystals', abundance: 40, difficulty: 4, yield: 80 },
        { type: 'exotics', abundance: 15, difficulty: 6, yield: 30 },
      ],
      danger: 3,
      requirements: {
        shipLevel: 1,
        equipment: ['mining_laser_mk1'],
      },
      rewards: {
        baseYield: 100,
        bonusMultiplier: 1.2,
        experience: 50,
      },
    },
    {
      id: 'nebula_quantum',
      name: 'Nebulosa Quantum',
      type: 'nebula',
      coordinates: { x: -200, y: 100, z: -50 },
      resources: [
        { type: 'quantum', abundance: 70, difficulty: 5, yield: 120 },
        { type: 'energy', abundance: 90, difficulty: 3, yield: 200 },
        { type: 'plasma', abundance: 60, difficulty: 4, yield: 100 },
      ],
      danger: 5,
      requirements: {
        shipLevel: 5,
        equipment: ['quantum_collector', 'shield_generator_mk2'],
      },
      rewards: {
        baseYield: 150,
        bonusMultiplier: 1.5,
        experience: 100,
      },
    },
    {
      id: 'dark_matter_zone',
      name: 'Zona de Materia Oscura',
      type: 'station',
      coordinates: { x: 0, y: -150, z: 75 },
      resources: [
        { type: 'dark_matter', abundance: 50, difficulty: 8, yield: 60 },
        { type: 'exotics', abundance: 35, difficulty: 7, yield: 50 },
        { type: 'quantum', abundance: 45, difficulty: 6, yield: 80 },
      ],
      danger: 8,
      requirements: {
        shipLevel: 10,
        equipment: ['dark_matter_extractor', 'advanced_shields'],
      },
      rewards: {
        baseYield: 200,
        bonusMultiplier: 2.0,
        experience: 200,
      },
    },
    {
      id: 'crystal_caves',
      name: 'Cavernas de Cristal',
      type: 'planet',
      coordinates: { x: 150, y: -75, z: 100 },
      resources: [
        { type: 'crystals', abundance: 85, difficulty: 3, yield: 180 },
        { type: 'energy', abundance: 65, difficulty: 2, yield: 120 },
        { type: 'metal', abundance: 55, difficulty: 2, yield: 100 },
      ],
      danger: 2,
      requirements: {
        shipLevel: 3,
        equipment: ['crystal_drill'],
      },
      rewards: {
        baseYield: 120,
        bonusMultiplier: 1.3,
        experience: 75,
      },
    },
  ];

  // Mock player ships
  const playerShips: Ship[] = [
    {
      id: 'ship1',
      userId: user?.id || '',
      name: 'Minerador Estelar MK1',
      type: 'miner',
      class: 'light',
      level: 2,
      experience: 300,
      health: {
        current: 100,
        max: 100,
        shield: 30,
        maxShield: 50,
        regeneration: 1,
        shieldRegeneration: 2,
      },
      stats: {
        attackPower: 10,
        defense: 20,
        speed: 15,
        maneuverability: 10,
        cargoCapacity: 50,
        sensorRange: 20,
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
        systemId: 'mining',
        rotation: { x: 0, y: 0, z: 0, w: 1 },
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ship2',
      userId: user?.id || '',
      name: 'Minerador Pesado MK2',
      type: 'miner',
      class: 'heavy',
      level: 6,
      experience: 1200,
      health: {
        current: 200,
        max: 200,
        shield: 100,
        maxShield: 100,
        regeneration: 2,
        shieldRegeneration: 3,
      },
      stats: {
        attackPower: 15,
        defense: 35,
        speed: 10,
        maneuverability: 5,
        cargoCapacity: 150,
        sensorRange: 25,
        stealth: 2,
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
        systemId: 'mining',
        rotation: { x: 0, y: 0, z: 0, w: 1 },
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const startMining = () => {
    if (!selectedLocation || !selectedShip) {
      toast.error('Por favor selecciona una ubicación y una nave');
      return;
    }

    const ship = playerShips.find(s => s.id === selectedShip);
    if (!ship) return;

    // Check requirements
    if (ship.level < selectedLocation.requirements.shipLevel) {
      toast.error(`Necesitas una nave de nivel ${selectedLocation.requirements.shipLevel} o superior`);
      return;
    }

    setIsMining(true);
    setMiningProgress(0);
    setShowResults(false);

    // Simulate mining progress
    const interval = setInterval(() => {
      setMiningProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          completeMining();
          return 100;
        }
        return prev + 10;
      });
    }, 800);
  };

  const completeMining = () => {
    if (!selectedLocation || !selectedShip) return;

    const ship = playerShips.find(s => s.id === selectedShip);
    if (!ship) return;

    // Calculate mining results
    const results = {
      location: selectedLocation,
      ship: ship,
      resources: selectedLocation.resources.map(resource => {
        const baseYield = resource.yield * (resource.abundance / 100);
        const shipBonus = ship.stats.cargoCapacity / 100;
        const randomFactor = 0.8 + Math.random() * 0.4; // 80-120% random factor
        const totalYield = Math.floor(baseYield * shipBonus * randomFactor * selectedLocation.rewards.bonusMultiplier);
        
        return {
          type: resource.type,
          amount: totalYield,
          quality: Math.floor(Math.random() * 3) + 1, // 1-3 quality
        };
      }),
      experience: selectedLocation.rewards.experience,
      timeElapsed: Math.floor(Math.random() * 300) + 120, // 2-7 minutes
      efficiency: Math.floor(Math.random() * 30) + 70, // 70-100% efficiency
      damageTaken: Math.floor(Math.random() * selectedLocation.danger * 10),
    };

    setMiningResults(results);
    setIsMining(false);
    setShowResults(true);
    
    // Update resources
    results.resources.forEach(resource => {
      const currentResource = resources.find(r => r.type === resource.type);
      if (currentResource) {
        updateResource(currentResource.id, {
          amount: Math.min(currentResource.amount + resource.amount, currentResource.maxAmount),
        });
      }
    });

    toast.success(`Minería completada! +${results.experience} EXP`);
  };

  const resetMining = () => {
    setSelectedLocation(null);
    setSelectedShip('');
    setIsMining(false);
    setMiningProgress(0);
    setShowResults(false);
    setMiningResults(null);
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'asteroid':
        return '☄️';
      case 'planet':
        return '🪐';
      case 'nebula':
        return '🌌';
      case 'station':
        return '🛸';
      default:
        return '📍';
    }
  };

  const getLocationTypeText = (type: string) => {
    switch (type) {
      case 'asteroid':
        return 'Asteroide';
      case 'planet':
        return 'Planeta';
      case 'nebula':
        return 'Nebulosa';
      case 'station':
        return 'Estación';
      default:
        return type;
    }
  };

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'metal':
        return '🔧';
      case 'crystals':
        return '💎';
      case 'exotics':
        return '🌟';
      case 'quantum':
        return '🌀';
      case 'energy':
        return '🔋';
      case 'plasma':
        return '⚡';
      case 'dark_matter':
        return '⚫';
      default:
        return '📦';
    }
  };

  const getDangerColor = (danger: number) => {
    if (danger <= 2) return 'text-green-400 bg-green-900/30';
    if (danger <= 5) return 'text-yellow-400 bg-yellow-900/30';
    if (danger <= 7) return 'text-orange-400 bg-orange-900/30';
    return 'text-red-400 bg-red-900/30';
  };

  const getDifficultyText = (difficulty: number) => {
    if (difficulty <= 2) return 'Fácil';
    if (difficulty <= 4) return 'Medio';
    if (difficulty <= 6) return 'Difícil';
    return 'Extremo';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
        <h2 className="text-2xl font-bold text-white mb-2">Centro de Minería</h2>
        <p className="text-gray-300">
          Explora y extrae recursos valiosos del espacio
        </p>
      </div>

      {/* Mining Setup */}
      {!isMining && !showResults && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Location Selection */}
          <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
            <h3 className="text-xl font-bold text-white mb-4">Seleccionar Ubicación</h3>
            
            <div className="space-y-3">
              {miningLocations.map((location) => (
                <div
                  key={location.id}
                  onClick={() => setSelectedLocation(location)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedLocation?.id === location.id
                      ? 'bg-primary-600/20 border-primary-500'
                      : 'bg-secondary-700 border-secondary-600 hover:border-secondary-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getLocationIcon(location.type)}</span>
                      <div>
                        <h4 className="text-white font-medium">{location.name}</h4>
                        <p className="text-sm text-gray-300">
                          {getLocationTypeText(location.type)} • Nivel {location.requirements.shipLevel}+
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDangerColor(location.danger)}`}>
                      Peligro {location.danger}/10
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {location.resources.slice(0, 3).map((resource, index) => (
                      <div key={index} className="flex items-center space-x-1 text-xs">
                        <span>{getResourceIcon(resource.type)}</span>
                        <span className="text-gray-300">{resource.abundance}%</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-gray-400">
                      Rendimiento base: {location.rewards.baseYield}
                    </span>
                    <span className="text-green-400">
                      +{location.rewards.experience} EXP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ship Selection */}
          <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
            <h3 className="text-xl font-bold text-white mb-4">Seleccionar Nave</h3>
            
            <div className="space-y-3">
              {playerShips.map((ship) => (
                <div
                  key={ship.id}
                  onClick={() => setSelectedShip(ship.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedShip === ship.id
                      ? 'bg-primary-600/20 border-primary-500'
                      : 'bg-secondary-700 border-secondary-600 hover:border-secondary-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{ship.name}</h4>
                      <p className="text-sm text-gray-300">
                        Nivel {ship.level} • {ship.class} • Capacidad: {ship.stats.cargoCapacity}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-300">Salud</div>
                      <div className="text-white font-medium">
                        {ship.health.current}/{ship.health.max}
                      </div>
                    </div>
                  </div>
                  
                  {selectedLocation && ship.level < selectedLocation.requirements.shipLevel && (
                    <div className="mt-2 text-xs text-red-400">
                      ⚠️ Nivel insuficiente (requiere {selectedLocation.requirements.shipLevel}+)
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Start Mining Button */}
            <div className="mt-6">
              <button
                onClick={startMining}
                disabled={!selectedLocation || !selectedShip}
                className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Comenzar Minería
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mining Progress */}
      {isMining && (
        <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
          <h3 className="text-xl font-bold text-white mb-4">Minería en Progreso</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Progreso</span>
                <span className="text-white font-medium">{miningProgress}%</span>
              </div>
              <div className="w-full bg-secondary-700 rounded-full h-3">
                <div
                  className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${miningProgress}%` }}
                />
              </div>
            </div>
            
            <div className="text-center py-4">
              <div className="text-6xl mb-4">⛏️</div>
              <p className="text-white font-medium">Extrayendo recursos...</p>
              <p className="text-sm text-gray-300">
                {selectedLocation?.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mining Results */}
      {showResults && miningResults && (
        <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
          <h3 className="text-xl font-bold text-white mb-4">Resultados de la Minería</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Resources Obtained */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Recursos Obtenidos</h4>
              <div className="space-y-2">
                {miningResults.resources.map((resource: any, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-secondary-700 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getResourceIcon(resource.type)}</span>
                      <div>
                        <div className="text-white font-medium">
                          {resource.amount.toLocaleString()} unidades
                        </div>
                        <div className="text-xs text-gray-300">
                          Calidad: {'⭐'.repeat(resource.quality)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mining Stats */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Estadísticas</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Tiempo transcurrido:</span>
                  <span className="text-white font-medium">
                    {Math.floor(miningResults.timeElapsed / 60)}:{(miningResults.timeElapsed % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Eficiencia:</span>
                  <span className="text-green-400 font-medium">{miningResults.efficiency}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Daño recibido:</span>
                  <span className="text-red-400 font-medium">{miningResults.damageTaken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Experiencia:</span>
                  <span className="text-green-400 font-medium">+{miningResults.experience}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={resetMining}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Nueva Minería
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

      {/* Mining Tips */}
      <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
        <h3 className="text-xl font-bold text-white mb-4">Consejos de Minería</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-secondary-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-2 flex items-center">
              <span className="text-blue-400 mr-2">💡</span>
              Para Principiantes
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Comienza con asteroides de bajo peligro</li>
              <li>• Usa naves con mayor capacidad de carga</li>
              <li>• Mejora tu equipo de minería</li>
              <li>• Vigila tu salud durante la minería</li>
            </ul>
          </div>
          
          <div className="bg-secondary-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-2 flex items-center">
              <span className="text-purple-400 mr-2">⚡</span>
              Técnicas Avanzadas
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Explora zonas de mayor abundancia</li>
              <li>• Optimiza tu tiempo de minería</li>
              <li>• Arriesga en zonas de alto peligro</li>
              <li>• Compite por los mejores recursos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceMining;
