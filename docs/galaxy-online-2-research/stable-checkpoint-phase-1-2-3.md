# Stable Checkpoint — Phase 1/2/3

**Date:** 2026-05-24
**Status:** Stable on Railway
**Commit:** main branch

## Verified Working Online

| Feature | Status | URL Tested |
|---------|--------|------------|
| Login | ✅ | POST /api/auth/login |
| Register | ✅ | POST /api/auth/register |
| Dashboard (Empire) | ✅ | GET /api/empire |
| Resources (3 types) | ✅ | Included in empire response |
| Planets (1 initial) | ✅ | Included in empire response |
| Buildings (5 initial) | ✅ | Created on register |
| Research API | ✅ | GET /api/research |
| Shipyard API | ✅ | GET /api/shipyard |
| Health Check | ✅ | GET /health |

## Railway Services Online

| Service | URL | Status |
|---------|-----|--------|
| galaxy-web (Frontend) | https://galaxy-web-production.up.railway.app | ✅ Online |
| galaxyonlineiii (API) | https://galaxyonlineiii-production.up.railway.app | ✅ Online |
| Postgres (Database) | postgres.railway.internal | ✅ Online |

## Available Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login user

### Empire
- `GET /api/empire` — Get empire data (resources, planets, ships)

### Planets
- `GET /api/planets/:id` — Get planet by ID
- `POST /api/planets/:id/build` — Build/upgrade building

### Research
- `GET /api/research` — Get technologies
- `POST /api/research` — Start research

### Shipyard
- `GET /api/shipyard` — Get blueprints and constructions
- `POST /api/shipyard/build` — Start ship construction

## Known Issues / Pending

| Issue | Priority | Notes |
|-------|----------|-------|
| Technologies empty | Medium | Needs seed data in DB |
| Blueprints empty | Medium | Needs seed data in DB |
| No ships in inventory | Medium | Need to build ships in shipyard first |
| Dev mode variables | Low | DEV_FAST_TIMERS, DEV_CHEAP_COSTS available |

## Dev Mode Variables

| Variable | Default | Effect |
|----------|---------|--------|
| DEV_FAST_TIMERS | false | 10x faster timers |
| DEV_CHEAP_COSTS | false | Costs = 1 metal/plasma |
| DEV_HIGH_STARTING_RESOURCES | false | 1M initial resources |

## Railway Deploy Commands

```bash
# Deploy API
railway up --service galaxyonlineiii

# Deploy Frontend
railway up --service galaxy-web

# Check status
railway status

# View logs
railway logs --service galaxyonlineiii
railway logs --service galaxy-web
```

## Technical Decisions

- Monorepo with npm workspaces
- PostgreSQL on Railway (not SQLite)
- Prisma ORM with db push for production sync
- Next.js 16 frontend
- Fastify backend
- JWT auth

## Phase 4 Ready

✅ Database schema already includes Fleet, FleetFormation, Mission, MissionRun models
✅ API routes framework ready
✅ Railway stable

