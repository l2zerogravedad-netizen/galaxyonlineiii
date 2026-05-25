# 📚 DOCUMENTACIÓN API COMÚN - GALAXY ONLINE II

## 📋 **RESUMEN EJECUTIVO**

Documentación completa de la API REST y WebSocket para Galaxy Online II, diseñada para ser consumida tanto por el cliente PC (Windsurf) como el cliente Web (Cursor) con contratos unificados y respuestas estandarizadas.

---

## 🔌 **ARQUITECTURA API**

### **📁 Estructura Base**
```
🌐 API Base URL: https://api.galaxyonlineii.com/v1
📡 WebSocket URL: wss://api.galaxyonlineii.com/ws
📄 Documentación: https://docs.galaxyonlineii.com/api
```

### **🔑 Autenticación**
```typescript
// Header de autenticación para todas las peticiones
interface AuthHeader {
  Authorization: `Bearer ${string}`  // JWT Token
  'X-Client-Type': 'PC' | 'WEB'     // Tipo de cliente
  'X-Client-Version': string         // Versión del cliente
}

// Respuesta estándar de API
interface APIResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    timestamp: string
    requestId: string
    version: string
  }
}
```

---

## 🔐 **MÓDULO DE AUTENTICACIÓN**

### **POST /auth/login**
```typescript
// Request
interface LoginRequest {
  email: string
  password: string
  clientType: 'PC' | 'WEB'
  deviceFingerprint?: string
}

// Response
interface LoginResponse {
  user: {
    id: string
    username: string
    email: string
    level: number
    experience: number
    createdAt: string
  }
  tokens: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
  session: {
    sessionId: string
    expiresAt: string
  }
}
```

### **POST /auth/register**
```typescript
// Request
interface RegisterRequest {
  username: string
  email: string
  password: string
  clientType: 'PC' | 'WEB'
  referralCode?: string
}

// Response
interface RegisterResponse {
  user: UserProfile
  tokens: TokenPair
  welcomePackage: {
    resources: Resource[]
    items: Item[]
    ships: Ship[]
  }
}
```

### **POST /auth/refresh**
```typescript
// Request
interface RefreshRequest {
  refreshToken: string
  clientType: 'PC' | 'WEB'
}

// Response
interface RefreshResponse {
  tokens: TokenPair
  session: SessionInfo
}
```

---

## 👤 **MÓDULO DE USUARIOS**

### **GET /users/profile**
```typescript
// Response
interface UserProfile {
  id: string
  username: string
  email: string
  level: number
  experience: number
  avatar: string
  title?: string
  alliance?: {
    id: string
    name: string
    rank: string
  }
  statistics: {
    totalPlayTime: number
    battlesWon: number
    battlesLost: number
    resourcesCollected: number
    itemsCrafted: number
  }
  preferences: {
    language: string
    notifications: NotificationSettings
    privacy: PrivacySettings
  }
}
```

### **PUT /users/profile**
```typescript
// Request
interface UpdateProfileRequest {
  username?: string
  avatar?: string
  title?: string
  preferences?: {
    language?: string
    notifications?: Partial<NotificationSettings>
    privacy?: Partial<PrivacySettings>
  }
}
```

### **GET /users/stats**
```typescript
// Response
interface UserStats {
  resources: ResourceStats
  inventory: InventoryStats
  fleet: FleetStats
  combat: CombatStats
  economy: EconomyStats
  social: SocialStats
}
```

---

## 💰 **MÓDULO DE ECONOMÍA**

### **GET /economy/resources**
```typescript
// Query Parameters
interface ResourcesQuery {
  userId?: string
  resourceType?: ResourceType
}

// Response
interface ResourcesResponse {
  resources: Resource[]
  production: ProductionRate[]
  storage: StorageInfo[]
  lastUpdated: string
}

interface Resource {
  type: ResourceType
  amount: number
  maxAmount: number
  productionRate: number
  lastUpdated: string
}
```

### **POST /economy/resources/transfer**
```typescript
// Request
interface TransferRequest {
  fromUserId: string
  toUserId: string
  resourceType: ResourceType
  amount: number
  reason?: string
}

// Response
interface TransferResponse {
  transactionId: string
  status: 'completed' | 'pending' | 'failed'
  fromBalance: number
  toBalance: number
  timestamp: string
}
```

### **GET /economy/transactions**
```typescript
// Query Parameters
interface TransactionsQuery {
  userId: string
  type?: TransactionType
  limit?: number
  offset?: number
  startDate?: string
  endDate?: string
}

// Response
interface TransactionsResponse {
  transactions: Transaction[]
  totalCount: number
  hasMore: boolean
}
```

---

## 📦 **MÓDULO DE INVENTARIO**

### **GET /inventory**
```typescript
// Response
interface InventoryResponse {
  items: InventoryItem[]
  categories: ItemCategory[]
  totalItems: number
  maxSlots: number
  usedSlots: number
}

interface InventoryItem {
  id: string
  itemId: string
  name: string
  type: ItemType
  rarity: ItemRarity
  quantity: number
  quality: number
  properties: ItemProperties
  equipped: boolean
  slot?: string
}
```

### **POST /inventory/items**
```typescript
// Request
interface AddItemRequest {
  itemId: string
  quantity: number
  properties?: ItemProperties
  source: 'crafting' | 'purchase' | 'reward' | 'trade'
}

// Response
interface AddItemResponse {
  item: InventoryItem
  inventory: InventoryResponse
  notification?: string
}
```

### **PUT /inventory/items/:itemId/equip**
```typescript
// Request
interface EquipItemRequest {
  slot: string
  replaceExisting?: boolean
}

// Response
interface EquipItemResponse {
  success: boolean
  equippedItem: InventoryItem
  previousItem?: InventoryItem
  updatedStats?: CharacterStats
}
```

---

## 🛒 **MÓDULO DE MARKETPLACE**

### **GET /marketplace/listings**
```typescript
// Query Parameters
interface ListingsQuery {
  itemType?: ItemType
  rarity?: ItemRarity
  minPrice?: number
  maxPrice?: number
  sellerId?: string
  sortBy?: 'price' | 'created' | 'rarity'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

// Response
interface ListingsResponse {
  listings: MarketplaceListing[]
  totalCount: number
  filters: AvailableFilters
  hasMore: boolean
}

interface MarketplaceListing {
  id: string
  seller: {
    id: string
    username: string
    reputation: number
  }
  item: InventoryItem
  price: number
  currency: 'credits' | 'plasma' | 'crystals'
  quantity: number
  status: 'active' | 'sold' | 'cancelled'
  createdAt: string
  expiresAt: string
}
```

### **POST /marketplace/listings**
```typescript
// Request
interface CreateListingRequest {
  itemId: string
  quantity: number
  price: number
  currency: 'credits' | 'plasma' | 'crystals'
  duration: number // hours
}

// Response
interface CreateListingResponse {
  listing: MarketplaceListing
  fee: number
  listingFee: number
}
```

### **POST /marketplace/listings/:listingId/buy**
```typescript
// Request
interface BuyListingRequest {
  quantity: number
  useCredits?: boolean
}

// Response
interface BuyListingResponse {
  success: boolean
  transaction: Transaction
  item: InventoryItem
  remainingQuantity: number
}
```

---

## 🚀 **MÓDULO DE NAVES**

### **GET /ships/fleet**
```typescript
// Response
interface FleetResponse {
  ships: Ship[]
  totalShips: number
  maxShips: number
  fleetPower: number
  formations: Formation[]
}

interface Ship {
  id: string
  name: string
  type: ShipType
  class: ShipClass
  level: number
  experience: number
  health: {
    current: number
    max: number
    regeneration: number
  }
  stats: ShipStats
  equipment: {
    weapons: Weapon[]
    armor: Armor[]
    modules: Module[]
  }
  crew: {
    commander?: Commander
    officers: Officer[]
    crew: number
    maxCrew: number
  }
  position?: {
    x: number
    y: number
    z: number
    systemId: string
  }
  status: 'active' | 'docked' | 'in_combat' | 'traveling'
}
```

### **POST /ships**
```typescript
// Request
interface CreateShipRequest {
  name: string
  type: ShipType
  hull: HullType
  equipment: {
    weapons: string[]
    armor: string[]
    modules: string[]
  }
  commander?: string
}

// Response
interface CreateShipResponse {
  ship: Ship
  cost: {
    resources: Resource[]
    credits: number
  }
  constructionTime: number
}
```

### **PUT /ships/:shipId/equipment**
```typescript
// Request
interface UpdateEquipmentRequest {
  slot: string
  itemId: string
  action: 'equip' | 'unequip' | 'replace'
}

// Response
interface UpdateEquipmentResponse {
  success: boolean
  ship: Ship
  updatedStats: ShipStats
  powerChange: number
}
```

---

## ⚔️ **MÓDULO DE COMBATE**

### **POST /combat/initiate**
```typescript
// Request
interface InitiateCombatRequest {
  attackerId: string
  defenderId: string
  attackerFleet: string[]
  defenderFleet: string[]
  location: {
    systemId: string
    coordinates: [number, number, number]
  }
  battleType: 'pvp' | 'pve' | 'tournament'
}

// Response
interface InitiateCombatResponse {
  combatId: string
  battle: BattleInstance
  turnOrder: TurnOrder[]
  timeLimit: number
  participants: CombatParticipant[]
}
```

### **POST /combat/:combatId/actions**
```typescript
// Request
interface CombatActionRequest {
  shipId: string
  action: CombatAction
  targetId?: string
  position?: [number, number]
  parameters?: any
}

// Response
interface CombatActionResponse {
  success: boolean
  result: ActionResult
  battleState: BattleInstance
  nextTurn: string
  timeRemaining: number
}
```

### **GET /combat/:combatId/status**
```typescript
// Response
interface CombatStatusResponse {
  combatId: string
  status: 'active' | 'completed' | 'aborted'
  currentTurn: string
  timeRemaining: number
  participants: CombatParticipant[]
  battleLog: BattleLogEntry[]
  winner?: string
  rewards?: CombatRewards
}
```

---

## 📡 **WEBSOCKET EVENTS**

### **🔌 Conexión**
```typescript
// Conexión WebSocket
const ws = new WebSocket('wss://api.galaxyonlineii.com/ws')

// Autenticación
ws.send(JSON.stringify({
  type: 'auth',
  token: 'jwt_token',
  clientType: 'PC' | 'WEB'
}))
```

### **📢 Eventos de Economía**
```typescript
// Actualización de recursos
interface ResourceUpdateEvent {
  type: 'resource:update'
  userId: string
  resources: Resource[]
  timestamp: string
}

// Transacción completada
interface TransactionCompleteEvent {
  type: 'transaction:complete'
  userId: string
  transaction: Transaction
  timestamp: string
}
```

### **📦 Eventos de Inventario**
```typescript
// Actualización de inventario
interface InventoryUpdateEvent {
  type: 'inventory:update'
  userId: string
  inventory: InventoryResponse
  timestamp: string
}

// Item añadido
interface ItemAddedEvent {
  type: 'item:added'
  userId: string
  item: InventoryItem
  source: string
  timestamp: string
}
```

### **🛒 Eventos de Marketplace**
```typescript
// Nueva listing
interface ListingCreatedEvent {
  type: 'listing:created'
  listing: MarketplaceListing
  timestamp: string
}

// Item vendido
interface ListingSoldEvent {
  type: 'listing:sold'
  listingId: string
  buyerId: string
  sellerId: string
  timestamp: string
}
```

### **⚔️ Eventos de Combate**
```typescript
// Combate iniciado
interface CombatInitiatedEvent {
  type: 'combat:initiated'
  combatId: string
  participants: string[]
  location: Location
  timestamp: string
}

// Acción de combate
interface CombatActionEvent {
  type: 'combat:action'
  combatId: string
  actorId: string
  action: CombatAction
  result: ActionResult
  timestamp: string
}
```

---

## 🚨 **MANEJO DE ERRORES**

### **📋 Códigos de Error Estándar**
```typescript
interface ErrorCodes {
  // Autenticación
  'AUTH_001': 'Credenciales inválidas'
  'AUTH_002': 'Token expirado'
  'AUTH_003': 'Usuario no encontrado'
  'AUTH_004': 'Cuenta suspendida'
  
  // Validación
  'VALID_001': 'Parámetros inválidos'
  'VALID_002': 'Formato incorrecto'
  'VALID_003': 'Campo requerido faltante'
  
  // Recursos
  'ECO_001': 'Recursos insuficientes'
  'ECO_002': 'Almacenamiento lleno'
  'ECO_003': 'Tipo de recurso inválido'
  
  // Inventario
  'INV_001': 'Item no encontrado'
  'INV_002': 'Inventario lleno'
  'INV_003': 'Item no equipable'
  
  // Marketplace
  'MKP_001': 'Listing no encontrada'
  'MKP_002': 'Item no disponible'
  'MKP_003': 'Fondos insuficientes'
  
  // Combate
  'COM_001': 'Combate no encontrado'
  'COM_002': 'No es tu turno'
  'COM_003': 'Acción inválida'
  
  // Sistema
  'SYS_001': 'Error interno del servidor'
  'SYS_002': 'Servicio no disponible'
  'SYS_003': 'Límite de velocidad excedido'
}
```

### **🔄 Estrategia de Reintentos**
```typescript
interface RetryStrategy {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
  
  // Errores reintentables
  retryableErrors: [
    'SYS_001', // Error interno
    'SYS_002', // Servicio no disponible
    'SYS_003'  // Rate limit
  ]
}
```

---

## 📊 **RATE LIMITING**

### **🚦 Límites por Cliente**
```typescript
interface RateLimits {
  // Cliente PC (Windsurf)
  PC: {
    requestsPerMinute: 1000
    requestsPerHour: 50000
    concurrentConnections: 10
  }
  
  // Cliente Web (Cursor)
  WEB: {
    requestsPerMinute: 500
    requestsPerHour: 25000
    concurrentConnections: 5
  }
  
  // Límites específicos por endpoint
  AUTH: {
    loginAttempts: 5 per 15 minutes
    registerAttempts: 3 per hour
  }
  
  ECONOMY: {
    transfers: 10 per minute
    transactions: 100 per hour
  }
  
  MARKETPLACE: {
    listings: 5 per minute
    purchases: 20 per hour
  }
}
```

---

## 📋 **EJEMPLOS DE USO**

### **🔐 Ejemplo de Autenticación**
```typescript
// Login
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Type': 'PC'
  },
  body: JSON.stringify({
    email: 'player@galaxyonlineii.com',
    password: 'securePassword123',
    clientType: 'PC'
  })
})

const { user, tokens } = await loginResponse.json()

// Guardar tokens
localStorage.setItem('accessToken', tokens.accessToken)
localStorage.setItem('refreshToken', tokens.refreshToken)
```

### **💰 Ejemplo de Transferencia de Recursos**
```typescript
// Transferir recursos
const transferResponse = await fetch('/api/v1/economy/resources/transfer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
    'X-Client-Type': 'PC'
  },
  body: JSON.stringify({
    fromUserId: 'user-123',
    toUserId: 'user-456',
    resourceType: 'metal',
    amount: 1000,
    reason: 'Trade payment'
  })
})

const { transactionId, status } = await transferResponse.json()
```

### **📡 Ejemplo de WebSocket**
```typescript
// Conectar WebSocket
const ws = new WebSocket('wss://api.galaxyonlineii.com/ws')

// Autenticar
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: accessToken,
    clientType: 'PC'
  }))
}

// Escuchar eventos
ws.onmessage = (event) => {
  const message = JSON.parse(event.data)
  
  switch (message.type) {
    case 'resource:update':
      updateResourceDisplay(message.resources)
      break
    case 'inventory:update':
      updateInventoryDisplay(message.inventory)
      break
    case 'combat:initiated':
      showCombatNotification(message)
      break
  }
}
```

---

## 🎯 **MEJORES PRÁCTICAS**

### **✅ Para Clientes PC (Windsurf)**
- Usar batching para múltiples requests
- Implementar cache agresivo
- Utilizar WebSockets para tiempo real
- Optimizar assets para 3D

### **✅ Para Clientes Web (Cursor)**
- Minimizar número de requests
- Usar streaming para assets grandes
- Implementar lazy loading
- Optimizar para mobile

### **✅ Para Ambos Clientes**
- Manejar errores gracefully
- Implementar reintentos automáticos
- Usar TypeScript tipado
- Validar respuestas del servidor

---

## 📈 **MONITOREO Y ANALÍTICA**

### **📊 Métricas de API**
```typescript
interface APIMetrics {
  requests: {
    total: number
    successful: number
    failed: number
    averageResponseTime: number
  }
  endpoints: {
    [endpoint: string]: {
      requests: number
      errors: number
      avgResponseTime: number
    }
  }
  clients: {
    PC: number
    WEB: number
  }
  errors: {
    [errorCode: string]: number
  }
}
```

---

**Esta documentación API servirá como contrato único para ambos clientes, asegurando consistencia y facilitando el desarrollo paralelo.**
