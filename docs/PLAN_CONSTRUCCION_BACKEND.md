# Plan — Conectar la construcción de la base terrestre al backend (Tarea 50)

> Contratos 100% confirmados por lectura de código. Implementación lista para aplicar.
> Regla CRÍTICA: la base terrestre NO se rompe. Todo es **aditivo + try/catch + guardado por token**.
> El HUD React (`ConstructionDemoPage.tsx`) NO se toca. Solo se edita `public/planet-3d/scene.html`.

## Contratos confirmados

### Endpoint `POST /api/planets/[id]/build`
- Body: `{ slotIndex: number (0..79), type: string }`.
- `normalizeBuildingType(type)` → canónico; debe estar en `API_BUILDABLE_TYPES`.
- `validateBuildRequest`: slot 0–79 + cola activa ≤ 5 (`GO2_CONSTRUCTION_QUEUE_SIZE`) + `canPlaceBuildingType`.
- Verifica que el planeta pertenece al `empireId` (JWT).
- Descuenta METAL / GAS(plasma) / CREDITS. Crea building `CONSTRUCTING` con `constructionEndsAt`. Slot ocupado ⇒ UPGRADE.
- Respuesta: `{ success, data }`.

### `/api/empire` (GET, Bearer)
- `planets[0].buildings[] = { type (ej. METAL_MINE), level, slotIndex, status }`, `maxBuildingSlots: 80`.

### Constantes (`@galaxy/shared`)
- `PLANET_BUILDING_SLOTS = 80`, `PLANET_GRID_COLUMNS = 10`, `PLANET_GRID_ROWS = 8`.
- Tipos canónicos snake_case: metal_extractor, gas_refinery, he3_extractor, warehouse, energy_generator, control_center, shipyard, research_lab, hangar, defense_turret, trading_center, radar, residential_area.
- `normalizeBuildingType` convierte legacy (METAL_MINE…) → canónico; los strings que devuelve `/api/empire` round-trippean OK (el dashboard ya los usa).

## Escena actual (`scene.html`) — hechos
- Grid visual **12×12 cuadrado** (`GRID_C=GRID_R=12`) — debe seguir CUADRADO (requisito del usuario).
- `placed = [{typeId,col,row,rot}]`, `loadState/saveState` en `localStorage('go3c_v1')`.
- Catálogo escena (5 edificios): `metal_mine, power_plant, warehouse, shipyard, command_center` (+ naves/props).
- Ya tiene puente postMessage con el HUD (`go3:select/cancel/reset`, emite `go3:resources/catalog`).
- Coloca con click en `canvas` (handler en ~L654); borra con click derecho (~L677); guarda saved en `init()` (~L909).

## Diseño (aditivo, no rompe nada)

### Mapeos
- catalogId → apiType (strings que `/api/empire` devuelve y la API normaliza):
  `metal_mine→METAL_MINE`, `power_plant→PLASMA_EXTRACTOR`, `warehouse→WAREHOUSE`, `shipyard→SHIPYARD`, `command_center→COMMAND_CENTER`.
- apiType → catalogId (para pintar reales; tipos sin GLB propio caen al más cercano):
  `METAL_MINE→metal_mine, PLASMA_EXTRACTOR→power_plant, WAREHOUSE→warehouse, SHIPYARD→shipyard, COMMAND_CENTER→command_center, CREDIT_MINT→warehouse, RESEARCH_LAB→command_center`.
- Slot ↔ celda (sub-grid 8×10 = 80 dentro del 12×12 visual; el resto queda sandbox local):
  `cellToSlot(col,row) = (col<8 && row<10) ? row*8+col : -1`; `slotToCell(slot) = {col: slot%8, row: floor(slot/8)}`.

### Comportamiento
- `const AUTH_TOKEN = localStorage.getItem('token'); const BACKEND = !!AUTH_TOKEN;` (invitado ⇒ cero cambios, sandbox igual).
- **init()**: si BACKEND → `GET /api/empire`, guardar `PLANET_ID`, fijar `R` desde recursos reales, y por cada building real pintar con `placeItem(API_TO_TYPE[type], slotToCell(slot))`. Todo en try/catch; si falla, sigue el sandbox normal.
- **click (colocar)**: tras la colocación local exitosa, si BACKEND y `cellToSlot>=0` y existe `TYPE_TO_API[typeId]` →
  `POST /api/planets/${PLANET_ID}/build {slotIndex, type}`. Éxito ⇒ refrescar `R` desde `/api/empire`. Fallo ⇒ `showHint(error)` y **revertir** la colocación local (no mentir). try/catch.
- Naves/props y celdas fuera del sub-grid 8×10 ⇒ solo sandbox local (sin POST).

### Por qué no rompe la base
- HUD React intacto. Grid visual y borde cuadrado intactos. Path invitado intacto.
- Todo el código nuevo va detrás de `if (BACKEND)` + try/catch; un fallo de red/tipo degrada al sandbox.

## Verificación obligatoria antes de dar por hecho (ser mi propio tester)
1. Releer `scene.html` tras editar → sin error de sintaxis JS.
2. `apps/web` build verde.
3. Deploy Railway → SUCCESS.
4. En vivo: `/demo/construction` 200 como invitado (sin cambios). Con token de prueba: colocar mina → `POST build` 201, recargar y ver que persiste; recursos del HUD bajan.

## Estado
- Tarea 50: diseño y contratos LISTOS. Implementación pendiente de aplicar+verificar.
- Tarea 51 (producción de recursos en el tiempo): el backend YA acumula vía `syncEmpireGameState`/`accrueResource`; falta solo refrescar el HUD periódicamente (polling suave a `/api/empire`).
