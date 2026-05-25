# Versión mínima jugable (web)

## Loop del jugador

1. **Registro / login** en `/`
2. **Planeta** en `/dashboard` — grilla 10×8, recursos, cola de construcción
3. **Martillo** → elegir edificio → celda libre → construir
4. **Mejorar** edificio existente desde el panel inferior izquierdo
5. **Recolectar** — aplica producción pasiva (también al cargar dashboard)
6. La cola termina sola (refresh cada 15s o recargar)

## Arranque local

```powershell
cd c:\temp-galaxy
copy .env.example .env
# Editar DATABASE_URL y JWT_SECRET

& "$env:ProgramFiles\nodejs\npm.cmd" install
& "$env:ProgramFiles\nodejs\npm.cmd" run db:generate
& "$env:ProgramFiles\nodejs\npm.cmd" run db:seed

# Terminal 1 — API (puerto 3001)
$env:DEV_CHEAP_COSTS="true"
$env:DEV_FAST_TIMERS="true"
& "$env:ProgramFiles\nodejs\npm.cmd" run dev:api

# Terminal 2 — Web (puerto 3000)
$env:NEXT_PUBLIC_API_URL="http://localhost:3001"
& "$env:ProgramFiles\nodejs\npm.cmd" run dev:web
```

Abrir http://localhost:3000

## Producción (Railway)

- Web: `NEXT_PUBLIC_API_URL` → URL de la API
- API: `DATABASE_URL`, `JWT_SECRET`
- Opcional: `DEV_CHEAP_COSTS` / `DEV_FAST_TIMERS` solo en staging

## API clave

| Método | Ruta | Uso |
|--------|------|-----|
| POST | `/api/auth/register` | Cuenta + imperio + 10k recursos |
| POST | `/api/auth/login` | Token JWT |
| GET | `/api/game/dashboard` | Estado completo + sync recursos |
| POST | `/api/game/resources/collect` | Recolectar producción |
| POST | `/api/planets/:id/build` | Construir / mejorar |
