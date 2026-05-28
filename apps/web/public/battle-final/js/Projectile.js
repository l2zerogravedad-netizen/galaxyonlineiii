/**
 * Projectile.js - Sistema de proyectiles para Galaxy Online 2
 *
 * Cuatro tipos de proyectiles basados en el sistema de armas de GO2:
 * - ballistic: Líneas amarillas/doradas rápidas, múltiples disparos
 * - laser: Rayo láser continuo (rojo o azul según tipo)
 * - missile: Misiles pequeños con trail de humo, curva leve
 * - orb: Orbe de energía grande, lento, impacto masivo
 *
 * Todos los proyectiles se mueven con interpolación suave y generan
 * un efecto de impacto al llegar al destino.
 */

class Projectile {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} startX - Posición inicial X
   * @param {number} startY - Posición inicial Y
   * @param {number} targetX - Posición objetivo X
   * @param {number} targetY - Posición objetivo Y
   * @param {string} type - 'ballistic' | 'laser' | 'missile' | 'orb'
   * @param {object} damageData - { damage, isCritical, isMiss }
   * @param {number} travelTime - Tiempo de viaje en ms
   */
  constructor(scene, startX, startY, targetX, targetY, type, damageData, travelTime) {
    this.scene = scene;
    this.startX = startX;
    this.startY = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.type = type;
    this.damageData = damageData;
    this.travelTime = travelTime;

    // Progreso del viaje (0 a 1)
    this.progress = 0;
    this.elapsed = 0;

    // Estado
    this.arrived = false;
    this.destroyed = false;

    // Callback de impacto
    this.onImpact = null;

    // Grupo de contenedores para este proyectil
    this.containers = [];
    this.graphics = [];
    this.tweens = [];

    // Crear el proyectil según su tipo
    this._createByType();
  }

  /**
   * Crea la representación visual según el tipo
   */
  _createByType() {
    switch (this.type) {
      case "laser":
        this._createLaser();
        break;
      case "missile":
        this._createMissile();
        break;
      case "orb":
        this._createOrb();
        break;
      case "ballistic":
      default:
        this._createBallistic();
        break;
    }
  }

  /**
   * Proyectil BALLISTIC - Líneas amarillas/doradas rápidas
   * Múltiples líneas finas que viajan rápido en línea recta
   */
  _createBallistic() {
    const count = 3; // Múltiples disparos

    for (let i = 0; i < count; i++) {
      // Offset aleatorio para dispersión
      const offsetX = (Math.random() - 0.5) * 20;
      const offsetY = (Math.random() - 0.5) * 15;

      const line = this.scene.add.line(
        this.startX + offsetX,
        this.startY + offsetY,
        0,
        0,
        20,
        0,
        0xffdd44,
        0.9
      );
      line.setLineWidth(2);
      line.setOrigin(0, 0.5);

      // Ángulo hacia el objetivo
      const angle = Phaser.Math.Angle.Between(
        this.startX + offsetX,
        this.startY + offsetY,
        this.targetX,
        this.targetY
      );
      line.setRotation(angle);

      this.containers.push({
        sprite: line,
        offsetX: offsetX,
        offsetY: offsetY,
        delay: i * 40, // Disparos escalonados
        started: false,
      });
    }

    // Trail detrás de cada proyectil
    this._ballisticTrails = [];
  }

  /**
   * Proyectil LASER - Rayo láser continuo
   * Línea brillante que se extiende instantáneamente y persiste brevemente
   */
  _createLaser() {
    // Color según el tipo (rojo para ataque normal, azul para algunos)
    const isRed = Math.random() > 0.3;
    const color = isRed ? 0xff3333 : 0x3388ff;
    const glowColor = isRed ? 0xff6666 : 0x66aaff;

    // Láser principal - línea gruesa
    this.laserLine = this.scene.add.line(
      this.startX,
      this.startY,
      0,
      0,
      this.targetX - this.startX,
      this.targetY - this.startY,
      color,
      1.0
    );
    this.laserLine.setLineWidth(4);
    this.laserLine.setOrigin(0, 0.5);

    // Glow exterior (línea más ancha con menor alpha)
    this.laserGlow = this.scene.add.line(
      this.startX,
      this.startY,
      0,
      0,
      this.targetX - this.startX,
      this.targetY - this.startY,
      glowColor,
      0.4
    );
    this.laserGlow.setLineWidth(10);
    this.laserGlow.setOrigin(0, 0.5);

    // Animación de "disparo" - se extiende rápido
    this.laserLine.setScale(0, 1);
    this.laserGlow.setScale(0, 1);

    const tween = this.scene.tweens.add({
      targets: [this.laserLine, this.laserGlow],
      scaleX: 1,
      duration: 100,
      ease: "Power2",
    });
    this.tweens.push(tween);

    // Parpadear al final
    this.scene.time.delayedCall(this.travelTime - 100, () => {
      const fadeTween = this.scene.tweens.add({
        targets: [this.laserLine, this.laserGlow],
        alpha: 0,
        duration: 100,
        ease: "Power2",
      });
      this.tweens.push(fadeTween);
    });

    this.containers.push(
      { sprite: this.laserGlow },
      { sprite: this.laserLine }
    );
  }

  /**
   * Proyectil MISSILE - Misil con trail de humo
   * Sprite pequeño que sigue una curva leve hacia el objetivo
   */
  _createMissile() {
    // Sprite del misil (triángulo/cuerpo)
    this.missileBody = this.scene.add.triangle(
      this.startX,
      this.startY,
      0, -6,
      4, 4,
      -4, 4,
      0xcc4444,
      1.0
    );

    // Cabeza del misil (punta brillante)
    this.missileHead = this.scene.add.triangle(
      this.startX,
      this.startY,
      0, -8,
      2, 2,
      -2, 2,
      0xffaa44,
      1.0
    );

    // Trail de humo (array de partículas simples)
    this.smokeTrail = [];
    this.smokeTimer = 0;

    // Rotar hacia el objetivo
    const angle = Phaser.Math.Angle.Between(
      this.startX,
      this.startY,
      this.targetX,
      this.targetY
    );
    this.missileBody.setRotation(angle + Math.PI / 2);
    this.missileHead.setRotation(angle + Math.PI / 2);

    this.containers.push(
      { sprite: this.missileBody },
      { sprite: this.missileHead }
    );
  }

  /**
   * Proyectil ORB - Orbe de energía grande
   * Esfera brillante que viaja lento, con pulso y aura
   */
  _createOrb() {
    // Aura exterior (círculo grande semitransparente)
    this.orbAura = this.scene.add.circle(
      this.startX,
      this.startY,
      25,
      0x8844ff,
      0.3
    );

    // Orbe principal (círculo brillante)
    this.orbBody = this.scene.add.circle(
      this.startX,
      this.startY,
      15,
      0xaa66ff,
      0.9
    );

    // Núcleo brillante
    this.orbCore = this.scene.add.circle(
      this.startX,
      this.startY,
      8,
      0xffffff,
      1.0
    );

    // Animación de pulso
    const pulseTween = this.scene.tweens.add({
      targets: this.orbAura,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: { from: 0.3, to: 0.1 },
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.tweens.push(pulseTween);

    // Brillo del núcleo
    const glowTween = this.scene.tweens.add({
      targets: this.orbCore,
      alpha: { from: 1.0, to: 0.6 },
      duration: 200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.tweens.push(glowTween);

    this.containers.push(
      { sprite: this.orbAura },
      { sprite: this.orbBody },
      { sprite: this.orbCore }
    );
  }

  /**
   * Actualiza la posición del proyectil
   * @param {number} dt - Delta time en ms
   * @returns {boolean} true si llegó al destino
   */
  update(dt) {
    if (this.arrived || this.destroyed) return true;

    this.elapsed += dt;
    this.progress = Math.min(this.elapsed / this.travelTime, 1.0);

    // Easing según tipo
    const easedProgress = this._getEasedProgress();

    // Posición actual interpolada
    const currentX = this.startX + (this.targetX - this.startX) * easedProgress;
    const currentY = this.startY + (this.targetY - this.startY) * easedProgress;

    switch (this.type) {
      case "ballistic":
        this._updateBallistic(easedProgress);
        break;
      case "laser":
        this._updateLaser();
        break;
      case "missile":
        this._updateMissile(dt, currentX, currentY, easedProgress);
        break;
      case "orb":
        this._updateOrb(currentX, currentY);
        break;
    }

    // Verificar si llegó
    if (this.progress >= 1.0) {
      this._arrive();
      return true;
    }

    return false;
  }

  /**
   * Easing personalizado según tipo de proyectil
   */
  _getEasedProgress() {
    switch (this.type) {
      case "ballistic":
        // Velocidad casi constante, ligera aceleración
        return this.progress * this.progress * (3 - 2 * this.progress);
      case "laser":
        // Instántaneo - ya se mostró con tween
        return this.progress;
      case "missile":
        // Aceleración progresiva
        return this.progress * this.progress;
      case "orb":
        // Lento y constante
        return this.progress;
      default:
        return this.progress;
    }
  }

  /**
   * Actualiza proyectiles balísticos
   */
  _updateBallistic(progress) {
    this.containers.forEach((container, i) => {
      if (!container.sprite || container.sprite.active === false) return;

      // Cada disparo tiene su delay
      const delay = container.delay || 0;
      const adjustedProgress = Math.max(0, (this.elapsed - delay) / (this.travelTime - delay));

      if (adjustedProgress <= 0) return;

      const eased = Math.min(adjustedProgress, 1.0);

      // Lerp con curva para dar sensación de velocidad
      const fastProgress = eased * eased * (3 - 2 * eased);

      const x =
        this.startX +
        container.offsetX +
        (this.targetX - this.startX) * fastProgress;
      const y =
        this.startY +
        container.offsetY +
        (this.targetY - this.startY) * fastProgress;

      container.sprite.setPosition(x, y);

      // Actualizar longitud de la línea según progreso
      const totalDist = Phaser.Math.Distance.Between(
        this.startX,
        this.startY,
        this.targetX,
        this.targetY
      );
      const currentDist = totalDist * Math.min(fastProgress * 1.5, 1.0);
      container.sprite.setTo(0, 0, Math.max(currentDist, 5), 0);

      // Fade out al final
      if (fastProgress > 0.8) {
        container.sprite.setAlpha(1.0 - (fastProgress - 0.8) * 5);
      }
    });
  }

  /**
   * El láser se actualiza por tweens, no necesita update de posición
   */
  _updateLaser() {
    // El láser ya está en posición, los tweens manejan la animación
  }

  /**
   * Actualiza el misil con curva y trail de humo
   */
  _updateMissile(dt, currentX, currentY, progress) {
    if (!this.missileBody || !this.missileHead) return;

    // Curva senoidal leve para dar efecto de guiado
    const curveOffset = Math.sin(progress * Math.PI * 3) * 15 * (1 - progress);

    // Perpendicular al vector de movimiento
    const angle = Phaser.Math.Angle.Between(
      this.startX,
      this.startY,
      this.targetX,
      this.targetY
    );
    const perpX = -Math.sin(angle) * curveOffset;
    const perpY = Math.cos(angle) * curveOffset;

    const finalX = currentX + perpX;
    const finalY = currentY + perpY;

    this.missileBody.setPosition(finalX, finalY);
    this.missileHead.setPosition(finalX, finalY);

    // Rotar hacia la dirección de movimiento
    const moveAngle = Phaser.Math.Angle.Between(
      this.missileBody.x,
      this.missileBody.y,
      finalX + (finalX - this.missileBody.x) * 10,
      finalY + (finalY - this.missileBody.y) * 10
    );
    this.missileBody.setRotation(moveAngle + Math.PI / 2);
    this.missileHead.setRotation(moveAngle + Math.PI / 2);

    // Trail de humo
    this.smokeTimer += dt;
    if (this.smokeTimer > 40) {
      this.smokeTimer = 0;
      this._addSmokeParticle(finalX, finalY);
    }

    // Limpiar humo viejo
    this._updateSmoke(dt);
  }

  /**
   * Añade una partícula de humo
   */
  _addSmokeParticle(x, y) {
    const smoke = this.scene.add.circle(
      x + (Math.random() - 0.5) * 6,
      y + (Math.random() - 0.5) * 6,
      3 + Math.random() * 4,
      0x888888,
      0.5
    );

    this.smokeTrail.push({
      sprite: smoke,
      age: 0,
      maxAge: 300 + Math.random() * 200,
    });
  }

  /**
   * Actualiza las partículas de humo
   */
  _updateSmoke(dt) {
    for (let i = this.smokeTrail.length - 1; i >= 0; i--) {
      const smoke = this.smokeTrail[i];
      smoke.age += dt;

      const lifeRatio = smoke.age / smoke.maxAge;

      if (lifeRatio >= 1) {
        smoke.sprite.destroy();
        this.smokeTrail.splice(i, 1);
        continue;
      }

      smoke.sprite.setAlpha(0.5 * (1 - lifeRatio));
      smoke.sprite.setScale(1 + lifeRatio * 2);
    }
  }

  /**
   * Actualiza el orbe de energía
   */
  _updateOrb(x, y) {
    if (this.orbAura) this.orbAura.setPosition(x, y);
    if (this.orbBody) this.orbBody.setPosition(x, y);
    if (this.orbCore) this.orbCore.setPosition(x, y);
  }

  /**
   * Llamado cuando el proyectil llega al destino
   */
  _arrive() {
    if (this.arrived) return;
    this.arrived = true;

    // Crear efecto de impacto según tipo
    this._createImpactEffect();

    // Callback
    if (this.onImpact) {
      this.onImpact();
    }

    // Destruir el proyectil con un pequeño delay para que se vea el impacto
    this.scene.time.delayedCall(50, () => {
      this.destroy();
    });
  }

  /**
   * Crea el efecto de impacto según el tipo de proyectil
   */
  _createImpactEffect() {
    const x = this.targetX;
    const y = this.targetY;

    switch (this.type) {
      case "ballistic":
        this._impactBallistic(x, y);
        break;
      case "laser":
        this._impactLaser(x, y);
        break;
      case "missile":
        this._impactMissile(x, y);
        break;
      case "orb":
        this._impactOrb(x, y);
        break;
    }
  }

  /**
   * Impacto balístico - chispas pequeñas
   */
  _impactBallistic(x, y) {
    // Flash pequeño
    const flash = this.scene.add.circle(x, y, 8, 0xffdd44, 0.9);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 150,
      ease: "Power2",
      onComplete: () => flash.destroy(),
    });

    // Partículas de chispa
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const spark = this.scene.add.line(
        x,
        y,
        0,
        0,
        Math.cos(angle) * 10,
        Math.sin(angle) * 10,
        0xffdd44,
        0.8
      );
      spark.setLineWidth(1.5);
      spark.setOrigin(0, 0.5);

      this.scene.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * 20,
        y: y + Math.sin(angle) * 20,
        alpha: 0,
        duration: 150,
        ease: "Power2",
        onComplete: () => spark.destroy(),
      });
    }
  }

  /**
   * Impacto láser - quemadura brillante
   */
  _impactLaser(x, y) {
    // Flash intenso
    const flash = this.scene.add.circle(x, y, 20, 0xffffff, 1.0);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 3,
      scaleY: 3,
      duration: 200,
      ease: "Power2",
      onComplete: () => flash.destroy(),
    });

    // Resplandor persistente
    const glow = this.scene.add.circle(x, y, 25, 0xff3333, 0.5);
    this.scene.tweens.add({
      targets: glow,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 300,
      ease: "Power2",
      onComplete: () => glow.destroy(),
    });
  }

  /**
   * Impacto de misil - explosión con humo
   */
  _impactMissile(x, y) {
    // Explosión principal
    const explosion = this.scene.add.circle(x, y, 15, 0xff4400, 0.9);
    this.scene.tweens.add({
      targets: explosion,
      radius: 50,
      alpha: 0,
      duration: 300,
      ease: "Power2",
      onComplete: () => explosion.destroy(),
    });

    // Anillo de onda expansiva
    const shockwave = this.scene.add.circle(x, y, 10, 0xffaa44, 0.6);
    shockwave.setStrokeStyle(2, 0xffaa44);
    shockwave.setFillStyle();
    this.scene.tweens.add({
      targets: shockwave,
      radius: 60,
      alpha: 0,
      duration: 400,
      ease: "Power2",
      onComplete: () => shockwave.destroy(),
    });

    // Chispas múltiples
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 15 + Math.random() * 25;
      const spark = this.scene.add.circle(x, y, 2, 0xffaa33, 1.0);

      this.scene.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 250 + Math.random() * 150,
        ease: "Power2",
        onComplete: () => spark.destroy(),
      });
    }

    // Humo residual
    for (let i = 0; i < 3; i++) {
      this.scene.time.delayedCall(i * 50, () => {
        const smoke = this.scene.add.circle(
          x + (Math.random() - 0.5) * 20,
          y + (Math.random() - 0.5) * 20,
          5 + Math.random() * 8,
          0x555555,
          0.4
        );
        this.scene.tweens.add({
          targets: smoke,
          y: smoke.y - 20,
          alpha: 0,
          scaleX: 2,
          scaleY: 2,
          duration: 500,
          ease: "Power2",
          onComplete: () => smoke.destroy(),
        });
      });
    }
  }

  /**
   * Impacto de orbe - explosión masiva de energía
   */
  _impactOrb(x, y) {
    // Flash blanco masivo
    const flash = this.scene.add.circle(x, y, 40, 0xffffff, 1.0);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 4,
      scaleY: 4,
      duration: 400,
      ease: "Power2",
      onComplete: () => flash.destroy(),
    });

    // Onda de energía expansiva
    const energyRing = this.scene.add.circle(x, y, 20, 0xaa66ff, 0.7);
    this.scene.tweens.add({
      targets: energyRing,
      radius: 80,
      alpha: 0,
      duration: 500,
      ease: "Power2",
      onComplete: () => energyRing.destroy(),
    });

    // Segunda onda
    const energyRing2 = this.scene.add.circle(x, y, 15, 0x8844ff, 0.5);
    this.scene.time.delayedCall(100, () => {
      this.scene.tweens.add({
        targets: energyRing2,
        radius: 100,
        alpha: 0,
        duration: 600,
        ease: "Power2",
        onComplete: () => energyRing2.destroy(),
      });
    });

    // Rayos de energía
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const ray = this.scene.add.line(
        x,
        y,
        0,
        0,
        Math.cos(angle) * 20,
        Math.sin(angle) * 20,
        0xcc88ff,
        0.9
      );
      ray.setLineWidth(3);
      ray.setOrigin(0, 0.5);

      this.scene.tweens.add({
        targets: ray,
        x: x + Math.cos(angle) * 40,
        y: y + Math.sin(angle) * 40,
        alpha: 0,
        scaleX: 2,
        duration: 300,
        ease: "Power2",
        onComplete: () => ray.destroy(),
      });
    }

    // Shake de cámara fuerte
    this.scene.cameras.main.shake(300, 0.015);
  }

  /**
   * Destruye el proyectil y todos sus componentes
   */
  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;

    // Detener tweens
    this.tweens.forEach((t) => {
      if (t && t.stop) t.stop();
    });

    // Destruir sprites
    this.containers.forEach((container) => {
      if (container.sprite && container.sprite.active) {
        container.sprite.destroy();
      }
    });
    this.containers = [];

    // Destruir humo
    this.smokeTrail.forEach((s) => {
      if (s.sprite && s.sprite.active) s.sprite.destroy();
    });
    this.smokeTrail = [];

    // Destruir gráficos
    this.graphics.forEach((g) => {
      if (g && g.active) g.destroy();
    });
    this.graphics = [];
  }
}

// Exportar
if (typeof module !== "undefined" && module.exports) {
  module.exports = Projectile;
}
