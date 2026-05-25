import { logger } from '@/utils/logger';
import { executeQuery, executeSingleRowQuery, executeInsertQuery, executeUpdateQuery, executeQueryWithTransaction } from '@/database/connection';
import { InventoryItem, ApiResponse, PaginatedResponse, ItemType, ItemRarity, ItemTypeCategory } from '@/types';

interface AddItemRequest {
  userId: string;
  itemId: ItemType;
  quantity: number;
  quality?: number;
  properties?: any;
  expiresAt?: Date;
}

interface EquipItemRequest {
  userId: string;
  itemId: string;
  slot: string;
}

interface UnequipItemRequest {
  userId: string;
  itemId: string;
}

interface UpdateItemRequest {
  userId: string;
  itemId: string;
  updates: Partial<InventoryItem>;
}

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  itemsByCategory: Record<ItemTypeCategory, number>;
  itemsByRarity: Record<ItemRarity, number>;
  equippedItems: number;
  totalSlots: number;
  usedSlots: number;
}

class InventoryService {
  private readonly maxSlots: number = 100;
  private readonly maxStackSize: Record<ItemTypeCategory, number> = {
    weapon: 1,
    armor: 1,
    module: 1,
    resource: 999
  };

  async getUserInventory(userId: string, options: {
    category?: ItemTypeCategory;
    rarity?: ItemRarity;
    equipped?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<ApiResponse<PaginatedResponse<InventoryItem>>> {
    try {
      const { 
        category, 
        rarity, 
        equipped, 
        search, 
        limit = 50, 
        offset = 0, 
        sortBy = 'created_at', 
        sortOrder = 'desc' 
      } = options;

      let query = `
        SELECT * FROM inventory_items 
        WHERE user_id = $1
      `;
      
      const params: any[] = [userId];
      let paramIndex = 2;

      if (category) {
        query += ` AND category = $${paramIndex++}`;
        params.push(category);
      }

      if (rarity) {
        query += ` AND rarity = $${paramIndex++}`;
        params.push(rarity);
      }

      if (equipped !== undefined) {
        query += ` AND equipped = $${paramIndex++}`;
        params.push(equipped);
      }

      if (search) {
        query += ` AND (name ILIKE $${paramIndex++} OR item_id ILIKE $${paramIndex++})`;
        params.push(`%${search}%`, `%${search}%`);
        paramIndex += 2;
      }

      // Get total count
      const countQuery = query.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) as total FROM');
      const countResult = await executeSingleRowQuery(countQuery, params);
      const totalCount = parseInt(countResult.total);

      // Add sorting and pagination
      query += ` ORDER BY ${sortBy} ${sortOrder}`;
      query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      params.push(limit, offset);

      const items = await executeQuery(query, params);

      return {
        success: true,
        data: {
          items,
          totalCount,
          hasMore: offset + items.length < totalCount,
          limit,
          offset
        }
      };

    } catch (error) {
      logger.error('Failed to get user inventory:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve inventory'
        }
      };
    }
  }

  async addItem(request: AddItemRequest): Promise<ApiResponse<InventoryItem>> {
    try {
      const { userId, itemId, quantity, quality = 100, properties = {}, expiresAt } = request;

      // Validate item exists in catalog
      const itemCatalog = await this.getItemFromCatalog(itemId);
      if (!itemCatalog) {
        return {
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Item not found in catalog'
          }
        };
      }

      // Check inventory space
      const spaceCheck = await this.checkInventorySpace(userId, itemCatalog.category, quantity);
      if (!spaceCheck.hasSpace) {
        return {
          success: false,
          error: {
            code: 'INVENTORY_FULL',
            message: 'Not enough inventory space'
          }
        };
      }

      // Add item(s) to inventory
      const result = await this.addItemsToInventory(userId, {
        itemId,
        name: itemCatalog.name,
        category: itemCatalog.category,
        rarity: itemCatalog.rarity,
        quantity,
        quality,
        properties: { ...itemCatalog.properties, ...properties },
        expiresAt
      });

      logger.info('Item added to inventory:', {
        userId,
        itemId,
        quantity,
        result: result.length
      });

      return {
        success: true,
        data: result[0]
      };

    } catch (error) {
      logger.error('Failed to add item to inventory:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to add item to inventory'
        }
      };
    }
  }

  async removeItem(userId: string, itemId: string, quantity: number = 1): Promise<ApiResponse<void>> {
    try {
      // Get item from inventory
      const inventoryItem = await executeSingleRowQuery(
        'SELECT * FROM inventory_items WHERE id = $1 AND user_id = $2',
        [itemId, userId]
      );

      if (!inventoryItem) {
        return {
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Item not found in inventory'
          }
        };
      }

      // Check if trying to remove more than available
      if (quantity > inventoryItem.quantity) {
        return {
          success: false,
          error: {
            code: 'INSUFFICIENT_QUANTITY',
            message: 'Cannot remove more items than available'
          }
        };
      }

      // Remove item or update quantity
      if (quantity === inventoryItem.quantity) {
        await executeUpdateQuery(
          'inventory_items',
          { quantity: 0, equipped: false, slot: null },
          'id = $1 AND user_id = $2',
          [itemId, userId]
        );
      } else {
        await executeUpdateQuery(
          'inventory_items',
          { quantity: inventoryItem.quantity - quantity },
          'id = $1 AND user_id = $2',
          [itemId, userId]
        );
      }

      logger.info('Item removed from inventory:', {
        userId,
        itemId,
        quantity
      });

      return {
        success: true
      };

    } catch (error) {
      logger.error('Failed to remove item from inventory:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to remove item from inventory'
        }
      };
    }
  }

  async equipItem(request: EquipItemRequest): Promise<ApiResponse<InventoryItem>> {
    try {
      const { userId, itemId, slot } = request;

      // Get item from inventory
      const inventoryItem = await executeSingleRowQuery(
        'SELECT * FROM inventory_items WHERE id = $1 AND user_id = $2',
        [itemId, userId]
      );

      if (!inventoryItem) {
        return {
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Item not found in inventory'
          }
        };
      }

      // Validate item can be equipped in this slot
      const validation = await this.validateEquipmentSlot(inventoryItem, slot);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'INVALID_SLOT',
            message: validation.message
          }
        };
      }

      // Unequip any item currently in the slot
      await this.unequipSlot(userId, slot);

      // Equip the new item
      const updatedItem = await executeUpdateQuery(
        'inventory_items',
        { equipped: true, slot },
        'id = $1 AND user_id = $2',
        [itemId, userId],
        ['*']
      );

      logger.info('Item equipped:', {
        userId,
        itemId,
        slot,
        itemName: inventoryItem.name
      });

      return {
        success: true,
        data: updatedItem
      };

    } catch (error) {
      logger.error('Failed to equip item:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to equip item'
        }
      };
    }
  }

  async unequipItem(request: UnequipItemRequest): Promise<ApiResponse<InventoryItem>> {
    try {
      const { userId, itemId } = request;

      // Get item from inventory
      const inventoryItem = await executeSingleRowQuery(
        'SELECT * FROM inventory_items WHERE id = $1 AND user_id = $2',
        [itemId, userId]
      );

      if (!inventoryItem) {
        return {
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Item not found in inventory'
          }
        };
      }

      if (!inventoryItem.equipped) {
        return {
          success: false,
          error: {
            code: 'ITEM_NOT_EQUIPPED',
            message: 'Item is not currently equipped'
          }
        };
      }

      // Unequip the item
      const updatedItem = await executeUpdateQuery(
        'inventory_items',
        { equipped: false, slot: null },
        'id = $1 AND user_id = $2',
        [itemId, userId],
        ['*']
      );

      logger.info('Item unequipped:', {
        userId,
        itemId,
        itemName: inventoryItem.name
      });

      return {
        success: true,
        data: updatedItem
      };

    } catch (error) {
      logger.error('Failed to unequip item:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to unequip item'
        }
      };
    }
  }

  async updateItem(request: UpdateItemRequest): Promise<ApiResponse<InventoryItem>> {
    try {
      const { userId, itemId, updates } = request;

      // Validate updates
      const allowedUpdates = ['quality', 'properties', 'durability', 'max_durability'];
      const invalidUpdates = Object.keys(updates).filter(key => !allowedUpdates.includes(key));
      
      if (invalidUpdates.length > 0) {
        return {
          success: false,
          error: {
            code: 'INVALID_UPDATES',
            message: `Invalid update fields: ${invalidUpdates.join(', ')}`
          }
        };
      }

      // Get item from inventory
      const inventoryItem = await executeSingleRowQuery(
        'SELECT * FROM inventory_items WHERE id = $1 AND user_id = $2',
        [itemId, userId]
      );

      if (!inventoryItem) {
        return {
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Item not found in inventory'
          }
        };
      }

      // Update item
      const updatedItem = await executeUpdateQuery(
        'inventory_items',
        { ...updates, updated_at: new Date() },
        'id = $1 AND user_id = $2',
        [itemId, userId],
        ['*']
      );

      logger.info('Item updated:', {
        userId,
        itemId,
        updates: Object.keys(updates)
      });

      return {
        success: true,
        data: updatedItem
      };

    } catch (error) {
      logger.error('Failed to update item:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update item'
        }
      };
    }
  }

  async getInventoryStats(userId: string): Promise<ApiResponse<InventoryStats>> {
    try {
      // Get total items and value
      const totalResult = await executeSingleRowQuery(`
        SELECT 
          COUNT(*) as total_items,
          SUM(CASE WHEN equipped THEN 1 ELSE 0 END) as equipped_items
        FROM inventory_items 
        WHERE user_id = $1 AND quantity > 0
      `, [userId]);

      // Get items by category
      const categoryResult = await executeQuery(`
        SELECT category, COUNT(*) as count
        FROM inventory_items 
        WHERE user_id = $1 AND quantity > 0
        GROUP BY category
      `, [userId]);

      // Get items by rarity
      const rarityResult = await executeQuery(`
        SELECT rarity, COUNT(*) as count
        FROM inventory_items 
        WHERE user_id = $1 AND quantity > 0
        GROUP BY rarity
      `, [userId]);

      const itemsByCategory: Record<ItemTypeCategory, number> = {
        weapon: 0,
        armor: 0,
        module: 0,
        resource: 0
      };

      const itemsByRarity: Record<ItemRarity, number> = {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
        mythic: 0
      };

      categoryResult.forEach(row => {
        itemsByCategory[row.category as ItemTypeCategory] = parseInt(row.count);
      });

      rarityResult.forEach(row => {
        itemsByRarity[row.rarity as ItemRarity] = parseInt(row.count);
      });

      const stats: InventoryStats = {
        totalItems: parseInt(totalResult.total_items),
        totalValue: 0, // Would calculate based on item values
        itemsByCategory,
        itemsByRarity,
        equippedItems: parseInt(totalResult.equipped_items),
        totalSlots: this.maxSlots,
        usedSlots: categoryResult.reduce((sum, row) => sum + parseInt(row.count), 0)
      };

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      logger.error('Failed to get inventory stats:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve inventory statistics'
        }
      };
    }
  }

  async getEquippedItems(userId: string): Promise<ApiResponse<InventoryItem[]>> {
    try {
      const items = await executeQuery(
        'SELECT * FROM inventory_items WHERE user_id = $1 AND equipped = TRUE AND quantity > 0',
        [userId]
      );

      return {
        success: true,
        data: items
      };

    } catch (error) {
      logger.error('Failed to get equipped items:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve equipped items'
        }
      };
    }
  }

  // Private helper methods
  private async getItemFromCatalog(itemId: ItemType): Promise<any> {
    // This would typically query an items catalog table
    // For now, we'll return a mock item based on the item ID
    const itemCatalog: Record<ItemType, any> = {
      'weapon_laser_cannon_mk1': {
        name: 'Laser Cannon MK1',
        category: 'weapon' as ItemTypeCategory,
        rarity: 'common' as ItemRarity,
        properties: {
          damage: 50,
          range: 300,
          fireRate: 2.0,
          energyCost: 10
        }
      },
      'weapon_plasma_cannon_mk1': {
        name: 'Plasma Cannon MK1',
        category: 'weapon' as ItemTypeCategory,
        rarity: 'uncommon' as ItemRarity,
        properties: {
          damage: 75,
          range: 350,
          fireRate: 1.5,
          energyCost: 20
        }
      },
      'armor_basic_plate': {
        name: 'Basic Armor Plate',
        category: 'armor' as ItemTypeCategory,
        rarity: 'common' as ItemRarity,
        properties: {
          defense: 25,
          weight: 10,
          durability: 100
        }
      },
      'module_shield_generator_mk1': {
        name: 'Shield Generator MK1',
        category: 'module' as ItemTypeCategory,
        rarity: 'uncommon' as ItemRarity,
        properties: {
          shieldCapacity: 100,
          rechargeRate: 10,
          energyCost: 5
        }
      },
      'resource_metal_ore': {
        name: 'Metal Ore',
        category: 'resource' as ItemTypeCategory,
        rarity: 'common' as ItemRarity,
        properties: {
          purity: 0.8,
          stackable: true,
          maxStack: 1000
        }
      }
      // Add more items as needed
    };

    return itemCatalog[itemId] || null;
  }

  private async checkInventorySpace(userId: string, category: ItemTypeCategory, quantity: number): Promise<{ hasSpace: boolean }> {
    // Check if user has enough inventory space
    const currentItems = await executeSingleRowQuery(
      'SELECT COUNT(*) as count FROM inventory_items WHERE user_id = $1 AND quantity > 0',
      [userId]
    );

    const usedSlots = parseInt(currentItems.count);
    const availableSlots = this.maxSlots - usedSlots;

    // For stackable items, check if existing stack can accommodate
    if (category === 'resource') {
      return { hasSpace: true }; // Resources are always stackable
    }

    return { hasSpace: availableSlots >= quantity };
  }

  private async addItemsToInventory(userId: string, itemData: any): Promise<InventoryItem[]> {
    // Check if item already exists and is stackable
    if (itemData.category === 'resource') {
      const existingItem = await executeSingleRowQuery(
        'SELECT * FROM inventory_items WHERE user_id = $1 AND item_id = $2',
        [userId, itemData.itemId]
      );

      if (existingItem) {
        // Update existing stack
        const updatedItem = await executeUpdateQuery(
          'inventory_items',
          { 
            quantity: existingItem.quantity + itemData.quantity,
            updated_at: new Date()
          },
          'id = $1',
          [existingItem.id],
          ['*']
        );
        return [updatedItem];
      }
    }

    // Add new item
    const newItem = await executeInsertQuery(
      'inventory_items',
      {
        user_id: userId,
        item_id: itemData.itemId,
        name: itemData.name,
        category: itemData.category,
        rarity: itemData.rarity,
        quantity: itemData.quantity,
        quality: itemData.quality,
        properties: itemData.properties,
        equipped: false,
        expires_at: itemData.expiresAt,
        created_at: new Date(),
        updated_at: new Date()
      },
      ['*']
    );

    return [newItem];
  }

  private async validateEquipmentSlot(item: InventoryItem, slot: string): Promise<{ isValid: boolean; message?: string }> {
    // This would validate that the item can be equipped in the specified slot
    // For now, we'll do basic validation
    const validSlots: Record<ItemTypeCategory, string[]> = {
      weapon: ['weapon_1', 'weapon_2', 'weapon_3', 'weapon_4'],
      armor: ['armor_head', 'armor_chest', 'armor_legs', 'armor_boots'],
      module: ['module_1', 'module_2', 'module_3', 'module_4', 'module_5', 'module_6'],
      resource: []
    };

    if (!validSlots[item.category].includes(slot)) {
      return {
        isValid: false,
        message: `Invalid slot for ${item.category} item`
      };
    }

    return { isValid: true };
  }

  private async unequipSlot(userId: string, slot: string): Promise<void> {
    await executeUpdateQuery(
      'inventory_items',
      { equipped: false, slot: null },
      'user_id = $1 AND slot = $2',
      [userId, slot]
    );
  }
}

export const inventoryService = new InventoryService();
export default inventoryService;
