'use client';

import React, { useState, useEffect } from 'react';
import { useResourceStore, useAuthStore } from '@/store';
import { Resource, ResourceType } from '@/types';
import toast from 'react-hot-toast';

interface ResourceManagerProps {
  className?: string;
}

const ResourceManager: React.FC<ResourceManagerProps> = ({ className = '' }) => {
  const { user } = useAuthStore();
  const { resources, isLoading, fetchResources, updateResource, transferResources } = useResourceStore();
  const [selectedResource, setSelectedResource] = useState<ResourceType | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState({
    targetUserId: '',
    amount: 0,
    resourceType: 'credits' as ResourceType,
  });

  useEffect(() => {
    if (user) {
      fetchResources();
    }
  }, [user, fetchResources]);

  const handleTransfer = async () => {
    if (!transferData.targetUserId || transferData.amount <= 0) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      await transferResources(transferData);
      toast.success('Transferencia realizada exitosamente');
      setShowTransferModal(false);
      setTransferData({
        targetUserId: '',
        amount: 0,
        resourceType: 'credits',
      });
      fetchResources();
    } catch (error: any) {
      toast.error(error.message || 'Error al realizar transferencia');
    }
  };

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'credits':
        return '💰';
      case 'metal':
        return '🔧';
      case 'plasma':
        return '⚡';
      case 'energy':
        return '🔋';
      case 'crystals':
        return '💎';
      case 'exotics':
        return '🌟';
      case 'quantum':
        return '🌀';
      case 'dark_matter':
        return '⚫';
      default:
        return '📦';
    }
  };

  const getResourceName = (type: ResourceType) => {
    switch (type) {
      case 'credits':
        return 'Créditos';
      case 'metal':
        return 'Metal';
      case 'plasma':
        return 'Plasma';
      case 'energy':
        return 'Energía';
      case 'crystals':
        return 'Cristales';
      case 'exotics':
        return 'Exóticos';
      case 'quantum':
        return 'Quantum';
      case 'dark_matter':
        return 'Materia Oscura';
      default:
        return type;
    }
  };

  const getResourceColor = (type: ResourceType) => {
    switch (type) {
      case 'credits':
        return 'text-yellow-400 bg-yellow-900/30';
      case 'metal':
        return 'text-gray-400 bg-gray-900/30';
      case 'plasma':
        return 'text-purple-400 bg-purple-900/30';
      case 'energy':
        return 'text-blue-400 bg-blue-900/30';
      case 'crystals':
        return 'text-cyan-400 bg-cyan-900/30';
      case 'exotics':
        return 'text-orange-400 bg-orange-900/30';
      case 'quantum':
        return 'text-pink-400 bg-pink-900/30';
      case 'dark_matter':
        return 'text-gray-600 bg-gray-800/30';
      default:
        return 'text-gray-400 bg-gray-900/30';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getProductionRate = (resource: Resource) => {
    if (resource.productionRate > 0) {
      return `+${resource.productionRate}/h`;
    } else if (resource.productionRate < 0) {
      return `${resource.productionRate}/h`;
    }
    return '0/h';
  };

  const getStoragePercentage = (resource: Resource) => {
    return (resource.amount / resource.maxAmount) * 100;
  };

  const getStorageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // Mock production upgrades
  const productionUpgrades = [
    { level: 1, cost: 1000, bonus: 1.2, description: 'Mejora Básica (+20%)' },
    { level: 2, cost: 5000, bonus: 1.5, description: 'Mejora Intermedia (+50%)' },
    { level: 3, cost: 15000, bonus: 2.0, description: 'Mejora Avanzada (+100%)' },
    { level: 4, cost: 50000, bonus: 3.0, description: 'Mejora Épica (+200%)' },
  ];

  // Mock storage upgrades
  const storageUpgrades = [
    { level: 1, cost: 500, capacity: 10000, description: 'Almacén Pequeño' },
    { level: 2, cost: 2000, capacity: 50000, description: 'Almacén Mediano' },
    { level: 3, cost: 10000, capacity: 200000, description: 'Almacén Grande' },
    { level: 4, cost: 50000, capacity: 1000000, description: 'Almacén Épico' },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
        <h2 className="text-2xl font-bold text-white mb-2">Gestión de Recursos</h2>
        <p className="text-gray-300">
          Administra tus recursos y optimiza tu producción
        </p>
      </div>

      {/* Resources Overview */}
      <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Recursos Disponibles</h3>
          <button
            onClick={() => fetchResources()}
            className="px-3 py-1 bg-secondary-700 text-white rounded-lg text-sm font-medium hover:bg-secondary-600 transition-colors"
          >
            🔄 Actualizar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {resources.map((resource) => {
            const percentage = getStoragePercentage(resource);
            const storageColor = getStorageColor(percentage);
            
            return (
              <div
                key={resource.id}
                className="bg-secondary-700 rounded-lg p-4 border border-secondary-600 hover:border-secondary-500 transition-colors cursor-pointer"
                onClick={() => setSelectedResource(resource.type)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getResourceIcon(resource.type)}</span>
                    <div>
                      <h4 className="text-white font-medium">{getResourceName(resource.type)}</h4>
                      <p className="text-xs text-gray-400">{getProductionRate(resource)}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResourceColor(resource.type)}`}>
                    {resource.type}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Cantidad:</span>
                    <span className="text-white font-bold">{formatNumber(resource.amount)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Capacidad:</span>
                    <span className="text-white text-sm">{formatNumber(resource.maxAmount)}</span>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-300 text-sm">Almacenamiento:</span>
                      <span className="text-white text-sm">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-secondary-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${storageColor}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-secondary-600">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTransferModal(true);
                      setTransferData({
                        ...transferData,
                        resourceType: resource.type,
                      });
                    }}
                    className="w-full px-3 py-1 bg-primary-600 text-white rounded text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    Transferir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resource Details */}
      {selectedResource && (
        <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center">
              <span className="text-2xl mr-2">{getResourceIcon(selectedResource)}</span>
              Detalles de {getResourceName(selectedResource)}
            </h3>
            <button
              onClick={() => setSelectedResource(null)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {(() => {
            const resource = resources.find(r => r.type === selectedResource);
            if (!resource) return null;

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Status */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Estado Actual</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Cantidad Actual:</span>
                      <span className="text-white font-medium">{formatNumber(resource.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Capacidad Máxima:</span>
                      <span className="text-white font-medium">{formatNumber(resource.maxAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Tasa de Producción:</span>
                      <span className={`font-medium ${
                        resource.productionRate > 0 ? 'text-green-400' : 
                        resource.productionRate < 0 ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {getProductionRate(resource)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Última Actualización:</span>
                      <span className="text-white text-sm">
                        {new Date(resource.lastUpdated).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Production Upgrades */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Mejoras de Producción</h4>
                  <div className="space-y-2">
                    {productionUpgrades.map((upgrade, index) => (
                      <div
                        key={index}
                        className="bg-secondary-700 rounded-lg p-3 border border-secondary-600"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-white font-medium">{upgrade.description}</h5>
                            <p className="text-sm text-gray-300">
                              Costo: {formatNumber(upgrade.cost)} créditos
                            </p>
                          </div>
                          <button
                            className="px-3 py-1 bg-primary-600 text-white rounded text-sm font-medium hover:bg-primary-700 transition-colors"
                          >
                            Mejorar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Storage Upgrades */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Mejoras de Almacenamiento</h4>
                  <div className="space-y-2">
                    {storageUpgrades.map((upgrade, index) => (
                      <div
                        key={index}
                        className="bg-secondary-700 rounded-lg p-3 border border-secondary-600"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-white font-medium">{upgrade.description}</h5>
                            <p className="text-sm text-gray-300">
                              Capacidad: {formatNumber(upgrade.capacity)} • 
                              Costo: {formatNumber(upgrade.cost)} créditos
                            </p>
                          </div>
                          <button
                            className="px-3 py-1 bg-primary-600 text-white rounded text-sm font-medium hover:bg-primary-700 transition-colors"
                          >
                            Mejorar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Production History */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Historial de Producción</h4>
                  <div className="bg-secondary-700 rounded-lg p-4 border border-secondary-600">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Última hora:</span>
                        <span className="text-green-400">+{formatNumber(resource.productionRate * 1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Últimas 24 horas:</span>
                        <span className="text-green-400">+{formatNumber(resource.productionRate * 24)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Última semana:</span>
                        <span className="text-green-400">+{formatNumber(resource.productionRate * 168)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-secondary-800 rounded-lg p-6 max-w-md w-full mx-4 border border-secondary-600">
            <h3 className="text-xl font-bold text-white mb-4">Transferir Recursos</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tipo de Recurso
                </label>
                <div className="flex items-center space-x-2 px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg">
                  <span>{getResourceIcon(transferData.resourceType)}</span>
                  <span className="text-white">{getResourceName(transferData.resourceType)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  ID del Usuario Destino
                </label>
                <input
                  type="text"
                  value={transferData.targetUserId}
                  onChange={(e) => setTransferData({ ...transferData, targetUserId: e.target.value })}
                  placeholder="Ingresa el ID del usuario"
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  value={transferData.amount}
                  onChange={(e) => setTransferData({ ...transferData, amount: parseInt(e.target.value) || 0 })}
                  placeholder="Ingresa la cantidad"
                  min="1"
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {(() => {
                const resource = resources.find(r => r.type === transferData.resourceType);
                return resource && (
                  <div className="text-sm text-gray-300">
                    Disponible: {formatNumber(resource.amount)} {getResourceName(transferData.resourceType)}
                  </div>
                );
              })()}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleTransfer}
                disabled={!transferData.targetUserId || transferData.amount <= 0}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Transferir
              </button>
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setTransferData({
                    targetUserId: '',
                    amount: 0,
                    resourceType: 'credits',
                  });
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

export default ResourceManager;
