/**
 * ============================================================
 * BattleScene.js
 * Escena principal de batalla de Galaxy Online 2.
 * 
 * Capas de renderizado (de atras hacia adelante):
 *  1. backgroundLayer  - Fondo espacial con gradiente
 *  2. starfieldLayer   - Estrellas con parallax sutil
 *  3. nebulaLayer      - Nebulosas decorativas
 *  4. leftFleetLayer   - Escuadrones atacante (izquierda)
 *  5. rightFleetLayer  - Escuadrones defensor (derecha)
 *  6. projectileLayer  - Proyectiles en vuelo
 *  7. impactLayer      - Impactos y explosiones
 *  8. uiOverlayLayer   - UI dentro de Phaser (banner ronda)
 *
 * Galaxy Online 2 - Estilo Flash clasico
 * ============================================================
 */

// ============================================================
// SLOTS FIJOS DE FORMACION
// ============================================================

/** Slots atacante (izquierda) - formacion escalonada */
const LEFT_SLOTS = [
    { x: 120, y: 180 }, { x: 200, y: 140 }, { x: 200, y: 220 },
    { x: 280, y: 100 }, { x: 280, y: 180 }, { x: 280, y: 260 },
    { x: 360, y: 140 }, { x: 360, y: 220 },
    { x: 440, y: 180 },
];

/** Slots defensor (derecha) - formacion escalonada espejo */
const RIGHT_SLOTS = [
    { x: 840, y: 180 }, { x: 760, y: 140 }, { x: 760, y: 220 },
    { x: 680, y: 100 }, { x: 680, y: 180 }, { x: 680, y: 260 },
    { x: 600, y: 140 }, { x: 600, y: 220 },
    { x: 520, y: 180 },
];

/** Configuracion de datos de escuadrones de ejemplo */
const SAMPLE_LEFT_FLEET = [
    { id: 'L1',  type: 'frigate',   count: 800,  commanderName: 'Alpha-1' },
    { id: 'L2',  type: 'frigate',   count: 700,  commanderName: 'Alpha-2' },
    { id: 'L3',  type: 'frigate',   count: 700,  commanderName: 'Alpha-3' },
    { id: 'L4',  type: 'cruiser',   count: 1000, commanderName: 'Beta-1' },
    { id: 'L5',  type: 'cruiser',   count: 1000, commanderName: 'Beta-2' },
    { id: 'L6',  type: 'cruiser',   count: 1000, commanderName: 'Beta-3' },
    { id: 'L7',  type: 'frigate',   count: 700,  commanderName: 'Alpha-4' },
    { id: 'L8',  type: 'frigate',   count: 700,  commanderName: 'Alpha-5' },
    { id: 'L9',  type: 'battleship',count: 500,  commanderName: 'Omega' },
];

const SAMPLE_RIGHT_FLEET = [
    { id: 'R1',  type: 'frigate',   count: 1700, commanderName: 'Zeta-1' },
    { id: 'R2',  type: 'frigate',   count: 1700, commanderName: 'Zeta-2' },
    { id: 'R3',  type: 'frigate',   count: 1700, commanderName: 'Zeta-3' },
    { id: 'R4',  type: 'cruiser',   count: 3000, commanderName: 'Delta-1' },
    { id: 'R5',  type: 'cruiser',   count: 3000, commanderName: 'Delta-2' },
    { id: 'R6',  type: 'cruiser',   count: 3000, commanderName: 'Delta-3' },
    { id: 'R7',  type: 'frigate',   count: 1700, commanderName: 'Zeta-4' },
    { id: 'R8',  type: 'frigate',   count: 1700, commanderName: 'Zeta-5' },
    { id: 'R9',  type: 'battleship',count: 1000, commanderName: 'Sigma' },
];

// ============================================================
// CLASE: BATTLESCENE
// ============================================================

class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene' });
    }

    // ============================================================
    // CREATE - Inicializacion de la escena
    // ============================================================

    create() {
        console.log('[BattleScene] Inicializando escena de batalla...');

        // --- 1. Crear capas (layers) en orden de renderizado ---
        this.createLayers();

        // --- 2. Crear fondo espacial ---
        this.createBackground();

        // --- 3. Crear campo de estrellas ---
        this.createStarfield();

        // --- 4. Crear nebulosas decorativas ---
        this.createNebulas();

        // --- 5. Crear flotas (escuadrones) ---
        this.createFleets();

        // --- 6. Crear UI overlay ---
        this.createUIOverlay();

        // --- 7. Configurar input (parallax con mouse) ---
        this.setupInput();

        // --- 8. Inicializar sistema de combate completo ---
        this.initCombatSystem();

        // --- 9. Iniciar loop de batalla de demostracion ---
        this.startDemoBattle();

        console.log('[BattleScene] Escena inicializada correctamente.');
    }

    // ============================================================
    // CAPAS (LAYERS)
    // ============================================================

    /**
     * Crea todas las capas de renderizado en el orden correcto.
     * Las capas son Containers que actuan como grupos de objetos.
     */
    createLayers() {
        // Capa 1: Fondo espacial base
        this.backgroundLayer = this.add.container(0, 0);
        this.backgroundLayer.setDepth(0);

        // Capa 2: Estrellas con parallax
        this.starfieldLayer = this.add.container(0, 0);
        this.starfieldLayer.setDepth(1);

        // Capa 3: Nebulosas decorativas
        this.nebulaLayer = this.add.container(0, 0);
        this.nebulaLayer.setDepth(2);

        // Capa 4: Flota atacante (izquierda)
        this.leftFleetLayer = this.add.container(0, 0);
        this.leftFleetLayer.setDepth(3);

        // Capa 5: Flota defensora (derecha)
        this.rightFleetLayer = this.add.container(0, 0);
        this.rightFleetLayer.setDepth(4);

        // Capa 6: Proyectiles
        this.projectileLayer = this.add.container(0, 0);
        this.projectileLayer.setDepth(5);

        // Capa 7: Impactos y explosiones
        this.impactLayer = this.add.container(0, 0);
        this.impactLayer.setDepth(6);

        // Capa 8: UI overlay
        this.uiOverlayLayer = this.add.container(0, 0);
        this.uiOverlayLayer.setDepth(7);

        console.log('[BattleScene] Capas creadas (8 layers)');
    }

    // ============================================================
    // FONDO ESPACIAL
    // ============================================================

    /**
     * Crea el fondo espacial con gradiente azul oscuro.
     * No hay grid visible - estilo limpio GO2.
     */
    createBackground() {
        // Gradiente vertical de #080c1a a #0a0e2a
        const canvas = document.createElement('canvas');
        canvas.width = 960;
        canvas.height = 640;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, 0, 640);
        gradient.addColorStop(0, '#080c1a');
        gradient.addColorStop(0.5, '#090d24');
        gradient.addColorStop(1, '#0a0e2a');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 960, 640);

        // Pequena vineta oscura en los bordes
        const vignette = ctx.createRadialGradient(480, 320, 200, 480, 320, 500);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, 960, 640);

        this.textures.addCanvas('bg-gradient', canvas);

        const bg = this.add.image(480, 320, 'bg-gradient');
        bg.setDisplaySize(960, 640);
        this.backgroundLayer.add(bg);

        // Limpiar canvas
        canvas.width = 0;
        canvas.height = 0;
    }

    // ============================================================
    // ESTRELLAS (STARFIELD)
    // ============================================================

    /**
     * Crea 200 estrellas pequenas con parallax sutil.
     * Algunas estrellas parpadean.
     */
    createStarfield() {
        this.stars = [];
        const starCount = 200;

        for (let i = 0; i < starCount; i++) {
            const x = Phaser.Math.Between(0, 960);
            const y = Phaser.Math.Between(0, 640);
            const size = Phaser.Math.Between(1, 2);
            const alpha = Phaser.Math.FloatBetween(0.3, 1.0);

            // Crear estrella como circulo pequeno
            const star = this.add.circle(x, y, size, 0xffffff, alpha);
            this.starfieldLayer.add(star);

            // Guardar datos para parallax
            const starData = {
                sprite: star,
                baseX: x,
                baseY: y,
                parallaxFactor: Phaser.Math.FloatBetween(0.02, 0.1),
                twinkle: Phaser.Math.Between(0, 1) === 0, // 50% parpadean
                twinkleSpeed: Phaser.Math.FloatBetween(1, 3),
                twinklePhase: Phaser.Math.FloatBetween(0, Math.PI * 2),
            };

            this.stars.push(starData);
        }

        console.log(`[BattleScene] ${starCount} estrellas creadas`);
    }

    // ============================================================
    // NEBULOSAS (NEBULA)
    // ============================================================

    /**
     * Crea nebulosas decorativas suaves con alpha bajo.
     * 2-3 nubes purpura a los lados, 1 azul en el centro.
     */
    createNebulas() {
        // Nebulosa purpura izquierda
        this.createNebulaCloud(150, 250, 180, '#3a1a5b', 0.15);

        // Nebulosa purpura derecha
        this.createNebulaCloud(820, 350, 160, '#3a1a5b', 0.12);

        // Nebulosa azul centro (mas difusa)
        this.createNebulaCloud(480, 320, 200, '#1a2a6b', 0.08);

        // Nebulosa purpura sutil arriba
        this.createNebulaCloud(500, 100, 140, '#2a1050', 0.1);
    }

    /**
     * Crea una nube de nebulosa individual usando circulos difuminados.
     * @param {number} cx - Centro X
     * @param {number} cy - Centro Y
     * @param {number} radius - Radio aproximado
     * @param {string} color - Color en hex
     * @param {number} baseAlpha - Alpha base
     */
    createNebulaCloud(cx, cy, radius, color, baseAlpha) {
        const hexColor = parseInt(color.replace('#', '0x'));
        const numCircles = Phaser.Math.Between(5, 8);

        for (let i = 0; i < numCircles; i++) {
            const offsetX = Phaser.Math.Between(-radius * 0.5, radius * 0.5);
            const offsetY = Phaser.Math.Between(-radius * 0.4, radius * 0.4);
            const r = Phaser.Math.Between(radius * 0.3, radius * 0.7);
            const alpha = baseAlpha * Phaser.Math.FloatBetween(0.5, 1.0);

            const circle = this.add.circle(cx + offsetX, cy + offsetY, r, hexColor, alpha);
            this.nebulaLayer.add(circle);
        }
    }

    // ============================================================
    // FLOTAS (ESCUADRONES)
    // ============================================================

    /**
     * Crea ambas flotas (atacante y defensora) en sus slots.
     */
    createFleets() {
        this.leftSquadrons = [];
        this.rightSquadrons = [];

        // --- Flota atacante (izquierda) ---
        for (let i = 0; i < LEFT_SLOTS.length; i++) {
            const slot = LEFT_SLOTS[i];
            const data = SAMPLE_LEFT_FLEET[i] || {
                id: `L${i + 1}`,
                type: 'frigate',
                count: 500,
                commanderName: `Comandante-${i + 1}`,
            };

            const config = {
                ...data,
                faction: 'blue',
            };

            const squadron = new Squadron(this, slot, config);
            squadron.create(this.leftFleetLayer);
            this.leftSquadrons.push(squadron);
        }

        // --- Flota defensora (derecha) ---
        for (let i = 0; i < RIGHT_SLOTS.length; i++) {
            const slot = RIGHT_SLOTS[i];
            const data = SAMPLE_RIGHT_FLEET[i] || {
                id: `R${i + 1}`,
                type: 'frigate',
                count: 500,
                commanderName: `Defensor-${i + 1}`,
            };

            const config = {
                ...data,
                faction: 'red',
            };

            const squadron = new Squadron(this, slot, config);
            squadron.create(this.rightFleetLayer);
            this.rightSquadrons.push(squadron);
        }

        console.log(`[BattleScene] Flotas creadas: ${this.leftSquadrons.length} atacantes, ${this.rightSquadrons.length} defensores`);
    }

    // ============================================================
    // UI OVERLAY
    // ============================================================

    /**
     * Crea los elementos UI dentro de Phaser.
     * Banner de ronda, informacion de flotas, etc.
     */
    createUIOverlay() {
        // --- Banner superior: informacion de jugadores ---
        this.createPlayerBanner();

        // --- Banner de ronda (centro superior) ---
        this.createRoundBanner();

        // --- Barra inferior de estado ---
        this.createStatusBar();
    }

    /**
     * Crea el banner con info de ambos jugadores.
     */
    createPlayerBanner() {
        const bannerHeight = 48;
        const bannerY = 0;

        // Fondo del banner (gradiente semitransparente)
        const bg = this.add.rectangle(480, bannerY + bannerHeight / 2, 960, bannerHeight, 0x000000, 0.5);
        this.uiOverlayLayer.add(bg);

        // Linea divisoria inferior
        const line = this.add.rectangle(480, bannerY + bannerHeight, 960, 1, 0x445588, 0.3);
        this.uiOverlayLayer.add(line);

        // --- Jugador izquierdo (atacante) ---
        const leftName = this.add.text(20, bannerY + 12, 'SandoraD', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#66aaff',
            stroke: '#000000',
            strokeThickness: 2,
        });
        this.uiOverlayLayer.add(leftName);

        const leftLevel = this.add.text(20, bannerY + 30, 'Nv. 80', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '11px',
            color: '#88bbdd',
        });
        this.uiOverlayLayer.add(leftLevel);

        // Barra de poder izquierda
        const leftPowerBar = this.add.rectangle(160, bannerY + 24, 180, 12, 0x2266aa, 0.8);
        this.uiOverlayLayer.add(leftPowerBar);
        const leftPowerText = this.add.text(160, bannerY + 24, 'Poder: 825.5K', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '10px',
            color: '#aaccff',
        });
        leftPowerText.setOrigin(0.5, 0.5);
        this.uiOverlayLayer.add(leftPowerText);

        // --- Jugador derecho (defensor) ---
        const rightName = this.add.text(820, bannerY + 12, 'Recole', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#ff8866',
            stroke: '#000000',
            strokeThickness: 2,
        });
        rightName.setOrigin(1, 0);
        this.uiOverlayLayer.add(rightName);

        const rightLevel = this.add.text(820, bannerY + 30, 'Nv. 80', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '11px',
            color: '#ddaa88',
        });
        rightLevel.setOrigin(1, 0);
        this.uiOverlayLayer.add(rightLevel);

        // Barra de poder derecha
        const rightPowerBar = this.add.rectangle(700, bannerY + 24, 180, 12, 0xaa4422, 0.8);
        this.uiOverlayLayer.add(rightPowerBar);
        const rightPowerText = this.add.text(700, bannerY + 24, 'Poder: 791.0K', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '10px',
            color: '#ffccaa',
        });
        rightPowerText.setOrigin(0.5, 0.5);
        this.uiOverlayLayer.add(rightPowerText);

        // --- Estrellas de rango (centro) ---
        const starText = '★ ★ ★ ★ ★';
        const starsLeft = this.add.text(440, bannerY + 14, starText, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px',
            color: '#ffdd44',
        });
        starsLeft.setOrigin(0.5, 0);
        this.uiOverlayLayer.add(starsLeft);

        const vsText = this.add.text(480, bannerY + 32, 'VS', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#ff4444',
            stroke: '#000000',
            strokeThickness: 3,
        });
        vsText.setOrigin(0.5, 0.5);
        this.uiOverlayLayer.add(vsText);
    }

    /**
     * Crea el banner de ronda en el centro.
     */
    createRoundBanner() {
        this.roundNumber = 1;
        this.maxRounds = 15;

        // Banner de ronda (aparece animado)
        this.roundBannerBg = this.add.rectangle(480, 70, 160, 32, 0x000000, 0.6);
        this.roundBannerBg.setStrokeStyle(1, 0x445588, 0.5);
        this.uiOverlayLayer.add(this.roundBannerBg);

        this.roundBannerText = this.add.text(480, 70, 'Ronda 1', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#ffdd44',
            stroke: '#000000',
            strokeThickness: 2,
        });
        this.roundBannerText.setOrigin(0.5, 0.5);
        this.uiOverlayLayer.add(this.roundBannerText);

        // Animar entrada
        this.roundBannerBg.setScale(0);
        this.roundBannerText.setScale(0);

        this.tweens.add({
            targets: [this.roundBannerBg, this.roundBannerText],
            scale: 1,
            duration: 500,
            ease: 'Back.easeOut',
            delay: 800,
        });
    }

    /**
     * Crea la barra de estado inferior.
     */
    createStatusBar() {
        const barY = 620;

        // Fondo
        const bg = this.add.rectangle(480, barY, 960, 40, 0x000000, 0.4);
        this.uiOverlayLayer.add(bg);

        // Linea superior
        const line = this.add.rectangle(480, barY - 20, 960, 1, 0x445588, 0.2);
        this.uiOverlayLayer.add(line);

        // Texto de estado
        this.statusText = this.add.text(480, barY, 'Esperando...', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px',
            color: '#aabbcc',
        });
        this.statusText.setOrigin(0.5, 0.5);
        this.uiOverlayLayer.add(this.statusText);
    }

    // ============================================================
    // INPUT / PARALLAX
    // ============================================================

    /**
     * Configura el input del mouse para efecto parallax.
     */
    setupInput() {
        this.inputMouse = { x: 480, y: 320 };

        this.input.on('pointermove', (pointer) => {
            this.inputMouse.x = pointer.x;
            this.inputMouse.y = pointer.y;
        });
    }

    // ============================================================
    // DEMO BATTLE (Simulacion)
    // ============================================================

    /**
     * Inicia una simulacion de batalla para demostracion.
     */
    startDemoBattle() {
        this.demoPhase = 'idle';
        this.demoTimer = this.time.addEvent({
            delay: 2000,
            callback: () => this.runDemoTurn(),
            callbackScope: this,
            loop: true,
        });

        // Primer turno despues de un delay
        this.time.delayedCall(1500, () => this.runDemoTurn());
    }

    /**
     * Ejecuta un turno de la demo.
     */
    runDemoTurn() {
        if (this.demoPhase === 'fighting') return;

        this.demoPhase = 'fighting';

        // Incrementar ronda
        this.roundNumber++;
        if (this.roundNumber > this.maxRounds) {
            this.roundNumber = 1;
        }
        this.roundBannerText.setText(`Ronda ${this.roundNumber}`);

        // Pulso del banner
        this.tweens.add({
            targets: [this.roundBannerBg, this.roundBannerText],
            scale: 1.2,
            duration: 200,
            yoyo: true,
            ease: 'Sine.easeInOut',
        });

        // Seleccionar escuadrones vivos
        const leftAlive = this.leftSquadrons.filter(s => s.alive);
        const rightAlive = this.rightSquadrons.filter(s => s.alive);

        if (leftAlive.length === 0 || rightAlive.length === 0) {
            this.statusText.setText('Batalla finalizada');
            this.demoTimer.remove();
            return;
        }

        // Escuadron atacante (aleatorio)
        const attacker = Phaser.Utils.Array.GetRandom(leftAlive);
        const target = Phaser.Utils.Array.GetRandom(rightAlive);

        // Highlight del atacante
        attacker.highlight();
        this.statusText.setText(`${attacker.commanderName} ataca a ${target.commanderName}`);

        // Esperar y disparar
        this.time.delayedCall(600, () => {
            attacker.fire(target);

            // Quitar highlight
            this.time.delayedCall(800, () => {
                attacker.unhighlight();
                this.demoPhase = 'idle';
            });
        });

        // Tambien un defensor ataca (intercambio)
        this.time.delayedCall(1200, () => {
            const defAttacker = Phaser.Utils.Array.GetRandom(rightAlive);
            const defTarget = Phaser.Utils.Array.GetRandom(leftAlive);

            if (defAttacker.alive && defTarget.alive) {
                defAttacker.highlight();
                this.time.delayedCall(300, () => {
                    defAttacker.fire(defTarget);
                    this.time.delayedCall(800, () => {
                        defAttacker.unhighlight();
                    });
                });
            }
        });
    }

    // ============================================================
    // UPDATE - Loop principal
    // ============================================================

    /**
     * Loop de actualizacion (60 FPS).
     * @param {number} time - Tiempo actual
     * @param {number} delta - Delta time en ms
     */
    update(time, delta) {
        this.updateStarfield(time, delta);
        this.updateNebulas(time);
    }

    /**
     * Actualiza el parallax del starfield.
     */
    updateStarfield(time, delta) {
        // Offset basado en posicion del mouse (parallax MUY sutil)
        const targetOffsetX = (this.inputMouse.x - 480) * -0.1;
        const targetOffsetY = (this.inputMouse.y - 320) * -0.1;

        for (const star of this.stars) {
            let x = star.baseX + targetOffsetX * star.parallaxFactor;
            let y = star.baseY + targetOffsetY * star.parallaxFactor;

            // Parpadeo de estrellas
            if (star.twinkle) {
                const twinkle = Math.sin(time * 0.002 * star.twinkleSpeed + star.twinklePhase);
                const alpha = 0.3 + (twinkle + 1) * 0.35; // 0.3 a 1.0
                star.sprite.setAlpha(alpha);
            }

            star.sprite.x = x;
            star.sprite.y = y;
        }
    }

    /**
     * Actualiza las nebulosas (movimiento lento).
     */
    updateNebulas(time) {
        // Movimiento muy lento de nebulosas (simulado)
        const driftX = Math.sin(time * 0.0001) * 5;
        const driftY = Math.cos(time * 0.00008) * 3;
        this.nebulaLayer.x = driftX;
        this.nebulaLayer.y = driftY;
    }

    // ============================================================
    // UTILIDADES PUBLICAS
    // ============================================================

    /**
     * Obtiene un escuadron por su ID.
     * @param {string} id - ID del escuadron
     * @returns {Squadron|null}
     */
    getSquadronById(id) {
        const all = [...this.leftSquadrons, ...this.rightSquadrons];
        return all.find(s => s.id === id) || null;
    }

    /**
     * Obtiene todos los escuadrones vivos de un bando.
     * @param {string} faction - 'blue' | 'red'
     * @returns {Squadron[]}
     */
    getAliveSquadrons(faction) {
        if (faction === 'blue') {
            return this.leftSquadrons.filter(s => s.alive);
        }
        return this.rightSquadrons.filter(s => s.alive);
    }

    /**
     * Pausa la batalla.
     */
    pauseBattle() {
        if (this.demoTimer) {
            this.demoTimer.paused = true;
        }
        this.statusText.setText('Batalla pausada');
    }

    /**
     * Reanuda la batalla.
     */
    resumeBattle() {
        if (this.demoTimer) {
            this.demoTimer.paused = false;
        }
        if (this.statusText) this.statusText.setText('Batalla en curso');
    }

    // ============================================================
    // INTEGRACION CON HUD Y COMBAT SYSTEM
    // ============================================================

    setPaused(paused) {
        this.isPaused = paused;
        if (paused) {
            this.pauseBattle();
        } else {
            this.resumeBattle();
        }
        if (this.combatSystem) this.combatSystem.isPaused = paused;
    }

    setSpeed(speed) {
        this.battleSpeed = speed;
        if (this.combatSystem) this.combatSystem.speed = speed;
    }

    setAuto(auto) {
        this.isAuto = auto;
    }

    // Inicializar CombatSystem completo
    initCombatSystem() {
        if (typeof CombatSystem !== 'undefined') {
            this.combatSystem = new CombatSystem(this, this.leftSquadrons, this.rightSquadrons);
            this.combatSystem.init();

            // Callbacks para actualizar HUD
            this.combatSystem.onTurnChange = (attacker, target, turn, round) => {
                if (this.hud) {
                    this.hud.addLog(`[Turno ${turn}] ${attacker.commanderName} ataca a ${target.commanderName}`, 'damage');
                }
            };
            this.combatSystem.onRoundStart = (round) => {
                if (this.hud) {
                    this.hud.setRound(round);
                    this.hud.showRoundBanner(round);
                    this.hud.addLog(`=== RONDA ${round} ===`, 'round');
                }
            };
            this.combatSystem.onBattleEnd = (result, stats) => {
                if (this.hud) {
                    this.hud.addLog(`Batalla terminada. ${result}`, 'system');
                }
            };
        }
    }

    // ============================================================
    // UPDATE LOOP
    // ============================================================

    update(time, delta) {
        // Parallax de estrellas
        if (this.stars && this.input.activePointer) {
            const mx = this.input.activePointer.x;
            const my = this.input.activePointer.y;
            for (const star of this.stars) {
                const offsetX = (mx - 480) * star.parallaxFactor * 0.5;
                const offsetY = (my - 320) * star.parallaxFactor * 0.5;
                star.sprite.x = star.baseX + offsetX;
                star.sprite.y = star.baseY + offsetY;
                // Twinkle
                if (star.twinkle) {
                    const twinkle = Math.sin(time * 0.001 * star.twinkleSpeed + star.twinklePhase);
                    star.sprite.alpha = 0.4 + (twinkle + 1) * 0.3;
                }
            }
        }

        // Update combat system
        if (this.combatSystem && !this.isPaused) {
            this.combatSystem.update(delta * this.battleSpeed);
        }

        // Update projectiles
        if (this.projectiles) {
            for (let i = this.projectiles.length - 1; i >= 0; i--) {
                const proj = this.projectiles[i];
                if (proj.update) {
                    const hit = proj.update(delta);
                    if (hit && this.hud && proj.damage) {
                        this.hud.flashDamage('right', proj.damage);
                    }
                }
                if (proj.finished) {
                    this.projectiles.splice(i, 1);
                }
            }
        }
    }
}

// ============================================================
// BOOTSCENE - Escena de carga inicial
// ============================================================

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        console.log('[BootScene] Iniciando carga...');

        // Crear barra de progreso en pantalla
        this.createProgressBar();

        // Simular progreso de carga (generacion de texturas)
        let progress = 0;
        const loadInterval = setInterval(() => {
            progress += Phaser.Math.Between(5, 15);
            if (progress > 100) progress = 100;

            this.updateProgressBar(progress);

            if (progress >= 100) {
                clearInterval(loadInterval);
                // Generar texturas
                TextureGenerator.generateAll(this);
                this.load.complete();
            }
        }, 100);

        // Forzar completado despues de un tiempo maximo
        this.time.delayedCall(3000, () => {
            clearInterval(loadInterval);
            TextureGenerator.generateAll(this);
            this.load.complete();
        });
    }

    createProgressBar() {
        const width = 400;
        const height = 20;
        const x = (960 - width) / 2;
        const y = 400;

        // Fondo de la barra
        this.progressBg = this.add.rectangle(480, y, width + 4, height + 4, 0x000000, 0.8);
        this.progressBg.setStrokeStyle(1, 0x445588, 0.5);

        // Barra de progreso
        this.progressBar = this.add.rectangle(x, y, 0, height, 0x2266aa, 1);
        this.progressBar.setOrigin(0, 0.5);

        // Texto de progreso
        this.progressText = this.add.text(480, y + 25, '0%', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            color: '#aabbcc',
        });
        this.progressText.setOrigin(0.5, 0);

        // Titulo
        this.titleText = this.add.text(480, 250, 'GALAXY ONLINE 2', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#aaccff',
            stroke: '#000000',
            strokeThickness: 3,
        });
        this.titleText.setOrigin(0.5, 0.5);

        // Subtitulo
        this.subtitleText = this.add.text(480, 300, 'Cargando sistemas de combate...', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            color: '#8899aa',
        });
        this.subtitleText.setOrigin(0.5, 0.5);
    }

    updateProgressBar(value) {
        const width = 400;
        const fillWidth = (value / 100) * width;

        this.progressBar.width = fillWidth;
        this.progressText.setText(`${value}%`);
    }

    create() {
        console.log('[BootScene] Carga completada, iniciando transicion...');

        // Fade out de elementos de carga
        this.tweens.add({
            targets: [this.progressBg, this.progressBar, this.progressText, this.titleText, this.subtitleText],
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                // Transicion a BattleScene
                this.scene.start('BattleScene');
            },
        });

        // Tambien ocultar la pantalla de carga HTML
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }
}
