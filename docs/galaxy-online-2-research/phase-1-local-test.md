# Fase 1 - Testing Local MVP

## Estado: ✅ COMPLETADO

Fecha: 2026-05-23

---

## Comandos para Correr Local

### 1. Database (Primera vez o reset)
```bash
cd packages/database
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 2. API Backend
```bash
cd apps/api
copy ..\..\.env .    # Windows
npm run dev
```
- API: http://localhost:3001
- Health: http://localhost:3001/health

### 3. Web Frontend
```bash
cd apps/web
npm run dev
```
- Web: http://localhost:3000

---

## Variables de Entorno

Archivo `.env` en raíz del proyecto:
```
# Database - SQLite local for development
DATABASE_URL="file:./dev.db"

# JWT Secret - Local development only
JWT_SECRET="local-dev-secret-do-not-use-in-production-2026"

# API
PORT=3001

# Web
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

---

## Pasos de Prueba Realizados

### 1. Health Check ✅
```bash
curl http://localhost:3001/health
```
Respuesta: `{"status":"ok","time":"2026-05-23T22:52:00.390Z"}`

### 2. Registro de Usuario ✅
**Request:**
```bash
POST http://localhost:3001/api/auth/register
Body: {
  "email": "test2@example.com",
  "password": "password123",
  "username": "testuser2",
  "empireName": "Test Empire 2"
}
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "fbe1cafc-7743-4790-994d-d2977201919c",
    "email": "test2@example.com",
    "username": "testuser2"
  },
  "empire": {
    "id": "ad808d71-c1d2-4f97-abb5-0602c511c91d",
    "name": "Test Empire 2",
    "level": 1
  }
}
```

**Verificado:**
- ✅ Usuario creado en tabla `users`
- ✅ Imperio creado en tabla `empires`
- ✅ Planeta inicial creado con 5 edificios
- ✅ Recursos iniciales: METAL 500, PLASMA 200, CREDITS 1000
- ✅ Tecnologías inicializadas: 1 COMPLETED, 3 LOCKED

### 3. Login ✅
**Request:**
```bash
POST http://localhost:3001/api/auth/login
Body: {
  "email": "test2@example.com",
  "password": "password123"
}
```

**Respuesta:** Token JWT válido + datos de usuario e imperio

### 4. Obtener Datos del Imperio ✅
**Request:**
```bash
GET http://localhost:3001/api/empire
Headers: Authorization: Bearer {token}
```

**Respuesta incluye:**
- Datos del imperio (nombre, nivel, experiencia)
- Recursos con producción por tiempo calculada
- Planeta con edificios
- Tecnologías disponibles

**Recursos verificados:**
```json
{
  "type": "METAL",
  "amount": 500,
  "capacity": 1000,
  "productionPerHour": 100,
  "updatedAt": "2026-05-23T22:52:05.002Z"
}
```

### 5. Edificios Iniciales ✅
Planeta creado con 5 edificios:
| Slot | Tipo | Nivel | Estado |
|------|------|-------|--------|
| 0 | METAL_MINE | 1 | IDLE |
| 1 | PLASMA_EXTRACTOR | 1 | IDLE |
| 2 | SHIPYARD | 1 | IDLE |
| 3 | RESEARCH_LAB | 1 | IDLE |
| 4 | COMMAND_CENTER | 1 | IDLE |

### 6. Construcción de Edificio ✅
**Request:**
```bash
POST http://localhost:3001/api/planets/{planetId}/build
Headers: Authorization: Bearer {token}
Body: {
  "type": "WAREHOUSE",
  "slotIndex": 5
}
```

**Respuesta:**
```json
{
  "id": "54c2844f-8be3-4cb2-ae12-830fb5b55fd2",
  "planetId": "6688b45b-68f7-4c6a-bd07-4900871bdbb4",
  "type": "WAREHOUSE",
  "level": 1,
  "slotIndex": 5,
  "status": "CONSTRUCTING",
  "constructionEndsAt": "2026-05-23T22:54:47.063Z"
}
```

**Verificado:**
- ✅ Edificio creado en estado CONSTRUCTING
- ✅ Costo descontado: METAL 500 → 301
- ✅ Timer de construcción establecido (2 minutos base)
- ✅ Slot 5 ahora ocupado

### 7. Producción de Recursos por Tiempo ✅
Sistema calcula recursos basado en `updatedAt`:
```typescript
const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60);
const production = resource.productionPerHour * hoursDiff;
const newAmount = Math.min(resource.amount + production, resource.capacity);
```

**Verificado:** Al consultar recursos después de un tiempo, el amount refleja la producción acumulada sin exceder capacidad.

### 8. UI - Dashboard ✅
- ✅ Login/Register funcionando
- ✅ Redirección post-login al dashboard
- ✅ Visualización de recursos (METAL, PLASMA, CREDITS)
- ✅ Grid 3x3 de edificios
- ✅ Edificios vacíos muestran "+" clickeable
- ✅ Edificios construidos muestran nombre y nivel

### 9. UI - Página de Construcción ✅
- ✅ Lista de tipos de edificios disponibles
- ✅ Costos mostrados (metal, plasma, tiempo)
- ✅ Validación de recursos insuficientes (botón deshabilitado)
- ✅ Botón "Construir" / "Mejorar" según contexto
- ✅ Redirección al dashboard tras construcción

### 10. Timers de Construcción en UI ✅
- ✅ Badge "En construcción..." en edificios activos
- ✅ Countdown actualizado cada segundo
- ✅ Formato: "Xm Ys"
- ✅ Color amarillo para destacar
- ✅ Link deshabilitado mientras construye

---

## Errores Encontrados y Soluciones

### Error 1: Schema Prisma incompatible con SQLite
**Problema:** Enums y tipo Json no soportados en SQLite
**Solución:** Convertir enums a String y Json a String

### Error 2: Import de enums eliminados
**Problema:** `ResearchStatus` y `BuildingType` importados pero eliminados del schema
**Solución:** Usar strings literales en lugar de enums

### Error 3: seed.ts con objetos en lugar de JSON strings
**Problema:** `enemyFleetConfig: { frigates: 20 }` en lugar de string
**Solución:** `enemyFleetConfig: JSON.stringify({ frigates: 20 })`

### Error 4: Comando copy en PowerShell
**Problema:** `copy ..\..\.env .` no es válido en PowerShell
**Solución:** Usar `Copy-Item` o crear archivo manualmente

### Error 5: Workspace npm
**Problema:** Next.js con npm workspaces da advertencia
**Solución:** No afecta funcionamiento, ignorar advertencia

---

## Estructura Final del Proyecto

```
GALAXY ONLINE III/
├── apps/
│   ├── api/                 # Fastify + TypeScript
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts      # Login/Register
│   │   │   │   ├── empire.ts    # Recursos y datos
│   │   │   │   └── planet.ts    # Construcción edificios
│   │   │   └── index.ts
│   │   └── package.json
│   └── web/                 # Next.js 14
│       ├── src/
│       │   └── app/
│       │       ├── page.tsx           # Login
│       │       ├── dashboard/
│       │       │   └── page.tsx       # Imperio
│       │       └── planet/
│       │           └── [id]/
│       │               └── build/
│       │                   └── page.tsx # Construcción
│       └── package.json
├── packages/
│   ├── database/            # Prisma + SQLite
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # 12 tablas
│   │   │   └── seed.ts          # Datos iniciales
│   │   └── src/
│   │       └── index.ts
│   └── shared/            # Tipos compartidos
├── docs/
│   └── galaxy-online-2-research/
│       └── phase-1-local-test.md  # Este archivo
├── .env                   # Variables locales
└── package.json           # Workspace root
```

---

## Datos Seed Creados

### Tecnologías (4)
| ID | Nombre | Nivel Req | Estado Inicial |
|----|--------|-----------|----------------|
| tech-mining-basic | Minería Básica | 1 | COMPLETED |
| tech-propulsion | Propulsión | 2 | LOCKED |
| tech-shields | Escudos Defensivos | 3 | LOCKED |
| tech-economy | Economía Avanzada | 4 | LOCKED |

### Blueprints/Naves (3)
| Tipo | Nombre | Costo Metal | Costo Plasma | Stats |
|------|--------|-------------|--------------|-------|
| FRIGATE | Fragata | 50 | 20 | ATK:10 HP:50 |
| CRUISER | Crucero | 150 | 60 | ATK:25 HP:120 |
| BATTLESHIP | Acorazado | 400 | 150 | ATK:40 HP:300 |

### Misiones PvE (5)
| ID | Nombre | Dificultad | Poder Recomendado | Recompensa |
|----|--------|------------|-------------------|------------|
| mission-1 | Sector Periférico | 1 | 300 | 100 XP, 50 créditos |
| mission-2 | Cinturón de Asteroides | 2 | 600 | 250 XP, 100 créditos |
| mission-3 | Nebulosa Tóxica | 3 | 1000 | 500 XP, 200 créditos |
| mission-4 | Campo de Deriva | 4 | 1500 | 800 XP, 350 créditos |
| mission-5 | Estación Abandonada | 5 | 2000 | 1200 XP, 500 créditos |

---

## Endpoints API Documentados

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | /health | No | Health check |
| POST | /api/auth/register | No | Crear usuario + imperio |
| POST | /api/auth/login | No | Login con JWT |
| GET | /api/empire | Sí | Datos del imperio |
| GET | /api/empire/resources | Sí | Solo recursos actualizados |
| GET | /api/planets/:id | Sí | Detalle de planeta |
| POST | /api/planets/:id/build | Sí | Construir/mejorar edificio |

---

## Comandos de Testing Manual

```powershell
# Health check
Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing

# Register
$body = @{email="test@example.com"; password="password123"; username="testuser"; empireName="Test Empire"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3001/api/auth/register" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing

# Login
$body = @{email="test@example.com"; password="password123"} | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
$token = ($response.Content | ConvertFrom-Json).token

# Empire data
$headers = @{Authorization="Bearer $token"}
Invoke-WebRequest -Uri "http://localhost:3001/api/empire" -Headers $headers -UseBasicParsing

# Build
$body = @{type="WAREHOUSE"; slotIndex=5} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3001/api/planets/{planetId}/build" -Method POST -Headers $headers -ContentType "application/json" -Body $body -UseBasicParsing
```

---

## Estado Final

✅ **FASE 1 COMPLETADA Y FUNCIONANDO**

- Todos los endpoints operativos
- UI funcional en navegador
- Recursos produciéndose por tiempo
- Construcción de edificios operativa
- Timers visuales en UI
- Base de datos SQLite local estable

**Próximo paso:** Fase 2 (Investigación) cuando se indique.
