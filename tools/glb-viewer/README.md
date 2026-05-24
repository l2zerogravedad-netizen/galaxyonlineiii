# GLB Viewer (herramienta interna)

Visor local para validar modelos `.glb` antes de integrarlos al juego.

## Uso recomendado (app web)

```bash
cd apps/web
npm run dev
```

Abrir: **http://localhost:3000/admin/assets/3d-viewer**

- Cargar un `.glb` desde disco (no se sube al servidor).
- Botón **Placeholder de prueba** → `public/dev/glb/placeholder-shipyard-preview.glb`
- Panel lateral: peso, bounding box, animaciones, materiales.

## Estructura de assets generados

```
assets/generated/ai-3d/
  ASSET_MANIFEST.md
  shipyard/
    original/     ← export Meshy sin tocar
    optimized/    ← Draco / decimate / bake
    reports/      ← capturas + notas de revisión
```

## Regenerar placeholder

```bash
node tools/glb-viewer/scripts/generate-placeholder.mjs
```

## Documentación

- `docs/galaxy-online-2-research/visual-design/glb-viewer-integration.md`
- `docs/galaxy-online-2-research/visual-design/asset-approval-checklist.md`

## Rama

Trabajo aislado: `feature/cursor-glb-viewer-asset-pipeline` (worktree `.worktrees/cursor-glb-viewer`).
