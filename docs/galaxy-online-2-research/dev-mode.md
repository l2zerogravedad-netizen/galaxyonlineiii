# Modo Desarrollo - Galaxy Online III

## Repositorio

**GitHub:** https://github.com/l2zerogravedad-netizen/galaxyonlineiii

## Descripción

Sistema de configuración para facilitar pruebas durante desarrollo sin afectar el balance de producción.

---

## Variables de Entorno

### 1. DEV_FAST_TIMERS

**Descripción:** Acelera todos los timers del juego (construcción, investigación, naves).

**Valores:**
- `true` = Timers rápidos (10% del tiempo normal)
- `false` (default) = Timers normales

**Ejemplo:**
```bash
# Windows PowerShell
$env:DEV_FAST_TIMERS="true"
npm run dev

# Linux/Mac
export DEV_FAST_TIMERS=true
npm run dev
```

**Efecto:**
- Edificios: 5-10 segundos en lugar de minutos
- Investigación: Tiempos reducidos 90%
- Naves: Construcción rápida

---

### 2. DEV_CHEAP_COSTS

**Descripción:** Reduce drásticamente los costos de construcción.

**Valores:**
- `true` = Costos mínimos (1 metal, 1 plasma, 1 crédito)
- `false` (default) = Costos reales del juego

**Ejemplo:**
```bash
$env:DEV_CHEAP_COSTS="true"
npm run dev
```

**Efecto:**

| Modo | Astillero Nv.1 | Explorador |
|------|---------------|------------|
| **Dev** | 1 Metal, 1 Plasma | 1 Metal, 1 Plasma, 1 Crédito |
| **Producción** | 500 Metal, 200 Plasma | 30 Metal, 10 Plasma, 50 Créditos |

---

### 3. DEV_HIGH_STARTING_RESOURCES

**Descripción:** Da recursos iniciales altos al registrar usuario.

**Valores:**
- `true` = 1,000,000 de cada recurso
- `false` (default) = Recursos normales (500 Metal, 200 Plasma, 1000 Créditos)

**Ejemplo:**
```bash
$env:DEV_HIGH_STARTING_RESOURCES="true"
npm run dev
```

---

## Configuración Completa para Testing

Para pruebas rápidas durante desarrollo, usar las 3 variables:

```bash
# Windows PowerShell
$env:DEV_FAST_TIMERS="true"
$env:DEV_CHEAP_COSTS="true"
$env:DEV_HIGH_STARTING_RESOURCES="true"
cd apps/api && npm run dev
```

```bash
# Linux/Mac (package.json script)
{
  "scripts": {
    "dev:fast": "DEV_FAST_TIMERS=true DEV_CHEAP_COSTS=true DEV_HIGH_STARTING_RESOURCES=true npm run dev"
  }
}
```

---

## Escenarios

### Escenario A: Modo Desarrollo (Testing Rápido)

```bash
DEV_FAST_TIMERS=true
DEV_CHEAP_COSTS=true
DEV_HIGH_STARTING_RESOURCES=true
```

**Características:**
- ✅ Costos bajos (1/1/1)
- ✅ Timers rápidos (10 segundos)
- ✅ Recursos altos iniciales
- ✅ Flujo rápido para probar features

**Uso:** Testing de Fase 3 (Astillero), debugging, demos

---

### Escenario B: Modo Normal (Balance Real)

```bash
# No setear variables, o setearlas en false
DEV_FAST_TIMERS=false
DEV_CHEAP_COSTS=false
DEV_HIGH_STARTING_RESOURCES=false
```

**Características:**
- ✅ Costos reales (500/200, 30/10/50, etc.)
- ✅ Timers normales (5 minutos, 20 segundos, etc.)
- ✅ Recursos normales (500 Metal, 200 Plasma iniciales)
- ✅ Botones se bloquean si faltan recursos
- ✅ Progresión natural del juego

**Uso:** Testing de balance, experiencia de jugador real, preparación para producción

---

## NUNCA en Producción

⚠️ **ADVERTENCIA CRÍTICA:**

Estas variables **NUNCA** deben estar activas en producción:

```bash
# ❌ INCORRECTO - producción
DEV_FAST_TIMERS=true
DEV_CHEAP_COSTS=true
DEV_HIGH_STARTING_RESOURCES=true
```

```bash
# ✅ CORRECTO - producción
# No definir las variables, o:
DEV_FAST_TIMERS=false
DEV_CHEAP_COSTS=false
DEV_HIGH_STARTING_RESOURCES=false
```

---

## Archivos Modificados

Los siguientes archivos responden a estas variables:

| Archivo | Variable | Comportamiento |
|---------|----------|----------------|
| `auth.ts` | DEV_HIGH_STARTING_RESOURCES | Recursos iniciales |
| `planet.ts` | DEV_CHEAP_COSTS, DEV_FAST_TIMERS | Costos y timers de edificios |
| `research.ts` | DEV_FAST_TIMERS | Timers de investigación |
| `shipyard.ts` | DEV_CHEAP_COSTS, DEV_FAST_TIMERS | Costos y timers de naves |

---

## Testing Checklist

### Modo Desarrollo:
- [ ] Login/Register funciona
- [ ] Recursos iniciales altos (1,000,000)
- [ ] Edificios cuestan 1/1
- [ ] Edificios tardan 5-10 segundos
- [ ] Astillero desbloquea naves
- [ ] Naves cuestan 1/1/1
- [ ] Naves se construyen rápido
- [ ] Investigación rápida

### Modo Normal:
- [ ] Login/Register funciona
- [ ] Recursos iniciales normales (500/200/1000)
- [ ] Edificios tienen costos reales (500/200)
- [ ] Edificios tardan minutos
- [ ] Botones bloqueados si faltan recursos
- [ ] Astillero requiere recursos suficientes
- [ ] Naves tienen costos reales
- [ ] Progresión lenta y balanceada

---

## Notas

- Los cambios en variables requieren reiniciar el servidor API
- El frontend muestra costos aproximados (backend valida los reales)
- Las variables no afectan la base de datos (solo el cálculo de costos/timers)

---

**Fase 3 Estabilizada - Listo para testing controlado**
