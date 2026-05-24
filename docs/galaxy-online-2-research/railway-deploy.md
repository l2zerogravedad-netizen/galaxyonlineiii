# Railway Deploy - Galaxy Online III

## Estado Actual

| Servicio | URL | Estado |
|----------|-----|--------|
| Frontend (galaxy-web) | https://galaxy-web-production.up.railway.app | Online |
| API (galaxyonlineiii) | https://galaxyonlineiii-production.up.railway.app | Online |
| PostgreSQL (Postgres) | postgres.railway.internal | Online |

## Configuración del Proyecto

### Railway Project
- **Project:** thorough-fascination
- **Environment:** production
- **Region:** sfo

### Servicios
1. **galaxy-web** - Frontend Next.js
2. **galaxyonlineiii** - Backend API (Fastify + Prisma)
3. **Postgres** - Base de datos PostgreSQL

## Variables de Entorno Configuradas

### galaxy-web
- `NEXT_PUBLIC_API_URL` = `https://galaxyonlineiii-production.up.railway.app`
- `NODE_ENV` = `production`
- `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (referencia)
- `NPM_CONFIG_AUDIT` = `false`
- `NPM_CONFIG_FUND` = `false`
- `RAILWAY_SKIP_AUDIT` = `true`

### galaxyonlineiii
- `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (referencia)
- `JWT_SECRET` = `galaxy-online-iii-secret-2026`
- `PORT` = `3001`
- `NODE_ENV` = `production`

## Scripts de Build

### Root package.json
```json
{
  "build": "cd packages/database && npx prisma generate && cd ../../apps/api && npm run build && cd ../web && npm run build",
  "start": "cd packages/database && npx prisma db push --accept-data-loss && cd ../../apps/api && npm start",
  "db:migrate:deploy": "cd packages/database && npx prisma migrate deploy"
}
```

### Notas Importantes
- **Build:** Solo genera Prisma client + compila apps (NO conecta a DB durante build)
- **Start:** Ejecuta `prisma db push` para sincronizar schema + inicia API
- **Runtime:** PostgreSQL internal network disponible solo durante runtime

## Problemas Resueltos

1. **P1012 - DATABASE_URL not found:** Configurado como referencia a Postgres
2. **P1001 - Can't reach database:** Separado build de migraciones (build no conecta a DB)
3. **P3019 - Migration conflict:** Usando `prisma db push` en lugar de `migrate deploy` para inicialización
4. **Security vulnerabilities:** Actualizado Next.js a 16.2.6 + Node.js >= 20

## Funcionalidades Verificadas

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| Registro | ✅ Funciona | Crea usuario, imperio, planeta, edificios, recursos |
| Login | ✅ Funciona | Devuelve JWT token |
| Dashboard (Empire) | ✅ Funciona | Recursos, planetas, edificios |
| Edificios (visualización) | ✅ Funciona | 5 edificios iniciales creados |
| Construcción | ⚠️ Requiere recursos | Costos de producción aplicados |
| Investigación | ✅ Funciona | Technologies vacío (necesita seed) |
| Astillero | ✅ Funciona | Blueprints vacío (necesita seed) |

## Próximos Pasos para Estabilidad

1. **Seed de datos:** Ejecutar seed para technologies y blueprints
2. **Dev mode:** Configurar `DEV_CHEAP_COSTS=true` y `DEV_FAST_TIMERS=true` para testing
3. **Pre-deploy command:** Configurar `npm run db:migrate:deploy` para migraciones automáticas

## Comandos Útiles

```bash
# Ver estado
railway status

# Ver logs
railway logs --service galaxy-web
railway logs --service galaxyonlineiii

# Deploy manual
railway up --service galaxy-web
railway up --service galaxyonlineiii

# Variables
railway variables --service galaxy-web
railway variables --service galaxyonlineiii
```

## Fecha de Actualización
2026-05-24
