# Sistema Económico Completo - Galaxy Online II

> Documentación completa del sistema económico, edificios, investigaciones, naves, defensas y recompensas.
> **Basado en:** Galaxy Online II Wiki (CC BY-SA 3.0)

---

## 📊 RESUMEN DEL SISTEMA

| Sistema | Archivo | Entidades |
|---------|---------|-----------|
| **Edificios** | `buildings-complete.ts` | 12 edificios, 240 niveles |
| **Investigaciones** | `research-complete.ts` | 10 ciencias, 200 niveles |
| **Naves** | `ships-complete.ts` | 10 hulls, 30+ módulos |
| **Defensas** | `defenses-complete.ts` | 7 defensas, 60 niveles |
| **Instancias** | `instances-complete.ts` | 6+ instancias, 60+ etapas |
| **Economía** | `economy-system.ts` | Fórmulas y balance |

---

## 💰 SISTEMA DE RECURSOS

### Recursos Base

| Recurso | Producción Base | Capacidad Inicial | Uso |
|---------|-----------------|-------------------|-----|
| **Metal** | 20/unidad/hora | 10,000 | Construcción, naves |
| **Plasma** | 10/unidad/hora | 10,000 | Tecnología, energía |
| **Créditos** | 5/unidad/hora | ∞ | Comercio, investigación |
| **Energía** | 50/unidad/hora | Variable | Operación de edificios |

### Recursos Iniciales (Nuevo Jugador)

```typescript
const INITIAL_RESOURCES = {
  metal: 5000,
  plasma: 5000,
  credits: 5000,
  energy: 100
};
```

### Capacidad de Almacenamiento

- **Capacidad base:** 10,000 metal/plasma
- **Por nivel de almacén:** +500 metal, +300 plasma
- **Máximo con almacén nivel 15:** 17,500 metal, 9,500 plasma

---

## 🏗️ EDIFICIOS COMPLETOS

### Edificios de Producción

#### 1. Extractor de Metal
```typescript
{
  id: 'metal_extractor',
  maxLevel: 20,
  production: 20 × level metal/hora,
  consumption: 2 × level energy/hora,
  costMultiplier: 1.5× por nivel
}
```

| Nivel | Producción | Consumo | Costo Metal | Tiempo |
|-------|------------|---------|-------------|--------|
| 1 | 20/h | 2/h | 60 | 1 min |
| 5 | 100/h | 10/h | 507 | 5 min |
| 10 | 200/h | 20/h | 3,448 | 15 min |
| 20 | 400/h | 40/h | 198,363 | 30 min |

#### 2. Refinería de Plasma
```typescript
{
  id: 'plasma_refinery',
  maxLevel: 20,
  production: 10 × level plasma/hora,
  consumption: 3 × level energy/hora,
  costMultiplier: 1.6× por nivel
}
```

| Nivel | Producción | Consumo | Costo Metal | Tiempo |
|-------|------------|---------|-------------|--------|
| 1 | 10/h | 3/h | 100 | 2 min |
| 5 | 50/h | 15/h | 655 | 10 min |
| 10 | 100/h | 30/h | 4,304 | 20 min |
| 20 | 200/h | 60/h | 228,768 | 40 min |

### Edificios de Infraestructura

#### 3. Generador de Energía
- **Producción:** 50 × nivel energía/hora
- **Sin consumo** (autónomo)
- **Máximo nivel:** 20

#### 4. Centro de Control
- **Desbloquea:** Edificios militares
- **Producción:** 5 × nivel créditos/hora
- **Consumo:** 10 × nivel energía/hora
- **Máximo nivel:** 10

#### 5. Almacén
- **Capacidad:** +500 metal, +300 plasma por nivel
- **Sin producción**
- **Máximo nivel:** 15

### Edificios Militares

| Edificio | Desbloqueo | Consumo | Función |
|----------|------------|---------|---------|
| **Astillero** | Centro Nivel 3 | 20×nivel | Construcción de naves |
| **Hangar** | Astillero Nivel 1 | 10×nivel | Almacén de flotas |
| **Laboratorio** | Centro Nivel 2 | 15×nivel | Investigaciones |
| **Torreta Defensa** | Lab Nivel 3 | 8×nivel | Defensa planetaria |

---

## 📚 SISTEMA DE INVESTIGACIÓN

### Árbol de Ciencias

```
Logistics Construction (Nivel 5)
         ↓
Planetary Defense (Nivel 5)
         ↓
    ┌────┴────┐
    ↓         ↓
Ballistics  Directional (Nivel 10)
    ↓         ↓
    └────┬────┘
         ↓
    Missile (Nivel 10)
         ↓
   Ship-based (Nivel 5)
         ↓
  Ship Defense (Nivel 10)
         ↓
    Fleet Command
```

### Ciencias Disponibles

| Ciencia | Niveles | Bonus Principal | Costo Total* |
|---------|---------|-----------------|--------------|
| **Logistics** | 20 | -40% tiempo construcción | ~52M créditos |
| **Planetary Defense** | 20 | +60% defensa | ~78M créditos |
| **Ballistics** | 20 | +50% daño balístico | ~104M créditos |
| **Directional** | 20 | +50% daño láser | ~104M créditos |
| **Missile** | 20 | +60% daño misiles | ~155M créditos |
| **Ship-based** | 20 | +40% daño pesado | ~207M créditos |
| **Ship Defense** | 20 | +50% estructura | ~104M créditos |
| **Fleet Command** | 15 | +30% capacidad flota | ~312M créditos |

*Costo total = metal + plasma + créditos en todas las investigaciones

---

## 🚀 SISTEMA DE NAVES

### Tipos de Hulls

| Tipo | Estructura | Estabilidad | Velocidad | Slots Arma | Slots Defensa |
|------|------------|-------------|-----------|------------|---------------|
| **Fragata T1** | 200 | 50 | 120 | 3 | 3 |
| **Fragata T2** | 350 | 80 | 130 | 6 | 5 |
| **Fragata T3** | 500 | 120 | 140 | 8 | 6 |
| **Crucero T1** | 500 | 100 | 90 | 10 | 9 |
| **Crucero T2** | 900 | 180 | 85 | 16 | 14 |
| **Crucero T3** | 1500 | 300 | 80 | 22 | 19 |
| **Acorazado T1** | 1500 | 200 | 50 | 20 | 20 |
| **Acorazado T2** | 2500 | 350 | 45 | 26 | 26 |
| **Acorazado T3** | 5000 | 600 | 40 | 34 | 34 |
| **Flagship** | 8000 | 800 | 35 | 42 | 38 |

### Tipos de Módulos

#### Armas (5 niveles cada una)

| Tipo | Tier 1 | Tier 3 | Tier 5 |
|------|--------|--------|--------|
| **Balística** | 20 daño | 90 daño | 400 daño |
| **Direccional** | 25 daño | 110 daño | 500 daño |
| **Misiles** | 30 daño | 150 daño | 700 daño |

#### Defensas

| Módulo | Tier 1 | Tier 3 | Tier 4 |
|--------|--------|--------|--------|
| **Blindaje** | +50 estructura | +300 estructura | +750 estructura |
| **Escudo** | +40 escudo | +250 escudo | +600 escudo |

---

## 🛡️ SISTEMA DE DEFENSAS

### Defensas Planetarias

| Defensa | Tipo | Max Nivel | Daño (Nivel 1) | Alcance |
|---------|------|-----------|----------------|---------|
| **Space Station** | Estación | 10 | 100 | 12 |
| **Meteor Star** | Orbital | 10 | 150 | 9 |
| **Particle Cannon** | Orbital | 10 | 300 | 14 |
| **Anti-Air Gun** | Planetaria | 10 | 80 | 7 |
| **Thor's Cannon** | Orbital | 5 | 1000 | 25 |
| **Escudo Planetario** | Planetaria | 10 | 0 | 0 |

### Cálculo de Defensa Total

```typescript
function calculateDefense(defenses: Defense[]) {
  return {
    totalAttack: sum(defense.attack),
    totalDefense: sum(defense.defense),
    totalShield: sum(defense.shield),
    coverage: min(100, sum(defense.range) / 10)
  };
}
```

---

## 🎮 SISTEMA DE INSTANCIAS

### Tipos de Instancias

| Tipo | Dificultad | Intentos/Día | Recompensas |
|------|------------|--------------|-------------|
| **Normal** | Fácil-Medio | 10 | Recursos, EXP, Blueprints |
| **Restringida** | Extrema | 1 | Blueprints legendarios |
| **Constelación** | Extrema | 1 | Recompensas de alianza |
| **Humaroid** | Difícil | 3 | Hulls especiales |

### Recompensas de Instancias

#### Sistema Alpha (Fácil, 5 etapas)
- **Etapa 1-2:** 500-800 metal, 50-100 EXP
- **Etapa 3-4:** 1,200-2,000 metal, 150-250 EXP
- **Etapa 5:** 5,000 metal, 3,000 créditos, Blueprint Fragata

#### Nebulosa de Orion (Medio, 8 etapas)
- **Etapa 1:** 1,500 metal, 150 EXP
- **Etapa 8:** 15,000 metal, 10,000 créditos, Blueprint Crucero

#### Sector Muerte (Difícil, 10 etapas)
- **Etapa 10:** 50,000 metal, 50,000 créditos, Blueprint Acorazado, 5,000 EXP

---

## 💎 SISTEMA DE RECOMPENSAS

### Recompensas Diarias (Login)

| Día | Recompensa |
|-----|------------|
| 1 | 1,000 metal |
| 2 | 500 plasma |
| 3 | 1,000 créditos |
| 4 | 2,000 metal + 1,000 plasma |
| 5 | Speedup 1h |
| 6 | 3,000 metal + 1,500 plasma + 2,000 créditos |
| 7 | Blueprint aleatorio + 5,000 créditos |

### Logros

| Logro | Requisito | Recompensa |
|-------|-----------|------------|
| **Primeros Pasos** | Construir 1 edificio | 500 créditos |
| **Revolución Industrial** | Extractor nivel 10 | 10,000 metal |
| **Guerrero Naciente** | Construir 1 nave | 5,000 metal + Módulo |
| **Conquistador** | 10 instancias | 20,000 créditos |
| **Científico** | 20 investigaciones | 30,000 créditos + 20,000 plasma |

---

## ⚖️ BALANCE ECONÓMICO

### Fórmulas Principales

```typescript
// Producción
production = base × level × (1 + researchBonus) × (1 + newPlayerBonus)

// Costo de mejora
cost = baseCost × (1.5 ^ currentLevel)

// Tiempo de construcción
time = baseTime × (1.2 ^ level) × (1 - logisticsBonus)

// Capacidad de almacenamiento
capacity = base + (warehouseLevel × warehouseBonus × numWarehouses)
```

### Penalizaciones

| Condición | Penalización |
|-----------|--------------|
| Sin energía (crítico) | -50% producción |
| Déficit energía | -25% producción |
| Almacén lleno | Pérdida de recursos excedentes |

### Multiplicadores de Costo

| Sistema | Multiplicador por Nivel |
|---------|-------------------------|
| Edificios | 1.5× |
| Investigaciones | 1.6× |
| Defensas | 1.8× |
| Naves | 2.0× (hulls especiales) |

---

## 📈 PROGRESIÓN DEL JUGADOR

### Fases del Juego

#### Early Game (Niveles 1-10)
- **Enfoque:** Construir extractores y almacenes
- **Recursos:** Acumular 50,000 metal/plasma
- **Investigaciones:** Logistics 5, Ballistics 5
- **Tiempo:** 1-3 días

#### Mid Game (Niveles 10-25)
- **Enfoque:** Astillero, naves, instancias
- **Recursos:** 500,000 metal/plasma
- **Investigaciones:** Ship Defense 10, Missile 10
- **Tiempo:** 1-2 semanas

#### Late Game (Niveles 25+)
- **Enfoque:** Acorazados, instancias difíciles, PvP
- **Recursos:** 10M+ metal/plasma
- **Investigaciones:** Todas las ciencias nivel 20
- **Tiempo:** 1-3 meses

---

## 🔧 USO DE DATOS EN CÓDIGO

### Ejemplo: Calcular Producción Total

```typescript
import { calculateProduction, ECONOMY_CONFIG } from '@/data/game';

// Calcular producción de metal
const metalPerHour = calculateProduction(
  'metal_extractor',
  10,           // Nivel 10
  0.25,         // +25% bonus de investigación
  true          // Bonus nuevo jugador
);
// Resultado: 20 × 10 × 1.25 × 1.5 = 375 metal/hora
```

### Ejemplo: Verificar Costo de Mejora

```typescript
import { calculateUpgradeCost } from '@/data/game';

const cost = calculateUpgradeCost(
  { metal: 60, plasma: 10, credits: 50, energy: 0 },
  5  // Mejorar de nivel 5 a 6
);
// Resultado: ~507 metal, ~85 plasma, ~422 créditos
```

### Ejemplo: Calcular Stats de Nave

```typescript
import { calculateShipStats, getHullById, getModuleById } from '@/data/game';

const stats = calculateShipStats('cruiser_t2', [
  'laser_t3',
  'armor_t3',
  'shield_t2'
]);
// Resultado: { attack: 110, defense: 210, structure: 1200, shield: 100 }
```

---

## 📊 ESTADÍSTICAS DEL SISTEMA

| Métrica | Valor |
|---------|-------|
| **Total de edificios** | 12 |
| **Total de niveles de edificios** | 240 |
| **Total de investigaciones** | 10 |
| **Total de niveles de investigación** | 200 |
| **Total de hulls** | 10 |
| **Total de módulos** | 30+ |
| **Total de defensas** | 7 |
| **Total de instancias** | 6+ |
| **Total de logros** | 5 |
| **Costo total de investigaciones** | ~1,200M recursos |

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [x] Datos de edificios completos (niveles 1-20)
- [x] Sistema de investigaciones con árbol de dependencias
- [x] Hulls de naves (Frigates, Cruisers, Battleships, Flagships)
- [x] Módulos de armas y defensas (5 tiers)
- [x] Defensas planetarias y orbitales
- [x] Sistema de instancias con recompensas
- [x] Logros y recompensas diarias
- [x] Fórmulas económicas de balance
- [x] Validaciones de economía
- [ ] Integración con base de datos
- [ ] Sistema de ticks de producción
- [ ] UI de visualización

---

## 📚 REFERENCIAS

- [Galaxy Online II Wiki](https://galaxyonlineii.fandom.com/)
- `src/data/game/buildings-complete.ts`
- `src/data/game/research-complete.ts`
- `src/data/game/ships-complete.ts`
- `src/data/game/defenses-complete.ts`
- `src/data/game/instances-complete.ts`
- `src/data/game/economy-system.ts`

---

**Última actualización:** 2026-05-24  
**Versión:** 1.0.0  
**Autor:** Sistema MADSJEEZ
