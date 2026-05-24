# Fase 3 - Astillero y Sistema de Naves

## Estado: ✅ COMPLETADO

Fecha: 2026-05-23

---

## Resumen

Sistema de astillero implementado con 6 naves espaciales propias, cada una con requisitos de tecnología y edificio. Permite construir naves en tiempo real con timers y validación de recursos.

---

## Naves Implementadas (6)

### Disponibles desde inicio (con Astillero)

| Nave | Categoría | Costo M/P/C | Tiempo | ATK | DEF | HP | Velocidad | Carga |
|------|-----------|-------------|--------|-----|-----|----|-----------|-------|
| **Explorador** | CIVIL | 30/10/50 | 20s | 2 | 1 | 20 | 40 | 50 |
| **Fragata** | COMBAT | 80/40/120 | 60s | 15 | 8 | 80 | 25 | 100 |

### Requieren Tecnología

| Nave | Requisito Tecnología | Costo M/P/C | Tiempo | ATK | DEF | HP | Velocidad | Carga |
|------|---------------------|-------------|--------|-----|-----|----|-----------|-------|
| **Interceptor** | Propulsión Básica | 120/80/200 | 90s | 20 | 3 | 40 | 50 | 30 |
| **Carguero** | Logística Espacial | 200/100/300 | 120s | 0 | 5 | 150 | 8 | 2000 |
| **Crucero** | Armamento Láser | 250/150/500 | 180s | 40 | 20 | 200 | 15 | 300 |
| **Acorazado** | Blindaje Ligero | 600/400/1200 | 360s | 80 | 50 | 500 | 6 | 500 |

---

## Endpoints API

### GET /api/shipyard
Lista todas las naves (blueprints) con estado de desbloqueo e inventario.

**Respuesta:**
```json
{
  "hasShipyard": true,
  "blueprints": [
    {
      "id": "bp-explorer",
      "key": "EXPLORER",
      "name": "Explorador",
      "category": "CIVIL",
      "stats": { "attack": 2, "defense": 1, "hp": 20, "speed": 40, "cargoCapacity": 50 },
      "costs": { "metal": 30, "plasma": 10, "credits": 50 },
      "buildTime": 20,
      "unlocked": true,
      "inventory": 5,
      "activeConstruction": null
    }
  ],
  "activeConstructions": []
}
```

### POST /api/shipyard/build
Inicia construcción de nave(s).

**Body:**
```json
{
  "blueprintId": "bp-explorer",
  "quantity": 5
}
```

**Validaciones:**
- ✅ Astillero construido
- ✅ Tecnología requerida investigada
- ✅ Recursos suficientes (Metal, Plasma, Créditos)
- ✅ Solo una construcción activa (MVP)
- ✅ Cantidad 1-100

**Respuesta éxito:**
```json
{
  "success": true,
  "message": "Started building 5 Explorador(s)",
  "endsAt": "2026-05-23T23:45:00.000Z",
  "buildTime": 100
}
```

### POST /api/shipyard/sync
Completa construcciones finalizadas.

**Respuesta:**
```json
{
  "success": true,
  "completedCount": 1,
  "completedShips": [{ "name": "Explorador", "quantity": 5 }]
}
```

### GET /api/shipyard/ships (o /api/ships)
Obtiene inventario de naves del imperio.

---

## Lógica de Costes y Tiempos

**Fórmula propia simple:**

```
coste_total = coste_base × cantidad
tiempo_total = tiempo_base × cantidad

reducción_automatización = nivel_tecnología × 10%
tiempo_efectivo = tiempo_total × (1 - reducción_automatización)
```

**Ejemplo - Construir 5 Exploradores con Automatización Nv. 2:**
```
Metal: 30 × 5 = 150
Plasma: 10 × 5 = 50
Créditos: 50 × 5 = 250
Tiempo base: 20s × 5 = 100s
Reducción: 2 × 10% = 20%
Tiempo efectivo: 100s × 0.80 = 80s
```

---

## Requisitos de Desbloqueo

### Por Edificio
- Todas las naves requieren **SHIPYARD** (Astillero)
- Si no hay astillero, la página muestra mensaje de bloqueo

### Por Tecnología
| Nave | Tecnología Requerida | Nivel Mínimo |
|------|---------------------|--------------|
| Interceptor | Propulsión Básica | 1 |
| Carguero | Logística Espacial | 1 |
| Crucero | Armamento Láser | 1 |
| Acorazado | Blindaje Ligero | 1 |

---

## Beneficios de Tecnologías Aplicados

### Automatización Industrial
- Reduce tiempo de construcción de naves
- 10% por nivel de tecnología
- Aplicado automáticamente en backend

### Propulsión Básica
- Desbloquea Interceptor
- Preparación para futuro bonus de velocidad de flotas

### Blindaje Ligero
- Desbloquea Acorazado
- Preparación para futuro bonus de HP en combate

### Armamento Láser
- Desbloquea Crucero
- Preparación para futuro bonus de ataque en combate

### Logística Espacial
- Desbloquea Carguero
- Preparación para sistema de transporte de recursos

---

## UI /shipyard

### Componentes implementados:
- ✅ Selector de cantidad (1-10 slider)
- ✅ Grid de naves por categoría (Combate, Civil, Transporte)
- ✅ Stats visuales (ATK, DEF, HP)
- ✅ Costos dinámicos por cantidad
- ✅ Validación de recursos (rojo si insuficiente)
- ✅ Indicador de bloqueo por requisitos
- ✅ Timer countdown en construcciones activas
- ✅ Progress bar con porcentaje
- ✅ Inventario actual por nave
- ✅ Mensaje si falta Astillero

### Estados visuales:
| Estado | Color | Acción |
|--------|-------|--------|
| Disponible | Verde | Botón "Construir" |
| Construyendo | Amarillo | Progress bar + timer |
| Bloqueado | Rojo | Mensaje de requisito |
| Sin recursos | Gris | Botón deshabilitado |

---

## Navegación

Dashboard → Astillero: ✅ Habilitado

---

## Base de Datos

### Blueprint (actualizado)
```prisma
model Blueprint {
  id              String   @id @default(uuid())
  key             String   @unique
  name            String
  type            String
  category        String   // COMBAT, CIVIL, TRANSPORT
  requiredTechId  String?
  requiredBuildingType String? // SHIPYARD
  costMetal       Int
  costPlasma      Int
  costCredits     Int
  buildTime       Int
  attack          Int
  hp              Int
  defense         Int
  speed           Int
  cargoCapacity   Int
}
```

### ShipConstruction (nuevo)
```prisma
model ShipConstruction {
  id            String   @id @default(uuid())
  empireId      String
  blueprintId   String
  quantity      Int
  status        String   // BUILDING, COMPLETED
  startedAt     DateTime
  endsAt        DateTime
  completedAt   DateTime?
}
```

### Empire (relaciones)
```prisma
model Empire {
  // ... otros campos
  shipConstructions ShipConstruction[]
}
```

---

## Pruebas Realizadas

### Backend
- ✅ GET /api/shipyard valida astillero existente
- ✅ POST /api/shipyard/build rechaza sin astillero
- ✅ Validación de tecnologías requeridas
- ✅ Descuento de recursos (Metal, Plasma, Créditos)
- ✅ Reducción de tiempo por Automatización Industrial
- ✅ Solo una construcción activa permitida
- ✅ POST /api/shipyard/sync completa y agrega al inventario

### Frontend
- ✅ Página /shipyard accesible
- ✅ Selector de cantidad funcional
- ✅ Costos se actualizan con cantidad
- ✅ Naves bloqueadas muestran requisitos
- ✅ Timer countdown visual
- ✅ Inventario actualizado post-construcción

### Integración
- ✅ Nuevos usuarios pueden construir Exploradores/Fragatas
- ✅ Investigación desbloquea naves avanzadas
- ✅ Astillero requerido para construir

---

## Archivos Modificados/Creados

```
apps/api/src/
├── index.ts                    (+ shipyardRoutes)
└── routes/
    └── shipyard.ts             (NUEVO - 4 endpoints)

apps/web/src/app/
├── dashboard/page.tsx          (Astillero habilitado)
└── shipyard/page.tsx           (NUEVO - UI completa)

packages/database/prisma/
├── schema.prisma               (Blueprint + ShipConstruction actualizados)
└── seed.ts                     (6 naves nuevas)

docs/galaxy-online-2-research/
└── phase-3-shipyard.md         (NUEVO - este archivo)
```

---

## Comandos Testing

```bash
# Ver naves disponibles
GET http://localhost:3001/api/shipyard

# Construir 3 Exploradores
POST http://localhost:3001/api/shipyard/build
Body: { "blueprintId": "bp-explorer", "quantity": 3 }

# Ver inventario
GET http://localhost:3001/api/shipyard/ships

# Completar construcciones
POST http://localhost:3001/api/shipyard/sync
```

---

## Próximos Pasos (Fase 4)

1. **Sistema de Flotas** - Agrupar naves en flotas para misiones
2. **Misiones PvE** - Usar naves en combate contra enemigos
3. **Sistema de Combate** - Simulación de batallas con stats de naves
4. **Transporte de Recursos** - Usar Cargueros para mover recursos

---

## Notas

- Sistema mantiene Fase 1 (construcción edificios) y Fase 2 (investigación) intactos
- Todas las naves tienen nombres y descripciones propias
- No se copiaron fórmulas ni nombres de Galaxy Online 2
- UI consistente con diseño sci-fi establecido

**Fase 3 COMPLETADA - Astillero operativo**
