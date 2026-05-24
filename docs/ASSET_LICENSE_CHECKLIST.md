# Asset License Checklist — Galaxy Online III

## Propósito

Este documento explica qué assets se pueden usar directamente, qué requiere compra, qué requiere atribución, qué se rechaza, y cómo documentar correctamente cada licencia para evitar problemas legales.

---

## Quick Decision Matrix

| Si el asset es... | Entonces... |
|-------------------|-------------|
| **CC0 / Public Domain** | ✅ **USAR DIRECTAMENTE** — Sin atribución requerida. Documentar en ASSET_CREDITS.md |
| **KitBash3D Commercial** (comprado) | ✅ **USAR** — Comercial permitido. No redistribuir fuente. Documentar |
| **Fab Standard** (comprado) | ✅ **USAR** — Comercial OK. UE-first, requiere export para Blender/WebGL |
| **ArtStation Standard** (comprado) | ✅ **USAR** — Comercial OK. Documentar |
| **CC-BY** (requiere atribución) | ✅ **USAR** con crédito. Documentar autor+link en juego y docs |
| **MIT / Apache 2.0** | ✅ **USAR** con atribución (incluir LICENSE en repo). Documentar |
| **CC-BY-SA** (ShareAlike) | ⚠️ **EVALUAR** — Todo derivado debe ser SA también. Complicado para juego propietario |
| **CC-BY-NC** (Non-Commercial) | ❌ **RECHAZAR** — No permite uso comercial |
| **GPL** | ❌ **RECHAZAR** — Copyleft. Requiere liberar código fuente |
| **Unity Asset Store EULA** | ⚠️ **EVITAR** — Restrictivo para WebGL. Riesgo de redistribución indirecta |
| **Sin licencia clara** | ❌ **RECHAZAR** — Sin excepciones |
| **Fan art / Franquicia** | ❌ **RECHAZAR** — Infracción de copyright |
| **Sketchfab sin verificar** | ⚠️ **PAUSA** — Verificar licencia individual antes de usar |
| **CGTrader / RenderHub** | ⚠️ **EVITAR** — Riesgo alto, licencias inconsistentes |

---

## Categoría 1: APROBADO para Uso Directo

### CC0 / Public Domain

**Ejemplos:** Kenney, Quaternius, KayKit, Poly Haven, ambientCG, OpenGameArt CC0

| Requisito | Estado |
|-----------|--------|
| Uso comercial | ✅ Permitido |
| Modificación | ✅ Permitida |
| Atribución | ❌ No requerida |
| Redistribución | ✅ Permitida |
| Incluir en repo público | ✅ Permitido |
| Usar en build WebGL | ✅ Permitido |

**Acción requerida:**
1. Documentar en `ASSET_CREDITS.md`
2. Colocar en `assets/external/<categoria>/`
3. Procesar según `docs/BUILDING_ASSET_PIPELINE.md`

**Nota:** Aunque no es requerido, se recomienda incluir crédito opcional en página de créditos del juego como gesto de agradecimiento.

---

## Categoría 2: REQUIERE COMPRA (Luego aprobado)

### KitBash3D Commercial License

**Ejemplos:** Neo City, Cargo, Sci-Fi Industrial, Utopia, Aftermath

| Requisito | Estado |
|-----------|--------|
| Uso comercial | ✅ Permitido (después de compra) |
| Modificación | ✅ Permitida |
| Atribución | ❌ No requerida |
| Redistribución fuente | ❌ **NO permitida** |
| Usar en build compilado | ✅ Permitido |
| Usar en múltiples proyectos | ✅ Sí (perpetual license) |

**Acción requerida:**
1. **Comprar desde cuenta oficial** en kitbash3d.com
2. Descargar desde Cargo app o sitio oficial
3. Documentar en `ASSET_CREDITS.md` con número de orden
4. Colocar en `assets/external/<categoria>/`
5. **NO subir archivos fuente a repo público**
6. Procesar a GLB y subir solo los `.glb` procesados (no los fuentes .blend de KitBash3D)

**Restricción clave:** Los archivos `.blend` originales de KitBash3D NO pueden compartirse en un repo público. Solo los exports procesados (.glb) pueden estar en el build del juego.

---

### Fab Standard License (Epic Games)

**Ejemplos:** Modular Sci-Fi Interior Bundle, Big Modular SciFi Interior

| Requisito | Estado |
|-----------|--------|
| Uso comercial | ✅ Permitido (después de compra) |
| Modificación | ✅ Permitida |
| Atribución | ❌ No requerida |
| Redistribución fuente | ❌ **NO permitida** |
| Usar en build compilado | ✅ Permitido |

**Acción requerida:**
1. **Comprar desde cuenta Epic/Fab**
2. Descargar desde Epic Games Launcher o Fab
3. Documentar en `ASSET_CREDITS.md`
4. **NO subir archivos `.uasset` a repo público**
5. Exportar a FBX desde UE5, importar a Blender, procesar a GLB
6. Subir solo `.glb` procesados al repo

**Restricción clave:** Formatos UE5 (.uasset) NO son compatibles con Blender/WebGL directamente. Requiere export manual.

---

### ArtStation Standard License

**Ejemplos:** Space Base, Modular Sci-Fi Interior Space Station

| Requisito | Estado |
|-----------|--------|
| Uso comercial | ✅ Permitido (después de compra) |
| Modificación | ✅ Permitida |
| Atribución | ❌ No requerida |
| Redistribución fuente | ❌ **NO permitida** |
| Usar en build compilado | ✅ Permitido |

**Acción requerida:**
1. **Comprar desde cuenta ArtStation**
2. Descargar desde ArtStation Marketplace
3. Documentar en `ASSET_CREDITS.md`
4. **NO subir archivos fuente originales a repo público**
5. Procesar a GLB y subir solo processed files

---

## Categoría 3: REQUIERE ATRIBUCIÓN

### CC-BY (Creative Commons Attribution)

**Ejemplos:** Algunos assets de OpenGameArt, ciertos modelos de Sketchfab

| Requisito | Estado |
|-----------|--------|
| Uso comercial | ✅ Permitido |
| Modificación | ✅ Permitida |
| Atribución | ✅ **REQUERIDA** |
| Redistribución | ✅ Permitida con atribución |
| Usar en build WebGL | ✅ Permitido |

**Acción requerida:**
1. Documentar en `ASSET_CREDITS.md`
2. Incluir **nombre del autor + link** en:
   - Página de créditos del juego (visible para jugadores)
   - Archivo `CREDITS.md` en el repositorio
3. Ejemplo de atribución: `"Space Base Module by [Author Name] — [link]"`

---

### MIT / Apache 2.0

**Ejemplos:** Blender Spaceship Generator (MIT), algunas herramientas

| Requisito | Estado |
|-----------|--------|
| Uso comercial | ✅ Permitido |
| Modificación | ✅ Permitida |
| Atribución | ✅ **REQUERIDA** |
| Incluir LICENSE | ✅ **REQUERIDO** (copia del archivo LICENSE en repo) |

**Acción requerida:**
1. Incluir archivo `LICENSE` original en carpeta del asset o en `docs/licenses/`
2. Documentar en `ASSET_CREDITS.md`
3. Mencionar en créditos del juego

---

## Categoría 4: RECHAZADO — No Usar

### CC-BY-NC (Non-Commercial)

**Motivo:** Prohíbe uso en juegos comerciales o con monetización.

**Ejemplos:** Ciertos assets de Sketchfab, Free3D, algunos de OpenGameArt.

**Acción:** ❌ Rechazar inmediatamente. No negociable.

---

### GPL (General Public License)

**Motivo:** Copyleft. Cualquier software derivado debe liberarse bajo GPL. Un juego comercial con assets GPL podría requerir liberar todo el código fuente.

**Ejemplos:** Sverchok (Blender addon GPL), algunas herramientas.

**Acción:** ❌ Rechazar para integración directa. Pueden usarse como herramientas de desarrollo (Blender addons), pero no como assets del juego.

---

### Unity Asset Store EULA

**Motivo:** Licencia restrictiva. La cláusula de "no redistribución" es problemática para WebGL donde los assets 3D son fácilmente extraíbles del build.

**Ejemplos:** Cualquier asset comprado en Unity Asset Store.

**Acción:** ⚠️ **Evitar para WebGL.** Si se usa Unity como engine principal, es aceptable. Para pipeline Blender→WebGL, mejor usar KitBash3D o CC0.

---

### Sin Licencia Clara

**Motivo:** Sin licencia = sin permiso. Uso = posible infracción de copyright.

**Ejemplos:** Modelos de foros sin licencia, imágenes de Google, assets de GitHub sin LICENSE file.

**Acción:** ❌ Rechazar inmediatamente.

---

### Fan Art / Franquicias Conocidas

**Motivo:** Infracción directa de copyright. Los titulares de derechos (Disney, Paramount, Microsoft, EA, etc.) pueden demandar.

**Lista de franquicias PROHIBIDAS:**
- Star Wars (Disney/Lucasfilm)
- Star Trek (Paramount)
- Halo (Microsoft/343 Industries)
- Mass Effect (BioWare/EA)
- EVE Online (CCP Games)
- No Man's Sky (Hello Games)
- Warhammer 40K (Games Workshop)
- Elite Dangerous (Frontier)
- Star Citizen (Cloud Imperium)
- Homeworld (Gearbox)
- FTL (Subset Games)
- Stellaris (Paradox)
- Starfield (Bethesda)
- Marvel / DC (Disney/Warner)
- Any anime / manga franchise

**Acción:** ❌ Rechazar inmediatamente. Sin excepciones.

---

## Categoría 5: EVALUAR INDIVIDUALMENTE

### Sketchfab Store — Modelo por Modelo

**Problema:** Cada asset tiene su propia licencia elegida por el autor.

**Licencias posibles en Sketchfab:**
| Tipo de Licencia | ¿Permitido en juegos? | Acción |
|------------------|----------------------|--------|
| Standard / Royalty Free | ✅ Sí | ✅ Aprobar con verificación |
| Editorial Use Only | ❌ No | ❌ Rechazar |
| CC0 | ✅ Sí | ✅ Aprobar |
| CC-BY | ✅ Sí | ✅ Aprobar con atribución |
| CC-BY-SA | ⚠️ Depende | ⚠️ Evaluar |
| CC-BY-NC | ❌ No | ❌ Rechazar |

**Acción requerida para cada modelo:**
1. Leer licencia específica en la página del producto
2. Verificar que diga "Standard" o "Royalty Free" (no "Editorial")
3. Verificar screenshots por elementos de franquicia
4. Verificar reseñas y reputación del vendedor
5. Documentar licencia exacta en `ASSET_CREDITS.md`

---

### CGTrader / RenderHub

**Problema:** Licencia varía por autor. Calidad inconsistente. Riesgo de contenido robado.

**Acción:** ⚠️ **Evitar si es posible.** Si se usa un asset específico:
1. Verificar licencia exacta en la página del producto
2. Verificar que el autor sea establecido (múltiples productos, buenas reseñas)
3. Verificar que no sea contenido de franquicia
4. Documentar extensivamente en `ASSET_CREDITS.md`
5. Preferir KitBash3D o CC0 en su lugar

---

## Cómo Documentar Licencias

### Template de Registro (ASSET_CREDITS.md)

```markdown
| Asset | Autor | Fuente | Link | Licencia | Fecha | Uso | Requiere credito | Restricciones |
|-------|-------|--------|------|----------|-------|-----|------------------|---------------|
| Neo City | KitBash3D | kitbash3d.com | https://... | KitBash3D Commercial | 2026-05-24 | Ciudad colonial | No | No redistribuir fuente |
| Space Station Kit | Kenney | kenney.nl | https://... | CC0 1.0 | 2026-05-24 | Módulos estación | No | Ninguna |
```

### Información Mínima Requerida

Para cada asset documentar:
1. **Nombre exacto** del asset
2. **Autor / Publisher** completo
3. **Fuente** (dominio exacto)
4. **Link directo** a la página del producto
5. **Licencia exacta** (nombre completo, no abreviado)
6. **Fecha de incorporación** al proyecto
7. **Uso** dentro del juego (edificio, nave, textura, etc.)
8. **¿Requiere crédito?** Sí / No
9. **Restricciones importantes** (no redistribuir, atribución, etc.)
10. **Número de orden / factura** (para assets comprados)

---

## Protección del Repo Público

Si el repositorio de Galaxy Online III es o será público:

| Tipo de Asset | ¿Puede estar en repo público? |
|---------------|-------------------------------|
| CC0 assets | ✅ Sí — sin restricciones |
| Procesados .glb (exportados) | ✅ Sí — son derivados, no fuente original |
| KitBash3D .blend originales | ❌ **NO** — viola licencia comercial |
| Fab .uasset originales | ❌ **NO** — viola Fab Standard License |
| ArtStation .blend originales | ❌ **NO** — viola Standard License |
| Unity .unitypackage | ❌ **NO** — viola Unity EULA |
| MIT tools (código) | ✅ Sí — pero incluir LICENSE file |

**Recomendación:** Mantener `assets/external/` (archivos fuente descargados) en `.gitignore`. Solo subir al repo los archivos procesados (`.glb`, texturas optimizadas) en `assets/<categoria>/processed/`.

---

## Checklist Final Pre-Integración

Antes de que cualquier asset entre al proyecto:

- [ ] ¿Tiene licencia clara y verificable?
- [ ] ¿Permite uso comercial en videojuegos?
- [ ] ¿No es Non-Commercial?
- [ ] ¿No es ShareAlike sin evaluación previa?
- [ ] ¿No es contenido de franquicia conocida?
- [ ] ¿Se compró desde fuente oficial (no piratería)?
- [ ] ¿Se documentó en ASSET_CREDITS.md?
- [ ] ¿Los archivos fuente originales están en .gitignore (si es repo público)?
- [ ] ¿Se obtuvo aprobación del usuario para compras (si aplica)?

---

## Contactos de Soporte Legal (Referencia)

| Fuente | Contacto | Tema |
|--------|----------|------|
| KitBash3D | enterprise@kitbash3d.com | Licencias comerciales, enterprise |
| Epic/Fab | support@fab.com | Fab Standard License |
| ArtStation | support@artstation.com | Marketplace licenses |
| Unity | support@unity3d.com | Asset Store EULA |

---

## Related Documents

- `ASSET_CANDIDATES.md` — Inventario visual de assets evaluados
- `assets/external/ASSET_CREDITS.md` — Registro de assets incorporados
- `docs/BUILDING_ASSET_PIPELINE.md` — Pipeline de conversión a premium
- `docs/PREMIUM_ASSET_EVALUATION.md` — Evaluación de fuentes premium

---

## Estado de Aprobación — Descarga Inicial (2026-05-24)

| Asset | Fuente | Licencia | Estado | Motivo |
|-------|--------|----------|--------|--------|
| Space Station Kit | Kenney.nl | CC0 1.0 | ✅ **APROBADO** | Descargado y extraído. 90+ modelos FBX/OBJ/Blend. Riesgo: NINGUNO |
| Ultimate Space Kit | Quaternius.com | CC0 1.0 | ✅ **APROBADO** | Descargado y extraído. 87 archivos GLB. Riesgo: NINGUNO |
| Metal Plate | Poly Haven | CC0 1.0 | ✅ **APROBADO** | Descargado. 4 maps PBR (diff, nor, rough, metal). Riesgo: NINGUNO |
| Rusty Metal 02 | Poly Haven | CC0 1.0 | ✅ **APROBADO** | Descargado. 3 maps PBR (diff, nor, rough). Nota: sin metal map nativo. Riesgo: NINGUNO |
| Satara Night HDRI | Poly Haven | CC0 1.0 | ✅ **APROBADO** | Descargado. 4K EXR. Riesgo: NINGUNO |
| Mission to Minerva | KitBash3D | KitBash3D Commercial | ⏳ **PENDIENTE** | Gratis pero requiere cuenta/login en KitBash3D para descargar. NO descargado aún. Riesgo: BAJO |
| Metal032 | ambientCG | CC0 1.0 | ❌ **RECHAZADO (temporal)** | Descarga directa falló (retornó HTML). Requiere método alternativo. Riesgo: NINGUNO |

---

## Last Updated

2026-05-24
