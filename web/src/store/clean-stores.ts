// Clean stores implementation without duplications
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  User, 
  Resource, 
  InventoryItem, 
  CombatSession, 
  MarketplaceListing 
} from '@/types';

// Auth Store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          // Mock implementation
          const mockUser: User = {
            id: '1',
            username: 'testuser',
            email: email,
            level: 1,
            experience: 0,
            credits: 1000,
            statistics: {
              totalPlayTime: 0,
              battlesWon: 0,
              battlesLost: 0,
              resourcesCollected: 0,
              itemsCrafted: 0,
              transactionsCompleted: 0,
              achievementsUnlocked: 0,
              currentStreak: 0,
              longestStreak: 0,
            },
            preferences: {
              language: 'en',
              notifications: {
                combat: true,
                trade: true,
                alliance: true,
                system: true,
                marketing: false,
              },
              privacy: {
                profileVisible: true,
                showOnlineStatus: true,
                allowFriendRequests: true,
                showStatistics: true,
              },
              game: {
                autoSave: true,
                graphicsQuality: 'medium',
                soundVolume: 50,
                musicVolume: 50,
                cameraMode: 'follow',
              },
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
          };
          
          localStorage.setItem('access_token', 'mock_token');
          localStorage.setItem('user_data', JSON.stringify(mockUser));
          
          set({ 
            user: mockUser, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        set({ 
          user: null, 
          isAuthenticated: false 
        });
      },

      refreshToken: async () => {
        // Mock implementation
        console.log('Refreshing token...');
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Resource Store
interface ResourceState {
  resources: Resource[];
  isLoading: boolean;
  fetchResources: () => Promise<void>;
  updateResource: (resourceId: string, updates: Partial<Resource>) => void;
  transferResources: (transferData: { targetUserId: string; amount: number; resourceType: ResourceType }) => Promise<void>;
}

export const useResourceStore = create<ResourceState>((set, get) => ({
  resources: [],
  isLoading: false,

  fetchResources: async () => {
    set({ isLoading: true });
    try {
      // Mock implementation
      const mockResources: Resource[] = [
        {
          id: '1',
          userId: '1',
          type: 'credits',
          amount: 1000,
          maxAmount: 1000000,
          productionRate: 0,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: '2',
          userId: '1',
          type: 'metal',
          amount: 500,
          maxAmount: 10000,
          productionRate: 10,
          lastUpdated: new Date().toISOString(),
        },
      ];
      
      set({ 
        resources: mockResources, 
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateResource: (resourceId: string, updates: Partial<Resource>) => {
    set((state) => ({
      resources: state.resources.map(resource =>
        resource.id === resourceId ? { ...resource, ...updates } : resource
      )
    }));
  },

  transferResources: async (transferData: { targetUserId: string; amount: number; resourceType: ResourceType }) => {
    try {
      // Mock implementation
      const currentResource = get().resources.find(r => r.type === transferData.resourceType);
      if (currentResource && currentResource.amount >= transferData.amount) {
        set((state) => ({
          resources: state.resources.map(resource =>
            resource.type === transferData.resourceType
              ? { ...resource, amount: resource.amount - transferData.amount }
              : resource
          ),
        }));
      }
    } catch (error) {
      throw error;
    }
  },
}));

// Inventory Store
interface InventoryState {
  items: InventoryItem[];
  equippedItems: InventoryItem[];
  isLoading: boolean;
  fetchInventory: () => Promise<void>;
  equipItem: (itemId: string) => Promise<void>;
  unequipItem: (itemId: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateItem: (itemId: string, updates: Partial<InventoryItem>) => void;
  addItem: (item: InventoryItem) => void;
  setItems: (items: InventoryItem[]) => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  equippedItems: [],
  isLoading: false,

  fetchInventory: async () => {
    set({ isLoading: true });
    try {
      // Mock implementation
      const mockItems: InventoryItem[] = [];
      set({ 
        items: mockItems, 
        equippedItems: mockItems.filter(item => item.equipped),
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  equipItem: async (itemId: string) => {
    set((state) => ({
      items: state.items.map(item =>
        item.id === itemId ? { ...item, equipped: true } : item
      ),
      equippedItems: [
        ...state.equippedItems.filter(item => item.id !== itemId),
        ...state.items.filter(item => item.id === itemId).map(item => ({ ...item, equipped: true }))
      ]
    }));
  },

  unequipItem: async (itemId: string) => {
    set((state) => ({
      items: state.items.map(item =>
        item.id === itemId ? { ...item, equipped: false } : item
      ),
      equippedItems: state.equippedItems.filter(item => item.id !== itemId)
    }));
  },

  removeItem: async (itemId: string) => {
    set((state) => ({
      items: state.items.filter(item => item.id !== itemId),
      equippedItems: state.equippedItems.filter(item => item.id !== itemId)
    }));
  },

  updateItem: (itemId: string, updates: Partial<InventoryItem>) => {
    set((state) => ({
      items: state.items.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
      equippedItems: state.equippedItems.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    }));
  },

  addItem: (item: InventoryItem) => {
    set((state) => ({
      items: [...state.items, item],
      equippedItems: item.equipped ? [...state.equippedItems, item] : state.equippedItems
    }));
  },

  setItems: (items: InventoryItem[]) => {
    set({
      items,
      equippedItems: items.filter(item => item.equipped)
    });
  },
}));

// UI Store
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  activeSection: string;
  loading: {
    global: boolean;
    resources: boolean;
    inventory: boolean;
    combat: boolean;
    marketplace: boolean;
  };
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setLanguage: (language: string) => void;
  setActiveSection: (section: string) => void;
  setLoading: (key: string, loading: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'dark',
      language: 'en',
      activeSection: 'dashboard',
      loading: {
        global: false,
        resources: false,
        inventory: false,
        combat: false,
        marketplace: false,
      },

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setTheme: (theme: 'light' | 'dark' | 'auto') => set({ theme }),
      
      setLanguage: (language: string) => set({ language }),
      
      setActiveSection: (section: string) => set({ activeSection: section }),
      
      setLoading: (key: string, loading: boolean) => 
        set((state) => ({
          loading: { ...state.loading, [key]: loading }
        })),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
        language: state.language,
      }),
    }
  )
);

// Combat Store
interface CombatState {
  combatSessions: CombatSession[];
  activeCombat: CombatSession | null;
  isLoading: boolean;
  fetchCombatSessions: () => Promise<void>;
  updateCombatSession: (sessionId: string, updates: Partial<CombatSession>) => void;
  setActiveCombat: (session: CombatSession | null) => void;
}

export const useCombatStore = create<CombatState>((set, get) => ({
  combatSessions: [],
  activeCombat: null,
  isLoading: false,

  fetchCombatSessions: async () => {
    set({ isLoading: true });
    try {
      const mockSessions: CombatSession[] = [];
      set({ 
        combatSessions: mockSessions, 
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateCombatSession: (sessionId: string, updates: Partial<CombatSession>) => {
    set((state) => ({
      combatSessions: state.combatSessions.map(session =>
        session.id === sessionId ? { ...session, ...updates } : session
      ),
      activeCombat: state.activeCombat?.id === sessionId 
        ? { ...state.activeCombat, ...updates } 
        : state.activeCombat
    }));
  },

  setActiveCombat: (session: CombatSession | null) => {
    set({ activeCombat: session });
  },
}));

// Marketplace Store
interface MarketplaceState {
  listings: MarketplaceListing[];
  userListings: MarketplaceListing[];
  userOffers: any[];
  isLoading: boolean;
  fetchListings: () => Promise<void>;
  fetchUserListings: () => Promise<void>;
  updateListing: (listingId: string, updates: Partial<MarketplaceListing>) => void;
  setListings: (listings: MarketplaceListing[]) => void;
  setUserListings: (listings: MarketplaceListing[]) => void;
}

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  listings: [],
  userListings: [],
  userOffers: [],
  isLoading: false,

  fetchListings: async () => {
    set({ isLoading: true });
    try {
      const mockListings: MarketplaceListing[] = [];
      set({ 
        listings: mockListings, 
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchUserListings: async () => {
    set({ isLoading: true });
    try {
      const mockUserListings: MarketplaceListing[] = [];
      set({ 
        userListings: mockUserListings, 
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateListing: (listingId: string, updates: Partial<MarketplaceListing>) => {
    set((state) => ({
      listings: state.listings.map(listing =>
        listing.id === listingId ? { ...listing, ...updates } : listing
      ),
      userListings: state.userListings.map(listing =>
        listing.id === listingId ? { ...listing, ...updates } : listing
      )
    }));
  },

  setListings: (listings: MarketplaceListing[]) => {
    set({ listings });
  },

  setUserListings: (listings: MarketplaceListing[]) => {
    set({ userListings: listings });
  },
}));

// Combat Store
interface CombatState {
  combatSessions: CombatSession[];
  activeCombat: CombatSession | null;
  isLoading: boolean;
  fetchCombatSessions: () => Promise<void>;
  createCombatSession: (opponentId: string) => Promise<void>;
  joinCombatSession: (sessionId: string) => Promise<void>;
  leaveCombatSession: (sessionId: string) => Promise<void>;
  performCombatAction: (sessionId: string, action: any) => Promise<void>;
  setActiveCombat: (combat: CombatSession | null) => void;
}

export const useCombatStore = create<CombatState>()(
  persist(
    (set, get) => ({
      combatSessions: [],
      activeCombat: null,
      isLoading: false,

      fetchCombatSessions: async () => {
        set({ isLoading: true });
        try {
          // Mock implementation
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      createCombatSession: async (opponentId: string) => {
        try {
          // Mock implementation
          const newSession: CombatSession = {
            id: `combat_${Date.now()}`,
            participants: [],
            status: 'waiting',
            location: {
              systemId: 'alpha_system',
              coordinates: { x: 0, y: 0, z: 0 },
            },
            startTime: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set((state) => ({
            combatSessions: [...state.combatSessions, newSession],
          }));
        } catch (error) {
          throw error;
        }
      },

      joinCombatSession: async (sessionId: string) => {
        try {
          // Mock implementation
          set((state) => ({
            combatSessions: state.combatSessions.map(session =>
              session.id === sessionId
                ? { ...session, status: 'active' as const }
                : session
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      leaveCombatSession: async (sessionId: string) => {
        try {
          // Mock implementation
          set((state) => ({
            combatSessions: state.combatSessions.filter(session => session.id !== sessionId),
            activeCombat: state.activeCombat?.id === sessionId ? null : state.activeCombat,
          }));
        } catch (error) {
          throw error;
        }
      },

      performCombatAction: async (sessionId: string, action: any) => {
        try {
          // Mock implementation
          console.log('Performing action:', sessionId, action);
        } catch (error) {
          throw error;
        }
      },

      setActiveCombat: (combat: CombatSession | null) => {
        set({ activeCombat: combat });
      },
    }),
    {
      name: 'combat-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
