/**
 * ============================================================
 * Formations.js — Sistema de Formaciones Fijas (Galaxy Online 2)
 * ============================================================
 *
 * Define slots predefinidos para escuadrones en distintas formaciones.
 * Cada formación tiene arrays `left` y `right` con coordenadas
 * relativas (0.0 – 1.0).  La función getSlotPosition() las convierte
 * a píxeles según el tamaño del canvas.
 *
 * Formaciones incluidas:
 *   • wedge   — Cuña escalonada (GO2 clásico, 9 slots)
 *   • block   — Bloque 3×3 compacto
 *   • line    — Línea vertical
 *   • diamond — Diamante / rombo
 *   • arrow   — Flecha (5 slots frontal + 4 en V)
 *   • echelon — Escalón oblicuo
 *   • cross   — Cruz
 *   • circle  — Semicírculo / arco
 * ============================================================
 */

const FORMATIONS = {

  /**
   * WEDGE (Cuña) — La formación clásica de GO2.
   * Forma de abanico escalonado: las naves del centro están más
   * adelante (x más cercano al enemigo), las laterales más atrás.
   * 9 slots en cada bando.
   */
  wedge: {
    name: 'Cuña',
    left: [
      /* Fila trasera (más lejos del enemigo) */
      { x: 0.12, y: 0.18 },  // slot 0 — arriba-izquierda
      { x: 0.12, y: 0.38 },  // slot 1 — abajo-izquierda
      /* Segunda fila */
      { x: 0.20, y: 0.12 },  // slot 2
      { x: 0.20, y: 0.24 },  // slot 3
      { x: 0.20, y: 0.36 },  // slot 4
      { x: 0.20, y: 0.48 },  // slot 5
      /* Tercera fila */
      { x: 0.30, y: 0.16 },  // slot 6
      { x: 0.30, y: 0.28 },  // slot 7
      { x: 0.30, y: 0.40 },  // slot 8
      /* Cuarta fila (más cerca del enemigo) */
      { x: 0.40, y: 0.22 },  // slot 9
      { x: 0.40, y: 0.34 },  // slot 10
      /* Punta de la cuña (frente) */
      { x: 0.50, y: 0.28 },  // slot 11
    ],
    right: [
      /* Fila trasera */
      { x: 0.88, y: 0.18 },  // slot 0
      { x: 0.88, y: 0.38 },  // slot 1
      /* Segunda fila */
      { x: 0.80, y: 0.12 },  // slot 2
      { x: 0.80, y: 0.24 },  // slot 3
      { x: 0.80, y: 0.36 },  // slot 4
      { x: 0.80, y: 0.48 },  // slot 5
      /* Tercera fila */
      { x: 0.70, y: 0.16 },  // slot 6
      { x: 0.70, y: 0.28 },  // slot 7
      { x: 0.70, y: 0.40 },  // slot 8
      /* Cuarta fila */
      { x: 0.60, y: 0.22 },  // slot 9
      { x: 0.60, y: 0.34 },  // slot 10
      /* Punta de la cuña (frente) */
      { x: 0.50, y: 0.28 },  // slot 11
    ]
  },

  /**
   * BLOCK (Bloque) — Formación 3×4 compacta.
   * Útil para flotas defensivas. Todas las naves alineadas.
   */
  block: {
    name: 'Bloque',
    left: [
      { x: 0.20, y: 0.15 }, { x: 0.20, y: 0.25 }, { x: 0.20, y: 0.35 }, { x: 0.20, y: 0.45 },
      { x: 0.30, y: 0.15 }, { x: 0.30, y: 0.25 }, { x: 0.30, y: 0.35 }, { x: 0.30, y: 0.45 },
      { x: 0.40, y: 0.15 }, { x: 0.40, y: 0.25 }, { x: 0.40, y: 0.35 }, { x: 0.40, y: 0.45 },
    ],
    right: [
      { x: 0.80, y: 0.15 }, { x: 0.80, y: 0.25 }, { x: 0.80, y: 0.35 }, { x: 0.80, y: 0.45 },
      { x: 0.70, y: 0.15 }, { x: 0.70, y: 0.25 }, { x: 0.70, y: 0.35 }, { x: 0.70, y: 0.45 },
      { x: 0.60, y: 0.15 }, { x: 0.60, y: 0.25 }, { x: 0.60, y: 0.35 }, { x: 0.60, y: 0.45 },
    ]
  },

  /**
   * LINE (Línea) — Formación en línea vertical.
   * Útil para flotas pequeñas o de soporte.
   */
  line: {
    name: 'Línea',
    left: [
      { x: 0.30, y: 0.10 },
      { x: 0.30, y: 0.18 },
      { x: 0.30, y: 0.26 },
      { x: 0.30, y: 0.34 },
      { x: 0.30, y: 0.42 },
      { x: 0.30, y: 0.50 },
    ],
    right: [
      { x: 0.70, y: 0.10 },
      { x: 0.70, y: 0.18 },
      { x: 0.70, y: 0.26 },
      { x: 0.70, y: 0.34 },
      { x: 0.70, y: 0.42 },
      { x: 0.70, y: 0.50 },
    ]
  },

  /**
   * DIAMOND (Diamante) — Formación en rombo.
   * 1 nave al frente, 2 en segunda fila, 3 en tercera, etc.
   */
  diamond: {
    name: 'Diamante',
    left: [
      { x: 0.42, y: 0.20 },             // punta superior (1)
      { x: 0.34, y: 0.28 }, { x: 0.50, y: 0.28 },  // 2ª fila (2)
      { x: 0.26, y: 0.36 }, { x: 0.42, y: 0.36 }, { x: 0.58, y: 0.36 },  // 3ª fila (3)
      { x: 0.34, y: 0.44 }, { x: 0.50, y: 0.44 },  // 4ª fila (2)
      { x: 0.42, y: 0.52 },             // punta inferior (1)
    ],
    right: [
      { x: 0.58, y: 0.20 },             // punta superior (1)
      { x: 0.50, y: 0.28 }, { x: 0.66, y: 0.28 },  // 2ª fila (2)
      { x: 0.42, y: 0.36 }, { x: 0.58, y: 0.36 }, { x: 0.74, y: 0.36 },  // 3ª fila (3)
      { x: 0.50, y: 0.44 }, { x: 0.66, y: 0.44 },  // 4ª fila (2)
      { x: 0.58, y: 0.52 },             // punta inferior (1)
    ]
  },

  /**
   * ARROW (Flecha) — Formación de ataque directo.
   * Punta al frente, alas extendidas atrás.
   */
  arrow: {
    name: 'Flecha',
    left: [
      { x: 0.45, y: 0.28 },                    // punta (1)
      { x: 0.35, y: 0.22 }, { x: 0.35, y: 0.34 },  // 2ª fila (2)
      { x: 0.25, y: 0.16 }, { x: 0.25, y: 0.40 },  // 3ª fila – alas (2)
      { x: 0.15, y: 0.10 }, { x: 0.15, y: 0.46 },  // 4ª fila – alas extendidas (2)
      { x: 0.25, y: 0.28 },                    // refuerzo centro (1)
    ],
    right: [
      { x: 0.55, y: 0.28 },                    // punta (1)
      { x: 0.65, y: 0.22 }, { x: 0.65, y: 0.34 },  // 2ª fila (2)
      { x: 0.75, y: 0.16 }, { x: 0.75, y: 0.40 },  // 3ª fila (2)
      { x: 0.85, y: 0.10 }, { x: 0.85, y: 0.46 },  // 4ª fila (2)
      { x: 0.75, y: 0.28 },                    // refuerzo centro (1)
    ]
  },

  /**
   * ECHELON (Escalón) — Formación oblicua tipo escalera.
   * Cada nave está desplazada hacia adelante y arriba respecto a la anterior.
   */
  echelon: {
    name: 'Escalón',
    left: [
      { x: 0.10, y: 0.45 },
      { x: 0.16, y: 0.39 },
      { x: 0.22, y: 0.33 },
      { x: 0.28, y: 0.27 },
      { x: 0.34, y: 0.21 },
      { x: 0.40, y: 0.15 },
      { x: 0.46, y: 0.09 },
      { x: 0.52, y: 0.03 },
    ],
    right: [
      { x: 0.90, y: 0.45 },
      { x: 0.84, y: 0.39 },
      { x: 0.78, y: 0.33 },
      { x: 0.72, y: 0.27 },
      { x: 0.66, y: 0.21 },
      { x: 0.60, y: 0.15 },
      { x: 0.54, y: 0.09 },
      { x: 0.48, y: 0.03 },
    ]
  },

  /**
   * CROSS (Cruz) — Formación defensiva en cruz.
   * Centro protegido, 4 brazos extendidos.
   */
  cross: {
    name: 'Cruz',
    left: [
      { x: 0.30, y: 0.28 },                    // centro (1)
      { x: 0.20, y: 0.28 },                    // izquierda (1)
      { x: 0.40, y: 0.28 },                    // derecha / frente (1)
      { x: 0.30, y: 0.16 }, { x: 0.30, y: 0.40 },  // arriba & abajo (2)
      { x: 0.10, y: 0.28 },                    // extensión izquierda (1)
      { x: 0.50, y: 0.28 },                    // extensión frente (1)
      { x: 0.30, y: 0.04 }, { x: 0.30, y: 0.52 },  // extensión arriba & abajo (2)
    ],
    right: [
      { x: 0.70, y: 0.28 },                    // centro (1)
      { x: 0.80, y: 0.28 },                    // derecha (1)
      { x: 0.60, y: 0.28 },                    // izquierda / frente (1)
      { x: 0.70, y: 0.16 }, { x: 0.70, y: 0.40 },  // arriba & abajo (2)
      { x: 0.90, y: 0.28 },                    // extensión derecha (1)
      { x: 0.50, y: 0.28 },                    // extensión frente (1)
      { x: 0.70, y: 0.04 }, { x: 0.70, y: 0.52 },  // extensión arriba & abajo (2)
    ]
  },

  /**
   * CIRCLE (Semicírculo) — Formación de arco defensivo.
   * Las naves se disponen en un arco convexa hacia el enemigo.
   */
  circle: {
    name: 'Semicírculo',
    left: [
      { x: 0.28, y: 0.12 },
      { x: 0.34, y: 0.08 },
      { x: 0.42, y: 0.06 },
      { x: 0.50, y: 0.05 },
      { x: 0.42, y: 0.18 },
      { x: 0.50, y: 0.16 },
      { x: 0.50, y: 0.28 },
      { x: 0.42, y: 0.40 },
      { x: 0.50, y: 0.40 },
      { x: 0.28, y: 0.44 },
      { x: 0.34, y: 0.48 },
      { x: 0.42, y: 0.50 },
    ],
    right: [
      { x: 0.72, y: 0.12 },
      { x: 0.66, y: 0.08 },
      { x: 0.58, y: 0.06 },
      { x: 0.50, y: 0.05 },
      { x: 0.58, y: 0.18 },
      { x: 0.50, y: 0.16 },
      { x: 0.50, y: 0.28 },
      { x: 0.58, y: 0.40 },
      { x: 0.50, y: 0.40 },
      { x: 0.72, y: 0.44 },
      { x: 0.66, y: 0.48 },
      { x: 0.58, y: 0.50 },
    ]
  },

};

// ─── Helper: profundidad visual (Z-order) ────────────────────────
// En formaciones tipo wedge, las naves del centro están "delante".
// Usamos el valor X como proxy de profundidad para el z-index.

/**
 * Convierte coordenadas relativas (0.0–1.0) a píxeles absolutos.
 *
 * @param {string} formationKey — clave en FORMATIONS ('wedge', 'block', ...)
 * @param {string} side         — 'left' | 'right'
 * @param {number} index        — índice del slot dentro de la formación
 * @param {number} canvasWidth  — ancho del canvas en píxeles
 * @param {number} canvasHeight — alto del canvas en píxeles
 * @returns {{x:number,y:number,z:number,slotIndex:number}|null}
 */
function getSlotPosition(formationKey, side, index, canvasWidth, canvasHeight) {
  const formation = FORMATIONS[formationKey];
  if (!formation) {
    console.warn(`[Formations] Formación desconocida: "${formationKey}"`);
    return null;
  }

  const slots = formation[side];
  if (!slots) {
    console.warn(`[Formations] Lado desconocido: "${side}"`);
    return null;
  }

  if (index < 0 || index >= slots.length) {
    console.warn(`[Formations] Índice ${index} fuera de rango (0-${slots.length - 1})`);
    return null;
  }

  const slot = slots[index];
  const px = Math.round(slot.x * canvasWidth);
  const py = Math.round(slot.y * canvasHeight);

  // z = profundidad visual: en GO2 las naves más cerca del centro/eje
  // de batalla se pintan "delante" (mayor z). Usamos una mezcla de
  // proximidad al centro y posición Y para evitar solapamientos feos.
  const centerX = side === 'left' ? canvasWidth * 0.50 : canvasWidth * 0.50;
  const distToCenter = Math.abs(px - centerX) / canvasWidth;
  const z = Math.round((1 - distToCenter) * 1000 + slot.y * 100);

  return {
    x: px,
    y: py,
    z: z,
    slotIndex: index,
    relative: { x: slot.x, y: slot.y }
  };
}

/**
 * Devuelve todos los slots de una formación para un lado dado.
 * Útil para pre-visualizar o validar.
 *
 * @param {string} formationKey
 * @param {string} side — 'left' | 'right'
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @returns {Array<{x:number,y:number,z:number,slotIndex:number}>}
 */
function getAllSlots(formationKey, side, canvasWidth, canvasHeight) {
  const formation = FORMATIONS[formationKey];
  if (!formation || !formation[side]) return [];

  return formation[side].map((_, i) =>
    getSlotPosition(formationKey, side, i, canvasWidth, canvasHeight)
  ).filter(Boolean);
}

/**
 * Devuelve el número máximo de slots disponibles para una formación.
 *
 * @param {string} formationKey
 * @param {string} side — 'left' | 'right' (opcional, devuelve el máx de ambos)
 * @returns {number}
 */
function getMaxSlots(formationKey, side) {
  const formation = FORMATIONS[formationKey];
  if (!formation) return 0;
  if (side === 'left' || side === 'right') {
    return formation[side] ? formation[side].length : 0;
  }
  return Math.max(
    formation.left ? formation.left.length : 0,
    formation.right ? formation.right.length : 0
  );
}

/**
 * Lista las formaciones disponibles.
 * @returns {Array<{key:string,name:string,maxSlots:number}>}
 */
function listFormations() {
  return Object.keys(FORMATIONS).map(key => ({
    key,
    name: FORMATIONS[key].name,
    maxSlots: getMaxSlots(key)
  }));
}

// ─── Export para entornos modular / script-tag ───────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FORMATIONS, getSlotPosition, getAllSlots, getMaxSlots, listFormations };
}
