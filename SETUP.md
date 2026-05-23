# Setup Local - Galaxy Online III

## Opción Recomendada: SQLite (Desarrollo Local)

**No requiere instalación de PostgreSQL ni Docker.**

El proyecto está configurado para usar SQLite localmente:
- Archivo: `packages/database/dev.db`
- No requiere servidor de base de datos
- Ideal para desarrollo y pruebas rápidas

## Opción 1: PostgreSQL Nativo (Para producción-like)

### 1. Instalar PostgreSQL
1. Descargar desde https://www.postgresql.org/download/windows/
2. Versión 15 o superior
3. Durante instalación:
   - Puerto: 5432
   - Password: `galaxy_local_dev_2026`
   - Crear base de datos: `galaxy_online_iii`

### 2. Crear base de datos manualmente
```bash
# Abrir psql como postgres user
psql -U postgres

# En consola psql:
CREATE DATABASE galaxy_online_iii;
CREATE USER galaxy_user WITH PASSWORD 'galaxy_local_dev_2026';
GRANT ALL PRIVILEGES ON DATABASE galaxy_online_iii TO galaxy_user;
\q
```

### 3. Configurar .env
Ya creado en `.env`:
```
DATABASE_URL="postgresql://galaxy_user:galaxy_local_dev_2026@localhost:5432/galaxy_online_iii"
```

## Opción 2: Docker (Si tienes Docker Desktop)

```bash
docker-compose up -d
```

## Opción 3: Supabase Local o Neon (Cloud dev)

1. Crear proyecto gratuito en https://neon.tech o https://supabase.com
2. Copiar connection string
3. Pegar en `.env`

## Instalación de Dependencias

```bash
# Usar npm (ya configurado para workspaces)
npm install
```

## Setup de Base de Datos (Automático)

```bash
cd packages/database

# El .env ya está configurado con SQLite local
# Generar cliente Prisma
npx prisma generate

# Crear base de datos y migraciones
npx prisma migrate dev --name init

# Ejecutar seed (tecnologías, naves, misiones)
npx prisma db seed

# Verificar datos (opcional)
npx prisma studio
```

## Iniciar Servicios

### Terminal 1 - API Backend
cd apps/api
copy ..\..\.env .
npm run dev
# API corriendo en http://localhost:3001
# Health check: http://localhost:3001/health

### Terminal 2 - Web Frontend
cd apps/web
npm run dev
# Web corriendo en http://localhost:3000
```

## Verificación

1. Abrir http://localhost:3000
2. Registrar nuevo usuario
3. Verificar que se creó:
   - Usuario
   - Imperio
   - Planeta con 5 edificios
   - Recursos iniciales
   - Tecnologías

## Troubleshooting

### Error: "database does not exist"
- Crear base de datos manualmente en psql/pgAdmin

### Error: "permission denied"
- Verificar que galaxy_user tiene privilegios sobre la base de datos

### Error: "connection refused"
- Verificar que PostgreSQL service está corriendo
- Verificar puerto 5432 no está bloqueado

## Comandos Útiles

```bash
# Reset completo de DB
npx prisma migrate reset

# Ver estado de migraciones
npx prisma migrate status

# Formatear schema
npx prisma format

# Validar schema
npx prisma validate
```
