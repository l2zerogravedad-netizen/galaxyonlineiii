/**
 * RoundBanner.js - Banner de ronda para Galaxy Online 2
 *
 * Muestra un banner grande centrado en pantalla al inicio de cada ronda
 * con el texto "RONDA X" en dorado brillante.
 *
 * Animación: Fade in → Pause → Fade out
 * Estilo clásico de juegos Flash, limpio y elegante.
 */

class RoundBanner {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;

    // Elementos del banner
    this.container = null;
    this.background = null;
    this.textLine1 = null; // "RONDA"
    this.textLine2 = null; // Número
    this.glowEffect = null;

    // Estado
    this.visible = false;
    this.animating = false;

    // Colores
    this.COLORS = {
      bg: 0x000033,
      bgAlpha: 0.6,
      textGold: "#ffdd44",
      textGlow: "#ff8800",
      stroke: "#884400",
    };
  }

  /**
   * Muestra el banner con animación de entrada
   * @param {number} round - Número de ronda a mostrar
   */
  show(round) {
    // Limpiar banner anterior si existe
    this.hide(true);

    const centerX = this.scene.cameras.main.centerX;
    const centerY = this.scene.cameras.main.centerY;
    const width = this.scene.cameras.main.width;

    // Contenedor principal
    this.container = this.scene.add.container(centerX, centerY);
    this.container.setDepth(200); // Por encima de todo

    // Panel de fondo (barra horizontal)
    this.background = this.scene.add.rectangle(
      0,
      0,
      width * 0.7,
      120,
      this.COLORS.bg,
      this.COLORS.bgAlpha
    );
    this.background.setStrokeStyle(2, 0x333366, 0.8);
    this.container.add(this.background);

    // Borde decorativo superior
    const topLine = this.scene.add.rectangle(0, -55, width * 0.65, 2, 0xffdd44, 0.6);
    this.container.add(topLine);

    // Borde decorativo inferior
    const bottomLine = this.scene.add.rectangle(0, 55, width * 0.65, 2, 0xffdd44, 0.6);
    this.container.add(bottomLine);

    // Líneas decorativas laterales (esquinas)
    const leftCorner = this.scene.add.line(-width * 0.3, 0, 0, -40, 0, 40, 0xffdd44, 0.4);
    leftCorner.setLineWidth(1);
    this.container.add(leftCorner);

    const rightCorner = this.scene.add.line(width * 0.3, 0, 0, -40, 0, 40, 0xffdd44, 0.4);
    rightCorner.setLineWidth(1);
    this.container.add(rightCorner);

    // Texto "RONDA"
    this.textLine1 = this.scene.add.text(0, -22, "RONDA", {
      fontFamily: "Arial Black, Arial, sans-serif",
      fontSize: "24px",
      color: "#cccccc",
      align: "center",
    });
    this.textLine1.setOrigin(0.5, 0.5);
    this.container.add(this.textLine1);

    // Texto número de ronda (más grande, dorado)
    this.textLine2 = this.scene.add.text(0, 18, `${round}`, {
      fontFamily: "Arial Black, Impact, sans-serif",
      fontSize: "56px",
      color: this.COLORS.textGold,
      stroke: this.COLORS.stroke,
      strokeThickness: 4,
      align: "center",
    });
    this.textLine2.setOrigin(0.5, 0.5);
    this.container.add(this.textLine2);

    // Glow dorado detrás del número
    this.glowEffect = this.scene.add.text(0, 18, `${round}`, {
      fontFamily: "Arial Black, Impact, sans-serif",
      fontSize: "60px",
      color: "#ff8800",
      align: "center",
    });
    this.glowEffect.setOrigin(0.5, 0.5);
    this.glowEffect.setAlpha(0.3);
    this.container.addAt(this.glowEffect, 1); // Detrás del número

    // Estado
    this.visible = true;
    this.animating = true;

    // === ANIMACIÓN DE ENTRADA ===

    // Inicial: invisible, escalado pequeño
    this.container.setAlpha(0);
    this.container.setScale(0.5);

    // Tween de entrada
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: "Back.easeOut",
      onComplete: () => {
        this.animating = false;

        // Glow pulsante del número
        this.scene.tweens.add({
          targets: this.glowEffect,
          alpha: { from: 0.2, to: 0.5 },
          scaleX: { from: 1, to: 1.1 },
          scaleY: { from: 1, to: 1.1 },
          duration: 500,
          yoyo: true,
          repeat: 2,
          ease: "Sine.easeInOut",
        });
      },
    });

    // Slide desde arriba sutil
    this.container.setY(centerY - 50);
    this.scene.tweens.add({
      targets: this.container,
      y: centerY,
      duration: 400,
      ease: "Power2",
    });

    // Animación del fondo (expansión)
    this.background.setScale(0, 1);
    this.scene.tweens.add({
      targets: this.background,
      scaleX: 1,
      duration: 350,
      ease: "Power2",
    });

    // Auto-hide después de la duración configurada
    this.scene.time.delayedCall(1000, () => {
      // No auto-hide aquí - el CombatSystem controla el tiempo
    });
  }

  /**
   * Oculta el banner con animación de salida
   * @param {boolean} immediate - Si true, destruye sin animación
   */
  hide(immediate = false) {
    if (!this.container || !this.visible) {
      this._destroyElements();
      return;
    }

    if (immediate) {
      this._destroyElements();
      return;
    }

    this.animating = true;

    // Animación de salida: fade + scale down
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        this._destroyElements();
      },
    });
  }

  /**
   * Destruye todos los elementos del banner
   */
  _destroyElements() {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }

    this.background = null;
    this.textLine1 = null;
    this.textLine2 = null;
    this.glowEffect = null;
    this.visible = false;
    this.animating = false;
  }

  /**
   * Destruye el banner (limpieza completa)
   */
  destroy() {
    this._destroyElements();
  }
}

// Exportar
if (typeof module !== "undefined" && module.exports) {
  module.exports = RoundBanner;
}
