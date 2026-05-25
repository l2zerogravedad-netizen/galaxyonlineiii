import { io, Socket } from 'socket.io-client';
import { apiService } from './api';
import { 
  WebSocketEvent, 
  ResourceUpdateEvent, 
  InventoryUpdateEvent, 
  CombatInitiatedEvent, 
  CombatActionEvent,
  UserOnlineEvent,
  UserOfflineEvent,
  MarketplaceUpdateEvent
} from '@/types';

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (typeof window !== 'undefined') {
      // Handle page visibility changes
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pauseConnection();
        } else {
          this.resumeConnection();
        }
      });

      // Handle page unload
      window.addEventListener('beforeunload', () => {
        this.disconnect();
      });
    }
  }

  async connect(): Promise<void> {
    if (this.isConnected || this.socket?.connected) {
      console.log('🔌 WebSocket already connected');
      return;
    }

    try {
      const token = this.getAuthToken();
      if (!token) {
        console.warn('⚠️ No auth token available for WebSocket connection');
        return;
      }

      const wsUrl = apiService.getWebSocketUrl();
      console.log('🔌 Connecting to WebSocket:', wsUrl);

      this.socket = io(wsUrl, {
        auth: {
          token,
          sessionId: this.getSessionId(),
          clientType: 'web'
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: false, // We'll handle reconnection manually
      });

      this.setupSocketEvents();
      
    } catch (error) {
      console.error('❌ WebSocket connection error:', error);
      this.handleConnectionError(error);
    }
  }

  private setupSocketEvents(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected', { socketId: this.socket?.id });
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnected', { reason });
      
      // Attempt reconnection if not intentional
      if (reason !== 'io client disconnect') {
        this.attemptReconnection();
      }
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('❌ WebSocket connection error:', error);
      this.handleConnectionError(error);
    });

    // Game events
    this.socket.on('resource_update', (event: ResourceUpdateEvent) => {
      console.log('💰 Resource update received:', event);
      this.emit('resource_update', event);
    });

    this.socket.on('inventory_update', (event: InventoryUpdateEvent) => {
      console.log('📦 Inventory update received:', event);
      this.emit('inventory_update', event);
    });

    this.socket.on('combat_initiated', (event: CombatInitiatedEvent) => {
      console.log('⚔️ Combat initiated:', event);
      this.emit('combat_initiated', event);
    });

    this.socket.on('combat_action', (event: CombatActionEvent) => {
      console.log('⚔️ Combat action:', event);
      this.emit('combat_action', event);
    });

    this.socket.on('user_online', (event: UserOnlineEvent) => {
      console.log('👤 User online:', event);
      this.emit('user_online', event);
    });

    this.socket.on('user_offline', (event: UserOfflineEvent) => {
      console.log('👤 User offline:', event);
      this.emit('user_offline', event);
    });

    this.socket.on('marketplace_update', (event: MarketplaceUpdateEvent) => {
      console.log('🛒 Marketplace update:', event);
      this.emit('marketplace_update', event);
    });

    // System events
    this.socket.on('ping', (data: any) => {
      console.log('🏓 Ping received:', data);
      this.socket?.emit('pong', { timestamp: new Date().toISOString() });
    });

    this.socket.on('heartbeat_response', (data: any) => {
      console.log('💓 Heartbeat response:', data);
    });

    this.socket.on('connected', (data: any) => {
      console.log('🔌 Connected confirmation:', data);
    });

    // Error events
    this.socket.on('error', (error: any) => {
      console.error('❌ WebSocket error:', error);
      this.emit('error', error);
    });
  }

  private handleConnectionError(error: any): void {
    this.isConnected = false;
    this.emit('connection_error', error);
    
    // Check if it's an authentication error
    if (error.message?.includes('Authentication failed') || error.message?.includes('Invalid session')) {
      console.warn('🔐 Authentication error, clearing tokens');
      this.clearAuthTokens();
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } else {
      this.attemptReconnection();
    }
  }

  private attemptReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      this.emit('reconnection_failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  public pauseConnection(): void {
    if (this.socket && this.isConnected) {
      console.log('⏸️ Pausing WebSocket connection');
      this.socket.disconnect();
    }
  }

  public resumeConnection(): void {
    if (!this.isConnected) {
      console.log('▶️ Resuming WebSocket connection');
      this.connect();
    }
  }

  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting WebSocket');
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  // Event management
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Room management
  joinRoom(room: string): void {
    if (this.socket && this.isConnected) {
      console.log(`🏠 Joining room: ${room}`);
      this.socket.emit('join_room', room);
    }
  }

  leaveRoom(room: string): void {
    if (this.socket && this.isConnected) {
      console.log(`🚪 Leaving room: ${room}`);
      this.socket.emit('leave_room', room);
    }
  }

  // Combat room management
  joinCombatRoom(combatId: string): void {
    this.joinRoom(`combat:${combatId}`);
  }

  leaveCombatRoom(combatId: string): void {
    this.leaveRoom(`combat:${combatId}`);
  }

  // User status
  updateUserStatus(status: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('user_status_update', status);
    }
  }

  // Utility methods
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private getSessionId(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('session_id');
    }
    return null;
  }

  private clearAuthTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('session_id');
      localStorage.removeItem('user_data');
    }
  }

  // Getters
  get connected(): boolean {
    return this.isConnected;
  }

  get socketId(): string | null {
    return this.socket?.id || null;
  }

  // Heartbeat
  startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.isConnected) {
        this.socket.emit('heartbeat');
      }
    }, 30000); // Every 30 seconds
  }

  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private heartbeatInterval: NodeJS.Timeout | null = null;

  // Statistics
  getConnectionStats(): {
    connected: boolean;
    socketId: string | null;
    reconnectAttempts: number;
    eventListenersCount: number;
  } {
    return {
      connected: this.isConnected,
      socketId: this.socketId,
      reconnectAttempts: this.reconnectAttempts,
      eventListenersCount: Array.from(this.eventListeners.values())
        .reduce((total, listeners) => total + listeners.length, 0),
    };
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService;
