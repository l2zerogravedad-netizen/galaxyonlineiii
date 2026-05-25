# 👑 SISTEMA DE COMANDANTES - LIDERAZGO Y HABILIDADES

## 📋 **RESUMEN DE LA MECÁNICA**

El sistema de comandantes proporciona líderes especializados para las flotas, ofreciendo bonificaciones únicas, habilidades especiales y progresión de nivel que afecta directamente el rendimiento en combate y la gestión de recursos.

## ✅ **DATOS CONOCIDOS (Existentes)**

### **Comandantes Básicos**
```typescript
// Basado en commanders-complete.ts
export interface Commander {
  id: string;
  name: string;
  rank: CommanderRank;
  stats: {
    attack: number;
    defense: number;
    speed: number;
    electronics: number;
  };
  level: number;
  experience: number;
  fleetId?: string;
}
```

### **Rangos Existentes**
- **Recruit**: Comandante novato
- **Member**: Miembro activo
- **Veteran**: Veterano de batalla
- **Officer**: Oficial de alto rango
- **Leader**: Líder supremo

## ❌ **DATOS FALTANTES**

### **1. Sistema de Experiencia y Nivel**
- No hay sistema de ganancia de XP
- No hay bonificaciones por nivel
- No hay sistema de evolución

### **2. Habilidades Especiales**
- No hay habilidades únicas por comandante
- No hay sistema de cooldowns
- No hay sinergias entre habilidades

### **3. Sistema de Rarezas**
- No hay clasificación por rareza
- No hay comandantes legendarios
- No hay sistema de adquisición

### **4. Equipamiento de Comandantes**
- No hay sistema de items equipables
- No hay mejoras de estadísticas
- No hay artefactos especiales

### **5. Asignación Automática**
- No hay sistema de asignación inteligente
- No hay optimización de flotas
- No hay sistema de relevo

## 🎯 **PROPUESTA DE IMPLEMENTACIÓN**

### **🌟 Sistema de Rarezas y Tipos**

```typescript
interface CommanderRarity {
  type: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  color: string;
  statMultiplier: number; // Multiplicador de estadísticas base
  skillSlots: number; // Número de habilidades
  maxLevel: number;
  acquisitionChance: number; // Probabilidad de obtener
}

interface CommanderType {
  id: string;
  name: string;
  description: string;
  rarity: CommanderRarity;
  specialization: CommanderSpecialization;
  baseStats: CommanderStats;
  growthRates: CommanderGrowth;
  skills: CommanderSkill[];
  requirements: {
    playerLevel: number;
    technology?: string[];
    resources?: Record<ResourceKey, number>;
  };
}

type CommanderSpecialization = 
  | 'assault'       // Especialista en ataque
  | 'defender'      // Especialista en defensa
  | 'tactician'     // Especialista en tácticas
  | 'logistics'     // Especialista en logística
  | 'diplomat'      // Especialista en diplomacia
  | 'scientist'     // Especialista en investigación
  | 'engineer'      // Especialista en ingeniería
  | 'spy'           // Especialista en espionaje;

interface CommanderStats {
  attack: number;      // Bonificación de ataque 0-100
  defense: number;     // Bonificación de defensa 0-100
  speed: number;       // Bonificación de velocidad 0-100
  electronics: number; // Bonificación electrónica 0-100
  leadership: number;  // Influencia en tropas 0-100
  charisma: number;    // Bonificación diplomática 0-100
  intelligence: number; // Velocidad de aprendizaje 0-100
  luck: number;        // Probabilidades especiales 0-100
}
```

### **📈 Sistema de Progresión**

```typescript
interface CommanderProgression {
  level: number;
  experience: number;
  experienceToNext: number;
  totalExperience: number;
  statPoints: number; // Puntos para distribuir
  skillPoints: number; // Puntos para desbloquear habilidades
  
  // Bonificaciones por nivel
  levelBonuses: {
    statBonus: number; // +X a todas las stats por nivel
    skillUnlock: number; // Nueva habilidad cada N niveles
    fleetSize: number; // +X naves en flota por nivel
    commandRadius: number; // Radio de comando aumentado
  };
}

interface ExperienceSystem {
  // Calcular XP ganada
  calculateExperience(
    action: 'combat' | 'exploration' | 'diplomacy' | 'research',
    difficulty: number,
    success: boolean,
    commander: Commander
  ): number;
  
  // Otorgar experiencia
  grantExperience(commanderId: string, amount: number): LevelUpResult;
  
  // Calcular requisitos de XP
  getExperienceRequired(level: number): number;
  
  // Subir de nivel
  levelUp(commanderId: string): LevelUpResult;
}

interface LevelUpResult {
  leveledUp: boolean;
  newLevel: number;
  statPointsGained: number;
  skillPointsGained: number;
  newAbilities: string[];
}
```

### **⚔️ Sistema de Habilidades**

```typescript
interface CommanderSkill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  rarity: SkillRarity;
  maxLevel: number;
  currentLevel: number;
  
  // Costos y requisitos
  requirements: {
    level: number;
    skillPoints: number;
    prerequisites: string[];
  };
  
  // Efectos
  effects: SkillEffect[];
  
  // Uso
  cooldown: number; // Segundos
  duration?: number; // Para habilidades temporales
  range?: number; // Radio de efecto
  targetType: TargetType;
}

type SkillType = 
  | 'passive'       // Siempre activa
  | 'active'        // Requiere activación
  | 'toggle'        // Puede encenderse/apagarse
  | 'aura'          // Afecta a unidades cercanas
  | 'channel';      // Requiere canalización

type SkillRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

type TargetType = 
  | 'self'          // Solo el comandante
  | 'fleet'         // Toda la flota
  | 'enemy'         // Enemigos seleccionados
  | 'all_enemies'   // Todos los enemigos
  | 'allies'        // Aliados cercanos
  | 'area';         // Área específica

interface SkillEffect {
  type: EffectType;
  value: number;
  duration?: number;
  stacking: boolean;
  conditions?: string[];
}

type EffectType = 
  | 'damage_bonus'     // +X% daño
  | 'defense_bonus'    // +X% defensa
  | 'speed_bonus'      // +X% velocidad
  | 'accuracy_bonus'   // +X% precisión
  | 'critical_bonus'   // +X% probabilidad crítica
  | 'healing'          // Regeneración
  | 'shield_restore'   // Restauración de escudos
  | 'debuff'           // Efecto negativo en enemigos
  | 'buff'             // Efecto positivo en aliados
  | 'summon'           // Invocar unidades
  | 'teleport';        // Movimiento instantáneo

// Habilidades específicas
const COMMANDER_SKILLS: Record<string, CommanderSkill> = {
  assault_rage: {
    id: 'assault_rage',
    name: 'Furia Asesina',
    description: 'Aumenta el daño de toda la flota durante 30 segundos',
    type: 'active',
    rarity: 'rare',
    maxLevel: 5,
    currentLevel: 1,
    requirements: {
      level: 5,
      skillPoints: 2,
      prerequisites: ['basic_combat']
    },
    effects: [
      {
        type: 'damage_bonus',
        value: 25, // +25% daño
        duration: 30,
        stacking: false
      }
    ],
    cooldown: 120, // 2 minutos
    targetType: 'fleet'
  },
  defensive_formation: {
    id: 'defensive_formation',
    name: 'Formación Defensiva',
    description: 'Aumenta la defensa de la flota pero reduce la velocidad',
    type: 'toggle',
    rarity: 'uncommon',
    maxLevel: 3,
    currentLevel: 1,
    requirements: {
      level: 3,
      skillPoints: 1,
      prerequisites: []
    },
    effects: [
      {
        type: 'defense_bonus',
        value: 30, // +30% defensa
        stacking: false
      }
    ],
    cooldown: 0, // Sin cooldown, es toggle
    targetType: 'fleet'
  }
};
```

### **🎯 Sistema de Adquisición**

```typescript
interface CommanderAcquisition {
  // Reclutar comandante
  recruitCommander(
    method: 'recruitment_center' | 'event' | 'purchase' | 'capture',
    options?: RecruitmentOptions
  ): Commander;
  
  // Calcular coste de reclutamiento
  calculateRecruitmentCost(
    rarity: CommanderRarity,
    method: RecruitmentMethod
  ): RecruitmentCost;
  
  // Probabilidad de obtener rareza
  getRarityChance(
    method: RecruitmentMethod,
    playerLevel: number,
    bonuses: RecruitmentBonus[]
  ): Record<CommanderRarity, number>;
}

interface RecruitmentOptions {
  preferredSpecialization?: CommanderSpecialization;
  minRarity?: CommanderRarity;
  useGuaranteed?: boolean;
  customStats?: Partial<CommanderStats>;
}

interface RecruitmentCost {
  credits: number;
  resources: Record<ResourceKey, number>;
  time: number; // Horas
  requiredBuildings: string[];
}

// Métodos de adquisición
type RecruitmentMethod = 
  | 'basic_recruitment'    // Reclutamiento básico
  | 'advanced_recruitment' // Reclutamiento avanzado
  | 'event_recruitment'    // Eventos especiales
  | 'prisoner_capture'     // Capturar prisioneros
  | 'diplomatic_gift'      // Regalo diplomático
  | 'black_market';        // Mercado negro
```

### **🛡️ Sistema de Equipamiento**

```typescript
interface CommanderEquipment {
  id: string;
  name: string;
  type: EquipmentType;
  rarity: EquipmentRarity;
  slot: EquipmentSlot;
  
  // Estadísticas
  stats: Partial<CommanderStats>;
  
  // Habilidades adicionales
  grantedSkills?: string[];
  
  // Requisitos
  requirements: {
    level: number;
    specialization?: CommanderSpecialization;
    rarity?: CommanderRarity;
  };
  
  // Propiedades
  stackable: boolean;
  consumable: boolean;
  charges?: number;
}

type EquipmentType = 
  | 'weapon'        // Arma personal
  | 'armor'         // Armadura
  | 'accessory'     // Accesorio
  | 'implant'       // Implante cibernético
  | 'artifact';     // Artefacto antiguo

type EquipmentSlot = 
  | 'primary_weapon'
  | 'secondary_weapon'
  | 'armor'
  | 'helmet'
  | 'accessory_1'
  | 'accessory_2'
  | 'implant_1'
  | 'implant_2';

interface EquipmentSystem {
  // Equipar item
  equipItem(commanderId: string, itemId: string, slot: EquipmentSlot): boolean;
  
  // Desequipar item
  unequipItem(commanderId: string, slot: EquipmentSlot): boolean;
  
  // Calcular estadísticas totales
  calculateTotalStats(commander: Commander): CommanderStats;
  
  // Mejorar equipo
  upgradeEquipment(itemId: string, materials: Record<string, number>): boolean;
}
```

## 📊 **MODELOS DE DATOS SUGERIDOS**

### **👑 Gestor de Comandantes**

```typescript
interface CommanderManager {
  commanders: Commander[];
  maxCommanders: number;
  recruitmentCenter: {
    level: number;
    availableSlots: number;
    recruitmentQueue: RecruitmentQueue[];
  };
  
  // Crear comandante
  createCommander(
    name: string,
    specialization: CommanderSpecialization,
    rarity: CommanderRarity
  ): Commander;
  
  // Asignar a flota
  assignToFleet(commanderId: string, fleetId: string): boolean;
  
  // Liberar comandante
  releaseCommander(commanderId: string): boolean;
  
  // Optimizar asignación
  optimizeFleetAssignment(fleets: Fleet[]): AssignmentOptimization;
  
  // Entrenar comandante
  trainCommander(commanderId: string, trainingType: TrainingType): TrainingResult;
}

interface AssignmentOptimization {
  recommendations: {
    commanderId: string;
    fleetId: string;
    effectiveness: number;
    reason: string;
  }[];
  overallImprovement: number;
}
```

### **📈 Sistema de Analítica**

```typescript
interface CommanderAnalytics {
  // Estadísticas de comandante
  getCommanderStats(commanderId: string): CommanderAnalyticsData;
  
  // Análisis de rendimiento
  analyzePerformance(commanderId: string): PerformanceAnalysis;
  
  // Comparación de comandantes
  compareCommanders(commanderIds: string[]): ComparisonResult;
  
  // Recomendaciones de mejora
  getImprovementRecommendations(commanderId: string): ImprovementRecommendation[];
}

interface CommanderAnalyticsData {
  battles: number;
  wins: number;
  losses: number;
  experienceGained: number;
  skillsUsed: Record<string, number>;
  effectiveness: {
    assault: number;
    defense: number;
    support: number;
  };
  favoriteFleet: string;
  bestSkill: string;
}
```

## ⚠️ **PENDIENTES PARA PROGRAMACIÓN**

### **🔥 Alta Prioridad**
1. **Implementar sistema de experiencia y nivel**
2. **Crear habilidades especiales por especialización**
3. **Desarrollar sistema de rarezas**
4. **Agregar asignación automática a flotas**

### **⚡ Media Prioridad**
1. **Sistema de equipamiento**
2. **Reclutamiento avanzado**
3. **Optimización de asignación**
4. **Análisis de rendimiento**

### **🔮 Baja Prioridad**
1. **Comandantes legendarios con historias**
2. **Sistema de relaciones entre comandantes**
3. **Eventos especiales de reclutamiento**
4. **Sistema de herencia de comandantes**

## 🎮 **EJEMPLOS DE USO**

### **Progresión de Comandante**
```typescript
// Otorgar experiencia por combate
const xpGained = ExperienceSystem.calculateExperience(
  'combat',
  5, // Dificultad
  true, // Victoria
  commander
);

const result = ExperienceSystem.grantExperience(commander.id, xpGained);
if (result.leveledUp) {
  console.log(`¡${commander.name} subió al nivel ${result.newLevel}!`);
  console.log(`Ganó ${result.statPointsGained} puntos de estadística`);
}
```

### **Uso de Habilidades**
```typescript
// Activar habilidad de furia asesina
const skill = commander.skills.find(s => s.id === 'assault_rage');
if (skill && skill.canUse()) {
  const result = skill.activate(fleet);
  console.log(`${commander.name} activó ${skill.name}!`);
  console.log(`Daño aumentado en ${result.damageBonus}%`);
}
```

### **Asignación Inteligente**
```typescript
// Optimizar asignación de comandantes
const optimization = CommanderManager.optimizeFleetAssignment(fleets);

optimization.recommendations.forEach(rec => {
  console.log(`Asignar ${rec.commanderId} a ${rec.fleetId}`);
  console.log(`Efectividad: ${rec.effectiveness}%`);
  console.log(`Razón: ${rec.reason}`);
});
```

## 📈 **MÉTRICAS DE ÉXITO**

### **Indicadores Clave**
- **Niveles**: 1-100 por comandante
- **Experiencia**: 100-10,000 XP por nivel (progresivo)
- **Habilidades**: 3-8 habilidades por comandante según rareza
- **Puntos de estadística**: 2-5 por nivel

### **Balance de Juego**
- **Early game**: Comandantes comunes, habilidades básicas
- **Mid game**: Comandantes raros, habilidades combinadas
- **Late game**: Comandantes épicos/legendarios, habilidades poderosas

### **Variedad Estratégica**
- **Especializaciones**: 8 tipos diferentes
- **Habilidades**: 20+ habilidades únicas
- **Combinaciones**: 100+ builds diferentes
- **Sinergias**: Efectos combinados entre comandantes

---

**📍 Próximo paso**: Implementar sistema de árbol tecnológico y investigación.
