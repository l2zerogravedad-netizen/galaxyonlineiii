'use client';

import { Go2BattleScreen } from '@/components/game/go2/Go2BattleScreen';
import { Go2BottomNav } from '@/components/game/go2/Go2BottomNav';
import { COMMANDERS } from '@/components/game/go2/go2-commander-data';

export default function BattlePage() {
  // Sample fleets for demo - will come from backend
  const sampleAttacker = COMMANDERS[4]; // Reggie (Skill)
  const sampleDefender = COMMANDERS[6]; // Gastaf (Super)

  return (
    <div className="flex min-h-dvh flex-col" style={{ background: '#000044' }}>
      <Go2BattleScreen
        attackerCommander={sampleAttacker}
        defenderCommander={sampleDefender}
        onBattleEnd={(result) => {
          console.log('Battle ended:', result);
        }}
        onExit={() => {
          window.history.back();
        }}
      />
      <Go2BottomNav />
    </div>
  );
}
