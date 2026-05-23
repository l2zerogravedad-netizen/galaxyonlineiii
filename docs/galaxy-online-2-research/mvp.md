# MVP jugable — Star Empire Commander (SEC)

Meta: un “vertical slice” jugable en web mobile-first, asíncrono, con combate reproducible y una progresión mínima.

## Requisitos funcionales

- Login (email/password; OAuth opcional)
- Creación de imperio y planeta inicial
- Producción de recursos por tiempo (tick server-authoritative)
- Edificios básicos:
  - HQ (centro), metal extractor/collector, energy/he3 extractor, warehouse
- Investigación básica:
  - 1–2 techs que afecten producción y combate
- Astillero:
  - 2–3 tipos de nave (clases propias)
  - 3–6 módulos iniciales
- Flotas:
  - crear flota, asignar naves, asignar comandante básico
- Misión PvE:
  - generar encounter, travel time, resolver combate async
- Battle report:
  - timeline por round + resumen de pérdidas/recompensas
- Leaderboard simple:
  - poder total o nivel
- Panel admin básico:
  - ver usuarios/empires
  - ajustar catálogos (costos, tiempos) mediante versionado

## Requisitos no funcionales

- Determinismo del combate (seed + ruleset_version)
- Idempotencia en jobs (colas de construcción y batallas)
- Rate limiting y anti-abuso básico
- Logs estructurados para auditoría de economía

