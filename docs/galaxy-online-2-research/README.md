# Galaxy Online II (Facebook) — Research (no-clone, legal-safe)

> Objetivo: documentar **mecánicas** y **patrones de diseño** de *Galaxy Online II / Galaxy Online 2* (en especial la etapa de Facebook/Flash) para diseñar un juego **inspirado** legalmente (no clon), con tecnología moderna.

## Qué era Galaxy Online II

*Galaxy Online II* (GO2) fue un MMO de estrategia espacial “de navegador” que, según el wiki comunitario, tuvo múltiples versiones regionales publicadas como aplicaciones en `apps.facebook.com` (p.ej. “English (US) version”, “Spanish version”, etc.). Esto sugiere un despliegue fuertemente integrado a Facebook como plataforma de distribución/identidad para la experiencia web.  
Fuente: Wiki comunitario (Fandom). citeturn2view4

## Cómo se jugaba (visión de alto nivel)

De acuerdo con el mismo wiki comunitario, el juego incluía:

- **Base planetaria** con edificios (p. ej. Civic Center, Metal Collector, HE3 Extractor, Resource Warehouse, Ship Factory, Spacedock, Command Center, Weapon Research Center). citeturn2view4turn2view2
- **Investigación** (“Science Research”) con ramas como Logistics Construction, Planetary Defense, Ballistics, Directional, Missile, Ship-based, Ship Defense. citeturn2view4
- **Diseño/armado de naves y módulos** (hulls, attack modules, defense modules, auxiliary/electronic/storage/transmission, etc.). citeturn1view3
- **Comandantes** (reclutamiento, cartas, atributos y expertise). citeturn3search1turn3search0

Este repositorio de investigación no intenta reconstruir fórmulas exactas ni tablas completas: se enfoca en **qué sistemas existían** y **qué decisiones de arquitectura** se desprenden de su estructura.

## Relación con Facebook (por qué importa para el diseño)

El wiki comunitario lista versiones que apuntan a `apps.facebook.com`, lo que encaja con un flujo típico de la época:

- Distribución y acceso desde Facebook (canvas/app).
- Identidad/sesión vinculada a cuenta social.
- Viralidad (feed/invitaciones) y comunidades alrededor de páginas/grupos.

Para un juego moderno inspirado: replicar “lo social” es viable sin depender de Facebook (OAuth + comunidades in-game + guild tools).

## Qué pasó con el cierre por Flash (cronología)

Una referencia comunitaria (DeaJae) reproduce el aviso de cierre donde se menciona explícitamente:

- Fin del soporte de Flash: **12 Jan 2021**
- Cierre de pagos: **6 Jan 2021**
- Cierre de servidores: **12 Jan 2021**
- Cierre de soporte: **12 Feb 2021**

Fuente: “The End of Galaxy Online 2” (DeaJae). citeturn2view4

Nota: Aunque Adobe terminara Flash no obliga a “apagar” un juego si se migra a otra tecnología; aquí, el aviso indica cese total de operaciones en esas fechas.

## Proyectos que siguen vivos / comunidad actual

### SuperGO2 (server emulation / private server)

El repo `SuperGO2/supergo2-issues` se describe como “server emulation”/servidor privado del antiguo MMO Flash. citeturn1view0turn2view1

- Utilidad para investigación: **discusión comunitaria**, bug reports, features, vocabulario del juego, expectativas de jugadores.
- Riesgo legal: alto si se usa para extraer o reutilizar contenido del juego original; **en esta investigación NO se copia código/asset ni se integra su client/launcher**.

### KrTools (Ship Designer / Instance Viewer)

KrTools ofrece herramientas tipo *Ship Designer* e *Instance Viewer* para GO2. citeturn1view1turn1view2  
En un post de actualización, el autor indica que imágenes usadas son “originales del juego” obtenidas del cache/archivos del juego. citeturn0search2

- Utilidad para investigación: entender **conceptos** de módulos/stats y el “lenguaje” de builds.
- Riesgo legal: elevado para assets (imágenes originales). Este research debe limitarse a **describir mecánicas** y **no reutilizar imágenes/datos protegidos**.

## Fuentes confiables vs. dudosas (reglas prácticas)

Confiables (para “qué existía”):
- Documentación comunitaria (wikis) para listas, nombres genéricos de sistemas, navegación de features. citeturn2view4turn2view1turn3search2
- Artículos de autores conocidos en la comunidad cuando citan comunicados o fechas concretas. citeturn2view4
- Repos públicos con propósito claro (issue trackers, APIs) para contexto técnico y restricciones. citeturn1view0turn1view0

Dudosas / alto riesgo:
- “Rips” de SWF, dumps, leaks, binarios de launcher no verificados.
- Herramientas que incluyan **assets originales** (aunque sean “rescatados del cache”) si la intención es reusarlos.
- Código de emulación/servidores privados para “clonar” comportamiento exacto.

## Qué se puede usar legalmente como inspiración (resumen)

Se puede:
- Inspirarse en **loops**: producción por tiempo, colas de construcción/investigación, composición de flotas, progresión por tech.
- Inspirarse en **UI patterns** y “fantasía” (gestión imperial espacial) con arte/lore propios.
- Inspirarse en **sistemas genéricos**: PvE asíncrono, PvP por scouting, alianzas, eventos temporales.

No se puede:
- Reutilizar assets/código/datos del juego original.
- Usar marcas/nombres protegidos (IGG, Galaxy Online II, etc.) en el producto final.
- Construir un “clon” con mismas tablas/fórmulas exactas si se derivan de contenido propietario.

## Índice de documentos en esta carpeta

- `sources.md` — inventario de fuentes, utilidad y riesgo
- `game-systems.md` — despiece de sistemas del juego (lo observado / lo inferido)
- `rebuild-plan.md` — plan de diseño y arquitectura de *Star Empire Commander* (inspirado)
- `data-model.md` — modelo de datos propuesto
- `combat-model.md` — primer modelo de combate (propio, no propietario)
- `mvp.md` — definición del MVP jugable
- `legal-safety.md` — checklist legal y de seguridad

