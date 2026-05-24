# Checklist de aprobación — assets 3D (GLB)

Completar **antes** de marcar un asset como `approved` en `assets/generated/ai-3d/ASSET_MANIFEST.md`.

## Identidad y legal

- [ ] Licencia registrada (Meshy / original / CC0) con enlace en `shipyard/reports/license.md`
- [ ] Sin logos ni texto de terceros visibles en el modelo
- [ ] No parecido a franquicias protegidas (GO2, Star Wars, Star Trek, etc.)
- [ ] No se copiaron assets de Galaxy Online II

## Archivo técnico

- [ ] GLB validado (abre sin error en visor interno)
- [ ] Peso aceptable (premium &lt; 30 MB ideal; **no integrar** si &gt; 50 MB)
- [ ] Probado en visor: `/admin/assets/3d-viewer`
- [ ] Versión optimizada en `optimized/` si el original supera objetivo

## Calidad visual

- [ ] Geometría correcta (sin huecos graves, sin caras invertidas masivas)
- [ ] Escala correcta (referencia: grilla del visor, altura edificio ~1–3 unidades según slot)
- [ ] Pivote/origen correcto (base apoyada en Y=0, centrado en XZ)
- [ ] Texturas/materiales correctos (sin magenta de material roto)
- [ ] Sin partes flotantes graves desconectadas del mesh principal

## Animación (si aplica)

- [ ] Clips listados en panel del visor
- [ ] Nombres de clips documentados

## Aprobación final

- [ ] Fila actualizada en `ASSET_MANIFEST.md` → estado `approved`
- [ ] Campo **Listo juego**: `yes` solo si todo lo anterior está marcado
- [ ] Capturas guardadas en `reports/`

**Aprobado para juego:** ☐ Sí ☐ No — responsable: __________ — fecha: __________
