/**
 * ========================================================================
 * Galaxy Online 3 — Battle Engine
 * ========================================================================
 * Motor de batalla por rondas replicando las mecánicas de GO2.
 *
 * Exporta todos los sistemas del motor de batalla:
 *   - BattleEngine: máquina de estados principal
 *   - DamageSystem: fórmulas de cálculo de daño
 *   - WeaponSystem: tipos de armas y matriz de daño
 *   - ShieldSystem: escudos y casco
 *   - CommanderSystem: comandantes e iniciativa
 *   - types: todos los tipos e interfaces
 *
 * @example
 * ```typescript
 * import { createBattleEngine, createShipStack, createCommander } from './engine';
 *
 * const attacker = createShipStack({
 *   id: 'atk1',
 *   shipType: 'cruiser',
 *   totalShips: 500,
 *   position: 1,
 *   faction: 'attacker',
 *   commander: createBalancedCommander('Koshiba', 3),
 * });
 *
 * const engine = createBattleEngine({
 *   attackerStacks: [attacker],
 *   defenderStacks: [defender],
 * });
 *
 * engine.onEvent((event) => console.log(event));
 * engine.runBattle();
 * ```
 * ========================================================================
 */

// Types
export * from './types';

// Systems
export * from './DamageSystem';
export * from './WeaponSystem';
export * from './ShieldSystem';
export * from './CommanderSystem';

// Main Engine
export { BattleEngine, createBattleEngine } from './BattleEngine';
