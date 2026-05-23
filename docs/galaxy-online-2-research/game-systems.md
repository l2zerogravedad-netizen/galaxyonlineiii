# Game systems (GO2) — Despiece para inspiración (no-clone)

Este documento mezcla:
- **Observado**: cosas explícitas en wikis/herramientas (con enlaces).
- **Inferido**: conclusiones de diseño (marcadas como inferidas) para orientar *Star Empire Commander*.

## Recursos (observado + inferido)

Observado: el wiki muestra iconos/recursos asociados a costos y upgrades (p. ej. Metal, He3, Gold) en tablas de edificios/investigación. citeturn2view1  
Inferido: economía base de 3 recursos:
- **Metal**: construcción/producción industrial (edificios, cascos, etc.)
- **He3**: recurso energético / “combustible” para módulos, investigación o acciones
- **Gold**: moneda premium o moneda de alto valor (probable atajo/market)

## Edificios / base

Observado:
- Hay “2 lugares” para construir: **ground base** y **space base**. citeturn2view2
- El índice del wiki lista edificios típicos: Metal Collector, HE3 Extractor, Resource Warehouse, Ship Factory, Spacedock, Command Center, Weapon Research Center, Trading Center, etc. citeturn2view4turn2view2

Inferido (patrón de diseño):
- Base como “árbol de dependencias”: un “centro cívico” (Civic Center) gatea niveles de otros edificios.
- Separación “tierra vs. espacio” permite dos capas de progresión y defensa.

## Investigación

Observado:
- El wiki lista ramas de “Science Research” (Logistics Construction, Planetary Defense, Ballistics, Directional, Missile, Ship-based, Ship Defense). citeturn2view4
- Weapon Research Center (WRC) permite investigar **ships y modules** con dos campos: Ship Blueprint Research y Module Blueprint Research. citeturn2view1

Inferido:
- Doble árbol de progreso: (1) “ciencia” global (bonos generales) y (2) “blueprints” específicos (naves/módulos).

## Flotas, naves y “hulls”

Observado:
- El índice de Buildings lista categorías de diseño: hull design (Frigates, Cruisers, Battleships, Flagships, etc.) y módulos (attack/defense/aux). citeturn1view3

Inferido:
- Flota = colección de stacks (naves por tipo) + formación/posicionamiento + comandante.
- La progresión central ocurre por: desbloquear hulls + mejorar blueprints + optimizar módulos.

## Comandantes

Observado:
- Command Center recluta comandantes y menciona que el cooldown baja con el nivel. citeturn3search1
- Commander Cards: obtención por “draw” en Command Center, wheel, auction house, eventos; se pueden mergear (Compound Center) para subir star rank. citeturn3search0
- Atributos mencionados: Accuracy, Dodge, Speed, Electron; además de “expertise” por tipo de arma/hull con grades S–D y modificadores. citeturn3search0

Inferido:
- Sistema gacha/coleccionable + progresión por fusión (“merge”) + metajuego de builds.
- “Expertise por arma/hull” es una gran idea para diversidad de comandantes sin infinitas skills.

## Módulos (armas/defensas/aux)

Observado:
- El índice del wiki separa Attack Modules (ballistic/directional/missile/ship-based/planetary), Defense Modules (structure/shield/air defense), Auxiliary (electronic/storage/transmission). citeturn1view3
- KrTools Ship Designer expone un set de stats de build (Attack, Shield, Structure, Defense, Agility, etc.) y también conceptos de “negation” por tipo (kinetic/heat/magnetic/explosive). citeturn1view1

Inferido:
- Construcción de nave modular con límites (tech/volume) y trade-offs.
- Tipos de daño/mitigación (4 afinidades) como piedra-papel-tijera ampliado.

## Combate (alto nivel)

Observado:
- KrTools Instance Viewer muestra que un encounter tiene “Structure Details / Fleet Details / Ship Details / Commander Details” y rangos, movement, durability, etc. citeturn1view2

Inferido:
- Combate táctico por “instancia” (grid/espacios), con orden influido por Speed.
- Reporte de batalla con desglose por flota/nave/comandante.

## PvE / PvP / alianzas / eventos

No se encontró en las fuentes revisadas aquí una descripción única y completa en una sola página; se recomienda:
- Extraer “mapa de features” desde el índice del wiki (misiones, eventos, alianza, market) sin copiar tablas. citeturn2view4
- Validar con 2–3 fuentes cruzadas antes de asumir mecánicas exactas.

## Monetización (observado + inferido)

Observado:
- Commander Cards pueden obtenerse con “Mall Points” (implica moneda del mall) y se mencionan Auction House y eventos. citeturn3search0

Inferido:
- Monetización típica: moneda premium para draws, aceleradores de timers, packs de recursos, items temporales.
- Para el juego inspirado, se propone monetización ética (ver `rebuild-plan.md` y `legal-safety.md`).

