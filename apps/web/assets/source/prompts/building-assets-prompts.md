# Prompts para Generación de Assets de Edificios

## Estilo Visual General

**Tema:** Sci-fi isométrico, premium, metálico con glow
**Perspectiva:** Isométrica 30°
**Iluminación:** 3-point lighting con neón
**Paleta:** Cian (#22d3ee), Púrpura (#a855f7), Dorado (#fbbf24), Rojo (#f87171)
**Formato:** WebP con transparencia (RGBA)
**Tamaño:** 512x512px render → 120x120px final

---

## 1. Extractor de Metal (Metal Extractor)

### Prompt para Midjourney/DALL-E
```
Sci-fi mining facility, isometric view, metallic structure with 
glowing cyan core, drill towers extracting minerals, industrial 
aesthetic, dark background, neon cyan accents, 3D render, 
transparent background, high detail, 8k quality
```

### Especificaciones
- **Glow:** Cian
- **Categoría:** Producción
- **Colores:** Gris metálico, cian neón
- **Elementos:** Torres de perforación, cintas transportadoras

---

## 2. Refinería de Plasma (Plasma Refinery)

### Prompt
```
Futuristic plasma refinery, isometric, glass containment chamber 
with swirling purple plasma, industrial pipes, glowing purple 
conduits, sci-fi industrial design, transparent background, 
8k render, neon purple glow
```

### Especificaciones
- **Glow:** Púrpura
- **Categoría:** Producción
- **Colores:** Negro mate, púrpura brillante, gris
- **Elementos:** Cámara de plasma, tuberías, válvulas

---

## 3. Almacén (Warehouse)

### Prompt
```
Sci-fi storage facility, isometric view, massive metallic 
structure with yellow glowing storage bays, container stacks, 
industrial doors, golden accent lights, transparent background, 
3D render, high quality
```

### Especificaciones
- **Glow:** Dorado
- **Categoría:** Almacenamiento
- **Colores:** Gris industrial, amarillo/dorado
- **Elementos:** Puertas de hangar, contenedores, luces de señalización

---

## 4. Generador de Energía (Energy Generator)

### Prompt
```
Futuristic energy generator, isometric, spherical core with 
green glowing plasma, Tesla coils, electrical arcs, power 
conduits, sci-fi power plant, transparent background, neon 
green glow, 8k render
```

### Especificaciones
- **Glow:** Verde
- **Categoría:** Infraestructura
- **Colores:** Blanco/azul claro, verde neón
- **Elementos:** Esfera central, bobinas, arcos eléctricos

---

## 5. Centro de Control (Control Center)

### Prompt
```
Sci-fi command center, isometric view, tall tower with 
communication array, holographic displays, cyan holograms, 
radar dishes, futuristic architecture, transparent 
background, neon cyan accents, 3D render
```

### Especificaciones
- **Glow:** Cian
- **Categoría:** Infraestructura
- **Colores:** Blanco/gris, cian brillante
- **Elementos:** Torre, antenas, pantallas holográficas

---

## 6. Astillero (Shipyard)

### Prompt
```
Futuristic shipyard, isometric, massive construction facility 
with docking bays, robotic arms, ship under construction, 
orange welding sparks, industrial sci-fi, transparent 
background, orange glow, 8k render
```

### Especificaciones
- **Glow:** Naranja
- **Categoría:** Militar
- **Colores:** Gris oscuro, naranja/amarillo
- **Elementos:** Bases de construcción, grúas, naves parciales

---

## 7. Laboratorio de Investigación (Research Lab)

### Prompt
```
Sci-fi research laboratory, isometric, dome structure with 
purple holographic displays, test tubes, energy chambers, 
high-tech equipment, transparent background, purple neon 
glow, 3D render, futuristic science aesthetic
```

### Especificaciones
- **Glow:** Púrpura
- **Categoría:** Investigación
- **Colores:** Blanco, púrpura, vidrio transparente
- **Elementos:** Cúpula, paneles holográficos, cámaras de prueba

---

## 8. Hangar

### Prompt
```
Futuristic hangar bay, isometric, open bay doors with ships 
inside, cyan lighting, repair equipment, sci-fi military 
design, transparent background, cyan glow, 8k render
```

### Especificaciones
- **Glow:** Cian
- **Categoría:** Militar
- **Colores:** Gris militar, cian, negro
- **Elementos:** Puertas abiertas, naves estacionadas, equipos

---

## 9. Torreta de Defensa (Defense Turret)

### Prompt
```
Sci-fi defense turret, isometric, heavy weapons platform 
with rotating cannon, red targeting lasers, armored base, 
military defense structure, transparent background, 
red glow, 3D render
```

### Especificaciones
- **Glow:** Rojo
- **Categoría:** Defensa
- **Colores:** Gris oscuro, rojo neón
- **Elementos:** Cañón rotativo, láseres de puntería, base blindada

---

## Guía de Post-Procesado

### En Photoshop/GIMP

1. **Fondo:** Eliminar fondo, mantener solo el edificio
2. **Transparencia:** Exportar como PNG 32-bit (RGBA)
3. **Glow:** Añadir efecto de brillo exterior (outer glow)
4. **Optimización:** Reducir a 512x512px máximo

### Conversión WebP

```bash
# Usando cwebp
cwebp -q 85 -size 50kb input.png -o output.webp

# Usando Sharp (Node.js)
sharp(input).webp({ quality: 85, effort: 6 }).toFile(output)
```

---

## Notas de Diseño

### Consistencia Visual

- Todos los edificios deben compartir:
  - Misma escala isométrica
  - Paleta de colores coherente
  - Nivel de detalle similar
  - Estilo metálico/futurista unificado

### Diferenciación por Categoría

| Categoría | Color Principal | Elementos Distintivos |
|-----------|-----------------|----------------------|
| Producción | Cian/Púrpura | Equipos activos, partículas |
| Almacenamiento | Dorado | Estructura masiva, puertas |
| Infraestructura | Cian/Verde | Torres, antenas, displays |
| Militar | Cian/Naranja | Armamento, hangares |
| Investigación | Púrpura | Cúpulas, hologramas |
| Defensa | Rojo | Armas, blindaje pesado |

---

## Versiones Requeridas

Cada edificio necesita:

1. **Versión Base** (Nivel 1)
2. **Versión Mejorada** (Nivel 10) - Más detalles, luces adicionales
3. **Icono Miniatura** (32x32px) - Para listas y biblioteca

---

**Última actualización:** 2026-05-24
