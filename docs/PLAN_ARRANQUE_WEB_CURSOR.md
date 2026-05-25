# Plan de arranque — Cliente Web (Cursor)

Base: `c:\temp-galaxy\`. Descartar UI experimental que no siga `docs/implementation-phases/` y `apps/web/src/data/game/`.

---

## Fase 0 — Infra (hecho / mantener)

- [x] Monorepo `apps/api`, `apps/web`, `packages/database`, `packages/shared`
- [ ] `apps/web/src/lib/apiBase.ts` → API Railway en producción
- [ ] `.env` local con `DATABASE_URL` (Supabase) solo para API local opcional
- [ ] `NEXT_PUBLIC_API_URL` apuntando al servicio Railway API

---

## Fase 1 — Una sola verdad de datos

1. Exportar desde `apps/web/src/data/game/` hacia `packages/shared`:
   - `buildings-complete.ts` → tipos + `ALL_BUILDINGS_COMPLETE`
   - `planet-colonization.ts` → `PLANET_GRID_COLUMNS = 10`, `PLANET_GRID_ROWS = 8`, 80 slots
   - `economy-system.ts` → recursos oficiales
2. API (`apps/api`) importa solo `@galaxy/shared` para costes, unlocks y validación.
3. Eliminar catálogos duplicados en API si existen rutas viejas (`METAL_MINE` vs `metal_extractor`).

**Regla de mapeo API:** `Building.type` en BD = `BuildingComplete.type` del catálogo Windsurf (snake_case).

---

## Fase 1 — UI planeta (GO II)

Referencia: `docs/GO2_GAMEPLAY_FROM_VIDEO.md` (copiar al repo si falta) + `1-2-buildings-construction.md`.

| Elemento | Implementación web |
|----------|-------------------|
| Terreno verde + grilla romboidal | Canvas/CSS isométrico, 10×8 |
| HUD recursos | Esquina superior derecha, 4 iconos |
| Martillo | Abre modal 5 pestañas |
| Lista edificios | Icono + nombre + `built/max` |
| Cola construcción | Panel derecho, 5 filas, countdown API |
| Colocar | Clic celda → `POST /api/planets/:id/build` `{ slotIndex, type }` |
| Barra amarilla en obra | `status === CONSTRUCTING` + `constructionEndsAt` |

Rutas:

- `/dashboard` — planeta (pantalla principal)
- `/dashboard/galaxy` — mapa
- `/dashboard/station` — estación
- `/dashboard/market` — mercado
- `/fleets` — flotas (Fase 2)

Nav inferior común en todas las pantallas de juego.

---

## Fase 1 — API mínima

Alinear con `buildings-complete` + doc:

- `GET /api/game/dashboard` — jugador, recursos, planeta, edificios, `constructionQueue[]` (máx. 5)
- `POST /api/planets/:id/build` — cola llena → 400
- `POST /api/game/resources/collect` — recolección pasiva
- `prisma` — `maxBuildingSlots` 80 en planeta medium, campos ya en schema

---

## No hacer en web (otros agentes o fases posteriores)

- Cliente Unity / Electron (Windsurf)
- App iOS/Android (Claude)
- Combate 9×9 completo hasta Fase 2 doc
- Ruleta / VIP / gacha hasta doc ADDITIONAL_SYSTEMS

---

## Verificación antes de dar por cerrado Fase 1 web

1. Registro → 10 000 recursos iniciales (según `economy-system` / auth).  
2. Dashboard carga edificios reales del imperio.  
3. Construir en slot vacío descuenta recursos y aparece en cola.  
4. Tras tiempo, edificio pasa a activo (poll o refresh).  
5. Build `npm run build` en `apps/web` y `apps/api` sin errores.

---

## Archivos clave en temp-galaxy

```
apps/web/src/data/game/buildings-complete.ts
apps/web/src/data/game/planet-colonization.ts
apps/web/src/data/game/economy-system.ts
apps/web/src/components/game/PlanetDashboardPremium.tsx  → reemplazar por vista GO II
docs/implementation-phases/phase-1-fundamentals/1-2-buildings-construction.md
```

---

*Cursor: ejecutar este plan en `c:\temp-galaxy` únicamente.*
