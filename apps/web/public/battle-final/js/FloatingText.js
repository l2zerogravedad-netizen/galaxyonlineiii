/**
 * FloatingText.js - Sistema de texto flotante para Galaxy Online 2
 *
 * Muestra números de daño, críticos, curación, misses y buffs
 * sobre las unidades durante el combate. Estilo clásico de juegos Flash.
 *
 * Tipos:
 * - damage:    Daño normal (blanco)
 * - critical:  Golpe crítico (amarillo/dorado, más grande)
 * - heal:      Curación (verde)
 * - miss:      Fallo (gris, "MISS")
 * - buff:      Mejora (azul claro)
 */

class FloatingText {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x - Posición X inicial
   * @param {number} y - Posición Y inicial
   * @param {string} text - Texto a mostrar
   * @param {string} type - 'damage' | 'critical' | 'heal' | 'miss' | 'buff'
   */
  constructor(scene, x, y, text, type = "damage") {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.text = text;
    this.type = type;

    // Configuración según tipo
    this.config = this._getConfig(type);

    // Estado de la animación
    this.age = 0;
    this.duration = this.config.duration;
    this.finished = false;

    // Crear el texto
    this._create();
  }

  /**
   * Obtiene la configuración visual según el tipo
   */
  _getConfig(type) {
    const configs = {
      damage: {
        fontSize: "20px",
        fontFamily: "Arial Black, Arial, sans-serif",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
        duration: 1200,
        riseSpeed: 40, // px/segundo hacia arriba
        riseVariation: 10,
        scaleStart: 1.0,
        scalePeak: 1.2,
        scaleEnd: 0.8,
        shadow: true,
        shadowColor: "#000000",
        shadowBlur: 4,
      },
      critical: {
        fontSize: "28px",
        fontFamily: "Arial Black, Arial, sans-serif",
        color: "#ffdd44",
        stroke: "#884400",
        strokeThickness: 4,
        duration: 1600,
        riseSpeed: 35,
        riseVariation: 15,
        scaleStart: 0.6,
        scalePeak: 1.4,
        scaleEnd: 0.9,
        shadow: true,
        shadowColor: "#ff8800",
        shadowBlur: 8,
      },
      heal: {
        fontSize: "20px",
        fontFamily: "Arial Black, Arial, sans-serif",
        color: "#44ff88",
        stroke: "#004400",
        strokeThickness: 3,
        duration: 1200,
        riseSpeed: 30,
        riseVariation: 8,
        scaleStart: 0.8,
        scalePeak: 1.1,
        scaleEnd: 0.9,
        shadow: true,
        shadowColor: "#00aa44",
        shadowBlur: 4,
      },
      miss: {
        fontSize: "18px",
        fontFamily: "Arial, sans-serif",
        color: "#aaaaaa",
        stroke: "#000000",
        strokeThickness: 2,
        duration: 1000,
        riseSpeed: 25,
        riseVariation: 5,
        scaleStart: 0.7,
        scalePeak: 1.0,
        scaleEnd: 0.8,
        shadow: false,
        shadowColor: "#000000",
        shadowBlur: 0,
      },
      buff: {
        fontSize: "16px",
        fontFamily: "Arial, sans-serif",
        color: "#66ccff",
        stroke: "#002244",
        strokeThickness: 2,
        duration: 1400,
        riseSpeed: 20,
        riseVariation: 5,
        scaleStart: 0.8,
        scalePeak: 1.0,
        scaleEnd: 0.8,
        shadow: true,
        shadowColor: "#0066aa",
        shadowBlur: 4,
      },
    };

    return configs[type] || configs.damage;
  }

  /**
   * Crea el objeto de texto de Phaser
   */
  _create() {
    const cfg = this.config;

    // Añadir variación aleatoria a la posición X para evitar superposición
    this.x += (Math.random() - 0.5) * cfg.riseVariation * 2;

    // Texto principal
    this.textObj = this.scene.add.text(this.x, this.y, this.text, {
      fontFamily: cfg.fontFamily,
      fontSize: cfg.fontSize,
      color: cfg.color,
      stroke: cfg.stroke,
      strokeThickness: cfg.strokeThickness,
      align: "center",
    });

    this.textObj.setOrigin(0.5, 0.5);
    this.textObj.setDepth(100); // Por encima de todo

    // Animación de entrada (pop)
    this.textObj.setScale(cfg.scaleStart);

    this.scene.tweens.add({
      targets: this.textObj,
      scaleX: cfg.scalePeak,
      scaleY: cfg.scalePeak,
      duration: 150,
      ease: "Back.easeOut",
    });

    // Para críticos, añadir un efecto de brillo adicional
    if (this.type === "critical") {
      this._createCriticalEffect();
    }

    // Para curación, añadir icono "+"
    if (this.type === "heal" && !this.text.startsWith("+")) {
      this.textObj.setText("+" + this.text);
    }
  }

  /**
   * Efecto especial para golpes críticos
   */
  _createCriticalEffect() {
    // Segundo texto más grande y transparente para efecto de "eco"
    this.criticalGlow = this.scene.add.text(this.x, this.y, this.text, {
      fontFamily: this.config.fontFamily,
      fontSize: parseInt(this.config.fontSize) + 8 + "px",
      color: "#ff8800",
      stroke: "#884400",
      strokeThickness: 2,
    });
    this.criticalGlow.setOrigin(0.5, 0.5);
    this.criticalGlow.setDepth(99);
    this.criticalGlow.setAlpha(0.4);

    // Shake del texto crítico
    this.scene.tweens.add({
      targets: [this.textObj, this.criticalGlow],
      x: {
        from: this.x - 3,
        to: this.x + 3,
      },
      duration: 50,
      repeat: 3,
      yoyo: true,
      ease: "Power1",
    });

    // Fade out del glow
    this.scene.tweens.add({
      targets: this.criticalGlow,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 400,
      ease: "Power2",
    });
  }

  /**
   * Actualiza el texto flotante
   * @param {number} dt - Delta time en ms
   * @returns {boolean} true si terminó y debe destruirse
   */
  update(dt) {
    if (this.finished) return true;

    this.age += dt;

    const progress = Math.min(this.age / this.duration, 1.0);

    // Mover hacia arriba
    const riseAmount = (this.config.riseSpeed * this.age) / 1000;
    this.textObj.setY(this.y - riseAmount);

    if (this.criticalGlow) {
      this.criticalGlow.setY(this.y - riseAmount);
    }

    // Fase de animación
    if (progress < 0.1) {
      // Fase de entrada - ya manejada por tween
    } else if (progress < 0.6) {
      // Fase de sostenimiento - mantener escala pico
      // Escala normal con ligero "flotar"
      const float = Math.sin(this.age * 0.01) * 0.05;
      const baseScale = this.config.scalePeak + float;
      this.textObj.setScale(baseScale);
    } else {
      // Fase de salida - fade out
      const exitProgress = (progress - 0.6) / 0.4;
      const alpha = 1.0 - exitProgress;
      this.textObj.setAlpha(Math.max(0, alpha));

      const scale =
        this.config.scalePeak +
        (this.config.scaleEnd - this.config.scalePeak) * exitProgress;
      this.textObj.setScale(scale);
    }

    // Terminar
    if (progress >= 1.0) {
      this.finished = true;
      this.destroy();
      return true;
    }

    return false;
  }

  /**
   * Destruye el texto y sus componentes
   */
  destroy() {
    if (this.textObj && this.textObj.active) {
      this.textObj.destroy();
      this.textObj = null;
    }

    if (this.criticalGlow && this.criticalGlow.active) {
      this.criticalGlow.destroy();
      this.criticalGlow = null;
    }

    this.finished = true;
  }
}

// Exportar
if (typeof module !== "undefined" && module.exports) {
  module.exports = FloatingText;
}
