# 🚫 REGLAS DE NO DUPLICACIÓN - DESTOCK SPACE

## 📋 **PRINCIPIO FUNDAMENTAL**

**NUNCA duplicar lógica de negocio. Todo procesamiento de datos, cálculos y validaciones DEBE vivir en el backend común. Los clientes son solo interfaces de visualización.**

---

## 🏛️ **ARQUITECTURA DE RESPONSABILIDADES**

### **🔧 Backend - ÚNICA Fuente de Verdad**
```typescript
// ✅ LO QUE EL BACKEND DEBE HACER
interface BackendResponsibilities {
  core_logic: {
    ✅_CALCULATE_RESOURCE_PRODUCTION: "Producción por minuto",
    ✅_PROCESS_ECONOMIC_TRANSACTIONS: "Transferencias, compras",
    ✅_VALIDATE_ITEM_EQUIPMENT: "Requisitos, slots, compatibilidad",
    ✅_RESOLVE_COMBAT_MECHANICS: "Daño, precisión, efectos",
    ✅_MANAGE_INVENTORY_SYSTEM: "Slots, peso, límites",
    ✅_DETERMINE_MARKETPLACE_PRICES: "Oferta/demanda, tarifas",
    ✅_HANDLE_USER_AUTHENTICATION: "JWT, sesiones, seguridad",
    ✅_MAINTAIN_GAME_STATE: "Persistencia, consistencia"
  },
  
  data_processing: {
    ✅_APPLY_GAME_RULES: "Todas las reglas del juego",
    ✅_VALIDATE_PLAYER_ACTIONS: "Acciones legales vs ilegales",
    ✅_CALCULATE_DAMAGE_FORMULAS: "Fórmulas de combate",
    ✅_PROCESS_SKILL_EFFECTS: "Bonificaciones, mejoras",
    ✅_MANAGE_QUEST_SYSTEM: "Misiones, recompensas",
    ✅_HANDLE_ALLIANCE_MECHANICS: "Creación, gestión, guerra"
  }
}
```

### **🎮 Clientes - Solo Consumo de API**
```typescript
// ❌ LO QUE LOS CLIENTES NUNCA DEBEN HACER
interface ClientProhibitedActions {
  ❌_CALCULATE_ANYTHING: "Solo backend calcula",
  ❌_VALIDATE_RULES: "Solo backend valida",
  ❌_PROCESS_TRANSACTIONS: "Solo backend procesa",
  ❌_DETERMINE_PRICES: "Solo backend fija precios",
  ❌_MANAGE_INVENTORY: "Solo backend gestiona",
  ❌_RESOLVE_COMBAT: "Solo backend resuelve",
  ❌_CREATE_GAME_STATE: "Solo backend persiste",
  ❌_APPLY_BALANCE_CHANGES: "Solo backend aplica"
}

// ✅ LO QUE LOS CLIENTES DEBEN HACER
interface ClientAllowedActions {
  visualization: {
    ✅_DISPLAY_RESOURCES: "Mostrar valores del backend",
    ✅_RENDER_SHIPS: "Visualizar naves del backend",
    ✅_SHOW_INVENTORY: "Mostrar items del backend",
    ✅_DISPLAY_COMBAT: "Visualizar combate del backend"
  },
  
  interaction: {
    ✅_SEND_USER_INPUT: "Enviar acciones al backend",
    ✅_DISPLAY_FEEDBACK: "Mostrar respuestas del backend",
    ✅_HANDLE_UI_ANIMATIONS: "Animaciones visuales",
    ✅_MANAGE_LOCAL_CACHE: "Cache temporal para rendimiento"
  }
}
```

---

## 🔄 **EJEMPLOS DE DUPLICACIÓN PROHIBIDA**

### **💰 Economía - Caso Incorrecto**
```typescript
// ❌ NUNCA HACER ESTO EN EL CLIENTE
class ClientEconomyManager {
  calculateProduction() {
    // ❌ LÓGICA DUPLICADA - Esto debe estar en backend
    const metalProduction = this.buildings.filter(b => b.type === 'mine')
      .reduce((sum, b) => sum + b.production, 0);
    
    // ❌ CÁLCULOS LOCALES - Error de sincronización garantizado
    this.resources.metal += metalProduction * deltaTime;
  }
}

// ✅ FORMA CORRECTA
class ClientEconomyManager {
  async updateResources() {
    // ✅ Solo obtener del backend
    const resources = await api.get('/economy/resources');
    this.displayResources(resources);
  }
}
```

### **⚔️ Combate - Caso Incorrecto**
```typescript
// ❌ NUNCA HACER ESTO EN EL CLIENTE
class ClientCombatSystem {
  calculateDamage(attacker, defender) {
    // ❌ LÓGICA DE COMBATE DUPLICADA
    const baseDamage = attacker.weapon.damage;
    const defense = defender.armor.defense;
    
    // ❌ CÁLCULOS LOCALES - Diferentes resultados en cada cliente
    const finalDamage = Math.max(0, baseDamage - defense);
    
    // ❌ VALIDACIÓN LOCAL - Puede ser engañada
    if (finalDamage > 0) {
      defender.health -= finalDamage;
    }
  }
}

// ✅ FORMA CORRECTA
class ClientCombatSystem {
  async performCombatAction(action) {
    // ✅ Solo enviar acción al backend
    const result = await api.post('/combat/actions', action);
    
    // ✅ Solo mostrar resultado del backend
    this.displayCombatResult(result);
  }
}
```

### **📦 Inventario - Caso Incorrecto**
```typescript
// ❌ NUNCA HACER ESTO EN EL CLIENTE
class ClientInventory {
  equipItem(itemId, slot) {
    // ❌ VALIDACIÓN LOCAL - Puede ser bypassed
    if (this.canEquipInSlot(itemId, slot)) {
      // ❌ GESTIÓN LOCAL - No sincronizado
      this.inventory.items.find(i => i.id === itemId).slot = slot;
      this.inventory.items.find(i => i.slot === slot).slot = null;
    }
  }
  
  canEquipInSlot(itemId, slot) {
    // ❌ REGLAS LOCALES - Pueden estar desactualizadas
    const item = this.items.find(i => i.id === itemId);
    return this.slotRules[item.type].includes(slot);
  }
}

// ✅ FORMA CORRECTA
class ClientInventory {
  async equipItem(itemId, slot) {
    // ✅ Solo enviar solicitud al backend
    const result = await api.put(`/inventory/items/${itemId}/equip`, { slot });
    
    // ✅ Actualizar solo si backend confirma
    if (result.success) {
      this.updateInventoryDisplay(result.inventory);
    } else {
      this.showError(result.error);
    }
  }
}
```

---

## 🎯 **REGLAS ESPECÍFICAS POR SISTEMA**

### **💰 Sistema Económico**
```typescript
interface EconomicRules {
  production: {
    ❌_CLIENT_CALCULATES: "Producción local",
    ✅_BACKEND_CALCULATES: "Producción centralizada",
    ❌_CLIENT_UPDATES: "Actualizar recursos localmente",
    ✅_CLIENT_DISPLAYS: "Solo mostrar valores del backend"
  },
  
  transactions: {
    ❌_CLIENT_VALIDATES: "Validar transacciones",
    ✅_BACKEND_VALIDATES: "Validación centralizada",
    ❌_CLIENT_PROCESSES: "Procesar pagos",
    ✅_BACKEND_PROCESSES: "Procesamiento seguro"
  },
  
  marketplace: {
    ❌_CLIENT_SETS_PRICES: "Fijar precios localmente",
    ✅_BACKEND_SETS_PRICES: "Precios centralizados",
    ❌_CLIENT_MANAGES_LISTINGS: "Gestionar marketplace",
    ✅_BACKEND_MANAGES_LISTINGS: "Marketplace centralizado"
  }
}
```

### **⚔️ Sistema de Combate**
```typescript
interface CombatRules {
  damage_calculation: {
    ❌_CLIENT_CALCULATES_DAMAGE: "Fórmulas de daño locales",
    ✅_BACKEND_CALCULATES_DAMAGE: "Daño centralizado",
    ❌_CLIENT_APPLIES_EFFECTS: "Efectos de combate locales",
    ✅_BACKEND_APPLIES_EFFECTS: "Efectos centralizados"
  },
  
  combat_resolution: {
    ❌_CLIENT_DETERMINES_WINNER: "Ganador local",
    ✅_BACKEND_DETERMINES_WINNER: "Ganador centralizado",
    ❌_CLIENT_AWARDS_REWARDS: "Recompensas locales",
    ✅_BACKEND_AWARDS_REWARDS: "Recompensas centralizadas"
  }
}
```

### **📦 Sistema de Inventario**
```typescript
interface InventoryRules {
  item_management: {
    ❌_CLIENT_MANAGES_SLOTS: "Gestión de slots local",
    ✅_BACKEND_MANAGES_SLOTS: "Slots centralizados",
    ❌_CLIENT_VALIDATES_EQUIPMENT: "Validación local",
    ✅_BACKEND_VALIDATES_EQUIPMENT: "Validación centralizada"
  },
  
  item_properties: {
    ❌_CLIENT_MODIFIES_STATS: "Modificar stats locales",
    ✅_BACKEND_MODIFIES_STATS: "Stats centralizados",
    ❌_CLIENT_CREATES_ITEMS: "Crear items localmente",
    ✅_BACKEND_CREATES_ITEMS: "Items centralizados"
  }
}
```

---

## 🔍 **DETECCIÓN DE DUPLICACIÓN**

### **🚨 Red Flags de Duplicación**
```typescript
interface DuplicationRedFlags {
  calculation_logic: {
    🚨_MATH_OPERATIONS: "Cálculos matemáticos en cliente",
    🚨_FORMULA_IMPLEMENTATION: "Fórmulas del juego en cliente",
    🚨_VALIDATION_RULES: "Reglas de validación en cliente",
    🚨_STATE_MODIFICATION: "Modificación de estado en cliente"
  },
  
  data_management: {
    🚨_LOCAL_DATABASE: "Base de datos local",
    🚨_LOCAL_PERSISTENCE: "Guardar estado localmente",
    🚨_OFFLINE_PROCESSING: "Procesamiento sin conexión",
    🚨_CACHING_GAME_STATE: "Cache de estado del juego"
  },
  
  business_logic: {
    🚨_ECONOMIC_CALCULATIONS: "Cálculos económicos",
    🚨_COMBAT_RESOLUTION: "Resolución de combate",
    🚨_TRANSACTION_PROCESSING: "Procesamiento de transacciones",
    🚨_REWARD_DISTRIBUTION: "Distribución de recompensas"
  }
}
```

### **✅ Signos de Arquitectura Correcta**
```typescript
interface CorrectArchitecture {
  client_behavior: {
    ✅_API_CALLS_ONLY: "Solo llamadas a API",
    ✅_DISPLAY_LOGIC: "Solo lógica de visualización",
    ✅_USER_INPUT_HANDLING: "Manejo de input del usuario",
    ✅_LOCAL_CACHE_TEMPORAL: "Cache temporal para rendimiento"
  },
  
  backend_behavior: {
    ✅_ALL_BUSINESS_LOGIC: "Toda la lógica de negocio",
    ✅_DATA_VALIDATION: "Validación de datos",
    ✅_STATE_MANAGEMENT: "Gestión de estado",
    ✅_SECURITY_ENFORCEMENT: "Aplicación de seguridad"
  }
}
```

---

## 🔄 **PROCESO DE REFACTORIZACIÓN**

### **📋 Pasos para Eliminar Duplicación**
```typescript
interface RefactoringProcess {
  step_1: {
    action: "Identificar lógica duplicada",
    tools: ["Code review", "Architecture analysis"],
    output: "Lista de código duplicado"
  },
  
  step_2: {
    action: "Mover lógica al backend",
    tools: ["API design", "Service creation"],
    output: "Nuevos endpoints de backend"
  },
  
  step_3: {
    action: "Actualizar clientes para consumir API",
    tools: ["Client refactoring", "API integration"],
    output: "Clientes limpios que solo consumen API"
  },
  
  step_4: {
    action: "Probar integración completa",
    tools: ["Integration testing", "End-to-end testing"],
    output: "Sistema sin duplicación funcionando"
  },
  
  step_5: {
    action: "Documentar cambios",
    tools: ["Update documentation", "Team communication"],
    output: "Documentación actualizada"
  }
}
```

---

## 🎯 **EJEMPLOS DE MIGRACIÓN**

### **💰 Migración de Sistema Económico**
```typescript
// ANTES (Con duplicación)
class ClientEconomy {
  calculateProduction() {
    // ❌ Lógica duplicada
    return this.buildings.reduce((sum, b) => sum + b.production, 0);
  }
  
  updateResources() {
    // ❌ Actualización local
    this.resources.metal += this.calculateProduction() * deltaTime;
  }
}

// DESPUÉS (Sin duplicación)
class ClientEconomy {
  async updateResources() {
    // ✅ Solo consumir API
    const resources = await api.get('/economy/resources');
    this.displayResources(resources);
  }
  
  displayResources(resources) {
    // ✅ Solo visualización
    this.ui.updateResourceDisplay(resources);
  }
}

// BACKEND (Nueva lógica centralizada)
class BackendEconomy {
  calculateProduction(userId) {
    // ✅ Lógica centralizada
    const buildings = this.getBuildings(userId);
    return buildings.reduce((sum, b) => sum + b.production, 0);
  }
  
  updateResources(userId) {
    // ✅ Actualización centralizada
    const production = this.calculateProduction(userId);
    this.resources.update(userId, production);
    return this.resources.get(userId);
  }
}
```

---

## 📊 **MÉTRICAS DE DUPLICACIÓN**

### **📈 Indicadores de Problemas**
```typescript
interface DuplicationMetrics {
  code_duplication: {
    📊_percentage_of_duplicate_logic: "Porcentaje de código duplicado",
    📊_number_of_calculation_functions: "Funciones de cálculo en cliente",
    📊_lines_of_business_logic: "Líneas de lógica de negocio en cliente"
  },
  
  synchronization_issues: {
    📊_state_inconsistency_reports: "Reportes de inconsistencia",
    📊_data_conflict_incidents: "Incidentes de conflicto de datos",
    📊_rollback_frequency: "Frecuencia de rollbacks"
  },
  
  maintenance_cost: {
    📊_dual_maintenance_time: "Tiempo de mantenimiento doble",
    📊_bug_fix_duplication: "Arreglos de bugs duplicados",
    📊_testing_overhead: "Sobrecarga de testing"
  }
}
```

---

## 🎯 **CHECKLIST DE VALIDACIÓN**

### **✅ Verificación de Arquitectura**
```typescript
interface ArchitectureValidation {
  backend_verification: {
    ✅_ALL_BUSINESS_LOGIC_PRESENT: "Toda lógica en backend",
    ✅_API_COVERS_ALL_FUNCTIONS: "API cubre todas las funciones",
    ✅_VALIDATION_IS_CENTRALIZED: "Validación centralizada",
    ✅_STATE_MANAGEMENT_IS_UNIFIED: "Gestión unificada de estado"
  },
  
  client_verification: {
    ✅_NO_CALCULATION_LOGIC: "Sin lógica de cálculo",
    ✅_NO_VALIDATION_LOGIC: "Sin lógica de validación",
    ✅_ONLY_API_CALLS: "Solo llamadas a API",
    ✅_ONLY_DISPLAY_LOGIC: "Solo lógica de visualización"
  },
  
  integration_verification: {
    ✅_CONSISTENT_DATA_FLOW: "Flujo de datos consistente",
    ✅_REAL_TIME_SYNCHRONIZATION: "Sincronización en tiempo real",
    ✅_ERROR_HANDLING_IS_UNIFIED: "Manejo de errores unificado",
    ✅_SECURITY_IS_CENTRALIZED: "Seguridad centralizada"
  }
}
```

---

## 🚨 **CONSECUENCIAS DE DUPLICACIÓN**

### **⚠️ Problemas Causados por Duplicación**
```typescript
interface DuplicationConsequences {
  technical_issues: {
    🔴_DATA_INCONSISTENCY: "Datos inconsistentes entre clientes",
    🔴_SECURITY_VULNERABILITIES: "Vulnerabilidades de seguridad",
    🔴_SYNCHRONIZATION_ERRORS: "Errores de sincronización",
    🔴_MAINTENANCE_NIGHTMARE: "Pesadilla de mantenimiento"
  },
  
  business_impact: {
    🔴_PLAYER_EXPLOITS: "Exploits de jugadores",
    🔴_ECONOMIC_IMBALANCE: "Desequilibrio económico",
    🔴_UNFAIR_ADVANTAGE: "Ventajas injustas",
    🔴_LOSS_OF_TRUST: "Pérdida de confianza"
  },
  
  development_impact: {
    🔴_INCREASED_BUGS: "Aumento de bugs",
    🔴_LONGER_DEVELOPMENT_TIME: "Tiempo de desarrollo mayor",
    🔴_HIGHER_COSTS: "Costos más altos",
    🔴_TEAM_FRUSTRATION: "Frustración del equipo"
  }
}
```

---

## 🎯 **BENEFICIOS DE ARQUITECTURA CORRECTA**

### **✅ Ventajas de No Duplicación**
```typescript
interface NoDuplicationBenefits {
  technical_benefits: {
    ✅_SINGLE_SOURCE_OF_TRUTH: "Única fuente de verdad",
    ✅_CONSISTENT_BEHAVIOR: "Comportamiento consistente",
    ✅_EASIER_MAINTENANCE: "Mantenimiento más fácil",
    ✅_IMPROVED_SECURITY: "Seguridad mejorada"
  },
  
  business_benefits: {
    ✅_FAIR_GAMEPLAY: "Juego justo",
    ✅_ECONOMIC_STABILITY: "Estabilidad económica",
    ✅_PLAYER_TRUST: "Confianza del jugador",
    ✅_SCALABILITY: "Escalabilidad"
  },
  
  development_benefits: {
    ✅_FASTER_DEVELOPMENT: "Desarrollo más rápido",
    ✅_FEWER_BUGS: "Menos bugs",
    ✅_CLEAR_RESPONSIBILITIES: "Responsabilidades claras",
    ✅_BETTER_TEAMWORK: "Mejor trabajo en equipo"
  }
}
```

---

## 📞 **PROCEDIMIENTOS DE EMERGENCIA**

### **🚨 Si se Encuentra Duplicación**
```typescript
interface DuplicationEmergencyProcedure {
  immediate_actions: {
    1: "Documentar el problema inmediatamente",
    2: "Notificar a todo el equipo",
    3: "Evaluar impacto en producción",
    4: "Planificar migración de inmediato"
  },
  
  migration_plan: {
    1: "Crear nuevo endpoint en backend",
    2: "Actualizar clientes para usar API",
    3: "Retirar lógica duplicada",
    4: "Probar exhaustivamente",
    5: "Desplegar en producción"
  },
  
  prevention: {
    1: "Actualizar documentación",
    2: "Agregar reglas a code review",
    3: "Capacitar al equipo",
    4: "Establecer métricas de detección"
  }
}
```

---

**🎯 ESTA GUÍA DEBE SEGUIRSE RELIGIOSAMENTE. CUALQUIER VIOLACIÓN DE ESTAS REGLAS COMPROMETE LA INTEGRIDAD DEL SISTEMA COMPLETO.**
