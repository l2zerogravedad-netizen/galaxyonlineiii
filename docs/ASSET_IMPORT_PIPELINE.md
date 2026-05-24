# Asset Import Pipeline — Galaxy Online III

## Overview

Pipeline para importar, adaptar y convertir assets 3D externos a formato del juego con calidad premium.

## Workflow

```
External Asset → Blender → Adapt & Polish → Export GLB → Game Engine
```

## Step 1: Source Verification

Before downloading:
- [ ] Verify license is CC0, MIT, Apache, or compatible CC-BY
- [ ] Check author is not using franchise designs
- [ ] Document in `assets/external/ASSET_CREDITS.md`
- [ ] Download from official source only

## Step 2: Import to Blender

### From .blend files
1. File > Append
2. Navigate to external asset .blend
3. Select Object(s) from scene
4. Import to `assets/external/<category>/<asset_name>/`

### From FBX/OBJ/GLTF
1. File > Import > Select format
2. Check scale (may need x0.01 or x100)
3. Check orientation (may need rotation)
4. Import materials or recreate

## Step 3: Normalization

### Scale
```
Target scales:
- Fighter: 8-15m length
- Frigate: 80-150m
- Cruiser: 500-1000m
- Building: 20-200m
- Prop: 1-5m

Method:
1. Add cube (2m) for scale reference
2. Scale imported mesh to match real-world size
3. Apply scale: Ctrl+A > Scale
```

### Orientation
```
Game engine convention:
- Forward: -Z
- Up: Y
- Apply rotation: Ctrl+A > Rotation
```

### Origin
```
1. Select mesh
2. Set 3D cursor to desired center
3. Object > Set Origin > Origin to 3D Cursor
4. For ships: origin at center of mass
5. For buildings: origin at ground level center
```

## Step 4: Material Adaptation

### Base Material Library

| Name | Color | Roughness | Metallic | Emission | Usage |
|------|-------|-----------|----------|----------|-------|
| hull_white_matte | #E8E8E8 | 0.70 | 0.10 | none | Main armor |
| dark_gunmetal | #2A2A2A | 0.40 | 0.80 | none | Joints, frame |
| accent_orange | #FF6B4A | 0.30 | 0.20 | none | Team highlights |
| glass_cyan | #00D4FF | 0.10 | 0.00 | none | Canopy |
| emissive_cyan | #00FFFF | 0.00 | 0.00 | #00FFFF 5.0 | Engine glow |
| panel_black | #0F0F0F | 0.80 | 0.30 | none | Interior |
| rubber_dark | #1A1A1A | 0.90 | 0.00 | none | Seals |

### Converting External Materials

1. Delete all imported materials
2. Create new material slots
3. Assign from base library
4. Add detail using:
   - **Bevels**: Bevel modifier (0.5mm segments)
   - **Panel lines**: Knife project + slight extrude
   - **Decals**: Separate mesh planes with alpha
   - **Emissive strips**: Small mesh with emissive material
   - **Rivets**: Instanced spheres on hull

### PBR Setup

```
Principled BSDF settings:
- Base Color: Hull color
- Subsurface: 0 (metal hull)
- Metallic: 0.1-0.8 (hull vs frame)
- Specular: 0.5
- Roughness: 0.3-0.9
- Anisotropic: 0
- Sheen: 0
- Clearcoat: 0 (except special ships)
- IOR: 1.45 (glass)
- Transmission: 0 (except canopy)
```

## Step 5: Adding Premium Details

### Panel Lines
```
1. Add loop cuts where panels meet
2. Select edge loops
3. Extrude inward slightly (0.1-0.5mm)
4. Bevel edges (0.05mm)
```

### Greebles (Surface Detail)
```
1. Create small detail objects (vents, hatches, lights)
2. Use Array + Curve for repeating patterns
3. Boolean or manual placement on hull
4. Keep detail proportional (1-5% of hull size)
```

### Emissive Elements
```
1. Create thin strips along hull edges
2. Apply emissive_cyan material
3. Engine exhaust: cone shape with emission
4. Weapon hardpoints: small glow points
```

### Edge Wear
```
Method 1 (Texture):
- Paint wear mask in vertex paint or texture
- Darker roughness in worn areas

Method 2 (Geometry):
- Bevel worn edges
- Slightly darker material on edges
- Add scratch decals
```

## Step 6: LOD Creation

| LOD | Triangle Budget | Method | Distance |
|-----|----------------|--------|----------|
| LOD0 | Full detail | Original mesh | 0-50m |
| LOD1 | ~50% tris | Decimate modifier 0.5 | 50-200m |
| LOD2 | ~25% tris | Decimate modifier 0.25 | 200m+ |

```
1. Duplicate mesh for each LOD
2. Add Decimate modifier (Collapse)
3. Apply and clean up
4. Name: MESHNAME_LOD0, MESHNAME_LOD1, MESHNAME_LOD2
```

## Step 7: Export to GLB

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
  ☑ Reset Pose/Rest
Geometry:
  ☑ Apply Modifiers
  ☐ Loose Edges
  ☐ Loose Points
```

### Post-Export Check
1. File size under 5MB per ship
2. Textures compressed (JPEG/PNG optimized)
3. Single mesh or logical grouping
4. No missing materials
5. Correct scale in viewer

## Step 8: Game Integration

### Placement in Project
```
public/assets/ships/
├── light_fighter/
│   ├── model.glb
│   ├── textures/
│   └── lod/
├── heavy_fighter/
└── frigate/
```

### Three.js Loading
```javascript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('/assets/ships/light_fighter/model.glb', (gltf) => {
  const ship = gltf.scene;
  scene.add(ship);
});
```

## Quality Checklist

- [ ] Mesh is watertight (no holes)
- [ ] Normals face outward
- [ ] No Ngons (quads or tris only)
- [ ] UVs unwrapped if textured
- [ ] Origin at logical center
- [ ] Scale matches game units (meters)
- [ ] Materials use PBR workflow
- [ ] LODs created and tested
- [ ] File size optimized
- [ ] Attribution documented

## Style Guide

### Galaxy Online III Visual Identity
- **Clean lines**: Sharp edges, geometric forms
- **White primary**: Main hull in white/light gray
- **Dark joints**: Frame/connectors in dark metal
- **Cyan accents**: Emissive elements, glass
- **Orange highlights**: Team/player color details
- **Panel complexity**: Medium greeble density
- **Scale hierarchy**: Small ships detailed, large ships simpler per meter

### Avoid
- Organic/blobby shapes
- Overly complex surfaces
- Rust/dirt unless specifically designed
- Neon colors outside cyan/orange palette
- Real-world military camouflage
- Franchise-inspired silhouettes

## Tools Used

| Tool | Purpose | License |
|------|---------|---------|
| Blender 4.x | Modeling, UVs, export | GPL (ok for assets) |
| GIMP/Krita | Texture editing | GPL/CC |
| PolyHaven | PBR textures | CC0 |
| Kenney Assets | Base models | CC0 |
| Quaternius | Base models | CC0 |
| KayKit | Base models | CC0 |

## Last Updated

2026-05-24
