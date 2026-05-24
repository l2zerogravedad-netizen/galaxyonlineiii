# AI 3D Asset Manifest

Registro obligatorio antes de usar cualquier modelo en el juego. **No integrar assets sin fila `approved` y licencia documentada.**

| Nombre | Tipo | Fuente | Original | Optimizado | Peso (opt.) | Licencia | Estado | Listo juego | Notas |
|--------|------|--------|----------|------------|-------------|----------|--------|-------------|-------|
| shipyard-meshy-v1 | building | Meshy | `shipyard/original/` (pendiente) | `shipyard/optimized/` (pendiente) | — | Pendiente registrar | generated | no | Astillero — export Meshy cuando esté listo. Revisar con visor `/admin/assets/3d-viewer`. |

## Estados

| Estado | Significado |
|--------|-------------|
| `generated` | Export recibido, sin revisión |
| `reviewed` | Revisado en visor + checklist parcial |
| `approved` | Aprobado para integración futura |
| `rejected` | No usar (licencia, peso, calidad, IP) |

## Política de peso

| Tier | Objetivo |
|------|----------|
| Premium | &lt; 30 MB |
| Low | &lt; 10 MB |
| **No integrar directo** | &gt; 50 MB |

## Licencias aceptadas (ejemplos)

- Meshy: según términos de tu plan (documentar en `shipyard/reports/license.md`)
- Original interno / CC0 verificado
- **Rechazado:** assets de Galaxy Online II, logos de terceros, modelos sin licencia clara
