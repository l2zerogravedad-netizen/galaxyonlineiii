# Asset render pipeline — UI premium (Phase 1)

## Objetivo

Generar assets **originales** o **CC0 verificados** para el dashboard planetario premium, en WebP transparente, listos para `public/game/assets/`.

## Assets pendientes de generar

### Edificios (`public/game/assets/buildings/`)

| Archivo | Estado | Tamaño |
|---------|--------|--------|
| metal-extractor.webp | Pendiente | 1024×1024 |
| plasma-refinery.webp | Pendiente | 1024×1024 |
| warehouse.webp | Pendiente | 1024×1024 |
| energy-generator.webp | Pendiente | 1024×1024 |
| control-center.webp | Pendiente | 1024×1024 |
| shipyard.webp | Pendiente | 1024×1024 |
| research-lab.webp | Pendiente | 1024×1024 |
| defense-turret.webp | Pendiente | 1024×1024 |
| hangar.webp | Pendiente | 1024×1024 |

### Planeta

| Archivo | Estado |
|---------|--------|
| planets/main-planet.webp | Pendiente |

### UI

| Archivo | Estado |
|---------|--------|
| ui/resource-metal.webp | Pendiente |
| ui/resource-plasma.webp | Pendiente |
| ui/resource-credits.webp | Pendiente |
| ui/upgrade.webp | Pendiente |
| ui/info.webp | Pendiente |
| ui/build.webp | Pendiente |
| ui/defense.webp | Pendiente |
| ui/research.webp | Pendiente |

## Formato recomendado

- **Formato:** WebP con canal alpha (transparencia)
- **Tamaño:** 1024×1024 px (edificios y planeta); 256×256 (iconos UI)
- **Estilo:** isométrico sci-fi, paneles cerámicos blancos / gunmetal, luces emisivas cyan, acentos naranja
- **Prohibido:** texto, logos, marcas, personajes con copyright

## Nomenclatura

- Solo minúsculas y guiones: `metal-extractor.webp`
- Debe coincidir con rutas en `mockData.ts` y `AssetImage` `src`

## Flujo de trabajo

1. **Generar** con IA (ver `assets/source/prompts/building-assets-prompts.md`) o modelar en Blender
2. **Recortar** fondo transparente
3. **Optimizar** con `cwebp -q 85 input.png -o output.webp` o Squoosh
4. **Copiar** a `apps/web/public/game/assets/...`
5. **Probar** en dashboard (`/dashboard`) — `AssetImage` carga automáticamente
6. **Registrar** en `assets/external/ASSET_CREDITS.md` o `ASSET_CREDITS.md` raíz
7. **Aprobar** en `docs/ASSET_LICENSE_CHECKLIST.md`

## Visor GLB (futuro)

Para modelos 3D: Khronos glTF Sample Viewer o visor interno. Phase 1 UI usa **solo WebP 2D**.

## Criterio de aprobación para el juego

- [ ] Licencia documentada
- [ ] Peso &lt; 500 KB por icono UI, &lt; 2 MB por edificio
- [ ] Se ve bien en grilla 3×3 y biblioteca
- [ ] Fallback no necesario en producción
- [ ] No copia visual de GO2 / franquicias

## Reemplazar placeholders

Mientras falten WebP, `AssetImage` muestra fallback con emoji + borde cyan. Al agregar el archivo con el nombre exacto, recargar la página.
