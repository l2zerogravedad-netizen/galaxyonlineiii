import { logger } from '@/utils/logger';
import { executeQuery, executeSingleRowQuery, executeInsertQuery, executeUpdateQuery, executeQueryWithTransaction } from '@/database/connection';
import { MarketplaceListing, MarketplaceOffer, ApiResponse, PaginatedResponse } from '@/types';

interface CreateListingRequest {
  sellerId: string;
  itemId: string;
  quantity: number;
  price: number;
  currency: 'credits' | string;
  duration?: number; // in hours, default 7 days
}

interface BuyListingRequest {
  buyerId: string;
  listingId: string;
  offerAmount?: number;
  message?: string;
}

interface MakeOfferRequest {
  buyerId: string;
  listingId: string;
  amount: number;
  currency: 'credits' | string;
  message?: string;
}

interface MarketplaceStats {
  totalListings: number;
  activeListings: number;
  totalVolume: number;
  averagePrice: Record<string, number>;
  topSellers: Array<{
    userId: string;
    username: string;
    totalSales: number;
    totalRevenue: number;
  }>;
  priceHistory: Array<{
    itemId: string;
    timestamp: Date;
    price: number;
  }>;
}

class MarketplaceService {
  private readonly marketplaceFeeRate: number = 0.05; // 5%
  private readonly transactionFeeRate: number = 0.02; // 2%
  private readonly maxListingsPerUser: number = 50;
  private readonly minListingPrice: number = 10;
  private readonly maxListingPrice: number = 10000000;
  private readonly defaultListingDuration: number = 168; // 7 days in hours

  async createListing(request: CreateListingRequest): Promise<ApiResponse<MarketplaceListing>> {
    try {
      const { sellerId, itemId, quantity, price, currency, duration = this.defaultListingDuration } = request;

      // Validate request
      const validation = await this.validateListingRequest(sellerId, itemId, quantity, price, currency);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: validation.errorCode!,
            message: validation.message!
          }
        };
      }

      // Get item details
      const item = await this.getInventoryItem(itemId, sellerId);
      if (!item) {
        return {
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Item not found in inventory'
          }
        };
      }

      // Calculate fees
      const listingFee = Math.floor(price * this.marketplaceFeeRate);
      const totalPrice = price + listingFee;

      // Create listing in transaction
      const results = await executeQueryWithTransaction([
        // Remove item from inventory (or reduce quantity)
        {
          query: `
            UPDATE inventory_items 
            SET quantity = quantity - $1, updated_at = NOW()
            WHERE id = $2 AND user_id = $3 AND quantity >= $1
          `,
          params: [quantity, itemId, sellerId]
        },
        // Create marketplace listing
        {
          query: `
            INSERT INTO marketplace_listings 
            (seller_id, item_id, item_name, item_category, item_rarity, quantity, price, currency, status, properties, created_at, updated_at, expires_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', $9, NOW(), NOW(), NOW() + INTERVAL '${duration} hours')
            RETURNING *
          `,
          params: [
            sellerId,
            item.item_id,
            item.name,
            item.category,
            item.rarity,
            quantity,
            price,
            currency,
            item.properties
          ]
        },
        // Charge listing fee
        {
          query: `
            UPDATE resources 
            SET amount = amount - $1, updated_at = NOW()
            WHERE user_id = $2 AND type = 'credits' AND amount >= $1
          `,
          params: [listingFee, sellerId]
        },
        // Create transaction record
        {
          query: `
            INSERT INTO transactions (from_user_id, to_user_id, type, resource_type, amount, fee, status, reason, created_at)
            VALUES ($1, NULL, 'purchase', 'credits', $2, $3, 'completed', 'Marketplace listing fee', NOW())
          `,
          params: [sellerId, listingFee, 0]
        }
      ]);

      const listing = results[1][0];

      logger.info('Marketplace listing created:', {
        listingId: listing.id,
        sellerId,
        itemId,
        quantity,
        price,
        currency,
        fee: listingFee
      });

      return {
        success: true,
        data: listing
      };

    } catch (error) {
      logger.error('Failed to create marketplace listing:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create listing'
        }
      };
    }
  }

  async getListings(filters: {
    category?: string;
    rarity?: string;
    minPrice?: number;
    maxPrice?: number;
    sellerId?: string;
    search?: string;
    status?: 'active' | 'sold' | 'expired' | 'cancelled';
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<ApiResponse<PaginatedResponse<MarketplaceListing>>> {
    try {
      const {
        category,
        rarity,
        minPrice,
        maxPrice,
        sellerId,
        search,
        status = 'active',
        limit = 20,
        offset = 0,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = filters;

      let query = `
        SELECT ml.*, u.username as seller_username
        FROM marketplace_listings ml
        JOIN users u ON ml.seller_id = u.id
        WHERE 1=1
      `;
      
      const params: any[] = [];
      let paramIndex = 1;

      if (status) {
        query += ` AND ml.status = $${paramIndex++}`;
        params.push(status);
      }

      if (category) {
        query += ` AND ml.item_category = $${paramIndex++}`;
        params.push(category);
      }

      if (rarity) {
        query += ` AND ml.item_rarity = $${paramIndex++}`;
        params.push(rarity);
      }

      if (minPrice) {
        query += ` AND ml.price >= $${paramIndex++}`;
        params.push(minPrice);
      }

      if (maxPrice) {
        query += ` AND ml.price <= $${paramIndex++}`;
        params.push(maxPrice);
      }

      if (sellerId) {
        query += ` AND ml.seller_id = $${paramIndex++}`;
        params.push(sellerId);
      }

      if (search) {
        query += ` AND (ml.item_name ILIKE $${paramIndex++} OR ml.item_id ILIKE $${paramIndex++})`;
        params.push(`%${search}%`, `%${search}%`);
        paramIndex += 2;
      }

      // Get total count
      const countQuery = query.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) as total FROM');
      const countResult = await executeSingleRowQuery(countQuery, params);
      const totalCount = parseInt(countResult.total);

      // Add sorting and pagination
      query += ` ORDER BY ml.${sortBy} ${sortOrder}`;
      query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      params.push(limit, offset);

      const listings = await executeQuery(query, params);

      return {
        success: true,
        data: {
          items: listings,
          totalCount,
          hasMore: offset + listings.length < totalCount,
          limit,
          offset
        }
      };

    } catch (error) {
      logger.error('Failed to get marketplace listings:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve listings'
        }
      };
    }
  }

  async buyListing(request: BuyListingRequest): Promise<ApiResponse<any>> {
    try {
      const { buyerId, listingId, offerAmount, message } = request;

      // Get listing
      const listing = await this.getListing(listingId);
      if (!listing) {
        return {
          success: false,
          error: {
            code: 'LISTING_NOT_FOUND',
            message: 'Listing not found'
          }
        };
      }

      // Validate listing
      if (listing.status !== 'active') {
        return {
          success: false,
          error: {
            code: 'LISTING_NOT_ACTIVE',
            message: 'Listing is not active'
          }
        };
      }

      if (listing.seller_id === buyerId) {
        return {
          success: false,
          error: {
            code: 'CANNOT_BUY_OWN_LISTING',
            message: 'Cannot buy your own listing'
          }
        };
      }

      const finalPrice = offerAmount || listing.price;
      if (finalPrice < listing.price) {
        return {
          success: false,
          error: {
            code: 'INSUFFICIENT_OFFER',
            message: 'Offer amount is too low'
          }
        };
      }

      // Check buyer has sufficient funds
      const buyerFunds = await this.getUserCredits(buyerId);
      if (buyerFunds < finalPrice) {
        return {
          success: false,
          error: {
            code: 'INSUFFICIENT_FUNDS',
            message: 'Insufficient credits'
          }
        };
      }

      // Calculate fees
      const transactionFee = Math.floor(finalPrice * this.transactionFeeRate);
      const sellerReceive = finalPrice - transactionFee;

      // Execute transaction
      const results = await executeQueryWithTransaction([
        // Deduct from buyer
        {
          query: `
            UPDATE resources 
            SET amount = amount - $1, updated_at = NOW()
            WHERE user_id = $2 AND type = 'credits' AND amount >= $1
          `,
          params: [finalPrice, buyerId]
        },
        // Add to seller
        {
          query: `
            UPDATE resources 
            SET amount = amount + $1, updated_at = NOW()
            WHERE user_id = $2 AND type = 'credits'
          `,
          params: [sellerReceive, listing.seller_id]
        },
        // Add item to buyer inventory
        {
          query: `
            INSERT INTO inventory_items 
            (user_id, item_id, name, category, rarity, quantity, properties, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            ON CONFLICT (user_id, item_id) 
            DO UPDATE SET quantity = inventory_items.quantity + EXCLUDED.quantity, updated_at = NOW()
          `,
          params: [
            buyerId,
            listing.item_id,
            listing.item_name,
            listing.item_category,
            listing.item_rarity,
            listing.quantity,
            listing.properties
          ]
        },
        // Update listing status
        {
          query: `
            UPDATE marketplace_listings 
            SET status = 'sold', updated_at = NOW()
            WHERE id = $1
          `,
          params: [listingId]
        },
        // Create transaction records
        {
          query: `
            INSERT INTO transactions (from_user_id, to_user_id, type, resource_type, amount, fee, status, reason, created_at)
            VALUES ($1, $2, 'purchase', 'credits', $3, $4, 'completed', 'Marketplace purchase', NOW()),
            ($5, NULL, 'sale', 'credits', $6, $7, 'completed', 'Marketplace sale', NOW())
          `,
          params: [buyerId, listing.seller_id, finalPrice, transactionFee, listing.seller_id, sellerReceive, 0]
        }
      ]);

      logger.info('Marketplace purchase completed:', {
        listingId,
        buyerId,
        sellerId: listing.seller_id,
        finalPrice,
        transactionFee
      });

      return {
        success: true,
        data: {
          listing: results[3][0],
          transaction: {
            buyerPaid: finalPrice,
            sellerReceived: sellerReceive,
            fee: transactionFee
          }
        }
      };

    } catch (error) {
      logger.error('Failed to buy marketplace listing:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to complete purchase'
        }
      };
    }
  }

  async makeOffer(request: MakeOfferRequest): Promise<ApiResponse<MarketplaceOffer>> {
    try {
      const { buyerId, listingId, amount, currency, message } = request;

      // Get listing
      const listing = await this.getListing(listingId);
      if (!listing) {
        return {
          success: false,
          error: {
            code: 'LISTING_NOT_FOUND',
            message: 'Listing not found'
          }
        };
      }

      // Validate offer
      if (listing.status !== 'active') {
        return {
          success: false,
          error: {
            code: 'LISTING_NOT_ACTIVE',
            message: 'Listing is not active'
          }
        };
      }

      if (listing.seller_id === buyerId) {
        return {
          success: false,
          error: {
            code: 'CANNOT_OFFER_OWN_LISTING',
            message: 'Cannot make offer on your own listing'
          }
        };
      }

      if (amount <= 0) {
        return {
          success: false,
          error: {
            code: 'INVALID_OFFER_AMOUNT',
            message: 'Offer amount must be positive'
          }
        };
      }

      // Create offer
      const offer = await executeInsertQuery(
        'marketplace_offers',
        {
          listing_id: listingId,
          buyer_id: buyerId,
          amount,
          currency,
          message,
          status: 'pending',
          created_at: new Date(),
          updated_at: new Date()
        },
        ['*']
      );

      logger.info('Marketplace offer created:', {
        offerId: offer.id,
        listingId,
        buyerId,
        amount,
        currency
      });

      return {
        success: true,
        data: offer
      };

    } catch (error) {
      logger.error('Failed to make marketplace offer:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to make offer'
        }
      };
    }
  }

  async cancelListing(userId: string, listingId: string): Promise<ApiResponse<void>> {
    try {
      // Get listing
      const listing = await this.getListing(listingId);
      if (!listing) {
        return {
          success: false,
          error: {
            code: 'LISTING_NOT_FOUND',
            message: 'Listing not found'
          }
        };
      }

      // Validate ownership
      if (listing.seller_id !== userId) {
        return {
          success: false,
          error: {
            code: 'NOT_OWNER',
            message: 'You can only cancel your own listings'
          }
        };
      }

      // Validate status
      if (listing.status !== 'active') {
        return {
          success: false,
          error: {
            code: 'LISTING_NOT_ACTIVE',
            message: 'Cannot cancel non-active listing'
          }
        };
      }

      // Return item to inventory and cancel listing
      await executeQueryWithTransaction([
        // Return item to inventory
        {
          query: `
            INSERT INTO inventory_items 
            (user_id, item_id, name, category, rarity, quantity, properties, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            ON CONFLICT (user_id, item_id) 
            DO UPDATE SET quantity = inventory_items.quantity + EXCLUDED.quantity, updated_at = NOW()
          `,
          params: [
            userId,
            listing.item_id,
            listing.item_name,
            listing.item_category,
            listing.item_rarity,
            listing.quantity,
            listing.properties
          ]
        },
        // Update listing status
        {
          query: `
            UPDATE marketplace_listings 
            SET status = 'cancelled', updated_at = NOW()
            WHERE id = $1
          `,
          params: [listingId]
        }
      ]);

      logger.info('Marketplace listing cancelled:', {
        listingId,
        userId,
        itemId: listing.item_id,
        quantity: listing.quantity
      });

      return {
        success: true
      };

    } catch (error) {
      logger.error('Failed to cancel marketplace listing:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to cancel listing'
        }
      };
    }
  }

  async getMarketplaceStats(): Promise<ApiResponse<MarketplaceStats>> {
    try {
      // Get total and active listings
      const listingStats = await executeSingleRowQuery(`
        SELECT 
          COUNT(*) as total_listings,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_listings,
          COALESCE(SUM(CASE WHEN status = 'sold' THEN price * quantity END), 0) as total_volume
        FROM marketplace_listings
      `);

      // Get average prices by item
      const avgPrices = await executeQuery(`
        SELECT 
          item_id,
          AVG(price) as avg_price
        FROM marketplace_listings 
        WHERE status = 'sold' 
        GROUP BY item_id
      `);

      const averagePrice: Record<string, number> = {};
      avgPrices.forEach(row => {
        averagePrice[row.item_id] = parseFloat(row.avg_price);
      });

      // Get top sellers
      const topSellers = await executeQuery(`
        SELECT 
          ml.seller_id,
          u.username,
          COUNT(*) as total_sales,
          COALESCE(SUM(ml.price * ml.quantity), 0) as total_revenue
        FROM marketplace_listings ml
        JOIN users u ON ml.seller_id = u.id
        WHERE ml.status = 'sold'
        GROUP BY ml.seller_id, u.username
        ORDER BY total_revenue DESC
        LIMIT 10
      `);

      // Get recent price history
      const priceHistory = await executeQuery(`
        SELECT 
          item_id,
          price,
          created_at as timestamp
        FROM marketplace_listings 
        WHERE status = 'sold' 
          AND created_at > NOW() - INTERVAL '7 days'
        ORDER BY created_at DESC
        LIMIT 100
      `);

      const stats: MarketplaceStats = {
        totalListings: parseInt(listingStats.total_listings),
        activeListings: parseInt(listingStats.active_listings),
        totalVolume: parseFloat(listingStats.total_volume),
        averagePrice,
        topSellers: topSellers.map(seller => ({
          userId: seller.seller_id,
          username: seller.username,
          totalSales: parseInt(seller.total_sales),
          totalRevenue: parseFloat(seller.total_revenue)
        })),
        priceHistory: priceHistory.map(record => ({
          itemId: record.item_id,
          timestamp: record.timestamp,
          price: parseFloat(record.price)
        }))
      };

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      logger.error('Failed to get marketplace stats:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve marketplace statistics'
        }
      };
    }
  }

  // Private helper methods
  private async validateListingRequest(
    sellerId: string,
    itemId: string,
    quantity: number,
    price: number,
    currency: string
  ): Promise<{ isValid: boolean; errorCode?: string; message?: string }> {
    // Check user's listing limit
    const userListingCount = await executeSingleRowQuery(
      'SELECT COUNT(*) as count FROM marketplace_listings WHERE seller_id = $1 AND status = \'active\'',
      [sellerId]
    );

    if (parseInt(userListingCount.count) >= this.maxListingsPerUser) {
      return {
        isValid: false,
        errorCode: 'LISTING_LIMIT_EXCEEDED',
        message: `Maximum ${this.maxListingsPerUser} active listings allowed`
      };
    }

    // Validate price
    if (price < this.minListingPrice) {
      return {
        isValid: false,
        errorCode: 'PRICE_TOO_LOW',
        message: `Minimum listing price is ${this.minListingPrice} credits`
      };
    }

    if (price > this.maxListingPrice) {
      return {
        isValid: false,
        errorCode: 'PRICE_TOO_HIGH',
        message: `Maximum listing price is ${this.maxListingPrice} credits`
      };
    }

    // Validate quantity
    if (quantity <= 0) {
      return {
        isValid: false,
        errorCode: 'INVALID_QUANTITY',
        message: 'Quantity must be positive'
      };
    }

    // Validate currency
    if (currency !== 'credits') {
      return {
        isValid: false,
        errorCode: 'INVALID_CURRENCY',
        message: 'Only credits are supported as currency'
      };
    }

    return { isValid: true };
  }

  private async getInventoryItem(itemId: string, userId: string): Promise<any> {
    return await executeSingleRowQuery(
      'SELECT * FROM inventory_items WHERE id = $1 AND user_id = $2 AND quantity > 0',
      [itemId, userId]
    );
  }

  private async getListing(listingId: string): Promise<any> {
    return await executeSingleRowQuery(
      'SELECT * FROM marketplace_listings WHERE id = $1',
      [listingId]
    );
  }

  private async getUserCredits(userId: string): Promise<number> {
    const result = await executeSingleRowQuery(
      'SELECT credits FROM users WHERE id = $1',
      [userId]
    );
    return result ? parseInt(result.credits) : 0;
  }
}

export const marketplaceService = new MarketplaceService();
export default marketplaceService;
