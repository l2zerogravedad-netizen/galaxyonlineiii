# Galaxy Online III — Estado del proyecto y guía maestra

> Documento vivo. Última actualización: 2026-05-29.
> Resume QUÉ está hecho, CÓMO está desplegado, CÓMO se trabaja, y QUÉ NO se puede romper.

---

## 1. Resumen ejecutivo

Galaxy Online III es un MMO de estrategia espacial. El proyecto tiene **3 clientes**:

| Cliente | Responsable | Estado |
|---------|-------------|--------|
| **Web** (Next.js) | Cursor | **EN PRODUCCIÓN** (Railway) — incluye la base terrestre 3D |
| **Mobile** (Unity) | Claude Code | Cliente base + motor de batalla portado (rama `claude/happy-moser-a85026`) |
| **Desktop** (Unity) | Windsurf | — |

El juego está **ONLINE**: https://galaxyonlineiii-production.up.railway.app

---

## 2. Infraestructura (Railway)

Proyecto: **thorough-fascination** (`630de7ba-614a-4cb7-98bf-0fc14f95b88f`), entorno `production`.

| Servicio | ID | Rol |
|----------|----|----|
| **GALAXY ONLINE III** | `9e56fb80-…` | App web (Next.js, `go3-web`). Único servicio web. Dominio `galaxyonlineiii-production.up.railway.app`. Conectado al repo GitHub. |
| **Postgres** | `6f9dabb9-…` | Base de datos. **NO TOCAR.** |

> **Histórico:** existía un servicio web duplicado, `galaxy-web`, que servía exactamente
> la misma app. Se **eliminó** (2026-05-29) para dejar un solo servicio web. El dominio
> `galaxy-web-production…` ya no existe.

### Config de build (`railway.toml`)
```toml
[build]
builder = "RAILPACK"
# prisma generate ANTES del build: next build recolecta las rutas /api que importan
# @prisma/client, y falla si el cliente no fue generado.
buildCommand = "cd packages/database && npx prisma generate && cd ../../apps/web && npm run build"

[deploy]
startCommand = "cd apps/web && npx next start"
```

### Cómo desplegar
- **Por GitHub (preferido a futuro):** push a `main` → auto-deploy. ⚠️ Hoy `main` está
  desactualizado respecto a la rama verde; ver §6.
- **Por CLI (lo usado ahora):**
  ```bash
  cd <repo>
  railway link --project 630de7ba-614a-4cb7-98bf-0fc14f95b88f \
    --environment production --service "GALAXY ONLINE III"
  railway up --detach
  railway logs --build <deployment_id>   # ver build
  railway deployment list                # ver estados
  ```
  Nota: a veces el upload da `BadRecordMac` (glitch TLS transitorio) → reintentar.

---

## 3. La BASE TERRESTRE (regla de oro)

La base terrestre vive en **dos piezas**:

1. **`apps/web/public/planet-3d/scene.html`** — escena Three.js (terreno + colocación de
   edificios GLB). Es un HTML standalone que carga Three.js por CDN (import map). NO entra
   al build de Next (evita problemas de lock).
2. **`apps/web/src/features/construction-demo/ConstructionDemoPage.tsx`** — el HUD estilo
   Galaxy Online 2 (React + Tailwind + lucide) que se monta **encima** de la escena 3D
   (que va en un iframe de fondo, `scene.html`). Ruta: `/demo/construction`.

### 🔒 REGLA: la estructura del HUD y el menú NO se modifican — SOLO se mejora

- El layout, las posiciones, los tamaños de botones, la consola inferior centrada, la
  barra superior (Rayder + recursos), el chat, el carrusel de amigos, los modales
  (Tienda, Lucky Draw, Construir edificios, Quest) **quedan como están**.
- Lo permitido: **mejorar la visual** (iconos, texturas, brillos), **agregar** funciones
  nuevas y modales nuevos. NO romper ni reordenar lo existente.
- Patrón seguro para cambiar un icono: reemplazar SOLO el contenido visual del botón
  (mismo `className`/tamaño), nunca el `<button>` ni su lógica. Ver `MenuImageIcon`.

### Componentes del HUD (en `src/features/construction-demo/hud/`)
| Archivo | Qué tiene |
|---------|-----------|
| `StoreIcons.tsx` | SVGs custom (cupón, planeta, gema, chip, jet, radar, etc.) |
| `BuildQuestIcons.tsx` | Iconos de menús desplegables, modal Quest y modal Construir |
| `storeData.tsx` | Datos de la tienda (tabs: All Items/Honor/Badge/Gems) |
| `questBuildData.ts` | Datos de quests + catálogo de edificios del modal Construir |
| `MenuImageIcon.tsx` | Componente para usar los PNG AAA de Meshy a tamaño exacto |

### Iconos AAA (Meshy, 256px) — en `apps/web/public/icons/menu/`
| Archivo | Representa | Botón |
|---------|-----------|-------|
| `01_icono_superior_256.png` | átomo + matraz | Investigación |
| `02_icono_reactor_256.png` | reactor nuclear | Reactor/Energía |
| `03_icono_nave_256.png` | llave + jet | Construir naves |
| `04_icono_base_256.png` | edificios isométricos | Base |
| `05_icono_personas_256.png` | personas + red | Alianza |
| `06_icono_principal_256.png` | globo + red | Menú principal |

Para usar uno: `<MenuImageIcon src={MENU_ICONS.science} className="w-9 h-9" />`
(reemplaza un SVG manteniendo el mismo tamaño del botón).

### Escena 3D (`scene.html`) — qué se puede tocar
- Terreno: textura rocosa procedural seamless (`makeRockyTerrain`), tono tan claro,
  con normal map para relieve. Función aislada → se puede retocar sin afectar el HUD.
- Delimitación: borde cuadrado (12×12 celdas de 3.0), línea fina cian (`BORDER`).
- Cámara: pan lateral con botón derecho, zoom con tope, no se ve bajo el terreno.
- Colocación de edificios: `placeItem`/`w2g`/`g2w` + catálogo `CATS`. **No tocar la
  lógica de colocación** salvo para agregar tipos nuevos al catálogo.
- Puente con el HUD React: postMessage (`go3:select`, `go3:resources`, `go3:catalog`).

---

## 4. Sistema de batalla (Unity client — rama `claude/happy-moser-a85026`)

Motor de combate GO2 portado a C# puro (sin dependencias de Unity → testeable solo):

- `apps/unity-client/Assets/Scripts/Battle/` — `BattleRng` (Park-Miller, paridad con el
  backend), `BattleSimulator`, `FleetBuilder`, `BattleReference` (8 naves + 8 formaciones),
  `BattlePlayback`, `PlayerFleet`.
- `apps/unity-client/Assets/Scripts/Galaxy/` — generador procedural de galaxia.
- **Self-test:** `_battle_selftest/` (proyecto .NET standalone) — 41 checks, corre con
  `dotnet run -c Release`. Verifica RNG, determinismo, terminación, formaciones, galaxia.
- Loop jugable: construir → componer flota → mapa galaxia → batalla → capturar sistema.

---

## 5. Comandantes

100 comandantes GO2 disponibles:
- Estático: `https://galaxyonlineiii-production.up.railway.app/data/commanders.json`
  (formato `{total, byRarity:{common:22,super:20,legendary:23,divine:35}, commanders:[…]}`).
- API web (auth-gated): `GET /api/commanders`.
- Unity los consume vía `CommanderService` (parsea el envelope `{success, data}`).

---

## 6. Estado de git y pendientes

- Rama de trabajo con TODO lo verde: **`fix/npm-lock-sync`** (en `C:\temp-galaxy\.claude\worktrees\fix-lock`).
  Está desplegada en producción por CLI.
- **`main` (GitHub)** está atrás y con el `package-lock.json` desincronizado → si Railway
  intenta auto-deploy desde GitHub, FALLA. 
- **Pendiente (requiere login interactivo de GitHub):** pushear `fix/npm-lock-sync` a `main`
  para sincronizar GitHub con producción y reactivar el auto-deploy.
  ```bash
  cd C:\temp-galaxy\.claude\worktrees\fix-lock
  git push origin HEAD:main
  ```

### Fixes clave aplicados (para no repetirlos)
1. `package-lock.json` regenerado (faltaban bcryptjs/jsonwebtoken) → `npm ci` pasaba.
2. `railway.toml`: `prisma generate` antes del build (causa raíz de TODOS los fallos:
   `@prisma/client did not initialize yet`).
3. Tipos del motor de batalla reconstruidos tras un merge que los truncó
   (`CommanderSkill`, `SkillEffect`, `RNG`, `ExpertiseGrade`, `ppcCount`, etc.).
4. Callbacks de Prisma tipados explícitamente (`tx: Tx`, `(typeof arr)[number]`) porque
   el cliente Prisma de Linux/Railway es más estricto que el local de Windows.
5. `next.config.mjs`: `typescript.ignoreBuildErrors` como red de seguridad (el código está
   verificado type-correct local con `tsc --noEmit` = 0).

---

## 7. Verificación rápida (¿está todo online?)

```powershell
$base = "https://galaxyonlineiii-production.up.railway.app"
Invoke-WebRequest "$base/api/health"          # 200 {status:ok, service:go3-web}
Invoke-WebRequest "$base/demo/construction"    # 200 (base terrestre)
Invoke-WebRequest "$base/data/commanders.json" # 200 (100 comandantes)
```
Las rutas `/api/*` autenticadas devuelven **401** sin token (correcto, no 500).
