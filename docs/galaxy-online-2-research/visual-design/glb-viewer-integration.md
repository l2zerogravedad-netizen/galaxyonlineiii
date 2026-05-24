# Integración del visor GLB

Herramienta interna para validar modelos 3D antes de usarlos en Galaxy Online III. **No forma parte del gameplay ni del deploy automático.**

## Cómo abrir el visor

1. Clonar/checkout rama `feature/cursor-glb-viewer-asset-pipeline` (o worktree `.worktrees/cursor-glb-viewer`).
2. Desde `apps/web`:

   ```bash
   npm install
   npm run dev
   ```

3. Navegar a: **http://localhost:3000/admin/assets/3d-viewer**

## Dónde poner modelos GLB

| Carpeta | Uso |
|---------|-----|
| `assets/generated/ai-3d/shipyard/original/` | Export crudo de Meshy |
| `assets/generated/ai-3d/shipyard/optimized/` | Versión Draco/decimate para juego |
| `assets/generated/ai-3d/shipyard/reports/` | Licencia, capturas, notas |

El visor **no lee** esas carpetas automáticamente: arrastrá o elegí el `.glb` local en el navegador.

## Cómo probar un modelo

1. Abrir el visor.
2. **Cargar .glb local** → elegir archivo.
3. Revisar panel lateral: peso, tamaño bounding box, animaciones, materiales.
4. Usar **Reset cámara** si perdés el encuadre.
5. Opcional: comparar con **Placeholder de prueba** (`public/dev/glb/placeholder-shipyard-preview.glb`).

## Cómo aprobar un asset

1. Completar `asset-approval-checklist.md`.
2. Actualizar `assets/generated/ai-3d/ASSET_MANIFEST.md` (estado, peso, licencia, listo juego).
3. Guardar evidencia en `shipyard/reports/`.

## Cómo integrarlo después al juego (futuro)

Cuando un asset esté `approved` y `listo juego: yes`:

1. Copiar GLB optimizado a ruta pública controlada, p. ej. `apps/web/public/game/assets/buildings3d/shipyard.glb` (a definir en PR de integración).
2. Usar componente `Asset3DPreview` o un wrapper `Building3DModel` con la URL publicada.
3. **No** integrar en dashboard 2D ni en Fase 4 sin PR dedicado.
4. Verificar peso en producción (CDN) y LCP.

Este pipeline **no** incluye aún el Meshy real del Astillero.

## Peso máximo recomendado

| Perfil | Objetivo | Acción si se excede |
|--------|----------|---------------------|
| Premium | &lt; **30 MB** | Optimizar texturas/geometría |
| Low | &lt; **10 MB** | Draco + reducir texturas |
| Límite duro | **50 MB** | **No integrar** directo; solo revisión offline |

## Componente reutilizable

```tsx
import { Asset3DPreview } from '@/components/assets/Asset3DPreview';

<Asset3DPreview
  modelUrl="/ruta/al/modelo.glb"
  fileName="shipyard.glb"
  fileSizeBytes={1234567}
  onMetadata={(m) => console.log(m)}
  onError={(e) => console.error(e)}
/>
```

- `loading` / error vía callbacks y UI del visor admin.
- Canvas con OrbitControls (rotate, zoom, pan).
- Fondo espacial oscuro y luces básicas.

## Rama y aislamiento

- Rama: `feature/cursor-glb-viewer-asset-pipeline`
- Worktree: `.worktrees/cursor-glb-viewer`
- No modificar Railway, API, DB ni Fase 4 en esta rama sin acuerdo explícito.

## Regenerar placeholder

```bash
cd apps/web
node ../../tools/glb-viewer/scripts/generate-placeholder.mjs
```
