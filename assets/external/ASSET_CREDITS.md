# Asset Credits — Galaxy Online III

## Registro de Assets Incorporados al Proyecto

**Instrucciones:** Completar esta tabla cada vez que se descargue e integre un asset al proyecto. No dejar assets sin documentar.

### Formato de Registro

| Asset | Autor | Fuente | Link | Licencia | Fecha | Uso | Requiere credito | Restricciones |
|-------|-------|--------|------|----------|-------|-----|------------------|---------------|

---

## Assets Comerciales (Pagos)

| Asset | Autor | Fuente | Link | Licencia | Fecha | Uso | Requiere credito | Restricciones |
|-------|-------|--------|------|----------|-------|-----|------------------|---------------|
| | | | | | | | | |

---

## Assets Gratuitos (CC0 / Free)

| Asset | Autor | Fuente | Link | Licencia | Fecha | Uso | Requiere credito | Restricciones |
|-------|-------|--------|------|----------|-------|-----|------------------|---------------|
| | | | | | | | | |

---

## Texturas y Materiales

| Asset | Autor | Fuente | Link | Licencia | Fecha | Uso | Requiere credito | Restricciones |
|-------|-------|--------|------|----------|-------|-----|------------------|---------------|
| | | | | | | | | |

---

## HDRI / Environment Maps

| Asset | Autor | Fuente | Link | Licencia | Fecha | Uso | Requiere credito | Restricciones |
|-------|-------|--------|------|----------|-------|-----|------------------|---------------|
| Satara Night | Poly Haven | polyhaven.com | https://polyhaven.com/a/satara_night | CC0 1.0 Universal | 2026-05-24 | HDRI nocturno para iluminación de escenas espaciales. Resolución: 4K EXR | No | Ninguna |

---

## Assets Rechazados (Documentar por qué)

| Asset | Autor | Fuente | Link | Motivo de Rechazo | Fecha |
|-------|-------|--------|------|-------------------|-------|
| | | | | | |

---

## Notas Legales

### CC0 (Public Domain)
- **Atribución:** No requerida.
- **Uso comercial:** Permitido.
- **Modificación:** Permitida.
- **Redistribución:** Permitida.
- **Crédito recomendado:** Opcional, pero se agradece en página de créditos del juego.

### KitBash3D Commercial License
- **Atribución:** No requerida.
- **Uso comercial:** Permitido en juegos, películas, publicidad.
- **Modificación:** Permitida.
- **Redistribución:** NO permitida de archivos fuente. Solo en builds compilados.
- **Perpetual:** Sí, si se compra licencia perpetua. Si es suscripción, requiere suscripción activa.
- **Crédito:** Opcional.

### Fab Standard License (Epic)
- **Atribución:** No requerida.
- **Uso comercial:** Permitido en juegos interactivos.
- **Modificación:** Permitida.
- **Redistribución:** NO permitida de archivos fuente originales.
- **Crédito:** No requerido.

### ArtStation Standard License
- **Atribución:** No requerida.
- **Uso comercial:** Permitido en juegos.
- **Modificación:** Permitida.
- **Redistribución:** NO permitida de archivos fuente.
- **Crédito:** Opcional.

### Unity Asset Store EULA
- **Atribución:** No requerida.
- **Uso comercial:** Permitido en juegos compilados.
- **Modificación:** Permitida.
- **Redistribución:** RESTRICTIVA. No redistribuir fuente. En WebGL hay riesgo de "redistribución indirecta" porque los assets son accesibles en el cliente.
- **Crédito:** No requerido.
- **Recomendación:** EVITAR para juegos WebGL puros.

---

## Directorio de Assets en el Repositorio

```
assets/
├── external/              # Assets crudos descargados (NO modificar después de review)
│   ├── buildings/
│   ├── interiors/
│   ├── space_bases/
│   ├── textures/
│   ├── hdris/
│   └── props/
├── buildings/
│   ├── source/            # Archivos .blend de trabajo
│   └── processed/         # GLB finales listos para engine
├── space_bases/
│   ├── source/
│   └── processed/
├── interiors/
│   ├── source/
│   └── processed/
└── ships/
    ├── source/
    └── processed/
```

---

## Checklist al Incorporar un Asset

- [ ] Descargado desde fuente oficial (no mirrors)
- [ ] Licencia verificada en sitio oficial
- [ ] Asset colocado en `assets/external/<categoria>/`
- [ ] Registro completado en esta tabla
- [ ] Formato original preservado (sin modificar)
- [ ] Copia de trabajo creada en `assets/<categoria>/source/`
- [ ] Asset procesado y exportado a `assets/<categoria>/processed/`
- [ ] GLB validado en visor externo
- [ ] Materiales PBR verificados
- [ ] Escala correcta (metros)
- [ ] Origen en posicion logica
- [ ] No hay elementos de franquicia conocida

---

## Last Updated

2026-05-24