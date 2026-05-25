# 🏗️ ARQUITECTURA UNIFICADA - GALAXY ONLINE II

## 📋 **RESUMEN EJECUTIVO**

Arquitectura unificada para Galaxy Online II con backend común que sirve tanto al cliente PC (Windsurf) como al cliente Web (Cursor), asegurando consistencia de datos, lógica centralizada y experiencia sincronizada.

## 🎯 **PRINCIPIOS DE DISEÑO**

### **🔧 Principio Único de Verdad**
- **Backend central**: Toda la lógica de negocio, economía y estado del juego
- **Clientes ligeros**: Solo renderizado y UI, sin lógica de negocio duplicada
- **API unificada**: Mismo contrato para ambos clientes
- **Base de datos única**: Todos los datos en un solo lugar

### **🔄 Sincronización Total**
- **Estado en tiempo real**: Todos los clientes ven el mismo estado
- **Eventos centralizados**: Cambios propagados a todos los clientes
- **Cache inteligente**: Reducción de latencia con consistencia
- **Offline mode**: Limitado pero funcional

---

## 🏛️ **ARQUITECTURA GENERAL**

```
┌─────────────────────────────────────────────────────────────┐
│                    🌌 GALAXY ONLINE II                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                 │
│  │   CLIENTE PC    │    │  CLIENTE WEB    │                 │
│  │   (Windsurf)    │    │   (Cursor)      │                 │
│  │                 │    │                 │                 │
│  │ • React Native  │    │ • React Web     │                 │
│  │ • 3D Completo   │    │ • 2D Optimizado │                 │
│  │ • Assets HD     │    │ • Assets Livianos│                 │
│  │ • Audio HQ      │    │ • Audio Básico  │                 │
│  └─────────┬───────┘    └─────────┬───────┘                 │
│            │                      │                         │
│            └──────────┬───────────┘                         │
│                       │                                     │
│            ┌─────────────────┐                             │
│            │   API GATEWAY   │                             │
│            │   (Unificada)   │                             │
│            └─────────┬───────┘                             │
│                      │                                     │
│            ┌─────────────────┐                             │
│            │   BACKEND       │                             │
│            │   (Común)       │                             │
│            │                 │                             │
│            │ • Node.js       │                             │
│            │ • TypeScript    │                             │
│            │ • PostgreSQL    │                             │
│            │ • Redis Cache   │                             │
│            │ • WebSocket     │                             │
│            └─────────┬───────┘                             │
│                      │                                     │
│            ┌─────────────────┐                             │
│            │   BASE DE DATOS │                             │
│            │   (Centralizada)│                             │
│            └─────────────────┘                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 **BACKEND COMÚN**

### **📁 Estructura del Backend**
```
📁 backend/
├── 📁 src/
│   ├── 📁 controllers/           # Controladores de API
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── economy.controller.ts
│   │   ├── inventory.controller.ts
│   │   ├── marketplace.controller.ts
│   │   ├── ships.controller.ts
│   │   ├── items.controller.ts
│   │   └── combat.controller.ts
│   ├── 📁 services/              # Lógica de negocio
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── economy.service.ts
│   │   ├── inventory.service.ts
│   │   ├── marketplace.service.ts
│   │   ├── ships.service.ts
│   │   ├── items.service.ts
│   │   └── combat.service.ts
│   ├── 📁 models/                # Modelos de datos
│   │   ├── User.ts
│   │   ├── Resource.ts
│   │   ├── Item.ts
│   │   ├── Ship.ts
│   │   ├── Planet.ts
│   │   ├── Alliance.ts
│   │   └── Transaction.ts
│   ├── 📁 middleware/            # Middleware
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   └── cache.middleware.ts
│   ├── 📁 routes/                # Rutas de API
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── economy.routes.ts
│   │   ├── inventory.routes.ts
│   │   ├── marketplace.routes.ts
│   │   ├── ships.routes.ts
│   │   ├── items.routes.ts
│   │   └── combat.routes.ts
│   ├── 📁 websocket/             # WebSocket handlers
│   │   ├── game.socket.ts
│   │   ├── chat.socket.ts
│   │   ├── combat.socket.ts
│   │   └── market.socket.ts
│   ├── 📁 utils/                 # Utilidades
│   │   ├── logger.ts
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── validation.ts
│   │   └── helpers.ts
│   └── 📁 types/                 # Tipos TypeScript
│       ├── api.types.ts
│       ├── game.types.ts
│       ├── user.types.ts
│       └── common.types.ts
├── 📁 tests/                     # Tests
├── 📁 docs/                      # Documentación API
├── 📄 package.json
├── 📄 tsconfig.json
└── 📄 docker-compose.yml
```

### **🔌 API Gateway Unificada**
```typescript
// API Gateway - Punto único de entrada
class APIGateway {
  // Autenticación unificada
  async authenticateUser(credentials: AuthCredentials): Promise<AuthResult>
  
  // Rate limiting por cliente
  async checkRateLimit(clientType: 'PC' | 'WEB', userId: string): Promise<boolean>
  
  // Enrutamiento dinámico
  async routeRequest(request: APIRequest): Promise<APIResponse>
  
  // Cache inteligente
  async getCachedData(key: string, clientType: string): Promise<any>
  
  // Logging centralizado
  async logRequest(request: APIRequest, response: APIResponse): Promise<void>
}
```

---

## 🖥️ **CLIENTE PC (WINDSURF)**

### **🎯 Características Principales**
- **Renderizado 3D completo**: Three.js/WebGL
- **Assets HD**: Texturas de alta resolución
- **Audio HQ**: Efectos de sonido inmersivos
- **Modo offline limitado**: Cache local inteligente
- **Modo espectador**: Visualización avanzada

### **📁 Estructura del Cliente PC**
```
📁 client-pc/
├── 📁 src/
│   ├── 📁 components/            # Componentes React Native
│   │   ├── 📁 ui/               # UI básica
│   │   ├── 📁 game/             # Componentes de juego
│   │   ├── 📁 3d/               # Componentes 3D
│   │   └── 📁 audio/            # Componentes de audio
│   ├── 📁 services/             # Servicios de API
│   │   ├── api.service.ts
│   │   ├── websocket.service.ts
│   │   ├── cache.service.ts
│   │   └── offline.service.ts
│   ├── 📁 store/                # Estado global
│   │   ├── auth.store.ts
│   │   ├── game.store.ts
│   │   ├── economy.store.ts
│   │   └── ui.store.ts
│   ├── 📁 utils/                # Utilidades
│   │   ├── 3d-utils.ts
│   │   ├── audio-utils.ts
│   │   └── performance-utils.ts
│   └── 📁 assets/               # Assets HD
│       ├── 📁 textures/
│       ├── 📁 models/
│       ├── 📁 sounds/
│       └── 📁 animations/
├── 📁 android/                 # Android build
├── 📁 ios/                     # iOS build
├── 📄 package.json
└── 📄 metro.config.js
```

---

## 🌐 **CLIENTE WEB (CURSOR)**

### **🎯 Características Principales**
- **Renderizado 2D optimizado**: Canvas/WebGL ligero
- **Assets livianos**: Optimizados para web
- **Audio básico**: Efectos esenciales
- **Streaming assets**: Carga bajo demanda
- **Responsive design**: Adaptable a cualquier pantalla

### **📁 Estructura del Cliente Web**
```
📁 client-web/
├── 📁 src/
│   ├── 📁 components/            # Componentes React
│   │   ├── 📁 ui/               # UI básica
│   │   ├── 📁 game/             # Componentes de juego
│   │   ├── 📁 2d/               # Componentes 2D
│   │   └── 📁 audio/            # Componentes de audio
│   ├── 📁 services/             # Servicios de API
│   │   ├── api.service.ts
│   │   ├── websocket.service.ts
│   │   ├── cache.service.ts
│   │   └── streaming.service.ts
│   ├── 📁 store/                # Estado global
│   │   ├── auth.store.ts
│   │   ├── game.store.ts
│   │   ├── economy.store.ts
│   │   └── ui.store.ts
│   ├── 📁 utils/                # Utilidades
│   │   ├── 2d-utils.ts
│   │   ├── audio-utils.ts
│   │   └── performance-utils.ts
│   └── 📁 assets/               # Assets livianos
│       ├── 📁 textures/
│       ├── 📁 sprites/
│       ├── 📁 sounds/
│       └── 📁 animations/
├── 📁 public/                  # Archivos estáticos
├── 📄 package.json
└── 📄 vite.config.ts
```

---

## 🔌 **API COMÚN**

### **📋 Contrato de API Unificado**
```typescript
// Contrato de API para ambos clientes
interface GalaxyOnlineAPI {
  // Autenticación
  auth: {
    login(credentials: LoginRequest): Promise<AuthResponse>
    register(data: RegisterRequest): Promise<UserResponse>
    logout(token: string): Promise<void>
    refreshToken(refreshToken: string): Promise<AuthResponse>
  }
  
  // Usuario
  users: {
    getProfile(userId: string): Promise<UserProfile>
    updateProfile(userId: string, data: UpdateProfileRequest): Promise<UserProfile>
    getSettings(userId: string): Promise<UserSettings>
    updateSettings(userId: string, settings: UserSettings): Promise<UserSettings>
  }
  
  // Economía
  economy: {
    getResources(userId: string): Promise<Resource[]>
    updateResources(userId: string, resources: ResourceUpdate): Promise<Resource[]>
    getTransactions(userId: string): Promise<Transaction[]>
    makeTransaction(transaction: TransactionRequest): Promise<Transaction>
  }
  
  // Inventario
  inventory: {
    getInventory(userId: string): Promise<Inventory>
    addItem(userId: string, item: AddItemRequest): Promise<Inventory>
    removeItem(userId: string, itemId: string): Promise<Inventory>
    updateItem(userId: string, item: UpdateItemRequest): Promise<Inventory>
  }
  
  // Marketplace
  marketplace: {
    getListings(filters: ListingFilters): Promise<Listing[]>
    createListing(listing: CreateListingRequest): Promise<Listing>
    buyListing(listingId: string, userId: string): Promise<Transaction>
    cancelListing(listingId: string, userId: string): Promise<void>
  }
  
  // Naves
  ships: {
    getFleet(userId: string): Promise<Fleet>
    createShip(userId: string, ship: CreateShipRequest): Promise<Ship>
    updateShip(userId: string, ship: UpdateShipRequest): Promise<Ship>
    deleteShip(userId: string, shipId: string): Promise<void>
  }
  
  // Items
  items: {
    getItems(userId: string): Promise<Item[]>
    getItem(itemId: string): Promise<Item>
    equipItem(userId: string, itemId: string): Promise<void>
    unequipItem(userId: string, itemId: string): Promise<void>
  }
  
  // Combate
  combat: {
    initiateCombat(combatRequest: CombatRequest): Promise<Combat>
    getCombatStatus(combatId: string): Promise<CombatStatus>
    submitAction(combatId: string, action: CombatAction): Promise<CombatResult>
  }
}
```

### **🔄 WebSocket Events**
```typescript
// Eventos WebSocket para tiempo real
interface WebSocketEvents {
  // Economía
  'resource:update': (resources: Resource[]) => void
  'transaction:complete': (transaction: Transaction) => void
  
  // Inventario
  'inventory:update': (inventory: Inventory) => void
  'item:added': (item: Item) => void
  'item:removed': (itemId: string) => void
  
  // Marketplace
  'listing:created': (listing: Listing) => void
  'listing:sold': (listing: Listing) => void
  'listing:cancelled': (listing: Listing) => void
  
  // Combate
  'combat:initiated': (combat: Combat) => void
  'combat:updated': (combat: Combat) => void
  'combat:completed': (result: CombatResult) => void
  
  // Social
  'alliance:updated': (alliance: Alliance) => void
  'chat:message': (message: ChatMessage) => void
  'user:online': (userId: string) => void
  'user:offline': (userId: string) => void
}
```

---

## 📊 **ESTRATEGIA DE DATOS**

### **🗄️ Base de Datos Centralizada**
```sql
-- Estructura principal de la base de datos
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE user_resources (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  resource_type VARCHAR(50) NOT NULL,
  amount DECIMAL(20,8) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, resource_type)
);

CREATE TABLE user_inventory (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  item_id VARCHAR(100) NOT NULL,
  item_type VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  properties JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ships (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  ship_type VARCHAR(50) NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER NOT NULL DEFAULT 0,
  properties JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE marketplace_listings (
  id UUID PRIMARY KEY,
  seller_id UUID REFERENCES users(id),
  item_type VARCHAR(50) NOT NULL,
  item_id VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(20,8) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **⚡ Redis Cache Strategy**
```typescript
// Estrategia de cache para ambos clientes
interface CacheStrategy {
  // Cache de recursos (TTL: 5 minutos)
  userResources: {
    key: `user:${userId}:resources`
    ttl: 300 // 5 minutos
  }
  
  // Cache de inventario (TTL: 10 minutos)
  userInventory: {
    key: `user:${userId}:inventory`
    ttl: 600 // 10 minutos
  }
  
  // Cache de marketplace (TTL: 1 minuto)
  marketplaceListings: {
    key: 'marketplace:listings'
    ttl: 60 // 1 minuto
  }
  
  // Cache de flotas (TTL: 5 minutos)
  userFleet: {
    key: `user:${userId}:fleet`
    ttl: 300 // 5 minutos
  }
}
```

---

## 🔄 **SINCRRONIZACIÓN ENTRE CLIENTES**

### **📡 Estrategia de Sincronización**
```typescript
// Sistema de sincronización unificado
class SyncManager {
  // Sincronización en tiempo real
  async syncRealTime(userId: string, clientType: 'PC' | 'WEB'): Promise<void> {
    // Conectar a WebSocket
    const ws = await this.connectWebSocket(userId)
    
    // Escuchar eventos
    ws.on('resource:update', (resources) => {
      this.updateLocalCache('resources', resources)
      this.notifyUI('resources', resources)
    })
    
    ws.on('inventory:update', (inventory) => {
      this.updateLocalCache('inventory', inventory)
      this.notifyUI('inventory', inventory)
    })
  }
  
  // Sincronización por demanda
  async syncOnDemand(dataType: string, userId: string): Promise<any> {
    // Verificar cache local
    const cached = await this.getLocalCache(dataType, userId)
    if (cached && !this.isCacheExpired(cached)) {
      return cached.data
    }
    
    // Obtener del backend
    const fresh = await this.fetchFromBackend(dataType, userId)
    
    // Actualizar cache
    await this.updateLocalCache(dataType, fresh)
    
    return fresh
  }
  
  // Sincronización batch
  async syncBatch(syncRequests: SyncRequest[]): Promise<SyncResult[]> {
    return Promise.all(syncRequests.map(req => this.syncOnDemand(req.type, req.userId)))
  }
}
```

---

## 🎯 **ESPECIFICACIONES POR CLIENTE**

### **🖥️ Cliente PC (Windsurf) - Requisitos**
- **Framework**: React Native
- **3D Engine**: Three.js con React Three Fiber
- **Estado**: Zustand o Redux Toolkit
- **Networking**: Axios + Socket.IO
- **Assets**: Texturas 4K, modelos 3D detallados
- **Audio**: Web Audio API con efectos espaciales
- **Performance**: 60 FPS objetivo, LOD dinámico

### **🌐 Cliente Web (Cursor) - Requisitos**
- **Framework**: React 18 con Vite
- **2D Engine**: Canvas API o Pixi.js
- **Estado**: Zustand (ligero)
- **Networking**: Axios + Socket.IO
- **Assets**: Texturas 1K, sprites optimizados
- **Audio**: Web Audio API básico
- **Performance**: 30 FPS objetivo, optimización web

---

## 📋 **PROCESO DE DESARROLLO**

### **🔄 Flujo de Trabajo**
1. **Backend primero**: Desarrollar API y lógica de negocio
2. **Documentación API**: Crear especificaciones OpenAPI
3. **Cliente Web**: Desarrollar versión ligera primero
4. **Cliente PC**: Adaptar y expandir para versión completa
5. **Testing integrado**: Probar ambos clientes simultáneamente

### **📝 Documentación Requerida**
- **OpenAPI Specification**: Contrato de API completo
- **Client Integration Guide**: Guía para integrar clientes
- **Data Models Documentation**: Modelos de datos detallados
- **WebSocket Events**: Eventos en tiempo real
- **Error Handling**: Manejo de errores estandarizado

---

## 🎯 **RESULTADO ESPERADO**

Al finalizar esta arquitectura unificada:

✅ **Backend único** sirviendo a ambos clientes  
✅ **API consistente** para PC y Web  
✅ **Sincronización perfecta** entre plataformas  
✅ **Sin duplicación** de lógica de negocio  
✅ **Documentación completa** para desarrolladores  
✅ **Escalabilidad** para futuras expansiones  
✅ **Mantenimiento simplificado** con código centralizado  

**Esta arquitectura garantizará consistencia, eficiencia y mantenibilidad a largo plazo para Galaxy Online II.**
