'use client';

import React, { useState, useEffect } from 'react';
import { useCombatStore, useAuthStore, useInventoryStore } from '@/store';
import { CombatSession, CombatStatus, Ship } from '@/types';
import toast from 'react-hot-toast';

interface CombatManagerProps {
  className?: string;
}

const CombatManager: React.FC<CombatManagerProps> = ({ className = '' }) => {
  const { user } = useAuthStore();
  const { items: inventoryItems } = useInventoryStore();
  const {
    combatSessions,
    activeCombat,
    isLoading,
    fetchCombatSessions,
    createCombatSession,
    joinCombatSession,
    leaveCombatSession,
    performCombatAction,
    setActiveCombat,
  } = useCombatStore();

  const [selectedOpponent, setSelectedOpponent] = useState<string>('');
  const [selectedShip, setSelectedShip] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionTarget, setActionTarget] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchCombatSessions();
    }
  }, [user, fetchCombatSessions]);

  const handleCreateCombat = async () => {
    if (!selectedOpponent) {
      toast.error('Por favor selecciona un oponente');
      return;
    }

    try {
      await createCombatSession(selectedOpponent);
      setShowCreateModal(false);
      setSelectedOpponent('');
      toast.success('Sesión de combate creada exitosamente');
      fetchCombatSessions();
    } catch (error: any) {
      toast.error(error.message || 'Error al crear sesión de combate');
    }
  };

  const handleJoinCombat = async (sessionId: string) => {
    try {
      await joinCombatSession(sessionId);
      toast.success('Te uniste al combate exitosamente');
      fetchCombatSessions();
    } catch (error: any) {
      toast.error(error.message || 'Error al unirse al combate');
    }
  };

  const handleLeaveCombat = async (sessionId: string) => {
    try {
      await leaveCombatSession(sessionId);
      toast.success('Abandonaste el combate');
      if (activeCombat?.id === sessionId) {
        setActiveCombat(null);
      }
      fetchCombatSessions();
    } catch (error: any) {
      toast.error(error.message || 'Error al abandonar el combate');
    }
  };

  const handlePerformAction = async () => {
    if (!activeCombat || !selectedAction) {
      toast.error('Por favor selecciona una acción');
      return;
    }

    try {
      await performCombatAction(activeCombat.id, {
        action: selectedAction,
        target: actionTarget,
        shipId: selectedShip,
      });
      toast.success('Acción de combate realizada');
      setSelectedAction('');
      setActionTarget('');
    } catch (error: any) {
      toast.error(error.message || 'Error al realizar acción');
    }
  };

  const getStatusColor = (status: CombatStatus) => {
    switch (status) {
      case 'waiting':
        return 'text-yellow-400';
      case 'active':
        return 'text-green-400';
      case 'paused':
        return 'text-blue-400';
      case 'completed':
        return 'text-gray-400';
      case 'aborted':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (status: CombatStatus) => {
    switch (status) {
      case 'waiting':
        return 'Esperando jugadores';
      case 'active':
        return 'En combate';
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

  // Mock opponents for demo
  const mockOpponents = [
    { id: 'opponent1', name: 'Jugador Alpha', level: 15 },
    { id: 'opponent2', name: 'Jugador Beta', level: 12 },
    { id: 'opponent3', name: 'Jugador Gamma', level: 18 },
  ];

  // Mock ships for demo
  const mockShips: Ship[] = [
    {
      id: 'ship1',
      userId: user?.id || '',
      name: 'Nave de Combate MK1',
      type: 'fighter',
      class: 'light',
      level: 5,
      experience: 2500,
      health: {
        current: 100,
        max: 100,
        shield: 50,
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
        x: 0,
        y: 0,
        z: 0,
        systemId: 'system1',
        rotation: { x: 0, y: 0, z: 0, w: 1 },
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const combatActions = [
    { id: 'attack', name: 'Atacar', icon: '⚔️' },
    { id: 'defend', name: 'Defender', icon: '🛡️' },
    { id: 'special', name: 'Habilidad Especial', icon: '✨' },
    { id: 'repair', name: 'Reparar', icon: '🔧' },
    { id: 'escape', name: 'Intentar Escapar', icon: '🏃' },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
        <h2 className="text-2xl font-bold text-white mb-2">Centro de Combate</h2>
        <p className="text-gray-300">
          Gestiona tus sesiones de combate y participa en batallas espaciales
        </p>
      </div>

      {/* Active Combat */}
      {activeCombat && (
        <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Combate Activo</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activeCombat.status)} bg-secondary-700`}>
              {getStatusText(activeCombat.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Combat Info */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Información del Combate</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">ID de Sesión:</span>
                  <span className="text-white font-mono text-sm">{activeCombat.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Participantes:</span>
                  <span className="text-white">{activeCombat.participants?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Turno Actual:</span>
                  <span className="text-white">Tu turno</span>
                </div>
              </div>
            </div>

            {/* Combat Actions */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Acciones de Combate</h4>
              
              {/* Ship Selection */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Seleccionar Nave
                </label>
                <select
                  value={selectedShip}
                  onChange={(e) => setSelectedShip(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Selecciona una nave</option>
                  {mockShips.map((ship) => (
                    <option key={ship.id} value={ship.id}>
                      {ship.name} (Nivel {ship.level})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Selection */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Seleccionar Acción
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {combatActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => setSelectedAction(action.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedAction === action.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-secondary-700 text-gray-300 hover:bg-secondary-600'
                      }`}
                    >
                      {action.icon} {action.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Selection */}
              {selectedAction === 'attack' && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Seleccionar Objetivo
                  </label>
                  <select
                    value={actionTarget}
                    onChange={(e) => setActionTarget(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Selecciona un objetivo</option>
                    {activeCombat.participants?.map((participant) => (
                      participant.userId !== user?.id && (
                        <option key={participant.userId} value={participant.userId}>
                          Jugador {participant.userId}
                        </option>
                      )
                    ))}
                  </select>
                </div>
              )}

              {/* Execute Action Button */}
              <button
                onClick={handlePerformAction}
                disabled={!selectedAction || !selectedShip}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Ejecutar Acción
              </button>
            </div>
          </div>

          {/* Leave Combat Button */}
          <div className="mt-4 pt-4 border-t border-secondary-600">
            <button
              onClick={() => handleLeaveCombat(activeCombat.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Abandonar Combate
            </button>
          </div>
        </div>
      )}

      {/* Combat Sessions List */}
      <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Sesiones de Combate</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Crear Nuevo Combate
          </button>
        </div>

        {combatSessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No hay sesiones de combate disponibles</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Crear Primera Sesión
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {combatSessions.map((session) => (
              <div
                key={session.id}
                className="bg-secondary-700 rounded-lg p-4 border border-secondary-600"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-white">
                      Sesión {session.id.slice(-8)}
                    </h4>
                    <p className="text-gray-300 text-sm">
                      {session.participants?.length || 0} participantes
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)} bg-secondary-600`}>
                      {getStatusText(session.status)}
                    </span>
                    <div className="flex space-x-2">
                      {session.status === 'waiting' && (
                        <button
                          onClick={() => handleJoinCombat(session.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Unirse
                        </button>
                      )}
                      {session.participants?.some(p => p.userId === user?.id) && (
                        <button
                          onClick={() => handleLeaveCombat(session.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          Abandonar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Combat Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-secondary-800 rounded-lg p-6 max-w-md w-full mx-4 border border-secondary-600">
            <h3 className="text-xl font-bold text-white mb-4">Crear Nueva Sesión de Combate</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Seleccionar Oponente
              </label>
              <select
                value={selectedOpponent}
                onChange={(e) => setSelectedOpponent(e.target.value)}
                className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Selecciona un oponente</option>
                {mockOpponents.map((opponent) => (
                  <option key={opponent.id} value={opponent.id}>
                    {opponent.name} (Nivel {opponent.level})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCreateCombat}
                disabled={!selectedOpponent}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Crear Combate
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedOpponent('');
                }}
                className="flex-1 px-4 py-2 bg-secondary-600 text-white rounded-lg font-medium hover:bg-secondary-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CombatManager;
