'use client';

import React, { useState, useEffect } from 'react';
import { useResourceStore, useAuthStore } from '@/store';
import { ResourceType } from '@/types';
import toast from 'react-hot-toast';

interface ResourceMarketProps {
  className?: string;
}

interface MarketListing {
  id: string;
  sellerId: string;
  sellerName: string;
  resourceType: ResourceType;
  amount: number;
  pricePerUnit: number;
  totalPrice: number;
  quality: number;
  createdAt: string;
  expiresAt: string;
}

interface TradeHistory {
  id: string;
  type: 'buy' | 'sell';
  resourceType: ResourceType;
  amount: number;
  pricePerUnit: number;
  totalPrice: number;
  timestamp: string;
  partnerId: string;
  partnerName: string;
}

const ResourceMarket: React.FC<ResourceMarketProps> = ({ className = '' }) => {
  const { user } = useAuthStore();
  const { resources, fetchResources, updateResource } = useResourceStore();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'history'>('buy');
  const [selectedResource, setSelectedResource] = useState<ResourceType>('metal');
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [newListing, setNewListing] = useState({
    resourceType: 'metal' as ResourceType,
    amount: 0,
    pricePerUnit: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Mock market listings
  const mockListings: MarketListing[] = [
    {
      id: 'listing_1',
      sellerId: 'seller1',
      sellerName: 'MetalMaster',
      resourceType: 'metal',
      amount: 5000,
      pricePerUnit: 2.5,
      totalPrice: 12500,
      quality: 3,
      createdAt: '2024-01-15T10:30:00Z',
      expiresAt: '2024-01-22T10:30:00Z',
    },
    {
      id: 'listing_2',
      sellerId: 'seller2',
      sellerName: 'CrystalTrader',
      resourceType: 'crystals',
      amount: 500,
      pricePerUnit: 15.0,
      totalPrice: 7500,
      quality: 2,
      createdAt: '2024-01-15T11:15:00Z',
      expiresAt: '2024-01-22T11:15:00Z',
    },
    {
      id: 'listing_3',
      sellerId: 'seller3',
      sellerName: 'EnergySupplier',
      resourceType: 'energy',
      amount: 2000,
      pricePerUnit: 1.8,
      totalPrice: 3600,
      quality: 3,
      createdAt: '2024-01-15T12:00:00Z',
      expiresAt: '2024-01-22T12:00:00Z',
    },
    {
      id: 'listing_4',
      sellerId: 'seller4',
      sellerName: 'QuantumDealer',
      resourceType: 'quantum',
      amount: 100,
      pricePerUnit: 50.0,
      totalPrice: 5000,
      quality: 4,
      createdAt: '2024-01-15T13:45:00Z',
      expiresAt: '2024-01-22T13:45:00Z',
    },
    {
      id: 'listing_5',
      sellerId: 'seller5',
      sellerName: 'ExoticHunter',
      resourceType: 'exotics',
      amount: 50,
      pricePerUnit: 120.0,
      totalPrice: 6000,
      quality: 5,
      createdAt: '2024-01-15T14:30:00Z',
      expiresAt: '2024-01-22T14:30:00Z',
    },
  ];

  // Mock trade history
  const mockTradeHistory: TradeHistory[] = [
    {
      id: 'trade_1',
      type: 'buy',
      resourceType: 'metal',
      amount: 1000,
      pricePerUnit: 2.2,
      totalPrice: 2200,
      timestamp: '2024-01-14T15:30:00Z',
      partnerId: 'partner1',
      partnerName: 'IronMiner',
    },
    {
      id: 'trade_2',
      type: 'sell',
      resourceType: 'crystals',
      amount: 200,
      pricePerUnit: 14.5,
      totalPrice: 2900,
      timestamp: '2024-01-14T16:45:00Z',
      partnerId: 'partner2',
      partnerName: 'CrystalBuyer',
    },
    {
      id: 'trade_3',
      type: 'buy',
      resourceType: 'energy',
      amount: 500,
      pricePerUnit: 1.9,
      totalPrice: 950,
      timestamp: '2024-01-14T18:00:00Z',
      partnerId: 'partner3',
      partnerName: 'PowerSeller',
    },
  ];

  useEffect(() => {
    loadMarketData();
  }, [selectedResource]);

  const loadMarketData = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const filteredListings = mockListings.filter(
        listing => listing.resourceType === selectedResource
      );
      setListings(filteredListings);
      setTradeHistory(mockTradeHistory);
      setIsLoading(false);
    }, 500);
  };

  const handleBuy = async (listing: MarketListing) => {
    const userResource = resources.find(r => r.type === 'credits');
    if (!userResource || userResource.amount < listing.totalPrice) {
      toast.error('Créditos insuficientes');
      return;
    }

    try {
      // Update user resources
      updateResource(userResource.id, {
        amount: userResource.amount - listing.totalPrice,
      });

      const boughtResource = resources.find(r => r.type === listing.resourceType);
      if (boughtResource) {
        updateResource(boughtResource.id, {
          amount: Math.min(boughtResource.amount + listing.amount, boughtResource.maxAmount),
        });
      }

      // Add to trade history
      const newTrade: TradeHistory = {
        id: `trade_${Date.now()}`,
        type: 'buy',
        resourceType: listing.resourceType,
        amount: listing.amount,
        pricePerUnit: listing.pricePerUnit,
        totalPrice: listing.totalPrice,
        timestamp: new Date().toISOString(),
        partnerId: listing.sellerId,
        partnerName: listing.sellerName,
      };

      setTradeHistory([newTrade, ...tradeHistory]);
      setListings(listings.filter(l => l.id !== listing.id));

      toast.success(`Compra realizada: ${listing.amount} ${listing.resourceType} por ${listing.totalPrice} créditos`);
    } catch (error: any) {
      toast.error(error.message || 'Error al realizar compra');
    }
  };

  const handleCreateListing = async () => {
    if (!newListing.amount || !newListing.pricePerUnit) {
      toast.error('Por completa todos los campos');
      return;
    }

    const userResource = resources.find(r => r.type === newListing.resourceType);
    if (!userResource || userResource.amount < newListing.amount) {
      toast.error('Recursos insuficientes');
      return;
    }

    try {
      // Update user resources
      updateResource(userResource.id, {
        amount: userResource.amount - newListing.amount,
      });

      // Create new listing
      const listing: MarketListing = {
        id: `listing_${Date.now()}`,
        sellerId: user?.id || '',
        sellerName: user?.username || 'You',
        resourceType: newListing.resourceType,
        amount: newListing.amount,
        pricePerUnit: newListing.pricePerUnit,
        totalPrice: newListing.amount * newListing.pricePerUnit,
        quality: 3,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      };

      setListings([listing, ...listings]);
      setShowCreateListing(false);
      setNewListing({
        resourceType: 'metal',
        amount: 0,
        pricePerUnit: 0,
      });

      toast.success('Oferta creada exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear oferta');
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getQualityStars = (quality: number) => {
    return '⭐'.repeat(Math.min(quality, 5));
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getAveragePrice = (resourceType: ResourceType) => {
    const filteredListings = mockListings.filter(l => l.resourceType === resourceType);
    if (filteredListings.length === 0) return 0;
    const total = filteredListings.reduce((sum, l) => sum + l.pricePerUnit, 0);
    return total / filteredListings.length;
  };

  const resourceTypes: ResourceType[] = ['metal', 'crystals', 'energy', 'plasma', 'quantum', 'exotics'];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
        <h2 className="text-2xl font-bold text-white mb-2">Mercado de Recursos</h2>
        <p className="text-gray-300">
          Compra y vende recursos con otros jugadores
        </p>
      </div>

      {/* Market Tabs */}
      <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-600">
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('buy')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'buy'
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-700 text-gray-300 hover:bg-secondary-600'
            }`}
          >
            Comprar
          </button>
          <button
            onClick={() => setActiveTab('sell')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'sell'
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-700 text-gray-300 hover:bg-secondary-600'
            }`}
          >
            Vender
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-700 text-gray-300 hover:bg-secondary-600'
            }`}
          >
            Historial
          </button>
        </div>

        {/* Buy Tab */}
        {activeTab === 'buy' && (
          <div>
            {/* Resource Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Filtrar por Recurso
              </label>
              <div className="flex flex-wrap gap-2">
                {resourceTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedResource(type)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedResource === type
                        ? 'bg-primary-600 text-white'
                        : 'bg-secondary-700 text-gray-300 hover:bg-secondary-600'
                    }`}
                  >
                    <span className="mr-1">{getResourceIcon(type)}</span>
                    {getResourceName(type)}
                  </button>
                ))}
              </div>
            </div>

            {/* Market Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-secondary-700 rounded-lg p-4">
                <div className="text-sm text-gray-300 mb-1">Precio Promedio</div>
                <div className="text-xl font-bold text-white">
                  {getAveragePrice(selectedResource).toFixed(2)} créditos/unidad
                </div>
              </div>
              <div className="bg-secondary-700 rounded-lg p-4">
                <div className="text-sm text-gray-300 mb-1">Ofertas Disponibles</div>
                <div className="text-xl font-bold text-white">{listings.length}</div>
              </div>
              <div className="bg-secondary-700 rounded-lg p-4">
                <div className="text-sm text-gray-300 mb-1">Volumen Total</div>
                <div className="text-xl font-bold text-white">
                  {formatNumber(listings.reduce((sum, l) => sum + l.amount, 0))}
                </div>
              </div>
            </div>

            {/* Listings */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="text-gray-300 mt-2">Cargando ofertas...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No hay ofertas disponibles para {getResourceName(selectedResource)}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="bg-secondary-700 rounded-lg p-4 border border-secondary-600"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{getResourceIcon(listing.resourceType)}</span>
                          <div>
                            <h4 className="text-white font-medium">{listing.sellerName}</h4>
                            <p className="text-sm text-gray-300">
                              {getQualityStars(listing.quality)} • 
                              Expira en {getTimeRemaining(listing.expiresAt)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-300">Cantidad:</span>
                            <span className="text-white ml-1">{formatNumber(listing.amount)}</span>
                          </div>
                          <div>
                            <span className="text-gray-300">Precio/u:</span>
                            <span className="text-white ml-1">{listing.pricePerUnit.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-300">Total:</span>
                            <span className="text-yellow-400 ml-1 font-medium">{formatNumber(listing.totalPrice)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleBuy(listing)}
                        className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sell Tab */}
        {activeTab === 'sell' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white">Tus Recursos</h3>
              <button
                onClick={() => setShowCreateListing(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Crear Oferta
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.filter(r => r.type !== 'credits').map((resource) => (
                <div key={resource.id} className="bg-secondary-700 rounded-lg p-4 border border-secondary-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getResourceIcon(resource.type)}</span>
                      <span className="text-white font-medium">{getResourceName(resource.type)}</span>
                    </div>
                    <span className="text-sm text-gray-300">
                      {formatNumber(resource.amount)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-300 mb-3">
                    Precio promedio: {getAveragePrice(resource.type).toFixed(2)} créditos/u
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowCreateListing(true);
                      setNewListing({
                        ...newListing,
                        resourceType: resource.type,
                      });
                    }}
                    className="w-full px-3 py-2 bg-primary-600 text-white rounded text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    Vender
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Historial de Transacciones</h3>
            
            {tradeHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No tienes transacciones recientes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tradeHistory.map((trade) => (
                  <div
                    key={trade.id}
                    className="bg-secondary-700 rounded-lg p-4 border border-secondary-600"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getResourceIcon(trade.resourceType)}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              trade.type === 'buy' 
                                ? 'bg-green-900/30 text-green-400' 
                                : 'bg-blue-900/30 text-blue-400'
                            }`}>
                              {trade.type === 'buy' ? 'Compra' : 'Venta'}
                            </span>
                            <h4 className="text-white font-medium">
                              {formatNumber(trade.amount)} {getResourceName(trade.resourceType)}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-300">
                            con {trade.partnerName} • 
                            {new Date(trade.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-bold ${
                          trade.type === 'buy' ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {trade.type === 'buy' ? '-' : '+'}{formatNumber(trade.totalPrice)} créditos
                        </div>
                        <div className="text-sm text-gray-300">
                          {trade.pricePerUnit.toFixed(2)}/u
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Listing Modal */}
      {showCreateListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-secondary-800 rounded-lg p-6 max-w-md w-full mx-4 border border-secondary-600">
            <h3 className="text-xl font-bold text-white mb-4">Crear Oferta de Venta</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tipo de Recurso
                </label>
                <select
                  value={newListing.resourceType}
                  onChange={(e) => setNewListing({ ...newListing, resourceType: e.target.value as ResourceType })}
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {resourceTypes.map((type) => (
                    <option key={type} value={type}>
                      {getResourceIcon(type)} {getResourceName(type)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  value={newListing.amount}
                  onChange={(e) => setNewListing({ ...newListing, amount: parseInt(e.target.value) || 0 })}
                  placeholder="Ingresa la cantidad"
                  min="1"
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {(() => {
                  const resource = resources.find(r => r.type === newListing.resourceType);
                  return resource && (
                    <div className="text-sm text-gray-300 mt-1">
                      Disponible: {formatNumber(resource.amount)}
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Precio por Unidad (créditos)
                </label>
                <input
                  type="number"
                  value={newListing.pricePerUnit}
                  onChange={(e) => setNewListing({ ...newListing, pricePerUnit: parseFloat(e.target.value) || 0 })}
                  placeholder="Ingresa el precio por unidad"
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="text-sm text-gray-300 mt-1">
                  Precio promedio: {getAveragePrice(newListing.resourceType).toFixed(2)} créditos/u
                </div>
              </div>

              {newListing.amount > 0 && newListing.pricePerUnit > 0 && (
                <div className="bg-secondary-700 rounded-lg p-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total a recibir:</span>
                    <span className="text-green-400 font-bold">
                      {formatNumber(newListing.amount * newListing.pricePerUnit)} créditos
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateListing}
                disabled={!newListing.amount || !newListing.pricePerUnit}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Crear Oferta
              </button>
              <button
                onClick={() => {
                  setShowCreateListing(false);
                  setNewListing({
                    resourceType: 'metal',
                    amount: 0,
                    pricePerUnit: 0,
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

export default ResourceMarket;
