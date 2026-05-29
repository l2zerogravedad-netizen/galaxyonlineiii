# Auditoría completa — Backend ↔ Frontend (GO3 Web)

> Generada 2026-05-29. Estado de conexión de cada pantalla con el backend, y qué falta.

## TL;DR
- **Backend: 31 endpoints, robustos y completos** (auth, empire, planets, shipyard, research, commanders, battles, fleets, galaxy, missions, alliances, leaderboard, chat). DB sincronizada y registro funcionando.
- **Frontend: la mayoría YA está conectado.** Lo que falta conectar: la **base terrestre 3D** (`/demo/construction`) — el HUD ya lee recursos reales, pero la **colocación de edificios en el 3D no persiste**. Y faltan crear: **Market**, **Station**, y el **composer de Fleets** (`/fleets`).

---

## 1. Backend — 31 endpoints (todos sobre Prisma/Postgres)

| Dominio | Endpoints | Auth |
|---------|-----------|------|
| Auth | `/api/auth/register`, `/api/auth/login` | No |
| Empire | `/api/empire` (GET estado completo) | Sí |
| Planets | `/api/planets/[id]/build` (construir/mejorar) | Sí |
| Galaxy | `/api/galaxy`, `/api/galaxy/planets/[id]`, `/api/galaxy/move` | Sí |
| Shipyard | `/api/shipyard/build`, `/api/shipyard/queue` | Sí |
| Commanders | `/api/commanders`, `/[id]`, `/[id]/equipment`, `/[id]/hospital`, `/[id]/gems`, `/[id]/heal`, `/merge` | Sí |
| Battles | `/api/battles`, `/[id]`, `/[id]/result`, `/dev-simulate` | Sí (dev-simulate no) |
| Fleets | `/api/fleets`, `/api/fleets/[id]` | Sí |
| Missions | `/api/missions` | Sí |
| Game | `/api/game/dashboard`, `/api/game/resources/collect` | Sí |
| Alliances | `/api/alliances`, `/[id]`, `/my` | Sí (GET no) |
| Leaderboard | `/api/leaderboard` | No |
| Chat | `/api/chat` (in-memory, no DB) | Sí |
| Health | `/api/health` | No |

**Observación:** el backend está más completo que el frontend. Casi todo lo que el juego necesita ya tiene endpoint.

---

## 2. Frontend — estado de conexión por pantalla

| Ruta / Pantalla | Estado | Real vs Mock | API |
|-----------------|--------|--------------|-----|
| `/` Login/Register | ✅ CONECTADO | todo real | auth/login, auth/register |
| `/dashboard` (base principal) | ✅ CONECTADO | recursos + edificios reales | game/dashboard, empire, build, collect |
| `/dashboard/galaxy` | ✅ CONECTADO | sector real | galaxy, galaxy/planets, galaxy/move |
| `/dashboard/missions` | ✅ CONECTADO | misiones reales | missions |
| `/dashboard/alliances` | ✅ CONECTADO | alianzas reales | alliances, alliances/my |
| `/dashboard/leaderboard` | ✅ CONECTADO | ranking real | leaderboard |
| `/research` | ✅ CONECTADO | tech tree real | research, build, sync |
| `/shipyard` | ✅ CONECTADO | blueprints reales | shipyard, build, sync |
| `/missions` | ✅ CONECTADO | misiones + flota | missions, fleets |
| `/planet/[id]/build` | ✅ CONECTADO | planeta + recursos reales | planets/[id], build |
| `/dashboard/battle` | 🟡 PARCIAL | simulación local; resultado se guarda | battles, battles/[id], result |
| `/dashboard/fleet` | 🟡 PARCIAL | comandantes con fallback a mock | commanders, fleets |
| `/demo/construction` (BASE TERRESTRE 3D) | 🟡 HÍBRIDO | **HUD recursos REALES** ✅ / **colocación de edificios NO persiste** ❌ | empire (solo lectura) |
| `/dashboard/market` | 🔴 MOCK | placeholder "Próxima fase" | — |
| `/dashboard/station` | 🔴 MOCK | placeholder "Próxima fase" | — |
| `/fleets` (composer) | 🔴 MOCK | UI con datos de ejemplo | — |

---

## 3. Foco actual: la BASE TERRESTRE (`/demo/construction`)

Lo que pediste conectar. Estado fino:

| Parte | Estado |
|-------|--------|
| Barra superior: recursos (Metal/Plasma/Créditos/HE3), nombre, nivel | ✅ REAL (de `/api/empire` si hay token; fallback demo si no) |
| Terreno 3D (escena Three.js) | visual, no necesita backend |
| Colocar edificios en el 3D (`scene.html`) | ❌ LOCAL (localStorage `go3c_v1`) — **NO persiste en la DB** |
| Modal "Construir edificios" (tienda de edificios) | ❌ datos mock, sin POST al API |
| Tienda / Lucky Draw / Quests | ❌ visual/mock (esperado, no son del backend de construcción) |

**Lo que falta para "todo conectado" en la base:**
1. Colocar un edificio en el 3D → `POST /api/planets/[id]/build {slotIndex, type}` (helper `buildOrUpgradeBuilding` ya existe).
2. Al cargar, pintar en el 3D los edificios reales de `/api/empire` (no los de localStorage).
3. Sincronizar recursos con el tiempo (`/api/game/resources/collect` o el sync de `/api/empire`).

---

## 4. Lo que falta CREAR (frontend nuevo)

| Pantalla | Backend disponible? | Trabajo |
|----------|--------------------|---------| 
| **Market** (`/dashboard/market`) | parcial (no hay endpoint de mercado aún) | crear UI + endpoint de mercado |
| **Space Station** (`/dashboard/station`) | no | crear UI + endpoint |
| **Fleets composer** (`/fleets`) | ✅ `/api/fleets` existe | conectar la UI mock al API (crear/disolver flotas) |
| **Chat persistente** | `/api/chat` existe pero in-memory | migrar a DB/Redis si se quiere persistencia |

---

## 5. Prioridad recomendada (para la base terrestre, que es el foco)
1. **Construcción persistente** en `/demo/construction`: colocar edificio → POST build → recargar desde `/api/empire`. (el backend ya lo soporta)
2. **Sync de recursos** en el HUD (producción con el tiempo).
3. Conectar el **composer de Fleets** (`/api/fleets` ya existe).
4. Después: Market y Station (necesitan endpoint nuevo además de UI).
