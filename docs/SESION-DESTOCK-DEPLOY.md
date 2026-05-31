# Sesión DESTOCK — deploy + pulido + bugfixes

**Rama:** `fix/npm-lock-sync` (la que despliega Railway)
**Worktree (código fuente de verdad):** `C:\temp-galaxy\.claude\worktrees\fix-lock\`
**Producción:** https://galaxyonlineiii-production.up.railway.app — Online, verificado en vivo.

## Qué se hizo (todo commiteado, pusheado y desplegado)

| Commit | Cambio |
|--------|--------|
| `2454818` | planeta: terreno texturizado (rock/metal) en vez de diamantes verdes planos |
| `15d17a8` | planeta: sprites HD de edificios (arregla 404 de `buildings/*.webp` → `destock-isometric/building_*.png`) |
| `7b4a9ab` | galaxia: botón "Espiar / Atacar" (estaba muerto) → rutea a `/destock/combat` |
| `2215229` | inventario: carga el inventario real de `/api/inventory` con sesión (antes solo mock) |
| `0870ee1` | clan: 3 botones muertos (Donar/Chat/Territorios) → deshabilitados "(próximamente)" |
| `532ff42` | iconos HD nav/HUD daban 404 sin fallback → `GO2_HD_ICON_SRC` vaciado, cae al SVG nativo (0 imágenes rotas) |
| `70c34cd` | marketplace: compra/venta REAL contra `/api/marketplace` con sesión (antes "próximamente") |
| `d2f4d1a` | datos legacy `/dashboard` (game-data.ts, gameDashboardData.ts): 19 rutas `.webp` 404 → PNG existentes |

## Despliegue de `/destock` (réplica GO2 de Kimi)
Antes de este pulido se desplegó la réplica completa `/destock` (13 rutas) a la rama
deployada, con:
- Resolución de 3 símbolos faltantes en el `@galaxy/shared` viejo de la rama
  (`createSeededRng`, `GO2_GRID_CORNER_CELLS`, `CombatUnitInput`) — definidos localmente en `combat/`.
- Dep `three@0.184.0` agregada.
- Fix del combate: la ronda quedaba congelada en 0 (root cause: `processRound` mutaba un
  objeto dentro del updater de `setUnits` y lo leía síncrono después; React no garantiza
  ejecución síncrona). Corregido a cómputo síncrono desde `unitsRef.current`.

## Reglas respetadas
- **Base terrestre NUNCA tocada** (`apps/web/src/features/construction-demo/`,
  `/demo/construction`, `scene.html`) — verificado en cada commit.
- Cada deploy: build aislado verde (56/56 páginas) ANTES de subir; verificado en vivo DESPUÉS.
- Deploys zero-downtime (todas las rutas 200 durante cada transición).

## Backend (verificado en vivo, 16/17 QA)
register → login → empire (recursos) → build (persiste) → collect
(`/api/game/resources/collect`) → 12 GET endpoints 200 → combat/simulate.
El 1 "fallo" del QA es un artefacto del script de prueba (usaba `/api/empire/build`
en vez del real `/api/planets/:id/build`), NO una regresión.

## Pendiente / notas
- No quedan bugs del audit sin resolver.
- El planeta server-side (`/api/planets/:id/build`) persiste; el juego destock además
  guarda estado en localStorage (`destock-go2-identical-v1`).

## Dónde está todo
- **Código:** este worktree (`apps/web/`).
- **Historial:** `git log` en esta rama.
- **Docs GO2:** `docs/galaxy-online-2-research/`.
- **Transcripción de la sesión:** `C:\Users\Mi Pc\.claude\projects\C--temp-galaxy--claude-worktrees-happy-moser-a85026\`.
