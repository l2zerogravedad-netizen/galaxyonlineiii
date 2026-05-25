# ⚔️ SISTEMA DE FLOTAS Y FORMACIÓN DE COMBATE

## 📋 **RESUMEN DE LA MECÁNICA**

El sistema de flotas permite a los jugadores organizar sus naves en formaciones estratégicas, asignar comandantes, y ejecutar combates tácticos basados en una grilla de 9x9 posiciones con reglas de iniciativa y combate por turnos.

## ✅ **DATOS CONOCIDOS (Existentes)**

### **Flotas Básicas**
```typescript
// Basado en fleet-system.ts (existente pero incompleto)
export interface Fleet {
  id: string;
  name: string;
  commanderId: string;
  ships: ShipInstance[];
  position: { x: number; y: number };
  status: 'idle' | 'moving' | 'in_combat' | 'returning';
}
```

### **Comandantes**
```typescript
// Basado en commanders-complete.ts
export interface Commander {
  id: string;
  name: string;
  stats: {
    attack: number;
    defense: number;
    speed: number;
    electronics: number;
  };
  level: number;
  experience: number;
}
```

## ❌ **DATOS FALTANTES**

### **1. Sistema de Formación en Grilla 9x9**
- No hay sistema de posiciones tácticas
- No hay formación de combate
- No hay asignación estratégica de naves

### **2. Combate por Turnos**
- No hay sistema de iniciativa
- No hay límite de rondas (20 + bonus)
- No hay orden de ataque por velocidad

### **3. Sistema de Stacks**
- No hay apilamiento de naves
- No hay límites por stack
- No hay bonificaciones por formación

### **4. Movimiento Estratégico**
- No hay sistema de movimiento de flotas
- No hay consumo de combustible
- No hay rutas de patrulla

### **5. Gestión de Flotas**
- No hay sistema de múltiples flotas
- No hay límites de flotas por jugador
- No hay cuartel general

## 🎯 **PROPUESTA DE IMPLEMENTACIÓN**

### **🎲 Grilla de Combate 9x9**

```typescript
interface CombatGrid {
  id: string;
  size: { width: number; height: number }; // 9x9
  positions: CombatPosition[][];
  terrain?: TerrainEffect[][];
}

interface CombatPosition {
  x: number;
  y: number;
  occupied: boolean;
  fleetId?: string;
  shipId?: string;
  cover: number; // 0-100% bonus defensivo
  terrain?: TerrainType;
}

interface FleetFormation {
  fleetId: string;
  grid: CombatGrid;
  ships: {
    shipId: string;
    position: { x: number; y: number };
    stack: number; // Número de naves en esta posición
    facing: 'north' | 'south' | 'east' | 'west';
  }[];
  commander: {
    id: string;
    position: { x: number; y: number };
    initiative: number;
  };
}

// Tipos de terreno
type TerrainType = 'open' | 'cover' | 'high_ground' | 'obstacle' | 'debris';

interface TerrainEffect {
  type: TerrainType;
  defenseBonus: number;
  movementCost: number;
  visibilityModifier: number;
}
```

### **⚔️ Sistema de Combate por Turnos**

```typescript
interface CombatTurn {
  round: number;
  maxRounds: number; // 20 + (fleetCount + buildingCount)
  currentTurn: number;
  initiativeOrder: CombatInitiative[];
  actions: CombatAction[];
  status: 'active' | 'paused' | 'completed';
}

interface CombatInitiative {
  fleetId: string;
  commanderId: string;
  initiative: number;
  hasActed: boolean;
}

interface CombatAction {
  id: string;
  turn: number;
  actor: {
    fleetId: string;
    shipId: string;
    position: { x: number; y: number };
  };
  target: {
    fleetId: string;
    shipId?: string;
    position: { x: number; y: number };
  };
  action: 'attack' | 'defend' | 'move' | 'special';
  damage?: number;
  effects?: CombatEffect[];
}

interface CombatSystem {
  // Iniciar combate
  startCombat(
    attackerFleet: Fleet,
    defenderFleet: Fleet,
    defenderBuildings?: Building[]
  ): CombatSession;
  
  // Calcular iniciativa
  calculateInitiative(fleets: Fleet[]): CombatInitiative[];
  
  // Ejecutar turno
  executeTurn(sessionId: string, action: CombatAction): CombatResult;
  
  // Simular combate completo
  simulateCombat(sessionId: string): CombatSimulation;
}
```

### **📚 Sistema de Stacks**

```typescript
interface ShipStack {
  id: string;
  position: { x: number; y: number };
  ships: ShipInstance[];
  maxStack: number; // Límite de naves por stack
  facing: Direction;
  cohesion: number; // 0-100% bonificación por formación
  
  // Estadísticas combinadas
  combinedStats: {
    totalHealth: number;
    totalDamage: number;
    totalArmor: number;
    totalShield: number;
    accuracy: number;
    evasion: number;
  };
}

interface StackSystem {
  // Crear stack
  createStack(ships: ShipInstance[], position: Position): ShipStack;
  
  // Añadir nave al stack
  addToStack(stackId: string, ship: ShipInstance): boolean;
  
  // Calcular bonificaciones
  calculateStackBonuses(stack: ShipStack): StackBonus;
  
  // Validar formación
  validateFormation(formation: FleetFormation): ValidationResult;
}

interface StackBonus {
  damageBonus: number;
  defenseBonus: number;
  accuracyBonus: number;
  moraleBonus: number;
}
```

### **🚀 Movimiento Estratégico**

```typescript
interface FleetMovement {
  fleetId: string;
  route: MovementRoute;
  currentSpeed: number;
  fuel: number;
  fuelConsumption: number;
  eta: number;
  status: 'stationed' | 'moving' | 'patrolling' | 'returning';
}

interface MovementRoute {
  waypoints: {
    position: { x: number; y: number; z: number };
    arrivalTime: number;
    fuelCost: number;
  }[];
  totalDistance: number;
  totalFuelCost: number;
  estimatedTime: number;
}

interface MovementSystem {
  // Planificar ruta
  planRoute(
    fleetId: string,
    destination: Position,
    options?: RouteOptions
  ): MovementRoute;
  
  // Iniciar movimiento
  startMovement(fleetId: string, route: MovementRoute): boolean;
  
  // Actualizar posición
  updatePosition(fleetId: string): PositionUpdate;
  
  // Patrulla
  setPatrolRoute(fleetId: string, waypoints: Position[]): boolean;
}

interface RouteOptions {
  avoidEnemies: boolean;
  prioritizeSpeed: boolean;
  fuelEfficient: boolean;
  useJumpGates: boolean;
}
```

### **🏰 Gestión de Flotas**

```typescript
interface FleetManager {
  fleets: Fleet[];
  maxFleets: number;
  headquarters: {
    planetId: string;
    fleetCapacity: number;
    repairBays: number;
  };
  
  // Crear flota
  createFleet(name: string, commanderId: string): Fleet;
  
  // Asignar naves
  assignShips(fleetId: string, shipIds: string[]): boolean;
  
  // Transferir naves
  transferShips(fromFleet: string, toFleet: string, shipIds: string[]): boolean;
  
  // Disolver flota
  disbandFleet(fleetId: string): boolean;
  
  // Reorganizar flotas
  reorganizeFleets(): ReorganizationPlan;
}

interface FleetCapacity {
  current: number;
  maximum: number;
  usedByFleets: { fleetId: string; ships: number }[];
  available: number;
}
```

## 📊 **MODELOS DE DATOS SUGERIDOS**

### **🎯 Gestor de Formaciones**

```typescript
interface FormationManager {
  // Crear formación
  createFormation(fleetId: string, formationType: FormationType): FleetFormation;
  
  // Aplicar plantilla
  applyTemplate(fleetId: string, templateId: string): boolean;
  
  // Validar formación
  validateFormation(formation: FleetFormation): ValidationResult;
  
  // Optimizar formación
  optimizeFormation(fleetId: string, enemyFleet?: Fleet): OptimizationResult;
  
  // Guardar plantilla
  saveTemplate(formation: FleetFormation, name: string): string;
}

type FormationType = 
  | 'line'           // Línea recta
  | 'wedge'          // Cuña
  | 'diamond'        // Diamante
  | 'circle'         // Círculo defensivo
  | 'phalanx'        // Falange
  | 'skirmish'       // Escaramuza
  | 'custom';        // Personalizada

interface FormationTemplate {
  id: string;
  name: string;
  type: FormationType;
  description: string;
  positions: {
    shipType: string;
    relativePosition: { x: number; y: number };
    facing: Direction;
  }[];
  effectiveness: {
    vsAssault: number;
    vsDefense: number;
    vsSupport: number;
  };
}
```

### **📊 Sistema de Analítica de Combate**

```typescript
interface CombatAnalytics {
  // Estadísticas de flota
  getFleetStats(fleetId: string): FleetStats;
  
  // Análisis de combate
  analyzeCombat(sessionId: string): CombatAnalysis;
  
  // Predicción de resultado
  predictOutcome(attacker: Fleet, defender: Fleet): PredictionResult;
  
  // Recomendaciones tácticas
  getTacticalRecommendations(fleet: Fleet, enemy: Fleet): TacticalRecommendation[];
}

interface CombatAnalysis {
  duration: number;
  rounds: number;
  damageDealt: Record<string, number>;
  damageReceived: Record<string, number>;
  shipsLost: Record<string, number>;
  efficiency: number;
  keyMoments: CombatMoment[];
}

interface PredictionResult {
  winProbability: number;
  expectedLosses: {
    attacker: { ships: number; value: number };
    defender: { ships: number; value: number };
  };
  estimatedDuration: number;
  confidence: number;
}
```

## ⚠️ **PENDIENTES PARA PROGRAMACIÓN**

### **🔥 Alta Prioridad**
1. **Implementar grilla de combate 9x9**
2. **Crear sistema de combate por turnos**
3. **Desarrollar sistema de stacks**
4. **Agregar iniciativa por velocidad de comandante**

### **⚡ Media Prioridad**
1. **Movimiento estratégico de flotas**
2. **Gestión de múltiples flotas**
3. **Sistema de formaciones predefinidas**
4. **Análisis de combate**

### **🔮 Baja Prioridad**
1. **Formaciones personalizadas avanzadas**
2. **IA de movimiento táctico**
3. **Reproducción de combates**
4. **Estadísticas históricas detalladas**

## 🎮 **EJEMPLOS DE USO**

### **Creación de Formación**
```typescript
// Crear flota
const fleet = FleetManager.createFleet('Alpha Fleet', 'commander_001');

// Asignar naves
FleetManager.assignShips(fleet.id, ['ship_1', 'ship_2', 'ship_3']);

// Crear formación en cuña
const formation = FormationManager.createFormation(fleet.id, 'wedge');

// Validar formación
const validation = FormationManager.validateFormation(formation);
if (validation.isValid) {
  fleet.formation = formation;
}
```

### **Combate por Turnos**
```typescript
// Iniciar combate
const session = CombatSystem.startCombat(attackerFleet, defenderFleet);

// Calcular iniciativa
const initiative = CombatSystem.calculateInitiative([attackerFleet, defenderFleet]);

// Ejecutar primer turno
const action: CombatAction = {
  actor: { fleetId: attackerFleet.id, shipId: 'ship_1', position: { x: 2, y: 2 } },
  target: { fleetId: defenderFleet.id, position: { x: 7, y: 7 } },
  action: 'attack'
};

const result = CombatSystem.executeTurn(session.id, action);
```

### **Movimiento Estratégico**
```typescript
// Planificar ruta
const route = MovementSystem.planRoute(fleet.id, targetPosition, {
  avoidEnemies: true,
  prioritizeSpeed: false,
  fuelEfficient: true
});

// Iniciar movimiento
MovementSystem.startMovement(fleet.id, route);
```

## 📈 **MÉTRICAS DE ÉXITO**

### **Indicadores Clave**
- **Tamaño de grilla**: 9x9 posiciones (81 slots)
- **Límite de rondas**: 20 + (flotas + edificios), máximo 99
- **Iniciativa**: Basada en velocidad de comandante + modificadores
- **Stacks**: 1-5 naves por posición según tipo

### **Balance de Juego**
- **Early game**: Formaciones simples, 1-3 flotas
- **Mid game**: Formaciones complejas, 3-5 flotas
- **Late game**: Formaciones especializadas, 5-10 flotas

### **Profundidad Estratégica**
- **Formaciones**: 7 tipos predefinidos + personalizadas
- **Tácticas**: Posicionamiento, cobertura, flancos
- **Decisiones**: Iniciativa, selección de objetivos, retirada

---

**📍 Próximo paso**: Implementar sistema de combate detallado con armas y blindajes.
