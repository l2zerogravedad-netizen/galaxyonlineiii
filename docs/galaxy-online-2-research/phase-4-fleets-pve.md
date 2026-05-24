# Fase 4: Flotas + Misiones PvE — Galaxy Online III

## Estado: En desarrollo

## Objetivo
Implementar sistema de flotas y misiones PvE asíncronas con combate determinista.

## Funcionalidades

### 1. Flotas (Fleet System)
- [ ] Crear flota desde astillero
- [ ] Asignar naves a flota
- [ ] Ver flotas existentes
- [ ] Disolver flota
- [ ] Estado: idle / traveling / engaged

### 2. Misiones PvE
- [ ] Listar misiones disponibles por dificultad
- [ ] Generar encuentro (enemigo + recompensas)
- [ ] Travel time calculado por distancia
- [ ] Resolver combate async en backend
- [ ] Battle report con timeline

### 3. Combate (Determinista)
- [ ] Seed + ruleset_version
- [ ] Stats: hp, shield, armor, speed, damage
- [ ] Rounds con initiative order
- [ ] Daño: raw → mitigated → shield → hp
- [ ] Reporte: resumen + timeline + pérdidas + loot

## Data Model (Prisma)

```prisma
model Fleet {
  id          String   @id @default(uuid())
  empireId    String
  name        String
  status      String   // IDLE, TRAVELING, ENGAGED
  planetId    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model FleetShip {
  id          String   @id @default(uuid())
  fleetId     String
  blueprintId String
  quantity    Int
  loadout     Json?    // modules config
}

model PvEMission {
  id          String   @id @default(uuid())
  name        String
  difficulty  Int      // 1-10
  rewards     Json     // {metal, plasma, credits, xp}
  enemyFleet  Json     // {ships: [...]}
  travelTime  Int      // seconds base
}

model BattleReport {
  id          String   @id @default(uuid())
  empireId    String
  missionId   String?
  seed        String
  status      String   // PENDING, WON, LOST
  timeline    Json?    // round-by-round
  losses      Json?    // {player: [...], enemy: [...]}
  loot        Json?    // rewards
  createdAt   DateTime @default(now())
}
```

## API Endpoints

| Endpoint | Method | Descripción |
|----------|--------|-------------|
| /api/fleets | GET | Listar flotas del imperio |
| /api/fleets | POST | Crear nueva flota |
| /api/fleets/:id | DELETE | Disolver flota |
| /api/fleets/:id/ships | POST | Agregar naves |
| /api/missions | GET | Listar misiones PvE |
| /api/missions/:id/launch | POST | Lanzar misión |
| /api/battles/:id | GET | Ver reporte de batalla |

## Frontend

- [ ] Pantalla de Flotas
- [ ] Pantalla de Misiones
- [ ] Modal de Battle Report
- [ ] Notificaciones de misión completada

## Dependencias Fase 1/2/3

Requiere:
- ✅ Login/Register
- ✅ Empire + Planets
- ✅ Resources
- ✅ Shipyard (blueprints + construcción)
- ⏳ Seed de blueprints/naves
