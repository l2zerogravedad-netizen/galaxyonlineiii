# GALAXY ONLINE 3 — DOCUMENTO MAESTRO DE DESARROLLO

> **La fuente unica de verdad para todo el equipo de desarrollo.**

---

| Campo | Valor |
|-------|-------|
| **Nombre del Proyecto** | Galaxy Online 3 (GO3) |
| **Codigo** | GO3 |
| **Version del Documento** | 1.0.0 |
| **Fecha de Creacion** | 2025-01-20 |
| **Ultima Actualizacion** | 2025-01-20 |
| **Estado** | EN DESARROLLO ACTIVO |
| **Autor** | Documentacion Tecnica Senior — Equipo GO3 |

---

## EQUIPO DE DESARROLLO

| Rol | Responsabilidad |
|-----|-----------------|
| **Game Designers** | Mecanicas, balance, fidelidad a GO2 |
| **Frontend Developers** | Next.js 16, React, UI/UX |
| **Backend Developers** | API Routes, Prisma, logica de negocio |
| **Database Engineers** | Schema PostgreSQL, migraciones, optimizacion |
| **DevOps** | Deploy Railway, CI/CD, monitoreo |
| **QA/Testers** | Pruebas de mecanicas, regression, discrepancias |

---

## CONTROL DE VERSIONES

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0.0 | 2025-01-20 | Doc Team | Documento maestro inicial completo |

---

## INDICE GENERAL

1. [Vision General](#1-vision-general)
2. [Sistema de Combate](#2-sistema-de-combate)
3. [Sistema de Naves](#3-sistema-de-naves)
4. [Sistema de Armas](#4-sistema-de-armas)
5. [Sistema de Armadura](#5-sistema-de-armadura)
6. [Sistema de Comandantes](#6-sistema-de-comandantes)
7. [Sistema de Recursos](#7-sistema-de-recursos)
8. [Sistema de Edificios](#8-sistema-de-edificios)
9. [Sistema de Planeta](#9-sistema-de-planeta)
10. [Sistema de Galaxia](#10-sistema-de-galaxia)
11. [Sistema de Flotas](#11-sistema-de-flotas)
12. [Sistema de Batalla](#12-sistema-de-batalla)
13. [Sistema de Misiones](#13-sistema-de-misiones)
14. [Sistema de Alianzas](#14-sistema-de-alianzas)
15. [Sistema Economico](#15-sistema-economico)
16. [Sistema de Tecnologia](#16-sistema-de-tecnologia)
17. [Documentacion de API](#17-documentacion-de-api)
18. [Esquema de Base de Datos](#18-esquema-de-base-de-datos)
19. [Despliegue](#19-despliegue)
20. [Discrepancias Conocidas](#20-discrepancias-conocidas)
21. [Roadmap](#21-roadmap)

---

# 1. VISION GENERAL

## 1.1 Que es Galaxy Online 3

Galaxy Online 3 (GO3) es una recreacion web fiel de Galaxy Online 2 (GO2), un juego MMO de estrategia espacial. El objetivo principal es ser **100% fiel a GO2** en todas sus mecanicas, sistemas y balance, implementado como una aplicacion web moderna.

GO2 fue un juego de navegador masivo de estrategia espacial donde los jugadores:
- Construyen y gestionan imperios espaciales
- Disenan naves con diferentes configuraciones de armas, armaduras y modulos
- Reclutan y entrenan comandantes con habilidades unicas
- Batallan en combates tacticos por turnos contra NPCs y otros jugadores
- Forman alianzas y compiten por el control galactico
- investigan tecnologias para mejorar sus capacidades

## 1.2 Objetivos del Proyecto

| # | Objetivo | Prioridad | Estado |
|---|----------|-----------|--------|
| O01 | Fidelidad 100% a las mecanicas de GO2 | CRITICA | En progreso |
| O02 | Sistema de combate con los 8 pasos exactos | CRITICA | Implementado |
| O03 | Sistema de naves con Effective Stack | CRITICA | Implementado |
| O04 | Sistema de comandantes con stats y expertise | CRITICA | Parcial |
| O05 | Sistema de recursos (Metal, Gas, Gold, He3) | CRITICA | Parcial (discrepancia Gas/Plasma) |
| O06 | Sistema de edificios y produccion | ALTA | Implementado |
| O07 | Sistema de investigacion tecnologica | ALTA | Implementado |
| O08 | Sistema de flotas y formaciones | ALTA | Implementado |
| O09 | Misiones PvE y sistema de batallas | ALTA | Implementado |
| O10 | Sistema de alianzas | MEDIA | Implementado |
| O11 | Chat global y comunicacion | MEDIA | Implementado |
| O12 | Leaderboard y ranking | MEDIA | Pendiente |
| O13 | PvP completo | MEDIA | Pendiente |
| O14 | Galaxia con NPCs y exploracion | MEDIA | Pendiente |

## 1.3 Stack Tecnologico

### 1.3.1 Frontend

| Capa | Tecnologia | Version | Proposito |
|------|-----------|---------|-----------|
| Framework | Next.js | 16 | Framework full-stack React |
| UI Library | React | 19 | Componentes interactivos |
| Lenguaje | TypeScript | 5.x | Tipado estatico |
| Estilos | Tailwind CSS | 3.x | Utility-first CSS |
| Estado | React Hooks | — | Estado local y global |

### 1.3.2 Backend

| Capa | Tecnologia | Version | Proposito |
|------|-----------|---------|-----------|
| Framework | Fastify | 5.x | Servidor HTTP rapido |
| ORM | Prisma | 6.x | Acceso a base de datos |
| DB | PostgreSQL | 16 | Base de datos persistente |
| Auth | JWT | — | Autenticacion sin estado |
| Hash | bcrypt | — | Hash de contrasenas |
| Validacion | zod | — | Validacion de schemas |

### 1.3.3 Infraestructura

| Capa | Tecnologia | Proposito |
|------|-----------|-----------|
| Hosting | Railway | Plataforma de deploy |
| Builder | Railpack | Builder nativo de Railway |
| DBaaS | Railway PostgreSQL | Base de datos administrada |
| Monitoreo | Railway Logs | Logs centralizados |

### 1.3.4 Arquitectura de Carpetas

```
/mnt/agents/go2-project/
├── apps/
│   ├── api/                  # Backend Fastify
│   │   ├── src/
│   │   │   ├── index.ts      # Entry point, registro de rutas
│   │   │   ├── routes/       # Rutas de la API
│   │   │   │   ├── auth.ts   # Autenticacion (register/login)
│   │   │   │   ├── empire.ts # Datos del imperio
│   │   │   │   ├── planet.ts # Edificios y construccion
│   │   │   │   ├── fleets.ts # Flotas y formaciones
│   │   │   │   ├── missions.ts # Misiones PvE
│   │   │   │   ├── shipyard.ts # Construccion de naves
│   │   │   │   ├── research.ts # Investigacion
│   │   │   │   └── game.ts   # Dashboard y estado del juego
│   │   │   └── lib/
│   │   │       ├── gameState.ts      # Sincronizacion de estado
│   │   │       ├── buildingLogic.ts  # Logica de construccion
│   │   │       └── empireEconomy.ts  # Calculo de produccion
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                  # Frontend Next.js (pendiente de desarrollo)
├── packages/
│   ├── database/             # Schema Prisma + cliente
│   │   └── prisma/
│   │       └── schema.prisma # Definicion completa de modelos
│   └── shared/               # Codigo compartido
│       └── src/
│           ├── game.ts               # Tipos y DTOs compartidos
│           ├── resources.ts          # Tipos de recursos y helpers
│           ├── resourceAccrual.ts   # Acumulacion de recursos
│           ├── production.ts        # Produccion por edificio
│           ├── economyConfig.ts     # Configuracion economica
│           ├── buildingCosts.ts     # Costos de construccion
│           ├── terrestrialCatalog.ts # Catalogo de edificios
│           ├── planetLayout.ts      # Layout del planeta
│           ├── go2/
│           │   └── constructionQueue.ts # Cola de construccion
│           └── legacyBuildingTypes.ts # Normalizacion de tipos
├── scripts/
├── package.json              # Root workspace
├── railway.toml              # Configuracion de deploy
└── .env.example              # Variables de entorno
```

## 1.4 Glosario de Terminos

| Termino | Definicion |
|---------|-----------|
| **Empire** | El imperio del jugador, contiene todos sus recursos, naves y planetas |
| **He3** | Helio-3, recurso de combustible para combate |
| **Stack** | Agrupacion de naves identicas que actuan como una unidad |
| **Effective Stack** | Stack ajustado por tipo de nave y estrellas del comandante |
| **PPC** | Powered Pulse Cannon, sistema de defensa que intercepta misiles |
| **EOS** | Electronic Optical Shield, escudo principal |
| **Scatter** | Dano de dispersion que ignora defensas |
| **Pierce** | Capacidad de penetracion de escudos |
| **RNG** | Random Number Generator, generador de numeros aleatorios |
| **CD** | Cooldown, tiempo de recarga entre ataques |
| **PvE** | Player vs Environment, jugador contra NPC |
| **PvP** | Player vs Player, jugador contra jugador |

---

# 2. SISTEMA DE COMBATE

## 2.1 Vision General del Sistema de Combate

El sistema de combate de GO3 es el nucleo del juego y debe ser **100% fiel a GO2**. Implementa un sistema de resolucion de batallas por turnos con **8 pasos exactos** de resolucion de dano. Cada batalla consiste en multiples rondas donde las naves atacan segun su stat de Speed.

### 2.1.1 Caracteristicas Clave

- **8 pasos de resolucion de dano** (detallados en 2.2)
- **Orden de ataque por Speed individual** del stack
- **20 rondas fijas** por batalla
- **Escudos regeneran 100% entre rondas**
- **He3 como recurso real de combate**
- **RNG determinista con seed** para reproducibilidad
- **Effective Stack funcional** que limita dano por stack
- **Damage Negation implementado**
- **Scatter que ignora escudos** (ventaja clave)
- **EOS con 30% de absorcion doble**
- **4 tipos de armadura** con matriz de debilidades
- **Intercept con 55% por PPC por misil**
- **100+ comandantes con skills**
- **Successive Strikes** (ataques consecutivos)

### 2.1.2 Flujo de una Batalla

```
+----------------------------------+
|        INICIO DE BATALLA         |
|  - Seleccionar flota atacante    |
|  - Seleccionar flota defensora   |
|  - Inicializar RNG con seed      |
|  - Resetear rondas a 0           |
+----------------------------------+
              |
              v
+----------------------------------+
|        RONDA N (1-20)            |
|  1. Calcular orden por Speed     |
|  2. Para cada stack en orden:    |
|     a. Verificar cooldown        |
|     b. Verificar He3 disponible  |
|     c. Ejecutar 8 pasos de dano  |
|  3. Verificar naves destruidas   |
|  4. Si flota destruida -> FIN    |
+----------------------------------+
              |
              v
+----------------------------------+
|     FIN DE RONDA                 |
|  - Regenerar escudos al 100%     |
|  - Incrementar contador de ronda |
|  - Si ronda < 20 -> siguiente    |
|  - Si ronda >= 20 -> FIN         |
+----------------------------------+
              |
              v
+----------------------------------+
|        FIN DE BATALLA            |
|  - Determinar ganador            |
|  - Calcular perdidas             |
|  - Otorgar recompensas           |
+----------------------------------+
```

## 2.2 Los 8 Pasos de Resolucion de Dano

Cada vez que un stack de naves ataca, se siguen **estrictamente estos 8 pasos** en orden:

### PASO 1 — Attacker Fires (Calcular Hits)

**Formula:**
```
hits = attack_modules_per_ship × effective_stack × hit_chance
```

**Factores de Hit Chance:**

| Factor | Efecto | Fuente |
|--------|--------|--------|
| Agility (defender) | **-4% hit por punto** | Nave defensora + modulos del defensor |
| Steering (attacker) | **+4% hit por punto** | Arma del atacante |
| Dodge (defender commander) | **-1% hit por 12 puntos** | Comandante defensor |
| Accuracy (attacker commander) | **+1% hit por punto** | Comandante atacante |

**Hit Chance Base:**
```
hit_chance = base_hit_chance
             + (steering × 0.04)
             - (agility × 0.04)
             - (dodge / 12 × 0.01)
             + (accuracy × 0.01)
```

**NOTA CRITICA:** El hit chance PUEDE superar 100%. El juego no lo muestra en la UI, pero internamente afecta los calculos. Un hit chance de 150% significa 1.5 hits por modulo en promedio.

**Referencia de implementacion:** `BattleEngine.ts` — funcion `calculateHits()`

### PASO 2 — Interceptors Fire (Interceptacion de PPC)

PPC (Powered Pulse Cannon), Panis, y Ship-based Weapons pueden interceptar misiles entrantes.

**Reglas de Interceptacion:**

| Regla | Valor | Descripcion |
|-------|-------|-------------|
| Chance base por PPC | **55%** | Cada PPC tiene 55% de destruir un misil |
| Un PPC = un misil | **1:1** | Un PPC intercepta exactamente UN misil |
| Ship-based intercept | **20%** con tecnologia | Las armas ship-based pueden interceptar con mejora de tech |
| Intercept chance defensiva | Variable | Los modulos de defensa tienen chance de intercept variable |

**Formula:**
```
intercepted_hits = SUM(por cada PPC activo):
    si RNG < (0.55 × defense_intercept_bonus × ship_intercept_bonus):
        1 misil interceptado
    sino:
        0

final_hits = total_hits - intercepted_hits (minimo 0)
```

**Reduccion por modulos de ataque:** El "intercept chance" del modulo atacante REDUCE el numero de interceptaciones posibles. Si el modulo atacante tiene alto intercept resistance, menos PPC pueden intentar interceptarlo.

**NOTA:** El dodge del comandante defensor y el stat de defense de la nave se cree que impactan (no confirmado por la wiki).

**Referencia de implementacion:** `BattleEngine.ts` — funcion `attemptInterception()`

### PASO 3 — Calculate Damage

Se calcula el dano base por cada hit que no fue interceptado.

**Formula:**
```
damage_per_hit = random(weapon_min_damage, weapon_max_damage)
                 × weapon_expertise_bonus
                 × ship_expertise_bonus_attacker
                 × tech_bonus
                 × commander_skill_bonus
                 × double_hit_multiplier
                 × critical_hit_multiplier
```

**Multiplicadores:**

| Evento | Multiplicador | Condicion |
|--------|--------------|-----------|
| Hit normal | 1.0x | Base |
| Double Hit | 2.0x | Probabilidad basada en tech + comandante |
| Critical Hit | Variable (1.5x-3.0x) | Basado en stat Electron del comandante |

**Aplicacion de tipos de armadura vs tipo de dano:**
```
final_damage = damage_per_hit × armor_type_multiplier
```

| Armor Type | Kinetic | Heat | Magnetic | Explosive |
|-----------|---------|------|----------|-----------|
| Regen | **100%** (normal) | **+25%** (weak) | normal | normal |
| Neutralizing | **+25%** (weak) | **100%** (normal) | normal | normal |
| Nano | normal | normal | **+25%** (weak) | **100%** (normal) |
| Chrome | normal | normal | **100%** (normal) | **+25%** (weak) |

**NOTA:** "Weak" significa +25% de dano recibido. "Strong" implica -25% de dano pero la tabla completa requiere verificacion.

**Referencia de implementacion:** `BattleEngine.ts` — funcion `calculateDamage()`

### PASO 4 — Damage Negation

El dano es negado por TODOS los sistemas de defensa NO-EOS:

**Sistemas de Damage Negation:**

| Sistema | Efecto | Notas |
|---------|--------|-------|
| Heat Diffusion Shield | Reduce dano termico | Reduce scatter y piercing |
| Three damage-specific shields | Reducen dano de tipo especifico | Uno por tipo: Kinetic, Heat, Magnetic |
| Daedalus Control System | Reduccion general de dano | Solo afecta hull (no escudos) — VERIFICAR |
| Energy Armor | Reduccion de dano energetico | Solo afecta hull (no escudos) — VERIFICAR |

**Formula:**
```
negated_damage = base_damage × (1 - total_negation_percentage)
                 donde total_negation_percentage = SUM(negacion de todos los sistemas activos)
```

**Efecto critico:** La negacion REDUCE los efectos de scatter y piercing. Esto es fundamental para el balance defensivo.

**Referencia de implementacion:** `BattleEngine.ts` — funcion `applyDamageNegation()`

### PASO 5 — Shield Penetration (Pierce)

Las armas ballisticas y directionales (y algunos comandantes) pueden penetrar escudos.

**Armas que pueden penetrar:**
- Ballistic: probabilidad base de pierce
- Directional: probabilidad base de pierce
- Algunos comandantes especiales: habilidad de pierce garantizado

**Formula:**
```
pierce_damage = total_damage × pierce_percentage
non_pierce_damage = total_damage - pierce_damage
```

**NOTA:** No esta claro si el pierce ocurre ANTES, DESPUES, o EN CONJUNTO con Damage Negation. La implementacion actual aplica pierce despues de negation.

**Referencia de implementacion:** `BattleEngine.ts` — funcion `applyShieldPenetration()`

### PASO 6 — Deal Damage to Shields (EOS)

El dano que NO es pierce va a los escudos EOS.

**Electronic Optical Shield (EOS):**

| Propiedad | Valor |
|-----------|-------|
| Absorcion base | 100% del dano recibido |
| Chance de absorcion doble | **30%** |
| Efecto de absorcion doble | El dano se DUPLICA antes de aplicar al escudo |
| Regeneracion entre rondas | **100%** |

**Formula:**
```
para cada hit:
    si RNG < 0.30:
        shield_damage = damage × 2   (absorcion doble)
    sino:
        shield_damage = damage       (absorcion normal)
    
    eos_remaining = eos_remaining - shield_damage
    si eos_remaining <= 0:
        overflow_damage = ABS(eos_remaining)
        eos_remaining = 0
        overflow_damage va a hull (Paso 7)
```

**DISCREPANCIA D08:** La wiki menciona que EOS tambien reduce scatter en parches recientes. Esto NO esta implementado actualmente.

**Referencia de implementacion:** `BattleEngine.ts` — funcion `damageShields()`

### PASO 7 — Assign Damage to Hull

El dano restante despues de escudos va a la estructura de las naves.

**Formula:**
```
ships_destroyed = FLOOR( damage / (ship_structure × stability_percentage) )
```

| Factor | Efecto |
|--------|--------|
| ship_structure | HP base de la nave blueprint |
| stability_percentage | Reduccion de daño al hull por mods/habilidades |
| Energy Armor | Se cree que SOLO afecta hull damage (no escudos) |
| Daedalus System | Se cree que SOLO afecta hull damage (no escudos) |

**NOTA:** La aplicacion de Energy Armor y Daedalus SOLO a hull (no a escudos) esta marcada como "unconfirmed" en la wiki.

**DISCREPANCIA D07:** Energy Armor y Daedalus actualmente aplican a TODO el dano, no solo hull. Deben corregirse.

**Referencia de implementacion:** `BattleEngine.ts` — funcion `damageHull()`

### PASO 8 — Calculate Scatter Damage

El scatter es un tipo especial de dano que **NO puede ser absorbido ni mitigado por defensas**. Es la ventaja clave de ciertos tipos de arma.

**Factores de Scatter:**

| Factor | Efecto |
|--------|--------|
| Tipo de arma | Cada tipo tiene scatter base diferente |
| Tecnologia | Techs especificas aumentan scatter |
| Comandante Sandora | Bonus especial de scatter |

**Reglas Criticas de Scatter:**

1. **Scatter NO puede ser absorbido por escudos** (ignora EOS completamente)
2. **Scatter reduce escudos y luego hull** segun sea necesario
3. **Tiamat (chrome armor) NO toma scatter aumentado de misiles**
4. **Con Exaltation missile tech: 54% scatter = 432% dano bonus imposible de prevenir**

**Formula:**
```
scatter_damage = base_damage × scatter_percentage

# Scatter aplica a escudos PRIMERO
si escudos > 0:
    escudos -= scatter_damage
    si escudos < 0:
        hull_damage += ABS(escudos)
        escudos = 0
sino:
    hull_damage += scatter_damage

# Damage Mitigation (si se activa) reduce scatter
si damage_mitigation_triggered:
    scatter_damage *= (1 - mitigation_percentage)
```

**Tabla de Scatter por Tipo de Arma:**

| Tipo de Arma | Scatter Base | Notas |
|-------------|-------------|-------|
| Ballistic | Moderado | Bajo dano pero scatter consistente |
| Directional | Bajo | Se compensa con pierce |
| Missile | Alto | Con Exaltation tech: 54% = 432% bonus |
| Ship-Based | Variable | Depende del sub-tipo |

**DISCREPANCIA D06:** Tiamat chrome armor no toma extra scatter de misiles. Esto NO esta diferenciado actualmente.

**Referencia de implementacion:** `BattleEngine.ts` — funcion `applyScatterDamage()`

## 2.3 Orden de Combate por Speed

### 2.3.1 Calculo del Orden

Todos los stacks (tanto atacante como defensor) se ordenan por su stat de **Speed** de mayor a menor.

```
orden = stacks_ataque + stacks_defensa
orden.sort((a, b) => b.total_speed - a.total_speed)

para cada stack en orden:
    si stack.cooldown == 0:
        stack.ataca()
        stack.cooldown = weapon_cooldown
    sino:
        stack.cooldown--
```

### 2.3.2 Successive Strikes (Ataques Consecutivos)

Un stack con Speed significativamente mayor que el siguiente puede atacar multiples veces consecutivas.

**Formula:**
```
speed_diff = stack_speed - next_stack_speed
si speed_diff > SUCCESSIVE_STRIKE_THRESHOLD:
    additional_attacks = FLOOR(speed_diff / THRESHOLD)
```

**Referencia de implementacion:** `BattleEngine.ts` — funcion `resolveCombatOrder()`

## 2.4 Rondas de Batalla

### 2.4.1 Formula de Rondas

```
total_rounds = 20 + (1 por cada flota adicional) + (1 por cada 10 edificios)
max_rounds = 99
```

### 2.4.2 Regeneracion de Escudos

Al final de cada ronda, TODOS los escudos EOS se regeneran al **100%**.

```
# Fin de ronda
para cada stack:
    stack.shields = stack.max_shields
```

**Referencia de implementacion:** `BattleEngine.ts` — funcion `endRound()`

## 2.5 He3 — Combustible de Combate

El He3 es un recurso real consumido durante el combate.

```
# Por cada ataque:
he3_consumed = modules_fired × he3_per_module

# Si He3 insuficiente:
modules_fired = min(modules_disponibles, He3_disponible / he3_per_module)
```

**Referencia de implementacion:** `BattleEngine.ts` — funcion `consumeHe3()`

## 2.6 RNG Determinista

El sistema utiliza un RNG con seed para garantizar reproducibilidad.

```
# Inicializacion:
rng = SeededRandom(seed)

# Uso:
hit_chance = rng.random()      # 0.0 - 1.0
critical = rng.random()
eos_double = rng.random()
intercept = rng.random()
```

Esto permite:
- Reproducir batallas exactas
- Debugging de resultados
- Verificacion de calculos del lado del cliente

**Referencia de implementacion:** `BattleEngine.ts` — clase `SeededRandom`

---

# 3. SISTEMA DE NAVES

## 3.1 Tipos de Nave

GO2 tiene 3 tipos principales de naves, cada uno con diferentes caracteristicas de stack:

### 3.1.1 Tipos y Stacks Base

| Tipo | Stack Base | Rol | Caracteristicas |
|------|-----------|-----|-----------------|
| **Frigate** | 1,100 | Ligero | Veloz, barato, poco HP |
| **Cruiser** | 1,000 | Medio | Balanceado |
| **Battleship** | 900 | Pesado | Lento, caro, mucho HP |

### 3.1.2 Effective Stack

El Effective Stack determina cuantas naves pueden participar efectivamente en un stack.

**Formula:**
```
effective_stack = base_stack + bonus_por_estrellas_del_comandante

# Bonus por estrellas (ejemplo):
# 1 estrella: +0
# 2 estrellas: +50
# 3 estrellas: +100
# 4 estrellas: +200
# 5 estrellas: +350
# 6 estrellas: +500
```

El effective stack limita:
- El numero de modulos que pueden disparar
- El dano maximo por ataque
- La capacidad defensiva

**Referencia de implementacion:** `BattleEngine.ts` — funcion `calculateEffectiveStack()`

## 3.2 Diseno de Naves (Ship Design)

### 3.2.1 Slots de Nave

Cada nave tiene slots para:
- **Weapon Modules** — Armas de ataque
- **Defense Modules** — Escudos y armaduras
- **Structure Modules** — Mejoras de estructura/HP

### 3.2.2 Blueprints (Planos)

Los blueprints definen las estadisticas base de cada tipo de nave.

**Campos de Blueprint en DB:**

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Identificador unico |
| name | String | Nombre del plano |
| key | String (unique) | Clave interna |
| type | String | Tipo de nave |
| category | String | COMBAT, CIVIL, TRANSPORT |
| attack | Int | Ataque base |
| hp | Int | Estructura/HP base |
| defense | Int | Defensa base |
| speed | Int | Velocidad base |
| cargoCapacity | Int | Capacidad de carga |
| ppcCount | Int | Numero de PPC integrados |
| armorType | String | Tipo de armadura |
| weaponSlots | Json | Configuracion de slots de arma |
| moduleSlots | Json | Configuracion de slots de modulo |
| he3Consumption | Int | Consumo de He3 por modulo |

### 3.2.3 Blueprints Iniciales

Al registrarse, el jugador recibe **3 Blueprints** basicos.

## 3.3 Construccion de Naves

### 3.3.1 Proceso de Construccion

```
1. Jugador selecciona blueprint
2. Sistema verifica requisitos:
   - Astillero (shipyard) construido
   - Tecnologia requerida investigada (si aplica)
   - Recursos suficientes (metal, plasma, credits)
   - Cola de construccion disponible
3. Se deducen los recursos
4. Se crea entrada en ShipConstruction
5. Al finalizar el tiempo, las naves se anaden al inventario
```

### 3.3.2 Cola de Construccion

- **Limite:** 1 construccion activa a la vez (MVP)
- La construccion se completa automaticamente al pasar el tiempo

### 3.3.3 Reduccion de Tiempo por Tecnologia

```
effective_build_time = base_time × (1 - automation_level × 0.10)
```

Industrial Automation reduce 10% por nivel.

**Referencia de implementacion:** `apps/api/src/routes/shipyard.ts` — endpoints `/build` y `/sync`

## 3.4 Inventario de Naves

### 3.4.1 Modelo Ship

```prisma
model Ship {
  id          String   @id @default(uuid())
  empireId    String   @map("empire_id")
  blueprintId String   @map("blueprint_id")
  quantity    Int      @default(0)
  status      String   @default("AVAILABLE") // AVAILABLE | ASSIGNED
  fleetId     String?  @map("fleet_id")
  createdAt   DateTime @default(now()) @map("created_at")
  
  empire      Empire    @relation(fields: [empireId], references: [id])
  blueprint   Blueprint @relation(fields: [blueprintId], references: [id])
  fleetFormations FleetFormation[]
}
```

### 3.4.2 Estados de Nave

| Estado | Descripcion |
|--------|-------------|
| AVAILABLE | En inventario, lista para asignar |
| ASSIGNED | Asignada a una flota |

### 3.4.3 Seed Inicial

Al registrarse, el jugador recibe:
- **10 Frigate MK-I** — Naves basicas de combate

**Referencia de implementacion:** `apps/api/src/routes/auth.ts` — funcion de registro

---

# 4. SISTEMA DE ARMAS

## 4.1 Tipos de Armas

GO2 tiene **4 tipos principales de armas**, cada uno con caracteristicas unicas:

### 4.1.1 Tabla Maestra de Armas

| Arma | Rango | Cooldown | He3 | Caracteristicas |
|------|-------|----------|-----|-----------------|
| **Ballistic** | 1-2 | **0** | Mas bajo | Dano bajo, poco He3, scatter damage |
| **Directional** | 1-5 | **1** | Medio | Dano medio, **penetra escudos** |
| **Missile** | 4-8 | **2** | Medio | Dano alto, **interceptable** |
| **Ship-Based** | 6-10 | **4** | Mas alto | Dano masivo, mayor alcance |

### 4.1.2 Detalles por Tipo

#### Ballistic

| Propiedad | Valor |
|-----------|-------|
| Alcance minimo | 1 |
| Alcance maximo | 2 |
| Cooldown | 0 rondas (ataque cada ronda) |
| Consumo de He3 | Mas bajo de todos |
| Dano | Bajo |
| Scatter | Si (moderado) |
| Pierce | Probabilidad base |
| Estrategia | Economico, spam de ataques |

#### Directional

| Propiedad | Valor |
|-----------|-------|
| Alcance minimo | 1 |
| Alcance maximo | 5 |
| Cooldown | 1 ronda |
| Consumo de He3 | Medio |
| Dano | Medio |
| Scatter | Bajo |
| Pierce | **Si** (caracteristica principal) |
| Estrategia | Penetrar escudos, counter defensivo |

#### Missile

| Propiedad | Valor |
|-----------|-------|
| Alcance minimo | 4 |
| Alcance maximo | 8 |
| Cooldown | 2 rondas |
| Consumo de He3 | Medio |
| Dano | Alto |
| Scatter | Alto (especialmente con Exaltation) |
| Interceptable | **Si** (counter por PPC) |
| Estrategia | Dano alto a distancia, riesgo de intercept |

#### Ship-Based

| Propiedad | Valor |
|-----------|-------|
| Alcance minimo | 6 |
| Alcance maximo | 10 |
| Cooldown | **4 rondas** |
| Consumo de He3 | Mas alto |
| Dano | Masivo |
| Scatter | Variable |
| Sub-tipos | Kinetic, Heat, Magnetic, Explosive |
| Estrategia | Sniper, dano devastador cada 4 rondas |

**DISCREPANCIA D04:** Ship-Based cooldown actual es 3. Debe corregirse a 4.

## 4.2 Sub-tipos de Dano (Ship-Based)

Las armas Ship-Based pueden ser de **4 tipos de dano**:

| Tipo de Dano | Descripcion | Color |
|-------------|-------------|-------|
| **Kinetic** | Dano por impacto fisico | Gris |
| **Heat** | Dano termico | Rojo/Naranja |
| **Magnetic** | Dano electromagnetico | Azul |
| **Explosive** | Dano por explosion | Naranja |

## 4.3 Movimiento Recomendado por Tipo de Arma

El movimiento de las naves afecta el combate. Se recomienda:

| Tipo de Arma | Movimiento Minimo Recomendado |
|-------------|------------------------------|
| Ballistic | **4** |
| Directional | **4** |
| Missile | **5** |
| Ship-Based | **6** |

**DISCREPANCIA D05:** El sistema de movimiento de naves no esta implementado actualmente.

## 4.4 Slots de Armas

Las naves tienen slots de arma configurados en el blueprint:

```json
{
  "weaponSlots": {
    "ballistic": 0,
    "directional": 0,
    "missile": 2,
    "ship_based": 1
  }
}
```

Cada slot puede equiparse con un modulo de arma del tipo correspondiente.

## 4.5 He3 por Arma

### 4.5.1 Consumo de He3

| Tipo de Arma | He3 por Disparo | Relacion Dano/He3 |
|-------------|-----------------|-------------------|
| Ballistic | ~5-15 | Muy eficiente |
| Directional | ~20-40 | Eficiente |
| Missile | ~40-80 | Moderada |
| Ship-Based | ~100-200 | Menos eficiente |

### 4.5.2 Gestion de He3 en Combate

```
si He3_disponible < He3_requerido:
    modulos_activos = He3_disponible / he3_por_modulo
    dano = dano_base × modulos_activos / modulos_totales
```

**Referencia de implementacion:** `BattleEngine.ts` — funcion `consumeHe3()`

---

# 5. SISTEMA DE ARMADURA

## 5.1 Tipos de Armadura

GO2 tiene **4 tipos de armadura**, cada uno con fortalezas y debilidades contra tipos de dano especificos.

### 5.1.1 Tabla de Tipos de Armadura

| Armadura | Fuerte vs | Debil vs | Caracteristicas |
|----------|-----------|----------|-----------------|
| **Regen** | Kinetic | Heat | Regeneracion pasiva de HP |
| **Neutralizing** | Heat | Kinetic | Reduce dano termico |
| **Nano** | Explosive | Magnetic | Alta resistencia estructural |
| **Chrome** | Magnetic | Explosive | Refleja dano magnetico |

### 5.1.2 Matriz de Dano Completa

```
                  KINETIC    HEAT      MAGNETIC   EXPLOSIVE
REGEN             STRONG     WEAK      NEUTRAL    NEUTRAL
NEUTRALIZING      WEAK       STRONG    NEUTRAL    NEUTRAL
NANO              NEUTRAL    NEUTRAL   WEAK       STRONG
CHROME            NEUTRAL    NEUTRAL   STRONG     WEAK
```

### 5.1.3 Multiplicadores Exactos

| Armadura \ Dano | Kinetic | Heat | Magnetic | Explosive |
|-----------------|---------|------|----------|-----------|
| Regen | 0.75x | 1.25x | 1.0x | 1.0x |
| Neutralizing | 1.25x | 0.75x | 1.0x | 1.0x |
| Nano | 1.0x | 1.0x | 1.25x | 0.75x |
| Chrome | 1.0x | 1.0x | 0.75x | 1.25x |

**Nota:** Los valores exactos de "STRONG" (0.75x) y "WEAK" (1.25x) son los usados en la implementacion. Algunas fuentes de la wiki sugieren diferentes valores.

## 5.2 Reglas Especiales de Armadura

### 5.2.1 Tiamat (Chrome Armor) y Scatter

**Regla especial:** Las naves con armadura Chrome (como Tiamat) **NO toman scatter aumentado de misiles**.

Esto significa que el scatter de misiles se aplica normalmente (no hay bonus negativo), pero tampoco hay penalty. En otras armaduras, el scatter de misiles puede tener efectos multiplicadores.

**DISCREPANCIA D06:** Tiamat chrome armor no toma extra scatter de misiles. Esto NO esta diferenciado en la implementacion actual.

## 5.3 Aplicacion en Blueprints

El tipo de armadura se define en el campo `armorType` del blueprint:

```prisma
armorType    String   @default("regen") @map("armor_type")
// Valores validos: "regen" | "neutralizing" | "nano" | "chrome"
```

**Referencia de implementacion:**
- `packages/database/prisma/schema.prisma` — modelo Blueprint
- `BattleEngine.ts` — funcion `getArmorMultiplier()`



---

# 6. SISTEMA DE COMANDANTES

## 6.1 Vision General

Los comandantes son unidades especiales que lideran flotas y proporcionan bonus estadisticos significativos. Cada comandante tiene 4 stats base, rareza, nivel, estrellas, y habilidades especiales.

## 6.2 Stats Base de Comandantes

Cada comandante tiene **4 stats base** que afectan el combate:

### 6.2.1 Descripcion de Stats

| Stat | Efecto | Formula |
|------|--------|---------|
| **Accuracy** | Afecta hit chance | +1% hit por punto de Accuracy |
| **Speed** | Afecta orden de combate + successive strikes | Mayor speed = ataca primero + mas ataques |
| **Dodge** | Reduce hit rate del oponente | 12 dodge = -1% hit del enemigo |
| **Electron** | Aumenta Critical Hit Rate + Critical Damage | Afecta chance y multiplicador de critico |

### 6.2.2 Rango de Stats

Los stats van de 1 a un maximo que depende de la rareza y las estrellas.

| Rango | Minimo | Maximo aproximado |
|-------|--------|-------------------|
| Base (nivel 1) | 1-10 | ~10-50 |
| Con nivel | Escalado por nivel | ~100-500 |
| Con gemas | +bonus por gema | +50-200 por gema |

## 6.3 Rareza de Comandantes

| Rareza | Color | Stats Base | Habilidad |
|--------|-------|-----------|-----------|
| **Common** | Blanco | Bajos | Ninguna o basica |
| **Super** | Verde | Medios | Basica |
| **Legendary** | Azul | Altos | Avanzada |
| **Divine** | Dorado/Purpura | Muy altos | Unica y poderosa |

## 6.4 Nivel y Estrellas

### 6.4.1 Sistema de Nivel

Los comandantes ganan experiencia al combatir. Suben de nivel al alcanzar ciertos umbrales.

```
xp_requerido(nivel) = nivel × 1000 (formula simplificada)
```

### 6.4.2 Sistema de Estrellas

Las estrellas se incrementan fusionando comandantes duplicados.

```
estrellas: 1 -> 2 -> 3 -> 4 -> 5 -> 6 (maximo)
```

**Efecto de estrellas en Effective Stack:**
```
bonus_stack = f(estrellas)  // Funcion creciente no lineal
```

| Estrellas | Bonus de Stack Aproximado |
|-----------|---------------------------|
| 1 | +0 |
| 2 | +50 |
| 3 | +100 |
| 4 | +200 |
| 5 | +350 |
| 6 | +500 |

## 6.5 Weapon Expertise

La Weapon Expertise afecta el **dano infligido** con tipos de armas especificos.

### 6.5.1 Tabla de Weapon Expertise

| Grado | Bonus de Dano |
|-------|--------------|
| **S** | **+30%** dano |
| **A** | **+10%** dano |
| **B** | **0%** dano (neutral) |
| **C** | **-10%** dano |
| **D** | **-30%** dano |

### 6.5.2 Aplicacion

Aplica a los tipos de arma:
- Ballistic
- Directional
- Missile
- Ship-Based
- Planet (dano a instalaciones planetarias)

### 6.5.3 Formula

```
dano_final = dano_base × (1 + weapon_expertise_bonus)

# Ejemplos:
# Expertise S en Missile: dano × 1.30
# Expertise D en Ballistic: dano × 0.70
# Expertise B: dano × 1.00 (sin cambio)
```

**DISCREPANCIA D02:** Weapon Expertise NO esta implementado en el BattleEngine. Debe anadirse.

## 6.6 Ship Expertise

La Ship Expertise afecta tanto el **dano recibido** como el **dano infligido** con tipos de nave.

### 6.6.1 Tabla de Ship Expertise

| Grado | Dano Recibido | Dano Infligido |
|-------|--------------|----------------|
| **S** | **-10%** recibido | **+10%** infligido |
| **A** | **-10%** recibido | **+5%** infligido |
| **B** | **0%** | **0%** |
| **C** | **+10%** recibido | **-5%** infligido |
| **D** | **+10%** recibido | **-10%** infligido |

### 6.6.2 Aplicacion

Aplica a los tipos de nave:
- Frigate
- Cruiser
- Battleship

### 6.6.3 Formula

```
dano_infligido = dano_base × (1 + ship_expertise_dealt_bonus)
dano_recibido  = dano_enemigo × (1 + ship_expertise_received_bonus)

# Ejemplo Ship Expertise S con Cruiser:
# Dano infligido: × 1.10 (+10%)
# Dano recibido: × 0.90 (-10%)
```

**DISCREPANCIA D03:** Ship Expertise NO esta implementado en el BattleEngine. Debe anadirse.

## 6.7 Gemas (Gem Slots)

Los comandantes tienen slots para gemas que mejoran sus stats.

### 6.7.1 Tipos de Gemas

| Tipo | Color | Stat Mejorado |
|------|-------|--------------|
| Red | Roja | Attack/Damage |
| Blue | Azul | Defense/Shields |
| Green | Verde | Speed/Agility |
| Diamond | Blanca/Transparente | Stats generales |

### 6.7.2 Slots de Gemas en DB

```prisma
gemSlots    Json     @default("{\"red\":null,\"blue\":null,\"green\":null,\"diamond\":null}")
```

## 6.8 Hospital

Cuando un comandante lidera una flota que es derrotada, el comandante puede quedar **injured** (herido).

### 6.8.1 Estados de Comandante

| Estado | Descripcion |
|--------|-------------|
| **AVAILABLE** | Listo para asignar |
| **ASSIGNED** | Asignado a una flota |
| **INJURED** | Herido, requiere recuperacion |
| **HOSPITAL** | En recuperacion en el hospital |

### 6.8.2 Recuperacion

```
tiempo_recuperacion = base_tiempo × (1 - hospital_level_bonus)
```

## 6.9 Modelo de Datos

### 6.9.1 Schema Prisma — Commander

```prisma
model Commander {
  id          String   @id @default(uuid())
  empireId    String   @map("empire_id")
  name        String
  rarity      String   // common | super | legendary | divine
  level       Int      @default(1)
  stars       Int      @default(1)
  accuracy    Int      @default(5)
  speed       Int      @default(5)
  dodge       Int      @default(5)
  electron    Int      @default(5)
  skill       String   @default("")
  status      String   @default("AVAILABLE") // AVAILABLE | INJURED | HOSPITAL
  gemSlots    Json     @default("{\"red\":null,\"blue\":null,\"green\":null,\"diamond\":null}")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  empire      Empire   @relation(fields: [empireId], references: [id])

  @@map("commanders")
}
```

### 6.9.2 Campos del Modelo

| Campo | Tipo | Default | Descripcion |
|-------|------|---------|-------------|
| id | String (UUID) | auto | Identificador unico |
| empireId | String | — | FK al Empire |
| name | String | — | Nombre del comandante |
| rarity | String | — | common, super, legendary, divine |
| level | Int | 1 | Nivel actual (1-100) |
| stars | Int | 1 | Estrellas (1-6) |
| accuracy | Int | 5 | Stat de precision |
| speed | Int | 5 | Stat de velocidad |
| dodge | Int | 5 | Stat de esquiva |
| electron | Int | 5 | Stat de critico |
| skill | String | "" | Habilidad especial |
| status | String | AVAILABLE | Estado actual |
| gemSlots | Json | 4 slots null | Slots para gemas |

## 6.10 Habilidades de Comandantes

El sistema soporta **100+ comandantes con skills unicas**.

### 6.10.1 Tipos de Habilidades

| Categoria | Efecto | Ejemplos |
|-----------|--------|----------|
| Ofensivas | Aumentan dano, hit chance, critico | +dano%, +accuracy |
| Defensivas | Reducen dano recibido, mejoran escudos | -dano%, +shield regen |
| Soporte | Buffs a flota, debuffs a enemigos | +speed aliado, -speed enemigo |
| Especiales | Efectos unicos | Revivir naves, dano garantizado |

### 6.10.2 Implementacion

Las habilidades se almacenan como string en el campo `skill` y se parsean en el BattleEngine.

```
skill_format: "EFFECT_TYPE:PARAM1:PARAM2:..."

Ejemplo: "DAMAGE_BOOST:15"        // +15% dano
Ejemplo: "SPEED_AURA:10"          // +10 speed a toda la flota
Ejemplo: "CRITICAL_MASTER:25:50"  // +25% crit chance, +50% crit damage
```

**Referencia de implementacion:**
- `apps/api/src/routes/commanders.ts` — CRUD de comandantes
- `BattleEngine.ts` — `applyCommanderSkills()`

---

# 7. SISTEMA DE RECURSOS

## 7.1 Tipos de Recursos

GO2 tiene **3 recursos principales** mas **He3** como recurso de combate.

### 7.1.1 Tabla de Recursos

| Recurso | Nombre en GO2 | Nombre en GO3 | Uso Principal | Color |
|---------|--------------|---------------|---------------|-------|
| **Metal** | Metal | Metal | Construccion basica | Gris |
| **Gas** | Gas (He3 secundario) | **Plasma** | Combustible y construccion | Verde |
| **Gold/Credits** | Credits | Credits | Moneda premium | Dorado |
| **He3** | He3 | He3 | Combustible de combate | Azul |

### 7.1.2 Discrepancia Nomenclatura

**DISCREPANCIA D01:** GO2 usa "Gas" como recurso secundario. Nuestro sistema usa "Plasma". Esto debe documentarse claramente.

```
GO2:  Metal + Gas + Gold/Credits + He3
GO3:  Metal + Plasma + Credits + He3

Mapping: Gas (GO2) = Plasma (GO3)
```

**Recomendacion:** Mantener "Plasma" internamente pero mostrar "Gas" en la UI para fidelidad con GO2.

## 7.2 Produccion de Recursos

### 7.2.1 Produccion Base por Edificio

| Edificio | Metal/h | Plasma/h | He3/h | Credits/h |
|----------|---------|----------|-------|-----------|
| Metal Extractor (Lv 1) | 20 | — | — | — |
| Plasma Refinery (Lv 1) | — | 10 | — | — |
| He3 Extractor (Lv 1) | — | — | 8 | — |
| Control Center (Lv 1) | — | — | — | 5 |
| Trading Center (Lv 1) | — | — | — | 10 |

**Formula de produccion por nivel:**
```
production(nivel) = base × nivel
```

### 7.2.2 Capacidad de Almacenamiento

| Edificio | Metal Cap | Plasma Cap | He3 Cap |
|----------|-----------|------------|---------|
| Warehouse (Lv 1) | +500 | +300 | +250 |

**Capacidades iniciales:**
```typescript
INITIAL_RESOURCE_CAPACITY = {
  metal: 50_000,
  plasma: 50_000,
  he3: 25_000,
  credits: 999_999_999,  // Ilimitada practicamente
}
```

### 7.2.3 Acumulacion de Recursos

Los recursos se acumulan en tiempo real:

```
resources_producidos = production_per_hour × horas_desde_ultima_actualizacion
resources_actuales = MIN(resources_anteriores + producidos, capacidad_maxima)
```

**Referencia:** `packages/shared/src/resourceAccrual.ts` — funcion `accrueResource()`

### 7.2.4 Bonos por Tecnologia

Las tecnologias pueden aumentar la produccion:

```
production_efectiva = production_base × (1 + bono_tecnologia)

# Ejemplo: Metal Production Tech nivel 3, bono 5% por nivel
# production_efectiva = 100 × (1 + 0.15) = 115 por hora
```

**Referencia:** `apps/api/src/lib/empireEconomy.ts` — funcion `recalculateEmpireProduction()`

## 7.3 Recursos Iniciales

### 7.3.1 Seed al Registrarse

```typescript
INITIAL_PLAYER_RESOURCES = {
  metal: 10_000,
  plasma: 10_000,
  credits: 10_000,
  energy: 100,
}
```

**NOTA:** He3 inicial no esta en el seed. El jugador empieza con 0 He3 y debe producirlo.

### 7.3.2 Recursos de Desarrollo (DEV MODE)

Cuando `DEV_HIGH_STARTING_RESOURCES=true`:
```
METAL:   1,000,000
PLASMA:  1,000,000
CREDITS: 1,000,000
Capacidad: 100,000,000 (para recursos fisicos)
```

## 7.4 Modelo de Datos

### 7.4.1 Schema Prisma — Resource

```prisma
model Resource {
  id                  String   @id @default(uuid())
  empireId            String   @map("empire_id")
  type                String   // METAL | PLASMA | CREDITS | HE3
  amount              Int      @default(0)
  capacity            Int      @default(1000)
  productionPerHour   Int      @default(0) @map("production_per_hour")
  updatedAt           DateTime @default(now()) @map("updated_at")

  empire              Empire   @relation(fields: [empireId], references: [id])

  @@unique([empireId, type])
  @@map("resources")
}
```

### 7.4.2 Tipos Validos

| Tipo | En DB | Display |
|------|-------|---------|
| METAL | METAL | Metal |
| PLASMA | PLASMA | Plasma (Gas en UI) |
| CREDITS | CREDITS | Credits |
| HE3 | HE3 | He3 |

**Referencia:**
- `packages/shared/src/resources.ts` — funcion `normalizeResourceType()`
- `packages/shared/src/economyConfig.ts` — constantes iniciales

---

# 8. SISTEMA DE EDIFICIOS

## 8.1 Vision General

Los edificios se construyen en los slots de un planeta. Cada edificio tiene un tipo, nivel, y produce recursos o desbloquea funcionalidades.

## 8.2 Tipos de Edificios

### 8.2.1 Catalogo Completo (13 Edificios)

| ID Canonico | Nombre | Tab UI | Categoria | Max/Planeta |
|-------------|--------|--------|-----------|-------------|
| `metal_extractor` | Extractor de Metal | Recursos | production | 99 |
| `plasma_refinery` | Refineria de Plasma | Recursos | production | 99 |
| `he3_extractor` | Extractor de He3 | Recursos | production | 99 |
| `energy_generator` | Generador de Energia | Recursos | infrastructure | 99 |
| `warehouse` | Almacen | Civil | storage | 99 |
| `residential_area` | Area Residencial | Civil | infrastructure | 99 |
| `control_center` | Centro de Control | Desarrollo | infrastructure | **1** |
| `research_lab` | Laboratorio | Desarrollo | research | **1** |
| `trading_center` | Centro de Comercio | Desarrollo | infrastructure | **1** |
| `shipyard` | Astillero | Milicia | military | **1** |
| `hangar` | Hangar | Milicia | military | **1** |
| `defense_turret` | Torreta de Defensa | Defensa | defense | 99 |
| `radar` | Radar | Defensa | defense | **1** |

### 8.2.2 Funciones por Edificio

#### Extractor de Metal (`metal_extractor`)
- **Produce:** 20 × nivel de Metal por hora
- **Costo crecimiento:** 1.5x por nivel
- **Categoria:** Produccion de recursos

#### Refineria de Plasma (`plasma_refinery`)
- **Produce:** 10 × nivel de Plasma por hora
- **Costo crecimiento:** 1.6x por nivel
- **Categoria:** Produccion de recursos

#### Extractor de He3 (`he3_extractor`)
- **Produce:** 8 × nivel de He3 por hora
- **Costo crecimiento:** 1.5x por nivel
- **Categoria:** Produccion de recursos

#### Generador de Energia (`energy_generator`)
- **Produce:** No produce recursos (infraestructura)
- **Funcion:** Requisito para otros edificios
- **Categoria:** Infraestructura

#### Almacen (`warehouse`)
- **Capacidad:** +500 Metal, +300 Plasma, +250 He3 por nivel
- **Categoria:** Almacenamiento

#### Centro de Control (`control_center`)
- **Produce:** 5 × nivel de Credits por hora
- **Maximo:** 1 por planeta
- **Funcion:** Controla el nivel maximo de otros edificios
- **Categoria:** Infraestructura

#### Laboratorio (`research_lab`)
- **Maximo:** 1 por planeta
- **Funcion:** Permite investigar tecnologias
- **Categoria:** Investigacion

#### Astillero (`shipyard`)
- **Maximo:** 1 por planeta
- **Funcion:** Permite construir naves
- **Categoria:** Militar

#### Hangar (`hangar`)
- **Maximo:** 1 por planeta
- **Funcion:** Aumenta capacidad de flotas
- **Categoria:** Militar

#### Torreta de Defensa (`defense_turret`)
- **Funcion:** Defensa planetaria
- **Categoria:** Defensa

#### Radar (`radar`)
- **Maximo:** 1 por planeta
- **Funcion:** Deteccion de flotas enemigas
- **Categoria:** Defensa

#### Centro de Comercio (`trading_center`)
- **Maximo:** 1 por planeta
- **Produce:** 10 × nivel de Credits por hora
- **Funcion:** Comercio entre jugadores
- **Categoria:** Infraestructura

#### Area Residencial (`residential_area`)
- **Funcion:** Poblacion y mano de obra
- **Categoria:** Infraestructura

**Referencia:** `packages/shared/src/terrestrialCatalog.ts` — `WINDSURF_TERRESTRIAL_BUILDINGS[]`

## 8.3 Construccion y Mejora

### 8.3.1 Cola de Construccion

- **Tamano maximo:** 5 construcciones simultaneas
- **Tiempo:** Cada edificio tiene su propio tiempo de construccion
- **Regla:** No se puede construir dos edificios en el mismo slot

### 8.3.2 Costos de Construccion

Los costos siguen una curva exponencial por nivel:

```
costo(nivel) = base × growth^(nivel - 1)

tiempo(nivel) = 
    si nivel <= 5: base_minutes × nivel
    si nivel > 5: base_minutes + (nivel - 1) × minute_scale
```

### 8.3.3 Curvas de Costo por Edificio

| Edificio | Metal Base | Plasma Base | Credits Base | Growth | Min Base | Min Scale |
|----------|-----------|-------------|--------------|--------|----------|-----------|
| metal_extractor | 60 | 10 | 50 | 1.5 | 1 min | 1 |
| plasma_refinery | 100 | 50 | 80 | 1.6 | 2 min | 1 |
| warehouse | 200 | 100 | 150 | 1.4 | 1 min | 1.2 |
| energy_generator | 150 | 80 | 120 | 1.45 | 1 min | 1.3 |
| control_center | 500 | 300 | 400 | 2.0 | 5 min | 5 |
| shipyard | 1,000 | 600 | 800 | 1.8 | 10 min | 10 |
| research_lab | 800 | 500 | 700 | 1.6 | 8 min | 8 |
| hangar | 600 | 400 | 500 | 1.5 | 6 min | 6 |
| defense_turret | 900 | 300 | 400 | 1.7 | 12 min | 12 |
| trading_center | 400 | 200 | 600 | 1.5 | 7 min | 7 |
| radar | 300 | 100 | 200 | 1.4 | 4 min | 4 |
| residential_area | 150 | 50 | 100 | 1.3 | 1 min | 1 |
| he3_extractor | 80 | 40 | 60 | 1.5 | 1 min | 1 |

**Referencia:** `packages/shared/src/buildingCosts.ts` — `CURVES[]`

### 8.3.4 Nivel Maximo

```
nivel_maximo = 30
```

### 8.3.5 Modo Desarrollo (DEV)

Cuando `DEV_CHEAP_COSTS=true`:
```
metal_cost = base_metal × nivel (sin exponencial)
plasma_cost = base_plasma × nivel
 credits = 0
tiempo = max(5, base_minutes × nivel)
```

Cuando `DEV_FAST_TIMERS=true`:
```
tiempo = max(3, floor(tiempo_normal × 0.1))
```

## 8.4 Grid del Planeta

### 8.4.1 Layout

```
Filas: 8
Columnas: 10
Slots totales: 80 (8 × 10)
```

### 8.4.2 Slot Central

```
slot_central = floor(80 / 2) = slot 40
# El Control Center se coloca en el slot central inicialmente
```

## 8.5 Estados de Edificio

| Estado | Descripcion |
|--------|-------------|
| **IDLE** | Construido y operativo |
| **CONSTRUCTING** | En construccion (nuevo edificio) |
| **UPGRADING** | Mejorando de nivel |

## 8.6 Modelo de Datos

### 8.6.1 Schema Prisma — Building

```prisma
model Building {
  id                    String   @id @default(uuid())
  planetId              String   @map("planet_id")
  type                  String
  level                 Int      @default(1)
  slotIndex             Int      @map("slot_index")
  status                String   @default("IDLE") // IDLE | CONSTRUCTING | UPGRADING
  constructionEndsAt    DateTime? @map("construction_ends_at")

  planet                Planet   @relation(fields: [planetId], references: [id])

  @@unique([planetId, slotIndex])
  @@map("buildings")
}
```

**Referencia:**
- `apps/api/src/routes/planet.ts` — construccion y mejora
- `apps/api/src/lib/buildingLogic.ts` — logica de construccion
- `packages/shared/src/go2/constructionQueue.ts` — cola de construccion

---

# 9. SISTEMA DE PLANETA

## 9.1 Vision General

Cada jugador comienza con un **Planeta Principal** donde construye edificios, produce recursos, y gestiona su imperio. Los planetas adicionales pueden ser colonizados.

## 9.2 Tipos de Planeta

### 9.2.1 Tipos Disponibles

```typescript
type PlanetType =
  | 'terrestrial'    // Tipo estandar del jugador
  | 'gas_giant'
  | 'ice'
  | 'lava'
  | 'desert'
  | 'ocean'
  | 'barren'
  | 'toxic'
  | 'radioactive'
  | 'crystalline'
  | 'artificial'
  | 'humaroid'
```

### 9.2.2 Planeta del Jugador

| Propiedad | Valor |
|-----------|-------|
| Tipo estandar | `terrestrial` |
| Tamano estandar | `medium` |
| Slots de edificios | 80 (8 filas × 10 columnas) |
| Nombre inicial | "Planeta Principal" |

## 9.3 Sistema de Slots

### 9.3.1 Grid

```
+---+---+---+---+---+---+---+---+---+---+
| 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
+---+---+---+---+---+---+---+---+---+---+
|10 |11 |12 |13 |14 |15 |16 |17 |18 |19 |
+---+---+---+---+---+---+---+---+---+---+
|20 |21 |22 |23 |24 |25 |26 |27 |28 |29 |
+---+---+---+---+---+---+---+---+---+---+
|30 |31 |32 |33 |34 |35 |36 |37 |38 |39 |
+---+---+---+---+---+---+---+---+---+---+
|40 |41 |42 |43 |44 |45 |46 |47 |48 |49 |  <- Centro en 40
+---+---+---+---+---+---+---+---+---+---+
|50 |51 |52 |53 |54 |55 |56 |57 |58 |59 |
+---+---+---+---+---+---+---+---+---+---+
|60 |61 |62 |63 |64 |65 |66 |67 |68 |69 |
+---+---+---+---+---+---+---+---+---+---+
|70 |71 |72 |73 |74 |75 |76 |77 |78 |79 |
+---+---+---+---+---+---+---+---+---+---+
```

### 9.3.2 Restricciones de Colocacion

- Solo un edificio por slot
- Algunos edificios tienen maximo 1 por planeta (control_center, research_lab, etc.)
- No se puede construir sobre un edificio existente de diferente tipo

## 9.4 Colonizacion

### 9.4.1 Requisitos para Colonizar

- Flota con naves de colonizacion
- Coordenadas disponibles en la galaxia
- Recursos suficientes para establecer base

### 9.4.2 Proceso

```
1. Mover flota a coordenadas desocupadas
2. Enviar orden de colonizacion
3. Consumir recursos
4. Crear nuevo planeta en DB
5. Inicializar edificios basicos
```

## 9.5 Modelo de Datos

### 9.5.1 Schema Prisma — Planet

```prisma
model Planet {
  id                String   @id @default(uuid())
  empireId          String   @map("empire_id")
  name              String   @default("Planeta Principal")
  galaxyX           Int      @default(0) @map("galaxy_x")
  galaxyY           Int      @default(0) @map("galaxy_y")
  type              String   @default("HABITABLE")
  maxBuildingSlots  Int      @default(80) @map("max_building_slots")
  createdAt         DateTime @default(now()) @map("created_at")

  empire            Empire   @relation(fields: [empireId], references: [id])
  buildings         Building[]

  @@map("planets")
}
```

### 9.5.2 Campos

| Campo | Tipo | Default | Descripcion |
|-------|------|---------|-------------|
| id | UUID | auto | Identificador |
| empireId | String | — | FK al Empire |
| name | String | "Planeta Principal" | Nombre del planeta |
| galaxyX | Int | 0 | Coordenada X en galaxia |
| galaxyY | Int | 0 | Coordenada Y en galaxia |
| type | String | HABITABLE | Tipo de planeta |
| maxBuildingSlots | Int | 80 | Maximo de slots |

## 9.6 Seed Inicial de Edificios

Al registrarse, el planeta principal recibe 5 edificios iniciales:

| Slot | Edificio | Nivel |
|------|----------|-------|
| 40 (centro) | control_center | 1 |
| 0 | metal_extractor | 1 |
| 1 | plasma_refinery | 1 |
| 2 | research_lab | 1 |
| 3 | shipyard | 1 |

**Referencia:** `apps/api/src/routes/auth.ts` — funcion de registro (registro de jugador)

**Referencia de implementacion:**
- `apps/api/src/routes/planet.ts` — gestion de planetas
- `packages/shared/src/planetLayout.ts` — constantes de layout

---

# 10. SISTEMA DE GALAXIA

## 10.1 Vision General

La galaxia es el mapa principal donde los jugadores mueven flotas, conquistan planetas, y encuentran NPCs.

## 10.2 Coordenadas

### 10.2.1 Sistema de Coordenadas

```
Eje X: 0 hasta GALAXY_MAX_X
Eje Y: 0 hasta GALAXY_MAX_Y
Cada coordenada (X, Y) puede contener: planeta, NPC, o estar vacia
```

### 10.2.2 Modelo de Datos

```prisma
galaxyX  Int  @default(0) @map("galaxy_x")
galaxyY  Int  @default(0) @map("galaxy_y")
```

## 10.3 Tipos de Entidades en Galaxia

### 10.3.1 Planetas
- Planetas de jugadores (con edificios y flotas)
- Planetas NPC (pirate bases, resource nodes)
- Planetas vacios (colonizables)

### 10.3.2 NPCs

| Tipo | Descripcion | Dificultad |
|------|-------------|------------|
| Pirates | Bases piratas, hostiles | Variable |
| Resource Nodes | Nodos de recursos | Baja |
| Humaroids | NPCs especiales | Alta |

## 10.4 Exploracion

### 10.4.1 Movimiento de Flotas

```
1. Seleccionar flota
2. Seleccionar coordenadas destino
3. Verificar rango de movimiento
4. Calcular tiempo de viaje
5. Mover flota
```

### 10.4.2 Tiempo de Viaje

```
tiempo_viaje = distancia / velocidad_flota × factor_universo

distancia = sqrt( (x2-x1)^2 + (y2-y1)^2 )
```

## 10.5 Endpoints de API

### 10.5.1 GET /api/galaxy

Retorna el sector galactico visible para el jugador.

### 10.5.2 GET /api/galaxy/planets/:id

Retorna detalles de un planeta especifico.

### 10.5.3 POST /api/galaxy/move

Mueve una flota a coordenadas.

### 10.5.4 POST /api/galaxy/colonize

Coloniza un planeta vacio.

**Referencia:** Los endpoints de galaxia estan definidos pero la implementacion completa esta pendiente.



---

# 11. SISTEMA DE FLOTAS

## 11.1 Vision General

Las flotas son agrupaciones de naves que el jugador puede mover, asignar a misiones, y usar en combate. Cada flota tiene formaciones que determinan la disposicion de las naves.

## 11.2 Creacion de Flotas

### 11.2.1 Proceso

```
1. Jugador crea flota con nombre
2. Sistema crea Fleet vacia en DB
3. Jugador asigna naves desde inventario
4. Sistema crea FleetFormation entries
5. Flota lista para usar
```

### 11.2.2 Endpoint

```
POST /api/fleets
Body: { "name": "string (1-50 chars)" }
```

## 11.3 Formaciones

### 11.3.1 Estructura de Formacion

Cada flota tiene slots donde se asignan naves:

```
Fleet:
  - Formation Slot 0: Ship[Blueprint A] × cantidad
  - Formation Slot 1: Ship[Blueprint B] × cantidad
  - Formation Slot 2: Ship[Blueprint C] × cantidad
  - ... hasta 9 slots
```

### 11.3.2 Asignacion de Naves

```
POST /api/fleets/:id/assign-ships
Body: { "shipId": "uuid", "quantity": number }
```

**Reglas:**
- La flota debe estar en estado IDLE
- Las naves deben estar en inventario (AVAILABLE)
- La cantidad no puede exceder el inventario disponible
- Si ya existe una formacion con ese shipId, se incrementa

### 11.3.3 Remover Naves

```
POST /api/fleets/:id/remove-ships
Body: { "shipId": "uuid", "quantity": number }
```

**Reglas:**
- La flota debe estar en estado IDLE
- Las naves se devuelven al inventario
- Si la cantidad llega a 0, se elimina la formacion

### 11.3.4 Calculo de Poder

```
power_fleet = SUM(por cada formacion):
    power = (blueprint.attack + blueprint.hp + blueprint.defense + blueprint.speed) × quantity
```

**Referencia:** `apps/api/src/routes/fleets.ts` — funcion `assign-ships`

## 11.4 Estados de Flota

| Estado | Descripcion | Transiciones Permitidas |
|--------|-------------|------------------------|
| **IDLE** | En planeta, lista para ordenes | -> ON_MISSION, -> MOVING |
| **ON_MISSION** | Ejecutando mision PvE | -> IDLE (al completar) |
| **MOVING** | En movimiento por la galaxia | -> IDLE (al llegar) |
| **IN_BATTLE** | En combate | -> IDLE (al terminar) |
| **RETURNING** | Volviendo de mision | -> IDLE |

## 11.5 Disband (Disolver Flota)

```
DELETE /api/fleets/:id
```

**Reglas:**
- La flota debe estar en estado IDLE
- TODAS las naves se devuelven al inventario
- Se eliminan todas las formaciones
- Se elimina la flota

## 11.6 Modelo de Datos

### 11.6.1 Schema Prisma — Fleet

```prisma
model Fleet {
  id            String   @id @default(uuid())
  empireId      String   @map("empire_id")
  name          String
  status        String   @default("IDLE") // IDLE | ON_MISSION | MOVING | IN_BATTLE
  planetId      String?  @map("planet_id")
  totalPower    Int      @default(0) @map("total_power")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  empire        Empire   @relation(fields: [empireId], references: [id])
  formations    FleetFormation[]
  missionRuns   MissionRun[]

  @@map("fleets")
}
```

### 11.6.2 Schema Prisma — FleetFormation

```prisma
model FleetFormation {
  id            String   @id @default(uuid())
  fleetId       String   @map("fleet_id")
  slotIndex     Int      @map("slot_index")
  shipId        String   @map("ship_id")
  quantity      Int      @default(0)

  fleet         Fleet    @relation(fields: [fleetId], references: [id], onDelete: Cascade)
  ship          Ship     @relation(fields: [shipId], references: [id])

  @@unique([fleetId, slotIndex])
  @@map("fleet_formations")
}
```

**Referencia:** `apps/api/src/routes/fleets.ts`

---

# 12. SISTEMA DE BATALLA

## 12.1 Vision General

El sistema de batalla implementa el motor de combate completo de GO2 con los 8 pasos de resolucion de dano.

## 12.2 Ciclo de Vida de una Batalla

```
+--------+    +----------+    +----------+    +--------+
| CREATE | -> | SIMULATE | -> | RESOLVE  | -> | FINISH |
+--------+    +----------+    +----------+    +--------+
                  |
                  v
            +----------+
            |  ROUNDS  |
            | (1-20)   |
            +----------+
```

## 12.3 Iniciar Batalla

### 12.3.1 Endpoint

```
POST /api/battles
Body: { "fleetId": "uuid", "targetType": "MISSION|PLAYER|NPC", "targetId": "uuid" }
```

### 12.3.2 Proceso

```
1. Verificar flota valida y pertenece al imperio
2. Verificar objetivo valido
3. Cargar configuracion de ambas flotas
4. Cargar comandantes con sus stats
5. Inicializar RNG con seed
6. Crear registro de batalla en DB
7. Retornar battleId
```

## 12.4 Simular Ronda

### 12.4.1 Endpoint

```
POST /api/battles/:id
Body: { "round": number }
```

### 12.4.2 Proceso por Ronda

```
1. Cargar estado actual de la batalla
2. Calcular orden de ataque por Speed
3. Para cada stack en orden:
   a. Verificar cooldown == 0
   b. Verificar He3 suficiente
   c. Ejecutar 8 pasos de resolucion de dano:
      - Paso 1: Calcular hits
      - Paso 2: Interceptar (PPC)
      - Paso 3: Calcular dano
      - Paso 4: Negar dano (defensas NO-EOS)
      - Paso 5: Penetrar escudos (pierce)
      - Paso 6: Dano a escudos (EOS)
      - Paso 7: Dano al hull
      - Paso 8: Dano scatter
   d. Aplicar cooldown
   e. Consumir He3
4. Regenerar escudos al 100%
5. Verificar condiciones de victoria/derrota
6. Guardar estado de la ronda
7. Retornar resultado de la ronda
```

## 12.5 Resultado de Batalla

### 12.5.1 Endpoint

```
POST /api/battles/:id/result
```

### 12.5.2 Calculo de Resultado

```
WIN:  flota enemiga destruida (0 naves restantes)
LOSS: flota propia destruida (0 naves restantes)
DRAW: se alcanzaron 20 rondas sin ganador
```

### 12.5.3 Recompensas

```
xp_ganada = SUM(dano_infligido) / 100 + bonus_victoria
credits_ganados = recompensa_mision × factor_dificultad

perdidas = naves_destruidas (se registran en BattleLoss)
```

## 12.6 Simulador Libre (Dev)

### 12.6.1 Endpoint

```
POST /api/battles/dev-simulate
Body: { "attackerFleet": {...}, "defenderFleet": {...}, "rounds": number }
```

Permite simular batallas sin restricciones para testing.

## 12.7 Modelo de Datos

### 12.7.1 Schema Prisma — Battle

```prisma
model Battle {
  id                String   @id @default(uuid())
  empireId          String   @map("empire_id")
  missionRunId      String?  @map("mission_run_id")
  fleetId           String   @map("fleet_id")
  result            String?  // WIN | LOSS | DRAW
  rounds            String?  // JSON serializado de rondas
  seed              String?  // Seed del RNG
  xpGained          Int      @default(0) @map("xp_gained")
  creditsGained     Int      @default(0) @map("credits_gained")
  createdAt         DateTime @default(now()) @map("created_at")

  losses            BattleLoss[]

  @@map("battles")
}
```

### 12.7.2 Schema Prisma — BattleLoss

```prisma
model BattleLoss {
  id            String   @id @default(uuid())
  battleId      String   @map("battle_id")
  blueprintId   String   @map("blueprint_id")
  quantity      Int

  battle        Battle   @relation(fields: [battleId], references: [id])

  @@map("battle_losses")
}
```

**Referencia de implementacion:** BattleEngine (no en routes directamente, motor separado)

---

# 13. SISTEMA DE MISIONES

## 13.1 Vision General

El sistema de misiones permite a los jugadores enviar flotas a misiones PvE contra NPCs para obtener recursos, experiencia, y otros premios.

## 13.2 Tipos de Mision

### 13.2.1 Misiones PvE

| Dificultad | Duracion Base | Naves Minimas | Recompensas |
|------------|--------------|---------------|-------------|
| 1 (Facil) | 300 seg (5 min) | 1 | Bajas |
| 2-5 (Media) | 600-1800 seg | 5-20 | Moderadas |
| 6-10 (Dificil) | 3600+ seg | 50+ | Altas |

### 13.2.2 Configuracion de Mision

```prisma
model Mission {
  id                  String   @id @default(uuid())
  name                String
  description         String
  difficulty          Int
  durationSeconds     Int      @default(300) @map("duration_seconds")
  minShipsRequired    Int      @default(1) @map("min_ships_required")
  recommendedPower    Int      @map("recommended_power")
  enemyFleetConfig    String   @map("enemy_fleet_config")  // JSON
  rewardMetal         Int      @default(0) @map("reward_metal")
  rewardPlasma        Int      @default(0) @map("reward_plasma")
  rewardXp            Int      @default(0) @map("reward_xp")
  rewardCredits       Int      @default(0) @map("reward_credits")

  missionRuns         MissionRun[]

  @@map("missions")
}
```

## 13.3 Ciclo de Vida de una Mision

```
+--------+    +---------+    +----------+    +----------+
| SELECT | -> |  START  | -> | RUNNING  | -> | COMPLETE |
+--------+    +---------+    +----------+    +----------+
                  |
                  v
            +---------+
            | VALIDATE |
            |  FLEET   |
            +---------+
```

## 13.4 Iniciar Mision

### 13.4.1 Endpoint

```
POST /api/missions/:missionId/start
Body: { "fleetId": "uuid" }
```

### 13.4.2 Validaciones

```
1. Mision existe
2. Flota pertenece al imperio
3. Flota en estado IDLE
4. Flota tiene suficientes naves (>= minShipsRequired)
5. Flota no esta ya en otra mision
```

### 13.4.3 Proceso

```
1. Cambiar estado de flota a ON_MISSION
2. Crear MissionRun en DB
3. Calcular tiempo de finalizacion
4. Retornar endsAt
```

## 13.5 Sincronizacion de Misiones

### 13.5.1 Endpoint

```
POST /api/missions/sync
```

### 13.5.2 Proceso

```
1. Buscar todas las misiones RUNNING del imperio
2. Para cada mision:
   a. Calcular si ya paso el tiempo
   b. Si completa:
      - Cambiar estado a COMPLETED
      - Cambiar result a WIN
      - Dar recompensas (recursos)
      - Devolver flota a IDLE
   c. Si no completa:
      - Retornar remainingSeconds
3. Retornar lista de completadas y en progreso
```

### 13.5.3 Recompensas

```
METAL   += mission.rewardMetal
PLASMA  += mission.rewardPlasma
CREDITS += mission.rewardCredits
XP      += mission.rewardXp (aplicado al imperio)
```

## 13.6 Misiones Activas

### 13.6.1 Endpoint

```
GET /api/missions/active
```

Retorna todas las misiones en progreso con tiempo restante.

## 13.7 Historial

### 13.7.1 Endpoint

```
GET /api/missions/history
```

Retorna las ultimas 50 misiones completadas o canceladas.

## 13.8 Listar Misiones Disponibles

### 13.8.1 Endpoint

```
GET /api/missions
```

Retorna todas las misiones PvE disponibles ordenadas por dificultad.

## 13.9 Modelo de Datos — MissionRun

```prisma
model MissionRun {
  id            String   @id @default(uuid())
  empireId      String   @map("empire_id")
  missionId     String   @map("mission_id")
  fleetId       String   @map("fleet_id")
  status        String   @default("RUNNING") // RUNNING | COMPLETED | CANCELLED
  result        String?  // WIN | LOSS | CANCELLED
  rewardsGiven  Boolean  @default(false) @map("rewards_given")
  startedAt     DateTime @default(now()) @map("started_at")
  completedAt   DateTime? @map("completed_at")

  mission       Mission  @relation(fields: [missionId], references: [id])
  fleet         Fleet    @relation(fields: [fleetId], references: [id])

  @@map("mission_runs")
}
```

**Referencia:** `apps/api/src/routes/missions.ts`

---

# 14. SISTEMA DE ALIANZAS

## 14.1 Vision General

Las alianzas permiten a los jugadores agruparse para cooperar, compartir recursos, y combatir juntos.

## 14.2 Funcionalidades

### 14.2.1 Crear Alianza

```
POST /api/alliances
Body: { "name": "string", "tag": "string (3-5 chars)", "description": "string" }
```

**Reglas:**
- Nombre unico
- Tag unico
- El creador se convierte en lider

### 14.2.2 Unirse a Alianza

```
POST /api/alliances/:id/join
```

### 14.2.3 Detalle de Alianza

```
GET /api/alliances/:id
```

### 14.2.4 Mi Alianza

```
GET /api/alliances/my
```

### 14.2.5 Abandonar/Eliminar

```
DELETE /api/alliances/:id
```

## 14.3 Roles de Alianza

| Rol | Permisos |
|-----|----------|
| **LEADER** | Todo: gestionar miembros, editar alianza, disolver |
| **OFFICER** | Invitar miembros, expulsar miembros (no oficiales) |
| **MEMBER** | Participar en chat, contribuir |

## 14.4 Chat de Alianza

```
GET /api/chat?allianceId=uuid    - Obtener mensajes
POST /api/chat                   - Enviar mensaje
Body: { "allianceId": "uuid", "message": "string" }
```

## 14.5 Bonus de Alianza

Las alianzas pueden proporcionar bonus globales:

| Tipo de Bonus | Efecto | Requisito |
|--------------|--------|-----------|
| Produccion +X% | Aumenta produccion de recursos | Nivel de alianza |
| Defensa +X% | Aumenta defensa en combate | Nivel de alianza |
| Velocidad +X% | Aumenta velocidad de flotas | Nivel de alianza |

## 14.6 Modelo de Datos

### 14.6.1 Schema Prisma — Alliance

```prisma
model Alliance {
  id          String   @id @default(uuid())
  name        String   @unique
  tag         String   @unique
  description String   @default("")
  leaderId    String   @unique @map("leader_id")
  memberCount Int      @default(1) @map("member_count")
  maxMembers  Int      @default(50) @map("max_members")
  createdAt   DateTime @default(now()) @map("created_at")

  members     AllianceMember[]

  @@map("alliances")
}
```

### 14.6.2 Schema Prisma — AllianceMember

```prisma
model AllianceMember {
  id         String   @id @default(uuid())
  allianceId String   @map("alliance_id")
  empireId   String   @unique @map("empire_id")
  role       String   @default("MEMBER") // LEADER | OFFICER | MEMBER
  joinedAt   DateTime @default(now()) @map("joined_at")

  alliance   Alliance @relation(fields: [allianceId], references: [id], onDelete: Cascade)

  @@map("alliance_members")
}
```

**Referencia de implementacion:** Los endpoints de alianza estan definidos en la estructura de API pero la implementacion completa requiere desarrollo adicional.

---

# 15. SISTEMA ECONOMICO

## 15.1 Vision General

El sistema economico gestiona la produccion, almacenamiento, y consumo de recursos.

## 15.2 Produccion

### 15.2.1 Calculo de Produccion del Imperio

```
production_metal_per_hour = SUM(por cada edificio):
    si edificio.status == IDLE:
        productionFromBuilding(edificio.type, edificio.level).metal

production_plasma_per_hour = SUM(por cada edificio):
    si edificio.status == IDLE:
        productionFromBuilding(edificio.type, edificio.level).plasma

production_credits_per_hour = SUM(por cada edificio):
    si edificio.status == IDLE:
        productionFromBuilding(edificio.type, edificio.level).credits
```

### 15.2.2 Aplicacion de Bonos

```
production_efectiva = production_base × (1 + bono_tecnologia + bono_alianza + bono_evento)
```

**Referencia:** `apps/api/src/lib/empireEconomy.ts` — funcion `recalculateEmpireProduction()`

## 15.3 Almacenamiento

### 15.3.1 Capacidad

```
capacidad_metal = INITIAL.metal + SUM(warehouse_bonus_metal)
capacidad_plasma = INITIAL.plasma + SUM(warehouse_bonus_plasma)
capacidad_he3 = INITIAL.he3 + SUM(warehouse_bonus_he3)
```

### 15.3.2 Limitacion

```
recurso_actual = MIN(recurso_anterior + produccion, capacidad_maxima)
```

Los recursos nunca exceden la capacidad maxima.

## 15.4 Recoleccion

### 15.4.1 Endpoint

```
POST /api/game/resources/collect
```

### 15.4.2 Proceso

```
1. Calcular tiempo transcurrido desde ultima actualizacion
2. Calcular recursos producidos
3. Aplicar bonos de tecnologia
4. Limitar por capacidad
5. Actualizar valores en DB
6. Retornar recursos actualizados y cantidad recolectada
```

**Referencia:** `apps/api/src/lib/gameState.ts` — funcion `syncEmpireGameState()`

## 15.5 Trade (Comercio)

### 15.5.1 Funcionalidad

El sistema de comercio permite intercambiar recursos entre jugadores o en el mercado.

### 15.5.2 Ratios de Intercambio

```
1 Metal = 0.5 Plasma (base)
1 Metal = 0.2 Credits (base)
1 Plasma = 0.4 Credits (base)
```

### 15.5.3 Centro de Comercio

El edificio `trading_center` desbloquea y mejora las opciones de comercio.

## 15.6 Sincronizacion del Estado del Juego

### 15.6.1 Endpoint Principal

```
GET /api/game/dashboard
```

### 15.6.2 Flujo de Sincronizacion

```
1. completeDueBuildingsForEmpire(empireId)
   - Finaliza edificios cuyo tiempo ya paso
   
2. recalculateEmpireProduction(empireId)
   - Recalcula produccion basada en edificios activos
   
3. syncEmpireGameState(empireId)
   - Acumula recursos producidos
   - Aplica bonos de tecnologia
   - Actualiza timestamps
   
4. Retorna DTO completo del estado
```

### 15.6.3 DTO de Respuesta

```typescript
interface GameDashboardDto {
  player: {
    empireId: string;
    name: string;
    level: number;
    xp: number;
    xpMax: number;
  };
  resources: {
    metal: number;
    plasma: number;
    he3: number;
    credits: number;
    metalCapacity: number;
    plasmaCapacity: number;
    he3Capacity: number;
    metalProduction: number;
    plasmaProduction: number;
    he3Production: number;
  };
  planet: {
    id: string;
    name: string;
    type: string;
    maxBuildingSlots: number;
    buildings: ApiBuilding[];
  };
  constructionQueue: Go2ConstructionQueueItemDto[];
}
```

**Referencia:**
- `apps/api/src/routes/game.ts` — endpoints del dashboard
- `apps/api/src/lib/gameState.ts` — sincronizacion



---

# 16. SISTEMA DE TECNOLOGIA

## 16.1 Vision General

El sistema de tecnologia permite a los jugadores investigar mejoras que afectan diversos aspectos del juego: produccion de recursos, combate, construccion, y mas.

## 16.2 Arbol de Tecnologias

### 16.2.1 Estructura

Las tecnologias se organizan en un arbol con prerequisitos:

```
Tecnologias Tier 1 (sin prerequisitos) -> Disponibles desde el inicio
Tecnologias Tier 2 (requieren Tier 1) -> Se desbloquean al investigar prerequisitos
Tecnologias Tier 3 (requieren Tier 2) -> Avanzadas
```

### 16.2.2 Categorias

| Categoria | Descripcion | Ejemplos |
|-----------|-------------|----------|
| **GENERAL** | Mejoras generales | Management, Economy |
| **MILITARY** | Combate y armas | Weapon tech, Armor tech |
| **INDUSTRIAL** | Produccion y construccion | Automation, Extraction |
| **SCIENTIFIC** | Investigacion | Research speed, Special techs |

## 16.3 Modelo de Datos

### 16.3.1 Schema Prisma — Technology

```prisma
model Technology {
  id            String   @id @default(uuid())
  key           String   @unique
  name          String
  description   String
  category      String   @default("GENERAL")
  requiredTechId String? @map("required_tech_id")
  baseCostMetal     Int  @default(100) @map("base_cost_metal")
  baseCostPlasma    Int  @default(50) @map("base_cost_plasma")
  baseResearchTime  Int  @default(300) @map("base_research_time")
  maxLevel      Int      @default(5) @map("max_level")

  // Efecto de la tecnologia
  effectType    String?  @map("effect_type")
  effectValue   Float    @default(0) @map("effect_value")
  effectDescription String? @map("effect_description")

  // Relaciones
  requiredTech  Technology? @relation("TechRequirements", fields: [requiredTechId], references: [id])
  unlockedTechs Technology[] @relation("TechRequirements")
  empireTechs   EmpireTechnology[]

  @@map("technologies")
}
```

### 16.3.2 Schema Prisma — EmpireTechnology

```prisma
model EmpireTechnology {
  id              String   @id @default(uuid())
  empireId        String   @map("empire_id")
  technologyId    String   @map("technology_id")
  level           Int      @default(0)
  status          String   @default("LOCKED") // LOCKED | AVAILABLE | RESEARCHING | COMPLETED
  researchStartedAt DateTime? @map("research_started_at")
  researchEndsAt  DateTime? @map("research_ends_at")

  empire          Empire   @relation(fields: [empireId], references: [id])
  technology      Technology @relation(fields: [technologyId], references: [id])

  @@unique([empireId, technologyId])
  @@map("empire_technologies")
}
```

## 16.4 Estados de Tecnologia

| Estado | Descripcion | Transiciones |
|--------|-------------|-------------|
| **LOCKED** | Bloqueada, prerequisitos no cumplidos | -> AVAILABLE (cuando prereq listo) |
| **AVAILABLE** | Disponible para investigar | -> RESEARCHING (al iniciar) |
| **RESEARCHING** | En investigacion | -> COMPLETED (al finalizar) |
| **COMPLETED** | Investigacion completada (nivel > 0) | -> RESEARCHING (para siguiente nivel) |

## 16.5 Iniciar Investigacion

### 16.5.1 Endpoint

```
POST /api/research/:technologyId/start
```

### 16.5.2 Validaciones

```
1. Tecnologia existe
2. Prerequisitos cumplidos (nivel > 0)
3. No hay otra investigacion activa
4. No ha alcanzado nivel maximo
5. Recursos suficientes (metal, plasma)
```

### 16.5.3 Calculo de Costos

```
cost_multiplier = siguiente_nivel
cost_metal = base_cost_metal × cost_multiplier
cost_plasma = base_cost_plasma × cost_multiplier
research_time = base_research_time × cost_multiplier × dev_factor
```

## 16.6 Sincronizacion de Investigacion

### 16.6.1 Endpoint

```
POST /api/research/sync
```

### 16.6.2 Proceso

```
1. Buscar investigaciones con estado RESEARCHING y tiempo vencido
2. Para cada una:
   - Cambiar estado a COMPLETED
   - Incrementar nivel en 1
   - Limpiar timestamps de investigacion
   - Desbloquear tecnologias hijas (cambiar de LOCKED a AVAILABLE)
```

## 16.7 Listar Tecnologias

### 16.7.1 Endpoint

```
GET /api/research
```

### 16.7.2 Respuesta

```typescript
{
  technologies: [
    {
      id: string;
      key: string;
      name: string;
      description: string;
      category: string;
      currentLevel: number;
      maxLevel: number;
      status: "LOCKED" | "AVAILABLE" | "RESEARCHING" | "COMPLETED";
      isMaxLevel: boolean;
      prerequisiteMet: boolean;
      prerequisiteName: string | null;
      costs: {
        metal: number;
        plasma: number;
        time: number;
      };
      effects: {
        type: string | null;
        value: number;
        description: string | null;
      };
      researchStatus: {
        timeRemaining: number;
        progress: number;
        endsAt: Date;
      } | null;
    }
  ]
}
```

## 16.8 Tecnologias de Ejemplo

### 16.8.1 Industrial Automation

| Propiedad | Valor |
|-----------|-------|
| Key | `INDUSTRIAL_AUTOMATION` |
| Categoria | INDUSTRIAL |
| Efecto | Reduce tiempo de construccion de naves |
| Valor | 10% por nivel |
| Max Level | 5 |
| Costo base | 200 Metal, 100 Plasma |
| Tiempo base | 600 segundos |

**Efecto en construccion:**
```
time_reduction = nivel × 0.10  // 10% por nivel
effective_time = base_time × (1 - time_reduction)
```

### 16.8.2 Metal Production

| Propiedad | Valor |
|-----------|-------|
| Key | `METAL_PRODUCTION` |
| Categoria | GENERAL |
| Efecto | Aumenta produccion de Metal |
| Valor | 5% por nivel |
| Max Level | 10 |

### 16.8.3 Exaltation Missile Tech

| Propiedad | Valor |
|-----------|-------|
| Key | `EXALTATION_MISSILE` |
| Categoria | MILITARY |
| Efecto | Aumenta scatter de misiles |
| Valor | +scatter% por nivel |
| Max Level | 5 |

**NOTA IMPORTANTE:** Con Exaltation missile tech al maximo (54% scatter), el dano scatter de misiles se convierte en un **432% de dano bonus imposible de prevenir**. Esta es una de las estrategias mas poderosas de GO2.

## 16.9 Seed de Tecnologias

Al registrar un jugador, todas las tecnologias se inicializan:

```
Para cada technology en la tabla:
    si technology.requiredTechId == null:
        status = AVAILABLE
    sino:
        status = LOCKED
    level = 0
```

**Referencia:** `apps/api/src/routes/research.ts`

---

# 17. DOCUMENTACION DE API

## 17.1 Vision General

La API REST de GO3 sigue una estructura organizada por dominio. Todos los endpoints (excepto auth) requieren autenticacion via JWT Bearer token.

## 17.2 Autenticacion

### 17.2.1 Header de Autenticacion

```
Authorization: Bearer <jwt_token>
```

### 17.2.2 Payload del JWT

```json
{
  "userId": "uuid",
  "empireId": "uuid"
}
```

### 17.2.3 Middleware de Auth

Todos los endpoints protegidos verifican el JWT:

```typescript
app.addHook('onRequest', async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});
```

## 17.3 Resumen de Endpoints

| Metodo | Ruta | Descripcion | Auth |
|--------|------|-------------|------|
| POST | /api/auth/register | Registro de nuevo jugador | No |
| POST | /api/auth/login | Login y obtencion de JWT | No |
| GET | /api/empire | Obtener datos del imperio | Si |
| GET | /api/empire/resources | Obtener recursos actuales | Si |
| PATCH | /api/empire | Actualizar nombre del imperio | Si |
| GET | /api/game/dashboard | Dashboard completo del juego | Si |
| POST | /api/game/resources/collect | Recolectar recursos | Si |
| GET | /api/game/buildings/:type/cost | Costo de edificio por nivel | Si |
| GET | /api/game/player | Datos del jugador | Si |
| GET | /api/game/resources | Recursos del jugador | Si |
| GET | /api/game/planet | Planeta del jugador | Si |
| GET | /api/game/buildings | Edificios del jugador | Si |
| POST | /api/game/buildings/:id/upgrade | Mejorar edificio | Si |
| GET | /api/planets/:id | Detalle de planeta | Si |
| POST | /api/planets/:id/build | Construir edificio | Si |
| GET | /api/research | Listar tecnologias | Si |
| POST | /api/research/:technologyId/start | Iniciar investigacion | Si |
| POST | /api/research/sync | Sincronizar investigaciones | Si |
| GET | /api/shipyard | Listar blueprints | Si |
| POST | /api/shipyard/build | Construir naves | Si |
| POST | /api/shipyard/sync | Sincronizar construcciones | Si |
| GET | /api/shipyard/ships | Inventario de naves | Si |
| GET | /api/fleets | Listar flotas | Si |
| POST | /api/fleets | Crear flota | Si |
| POST | /api/fleets/:id/assign-ships | Asignar naves | Si |
| POST | /api/fleets/:id/remove-ships | Remover naves | Si |
| DELETE | /api/fleets/:id | Disolver flota | Si |
| GET | /api/missions | Listar misiones PvE | Si |
| GET | /api/missions/active | Misiones activas | Si |
| POST | /api/missions/:missionId/start | Iniciar mision | Si |
| POST | /api/missions/sync | Sincronizar misiones | Si |
| GET | /api/missions/history | Historial de misiones | Si |
| GET | /api/galaxy | Sector galactico | Si |
| GET | /api/galaxy/planets/:id | Detalle de planeta galactico | Si |
| POST | /api/galaxy/move | Mover flota | Si |
| POST | /api/galaxy/colonize | Colonizar planeta | Si |
| GET | /api/chat | Chat | Si |
| POST | /api/chat | Enviar mensaje | Si |
| GET | /api/leaderboard | Ranking | No/Si |
| GET | /api/alliances | Listar alianzas | Si |
| POST | /api/alliances | Crear alianza | Si |
| GET | /api/alliances/:id | Detalle de alianza | Si |
| DELETE | /api/alliances/:id | Abandonar/eliminar alianza | Si |
| GET | /api/alliances/my | Mi alianza | Si |
| GET | /api/commanders | Listar comandantes | Si |
| POST | /api/battles | Iniciar batalla | Si |
| GET | /api/battles | Listar batallas | Si |
| POST | /api/battles/:id | Simular ronda | Si |
| POST | /api/battles/:id/result | Resultado de batalla | Si |
| POST | /api/battles/dev-simulate | Simulador libre (dev) | Si |

## 17.4 Endpoints de Autenticacion (/api/auth)

### 17.4.1 POST /api/auth/register

Registra un nuevo jugador con imperio completo.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "minimo8caracteres",
  "username": "nombre_visible (3-20 chars)",
  "empireName": "nombre_imperio (3-30 chars)"
}
```

**Validaciones:**
- Email valido y unico
- Password minimo 8 caracteres
- Username unico, 3-20 caracteres
- EmpireName 3-30 caracteres

**Response (200):**
```json
{
  "token": "jwt_string",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "nombre_visible"
  },
  "empire": {
    "id": "uuid",
    "name": "nombre_imperio",
    "level": 1
  }
}
```

**Response (400):**
```json
{ "error": "User already exists" }
```

**Seed Automatico al Registrar:**
- Empire nivel 1, 0 XP
- Planeta Principal (80 slots)
- 5 Edificios iniciales: control_center, metal_extractor, plasma_refinery, research_lab, shipyard
- Recursos: 10,000 METAL, 10,000 PLASMA, 10,000 CREDITS
- 10 Frigate MK-I
- 3 Blueprints
- Tecnologias inicializadas (Tier 1 AVAILABLE, resto LOCKED)

**Response (500):**
```json
{ "error": "Failed to register" }
```

**Codigo de referencia:** `apps/api/src/routes/auth.ts`

### 17.4.2 POST /api/auth/login

Autentica un jugador existente.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response (200):**
```json
{
  "token": "jwt_string",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "nombre_visible"
  },
  "empire": {
    "id": "uuid",
    "name": "nombre_imperio",
    "level": 1
  }
}
```

**Response (401):**
```json
{ "error": "Invalid credentials" }
```

**Codigo de referencia:** `apps/api/src/routes/auth.ts`

## 17.5 Endpoints de Imperio (/api/empire)

### 17.5.1 GET /api/empire

Obtiene los datos completos del imperio con produccion calculada.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Imperio Galactico",
  "level": 1,
  "experience": 0,
  "resources": [
    {
      "id": "uuid",
      "type": "METAL",
      "amount": 15234,
      "capacity": 50000,
      "productionPerHour": 100
    }
  ],
  "planets": [
    {
      "id": "uuid",
      "name": "Planeta Principal",
      "type": "HABITABLE",
      "maxBuildingSlots": 80,
      "buildings": [...]
    }
  ],
  "technologies": [...]
}
```

**Codigo de referencia:** `apps/api/src/routes/empire.ts`

### 17.5.2 GET /api/empire/resources

Obtiene solo los recursos con produccion calculada y bonos de tecnologia.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "type": "METAL",
    "amount": 15234,
    "capacity": 50000,
    "productionPerHour": 115,
    "updatedAt": "2025-01-20T10:00:00Z"
  }
]
```

**Codigo de referencia:** `apps/api/src/routes/empire.ts`

### 17.5.3 PATCH /api/empire

Actualiza el nombre del imperio.

**Request:**
```json
{ "name": "Nuevo Nombre" }
```

**Validaciones:**
- Minimo 3 caracteres
- Maximo 30 caracteres

**Response (200):** Empire actualizado

**Codigo de referencia:** `apps/api/src/routes/empire.ts`

## 17.6 Endpoints del Juego (/api/game)

### 17.6.1 GET /api/game/dashboard

El endpoint principal del juego. Sincroniza todo el estado del imperio.

**Flujo interno:**
```
1. syncEmpireGameState(empireId)
   - Finaliza edificios pendientes
   - Recalcula produccion
   - Acumula recursos con bonos de tech
   
2. Carga planeta con edificios
   - Finaliza construcciones pendientes
   - Normaliza tipos de edificio
   
3. Construye cola de construccion
   - Filtra edificios CONSTRUCTING/UPGRADING
   - Calcula progreso porcentual
   
4. Retorna DTO completo
```

**Response (200):**
```json
{
  "player": {
    "empireId": "uuid",
    "name": "Imperio",
    "level": 1,
    "xp": 0,
    "xpMax": 1000
  },
  "resources": {
    "metal": 15234,
    "plasma": 8921,
    "he3": 500,
    "credits": 10000,
    "metalCapacity": 50000,
    "plasmaCapacity": 50000,
    "he3Capacity": 25000,
    "metalProduction": 100,
    "plasmaProduction": 50,
    "he3Production": 0
  },
  "collected": {
    "metal": 234,
    "plasma": 121,
    "credits": 0
  },
  "planet": {
    "id": "uuid",
    "name": "Planeta Principal",
    "type": "HABITABLE",
    "maxBuildingSlots": 80,
    "buildings": [...]
  },
  "constructionQueue": [
    {
      "id": "uuid",
      "buildingType": "metal_extractor",
      "buildingName": "Extractor de Metal",
      "level": 1,
      "targetLevel": 2,
      "slotIndex": 0,
      "status": "UPGRADING",
      "endsAt": "2025-01-20T10:05:00Z",
      "progressPct": 45
    }
  ]
}
```

**Codigo de referencia:** `apps/api/src/routes/game.ts`

### 17.6.2 POST /api/game/resources/collect

Fuerza la recoleccion sincronizada de recursos.

**Response (200):** Misma estructura que `syncEmpireGameState`:
```json
{
  "resources": { /* GameResourcesDto */ },
  "collected": {
    "metal": 234,
    "plasma": 121,
    "credits": 0
  }
}
```

**Codigo de referencia:** `apps/api/src/routes/game.ts`

### 17.6.3 GET /api/game/buildings/:type/cost

Obtiene el costo de construccion de un edificio para un nivel especifico.

**Query params:**
```
?level=5
```

**Response (200):**
```json
{
  "type": "metal_extractor",
  "level": 5,
  "cost": {
    "metal": 304,
    "plasma": 51,
    "credits": 253
  },
  "timeSeconds": 300
}
```

**Codigo de referencia:** `apps/api/src/routes/game.ts`

### 17.6.4 POST /api/game/buildings/:id/upgrade

Mejora un edificio existente al siguiente nivel.

**Request:**
```json
{
  "slotIndex": 0,
  "type": "metal_extractor"
}
```

**Validaciones:**
- Edificio existe y pertenece al jugador
- Recursos suficientes
- Cola de construccion disponible (< 5)
- Nivel < 30

**Codigo de referencia:** `apps/api/src/routes/game.ts`

## 17.7 Endpoints de Planeta (/api/planets)

### 17.7.1 GET /api/planets/:id

Obtiene un planeta con todos sus edificios (finalizando los pendientes).

**Response (200):**
```json
{
  "id": "uuid",
  "empireId": "uuid",
  "name": "Planeta Principal",
  "galaxyX": 0,
  "galaxyY": 0,
  "type": "HABITABLE",
  "maxBuildingSlots": 80,
  "buildings": [...]
}
```

**Codigo de referencia:** `apps/api/src/routes/planet.ts`

### 17.7.2 POST /api/planets/:id/build

Construye un nuevo edificio o mejora uno existente.

**Request:**
```json
{
  "type": "metal_extractor",
  "slotIndex": 5
}
```

**Validaciones:**
- Planeta pertenece al jugador
- Tipo de edificio valido (en `API_BUILDABLE_TYPES`)
- Slot valido (0-79)
- Cola disponible
- No excede maximo por planeta
- Recursos suficientes
- Nivel <= 30

**Proceso:**
```
1. Normalizar tipo de edificio
2. Verificar slot disponible
3. Calcular costo para nivel objetivo
4. Verificar recursos
5. Deducir recursos
6. Crear/actualizar edificio
7. Establecer constructionEndsAt
8. Recalcular produccion
```

**Response (200):** Edificio creado/actualizado con `constructionEndsAt`

**Codigo de referencia:** `apps/api/src/routes/planet.ts`

## 17.8 Endpoints de Investigacion (/api/research)

### 17.8.1 GET /api/research

Lista todas las tecnologias con estado calculado para el imperio.

**Response (200):**
```json
{
  "technologies": [
    {
      "id": "uuid",
      "key": "INDUSTRIAL_AUTOMATION",
      "name": "Automatizacion Industrial",
      "description": "Reduce tiempo de construccion",
      "category": "INDUSTRIAL",
      "currentLevel": 0,
      "maxLevel": 5,
      "status": "AVAILABLE",
      "isMaxLevel": false,
      "prerequisiteMet": true,
      "prerequisiteName": null,
      "costs": {
        "metal": 200,
        "plasma": 100,
        "time": 600
      },
      "effects": {
        "type": "BUILD_TIME_REDUCTION",
        "value": 0.1,
        "description": "Reduce tiempo de construccion 10%"
      },
      "researchStatus": null
    }
  ]
}
```

**Codigo de referencia:** `apps/api/src/routes/research.ts`

### 17.8.2 POST /api/research/:technologyId/start

Inicia la investigacion de una tecnologia.

**Validaciones:**
- Tecnologia existe
- No hay investigacion activa (status RESEARCHING)
- Prerequisitos cumplidos
- Nivel < maxLevel
- Recursos suficientes

**Response (200):**
```json
{
  "success": true,
  "message": "Research started",
  "endsAt": "2025-01-20T11:00:00Z",
  "researchTime": 600
}
```

**Codigo de referencia:** `apps/api/src/routes/research.ts`

### 17.8.3 POST /api/research/sync

Completa investigaciones finalizadas.

**Response (200):**
```json
{
  "success": true,
  "completedCount": 1,
  "completedIds": ["tech-uuid-1"]
}
```

**Codigo de referencia:** `apps/api/src/routes/research.ts`

## 17.9 Endpoints del Astillero (/api/shipyard)

### 17.9.1 GET /api/shipyard

Lista todos los blueprints con estado de desbloqueo e inventario.

**Response (200):**
```json
{
  "hasShipyard": true,
  "blueprints": [
    {
      "id": "uuid",
      "key": "frigate_mk1",
      "name": "Frigate MK-I",
      "type": "COMBAT",
      "category": "COMBAT",
      "description": "Nave basica de combate",
      "stats": {
        "attack": 10,
        "defense": 5,
        "hp": 50,
        "speed": 20,
        "cargoCapacity": 100
      },
      "costs": {
        "metal": 200,
        "plasma": 100,
        "credits": 50
      },
      "buildTime": 60,
      "unlocked": true,
      "unlockRequirements": {
        "tech": null,
        "building": "SHIPYARD"
      },
      "inventory": 10,
      "activeConstruction": null
    }
  ],
  "activeConstructions": []
}
```

**Codigo de referencia:** `apps/api/src/routes/shipyard.ts`

### 17.9.2 POST /api/shipyard/build

Inicia la construccion de naves.

**Request:**
```json
{
  "blueprintId": "uuid",
  "quantity": 10
}
```

**Validaciones:**
- Quantity entre 1 y 100
- Blueprint existe
- Astillero construido (si requerido)
- Tecnologia requerida investigada (si aplica)
- Cola disponible (max 1 activa en MVP)
- Recursos suficientes

**Calculo de costos:**
```
// DEV mode
isDevCheapCosts = process.env.DEV_CHEAP_COSTS === 'true'
cost_multiplier = isDevCheapCosts ? 0.01 : 1

total_metal = max(1, floor(bp.costMetal × quantity × cost_multiplier))
total_plasma = max(1, floor(bp.costPlasma × quantity × cost_multiplier))
total_credits = max(1, floor(bp.costCredits × quantity × cost_multiplier))

// Reduccion por tech
automation_reduction = automation_level × 0.10
effective_time = floor(bp.buildTime × (1 - automation_reduction))

// DEV fast timers
time_multiplier = process.env.DEV_FAST_TIMERS === 'true' ? 0.1 : 1
total_time = floor(effective_time × quantity × time_multiplier)
```

**Response (200):**
```json
{
  "success": true,
  "message": "Started building 10 Frigate MK-I(s)",
  "endsAt": "2025-01-20T10:10:00Z",
  "buildTime": 600
}
```

**Codigo de referencia:** `apps/api/src/routes/shipyard.ts`

### 17.9.3 POST /api/shipyard/sync

Completa construcciones de naves finalizadas.

**Response (200):**
```json
{
  "success": true,
  "completedCount": 1,
  "completedShips": [
    {
      "blueprintId": "uuid",
      "name": "Frigate MK-I",
      "quantity": 10
    }
  ]
}
```

**Codigo de referencia:** `apps/api/src/routes/shipyard.ts`

### 17.9.4 GET /api/shipyard/ships

Obtiene el inventario completo de naves del imperio.

**Response (200):**
```json
{
  "ships": [
    {
      "id": "uuid",
      "blueprintId": "uuid",
      "name": "Frigate MK-I",
      "type": "COMBAT",
      "category": "COMBAT",
      "quantity": 10,
      "stats": {
        "attack": 10,
        "defense": 5,
        "hp": 50,
        "speed": 20,
        "cargoCapacity": 100
      }
    }
  ]
}
```

**Codigo de referencia:** `apps/api/src/routes/shipyard.ts`

## 17.10 Endpoints de Flotas (/api/fleets)

### 17.10.1 GET /api/fleets

Lista todas las flotas del imperio con sus formaciones.

**Response (200):**
```json
{
  "fleets": [
    {
      "id": "uuid",
      "name": "Flota Principal",
      "status": "IDLE",
      "totalPower": 850,
      "formations": [
        {
          "id": "uuid",
          "slotIndex": 0,
          "quantity": 10,
          "ship": {
            "blueprint": {
              "name": "Frigate MK-I",
              "attack": 10,
              "hp": 50,
              "defense": 5,
              "speed": 20
            }
          }
        }
      ]
    }
  ]
}
```

**Codigo de referencia:** `apps/api/src/routes/fleets.ts`

### 17.10.2 POST /api/fleets

Crea una nueva flota vacia.

**Request:**
```json
{ "name": "Nueva Flota" }
```

**Validaciones:**
- Nombre entre 1 y 50 caracteres

**Response (200):**
```json
{
  "fleet": {
    "id": "uuid",
    "name": "Nueva Flota",
    "status": "IDLE",
    "totalPower": 0
  }
}
```

**Codigo de referencia:** `apps/api/src/routes/fleets.ts`

### 17.10.3 POST /api/fleets/:id/assign-ships

Asigna naves del inventario a una flota.

**Request:**
```json
{
  "shipId": "uuid",
  "quantity": 5
}
```

**Validaciones:**
- Flota existe y pertenece al imperio
- Flota en estado IDLE
- Nave existe y pertenece al imperio
- Cantidad <= inventario disponible

**Proceso:**
```
1. Verificar flota IDLE
2. Verificar nave disponible
3. Transaccion:
   a. Decrementar cantidad en Ship
   b. Crear/actualizar FleetFormation
   c. Actualizar totalPower de Fleet
```

**Response (200):**
```json
{ "success": true }
```

**Codigo de referencia:** `apps/api/src/routes/fleets.ts`

### 17.10.4 POST /api/fleets/:id/remove-ships

Remueve naves de una flota de vuelta al inventario.

**Request:**
```json
{
  "shipId": "uuid",
  "quantity": 3
}
```

**Validaciones:**
- Flota IDLE
- Formacion existe con suficientes naves

**Response (200):**
```json
{ "success": true }
```

**Codigo de referencia:** `apps/api/src/routes/fleets.ts`

### 17.10.5 DELETE /api/fleets/:id

Disuelve una flota y devuelve todas las naves al inventario.

**Validaciones:**
- Flota IDLE
- Transaccion atomica para devolver todas las naves

**Response (200):**
```json
{ "success": true }
```

**Codigo de referencia:** `apps/api/src/routes/fleets.ts`

## 17.11 Endpoints de Misiones (/api/missions)

### 17.11.1 GET /api/missions

Lista todas las misiones PvE disponibles ordenadas por dificultad.

**Response (200):**
```json
{
  "missions": [
    {
      "id": "uuid",
      "name": "Patrulla Perimetral",
      "description": "Patrulla el perimetro de tu sistema",
      "difficulty": 1,
      "durationSeconds": 300,
      "minShipsRequired": 1,
      "recommendedPower": 100,
      "rewardMetal": 100,
      "rewardPlasma": 50,
      "rewardXp": 25,
      "rewardCredits": 10
    }
  ]
}
```

**Codigo de referencia:** `apps/api/src/routes/missions.ts`

### 17.11.2 GET /api/missions/active

Misiones actualmente en progreso con tiempo restante.

**Response (200):**
```json
{
  "activeMissions": [
    {
      "id": "uuid",
      "missionId": "uuid",
      "fleetId": "uuid",
      "status": "RUNNING",
      "result": null,
      "startedAt": "2025-01-20T10:00:00Z",
      "endsAt": "2025-01-20T10:05:00Z",
      "remainingSeconds": 180,
      "isComplete": false,
      "mission": { /* Mission data */ },
      "fleet": { /* Fleet data */ }
    }
  ]
}
```

**Codigo de referencia:** `apps/api/src/routes/missions.ts`

### 17.11.3 POST /api/missions/:missionId/start

Inicia una mision con una flota.

**Request:**
```json
{ "fleetId": "uuid" }
```

**Validaciones:**
- Mision existe
- Flota pertenece al imperio y esta IDLE
- Flota tiene suficientes naves (>= minShipsRequired)
- Flota no esta en otra mision

**Proceso:**
```
1. Verificar fleet IDLE
2. Cambiar fleet.status a ON_MISSION
3. Crear MissionRun (RUNNING)
4. Calcular endsAt = now + durationSeconds
```

**Response (200):**
```json
{
  "missionRun": { /* MissionRun */ },
  "endsAt": "2025-01-20T10:05:00Z"
}
```

**Codigo de referencia:** `apps/api/src/routes/missions.ts`

### 17.11.4 POST /api/missions/sync

Sincroniza y completa misiones finalizadas.

**Proceso:**
```
Para cada MissionRun RUNNING:
    si now >= startedAt + durationSeconds:
        1. status = COMPLETED
        2. result = WIN
        3. rewardsGiven = true
        4. fleet.status = IDLE
        5. Incrementar recursos segun recompensas
        6. Agregar a "completed"
    sino:
        Agregar a "stillRunning" con remainingSeconds
```

**Response (200):**
```json
{
  "completed": [
    {
      "missionRunId": "uuid",
      "missionName": "Patrulla Perimetral",
      "rewards": {
        "metal": 100,
        "plasma": 50,
        "credits": 10,
        "xp": 25
      }
    }
  ],
  "stillRunning": [
    {
      "missionRunId": "uuid",
      "remainingSeconds": 180
    }
  ]
}
```

**Codigo de referencia:** `apps/api/src/routes/missions.ts`

### 17.11.5 GET /api/missions/history

Historial de misiones completadas (ultimas 50).

**Response (200):**
```json
{
  "history": [ /* MissionRun array */ ]
}
```

**Codigo de referencia:** `apps/api/src/routes/missions.ts`

## 17.12 Endpoints de Chat (/api/chat)

### 17.12.1 GET /api/chat

Obtiene mensajes del chat (global o de alianza).

**Response (200):**
```json
{
  "messages": [
    {
      "id": "uuid",
      "sender": "username",
      "message": "texto",
      "timestamp": "2025-01-20T10:00:00Z"
    }
  ]
}
```

### 17.12.2 POST /api/chat

Envia un mensaje.

**Request:**
```json
{
  "message": "texto del mensaje"
}
```

## 17.13 Endpoints de Batalla (/api/battles)

### 17.13.1 POST /api/battles

Inicia una nueva batalla.

**Request:**
```json
{
  "fleetId": "uuid",
  "targetType": "MISSION",
  "targetId": "uuid"
}
```

### 17.13.2 POST /api/battles/:id

Simula una ronda de batalla.

**Request:**
```json
{
  "round": 1
}
```

### 17.13.3 POST /api/battles/:id/result

Obtiene el resultado final de una batalla.

**Response (200):**
```json
{
  "result": "WIN",
  "rounds": [ /* Round data */ ],
  "xpGained": 150,
  "creditsGained": 50,
  "losses": [
    {
      "blueprintId": "uuid",
      "quantity": 2
    }
  ]
}
```

---

# 18. ESQUEMA DE BASE DE DATOS

## 18.1 Vision General

La base de datos utiliza PostgreSQL con Prisma ORM. El esquema esta definido en:

```
/mnt/agents/go2-project/packages/database/prisma/schema.prisma
```

## 18.2 Modelos Principales

### 18.2.1 User

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String   @map("password_hash")
  username      String   @unique
  createdAt     DateTime @default(now()) @map("created_at")
  lastLoginAt   DateTime? @map("last_login_at")
  isActive      Boolean  @default(true) @map("is_active")

  empire        Empire?

  @@map("users")
}
```

| Campo | Tipo | Constraints | Descripcion |
|-------|------|-------------|-------------|
| id | UUID | PK, default(uuid) | Identificador unico |
| email | String | Unique | Email del usuario |
| passwordHash | String | — | Hash bcrypt de la contrasena |
| username | String | Unique | Nombre visible |
| createdAt | DateTime | default(now) | Fecha de registro |
| lastLoginAt | DateTime | Nullable | Ultimo login |
| isActive | Boolean | default(true) | Cuenta activa |

**Relaciones:**
- 1:1 con Empire (a traves de user.empire)

### 18.2.2 Empire

```prisma
model Empire {
  id            String   @id @default(uuid())
  userId        String   @unique @map("user_id")
  name          String
  level         Int      @default(1)
  experience    Int      @default(0)
  createdAt     DateTime @default(now()) @map("created_at")
  lastActiveAt  DateTime @default(now()) @map("last_active_at")

  user          User     @relation(fields: [userId], references: [id])
  resources     Resource[]
  planets       Planet[]
  technologies  EmpireTechnology[]
  ships         Ship[]
  fleets        Fleet[]
  shipConstructions ShipConstruction[]
  commanders    Commander[]

  @@map("empires")
}
```

| Campo | Tipo | Constraints | Descripcion |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador |
| userId | String | FK, Unique | Referencia a User |
| name | String | — | Nombre del imperio |
| level | Int | default(1) | Nivel del imperio |
| experience | Int | default(0) | XP acumulado |
| createdAt | DateTime | default(now) | Creacion |
| lastActiveAt | DateTime | default(now) | Ultima actividad |

**Relaciones:**
- 1:1 con User
- 1:N con Resource
- 1:N con Planet
- 1:N con EmpireTechnology
- 1:N con Ship
- 1:N con Fleet
- 1:N con ShipConstruction
- 1:N con Commander

### 18.2.3 Resource

```prisma
model Resource {
  id                  String   @id @default(uuid())
  empireId            String   @map("empire_id")
  type                String
  amount              Int      @default(0)
  capacity            Int      @default(1000)
  productionPerHour   Int      @default(0) @map("production_per_hour")
  updatedAt           DateTime @default(now()) @map("updated_at")

  empire              Empire   @relation(fields: [empireId], references: [id])

  @@unique([empireId, type])
  @@map("resources")
}
```

| Campo | Tipo | Constraints | Descripcion |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador |
| empireId | String | FK | Referencia a Empire |
| type | String | — | METAL, PLASMA, CREDITS, HE3 |
| amount | Int | default(0) | Cantidad actual |
| capacity | Int | default(1000) | Capacidad maxima |
| productionPerHour | Int | default(0) | Produccion por hora |
| updatedAt | DateTime | default(now) | Ultima actualizacion |

**Constraints:**
- @@unique([empireId, type]) — Solo un recurso de cada tipo por imperio

**Tipos Validos:**
- `METAL` — Metal
- `PLASMA` — Plasma (Gas en GO2)
- `CREDITS` — Creditos/Gold
- `HE3` — Helio-3 (combustible de combate)

### 18.2.4 Planet

```prisma
model Planet {
  id                String   @id @default(uuid())
  empireId          String   @map("empire_id")
  name              String   @default("Planeta Principal")
  galaxyX           Int      @default(0) @map("galaxy_x")
  galaxyY           Int      @default(0) @map("galaxy_y")
  type              String   @default("HABITABLE")
  maxBuildingSlots  Int      @default(80) @map("max_building_slots")
  createdAt         DateTime @default(now()) @map("created_at")

  empire            Empire   @relation(fields: [empireId], references: [id])
  buildings         Building[]

  @@map("planets")
}
```

| Campo | Tipo | Constraints | Descripcion |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador |
| empireId | String | FK | Referencia a Empire |
| name | String | default("Planeta Principal") | Nombre |
| galaxyX | Int | default(0) | Coordenada X |
| galaxyY | Int | default(0) | Coordenada Y |
| type | String | default("HABITABLE") | Tipo de planeta |
| maxBuildingSlots | Int | default(80) | Maximo de slots |
| createdAt | DateTime | default(now) | Creacion |

**Relaciones:**
- N:1 con Empire
- 1:N con Building

### 18.2.5 Building

```prisma
model Building {
  id                    String   @id @default(uuid())
  planetId              String   @map("planet_id")
  type                  String
  level                 Int      @default(1)
  slotIndex             Int      @map("slot_index")
  status                String   @default("IDLE")
  constructionEndsAt    DateTime? @map("construction_ends_at")

  planet                Planet   @relation(fields: [planetId], references: [id])

  @@unique([planetId, slotIndex])
  @@map("buildings")
}
```

| Campo | Tipo | Constraints | Descripcion |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador |
| planetId | String | FK | Referencia a Planet |
| type | String | — | Tipo de edificio (canonical) |
| level | Int | default(1) | Nivel actual |
| slotIndex | Int | — | Posicion en grid (0-79) |
| status | String | default("IDLE") | IDLE, CONSTRUCTING, UPGRADING |
| constructionEndsAt | DateTime | Nullable | Timestamp de finalizacion |

**Constraints:**
- @@unique([planetId, slotIndex]) — Solo un edificio por slot

**Tipos Validos (canonical):**
- `metal_extractor`, `plasma_refinery`, `he3_extractor`
- `warehouse`, `energy_generator`
- `control_center`, `research_lab`, `trading_center`
- `shipyard`, `hangar`
- `defense_turret`, `radar`
- `residential_area`

### 18.2.6 Technology

```prisma
model Technology {
  id            String   @id @default(uuid())
  key           String   @unique
  name          String
  description   String
  category      String   @default("GENERAL")
  requiredTechId String? @map("required_tech_id")
  baseCostMetal     Int      @default(100) @map("base_cost_metal")
  baseCostPlasma    Int      @default(50) @map("base_cost_plasma")
  baseResearchTime  Int      @default(300) @map("base_research_time")
  maxLevel      Int      @default(5) @map("max_level")
  effectType    String?  @map("effect_type")
  effectValue   Float    @default(0) @map("effect_value")
  effectDescription String? @map("effect_description")

  requiredTech  Technology? @relation("TechRequirements", fields: [requiredTechId], references: [id])
  unlockedTechs Technology[] @relation("TechRequirements")
  empireTechs   EmpireTechnology[]

  @@map("technologies")
}
```

| Campo | Tipo | Constraints | Descripcion |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador |
| key | String | Unique | Clave unica (ej: INDUSTRIAL_AUTOMATION) |
| name | String | — | Nombre display |
| description | String | — | Descripcion |
| category | String | default("GENERAL") | Categoria |
| requiredTechId | String | FK, Nullable | Prerequisito |
| baseCostMetal | Int | default(100) | Costo base de metal |
| baseCostPlasma | Int | default(50) | Costo base de plasma |
| baseResearchTime | Int | default(300) | Tiempo base en segundos |
| maxLevel | Int | default(5) | Nivel maximo |
| effectType | String | Nullable | Tipo de efecto |
| effectValue | Float | default(0) | Valor del efecto |
| effectDescription | String | Nullable | Descripcion del efecto |

**Relaciones:**
- Self-reference para prerequisitos (requiredTech <-> unlockedTechs)
- 1:N con EmpireTechnology

### 18.2.7 EmpireTechnology

```prisma
model EmpireTechnology {
  id              String   @id @default(uuid())
  empireId        String   @map("empire_id")
  technologyId    String   @map("technology_id")
  level           Int      @default(0)
  status          String   @default("LOCKED")
  researchStartedAt DateTime? @map("research_started_at")
  researchEndsAt  DateTime? @map("research_ends_at")

  empire          Empire   @relation(fields: [empireId], references: [id])
  technology      Technology @relation(fields: [technologyId], references: [id])

  @@unique([empireId, technologyId])
  @@map("empire_technologies")
}
```

| Campo | Tipo | Constraints | Descripcion |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador |
| empireId | String | FK | Referencia a Empire |
| technologyId | String | FK | Referencia a Technology |
| level | Int | default(0) | Nivel actual (0 = no investigada) |
| status | String | default("LOCKED") | LOCKED, AVAILABLE, RESEARCHING, COMPLETED |
| researchStartedAt | DateTime | Nullable | Inicio de investigacion |
| researchEndsAt | DateTime | Nullable | Fin estimado |

**Constraints:**
- @@unique([empireId, technologyId]) — Solo una entrada por par

### 18.2.8 Blueprint

```prisma
model Blueprint {
  id              String   @id @default(uuid())
  name            String
  key             String   @unique
  type            String
  description     String
  category        String   @default("COMBAT")
  requiredTechId  String?  @map("required_technology_id")
  requiredBuildingType String? @map("required_building_type")
  costMetal       Int      @default(0) @map("cost_metal")
  costPlasma      Int      @default(0) @map("cost_plasma")
  costCredits     Int      @default(0) @map("cost_credits")
  buildTime       Int      @default(0) @map("build_time")
  attack          Int      @default(0)
  hp              Int      @default(0)
  defense         Int      @default(0)
  speed           Int      @default(0)
  cargoCapacity   Int      @default(0) @map("cargo_capacity")
  ppcCount        Int      @default(0) @map("ppc_count")
  armorType       String   @default("regen") @map("armor_type")
  weaponSlots     Json     @default("{}") @map("weapon_slots")
  moduleSlots     Json     @default("{}") @map("module_slots")
  he3Consumption  Int      @default(0) @map("he3_consumption")

  ships           Ship[]
  constructions   ShipConstruction[]

  @@map("blueprints")
}
```

| Campo | Tipo | Constraints | Descripcion |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador |
| name | String | — | Nombre del plano |
| key | String | Unique | Clave interna |
| type | String | — | Tipo de nave |
| description | String | — | Descripcion |
| category | String | default("COMBAT") | COMBAT, CIVIL, TRANSPORT |
| requiredTechId | String | FK, Nullable | Tech requerida |
| requiredBuildingType | String | Nullable | Edificio requerido |
| costMetal | Int | default(0) | Costo en metal |
| costPlasma | Int | default(0) | Costo en plasma |
| costCredits | Int | default(0) | Costo en credits |
| buildTime | Int | default(0) | Tiempo en segundos |
| attack | Int | default(0) | Ataque base |
| hp | Int | default(0) | HP/estructura |
| defense | Int | default(0) | Defensa |
| speed | Int | default(0) | Velocidad |
| cargoCapacity | Int | default(0) | Capacidad de carga |
| ppcCount | Int | default(0) | PPC integrados |
| armorType | String | default("regen") | regen, neutralizing, nano, chrome |
| weaponSlots | Json | default("{}") | Slots de armas |
| moduleSlots | Json | default("{}") | Slots de modulos |
| he3Consumption | Int | default(0) | He3 por modulo |

### 18.2.9 Ship

```prisma
model Ship {
  id            String   @id @default(uuid())
  empireId      String   @map("empire_id")
  blueprintId   String   @map("blueprint_id")
  quantity      Int      @default(0)
  status        String   @default("AVAILABLE")
  fleetId       String?  @map("fleet_id")
  createdAt     DateTime @default(now()) @map("created_at")

  empire        Empire   @relation(fields: [empireId], references: [id])
  blueprint     Blueprint @relation(fields: [blueprintId], references: [id])
  fleetFormations FleetFormation[]

  @@map("ships")
}
```

| Campo | Tipo | Constraints | Descripcion |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador |
| empireId | String | FK | Referencia a Empire |
| blueprintId | String | FK | Referencia a Blueprint |
| quantity | Int | default(0) | Cantidad en inventario |
| status | String | default("AVAILABLE") | AVAILABLE, ASSIGNED |
| fleetId | String | FK, Nullable | Flota asignada |
| createdAt | DateTime | default(now) | Creacion |

### 18.2.10 ShipConstruction

```prisma
model ShipConstruction {
  id            String   @id @default(uuid())
  empireId      String   @map("empire_id")
  blueprintId   String   @map("blueprint_id")
  quantity      Int      @default(1)
  status        String   @default("QUEUED")
  startedAt     DateTime @default(now()) @map("started_at")
  endsAt        DateTime @map("ends_at")
  completedAt   DateTime? @map("completed_at")
  createdAt     DateTime @default(now()) @map("created_at")

  empire        Empire   @relation(fields: [empireId], references: [id])
  blueprint     Blueprint @relation(fields: [blueprintId], references: [id])

  @@map("ship_constructions")
}
```

| Campo | Tipo | Constraints | Descripcion |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador |
| empireId | String | FK | Referencia a Empire |
| blueprintId | String | FK | Referencia a Blueprint |
| quantity | Int | default(1) | Cantidad a construir |
| status | String | default("QUEUED") | QUEUED, BUILDING, COMPLETED |
| startedAt | DateTime | default(now) | Inicio |
| endsAt | DateTime | — | Fin estimado |
| completedAt | DateTime | Nullable | Fin real |
| createdAt | DateTime | default(now) | Creacion |

### 18.2.11 Commander

```prisma
model Commander {
  id          String   @id @default(uuid())
  empireId    String   @map("empire_id")
  name        String
  rarity      String
  level       Int      @default(1)
  stars       Int      @default(1)
  accuracy    Int      @default(5)
  speed       Int      @default(5)
  dodge       Int      @default(5)
  electron    Int      @default(5)
  skill       String   @default("")
  status      String   @default("AVAILABLE")
  gemSlots    Json     @default("{...}")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  empire      Empire   @relation(fields: [empireId], references: [id])

  @@map("commanders")
}
```

| Campo | Tipo | Constraints | Descripcion |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador |
| empireId | String | FK | Referencia a Empire |
| name | String | — | Nombre |
| rarity | String | — | common, super, legendary, divine |
| level | Int | default(1) | Nivel (1-100) |
| stars | Int | default(1) | Estrellas (1-6) |
| accuracy | Int | default(5) | Precision |
| speed | Int | default(5) | Velocidad |
| dodge | Int | default(5) | Esquiva |
| electron | Int | default(5) | Critico |
| skill | String | default("") | Habilidad especial |
| status | String | default("AVAILABLE") | AVAILABLE, INJURED, HOSPITAL |
| gemSlots | Json | Default 4 slots | Gemas equipadas |

### 18.2.12 Fleet

```prisma
model Fleet {
  id            String   @id @default(uuid())
  empireId      String   @map("empire_id")
  name          String
  status        String   @default("IDLE")
  planetId      String?  @map("planet_id")
  totalPower    Int      @default(0) @map("total_power")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  empire        Empire   @relation(fields: [empireId], references: [id])
  formations    FleetFormation[]
  missionRuns   MissionRun[]

  @@map("fleets")
}
```

| Campo | Tipo | Constraints | Descripcion |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador |
| empireId | String | FK | Referencia a Empire |
| name | String | — | Nombre de la flota |
| status | String | default("IDLE") | IDLE, ON_MISSION, MOVING, IN_BATTLE |
| planetId | String | FK, Nullable | Planeta actual |
| totalPower | Int | default(0) | Poder total calculado |

### 18.2.13 FleetFormation

```prisma
model FleetFormation {
  id            String   @id @default(uuid())
  fleetId       String   @map("fleet_id")
  slotIndex     Int      @map("slot_index")
  shipId        String   @map("ship_id")
  quantity      Int      @default(0)

  fleet         Fleet    @relation(fields: [fleetId], references: [id], onDelete: Cascade)
  ship          Ship     @relation(fields: [shipId], references: [id])

  @@unique([fleetId, slotIndex])
  @@map("fleet_formations")
}
```

| Campo | Tipo | Constraints | Descripcion |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador |
| fleetId | String | FK, onDelete: Cascade | Referencia a Fleet |
| slotIndex | Int | — | Posicion en formacion |
| shipId | String | FK | Referencia a Ship |
| quantity | Int | default(0) | Naves en esta formacion |

### 18.2.14 Mission

```prisma
model Mission {
  id                  String   @id @default(uuid())
  name                String
  description         String
  difficulty          Int
  durationSeconds     Int      @default(300) @map("duration_seconds")
  minShipsRequired    Int      @default(1) @map("min_ships_required")
  recommendedPower    Int      @map("recommended_power")
  enemyFleetConfig    String   @map("enemy_fleet_config")
  rewardMetal         Int      @default(0) @map("reward_metal")
  rewardPlasma        Int      @default(0) @map("reward_plasma")
  rewardXp            Int      @default(0) @map("reward_xp")
  rewardCredits       Int      @default(0) @map("reward_credits")

  missionRuns         MissionRun[]

  @@map("missions")
}
```

| Campo | Tipo | Constraints | Descripcion |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador |
| name | String | — | Nombre de la mision |
| description | String | — | Descripcion |
| difficulty | Int | — | Dificultad (1-10) |
| durationSeconds | Int | default(300) | Duracion en segundos |
| minShipsRequired | Int | default(1) | Naves minimas |
| recommendedPower | Int | — | Poder recomendado |
| enemyFleetConfig | String | — | Config JSON de flota enemiga |
| rewardMetal | Int | default(0) | Recompensa metal |
| rewardPlasma | Int | default(0) | Recompensa plasma |
| rewardXp | Int | default(0) | Recompensa XP |
| rewardCredits | Int | default(0) | Recompensa credits |

### 18.2.15 MissionRun

```prisma
model MissionRun {
  id            String   @id @default(uuid())
  empireId      String   @map("empire_id")
  missionId     String   @map("mission_id")
  fleetId       String   @map("fleet_id")
  status        String   @default("RUNNING")
  result        String?
  rewardsGiven  Boolean  @default(false) @map("rewards_given")
  startedAt     DateTime @default(now()) @map("started_at")
  completedAt   DateTime? @map("completed_at")

  mission       Mission  @relation(fields: [missionId], references: [id])
  fleet         Fleet    @relation(fields: [fleetId], references: [id])

  @@map("mission_runs")
}
```

### 18.2.16 Battle

```prisma
model Battle {
  id                String   @id @default(uuid())
  empireId          String   @map("empire_id")
  missionRunId      String?  @map("mission_run_id")
  fleetId           String   @map("fleet_id")
  result            String?
  rounds            String?
  seed              String?
  xpGained          Int      @default(0) @map("xp_gained")
  creditsGained     Int      @default(0) @map("credits_gained")
  createdAt         DateTime @default(now()) @map("created_at")

  losses            BattleLoss[]

  @@map("battles")
}
```

### 18.2.17 BattleLoss

```prisma
model BattleLoss {
  id            String   @id @default(uuid())
  battleId      String   @map("battle_id")
  blueprintId   String   @map("blueprint_id")
  quantity      Int

  battle        Battle   @relation(fields: [battleId], references: [id])

  @@map("battle_losses")
}
```

### 18.2.18 ConstructionQueue

```prisma
model ConstructionQueue {
  id              String   @id @default(uuid())
  empireId        String   @map("empire_id")
  type            String
  targetId        String   @map("target_id")
  targetPlanetId  String?  @map("target_planet_id")
  quantity        Int      @default(1)
  startedAt       DateTime @default(now()) @map("started_at")
  endsAt          DateTime @map("ends_at")
  completed       Boolean  @default(false)

  @@map("construction_queue")
}
```

### 18.2.19 Alliance

```prisma
model Alliance {
  id          String   @id @default(uuid())
  name        String   @unique
  tag         String   @unique
  description String   @default("")
  leaderId    String   @unique @map("leader_id")
  memberCount Int      @default(1) @map("member_count")
  maxMembers  Int      @default(50) @map("max_members")
  createdAt   DateTime @default(now()) @map("created_at")

  members     AllianceMember[]

  @@map("alliances")
}
```

### 18.2.20 AllianceMember

```prisma
model AllianceMember {
  id         String   @id @default(uuid())
  allianceId String   @map("alliance_id")
  empireId   String   @unique @map("empire_id")
  role       String   @default("MEMBER")
  joinedAt   DateTime @default(now()) @map("joined_at")

  alliance   Alliance @relation(fields: [allianceId], references: [id], onDelete: Cascade)

  @@map("alliance_members")
}
```

## 18.3 Diagrama ER

```
+----------------+     +----------------+     +----------------+
|     User       |-----|    Empire      |-----|   Resource     |
+----------------+ 1:1 +----------------+ 1:N +----------------+
                       |                |     |  [METAL,PLASMA, |
                       |                |     |   CREDITS,HE3] |
                       |                |     +----------------+
                       |                |
                       |                |-----+----------------+
                       |                |     |    Planet      |
                       |                |     +----------------+
                       |                |     |    Building    |
                       |                |     +----------------+
                       |                |
                       |                |-----+----------------+
                       |                |     | EmpireTechnology|
                       |                |     +----------------+
                       |                |
                       |                |-----+----------------+
                       |                |     |     Ship       |
                       |                |     +----------------+
                       |                |
                       |                |-----+----------------+
                       |                |     |     Fleet      |
                       |                |     +----------------+
                       |                |     |FleetFormation  |
                       |                |     +----------------+
                       |                |
                       |                |-----+----------------+
                       |                |     |   Commander    |
                       |                |     +----------------+
                       |                |
                       |                |-----+----------------+
                       |                |     |ShipConstruction|
                       |                |     +----------------+
                       |                |
                       |                |-----+----------------+
                       |                |     |   MissionRun   |
                       |                |     +----------------+

+----------------+     +----------------+
|  Technology    |-----|EmpireTechnology|
+----------------+ 1:N +----------------+
  | (self-ref)
  v
+----------------+
|  Technology    |
+----------------+

+----------------+     +----------------+
|   Alliance     |-----| AllianceMember |
+----------------+ 1:N +----------------+
```

## 18.4 Migraciones

### 18.4.1 Comando de Migracion

```bash
cd /mnt/agents/go2-project
npx prisma migrate dev --name <nombre_migracion>
```

### 18.4.2 Generacion de Cliente

```bash
npx prisma generate
```

### 18.4.3 Seed de Datos

Los datos iniciales (blueprints, technologies, missions) deben insertarse via seed script.

---

# 19. DESPLIEGUE

## 19.1 Plataforma: Railway

### 19.1.1 Configuracion

El proyecto se despliega en Railway usando el builder Railpack.

**Archivo `railway.toml`:**
```toml
[build]
builder = "railpack"
```

### 19.1.2 Servicios

| Servicio | Tipo | Descripcion |
|----------|------|-------------|
| **API** | Web Service | Aplicacion Fastify |
| **PostgreSQL** | Database | Base de datos persistente |

## 19.2 Variables de Entorno

### 19.2.1 Variables Requeridas

| Variable | Descripcion | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexion PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secreto para firmar JWTs | `super-secret-key-change-in-prod` |
| `PORT` | Puerto del servidor | `3001` |

### 19.2.2 Variables de Desarrollo

| Variable | Descripcion | Valor Tipico |
|----------|-------------|--------------|
| `DEV_CHEAP_COSTS` | Costos reducidos al 1% | `true` |
| `DEV_FAST_TIMERS` | Tiemos al 10% | `true` |
| `DEV_HIGH_STARTING_RESOURCES` | Recursos iniciales altos | `true` |

### 19.2.3 Archivo .env.example

```env
DATABASE_URL=postgresql://user:password@localhost:5432/galaxy_online_3
JWT_SECRET=dev-secret-change-in-production
PORT=3001

# Development helpers (never in production!)
DEV_CHEAP_COSTS=true
DEV_FAST_TIMERS=true
DEV_HIGH_STARTING_RESOURCES=true
```

## 19.3 Proceso de Deploy

### 19.3.1 Steps

```bash
# 1. Login a Railway
railway login

# 2. Link proyecto
cd /mnt/agents/go2-project
railway link

# 3. Deploy
railway up
```

### 19.3.2 Health Check

```
GET /health
Response: { "status": "ok", "time": "2025-01-20T10:00:00.000Z" }
```

## 19.4 Base de Datos en Railway

### 19.4.1 Configuracion

La base de datos PostgreSQL se provisiona automaticamente en Railway.

### 19.4.2 Connection String

```
postgresql://${{ Postgres.PGUSER }}:${{ Postgres.PGPASSWORD }}@${{ Postgres.PGHOST }}:${{ Postgres.PGPORT }}/${{ Postgres.PGDATABASE }}
```

## 19.5 Monitoreo

### 19.5.1 Logs

```bash
railway logs
```

### 19.5.2 Metricas

Railway proporciona metricas de:
- CPU usage
- Memory usage
- Request count
- Response times

---

# 20. DISCREPANCIAS CONOCIDAS

## 20.1 Tabla Maestra de Discrepancias

Esta tabla enumera TODAS las diferencias conocidas entre GO2 (original) y GO3 (nuestra implementacion). Cada discrepancia tiene un ID unico para referencia en tickets y PRs.

| ID | Discrepancia | GO2 (Original) | GO3 (Actual) | Fix Requerido | Prioridad | Estado |
|----|-------------|----------------|--------------|---------------|-----------|--------|
| **D01** | Recurso "Plasma" vs "Gas" | GO2 usa "Gas" como recurso secundario | Usamos "Plasma" | Cambiar a "Gas" en UI o documentar decision | Baja | Documentado |
| **D02** | Weapon Expertise S/A/B/C/D | Afecta dano infligido: +30%/+10%/0%/-10%/-30% | **NO implementado** | Anadir multiplicador de expertise al BattleEngine | **CRITICA** | Pendiente |
| **D03** | Ship Expertise S/A/B/C/D | Afecta dano recibido e infligido | **NO implementado** | Anadir bonos de ship expertise al engine | **CRITICA** | Pendiente |
| **D04** | Ship-Based Cooldown | **4 rondas** de cooldown | Tenemos **3** | Corregir cooldown a 4 en el BattleEngine | **ALTA** | Pendiente |
| **D05** | Ship Movement | Recomendado 4/4/5/6 por tipo de arma | **No implementado** | Anadir sistema de movimiento de naves | MEDIA | Pendiente |
| **D06** | Tiamat Armor Scatter | Chrome armor NO toma scatter extra de misiles | No diferenciado en engine | Anadir check de chrome armor para scatter de misiles | **ALTA** | Pendiente |
| **D07** | Energy Armor / Daedalus | Solo afectan dano a hull (no escudos) | Aplican a TODO el dano | Corregir para que solo afecten dano post-shield | **ALTA** | Pendiente |
| **D08** | EOS + Scatter Reduction | EOS reduce scatter ademas de doble absorb | Solo doble absorb implementado | Anadir reduccion de scatter al EOS | MEDIA | Pendiente |

## 20.2 Detalle de Discrepancias

### D01 — Recurso "Plasma" vs "Gas"

**Descripcion:** Nuestro sistema usa "PLASMA" como nombre del recurso secundario, mientras que GO2 usa "GAS".

**Impacto:** Bajo. Solo afecta la fidelidad visual.

**Decision recomendada:** Mantener "PLASMA" internamente en la DB (cambiarlo seria una migracion costosa) pero mostrar "Gas" en la UI para fidelidad con GO2.

**Archivos afectados:**
- `packages/shared/src/resources.ts` — normalizacion
- `packages/shared/src/economyConfig.ts` — constantes
- `apps/api/src/routes/auth.ts` — seed
- Frontend (mostrar "Gas" en lugar de "Plasma")

### D02 — Weapon Expertise

**Descripcion:** El sistema de Weapon Expertise (S/A/B/C/D) que afecta el dano infligido NO esta implementado.

**Impacto:** **CRITICO**. Afecta directamente el balance de combate.

**Implementacion requerida:**
```typescript
function getWeaponExpertiseBonus(grade: 'S'|'A'|'B'|'C'|'D'): number {
  switch(grade) {
    case 'S': return 0.30;  // +30%
    case 'A': return 0.10;  // +10%
    case 'B': return 0.00;  // 0%
    case 'C': return -0.10; // -10%
    case 'D': return -0.30; // -30%
  }
}

// En BattleEngine Paso 3:
damage = damage × (1 + getWeaponExpertiseBonus(commander.weaponExpertise[weaponType]))
```

**Archivos a modificar:**
- `BattleEngine.ts` — Paso 3 (Calculate Damage)
- Schema: Anadir campo `weaponExpertise` al modelo Commander

### D03 — Ship Expertise

**Descripcion:** El sistema de Ship Expertise (S/A/B/C/D) que afecta dano recibido e infligido NO esta implementado.

**Impacto:** **CRITICO**. Afecta el balance defensivo y ofensivo.

**Implementacion requerida:**
```typescript
function getShipExpertiseDealtBonus(grade: 'S'|'A'|'B'|'C'|'D'): number {
  switch(grade) {
    case 'S': return 0.10;  // +10% dano infligido
    case 'A': return 0.05;  // +5%
    case 'B': return 0.00;
    case 'C': return -0.05; // -5%
    case 'D': return -0.10; // -10%
  }
}

function getShipExpertiseReceivedBonus(grade: 'S'|'A'|'B'|'C'|'D'): number {
  switch(grade) {
    case 'S': return -0.10; // -10% dano recibido
    case 'A': return -0.10; // -10%
    case 'B': return 0.00;
    case 'C': return 0.10;  // +10% dano recibido
    case 'D': return 0.10;  // +10%
  }
}
```

**Archivos a modificar:**
- `BattleEngine.ts` — Pasos 3 y 7
- Schema: Anadir campo `shipExpertise` al modelo Commander

### D04 — Ship-Based Cooldown

**Descripcion:** Ship-Based weapons tienen cooldown 3 en lugar de 4.

**Impacto:** **ALTA**. Afecta significativamente el DPS de Ship-Based.

**Fix:**
```typescript
// En BattleEngine:
const WEAPON_COOLDOWNS = {
  BALLISTIC: 0,
  DIRECTIONAL: 1,
  MISSILE: 2,
  SHIP_BASED: 4,  // Corregir de 3 a 4
};
```

### D05 — Ship Movement

**Descripcion:** El sistema de movimiento de naves no esta implementado.

**Impacto:** MEDIA. Afecta la estrategia de posicionamiento en combate.

**Requisitos GO2:**
```
Ballistic weapons:  al menos 4 movimiento
Directional weapons: al menos 4 movimiento
Missile weapons:     al menos 5 movimiento
Ship-Based weapons:  al menos 6 movimiento
```

### D06 — Tiamat Chrome Armor

**Descripcion:** Chrome armor (como Tiamat) no toma scatter extra de misiles. Esto no esta diferenciado.

**Impacto:** **ALTA**. Afecta el balance de nave Tiamat.

**Fix requerido:**
```typescript
function calculateScatterDamage(weaponType, targetArmor, baseDamage, scatterPercent) {
  let scatterDamage = baseDamage * scatterPercent;
  
  // Si es misil Y el armor NO es chrome, aplicar bonus de scatter
  if (weaponType === 'MISSILE' && targetArmor !== 'chrome') {
    scatterDamage *= MISSILE_SCATTER_MULTIPLIER;
  }
  // Si es chrome armor, NO aplicar bonus (scatter normal)
  
  return scatterDamage;
}
```

### D07 — Energy Armor / Daedalus

**Descripcion:** Energy Armor y Daedalus Control System deberian SOLO afectar dano a hull, no a escudos.

**Impacto:** **ALTA**. Afecta significativamente la defensiva.

**Fix:**
```typescript
// En BattleEngine:
// Paso 4 (Damage Negation) — NO incluir Energy Armor / Daedalus
// Paso 7 (Hull Damage) — SI incluir Energy Armor / Daedalus

const hullOnlyDefenses = ['energy_armor', 'daedalus_control'];
```

### D08 — EOS Scatter Reduction

**Descripcion:** EOS deberia reducir scatter ademas de su absorcion doble.

**Impacto:** MEDIA. Afecta la defensiva contra builds de scatter.

**Fix:**
```typescript
function applyEosDamage(eosShield, damage, isScatter = false) {
  let absorptionMultiplier = 1.0;
  
  // Absorcion doble (30% chance)
  if (Math.random() < 0.30) {
    absorptionMultiplier = 2.0;
  }
  
  // Reduccion de scatter (discrepancia D08)
  if (isScatter) {
    damage *= (1 - EOS_SCATTER_REDUCTION);  // Anadir esto
  }
  
  return eosShield - (damage * absorptionMultiplier);
}
```

## 20.3 Prioridad de Fixes

```
CRITICA (afectan balance fundamental):
  D02 — Weapon Expertise
  D03 — Ship Expertise

ALTA (afectan mecanicas clave):
  D04 — Ship-Based Cooldown
  D06 — Tiamat Armor
  D07 — Energy Armor/Daedalus

MEDIA (mejoras de fidelidad):
  D05 — Ship Movement
  D08 — EOS Scatter Reduction

BAJA (cosmetico):
  D01 — Nomenclatura Plasma/Gas
```

---

# 21. ROADMAP

## 21.1 Fase 1 — MVP Core (Completado)

- [x] Sistema de autenticacion (register/login/JWT)
- [x] Sistema de recursos con produccion en tiempo real
- [x] Sistema de edificios (construccion, mejora, cola)
- [x] Sistema de flotas (crear, asignar, remover, disolver)
- [x] Sistema de misiones PvE (basico)
- [x] Sistema de investigacion tecnologica
- [x] Sistema de construccion de naves (shipyard)
- [x] Battle Engine con 8 pasos
- [x] API REST completa
- [x] Deploy en Railway

## 21.2 Fase 2 — Correccion de Discrepancias (Actual)

- [ ] **D02** — Implementar Weapon Expertise
- [ ] **D03** — Implementar Ship Expertise
- [ ] **D04** — Corregir Ship-Based cooldown a 4
- [ ] **D06** — Implementar check de Chrome armor para scatter
- [ ] **D07** — Corregir Energy Armor/Daedalus (solo hull)
- [ ] **D08** — Anadir scatter reduction a EOS
- [ ] Sistema de comandantes completo (100+ skills)
- [ ] Sistema de gemas para comandantes
- [ ] Sistema de hospital para comandantes heridos

## 21.3 Fase 3 — Combate Completo

- [ ] Sistema de movimiento de naves (D05)
- [ ] Combate PvP en tiempo real
- [ ] Replay de batallas con seed
- [ ] Sistema de He3 como recurso de combate real
- [ ] Sistema de daño y reparacion de naves
- [ ] Log de combate detallado (por ronda)

## 21.4 Fase 4 — Galaxia y Exploracion

- [ ] Mapa galactico completo con coordenadas
- [ ] NPCs y enemigos de la galaxia
- [ ] Sistema de colonizacion de planetas
- [ ] Sistema de comercio entre jugadores
- [ ] Planetas con diferentes tipos y bonus

## 21.5 Fase 5 — Social y Endgame

- [ ] Sistema de alianzas completo
- [ ] Chat en tiempo real (WebSockets)
- [ ] Leaderboard y ranking global
- [ ] Eventos galacticos (server-wide)
- [ ] Sistema de logros
- [ ] Humaroids y contenido endgame

## 21.6 Fase 6 — Polish

- [ ] UI/UX completa del frontend
- [ ] Animaciones de combate
- [ ] Tutorial para nuevos jugadores
- [ ] Balance final basado en datos
- [ ] Optimizacion de rendimiento
- [ ] Tests unitarios y de integracion

## 21.7 Timeline Estimada

| Fase | Duracion Estimada | Inicio | Fin |
|------|-------------------|--------|-----|
| Fase 1 | Completado | — | — |
| Fase 2 | 2-3 semanas | Semana 1 | Semana 3 |
| Fase 3 | 3-4 semanas | Semana 3 | Semana 7 |
| Fase 4 | 2-3 semanas | Semana 6 | Semana 10 |
| Fase 5 | 3-4 semanas | Semana 9 | Semana 14 |
| Fase 6 | 2-3 semanas | Semana 13 | Semana 17 |

**Total estimado:** 12-17 semanas desde inicio de Fase 2

---

# APENDICE A — Constantes del Juego

## A.1 Recursos Iniciales

```typescript
INITIAL_PLAYER_RESOURCES = {
  metal: 10_000,
  plasma: 10_000,
  credits: 10_000,
  energy: 100,
}

INITIAL_RESOURCE_CAPACITY = {
  metal: 50_000,
  plasma: 50_000,
  he3: 25_000,
  credits: 999_999_999,
}
```

## A.2 Seed de Nuevo Jugador

```
Empire:
  - Level: 1
  - Experience: 0

Recursos:
  - METAL: 10,000 (o 1M en DEV)
  - PLASMA: 10,000 (o 1M en DEV)
  - CREDITS: 10,000 (o 1M en DEV)
  - HE3: 0

Planeta:
  - Nombre: "Planeta Principal"
  - Slots: 80 (8×10)
  - Edificios iniciales: 5

Naves:
  - 10 Frigate MK-I

Blueprints:
  - 3 iniciales

Tecnologias:
  - Tier 1: AVAILABLE
  - Tier 2+: LOCKED
```

## A.3 Parametros de Combate

```
RONDAS_BASE = 20
RONDAS_MAX = 99
EOS_ABSORB_CHANCE = 0.30  (30%)
PPC_INTERCEPT_CHANCE = 0.55  (55% por PPC)
HIT_PER_AGILITY = -0.04  (-4%)
HIT_PER_STEERING = +0.04  (+4%)
DODGE_PENALTY = 1/12 = -1% por 12 dodge
ACCURACY_BONUS = +0.01  (+1% por punto)
```

## A.4 Tabla de Effective Stack Base

```
FRIGATE:     1,100
CRUISER:     1,000
BATTLESHIP:    900
```

## A.5 Limites del Sistema

```
MAX_BUILDING_LEVEL = 30
PLANET_SLOTS = 80 (8 rows × 10 cols)
CONSTRUCTION_QUEUE_SIZE = 5
MAX_FLEET_FORMATIONS = 10
MAX_SHIP_CONSTRUCTION_QUEUE = 1 (MVP)
MAX_COMMANDER_LEVEL = 100
MAX_COMMANDER_STARS = 6
MAX_TECH_LEVEL = 5 (por tech, variable)
MAX_ALLIANCE_MEMBERS = 50
```

## A.6 Formulas de XP

```
xp_max_for_level(level) = max(level × 1000, 1000)
```

---

# APENDICE B — Referencias de Codigo

## B.1 Archivos Clave del Backend

| Archivo | Funcion | Lineas aprox. |
|---------|---------|--------------|
| `apps/api/src/index.ts` | Entry point, registro de rutas | 46 |
| `apps/api/src/routes/auth.ts` | Registro y login | 211 |
| `apps/api/src/routes/empire.ts` | Datos del imperio | 131 |
| `apps/api/src/routes/planet.ts` | Construccion de edificios | 163 |
| `apps/api/src/routes/fleets.ts` | Gestion de flotas | 242 |
| `apps/api/src/routes/missions.ts` | Misiones PvE | 234 |
| `apps/api/src/routes/shipyard.ts` | Construccion de naves | 394 |
| `apps/api/src/routes/research.ts` | Investigacion | 281 |
| `apps/api/src/routes/game.ts` | Dashboard | 195 |
| `apps/api/src/lib/gameState.ts` | Sincronizacion de estado | 98 |
| `apps/api/src/lib/buildingLogic.ts` | Logica de construccion | 113 |
| `apps/api/src/lib/empireEconomy.ts` | Calculo de produccion | 49 |

## B.2 Archivos Clave del Shared

| Archivo | Funcion | Lineas aprox. |
|---------|---------|--------------|
| `packages/shared/src/game.ts` | Tipos y DTOs | 103 |
| `packages/shared/src/resources.ts` | Helpers de recursos | 64 |
| `packages/shared/src/resourceAccrual.ts` | Acumulacion | Variable |
| `packages/shared/src/production.ts` | Produccion por edificio | 76 |
| `packages/shared/src/economyConfig.ts` | Config economica | 15 |
| `packages/shared/src/buildingCosts.ts` | Costos de edificios | 71 |
| `packages/shared/src/terrestrialCatalog.ts` | Catalogo de edificios | 63 |
| `packages/shared/src/planetLayout.ts` | Layout del planeta | 46 |
| `packages/shared/src/go2/constructionQueue.ts` | Cola de construccion | 56 |

## B.3 Archivos de Base de Datos

| Archivo | Funcion | Lineas aprox. |
|---------|---------|--------------|
| `packages/database/prisma/schema.prisma` | Schema completo | 362 |

---

# APENDICE C — Notas para Desarrolladores

## C.1 Convenciones de Codigo

- **TypeScript obligatorio** en todo el proyecto
- **Nombres en ingles** para codigo, **espanol** para UI
- **PascalCase** para tipos e interfaces
- **camelCase** para variables y funciones
- **UPPER_SNAKE_CASE** para constantes globales
- ** snake_case** para campos de DB (con @map)

## C.2 Testing

```bash
# Tests unitarios
npm run test

# Tests de integracion
npm run test:integration

# Coverage
npm run test:coverage
```

## C.3 Debugging

```bash
# Logs de Railway
railway logs

# Modo dev local
npm run dev

# Prisma Studio (ver DB)
npx prisma studio
```

## C.4 Comandos Utiles

```bash
# Generar cliente Prisma
npx prisma generate

# Migrar base de datos
npx prisma migrate dev

# Resetear base de datos (CUIDADO)
npx prisma migrate reset

# Deploy en Railway
railway up
```

---

# APENDICE D — Fuentes y Referencias Externas

## D.1 Fuentes Primarias

| Fuente | URL | Contenido |
|--------|-----|-----------|
| Wiki GO2 | https://galaxyonlineii.fandom.com | Mecanicas, formulas, stats |
| GO2 Gameplay Guide | (varios) | Guia de movimiento, tips |

## D.2 Formulas Clave de la Wiki

```
# Hit Chance (de la wiki):
hits = attack_modules_per_ship × effective_stack × hit_chance
hit_chance = base + steering×0.04 - agility×0.04 - dodge/12×0.01 + accuracy×0.01

# Effective Stack:
stack = base_stack + commander_star_bonus

# Hull Damage:
ships_destroyed = floor(damage / (ship_structure × stability%))

# Scatter (con Exaltation):
scatter_damage = base × 0.54  // 432% unpreventable bonus
```

---

> **Fin del Documento Maestro de Galaxy Online 3**
>
> Este documento es la **fuente unica de verdad** para todo el equipo de desarrollo.
> Cualquier cambio en las mecanicas, APIs, o schema debe reflejarse aqui.
>
> Version: 1.0.0
> Ultima actualizacion: 2025-01-20

