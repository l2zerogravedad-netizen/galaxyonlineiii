/**
 * ============================================================
 * Squadron.js
 * Clase para manejar escuadrones de naves en la batalla.
 * Cada escuadron ocupa un slot fijo de la formacion y
 * contiene un numero de naves del mismo tipo.
 *
 * Galaxy Online 2 - Estilo Flash clasico
 * ============================================================
 */

class Squadron {
    /**
     * Crea una instancia de Squadron.
     * @param {Phaser.Scene} scene - La escena de Phaser
     * @param {Object} slot - Posicion { x, y } del slot en la formacion
     * @param {Object} config - Configuracion del escuadron
     *   @param {string} config.id - ID unico del escuadron
     *   @param {string} config.type - Tipo: 'frigate' | 'cruiser' | 'battleship'
     *   @param {number} config.count - Cantidad de naves en el escuadron
     *   @param {string} config.faction - Faccion: 'blue' (atacante) | 'red' (defensor)
     *   @param {string} config.commanderName - Nombre del comandante
     */
    constructor(scene, slot, config) {
        this.scene = scene;
        this.slot = slot;
        this.config = config;

        // --- Estado interno ---
        this.id = config.id;
        this.type = config.type || 'frigate';
        this.count = config.count || 100;
        this.maxCount = this.count;
        this.faction = config.faction || 'blue';
        this.commanderName = config.commanderName || 'Comandante';

        // Estado de vida
        this.alive = true;
        this.isHighlighted = false;
        this.isDestroyed = false;

        // Referencias a sprites
        this.sprite = null;
        this.countText = null;
        this.glowSprite = null;
        this.shadowSprite = null;

        // Animaciones
        this.shakeTween = null;
        this.flashTween = null;

        // Tipo de nave a textura
        this.textureKey = `ship-${this.type}-${this.faction}`;

        // Escala segun tipo de nave
        this.scaleMap = {
            frigate: 1.0,
            cruiser: 1.2,
            battleship: 1.4,
        };
        this.baseScale = this.scaleMap[this.type] || 1.0;
    }

    // ============================================================
    // CREACION
    // ============================================================

    /**
     * Crea todos los elementos visuales del escuadron en la escena.
     * @param {Phaser.GameObjects.Container} container - Contenedor padre (layer)
     */
    create(container) {
        if (this.isDestroyed) return;

        const x = this.slot.x;
        const y = this.slot.y;

        // 1. Sombra difusa debajo de la nave
        this.shadowSprite = this.scene.add.image(x + 4, y + 6, this.textureKey);
        this.shadowSprite.setTint(0x000000);
        this.shadowSprite.setAlpha(0.25);
        this.shadowSprite.setScale(this.baseScale);
        this.shadowSprite.setOrigin(0.5, 0.5);
        container.add(this.shadowSprite);

        // 2. Sprite principal de la nave
        this.sprite = this.scene.add.image(x, y, this.textureKey);
        this.sprite.setScale(this.baseScale);
        this.sprite.setOrigin(0.5, 0.5);
        this.sprite.setInteractive({ useHandCursor: true });
        container.add(this.sprite);

        // 3. Glow de seleccion (inicialmente invisible)
        const glowKey = this.faction === 'blue' ? 'glow-blue' : 'glow-red';
        this.glowSprite = this.scene.add.image(x, y + 4, glowKey);
        this.glowSprite.setScale(this.baseScale * 1.2);
        this.glowSprite.setAlpha(0);
        this.glowSprite.setOrigin(0.5, 0.5);
        container.add(this.glowSprite);

        // 4. Texto con la cantidad de naves
        this.countText = this.scene.add.text(x, y + 22, this.formatCount(), {
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center',
        });
        this.countText.setOrigin(0.5, 0.5);
        container.add(this.countText);

        // 5. Eventos de interaccion
        this.sprite.on('pointerover', () => this.onHover());
        this.sprite.on('pointerout', () => this.onHoverOut());

        // 6. Animacion de entrada (fade in + escala)
        this.sprite.setAlpha(0);
        this.shadowSprite.setAlpha(0);
        this.countText.setAlpha(0);

        this.scene.tweens.add({
            targets: [this.sprite, this.shadowSprite],
            alpha: { from: 0, to: 1 },
            scale: { from: 0.5, to: this.baseScale },
            duration: 400,
            ease: 'Back.easeOut',
            delay: Math.random() * 200,
        });

        this.scene.tweens.add({
            targets: this.countText,
            alpha: 1,
            duration: 300,
            delay: 200 + Math.random() * 200,
        });

        return this;
    }

    // ============================================================
    // HIGHLIGHT / SELECCION
    // ============================================================

    /**
     * Activa el resplandor dorado (escuadron activo/turno actual).
     */
    highlight() {
        if (this.isDestroyed || !this.alive) return;
        this.isHighlighted = true;

        // Cambiar a glow dorado de activo
        this.glowSprite.setTexture('glow-gold');

        this.scene.tweens.add({
            targets: this.glowSprite,
            alpha: 0.8,
            scale: this.baseScale * 1.4,
            duration: 300,
            ease: 'Sine.easeInOut',
        });

        // Pulse continuo
        this.highlightPulse = this.scene.tweens.add({
            targets: this.glowSprite,
            alpha: { from: 0.5, to: 0.9 },
            scale: { from: this.baseScale * 1.3, to: this.baseScale * 1.5 },
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    /**
     * Desactiva el resplandor de seleccion.
     */
    unhighlight() {
        this.isHighlighted = false;

        if (this.highlightPulse) {
            this.highlightPulse.stop();
            this.highlightPulse = null;
        }

        // Volver al glow de faccion
        const glowKey = this.faction === 'blue' ? 'glow-blue' : 'glow-red';
        this.glowSprite.setTexture(glowKey);

        this.scene.tweens.add({
            targets: this.glowSprite,
            alpha: 0,
            scale: this.baseScale * 1.2,
            duration: 200,
            ease: 'Sine.easeOut',
        });
    }

    // ============================================================
    // DANO
    // ============================================================

    /**
     * Aplica dano al escuadron.
     * @param {number} amount - Cantidad de naves destruidas
     */
    takeDamage(amount) {
        if (this.isDestroyed || !this.alive) return;

        this.count = Math.max(0, this.count - amount);

        // Actualizar texto
        this.countText.setText(this.formatCount());

        // Animacion de shake (vibracion)
        this.playShake();

        // Flash rojo de dano
        this.playDamageFlash();

        // Si llega a 0, destruir
        if (this.count <= 0) {
            this.count = 0;
            this.destroySquadron();
        }
    }

    /**
     * Reproduce la animacion de vibracion (shake).
     */
    playShake() {
        if (this.shakeTween && this.shakeTween.isPlaying()) {
            this.shakeTween.stop();
        }

        const originalX = this.slot.x;
        const originalY = this.slot.y;

        this.shakeTween = this.scene.tweens.add({
            targets: [this.sprite, this.shadowSprite, this.glowSprite],
            x: {
                from: originalX,
                to: originalX + Phaser.Math.Between(-6, 6),
            },
            y: {
                from: originalY,
                to: originalY + Phaser.Math.Between(-4, 4),
            },
            duration: 40,
            yoyo: true,
            repeat: 4,
            onComplete: () => {
                if (this.sprite && this.sprite.active) {
                    this.sprite.x = originalX;
                    this.sprite.y = originalY;
                }
                if (this.shadowSprite && this.shadowSprite.active) {
                    this.shadowSprite.x = originalX + 4;
                    this.shadowSprite.y = originalY + 6;
                }
                if (this.glowSprite && this.glowSprite.active) {
                    this.glowSprite.x = originalX;
                    this.glowSprite.y = originalY + 4;
                }
            },
        });
    }

    /**
     * Reproduce el flash rojo de dano.
     */
    playDamageFlash() {
        if (!this.sprite || !this.sprite.active) return;

        // Tint rojo
        this.sprite.setTint(0xff3333);

        this.scene.tweens.add({
            targets: this.sprite,
            tint: { from: 0xff3333, to: 0xffffff },
            duration: 300,
            ease: 'Sine.easeOut',
            onUpdate: (tween) => {
                // Interpolamos manualmente el tint
                const progress = tween.progress;
                const r = Math.floor(255 + (255 - 255) * progress);
                const g = Math.floor(51 + (255 - 51) * progress);
                const b = Math.floor(51 + (255 - 51) * progress);
                const color = (r << 16) | (g << 8) | b;
                this.sprite.setTint(color);
            },
            onComplete: () => {
                if (this.sprite && this.sprite.active) {
                    this.sprite.clearTint();
                }
            },
        });
    }

    // ============================================================
    // DESTRUCCION DEL ESCUADRON
    // ============================================================

    /**
     * Destruye el escuadron completamente (animacion de explosion).
     */
    destroySquadron() {
        if (this.isDestroyed) return;
        this.isDestroyed = true;
        this.alive = false;

        // Detener highlight si esta activo
        if (this.highlightPulse) {
            this.highlightPulse.stop();
        }

        // Crear explosion en la posicion
        this.createExplosionEffect();

        // Fade out de todos los elementos
        this.scene.tweens.add({
            targets: [this.sprite, this.shadowSprite, this.glowSprite, this.countText],
            alpha: 0,
            scale: '*=1.3',
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.cleanup();
            },
        });
    }

    /**
     * Crea el efecto de explosion.
     */
    createExplosionEffect() {
        const x = this.slot.x;
        const y = this.slot.y;

        // Sprite de explosion
        const explosion = this.scene.add.image(x, y, 'explosion-small');
        explosion.setScale(0.5);
        explosion.setAlpha(0.9);
        explosion.setDepth(100);

        // Animar explosion
        this.scene.tweens.add({
            targets: explosion,
            scale: { from: 0.5, to: 2.0 },
            alpha: { from: 0.9, to: 0 },
            duration: 600,
            ease: 'Power2',
            onComplete: () => {
                explosion.destroy();
            },
        });

        // Chispas de particulas
        const particleManager = this.scene.add.particles(x, y, 'particle-spark', {
            speed: { min: 50, max: 200 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 400,
            quantity: 12,
            emitting: false,
        });
        particleManager.explode(12);

        // Destruir el emisor despues de un momento
        this.scene.time.delayedCall(500, () => {
            particleManager.destroy();
        });
    }

    // ============================================================
    // DISPARO / ATAQUE
    // ============================================================

    /**
     * Ejecuta la accion de disparar hacia un objetivo.
     * @param {Squadron} target - Escuadron objetivo
     */
    fire(target) {
        if (this.isDestroyed || !this.alive) return;

        // Animacion de retroceso (recoil)
        this.playRecoil(target);

        // Crear proyectil
        this.createProjectile(target);
    }

    /**
     * Animacion de retroceso al disparar.
     * @param {Squadron} target - Objetivo (para direccion)
     */
    playRecoil(target) {
        if (!this.sprite || !this.sprite.active) return;

        const originalX = this.slot.x;
        const originalY = this.slot.y;

        // Direccion del retroceso (opuesta al objetivo)
        const dirX = originalX < target.slot.x ? -1 : 1;

        this.scene.tweens.add({
            targets: [this.sprite, this.shadowSprite],
            x: originalX + dirX * 8,
            duration: 80,
            yoyo: true,
            ease: 'Power2',
            onComplete: () => {
                if (this.sprite && this.sprite.active) {
                    this.sprite.x = originalX;
                }
                if (this.shadowSprite && this.shadowSprite.active) {
                    this.shadowSprite.x = originalX + 4;
                }
            },
        });
    }

    /**
     * Crea un proyectil que viaja hacia el objetivo.
     * @param {Squadron} target - Escuadron objetivo
     */
    createProjectile(target) {
        const startX = this.slot.x;
        const startY = this.slot.y;
        const endX = target.slot.x;
        const endY = target.slot.y;

        // Seleccionar tipo de proyectil segun tipo de nave
        let projKey = 'projectile-laser';
        if (this.type === 'cruiser') projKey = 'projectile-orb';
        if (this.type === 'battleship') projKey = 'projectile-missile';

        // Crear sprite de proyectil
        const projectile = this.scene.add.image(startX, startY, projKey);
        projectile.setDepth(50);

        // Rotar hacia el objetivo
        const angle = Phaser.Math.Angle.Between(startX, startY, endX, endY);
        projectile.setRotation(angle);

        // Calcular duracion basada en distancia (velocidad constante)
        const dist = Phaser.Math.Distance.Between(startX, startY, endX, endY);
        const speed = 500; // pixeles por segundo
        const duration = (dist / speed) * 1000;

        // Animar el proyectil
        this.scene.tweens.add({
            targets: projectile,
            x: endX,
            y: endY,
            duration: duration,
            ease: 'Linear',
            onComplete: () => {
                // Crear impacto
                this.createImpactEffect(endX, endY);
                projectile.destroy();

                // Aplicar dano al objetivo
                const damage = this.calculateDamage();
                target.takeDamage(damage);
            },
        });
    }

    /**
     * Crea el efecto visual de impacto.
     * @param {number} x - Posicion X
     * @param {number} y - Posicion Y
     */
    createImpactEffect(x, y) {
        const impact = this.scene.add.image(x, y, 'impact-flash');
        impact.setScale(0.5);
        impact.setAlpha(1);
        impact.setDepth(55);

        this.scene.tweens.add({
            targets: impact,
            scale: { from: 0.5, to: 1.5 },
            alpha: { from: 1, to: 0 },
            duration: 300,
            ease: 'Power2',
            onComplete: () => impact.destroy(),
        });
    }

    // ============================================================
    // UTILIDADES
    // ============================================================

    /**
     * Calcula el dano basado en el tipo de nave.
     * @returns {number} Dano a aplicar
     */
    calculateDamage() {
        const damageMap = {
            frigate: Phaser.Math.Between(50, 120),
            cruiser: Phaser.Math.Between(150, 300),
            battleship: Phaser.Math.Between(400, 800),
        };
        return damageMap[this.type] || 100;
    }

    /**
     * Formatea el contador de naves para mostrar.
     * @returns {string} Texto formateado
     */
    formatCount() {
        if (this.count >= 1000) {
            return (this.count / 1000).toFixed(1) + 'K';
        }
        return this.count.toString();
    }

    // ============================================================
    // EVENTOS DE INTERACCION
    // ============================================================

    /**
     * Evento: mouse sobre el escuadron.
     */
    onHover() {
        if (this.isDestroyed) return;

        this.scene.tweens.add({
            targets: this.sprite,
            scale: this.baseScale * 1.15,
            duration: 150,
            ease: 'Sine.easeOut',
        });

        // Mostrar glow de faccion
        if (!this.isHighlighted) {
            const glowKey = this.faction === 'blue' ? 'glow-blue' : 'glow-red';
            this.glowSprite.setTexture(glowKey);
            this.scene.tweens.add({
                targets: this.glowSprite,
                alpha: 0.4,
                duration: 150,
            });
        }
    }

    /**
     * Evento: mouse sale del escuadron.
     */
    onHoverOut() {
        if (this.isDestroyed) return;

        this.scene.tweens.add({
            targets: this.sprite,
            scale: this.baseScale,
            duration: 150,
            ease: 'Sine.easeOut',
        });

        // Ocultar glow si no esta highlighteado
        if (!this.isHighlighted) {
            this.scene.tweens.add({
                targets: this.glowSprite,
                alpha: 0,
                duration: 150,
            });
        }
    }

    // ============================================================
    // LIMPIEZA
    // ============================================================

    /**
     * Limpia todos los recursos del escuadron.
     */
    cleanup() {
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }
        if (this.shadowSprite) {
            this.shadowSprite.destroy();
            this.shadowSprite = null;
        }
        if (this.countText) {
            this.countText.destroy();
            this.countText = null;
        }
        if (this.glowSprite) {
            this.glowSprite.destroy();
            this.glowSprite = null;
        }
        if (this.shakeTween) {
            this.shakeTween.stop();
        }
        if (this.highlightPulse) {
            this.highlightPulse.stop();
        }
    }

    /**
     * Actualiza la posicion si el slot cambia.
     * @param {Object} newSlot - Nueva posicion { x, y }
     */
    updateSlot(newSlot) {
        this.slot = newSlot;
        if (this.sprite && this.sprite.active) {
            this.sprite.x = newSlot.x;
            this.sprite.y = newSlot.y;
        }
        if (this.shadowSprite && this.shadowSprite.active) {
            this.shadowSprite.x = newSlot.x + 4;
            this.shadowSprite.y = newSlot.y + 6;
        }
        if (this.glowSprite && this.glowSprite.active) {
            this.glowSprite.x = newSlot.x;
            this.glowSprite.y = newSlot.y + 4;
        }
        if (this.countText && this.countText.active) {
            this.countText.x = newSlot.x;
            this.countText.y = newSlot.y + 22;
        }
    }
}
