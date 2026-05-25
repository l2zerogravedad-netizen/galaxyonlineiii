# ⚔️ SISTEMA DE COMBATE DETALLADO - ARMAS Y BLINDAJES

## 📋 **RESUMEN DE LA MECÁNICA**

El sistema de combate detallado implementa un sistema de daño por turnos basado en tipos de armas, blindajes, y debilidades específicas, con cálculos precisos de daño, efectos especiales y estrategias contrapuestas.

## ✅ **DATOS CONOCIDOS (Existentes)**

### **Sistema de Combate Básico**
```typescript
// Basado en combat-system.ts
export interface CombatSystem {
  damage: number;
  accuracy: number;
  critical: number;
  evasion: number;
}
```

### **Armas Existentes**
- **Armas cinéticas**: Proyectiles físicos
- **Armas de plasma**: Energía térmica
- **Misiles**: Proyectiles guiados
- **Láseres**: Energía concentrada

## ❌ **DATOS FALTANTES**

### **1. Sistema de Tipos de Armas Detallado**
- No hay sistema de debilidades por tipo
- No hay penetración de blindaje
- No hay efectos especiales por tipo

### **2. Sistema de Blindajes**
- No hay tipos de blindaje específicos
- No hay resistencias y debilidades
- No hay sistema de degradación

### **3. Cálculo de Daño Avanzado**
- No hay sistema de daño crítico
- No hay penetración y saturación
- No hay efectos de área

### **4. Sistema de Efectos Especiales**
- No hay estados alterados
- No hay buffs/debuffs
- No hay sistema de condiciones

### **5. Balance de Combate**
- No hay sistema de roca-papel-tijeras
- No hay contraestrategias
- No hay metajuego dinámico

## 🎯 **PROPUESTA DE IMPLEMENTACIÓN**

### **🔫 Sistema de Tipos de Armas**

```typescript
interface WeaponType {
  id: string;
  name: string;
  category: 'kinetic' | 'energy' | 'explosive' | 'magnetic' | 'special';
  damageType: DamageType;
  properties: {
    baseDamage: number;
    fireRate: number;
    range: number;
    accuracy: number;
    penetration: number; // 0-100%
    criticalChance: number; // 0-100%
    splashRadius?: number;
    tracking?: number; // Para misiles
  };
  effectiveness: {
    vsArmor: { [armorType: string]: number }; // Multiplicador de daño
    vsShield: number;
    vsHull: number;
  };
  cost: {
    energy: number;
    ammo?: number;
    heat: number; // Generación de calor
  };
}

type DamageType = 
  | 'physical'    // Daño físico
  | 'thermal'     // Daño por calor
  | 'explosive'   // Daño por explosión
  | 'electromagnetic' // Daño EMP
  | 'corrosive'   // Daño por corrosión
  | 'radiation';  // Daño por radiación

// Tipos de armas específicos
const WEAPON_TYPES: Record<string, WeaponType> = {
  kinetic_cannon: {
    id: 'kinetic_cannon',
    name: 'Cañón Cinético',
    category: 'kinetic',
    damageType: 'physical',
    properties: {
      baseDamage: 100,
      fireRate: 2,
      range: 500,
      accuracy: 85,
      penetration: 30,
      criticalChance: 15
    },
    effectiveness: {
      vsArmor: {
        'light': 1.2,
        'medium': 1.0,
        'heavy': 0.8,
        'reactive': 0.6
      },
      vsShield: 0.7,
      vsHull: 1.1
    }
  },
  plasma_cannon: {
    id: 'plasma_cannon',
    name: 'Cañón de Plasma',
    category: 'energy',
    damageType: 'thermal',
    properties: {
      baseDamage: 80,
      fireRate: 3,
      range: 400,
      accuracy: 90,
      penetration: 20,
      criticalChance: 10
    },
    effectiveness: {
      vsArmor: {
        'light': 0.9,
        'medium': 1.0,
        'heavy': 1.1,
        'reactive': 0.5
      },
      vsShield: 1.3,
      vsHull: 0.9
    }
  }
};
```

### **🛡️ Sistema de Blindajes**

```typescript
interface ArmorType {
  id: string;
  name: string;
  category: 'light' | 'medium' | 'heavy' | 'reactive' | 'energy';
  properties: {
    baseDefense: number;
    damageReduction: number; // 0-100%
    regeneration: number; // Por segundo
    heatResistance: number; // 0-100%
    energyResistance: number; // 0-100%
  };
  vulnerabilities: {
    [damageType: string]: number; // Multiplicador de daño recibido
  };
  specialEffects?: {
    reflectDamage?: number; // % de daño reflejado
    explosiveReaction?: number; // Daño explosivo al ser destruido
    energyAbsorption?: number; // % de energía absorbida
  };
}

// Tipos de blindaje específicos
const ARMOR_TYPES: Record<string, ArmorType> = {
  light_alloy: {
    id: 'light_alloy',
    name: 'Aleación Ligera',
    category: 'light',
    properties: {
      baseDefense: 50,
      damageReduction: 15,
      regeneration: 0.5,
      heatResistance: 30,
      energyResistance: 20
    },
    vulnerabilities: {
      'physical': 1.1,
      'thermal': 1.2,
      'explosive': 1.3,
      'electromagnetic': 1.0
    }
  },
  reactive_armor: {
    id: 'reactive_armor',
    name: 'Blindaje Reactivo',
    category: 'reactive',
    properties: {
      baseDefense: 120,
      damageReduction: 40,
      regeneration: 0.1,
      heatResistance: 50,
      energyResistance: 30
    },
    vulnerabilities: {
      'physical': 0.8,
      'thermal': 1.5,
      'explosive': 0.6,
      'electromagnetic': 1.2
    },
    specialEffects: {
      explosiveReaction: 50 // 50% del daño en área
    }
  }
};
```

### **⚡ Sistema de Escudos**

```typescript
interface ShieldType {
  id: string;
  name: string;
  category: 'standard' | 'regenerative' | 'adaptive' | 'phase';
  properties: {
    maxCapacity: number;
    regenRate: number; // Por segundo
    regenDelay: number; // Segundos sin daño para empezar regeneración
    efficiency: number; // 0-100%
    powerConsumption: number;
  };
  resistances: {
    [damageType: string]: number; // Reducción de daño 0-100%
  };
  specialEffects?: {
    overcharge?: number; // % de capacidad extra temporal
    feedback?: number; // % de daño devuelto
    absorption?: { [damageType: string]: number }; // Absorción de daño
  };
}

const SHIELD_TYPES: Record<string, ShieldType> = {
  standard_shield: {
    id: 'standard_shield',
    name: 'Escudo Estándar',
    category: 'standard',
    properties: {
      maxCapacity: 200,
      regenRate: 5,
      regenDelay: 3,
      efficiency: 85,
      powerConsumption: 10
    },
    resistances: {
      'physical': 20,
      'thermal': 30,
      'explosive': 25,
      'electromagnetic': 40
    }
  },
  adaptive_shield: {
    id: 'adaptive_shield',
    name: 'Escudo Adaptativo',
    category: 'adaptive',
    properties: {
      maxCapacity: 150,
      regenRate: 8,
      regenDelay: 2,
      efficiency: 90,
      powerConsumption: 15
    },
    resistances: {
      'physical': 10,
      'thermal': 10,
      'explosive': 10,
      'electromagnetic': 10
    },
    specialEffects: {
      absorption: {
        'physical': 0.5, // Absorbe 50% del daño y lo convierte en resistencia
        'thermal': 0.5,
        'explosive': 0.5,
        'electromagnetic': 0.5
      }
    }
  }
};
```

### **🎯 Sistema de Cálculo de Daño**

```typescript
interface DamageCalculation {
  // Calcular daño base
  calculateBaseDamage(
    weapon: WeaponType,
    distance: number,
    accuracy: number
  ): number;
  
  // Aplicar modificadores de blindaje
  applyArmorModifiers(
    damage: number,
    damageType: DamageType,
    armor: ArmorType
  ): number;
  
  // Aplicar modificadores de escudo
  applyShieldModifiers(
    damage: number,
    damageType: DamageType,
    shield: ShieldType
  ): number;
  
  // Calcular daño crítico
  calculateCritical(
    baseDamage: number,
    criticalChance: number,
    criticalMultiplier: number
  ): { damage: number; isCritical: boolean };
  
  // Calcular daño de área
  calculateSplashDamage(
    impactPosition: Position,
    splashRadius: number,
    baseDamage: number,
    targets: Target[]
  ): SplashDamageResult;
}

interface DamageResult {
  totalDamage: number;
  shieldDamage: number;
  armorDamage: number;
  hullDamage: number;
  overkill: number;
  isCritical: boolean;
  effects: DamageEffect[];
  penetration: number;
}

interface DamageEffect {
  type: 'burn' | 'stun' | 'corrosion' | 'emp' | 'radiation';
  duration: number;
  strength: number;
  stackable: boolean;
}
```

### **🔥 Sistema de Estados y Efectos**

```typescript
interface CombatStatus {
  shipId: string;
  currentHealth: number;
  maxHealth: number;
  currentShield: number;
  maxShield: number;
  currentArmor: number;
  maxArmor: number;
  
  // Estados alterados
  effects: StatusEffect[];
  conditions: CombatCondition[];
  
  // Modificadores temporales
  modifiers: {
    damage: number;
    accuracy: number;
    speed: number;
    defense: number;
  };
}

interface StatusEffect {
  id: string;
  type: StatusType;
  name: string;
  duration: number;
  strength: number;
  source: string;
  stacks: number;
  maxStacks: number;
  tickInterval?: number; // Para efectos periódicos
}

type StatusType = 
  | 'burn'         // Daño por fuego periódico
  | 'freeze'       // Reducción de velocidad
  | 'stun'         // Inmovilización
  | 'corrosion'    // Daño a blindaje
  | 'emp'          // Desactivación de sistemas
  | 'radiation'    // Daño a tripulación
  | 'overload'     // Sobrecarga de energía
  | 'stealth'      // Invisibilidad
  | 'targeting';   // Marcado para aumento de precisión

interface StatusSystem {
  // Aplicar efecto
  applyEffect(target: string, effect: StatusEffect): boolean;
  
  // Procesar efectos (cada turno)
  processEffects(ship: CombatStatus): StatusEffect[];
  
  // Limpiar efectos expirados
  cleanExpiredEffects(ship: CombatStatus): void;
  
  // Calcular modificadores totales
  calculateModifiers(ship: CombatStatus): CombatModifiers;
}
```

### **🎲 Sistema de Balance Roca-Papel-Tijeras**

```typescript
interface CombatTriangle {
  // Armas > Blindajes
  weaponAdvantage: {
    [weaponType: string]: {
      strong: string[]; // Tipos de blindaje débiles contra esta arma
      weak: string[];   // Tipos de blindaje fuertes contra esta arma
    };
  };
  
  // Estrategias contraestrategias
  counterStrategies: {
    [strategy: string]: {
      counteredBy: string[];
      effectiveAgainst: string[];
    };
  };
}

const COMBAT_TRIANGLE: CombatTriangle = {
  weaponAdvantage: {
    kinetic: {
      strong: ['light', 'energy'],
      weak: ['heavy', 'reactive']
    },
    energy: {
      strong: ['medium', 'reactive'],
      weak: ['heavy', 'adaptive']
    },
    explosive: {
      strong: ['heavy', 'light'],
      weak: ['reactive', 'energy']
    },
    magnetic: {
      strong: ['reactive', 'adaptive'],
      weak: ['light', 'medium']
    }
  },
  counterStrategies: {
    'assault': {
      counteredBy: ['defensive', 'kiting'],
      effectiveAgainst: ['support', 'scout']
    },
    'defensive': {
      counteredBy: ['artillery', 'flanking'],
      effectiveAgainst: ['assault', 'brawling']
    },
    'support': {
      counteredBy: ['assault', 'flanking'],
      effectiveAgainst: ['artillery', 'defensive']
    }
  }
};
```

## 📊 **MODELOS DE DATOS SUGERIDOS**

### **⚔️ Gestor de Combate**

```typescript
interface CombatManager {
  // Iniciar sesión de combate
  startCombatSession(
    participants: CombatParticipant[],
    environment: CombatEnvironment
  ): CombatSession;
  
  // Procesar turno
  processTurn(sessionId: string): TurnResult;
  
  // Calcular resultado de ataque
  resolveAttack(
    attacker: CombatShip,
    defender: CombatShip,
    weapon: WeaponType
  ): AttackResult;
  
  // Aplicar efectos de área
  applyAreaEffects(
    position: Position,
    radius: number,
    effect: AreaEffect
  ): void;
  
  // Finalizar combate
  endCombat(sessionId: string): CombatSummary;
}

interface CombatEnvironment {
  terrain: TerrainType;
  visibility: number;
  obstacles: Obstacle[];
  weather?: WeatherEffect;
  gravity: number;
}
```

### **📈 Sistema de Analítica de Combate**

```typescript
interface CombatAnalytics {
  // Estadísticas de armas
  getWeaponStats(weaponId: string): WeaponStats;
  
  // Análisis de efectividad
  analyzeEffectiveness(
    weaponType: string,
    armorType: string
  ): EffectivenessAnalysis;
  
  // Optimización de carga
  optimizeLoadout(
    ship: ShipDesign,
    expectedEnemies: EnemyProfile[]
  ): LoadoutRecommendation;
  
  // Predicción de combate
  predictCombatOutcome(
    attacker: CombatFleet,
    defender: CombatFleet
  ): CombatPrediction;
}

interface EffectivenessAnalysis {
  damagePerSecond: number;
  accuracyRate: number;
  criticalRate: number;
  ammoEfficiency: number;
  energyEfficiency: number;
  overallRating: number;
}
```

## ⚠️ **PENDIENTES PARA PROGRAMACIÓN**

### **🔥 Alta Prioridad**
1. **Implementar sistema de tipos de armas**
2. **Crear sistema de blindajes con resistencias**
3. **Desarrollar cálculo de daño detallado**
4. **Agregar sistema de estados alterados**

### **⚡ Media Prioridad**
1. **Sistema de escudos avanzado**
2. **Efectos de área y splash**
3. **Balance roca-papel-tijeras**
4. **Optimización de carga**

### **🔮 Baja Prioridad**
1. **Efectos visuales de combate**
2. **Sistema de destrucción parcial**
3. **Reproducción de combates**
4. **Estadísticas históricas**

## 🎮 **EJEMPLOS DE USO**

### **Cálculo de Daño**
```typescript
// Calcular daño de ataque
const damage = DamageCalculation.calculateBaseDamage(
  weapon,
  distance,
  attacker.accuracy
);

// Aplicar modificadores de blindaje
const armorDamage = DamageCalculation.applyArmorModifiers(
  damage,
  weapon.damageType,
  defender.armor
);

// Calcular crítico
const critical = DamageCalculation.calculateCritical(
  armorDamage,
  weapon.properties.criticalChance,
  2.0 // Multiplicador crítico
);
```

### **Aplicación de Efectos**
```typescript
// Aplicar efecto de quemadura
const burnEffect: StatusEffect = {
  id: 'burn_001',
  type: 'burn',
  name: 'Quemadura',
  duration: 5,
  strength: 10,
  source: 'plasma_cannon',
  stacks: 1,
  maxStacks: 3,
  tickInterval: 1
};

StatusSystem.applyEffect(defender.id, burnEffect);
```

### **Optimización de Carga**
```typescript
// Optimizar carga contra enemigos conocidos
const recommendation = CombatAnalytics.optimizeLoadout(
  shipDesign,
  expectedEnemies
);

console.log('Arma recomendada:', recommendation.primaryWeapon);
console.log('Blindaje recomendado:', recommendation.armorType);
```

## 📈 **MÉTRICAS DE ÉXITO**

### **Indicadores Clave**
- **Tipos de armas**: 5 categorías principales
- **Tipos de blindaje**: 5 categorías con resistencias
- **Multiplicadores de daño**: 0.5x - 2.0x según efectividad
- **Probabilidad crítica**: 5-25% según tipo de arma

### **Balance de Juego**
- **Early game**: Armas básicas, blindajes simples
- **Mid game**: Armas especializadas, blindajes adaptativos
- **Late game**: Armas legendarias, blindajes experimentales

### **Profundidad Estratégica**
- **Contraestrategias**: Cada arma tiene debilidades
- **Adaptación**: Cambiar carga según enemigos
- **Especialización**: Roles específicos por configuración

---

**📍 Próximo paso**: Implementar sistema de comandantes con habilidades y progresión.
