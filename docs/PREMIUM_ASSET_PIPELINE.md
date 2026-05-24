# Premium Asset Pipeline — Galaxy Online III

## Overview

Pipeline completo para descargar, importar, adaptar e integrar assets 3D premium y gratuitos en Galaxy Online III. Este documento cubre todo el flujo desde la compra/licencia hasta el asset game-ready en el motor WebGL.

**Flujo completo:**
```
Evaluación → Aprobación → Compra/Download → Import → Normalize → Polish → Export → Integrate
```

---

## Phase 0: Pre-Download — Aprobación Requerida

**REGLA DE ORO:** Nunca descargar ni comprar assets sin aprobación del usuario.

### Checklist Pre-Download

1. [ ] Asset evaluado en `ASSET_CANDIDATES.md`
2. [ ] Licencia verificada en `docs/ASSET_LICENSE_CHECKLIST.md`
3. [ ] Riesgo legal confirmado como LOW o NONE
4. [ ] Precio actual verificado en sitio oficial
5. [ ] Formato confirmado compatible (.blend, .glTF, .fbx)
6. [ ] **APROBACIÓN DEL USUARIO OBTENIDA**
7. [ ] Si es pago: cuenta de compra disponible y verificada
8. [ ] Si es gratuito pero requiere cuenta: cuenta creada

---

## Phase 1: Descarga Legal

### 1.1 Assets Gratis / CC0

**Fuentes:** Kenney.nl, Quaternius.com, KayKit (itch.io), Poly Haven, ambientCG, OpenGameArt CC0

```
1. Crear cuenta gratuita si es necesario (Kenney no requiere, Quaternius no requiere, KayKit no requiere)
2. Navegar a la página oficial del asset
3. Descargar el paquete completo
4. Guardar en: assets/external/<categoria>/<nombre_del_asset>/
   Ejemplo: assets/external/buildings/kenney_space_station_kit/
5. NO extraer aún — mantener archivo ZIP original + extracción
6. Verificar que la descarga esté completa (comparar checksum si disponible)
```

### 1.2 Assets Premium (KitBash3D)

**Fuentes:** kitbash3d.com, Cargo app

```
1. Iniciar sesión en cuenta de KitBash3D oficial
2. Navegar al producto
3. Comprar con licencia Individual (si eres freelancer/individual)
   O Small Business (si tienes LLC/Corp con <=50 empleados)
4. Descargar desde Cargo app o sitio web
5. Guardar factura / número de orden para registro
6. Guardar en: assets/external/<categoria>/kitbash3d_<nombre_kit>/
   Ejemplo: assets/external/buildings/kitbash3d_neo_city/
7. Preservar archivo original descargado
```

### 1.3 Assets Premium (Fab / Epic)

**Fuentes:** fab.com, Epic Games Launcher

```
1. Iniciar sesión en cuenta Epic Games
2. Comprar el asset en Fab o Unreal Marketplace
3. Descargar desde Epic Games Launcher → Library → Vault
4. Guardar en: assets/external/<categoria>/fab_<nombre_asset>/
   Ejemplo: assets/external/interiors/fab_modular_sci_fi_interior/
5. Preservar archivos .uasset originales
```

### 1.4 Assets Premium (ArtStation Marketplace)

```
1. Iniciar sesión en cuenta ArtStation
2. Comprar el asset
3. Descargar desde ArtStation → Purchases
4. Guardar en: assets/external/<categoria>/artstation_<nombre_asset>/
   Ejemplo: assets/external/space_bases/artstation_space_base/
5. Preservar archivos originales (FBX, Blend, etc.)
```

---

## Phase 2: Documentación Inmediata

Inmediatamente después de descargar, registrar en `assets/external/ASSET_CREDITS.md`:

```markdown
| Asset | Autor | Fuente | Link | Licencia | Fecha | Uso | Requiere credito | Restricciones |
|-------|-------|--------|------|----------|-------|-----|------------------|---------------|
| Neo City | KitBash3D | kitbash3d.com | https://kitbash3d.com/products/neo-city | KitBash3D Commercial | 2026-05-24 | Ciudad colonial | No | No redistribuir fuente. Orden #12345 |
```

**Incluir:** Número de orden, fecha de compra, cuenta utilizada.

---

## Phase 3: Import to Blender

### 3.1 From .blend (Kenney, Quaternius, KayKit, KitBash3D)

```
1. Abrir Blender 4.x
2. File → Append (Shift+F1)
3. Navegar al archivo .blend descargado
4. Seleccionar: Object → (seleccionar meshes necesarios)
5. Hacer clic en "Append"
6. Los objetos aparecerán en la escena actual
```

**Tip:** KitBash3D organiza sus .blend con collections. Buscar en "Collection" para importar grupos lógicos.

### 3.2 From FBX/OBJ/glTF (Quaternius, Kenney, algunos Fab)

```
1. File → Import → FBX / OBJ / glTF 2.0
2. Seleccionar archivo
3. Opciones de importación:
   - Scale: 1.0 (verificar después)
   - Forward: -Z
   - Up: Y
   - Apply Transform: Sí
4. Importar
5. Verificar escala inmediatamente (ver Phase 4)
```

### 3.3 From .uasset (Fab / UE5 Assets)

**Este es un proceso de 2 pasos:**

```
Paso 1: Export desde Unreal Engine 5
1. Abrir Unreal Engine 5
2. Crear proyecto nuevo o abrir existente
3. Importar el asset desde Fab (ya descargado en Vault)
4. En Content Browser, seleccionar los meshes
5. Right-click → Asset Actions → Export
6. Elegir formato: FBX
7. Exportar a carpeta temporal

Paso 2: Import a Blender
1. File → Import → FBX
2. Seleccionar archivos exportados de UE5
3. Nota: Materiales PBR de UE5 NO se importan correctamente a Blender
   → Reconstruir materiales manualmente (ver Phase 6)
```

**Problema conocido:** Los materiales UE5 usan nodos específicos de Unreal (Lumen, Nanite) que no son compatibles con Principled BSDF de Blender. Los materiales requieren reconstrucción completa.

---

## Phase 4: Normalización

### 4.1 Verificar Escala

**Regla del juego:** 1 unidad de Blender = 1 metro.

```
1. Add → Mesh → Cube (2m default)
2. Comparar tamaño del asset importado contra el cubo
3. Si es incorrecto:
   - Seleccionar mesh
   - S (Scale) → ajustar proporcionalmente
   - Object → Apply → Scale (Ctrl+A → Scale)
```

**Escalas típicas:**

| Tipo de Asset | Tamaño Objetivo | Ejemplo de Referencia |
|---------------|-------------------|----------------------|
| Hangar module | 20x30x10 metros | 10x cubos de 2m |
| Corredor | 4x4x20 metros | 2x cubos de 2m de ancho |
| Edificio piso | 20x20x4 metros | 10x cubos de 2m |
| Sala de control | 10x10x3 metros | 5x cubos de 2m |
| Torre / Antena | 5-50 metros altura | Cubo de referencia |
| Prop (caja, panel) | 1-2 metros | 1x cubo de 1m |
| Nave fighter | 8-15 metros largo | 4-7 cubos de 2m |
| Nave frigate | 80-150 metros | Escala con Empty marker |

### 4.2 Orientación

```
Convención del motor:
- Forward (nose of ship): -Z axis
- Up: +Y axis
- Right: +X axis

Verificación:
1. View → Front (-Y)
2. El asset debe apuntar hacia abajo en vista Front (nose en -Z)
3. Si no: Rotate → Apply Rotation (Ctrl+A → Rotation)
```

### 4.3 Origen (Origin Point)

```
| Tipo de Asset | Posición del Origen |
|---------------|---------------------|
| Building module | Centro de la base, nivel del suelo (Z=0) |
| Hangar | Centro de la puerta principal, suelo (Z=0) |
| Tower / Antenna | Centro geométrico de la base (Z=0) |
| Prop | Centro geométrico o base inferior |
| Ship | Centro de masa, punto medio entre bow y stern |

Proceso:
1. Colocar 3D cursor en posición deseada (Shift+S → Cursor to...)
2. Object → Set Origin → Origin to 3D Cursor
3. Verificar que el objeto no se mueva al cambiar origen
```

### 4.4 Aplicar Todas las Transformaciones

```
Seleccionar mesh → Ctrl+A → All Transforms
Verificar en N-Panel (Sidebar):
- Location: 0, 0, 0 (o posición deseada en escena)
- Rotation: 0, 0, 0
- Scale: 1.0, 1.0, 1.0
```

---

## Phase 5: Unificación de Estilo Visual

Los assets de diferentes fuentes tienen estilos visuales distintos. Es necesario unificarlos para que parezcan del mismo universo.

### 5.1 Análisis de Estilo Original

| Fuente | Estilo Original | Cambios Necesarios |
|--------|-----------------|-------------------|
| **KitBash3D** | AAA cinematic, detalles extensos | Simplificar si es para juego WebGL, reducir polígonos |
| **Kenney** | Low-poly, colores planos | Agregar bevels, materiales PBR, emissive lights |
| **Quaternius** | Mid-poly, ligeramente estilizado | Refinar materiales, agregar detalles de superficie |
| **KayKit** | Low-poly, cartoon suave | Agregar detalles geométricos, materiales metálicos |
| **Fab/UE5** | AAA realista | Reconstruir materiales para WebGL, simplificar |

### 5.2 Guía de Estilo Galaxy Online III

**Paleta de colores obligatoria:**
| Elemento | Color Hex | Uso |
|----------|-----------|-----|
| Hull primario | `#E0E0E0` | Superficie principal de edificios/naves |
| Juntas / Frame | `#2A2A2A` | Conectores, soportes, estructura |
| Paneles secundarios | `#3A3A3A` | Detalles de superficie |
| Luces tecnológicas | `#00FFFF` | Emissive strips, indicadores, motores |
| Advertencias / Energía | `#FF6B00` | Warm lights, hazard stripes |
| Cristal / Canopy | `#001020` | Ventanas, glass con transparencia |
| Metal expuesto | `#808080` | Partes mecánicas, tornillos, joints |
| Sello / Goma | `#151515` | Sellos, gomas, superficies de agarre |
| Suelo industrial | `#555555` | Pisos de hangar, plataformas |

**Elementos de estilo requeridos:**
- ✅ Bordes con bevel (2-5cm)
- ✅ Líneas de panel en superficies grandes
- ✅ Greebles en áreas planas > 10m²
- ✅ Tiras emissive cyan en bordes expuestos
- ✅ Indicadores de estado (luces pequeñas rojas/verdes/azules)
- ❌ Sin óxido excesivo (universo limpio y tecnológico)
- ❌ Sin camuflaje militar realista
- ❌ Sin colores de neón fuera de la paleta

---

## Phase 6: Aplicar Materiales PBR

### 6.1 Borrar Materiales Importados

```
1. Seleccionar mesh
2. Material Properties → Click en material → Unlink (X)
3. O bien: Eliminar todos los materiales del datablock
4. IMPORTANTE: Los materiales de UE5 NO son compatibles con Blender
   → Siempre recrear desde cero
```

### 6.2 Librería de Materiales del Proyecto

Crear estos materiales en Blender y guardarlos como Asset Browser o en un archivo `.blend` de referencia:

| Nombre Material | Base Color | Metallic | Roughness | Emission | Normal Map | Uso |
|-----------------|------------|----------|-----------|----------|------------|-----|
| `GO3_hull_primary` | `#E0E0E0` | 0.10 | 0.60 | none | Yes (Poly Haven) | Superficie principal |
| `GO3_hull_secondary` | `#2A2A2A` | 0.80 | 0.40 | none | Yes | Juntas, frame |
| `GO3_panel_detail` | `#3A3A3A` | 0.30 | 0.70 | none | Yes | Paneles secundarios |
| `GO3_glass_canopy` | `#001020` | 0.00 | 0.05 | none | Yes | Ventanas |
| `GO3_emissive_cyan` | `#000000` | 0.00 | 0.00 | `#00FFFF` strength 3.0 | No | Luces de borde |
| `GO3_emissive_white` | `#000000` | 0.00 | 0.00 | `#FFFFFF` strength 1.5 | No | Iluminación interior |
| `GO3_emissive_orange` | `#000000` | 0.00 | 0.00 | `#FF6B00` strength 2.0 | No | Hazard, warm lights |
| `GO3_metal_raw` | `#808080` | 1.00 | 0.30 | none | Yes | Partes mecánicas |
| `GO3_rubber_seal` | `#151515` | 0.00 | 0.90 | none | No | Sellos |
| `GO3_concrete_floor` | `#555555` | 0.00 | 0.85 | none | Yes | Suelos |

### 6.3 Setup de Principled BSDF

```
1. Seleccionar mesh
2. Material Properties → New
3. Principled BSDF:
   - Base Color: [seleccionar de tabla]
   - Subsurface: 0
   - Metallic: [seleccionar]
   - Specular: 0.5
   - Roughness: [seleccionar]
   - Anisotropic: 0
   - Sheen: 0
   - Clearcoat: 0
   - IOR: 1.45 (solo para glass)
   - Transmission: 0 (excepto glass)
   - Emission: [seleccionar si aplica]
4. Agregar Normal Map node si se usa textura:
   - Add → Vector → Normal Map
   - Conectar Color de imagen a Normal input
   - Conectar Normal output a Principled BSDF Normal
```

### 6.4 Texturas de Poly Haven / ambientCG

```
1. Descargar textura PBR de polyhaven.com o ambientcg.com
2. Extraer maps: albedo, normal, roughness, metallic, AO
3. En Blender, usar Node Wrangler (Ctrl+T) para auto-setup
4. Ajustar escala del Mapping si es necesario:
   - Add → Vector → Mapping
   - Scale: 2.0, 2.0, 2.0 (para repetir textura)
5. Usar UV Unwrap si la geometría es compleja:
   - Edit Mode → U → Smart UV Project
```

---

## Phase 7: Agregar Luces Emissive

### 7.1 Tipos de Luces Sci-Fi

**Edge Strips (Tiras de borde):**
```
1. Seleccionar borde del mesh (Edit Mode → Edge Select)
2. Duplicate edge (Shift+D) → Separate (P → Selection)
3. Convertir a mesh separado
4. Extrude ligeramente hacia afuera (0.02m)
5. Asignar material GO3_emissive_cyan
6. Opcional: Agregar Bevel (0.005m) para suavizar
```

**Indicator Lights (Luces indicadoras):**
```
1. Add → Mesh → Circle (8 vértices)
2. Scale a 0.05m
3. Fill face (F)
4. Posicionar en panel de control, puerta, etc.
5. Asignar material GO3_emissive_orange o GO3_emissive_cyan
6. Duplicar (Alt+D linked) para consistencia
```

**Interior Panel Lights:**
```
1. Add → Mesh → Plane
2. Scale: 0.5m x 1m
3. Posicionar en pared interior
4. Asignar material GO3_emissive_white
```

**Engine Glow:**
```
1. Add → Mesh → Cone
2. Scale y rotar para alinearse con tobera
3. Asignar material GO3_emissive_cyan (strength 10.0+)
4. Opcional: Agregar Gradient Texture para fade-out
```

---

## Phase 8: Detalles Premium

### 8.1 Bevels (Bordes Redondeados)

```
1. Seleccionar mesh
2. Modifiers → Add Modifier → Bevel
3. Settings:
   - Amount: 0.02m (edificios grandes: 0.05m, detalles: 0.01m)
   - Segments: 2-3
   - Shape: 0.5 (profile)
   - Limit Method: Angle
   - Angle: 30 degrees
4. Aplicar antes de exportar (Apply Modifier)
```

### 8.2 Panel Lines

```
Método 1: Inset
1. Edit Mode → Face Select
2. Seleccionar cara donde va el panel
3. Inset Faces (I) → Amount: 0.05m
4. Extrude hacia adentro (E → -0.01m en Z local)
5. Bevel edges del groove: 0.005m

Método 2: Boolean con plano
1. Crear plano con forma de panel
2. Solidify (0.01m)
3. Boolean → Difference en mesh principal
4. Limpiar geometría después
```

### 8.3 Greebles (Detalles de Superficie)

```
1. Modelar 5-10 greebles base:
   - Vent: Cubo con loop cuts → extrude
   - Hatch: Cilindro plano + borde torus
   - Antenna: Cilindro delgado + esfera en punta
   - Light: Plano pequeño + emissive
   - Pipe: Curve → Bevel (circular, 0.05m)
   - Panel: Plano + bevel en bordes

2. Distribuir sobre superficies grandes:
   - Snap to face
   - Mantener proporción: greeble = 1-5% del objeto padre
   - Usar Alt+D (linked duplicates) para consistencia
```

---

## Phase 9: Crear LODs (Level of Detail)

### 9.1 Estrategia de LOD para Edificios

| LOD | % de Tris | Qué eliminar | Distancia de uso |
|-----|-----------|--------------|------------------|
| LOD0 | 100% | Todo detalle | 0-50m (cámara cercana) |
| LOD1 | ~40% | Greebles pequeños (<0.5m), decals | 50-200m |
| LOD2 | ~15% | Todo greeble, emissive strips, interior | 200m+ / minimap |

### 9.2 Proceso de Creación

```
1. Duplicar mesh original (Shift+D)
2. Renombrar: NOMBRE_LOD0, NOMBRE_LOD1, NOMBRE_LOD2

Para LOD1:
1. Eliminar greebles menores a 0.5m
2. Eliminar decals de geometría
3. Eliminar luces emissive separadas (mantener baked glow si aplica)
4. Add → Decimate Modifier → Collapse → Ratio: 0.4
5. Apply Modifier
6. Mesh → Clean Up → Merge By Distance (0.001m)

Para LOD2:
1. Eliminar TODO greeble, decal, emissive strip
2. Eliminar geometría interior
3. Decimate Modifier → Collapse → Ratio: 0.15
4. Apply Modifier
5. Merge By Distance
6. Verificar que mesh sea watertight (sin agujeros)
```

---

## Phase 10: Export a GLB (Game-Ready)

### 10.1 Preparación

```
1. Seleccionar mesh (y LODs si se exportan separados)
2. Asegurar que todos los modifiers están aplicados
3. Verificar:
   - ✅ Escala 1.0, 1.0, 1.0
   - ✅ Origen en posición lógica
   - ✅ Materiales PBR configurados
   - ✅ No Ngons (quads o tris)
   - ✅ Normales outward
   - ✅ UVs unwraped si se usan texturas
```

### 10.2 Configuración de Export

```
File → Export → glTF 2.0 (.glb)

Format: glTF Binary (.glb)

Include:
  ☑ Limit to: Selected Objects
  ☑ Transform:
    - +Y Up (seleccionar)
  ☑ Geometry:
    - Apply Modifiers (seleccionar)
    - UVs (seleccionar)
    - Normals (seleccionar)
    - Vertex Colors (seleccionar)
  ☑ Materials:
    - Export (seleccionar)
    - Image Format: PNG (mejor calidad) o JPEG (menor tamaño)
  ☐ Animation (si no hay animación)
  ☐ Skin (si no hay rig)
  ☐ Morph (si no hay shape keys)

Transform:
  ☑ +Y Up
  ☑ Apply Modifiers
```

### 10.3 Export de Múltiples LODs

```
Exportar por separado:
1. Seleccionar BUILDING_LOD0 → Export → building_lod0.glb
2. Seleccionar BUILDING_LOD1 → Export → building_lod1.glb
3. Seleccionar BUILDING_LOD2 → Export → building_lod2.glb

Guardar en: assets/buildings/processed/<nombre_edificio>/
```

---

## Phase 11: Validación Post-Export

### 11.1 Checklist de Validación

```
- [ ] Mesh es watertight (sin agujeros visibles)
- [ ] Normales apuntan hacia afuera
- [ ] No hay Ngons (solo quads y tris)
- [ ] UVs correctos si hay texturas
- [ ] Origen en posición lógica
- [ ] Escala correcta en visor (comparar con referencia)
- [ ] Materiales PBR visibles (metallic/roughness correctos)
- [ ] Emissive lights brillan correctamente
- [ ] File size razonable:
    - LOD0: < 5 MB
    - LOD1: < 2 MB
    - LOD2: < 500 KB
- [ ] Atribución documentada (si aplica)
```

### 11.2 Visores de Validación

```
Online:
- https://gltf-viewer.donmccurdy.com/ (recomendado)
- https://sandbox.babylonjs.com/
- https://threejs.org/editor/

Desktop:
- Blender (importar GLB de vuelta)
- Windows 3D Viewer
```

**Proceso:**
1. Subir `.glb` a gltf-viewer.donmccurdy.com
2. Verificar:
   - Iluminación correcta
   - Materiales se ven bien
   - Sin artefactos geométricos
   - Escala consistente
3. Si hay problemas: volver a Blender, corregir, re-exportar

---

## Phase 12: Integración en el Juego

### 12.1 Estructura de Carpetas Final

```
assets/
├── buildings/
│   ├── processed/
│   │   ├── command_center/
│   │   │   ├── lod0.glb
│   │   │   ├── lod1.glb
│   │   │   ├── lod2.glb
│   │   │   ├── textures/          (si son externas a GLB)
│   │   │   └── preview.png
│   │   ├── hangar_bay/
│   │   └── reactor_core/
│   └── source/                      (archivos .blend de trabajo)
│       ├── command_center.blend
│       └── hangar_bay.blend
├── space_bases/
│   ├── processed/
│   └── source/
├── interiors/
│   ├── processed/
│   └── source/
└── ships/
    ├── processed/
    └── source/
```

### 12.2 Carga en Three.js / React Three Fiber

```tsx
import { useGLTF } from '@react-three/drei';
import { useState, useEffect } from 'react';

function Building({ type, level = 0, position }) {
  // Seleccionar LOD según distancia (simplificado)
  // En producción, usar distancia real de cámara
  const lodFile = level === 0
    ? `/assets/buildings/${type}/lod0.glb`
    : level === 1
    ? `/assets/buildings/${type}/lod1.glb`
    : `/assets/buildings/${type}/lod2.glb`;

  const { scene } = useGLTF(lodFile);

  return (
    <primitive
      object={scene.clone()}
      position={position}
      dispose={null}
    />
  );
}

// Preload para performance
useGLTF.preload('/assets/buildings/command_center/lod0.glb');
useGLTF.preload('/assets/buildings/command_center/lod1.glb');
```

### 12.3 Optimización para WebGL

```
1. Draco Compression:
   - Usar glTF-Pipeline para comprimir GLB con Draco
   - Reducción de tamaño: 70-90%
   - Three.js soporta Draco nativamente

2. Texture Compression:
   - Convertir texturas a WebP o KTX2
   - Usar mipmaps para texturas grandes

3. Instancing:
   - Si hay múltiples edificios idénticos, usar InstancedMesh
   - Reducir draw calls

4. Lazy Loading:
   - Cargar LOD0 solo cuando el edificio es visible
   - Cargar LOD1/LOD2 para edificios lejanos
```

---

## Phase 13: Protección de Licencia en Repo

### 13.1 .gitignore Configuración

```gitignore
# Assets fuente originales (NO redistribuir)
assets/external/
assets/*/source/

# Assets comprados que no pueden compartirse
*.uasset
*.unitypackage
*.blend.original
*.fbx.original

# Archivos de descarga
*.zip
*.rar
*.7z

# Permitir solo archivos procesados
!assets/*/processed/
!assets/*/processed/**/*.glb
!assets/*/processed/**/*.png
!assets/*/processed/**/*.jpg
!assets/*/processed/**/*.webp
```

### 13.2 Archivos que SÍ pueden estar en repo público

| Archivo | ¿Permitido? | Razón |
|---------|-------------|-------|
| `.glb` procesado | ✅ Sí | Es derivado, no fuente original |
| Textura optimizada | ✅ Sí | Derivada, resolución reducida |
| Código de carga | ✅ Sí | Código propio |
| `.blend` de KitBash3D | ❌ No | Violación de licencia comercial |
| `.uasset` de Fab | ❌ No | Violación de Fab Standard License |
| `.fbx` original descargado | ❌ No | Redistribución de fuente |

---

## Troubleshooting Común

### Problema: Materiales se ven negros en WebGL
**Causa:** Normal map o roughness map no se exportaron correctamente.
**Solución:** Verificar que los maps estén conectados en Blender. Usar glTF Viewer para debug.

### Problema: Mesh muy grande (>10MB)
**Causa:** Demasiados polígonos o texturas muy grandes.
**Solución:**
- Reducir texturas a 2K o 1K
- Simplificar geometría con Decimate
- Usar Draco compression

### Problema: Escala incorrecta en el juego
**Causa:** Scale no aplicado en Blender o unidades incorrectas.
**Solución:**
- En Blender: Ctrl+A → All Transforms
- Verificar que 1 unidad = 1 metro
- En Three.js: verificar que no hay scale adicional en el scene graph

### Problema: Texturas de UE5 no se ven en Blender
**Causa:** Materiales UE5 usan nodos específicos de Unreal.
**Solución:** Reconstruir materiales manualmente con Principled BSDF. Copiar los valores base color, metallic, roughness de las texturas exportadas.

### Problema: Normales invertidas
**Causa:** Faces con normales hacia adentro.
**Solución:** Edit Mode → Mesh → Normals → Recalculate Outside (Shift+N)

---

## Timeline Estimado por Asset

| Phase | Tiempo Estimado | Notas |
|-------|-----------------|-------|
| 0. Pre-approval | 5 min | Obtener OK del usuario |
| 1. Download | 10-30 min | Depende del tamaño del asset |
| 2. Documentación | 5 min | Registrar en ASSET_CREDITS.md |
| 3. Import | 10-20 min | Más lento para .uasset (requiere UE5) |
| 4. Normalize | 20-40 min | Escala, orientación, origen |
| 5. Style Unify | 30-60 min | Cambios visuales según fuente |
| 6. Materials | 30-60 min | Reconstrucción PBR |
| 7. Emissive | 15-30 min | Agregar luces |
| 8. Premium Details | 45-90 min | Bevels, panel lines, greebles |
| 9. LODs | 30-45 min | Crear 3 niveles |
| 10. Export | 10-15 min | GLB con settings correctos |
| 11. Validation | 15-20 min | Test en visor externo |
| 12. Integration | 20-30 min | Código de carga en juego |
| **TOTAL** | **4-8 horas** | Por asset premium completo |

**Nota:** Assets CC0 simples (Kenney, KayKit) pueden procesarse en 1-2 horas. Assets AAA (KitBash3D) requieren más trabajo de simplificación.

---

## Related Documents

- `ASSET_CANDIDATES.md` — Inventario visual de assets evaluados
- `assets/external/ASSET_CREDITS.md` — Registro de assets incorporados
- `docs/ASSET_LICENSE_CHECKLIST.md` — Guía de licencias y permisos
- `docs/BUILDING_ASSET_PIPELINE.md` — Pipeline específico para edificios
- `docs/ASSET_IMPORT_PIPELINE.md` — Pipeline general de importación
- `docs/SHIP_MODELING_PIPELINE.md` — Pipeline específico para naves
- `docs/PREMIUM_ASSET_EVALUATION.md` — Evaluación de fuentes premium

---

## Descarga Inicial — Log de Ejecución (2026-05-24)

### Aprobación
- **Usuario autorizó:** Descarga de assets gratuitos CC0 con licencia clara únicamente.
- **Restricciones aplicadas:** No comprar, no descargar pagos, no Unity Asset Store, no Fab/UE5, no Sketchfab/CGTrader sin verificación.

### Descargados y Verificados

| # | Asset | Fuente | Licencia | Archivo Local | Tamaño | Estado |
|---|-------|--------|----------|---------------|--------|--------|
| 1 | Space Station Kit | Kenney.nl | CC0 1.0 | `assets/external/kenney/space-station-kit/` | 1.75 MB ZIP + extracción | ✅ Descargado y extraído. Contiene Models/, Previews/, License.txt |
| 2 | Ultimate Space Kit | quaternius.com (mirror OpenGameArt) | CC0 1.0 | `assets/external/quaternius/ultimate_space_kit/` | 5.7 MB ZIP → 87 archivos GLB | ✅ Descargado y extraído. Naves, edificios, props, vegetación |
| 3 | Metal Plate | polyhaven.com | CC0 1.0 | `assets/external/polyhaven/textures/metal_plate/` | ~2.9 MB (4 JPG) | ✅ Descargado. Maps: diff, nor_gl, rough, metal |
| 4 | Rusty Metal 02 | polyhaven.com | CC0 1.0 | `assets/external/polyhaven/textures/rusty_metal_02/` | ~1.1 MB (3 JPG) | ✅ Descargado. Maps: diff, nor_gl, rough. Nota: sin metal map nativo |
| 5 | Satara Night | polyhaven.com | CC0 1.0 | `assets/external/polyhaven/hdris/satara_night_4k.exr` | 30.48 MB | ✅ Descargado. HDRI nocturno 4K EXR |

### Pendientes / No Descargados

| Asset | Fuente | Motivo |
|-------|--------|--------|
| Mission to Minerva | KitBash3D | Requiere cuenta/login. Gratis pero necesita autenticación. Pendiente de crear cuenta y descargar manualmente. |
| Metal032 | ambientCG | Descarga directa falló (retornó HTML en lugar de ZIP). Requiere método alternativo o descarga manual desde el sitio web. |

### Validación de Licencia

| Asset | Licencia Verificada | Comercial OK | Riesgo |
|-------|---------------------|--------------|--------|
| Kenney Space Station Kit | ✅ CC0 1.0 en kenney.nl | ✅ Sí | **NINGUNO** |
| Quaternius Ultimate Space Kit | ✅ CC0 1.0 en quaternius.com | ✅ Sí | **NINGUNO** |
| Poly Haven Metal Plate | ✅ CC0 1.0 en polyhaven.com | ✅ Sí | **NINGUNO** |
| Poly Haven Rusty Metal 02 | ✅ CC0 1.0 en polyhaven.com | ✅ Sí | **NINGUNO** |
| Poly Haven Satara Night | ✅ CC0 1.0 en polyhaven.com | ✅ Sí | **NINGUNO** |
| KitBash3D Mission to Minerva | ✅ KitBash3D Commercial (gratis) | ✅ Sí | **BAJO** (pendiente descarga) |

### Optimización para WebGL — Pendiente

Ningún asset ha sido convertido a GLB optimizado todavía. Tareas pendientes:
- [ ] Convertir modelos Kenney (FBX → Blender → GLB con materiales PBR)
- [ ] Seleccionar modelos Quaternius relevantes (naves, edificios) y optimizar polycount
- [ ] Convertir texturas Poly Haven a formato comprimido (WebP / KTX2)
- [ ] Probar al menos un GLB en visor externo (Khronos glTF Sample Viewer)
- [ ] Validar escalas (1 unidad = 1 metro)

---

## Last Updated

2026-05-24
