'use client';

import { useState } from 'react';
import { Go2CommanderPanel } from '@/components/game/go2/Go2CommanderPanel';
import { Go2FleetSystem } from '@/components/game/go2/Go2FleetSystem';
import Go2CommanderMerge from '@/components/game/go2/Go2CommanderMerge';
import Go2GemInterface from '@/components/game/go2/Go2GemInterface';
import Go2Hospital from '@/components/game/go2/Go2Hospital';
import { Go2DrawingSystem } from '@/components/game/go2/Go2DrawingSystem';
import { Go2InventoryGrid } from '@/components/game/go2/Go2InventoryGrid';
import { Go2BottomNav } from '@/components/game/go2/Go2BottomNav';
import { COMMANDERS } from '@/components/game/go2/go2-commander-data';
import { createGem } from '@/components/game/go2/go2-gem-system';
import { createEmptyScrollInventory } from '@/components/game/go2/go2-scroll-system';

type Tab = 'commanders' | 'fleets' | 'merge' | 'gems' | 'hospital' | 'draw' | 'inventory';

export default function FleetPage() {
  const [tab, setTab] = useState<Tab>('commanders');

  /* ── Sample data for preview (will come from API) ── */
  const sampleGems = [
    createGem('gem-1', 'red', 5, 'normal'),
    createGem('gem-2', 'blue', 3, 'refined'),
    createGem('gem-3', 'green', 7, 'perfect'),
    createGem('gem-4', 'yellow', 4, 'normal'),
    createGem('gem-5', 'purple', 6, 'refined'),
    createGem('gem-6', 'red', 8, 'normal'),
    createGem('gem-7', 'blue', 2, 'perfect'),
  ];

  const sampleScrolls = createEmptyScrollInventory();
  sampleScrolls[0].quantity = 5;
  sampleScrolls[1].quantity = 3;

  const tabs = [
    { key: 'commanders' as Tab, label: 'Commanders' },
    { key: 'fleets' as Tab, label: 'Fleets' },
    { key: 'merge' as Tab, label: 'Merge' },
    { key: 'gems' as Tab, label: 'Gems' },
    { key: 'hospital' as Tab, label: 'Hospital' },
    { key: 'draw' as Tab, label: 'Draw' },
    { key: 'inventory' as Tab, label: 'Inventory' },
  ];

  return (
    <div className="flex min-h-dvh flex-col" style={{ background: '#000044' }}>
      {/* Tab bar */}
      <div className="flex border-b-2 overflow-x-auto" style={{ borderColor: '#0066CC', background: '#000033' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2 text-xs font-bold whitespace-nowrap"
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
        {tab === 'merge' && <Go2CommanderMerge commanders={COMMANDERS} mergeScrolls={sampleScrolls.reduce((sum, s) => sum + s.quantity, 0)} />}
        {tab === 'gems' && <Go2GemInterface equippedGems={[null,null,null,null,null,null,null,null]} availableGems={sampleGems} onEquipGem={()=>{}} onUnequipGem={()=>{}} />}
        {tab === 'hospital' && <Go2Hospital beds={3} injured={[]} />}
        {tab === 'draw' && <Go2DrawingSystem corsairsGold={1250} />}
        {tab === 'inventory' && <Go2InventoryGrid commanders={COMMANDERS} />}
      </div>

      <Go2BottomNav />
    </div>
  );
}
