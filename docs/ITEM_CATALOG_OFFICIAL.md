# 📦 CATÁLOGO OFICIAL DE ITEMS - DESTOCK SPACE

## 📋 **PRINCIPIO FUNDAMENTAL**

**ESTE es el ÚNICO catálogo oficial de items para DESTOCK SPACE. NUNCA crear items nuevos sin documentarlos aquí primero.**

---

## 🎯 **SISTEMA DE NOMENCLATURA**

### **📝 Reglas de Nomenclatura**
```
formato: category_item_mk{version}
ejemplos:
- weapon_laser_cannon_mk1
- armor_titanium_mk2
- module_shield_generator_mk1
- resource_metal_ore
```

### **🔤 Convenciones**
- **minúsculas** con guiones bajos
- **versión** siempre al final (mk1, mk2, mk3)
- **categoría** siempre al principio
- **NO cambiar nombres** sin actualizar todos los clientes

---

## ⚔️ **ARMAS - CATÁLOGO COMPLETO**

### **🔫 Lásers**
```typescript
export const LASER_WEAPONS = {
  'weapon_laser_cannon_mk1': {
    id: 'weapon_laser_cannon_mk1',
    name: 'Laser Cannon MK1',
    category: 'weapon',
    type: 'laser',
    rarity: 'common',
    level: 1,
    properties: {
      damage: 50,
      range: 300,
      fireRate: 2.0,
      energyCost: 10,
      accuracy: 0.85,
      projectileSpeed: 800
    },
    requirements: {
      level: 1,
      skills: ['basic_weapons'],
      shipType: ['fighter', 'cruiser']
    },
    cost: {
      credits: 100,
      metal: 50,
      plasma: 25
    },
    description: 'Basic laser cannon for beginners'
  },
  
  'weapon_laser_cannon_mk2': {
    id: 'weapon_laser_cannon_mk2',
    name: 'Laser Cannon MK2',
    category: 'weapon',
    type: 'laser',
    rarity: 'rare',
    level: 5,
    properties: {
      damage: 100,
      range: 400,
      fireRate: 2.5,
      energyCost: 15,
      accuracy: 0.90,
      projectileSpeed: 1000
    },
    requirements: {
      level: 5,
      skills: ['intermediate_weapons'],
      shipType: ['fighter', 'cruiser', 'frigate']
    },
    cost: {
      credits: 500,
      metal: 250,
      plasma: 125
    },
    description: 'Improved laser cannon with better damage and range'
  },
  
  'weapon_laser_cannon_mk3': {
    id: 'weapon_laser_cannon_mk3',
    name: 'Laser Cannon MK3',
    category: 'weapon',
    type: 'laser',
    rarity: 'epic',
    level: 10,
    properties: {
      damage: 150,
      range: 500,
      fireRate: 3.0,
      energyCost: 20,
      accuracy: 0.95,
      projectileSpeed: 1200,
      penetration: 0.1
    },
    requirements: {
      level: 10,
      skills: ['advanced_weapons'],
      shipType: ['cruiser', 'battleship', 'destroyer']
    },
    cost: {
      credits: 2000,
      metal: 1000,
      plasma: 500,
      crystals: 50
    },
    description: 'Advanced laser cannon with penetration capabilities'
  }
} as const;
```

### **⚡ Plasma**
```typescript
export const PLASMA_WEAPONS = {
  'weapon_plasma_cannon_mk1': {
    id: 'weapon_plasma_cannon_mk1',
    name: 'Plasma Cannon MK1',
    category: 'weapon',
    type: 'plasma',
    rarity: 'uncommon',
    level: 3,
    properties: {
      damage: 75,
      range: 350,
      fireRate: 1.5,
      energyCost: 20,
      accuracy: 0.80,
      projectileSpeed: 600,
      areaOfEffect: 10
    },
    requirements: {
      level: 3,
      skills: ['plasma_weapons'],
      shipType: ['cruiser', 'frigate']
    },
    cost: {
      credits: 300,
      metal: 150,
      plasma: 100
    },
    description: 'Plasma weapon with area damage'
  },
  
  'weapon_plasma_cannon_mk2': {
    id: 'weapon_plasma_cannon_mk2',
    name: 'Plasma Cannon MK2',
    category: 'weapon',
    type: 'plasma',
    rarity: 'rare',
    level: 7,
    properties: {
      damage: 125,
      range: 450,
      fireRate: 2.0,
      energyCost: 25,
      accuracy: 0.85,
      projectileSpeed: 700,
      areaOfEffect: 15,
      dotDamage: 5
    },
    requirements: {
      level: 7,
      skills: ['advanced_plasma'],
      shipType: ['cruiser', 'battleship']
    },
    cost: {
      credits: 1000,
      metal: 500,
      plasma: 250,
      crystals: 25
    },
    description: 'Enhanced plasma cannon with damage over time'
  }
} as const;
```

### **🚀 Misiles**
```typescript
export const MISSILE_WEAPONS = {
  'weapon_missile_launcher_mk1': {
    id: 'weapon_missile_launcher_mk1',
    name: 'Missile Launcher MK1',
    category: 'weapon',
    type: 'missile',
    rarity: 'rare',
    level: 6,
    properties: {
      damage: 200,
      range: 600,
      fireRate: 0.5,
      energyCost: 30,
      accuracy: 0.70,
      projectileSpeed: 400,
      tracking: true,
      explosionRadius: 25
    },
    requirements: {
      level: 6,
      skills: ['missile_systems'],
      shipType: ['frigate', 'destroyer', 'battleship']
    },
    cost: {
      credits: 1500,
      metal: 750,
      plasma: 300,
      crystals: 50
    },
    description: 'Homing missile launcher with explosive warheads'
  },
  
  'weapon_torpedo_launcher_mk1': {
    id: 'weapon_torpedo_launcher_mk1',
    name: 'Torpedo Launcher MK1',
    category: 'weapon',
    type: 'torpedo',
    rarity: 'epic',
    level: 12,
    properties: {
      damage: 400,
      range: 800,
      fireRate: 0.3,
      energyCost: 50,
      accuracy: 0.75,
      projectileSpeed: 300,
      tracking: true,
      explosionRadius: 50,
      shieldPiercing: 0.2
    },
    requirements: {
      level: 12,
      skills: ['torpedo_systems'],
      shipType: ['battleship', 'carrier']
    },
    cost: {
      credits: 5000,
      metal: 2500,
      plasma: 1000,
      crystals: 200
    },
    description: 'Heavy torpedo launcher with shield piercing'
  }
} as const;
```

### **🎯 Railguns**
```typescript
export const RAILGUN_WEAPONS = {
  'weapon_railgun_mk1': {
    id: 'weapon_railgun_mk1',
    name: 'Railgun MK1',
    category: 'weapon',
    type: 'railgun',
    rarity: 'epic',
    level: 9,
    properties: {
      damage: 300,
      range: 800,
      fireRate: 0.3,
      energyCost: 50,
      accuracy: 0.95,
      projectileSpeed: 2000,
      armorPiercing: 0.3,
      chargeTime: 2.0
    },
    requirements: {
      level: 9,
      skills: ['railgun_systems'],
      shipType: ['destroyer', 'battleship']
    },
    cost: {
      credits: 3000,
      metal: 1500,
      plasma: 750,
      crystals: 100
    },
    description: 'High-velocity railgun with armor piercing'
  }
} as const;
```

---

## 🛡️ **ARMADURA - CATÁLOGO COMPLETO**

### **🔰 Armadura Básica**
```typescript
export const BASIC_ARMOR = {
  'armor_basic_plate': {
    id: 'armor_basic_plate',
    name: 'Basic Armor Plate',
    category: 'armor',
    type: 'plate',
    rarity: 'common',
    level: 1,
    properties: {
      defense: 25,
      weight: 10,
      durability: 100,
      energyResistance: 0.1,
      kineticResistance: 0.2
    },
    requirements: {
      level: 1,
      shipType: ['fighter', 'cruiser', 'frigate']
    },
    cost: {
      credits: 50,
      metal: 100
    },
    description: 'Basic armor plating for small ships'
  }
} as const;
```

### **🛠️ Armadura de Titanio**
```typescript
export const TITANIUM_ARMOR = {
  'armor_titanium_plate_mk1': {
    id: 'armor_titanium_plate_mk1',
    name: 'Titanium Armor Plate MK1',
    category: 'armor',
    type: 'plate',
    rarity: 'uncommon',
    level: 4,
    properties: {
      defense: 50,
      weight: 15,
      durability: 200,
      energyResistance: 0.2,
      kineticResistance: 0.3,
      heatResistance: 0.1
    },
    requirements: {
      level: 4,
      shipType: ['cruiser', 'frigate', 'destroyer']
    },
    cost: {
      credits: 300,
      metal: 500,
      plasma: 100
    },
    description: 'Titanium armor plating with improved resistance'
  },
  
  'armor_titanium_plate_mk2': {
    id: 'armor_titanium_plate_mk2',
    name: 'Titanium Armor Plate MK2',
    category: 'armor',
    type: 'plate',
    rarity: 'rare',
    level: 8,
    properties: {
      defense: 75,
      weight: 20,
      durability: 300,
      energyResistance: 0.3,
      kineticResistance: 0.4,
      heatResistance: 0.2,
      radiationResistance: 0.1
    },
    requirements: {
      level: 8,
      shipType: ['battleship', 'destroyer', 'carrier']
    },
    cost: {
      credits: 1200,
      metal: 2000,
      plasma: 500,
      crystals: 50
    },
    description: 'Advanced titanium armor with multiple resistances'
  }
} as const;
```

### **🌟 Armadura Compuesta**
```typescript
export const COMPOSITE_ARMOR = {
  'armor_composite_plate_mk1': {
    id: 'armor_composite_plate_mk1',
    name: 'Composite Armor Plate MK1',
    category: 'armor',
    type: 'plate',
    rarity: 'epic',
    level: 11,
    properties: {
      defense: 100,
      weight: 25,
      durability: 400,
      energyResistance: 0.4,
      kineticResistance: 0.5,
      heatResistance: 0.3,
      radiationResistance: 0.2,
      selfRepair: 1.0
    },
    requirements: {
      level: 11,
      shipType: ['battleship', 'carrier']
    },
    cost: {
      credits: 4000,
      metal: 6000,
      plasma: 2000,
      crystals: 300
    },
    description: 'Composite armor with self-repair capabilities'
  }
} as const;
```

---

## ⚙️ **MÓDULOS - CATÁLOGO COMPLETO**

### **🛡️ Generadores de Escudos**
```typescript
export const SHIELD_MODULES = {
  'module_shield_generator_mk1': {
    id: 'module_shield_generator_mk1',
    name: 'Shield Generator MK1',
    category: 'module',
    type: 'shield',
    rarity: 'uncommon',
    level: 3,
    properties: {
      shieldCapacity: 100,
      rechargeRate: 10,
      energyCost: 5,
      rechargeDelay: 3.0,
      shieldResistance: {
        energy: 0.8,
        kinetic: 0.6,
        explosive: 0.4
      }
    },
    requirements: {
      level: 3,
      shipType: ['fighter', 'cruiser', 'frigate']
    },
    cost: {
      credits: 200,
      metal: 150,
      plasma: 100,
      energy: 50
    },
    description: 'Basic shield generator for small ships'
  },
  
  'module_shield_generator_mk2': {
    id: 'module_shield_generator_mk2',
    name: 'Shield Generator MK2',
    category: 'module',
    type: 'shield',
    rarity: 'rare',
    level: 7,
    properties: {
      shieldCapacity: 200,
      rechargeRate: 20,
      energyCost: 10,
      rechargeDelay: 2.0,
      shieldResistance: {
        energy: 0.85,
        kinetic: 0.7,
        explosive: 0.5
      },
      boostable: true
    },
    requirements: {
      level: 7,
      shipType: ['cruiser', 'frigate', 'destroyer']
    },
    cost: {
      credits: 800,
      metal: 600,
      plasma: 400,
      energy: 200
    },
    description: 'Enhanced shield generator with boost capability'
  }
} as const;
```

### **🚀 Motores y Propulsores**
```typescript
export const ENGINE_MODULES = {
  'module_engine_boost_mk1': {
    id: 'module_engine_boost_mk1',
    name: 'Engine Boost MK1',
    category: 'module',
    type: 'engine',
    rarity: 'common',
    level: 2,
    properties: {
      speedBonus: 25,
      accelerationBonus: 20,
      energyCost: 15,
      heatGeneration: 5
    },
    requirements: {
      level: 2,
      shipType: ['fighter', 'cruiser']
    },
    cost: {
      credits: 150,
      metal: 100,
      plasma: 50
    },
    description: 'Basic engine boost module'
  },
  
  'module_warp_drive_mk1': {
    id: 'module_warp_drive_mk1',
    name: 'Warp Drive MK1',
    category: 'module',
    type: 'engine',
    rarity: 'epic',
    level: 10,
    properties: {
      warpSpeed: 5.0,
      warpDistance: 1000,
      energyCost: 100,
      chargeTime: 10.0,
      cooldownTime: 30.0
    },
    requirements: {
      level: 10,
      skills: ['warp_drive'],
      shipType: ['explorer', 'carrier']
    },
    cost: {
      credits: 3000,
      metal: 2000,
      plasma: 1000,
      crystals: 200,
      quantum: 50
    },
    description: 'Basic warp drive for long distance travel'
  }
} as const;
```

### **📦 Almacenamiento y Carga**
```typescript
export const CARGO_MODULES = {
  'module_cargo_expansion_mk1': {
    id: 'module_cargo_expansion_mk1',
    name: 'Cargo Expansion MK1',
    category: 'module',
    type: 'cargo',
    rarity: 'uncommon',
    level: 3,
    properties: {
      capacityBonus: 50,
      energyCost: 5,
      weight: 20
    },
    requirements: {
      level: 3,
      shipType: ['cruiser', 'frigate', 'miner']
    },
    cost: {
      credits: 250,
      metal: 200,
      plasma: 50
    },
    description: 'Additional cargo space for trading and mining'
  },
  
  'module_mining_laser_mk1': {
    id: 'module_mining_laser_mk1',
    name: 'Mining Laser MK1',
    category: 'module',
    type: 'mining',
    rarity: 'rare',
    level: 5,
    properties: {
      miningPower: 25,
      range: 200,
      energyCost: 20,
      efficiency: 0.8
    },
    requirements: {
      level: 5,
      skills: ['mining'],
      shipType: ['miner', 'explorer']
    },
    cost: {
      credits: 600,
      metal: 400,
      plasma: 200,
      crystals: 25
    },
    description: 'Mining laser for resource extraction'
  }
} as const;
```

### **🎯 Sistemas de Combate**
```typescript
export const COMBAT_MODULES = {
  'module_targeting_computer_mk1': {
    id: 'module_targeting_computer_mk1',
    name: 'Targeting Computer MK1',
    category: 'module',
    type: 'targeting',
    rarity: 'rare',
    level: 6,
    properties: {
      accuracyBonus: 20,
      lockOnRangeBonus: 100,
      lockOnTimeReduction: 0.5,
      energyCost: 10
    },
    requirements: {
      level: 6,
      shipType: ['fighter', 'frigate', 'destroyer']
    },
    cost: {
      credits: 800,
      metal: 400,
      plasma: 300,
      crystals: 50
    },
    description: 'Advanced targeting computer for improved accuracy'
  },
  
  'module_ecm_system_mk1': {
    id: 'module_ecm_system_mk1',
    name: 'ECM System MK1',
    category: 'module',
    type: 'electronic',
    rarity: 'epic',
    level: 9,
    properties: {
      jammingStrength: 30,
      stealthBonus: 25,
      energyCost: 25,
      duration: 10.0,
      cooldown: 30.0
    },
    requirements: {
      level: 9,
      skills: ['electronic_warfare'],
      shipType: ['frigate', 'destroyer']
    },
    cost: {
      credits: 2000,
      metal: 1000,
      plasma: 800,
      crystals: 150
    },
    description: 'Electronic countermeasure system for stealth and jamming'
  }
} as const;
```

---

## 💎 **RECURSOS ESPECIALES**

### **⚡ Recursos de Energía**
```typescript
export const ENERGY_RESOURCES = {
  'resource_battery_cell': {
    id: 'resource_battery_cell',
    name: 'Battery Cell',
    category: 'resource',
    type: 'energy',
    rarity: 'common',
    properties: {
      energyContent: 100,
      weight: 1,
      stackable: true,
      maxStack: 100
    },
    description: 'Portable energy cell for emergency power'
  },
  
  'resource_plasma_cell': {
    id: 'resource_plasma_cell',
    name: 'Plasma Cell',
    category: 'resource',
    type: 'energy',
    rarity: 'uncommon',
    properties: {
      energyContent: 500,
      weight: 2,
      stackable: true,
      maxStack: 50
    },
    description: 'High-density plasma energy cell'
  },
  
  'resource_quantum_core': {
    id: 'resource_quantum_core',
    name: 'Quantum Core',
    category: 'resource',
    type: 'energy',
    rarity: 'epic',
    properties: {
      energyContent: 5000,
      weight: 5,
      stackable: false,
      specialProperties: ['quantum_stabilization']
    },
    description: 'Quantum-stabilized energy core for advanced systems'
  }
} as const;
```

### **🔧 Materiales de Construcción**
```typescript
export const MATERIAL_RESOURCES = {
  'resource_metal_ore': {
    id: 'resource_metal_ore',
    name: 'Metal Ore',
    category: 'resource',
    type: 'material',
    rarity: 'common',
    properties: {
      purity: 0.8,
      weight: 10,
      stackable: true,
      maxStack: 1000
    },
    description: 'Raw metal ore for construction'
  },
  
  'resource_titanium_ore': {
    id: 'resource_titanium_ore',
    name: 'Titanium Ore',
    category: 'resource',
    type: 'material',
    rarity: 'uncommon',
    properties: {
      purity: 0.9,
      weight: 8,
      stackable: true,
      maxStack: 500
    },
    description: 'High-quality titanium ore'
  },
  
  'resource_composite_metal': {
    id: 'resource_composite_metal',
    name: 'Composite Metal',
    category: 'resource',
    type: 'material',
    rarity: 'rare',
    properties: {
      purity: 0.95,
      weight: 5,
      stackable: true,
      maxStack: 200,
      specialProperties: ['lightweight', 'high_strength']
    },
    description: 'Advanced composite metal for high-end construction'
  }
} as const;
```

---

## 🎯 **SISTEMA DE RAREZAS**

### **⭐ Niveles de Rareza - OFICIAL**
```typescript
export const RARITY_SYSTEM = {
  common: {
    name: 'Common',
    color: '#FFFFFF',
    dropRate: 0.60,
    modifier: 1.0,
    description: 'Standard items with basic properties'
  },
  
  uncommon: {
    name: 'Uncommon',
    color: '#00FF00',
    dropRate: 0.25,
    modifier: 1.2,
    description: 'Improved items with enhanced properties'
  },
  
  rare: {
    name: 'Rare',
    color: '#0080FF',
    dropRate: 0.10,
    modifier: 1.5,
    description: 'Advanced items with special properties'
  },
  
  epic: {
    name: 'Epic',
    color: '#8000FF',
    dropRate: 0.04,
    modifier: 2.0,
    description: 'Elite items with unique abilities'
  },
  
  legendary: {
    name: 'Legendary',
    color: '#FF8000',
    dropRate: 0.008,
    modifier: 3.0,
    description: 'Mythical items with extraordinary powers'
  },
  
  mythic: {
    name: 'Mythic',
    color: '#FF0000',
    dropRate: 0.002,
    modifier: 5.0,
    description: 'God-tier items with game-changing abilities'
  }
} as const;
```

---

## 🔄 **REGLAS DE CREACIÓN DE ITEMS**

### **📋 Proceso para NUEVOS Items**
```typescript
// PROCESO OBLIGATORIO para crear nuevos items
interface NewItemProcess {
  step_1: "Documentar item aquí primero",
  step_2: "Definir propiedades exactas",
  step_3: "Establecer requisitos y costos",
  step_4: "Implementar en backend",
  step_5: "Probar en entorno de desarrollo",
  step_6: "Actualizar API común",
  step_7: "Notificar a equipos de clientes"
}
```

### **🚫 REGLAS DE NO CREACIÓN**
```typescript
interface ProhibitedActions {
  ❌_CREATE_ITEMS_WITHOUT_DOCUMENTATION: "Documentar primero",
  ❌_CHANGE_EXISTING_ITEM_NAMES: "Crear nuevo item en su lugar",
  ❌_DUPLICATE_ITEM_PROPERTIES: "Reusar propiedades existentes",
  ❌_IGNORE_RARITY_SYSTEM: "Seguir sistema oficial",
  ❌_SKIP_REQUIREMENTS: "Definir siempre requisitos",
  ❌_FORGET_COSTS: "Establecer costos balanceados"
}
```

---

## 📊 **BALANCE DE ITEMS**

### **⚖️ Fórmulas de Balance**
```typescript
export const BALANCE_FORMULAS = {
  // Costo base por rareza
  baseCost: (level: number, rarity: string) => {
    const rarityMultipliers = {
      common: 1.0,
      uncommon: 2.5,
      rare: 5.0,
      epic: 12.5,
      legendary: 25.0,
      mythic: 50.0
    };
    
    return Math.floor(level * 100 * rarityMultipliers[rarity]);
  },
  
  // Propiedades vs nivel
  propertyScaling: (baseValue: number, level: number, rarity: string) => {
    const rarityMultipliers = {
      common: 1.0,
      uncommon: 1.2,
      rare: 1.5,
      epic: 2.0,
      legendary: 3.0,
      mythic: 5.0
    };
    
    return baseValue * (1 + (level - 1) * 0.1) * rarityMultipliers[rarity];
  },
  
  // Requisitos mínimos
  minRequirements: (itemLevel: number) => {
    return {
      level: Math.max(1, Math.floor(itemLevel * 0.8)),
      skills: itemLevel > 5 ? ['intermediate'] : ['basic'],
      shipType: itemLevel > 10 ? ['advanced'] : ['all']
    };
  }
} as const;
```

---

## 🎯 **VERIFICACIÓN DE CONSISTENCIA**

### **✅ Checklist de Validación de Items**
```typescript
interface ItemValidationChecklist {
  basic_info: {
    ✅_id_follows_naming_convention: "category_type_mkX",
    ✅_name_is_descriptive: "Clear and meaningful",
    ✅_category_is_correct: "weapon, armor, module, resource",
    ✅_type_is_specific: "laser, plasma, missile, etc."
  },
  
  properties: {
    ✅_all_required_properties_defined: "Complete property set",
    ✅_values_are_balanced: "Follow balance formulas",
    ✅_units_are_consistent: "Same units across items",
    ✅_ranges_are_logical: "Min/max values make sense"
  },
  
  requirements: {
    ✅_level_requirement_appropriate: "Not too low/high",
    ✅_skill_requirements_exist: "If needed",
    ✅_ship_type_restrictions: "If applicable"
  },
  
  costs: {
    ✅_cost_is_balanced: "Follows rarity/level",
    ✅_all_resources_defined: "Complete cost breakdown",
    ✅_cost_is_affordable: "Reasonable for target level"
  }
}
```

---

**🎯 ESTE CATÁLOGO ES LA ÚNICA FUENTE DE VERDAD PARA ITEMS EN DESTOCK SPACE. NUNCA CREAR ITEMS NUEVOS SIN DOCUMENTARLOS AQUÍ PRIMERO.**
