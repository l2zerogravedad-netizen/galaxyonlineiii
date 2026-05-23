# Rebuild plan (inspirado) — Star Empire Commander

Nombre temporal del proyecto: **Star Empire Commander** (SEC)

## Principios (legal + producto)

- Inspirarse en **patrones** (loops, sistemas, pacing), no en fórmulas/valores exactos.
- Arte, lore, UI y nombres: **100% originales**.
- Priorizar experiencia moderna: mobile-first, performance, anti-abuso, telemetría, live-ops.

## MVP (jugable)

Ver `mvp.md` para el checklist completo. En resumen:
- Login
- Planeta inicial
- Producción por tiempo (tick)
- Construcción + investigación (colas/timers)
- Astillero + creación de naves
- Flotas + misión PvE
- Resolución asíncrona + battle report
- Leaderboard simple
- Panel admin básico

## Fases

### Fase 0 — Research y prototipos (sin “juego público”)
- Consolidar docs de sistemas (esta carpeta).
- Prototipo “simulador de combate” aislado (sin UI final).
- Validación de escalabilidad (jobs, colas, time simulation).

### Fase 1 — MVP interno
- Economía base + colas + combate PvE.
- Admin + herramientas de balancing.
- Telemetría mínima.

### Fase 2 — Beta cerrada
- Alianzas + PvP limitado.
- Eventos semanales.
- Anti-abuso (rate limits, bot heuristics).

### Fase 3 — Lanzamiento
- Live-ops, contenidos nuevos, marketplace/auction (si aplica) con controles.
- Moderación, soporte, métricas.

## Stack sugerido (full-stack moderno)

### Backend
- Lenguaje: TypeScript (Node) o Kotlin (según equipo). Recomendado TS por velocidad de iteración.
- Framework: NestJS / Fastify.
- API: REST + Webhooks; WebSocket solo para notificaciones (no realtime combat).
- Auth: email+password + OAuth (Google/Apple) opcional.
- Jobs: BullMQ/Redis o Temporal.io para colas y timers.
- Storage: Postgres (principal) + Redis (cache/locks).
- Observabilidad: OpenTelemetry + logs estructurados.

### Frontend
- Web: React + Vite + Tailwind.
- UI: responsive-first; “game shell” SPA.
- Render del mapa/instancias: Canvas/WebGL opcional (según alcance); para MVP, DOM + SVG.

### Infra
- Docker + compose para dev.
- Deploy: Fly.io/Render/AWS (según presupuesto).
- CDN para assets.

## Motor de combate (asíncrono)

Enfoque:
- “Resolver combate” en backend como **pure function**: `BattleInput -> BattleResult`.
- Determinismo: seed + reglas versionadas para reproducibilidad.
- Almacenamiento: battle report persistido (auditable).

Ver `combat-model.md` para un modelo inicial.

## Sistema de flotas

Diseño SEC (inspirado, propio):
- Flota = `formation` (posiciones), `stacks` (naves por blueprint), `commander`, `modules`.
- Capacidad limitada por “Command Limit” derivado de HQ/tech.
- Viajes/misiones con tiempo, consumo y riesgo (PvE/PvP).

## Sistema de comandantes

Inspiración: “atributos + expertise + skills con triggers”.

SEC:
- Commander = 4 stats (p.ej. Precision, Evasion, Initiative, Overcharge) + expertises por categorías.
- Progresión: XP por batallas + “merge” reemplazado por sistema legal propio (p.ej. “training manuals”).
- Skills: árboles y triggers explícitos (sin copiar texto/skills del original).

## Sistema de módulos

SEC:
- Blueprints de módulos con rarities controladas.
- Hard caps por slots/energía/volumen.
- Tipos de daño/mitigación propios (renombrados) con claridad de counters.

## Panel admin

MVP admin:
- CRUD de catálogos: buildings, researches, ships, modules, missions.
- Balance tools: simulación de economía, heatmaps de progression blockers.
- Moderación: bans, resets, auditoría de trades.

## Multiplayer async

- Todo combate es asíncrono: el jugador “envía misión” y recibe reporte.
- PvP: ventanas de vulnerabilidad, scouting y “defense fleets” para evitar griefing.
- Consistencia temporal: “server time” único; colas resolubles por jobs.

## Protección anti-abuso

- Rate limit por IP/user.
- Detección de multi-account (heurística + challenge).
- Locks transaccionales para market/trades.
- Auditoría de acciones económicas y rollback limitado.

## Monetización ética

- Cosméticos (skins, emblems, UI themes).
- Battle pass con progreso no pay-to-win.
- QoL (más slots de cola) con límites y sin romper fairness.
- Nunca vender poder directo en PvP ranked.

