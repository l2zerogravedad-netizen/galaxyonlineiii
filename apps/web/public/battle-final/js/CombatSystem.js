/**
 * CombatSystem.js - Sistema de combate por turnos para Galaxy Online 2
 *
 * Maquina de estados que controla el flujo completo de una batalla:
 * HIGHLIGHT -> FIRING -> TRAVELING -> HITTING -> COOLDOWN -> siguiente turno
 *
 * Basado en el sistema de rondas de GO2 donde cada escuadron ataca
 * en orden de Speed (mayor primero), con proyectiles visibles y
 * dano flotante estilo clasico Flash.
 *
 * Compatible con Squadron.js existente.
 */

class CombatSystem {
  /**
   * @param {Phaser.Scene} scene - Escena de Phaser 3
   * @param {Array} leftSquadrons - Escuadrones del jugador (izquierda)
   * @param {Array} rightSquadrons - Escuadrones del enemigo (derecha)
   * @param {Object} options - Opciones adicionales
   */
  constructor(scene, leftSquadrons, rightSquadrons, options = {}) {
    this.scene = scene;

    // Filtrar escuadrones validos y vivos
    this.leftSquadrons = leftSquadrons.filter(
      (s) => s && s.alive !== false && !s.isDestroyed
    );
    this.rightSquadrons = rightSquadrons.filter(
      (s) => s && s.alive !== false && !s.isDestroyed
    );

    // Opciones
    this.options = Object.assign(
      {
        autoStart: true,
        showDebugLogs: true,
      },
      options
    );

    // Ordenar TODOS los escuadrones por Speed
    this.allSquadrons = [];
    this._buildTurnOrder();

    this.currentIndex = 0;
    this.round = 1;

    // Estados: IDLE -> HIGHLIGHT -> FIRING -> TRAVELING -> HITTING -> COOLDOWN
    this.state = "IDLE";
    this.stateTimer = 0;

    // Proyectiles activos
    this.projectiles = [];

    // Textos flotantes activos
    this.floatingTexts = [];

    // Banner de ronda
    this.roundBanner = new RoundBanner(scene);

    // Escuadron actualmente activo
    this.currentAttacker = null;
    this.currentTarget = null;
    this.pendingDamage = null;

    // Callbacks opcionales
    this.onBattleEnd = null;
    this.onTurnChange = null;
    this.onRoundStart = null;
    this.onStateChange = null;

    // Contadores de estadisticas
    this.stats = {
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      criticalHits: 0,
      normalHits: 0,
      misses: 0,
      squadronsDestroyed: 0,
      roundsPlayed: 0,
    };

    // Tiempos por estado (ms) - Ritmo GO2 exacto
    this.TIMINGS = {
      HIGHLIGHT: 400,
      FIRING: 100,
      LASER_TRAVEL: 350,
      MISSILE_TRAVEL: 550,
      ORB_TRAVEL: 750,
      BALLISTIC_TRAVEL: 300,
      HITTING: 250,
      COOLDOWN: 600,
      ROUND_START: 1200,
      IDLE: 300,
    };

    // Color de glow para escuadron activo
    this.GLOW_COLOR = 0xffd700;

    // Graphics para anillo de seleccion
    this._selectionGraphics = null;
  }

  // ============================================================
  // INICIALIZACION
  // ============================================================

  /**
   * Obtiene la speed de un escuadron (del config o default)
   */
  _getSpeed(squadron) {
    // Del config si existe
    if (squadron.config && squadron.config.speed) {
      return squadron.config.speed;
    }
    // Basado en tipo de nave
    const speedMap = {
      frigate: 120,
      cruiser: 80,
      battleship: 50,
    };
    return speedMap[squadron.type] || 100;
  }

  /**
   * Obtiene el weaponType basado en el tipo de nave
   */
  _getWeaponType(squadron) {
    const weaponMap = {
      frigate: "ballistic",
      cruiser: "laser",
      battleship: "missile",
    };

    // Del config si existe
    if (squadron.config && squadron.config.weaponType) {
      return squadron.config.weaponType;
    }

    return weaponMap[squadron.type] || "ballistic";
  }

  /**
   * Obtiene el power de un escuadron
   */
  _getPower(squadron) {
    if (squadron.config && squadron.config.power) {
      return squadron.config.power;
    }
    // Basado en tipo y count
    const powerMap = { frigate: 80, cruiser: 150, battleship: 250 };
    const base = powerMap[squadron.type] || 100;
    return base * (squadron.count / 100);
  }

  /**
   * Obtiene la defensa de un escuadron
   */
  _getDefense(squadron) {
    if (squadron.config && squadron.config.defense) {
      return squadron.config.defense;
    }
    const defMap = { frigate: 30, cruiser: 80, battleship: 150 };
    return defMap[squadron.type] || 50;
  }

  /**
   * Obtiene el armor de un escuadron
   */
  _getArmor(squadron) {
    if (squadron.config && squadron.config.armor) {
      return squadron.config.armor;
    }
    const armorMap = { frigate: 20, cruiser: 60, battleship: 120 };
    return armorMap[squadron.type] || 40;
  }

  /**
   * Obtiene el tech de un escuadron
   */
  _getTech(squadron) {
    if (squadron.config && squadron.config.tech) {
      return squadron.config.tech;
    }
    return 50;
  }

  /**
   * Construye el orden de turnos combinando ambos lados y ordenando por Speed
   */
  _buildTurnOrder() {
    const all = [];

    this.leftSquadrons.forEach((sq, i) => {
      if (sq && sq.alive !== false && !sq.isDestroyed) {
        all.push({
          squadron: sq,
          side: "left",
          index: i,
          speed: this._getSpeed(sq),
        });
      }
    });

    this.rightSquadrons.forEach((sq, i) => {
      if (sq && sq.alive !== false && !sq.isDestroyed) {
        all.push({
          squadron: sq,
          side: "right",
          index: i,
          speed: this._getSpeed(sq),
        });
      }
    });

    // Ordenar por Speed descendente (mayor primero) - asi funciona GO2
    all.sort((a, b) => b.speed - a.speed);

    // Asignar numeros de turno como en imagen 34 (1, 2, 3...)
    this.allSquadrons = all.map((item, idx) => {
      item.turnOrder = idx + 1;
      return item;
    });

    if (this.options.showDebugLogs) {
      console.log(
        "[Combat] Orden de turnos:",
        this.allSquadrons.map(
          (s) => `T${s.turnOrder} ${s.side}[${s.index}] spd=${s.speed} ${s.squadron.type}`
        )
      );
    }
  }

  /**
   * Inicializa el sistema y comienza la batalla
   */
  init() {
    // Iniciar con el banner de Ronda 1
    this._transitionTo("ROUND_START");
    this.roundBanner.show(this.round);
    this.stateTimer = this.TIMINGS.ROUND_START;

    if (this.onRoundStart) {
      this.onRoundStart(this.round);
    }

    if (this.options.showDebugLogs) {
      console.log(`[Combat] Batalla iniciada - Ronda ${this.round}`);
    }
  }

  // ============================================================
  // UPDATE PRINCIPAL
  // ============================================================

  /**
   * Update principal - llamar desde el update() de la escena de Phaser
   * @param {number} dt - Delta time en milisegundos
   */
  update(dt) {
    // Actualizar proyectiles
    this._updateProjectiles(dt);

    // Actualizar textos flotantes
    this._updateFloatingTexts(dt);

    // Maquina de estados
    if (this.state !== "IDLE" && this.state !== "BATTLE_END") {
      this.stateTimer -= dt;

      if (this.stateTimer <= 0) {
        this._handleStateTransition();
      }
    }
  }

  // ============================================================
  // MAQUINA DE ESTADOS
  // ============================================================

  _handleStateTransition() {
    const oldState = this.state;

    switch (this.state) {
      case "ROUND_START":
        this.roundBanner.hide();
        this._startNextTurn();
        break;

      case "HIGHLIGHT":
        this._transitionTo("FIRING");
        this._doFire();
        break;

      case "FIRING":
        this._transitionTo("TRAVELING");
        break;

      case "TRAVELING":
        // Si no hay proyectiles activos, pasar a HITTING
        if (this.projectiles.length === 0) {
          this._transitionTo("HITTING");
          this._doHit();
        }
        // Si hay, esperar a que lleguen (se maneja en _updateProjectiles)
        break;

      case "HITTING":
        this._transitionTo("COOLDOWN");
        this._clearAttackerGlow();
        break;

      case "COOLDOWN":
        this._advanceTurn();
        break;

      case "IDLE":
        this._startNextTurn();
        break;

      default:
        break;
    }

    if (this.onStateChange) {
      this.onStateChange(oldState, this.state);
    }
  }

  _transitionTo(newState) {
    this.state = newState;

    switch (newState) {
      case "HIGHLIGHT":
        this.stateTimer = this.TIMINGS.HIGHLIGHT;
        break;
      case "FIRING":
        this.stateTimer = this.TIMINGS.FIRING;
        break;
      case "TRAVELING":
        this.stateTimer = this._getTravelTime() + 100; // Buffer
        break;
      case "HITTING":
        this.stateTimer = this.TIMINGS.HITTING;
        break;
      case "COOLDOWN":
        this.stateTimer = this.TIMINGS.COOLDOWN;
        break;
      case "ROUND_START":
        this.stateTimer = this.TIMINGS.ROUND_START;
        break;
      case "IDLE":
        this.stateTimer = this.TIMINGS.IDLE;
        break;
    }
  }

  // ============================================================
  // TURNOS
  // ============================================================

  _getTravelTime() {
    if (!this.currentAttacker) return 400;
    const weaponType = this._getWeaponType(this.currentAttacker);
    switch (weaponType) {
      case "laser":
      case "directional":
        return this.TIMINGS.LASER_TRAVEL;
      case "missile":
        return this.TIMINGS.MISSILE_TRAVEL;
      case "orb":
      case "shipBased":
        return this.TIMINGS.ORB_TRAVEL;
      case "ballistic":
      default:
        return this.TIMINGS.BALLISTIC_TRAVEL;
    }
  }

  _getProjectileType() {
    if (!this.currentAttacker) return "ballistic";
    return this._getWeaponType(this.currentAttacker);
  }

  _startNextTurn() {
    // Verificar si la batalla termino
    if (this.isBattleOver()) {
      this._endBattle();
      return;
    }

    // Encontrar el siguiente escuadron vivo
    let found = false;
    let attempts = 0;

    while (attempts < this.allSquadrons.length && !found) {
      if (this.currentIndex >= this.allSquadrons.length) {
        // Fin de ronda
        this._startNewRound();
        return;
      }

      const item = this.allSquadrons[this.currentIndex];

      if (
        item &&
        item.squadron &&
        item.squadron.alive !== false &&
        !item.squadron.isDestroyed
      ) {
        this.currentAttacker = item.squadron;
        this.currentAttackerSide = item.side;
        found = true;
      } else {
        this.currentIndex++;
      }
      attempts++;
    }

    if (!found) {
      this._startNewRound();
      return;
    }

    // Encontrar objetivo
    this.currentTarget = this._findTarget(
      this.currentAttacker,
      this.currentAttackerSide
    );

    if (!this.currentTarget) {
      // No hay objetivo - pasar al siguiente
      this.currentIndex++;
      this._startNextTurn();
      return;
    }

    // Notificar cambio de turno
    if (this.onTurnChange) {
      this.onTurnChange(
        this.currentAttacker,
        this.currentTarget,
        this.currentIndex + 1,
        this.round
      );
    }

    if (this.options.showDebugLogs) {
      console.log(
        `[Combat] Turno ${this.currentIndex + 1} (R${this.round}): ${
          this.currentAttackerSide
        } ${this.currentAttacker.type} ataca -> ${this.currentTarget.type}`
      );
    }

    // HIGHLIGHT - Escuadron brilla
    this._transitionTo("HIGHLIGHT");
    this._highlightAttacker(this.currentAttacker);
  }

  // ============================================================
  // HIGHLIGHT / GLOW
  // ============================================================

  _highlightAttacker(squadron) {
    if (!squadron) return;

    // Usar el metodo highlight() del Squadron si existe
    if (squadron.highlight) {
      squadron.highlight();
    }

    // Animacion de scale adicional
    if (squadron.sprite && squadron.sprite.active) {
      this.scene.tweens.add({
        targets: squadron.sprite,
        scaleX: (squadron.baseScale || 1) * 1.1,
        scaleY: (squadron.baseScale || 1) * 1.1,
        duration: 150,
        yoyo: true,
        repeat: 1,
        ease: "Sine.easeInOut",
      });
    }

    // Dibujar anillo de seleccion
    this._drawSelectionRing(squadron);
  }

  _drawSelectionRing(squadron) {
    if (!this._selectionGraphics) {
      this._selectionGraphics = this.scene.add.graphics();
      this._selectionGraphics.setDepth(90);
    }

    this._selectionGraphics.clear();
    this._selectionGraphics.lineStyle(2, this.GLOW_COLOR, 0.8);

    const x = squadron.sprite ? squadron.sprite.x : squadron.slot.x;
    const y = squadron.sprite ? squadron.sprite.y : squadron.slot.y;
    const w = 50 * (squadron.baseScale || 1);
    const h = 35 * (squadron.baseScale || 1);

    this._selectionGraphics.strokeEllipse(x, y, w, h);
  }

  _clearAttackerGlow() {
    if (this.currentAttacker) {
      // Usar unhighlight() del Squadron
      if (this.currentAttacker.unhighlight) {
        this.currentAttacker.unhighlight();
      } else if (
        this.currentAttacker.sprite &&
        this.currentAttacker.sprite.active
      ) {
        this.currentAttacker.sprite.clearTint();
      }
    }

    if (this._selectionGraphics) {
      this._selectionGraphics.clear();
    }
  }

  // ============================================================
  // DISPARO
  // ============================================================

  _doFire() {
    if (!this.currentAttacker || !this.currentTarget) return;

    // Calcular dano
    this.pendingDamage = this.calculateDamage(
      this.currentAttacker,
      this.currentTarget
    );

    // Obtener posiciones
    const startX = this.currentAttacker.sprite
      ? this.currentAttacker.sprite.x
      : this.currentAttacker.slot.x;
    const startY = this.currentAttacker.sprite
      ? this.currentAttacker.sprite.y
      : this.currentAttacker.slot.y;
    const targetX = this.currentTarget.sprite
      ? this.currentTarget.sprite.x
      : this.currentTarget.slot.x;
    const targetY = this.currentTarget.sprite
      ? this.currentTarget.sprite.y
      : this.currentTarget.slot.y;

    // Animacion de recoil del atacante
    this._playRecoil(this.currentAttacker, this.currentTarget);

    const projectileType = this._getProjectileType();
    const travelTime = this._getTravelTime();

    // Crear proyectil
    const projectile = new Projectile(
      this.scene,
      startX,
      startY,
      targetX,
      targetY,
      projectileType,
      this.pendingDamage,
      travelTime
    );

    // Callback cuando impacta
    projectile.onImpact = () => {
      if (this.state === "TRAVELING") {
        this.stateTimer = 0; // Forzar transicion
      }
    };

    this.projectiles.push(projectile);
  }

  _playRecoil(attacker, target) {
    if (!attacker || !attacker.sprite || !attacker.sprite.active) return;

    const originalX = attacker.slot ? attacker.slot.x : attacker.sprite.x;
    const originalY = attacker.slot ? attacker.slot.y : attacker.sprite.y;

    // Direccion opuesta al objetivo
    const targetX = target.sprite ? target.sprite.x : target.slot.x;
    const dirX = originalX < targetX ? -1 : 1;

    this.scene.tweens.add({
      targets: attacker.sprite,
      x: originalX + dirX * 8,
      duration: 80,
      yoyo: true,
      ease: "Power2",
      onComplete: () => {
        if (attacker.sprite && attacker.sprite.active) {
          attacker.sprite.x = originalX;
        }
      },
    });
  }

  // ============================================================
  // IMPACTO / DANO
  // ============================================================

  _doHit() {
    if (!this.currentTarget || !this.pendingDamage) return;

    const damage = this.pendingDamage;

    // Flash de impacto
    this._createImpactFlash(this.currentTarget);

    // Shake ligero de camara
    this.scene.cameras.main.shake(80, 0.004);

    if (!damage.isMiss) {
      // Aplicar dano al objetivo (takeDamage espera cantidad de naves destruidas)
      const shipsDestroyed = Math.max(1, Math.floor(damage.damage / 10));
      this.currentTarget.takeDamage(shipsDestroyed);

      // Actualizar estadisticas
      this.stats.totalDamageDealt += shipsDestroyed;
      if (damage.isCritical) {
        this.stats.criticalHits++;
      } else {
        this.stats.normalHits++;
      }

      // Dano flotante
      const textType = damage.isCritical ? "critical" : "damage";
      const displayText = damage.isCritical
        ? `${shipsDestroyed}!`
        : `${shipsDestroyed}`;

      const tx = this.currentTarget.sprite
        ? this.currentTarget.sprite.x
        : this.currentTarget.slot.x;
      const ty = this.currentTarget.sprite
        ? this.currentTarget.sprite.y
        : this.currentTarget.slot.y;

      this._spawnFloatingText(tx, ty - 20, displayText, textType);

      // Verificar si el objetivo murio
      if (this.currentTarget.count <= 0 || this.currentTarget.isDestroyed) {
        this.stats.squadronsDestroyed++;
        this._handleSquadronDestroyed(this.currentTarget);
      }
    } else {
      // Miss
      this.stats.misses++;
      const tx = this.currentTarget.sprite
        ? this.currentTarget.sprite.x
        : this.currentTarget.slot.x;
      const ty = this.currentTarget.sprite
        ? this.currentTarget.sprite.y
        : this.currentTarget.slot.y;
      this._spawnFloatingText(tx, ty - 20, "MISS", "miss");
    }

    this.pendingDamage = null;
  }

  _createImpactFlash(target) {
    if (!target) return;

    const x = target.sprite ? target.sprite.x : target.slot.x;
    const y = target.sprite ? target.sprite.y : target.slot.y;

    // Flash blanco rapido
    const flash = this.scene.add.circle(x, y, 35, 0xffffff, 0.9);
    flash.setDepth(95);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 2.5,
      scaleY: 2.5,
      duration: 200,
      ease: "Power2",
      onComplete: () => flash.destroy(),
    });

    // Tint rojo en el sprite objetivo
    if (target.sprite && target.sprite.active) {
      target.sprite.setTint(0xff3333);
      this.scene.time.delayedCall(150, () => {
        if (target.sprite && target.sprite.active && target.alive !== false) {
          target.sprite.clearTint();
        }
      });
    }
  }

  _handleSquadronDestroyed(squadron) {
    if (!squadron) return;

    const x = squadron.sprite ? squadron.sprite.x : squadron.slot.x;
    const y = squadron.sprite ? squadron.sprite.y : squadron.slot.y;

    // El Squadron.js ya maneja su propia animacion de destruccion
    // Solo añadimos el texto flotante "DESTROYED"
    this._spawnFloatingText(x, y - 35, "DESTROYED", "critical");

    // Shake mas fuerte
    this.scene.cameras.main.shake(200, 0.012);

    // Actualizar listas
    this.leftSquadrons = this.leftSquadrons.filter(
      (s) => s && s !== squadron && !s.isDestroyed
    );
    this.rightSquadrons = this.rightSquadrons.filter(
      (s) => s && s !== squadron && !s.isDestroyed
    );

    if (this.options.showDebugLogs) {
      console.log(`[Combat] Escuadron destruido: ${squadron.type}`);
    }
  }

  _spawnFloatingText(x, y, text, type) {
    const floatingText = new FloatingText(this.scene, x, y, text, type);
    this.floatingTexts.push(floatingText);
  }

  // ============================================================
  // CALCULO DE DANO
  // ============================================================

  calculateDamage(attacker, defender) {
    const attackerPower = this._getPower(attacker);
    const attackerTech = this._getTech(attacker);
    const defenderDefense = this._getDefense(defender);
    const defenderArmor = this._getArmor(defender);

    // Dano base
    const baseDamage = attackerPower * 0.12;

    // Defensa reduce dano
    const defenseReduction = defenderDefense * 0.04;

    // Dano neto (minimo 1)
    let damage = Math.max(1, baseDamage - defenseReduction);

    // Variacion aleatoria +/- 10%
    const variation = 0.9 + Math.random() * 0.2;
    damage *= variation;

    // Hit/miss basado en tech vs armor
    const hitChance = 0.88 + (attackerTech - defenderArmor) * 0.0015;
    const roll = Math.random();

    if (roll > Math.min(0.97, hitChance)) {
      return { damage: 0, isCritical: false, isMiss: true };
    }

    // Critico (10% base + tech bonus)
    const critChance = 0.1 + attackerTech * 0.0008;
    const isCritical = Math.random() < Math.min(0.4, critChance);

    if (isCritical) {
      damage *= 2;
    }

    return {
      damage: Math.floor(damage),
      isCritical: isCritical,
      isMiss: false,
    };
  }

  // ============================================================
  // TARGETING
  // ============================================================

  _findTarget(attacker, attackerSide) {
    const enemySide =
      attackerSide === "left" ? this.rightSquadrons : this.leftSquadrons;

    // Filtrar vivos
    const aliveEnemies = enemySide.filter(
      (s) => s && s.alive !== false && !s.isDestroyed
    );

    if (aliveEnemies.length === 0) return null;

    // GO2: 70% frontmost, 30% aleatorio
    const sorted = [...aliveEnemies].sort((a, b) => {
      const aX = a.sprite ? a.sprite.x : a.slot.x;
      const bX = b.sprite ? b.sprite.x : b.slot.x;
      return Math.abs(aX - this.scene.cameras.main.centerX) -
             Math.abs(bX - this.scene.cameras.main.centerX);
    });

    if (Math.random() < 0.7 && sorted.length > 0) {
      return sorted[0];
    }

    return sorted[Math.floor(Math.random() * sorted.length)];
  }

  // ============================================================
  // AVANCE DE TURNOS Y RONDAS
  // ============================================================

  _advanceTurn() {
    this.currentIndex++;

    if (this.currentIndex >= this.allSquadrons.length) {
      this._startNewRound();
    } else {
      this._startNextTurn();
    }
  }

  _startNewRound() {
    // Verificar fin de batalla
    if (this.isBattleOver()) {
      this._endBattle();
      return;
    }

    this.round++;
    this.currentIndex = 0;
    this.stats.roundsPlayed++;

    // Reconstruir orden de turnos (por si murieron escuadrones)
    this._buildTurnOrder();

    if (this.options.showDebugLogs) {
      console.log(`[Combat] === RONDA ${this.round} ===`);
    }

    // Mostrar banner
    this.roundBanner.show(this.round);
    this._transitionTo("ROUND_START");

    if (this.onRoundStart) {
      this.onRoundStart(this.round);
    }
  }

  // ============================================================
  // ACTUALIZACION DE ENTIDADES
  // ============================================================

  _updateProjectiles(dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      const arrived = projectile.update(dt);

      if (arrived) {
        this.projectiles.splice(i, 1);

        // Si estabamos esperando en TRAVELING, forzar transicion
        if (this.state === "TRAVELING" && this.projectiles.length === 0) {
          this.stateTimer = 0;
        }
      }
    }
  }

  _updateFloatingTexts(dt) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const text = this.floatingTexts[i];
      const finished = text.update(dt);

      if (finished) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  // ============================================================
  // FIN DE BATALLA
  // ============================================================

  isBattleOver() {
    const leftAlive = this.leftSquadrons.some(
      (s) => s && s.alive !== false && !s.isDestroyed
    );
    const rightAlive = this.rightSquadrons.some(
      (s) => s && s.alive !== false && !s.isDestroyed
    );
    return !leftAlive || !rightAlive;
  }

  getBattleResult() {
    const leftAlive = this.leftSquadrons.some(
      (s) => s && s.alive !== false && !s.isDestroyed
    );
    const rightAlive = this.rightSquadrons.some(
      (s) => s && s.alive !== false && !s.isDestroyed
    );

    if (leftAlive && !rightAlive) return "VICTORY";
    if (!leftAlive && rightAlive) return "DEFEAT";
    return "DRAW";
  }

  _endBattle() {
    this.state = "BATTLE_END";

    const result = this.getBattleResult();

    // Limpiar
    this.projectiles.forEach((p) => p.destroy());
    this.projectiles = [];
    this._clearAttackerGlow();
    this.roundBanner.hide(true);

    if (this.options.showDebugLogs) {
      console.log(`[Combat] Batalla terminada: ${result}`, this.stats);
    }

    if (this.onBattleEnd) {
      this.onBattleEnd(result, this.stats);
    }
  }

  // ============================================================
  // LIMPIEZA Y UTILIDADES
  // ============================================================

  destroy() {
    this.projectiles.forEach((p) => p.destroy());
    this.projectiles = [];

    this.floatingTexts.forEach((t) => t.destroy());
    this.floatingTexts = [];

    if (this._selectionGraphics) {
      this._selectionGraphics.destroy();
      this._selectionGraphics = null;
    }

    this.roundBanner.destroy();

    this.state = "DESTROYED";
  }

  getStatus() {
    return {
      round: this.round,
      state: this.state,
      currentTurn: this.currentIndex + 1,
      totalTurns: this.allSquadrons.length,
      leftAlive: this.leftSquadrons.filter(
        (s) => s && s.alive !== false && !s.isDestroyed
      ).length,
      rightAlive: this.rightSquadrons.filter(
        (s) => s && s.alive !== false && !s.isDestroyed
      ).length,
      totalLeft: this.leftSquadrons.length,
      totalRight: this.rightSquadrons.length,
    };
  }

  /**
   * Pausar el combate
   */
  pause() {
    if (this.state !== "BATTLE_END" && this.state !== "DESTROYED") {
      this._previousState = this.state;
      this.state = "PAUSED";
    }
  }

  /**
   * Reanudar el combate
   */
  resume() {
    if (this.state === "PAUSED") {
      this.state = this._previousState || "IDLE";
    }
  }
}

// Exportar para uso modular o global
if (typeof module !== "undefined" && module.exports) {
  module.exports = CombatSystem;
}
