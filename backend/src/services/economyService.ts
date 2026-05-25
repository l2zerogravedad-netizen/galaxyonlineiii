import { logger } from '@/utils/logger';
import { executeQuery, executeSingleRowQuery, executeInsertQuery, executeUpdateQuery, executeQueryWithTransaction } from '@/database/connection';
import { Resource, Transaction, ApiResponse, PaginatedResponse } from '@/types';

interface TransferRequest {
  fromUserId: string;
  toUserId: string;
  resourceType: string;
  amount: number;
  reason?: string;
}

interface ProductionUpdateRequest {
  userId: string;
  deltaTime: number; // in seconds
}

interface EconomyStats {
  totalUsers: number;
  totalResources: Record<string, number>;
  totalTransactions: number;
  averageResourcesPerUser: Record<string, number>;
  topResourceProducers: Array<{
    userId: string;
    username: string;
    totalProduction: number;
  }>;
}

class EconomyService {
  private readonly baseProductionRates: Record<string, number> = {
    metal: 10,
    plasma: 5,
    energy: 20,
    crystals: 1,
    exotics: 0.1,
    quantum: 0.01,
    dark_matter: 0.001
  };

  private readonly transactionFees: Record<string, number> = {
    transfer: 0.02,
    marketplace: 0.05,
    currency: 0.01
  };

  private readonly limits: Record<string, number> = {
    maxTransferPerDay: 1000000,
    maxMarketplaceListings: 50,
    minListingPrice: 10,
    maxTransactionAmount: 1000000
  };

  async getUserResources(userId: string): Promise<ApiResponse<Resource[]>> {
    try {
      const resources = await executeQuery(
        'SELECT * FROM resources WHERE user_id = $1',
        [userId]
      );

      // Ensure user has all resource types
      await this.ensureUserHasAllResources(userId);

      return {
        success: true,
        data: resources
      };

    } catch (error) {
      logger.error('Failed to get user resources:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve resources'
        }
      };
    }
  }

  async updateUserProduction(request: ProductionUpdateRequest): Promise<ApiResponse<Resource[]>> {
    try {
      const { userId, deltaTime } = request;

      // Get user's buildings and production bonuses
      const productionData = await this.getUserProductionData(userId);
      
      // Calculate production for each resource type
      const updates: Array<{ query: string; params: any[] }> = [];
      
      for (const [resourceType, baseRate] of Object.entries(this.baseProductionRates)) {
        const productionRate = baseRate * productionData.multiplier;
        const production = (productionRate * deltaTime) / 60; // Convert to per-minute rate
        
        if (production > 0) {
          updates.push({
            query: `
              UPDATE resources 
              SET amount = LEAST(amount + $1, max_amount), 
                  last_updated = NOW(),
                  updated_at = NOW()
              WHERE user_id = $2 AND type = $3
            `,
            params: [production, userId, resourceType]
          });
        }
      }

      // Execute all updates in a transaction
      if (updates.length > 0) {
        await executeQueryWithTransaction(updates);
      }

      // Get updated resources
      const updatedResources = await this.getUserResources(userId);

      logger.info('Production updated for user:', {
        userId,
        deltaTime,
        productionMultiplier: productionData.multiplier
      });

      return updatedResources;

    } catch (error) {
      logger.error('Failed to update production:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update production'
        }
      };
    }
  }

  async transferResources(request: TransferRequest): Promise<ApiResponse<Transaction>> {
    try {
      const { fromUserId, toUserId, resourceType, amount, reason } = request;

      // Validate transfer
      const validation = await this.validateTransfer(fromUserId, toUserId, resourceType, amount);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: validation.errorCode,
            message: validation.message
          }
        };
      }

      // Calculate fee
      const fee = Math.floor(amount * this.transactionFees.transfer);
      const totalAmount = amount + fee;

      // Execute transfer in transaction
      const results = await executeQueryWithTransaction([
        // Deduct from sender
        {
          query: `
            UPDATE resources 
            SET amount = amount - $1, updated_at = NOW()
            WHERE user_id = $2 AND type = $3 AND amount >= $1
          `,
          params: [totalAmount, fromUserId, resourceType]
        },
        // Add to recipient
        {
          query: `
            UPDATE resources 
            SET amount = amount + $1, updated_at = NOW()
            WHERE user_id = $2 AND type = $3
          `,
          params: [amount, toUserId, resourceType]
        },
        // Create transaction record
        {
          query: `
            INSERT INTO transactions (from_user_id, to_user_id, type, resource_type, amount, fee, status, reason, created_at)
            VALUES ($1, $2, 'transfer', $3, $4, $5, 'completed', $6, NOW())
            RETURNING *
          `,
          params: [fromUserId, toUserId, resourceType, amount, fee, reason || 'Resource transfer']
        }
      ]);

      const transaction = results[2][0];

      logger.info('Resource transfer completed:', {
        transactionId: transaction.id,
        fromUserId,
        toUserId,
        resourceType,
        amount,
        fee
      });

      return {
        success: true,
        data: transaction
      };

    } catch (error) {
      logger.error('Failed to transfer resources:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to transfer resources'
        }
      };
    }
  }

  async getUserTransactions(userId: string, options: {
    type?: string;
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    try {
      const { type, limit = 20, offset = 0, startDate, endDate } = options;

      let query = `
        SELECT t.*, 
               u_from.username as from_username,
               u_to.username as to_username
        FROM transactions t
        LEFT JOIN users u_from ON t.from_user_id = u_from.id
        LEFT JOIN users u_to ON t.to_user_id = u_to.id
        WHERE (t.from_user_id = $1 OR t.to_user_id = $1)
      `;
      
      const params: any[] = [userId];

      if (type) {
        query += ' AND t.type = $2';
        params.push(type);
      }

      if (startDate) {
        query += ` AND t.created_at >= $${params.length + 1}`;
        params.push(startDate);
      }

      if (endDate) {
        query += ` AND t.created_at <= $${params.length + 1}`;
        params.push(endDate);
      }

      query += ' ORDER BY t.created_at DESC';

      // Get total count
      const countQuery = query.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) as total FROM');
      const countResult = await executeSingleRowQuery(countQuery, params);
      const totalCount = parseInt(countResult.total);

      // Get paginated results
      query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const transactions = await executeQuery(query, params);

      return {
        success: true,
        data: {
          items: transactions,
          totalCount,
          hasMore: offset + transactions.length < totalCount,
          limit,
          offset
        }
      };

    } catch (error) {
      logger.error('Failed to get user transactions:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve transactions'
        }
      };
    }
  }

  async getEconomyStats(): Promise<ApiResponse<EconomyStats>> {
    try {
      // Get total users
      const totalUsersResult = await executeSingleRowQuery(
        'SELECT COUNT(*) as count FROM users WHERE is_deleted = FALSE AND status = \'active\''
      );

      // Get total resources
      const totalResourcesResult = await executeQuery(`
        SELECT type, SUM(amount) as total 
        FROM resources 
        GROUP BY type
      `);

      const totalResources: Record<string, number> = {};
      totalResourcesResult.forEach(row => {
        totalResources[row.type] = parseFloat(row.total);
      });

      // Get total transactions
      const totalTransactionsResult = await executeSingleRowQuery(
        'SELECT COUNT(*) as count FROM transactions WHERE status = \'completed\''
      );

      // Calculate average resources per user
      const averageResourcesPerUser: Record<string, number> = {};
      Object.keys(totalResources).forEach(type => {
        averageResourcesPerUser[type] = totalResources[type] / totalUsersResult.count;
      });

      // Get top resource producers
      const topProducersResult = await executeQuery(`
        SELECT 
          r.user_id,
          u.username,
          SUM(r.production_rate * 60) as total_production
        FROM resources r
        JOIN users u ON r.user_id = u.id
        WHERE u.is_deleted = FALSE AND u.status = 'active'
        GROUP BY r.user_id, u.username
        ORDER BY total_production DESC
        LIMIT 10
      `);

      const stats: EconomyStats = {
        totalUsers: parseInt(totalUsersResult.count),
        totalResources,
        totalTransactions: parseInt(totalTransactionsResult.count),
        averageResourcesPerUser,
        topResourceProducers: topProducersResult
      };

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      logger.error('Failed to get economy stats:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve economy statistics'
        }
      };
    }
  }

  async adjustUserResources(userId: string, adjustments: Array<{
    type: string;
    amount: number;
    reason: string;
  }>): Promise<ApiResponse<void>> {
    try {
      const updates: Array<{ query: string; params: any[] }> = [];

      for (const adjustment of adjustments) {
        updates.push({
          query: `
            UPDATE resources 
            SET amount = GREATEST(0, amount + $1), updated_at = NOW()
            WHERE user_id = $2 AND type = $3
          `,
          params: [adjustment.amount, userId, adjustment.type]
        });

        // Create transaction record
        updates.push({
          query: `
            INSERT INTO transactions (from_user_id, to_user_id, type, resource_type, amount, status, reason, created_at)
            VALUES (NULL, $1, 'reward', $2, $3, 'completed', $4, NOW())
          `,
          params: [userId, adjustment.type, Math.abs(adjustment.amount), adjustment.reason]
        });
      }

      await executeQueryWithTransaction(updates);

      logger.info('User resources adjusted:', {
        userId,
        adjustments: adjustments.length
      });

      return {
        success: true
      };

    } catch (error) {
      logger.error('Failed to adjust user resources:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to adjust resources'
        }
      };
    }
  }

  private async ensureUserHasAllResources(userId: string): Promise<void> {
    const existingResources = await executeQuery(
      'SELECT type FROM resources WHERE user_id = $1',
      [userId]
    );

    const existingTypes = new Set(existingResources.map(r => r.type));
    const allTypes = Object.keys(this.baseProductionRates);

    for (const type of allTypes) {
      if (!existingTypes.has(type)) {
        await executeInsertQuery(
          'resources',
          {
            user_id: userId,
            type,
            amount: 0,
            max_amount: 1000,
            production_rate: this.baseProductionRates[type],
            last_updated: new Date(),
            created_at: new Date(),
            updated_at: new Date()
          }
        );
      }
    }
  }

  private async getUserProductionData(userId: string): Promise<{ multiplier: number }> {
    // This would typically include bonuses from buildings, modules, research, etc.
    // For now, we'll return a base multiplier
    return {
      multiplier: 1.0
    };
  }

  private async validateTransfer(
    fromUserId: string,
    toUserId: string,
    resourceType: string,
    amount: number
  ): Promise<{ isValid: boolean; errorCode?: string; message?: string }> {
    // Check if users are different
    if (fromUserId === toUserId) {
      return {
        isValid: false,
        errorCode: 'SAME_USER',
        message: 'Cannot transfer resources to yourself'
      };
    }

    // Check amount is positive
    if (amount <= 0) {
      return {
        isValid: false,
        errorCode: 'INVALID_AMOUNT',
        message: 'Transfer amount must be positive'
      };
    }

    // Check amount is within limits
    if (amount > this.limits.maxTransactionAmount) {
      return {
        isValid: false,
        errorCode: 'AMOUNT_TOO_HIGH',
        message: `Transfer amount cannot exceed ${this.limits.maxTransactionAmount}`
      };
    }

    // Check if resource type is valid
    if (!this.baseProductionRates[resourceType]) {
      return {
        isValid: false,
        errorCode: 'INVALID_RESOURCE_TYPE',
        message: 'Invalid resource type'
      };
    }

    // Check if sender has sufficient resources
    const senderResources = await executeSingleRowQuery(
      'SELECT amount FROM resources WHERE user_id = $1 AND type = $2',
      [fromUserId, resourceType]
    );

    if (!senderResources || senderResources.amount < amount) {
      return {
        isValid: false,
        errorCode: 'INSUFFICIENT_RESOURCES',
        message: 'Insufficient resources for transfer'
      };
    }

    // Check daily transfer limit
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const dailyTransfers = await executeSingleRowQuery(
      `
        SELECT COALESCE(SUM(amount), 0) as total
        FROM transactions 
        WHERE from_user_id = $1 
          AND resource_type = $2 
          AND created_at >= $3
          AND status = 'completed'
      `,
      [fromUserId, resourceType, todayStart]
    );

    if (dailyTransfers.total + amount > this.limits.maxTransferPerDay) {
      return {
        isValid: false,
        errorCode: 'DAILY_LIMIT_EXCEEDED',
        message: 'Daily transfer limit exceeded'
      };
    }

    // Check if recipient exists and is active
    const recipient = await executeSingleRowQuery(
      'SELECT id FROM users WHERE id = $1 AND is_deleted = FALSE AND status = \'active\'',
      [toUserId]
    );

    if (!recipient) {
      return {
        isValid: false,
        errorCode: 'RECIPIENT_NOT_FOUND',
        message: 'Recipient not found or inactive'
      };
    }

    return { isValid: true };
  }
}

export const economyService = new EconomyService();
export default economyService;
