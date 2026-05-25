'use client';

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useAuthStore } from '@/store';
import { webSocketService } from '@/services/websocket';

interface ProvidersProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && isAuthenticated && user) {
      // Initialize WebSocket connection when user is authenticated
      webSocketService.connect();
      
      // Setup WebSocket event listeners
      const handleResourceUpdate = (event: any) => {
        console.log('Resource update received in providers:', event);
        // Update resource store
        const { useResourceStore } = require('@/store');
        useResourceStore.getState().updateResource(
          event.data.changes[0].type,
          { amount: event.data.changes[0].current }
        );
      };

      const handleInventoryUpdate = (event: any) => {
        console.log('Inventory update received in providers:', event);
        // Refresh inventory
        const { useInventoryStore } = require('@/store');
        useInventoryStore.getState().fetchInventory();
      };

      const handleCombatInitiated = (event: any) => {
        console.log('Combat initiated received in providers:', event);
        // Update combat store
        const { useCombatStore } = require('@/store');
        useCombatStore.getState().fetchCombatSessions();
      };

      const handleCombatAction = (event: any) => {
        console.log('Combat action received in providers:', event);
        // Update active combat
        const { useCombatStore } = require('@/store');
        if (event.data.combatId) {
          useCombatStore.getState().updateCombatSession(
            event.data.combatId,
            { lastAction: event.data.action }
          );
        }
      };

      const handleMarketplaceUpdate = (event: any) => {
        console.log('Marketplace update received in providers:', event);
        // Refresh marketplace
        const { useMarketplaceStore } = require('@/store');
        useMarketplaceStore.getState().fetchListings();
      };

      // Register event listeners
      webSocketService.on('resource_update', handleResourceUpdate);
      webSocketService.on('inventory_update', handleInventoryUpdate);
      webSocketService.on('combat_initiated', handleCombatInitiated);
      webSocketService.on('combat_action', handleCombatAction);
      webSocketService.on('marketplace_update', handleMarketplaceUpdate);

      // Start heartbeat
      webSocketService.startHeartbeat();

      // Cleanup on unmount
      return () => {
        webSocketService.off('resource_update', handleResourceUpdate);
        webSocketService.off('inventory_update', handleInventoryUpdate);
        webSocketService.off('combat_initiated', handleCombatInitiated);
        webSocketService.off('combat_action', handleCombatAction);
        webSocketService.off('marketplace_update', handleMarketplaceUpdate);
        webSocketService.stopHeartbeat();
      };
    }
  }, [isClient, isAuthenticated, user]);

  useEffect(() => {
    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        webSocketService.pauseConnection();
      } else {
        webSocketService.resumeConnection();
      }
    };

    if (isClient) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      if (isClient) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [isClient]);

  useEffect(() => {
    // Handle connection errors
    const handleConnectionError = (error: any) => {
      console.error('WebSocket connection error:', error);
      
      // If it's an authentication error, logout user
      if (error.message?.includes('Authentication failed')) {
        const { useAuthStore } = require('@/store');
        useAuthStore.getState().logout();
      }
    };

    const handleReconnectionFailed = () => {
      console.error('WebSocket reconnection failed');
      // Could show a notification to user
    };

    webSocketService.on('connection_error', handleConnectionError);
    webSocketService.on('reconnection_failed', handleReconnectionFailed);

    return () => {
      webSocketService.off('connection_error', handleConnectionError);
      webSocketService.off('reconnection_failed', handleReconnectionFailed);
    };
  }, []);

  if (!isClient) {
    // Return loading state for server-side rendering
    return (
      <div className="min-h-screen bg-secondary-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
