'use client';

import { Suspense } from 'react';
import { CombatScreen } from '@/features/destock-space/screens/CombatScreen';

export default function CombatPage() {
  return (
    <Suspense fallback={<div className="go2-combat-root" style={{ padding: 24, color: '#fcd34d' }}>Cargando combate…</div>}>
      <CombatScreen />
    </Suspense>
  );
}
