# 🤝 SISTEMA DE ALIANZAS Y DIPLOMACIA AVANZADA

## 📋 **RESUMEN DE LA MECÁNICA**

El sistema de alianzas permite a los jugadores formar coaliciones estratégicas, gestionar recursos compartidos, coordinar acciones militares y establecer relaciones diplomáticas complejas con otras facciones del universo.

## ✅ **DATOS CONOCIDOS (Existentes)**

### **Alianzas Básicas**
```typescript
// Basado en corp-alliance.ts
export interface Corp {
  id: string;
  name: string;
  tag: string;
  members: CorpMember[];
  leaderId: string;
  level: number;
  experience: number;
}
```

### **Roles Existentes**
- **Leader**: Líder supremo
- **Officer**: Oficial de alto rango
- **Member**: Miembro regular
- **Recruit**: Nuevo miembro

## ❌ **DATOS FALTANTES**

### **1. Sistema Diplomático Completo**
- No hay relaciones entre alianzas
- No hay tratados y acuerdos
- No hay sistema de reputación

### **2. Recursos Compartidos**
- No hay tesorería de alianza
- No hay bases compartidas
- No hay tecnología compartida

### **3. Coordinación Militar**
- No hay flotas conjuntas
- No hay planes de ataque coordinados
- No hay sistema de defensa mutua

### **4. Estructura Jerárquica**
- No hay departamentos especializados
- No hay sistema de permisos detallado
- No hay cadena de mando

### **5. Eventos de Alianza**
- No hay guerras entre alianzas
- No hay eventos diplomáticos
- No hay competiciones de alianzas

## 🎯 **PROPUESTA DE IMPLEMENTACIÓN**

### **🏛️ Estructura de Alianza**

```typescript
interface Alliance {
  id: string;
  name: string;
  tag: string;
  description: string;
  emblem: string;
  
  // Información básica
  founded: number;
  level: number;
  experience: number;
  power: number; // Poder militar total
  
  // Miembros
  members: AllianceMember[];
  maxMembers: number;
  
  // Liderazgo
  leader: AllianceMember;
  officers: AllianceMember[];
  departments: AllianceDepartment[];
  
  // Recursos
  treasury: AllianceTreasury;
  sharedBases: SharedBase[];
  sharedTechnology: string[];
  
  // Relaciones
  diplomacy: AllianceDiplomacy;
  wars: AllianceWar[];
  treaties: Treaty[];
  
  // Configuración
  settings: AllianceSettings;
  permissions: AlliancePermissions;
}

interface AllianceMember {
  playerId: string;
  playerName: string;
  rank: AllianceRank;
  department?: string;
  joinedAt: number;
  lastActive: number;
  
  // Contribuciones
  contribution: {
    military: number;
    economic: number;
    research: number;
    diplomatic: number;
  };
  
  // Permisos
  permissions: Permission[];
  
  // Flotas asignadas
  assignedFleets: string[];
  
  // Estado
  status: 'active' | 'away' | 'suspended' | 'kicked';
}

type AllianceRank = 
  | 'leader'         // Líder absoluto
  | 'co_leader'      // Segundo al mando
  | 'general'        // Comandante militar
  | 'admiral'        // Comandante naval
  | 'minister'       // Ministro de departamento
  | 'officer'        // Oficial superior
  | 'veteran'        // Miembro veterano
  | 'member'         // Miembro regular
  | 'recruit';       // Nuevo miembro
```

### **🏦 Sistema de Recursos Compartidos**

```typescript
interface AllianceTreasury {
  // Recursos principales
  resources: Record<ResourceKey, number>;
  
  // Fondos especiales
  warFund: number;
  researchFund: number;
  developmentFund: number;
  
  // Impuestos y contribuciones
  taxRate: number; // % de contribución automática
  contributionRequirements: {
    weekly: Record<ResourceKey, number>;
    military: number; // Poder militar requerido
  };
  
  // Transacciones
  transactionHistory: TreasuryTransaction[];
  
  // Presupuestos
  budgets: Budget[];
}

interface TreasuryTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'tax' | 'penalty' | 'reward';
  amount: Record<ResourceKey, number>;
  playerId?: string;
  reason: string;
  timestamp: number;
  approvedBy?: string;
}

interface SharedBase {
  id: string;
  planetId: string;
  name: string;
  type: 'military' | 'economic' | 'research' | 'diplomatic';
  
  // Contribuciones
  contributors: {
    playerId: string;
    contribution: Record<ResourceKey, number>;
    access: BaseAccess;
  }[];
  
  // Beneficios
  benefits: BaseBenefit[];
  
  // Defensa
  defenses: SharedDefense[];
  
  // Gestión
  manager: string;
  accessLevel: 'public' | 'restricted' | 'private';
}

interface BaseBenefit {
  type: 'production' | 'research' | 'military' | 'storage';
  value: number;
  description: string;
  appliesTo: 'all_members' | 'contributors' | 'specific';
}
```

### **⚔️ Coordinación Militar**

```typescript
interface MilitaryCoordination {
  // Flotas conjuntas
  jointFleets: JointFleet[];
  
  // Planes de ataque
  attackPlans: AttackPlan[];
  
  // Defensa mutua
  defensePacts: DefensePact[];
  
  // Inteligencia compartida
  sharedIntelligence: SharedIntelligence[];
  
  // Logística
  supplyRoutes: SupplyRoute[];
  stagingAreas: StagingArea[];
}

interface JointFleet {
  id: string;
  name: string;
  commander: string;
  
  // Contribuciones de miembros
  contributions: {
    playerId: string;
    ships: ShipInstance[];
    resources: Record<ResourceKey, number>;
  }[];
  
  // Operaciones
  currentOperation?: Operation;
  operationHistory: Operation[];
  
  // Comando
  commandStructure: CommandStructure;
  
  // Reglas
  rulesOfEngagement: RulesOfEngagement;
  lootDistribution: LootDistribution;
}

interface AttackPlan {
  id: string;
  name: string;
  target: {
    type: 'alliance' | 'planet' | 'fleet' | 'base';
    id: string;
    name: string;
  };
  
  // Estrategia
  strategy: AttackStrategy;
  phases: AttackPhase[];
  
  // Participantes
  participants: string[]; // Player IDs
  roles: ParticipantRole[];
  
  // Logística
  requiredResources: Record<ResourceKey, number>;
  timeline: OperationTimeline;
  
  // Estado
  status: 'planning' | 'approved' | 'active' | 'completed' | 'failed';
  approvalRequired: number;
  approvals: string[];
}

interface AttackStrategy {
  type: 'assault' | 'siege' | 'raid' | 'guerrilla' | 'blitzkrieg';
  description: string;
  primaryObjective: Objective;
  secondaryObjectives: Objective[];
  contingencies: ContingencyPlan[];
}
```

### **🤝 Sistema Diplomático**

```typescript
interface AllianceDiplomacy {
  // Relaciones con otras alianzas
  relationships: Record<string, AllianceRelationship>;
  
  // Tratados activos
  treaties: Treaty[];
  
  // Propuestas diplomáticas
  proposals: DiplomaticProposal[];
  
  // Reputación
  reputation: AllianceReputation;
  
  // Embajadas
  embassies: Embassy[];
  
  // Canales de comunicación
  communicationChannels: CommunicationChannel[];
}

interface AllianceRelationship {
  allianceId: string;
  allianceName: string;
  status: RelationshipStatus;
  level: number; // -100 (enemigo) a +100 (aliado)
  
  // Historial
  history: RelationshipHistory[];
  
  // Comercio
  tradeAgreements: TradeAgreement[];
  
  // Conflictos
  ongoingConflicts: Conflict[];
  
  // Intereses comunes
  sharedInterests: string[];
  conflictingInterests: string[];
}

type RelationshipStatus = 
  | 'war'           // En guerra
  | 'hostile'       // Hostil
  | 'unfriendly'    // No amistoso
  | 'neutral'       // Neutral
  | 'friendly'      // Amistoso
  | 'allied'        // Aliado formal
  | 'pact';         // Pacto defensivo

interface Treaty {
  id: string;
  name: string;
  type: TreatyType;
  parties: TreatyParty[];
  
  // Términos
  terms: TreatyTerm[];
  
  // Duración
  duration: number;
  startDate: number;
  endDate?: number;
  
  // Consecuencias
  benefits: TreatyBenefit[];
  obligations: TreatyObligation[];
  
  // Estado
  status: 'proposed' | 'active' | 'expired' | 'broken' | 'renegotiated';
}

type TreatyType = 
  | 'non_aggression'  // No agresión
  | 'mutual_defense'  // Defensa mutua
  | 'trade'          // Comercial
  | 'research'       // Investigación
  | 'military'       // Cooperación militar
  | 'cultural'       // Intercambio cultural
  | 'vassalage';     // Vasallaje
```

### **🏢 Departamentos y Permisos**

```typescript
interface AllianceDepartment {
  id: string;
  name: string;
  description: string;
  head: string;
  members: string[];
  
  // Responsabilidades
  responsibilities: DepartmentResponsibility[];
  
  // Presupuesto
  budget: number;
  
  // Autoridad
  authority: DepartmentAuthority;
  
  // Configuración
  settings: DepartmentSettings;
}

type DepartmentType = 
  | 'military'       // Departamento militar
  | 'economic'       // Departamento económico
  | 'research'       // Departamento de investigación
  | 'diplomatic'     // Departamento diplomático
  | 'intelligence'   // Departamento de inteligencia
  | 'recruitment'    // Departamento de reclutamiento
  | 'internal'       // Departamento interno
  | 'propaganda';    // Departamento de propaganda

interface AlliancePermissions {
  // Permisos por rango
  rankPermissions: Record<AllianceRank, Permission[]>;
  
  // Permisos especiales
  specialPermissions: {
    playerId: string;
    permissions: Permission[];
    grantedBy: string;
    expiresAt?: number;
  }[];
  
  // Restricciones
  restrictions: PermissionRestriction[];
}

type Permission = 
  | 'invite_members'
  | 'kick_members'
  | 'promote_members'
  | 'manage_treasury'
  | 'declare_war'
  | 'sign_treaties'
  | 'manage_bases'
  | 'command_fleets'
  | 'access_intelligence'
  | 'manage_departments'
  | 'edit_settings'
  | 'dissolve_alliance';
```

## 📊 **MODELOS DE DATOS SUGERIDOS**

### **🤝 Gestor de Alianzas**

```typescript
interface AllianceManager {
  // Crear alianza
  createAlliance(
    name: string,
    tag: string,
    founderId: string,
    settings: AllianceSettings
  ): Alliance;
  
  // Gestionar miembros
  addMember(allianceId: string, playerId: string, rank: AllianceRank): boolean;
  removeMember(allianceId: string, playerId: string, reason: string): boolean;
  promoteMember(allianceId: string, playerId: string, newRank: AllianceRank): boolean;
  
  // Gestionar diplomacia
  proposeTreaty(allianceId: string, targetAlliance: string, treaty: Treaty): string;
  respondToTreaty(treatyId: string, response: 'accept' | 'reject' | 'negotiate'): boolean;
  
  // Coordinar militarmente
  createJointFleet(allianceId: string, name: string, commander: string): JointFleet;
  planAttack(allianceId: string, target: Target, strategy: AttackStrategy): AttackPlan;
}

interface AllianceAnalytics {
  // Estadísticas de alianza
  getAllianceStats(allianceId: string): AllianceStats;
  
  // Análisis de poder
  analyzePower(allianceId: string): PowerAnalysis;
  
  // Evaluación de relaciones
  evaluateRelationships(allianceId: string): RelationshipAnalysis;
  
  // Recomendaciones estratégicas
  getStrategicRecommendations(allianceId: string): StrategicRecommendation[];
}
```

### **📈 Sistema de Economía de Alianza**

```typescript
interface AllianceEconomy {
  // Tesorería
  manageTreasury(allianceId: string): TreasuryManager;
  
  // Comercio entre alianzas
  setupTradeRoute(
    alliance1: string,
    alliance2: string,
    resources: TradeResource[]
  ): TradeRoute;
  
  // Impuestos y contribuciones
  calculateTaxes(allianceId: string): TaxCalculation;
  
  // Presupuestos
  createBudget(
    allianceId: string,
    department: string,
    amount: number,
    purpose: string
  ): Budget;
}

interface TaxCalculation {
  totalTaxable: Record<ResourceKey, number>;
  taxRate: number;
  expectedRevenue: Record<ResourceKey, number>;
  collectionEfficiency: number;
}
```

## ⚠️ **PENDIENTES PARA PROGRAMACIÓN**

### **🔥 Alta Prioridad**
1. **Implementar estructura jerárquica completa**
2. **Crear sistema de recursos compartidos**
3. **Desarrollar coordinación militar básica**
4. **Agregar sistema diplomático**

### **⚡ Media Prioridad**
1. **Departamentos especializados**
2. **Tratados complejos**
3. **Guerras entre alianzas**
4. **Inteligencia compartida**

### **🔮 Baja Prioridad**
1. **Eventos diplomáticos masivos**
2. **Sistema de propaganda**
3. **Espionaje entre alianzas**
4. **Historia dinámica de relaciones`

## 🎮 **EJEMPLOS DE USO**

### **Creación de Alianza**
```typescript
// Crear nueva alianza
const alliance = AllianceManager.createAliance(
  'Stellar Federation',
  'SFED',
  'player_001',
  {
    isOpen: true,
    taxRate: 5,
    maxMembers: 50,
    requiredRank: 'member'
  }
);

// Establecer departamentos
alliance.departments = [
  {
    id: 'military',
    name: 'Departamento Militar',
    head: 'player_001',
    budget: 10000,
    responsibilities: ['defense', 'offense', 'training']
  }
];
```

### **Coordinación Militar**
```typescript
// Crear flota conjunta
const jointFleet = AllianceManager.createJointFleet(
  alliance.id,
  'Fuerza de Tarefa Alpha',
  'player_002'
);

// Planificar ataque
const attackPlan = AllianceManager.planAttack(
  alliance.id,
  { type: 'alliance', id: 'enemy_alliance' },
  {
    type: 'assault',
    primaryObjective: { type: 'destroy', target: 'enemy_base' },
    phases: [
      { name: 'Preparación', duration: 3600 },
      { name: 'Ataque', duration: 7200 },
      { name: 'Retirada', duration: 1800 }
    ]
  }
);
```

### **Diplomacia**
```typescript
// Proponer tratado de no agresión
const treaty = AllianceManager.proposeTreaty(
  alliance.id,
  'neutral_alliance',
  {
    name: 'Pacto de No Agresión',
    type: 'non_aggression',
    duration: 30 * 24 * 60 * 60, // 30 días
    terms: [
      { type: 'no_attack', duration: 'permanent' },
      { type: 'trade_friendly', duration: 'permanent' }
    ]
  }
);
```

## 📈 **MÉTRICAS DE ÉXITO**

### **Indicadores Clave**
- **Miembros por alianza**: 10-100 miembros según nivel
- **Departamentos**: 8 especializaciones posibles
- **Tratados simultáneos**: 5-10 tratados activos
- **Flotas conjuntas**: 3-10 flotas coordinadas

### **Balance de Juego**
- **Early game**: Alianzas pequeñas, cooperación básica
- **Mid game**: Alianzas medianas, departamentos especializados
- **Late game**: Grandes alianzas, guerras diplomáticas

### **Profundidad Estratégica**
- **Relaciones**: -100 a +100 puntos de relación
- **Economía**: Tesorería compartida con impuestos
- **Militar**: Coordinación de flotas y planes de ataque
- **Diplomacia**: Tratados complejos con múltiples cláusulas

---

**📍 Próximo paso**: Implementar sistema de interfaz de usuario y referencia visual.
