# Pipeline de Renderizado de Assets

## Resumen

Este documento describe el proceso para generar y convertir assets visuales del juego, desde modelos 3D hasta imágenes WebP optimizadas.

---

## Estructura de Carpetas

```
public/game/assets/
├── buildings/          # Edificios (120x120px - 240x240px)
├── planets/            # Planetas (400x400px - 800x800px)
├── ui/                 # Iconos de UI (64x64px - 128x128px)
└── placeholders/       # Placeholders SVG/CSS

src/components/game/
├── PlaceholderBuilding.tsx  # Componente de placeholder
└── icons.tsx                # Iconos SVG
```

---

## Pipeline de Renderizado

### 1. Modelado 3D (Blender)

**Software:** Blender 3.6+

**Configuración de Render:**
- Engine: Cycles
- Samples: 128-256 (balance calidad/velocidad)
- Resolución: 512x512 (escala posterior)
- Fondo: Transparente (RGBA)
- Iluminación: 3-point lighting sci-fi

**Estilo Visual:**
- Isométrico 30°
- Materiales metálicos con glow
- Paleta: Cian, púrpura, dorado, rojo
- Post-procesado: Bloom, SSAO

### 2. Exportación PNG

**Formato:** PNG 32-bit (RGBA)
- Preservar transparencia
- Sin compresión para calidad máxima
- Tamaño base: 512x512px

### 3. Conversión WebP

**Herramienta:** Sharp (Node.js)

**Configuración:**
```javascript
{
  quality: 85,
  effort: 6,
  lossless: false,
  nearLossless: true,
  smartSubsample: true,
  reductionEffort: 6
}
```

**Tamaños Finales:**
- Buildings: 120x120px (mostrado a 72x72)
- Planets: 400x400px (mostrado a 200x200)
- UI Icons: 64x64px

---

## Guía de Nomenclatura

### Kebab-case obligatorio

```
metal-extractor.webp
plasma-refinery.webp
control-center.webp
defense-turret.webp
research-lab.webp
main-planet.webp
resource-metal.webp
```

### Convenciones

| Prefijo | Uso | Ejemplo |
|---------|-----|---------|
| building-* | Edificios | building-shipyard |
| resource-* | Recursos | resource-plasma |
| planet-* | Planetas | planet-terran |
| ui-* | Interfaz | ui-button-close |

---

## Componente AssetImage

```typescript
import { AssetImage } from '@/components/game/AssetImage';

// Uso básico
<AssetImage
  src="/game/assets/buildings/metal-extractor.webp"
  alt="Extractor de Metal"
  glow="cyan"
  size="md"
/>

// Con fallback personalizado
<AssetImage
  src="/game/assets/buildings/shipyard.webp"
  alt="Astillero"
  glow="orange"
  fallback={<CustomPlaceholder />}
/>
```

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| src | string | - | Ruta al archivo WebP |
| alt | string | - | Texto alternativo |
| glow | GlowVariant | 'cyan' | Color de glow |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Tamaño visual |
| fallback | ReactNode | Placeholder | Componente de fallback |

---

## Placeholders Visuales

### PlaceholderBuilding

Componente SVG que renderiza representaciones isométricas de edificios:

```typescript
import PlaceholderBuilding from './PlaceholderBuilding';

// Metal Extractor con glow cian
<PlaceholderBuilding type="metal_extractor" glow="cyan" size="md" />

// Edificio bloqueado (grayscale)
<PlaceholderBuilding type="shipyard" glow="none" className="opacity-40 grayscale" />
```

### Tipos Soportados

- `metal_extractor` - Extractor de metal
- `plasma_refinery` - Refinería de plasma
- `warehouse` - Almacén
- `energy_generator` - Generador de energía
- `control_center` - Centro de control
- `shipyard` - Astillero
- `research_lab` - Laboratorio
- `hangar` - Hangar
- `defense_turret` - Torreta defensiva
- `empty` - Slot vacío

---

## Script de Conversión

```bash
# Convertir todos los PNG en assets/source/
npm run convert-assets

# Output en public/game/assets/
```

### Script: scripts/convert-assets.js

```javascript
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function convertAsset(inputPath, outputPath, size) {
  await sharp(inputPath)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 85, effort: 6 })
    .toFile(outputPath);
}
```

---

## Checklist de Assets

### Edificios Prioritarios

- [x] Metal Extractor (Placeholder SVG)
- [x] Plasma Refinery (Placeholder SVG)
- [x] Warehouse (Placeholder SVG)
- [x] Energy Generator (Placeholder SVG)
- [x] Control Center (Placeholder SVG)
- [ ] Shipyard - Necesita render 3D
- [ ] Research Lab - Necesita render 3D
- [ ] Hangar - Necesita render 3D
- [ ] Defense Turret - Necesita render 3D

### Recursos

- [x] Metal Icon (Placeholder SVG)
- [x] Plasma Icon (Placeholder SVG)
- [x] Credits Icon (Placeholder SVG)
- [x] Energy Icon (Placeholder SVG)

### UI Elements

- [x] Corner Marks
- [x] Avatar Frame
- [x] Resource Icons
- [x] Building Icons

---

## Próximos Pasos

1. **Crear modelos 3D** en Blender para edificios faltantes
2. **Renderizar** a PNG con fondo transparente
3. **Convertir** a WebP usando script
4. **Reemplazar** placeholders en código
5. **Optimizar** tamaños de archivo

---

## Referencias

- [Blender Documentation](https://docs.blender.org/)
- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [WebP Best Practices](https://developers.google.com/speed/webp)

---

**Última actualización:** 2026-05-24
