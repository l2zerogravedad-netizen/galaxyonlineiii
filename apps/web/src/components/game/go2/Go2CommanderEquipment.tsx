'use client';

import { useState } from 'react';
import {
  type Commander,
  type EquipmentItem,
  calculateEquipmentBonuses,
  WEAPON_QUALITY_BONUS,
  DEFENSE_QUALITY_BONUS,
  QUALITY_COLORS,
} from './go2-commander-data';

/* ────────────────────────── quality style helpers ────────────────────────── */

const QUALITY_BG: Record<string, string> = {
  S: '#8b6914',
  A: '#1b5e20',
  B: '#0d47a1',
  C: '#424242',
  D: '#8e0000',
};

const QUALITY_BORDER: Record<string, string> = {
  S: '#ffd54f',
  A: '#4caf50',
  B: '#42a5f5',
  C: '#757575',
  D: '#e53935',
};

/* ────────────────────────── equipment slot ────────────────────────── */

interface SlotProps {
  item: EquipmentItem | null;
  index: number;
  type: 'weapon' | 'defense';
  onClick: () => void;
}

function EquipmentSlot({ item, index, onClick }: SlotProps) {
  if (!item) {
    return (
      <button
        onClick={onClick}
        className="flex aspect-square flex-col items-center justify-center border-2 border-dashed transition-colors hover:border-[#42a5f5]"
        style={{
          backgroundColor: '#000033',
          borderColor: '#0066CC44',
          borderRadius: '8px',
        }}
      >
        <span className="text-lg text-white/20">+</span>
      </button>
    );
  }

  const bgColor = QUALITY_BG[item.quality] ?? QUALITY_BG.C;
  const borderColor = QUALITY_BORDER[item.quality] ?? QUALITY_BORDER.C;

  return (
    <button
      onClick={onClick}
      className="relative flex aspect-square flex-col items-center justify-center border-2 transition-opacity hover:opacity-80"
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        borderRadius: '8px',
      }}
    >
      <span className="text-xl">{item.icon}</span>
      {/* quality badge */}
      <span
        className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded text-[10px] font-extrabold text-white"
        style={{
          backgroundColor: borderColor,
          border: '1px solid rgba(255,255,255,0.3)',
        }}
      >
        {item.quality}
      </span>
    </button>
  );
}

/* ────────────────────────── equipment selector modal ────────────────────────── */

interface EquipmentSelectorProps {
  slotType: 'weapon' | 'defense';
  onSelect: (item: EquipmentItem | null) => void;
  onClose: () => void;
}

const ALL_QUALITIES: Array<'S' | 'A' | 'B' | 'C' | 'D'> = ['S', 'A', 'B', 'C', 'D'];

function EquipmentSelector({ slotType, onSelect, onClose }: EquipmentSelectorProps) {
  const qualities = ALL_QUALITIES;

  const handleSelect = (quality: string) => {
    const item: EquipmentItem = {
      id: `${slotType}-${quality}-${Date.now()}`,
      name: `${slotType === 'weapon' ? 'Weapon' : 'Armor'} ${quality}`,
      quality: quality as 'S' | 'A' | 'B' | 'C' | 'D',
      icon: slotType === 'weapon' ? '⚔️' : '🛡️',
    };
    onSelect(item);
    onClose();
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,33,0.85)' }}
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-[240px] flex-col gap-3 rounded-xl border p-4"
        style={{
          backgroundColor: '#000044',
          borderColor: '#0066CC',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div
          className="-mx-4 -mt-4 border-b px-4 py-2 text-center text-xs font-bold uppercase tracking-widest"
          style={{
            backgroundColor: '#0066CC',
            borderColor: '#0066CC',
            color: '#ffffff',
          }}
        >
          Select {slotType === 'weapon' ? 'Weapon' : 'Armor'}
        </div>

        {/* quality grid */}
        <div className="grid grid-cols-5 gap-2">
          {qualities.map((q) => (
            <button
              key={q}
              onClick={() => handleSelect(q)}
              className="flex aspect-square items-center justify-center rounded text-sm font-extrabold text-white transition-opacity hover:opacity-80"
              style={{
                backgroundColor: QUALITY_BG[q],
                border: `2px solid ${QUALITY_BORDER[q]}`,
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* unequip */}
        <button
          onClick={() => {
            onSelect(null);
            onClose();
          }}
          className="w-full rounded border py-2 text-[10px] font-bold text-white/60 transition-colors hover:text-white"
          style={{
            backgroundColor: '#000033',
            borderColor: '#0066CC66',
          }}
        >
          Remove Item
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────── main component ────────────────────────── */

interface Go2CommanderEquipmentProps {
  commander: Commander;
  onEquipChange?: (equipment: Commander['equipment']) => void;
}

export function Go2CommanderEquipment({ commander, onEquipChange }: Go2CommanderEquipmentProps) {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectorType, setSelectorType] = useState<'weapon' | 'defense'>('weapon');
  const [selectorIndex, setSelectorIndex] = useState(0);

  // Calculate total bonuses
  const bonuses = calculateEquipmentBonuses(commander);

  const openSelector = (type: 'weapon' | 'defense', index: number) => {
    setSelectorType(type);
    setSelectorIndex(index);
    setSelectorOpen(true);
  };

  const handleSelect = (item: EquipmentItem | null) => {
    const newEquipment = {
      weapons: [...commander.equipment.weapons],
      defense: [...commander.equipment.defense],
    };
    if (selectorType === 'weapon') {
      newEquipment.weapons[selectorIndex] = item;
    } else {
      newEquipment.defense[selectorIndex] = item;
    }
    onEquipChange?.(newEquipment);
    setSelectorOpen(false);
  };

  const handleAutoEquip = () => {
    const newEquipment = {
      weapons: [
        { id: 'w-S', name: 'Weapon S', quality: 'S' as const, icon: '⚔️' },
        { id: 'w-A', name: 'Weapon A', quality: 'A' as const, icon: '⚔️' },
        null,
        null,
      ] as (EquipmentItem | null)[],
      defense: [
        { id: 'd-B', name: 'Armor B', quality: 'B' as const, icon: '🛡️' },
        { id: 'd-C', name: 'Armor C', quality: 'C' as const, icon: '🛡️' },
        null,
        null,
      ] as (EquipmentItem | null)[],
    };
    onEquipChange?.(newEquipment);
  };

  const handleRemoveAll = () => {
    const newEquipment = {
      weapons: [null, null, null, null] as (EquipmentItem | null)[],
      defense: [null, null, null, null] as (EquipmentItem | null)[],
    };
    onEquipChange?.(newEquipment);
  };

  // Count equipped items
  const weaponCount = commander.equipment.weapons.filter(Boolean).length;
  const defenseCount = commander.equipment.defense.filter(Boolean).length;

  return (
    <div
      className="relative flex flex-col gap-3 rounded-xl border p-4"
      style={{
        backgroundColor: '#000044',
        borderColor: '#0066CC',
      }}
    >
      {/* ── equipment selector modal ── */}
      {selectorOpen && (
        <EquipmentSelector
          slotType={selectorType}
          onSelect={handleSelect}
          onClose={() => setSelectorOpen(false)}
        />
      )}

      {/* ── header ── */}
      <div
        className="-mx-4 -mt-4 border-b px-4 py-2 text-center text-xs font-bold uppercase tracking-widest"
        style={{
          backgroundColor: '#0066CC',
          borderColor: '#0066CC',
          color: '#ffffff',
        }}
      >
        EQUIPMENT
      </div>

      {/* ── weapons ── */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64b5f6]">
            Weapons
          </span>
          <span className="text-[9px] text-white/40">
            {weaponCount}/4
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {commander.equipment.weapons.map((item, i) => (
            <EquipmentSlot
              key={`w-${i}`}
              item={item}
              index={i}
              type="weapon"
              onClick={() => openSelector('weapon', i)}
            />
          ))}
        </div>
      </div>

      {/* ── defense ── */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64b5f6]">
            Defense
          </span>
          <span className="text-[9px] text-white/40">
            {defenseCount}/4
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {commander.equipment.defense.map((item, i) => (
            <EquipmentSlot
              key={`d-${i}`}
              item={item}
              index={i}
              type="defense"
              onClick={() => openSelector('defense', i)}
            />
          ))}
        </div>
      </div>

      {/* ── equipment effects ── */}
      {(weaponCount > 0 || defenseCount > 0) && (
        <div
          className="flex flex-col gap-2 rounded border p-2.5"
          style={{
            backgroundColor: '#000033',
            borderColor: '#0066CC44',
          }}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#ffd54f]">
            Equipment Effects
          </div>

          {bonuses.accuracyBonus > 0 && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-[#90caf9]">
                <span>🎯</span> Accuracy
              </span>
              <span className="font-bold text-[#4caf50]">+{bonuses.accuracyBonus}%</span>
            </div>
          )}
          {bonuses.electronBonus > 0 && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-[#90caf9]">
                <span>⚡</span> Electron
              </span>
              <span className="font-bold text-[#4caf50]">+{bonuses.electronBonus}%</span>
            </div>
          )}
          {bonuses.dodgeBonus > 0 && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-[#90caf9]">
                <span>✈️</span> Dodge
              </span>
              <span className="font-bold text-[#4caf50]">+{bonuses.dodgeBonus}%</span>
            </div>
          )}
          {bonuses.speedBonus > 0 && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-[#90caf9]">
                <span>🚀</span> Speed
              </span>
              <span className="font-bold text-[#4caf50]">+{bonuses.speedBonus}%</span>
            </div>
          )}

          {bonuses.accuracyBonus === 0 &&
            bonuses.electronBonus === 0 &&
            bonuses.dodgeBonus === 0 &&
            bonuses.speedBonus === 0 && (
              <div className="text-[10px] italic text-white/30">No active bonuses</div>
            )}
        </div>
      )}

      {/* ── action buttons ── */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleAutoEquip}
          className="rounded border-2 py-2.5 text-[11px] font-bold transition-opacity hover:opacity-80"
          style={{
            backgroundColor: '#0066CC',
            borderColor: '#0066CC',
            color: '#ffffff',
          }}
        >
          Auto-Equip
        </button>
        <button
          onClick={handleRemoveAll}
          className="rounded border-2 py-2.5 text-[11px] font-bold transition-opacity hover:opacity-80"
          style={{
            backgroundColor: '#000033',
            borderColor: '#0066CC',
            color: '#90caf9',
          }}
        >
          Remove All
        </button>
      </div>
    </div>
  );
}
