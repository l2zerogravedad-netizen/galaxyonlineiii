# 🌍 SISTEMA DE RECURSOS Y PRODUCCIÓN PASIVA

## 📋 **RESUMEN DE LA MECÁNICA**

El sistema de recursos es el motor económico del juego, gestionando la producción, almacenamiento, consumo y comercio de materiales esenciales para el desarrollo planetario y expansión espacial.

## ✅ **DATOS CONOCIDOS (Existentes)**

### **Recursos Base**
```typescript
// Basado en resource-collection.ts
export type ResourceKey = 
  | 'metal'      // Metal básico para construcciones
  | 'plasma'     // Energía avanzada
  | 'energy'     // Energía básica
  | 'credits'    // Moneda del juego
  | 'crystal'    // Recurso raro
  | 'dark_matter'; // Recurso legendario
```

### **Sistema de Producción Actual**
```typescript
interface ResourceProduction {
  perHour: Record<ResourceKey, number>;
  perDay: Record<ResourceKey, number>;
  efficiency: number; // 0-100%
  capacity: Record<ResourceKey, number>;
}
```

### **Edificios Productores**
- **Extractor de metal**: Producción básica
- **Generador de plasma**: Energía avanzada
- **Reactor de energía**: Energía básica
- **Depósitos**: Almacenamiento

## ❌ **DATOS FALTANTES**

### **1. Producción Pasiva Detallada**
- No hay sistema de producción continua
- No hay eficiencia por nivel de edificio
- No hay bonificaciones por tipo de planeta

### **2. Sistema de Almacenamiento**
- No hay límites de capacidad real
- No hay sistema de desbordamiento
- No hay depósitos especializados

### **3. Comercio Interplanetario**
- No hay mercado entre planetas
- No hay sistema de oferta/demanda
- No hay transporte de recursos

### **4. Recursos Especiales**
- No hay recursos por tipo de planeta
- No hay recursos temporales
- No hay recursos de evento

### **5. Sistema de Escasez**
- No hay agotamiento de recursos
- No hay regeneración natural
- No hay competencia por recursos

## 🎯 **PROPUESTA DE IMPLEMENTACIÓN**

### **🏭 Sistema de Producción Pasiva**

```typescript
interface PassiveProduction {
  buildingId: string;
  resourceType: ResourceKey;
  baseProduction: number;
  currentProduction: number;
  efficiency: number; // 0-100%
  lastUpdate: number;
  modifiers: {
    level: number;
    planetBonus: number;
    technologyBonus: number;
    commanderBonus: number;
  };
}

interface ProductionSystem {
  // Calcular producción por hora
  calculateHourlyProduction(
    planetId: string,
    resourceType: ResourceKey
  ): number;
  
  // Actualizar producción (llamado cada hora)
  updateProduction(planetId: string): void;
  
  // Obtener producción total
  getTotalProduction(planetId: string): Record<ResourceKey, number>;
  
  // Optimizar producción
  optimizeProduction(planetId: string): OptimizationResult;
}
```

### **🏪 Sistema de Almacenamiento**

```typescript
interface StorageSystem {
  capacity: Record<ResourceKey, number>;
  current: Record<ResourceKey, number>;
  overflow: Record<ResourceKey, number>;
  lastUpdate: number;
  
  // Almacenar recurso
  store(resource: ResourceKey, amount: number): {
    stored: number;
    overflow: number;
    message: string;
  };
  
  // Retirar recurso
  withdraw(resource: ResourceKey, amount: number): {
    withdrawn: number;
    remaining: number;
    success: boolean;
  };
  
  // Verificar capacidad
  checkCapacity(resource: ResourceKey, amount: number): boolean;
  
  // Ampliar almacenamiento
  expandCapacity(resource: ResourceKey, amount: number): void;
}

// Depósitos especializados
interface SpecializedStorage {
  type: 'metal' | 'plasma' | 'energy' | 'crystal';
  baseCapacity: number;
  levelBonus: number;
  efficiency: number;
  decayRate: number; // Pérdida por hora
}
```

### **🌍 Recursos por Tipo de Planeta**

```typescript
interface PlanetResourceProfile {
  primary: ResourceKey[];
  secondary: ResourceKey[];
  rare: ResourceKey[];
  bonuses: {
    [resource: string]: {
      production: number; // % bonus
      efficiency: number; // % efficiency
      extraction: number; // % extraction rate
    };
  };
  depletion: {
    [resource: string]: {
      rate: number; // % por hora
      minLevel: number; // Nivel mínimo de extracción
      regenRate: number; // Regeneración por hora
    };
  };
}

const PLANET_RESOURCE_PROFILES: Record<PlanetType, PlanetResourceProfile> = {
  terrestrial: {
    primary: ['metal', 'energy'],
    secondary: ['plasma', 'credits'],
    rare: ['crystal'],
    bonuses: {
      metal: { production: 20, efficiency: 15, extraction: 10 },
      energy: { production: 15, efficiency: 20, extraction: 5 }
    },
    depletion: {
      metal: { rate: 0.1, minLevel: 1, regenRate: 0.05 }
    }
  },
  desert: {
    primary: ['energy', 'metal'],
    secondary: ['plasma'],
    rare: ['crystal'],
    bonuses: {
      energy: { production: 30, efficiency: 25, extraction: 15 },
      metal: { production: 10, efficiency: 5, extraction: 20 }
    }
  },
  ocean: {
    primary: ['plasma', 'energy'],
    secondary: ['metal'],
    rare: ['crystal'],
    bonuses: {
      plasma: { production: 25, efficiency: 20, extraction: 15 },
      energy: { production: 20, efficiency: 15, extraction: 10 }
    }
  }
};
```

### **🚀 Comercio Interplanetario**

```typescript
interface TradeRoute {
  id: string;
  fromPlanet: string;
  toPlanet: string;
  resource: ResourceKey;
  amountPerHour: number;
  efficiency: number;
  cost: {
    credits: number;
    energy: number;
  };
  duration: number; // horas
  risk: number; // 0-100
  status: 'active' | 'paused' | 'completed' | 'failed';
}

interface TradeSystem {
  // Crear ruta comercial
  createRoute(
    fromPlanet: string,
    toPlanet: string,
    resource: ResourceKey,
    amount: number
  ): string;
  
  // Calcular coste de transporte
  calculateTransportCost(
    distance: number,
    amount: number,
    resource: ResourceKey
  ): { credits: number; energy: number };
  
  // Optimizar rutas
  optimizeRoutes(planetId: string): TradeRoute[];
  
  // Gestionar flotas comerciales
  assignTradeFleet(routeId: string, fleetId: string): boolean;
}
```

### **📈 Sistema de Economía Dinámica**

```typescript
interface MarketPrice {
  resource: ResourceKey;
  basePrice: number;
  currentPrice: number;
  demand: number; // 0-100
  supply: number; // 0-100
  trend: 'rising' | 'falling' | 'stable';
  lastUpdate: number;
}

interface EconomySystem {
  // Actualizar precios (cada hora)
  updatePrices(): void;
  
  // Calcular precio actual
  getCurrentPrice(resource: ResourceKey): number;
  
  // Predecir tendencia
  predictTrend(resource: ResourceKey): {
    direction: 'up' | 'down' | 'stable';
    confidence: number;
    timeframe: number;
  };
  
  // Ejecutar transacción
  executeTrade(
    resource: ResourceKey,
    amount: number,
    type: 'buy' | 'sell'
  ): TradeResult;
}
```

## 📊 **MODELOS DE DATOS SUGERIDOS**

### **🏭 Gestor de Producción**

```typescript
interface ProductionManager {
  // Iniciar producción
  startProduction(planetId: string): void;
  
  // Pausar producción
  pauseProduction(planetId: string): void;
  
  // Optimizar producción
  optimizeProduction(planetId: string): {
    recommendations: ProductionRecommendation[];
    expectedIncrease: Record<ResourceKey, number>;
  };
  
  // Obtener estado
  getProductionStatus(planetId: string): ProductionStatus;
}

interface ProductionRecommendation {
  buildingId: string;
  action: 'upgrade' | 'build' | 'demolish';
  reason: string;
  impact: Record<ResourceKey, number>;
  cost: Record<ResourceKey, number>;
}
```

### **📊 Sistema de Reportes**

```typescript
interface ResourceReport {
  planetId: string;
  timeframe: 'hour' | 'day' | 'week' | 'month';
  production: Record<ResourceKey, number>;
  consumption: Record<ResourceKey, number>;
  netChange: Record<ResourceKey, number>;
  efficiency: number;
  predictions: {
    nextHour: Record<ResourceKey, number>;
    nextDay: Record<ResourceKey, number>;
    nextWeek: Record<ResourceKey, number>;
  };
}
```

## ⚠️ **PENDIENTES PARA PROGRAMACIÓN**

### **🔥 Alta Prioridad**
1. **Implementar producción pasiva continua**
2. **Crear sistema de almacenamiento con límites**
3. **Desarrollar recursos por tipo de planeta**
4. **Agregar sistema de eficiencia**

### **⚡ Media Prioridad**
1. **Comercio interplanetario básico**
2. **Sistema de precios dinámicos**
3. **Optimización automática**
4. **Reportes de producción**

### **🔮 Baja Prioridad**
1. **Economía avanzada con inflación**
2. **Recursos temporales de eventos**
3. **Sistema de escasez global**
4. **Predicción avanzada de mercados**

## 🎮 **EJEMPLOS DE USO**

### **Producción Básica**
```typescript
// Configurar producción automática
ProductionManager.startProduction(planetId);

// Obtener producción por hora
const hourlyProduction = ProductionSystem.calculateHourlyProduction(
  planetId, 
  'metal'
);
console.log(`Produciendo ${hourlyProduction} metal por hora`);
```

### **Comercio entre Planetas**
```typescript
// Crear ruta comercial
const routeId = TradeSystem.createRoute(
  'planet_1',
  'planet_2',
  'metal',
  1000
);

// Asignar flota comercial
TradeSystem.assignTradeFleet(routeId, fleetId);
```

### **Optimización de Producción**
```typescript
// Obtener recomendaciones
const recommendations = ProductionManager.optimizeProduction(planetId);

recommendations.recommendations.forEach(rec => {
  console.log(`${rec.action}: ${rec.reason}`);
  console.log(`Impacto: ${JSON.stringify(rec.impact)}`);
});
```

## 📈 **MÉTRICAS DE ÉXITO**

### **Indicadores Clave**
- **Producción base**: 100-1000 unidades/hora
- **Eficiencia por nivel**: +10% por nivel
- **Bonus por planeta**: 10-30% según tipo
- **Capacidad de almacenamiento**: 10,000-1,000,000 unidades

### **Balance de Juego**
- **Early game**: Producción limitada, decisiones clave
- **Mid game**: Expansión de producción, optimización
- **Late game**: Automatización, comercio masivo

### **Economía Sostenible**
- **Inflación controlada**: 2-5% mensual
- **Demanda dinámica**: Basada en actividad de jugadores
- **Recursos estratégicos**: Escasez controlada

---

**📍 Próximo paso**: Implementar sistema de diseño de naves modular.
