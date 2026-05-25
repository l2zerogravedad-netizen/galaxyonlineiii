# 🏗️ SISTEMA DE EDIFICIOS - DISEÑO COMPLETO

## 📋 **RESUMEN DE LA MECÁNICA**

El sistema de edificios es el pilar fundamental del desarrollo planetario, permitiendo a los jugadores construir, mejorar y gestionar estructuras que generan recursos, proporcionan defensa y desbloquean tecnologías avanzadas.

## ✅ **DATOS CONOCIDOS (Existentes)**

### **Edificios Terrestres Actuales**
```typescript
// Basado en buildings-complete.ts
export interface BuildingComplete {
  id: string;
  type: BuildingType;
  name: string;
  category: 'production' | 'storage' | 'infrastructure' | 'military' | 'research' | 'defense';
  maxLevel: number;
  levels: BuildingLevel[];
  unlockRequirement?: {
    buildingId?: string;
    level?: number;
  };
}
```

### **Tipos de Edificios Existentes**
- **Producción**: Extractor de metal, generador de plasma, reactor de energía
- **Almacenamiento**: Depósitos de recursos
- **Infraestructura**: Centro de mando, laboratorios
- **Militar**: Fábricas de naves, torretas defensivas
- **Investigación**: Centros tecnológicos

## ❌ **DATOS FALTANTES**

### **1. Límites de Construcción**
- No hay sistema de slots por tipo de edificio
- No hay límites por categoría
- No hay restricciones por nivel de jugador

### **2. Edificios Espaciales**
- No existen edificios en órbita
- No hay estaciones espaciales construibles
- No hay plataformas de defensa orbital

### **3. Sistema de Cola**
- No hay sistema de cola de construcción
- No hay priorización de construcciones
- No hay cancelación de construcciones

### **4. Edificios Especiales**
- No hay edificios por tipo de planeta
- No hay edificios de evento
- No hay edificios temporales

## 🎯 **PROPUESTA DE IMPLEMENTACIÓN**

### **🏗️ Sistema de Slots de Construcción**

```typescript
interface PlanetBuildingSlots {
  total: number;
  used: number;
  available: number;
  byCategory: {
    production: number;
    military: number;
    research: number;
    infrastructure: number;
    defense: number;
    storage: number;
  };
}

interface BuildingSlot {
  id: string;
  position: { x: number; y: number };
  buildingId?: string;
  category: BuildingCategory;
  size: 'small' | 'medium' | 'large';
  requirements: {
    minLevel: number;
    requiredBuildings: string[];
  };
}
```

### **🚀 Edificios Espaciales**

```typescript
interface SpaceBuilding extends BuildingComplete {
  orbit: 'low' | 'medium' | 'high';
  requires: {
    planetLevel: number;
    technology: string[];
    resources: Record<ResourceKey, number>;
  };
  effects: {
    orbitalDefense: number;
    fleetBonus: number;
    scanRange: number;
  };
}

// Nuevos tipos de edificios espaciales
const SPACE_BUILDINGS = {
  orbital_station: {
    name: 'Estación Orbital',
    category: 'infrastructure',
    slots: { small: 2, medium: 1, large: 0 },
    effects: { fleetBonus: 15, scanRange: 50 }
  },
  defense_platform: {
    name: 'Plataforma Defensiva',
    category: 'military',
    slots: { small: 0, medium: 1, large: 1 },
    effects: { orbitalDefense: 25 }
  },
  research_lab: {
    name: 'Laboratorio Orbital',
    category: 'research',
    slots: { small: 1, medium: 1, large: 0 },
    effects: { researchSpeed: 20 }
  }
};
```

### **📋 Sistema de Cola de Construcción**

```typescript
interface ConstructionQueue {
  id: string;
  planetId: string;
  items: ConstructionItem[];
  maxQueue: number;
  currentBuilding?: ConstructionItem;
}

interface ConstructionItem {
  id: string;
  buildingId: string;
  action: 'build' | 'upgrade' | 'demolish';
  level?: number;
  startTime: number;
  duration: number;
  cost: Record<ResourceKey, number>;
  priority: number;
  canCancel: boolean;
}
```

### **🌍 Edificios por Tipo de Planeta**

```typescript
interface PlanetBuildingRestrictions {
  [planetType: string]: {
    allowed: string[];
    restricted: string[];
    bonus: string[];
    special: string[];
  };
}

const PLANET_BUILDING_RESTRICTIONS: PlanetBuildingRestrictions = {
  terrestrial: {
    allowed: ['all'],
    restricted: ['geothermal_plant'],
    bonus: ['hydroponics_farm'],
    special: ['terraforming_station']
  },
  desert: {
    allowed: ['solar_array', 'extractor', 'storage'],
    restricted: ['hydroponics_farm', 'water_purifier'],
    bonus: ['solar_boost'],
    special: ['sand_converter']
  },
  ocean: {
    allowed: ['water_purifier', 'hydroponics_farm'],
    restricted: ['solar_array'],
    bonus: ['tidal_generator'],
    special: ['underwater_lab']
  }
};
```

## 📊 **MODELOS DE DATOS SUGERIDOS**

### **🏗️ Sistema de Construcción Mejorado**

```typescript
interface ConstructionSystem {
  // Verificación de disponibilidad
  canBuild(
    planetId: string, 
    buildingId: string, 
    level?: number
  ): {
    canBuild: boolean;
    reasons: string[];
    cost: Record<ResourceKey, number>;
    time: number;
  };
  
  // Iniciar construcción
  startConstruction(
    planetId: string,
    buildingId: string,
    action: 'build' | 'upgrade' | 'demolish',
    priority?: number
  ): string;
  
  // Gestionar cola
  addToQueue(planetId: string, item: ConstructionItem): boolean;
  removeFromQueue(planetId: string, queueItemId: string): boolean;
  reorderQueue(planetId: string, itemIds: string[]): boolean;
  
  // Estado de construcción
  getConstructionStatus(planetId: string): ConstructionQueue;
  getBuildingProgress(planetId: string, buildingId: string): number;
}
```

### **📈 Sistema de Mejoras**

```typescript
interface BuildingUpgrade {
  currentLevel: number;
  targetLevel: number;
  cost: Record<ResourceKey, number>;
  time: number;
  requirements: {
    playerLevel: number;
    technologies: string[];
    buildings: { id: string; level: number }[];
  };
  benefits: {
    production: Record<ResourceKey, number>;
    capacity: Record<ResourceKey, number>;
    efficiency: number;
  };
}
```

## ⚠️ **PENDIENTES PARA PROGRAMACIÓN**

### **🔥 Alta Prioridad**
1. **Implementar sistema de slots por categoría**
2. **Crear edificios espaciales básicos**
3. **Desarrollar cola de construcción**
4. **Agregar restricciones por nivel**

### **⚡ Media Prioridad**
1. **Edificios especiales por planeta**
2. **Sistema de demolición**
3. **Optimización automática de construcción**
4. **Plantillas de construcción**

### **🔮 Baja Prioridad**
1. **Edificios de evento temporal**
2. **Sistema de decoración**
3. **Animaciones de construcción**
4. **Efectos visuales avanzados**

## 🎮 **EJEMPLOS DE USO**

### **Construcción Básica**
```typescript
// Verificar si se puede construir
const canBuild = ConstructionSystem.canBuild(planetId, 'metal_extractor');
if (canBuild.canBuild) {
  // Agregar a la cola
  const queueId = ConstructionSystem.startConstruction(
    planetId, 
    'metal_extractor', 
    'build'
  );
}
```

### **Construcción Espacial**
```typescript
// Construir estación orbital
const canBuildOrbital = ConstructionSystem.canBuild(
  planetId, 
  'orbital_station'
);
if (canBuildOrbital.canBuild) {
  // Requiere tecnología avanzada
  if (player.hasTechnology('orbital_construction')) {
    ConstructionSystem.startConstruction(planetId, 'orbital_station');
  }
}
```

## 📈 **MÉTRICAS DE ÉXITO**

### **Indicadores Clave**
- **Tiempo de construcción**: 5-60 minutos según nivel
- **Costo progresivo**: 1.5x por nivel
- **Eficiencia**: 100% base + 10% por nivel
- **Slots por planeta**: 25-110 según tamaño

### **Balance de Juego**
- **Early game**: Construcción rápida y barata
- **Mid game**: Decisiones estratégicas de slots
- **Late game**: Optimización y especialización

---

**📍 Próximo paso**: Implementar sistema de recursos y producción pasiva.
