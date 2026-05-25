import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  User, 
  Resource, 
  InventoryItem, 
  Ship, 
  CombatSession, 
  MarketplaceListing, 
  Transaction, 
  Alliance,
  NotificationItem 
} from '@/types';

// Auth Store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
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
          const { apiService } = await import('@/services/api');
          const response = await apiService.login(email, password, 'web');
          
          if (response.success && response.data) {
            const { user, accessToken, refreshToken, sessionId } = response.data as any;
            
            // Store tokens
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);
            localStorage.setItem('session_id', sessionId);
            localStorage.setItem('user_data', JSON.stringify(user));
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false 
            });

            // Connect WebSocket
            const { webSocketService } = await import('@/services/websocket');
            await webSocketService.connect();
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData: any) => {
        set({ isLoading: true });
        try {
          const { apiService } = await import('@/services/api');
          const response = await apiService.register(userData);
          
          if (response.success && response.data) {
            const { user, accessToken, refreshToken, sessionId } = response.data as any;
            
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);
            localStorage.setItem('session_id', sessionId);
            localStorage.setItem('user_data', JSON.stringify(user));
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false 
            });

            // Connect WebSocket
            const { webSocketService } = await import('@/services/websocket');
            await webSocketService.connect();
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          const { apiService } = await import('@/services/api');
          await apiService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear local storage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('session_id');
          localStorage.removeItem('user_data');
          
          // Disconnect WebSocket
          const { webSocketService } = require('@/services/websocket');
          webSocketService.disconnect();
          
          set({ 
            user: null, 
            isAuthenticated: false 
          });
        }
      },

      refreshToken: async () => {
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const { apiService } = await import('@/services/api');
          const response = await apiService.refreshToken(refreshToken);
          
          if (response.success && response.data) {
            const { accessToken, refreshToken: newRefreshToken } = response.data as any;
            
            localStorage.setItem('access_token', accessToken);
            if (newRefreshToken) {
              localStorage.setItem('refresh_token', newRefreshToken);
            }
          }
        } catch (error) {
          // Refresh failed, logout user
          get().logout();
          throw error;
        }
      },

      updateProfile: async (updates: any) => {
        set({ isLoading: true });
        try {
          const { apiService } = await import('@/services/api');
          const response = await apiService.updateUserProfile(updates);
          
          if (response.success && response.data) {
            const updatedUser = { ...get().user, ...response.data } as User;
            set({ 
              user: updatedUser, 
              isLoading: false 
            });
            
            // Update local storage
            localStorage.setItem('user_data', JSON.stringify(updatedUser));
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
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
  updateProduction: (deltaTime: number) => Promise<void>;
  transferResources: (transferData: any) => Promise<void>;
  updateResource: (resourceId: string, updates: Partial<Resource>) => void;
}

export const useResourceStore = create<ResourceState>((set, get) => ({
  resources: [],
  isLoading: false,

  fetchResources: async () => {
    set({ isLoading: true });
    try {
      const { apiService } = await import('@/services/api');
      const response = await apiService.getUserResources();
      
      if (response.success && response.data) {
        set({ 
          resources: response.data as Resource[], 
          isLoading: false 
        });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateProduction: async (deltaTime: number) => {
    try {
      const { apiService } = await import('@/services/api');
      const response = await apiService.updateProduction(deltaTime);
      
      if (response.success && response.data) {
        set({ resources: response.data as Resource[] });
      }
    } catch (error) {
      throw error;
    }
  },

  transferResources: async (transferData: any) => {
    try {
      const { apiService } = await import('@/services/api');
      const response = await apiService.transferResources(transferData);
      
      if (response.success) {
        // Refresh resources
        get().fetchResources();
      }
    } catch (error) {
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
