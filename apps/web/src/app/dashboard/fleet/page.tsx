'use client';

import { Go2CommanderPanel } from '@/components/game/go2/Go2CommanderPanel';
import { Go2BottomNav } from '@/components/game/go2/Go2BottomNav';

export default function FleetPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#0a0e1a]">
      <Go2CommanderPanel />
      <Go2BottomNav />
    </div>
  );
}
