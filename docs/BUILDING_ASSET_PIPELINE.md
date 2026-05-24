# Building & Structure Asset Pipeline — Galaxy Online III

## Overview

Pipeline para convertir assets 3D externos (CC0) en edificios, bases espaciales, interiores y estructuras con calidad premium. Este documento complementa `ASSET_IMPORT_PIPELINE.md` enfocandose especificamente en arquitectura sci-fi.

**Flujo general:**
```
Asset CC0 descargado → Blender → Normalizacion → Premium Polish → Export GLB → Game Engine
```

---

## Step 1: Source & Download

1. Verificar licencia en fuente oficial (ver `ASSET_CREDITS.md`)
2. Descargar solo desde links oficiales (kenney.nl, quaternius.com, itch.io, polyhaven.com)
3. Colocar en `assets/external/<categoria>/<nombre_asset>/` sin modificar
4. Documentar en `ASSET_CREDITS.md`

**NO descargar desde mirrors sin verificar licencia.**

---

## Step 2: Import to Blender

### From .blend (Kenney, Quaternius, KayKit)
```
File → Append → Seleccionar .blend → Object → Importar modulos necesarios
```

### From FBX/OBJ/glTF
```
File → Import → Seleccionar formato
```
**Importante:**
- Verificar escala (Kenney suele estar en metros, pero algunos packs usan cm)
- Verificar orientacion (+Y up, -Z forward)
- Importar materiales o recrearlos desde cero

---

## Step 3: Normalization

### Scale Reference

| Type | Target Size | Reference Cube |
|------|-------------|----------------|
| Hangar module | 20x30x10m | 2m cube x10 |
| Corridor | 4x4x20m | 2m cube x2 |
| Building floor | 20x20x4m | 2m cube x10 |
| Control room | 10x10x3m | 2m cube x5 |
| Antenna / tower | 5-50m height | 2m cube reference |
| Props (crates, panels) | 1-2m | 1m cube |

### Apply Transform
```
1. Seleccionar mesh
2. Object → Apply → All Transforms (Ctrl+A → All Transforms)
3. Verificar que escala sea 1.0, 1.0, 1.0
```

### Origin Placement

| Asset Type | Origin Position |
|------------|-----------------|
| Building module | Centro de la base (nivel del suelo) |
| Hangar | Centro de la puerta principal, nivel suelo |
| Tower / Antenna | Centro de la base |
| Prop | Centro geometrico o base inferior |

```
Object → Set Origin → Origin to 3D Cursor (ubicar cursor primero)
```

---

## Step 4: Premium Polish — Making CC0 Look AAA

Los assets CC0 suelen ser low-poly con materiales basicos. Para look premium aplicamos:

### 4.1 Bevels (Chamfered Edges)

**Problema:** Los assets low-poly tienen bordes afilados de plastico.
**Solucion:** Bevels en bordes expuestos.

```
1. Seleccionar mesh
2. Modifiers → Add Modifier → Bevel
3. Settings:
   - Amount: 0.02m - 0.05m (2-5cm)
   - Segments: 2-3
   - Shape: 0.5 (profile)
   - Limit Method: Angle (30 degrees)
4. Apply antes de exportar
```

**Tip:** Para edificios grandes, usar bevels mas grandes (0.05-0.1m). Para detalles pequenos, 0.01-0.02m.

### 4.2 Panel Lines (Surface Detail)

**Problema:** Las superficies son planas y monotonas.
**Solucion:** Cortar paneles geometricos en la superficie.

```
Method 1: Loop Cuts + Inset
1. Entrar a Edit Mode (Tab)
2. Seleccionar cara de panel
3. Inset Faces (I) → Amount: 0.05m
4. Extrude inward (E → Z → -0.01m)
5. Bevel edges del groove: 0.005m

Method 2: Knife Project
1. Crear plano con forma de panel
2. Posicionar sobre superficie
3. Knife Project (Mesh → Knife Project)
4. Separar y extruir ligeramente hacia adentro
```

**Regla:** Los paneles deben ser irregulares (no grid perfecto). Tamano tipico: 1x1m a 5x5m.

### 4.3 Greebles (Surface Detail Objects)

**Definicion:** Pequenos detalles geometricos que rompen la monotonia de grandes superficies.

```
Elementos tipicos:
- Vents: Cubos con loop cuts, extruidos
- Hatches: Cilindros planos con borde elevado
- Antennas: Cilindros delgados + esfera en punta
- Lights: Planos pequenos con material emissive
- Pipes: Curvas + Bevel (circular, 0.1m diameter)
- Panels: Planos con bordes beveled

Proceso:
1. Modelar 5-10 greebles base
2. Duplicar con Alt+D (linked duplicates) para consistencia
3. Distribuir sobre superficies grandes usando snap
4. Mantener proporcion: greeble = 1-5% del tamano del objeto padre
```

### 4.4 Decals (Text/Insignia/Details)

```
Method: Geometry Decals (no texture painting needed)
1. Crear plano delgado (0.001m)
2. Modelar forma de decal en el plano (letras, simbolos, franjas)
3. Posicionar sobre superficie con shrinkwrap o manual
4. Asignar material contrastante

Materials para decals:
- Warning stripes: Emission amarillo/naranja
- Directional arrows: Paint blanco sobre oscuro
- Hull numbers: Paint blanco
- Hazard markings: Emission rojo
```

### 4.5 Emissive Lights

**Problema:** Los assets CC0 no tienen luces.
**Solucion:** Geometria con material emissive.

```
Tipos de luces sci-fi:
1. Edge strips: Tiras delgadas a lo largo de bordes de paneles
   - Tamano: 0.02m x largo del borde
   - Material: Emission cyan (#00FFFF) o blanco (#FFFFFF)
   - Strength: 2.0 - 5.0

2. Indicator lights: Puntos pequenos
   - Tamano: 0.05m esferas o planos
   - Material: Emission verde/rojo/azul segun funcion
   - Strength: 1.0 - 3.0

3. Engine glow: Conos o discos
   - Tamano proporcional al reactor
   - Material: Emission cyan/naranja con gradiente
   - Strength: 10.0+

4. Interior panels: Rectangulos en paredes
   - Tamano: 0.5m x 1m
   - Material: Emission blanco suave
   - Strength: 1.0
```

### 4.6 Materials PBR

**Borrar materiales importados y recrear con esta libreria:**

| Material | Base Color | Metallic | Roughness | Emission | Normal | Usage |
|----------|------------|----------|-----------|----------|--------|-------|
| `hull_primary` | #E0E0E0 | 0.10 | 0.60 | None | Yes | Superficie principal |
| `hull_secondary` | #2A2A2A | 0.80 | 0.40 | None | Yes | Juntas, soportes |
| `panel_detail` | #3A3A3A | 0.30 | 0.70 | None | Yes | Paneles secundarios |
| `glass_canopy` | #001020 | 0.00 | 0.05 | None | Yes | Ventanas, canopies |
| `emissive_cyan` | #000000 | 0.00 | 0.00 | #00FFFF 3.0 | No | Luces de borde |
| `emissive_white` | #000000 | 0.00 | 0.00 | #FFFFFF 1.5 | No | Iluminacion interior |
| `emissive_orange` | #000000 | 0.00 | 0.00 | #FF6B00 2.0 | No | Warm lights, hazards |
| `metal_raw` | #808080 | 1.00 | 0.30 | None | Yes | Partes mecanicas |
| `rubber_seal` | #151515 | 0.00 | 0.90 | None | No | Sellos, gomas |
| `concrete_floor` | #555555 | 0.00 | 0.85 | None | Yes | Suelos industriales |

**Setup Principled BSDF:**
```
1. Seleccionar mesh
2. Material Properties → New
3. Principled BSDF:
   - Base Color: [segun tabla]
   - Metallic: [segun tabla]
   - Roughness: [segun tabla]
   - Emission: [segun tabla]
4. Agregar Normal Map si se usa textura de Poly Haven
   - Add Node → Normal Map
   - Conectar Color de imagen a Normal input
```

### 4.7 Textures from Poly Haven

**Texturas recomendadas por categoria:**

| Buscar en Poly Haven | Uso | Maps |
|----------------------|-----|------|
| `metal scratched` | Superficies desgastadas | Albedo, Normal, Roughness |
| `metal painted` | Hull principal | Albedo, Normal, Roughness |
| `sci fi panel` | Paneles de pared | Albedo, Normal, Metallic |
| `concrete` | Suelos, plataformas | Albedo, Normal, Roughness |
| `metal rusty` | Areas deterioradas | Albedo, Normal, Roughness |
| `grunge` | Overlay de suciedad | Albedo (usar como mask) |

**Import en Blender:**
```
1. Download from polyhaven.com (4K sufficiente)
2. Import textures: Albedo → Base Color, Normal → Normal Map, Roughness → Roughness
3. Usar Node Wrangler (Ctrl+T) para auto-setup
4. Ajustar scale del mapping si es necesario (typical: 2x-4x repetido)
```

### 4.8 Normal Maps & Detail

**Para superficies sin texturas:**
```
1. Bake normal map desde high-poly (opcional para complejidad)
2. O usar normal maps de Poly Haven como detail overlay
3. Combine con Geometry Nodes para variacion procedural
```

**Bevels vs Normal Maps:**
- **Bevels reales:** Mejor para bordes cercanos a camara (0-10m)
- **Normal maps:** Mejor para detalle de superficie a distancia
- **Combinar ambos** para mejor resultado

### 4.9 Roughness & Metalness Workflow

**Principio:** Las superficies no son uniformes.

```
1. Crear roughness map o usar vertex colors
2. Areas de uso (pisos, manijas): mas rough (0.7-0.9)
3. Areas protegidas (techos, paneles altos): mas suave (0.3-0.5)
4. Juntas y bordes: mas metalicos y rugosos
5. Usar grunge texture como mask para variacion procedural
```

---

## Step 5: LOD (Level of Detail)

Los edificios y bases necesitan LODs para performance.

| LOD | Triangle Budget | Method | View Distance | Uso |
|-----|----------------|--------|---------------|-----|
| LOD0 | Full detail | Mesh original | 0-50m | Cerca de camara |
| LOD1 | ~40% tris | Decimate 0.4 + remove small greebles | 50-200m | Media distancia |
| LOD2 | ~15% tris | Decimate 0.15 + remove all detail | 200m+ | Lejos / minimap |

```
Process:
1. Duplicate mesh (Shift+D)
2. Rename: BUILDING_LOD0, BUILDING_LOD1, BUILDING_LOD2
3. For LOD1:
   - Add Decimate modifier (Collapse, ratio 0.4)
   - Remove greebles menores a 0.5m
   - Apply modifier
4. For LOD2:
   - Add Decimate modifier (Collapse, ratio 0.15)
   - Remove all decals, emissive strips, greebles
   - Remove interior geometry
   - Apply modifier
5. Clean up: Mesh → Clean Up → Merge By Distance (0.001m)
```

---

## Step 6: Export to GLB

### Settings
```
Format: glTF 2.0 (.glb)
Include:
  ☑ Selected Objects
  ☑ Materials (Export)
  ☑ UVs
  ☑ Normals
  ☑ Vertex Colors
Transform:
  ☑ +Y Up
  ☑ Apply Modifiers
Geometry:
  ☑ Apply Modifiers
  ☐ Loose Edges
  ☐ Loose Points
```

### Export Multiple LODs
```
1. Seleccionar BUILDING_LOD0
2. Export → BUILDING_LOD0.glb
3. Seleccionar BUILDING_LOD1
4. Export → BUILDING_LOD1.glb
5. Seleccionar BUILDING_LOD2
6. Export → BUILDING_LOD2.glb
```

### Post-Export Validation
- [ ] File size: < 5MB por LOD0, < 2MB LOD1, < 500KB LOD2
- [ ] Mesh watertight (no holes)
- [ ] Normales correctas (no invertidas)
- [ ] Origen en posicion logica
- [ ] Escalas correctas en visor externo (https://gltf-viewer.donmccurdy.com/)

---

## Step 7: Game Integration

### Folder Structure (Processed)
```
assets/buildings/processed/
├── command_center/
│   ├── lod0.glb
│   ├── lod1.glb
│   ├── lod2.glb
│   └── preview.png
├── hangar_bay/
│   ├── lod0.glb
│   ├── lod1.glb
│   └── lod2.glb
└── reactor_core/
    ├── lod0.glb
    ├── lod1.glb
    └── lod2.glb
```

### Three.js / React Three Fiber Loading
```tsx
import { useGLTF } from '@react-three/drei';

function Building({ type, level = 0 }) {
  // Select LOD based on distance (simplified)
  const lodFile = level === 0 ? '/assets/buildings/command_center/lod0.glb'
                : level === 1 ? '/assets/buildings/command_center/lod1.glb'
                : '/assets/buildings/command_center/lod2.glb';

  const { scene } = useGLTF(lodFile);
  return <primitive object={scene.clone()} />;
}
```

---

## Style Guide — Galaxy Online III Architecture

### Visual Identity
- **Primary color:** Hull blanco/gris claro (#E0E0E0)
- **Secondary:** Gunmetal oscuro (#2A2A2A)
- **Accent:** Cyan emissive (#00FFFF) para luces tecnologicas
- **Warm accent:** Naranja (#FF6B00) para advertencias y energia
- **Glass:** Azul oscuro transparente (#001020)

### Building Types

| Type | Silhouette | Detail Level | Color Pattern |
|------|-----------|--------------|---------------|
| Command Center | Alto, central tower | High | White + dark joints + cyan lights |
| Hangar | Ancho, bajo, puerta grande | Medium | White + orange hazard stripes |
| Reactor | Cilindrico, domed | Medium | Dark + cyan glow + warning panels |
| Laboratory | Rectangular, ventanas | High | White + glass panels + white interior lights |
| Barracks | Bloques repetidos | Low | White + minimal detail |
| Defense Tower | Alto, delgado, turrets | Medium | Dark + emissive targeting lights |

### Prohibited
- Formas organicas o redondeadas excesivas
- Texturas de camuflaje militar realista
- Rust/suciedad excesiva (limpieza tecnologica)
- Luces de neon fuera de paleta cyan/naranja
- Siluetas que recuerden franquicias conocidas

---

## Quick Reference — Premium Checklist

Before marking a building as done:
- [ ] Bevels aplicados en bordes expuestos
- [ ] Panel lines cortados en superficies grandes
- [ ] Greebles distribuidos (min 3-5 por superficie >10m2)
- [ ] Emissive lights agregados (bordes, indicadores, interiores)
- [ ] Materiales PBR aplicados con valores correctos
- [ ] Texturas de Poly Haven aplicadas donde aplica
- [ ] LODs creados (3 niveles)
- [ ] Normal maps o bevels reales para detalle
- [ ] Origin en posicion logica
- [ ] Escala verificada con reference cube
- [ ] Exportado como GLB con materiales
- [ ] File size optimizado
- [ ] Testeado en visor GLB externo

---

## Tools

| Tool | Purpose | License |
|------|---------|---------|
| Blender 4.x | Modeling, UVs, baking, export | GPL (OK for assets) |
| Node Wrangler (addon) | Quick texture setup | GPL |
| Poly Haven | PBR textures, HDRIs | CC0 |
| GLTF Viewer (donmccurdy) | Validation post-export | Free |

---

## Related Documents

- `assets/external/ASSET_CREDITS.md` — Registro de fuentes y licencias
- `docs/ASSET_IMPORT_PIPELINE.md` — Pipeline general de importacion (naves, props)
- `docs/SHIP_MODELING_PIPELINE.md` — Pipeline especifico para naves

---

## Last Updated

2026-05-24
