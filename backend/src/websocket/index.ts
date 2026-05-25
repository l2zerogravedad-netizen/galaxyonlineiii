import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '@/utils/logger';
import { executeSingleRowQuery, executeUpdateQuery } from '@/database/connection';
import { ResourceUpdateEvent, InventoryUpdateEvent, CombatInitiatedEvent, CombatActionEvent, MarketplaceUpdateEvent, UserOnlineEvent, UserOfflineEvent } from '@/types';

interface AuthenticatedSocket extends Socket {
  userId: string;
  sessionId: string;
  clientType: string;
  username: string;
}

interface SocketUser {
  socketId: string;
  userId: string;
  sessionId: string;
  clientType: string;
  username: string;
  connectedAt: Date;
  lastActivity: Date;
}

class WebSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, SocketUser> = new Map();
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  constructor(io: SocketIOServer) {
    this.io = io;
    this.initializeMiddleware();
    this.initializeEventHandlers();
    this.initializeHeartbeat();
  }

  private initializeMiddleware(): void {
    // Authentication middleware
    this.io.use(async (socket: any, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'fallback-secret') as { userId: string };
        
        // Verify session exists and is active
        const session = await this.verifySession(decoded.userId, socket.handshake.auth.sessionId);
        if (!session) {
          return next(new Error('Invalid session'));
        }

        // Get user info
        const user = await this.getUserInfo(decoded.userId);
        if (!user) {
          return next(new Error('User not found'));
        }

        // Attach user info to socket
        socket.userId = decoded.userId;
        socket.sessionId = socket.handshake.auth.sessionId;
        socket.clientType = socket.handshake.auth.clientType || 'unknown';
        socket.username = user.username;

        next();
      } catch (error) {
        logger.error('WebSocket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private initializeEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: AuthenticatedSocket): void {
    logger.info('User connected via WebSocket:', {
      userId: socket.userId,
      username: socket.username,
      clientType: socket.clientType,
      socketId: socket.id
    });

    // Register user
    this.registerUser(socket);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle events
    socket.on('disconnect', () => this.handleDisconnection(socket));
    socket.on('heartbeat', () => this.handleHeartbeat(socket));
    socket.on('join_room', (room) => this.handleJoinRoom(socket, room));
    socket.on('leave_room', (room) => this.handleLeaveRoom(socket, room));
    socket.on('user_status_update', (status) => this.handleUserStatusUpdate(socket, status));

    // Send initial connection event
    socket.emit('connected', {
      timestamp: new Date().toISOString(),
      socketId: socket.id,
      userId: socket.userId
    });

    // Broadcast user online status
    this.broadcastUserOnline(socket);
  }

  private handleDisconnection(socket: AuthenticatedSocket): void {
    logger.info('User disconnected from WebSocket:', {
      userId: socket.userId,
      username: socket.username,
      socketId: socket.id
    });

    // Unregister user
    this.unregisterUser(socket);

    // Broadcast user offline status if no more connections
    if (!this.userSockets.has(socket.userId) || this.userSockets.get(socket.userId)!.size === 0) {
      this.broadcastUserOffline(socket);
    }
  }

  private handleHeartbeat(socket: AuthenticatedSocket): void {
    const user = this.connectedUsers.get(socket.id);
    if (user) {
      user.lastActivity = new Date();
      socket.emit('heartbeat_response', { timestamp: new Date().toISOString() });
    }
  }

  private handleJoinRoom(socket: AuthenticatedSocket, room: string): void {
    socket.join(room);
    logger.debug('User joined room:', {
      userId: socket.userId,
      room,
      socketId: socket.id
    });
  }

  private handleLeaveRoom(socket: AuthenticatedSocket, room: string): void {
    socket.leave(room);
    logger.debug('User left room:', {
      userId: socket.userId,
      room,
      socketId: socket.id
    });
  }

  private handleUserStatusUpdate(socket: AuthenticatedSocket, status: any): void {
    // Update user status in database
    this.updateUserStatus(socket.userId, status);

    // Broadcast status to user's friends/alliance members
    this.broadcastToUserFriends(socket.userId, 'user_status_update', {
      userId: socket.userId,
      username: socket.username,
      status,
      timestamp: new Date().toISOString()
    });
  }

  private registerUser(socket: AuthenticatedSocket): void {
    const user: SocketUser = {
      socketId: socket.id,
      userId: socket.userId,
      sessionId: socket.sessionId,
      clientType: socket.clientType,
      username: socket.username,
      connectedAt: new Date(),
      lastActivity: new Date()
    };

    this.connectedUsers.set(socket.id, user);

    if (!this.userSockets.has(socket.userId)) {
      this.userSockets.set(socket.userId, new Set());
    }
    this.userSockets.get(socket.userId)!.add(socket.id);

    // Update user's last active timestamp
    this.updateUserLastActive(socket.userId);
  }

  private unregisterUser(socket: AuthenticatedSocket): void {
    this.connectedUsers.delete(socket.id);

    const userSockets = this.userSockets.get(socket.userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        this.userSockets.delete(socket.userId);
      }
    }
  }

  // Public methods for broadcasting events
  public broadcastResourceUpdate(userId: string, resources: any[], changes: any[]): void {
    const event: ResourceUpdateEvent = {
      type: 'resource:update',
      data: {
        userId,
        resources,
        changes
      },
      timestamp: new Date(),
      userId
    };

    this.io.to(`user:${userId}`).emit('resource_update', event);
    logger.debug('Resource update broadcasted:', { userId, changes: changes.length });
  }

  public broadcastInventoryUpdate(userId: string, inventory: any[], changes: any[]): void {
    const event: InventoryUpdateEvent = {
      type: 'inventory:update',
      data: {
        userId,
        inventory,
        changes
      },
      timestamp: new Date(),
      userId
    };

    this.io.to(`user:${userId}`).emit('inventory_update', event);
    logger.debug('Inventory update broadcasted:', { userId, changes: changes.length });
  }

  public broadcastCombatInitiated(combatId: string, participants: string[], location: any, battleType: string): void {
    const event: CombatInitiatedEvent = {
      type: 'combat:initiated',
      data: {
        combatId,
        participants,
        location,
        battleType
      },
      timestamp: new Date()
    };

    // Send to all participants
    participants.forEach(participantId => {
      this.io.to(`user:${participantId}`).emit('combat_initiated', event);
    });

    logger.debug('Combat initiated broadcasted:', { combatId, participants: participants.length });
  }

  public broadcastCombatAction(combatId: string, actorId: string, action: any, result: any, turnTime: number): void {
    const event: CombatActionEvent = {
      type: 'combat:action',
      data: {
        combatId,
        actorId,
        action,
        result,
        turnTime
      },
      timestamp: new Date(),
      userId: actorId
    };

    // Send to combat room
    this.io.to(`combat:${combatId}`).emit('combat_action', event);

    logger.debug('Combat action broadcasted:', { combatId, actorId });
  }

  public broadcastMarketplaceUpdate(action: string, listing: any): void {
    const event: MarketplaceUpdateEvent = {
      type: 'marketplace:update',
      data: {
        action,
        listing
      },
      timestamp: new Date()
    };

    // Broadcast to all connected users (marketplace is global)
    this.io.emit('marketplace_update', event);

    logger.debug('Marketplace update broadcasted:', { action, listingId: listing.id });
  }

  public broadcastUserOnline(socket: AuthenticatedSocket): void {
    const event: UserOnlineEvent = {
      type: 'user:online',
      data: {
        userId: socket.userId,
        username: socket.username,
        status: 'online',
        location: 'online'
      },
      timestamp: new Date(),
      userId: socket.userId
    };

    // Broadcast to friends and alliance members
    this.broadcastToUserFriends(socket.userId, 'user_online', event.data);

    logger.debug('User online status broadcasted:', { userId: socket.userId });
  }

  public broadcastUserOffline(socket: AuthenticatedSocket): void {
    const event: UserOfflineEvent = {
      type: 'user:offline',
      data: {
        userId: socket.userId,
        username: socket.username,
        reason: 'disconnect'
      },
      timestamp: new Date(),
      userId: socket.userId
    };

    // Broadcast to friends and alliance members
    this.broadcastToUserFriends(socket.userId, 'user_offline', event.data);

    logger.debug('User offline status broadcasted:', { userId: socket.userId });
  }

  public joinCombatRoom(combatId: string, userId: string): void {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      userSockets.forEach(socketId => {
        this.io.sockets.sockets.get(socketId)?.join(`combat:${combatId}`);
      });
    }
  }

  public leaveCombatRoom(combatId: string, userId: string): void {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      userSockets.forEach(socketId => {
        this.io.sockets.sockets.get(socketId)?.leave(`combat:${combatId}`);
      });
    }
  }

  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public getConnectedUsersList(): SocketUser[] {
    return Array.from(this.connectedUsers.values());
  }

  public isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }

  public getUserSockets(userId: string): string[] {
    return Array.from(this.userSockets.get(userId) || []);
  }

  // Private helper methods
  private async verifySession(userId: string, sessionId: string): Promise<any> {
    return await executeSingleRowQuery(
      'SELECT * FROM sessions WHERE user_id = $1 AND id = $2 AND is_active = TRUE AND expires_at > NOW()',
      [userId, sessionId]
    );
  }

  private async getUserInfo(userId: string): Promise<any> {
    return await executeSingleRowQuery(
      'SELECT id, username FROM users WHERE id = $1 AND is_deleted = FALSE',
      [userId]
    );
  }

  private async updateUserLastActive(userId: string): Promise<void> {
    await executeUpdateQuery(
      'users',
      { last_active_at: new Date() },
      'id = $1',
      [userId]
    );
  }

  private async updateUserStatus(userId: string, status: any): Promise<void> {
    // This would update user status in database
    // For now, we'll just update last active time
    await this.updateUserLastActive(userId);
  }

  private broadcastToUserFriends(userId: string, event: string, data: any): void {
    // This would get user's friends and broadcast to them
    // For now, we'll broadcast to a general room
    this.io.to('friends_network').emit(event, data);
  }

  private initializeHeartbeat(): void {
    // Clean up inactive connections every 5 minutes
    setInterval(() => {
      this.cleanupInactiveConnections();
    }, 5 * 60 * 1000);

    // Send ping to all clients every 30 seconds
    setInterval(() => {
      this.io.emit('ping', { timestamp: new Date().toISOString() });
    }, 30 * 1000);
  }

  private cleanupInactiveConnections(): void {
    const now = new Date();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [socketId, user] of this.connectedUsers.entries()) {
      if (now.getTime() - user.lastActivity.getTime() > inactiveThreshold) {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.disconnect(true);
          logger.info('Disconnected inactive socket:', { socketId, userId: user.userId });
        }
      }
    }
  }
}

// Initialize WebSocket service
export const initializeWebSocket = (io: SocketIOServer): void => {
  const webSocketService = new WebSocketService(io);
  
  // Make service globally available
  (global as any).webSocketService = webSocketService;
  
  logger.info('WebSocket service initialized');
};

export default WebSocketService;
