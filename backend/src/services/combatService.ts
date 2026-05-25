import { logger } from '@/utils/logger';
import { executeQuery, executeSingleRowQuery, executeInsertQuery, executeUpdateQuery, executeQueryWithTransaction } from '@/database/connection';
import { CombatSession, CombatParticipant, ApiResponse, PaginatedResponse } from '@/types';

interface InitiateCombatRequest {
  initiatorId: string;
  participants: string[];
  battleType: 'pvp' | 'pve' | 'tournament' | 'training' | 'alliance_war';
  location: {
    systemId: string;
    coordinates: { x: number; y: number; z: number };
  };
  settings?: {
    turnTimeLimit?: number;
    allowSpectators?: boolean;
    maxParticipants?: number;
    shipLevelRestriction?: { min: number; max: number };
    weaponRestrictions?: string[];
    environmentModifiers?: {
      damage: number;
      speed: number;
      visibility: number;
    };
  };
}

interface CombatActionRequest {
  combatId: string;
  userId: string;
  shipId: string;
  action: {
    type: 'attack' | 'defend' | 'move' | 'special';
    targetId?: string;
    targetPosition?: { x: number; y: number; z: number };
    abilityId?: string;
    parameters?: any;
  };
}

interface CombatStats {
  totalCombats: number;
  activeCombats: number;
  averageCombatDuration: number;
  winRates: Record<string, number>;
  popularBattleTypes: Record<string, number>;
  topCombatants: Array<{
    userId: string;
    username: string;
    battlesWon: number;
    battlesLost: number;
    winRate: number;
  }>;
}

class CombatService {
  private readonly maxParticipants: number = 10;
  private readonly defaultTurnTimeLimit: number = 30; // seconds
  private readonly damageFormulas = {
    base: (attacker: any, defender: any) => {
      const baseDamage = attacker.attack_power || 10;
      const defense = defender.defense || 5;
      const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
      return Math.max(1, Math.floor((baseDamage - defense * 0.5) * randomFactor));
    },
    critical: (baseDamage: number) => {
      return Math.floor(baseDamage * 2.0);
    },
    miss: (accuracy: number) => {
      return Math.random() > (accuracy / 100);
    }
  };

  async initiateCombat(request: InitiateCombatRequest): Promise<ApiResponse<CombatSession>> {
    try {
      const { initiatorId, participants, battleType, location, settings = {} } = request;

      // Validate request
      const validation = await this.validateCombatRequest(initiatorId, participants, battleType, settings);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: validation.errorCode!,
            message: validation.message!
          }
        };
      }

      // Get participants' ships
      const participantShips = await this.getParticipantShips(participants);
      if (participantShips.length !== participants.length) {
        return {
          success: false,
          error: {
            code: 'PARTICIPANTS_NOT_READY',
            message: 'Some participants do not have ready ships'
          }
        };
      }

      // Create combat session
      const combatSession = await this.createCombatSession({
        initiatorId,
        participants,
        battleType,
        location,
        settings: {
          turnTimeLimit: settings.turnTimeLimit || this.defaultTurnTimeLimit,
          allowSpectators: settings.allowSpectators ?? true,
          maxParticipants: settings.maxParticipants || this.maxParticipants,
          shipLevelRestriction: settings.shipLevelRestriction,
          weaponRestrictions: settings.weaponRestrictions || [],
          environmentModifiers: settings.environmentModifiers || {
            damage: 1.0,
            speed: 1.0,
            visibility: 1.0
          }
        }
      });

      // Add participants to combat
      await this.addCombatParticipants(combatSession.id, participants, participantShips);

      // Initialize turn order
      await this.initializeTurnOrder(combatSession.id, participants);

      logger.info('Combat session initiated:', {
        combatId: combatSession.id,
        initiatorId,
        participants: participants.length,
        battleType,
        location: location.systemId
      });

      return {
        success: true,
        data: combatSession
      };

    } catch (error) {
      logger.error('Failed to initiate combat:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to initiate combat'
        }
      };
    }
  }

  async executeCombatAction(request: CombatActionRequest): Promise<ApiResponse<any>> {
    try {
      const { combatId, userId, shipId, action } = request;

      // Get combat session
      const combat = await this.getCombatSession(combatId);
      if (!combat) {
        return {
          success: false,
          error: {
            code: 'COMBAT_NOT_FOUND',
            message: 'Combat session not found'
          }
        };
      }

      // Validate combat state
      if (combat.status !== 'active') {
        return {
          success: false,
          error: {
            code: 'COMBAT_NOT_ACTIVE',
            message: 'Combat is not currently active'
          }
        };
      }

      // Check if it's user's turn
      const currentTurn = await this.getCurrentTurn(combatId);
      if (currentTurn?.user_id !== userId) {
        return {
          success: false,
          error: {
            code: 'NOT_YOUR_TURN',
            message: 'It is not your turn'
          }
        };
      }

      // Validate action
      const actionValidation = await this.validateCombatAction(combat, userId, shipId, action);
      if (!actionValidation.isValid) {
        return {
          success: false,
          error: {
            code: actionValidation.errorCode!,
            message: actionValidation.message!
          }
        };
      }

      // Execute action
      const result = await this.processCombatAction(combat, userId, shipId, action);

      // Log action
      await this.logCombatAction(combatId, userId, action, result);

      // Check for combat end
      const combatStatus = await this.checkCombatEnd(combatId);
      if (combatStatus.ended) {
        await this.endCombat(combatId, combatStatus.winner, combatStatus.rewards);
      } else {
        // Move to next turn
        await this.nextTurn(combatId);
      }

      logger.info('Combat action executed:', {
        combatId,
        userId,
        actionType: action.type,
        result: result.success
      });

      return {
        success: true,
        data: {
          action: result,
          nextTurn: combatStatus.ended ? null : await this.getCurrentTurn(combatId),
          combatStatus: combatStatus.ended ? 'completed' : 'active'
        }
      };

    } catch (error) {
      logger.error('Failed to execute combat action:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to execute combat action'
        }
      };
    }
  }

  async getCombatSessions(userId: string, filters: {
    status?: 'waiting' | 'active' | 'paused' | 'completed' | 'aborted';
    battleType?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ApiResponse<PaginatedResponse<CombatSession>>> {
    try {
      const { status, battleType, limit = 20, offset = 0 } = filters;

      let query = `
        SELECT cs.*, 
               array_agg(cp.user_id) as participant_ids
        FROM combat_sessions cs
        LEFT JOIN combat_participants cp ON cs.id = cp.combat_session_id
        WHERE cs.participants @> $1
      `;
      
      const params: any[] = [JSON.stringify([userId])];
      let paramIndex = 2;

      if (status) {
        query += ` AND cs.status = $${paramIndex++}`;
        params.push(status);
      }

      if (battleType) {
        query += ` AND cs.battle_type = $${paramIndex++}`;
        params.push(battleType);
      }

      query += ` GROUP BY cs.id ORDER BY cs.created_at DESC`;

      // Get total count
      const countQuery = query.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) as total FROM');
      const countResult = await executeSingleRowQuery(countQuery, params);
      const totalCount = parseInt(countResult.total);

      // Add pagination
      query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      params.push(limit, offset);

      const sessions = await executeQuery(query, params);

      return {
        success: true,
        data: {
          items: sessions,
          totalCount,
          hasMore: offset + sessions.length < totalCount,
          limit,
          offset
        }
      };

    } catch (error) {
      logger.error('Failed to get combat sessions:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve combat sessions'
        }
      };
    }
  }

  async getCombatSession(combatId: string): Promise<CombatSession | null> {
    try {
      const session = await executeSingleRowQuery(
        'SELECT * FROM combat_sessions WHERE id = $1',
        [combatId]
      );

      if (!session) return null;

      // Get participants
      const participants = await executeQuery(
        'SELECT * FROM combat_participants WHERE combat_session_id = $1',
        [combatId]
      );

      return {
        ...session,
        participants
      };

    } catch (error) {
      logger.error('Failed to get combat session:', error);
      return null;
    }
  }

  async joinCombat(combatId: string, userId: string): Promise<ApiResponse<void>> {
    try {
      // Get combat session
      const combat = await this.getCombatSession(combatId);
      if (!combat) {
        return {
          success: false,
          error: {
            code: 'COMBAT_NOT_FOUND',
            message: 'Combat session not found'
          }
        };
      }

      // Check if user can join
      if (combat.status !== 'waiting') {
        return {
          success: false,
          error: {
            code: 'COMBAT_STARTED',
            message: 'Cannot join combat that has already started'
          }
        };
      }

      if (combat.participants.length >= combat.settings.maxParticipants) {
        return {
          success: false,
          error: {
            code: 'COMBAT_FULL',
            message: 'Combat session is full'
          }
        };
      }

      // Check if user is already a participant
      const existingParticipant = combat.participants.find(p => p.userId === userId);
      if (existingParticipant) {
        return {
          success: false,
          error: {
            code: 'ALREADY_PARTICIPANT',
            message: 'Already a participant in this combat'
          }
        };
      }

      // Add participant
      const userShips = await this.getParticipantShips([userId]);
      if (userShips.length === 0) {
        return {
          success: false,
          error: {
            code: 'NO_SHIPS',
            message: 'No ships available for combat'
          }
        };
      }

      await this.addCombatParticipants(combatId, [userId], userShips);

      // Update participants list
      const updatedParticipants = [...combat.participants, { userId, ships: userShips.map(s => s.id), ready: false }];
      await executeUpdateQuery(
        'combat_sessions',
        { participants: JSON.stringify(updatedParticipants) },
        'id = $1',
        [combatId]
      );

      logger.info('User joined combat:', {
        combatId,
        userId,
        totalParticipants: updatedParticipants.length
      });

      return {
        success: true
      };

    } catch (error) {
      logger.error('Failed to join combat:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to join combat'
        }
      };
    }
  }

  async leaveCombat(combatId: string, userId: string): Promise<ApiResponse<void>> {
    try {
      // Get combat session
      const combat = await this.getCombatSession(combatId);
      if (!combat) {
        return {
          success: false,
          error: {
            code: 'COMBAT_NOT_FOUND',
            message: 'Combat session not found'
          }
        };
      }

      // Check if user is a participant
      const participant = combat.participants.find(p => p.userId === userId);
      if (!participant) {
        return {
          success: false,
          error: {
            code: 'NOT_PARTICIPANT',
            message: 'Not a participant in this combat'
          }
        };
      }

      // Remove participant
      await executeUpdateQuery(
        'combat_participants',
        { disconnected: true, last_action: new Date() },
        'combat_session_id = $1 AND user_id = $2',
        [combatId, userId]
      );

      logger.info('User left combat:', {
        combatId,
        userId
      });

      return {
        success: true
      };

    } catch (error) {
      logger.error('Failed to leave combat:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to leave combat'
        }
      };
    }
  }

  async getCombatStats(): Promise<ApiResponse<CombatStats>> {
    try {
      // Get basic stats
      const basicStats = await executeSingleRowQuery(`
        SELECT 
          COUNT(*) as total_combats,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_combats,
          AVG(EXTRACT(EPOCH FROM (end_time - start_time))) as avg_duration
        FROM combat_sessions
      `);

      // Get win rates by battle type
      const winRates = await executeQuery(`
        SELECT 
          battle_type,
          COUNT(*) as total_battles
        FROM combat_sessions 
        WHERE status = 'completed'
        GROUP BY battle_type
      `);

      // Get top combatants
      const topCombatants = await executeQuery(`
        SELECT 
          u.id as user_id,
          u.username,
          COALESCE(us.battles_won, 0) as battles_won,
          COALESCE(us.battles_lost, 0) as battles_lost
        FROM users u
        LEFT JOIN user_statistics us ON u.id = us.user_id
        WHERE u.is_deleted = FALSE
        ORDER BY (COALESCE(us.battles_won, 0) + COALESCE(us.battles_lost, 0)) DESC
        LIMIT 10
      `);

      const stats: CombatStats = {
        totalCombats: parseInt(basicStats.total_combats),
        activeCombats: parseInt(basicStats.active_combats),
        averageCombatDuration: parseFloat(basicStats.avg_duration) || 0,
        winRates: winRates.reduce((acc, row) => {
          acc[row.battle_type] = parseInt(row.total_battles);
          return acc;
        }, {}),
        popularBattleTypes: winRates.reduce((acc, row) => {
          acc[row.battle_type] = parseInt(row.total_battles);
          return acc;
        }, {}),
        topCombatants: topCombatants.map(combatant => ({
          userId: combatant.user_id,
          username: combatant.username,
          battlesWon: combatant.battles_won,
          battlesLost: combatant.battles_lost,
          winRate: combatant.battles_won + combatant.battles_lost > 0 
            ? combatant.battles_won / (combatant.battles_won + combatant.battles_lost) 
            : 0
        }))
      };

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      logger.error('Failed to get combat stats:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve combat statistics'
        }
      };
    }
  }

  // Private helper methods
  private async validateCombatRequest(
    initiatorId: string,
    participants: string[],
    battleType: string,
    settings: any
  ): Promise<{ isValid: boolean; errorCode?: string; message?: string }> {
    // Validate participants
    if (participants.length < 2) {
      return {
        isValid: false,
        errorCode: 'INSUFFICIENT_PARTICIPANTS',
        message: 'At least 2 participants required for combat'
      };
    }

    if (participants.length > this.maxParticipants) {
      return {
        isValid: false,
        errorCode: 'TOO_MANY_PARTICIPANTS',
        message: `Maximum ${this.maxParticipants} participants allowed`
      };
    }

    // Check if initiator is in participants
    if (!participants.includes(initiatorId)) {
      return {
        isValid: false,
        errorCode: 'INITIATOR_NOT_IN_PARTICIPANTS',
        message: 'Initiator must be included in participants list'
      };
    }

    // Validate battle type
    const validBattleTypes = ['pvp', 'pve', 'tournament', 'training', 'alliance_war'];
    if (!validBattleTypes.includes(battleType)) {
      return {
        isValid: false,
        errorCode: 'INVALID_BATTLE_TYPE',
        message: 'Invalid battle type'
      };
    }

    return { isValid: true };
  }

  private async getParticipantShips(participants: string[]): Promise<any[]> {
    const ships = await executeQuery(
      'SELECT * FROM ships WHERE user_id = ANY($1) AND status = \'active\' ORDER BY user_id, level DESC',
      [participants]
    );

    // Group ships by user and take the best ship for each participant
    const shipsByUser: Record<string, any> = {};
    ships.forEach(ship => {
      if (!shipsByUser[ship.user_id] || ship.level > shipsByUser[ship.user_id].level) {
        shipsByUser[ship.user_id] = ship;
      }
    });

    return Object.values(shipsByUser);
  }

  private async createCombatSession(data: any): Promise<CombatSession> {
    const session = await executeInsertQuery(
      'combat_sessions',
      {
        participants: JSON.stringify(data.participants),
        status: 'waiting',
        start_time: new Date(),
        time_limit: data.settings.turnTimeLimit * 60, // Convert to seconds
        location_system_id: data.location.systemId,
        location_x: data.location.coordinates.x,
        location_y: data.location.coordinates.y,
        location_z: data.location.coordinates.z,
        battle_type: data.battleType,
        settings: JSON.stringify(data.settings),
        battle_log: JSON.stringify([]),
        created_at: new Date(),
        updated_at: new Date()
      },
      ['*']
    );

    return session;
  }

  private async addCombatParticipants(combatId: string, participants: string[], ships: any[]): Promise<void> {
    const participantData = participants.map(userId => {
      const userShip = ships.find(ship => ship.user_id === userId);
      return {
        combat_session_id: combatId,
        user_id: userId,
        ships: JSON.stringify([userShip]),
        ready: false,
        disconnected: false,
        created_at: new Date(),
        updated_at: new Date()
      };
    });

    for (const data of participantData) {
      await executeInsertQuery('combat_participants', data);
    }
  }

  private async initializeTurnOrder(combatId: string, participants: string[]): Promise<void> {
    // Random turn order for now, could be based on ship speed/initiative
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const turnOrder = shuffled.map((userId, index) => ({
      userId,
      shipId: null, // Will be set when combat starts
      initiative: Math.floor(Math.random() * 100),
      order: index
    }));

    await executeUpdateQuery(
      'combat_sessions',
      { turn_order: JSON.stringify(turnOrder) },
      'id = $1',
      [combatId]
    );
  }

  private async getCurrentTurn(combatId: string): Promise<any> {
    const combat = await executeSingleRowQuery(
      'SELECT current_turn, turn_order FROM combat_sessions WHERE id = $1',
      [combatId]
    );

    if (!combat || !combat.current_turn) return null;

    const turnOrder = JSON.parse(combat.turn_order);
    return turnOrder.find((turn: any) => turn.userId === combat.current_turn);
  }

  private async validateCombatAction(combat: CombatSession, userId: string, shipId: string, action: any): Promise<{ isValid: boolean; errorCode?: string; message?: string }> {
    // Validate user is participant
    const participant = combat.participants.find(p => p.userId === userId);
    if (!participant) {
      return {
        isValid: false,
        errorCode: 'NOT_PARTICIPANT',
        message: 'Not a participant in this combat'
      };
    }

    // Validate ship belongs to user
    if (!participant.ships.includes(shipId)) {
      return {
        isValid: false,
        errorCode: 'INVALID_SHIP',
        message: 'Ship does not belong to user'
      };
    }

    // Validate action type
    const validActions = ['attack', 'defend', 'move', 'special'];
    if (!validActions.includes(action.type)) {
      return {
        isValid: false,
        errorCode: 'INVALID_ACTION',
        message: 'Invalid action type'
      };
    }

    return { isValid: true };
  }

  private async processCombatAction(combat: CombatSession, userId: string, shipId: string, action: any): Promise<any> {
    // This is a simplified combat processing
    // In a real implementation, this would be much more complex
    
    const result = {
      success: true,
      action: action.type,
      damage: 0,
      effects: []
    };

    if (action.type === 'attack' && action.targetId) {
      // Get attacker and defender ships
      const attackerShip = await this.getShipInCombat(shipId);
      const defenderShip = await this.getShipInCombat(action.targetId);

      if (attackerShip && defenderShip) {
        // Calculate damage
        const baseDamage = this.damageFormulas.base(attackerShip, defenderShip);
        const isMiss = this.damageFormulas.miss(85); // 85% accuracy
        const isCritical = !isMiss && Math.random() < 0.1; // 10% critical chance

        if (isMiss) {
          result.damage = 0;
          result.effects.push('miss');
        } else {
          result.damage = isCritical ? this.damageFormulas.critical(baseDamage) : baseDamage;
          if (isCritical) result.effects.push('critical');
        }

        // Apply damage to defender
        if (result.damage > 0) {
          await this.applyShipDamage(action.targetId, result.damage);
        }
      }
    }

    return result;
  }

  private async getShipInCombat(shipId: string): Promise<any> {
    return await executeSingleRowQuery('SELECT * FROM ships WHERE id = $1', [shipId]);
  }

  private async applyShipDamage(shipId: string, damage: number): Promise<void> {
    await executeUpdateQuery(
      'ships',
      { 
        health_current: `GREATEST(0, health_current - ${damage})`,
        updated_at: new Date()
      },
      'id = $1',
      [shipId]
    );
  }

  private async logCombatAction(combatId: string, userId: string, action: any, result: any): Promise<void> {
    const logEntry = {
      timestamp: new Date(),
      type: action.type,
      actorId: userId,
      targetId: action.targetId,
      action: action.type,
      result,
      metadata: action.parameters || {}
    };

    const combat = await executeSingleRowQuery(
      'SELECT battle_log FROM combat_sessions WHERE id = $1',
      [combatId]
    );

    const battleLog = JSON.parse(combat.battle_log);
    battleLog.push(logEntry);

    await executeUpdateQuery(
      'combat_sessions',
      { battle_log: JSON.stringify(battleLog) },
      'id = $1',
      [combatId]
    );
  }

  private async checkCombatEnd(combatId: string): Promise<{ ended: boolean; winner?: string; rewards?: any }> {
    // Get all participants and their ships' health
    const participants = await executeQuery(`
      SELECT cp.user_id, cp.ships, s.health_current, s.health_max
      FROM combat_participants cp
      JOIN ships s ON cp.ships @> ARRAY[s.id]::text[]
      WHERE cp.combat_session_id = $1 AND cp.disconnected = FALSE
    `, [combatId]);

    const aliveParticipants = participants.filter(p => p.health_current > 0);

    if (aliveParticipants.length <= 1) {
      const winner = aliveParticipants.length === 1 ? aliveParticipants[0].user_id : null;
      const rewards = winner ? await this.calculateCombatRewards(winner, combatId) : null;

      return { ended: true, winner, rewards };
    }

    return { ended: false };
  }

  private async calculateCombatRewards(winnerId: string, combatId: string): Promise<any> {
    // Simple reward calculation
    return {
      winner: winnerId,
      experience: 100,
      credits: 500,
      items: [],
      reputation: 10
    };
  }

  private async endCombat(combatId: string, winner: string, rewards: any): Promise<void> {
    await executeUpdateQuery(
      'combat_sessions',
      { 
        status: 'completed',
        end_time: new Date(),
        rewards: JSON.stringify(rewards),
        updated_at: new Date()
      },
      'id = $1',
      [combatId]
    );

    // Update winner statistics
    if (winner) {
      await executeUpdateQuery(
        'user_statistics',
        { battles_won: 'battles_won + 1' },
        'user_id = $1',
        [winner]
      );
    }
  }

  private async nextTurn(combatId: string): Promise<void> {
    const combat = await executeSingleRowQuery(
      'SELECT turn_order FROM combat_sessions WHERE id = $1',
      [combatId]
    );

    const turnOrder = JSON.parse(combat.turn_order);
    const currentIndex = turnOrder.findIndex((turn: any) => turn.userId === combat.current_turn);
    const nextIndex = (currentIndex + 1) % turnOrder.length;
    const nextTurn = turnOrder[nextIndex];

    await executeUpdateQuery(
      'combat_sessions',
      { current_turn: nextTurn.userId },
      'id = $1',
      [combatId]
    );
  }
}

export const combatService = new CombatService();
export default combatService;
