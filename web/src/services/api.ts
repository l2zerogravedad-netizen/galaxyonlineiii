import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, ApiError } from '@/types';

class ApiService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();
        
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleApiError(error: AxiosError): void {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as ApiResponse;
      
      console.error(`❌ API Error ${status}:`, data.error?.message || 'Unknown error');
      
      // Handle specific error cases
      switch (status) {
        case 401:
          // Unauthorized - clear tokens and redirect to login
          this.clearAuthTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          break;
        case 403:
          // Forbidden - user doesn't have permission
          console.warn('⚠️ Access forbidden');
          break;
        case 404:
          // Not found
          console.warn('⚠️ Resource not found');
          break;
        case 429:
          // Rate limited
          console.warn('⚠️ Too many requests');
          break;
        case 500:
          // Server error
          console.error('💥 Server error');
          break;
      }
    } else if (error.request) {
      console.error('❌ Network Error:', error.message);
    } else {
      console.error('❌ Unknown Error:', error.message);
    }
  }

  private clearAuthTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
    }
  }

  // Generic HTTP methods
  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): ApiError {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    
    if (error.response) {
      return {
        code: `HTTP_${error.response.status}`,
        message: error.response.statusText || 'Unknown error',
      };
    }
    
    if (error.request) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error - please check your connection',
      };
    }
    
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
    };
  }

  // Authentication methods
  async login(email: string, password: string, clientType: string = 'web') {
    return this.post('/api/v1/auth/login', { email, password, clientType });
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    clientType?: string;
  }) {
    return this.post('/api/v1/auth/register', { ...userData, clientType: 'web' });
  }

  async refreshToken(refreshToken: string) {
    return this.post('/api/v1/auth/refresh', { refreshToken });
  }

  async logout() {
    return this.post('/api/v1/auth/logout');
  }

  async logoutAll() {
    return this.post('/api/v1/auth/logout-all');
  }

  async verifyToken(token: string) {
    return this.post('/api/v1/auth/verify', { token });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.post('/api/v1/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  // User methods
  async getUserProfile() {
    return this.get('/api/v1/users/profile');
  }

  async updateUserProfile(updates: any) {
    return this.put('/api/v1/users/profile', updates);
  }

  async getUserStatistics() {
    return this.get('/api/v1/users/statistics');
  }

  // Economy methods
  async getUserResources() {
    return this.get('/api/v1/economy/resources');
  }

  async updateProduction(deltaTime: number) {
    return this.post('/api/v1/economy/production/update', { deltaTime });
  }

  async transferResources(transferData: {
    toUserId: string;
    resourceType: string;
    amount: number;
    message?: string;
  }) {
    return this.post('/api/v1/economy/transfer', transferData);
  }

  async getTransactions(params?: {
    type?: string;
    limit?: number;
    offset?: number;
  }) {
    return this.get('/api/v1/economy/transactions', params);
  }

  async getEconomyStats() {
    return this.get('/api/v1/economy/stats');
  }

  // Inventory methods
  async getInventory(params?: {
    category?: string;
    rarity?: string;
    equipped?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    return this.get('/api/v1/inventory', params);
  }

  async addItem(itemData: {
    itemId: string;
    quantity: number;
    quality?: number;
    properties?: any;
  }) {
    return this.post('/api/v1/inventory/items', itemData);
  }

  async removeItem(itemId: string, quantity?: number) {
    return this.delete(`/api/v1/inventory/items/${itemId}${quantity ? `?quantity=${quantity}` : ''}`);
  }

  async equipItem(itemId: string, slot: string) {
    return this.post('/api/v1/inventory/items/equip', { itemId, slot });
  }

  async unequipItem(itemId: string) {
    return this.post('/api/v1/inventory/items/unequip', { itemId });
  }

  async updateItem(itemId: string, updates: any) {
    return this.put(`/api/v1/inventory/items/${itemId}`, updates);
  }

  async getInventoryStats() {
    return this.get('/api/v1/inventory/stats');
  }

  async getEquippedItems() {
    return this.get('/api/v1/inventory/equipped');
  }

  // Marketplace methods
  async getMarketplaceListings(params?: {
    category?: string;
    rarity?: string;
    minPrice?: number;
    maxPrice?: number;
    sellerId?: string;
    search?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    return this.get('/api/v1/marketplace/listings', params);
  }

  async createListing(listingData: {
    itemId: string;
    quantity: number;
    price: number;
    currency: string;
    duration?: number;
  }) {
    return this.post('/api/v1/marketplace/listings', listingData);
  }

  async buyListing(listingId: string, offerAmount?: number, message?: string) {
    return this.post(`/api/v1/marketplace/listings/${listingId}/buy`, {
      offerAmount,
      message,
    });
  }

  async makeOffer(listingId: string, offerData: {
    amount: number;
    currency: string;
    message?: string;
  }) {
    return this.post(`/api/v1/marketplace/listings/${listingId}/offers`, offerData);
  }

  async cancelListing(listingId: string) {
    return this.delete(`/api/v1/marketplace/listings/${listingId}`);
  }

  async getMarketplaceStats() {
    return this.get('/api/v1/marketplace/stats');
  }

  // Combat methods
  async getCombatSessions(params?: {
    status?: string;
    battleType?: string;
    limit?: number;
    offset?: number;
  }) {
    return this.get('/api/v1/combat/sessions', params);
  }

  async initiateCombat(combatData: {
    participants: string[];
    battleType: string;
    location: {
      systemId: string;
      coordinates: { x: number; y: number; z: number };
    };
    settings?: any;
  }) {
    return this.post('/api/v1/combat/sessions', combatData);
  }

  async executeCombatAction(combatId: string, actionData: {
    shipId: string;
    action: {
      type: string;
      targetId?: string;
      targetPosition?: { x: number; y: number; z: number };
      abilityId?: string;
      parameters?: any;
    };
  }) {
    return this.post(`/api/v1/combat/sessions/${combatId}/actions`, actionData);
  }

  async joinCombat(combatId: string) {
    return this.post(`/api/v1/combat/sessions/${combatId}/join`);
  }

  async leaveCombat(combatId: string) {
    return this.post(`/api/v1/combat/sessions/${combatId}/leave`);
  }

  async getCombatStats() {
    return this.get('/api/v1/combat/stats');
  }

  // Ship methods
  async getShips() {
    return this.get('/api/v1/ships');
  }

  async getShip(shipId: string) {
    return this.get(`/api/v1/ships/${shipId}`);
  }

  async updateShip(shipId: string, updates: any) {
    return this.put(`/api/v1/ships/${shipId}`, updates);
  }

  async equipShipItem(shipId: string, itemId: string, slot: string) {
    return this.post(`/api/v1/ships/${shipId}/equip`, { itemId, slot });
  }

  async unequipShipItem(shipId: string, slot: string) {
    return this.post(`/api/v1/ships/${shipId}/unequip`, { slot });
  }

  // Alliance methods
  async getAlliance() {
    return this.get('/api/v1/alliance');
  }

  async createAlliance(allianceData: {
    name: string;
    tag: string;
    description?: string;
  }) {
    return this.post('/api/v1/alliance', allianceData);
  }

  async updateAlliance(updates: any) {
    return this.put('/api/v1/alliance', updates);
  }

  async getAllianceMembers() {
    return this.get('/api/v1/alliance/members');
  }

  async inviteToAlliance(userId: string) {
    return this.post('/api/v1/alliance/invite', { userId });
  }

  async leaveAlliance() {
    return this.post('/api/v1/alliance/leave');
  }

  // WebSocket connection info
  getWebSocketUrl(): string {
    const wsProtocol = this.baseURL.startsWith('https') ? 'wss' : 'ws';
    const wsUrl = this.baseURL.replace(/^https?/, wsProtocol);
    return `${wsUrl}/socket.io`;
  }
}

// Create singleton instance
export const apiService = new ApiService();
export default apiService;
