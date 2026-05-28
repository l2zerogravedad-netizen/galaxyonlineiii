/**
 * ============================================================
 * TextureGenerator.js
 * Generador de texturas programaticas con Phaser Graphics.
 * Crea todos los sprites necesarios para la escena de batalla
 * usando dibujos 2D con sombreado para apariencia 3D.
 *
 * Estilo: Galaxy Online 2 Flash clasico
 * ============================================================
 */

class TextureGenerator {
    /**
     * Genera todas las texturas necesarias para la batalla.
     * Debe llamarse durante el preload de BootScene.
     * @param {Phaser.Scene} scene - La escena de Phaser (tipicamente BootScene)
     */
    static generateAll(scene) {
        console.log('[TextureGenerator] Generando texturas...');

        // --- Naves: Frigate (pequena, ~32px) ---
        this.generateFrigate(scene, 'ship-frigate-blue', 0x4488dd, 0x2266aa);
        this.generateFrigate(scene, 'ship-frigate-red', 0xdd6644, 0xaa4422);

        // --- Naves: Cruiser (mediana, ~48px) ---
        this.generateCruiser(scene, 'ship-cruiser-blue', 0x5599ee, 0x3377bb);
        this.generateCruiser(scene, 'ship-cruiser-red', 0xee7755, 0xbb5533);

        // --- Naves: Battleship (grande, ~64px) ---
        this.generateBattleship(scene, 'ship-battleship-blue', 0x66aaff, 0x4488cc);
        this.generateBattleship(scene, 'ship-battleship-red', 0xff8866, 0xcc6644);

        // --- Proyectiles ---
        this.generateProjectileLaser(scene);
        this.generateProjectileMissile(scene);
        this.generateProjectileOrb(scene);

        // --- Efectos ---
        this.generateImpactFlash(scene);
        this.generateExplosionSmall(scene);
        this.generateGlowEffects(scene);

        // --- Particulas ---
        this.generateParticleDot(scene);

        console.log('[TextureGenerator] Todas las texturas generadas.');
    }

    // ============================================================
    // FRIGATE - Nave pequena y agil (~32x24px)
    // ============================================================
    static generateFrigate(scene, key, colorMain, colorDark) {
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

        // Sombra difusa debajo
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillEllipse(16, 22, 24, 8);

        // Ala trasera izquierda
        graphics.fillStyle(colorDark, 1);
        graphics.fillTriangle(4, 16, 12, 20, 10, 10);

        // Ala trasera derecha
        graphics.fillTriangle(28, 16, 20, 20, 22, 10);

        // Cuerpo principal
        graphics.fillStyle(colorMain, 1);
        graphics.fillEllipse(16, 12, 20, 14);

        // Cabina/puente
        graphics.fillStyle(0x88bbff, 0.8);
        graphics.fillEllipse(18, 10, 8, 5);

        // Detalle central
        graphics.fillStyle(colorDark, 1);
        graphics.fillRect(14, 8, 6, 8);

        // Brillo specular
        graphics.fillStyle(0xffffff, 0.4);
        graphics.fillEllipse(14, 9, 10, 4);

        // Motor trasero
        graphics.fillStyle(0xffaa44, 0.9);
        graphics.fillCircle(16, 20, 3);
        graphics.fillStyle(0xffdd88, 0.6);
        graphics.fillCircle(16, 20, 2);

        graphics.generateTexture(key, 32, 28);
        graphics.destroy();
    }

    // ============================================================
    // CRUISER - Nave mediana, mas robusta (~48x36px)
    // ============================================================
    static generateCruiser(scene, key, colorMain, colorDark) {
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

        // Sombra
        graphics.fillStyle(0x000000, 0.25);
        graphics.fillEllipse(24, 32, 36, 10);

        // Ala trasera izquierda grande
        graphics.fillStyle(colorDark, 1);
        graphics.beginPath();
        graphics.moveTo(6, 20);
        graphics.lineTo(2, 30);
        graphics.lineTo(18, 26);
        graphics.lineTo(16, 14);
        graphics.closePath();
        graphics.fillPath();

        // Ala trasera derecha grande
        graphics.beginPath();
        graphics.moveTo(42, 20);
        graphics.lineTo(46, 30);
        graphics.lineTo(30, 26);
        graphics.lineTo(32, 14);
        graphics.closePath();
        graphics.fillPath();

        // Cuerpo central
        graphics.fillStyle(colorMain, 1);
        graphics.fillEllipse(24, 16, 26, 18);

        // Seccion frontal (proa)
        graphics.fillStyle(colorMain, 1);
        graphics.beginPath();
        graphics.moveTo(24, 4);
        graphics.lineTo(18, 16);
        graphics.lineTo(30, 16);
        graphics.closePath();
        graphics.fillPath();

        // Cabina
        graphics.fillStyle(0x99ccff, 0.85);
        graphics.fillEllipse(26, 12, 10, 6);

        // Detalles de armadura
        graphics.fillStyle(colorDark, 0.8);
        graphics.fillRect(20, 10, 8, 12);
        graphics.fillRect(18, 14, 12, 4);

        // Lineas de detalle
        graphics.lineStyle(1, colorDark, 0.6);
        graphics.moveTo(16, 16);
        graphics.lineTo(32, 16);
        graphics.strokePath();

        // Brillo specular
        graphics.fillStyle(0xffffff, 0.35);
        graphics.fillEllipse(20, 10, 14, 5);

        // Motores duales
        graphics.fillStyle(0xffaa44, 0.9);
        graphics.fillCircle(20, 28, 3);
        graphics.fillCircle(28, 28, 3);
        graphics.fillStyle(0xffdd88, 0.6);
        graphics.fillCircle(20, 28, 1.5);
        graphics.fillCircle(28, 28, 1.5);

        graphics.generateTexture(key, 48, 36);
        graphics.destroy();
    }

    // ============================================================
    // BATTLESHIP - Nave grande y poderosa (~64x48px)
    // ============================================================
    static generateBattleship(scene, key, colorMain, colorDark) {
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

        // Sombra grande
        graphics.fillStyle(0x000000, 0.2);
        graphics.fillEllipse(32, 42, 52, 12);

        // Estructura trasera (alas anchas)
        graphics.fillStyle(colorDark, 1);
        graphics.beginPath();
        graphics.moveTo(8, 18);
        graphics.lineTo(2, 36);
        graphics.lineTo(24, 32);
        graphics.lineTo(22, 14);
        graphics.closePath();
        graphics.fillPath();

        graphics.beginPath();
        graphics.moveTo(56, 18);
        graphics.lineTo(62, 36);
        graphics.lineTo(40, 32);
        graphics.lineTo(42, 14);
        graphics.closePath();
        graphics.fillPath();

        // Cuerpo principal masivo
        graphics.fillStyle(colorMain, 1);
        graphics.fillEllipse(32, 20, 36, 24);

        // Seccion frontal triangular (proa reforzada)
        graphics.fillStyle(colorMain, 1);
        graphics.beginPath();
        graphics.moveTo(32, 4);
        graphics.lineTo(22, 20);
        graphics.lineTo(42, 20);
        graphics.closePath();
        graphics.fillPath();

        // Cabina de comando
        graphics.fillStyle(0xaaddff, 0.9);
        graphics.fillEllipse(34, 14, 12, 7);
        graphics.fillStyle(0x88bbee, 0.7);
        graphics.fillEllipse(34, 13, 8, 4);

        // Paneles de armadura
        graphics.fillStyle(colorDark, 0.9);
        graphics.fillRect(26, 12, 12, 16);
        graphics.fillRect(22, 16, 20, 6);

        // Detalles estructurales - lineas horizontales
        graphics.lineStyle(1.5, colorDark, 0.5);
        graphics.moveTo(18, 18);
        graphics.lineTo(46, 18);
        graphics.strokePath();
        graphics.moveTo(20, 24);
        graphics.lineTo(44, 24);
        graphics.strokePath();

        // Detalles estructurales - lineas verticales
        graphics.lineStyle(1, colorDark, 0.4);
        graphics.moveTo(32, 8);
        graphics.lineTo(32, 32);
        graphics.strokePath();

        // Canones frontales
        graphics.fillStyle(colorDark, 1);
        graphics.fillRect(30, 2, 4, 8);
        graphics.fillRect(28, 4, 2, 6);
        graphics.fillRect(34, 4, 2, 6);

        // Brillo specular principal
        graphics.fillStyle(0xffffff, 0.3);
        graphics.fillEllipse(26, 12, 18, 6);

        // Motores triples
        graphics.fillStyle(0xffaa44, 0.9);
        graphics.fillCircle(24, 36, 4);
        graphics.fillCircle(32, 38, 4);
        graphics.fillCircle(40, 36, 4);

        // Resplandor de motores
        graphics.fillStyle(0xffdd88, 0.5);
        graphics.fillCircle(24, 36, 2);
        graphics.fillCircle(32, 38, 2);
        graphics.fillCircle(40, 36, 2);

        graphics.generateTexture(key, 64, 48);
        graphics.destroy();
    }

    // ============================================================
    // PROYECTIL: LASER - Raya brillante de energia
    // ============================================================
    static generateProjectileLaser(scene) {
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

        // Nucleo del laser (amarillo/blanco brillante)
        graphics.fillStyle(0xffffaa, 1);
        graphics.fillRect(2, 1, 12, 2);

        // Aura exterior (rojo/naranja)
        graphics.fillStyle(0xff6622, 0.7);
        graphics.fillRect(0, 0, 16, 4);

        // Punta brillante
        graphics.fillStyle(0xffffff, 0.9);
        graphics.fillRect(12, 1, 4, 2);

        // Cola difusa
        graphics.fillStyle(0xffaa44, 0.4);
        graphics.fillRect(0, 0, 6, 4);

        graphics.generateTexture('projectile-laser', 16, 4);
        graphics.destroy();
    }

    // ============================================================
    // PROYECTIL: MISIL - Proyectil con forma de cohete
    // ============================================================
    static generateProjectileMissile(scene) {
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

        // Cuerpo del misil
        graphics.fillStyle(0xaaaaaa, 1);
        graphics.fillRect(4, 2, 10, 4);

        // Punta
        graphics.fillStyle(0xff4444, 1);
        graphics.beginPath();
        graphics.moveTo(14, 2);
        graphics.lineTo(14, 6);
        graphics.lineTo(18, 4);
        graphics.closePath();
        graphics.fillPath();

        // Aletas traseras
        graphics.fillStyle(0x888888, 1);
        graphics.fillTriangle(2, 2, 6, 2, 4, 0);
        graphics.fillTriangle(2, 6, 6, 6, 4, 8);

        // Escape de fuego
        graphics.fillStyle(0xffaa22, 0.8);
        graphics.fillRect(0, 3, 3, 2);
        graphics.fillStyle(0xffdd66, 0.6);
        graphics.fillRect(0, 3, 2, 2);

        graphics.generateTexture('projectile-missile', 18, 8);
        graphics.destroy();
    }

    // ============================================================
    // PROYECTIL: ORBE - Esfera de energia pulsante
    // ============================================================
    static generateProjectileOrb(scene) {
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

        // Aura exterior difusa
        graphics.fillStyle(0x44aaff, 0.3);
        graphics.fillCircle(8, 8, 8);

        // Esfera principal
        graphics.fillStyle(0x66ccff, 0.8);
        graphics.fillCircle(8, 8, 5);

        // Nucleo brillante
        graphics.fillStyle(0xaaddff, 1);
        graphics.fillCircle(8, 8, 3);

        // Brillo central
        graphics.fillStyle(0xffffff, 0.9);
        graphics.fillCircle(7, 7, 1.5);

        graphics.generateTexture('projectile-orb', 16, 16);
        graphics.destroy();
    }

    // ============================================================
    // IMPACT: FLASH - Destello blanco de impacto
    // ============================================================
    static generateImpactFlash(scene) {
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

        // Aura exterior amarilla
        graphics.fillStyle(0xffaa22, 0.5);
        graphics.fillCircle(16, 16, 14);

        // Circulo naranja
        graphics.fillStyle(0xff8822, 0.7);
        graphics.fillCircle(16, 16, 10);

        // Nucleo blanco brillante
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(16, 16, 6);

        // Chispas radiales
        const sparkCount = 8;
        for (let i = 0; i < sparkCount; i++) {
            const angle = (i / sparkCount) * Math.PI * 2;
            const x1 = 16 + Math.cos(angle) * 8;
            const y1 = 16 + Math.sin(angle) * 8;
            const x2 = 16 + Math.cos(angle) * 14;
            const y2 = 16 + Math.sin(angle) * 14;
            graphics.lineStyle(2, 0xffdd44, 0.8);
            graphics.moveTo(x1, y1);
            graphics.lineTo(x2, y2);
            graphics.strokePath();
        }

        graphics.generateTexture('impact-flash', 32, 32);
        graphics.destroy();
    }

    // ============================================================
    // EXPLOSION: SMALL - Explosion pequena para naves destruidas
    // ============================================================
    static generateExplosionSmall(scene) {
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

        // Nube exterior (naranja oscuro)
        graphics.fillStyle(0xcc4400, 0.6);
        graphics.fillCircle(24, 24, 20);

        // Nube media (naranja)
        graphics.fillStyle(0xff6622, 0.8);
        graphics.fillCircle(24, 24, 14);
        graphics.fillCircle(18, 18, 10);
        graphics.fillCircle(30, 28, 8);

        // Nucleo (amarillo brillante)
        graphics.fillStyle(0xffcc22, 0.9);
        graphics.fillCircle(24, 24, 8);

        // Centro blanco
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(24, 24, 4);

        // Fragmentos dispersos
        const fragments = [
            { x: 6, y: 10, r: 3 }, { x: 40, y: 8, r: 2.5 },
            { x: 44, y: 30, r: 3.5 }, { x: 10, y: 40, r: 2 },
            { x: 36, y: 42, r: 2.5 }, { x: 20, y: 6, r: 2 },
            { x: 8, y: 26, r: 2 }, { x: 42, y: 18, r: 1.5 },
        ];
        fragments.forEach(f => {
            graphics.fillStyle(0xffaa22, 0.7);
            graphics.fillCircle(f.x, f.y, f.r);
        });

        graphics.generateTexture('explosion-small', 48, 48);
        graphics.destroy();
    }

    // ============================================================
    // GLOW EFFECTS - Efectos de resplandor para escuadrones
    // ============================================================
    static generateGlowEffects(scene) {
        // Glow dorado para escuadron activo
        const goldGlow = scene.make.graphics({ x: 0, y: 0, add: false });
        goldGlow.fillStyle(0xffaa00, 0.25);
        goldGlow.fillCircle(32, 32, 30);
        goldGlow.fillStyle(0xffcc44, 0.15);
        goldGlow.fillCircle(32, 32, 22);
        goldGlow.generateTexture('glow-gold', 64, 64);
        goldGlow.destroy();

        // Glow rojo para escuadron danado
        const redGlow = scene.make.graphics({ x: 0, y: 0, add: false });
        redGlow.fillStyle(0xff0000, 0.2);
        redGlow.fillCircle(32, 32, 28);
        redGlow.fillStyle(0xff4444, 0.1);
        redGlow.fillCircle(32, 32, 20);
        redGlow.generateTexture('glow-red', 64, 64);
        redGlow.destroy();

        // Glow azul para escuadron aliado
        const blueGlow = scene.make.graphics({ x: 0, y: 0, add: false });
        blueGlow.fillStyle(0x4488ff, 0.2);
        blueGlow.fillCircle(32, 32, 26);
        blueGlow.fillStyle(0x66aaff, 0.1);
        blueGlow.fillCircle(32, 32, 18);
        blueGlow.generateTexture('glow-blue', 64, 64);
        blueGlow.destroy();
    }

    // ============================================================
    // PARTICULA: DOT - Punto para sistemas de particulas
    // ============================================================
    static generateParticleDot(scene) {
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

        // Punto blanco con gradiente suave
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(4, 4, 3);
        graphics.fillStyle(0xffffff, 0.4);
        graphics.fillCircle(4, 4, 5);

        graphics.generateTexture('particle-dot', 8, 8);
        graphics.destroy();

        // Punto amarillo para chispas
        const g2 = scene.make.graphics({ x: 0, y: 0, add: false });
        g2.fillStyle(0xffcc44, 1);
        g2.fillCircle(3, 3, 2);
        g2.generateTexture('particle-spark', 6, 6);
        g2.destroy();
    }
}
