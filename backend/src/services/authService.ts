import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';
import { executeQuery, executeSingleRowQuery, executeInsertQuery, executeUpdateQuery } from '@/database/connection';
import { User, ApiResponse } from '@/types';
import { seedService } from '@/services/seedService';

interface LoginRequest {
  email: string;
  password: string;
  clientType?: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  clientType?: string;
  referralCode?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

interface LoginResponse {
  user: Omit<User, 'passwordHash' | 'salt'>;
  tokens: AuthTokens;
  session: {
    sessionId: string;
    expiresAt: string;
    clientType: string;
  };
}

interface RegisterResponse {
  user: Omit<User, 'passwordHash' | 'salt'>;
  tokens: AuthTokens;
  session: {
    sessionId: string;
    expiresAt: string;
    clientType: string;
  };
  welcomePackage: {
    resources: Array<{ type: string; amount: number }>;
    items: Array<{ itemId: string; quantity: number }>;
    ships: Array<{ shipId: string; name: string }>;
  };
}

class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly jwtRefreshExpiresIn: string;
  private readonly bcryptRounds: number;

  constructor() {
    this.jwtSecret = process.env['JWT_SECRET'] || 'fallback-secret-change-in-production';
    this.jwtRefreshSecret = process.env['JWT_REFRESH_SECRET'] || 'fallback-refresh-secret-change-in-production';
    this.jwtExpiresIn = process.env['JWT_EXPIRES_IN'] || '1h';
    this.jwtRefreshExpiresIn = process.env['JWT_REFRESH_EXPIRES_IN'] || '7d';
    this.bcryptRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
  }

  async login(loginData: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const { email, password, clientType = 'unknown' } = loginData;

      // Find user by email
      const user = await this.findUserByEmail(email);
      if (!user) {
        return {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          }
        };
      }

      // Check if user is banned
      if (user.status === 'banned') {
        return {
          success: false,
          error: {
            code: 'ACCOUNT_BANNED',
            message: user.banReason || 'Account has been banned'
          }
        };
      }

      // Check if user is suspended
      if (user.status === 'suspended') {
        return {
          success: false,
          error: {
            code: 'ACCOUNT_SUSPENDED',
            message: 'Account has been temporarily suspended'
          }
        };
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(password, user.passwordHash, user.salt);
      if (!isPasswordValid) {
        return {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          }
        };
      }

      // Generate tokens
      const tokens = await this.generateTokens(user.id);

      // Create session
      const session = await this.createSession(user.id, tokens.refreshToken, clientType);

      // Update last login
      await this.updateLastLogin(user.id);

      // Prepare user data (exclude sensitive fields)
      const userData = this.sanitizeUserData(user);

      logger.info('User logged in successfully:', {
        userId: user.id,
        username: user.username,
        clientType,
        ip: session.ipAddress
      });

      return {
        success: true,
        data: {
          user: userData,
          tokens,
          session: {
            sessionId: session.id,
            expiresAt: session.expiresAt.toISOString(),
            clientType: session.clientType
          }
        }
      };

    } catch (error) {
      logger.error('Login error:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during login'
        }
      };
    }
  }

  async register(registerData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    try {
      const { username, email, password, clientType = 'unknown', referralCode } = registerData;

      // Validate input
      const validation = await this.validateRegistrationData(username, email, password);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.message,
            details: validation.details
          }
        };
      }

      // Check if username already exists
      const existingUsername = await this.findUserByUsername(username);
      if (existingUsername) {
        return {
          success: false,
          error: {
            code: 'USERNAME_TAKEN',
            message: 'Username is already taken'
          }
        };
      }

      // Check if email already exists
      const existingEmail = await this.findUserByEmail(email);
      if (existingEmail) {
        return {
          success: false,
          error: {
            code: 'EMAIL_TAKEN',
            message: 'Email is already registered'
          }
        };
      }

      // Hash password
      const { hash, salt } = await this.hashPassword(password);

      // Create user (SQL raw — legacy schema)
      const userData = await this.createUser({
        username,
        email,
        passwordHash: hash,
        salt,
        clientType,
        referralCode
      });

      // ── Seed Prisma: Empire, Planet, Resources, Buildings ────────────
      // El seed es idempotente: si el usuario ya tiene datos, no duplica.
      // Se ejecuta con graceful degradation: si falla, el registro sigue.
      try {
        await seedService.initializeNewUser(userData.id, userData.username);
        logger.info(`[AuthService] Prisma seed completado para usuario ${userData.id}`);
      } catch (seedErr) {
        logger.error(`[AuthService] Prisma seed falló para usuario ${userData.id}:`, seedErr);
        // No lanzamos el error para no afectar el registro exitoso
      }

      // Generate tokens
      const tokens = await this.generateTokens(userData.id);

      // Create session
      const session = await this.createSession(userData.id, tokens.refreshToken, clientType);

      // Create welcome package
      const welcomePackage = await this.createWelcomePackage(userData.id);

      // Prepare user data (exclude sensitive fields)
      const sanitizedUser = this.sanitizeUserData(userData);

      logger.info('User registered successfully:', {
        userId: userData.id,
        username: userData.username,
        email: userData.email,
        clientType,
        referralCode
      });

      return {
        success: true,
        data: {
          user: sanitizedUser,
          tokens,
          session: {
            sessionId: session.id,
            expiresAt: session.expiresAt.toISOString(),
            clientType: session.clientType
          },
          welcomePackage
        }
      };

    } catch (error) {
      logger.error('Registration error:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during registration'
        }
      };
    }
  }

  async refreshToken(refreshToken: string, clientType: string = 'unknown'): Promise<ApiResponse<AuthTokens>> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret) as { userId: string };
      
      // Check if session exists and is active
      const session = await this.findSessionByRefreshToken(refreshToken);
      if (!session || !session.isActive) {
        return {
          success: false,
          error: {
            code: 'INVALID_SESSION',
            message: 'Invalid or expired session'
          }
        };
      }

      // Generate new tokens
      const tokens = await this.generateTokens(decoded.userId);

      // Update session with new refresh token
      await this.updateSession(session.id, tokens.refreshToken);

      logger.info('Token refreshed successfully:', {
        userId: decoded.userId,
        sessionId: session.id,
        clientType
      });

      return {
        success: true,
        data: tokens
      };

    } catch (error) {
      logger.error('Token refresh error:', error);
      return {
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid refresh token'
        }
      };
    }
  }

  async logout(sessionId: string): Promise<ApiResponse<void>> {
    try {
      // Deactivate session
      await this.deactivateSession(sessionId);

      logger.info('User logged out successfully:', { sessionId });

      return {
        success: true
      };

    } catch (error) {
      logger.error('Logout error:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during logout'
        }
      };
    }
  }

  async logoutAllSessions(userId: string): Promise<ApiResponse<void>> {
    try {
      // Deactivate all sessions for user
      await this.deactivateAllUserSessions(userId);

      logger.info('All sessions logged out successfully:', { userId });

      return {
        success: true
      };

    } catch (error) {
      logger.error('Logout all sessions error:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during logout'
        }
      };
    }
  }

  async verifyAccessToken(token: string): Promise<ApiResponse<{ userId: string }>> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { userId: string };
      
      return {
        success: true,
        data: { userId: decoded.userId }
      };

    } catch (error) {
      logger.error('Token verification error:', error);
      return {
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid access token'
        }
      };
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      // Get user
      const user = await this.findUserById(userId);
      if (!user) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        };
      }

      // Verify current password
      const isCurrentPasswordValid = await this.verifyPassword(currentPassword, user.passwordHash, user.salt);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          error: {
            code: 'INVALID_CURRENT_PASSWORD',
            message: 'Current password is incorrect'
          }
        };
      }

      // Validate new password
      const validation = this.validatePassword(newPassword);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'INVALID_NEW_PASSWORD',
            message: validation.message,
            details: validation.details
          }
        };
      }

      // Hash new password
      const { hash, salt } = await this.hashPassword(newPassword);

      // Update password
      await this.updateUserPassword(userId, hash, salt);

      // Logout all sessions (force re-login)
      await this.deactivateAllUserSessions(userId);

      logger.info('Password changed successfully:', { userId });

      return {
        success: true
      };

    } catch (error) {
      logger.error('Change password error:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while changing password'
        }
      };
    }
  }

  private async findUserByEmail(email: string): Promise<any> {
    return await executeSingleRowQuery(
      'SELECT * FROM users WHERE email = $1 AND is_deleted = FALSE',
      [email.toLowerCase()]
    );
  }

  private async findUserByUsername(username: string): Promise<any> {
    return await executeSingleRowQuery(
      'SELECT * FROM users WHERE username = $1 AND is_deleted = FALSE',
      [username]
    );
  }

  private async findUserById(userId: string): Promise<any> {
    return await executeSingleRowQuery(
      'SELECT * FROM users WHERE id = $1 AND is_deleted = FALSE',
      [userId]
    );
  }

  private async hashPassword(password: string): Promise<{ hash: string; salt: string }> {
    const salt = await bcrypt.genSalt(this.bcryptRounds);
    const hash = await bcrypt.hash(password, salt);
    return { hash, salt };
  }

  private async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  private async generateTokens(userId: string): Promise<AuthTokens> {
    const accessToken = jwt.sign({ userId }, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
    const refreshToken = jwt.sign({ userId }, this.jwtRefreshSecret, { expiresIn: this.jwtRefreshExpiresIn });
    
    const expiresIn = this.getExpirationTime(this.jwtExpiresIn);

    return {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: 'Bearer'
    };
  }

  private getExpirationTime(timeString: string): number {
    const timeValue = parseInt(timeString);
    const timeUnit = timeString.slice(-1);
    
    switch (timeUnit) {
      case 's': return timeValue * 1000;
      case 'm': return timeValue * 60 * 1000;
      case 'h': return timeValue * 60 * 60 * 1000;
      case 'd': return timeValue * 24 * 60 * 60 * 1000;
      default: return 3600 * 1000; // Default to 1 hour
    }
  }

  private async createSession(userId: string, refreshToken: string, clientType: string): Promise<any> {
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + this.getExpirationTime(this.jwtRefreshExpiresIn));
    
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    return await executeInsertQuery(
      'sessions',
      {
        id: sessionId,
        user_id: userId,
        token_hash: tokenHash,
        refresh_token_hash: refreshTokenHash,
        client_type: clientType,
        expires_at: expiresAt,
        last_used_at: new Date(),
        is_active: true
      },
      ['id', 'expires_at', 'client_type']
    );
  }

  private async findSessionByRefreshToken(refreshToken: string): Promise<any> {
    const sessions = await executeQuery(
      'SELECT * FROM sessions WHERE expires_at > NOW() AND is_active = TRUE'
    );

    for (const session of sessions) {
      if (await bcrypt.compare(refreshToken, session.refresh_token_hash)) {
        return session;
      }
    }

    return null;
  }

  private async updateSession(sessionId: string, refreshToken: string): Promise<void> {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    
    await executeUpdateQuery(
      'sessions',
      { refresh_token_hash: refreshTokenHash, last_used_at: new Date() },
      'id = $1',
      [sessionId]
    );
  }

  private async deactivateSession(sessionId: string): Promise<void> {
    await executeUpdateQuery(
      'sessions',
      { is_active: false },
      'id = $1',
      [sessionId]
    );
  }

  private async deactivateAllUserSessions(userId: string): Promise<void> {
    await executeUpdateQuery(
      'sessions',
      { is_active: false },
      'user_id = $1',
      [userId]
    );
  }

  private async updateLastLogin(userId: string): Promise<void> {
    await executeUpdateQuery(
      'users',
      { last_login_at: new Date(), last_active_at: new Date() },
      'id = $1',
      [userId]
    );
  }

  private async updateUserPassword(userId: string, passwordHash: string, salt: string): Promise<void> {
    await executeUpdateQuery(
      'users',
      { password_hash: passwordHash, salt, updated_at: new Date() },
      'id = $1',
      [userId]
    );
  }

  private sanitizeUserData(user: any): Omit<User, 'passwordHash' | 'salt'> {
    const { password_hash, salt, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  private async validateRegistrationData(username: string, email: string, password: string): Promise<{ isValid: boolean; message?: string; details?: any }> {
    // Validate username
    if (username.length < 3 || username.length > 50) {
      return {
        isValid: false,
        message: 'Username must be between 3 and 50 characters',
        details: { field: 'username', constraint: 'length' }
      };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return {
        isValid: false,
        message: 'Username can only contain letters, numbers, underscores, and hyphens',
        details: { field: 'username', constraint: 'format' }
      };
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        message: 'Invalid email format',
        details: { field: 'email', constraint: 'format' }
      };
    }

    // Validate password
    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.isValid) {
      return passwordValidation;
    }

    return { isValid: true };
  }

  private validatePassword(password: string): { isValid: boolean; message?: string; details?: any } {
    if (password.length < 8) {
      return {
        isValid: false,
        message: 'Password must be at least 8 characters long',
        details: { field: 'password', constraint: 'minLength' }
      };
    }

    if (password.length > 128) {
      return {
        isValid: false,
        message: 'Password must be less than 128 characters',
        details: { field: 'password', constraint: 'maxLength' }
      };
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one lowercase letter',
        details: { field: 'password', constraint: 'lowercase' }
      };
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one uppercase letter',
        details: { field: 'password', constraint: 'uppercase' }
      };
    }

    if (!/(?=.*\d)/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one number',
        details: { field: 'password', constraint: 'number' }
      };
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one special character',
        details: { field: 'password', constraint: 'special' }
      };
    }

    return { isValid: true };
  }

  private async createUser(userData: any): Promise<any> {
    const user = await executeInsertQuery(
      'users',
      {
        username: userData.username,
        email: userData.email.toLowerCase(),
        password_hash: userData.passwordHash,
        salt: userData.salt,
        level: 1,
        experience: 0,
        credits: 1000,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      ['*']
    );

    // Create user statistics
    await executeInsertQuery(
      'user_statistics',
      {
        user_id: user.id,
        created_at: new Date(),
        updated_at: new Date()
      }
    );

    // Create user preferences
    await executeInsertQuery(
      'user_preferences',
      {
        user_id: user.id,
        created_at: new Date(),
        updated_at: new Date()
      }
    );

    // Initialize resources
    await this.initializeUserResources(user.id);

    return user;
  }

  private async initializeUserResources(userId: string): Promise<void> {
    const resources = [
      { type: 'metal', amount: 1000, max_amount: 10000, production_rate: 10 },
      { type: 'plasma', amount: 500, max_amount: 5000, production_rate: 5 },
      { type: 'energy', amount: 750, max_amount: 7500, production_rate: 15 },
      { type: 'crystals', amount: 0, max_amount: 1000, production_rate: 1 }
    ];

    for (const resource of resources) {
      await executeInsertQuery(
        'resources',
        {
          user_id: userId,
          type: resource.type,
          amount: resource.amount,
          max_amount: resource.max_amount,
          production_rate: resource.production_rate,
          last_updated: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        }
      );
    }
  }

  private async createWelcomePackage(userId: string): Promise<any> {
    // Give starter ship
    const ship = await executeInsertQuery(
      'ships',
      {
        user_id: userId,
        name: 'Starter Ship',
        type: 'fighter',
        class: 'light',
        level: 1,
        experience: 0,
        health_current: 100,
        health_max: 100,
        health_regeneration: 1,
        attack_power: 10,
        defense: 5,
        speed: 15,
        maneuverability: 12,
        cargo_capacity: 50,
        sensor_range: 100,
        status: 'active',
        crew_current: 1,
        crew_max: 1,
        crew_morale: 100,
        created_at: new Date(),
        updated_at: new Date()
      },
      ['id', 'name']
    );

    // Give starter items
    const starterItems = [
      { itemId: 'weapon_laser_cannon_mk1', quantity: 1 },
      { itemId: 'armor_basic_plate', quantity: 1 },
      { itemId: 'module_shield_generator_mk1', quantity: 1 }
    ];

    for (const item of starterItems) {
      await executeInsertQuery(
        'inventory_items',
        {
          user_id: userId,
          item_id: item.itemId,
          name: item.itemId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          category: item.itemId.startsWith('weapon') ? 'weapon' : 
                  item.itemId.startsWith('armor') ? 'armor' : 'module',
          rarity: 'common',
          quantity: item.quantity,
          quality: 100,
          created_at: new Date(),
          updated_at: new Date()
        }
      );
    }

    return {
      resources: [
        { type: 'metal', amount: 1000 },
        { type: 'plasma', amount: 500 },
        { type: 'energy', amount: 750 }
      ],
      items: starterItems,
      ships: [{ shipId: ship.id, name: ship.name }]
    };
  }
}

export const authService = new AuthService();
export default authService;
