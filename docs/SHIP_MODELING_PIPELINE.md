# Ship Modeling Pipeline — Galaxy Online III

## Overview

Pipeline profesional para crear naves espaciales 3D originales usando solo Blender.

## Tools

| Tool | Purpose | Required |
|------|---------|----------|
| Blender 4.x | Modeling, UVs, materials, export | Yes |
| PureRef | Reference board (optional) | No |

## Folder Structure

```
assets/ships/
├── reference/          # Concept sheets, inspiration images
├── blender/            # .blend source files
├── textures/           # Hand-painted or procedural textures
├── exports/            # GLB/FBX for game engine
└── scripts/            # Blender automation scripts
```

## Naming Convention

```
Ship Classes:
- light_fighter
- heavy_fighter
- interceptor
- bomber
- frigate
- destroyer
- cruiser
- battleship
- carrier
- dreadnought

Object Naming:
- SHIP_<class>_<variant>_hull_main
- SHIP_<class>_<variant>_wing_left
- SHIP_<class>_<variant>_engine_main
- SHIP_<class>_<variant>_weapon_laser_left
- SHIP_<class>_<variant>_cockpit_glass
- SHIP_<class>_<variant>_detail_panel_01

Collections:
- SHIP_MODEL (main)
  - REF_IMAGES
  - BLOCKOUT
  - HULL
  - WINGS
  - ENGINES
  - WEAPONS
  - COCKPIT
  - DETAILS
  - COLLISION
  - EXPORT
```

## Workflow

### 1. Reference Setup

Import images in Blender:
1. Add > Image > Reference
2. Position in orthogonal views:
   - Top (NUMPAD 7)
   - Front (NUMPAD 1)
   - Right (NUMPAD 3)
   - Back (CTRL+NUMPAD 1)
   - Left (CTRL+NUMPAD 3)
   - Bottom (CTRL+NUMPAD 7)
3. Scale to match approximate ship dimensions
4. Lock reference images in REF_IMAGES collection

### 2. Blockout

1. Start with simple primitives (cubes, cylinders)
2. Establish overall silhouette and proportions
3. Use Mirror Modifier for symmetry
4. Keep it low-poly (under 500 tris)
5. Focus on readable shapes from distance

### 3. Mirror Modifier Setup

```
1. Select mesh
2. Add Modifier > Mirror
3. Set axis (usually X)
4. Enable: Merge, Clipping
5. Place loop cuts at mirror axis
```

### 4. Modular Design

Separate meshes by function:
- **HULL**: Main body, armor plates
- **WINGS**: Stabilizers, foils
- **ENGINES**: Thrusters, exhaust ports
- **WEAPONS**: Hardpoints, turrets
- **COCKPIT**: Canopy, pilot area
- **DETAILS**: Greebles, panels, vents

### 5. Materials

Base material library (included in template script):

| Material | Color | Roughness | Notes |
|----------|-------|-----------|-------|
| hull_white_matte | #E8E8E8 | 0.7 | Main armor |
| secondary_dark_metal | #2A2A2A | 0.4 | Joints, frame |
| accent_orange | #FF6B00 | 0.3 | Highlights, team color |
| glass_cyan | #00D4FF | 0.1 | Canopy, transparent |
| emissive_cyan | #00FFFF | 0.0 | Engine glow, lights |
| rubber_dark | #1A1A1A | 0.9 | Seals, grips |
| panel_black | #0F0F0F | 0.8 | Interior panels |

### 6. Lighting Setup

1. Key light: Area light, warm white, 45° angle
2. Fill light: Hemisphere, cool blue, low intensity
3. Rim light: Behind ship, cyan accent
4. Emissive materials for engine glow

### 7. Export for Game

**GLB (recommended):**
```
1. File > Export > glTF 2.0 (.glb)
2. Selected Objects only
3. Include: Materials (Export)
4. Transform: +Y Up
5. Geometry: Apply Modifiers
```

**FBX (alternative):**
```
1. File > Export > FBX
2. Selected Objects
3. Apply Scale: FBX Units Scale
4. Forward: -Z, Up: Y
```

### 8. LOD System

| LOD | Triangles | Distance | Purpose |
|-----|-----------|----------|---------|
| LOD0 | Full detail | 0-50m | Close-up |
| LOD1 | ~50% tris | 50-200m | Mid-range |
| LOD2 | ~25% tris | 200m+ | Far distance |

Create LODs:
1. Duplicate mesh in EXPORT collection
2. Rename: _LOD0, _LOD1, _LOD2
3. Decimate: Modifier > Decimate (Collapse, Ratio 0.5/0.25)
4. Preserve UVs
5. Export all LODs together

## Design Rules

### Originality
- **DO**: Create unique silhouettes
- **DO**: Mix geometric styles (angular + curved)
- **DO**: Use asymmetric details on symmetric base
- **DON'T**: Copy Star Wars, Halo, or Eve Online designs
- **DON'T**: Use exact proportions from existing ships
- **DON'T**: Recreate recognizable color schemes

### Scale Reference
| Class | Length | Example |
|-------|--------|---------|
| Light Fighter | 8-15m | Personal craft |
| Heavy Fighter | 15-25m | Military interceptor |
| Frigate | 80-150m | Small warship |
| Cruiser | 500-1000m | Capital ship |
| Dreadnought | 2000m+ | Flagship |

### Color Palette (Galaxy Online III)
- Primary: White/Silver (hull)
- Secondary: Dark Gray/Black (joints)
- Accent: Orange (#FF6B4A) or Cyan (#00D4FF)
- Emissive: Cyan glow (engines, weapons)

## Quick Start

1. Run template script:
   ```
   Blender > Scripting > Open > create_ship_scene_template.py > Run Script
   ```

2. Import reference images in REF_IMAGES collection

3. Block out silhouette in BLOCKOUT collection

4. Refine in dedicated collections (HULL, WINGS, etc.)

5. Apply materials from template

6. Export to exports/ folder

## Automation

The included Python script (`create_ship_scene_template.py`) automatically:
- Sets up unit scale (meters)
- Creates camera with proper framing
- Adds 3-point lighting + rim light
- Creates all collections
- Sets up base materials
- Prepares export-ready scene

## Next Steps

- [ ] Model first ship class (Light Fighter)
- [ ] Test in game engine
- [ ] Iterate based on gameplay feedback
- [ ] Expand material library
- [ ] Consider Substance Painter for advanced texturing
