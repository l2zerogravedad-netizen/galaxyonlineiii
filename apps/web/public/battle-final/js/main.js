/**
 * ============================================================
 * main.js - Entry Point
 * Inicializa Phaser 3 + HUD + Combat System integrado
 * Galaxy Online 3 - Sistema de Batalla
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('[GO3] Inicializando Sistema de Batalla...');

    // ============================================================
    // CONFIGURACION PHASER 3
    // ============================================================
    const config = {
        type: Phaser.AUTO,
        width: 960,
        height: 640,
        parent: 'game-container',
        backgroundColor: '#080c1a',
        scene: [BootScene, BattleScene],
        physics: {
            default: 'arcade',
            arcade: { gravity: { x: 0, y: 0 }, debug: false }
        },
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        render: { pixelArt: false, antialias: true },
    };

    // ============================================================
    // INICIALIZAR HUD (HTML overlay)
    // ============================================================
    let hud = null;
    try {
        const hudContainer = document.getElementById('hud-overlay');
        if (hudContainer && typeof BattleHUD !== 'undefined') {
            hud = new BattleHUD(hudContainer);
            window.GO3HUD = hud;
            console.log('[GO3] HUD inicializado');
        }
    } catch (e) {
        console.warn('[GO3] HUD no disponible:', e.message);
    }

    // ============================================================
    // INICIALIZAR PHASER
    // ============================================================
    try {
        const game = new Phaser.Game(config);
        window.GO3Game = game;

        // Integrar HUD con escena de batalla cuando esté lista
        game.events.on('ready', () => {
            console.log('[GO3] Juego listo');

            // Conectar HUD con BattleScene
            const battleScene = game.scene.getScene('BattleScene');
            if (battleScene && hud) {
                battleScene.hud = hud;

                // Configurar datos iniciales del HUD
                hud.setAttacker('SandoraD', 80, 9, 835600, 835600);
                hud.setDefender('RaccoN', 80, 9, 707000, 707000);
                hud.setRound(1);
                hud.addLog('Batalla iniciada. Ronda 1 comenzando...', 'system');

                // Callbacks de controles
                hud.onPauseClick = (paused) => {
                    battleScene.setPaused(paused);
                };
                hud.onSpeedClick = (speed) => {
                    battleScene.setSpeed(speed);
                };
                hud.onAutoClick = (auto) => {
                    battleScene.setAuto(auto);
                };

                console.log('[GO3] HUD conectado a BattleScene');
            }
        });

    } catch (error) {
        console.error('[GO3] Error:', error);
        document.getElementById('game-container').innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;
                justify-content:center;height:100%;color:#ff6666;text-align:center;">
                <h2>Error al cargar</h2>
                <p style="color:#8899aa;font-size:12px;">${error.message}</p>
            </div>`;
    }

    // ============================================================
    // LOADING BAR
    // ============================================================
    const loadingBar = document.getElementById('loading-bar-fill');
    let progress = 0;
    const loadInterval = setInterval(() => {
        progress += 5;
        if (loadingBar) loadingBar.style.width = progress + '%';
        if (progress >= 100) {
            clearInterval(loadInterval);
            setTimeout(() => {
                const ls = document.getElementById('loading-screen');
                if (ls) ls.classList.add('hidden');
            }, 300);
        }
    }, 30);

    // Debug helpers
    window.getBattleScene = () => window.GO3Game?.scene.getScene('BattleScene');
    console.log('[GO3] Inicializacion completada');
});
