'use client';

import React, { useState, useEffect } from 'react';
import { CombatSession, CombatTurn, Ship } from '@/types';

interface CombatArenaProps {
  combatSession: CombatSession;
  onActionSelect: (action: string, target?: string) => void;
  currentTurn?: string;
}

const CombatArena: React.FC<CombatArenaProps> = ({
  combatSession,
  onActionSelect,
  currentTurn
}) => {
  const [selectedShip, setSelectedShip] = useState<string>('');
  const [hoveredShip, setHoveredShip] = useState<string>('');
  const [animationState, setAnimationState] = useState<string>('');

  // Mock ships data for visualization
  const mockShips: { [key: string]: Ship } = {
    'ship1': {
      id: 'ship1',
      userId: 'user1',
      name: 'Nave Alpha',
      type: 'fighter',
      class: 'light',
      level: 5,
      experience: 2500,
      health: {
        current: 85,
        max: 100,
        shield: 30,
        maxShield: 50,
        regeneration: 1,
        shieldRegeneration: 2,
      },
      stats: {
        attackPower: 25,
        defense: 15,
        speed: 30,
        maneuverability: 20,
        cargoCapacity: 10,
        sensorRange: 15,
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
        crew: 3,
        maxCrew: 5,
        morale: 80,
      },
      position: {
        x: -200,
        y: 0,
        z: 0,
        systemId: 'system1',
        rotation: { x: 0, y: 0, z: 0, w: 1 },
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    'ship2': {
      id: 'ship2',
      userId: 'user2',
      name: 'Nave Beta',
      type: 'fighter',
      class: 'light',
      level: 4,
      experience: 1800,
      health: {
        current: 60,
        max: 100,
        shield: 10,
        maxShield: 50,
        regeneration: 1,
        shieldRegeneration: 2,
      },
      stats: {
        attackPower: 20,
        defense: 18,
        speed: 25,
        maneuverability: 22,
        cargoCapacity: 12,
        sensorRange: 14,
        stealth: 8,
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
        morale: 75,
      },
      position: {
        x: 200,
        y: 0,
        z: 0,
        systemId: 'system1',
        rotation: { x: 0, y: Math.PI, z: 0, w: 1 },
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };

  const handleShipClick = (shipId: string) => {
    if (currentTurn === 'player') {
      setSelectedShip(shipId);
      onActionSelect('attack', shipId);
      setAnimationState('attack');
      setTimeout(() => setAnimationState(''), 500);
    }
  };

  const getHealthBarColor = (percentage: number) => {
    if (percentage > 70) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getShieldBarColor = (percentage: number) => {
    if (percentage > 50) return 'bg-blue-500';
    if (percentage > 25) return 'bg-blue-400';
    return 'bg-blue-300';
  };

  const renderShip = (ship: Ship, isPlayer: boolean) => {
    const healthPercentage = (ship.health.current / ship.health.max) * 100;
    const shieldPercentage = (ship.health.shield / ship.health.maxShield) * 100;
    const isSelected = selectedShip === ship.id;
    const isHovered = hoveredShip === ship.id;

    return (
      <div
        key={ship.id}
        className={`absolute cursor-pointer transition-all duration-300 ${
          isSelected ? 'scale-110' : isHovered ? 'scale-105' : 'scale-100'
        } ${animationState === 'attack' && isSelected ? 'animate-pulse' : ''}`}
        style={{
          left: `${ship.position.x + 400}px`,
          top: `${ship.position.y + 200}px`,
          transform: `translate(-50%, -50%) ${isPlayer ? 'scaleX(1)' : 'scaleX(-1)'}`,
        }}
        onClick={() => handleShipClick(ship.id)}
        onMouseEnter={() => setHoveredShip(ship.id)}
        onMouseLeave={() => setHoveredShip('')}
      >
        {/* Ship Icon */}
        <div className={`relative ${isPlayer ? 'text-blue-400' : 'text-red-400'}`}>
          <svg
            width="60"
            height="60"
            viewBox="0 0 60 60"
            className={`${isSelected ? 'drop-shadow-lg' : 'drop-shadow-md'}`}
          >
            <path
              d="M30 5 L45 25 L35 25 L35 45 L25 45 L25 25 L15 25 Z"
              fill="currentColor"
              className={animationState === 'attack' && isSelected ? 'animate-pulse' : ''}
            />
          </svg>
          
          {/* Ship Name */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <p className="text-xs text-white font-medium">{ship.name}</p>
          </div>
        </div>

        {/* Health Bar */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-12">
          <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getHealthBarColor(healthPercentage)}`}
              style={{ width: `${healthPercentage}%` }}
            />
          </div>
        </div>

        {/* Shield Bar */}
        {ship.health.shield > 0 && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-12">
            <div className="bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getShieldBarColor(shieldPercentage)}`}
                style={{ width: `${shieldPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Hover Info */}
        {isHovered && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 border border-gray-600 rounded-lg p-3 whitespace-nowrap z-10">
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Salud:</span>
                <span className="text-white">{ship.health.current}/{ship.health.max}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Escudo:</span>
                <span className="text-white">{ship.health.shield}/{ship.health.maxShield}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ataque:</span>
                <span className="text-white">{ship.stats.attackPower}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Defensa:</span>
                <span className="text-white">{ship.stats.defense}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCombatEffects = () => {
    if (animationState === 'attack') {
      return (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-32 h-32 bg-orange-500 rounded-full animate-ping opacity-75" />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-secondary-900 rounded-lg border border-secondary-600 overflow-hidden">
      {/* Combat Header */}
      <div className="bg-secondary-800 px-4 py-3 border-b border-secondary-600">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Arena de Combate</h3>
            <p className="text-sm text-gray-300">
              Turno actual: {currentTurn === 'player' ? 'Tu turno' : 'Turno del oponente'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-400">Ronda:</span>
              <span className="text-white ml-1 font-medium">1</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Tiempo:</span>
              <span className="text-white ml-1 font-medium">30s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Combat Arena */}
      <div className="relative h-96 bg-gradient-to-b from-purple-900/20 to-blue-900/20">
        {/* Stars Background */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 3 + 's',
              }}
            />
          ))}
        </div>

        {/* Grid Lines */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Ships */}
        {Object.values(mockShips).map((ship) => renderShip(ship, ship.userId === 'user1'))}

        {/* Combat Effects */}
        {renderCombatEffects()}
      </div>

      {/* Combat Log */}
      <div className="bg-secondary-800 px-4 py-3 border-t border-secondary-600">
        <div className="max-h-24 overflow-y-auto">
          <div className="space-y-1 text-xs">
            <div className="text-gray-300">
              <span className="text-blue-400 font-medium">Nave Alpha</span> ataca a 
              <span className="text-red-400 font-medium"> Nave Beta</span> - 25 de daño
            </div>
            <div className="text-gray-300">
              <span className="text-red-400 font-medium">Nave Beta</span> activa escudos
            </div>
            <div className="text-gray-300">
              <span className="text-blue-400 font-medium">Nave Alpha</span> usa habilidad especial
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-secondary-800 px-4 py-3 border-t border-secondary-600">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => onActionSelect('attack')}
              className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              ⚔️ Atacar
            </button>
            <button
              onClick={() => onActionSelect('defend')}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              🛡️ Defender
            </button>
            <button
              onClick={() => onActionSelect('special')}
              className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              ✨ Especial
            </button>
            <button
              onClick={() => onActionSelect('repair')}
              className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              🔧 Reparar
            </button>
          </div>
          <button
            onClick={() => onActionSelect('escape')}
            className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            🏃 Escapar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CombatArena;
