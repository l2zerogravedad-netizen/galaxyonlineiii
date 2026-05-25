# 📚 DOCUMENTACIÓN API PARA CLIENTE WEB (CURSOR) - DESTOCK SPACE

## 📋 **RESUMEN EJECUTIVO**

Documentación completa de la API REST y WebSocket para el cliente web de DESTOCK SPACE, desarrollado con Cursor. Incluye todos los endpoints necesarios para sincronizar con el cliente Unity PC y mantener consistencia total del juego.

---

## 🔌 **CONFIGURACIÓN BASE**

### **🌐 URLs de API**
```javascript
// Producción
const API_BASE_URL = 'https://api.destockspace.com/v1';
const WS_URL = 'wss://api.destockspace.com/ws';

// Desarrollo
const API_BASE_URL = 'http://localhost:3000/v1';
const WS_URL = 'ws://localhost:3000/ws';
```

### **🔑 Headers Requeridos**
```javascript
const headers = {
  'Content-Type': 'application/json',
  'X-Client-Type': 'WEB', // Importante: Identificar como cliente web
  'X-Client-Version': '1.0.0',
  'Authorization': `Bearer ${accessToken}` // Para endpoints protegidos
};
```

---

## 🔐 **AUTENTICACIÓN**

### **POST /auth/login**
```javascript
// Request
const loginRequest = {
  email: 'player@destockspace.com',
  password: 'securePassword123',
  clientType: 'WEB'
};

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "username": "SpaceCommander",
      "email": "player@destockspace.com",
      "level": 25,
      "experience": 15000,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
    },
    "session": {
      "sessionId": "session-456",
      "expiresAt": "2024-01-15T11:30:00Z"
    }
  }
}
```

### **POST /auth/register**
```javascript
// Request
const registerRequest = {
  username: 'NewPlayer',
  email: 'newplayer@destockspace.com',
  password: 'newPassword123',
  clientType: 'WEB',
  referralCode: 'REFERRAL123' // Opcional
};

// Response
{
  "success": true,
  "data": {
    "user": { /* UserData */ },
    "tokens": { /* TokenData */ },
    "welcomePackage": {
      "resources": [
        { "type": "metal", "amount": 1000 },
        { "type": "plasma", "amount": 500 }
      ],
      "items": [
        { "itemId": "basic-fighter", "quantity": 1 }
      ],
      "ships": [
        { "shipId": "starter-ship", "name": "Starter Ship" }
      ]
    }
  }
}
```

### **POST /auth/refresh**
```javascript
// Request
const refreshRequest = {
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  clientType: 'WEB'
};

// Response
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "new-access-token",
      "refreshToken": "new-refresh-token",
      "expiresIn": 3600
    },
    "session": { /* SessionData */ }
  }
}
```

---

## 👤 **USUARIOS**

### **GET /users/profile**
```javascript
// Response
{
  "success": true,
  "data": {
    "id": "user-123",
    "username": "SpaceCommander",
    "email": "player@destockspace.com",
    "level": 25,
    "experience": 15000,
    "avatar": "https://cdn.destockspace.com/avatars/user-123.png",
    "title": "Fleet Admiral",
    "alliance": {
      "id": "alliance-789",
      "name": "Space Warriors",
      "rank": "Leader"
    },
    "statistics": {
      "totalPlayTime": 86400,
      "battlesWon": 150,
      "battlesLost": 45,
      "resourcesCollected": 1000000,
      "itemsCrafted": 250
    },
    "preferences": {
      "language": "en",
      "notifications": {
        "combat": true,
        "trade": true,
        "alliance": true
      },
      "privacy": {
        "profileVisible": true,
        "showOnlineStatus": true
      }
    }
  }
}
```

### **PUT /users/profile**
```javascript
// Request
const updateProfileRequest = {
  username: "NewUsername",
  avatar: "https://cdn.destockspace.com/avatars/new-avatar.png",
  title: "Space Legend",
  preferences: {
    language: "es",
    notifications: {
      combat: false,
      trade: true,
      alliance: true
    }
  }
};
```

---

## 💰 **ECONOMÍA**

### **GET /economy/resources**
```javascript
// Query Parameters
// ?userId=user-123&resourceType=metal

// Response
{
  "success": true,
  "data": {
    "resources": [
      {
        "type": "metal",
        "amount": 25000.50,
        "maxAmount": 100000,
        "productionRate": 150.25,
        "lastUpdated": "2024-01-15T10:30:00Z"
      },
      {
        "type": "plasma",
        "amount": 8500.75,
        "maxAmount": 50000,
        "productionRate": 75.50,
        "lastUpdated": "2024-01-15T10:30:00Z"
      },
      {
        "type": "energy",
        "amount": 45000,
        "maxAmount": 75000,
        "productionRate": 200,
        "lastUpdated": "2024-01-15T10:30:00Z"
      }
    ],
    "production": [
      {
        "resourceType": "metal",
        "rate": 150.25,
        "buildings": 3
      }
    ],
    "storage": [
      {
        "resourceType": "metal",
        "current": 25000.50,
        "max": 100000,
        "percentage": 25.01
      }
    ],
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

### **POST /economy/resources/transfer**
```javascript
// Request
const transferRequest = {
  fromUserId: "user-123",
  toUserId: "user-456",
  resourceType: "metal",
  amount: 1000,
  reason: "Trade payment"
};

// Response
{
  "success": true,
  "data": {
    "transactionId": "transaction-789",
    "status": "completed",
    "fromBalance": 24000.50,
    "toBalance": 11000,
    "timestamp": "2024-01-15T10:35:00Z",
    "fee": 10.0
  }
}
```

### **GET /economy/transactions**
```javascript
// Query Parameters
// ?userId=user-123&type=transfer&limit=20&offset=0

// Response
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "transaction-789",
        "type": "transfer",
        "fromUserId": "user-123",
        "toUserId": "user-456",
        "resourceType": "metal",
        "amount": 1000,
        "fee": 10,
        "status": "completed",
        "timestamp": "2024-01-15T10:35:00Z",
        "reason": "Trade payment"
      }
    ],
    "totalCount": 150,
    "hasMore": true
  }
}
```

---

## 📦 **INVENTARIO**

### **GET /inventory**
```javascript
// Response
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "item-123",
        "itemId": "laser-cannon-mk2",
        "name": "Laser Cannon MK2",
        "type": "weapon",
        "rarity": "rare",
        "quantity": 3,
        "quality": 85,
        "properties": {
          "damage": 150,
          "range": 500,
          "fireRate": 2.5
        },
        "equipped": true,
        "slot": "weapon-1"
      }
    ],
    "categories": [
      {
        "name": "weapons",
        "count": 15,
        "icon": "sword-icon"
      }
    ],
    "totalItems": 45,
    "maxSlots": 100,
    "usedSlots": 45
  }
}
```

### **POST /inventory/items**
```javascript
// Request
const addItemRequest = {
  itemId: "plasma-cannon-mk1",
  quantity: 2,
  properties: {
    "damage": 200,
    "range": 600
  },
  source: "purchase"
};

// Response
{
  "success": true,
  "data": {
    "item": {
      "id": "item-456",
      "itemId": "plasma-cannon-mk1",
      "name": "Plasma Cannon MK1",
      "type": "weapon",
      "quantity": 2,
      "properties": { /* ItemProperties */ }
    },
    "inventory": { /* UpdatedInventory */ },
    "notification": "2x Plasma Cannon MK1 added to inventory"
  }
}
```

### **PUT /inventory/items/:itemId/equip**
```javascript
// Request
const equipItemRequest = {
  slot: "weapon-2",
  replaceExisting: true
};

// Response
{
  "success": true,
  "data": {
    "success": true,
    "equippedItem": {
      "id": "item-123",
      "itemId": "laser-cannon-mk2",
      "slot": "weapon-2"
    },
    "previousItem": {
      "id": "item-789",
      "itemId": "laser-cannon-mk1",
      "slot": null
    },
    "updatedStats": {
      "attackPower": 150,
      "weaponCount": 2
    }
  }
}
```

---

## 🛒 **MARKETPLACE**

### **GET /marketplace/listings**
```javascript
// Query Parameters
// ?itemType=weapon&rarity=rare&minPrice=100&maxPrice=1000&sortBy=price&sortOrder=asc&limit=20&offset=0

// Response
{
  "success": true,
  "data": {
    "listings": [
      {
        "id": "listing-123",
        "seller": {
          "id": "user-456",
          "username": "WeaponDealer",
          "reputation": 4.8
        },
        "item": {
          "itemId": "laser-cannon-mk3",
          "name": "Laser Cannon MK3",
          "type": "weapon",
          "rarity": "epic"
        },
        "price": 750.50,
        "currency": "credits",
        "quantity": 1,
        "status": "active",
        "createdAt": "2024-01-15T09:00:00Z",
        "expiresAt": "2024-01-22T09:00:00Z"
      }
    ],
    "totalCount": 150,
    "filters": {
      "itemTypes": ["weapon", "armor", "module"],
      "rarities": ["common", "rare", "epic"],
      "priceRange": {
        "min": 10,
        "max": 10000
      }
    },
    "hasMore": true
  }
}
```

### **POST /marketplace/listings**
```javascript
// Request
const createListingRequest = {
  itemId: "item-123",
  quantity: 1,
  price: 500,
  currency: "credits",
  duration: 168 // horas (1 semana)
};

// Response
{
  "success": true,
  "data": {
    "listing": {
      "id": "listing-789",
      "seller": { /* SellerData */ },
      "item": { /* ItemData */ },
      "price": 500,
      "currency": "credits",
      "quantity": 1,
      "status": "active",
      "createdAt": "2024-01-15T10:40:00Z",
      "expiresAt": "2024-01-22T10:40:00Z"
    },
    "fee": 25.0,
    "listingFee": 5.0
  }
}
```

### **POST /marketplace/listings/:listingId/buy**
```javascript
// Request
const buyListingRequest = {
  quantity: 1,
  useCredits: true
};

// Response
{
  "success": true,
  "data": {
    "success": true,
    "transaction": {
      "id": "transaction-456",
      "type": "purchase",
      "listingId": "listing-123",
      "buyerId": "user-123",
      "sellerId": "user-456",
      "amount": 500,
      "currency": "credits",
      "timestamp": "2024-01-15T10:45:00Z"
    },
    "item": {
      "id": "item-789",
      "itemId": "laser-cannon-mk3",
      "name": "Laser Cannon MK3"
    },
    "remainingQuantity": 0
  }
}
```

---

## 🚀 **NAVES**

### **GET /ships/fleet**
```javascript
// Response
{
  "success": true,
  "data": {
    "ships": [
      {
        "id": "ship-123",
        "name": "USS Enterprise",
        "type": "cruiser",
        "class": "heavy",
        "level": 15,
        "experience": 7500,
        "health": {
          "current": 850,
          "max": 1000,
          "regeneration": 5
        },
        "stats": {
          "attackPower": 250,
          "defense": 180,
          "speed": 75,
          "maneuverability": 60
        },
        "equipment": {
          "weapons": [
            {
              "id": "weapon-123",
              "itemId": "laser-cannon-mk2",
              "slot": "weapon-1"
            }
          ],
          "armor": [
            {
              "id": "armor-123",
              "itemId": "titanium-armor-mk1",
              "slot": "armor-1"
            }
          ],
          "modules": [
            {
              "id": "module-123",
              "itemId": "shield-generator-mk1",
              "slot": "module-1"
            }
          ]
        },
        "crew": {
          "commander": {
            "id": "commander-123",
            "name": "James Kirk",
            "level": 20,
            "skills": ["leadership", "tactics"]
          },
          "officers": [
            {
              "id": "officer-123",
              "name": "Spock",
              "role": "science"
            }
          ],
          "crew": 150,
          "maxCrew": 200
        },
        "position": {
          "x": 1000.5,
          "y": 500.25,
          "z": -200.75,
          "systemId": "system-alpha"
        },
        "status": "active"
      }
    ],
    "totalShips": 5,
    "maxShips": 10,
    "fleetPower": 1250,
    "formations": [
      {
        "id": "formation-123",
        "name": "Attack Formation",
        "ships": ["ship-123", "ship-456"]
      }
    ]
  }
}
```

### **POST /ships**
```javascript
// Request
const createShipRequest = {
  name: "New Ship",
  type: "fighter",
  hull: "light",
  equipment: {
    weapons: ["laser-cannon-mk1"],
    armor: ["basic-armor"],
    modules: ["basic-engine"]
  },
  commander: "commander-456"
};

// Response
{
  "success": true,
  "data": {
    "ship": {
      "id": "ship-789",
      "name": "New Ship",
      "type": "fighter",
      "level": 1,
      "experience": 0,
      "health": { /* HealthData */ },
      "equipment": { /* EquipmentData */ }
    },
    "cost": {
      "resources": [
        { "type": "metal", "amount": 5000 },
        { "type": "plasma", "amount": 2000 }
      ],
      "credits": 10000
    },
    "constructionTime": 300 // segundos
  }
}
```

---

## ⚔️ **COMBATE**

### **POST /combat/initiate**
```javascript
// Request
const initiateCombatRequest = {
  attackerId: "user-123",
  defenderId: "user-456",
  attackerFleet: ["ship-123", "ship-456"],
  defenderFleet: ["ship-789", "ship-012"],
  location: {
    systemId: "system-alpha",
    coordinates: [1000, 500, -200]
  },
  battleType: "pvp"
};

// Response
{
  "success": true,
  "data": {
    "combatId": "combat-123",
    "battle": {
      "id": "combat-123",
      "status": "active",
      "participants": ["user-123", "user-456"],
      "startTime": "2024-01-15T10:50:00Z"
    },
    "turnOrder": [
      {
        "userId": "user-123",
        "shipId": "ship-123",
        "initiative": 85
      }
    ],
    "timeLimit": 300,
    "participants": [
      {
        "userId": "user-123",
        "ships": ["ship-123", "ship-456"],
        "ready": true
      }
    ]
  }
}
```

### **POST /combat/:combatId/actions**
```javascript
// Request
const combatActionRequest = {
  shipId: "ship-123",
  action: {
    type: "attack",
    targetId: "ship-789",
    weaponId: "weapon-123",
    parameters: {
      "power": 1.0,
      "accuracy": 0.85
    }
  }
};

// Response
{
  "success": true,
  "data": {
    "success": true,
    "result": {
      "actionId": "action-123",
      "damage": 150,
      "critical": false,
      "effects": ["shield_hit"]
    },
    "battleState": {
      "combatId": "combat-123",
      "currentTurn": "user-123",
      "timeRemaining": 250
    },
    "nextTurn": "user-456",
    "timeRemaining": 250
  }
}
```

### **GET /combat/:combatId/status**
```javascript
// Response
{
  "success": true,
  "data": {
    "combatId": "combat-123",
    "status": "active",
    "currentTurn": "user-123",
    "timeRemaining": 250,
    "participants": [
      {
        "userId": "user-123",
        "ships": [
          {
            "shipId": "ship-123",
            "health": 850,
            "status": "active"
          }
        ]
      }
    ],
    "battleLog": [
      {
        "timestamp": "2024-01-15T10:51:00Z",
        "action": "attack",
        "actor": "user-123",
        "target": "user-456",
        "damage": 150
      }
    ],
    "winner": null,
    "rewards": null
  }
}
```

---

## 📡 **WEBSOCKET EVENTS**

### **🔌 Conexión**
```javascript
const ws = new WebSocket('wss://api.destockspace.com/ws');

// Autenticación
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: accessToken,
    clientType: 'WEB'
  }));
};
```

### **📢 Eventos de Economía**
```javascript
// Actualización de recursos
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'resource:update':
      handleResourceUpdate(message);
      break;
    case 'transaction:complete':
      handleTransactionComplete(message);
      break;
  }
};

const handleResourceUpdate = (message) => {
  const { userId, resources, timestamp } = message;
  // Actualizar UI de recursos
  updateResourceDisplay(resources);
};
```

### **📦 Eventos de Inventario**
```javascript
const handleInventoryUpdate = (message) => {
  const { userId, inventory, timestamp } = message;
  // Actualizar UI de inventario
  updateInventoryDisplay(inventory);
};

const handleItemAdded = (message) => {
  const { userId, item, source, timestamp } = message;
  // Mostrar notificación de nuevo item
  showItemNotification(item, source);
};
```

### **🛒 Eventos de Marketplace**
```javascript
const handleListingCreated = (message) => {
  const { listing } = message;
  // Actualizar marketplace
  addNewListing(listing);
};

const handleListingSold = (message) => {
  const { listingId, buyerId, sellerId, timestamp } = message;
  // Actualizar marketplace
  removeSoldListing(listingId);
  
  // Notificar si es mi listing
  if (sellerId === currentUserId) {
    showSoldNotification(listingId);
  }
};
```

### **⚔️ Eventos de Combate**
```javascript
const handleCombatInitiated = (message) => {
  const { combatId, participants, location, timestamp } = message;
  // Mostrar UI de combate
  showCombatUI(combatId, participants);
};

const handleCombatAction = (message) => {
  const { combatId, actorId, action, result, timestamp } = message;
  // Actualizar UI de combate
  updateCombatDisplay(combatId, action, result);
};
```

---

## 🎯 **IMPLEMENTACIÓN EN REACT/CURSOR**

### **🔧 API Service**
```typescript
// api-service.ts
class APIService {
  private baseURL = 'https://api.destockspace.com/v1';
  private accessToken: string | null = null;
  
  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': 'WEB'
      },
      body: JSON.stringify({ email, password, clientType: 'WEB' })
    });
    
    const data = await response.json();
    if (data.success) {
      this.accessToken = data.data.tokens.accessToken;
      localStorage.setItem('accessToken', this.accessToken);
    }
    
    return data;
  }
  
  async getResources() {
    const response = await fetch(`${this.baseURL}/economy/resources`, {
      headers: this.getHeaders()
    });
    
    return response.json();
  }
  
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Client-Type': 'WEB',
      'Authorization': `Bearer ${this.accessToken}`
    };
  }
}
```

### **📡 WebSocket Service**
```typescript
// websocket-service.ts
class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  
  connect(token: string) {
    this.ws = new WebSocket('wss://api.destockspace.com/ws');
    
    this.ws.onopen = () => {
      this.ws?.send(JSON.stringify({
        type: 'auth',
        token,
        clientType: 'WEB'
      }));
    };
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
  }
  
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }
  
  private handleMessage(message: any) {
    const callbacks = this.listeners.get(message.type) || [];
    callbacks.forEach(callback => callback(message));
  }
}
```

### **🎮 Game State Manager**
```typescript
// game-state.ts
class GameStateManager {
  private resources: ResourceData[] = [];
  private inventory: InventoryItem[] = [];
  private fleet: ShipData[] = [];
  
  updateResources(resources: ResourceData[]) {
    this.resources = resources;
    this.notifyStateChange('resources', resources);
  }
  
  updateInventory(inventory: InventoryItem[]) {
    this.inventory = inventory;
    this.notifyStateChange('inventory', inventory);
  }
  
  updateFleet(fleet: ShipData[]) {
    this.fleet = fleet;
    this.notifyStateChange('fleet', fleet);
  }
  
  private notifyStateChange(type: string, data: any) {
    // Notificar a componentes React
    eventEmitter.emit('stateChange', { type, data });
  }
}
```

---

## 📱 **COMPONENTES REACT**

### **💰 Resource Display Component**
```tsx
// ResourceDisplay.tsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api-service';
import { webSocketService } from '../services/websocket-service';

export const ResourceDisplay: React.FC = () => {
  const [resources, setResources] = useState<ResourceData[]>([]);
  
  useEffect(() => {
    // Cargar recursos iniciales
    apiService.getResources().then(data => {
      if (data.success) {
        setResources(data.data.resources);
      }
    });
    
    // Escuchar actualizaciones por WebSocket
    webSocketService.on('resource:update', (message) => {
      setResources(message.resources);
    });
  }, []);
  
  return (
    <div className="resource-display">
      {resources.map(resource => (
        <div key={resource.type} className="resource-item">
          <span className="resource-name">{resource.type}</span>
          <span className="resource-amount">
            {resource.amount.toFixed(1)} / {resource.maxAmount}
          </span>
        </div>
      ))}
    </div>
  );
};
```

### **🚀 Fleet Component**
```tsx
// FleetDisplay.tsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api-service';

export const FleetDisplay: React.FC = () => {
  const [fleet, setFleet] = useState<ShipData[]>([]);
  
  useEffect(() => {
    apiService.getFleet().then(data => {
      if (data.success) {
        setFleet(data.data.ships);
      }
    });
  }, []);
  
  return (
    <div className="fleet-display">
      <h3>My Fleet</h3>
      {fleet.map(ship => (
        <div key={ship.id} className="ship-item">
          <h4>{ship.name}</h4>
          <p>Type: {ship.type}</p>
          <p>Level: {ship.level}</p>
          <p>Health: {ship.health.current} / {ship.health.max}</p>
        </div>
      ))}
    </div>
  );
};
```

---

## 🎯 **MÉTRICAS Y MONITOREO**

### **📊 Performance Metrics**
```javascript
// Métricas para el cliente web
const performanceMetrics = {
  // Tiempos de carga
  pageLoad: {
    target: 2000, // 2 segundos
    maximum: 5000  // 5 segundos
  },
  
  // API Response times
  apiResponse: {
    target: 500,   // 500ms
    maximum: 2000  // 2 segundos
  },
  
  // WebSocket latency
  wsLatency: {
    target: 100,   // 100ms
    maximum: 500   // 500ms
  },
  
  // Memory usage
  memoryUsage: {
    target: 50,    // 50MB
    maximum: 100   // 100MB
  }
};
```

### **🔍 Error Handling**
```javascript
// Manejo de errores centralizado
class ErrorHandler {
  static handle(error: Error, context: string) {
    console.error(`[${context}] ${error.message}`, error);
    
    // Enviar a servicio de monitoreo
    this.reportError(error, context);
    
    // Mostrar mensaje amigable al usuario
    this.showUserError(error);
  }
  
  private static reportError(error: Error, context: string) {
    // Enviar a Sentry, LogRocket, etc.
  }
  
  private static showUserError(error: Error) {
    // Mostrar notificación o toast
  }
}
```

---

## 🚀 **OPTIMIZACIONES WEB**

### **⚡ Lazy Loading**
```typescript
// Lazy loading de componentes
const FleetDisplay = React.lazy(() => import('./FleetDisplay'));
const Marketplace = React.lazy(() => import('./Marketplace'));

// Uso con Suspense
<Suspense fallback={<div>Loading...</div>}>
  <FleetDisplay />
</Suspense>
```

### **💾 Cache Strategy**
```typescript
// Service Worker para cache
const cacheStrategy = {
  // API responses
  api: {
    cacheName: 'api-cache',
    maxAge: 5 * 60 * 1000, // 5 minutos
    strategy: 'networkFirst'
  },
  
  // Assets estáticos
  static: {
    cacheName: 'static-cache',
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    strategy: 'cacheFirst'
  }
};
```

---

## 📋 **CHECKLIST DE IMPLEMENTACIÓN**

### **✅ Requisitos Mínimos**
- [ ] Autenticación con JWT
- [ ] Conexión WebSocket para tiempo real
- [ ] Sincronización de recursos
- [ ] Gestión de inventario
- [ ] Visualización de flota
- [ ] Interfaz de marketplace
- [ ] Sistema de combate básico

### **✅ Características Avanzadas**
- [ ] Notificaciones push
- [ ] Modo offline con Service Worker
- [ ] Optimización de rendimiento
- [ ] Sistema de caché inteligente
- [ ] Manejo de errores robusto
- [ ] Métricas y analytics
- [ ] Testing automatizado

---

**Esta documentación proporciona todo lo necesario para que el equipo de Cursor implemente el cliente web completamente sincronizado con el cliente Unity PC.**
