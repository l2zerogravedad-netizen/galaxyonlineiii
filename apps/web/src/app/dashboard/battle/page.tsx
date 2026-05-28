'use client';

import { BattlePage } from '@/features/battle/components/BattlePage';

/**
 * ========================================================================
 * Dashboard / Battle Route
 * ========================================================================
 * Ruta Next.js que renderiza la pagina completa de batalla.
 * Integra el BattleEngine con la UI visual para una experiencia
 * de simulacion de combate jugable.
 *
 * @route /dashboard/battle
 * ========================================================================
 */
export default function BattleRoute() {
  return <BattlePage />;
}
