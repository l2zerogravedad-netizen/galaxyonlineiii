# ⚔️ FASE 2: SISTEMAS DE COMBATE (Semanas 5-8)

## 📋 **RESUMEN DE LA FASE**

Esta fase implementa los sistemas fundamentales de combate, incluyendo flotas organizadas, combate por turnos en grilla 9x9, formaciones tácticas y movimiento estratégico de flotas.

### **🎯 Objetivos Principales**
- ✅ Sistema de flotas con organización táctica
- ✅ Combate por turnos con iniciativa y límite de rondas
- ✅ Formaciones estratégicas predefinidas
- ✅ Movimiento estratégico entre sistemas

### **⏱️ Cronograma**
| Semana | Sistema | Duración | Prioridad | Complejidad |
|--------|---------|----------|-----------|-------------|
| 5-6 | Sistema de Flotas | 14 días | 🔥 Crítica | Muy Alta |
| 7-8 | Combate por Turnos | 14 días | 🔥 Crítica | Muy Alta |

---

## 🚀 **SISTEMA 1: FLOTAS Y FORMACIÓN (Semanas 5-6)**

### **📊 Descripción General**
Sistema de organización de flotas con grilla táctica 9x9, sistema de stacks, formaciones predefinidas y asignación estratégica de naves y comandantes.

### **🎮 Características Clave**
- **Grilla de combate**: 9x9 posiciones tácticas
- **Sistema de stacks**: 1-5 naves por posición
- **Formaciones**: 7 tipos predefinidos + personalizadas
- **Asignación automática**: Optimización de roles

### **🖼️ Referencias Visuales**

#### **Imágenes de Flotas**
```
📁 images/fleets/
├── 🎯 fleet-formations/       # Formaciones tácticas
│   ├── line-formation.png     # Formación en línea
│   ├── wedge-formation.png    # Formación en cuña
│   ├── diamond-formation.png  # Formación en diamante
│   ├── circle-formation.png   # Formación circular
│   ├── phalanx-formation.png  # Formación en falange
│   ├── skirmish-formation.png # Formación de escaramuza
│   └── custom-formation.png   # Formación personalizada
├── 📋 combat-grid/           # Grilla de combate
│   ├── empty-grid.png         # Grilla vacía 9x9
│   ├── fleet-positioning.png  # Posicionamiento de flotas
│   ├── stack-system.png       # Sistema de stacks
│   ├── movement-arrows.png    # Flechas de movimiento
│   └── attack-ranges.png      # Rangos de ataque
├── 🚢 fleet-composition/      # Composición de flotas
│   ├── balanced-fleet.png     # Flota balanceada
│   ├── assault-fleet.png      # Flota de asalto
│   ├── defensive-fleet.png    # Flota defensiva
│   ├── support-fleet.png      # Flota de apoyo
│   └── scout-fleet.png        # Flota de exploración
├── 👥 command-structure/      # Estructura de mando
│   ├── fleet-commander.png    # Comandante de flota
│   ├── wing-leaders.png       # Líderes de escuadrón
│   ├── squad-leaders.png      # Líderes de escuadra
│   └── chain-of-command.png   # Cadena de mando
└── 🎮 fleet-management/       # Gestión de flotas
    ├── fleet-list.png         # Lista de flotas
    ├── fleet-details.png      # Detalles de flota
    ├── assignment-panel.png   # Panel de asignación
    └── status-display.png     # Display de estado
```

#### **Videos de Flotas**
```
📁 videos/fleets/
├── 🎬 fleet-organization.mp4  # Organización de flotas (3:00)
├── 🎯 formation-demo.mp4      # Demostración de formaciones (2:30)
├── 📋 grid-placement.mp4      # Posicionamiento en grilla (2:00)
├── 🚀 fleet-movement.mp4      # Movimiento de flotas (2:30)
└── ⚔️ tactical-preview.mp4    # Vista previa táctica (1:45)
```

---

## ⚔️ **SISTEMA 2: COMBATE POR TURNOS (Semanas 7-8)**

### **📊 Descripción General**
Sistema de combate por turnos con iniciativa basada en velocidad de comandantes, límite de rondas (20 + bonus), orden de ataque y cálculo de daño detallado.

### **🎮 Características Clave**
- **Turnos secuenciales**: Basados en iniciativa
- **Límite de rondas**: 20 + (flotas + edificios), máximo 99
- **Orden de ataque**: Por velocidad de comandante
- **Cálculo de daño**: Preciso con modificadores

### **🖼️ Referencias Visuales**

#### **Imágenes de Combate**
```
📁 images/combat/
├── ⚔️ combat-interface/       # Interfaz de combate
│   ├── combat-screen.png      # Pantalla principal de combate
│   ├── turn-indicator.png     # Indicador de turnos
│   ├── action-panel.png       # Panel de acciones
│   ├── unit-info.png          # Información de unidades
│   └── damage-display.png     # Display de daño
├── 🎯 turn-system/           # Sistema de turnos
│   ├── initiative-order.png   # Orden de iniciativa
│   ├── turn-timer.png         # Temporizador de turnos
│   ├── action-queue.png       # Cola de acciones
│   └── round-counter.png      # Contador de rondas
├── 💥 combat-effects/        # Efectos de combate
│   ├── weapon-fire.png        # Disparo de armas
│   ├── explosion.png          # Explosión
│   ├── shield-hit.png         # Impacto en escudo
│   ├── damage-effects.png     # Efectos de daño
│   └── special-effects.png    # Efectos especiales
├── 📊 combat-resolution/      # Resolución de combate
│   ├── damage-calculation.png # Cálculo de daño
│   ├── hit-chance.png         # Probabilidad de impacto
│   ├── critical-hit.png       # Impacto crítico
│   └── miss-indicator.png     # Indicador de fallo
└── 🏆 combat-results/        # Resultados de combate
    ├── victory-screen.png     # Pantalla de victoria
    ├── defeat-screen.png      # Pantalla de derrota
    ├── statistics.png         # Estadísticas de combate
    └── rewards.png            # Recompensas
```

#### **Videos de Combate**
```
📁 videos/combat/
├── 🎬 turn-based-combat.mp4   # Combate por turnos (4:00)
├── ⚔️ combat-demo.mp4         # Demostración de combate (3:30)
├── 🎯 initiative-system.mp4   # Sistema de iniciativa (2:00)
├── 💥 damage-calculation.mp4  # Cálculo de daño (2:30)
└── 🏆 combat-resolution.mp4   # Resolución de combate (2:00)
```

---

## 🎯 **MILESTONE DE FASE 2**

### **✅ Objetivos de Finalización**
- [ ] Sistema de flotas con grilla 9x9 funcional
- [ ] 7 formaciones tácticas predefinidas
- [ ] Sistema de stacks implementado
- [ ] Combate por turnos completo
- [ ] Sistema de iniciativa funcional
- [ ] Límite de rondas con bonus implementado

### **🎮 Características Jugables**
- **Jugadores pueden**: Crear flotas, organizar formaciones, combatir por turnos
- **Combate táctico**: Posicionamiento estratégico y orden de ataque
- **Progresión**: Experiencia de combate y mejoras de flotas
- **Contenido**: 10-15 horas de gameplay de combate

### **📊 Métricas de Éxito**
- **Rendimiento**: 60 FPS en combate
- **Usabilidad**: <45 segundos para organizar primera flota
- **Estabilidad**: <1% de bugs críticos
- **Feedback**: >85% satisfacción de testers

---

## 🚀 **PRÓXIMOS PASOS**

### **📋 Preparación para Fase 3**
1. **Testing completo** de sistemas de combate
2. **Balance inicial** de armas y defensas
3. **Optimización** de rendimiento en combate
4. **Documentación** para equipo de combate avanzado

### **🎯 Transición a Combate Avanzado**
- **Integración** de armas especializadas
- **Preparación** de sistema de comandantes
- **Balance** de daño y defensas
- **Testing** de efectos especiales

---

**📍 Resultado esperado**: Sistema de combate táctico completo con flotas organizables, combate por turnos estratégico y base sólida para mecánicas avanzadas.
