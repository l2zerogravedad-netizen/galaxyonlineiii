/**
 * ============================================================
 * ShipSprites.js — Generador de Sprites de Naves 2D (pseudo-3D)
 * ============================================================
 *
 * Genera texturas de naves espaciales proceduralmente usando
 * Phaser 3 Graphics. Estilo 2D con sombreado (pseudo-3D) tipo
 * Galaxy Online 2 (Flash/Facebook sci-fi).
 *
 * Tipos de nave:
 *   • frigate    — Flecha alargada y delgada, ~30-35 px
 *   • cruiser    — Ancha con armamento, ~40-45 px
 *   • battleship — Masiva multi-sección, ~50-55 px
 *
 * Colores por bando:
 *   Atacante (izquierda): azules/turquesas
 *   Defensor (derecha):   rosas/corales
 *
 * Uso:
 *   ShipSprites.generateAll(scene);
 *   const sprite = scene.add.image(x, y, 'ship_frigate_blue');
 * ============================================================
 */

class ShipSprites {

  /**
   * Paleta de colores por tipo de nave y bando.
   */
  static PALETTES = {
    // ─── Atacante (izquierda) — tonos azules ─────────────────
    frigate_blue: {
      base: 0x4488ff,      // azul brillante
      dark: 0x2266cc,      // azul oscuro (sombra)
      light: 0x77aaff,     // azul claro (brillo)
      accent: 0x88ccff,    // acento cielo
      engine: 0x00ddff,    // glow motor
      outline: 0x113388,   // borde
    },
    cruiser_blue: {
      base: 0x44aaff,
      dark: 0x2288aa,
      light: 0x77ccff,
      accent: 0x55ddff,
      engine: 0x00eeff,
      outline: 0x114477,
    },
    battleship_blue: {
      base: 0x55ccff,
      dark: 0x3388aa,
      light: 0x88ddff,
      accent: 0x66eeff,
      engine: 0x33ffff,
      outline: 0x115577,
    },
    // ─── Defensor (derecha) — tonos rosas/corales ────────────
    frigate_red: {
      base: 0xff6688,      // rosa/coral
      dark: 0xcc3355,      // rojo oscuro
      light: 0xff99bb,     // rosa claro
      accent: 0xffbbcc,    // acento
      engine: 0xff5588,    // glow motor
      outline: 0x881133,   // borde
    },
    cruiser_red: {
      base: 0xff88aa,
      dark: 0xaa4466,
      light: 0xffbbcc,
      accent: 0xffccdd,
      engine: 0xff6699,
      outline: 0x772244,
    },
    battleship_red: {
      base: 0xee5577,
      dark: 0xbb3355,
      light: 0xff88aa,
      accent: 0xff99bb,
      engine: 0xff4466,
      outline: 0x661122,
    },
  };

  /**
   * Genera TODAS las texturas de naves en una escena de Phaser.
   * Llama a esto en el preload o create de la escena.
   *
   * @param {Phaser.Scene} scene
   */
  static generateAll(scene) {
    const keys = Object.keys(ShipSprites.PALETTES);
    for (const key of keys) {
      const [shipType, colorSide] = key.split('_');
      const palette = ShipSprites.PALETTES[key];
      const size = shipType === 'frigate' ? 44 : shipType === 'cruiser' ? 52 : 64;

      const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

      // Seleccionar método de dibujo
      if (shipType === 'frigate') {
        ShipSprites.drawFrigate(graphics, palette);
      } else if (shipType === 'cruiser') {
        ShipSprites.drawCruiser(graphics, palette);
      } else if (shipType === 'battleship') {
        ShipSprites.drawBattleship(graphics, palette);
      }

      graphics.generateTexture(`ship_${key}`, size, size);
      graphics.destroy();
    }

    console.log('[ShipSprites] Texturas generadas:', keys.map(k => `ship_${k}`).join(', '));
  }

  /**
   * Genera UNA textura individual de nave.
   *
   * @param {Phaser.Scene} scene
   * @param {string} shipType   — 'frigate' | 'cruiser' | 'battleship'
   * @param {string} colorSide  — 'blue' (atacante) | 'red' (defensor)
   * @returns {string} nombre de la textura generada
   */
  static generateOne(scene, shipType, colorSide) {
    const key = `${shipType}_${colorSide}`;
    const palette = ShipSprites.PALETTES[key];
    if (!palette) {
      console.warn(`[ShipSprites] Paleta no encontrada: ${key}`);
      return null;
    }

    const size = shipType === 'frigate' ? 44 : shipType === 'cruiser' ? 52 : 64;
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

    if (shipType === 'frigate') ShipSprites.drawFrigate(graphics, palette);
    else if (shipType === 'cruiser') ShipSprites.drawCruiser(graphics, palette);
    else if (shipType === 'battleship') ShipSprites.drawBattleship(graphics, palette);

    const textureKey = `ship_${key}`;
    graphics.generateTexture(textureKey, size, size);
    graphics.destroy();
    return textureKey;
  }

  // ═══════════════════════════════════════════════════════════
  //  DIBUJO: FRIGATE (flecha alargada, pequeña)
  // ═══════════════════════════════════════════════════════════
  static drawFrigate(g, c) {
    const cx = 22, cy = 22;
    const s = 0.85; // escala

    // ── Sombra / halo trasero (motor) ──
    g.fillStyle(c.engine, 0.25);
    g.fillCircle(cx - 14 * s, cy, 6 * s);
    g.fillCircle(cx - 14 * s, cy - 3 * s, 4 * s);
    g.fillCircle(cx - 14 * s, cy + 3 * s, 4 * s);

    // ── Ala izquierda (sombra) ──
    g.fillStyle(c.dark, 1);
    g.beginPath();
    g.moveTo(cx - 8 * s, cy - 2 * s);
    g.lineTo(cx - 16 * s, cy - 10 * s);
    g.lineTo(cx - 6 * s, cy - 8 * s);
    g.lineTo(cx + 6 * s, cy - 2 * s);
    g.closePath();
    g.fillPath();

    // ── Ala derecha (sombra) ──
    g.beginPath();
    g.moveTo(cx - 8 * s, cy + 2 * s);
    g.lineTo(cx - 16 * s, cy + 10 * s);
    g.lineTo(cx - 6 * s, cy + 8 * s);
    g.lineTo(cx + 6 * s, cy + 2 * s);
    g.closePath();
    g.fillPath();

    // ── Cuerpo principal (forma de flecha alargada) ──
    // Capa base (sombra inferior)
    g.fillStyle(c.dark, 1);
    g.beginPath();
    g.moveTo(cx + 16 * s, cy);           // punta nariz
    g.lineTo(cx + 2 * s, cy - 5 * s);
    g.lineTo(cx - 14 * s, cy - 3 * s);   // motor arriba
    g.lineTo(cx - 14 * s, cy + 3 * s);   // motor abajo
    g.lineTo(cx + 2 * s, cy + 5 * s);
    g.closePath();
    g.fillPath();

    // Capa principal (color base)
    g.fillStyle(c.base, 1);
    g.beginPath();
    g.moveTo(cx + 15 * s, cy);           // punta nariz
    g.lineTo(cx + 2 * s, cy - 4 * s);
    g.lineTo(cx - 12 * s, cy - 2.5 * s);
    g.lineTo(cx - 12 * s, cy + 2.5 * s);
    g.lineTo(cx + 2 * s, cy + 4 * s);
    g.closePath();
    g.fillPath();

    // ── Cockpit central (óvalo brillante) ──
    g.fillStyle(c.light, 1);
    g.fillEllipse(cx + 2 * s, cy, 5 * s, 3 * s);
    g.fillStyle(0xffffff, 0.6);
    g.fillEllipse(cx + 2.5 * s, cy - 0.5 * s, 2.5 * s, 1.5 * s);

    // ── Línea de brillo superior (pseudo-3D) ──
    g.lineStyle(1, c.light, 0.7);
    g.beginPath();
    g.moveTo(cx + 14 * s, cy - 1.5 * s);
    g.lineTo(cx + 2 * s, cy - 3.5 * s);
    g.lineTo(cx - 10 * s, cy - 2 * s);
    g.strokePath();

    // ── Motores traseros (glow) ──
    g.fillStyle(c.engine, 0.9);
    g.fillCircle(cx - 13 * s, cy - 1.5 * s, 1.8 * s);
    g.fillCircle(cx - 13 * s, cy + 1.5 * s, 1.8 * s);

    // Glow exterior motor
    g.fillStyle(c.engine, 0.3);
    g.fillCircle(cx - 14 * s, cy - 1.5 * s, 3 * s);
    g.fillCircle(cx - 14 * s, cy + 1.5 * s, 3 * s);

    // ── Bordes/outline sutiles ──
    g.lineStyle(0.8, c.outline, 0.5);
    g.beginPath();
    g.moveTo(cx + 15 * s, cy);
    g.lineTo(cx + 2 * s, cy - 4 * s);
    g.lineTo(cx - 12 * s, cy - 2.5 * s);
    g.lineTo(cx - 12 * s, cy + 2.5 * s);
    g.lineTo(cx + 2 * s, cy + 4 * s);
    g.closePath();
    g.strokePath();
  }

  // ═══════════════════════════════════════════════════════════
  //  DIBUJO: CRUISER (ancho, con armamento)
  // ═══════════════════════════════════════════════════════════
  static drawCruiser(g, c) {
    const cx = 26, cy = 26;
    const s = 0.9;

    // ── Sombra de motores ──
    g.fillStyle(c.engine, 0.2);
    g.fillCircle(cx - 16 * s, cy - 5 * s, 5 * s);
    g.fillCircle(cx - 16 * s, cy + 5 * s, 5 * s);
    g.fillCircle(cx - 14 * s, cy, 4 * s);

    // ── Alas laterales extendidas (capa sombra) ──
    g.fillStyle(c.dark, 1);
    // Ala superior
    g.beginPath();
    g.moveTo(cx + 2 * s, cy - 4 * s);
    g.lineTo(cx - 6 * s, cy - 14 * s);
    g.lineTo(cx + 4 * s, cy - 12 * s);
    g.lineTo(cx + 12 * s, cy - 4 * s);
    g.closePath();
    g.fillPath();
    // Ala inferior
    g.beginPath();
    g.moveTo(cx + 2 * s, cy + 4 * s);
    g.lineTo(cx - 6 * s, cy + 14 * s);
    g.lineTo(cx + 4 * s, cy + 12 * s);
    g.lineTo(cx + 12 * s, cy + 4 * s);
    g.closePath();
    g.fillPath();

    // ── Alas (capa principal) ──
    g.fillStyle(c.base, 1);
    g.beginPath();
    g.moveTo(cx + 2 * s, cy - 3 * s);
    g.lineTo(cx - 4 * s, cy - 12 * s);
    g.lineTo(cx + 5 * s, cy - 10 * s);
    g.lineTo(cx + 11 * s, cy - 3 * s);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(cx + 2 * s, cy + 3 * s);
    g.lineTo(cx - 4 * s, cy + 12 * s);
    g.lineTo(cx + 5 * s, cy + 10 * s);
    g.lineTo(cx + 11 * s, cy + 3 * s);
    g.closePath();
    g.fillPath();

    // ── Cuerpo principal (más ancho que frigate) ──
    // Sombra base
    g.fillStyle(c.dark, 1);
    g.beginPath();
    g.moveTo(cx + 16 * s, cy);            // nariz
    g.lineTo(cx + 6 * s, cy - 6 * s);
    g.lineTo(cx - 10 * s, cy - 5 * s);    // hombro sup
    g.lineTo(cx - 16 * s, cy - 3 * s);    // motor sup
    g.lineTo(cx - 16 * s, cy + 3 * s);    // motor inf
    g.lineTo(cx - 10 * s, cy + 5 * s);
    g.lineTo(cx + 6 * s, cy + 6 * s);
    g.closePath();
    g.fillPath();

    // Cuerpo principal
    g.fillStyle(c.base, 1);
    g.beginPath();
    g.moveTo(cx + 15 * s, cy);
    g.lineTo(cx + 6 * s, cy - 5 * s);
    g.lineTo(cx - 8 * s, cy - 4.5 * s);
    g.lineTo(cx - 14 * s, cy - 2.5 * s);
    g.lineTo(cx - 14 * s, cy + 2.5 * s);
    g.lineTo(cx - 8 * s, cy + 4.5 * s);
    g.lineTo(cx + 6 * s, cy + 5 * s);
    g.closePath();
    g.fillPath();

    // ── Capa de brillo (superior) ──
    g.fillStyle(c.light, 0.5);
    g.beginPath();
    g.moveTo(cx + 14 * s, cy - 0.5 * s);
    g.lineTo(cx + 6 * s, cy - 4 * s);
    g.lineTo(cx - 6 * s, cy - 3.5 * s);
    g.lineTo(cx - 12 * s, cy - 2 * s);
    g.lineTo(cx - 8 * s, cy - 1 * s);
    g.closePath();
    g.fillPath();

    // ── Bridge de comando (cúpula central) ──
    g.fillStyle(c.accent, 1);
    g.fillEllipse(cx + 2 * s, cy, 5 * s, 3.5 * s);
    g.fillStyle(c.light, 0.8);
    g.fillEllipse(cx + 2.5 * s, cy - 0.5 * s, 3 * s, 2 * s);
    g.fillStyle(0xffffff, 0.5);
    g.fillEllipse(cx + 3 * s, cy - 0.8 * s, 1.5 * s, 1 * s);

    // ── 4 torretas de armamento ──
    const turretColor = c.dark;
    const turretGlow = c.accent;
    // Torreta 1 (arriba-delante)
    g.fillStyle(turretColor, 1);
    g.fillCircle(cx + 8 * s, cy - 7 * s, 2.2 * s);
    g.fillStyle(turretGlow, 0.7);
    g.fillCircle(cx + 8 * s, cy - 7 * s, 1.2 * s);
    // Torreta 2 (arriba-atrás)
    g.fillStyle(turretColor, 1);
    g.fillCircle(cx - 2 * s, cy - 9 * s, 2 * s);
    g.fillStyle(turretGlow, 0.7);
    g.fillCircle(cx - 2 * s, cy - 9 * s, 1 * s);
    // Torreta 3 (abajo-delante)
    g.fillStyle(turretColor, 1);
    g.fillCircle(cx + 8 * s, cy + 7 * s, 2.2 * s);
    g.fillStyle(turretGlow, 0.7);
    g.fillCircle(cx + 8 * s, cy + 7 * s, 1.2 * s);
    // Torreta 4 (abajo-atrás)
    g.fillStyle(turretColor, 1);
    g.fillCircle(cx - 2 * s, cy + 9 * s, 2 * s);
    g.fillStyle(turretGlow, 0.7);
    g.fillCircle(cx - 2 * s, cy + 9 * s, 1 * s);

    // ── 4 Motores traseros ──
    const mPositions = [
      { x: cx - 15 * s, y: cy - 3 * s },
      { x: cx - 15 * s, y: cy + 3 * s },
      { x: cx - 13 * s, y: cy - 6 * s },
      { x: cx - 13 * s, y: cy + 6 * s },
    ];
    for (const m of mPositions) {
      // Glow exterior
      g.fillStyle(c.engine, 0.35);
      g.fillCircle(m.x, m.y, 3 * s);
      // Motor
      g.fillStyle(c.engine, 0.9);
      g.fillCircle(m.x, m.y, 1.8 * s);
      // Brillo central
      g.fillStyle(0xffffff, 0.5);
      g.fillCircle(m.x - 0.3 * s, m.y - 0.3 * s, 0.8 * s);
    }

    // ── Outline ──
    g.lineStyle(0.8, c.outline, 0.4);
    g.beginPath();
    g.moveTo(cx + 15 * s, cy);
    g.lineTo(cx + 6 * s, cy - 5 * s);
    g.lineTo(cx - 8 * s, cy - 4.5 * s);
    g.lineTo(cx - 14 * s, cy - 2.5 * s);
    g.lineTo(cx - 14 * s, cy + 2.5 * s);
    g.lineTo(cx - 8 * s, cy + 4.5 * s);
    g.lineTo(cx + 6 * s, cy + 5 * s);
    g.closePath();
    g.strokePath();
  }

  // ═══════════════════════════════════════════════════════════
  //  DIBUJO: BATTLESHIP (masiva, multi-sección, mucho armamento)
  // ═══════════════════════════════════════════════════════════
  static drawBattleship(g, c) {
    const cx = 32, cy = 32;
    const s = 0.95;

    // ── Halo de motores (grande) ──
    g.fillStyle(c.engine, 0.15);
    g.fillCircle(cx - 20 * s, cy, 8 * s);
    g.fillCircle(cx - 18 * s, cy - 8 * s, 5 * s);
    g.fillCircle(cx - 18 * s, cy + 8 * s, 5 * s);

    // ── Alas grandes (capa sombra) ──
    g.fillStyle(c.dark, 1);
    // Ala superior grande
    g.beginPath();
    g.moveTo(cx + 4 * s, cy - 6 * s);
    g.lineTo(cx - 8 * s, cy - 20 * s);
    g.lineTo(cx + 2 * s, cy - 18 * s);
    g.lineTo(cx + 14 * s, cy - 8 * s);
    g.lineTo(cx + 8 * s, cy - 5 * s);
    g.closePath();
    g.fillPath();
    // Ala inferior grande
    g.beginPath();
    g.moveTo(cx + 4 * s, cy + 6 * s);
    g.lineTo(cx - 8 * s, cy + 20 * s);
    g.lineTo(cx + 2 * s, cy + 18 * s);
    g.lineTo(cx + 14 * s, cy + 8 * s);
    g.lineTo(cx + 8 * s, cy + 5 * s);
    g.closePath();
    g.fillPath();

    // ── Alas grandes (capa principal) ──
    g.fillStyle(c.base, 1);
    g.beginPath();
    g.moveTo(cx + 4 * s, cy - 5 * s);
    g.lineTo(cx - 6 * s, cy - 18 * s);
    g.lineTo(cx + 4 * s, cy - 16 * s);
    g.lineTo(cx + 13 * s, cy - 7 * s);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(cx + 4 * s, cy + 5 * s);
    g.lineTo(cx - 6 * s, cy + 18 * s);
    g.lineTo(cx + 4 * s, cy + 16 * s);
    g.lineTo(cx + 13 * s, cy + 7 * s);
    g.closePath();
    g.fillPath();

    // ── Cuerpo principal (3 secciones) ──
    // Sección trasera (más ancha)
    g.fillStyle(c.dark, 1);
    g.beginPath();
    g.moveTo(cx - 4 * s, cy - 7 * s);
    g.lineTo(cx - 18 * s, cy - 5 * s);
    g.lineTo(cx - 20 * s, cy - 2 * s);
    g.lineTo(cx - 20 * s, cy + 2 * s);
    g.lineTo(cx - 18 * s, cy + 5 * s);
    g.lineTo(cx - 4 * s, cy + 7 * s);
    g.closePath();
    g.fillPath();

    // Sección central
    g.fillStyle(c.base, 1);
    g.beginPath();
    g.moveTo(cx + 6 * s, cy - 6 * s);
    g.lineTo(cx - 6 * s, cy - 7 * s);
    g.lineTo(cx - 16 * s, cy - 5 * s);
    g.lineTo(cx - 16 * s, cy + 5 * s);
    g.lineTo(cx - 6 * s, cy + 7 * s);
    g.lineTo(cx + 6 * s, cy + 6 * s);
    g.closePath();
    g.fillPath();

    // Sección delantera (nariz)
    g.fillStyle(c.light, 0.8);
    g.beginPath();
    g.moveTo(cx + 18 * s, cy);
    g.lineTo(cx + 6 * s, cy - 6 * s);
    g.lineTo(cx - 2 * s, cy - 5 * s);
    g.lineTo(cx - 2 * s, cy + 5 * s);
    g.lineTo(cx + 6 * s, cy + 6 * s);
    g.closePath();
    g.fillPath();

    // ── Detalle: paneles de la sección central ──
    g.fillStyle(c.accent, 0.4);
    g.fillRect(cx - 10 * s, cy - 3 * s, 10 * s, 6 * s);
    g.fillStyle(c.dark, 0.6);
    g.fillRect(cx - 8 * s, cy - 2 * s, 6 * s, 4 * s);

    // ── Estructura de comando prominente (torre) ──
    // Base de la torre
    g.fillStyle(c.accent, 1);
    g.fillEllipse(cx - 2 * s, cy, 7 * s, 5 * s);
    // Cúpula
    g.fillStyle(c.light, 1);
    g.fillEllipse(cx - 1 * s, cy - 0.5 * s, 5 * s, 3.5 * s);
    // Brillo
    g.fillStyle(0xffffff, 0.6);
    g.fillEllipse(cx + 0.5 * s, cy - 1.5 * s, 2.5 * s, 1.8 * s);
    // Antena
    g.lineStyle(1.2, c.accent, 0.8);
    g.lineBetween(cx - 2 * s, cy - 3 * s, cx - 2 * s, cy - 10 * s);
    g.fillStyle(c.light, 1);
    g.fillCircle(cx - 2 * s, cy - 10 * s, 1 * s);

    // ── 6 Cañones / baterías ──
    const batteryPositions = [
      // Delanteros (más grandes)
      { x: cx + 10 * s, y: cy - 8 * s, r: 2.5 * s },
      { x: cx + 10 * s, y: cy + 8 * s, r: 2.5 * s },
      { x: cx + 6 * s, y: cy - 11 * s, r: 2 * s },
      { x: cx + 6 * s, y: cy + 11 * s, r: 2 * s },
      // Traseros
      { x: cx - 6 * s, y: cy - 13 * s, r: 2 * s },
      { x: cx - 6 * s, y: cy + 13 * s, r: 2 * s },
    ];
    for (const b of batteryPositions) {
      // Sombra cañón
      g.fillStyle(c.dark, 1);
      g.fillCircle(b.x, b.y, b.r);
      // Brillo cañón
      g.fillStyle(c.accent, 0.8);
      g.fillCircle(b.x, b.y, b.r * 0.6);
      // Punto brillante
      g.fillStyle(0xffffff, 0.6);
      g.fillCircle(b.x - 0.3 * s, b.y - 0.3 * s, b.r * 0.25);
    }

    // ── 6 Motores en array ──
    const motorPositions = [
      { x: cx - 19 * s, y: cy - 1.5 * s, r: 2.2 * s },
      { x: cx - 19 * s, y: cy + 1.5 * s, r: 2.2 * s },
      { x: cx - 17 * s, y: cy - 4.5 * s, r: 2 * s },
      { x: cx - 17 * s, y: cy + 4.5 * s, r: 2 * s },
      { x: cx - 17 * s, y: cy - 7.5 * s, r: 1.6 * s },
      { x: cx - 17 * s, y: cy + 7.5 * s, r: 1.6 * s },
    ];
    for (const m of motorPositions) {
      // Glow
      g.fillStyle(c.engine, 0.3);
      g.fillCircle(m.x, m.y, m.r * 1.6);
      // Motor
      g.fillStyle(c.engine, 0.9);
      g.fillCircle(m.x, m.y, m.r);
      // Brillo
      g.fillStyle(0xffffff, 0.6);
      g.fillCircle(m.x - 0.3 * s, m.y - 0.3 * s, m.r * 0.35);
    }

    // ── Líneas de detalle estructural ──
    g.lineStyle(0.6, c.light, 0.3);
    g.lineBetween(cx - 14 * s, cy - 3 * s, cx + 4 * s, cy - 2 * s);
    g.lineBetween(cx - 14 * s, cy + 3 * s, cx + 4 * s, cy + 2 * s);
    g.lineBetween(cx - 8 * s, cy, cx + 8 * s, cy);

    // ── Outline general ──
    g.lineStyle(0.8, c.outline, 0.35);
    g.beginPath();
    g.moveTo(cx + 18 * s, cy);
    g.lineTo(cx + 6 * s, cy - 6 * s);
    g.lineTo(cx - 4 * s, cy - 7 * s);
    g.lineTo(cx - 18 * s, cy - 5 * s);
    g.lineTo(cx - 20 * s, cy - 2 * s);
    g.lineTo(cx - 20 * s, cy + 2 * s);
    g.lineTo(cx - 18 * s, cy + 5 * s);
    g.lineTo(cx - 4 * s, cy + 7 * s);
    g.lineTo(cx + 6 * s, cy + 6 * s);
    g.closePath();
    g.strokePath();
  }

  /**
   * Genera una textura de "escuadrón" — varias naves agrupadas
   * como se ve en GO2 (3-4 naves juntas en un sprite único).
   *
   * @param {Phaser.Scene} scene
   * @param {string} shipType    — 'frigate' | 'cruiser' | 'battleship'
   * @param {string} colorSide   — 'blue' | 'red'
   * @param {number} shipCount   — número de naves en el escuadrón (para escala visual)
   * @returns {string} textureKey
   */
  static generateSquadronSprite(scene, shipType, colorSide, shipCount) {
    const singleKey = `ship_${shipType}_${colorSide}`;
    // Asegurar que la textura individual existe
    if (!scene.textures.exists(singleKey)) {
      ShipSprites.generateOne(scene, shipType, colorSide);
    }

    const squadronKey = `squadron_${shipType}_${colorSide}_${shipCount}`;
    if (scene.textures.exists(squadronKey)) return squadronKey;

    const size = shipType === 'frigate' ? 64 : shipType === 'cruiser' ? 72 : 84;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const palette = ShipSprites.PALETTES[`${shipType}_${colorSide}`];

    // Dibujar 3-4 naves en formación compacta
    const offsets = [
      { x: size * 0.38, y: size * 0.30, scale: 0.70 },
      { x: size * 0.55, y: size * 0.42, scale: 0.75 },
      { x: size * 0.35, y: size * 0.55, scale: 0.68 },
    ];

    // Si hay muchas naves (>1000), añadir una 4ª nave
    if (shipCount > 1000) {
      offsets.push({ x: size * 0.52, y: size * 0.58, scale: 0.62 });
    }

    for (const off of offsets) {
      g.save();
      g.translateCanvas(off.x, off.y);
      g.scaleCanvas(off.scale, off.scale);

      if (shipType === 'frigate') ShipSprites.drawFrigate(g, palette);
      else if (shipType === 'cruiser') ShipSprites.drawCruiser(g, palette);
      else ShipSprites.drawBattleship(g, palette);

      g.restore();
    }

    g.generateTexture(squadronKey, size, size);
    g.destroy();
    return squadronKey;
  }
}

// ─── Export ──────────────────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ShipSprites };
}
