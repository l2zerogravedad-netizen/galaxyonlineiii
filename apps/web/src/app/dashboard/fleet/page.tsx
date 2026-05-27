'use client';

import { useState } from 'react';
import { Go2CommanderPanel } from '@/components/game/go2/Go2CommanderPanel';
import { Go2FleetSystem } from '@/components/game/go2/Go2FleetSystem';
import { Go2CommanderMerge } from '@/components/game/go2/Go2CommanderMerge';
import { Go2BottomNav } from '@/components/game/go2/Go2BottomNav';
import { COMMANDERS } from '@/components/game/go2/go2-commander-data';

type Tab = 'commanders' | 'fleets' | 'merge';

export default function FleetPage() {
  const [tab, setTab] = useState<Tab>('commanders');

  return (
    <div className="flex min-h-dvh flex-col" style={{ background: '#000044' }}>
      {/* Tab bar */}
      <div className="flex border-b-2" style={{ borderColor: '#0066CC', background: '#000033' }}>
        {[
          { key: 'commanders' as Tab, label: 'Commanders' },
          { key: 'fleets' as Tab, label: 'Fleets' },
          { key: 'merge' as Tab, label: 'Merge' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-6 py-2 text-sm font-bold"
            style={{
              background: tab === t.key ? '#003399' : '#000022',
              color: tab === t.key ? '#fff' : '#666',
              borderRight: '1px solid #0066CC',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {tab === 'commanders' && <Go2CommanderPanel />}
        {tab === 'fleets' && <Go2FleetSystem commanders={COMMANDERS} />}
        {tab === 'merge' && <Go2CommanderMerge commanders={COMMANDERS} />}
      </div>

      <Go2BottomNav />
    </div>
  );
}
