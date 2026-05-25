# Galaxy Online II — Mecánica extraída del video

Fuente: `VIDEO DE MECANICA DE JUGABILIDAD.mp4` (~13 min, `go2es.igg.com`).

## Vista base terrestre (lo que debemos replicar)

- **Cámara:** isométrica 2.5D sobre terreno verde (césped, rocas, árboles).
- **Cuadrícula:** rejilla romboidal/diamante **visible** sobre el suelo; los edificios se alinean a celdas.
- **Edificios:** sprites 3D pre-renderizados con bases pavimentadas; ocupan varias celdas (torre central ~grande, antenas 1×1).
- **Estados visuales:** barras de progreso amarillas sobre edificios en construcción; **signos ?** amarillos cuando hay acción pendiente (terminar/colocar).

## Flujo de construcción (orden exacto)

1. Jugador en **vista planeta** (botón casa en menú inferior derecho).
2. Abre menú de construcción (icono martillo / panel central).
3. **Pestañas de categoría** (horizontal, dorado = activo):
   - Recursos
   - Desarrollo
   - Civil
   - Milicia
   - Defensa
4. Lista de edificios con **icono + nombre + límite** `0/1` o `1/1` (máximo por planeta).
5. Al elegir edificio: cursor vuelve al mapa; se coloca en celda libre de la grilla.
6. **Cola de construcción** (panel derecho): nombre, nivel, cuenta atrás (`Centro tecnológico Nv.1 00:01:36`).

## Economía (HUD superior derecha)

Cuatro recursos en barra (ver `apps/web/src/data/game/economy-system.ts`):

| Icono | Recurso |
|-------|---------|
| Monedas doradas | Créditos |
| Mineral rojo | Metal |
| Cristal azul | Plasma / He3 |
| Gema verde | Premium (futuro) |

Valores iniciales en video ~10 000 cada uno al registrarse.

## Catálogo canónico

- Edificios: `apps/web/src/data/game/buildings-complete.ts`
- Grilla 80 slots (10×8): `planet-colonization.ts` → medium terrestrial = 80
- Coordinación multi-cliente: `docs/COORDINACION_TRES_CLIENTES.md`

## Próximos pasos (web — Cursor)

1. Vista planeta isométrica 10×8 + API real.
2. Menú 5 pestañas + `n/m`.
3. Cola 5 slots desde `GET /api/game/dashboard`.
4. Nav inferior: Planeta · Galaxia · Estación · Mercado · Flotas.
