'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore, useResourceStore, useInventoryStore, useCombatStore, useMarketplaceStore } from '@/store';
import { Resource, InventoryItem, CombatSession, MarketplaceListing } from '@/types';
import { 
  Coins, 
  Package, 
  Sword, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Shield, 
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface DashboardStats {
  totalResources: number;
  totalItems: number;
  activeCombats: number;
  marketplaceListings: number;
  recentTransactions: number;
  onlineUsers: number;
}

export const GameDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { resources, fetchResources } = useResourceStore();
  const { inventory, fetchInventory } = useInventoryStore();
  const { combatSessions, fetchCombatSessions } = useCombatStore();
  const { listings, fetchListings } = useMarketplaceStore();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalResources: 0,
    totalItems: 0,
    activeCombats: 0,
    marketplaceListings: 0,
    recentTransactions: 0,
    onlineUsers: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchResources(),
          fetchInventory(),
          fetchCombatSessions({ status: 'active' }),
          fetchListings({ limit: 10 }),
        ]);

        // Calculate stats
        const totalResources = resources.reduce((sum, resource) => sum + resource.amount, 0);
        const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
        const activeCombats = combatSessions.filter(session => session.status === 'active').length;
        const marketplaceListings = listings.filter(listing => listing.status === 'active').length;

        setStats({
          totalResources,
          totalItems,
          activeCombats,
          marketplaceListings,
          recentTransactions: 0, // Would come from transactions API
          onlineUsers: Math.floor(Math.random() * 1000) + 500, // Mock data
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [fetchResources, fetchInventory, fetchCombatSessions, fetchListings]);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'credits': return <Coins className="w-5 h-5 text-yellow-400" />;
      case 'metal': return <Shield className="w-5 h-5 text-gray-400" />;
      case 'plasma': return <Zap className="w-5 h-5 text-purple-400" />;
      case 'energy': return <Activity className="w-5 h-5 text-blue-400" />;
      case 'crystals': return <Package className="w-5 h-5 text-cyan-400" />;
      default: return <Package className="w-5 h-5 text-secondary-400" />;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-950">
      {/* Header */}
      <div className="bg-secondary-900 border-b border-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">
                Panel de Mando
              </h1>
              <div className="ml-4 flex items-center text-sm text-secondary-400">
                <div className="w-2 h-2 bg-success-500 rounded-full mr-2"></div>
                {user?.username}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-secondary-400">
                <Users className="w-4 h-4 mr-1" />
                {stats.onlineUsers} en línea
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Bienvenido, {user?.username}!
          </h2>
          <p className="text-secondary-400">
            Nivel {user?.level} • {user?.experience} XP • {user?.credits} créditos
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Resources Card */}
          <div className="bg-secondary-900 rounded-lg border border-secondary-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-primary-600/20 rounded-lg">
                  <Coins className="w-6 h-6 text-primary-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-secondary-400">Recursos</p>
                  <p className="text-2xl font-bold text-white">{formatNumber(stats.totalResources)}</p>
                </div>
              </div>
              <TrendingUp className="w-5 h-5 text-success-400" />
            </div>
            <div className="space-y-2">
              {resources.slice(0, 3).map((resource) => (
                <div key={resource.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    {getResourceIcon(resource.type)}
                    <span className="ml-2 text-secondary-300">{resource.type}</span>
                  </div>
                  <span className="text-white font-medium">{formatNumber(resource.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Inventory Card */}
          <div className="bg-secondary-900 rounded-lg border border-secondary-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-accent-600/20 rounded-lg">
                  <Package className="w-6 h-6 text-accent-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-secondary-400">Inventario</p>
                  <p className="text-2xl font-bold text-white">{formatNumber(stats.totalItems)}</p>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-success-400" />
            </div>
            <div className="space-y-2">
              {inventory.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-secondary-300">{item.name}</span>
                  <span className="text-white font-medium">x{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Combat Card */}
          <div className="bg-secondary-900 rounded-lg border border-secondary-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-danger-600/20 rounded-lg">
                  <Sword className="w-6 h-6 text-danger-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-secondary-400">Combates</p>
                  <p className="text-2xl font-bold text-white">{stats.activeCombats}</p>
                </div>
              </div>
              {stats.activeCombats > 0 && (
                <AlertTriangle className="w-5 h-5 text-warning-400" />
              )}
            </div>
            <div className="space-y-2">
              {combatSessions.slice(0, 2).map((combat) => (
                <div key={combat.id} className="flex items-center justify-between text-sm">
                  <span className="text-secondary-300">{combat.battleType}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    combat.status === 'active' 
                      ? 'bg-success-600/20 text-success-400'
                      : 'bg-secondary-700 text-secondary-300'
                  }`}>
                    {combat.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Marketplace Card */}
          <div className="bg-secondary-900 rounded-lg border border-secondary-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-warning-600/20 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-warning-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-secondary-400">Marketplace</p>
                  <p className="text-2xl font-bold text-white">{stats.marketplaceListings}</p>
                </div>
              </div>
              <TrendingUp className="w-5 h-5 text-success-400" />
            </div>
            <div className="space-y-2">
              {listings.slice(0, 2).map((listing) => (
                <div key={listing.id} className="flex items-center justify-between text-sm">
                  <span className="text-secondary-300">{listing.itemId}</span>
                  <span className="text-white font-medium">{listing.price} créditos</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions Panel */}
          <div className="bg-secondary-900 rounded-lg border border-secondary-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
                <Zap className="w-4 h-4 mr-2" />
                Producir
              </button>
              <button className="flex items-center justify-center px-4 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors">
                <Package className="w-4 h-4 mr-2" />
                Inventario
              </button>
              <button className="flex items-center justify-center px-4 py-3 bg-danger-600 hover:bg-danger-700 text-white rounded-lg transition-colors">
                <Sword className="w-4 h-4 mr-2" />
                Combatir
              </button>
              <button className="flex items-center justify-center px-4 py-3 bg-warning-600 hover:bg-warning-700 text-white rounded-lg transition-colors">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Mercado
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-secondary-900 rounded-lg border border-secondary-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Actividad Reciente</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-success-500 rounded-full mr-3"></div>
                <span className="text-secondary-300">Recurso recolectado:</span>
                <span className="ml-auto text-white font-medium">+100 metal</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                <span className="text-secondary-300">Item equipado:</span>
                <span className="ml-auto text-white font-medium">Laser Cannon</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-warning-500 rounded-full mr-3"></div>
                <span className="text-secondary-300">Transacción:</span>
                <span className="ml-auto text-white font-medium">-500 créditos</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-danger-500 rounded-full mr-3"></div>
                <span className="text-secondary-300">Combate iniciado:</span>
                <span className="ml-auto text-white font-medium">vs Player123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
