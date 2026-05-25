'use client';

import React, { useEffect, useState } from 'react';
import { useInventoryStore, useUIStore } from '@/store';
import { InventoryItem, ItemTypeCategory, ItemRarity } from '@/types';
import { 
  Package, 
  Sword, 
  Shield, 
  Zap, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Eye, 
  EyeOff, 
  Trash2, 
  Plus,
  ChevronDown,
  Star,
  Gem,
  Crown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface InventoryFilters {
  category: ItemTypeCategory | 'all';
  rarity: ItemRarity | 'all';
  equipped: boolean | 'all';
  search: string;
}

export const InventoryManager: React.FC = () => {
  const { 
    inventory, 
    equippedItems, 
    isLoading, 
    fetchInventory, 
    fetchEquippedItems, 
    equipItem, 
    unequipItem, 
    removeItem 
  } = useInventoryStore();
  
  const { setLoading } = useUIStore();
  
  const [filters, setFilters] = useState<InventoryFilters>({
    category: 'all',
    rarity: 'all',
    equipped: 'all',
    search: ''
  });
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading('inventory', true);
      try {
        await Promise.all([
          fetchInventory(filters),
          fetchEquippedItems()
        ]);
      } catch (error) {
        console.error('Error loading inventory:', error);
        toast.error('Error al cargar el inventario');
      } finally {
        setLoading('inventory', false);
      }
    };

    loadData();
  }, [fetchInventory, fetchEquippedItems, filters, setLoading]);

  const handleFilterChange = (key: keyof InventoryFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleEquipItem = async (itemId: string, slot?: string) => {
    try {
      if (slot) {
        await equipItem(itemId, slot);
        toast.success('Item equipado correctamente');
      }
    } catch (error) {
      console.error('Error equipping item:', error);
      toast.error('Error al equipar el item');
    }
  };

  const handleUnequipItem = async (itemId: string) => {
    try {
      await unequipItem(itemId);
      toast.success('Item desequipado correctamente');
    } catch (error) {
      console.error('Error unequipping item:', error);
      toast.error('Error al desequipar el item');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este item?')) return;
    
    try {
      await removeItem(itemId);
      toast.success('Item eliminado correctamente');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Error al eliminar el item');
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getRarityColor = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-600';
      case 'uncommon': return 'text-green-400 border-green-600';
      case 'rare': return 'text-blue-400 border-blue-600';
      case 'epic': return 'text-purple-400 border-purple-600';
      case 'legendary': return 'text-orange-400 border-orange-600';
      case 'mythic': return 'text-red-400 border-red-600';
      default: return 'text-gray-400 border-gray-600';
    }
  };

  const getRarityIcon = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'common': return <Star className="w-3 h-3" />;
      case 'uncommon': return <Star className="w-3 h-3" />;
      case 'rare': return <Gem className="w-3 h-3" />;
      case 'epic': return <Gem className="w-3 h-3" />;
      case 'legendary': return <Crown className="w-3 h-3" />;
      case 'mythic': return <Crown className="w-3 h-3" />;
      default: return <Star className="w-3 h-3" />;
    }
  };

  const getCategoryIcon = (category: ItemTypeCategory) => {
    switch (category) {
      case 'weapon': return <Sword className="w-5 h-5" />;
      case 'armor': return <Shield className="w-5 h-5" />;
      case 'module': return <Zap className="w-5 h-5" />;
      case 'resource': return <Package className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const filteredInventory = inventory.filter(item => {
    if (filters.category !== 'all' && item.type !== filters.category) return false;
    if (filters.rarity !== 'all' && item.rarity !== filters.rarity) return false;
    if (filters.equipped !== 'all' && item.equipped !== filters.equipped) return false;
    if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  if (isLoading) {
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
              <Package className="w-6 h-6 text-primary-400 mr-3" />
              <h1 className="text-2xl font-bold text-white">
                Inventario
              </h1>
              <span className="ml-3 text-sm text-secondary-400">
                {inventory.length} items
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary-600 text-white' 
                    : 'text-secondary-400 hover:text-white hover:bg-secondary-800'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary-600 text-white' 
                    : 'text-secondary-400 hover:text-white hover:bg-secondary-800'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-secondary-900 rounded-lg border border-secondary-800 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Buscar items..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-secondary-800 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 bg-secondary-800 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Todas las categorías</option>
              <option value="weapon">Armas</option>
              <option value="armor">Armadura</option>
              <option value="module">Módulos</option>
              <option value="resource">Recursos</option>
            </select>

            {/* Rarity Filter */}
            <select
              value={filters.rarity}
              onChange={(e) => handleFilterChange('rarity', e.target.value)}
              className="w-full px-3 py-2 bg-secondary-800 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Todas las rarezas</option>
              <option value="common">Común</option>
              <option value="uncommon">Poco común</option>
              <option value="rare">Raro</option>
              <option value="epic">Épico</option>
              <option value="legendary">Legendario</option>
              <option value="mythic">Mítico</option>
            </select>

            {/* Equipped Filter */}
            <select
              value={filters.equipped}
              onChange={(e) => handleFilterChange('equipped', e.target.value === 'true' ? true : e.target.value === 'false' ? false : 'all')}
              className="w-full px-3 py-2 bg-secondary-800 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="true">Equipados</option>
              <option value="false">No equipados</option>
            </select>
          </div>
        </div>

        {/* Equipped Items */}
        {equippedItems.length > 0 && (
          <div className="bg-secondary-900 rounded-lg border border-secondary-800 p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Items Equipados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {equippedItems.map((item) => (
                <div
                  key={item.id}
                  className={`relative bg-secondary-800 rounded-lg border-2 p-4 cursor-pointer transition-all hover:scale-105 ${getRarityColor(item.rarity)}`}
                  onClick={() => handleUnequipItem(item.id)}
                >
                  <div className="flex flex-col items-center">
                    {getCategoryIcon(item.type)}
                    <span className="text-xs text-white mt-2 text-center">{item.name}</span>
                    <span className="text-xs text-secondary-400">x{item.quantity}</span>
                  </div>
                  <div className="absolute top-1 right-1">
                    {getRarityIcon(item.rarity)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory Grid/List */}
        <div className="bg-secondary-900 rounded-lg border border-secondary-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">
              Inventario ({filteredInventory.length} items)
            </h2>
            {selectedItems.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-secondary-400">
                  {selectedItems.length} seleccionados
                </span>
                <button
                  onClick={() => setSelectedItems([])}
                  className="text-sm text-primary-400 hover:text-primary-300"
                >
                  Limpiar selección
                </button>
              </div>
            )}
          </div>

          {filteredInventory.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-secondary-600 mx-auto mb-4" />
              <p className="text-secondary-400">No se encontraron items</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' 
              : 'space-y-4'
            }>
              {filteredInventory.map((item) => (
                <div
                  key={item.id}
                  className={`relative bg-secondary-800 rounded-lg border-2 p-4 cursor-pointer transition-all hover:scale-105 ${getRarityColor(item.rarity)} ${
                    selectedItems.includes(item.id) ? 'ring-2 ring-primary-500' : ''
                  }`}
                  onClick={() => toggleItemSelection(item.id)}
                >
                  <div className="flex flex-col items-center">
                    {getCategoryIcon(item.type)}
                    <span className="text-sm text-white mt-2 text-center font-medium">{item.name}</span>
                    <span className="text-xs text-secondary-400">x{item.quantity}</span>
                    {item.quality && (
                      <span className="text-xs text-warning-400">Calidad: {item.quality}%</span>
                    )}
                  </div>
                  <div className="absolute top-1 right-1">
                    {getRarityIcon(item.rarity)}
                  </div>
                  {item.equipped && (
                    <div className="absolute top-1 left-1">
                      <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="absolute bottom-1 right-1 opacity-0 hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      {!item.equipped && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEquipItem(item.id);
                          }}
                          className="p-1 bg-primary-600 rounded hover:bg-primary-700"
                        >
                          <Plus className="w-3 h-3 text-white" />
                        </button>
                      )}
                      {item.equipped && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnequipItem(item.id);
                          }}
                          className="p-1 bg-warning-600 rounded hover:bg-warning-700"
                        >
                          <EyeOff className="w-3 h-3 text-white" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(item.id);
                        }}
                        className="p-1 bg-danger-600 rounded hover:bg-danger-700"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
