'use client';

import React, { useEffect, useState } from 'react';
import { useMarketplaceStore, useInventoryStore, useAuthStore } from '@/store';
import { MarketplaceListing, InventoryItem, MarketplaceStatus } from '@/types';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  Package,
  Star,
  Gem,
  Crown,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface MarketplaceFilters {
  category: string;
  rarity: string;
  minPrice: number;
  maxPrice: number;
  search: string;
  status: MarketplaceStatus;
}

export const MarketplaceManager: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    listings, 
    userListings, 
    isLoading, 
    fetchListings, 
    fetchUserListings, 
    createListing, 
    buyListing, 
    makeOffer, 
    cancelListing 
  } = useMarketplaceStore();
  
  const { inventory, fetchInventory } = useInventoryStore();
  
  const [filters, setFilters] = useState<MarketplaceFilters>({
    category: 'all',
    rarity: 'all',
    minPrice: 0,
    maxPrice: 1000000,
    search: '',
    status: 'active'
  });
  
  const [activeTab, setActiveTab] = useState<'browse' | 'my-listings' | 'create'>('browse');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (activeTab === 'browse') {
          await fetchListings(filters);
        } else if (activeTab === 'my-listings') {
          await fetchUserListings();
        }
        if (activeTab === 'create') {
          await fetchInventory({ category: 'weapon,armor,module' });
        }
      } catch (error) {
        console.error('Error loading marketplace data:', error);
        toast.error('Error al cargar datos del marketplace');
      }
    };

    loadData();
  }, [activeTab, filters, fetchListings, fetchUserListings, fetchInventory]);

  const handleFilterChange = (key: keyof MarketplaceFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCreateListing = async (listingData: any) => {
    try {
      await createListing(listingData);
      toast.success('Listado creado correctamente');
      setShowCreateForm(false);
      setActiveTab('my-listings');
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error('Error al crear el listado');
    }
  };

  const handleBuyListing = async (listingId: string, offerAmount?: number) => {
    try {
      await buyListing(listingId, offerAmount);
      toast.success('Compra realizada correctamente');
      await fetchListings(filters);
    } catch (error) {
      console.error('Error buying listing:', error);
      toast.error('Error al realizar la compra');
    }
  };

  const handleMakeOffer = async (listingId: string, offerData: any) => {
    try {
      await makeOffer(listingId, offerData);
      toast.success('Oferta enviada correctamente');
    } catch (error) {
      console.error('Error making offer:', error);
      toast.error('Error al enviar la oferta');
    }
  };

  const handleCancelListing = async (listingId: string) => {
    if (!confirm('¿Estás seguro de que quieres cancelar este listado?')) return;
    
    try {
      await cancelListing(listingId);
      toast.success('Listado cancelado correctamente');
      await fetchUserListings();
    } catch (error) {
      console.error('Error canceling listing:', error);
      toast.error('Error al cancelar el listado');
    }
  };

  const getStatusColor = (status: MarketplaceStatus) => {
    switch (status) {
      case 'active': return 'text-success-400 bg-success-600/20';
      case 'sold': return 'text-primary-400 bg-primary-600/20';
      case 'expired': return 'text-warning-400 bg-warning-600/20';
      case 'cancelled': return 'text-danger-400 bg-danger-600/20';
      default: return 'text-secondary-400 bg-secondary-600/20';
    }
  };

  const getStatusIcon = (status: MarketplaceStatus) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4" />;
      case 'sold': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES').format(price);
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expirado';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

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
              <ShoppingCart className="w-6 h-6 text-primary-400 mr-3" />
              <h1 className="text-2xl font-bold text-white">
                Marketplace
              </h1>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Listado
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          {[
            { id: 'browse', label: 'Explorar', icon: <Search className="w-4 h-4" /> },
            { id: 'my-listings', label: 'Mis Listados', icon: <Package className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'text-secondary-400 hover:text-white hover:bg-secondary-800'
              }`}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Filters (only for browse tab) */}
        {activeTab === 'browse' && (
          <div className="bg-secondary-900 rounded-lg border border-secondary-800 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 bg-secondary-800 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Todas las categorías</option>
                <option value="weapon">Armas</option>
                <option value="armor">Armadura</option>
                <option value="module">Módulos</option>
              </select>

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
              </select>

              <input
                type="number"
                placeholder="Precio mínimo"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-secondary-800 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />

              <input
                type="number"
                placeholder="Precio máximo"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value) || 1000000)}
                className="w-full px-3 py-2 bg-secondary-800 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-secondary-900 rounded-lg border border-secondary-800 p-6">
          {activeTab === 'browse' && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-6">
                Listados Disponibles ({listings.length})
              </h2>
              {listings.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-secondary-600 mx-auto mb-4" />
                  <p className="text-secondary-400">No hay listados disponibles</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <div key={listing.id} className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-white font-medium">{listing.itemId}</h3>
                          <p className="text-secondary-400 text-sm">Cantidad: {listing.quantity}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(listing.status)}`}>
                          {getStatusIcon(listing.status)}
                          <span className="ml-1">{listing.status}</span>
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary-400">
                            {formatPrice(listing.price)}
                          </span>
                          <span className="text-sm text-secondary-400">
                            {listing.currency}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center text-sm text-secondary-400">
                          <Clock className="w-4 h-4 mr-1" />
                          {getTimeRemaining(listing.expiresAt)}
                        </div>
                        <div className="flex items-center text-sm text-secondary-400 mt-1">
                          <Package className="w-4 h-4 mr-1" />
                          {listing.views} vistas
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleBuyListing(listing.id)}
                          className="flex-1 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm transition-colors"
                        >
                          Comprar
                        </button>
                        <button
                          onClick={() => setSelectedListing(listing)}
                          className="px-3 py-2 bg-secondary-700 hover:bg-secondary-600 text-white rounded-lg text-sm transition-colors"
                        >
                          Ofertar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'my-listings' && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-6">
                Mis Listados ({userListings.length})
              </h2>
              {userListings.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-secondary-600 mx-auto mb-4" />
                  <p className="text-secondary-400">No tienes listados activos</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    Crear Primer Listado
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userListings.map((listing) => (
                    <div key={listing.id} className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-white font-medium">{listing.itemId}</h3>
                          <p className="text-secondary-400 text-sm">Cantidad: {listing.quantity}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(listing.status)}`}>
                          {getStatusIcon(listing.status)}
                          <span className="ml-1">{listing.status}</span>
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary-400">
                            {formatPrice(listing.price)}
                          </span>
                          <span className="text-sm text-secondary-400">
                            {listing.currency}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center text-sm text-secondary-400">
                          <Clock className="w-4 h-4 mr-1" />
                          {getTimeRemaining(listing.expiresAt)}
                        </div>
                        <div className="flex items-center text-sm text-secondary-400 mt-1">
                          <Package className="w-4 h-4 mr-1" />
                          {listing.views} vistas
                        </div>
                      </div>

                      {listing.status === 'active' && (
                        <button
                          onClick={() => handleCancelListing(listing.id)}
                          className="w-full px-3 py-2 bg-danger-600 hover:bg-danger-700 text-white rounded-lg text-sm transition-colors"
                        >
                          Cancelar Listado
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Listing Modal */}
      {showCreateForm && (
        <CreateListingModal
          inventory={inventory}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateListing}
        />
      )}

      {/* Offer Modal */}
      {selectedListing && (
        <OfferModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onSubmit={(offerData) => handleMakeOffer(selectedListing.id, offerData)}
        />
      )}
    </div>
  );
};

// Create Listing Modal Component
const CreateListingModal: React.FC<{
  inventory: InventoryItem[];
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ inventory, onClose, onSubmit }) => {
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [currency, setCurrency] = useState('credits');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      itemId: selectedItem,
      quantity,
      price,
      currency,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-secondary-900 rounded-xl border border-secondary-800 shadow-2xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Crear Nuevo Listado</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Seleccionar Item
              </label>
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="w-full px-3 py-2 bg-secondary-800 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Selecciona un item</option>
                {inventory.map((item) => (
                  <option key={item.id} value={item.itemId}>
                    {item.name} (x{item.quantity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-secondary-800 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Precio
              </label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-secondary-800 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Moneda
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-secondary-800 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="credits">Créditos</option>
                <option value="metal">Metal</option>
                <option value="plasma">Plasma</option>
                <option value="energy">Energía</option>
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-secondary-700 hover:bg-secondary-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Crear Listado
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Offer Modal Component
const OfferModal: React.FC<{
  listing: MarketplaceListing;
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ listing, onClose, onSubmit }) => {
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      amount,
      currency: listing.currency,
      message,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-secondary-900 rounded-xl border border-secondary-800 shadow-2xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Hacer Oferta</h2>
          <div className="mb-4">
            <p className="text-secondary-300">Item: {listing.itemId}</p>
            <p className="text-secondary-300">Cantidad: {listing.quantity}</p>
            <p className="text-secondary-300">Precio actual: {listing.price} {listing.currency}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Tu oferta ({listing.currency})
              </label>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-secondary-800 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Mensaje (opcional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-secondary-800 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Añade un mensaje para el vendedor..."
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-secondary-700 hover:bg-secondary-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Enviar Oferta
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
