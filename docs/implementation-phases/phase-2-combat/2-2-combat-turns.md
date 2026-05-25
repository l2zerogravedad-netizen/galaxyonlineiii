# ⚔️ SISTEMA DE COMBATE POR TURNOS - IMPLEMENTACIÓN DETALLADA

## 📋 **DESCRIPIÓN COMPLETA**

Sistema de combate por turnos con iniciativa basada en velocidad de comandantes, límite de rondas (20 + bonus), orden de ataque, cálculo de daño detallado y resolución táctica.

## 🎯 **CARACTERÍSTICAS PRINCIPALES**

### **🎲 Sistema de Iniciativa**
- **Base de velocidad**: Velocidad del comandante + bonificaciones
- **Modificadores**: Tecnología, formación, terreno, moral
- **Orden de ataque**: Mayor velocidad actúa primero
- **Empates**: Resueltos aleatoriamente con bonificación por nivel

### **⏱️ Límite de Rondas**
- **Rondas base**: 20 rondas estándar
- **Bonus por flotas**: +1 ronda por cada flota adicional
- **Bonus por edificios**: +1 ronda por cada 10 edificios
- **Máximo absoluto**: 99 rondas (para evitar combates infinitos)

### **⚔️ Orden de Ataque**
- **Secuencia**: Basada en iniciativa calculada
- **Acciones por turno**: 1 acción principal + 1 movimiento
- **Tiempo por acción**: 30 segundos base + 15 por nivel
- **Pérdida de turno**: Si no se actúa en tiempo límite

## 🖼️ **REFERENCIAS VISUALES COMPLETAS**

### **📁 Estructura de Imágenes**
```
📁 images/combat/
├── ⚔️ combat-interface/       # Interfaz de combate
│   ├── 🖥️ combat-screen.png      # Pantalla principal de combate
│   │   ├── main-view.png         # Vista principal del campo
│   │   ├── side-panels.png       # Paneles laterales
│   │   ├── bottom-bar.png        # Barra inferior de acciones
│   │   └── top-bar.png           # Barra superior de información
│   ├── 🎯 turn-indicator.png     # Indicador de turnos
│   │   ├── current-turn.png       # Turno actual
│   │   ├── next-up.png           # Siguiente en actuar
│   │   ├── turn-order.png        # Orden completo de turnos
│   │   └── time-remaining.png     # Tiempo restante
│   ├── 🎮 action-panel.png       # Panel de acciones
│   │   ├── attack-button.png      # Botón de ataque
│   │   ├── defend-button.png      # Botón de defensa
│   │   ├── move-button.png        # Botón de movimiento
│   │   ├── special-button.png     # Botón de especial
│   │   └── skip-button.png        # Botón de omitir
│   ├── 📊 unit-info.png          # Información de unidades
│   │   ├── ship-stats.png         # Estadísticas de nave
│   │   ├── health-bar.png         # Barra de salud
│   │   ├── shield-bar.png         # Barra de escudos
│   │   ├── status-effects.png     # Efectos de estado
│   │   └── ammo-display.png       # Display de munición
│   └── 💥 damage-display.png     # Display de daño
│       ├── damage-numbers.png     # Números de daño
│       ├── critical-indicator.png # Indicador de crítico
│       ├── miss-indicator.png     # Indicador de fallo
│       ├── block-indicator.png    # Indicador de bloqueo
│       └── dodge-indicator.png    # Indicador de esquiva
├── 🎯 turn-system/           # Sistema de turnos
│   ├── ⚡ initiative-order.png   # Orden de iniciativa
│   │   ├── speed-calculation.png # Cálculo de velocidad
│   │   ├── bonus-modifiers.png   # Modificadores de bonificación
│   │   ├── tie-breaker.png       # Desempate
│   │   └── initiative-bar.png    # Barra de iniciativa
│   ├── ⏱️ turn-timer.png         # Temporizador de turnos
│   │   ├── countdown-display.png  # Display de cuenta regresiva
│   │   ├── warning-phase.png      # Fase de advertencia
│   │   ├── time-extension.png    # Extensión de tiempo
│   │   └── timeout-penalty.png   # Penalización por tiempo
│   ├── 📋 action-queue.png       # Cola de acciones
│   │   ├── queued-actions.png    # Acciones en cola
│   │   ├── execution-order.png   # Orden de ejecución
│   │   ├── priority-system.png   # Sistema de prioridad
│   │   └── queue-management.png  # Gestión de cola
│   └── 🔢 round-counter.png      # Contador de rondas
│       ├── round-display.png     # Display de rondas
│       ├── max-rounds.png        # Rondas máximas
│       ├── round-bonus.png       # Bonus de rondas
│       └── sudden-death.png      # Muerte súbita
├── 💥 combat-effects/        # Efectos de combate
│   ├── 🔫 weapon-fire.png        # Disparo de armas
│   │   ├── laser-beam.png        # Rayo láser
│   │   ├── plasma-bolt.png       # Proyectil de plasma
│   │   ├── missile-trail.png     # Estela de misil
│   │   ├── railgun-projectile.png # Proyectil de cañón de riel
│   │   └── particle-burst.png    # Ráfaga de partículas
│   ├── 💥 explosion.png          # Explosión
│   │   ├── small-explosion.png   # Explosión pequeña
│   │   ├── medium-explosion.png  # Explosión mediana
│   │   ├── large-explosion.png   # Explosión grande
│   │   ├── chain-explosion.png   # Explosión en cadena
│   │   └── shockwave.png         # Onda de choque
│   ├── 🛡️ shield-hit.png         # Impacto en escudo
│   │   ├── shield-ripple.png     # Onda en escudo
│   │   ├── shield-crack.png      # Grieta en escudo
│   │   ├── shield-break.png      # Ruptura de escudo
│   │   └── shield-regen.png      # Regeneración de escudo
│   ├── ⚡ damage-effects.png     # Efectos de daño
│   │   ├── electrical-damage.png # Daño eléctrico
│   │   ├── fire-damage.png       # Daño por fuego
│   │   ├── corrosive-damage.png  # Daño corrosivo
│   │   ├── radiation-damage.png  # Daño por radiación
│   │   └── emp-damage.png        # Daño EMP
│   └── ✨ special-effects.png    # Efectos especiales
│       ├── teleport-effect.png   # Efecto de teletransporte
│       ├── time-slow.png         # Ralentización del tiempo
│       ├── gravity-well.png      # Pozo de gravedad
│       ├── phase-shift.png       # Cambio de fase
│       └── quantum-entanglement.png # Entrelazamiento cuántico
├── 📊 combat-resolution/      # Resolución de combate
│   ├── 🧮 damage-calculation.png # Cálculo de daño
│   │   ├── base-damage.png       # Daño base
│   │   ├── damage-modifiers.png  # Modificadores de daño
│   │   ├── resistance-check.png  # Verificación de resistencia
│   │   ├── critical-calc.png     # Cálculo de crítico
│   │   └── final-damage.png      # Daño final
│   ├── 🎲 hit-chance.png         # Probabilidad de impacto
│   │   ├── accuracy-calc.png     # Cálculo de precisión
│   │   ├── evasion-check.png     # Verificación de esquiva
│   │   ├── distance-modifier.png # Modificador por distancia
│   │   ├── terrain-effect.png    # Efecto del terreno
│   │   └── weather-effect.png    # Efecto del clima
│   ├── 💥 critical-hit.png       # Impacto crítico
│   │   ├── crit-indicator.png    # Indicador de crítico
│   │   ├── crit-multiplier.png   # Multiplicador de crítico
│   │   ├── crit-effects.png      # Efectos de crítico
│   │   └── crit-sound.png        # Sonido de crítico
│   └── ❌ miss-indicator.png     # Indicador de fallo
│       ├── miss-animation.png    # Animación de fallo
│       ├── miss-text.png         # Texto de fallo
│       ├── miss-sound.png        # Sonido de fallo
│       └── miss-reason.png       # Razón del fallo
└── 🏆 combat-results/        # Resultados de combate
    ├── 🎉 victory-screen.png     # Pantalla de victoria
    │   ├── victory-message.png   # Mensaje de victoria
    │   ├── rewards-display.png   # Display de recompensas
    │   ├── experience-gained.png # Experiencia ganada
    │   ├── loot-received.png     # Botín recibido
    │   └── rank-increase.png     # Aumento de rango
    ├── 💀 defeat-screen.png      # Pantalla de derrota
    │   ├── defeat-message.png    # Mensaje de derrota
    │   ├── loss-summary.png      # Resumen de pérdidas
    │   ├── lessons-learned.png   # Lecciones aprendidas
    │   └── retry-option.png      # Opción de reintentar
    ├── 📊 statistics.png         # Estadísticas de combate
    │   ├── damage-dealt.png       # Daño infligido
    │   ├── damage-received.png   # Daño recibido
    │   ├── accuracy-rate.png     # Tasa de precisión
    │   ├── critical-rate.png     # Tasa de críticos
    │   ├── survival-time.png     # Tiempo de supervivencia
    │   └── efficiency-score.png  # Puntuación de eficiencia
    └── 🎁 rewards.png            # Recompensas
        ├── resource-rewards.png  # Recompensas de recursos
        ├── item-rewards.png      # Recompensas de items
        ├── experience-rewards.png # Recompensas de experiencia
        ├── achievement-unlocks.png # Desbloqueos de logros
        └── special-bonuses.png   # Bonificaciones especiales
```

### **🎥 Estructura de Videos**
```
📁 videos/combat/
├── 🎬 turn-based-combat.mp4   # Combate por turnos (5:00)
│   ├── 0:00-0:45 Inicio del combate
│   ├── 0:45-1:30 Cálculo de iniciativa
│   ├── 1:30-2:15 Primer turno
│   ├── 2:15-3:00 Desarrollo del combate
│   ├── 3:00-3:45 Fase final
│   ├── 3:45-4:30 Resolución
│   └── 4:30-5:00 Resultados
├── ⚔️ combat-demo.mp4         # Demostración de combate (4:00)
│   ├── Tutorial de combate básico
│   ├── Demostración de acciones
│   ├── Ejemplos de tácticas
│   ├── Uso de habilidades especiales
│   └── Consejos estratégicos
├── 🎯 initiative-system.mp4   # Sistema de iniciativa (2:30)
│   ├── Cálculo de velocidad
│   ├── Modificadores y bonificaciones
│   ├── Orden de turnos
│   ├── Desempates
│   └── Estrategias de iniciativa
├── 💥 damage-calculation.mp4  # Cálculo de daño (3:00)
│   ├── Fórmula de daño base
│   ├── Modificadores de daño
│   ├── Resistencias y vulnerabilidades
│   ├── Impactos críticos
│   └── Ejemplos prácticos
└── 🏆 combat-resolution.mp4   # Resolución de combate (2:30)
    ├── Condiciones de victoria
    ├── Condiciones de derrota
    ├── Empates
    ├── Sistema de puntuación
    └── Recompensas y penalizaciones
```

## 🔧 **IMPLEMENTACIÓN TÉCNICA**

### **🎲 Sistema de Iniciativa**
```typescript
interface InitiativeSystem {
  // Calcular iniciativa de unidad
  calculateInitiative(unit: CombatUnit): InitiativeScore;
  
  // Determinar orden de turnos
  determineTurnOrder(units: CombatUnit[]): TurnOrder[];
  
  // Aplicar modificadores de iniciativa
  applyInitiativeModifiers(
    baseInitiative: number,
    modifiers: InitiativeModifier[]
  ): number;
  
  // Resolver empates
  resolveTies(units: CombatUnit[]): CombatUnit[];
}

interface InitiativeScore {
  baseSpeed: number;
  commanderBonus: number;
  technologyBonus: number;
  formationBonus: number;
  terrainBonus: number;
  moraleBonus: number;
  totalInitiative: number;
}

interface TurnOrder {
  round: number;
  order: CombatUnit[];
  currentTurn: number;
  totalTurns: number;
}
```

### **⏱️ Sistema de Turnos**
```typescript
interface TurnSystem {
  // Iniciar nuevo turno
  startTurn(unitId: string): TurnState;
  
  // Ejecutar acción
  executeAction(
    unitId: string,
    action: CombatAction,
    target?: CombatTarget
  ): ActionResult;
  
  // Finalizar turno
  endTurn(unitId: string): TurnResult;
  
  // Verificar fin de combate
  checkCombatEnd(): CombatEndCondition;
}

interface TurnState {
  unitId: string;
  turnNumber: number;
  actionsRemaining: number;
  timeRemaining: number;
  status: 'active' | 'completed' | 'skipped';
}

interface CombatAction {
  type: 'attack' | 'defend' | 'move' | 'special' | 'skip';
  cost: ActionCost;
  target?: CombatTarget;
  effects: ActionEffect[];
}
```

### **📊 Sistema de Resolución de Combate**
```typescript
interface CombatResolution {
  // Calcular daño
  calculateDamage(
    attacker: CombatUnit,
    defender: CombatUnit,
    weapon: Weapon
  ): DamageResult;
  
  // Verificar impacto
  checkHit(
    attacker: CombatUnit,
    defender: CombatUnit,
    weapon: Weapon
  ): HitResult;
  
  // Aplicar efectos
  applyEffects(
    target: CombatUnit,
    effects: CombatEffect[]
  ): EffectResult;
  
  // Determinar resultado del combate
  determineCombatOutcome(
    participants: CombatUnit[]
  ): CombatOutcome;
}

interface DamageResult {
  baseDamage: number;
  modifiedDamage: number;
  finalDamage: number;
  damageType: DamageType;
  isCritical: boolean;
  blocked: boolean;
  resisted: boolean;
}
```

## 🎮 **FLUJO DE JUEGO**

### **🚀 Flujo Principal del Jugador**
1. **Inicio del combate** → Cálculo de iniciativa
2. **Esperar turno** → Monitorizar orden de turnos
3. **Seleccionar acción** → Elegir ataque, defensa o movimiento
4. **Seleccionar objetivo** → Apuntar a enemigo o posición
5. **Ejecutar acción** → Confirmar y ejecutar
6. **Ver resultados** → Observar daño y efectos
7. **Esperar siguiente turno** → Ciclo continúa

### **📊 Interfaz Principal de Combate**
```
┌─────────────────────────────────────────────────┐
│ ⚔️ COMBATE - FLOTA ALPHA VS FLOTA BETA         │
├─────────────────────────────────────────────────┤
│ 🎯 TURNO 8/20  ⚡ ACTUAL: Alpha-Cruiser      ⏱️ 25s│
├─────────────────────────────────────────────────┤
│ 📋 CAMPO DE BATALLA 9x9                        │
│ ┌───┬───┬───┬───┬───┬───┬───┬───┬───┐ │
│ │ A1│ A2│ A3│ A4│ A5│ A6│ A7│ A8│ A9│ │
│ ├───┼───┼───┼───┼───┼───┼───┼───┼───┤ │
│ │ B1│ B2│ B3│ B4│ B5│ B6│ B7│ B8│ B9│ │
│ ├───┼───┼───┼───┼───┼───┼───┼───┼───┤ │
│ │ C1│ C2│ C3│ C4│ C5│ C6│ C7│ C8│ C9│ │
│ ├───┼───┼───┼───┼───┼───┼───┼───┼───┤ │
│ │ D1│ D2│ D3│ D4│ D5│ D6│ D7│ D8│ D9│ │
│ ├───┼───┼───┼───┼───┼───┼───┼───┼───┤ │
│ │ E1│ E2│ E3│ E4│ E5│ E6│ E7│ E8│ E9│ │
│ ├───┼───┼───┼───┼───┼───┼───┼───┼───┤ │
│ │ F1│ F2│ F3│ F4│ F5│ F6│ F7│ F8│ F9│ │
│ ├───┼───┼───┼───┼───┼───┼───┼───┼───┤ │
│ │ G1│ G2│ G3│ G4│ G5│ G6│ G7│ G8│ G9│ │
│ ├───┼───┼───┼───┼───┼───┼───┼───┼───┤ │
│ │ H1│ H2│ H3│ H4│ H5│ H6│ H7│ H8│ H9│ │
│ ├───┼───┼───┼───┼───┼───┼───┼───┼───┤ │
│ │ I1│ I2│ I3│ I4│ I5│ I6│ I7│ I8│ I9│ │
│ └───┴───┴───┴───┴───┴───┴───┴───┴───┘ │
│ 🚢🚢🚢      💥💥      🚢🚢🚢      │
│ Alpha       Combate     Beta        │
├─────────────────────────────────────────────────┤
│ 🎮 ACCIONES                📊 INFO OBJETIVO    │
│ [🔫 ATACAR]  [🛡️ DEFENDER]  🚢 Beta-Destroyer │
│ [🏃 MOVER]   [✨ ESPECIAL]  ❤️ 450/800      │
│ [⏭️ OMITIR]  [📋 TÁCTICAS]  🛡️ 200/300      │
├─────────────────────────────────────────────────┤
│ 📈 ESTADÍSTICAS DE COMBATE                      │
│ Alpha: 3/8 naves  💪 Poder: 1,250              │
│ Beta: 5/8 naves  💪 Poder: 1,400              │
│ Próximo: Beta-Fighter en 15s                   │
└─────────────────────────────────────────────────┘
```

## 📋 **REQUISITOS DE IMPLEMENTACIÓN**

### **🔥 Alta Prioridad (Semanas 7-8)**
- [ ] **Sistema de iniciativa** completo y funcional
- [ ] **Orden de turnos** basado en velocidad
- [ ] **Límite de rondas** con bonus implementado
- [ ] **Cálculo de daño** básico funcional
- [ ] **Interfaz de combate** completa
- [ ] **Sistema de acciones** (atacar, defender, mover)

### **⚡ Media Prioridad (Semanas 7-8)**
- [ ] **Efectos visuales** de combate
- [ ] **Sistema de críticos** y fallos
- [ ] **Animaciones** de ataques y defensas
- [ ] **Sonidos de combate** inmersivos
- [ ] **Estadísticas detalladas** de combate

### **🔮 Baja Prioridad (Post-Fase 2)**
- [ ] **Acciones especiales** avanzadas
- [ ] **Sistema de combos** y sinergias
- [ ] **Modos de combate** alternativos
- [ ] **Replay de combates** grabados
- [ ] **Sistema de apuestas** en combates

## 🎯 **MÉTRICAS DE ÉXITO**

### **📊 Indicadores Clave**
- **Tiempo por turno**: 30-60 segundos según nivel
- **Rondas máximas**: 20-99 según participantes
- **Precisión base**: 70-85% según distancia
- **Daño por ataque**: 50-500 según arma y nivel

### **🎮 Balance de Juego**
- **Early game**: Combates rápidos, 5-10 rondas
- **Mid game**: Combates tácticos, 10-20 rondas
- **Late game**: Combates épicos, 15-30 rondas

### **📈 Profundidad Estratégica**
- **Iniciativa**: Clave para controlar el combate
- **Posicionamiento**: Afecta precisión y daño
- **Timing**: Decisiones bajo presión temporal
- **Recursos**: Gestión de munición y energía

## 🚀 **PRUEBAS Y VALIDACIÓN**

### **🧪 Test Cases Esenciales**
1. **Cálculo de iniciativa**: Verificar orden correcto
2. **Sistema de turnos**: Test de flujo completo
3. **Cálculo de daño**: Validar fórmulas y modificadores
4. **Límite de rondas**: Probar condiciones de fin
5. **Interfaz de combate**: Test de usabilidad

### **📊 Métricas de Testing**
- **Cobertura de código**: >90%
- **Performance**: 60 FPS en combate
- **Usabilidad**: <30 segundos para primera acción
- **Estabilidad**: <1% errores críticos

---

## 🎯 **RESULTADO ESPERADO**

Al final de las Semanas 7-8, el sistema de combate por turnos debe estar completamente funcional con:

- ✅ **Sistema de iniciativa** basado en velocidad
- ✅ **Orden de turnos** automático y manual
- ✅ **Límite de rondas** con bonus dinámico
- ✅ **Cálculo de daño** detallado y balanceado
- ✅ **Interfaz de combate** intuitiva y responsiva
- ✅ **Sistema de acciones** completo
- ✅ **Resolución de combate** automática

**Este sistema proporcionará el núcleo táctico del juego, permitiendo combates estratégicos profundos y emocionantes.**
