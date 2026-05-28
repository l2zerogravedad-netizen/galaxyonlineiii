/**
 * ============================================================
 * FleetManager.js — Manager de Flotas (Galaxy Online 2)
 * ============================================================
 *
 * Controla el spawn, visualización y gestión de escuadrones
 * en formaciones fijas. Cada escuadrón se coloca en su slot
 * predefinido según la formación activa.
 *
 * Características:
 *   • Spawn de escuadrones en slots fijos
 *   • Animación idle sutil (flotación 1-2 px)
 *   • Highlight dorado para escuadrón activo (turno)
 *   • Animación de destrucción
 *   • Contador de naves debajo de cada escuadrón
 * ============================================================
 */

class FleetManager {

  /**
   * @param {Phaser.Scene} scene
   * @param {string} formationKey — clave en FORMATIONS ('wedge', etc.)
   */
  constructor(scene, formationKey) {
    this.scene = scene;
    this.formationKey = formationKey;
    this.canvasWidth = scene.scale.width;
    this.canvasHeight = scene.scale.height;

    /** @type {Object<string, Squadron>} escuadrones por ID */
    this.squadrons = {};

    /** Contenedores por bando */
    this.containers = {
      left: scene.add.container(0, 0),
      right: scene.add.container(0, 0),
    };

    /** Tween de flotación idle por escuadrón */
    this.idleTweens = {};

    /** Escuadrón activo (turno actual) */
    this.activeSquadronId = null;
  }

  /**
   * Spawnea una flota completa en un bando.
   *
   * @param {string} side — 'left' (atacante) | 'right' (defensor)
   * @param {Array<SquadronData>} squadronsData
   *
   * SquadronData: {
   *   id: string,
   *   type: 'frigate' | 'cruiser' | 'battleship',
   *   count: number,
   *   commander?: string
   * }
   */
  spawnFleet(side, squadronsData) {
    const colorSide = side === 'left' ? 'blue' : 'red';

    squadronsData.forEach((data, index) => {
      const slot = getSlotPosition(
        this.formationKey, side, index,
        this.canvasWidth, this.canvasHeight
      );
      if (!slot) {
        console.warn(`[FleetManager] No hay slot ${index} para ${side}`);
        return;
      }

      this._createSquadron(side, colorSide, slot, data, index);
    });

    console.log(`[FleetManager] Flota ${side} spawneada: ${squadronsData.length} escuadrones`);
  }

  /**
   * Crea un escuadrón visual en el slot indicado.
   *
   * @private
   */
  _createSquadron(side, colorSide, slot, data, slotIndex) {
    const { scene } = this;
    const container = this.containers[side];

    // ── Generar textura del escuadrón ──
    const textureKey = ShipSprites.generateSquadronSprite(
      scene, data.type, colorSide, data.count
    );

    // ── Sprite del escuadrón ──
    const sprite = scene.add.image(0, 0, textureKey);
    sprite.setOrigin(0.5, 0.5);

    // Rotación: las naves apuntan hacia el enemigo
    if (side === 'left') {
      sprite.setAngle(0);   // atacante mira a la derecha
    } else {
      sprite.setAngle(180); // defensor mira a la izquierda
    }

    // ── Contador de naves (texto debajo) ──
    const countText = scene.add.text(0, sprite.height * 0.4, this._formatCount(data.count), {
      fontFamily: 'Arial, sans-serif',
      fontSize: data.count >= 10000 ? '10px' : data.count >= 1000 ? '11px' : '12px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5, 0).setAlpha(0.92);

    // ── Nombre del comandante (opcional, arriba) ──
    let nameText = null;
    if (data.commander) {
      nameText = scene.add.text(0, -sprite.height * 0.45, data.commander, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '9px',
        color: side === 'left' ? '#88ccff' : '#ff88aa',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center',
      }).setOrigin(0.5, 1).setAlpha(0.85);
    }

    // ── Contenedor individual del escuadrón ──
    const squadContainer = scene.add.container(slot.x, slot.y);
    squadContainer.add([sprite, countText]);
    if (nameText) squadContainer.add(nameText);

    // ── Efecto de glow dorado (inicialmente oculto) ──
    const glowGraphics = scene.add.graphics();
    glowGraphics.setVisible(false);
    squadContainer.addAt(glowGraphics, 0);

    // ── Guardar referencia ──
    const squadron = {
      id: data.id,
      side: side,
      type: data.type,
      count: data.count,
      slotIndex: slotIndex,
      x: slot.x,
      y: slot.y,
      z: slot.z,
      container: squadContainer,
      sprite: sprite,
      countText: countText,
      nameText: nameText,
      glowGraphics: glowGraphics,
      alive: true,
      maxCount: data.count,
    };

    this.squadrons[data.id] = squadron;

    // ── Animación idle sutil (flotación 1-2 px) ──
    this._startIdleAnimation(squadron);

    // ── Añadir al contenedor del bando ──
    container.add(squadContainer);
    container.setDepth(slot.z);

    // ── Escalado de entrada ──
    sprite.setScale(0.1);
    scene.tweens.add({
      targets: sprite,
      scale: 1,
      duration: 400,
      ease: 'Back.easeOut',
      delay: slotIndex * 80,
    });

    // ── Fade in del contador ──
    countText.setAlpha(0);
    scene.tweens.add({
      targets: countText,
      alpha: 0.92,
      duration: 300,
      delay: slotIndex * 80 + 200,
    });

    return squadron;
  }

  /**
   * Inicia la animación idle de flotación sutil.
   * @private
   */
  _startIdleAnimation(squadron) {
    const { scene } = this;

    // Offset aleatorio para que no floten todos al unísono
    const offset = Math.random() * Math.PI * 2;
    const speed = 1500 + Math.random() * 500; // 1.5-2s por ciclo
    const amplitude = 1 + Math.random() * 1.5; // 1-2.5 px

    const tween = scene.tweens.addCounter({
      from: 0,
      to: Math.PI * 2,
      duration: speed,
      repeat: -1,
      onUpdate: (t) => {
        if (!squadron.alive) return;
        const v = t.getValue();
        const dy = Math.sin(v + offset) * amplitude;
        squadron.sprite.y = dy;
        if (squadron.countText) squadron.countText.y = squadron.sprite.height * 0.4 + dy * 0.5;
        if (squadron.nameText) squadron.nameText.y = -squadron.sprite.height * 0.45 + dy * 0.3;
      },
    });

    this.idleTweens[squadron.id] = tween;
  }

  /**
   * Formatea el número de naves (ej: 5850 → "5.8K", 1700 → "1.7K").
   * @private
   */
  _formatCount(count) {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 10000) return (count / 1000).toFixed(1) + 'K';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  }

  /**
   * Obtiene un escuadrón por su ID.
   *
   * @param {string} id
   * @returns {Squadron|null}
   */
  getSquadron(id) {
    return this.squadrons[id] || null;
  }

  /**
   * Obtiene todos los escuadrones vivos de un bando.
   *
   * @param {string} side — 'left' | 'right'
   * @returns {Array<Squadron>}
   */
  getAliveSquadrons(side) {
    return Object.values(this.squadrons).filter(
      s => s.side === side && s.alive
    );
  }

  /**
   * Obtiene todos los escuadrones (vivos o no).
   *
   * @param {string} side — 'left' | 'right' | null (todos)
   * @returns {Array<Squadron>}
   */
  getAllSquadrons(side) {
    if (!side) return Object.values(this.squadrons);
    return Object.values(this.squadrons).filter(s => s.side === side);
  }

  /**
   * Devuelve el número de escuadrones vivos por bando.
   *
   * @param {string} side — 'left' | 'right'
   * @returns {number}
   */
  getAliveCount(side) {
    return this.getAliveSquadrons(side).length;
  }

  /**
   * Activa el highlight dorado alrededor del escuadrón (turno activo).
   *
   * @param {string} id — ID del escuadrón
   */
  highlightSquadron(id) {
    // Quitar highlight anterior
    if (this.activeSquadronId && this.activeSquadronId !== id) {
      this._removeHighlight(this.activeSquadronId);
    }

    const squadron = this.squadrons[id];
    if (!squadron || !squadron.alive) return;

    this.activeSquadronId = id;

    const { glowGraphics, sprite } = squadron;
    const w = sprite.width * 0.6;
    const h = sprite.height * 0.6;

    // Dibujar glow dorado pulsante
    glowGraphics.clear();
    glowGraphics.setVisible(true);

    // Halo exterior
    glowGraphics.lineStyle(2, 0xffd700, 0.6);
    glowGraphics.strokeEllipse(0, 0, w + 12, h + 12);

    // Halo interior
    glowGraphics.lineStyle(1.5, 0xffee88, 0.4);
    glowGraphics.strokeEllipse(0, 0, w + 6, h + 6);

    // Animación pulsante
    this.scene.tweens.add({
      targets: glowGraphics,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Escala sutil de "selección"
    this.scene.tweens.add({
      targets: sprite,
      scale: 1.08,
      duration: 300,
      ease: 'Sine.easeOut',
    });
  }

  /**
   * Quita el highlight de un escuadrón.
   * @private
   */
  _removeHighlight(id) {
    const squadron = this.squadrons[id];
    if (!squadron) return;

    squadron.glowGraphics.clear();
    squadron.glowGraphics.setVisible(false);
    this.scene.tweens.killTweensOf(squadron.glowGraphics);
    squadron.glowGraphics.setAlpha(1);

    this.scene.tweens.add({
      targets: squadron.sprite,
      scale: 1,
      duration: 200,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Quita el highlight del escuadrón activo.
   */
  clearHighlight() {
    if (this.activeSquadronId) {
      this._removeHighlight(this.activeSquadronId);
      this.activeSquadronId = null;
    }
  }

  /**
   * Actualiza el contador de naves de un escuadrón.
   *
   * @param {string} id
   * @param {number} newCount
   */
  updateCount(id, newCount) {
    const squadron = this.squadrons[id];
    if (!squadron) return;

    squadron.count = Math.max(0, newCount);
    squadron.countText.setText(this._formatCount(squadron.count));

    // Flash rojo si recibió daño
    if (newCount < squadron.count) {
      this.scene.tweens.add({
        targets: squadron.sprite,
        tint: 0xff4444,
        duration: 100,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          squadron.sprite.clearTint();
        },
      });
    }

    // Si llega a 0, destruir
    if (squadron.count <= 0) {
      this.destroySquadron(id);
    }
  }

  /**
   * Reduce el contador de naves (daño).
   *
   * @param {string} id
   * @param {number} damage
   */
  applyDamage(id, damage) {
    const squadron = this.squadrons[id];
    if (!squadron || !squadron.alive) return;

    const newCount = squadron.count - damage;
    this.updateCount(id, newCount);
  }

  /**
   * Destruye un escuadrón con animación.
   *
   * @param {string} id
   */
  destroySquadron(id) {
    const squadron = this.squadrons[id];
    if (!squadron || !squadron.alive) return;

    squadron.alive = false;

    // Detener idle
    if (this.idleTweens[id]) {
      this.idleTweens[id].stop();
      delete this.idleTweens[id];
    }

    // Si era el activo, limpiar highlight
    if (this.activeSquadronId === id) {
      this.activeSquadronId = null;
    }

    const { scene } = this;

    // ── Animación de destrucción ──
    // 1. Shake rápido
    scene.tweens.add({
      targets: squadron.container,
      x: squadron.x + (Math.random() - 0.5) * 10,
      y: squadron.y + (Math.random() - 0.5) * 10,
      duration: 50,
      repeat: 5,
      yoyo: true,
    });

    // 2. Flash blanco → rojo → desvanecer
    scene.tweens.add({
      targets: squadron.sprite,
      alpha: 0,
      scale: 1.3,
      duration: 600,
      delay: 200,
      ease: 'Power2',
      onStart: () => {
        squadron.sprite.setTint(0xff0000);
      },
    });

    // 3. Partículas de explosión (simuladas con graphics)
    this._createExplosionEffect(squadron.x, squadron.y, squadron.side);

    // 4. Limpiar después de la animación
    scene.time.delayedCall(900, () => {
      squadron.container.destroy();
      delete this.squadrons[id];
    });
  }

  /**
   * Crea un efecto de explosión visual.
   * @private
   */
  _createExplosionEffect(x, y, side) {
    const { scene } = this;
    const colors = side === 'left'
      ? [0x4488ff, 0x88ccff, 0xffffff, 0xffaa44]
      : [0xff6688, 0xffaa88, 0xffffff, 0xff6644];

    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i + Math.random() * 0.3;
      const speed = 40 + Math.random() * 80;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 2 + Math.random() * 4;

      const particle = scene.add.circle(x, y, size, color, 0.9);

      scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0.2,
        duration: 500 + Math.random() * 300,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }

    // Flash central
    const flash = scene.add.circle(x, y, 20, 0xffffff, 0.8);
    scene.tweens.add({
      targets: flash,
      scale: 3,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => flash.destroy(),
    });
  }

  /**
   * Mueve un escuadrón a otra posición (animación suave).
   * Útil para animaciones de ataque o reposicionamiento.
   *
   * @param {string} id
   * @param {number} targetX
   * @param {number} targetY
   * @param {number} duration — ms
   * @param {Function} onComplete
   */
  moveSquadron(id, targetX, targetY, duration = 500, onComplete) {
    const squadron = this.squadrons[id];
    if (!squadron || !squadron.alive) return;

    squadron.x = targetX;
    squadron.y = targetY;

    this.scene.tweens.add({
      targets: squadron.container,
      x: targetX,
      y: targetY,
      duration,
      ease: 'Cubic.easeInOut',
      onComplete,
    });
  }

  /**
   * Restaura la posición original de un escuadrón en su slot.
   *
   * @param {string} id
   * @param {number} duration — ms
   */
  returnToSlot(id, duration = 400) {
    const squadron = this.squadrons[id];
    if (!squadron || !squadron.alive) return;

    const slot = getSlotPosition(
      this.formationKey, squadron.side, squadron.slotIndex,
      this.canvasWidth, this.canvasHeight
    );
    if (!slot) return;

    this.moveSquadron(id, slot.x, slot.y, duration);
  }

  /**
   * Destruye todos los escuadrones y limpia recursos.
   */
  destroy() {
    // Detener todos los tweens
    Object.values(this.idleTweens).forEach(t => t.stop());
    this.idleTweens = {};

    // Destruir contenedores
    this.containers.left.destroy();
    this.containers.right.destroy();

    // Limpiar referencias
    this.squadrons = {};
    this.activeSquadronId = null;
  }
}

// ─── Export ──────────────────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FleetManager };
}
