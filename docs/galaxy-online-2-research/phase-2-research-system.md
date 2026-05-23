# Fase 2 - Sistema de Investigación

## Estado: ✅ COMPLETADO

Fecha: 2026-05-23

---

## Resumen

Sistema de investigación implementado con tecnologías propias, efectos de producción, y UI completa.

---

## Tecnologías Implementadas (8)

### Tier 1 - Disponibles desde inicio

| Tecnología | Categoría | Efecto | Base Coste |
|------------|-----------|--------|------------|
| **Ingeniería de Materiales** | PRODUCTION | +10% metal/Nv | 200M / 100P |
| **Energía de Plasma** | PRODUCTION | +10% plasma/Nv | 200M / 100P |
| **Logística Espacial** | LOGISTICS | +15% flota (futuro) | 300M / 150P |

### Tier 2 - Requieren Tier 1

| Tecnología | Requisito | Categoría | Efecto | Base Coste |
|------------|-----------|-----------|--------|------------|
| **Automatización Industrial** | Ingeniería de Materiales | CONSTRUCTION | -10% tiempo construcción/Nv | 400M / 200P |
| **Computación Táctica** | Logística Espacial | MILITARY | +1 flota (futuro) | 350M / 250P |

### Tier 3 - Militar Avanzado

| Tecnología | Requisito | Categoría | Efecto | Base Coste |
|------------|-----------|-----------|--------|------------|
| **Blindaje Ligero** | Ingeniería de Materiales | MILITARY | +8% HP naves/Nv (futuro) | 500M / 200P |
| **Armamento Láser** | Energía de Plasma | MILITARY | +10% ataque naves/Nv (futuro) | 450M / 350P |

### Tier 4 - Propulsión

| Tecnología | Requisito | Categoría | Efecto | Base Coste |
|------------|-----------|-----------|--------|------------|
| **Propulsión Básica** | Energía de Plasma | PROPULSION | +10% velocidad naves/Nv (futuro) | 600M / 400P |

---

## Endpoints API

### GET /api/research
Lista todas las tecnologías del imperio con estado, costes calculados, y progreso.

**Respuesta:**
```json
{
  "technologies": [
    {
      "id": "tech-materials-engineering",
      "key": "MATERIALS_ENGINEERING",
      "name": "Ingeniería de Materiales",
      "currentLevel": 2,
      "maxLevel": 5,
      "status": "AVAILABLE",
      "prerequisiteMet": true,
      "costs": {
        "metal": 600,
        "plasma": 300,
        "time": 900
      },
      "effects": {
        "type": "METAL_PRODUCTION",
        "value": 0.10,
        "description": "+10% producción de metal por nivel"
      }
    }
  ]
}
```

### POST /api/research/:technologyId/start
Inicia investigación de una tecnología.

**Validaciones:**
- ✅ Solo una investigación activa a la vez
- ✅ Requisitos previos cumplidos
- ✅ Recursos suficientes
- ✅ No nivel máximo alcanzado

**Respuesta éxito:**
```json
{
  "success": true,
  "message": "Research started",
  "endsAt": "2026-05-23T23:30:00.000Z",
  "researchTime": 900
}
```

### POST /api/research/sync
Completa investigaciones cuyo timer ha finalizado.

**Respuesta:**
```json
{
  "success": true,
  "completedCount": 1,
  "completedIds": ["tech-materials-engineering"]
}
```

---

## Lógica de Costes

**Fórmula propia simple:**

```
coste_metal = baseCostMetal × nivel_objetivo
coste_plasma = baseCostPlasma × nivel_objetivo
tiempo_segundos = baseResearchTime × nivel_objetivo
```

**Ejemplo - Ingeniería de Materiales Nv. 3:**
```
Metal: 200 × 3 = 600
Plasma: 100 × 3 = 300
Tiempo: 300s × 3 = 900s (15 min)
```

---

## Lógica de Timers

- Research inicia con `researchStartedAt = now()`
- Calcula `researchEndsAt = now() + tiempo_segundos`
- Status cambia a `RESEARCHING`
- Frontend polling cada 10s a `/api/research/sync`
- Al completar: `level++`, `status = COMPLETED`, timers = null

---

## Beneficios Aplicados

### Producción de Recursos
```typescript
// empire.ts - calculateResources()
if (resource.type === 'METAL' && techBonuses['METAL_PRODUCTION']) {
  effectiveProductionPerHour *= (1 + techBonuses['METAL_PRODUCTION']);
}
```

**Fórmula acumulativa:**
```
bonus_total = Σ(effectValue × nivel_actual)

Ejemplo:
- Ingeniería de Materiales Nv. 2
- Bonus = 0.10 × 2 = 0.20 (20% extra)
- Producción base: 100 metal/h
- Producción efectiva: 100 × 1.20 = 120 metal/h
```

### Reducción de Tiempo de Construcción
*Implementado en backend, pendiente aplicación en Fase 3*

---

## UI /research

### Componentes implementados:
- ✅ Grid de tecnologías por categoría
- ✅ Tarjetas con nivel actual/max
- ✅ Efectos visibles
- ✅ Costos dinámicos por nivel
- ✅ Validación de recursos (rojo si insuficiente)
- ✅ Botón deshabilitado por requisitos
- ✅ Indicador de investigación activa
- ✅ Progress bar con countdown
- ✅ Auto-sync cada 10 segundos

### Estados visuales:
| Estado | Color | Icono |
|--------|-------|-------|
| Disponible | Verde | - |
| Investigando | Amarillo | 🔬 |
| Bloqueado | Rojo/Gris | 🔒 |
| Nivel Máximo | Verde brillante | ✓ |

---

## Navegación

Dashboard → Investigación: ✅ Habilitado

```typescript
// dashboard/page.tsx
<ActionButton href="/research" label="Investigación" />
```

---

## Base de Datos

### Technology (nuevo schema)
```prisma
model Technology {
  id            String   @id @default(uuid())
  key           String   @unique
  name          String
  category      String
  requiredTechId String?
  baseCostMetal     Int
  baseCostPlasma    Int
  baseResearchTime  Int
  maxLevel      Int
  effectType    String?
  effectValue   Float
  effectDescription String?
}
```

### EmpireTechnology (actualizado)
```prisma
model EmpireTechnology {
  id              String   @id @default(uuid())
  empireId        String
  technologyId    String
  level           Int      @default(0)
  status          String   @default("LOCKED")
  researchStartedAt DateTime?
  researchEndsAt  DateTime?
}
```

---

## Pruebas Realizadas

### Backend
- ✅ GET /api/research retorna lista con costes calculados
- ✅ POST /api/research/:id/start valida recursos
- ✅ POST /api/research/:id/start valida requisitos
- ✅ POST /api/research/:id/start rechaza si hay investigación activa
- ✅ POST /api/research/sync completa investigaciones vencidas
- ✅ Bonus de producción aplicado en /api/empire

### Frontend
- ✅ Página /research accesible desde dashboard
- ✅ Tecnologías agrupadas por categoría
- ✅ Costos aumentan con nivel
- ✅ Botón deshabilitado sin recursos
- ✅ Timer countdown funcional
- ✅ Progreso visual actualizado

### Integración
- ✅ Crear usuario → tecnologías inicializadas (Tier 1 AVAILABLE, resto LOCKED)
- ✅ Investigar Nv. 1 → desbloquear Tier 2
- ✅ Producción metal aumenta con bonus

---

## Archivos Modificados/Creados

```
apps/api/src/
├── index.ts                    (+ researchRoutes)
├── routes/
│   ├── auth.ts                 (init techs con level=0)
│   ├── empire.ts               (+ techBonuses en resources)
│   └── research.ts             (NUEVO - 3 endpoints)

apps/web/src/app/
├── dashboard/page.tsx          (Investigación habilitada)
└── research/page.tsx           (NUEVO - UI completa)

packages/database/prisma/
├── schema.prisma               (Technology + EmpireTechnology updated)
└── seed.ts                     (8 tecnologías nuevas)

docs/galaxy-online-2-research/
└── phase-2-research-system.md  (NUEVO - este archivo)
```

---

## Próximos Pasos (Fase 3)

1. **Astillero** - Construcción de naves con blueprints
2. **Flotas** - Agrupar naves en flotas
3. **Sistema de Construcción** - Aplicar reducción de tiempo de Automatización Industrial
4. **Combate PvE** - Misiones con enemigos

---

## Comandos Testing

```bash
# Reset DB con nuevo seed
cd packages/database
npx prisma migrate reset --force

# Probar endpoints
POST http://localhost:3001/api/research/tech-materials-engineering/start
GET  http://localhost:3001/api/research
POST http://localhost:3001/api/research/sync

# Ver bonus aplicado
GET  http://localhost:3001/api/empire/resources
```

---

**Fase 2 COMPLETADA - Sistema de Investigación operativo**
