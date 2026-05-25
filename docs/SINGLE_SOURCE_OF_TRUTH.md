# 🎯 FUENTE ÚNICA DE VERDAD - DESTOCK SPACE

## 📋 **PRINCIPIO FUNDAMENTAL**

**TODA la lógica de negocio, datos y configuración reside en el backend común. Los clientes (Unity PC y Web) son solo interfaces de visualización y control.**

---

## 🏛️ **BACKEND COMÚN - ÚNICA FUENTE DE VERDAD**

### **🔧 Arquitectura Central**
```
📦 BACKEND COMÚN (Node.js + TypeScript)
├── 📁 src/
│   ├── 📁 controllers/     # Lógica de negocio REAL
│   ├── 📁 services/        # Procesamiento de datos
│   ├── 📁 models/          # Modelos de datos OFICIALES
│   ├── 📁 middleware/      # Validación y seguridad
│   ├── 📁 routes/          # Endpoints API
│   └── 📁 utils/           # Utilidades compartidas
├── 📁 database/            # PostgreSQL - ÚNICA BD
├── 📁 cache/               # Redis - Cache compartido
└── 📁 websocket/           # Eventos en tiempo real
```

### **📊 Base de Datos Común**
```sql
-- ÚNICA base de datos para TODOS los clientes
CREATE DATABASE destock_space_common;

-- Tablas centrales
CREATE TABLE users (id UUID PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, ...);
CREATE TABLE resources (id UUID PRIMARY KEY, user_id UUID REFERENCES users(id), type VARCHAR(50) NOT NULL, ...);
CREATE TABLE inventory (id UUID PRIMARY KEY, user_id UUID REFERENCES users(id), item_id VARCHAR(100) NOT NULL, ...);
CREATE TABLE ships (id UUID PRIMARY KEY, user_id UUID REFERENCES users(id), name VARCHAR(100) NOT NULL, ...);
CREATE TABLE marketplace (id UUID PRIMARY KEY, seller_id UUID REFERENCES users(id), item_type VARCHAR(50) NOT NULL, ...);
CREATE TABLE combat_sessions (id UUID PRIMARY KEY, participants JSONB NOT NULL, ...);
```

---

## 🔌 **API COMÚN - CONTRATO ÚNICO**

### **📡 Endpoints OFICIALES**
```typescript
// ÚNICA API para TODOS los clientes
interface CommonAPI {
  // Autenticación
  'POST /auth/login': LoginRequest => LoginResponse
  'POST /auth/register': RegisterRequest => RegisterResponse
  'POST /auth/refresh': RefreshRequest => RefreshResponse
  
  // Usuarios
  'GET /users/profile': void => UserProfile
  'PUT /users/profile': UpdateProfileRequest => UserProfile
  
  // Economía (ÚNICA fuente de verdad)
  'GET /economy/resources': void => ResourcesResponse
  'POST /economy/resources/transfer': TransferRequest => TransferResponse
  'GET /economy/transactions': TransactionsQuery => TransactionsResponse
  
  // Inventario (ÚNICA fuente de verdad)
  'GET /inventory': void => InventoryResponse
  'POST /inventory/items': AddItemRequest => AddItemResponse
  'PUT /inventory/items/:itemId/equip': EquipItemRequest => EquipItemResponse
  
  // Marketplace (ÚNICA fuente de verdad)
  'GET /marketplace/listings': ListingFilters => ListingsResponse
  'POST /marketplace/listings': CreateListingRequest => CreateListingResponse
  'POST /marketplace/listings/:listingId/buy': BuyListingRequest => BuyListingResponse
  
  // Naves (ÚNICA fuente de verdad)
  'GET /ships/fleet': void => FleetResponse
  'POST /ships': CreateShipRequest => CreateShipResponse
  'PUT /ships/:shipId/equipment': UpdateEquipmentRequest => UpdateEquipmentResponse
  
  // Combate (ÚNICA fuente de verdad)
  'POST /combat/initiate': CombatRequest => CombatResponse
  'POST /combat/:combatId/actions': CombatActionRequest => CombatActionResponse
  'GET /combat/:combatId/status': void => CombatStatusResponse
}
```

### **🔄 WebSocket Events - ÚNICO Sistema**
```typescript
// ÚNICO sistema de eventos para TODOS los clientes
interface CommonWebSocketEvents {
  'resource:update': ResourceUpdateEvent
  'inventory:update': InventoryUpdateEvent
  'combat:initiated': CombatInitiatedEvent
  'combat:action': CombatActionEvent
  'marketplace:update': MarketplaceUpdateEvent
  'user:online': UserOnlineEvent
  'user:offline': UserOfflineEvent
}
```

---

## 📦 **NOMBRES DE ITEMS COMUNES - CATÁLOGO OFICIAL**

### **💎 Recursos - Nombres OFICIALES**
```typescript
// ÚNICA lista de recursos - NO CAMBIAR SIN DOCUMENTAR
export const OFFICIAL_RESOURCES = {
  METAL: 'metal',           // Recurso básico de construcción
  PLASMA: 'plasma',         // Energía y tecnología avanzada
  ENERGY: 'energy',         // Alimentación de sistemas
  CRYSTALS: 'crystals',     // Tecnología e investigación
  EXOTICS: 'exotics',       // Items raros y especiales
  QUANTUM: 'quantum',       // Investigación de vanguardia
  DARK_MATTER: 'dark_matter', // Tecnología legendaria
  CREDITS: 'credits'        // Moneda de comercio
} as const;

export type ResourceType = typeof OFFICIAL_RESOURCES[keyof typeof OFFICIAL_RESOURCES];
```

### **🚀 Tipos de Naves - Nombres OFICIALES**
```typescript
// ÚNICA lista de tipos de naves - NO CAMBIAR SIN DOCUMENTAR
export const OFFICIAL_SHIP_TYPES = {
  FIGHTER: 'fighter',       // Nave pequeña y rápida
  CRUISER: 'cruiser',       // Nave media balanceada
  BATTLESHIP: 'battleship', // Nave grande y poderosa
  CARRIER: 'carrier',       // Nave portaaviones
  FRIGATE: 'frigate',       // Nave de apoyo
  DESTROYER: 'destroyer',   // Nave especializada en combate
  EXPLORER: 'explorer',     // Nave de exploración
  MINER: 'miner'           // Nave de minería
} as const;

export type ShipType = typeof OFFICIAL_SHIP_TYPES[keyof typeof OFFICIAL_SHIP_TYPES];
```

### **⚔️ Items - Nombres OFICIALES**
```typescript
// ÚNICA lista de items - NO CAMBIAR SIN DOCUMENTAR
export const OFFICIAL_ITEMS = {
  // Armas
  LASER_CANNON_MK1: 'laser_cannon_mk1',
  LASER_CANNON_MK2: 'laser_cannon_mk2',
  LASER_CANNON_MK3: 'laser_cannon_mk3',
  PLASMA_CANNON_MK1: 'plasma_cannon_mk1',
  PLASMA_CANNON_MK2: 'plasma_cannon_mk2',
  MISSILE_LAUNCHER_MK1: 'missile_launcher_mk1',
  RAILGUN_MK1: 'railgun_mk1',
  
  // Armadura
  BASIC_ARMOR: 'basic_armor',
  TITANIUM_ARMOR_MK1: 'titanium_armor_mk1',
  TITANIUM_ARMOR_MK2: 'titanium_armor_mk2',
  COMPOSITE_ARMOR_MK1: 'composite_armor_mk1',
  
  // Módulos
  SHIELD_GENERATOR_MK1: 'shield_generator_mk1',
  SHIELD_GENERATOR_MK2: 'shield_generator_mk2',
  ENGINE_BOOST_MK1: 'engine_boost_mk1',
  CARGO_EXPANSION_MK1: 'cargo_expansion_mk1',
  TARGETING_COMPUTER_MK1: 'targeting_computer_mk1',
  
  // Recursos especiales
  METAL_ORE: 'metal_ore',
  PLASMA_CELL: 'plasma_cell',
  ENERGY_CRYSTAL: 'energy_crystal',
  QUANTUM_CORE: 'quantum_core'
} as const;

export type ItemType = typeof OFFICIAL_ITEMS[keyof typeof OFFICIAL_ITEMS];
```

### **🎯 Rarezas de Items - Nombres OFICIALES**
```typescript
// ÚNICA lista de rarezas - NO CAMBIAR SIN DOCUMENTAR
export const OFFICIAL_RARITIES = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
  MYTHIC: 'mythic'
} as const;

export type ItemRarity = typeof OFFICIAL_RARITIES[keyof typeof OFFICIAL_RARITIES];
```

---

## 💰 **ECONOMÍA COMÚN - REGLAS OFICIALES**

### **📊 Fórmulas Económicas - ÚNICA Fuente**
```typescript
// ÚNICA lógica económica - NO DUPLICAR
export const ECONOMIC_RULES = {
  // Producción de recursos
  BASE_PRODUCTION: {
    metal: 10,      // por minuto
    plasma: 5,      // por minuto
    energy: 20,     // por minuto
    crystals: 1     // por minuto
  },
  
  // Costos de construcción
  SHIP_COSTS: {
    fighter: { metal: 1000, plasma: 500, energy: 200 },
    cruiser: { metal: 5000, plasma: 2500, energy: 1000 },
    battleship: { metal: 15000, plasma: 7500, energy: 3000 },
    carrier: { metal: 25000, plasma: 12500, energy: 5000 }
  },
  
  // Tarifas de marketplace
  MARKETPLACE_FEES: {
    listing_fee: 0.02,  // 2%
    sale_fee: 0.05,      // 5%
    currency_conversion: 0.01 // 1%
  },
  
  // Límites de transacción
  TRANSACTION_LIMITS: {
    max_transfer_per_day: 1000000,
    max_marketplace_listings: 50,
    min_listing_price: 10
  }
} as const;
```

---

## 📦 **INVENTARIO COMÚN - ESTRUCTURA OFICIAL**

### **🗂️ Sistema de Inventario - ÚNICA Lógica**
```typescript
// ÚNICA estructura de inventario - NO DUPLICAR
export interface CommonInventory {
  userId: string;
  items: InventoryItem[];
  maxSlots: number;
  usedSlots: number;
  lastUpdated: string;
}

export interface InventoryItem {
  id: string;
  itemId: ItemType;           // De OFFICIAL_ITEMS
  name: string;
  type: 'weapon' | 'armor' | 'module' | 'resource';
  rarity: ItemRarity;          // De OFFICIAL_RARITIES
  quantity: number;
  quality: number;            // 0-100
  properties: ItemProperties;
  equipped: boolean;
  slot?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemProperties {
  // Propiedades dinámicas basadas en el tipo
  damage?: number;
  range?: number;
  fireRate?: number;
  defense?: number;
  speed?: number;
  capacity?: number;
  [key: string]: any;
}
```

---

## 🚀 **REGLAS DE CAMBIO - NO DUPLICACIÓN**

### **📋 Principios Fundamentales**
1. **TODA la lógica de negocio vive en el backend**
2. **Los clientes solo consumen la API común**
3. **NUNCA duplicar lógica en los clientes**
4. **TODOS los cambios se documentan aquí primero**
5. **Los nombres de items son INMUTABLES sin documentación**

### **🔄 Proceso de Cambio**
```typescript
// Proceso OBLIGATORIO para cualquier cambio
interface ChangeProcess {
  1: "Documentar cambio aquí (Single Source of Truth)",
  2: "Actualizar backend común",
  3: "Actualizar API común si es necesario",
  4: "Notificar a equipos de clientes",
  5: "Actualizar clientes para consumir nueva API"
}
```

### **🚫 REGLAS DE NO DUPLICACIÓN**
```typescript
// NUNCA hacer esto en los clientes:
interface PROHIBITED_CLIENT_LOGIC {
  ❌_CALCULATE_RESOURCE_PRODUCTION: "Solo backend",
  ❌_VALIDATE_ITEM_EQUIPMENT: "Solo backend",
  ❌_PROCESS_MARKETPLACE_TRANSACTIONS: "Solo backend",
  ❌_CALCULATE_COMBAT_DAMAGE: "Solo backend",
  ❌_MANAGE_INVENTORY_SLOTS: "Solo backend",
  ❌_DETERMINE_ITEM_PRICES: "Solo backend",
  ❌_CREATE_NEW_ITEM_TYPES: "Documentar primero",
  ❌_CHANGE_RESOURCE_NAMES: "Documentar primero"
}
```

---

## 📚 **SISTEMA DE DOCUMENTACIÓN COMPARTIDA**

### **📁 Estructura de Documentación**
```
📁 docs/
├── 📄 SINGLE_SOURCE_OF_TRUTH.md     # ESTE DOCUMENTO (Principal)
├── 📄 API_COMMON_SPECIFICATION.md   # Especificación API común
├── 📄 DATABASE_SCHEMA.md            # Esquema BD común
├── 📄 ITEM_CATALOG.md               # Catálogo oficial de items
├── 📄 ECONOMIC_RULES.md             # Reglas económicas
├── 📁 CHANGE_LOG/                   # Registro de cambios
│   ├── 📄 2024-01-15_initial-setup.md
│   ├── 📄 2024-01-20_new_items.md
│   └── 📄 2024-01-25_economy_balance.md
└── 📁 CLIENT_INTEGRATION/          # Guías para clientes
    ├── 📄 unity_integration.md
    ├── 📄 web_integration.md
    └── 📄 mobile_integration.md
```

### **📝 Template de Documentación de Cambios**
```markdown
# Cambio: [Título del cambio]

## 📋 Información del Cambio
- **Fecha**: YYYY-MM-DD
- **Autor**: [Nombre del desarrollador]
- **Versión**: [Versión del backend]
- **Impacto**: [Backend/Unity/Web/Todos]

## 🔄 Descripción del Cambio
[Descripción detallada de lo que cambió]

## 📦 Items Afectados
- [Lista de items que cambiaron]

## 🔌 API Afectada
- [Endpoints que cambiaron]

## 📊 Impacto en Clientes
- [Cómo afecta a Unity PC]
- [Cómo afecta a Web]

## ✅ Pruebas Requeridas
- [Lista de pruebas necesarias]

## 🚀 Implementación
- [Pasos para implementar en clientes]
```

---

## 🎯 **CATÁLOGO OFICIAL DE ITEMS COMPLETO**

### **⚔️ Armas**
```typescript
export const WEAPONS_CATALOG = {
  // Lásers
  'laser_cannon_mk1': {
    name: 'Laser Cannon MK1',
    type: 'weapon',
    rarity: 'common',
    damage: 50,
    range: 300,
    fireRate: 2.0,
    energyCost: 10
  },
  'laser_cannon_mk2': {
    name: 'Laser Cannon MK2',
    type: 'weapon',
    rarity: 'rare',
    damage: 100,
    range: 400,
    fireRate: 2.5,
    energyCost: 15
  },
  'laser_cannon_mk3': {
    name: 'Laser Cannon MK3',
    type: 'weapon',
    rarity: 'epic',
    damage: 150,
    range: 500,
    fireRate: 3.0,
    energyCost: 20
  },
  
  // Plasma
  'plasma_cannon_mk1': {
    name: 'Plasma Cannon MK1',
    type: 'weapon',
    rarity: 'uncommon',
    damage: 75,
    range: 350,
    fireRate: 1.5,
    energyCost: 20
  },
  'plasma_cannon_mk2': {
    name: 'Plasma Cannon MK2',
    type: 'weapon',
    rarity: 'rare',
    damage: 125,
    range: 450,
    fireRate: 2.0,
    energyCost: 25
  },
  
  // Misiles
  'missile_launcher_mk1': {
    name: 'Missile Launcher MK1',
    type: 'weapon',
    rarity: 'rare',
    damage: 200,
    range: 600,
    fireRate: 0.5,
    energyCost: 30,
    projectileType: 'missile'
  },
  
  // Railguns
  'railgun_mk1': {
    name: 'Railgun MK1',
    type: 'weapon',
    rarity: 'epic',
    damage: 300,
    range: 800,
    fireRate: 0.3,
    energyCost: 50,
    projectileType: 'railgun'
  }
} as const;
```

### **🛡️ Armadura**
```typescript
export const ARMOR_CATALOG = {
  'basic_armor': {
    name: 'Basic Armor',
    type: 'armor',
    rarity: 'common',
    defense: 25,
    weight: 10,
    durability: 100
  },
  'titanium_armor_mk1': {
    name: 'Titanium Armor MK1',
    type: 'armor',
    rarity: 'uncommon',
    defense: 50,
    weight: 15,
    durability: 200
  },
  'titanium_armor_mk2': {
    name: 'Titanium Armor MK2',
    type: 'armor',
    rarity: 'rare',
    defense: 75,
    weight: 20,
    durability: 300
  },
  'composite_armor_mk1': {
    name: 'Composite Armor MK1',
    type: 'armor',
    rarity: 'epic',
    defense: 100,
    weight: 25,
    durability: 400,
    specialProperties: ['energy_resistance']
  }
} as const;
```

### **⚙️ Módulos**
```typescript
export const MODULES_CATALOG = {
  'shield_generator_mk1': {
    name: 'Shield Generator MK1',
    type: 'module',
    rarity: 'uncommon',
    shieldCapacity: 100,
    rechargeRate: 10,
    energyCost: 5
  },
  'shield_generator_mk2': {
    name: 'Shield Generator MK2',
    type: 'module',
    rarity: 'rare',
    shieldCapacity: 200,
    rechargeRate: 20,
    energyCost: 10
  },
  'engine_boost_mk1': {
    name: 'Engine Boost MK1',
    type: 'module',
    rarity: 'common',
    speedBonus: 25,
    energyCost: 15
  },
  'cargo_expansion_mk1': {
    name: 'Cargo Expansion MK1',
    type: 'module',
    rarity: 'uncommon',
    capacityBonus: 50,
    energyCost: 5
  },
  'targeting_computer_mk1': {
    name: 'Targeting Computer MK1',
    type: 'module',
    rarity: 'rare',
    accuracyBonus: 20,
    lockOnRangeBonus: 100,
    energyCost: 10
  }
} as const;
```

---

## 🔄 **VERIFICACIÓN DE CONSISTENCIA**

### **✅ Checklist de Validación**
```typescript
// Verificar que no haya duplicación
interface ConsistencyChecklist {
  backend_logic: {
    ✅_resource_calculation: "Solo en backend",
    ✅_inventory_management: "Solo en backend",
    ✅_marketplace_transactions: "Solo en backend",
    ✅_combat_resolution: "Solo en backend"
  },
  
  api_consistency: {
    ✅_same_endpoints: "Unity y Web usan misma API",
    ✅_same_response_format: "Formato idéntico",
    ✅_same_error_codes: "Códigos consistentes",
    ✅_same_authentication: "JWT común"
  },
  
  item_consistency: {
    ✅_same_item_ids: "Mismos IDs en todos lados",
    ✅_same_item_names: "Mismos nombres",
    ✅_same_item_properties: "Mismas propiedades",
    ✅_same_item_rarities: "Mismas rarezas"
  },
  
  economic_consistency: {
    ✅_same_resource_types: "Mismos tipos",
    ✅_same_production_rates: "Mismas tasas",
    ✅_same_costs: "Mismos costos",
    ✅_same_fees: "Mismas tarifas"
  }
}
```

---

## 🎯 **RESPONSABILIDADES**

### **👥 Equipos y Responsabilidades**
```typescript
// Definición clara de responsabilidades
interface TeamResponsibilities {
  backend_team: {
    responsibility: "ÚNICA fuente de verdad",
    tasks: [
      "Implementar toda la lógica de negocio",
      "Mantener la API común",
      "Gestionar la base de datos",
      "Documentar todos los cambios"
    ]
  },
  
  unity_team: {
    responsibility: "Consumidor de API",
    tasks: [
      "Implementar visualización 3D",
      "Consumir API común",
      "NO duplicar lógica de negocio",
      "Reportar problemas de API"
    ]
  },
  
  web_team: {
    responsibility: "Consumidor de API",
    tasks: [
      "Implementar interfaz web",
      "Consumir API común",
      "NO duplicar lógica de negocio",
      "Reportar problemas de API"
    ]
  }
}
```

---

## 🚨 **REGLAS DE EMERGENCIA**

### **⚠️ Si algo no funciona**
1. **Verificar la API común** - ¿Está el backend respondiendo?
2. **Verificar la documentación** - ¿Está actualizada?
3. **NO implementar lógica en el cliente** - Esperar a que se arregle el backend
4. **Documentar el problema** - Agregar al CHANGE_LOG
5. **Comunicar al equipo backend** - Notificar el problema

---

## 📞 **CONTACTO Y COORDINACIÓN**

### **🔄 Comunicación de Cambios**
- **Backend → Clientes**: Siempre documentar aquí primero
- **Clientes → Backend**: Reportar problemas, solicitar features
- **Cambios críticos**: Comunicar a todos los equipos inmediatamente
- **Documentación**: Mantener siempre actualizada

---

**🎯 ESTE DOCUMENTO ES LA ÚNICA FUENTE DE VERDAD PARA DESTOCK SPACE. CUALQUIER CAMBIO DEBE DOCUMENTARSE AQUÍ PRIMERO. NUNCA DUPLICAR LÓGICA EN LOS CLIENTES.**
