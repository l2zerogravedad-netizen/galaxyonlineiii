'use client';

import { useState, useCallback } from 'react';
import {
  type Gem,
  type GemType,
  GEM_COLORS,
  GEM_GRADIENTS,
  GEM_STAT_SHORT,
  GEM_TYPE_LABELS,
  QUALITY_LABELS,
  QUALITY_MULTIPLIERS,
  MAX_GEM_SLOTS,
  calculateGemBonus,
  calculateTotalGemBonuses,
} from './go2-gem-system';

/* ────────────────────────── helpers ────────────────────────── */

function GemSlot({
  gem,
  slotIndex,
  isSelected,
  onClick,
}: {
  gem: Gem | null;
  slotIndex: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  if (!gem) {
    return (
      <button
        onClick={onClick}
        className={`flex aspect-square w-[80px] flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-150 ${
          isSelected
            ? 'border-[#ffd54f] bg-[#ffd54f]/10 shadow-[0_0_12px_rgba(255,213,79,0.3)]'
            : 'border-white/15 bg-gradient-to-br from-[#1a2744] to-[#0f1f38] hover:border-white/30 hover:bg-[#1a2d4a]'
        }`}
        title={`Slot ${slotIndex + 1} — Click to equip gem`}
      >
        <span className="text-lg text-white/15">+</span>
        <span className="mt-0.5 text-[9px] uppercase tracking-wider text-white/25">
          Slot {slotIndex + 1}
        </span>
      </button>
    );
  }

  const bonus = calculateGemBonus(gem);
  const color = GEM_COLORS[gem.type];
  const gradient = GEM_GRADIENTS[gem.type];
  const statShort = GEM_STAT_SHORT[gem.type];

  return (
    <button
      onClick={onClick}
      className={`relative flex aspect-square w-[80px] flex-col items-center justify-center rounded-xl border-2 transition-all duration-150 ${
        isSelected
          ? 'border-[#ffd54f] shadow-[0_0_16px_rgba(255,213,79,0.4)]'
          : 'border-white/20 hover:border-white/40 hover:shadow-lg'
      } bg-gradient-to-br ${gradient}`}
      style={{ boxShadow: isSelected ? undefined : `0 4px 12px ${color}33` }}
      title={`${GEM_TYPE_LABELS[gem.type]} Lv.${gem.level} (${QUALITY_LABELS[gem.quality]}) — Click to unequip`}
    >
      {/* Gem icon */}
      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/40 bg-black/20 text-lg font-bold text-white">
        {gem.type === 'red' && 'R'}
        {gem.type === 'blue' && 'B'}
        {gem.type === 'green' && 'G'}
        {gem.type === 'yellow' && 'T'}
        {gem.type === 'purple' && 'A'}
      </div>

      {/* Bonus value */}
      <span className="mt-1 text-[15px] font-extrabold text-white drop-shadow">
        +{bonus}
      </span>

      {/* Stat label */}
      <span className="text-[9px] font-bold uppercase tracking-wider text-white/80">
        {statShort}
      </span>

      {/* Quality badge */}
      <span
        className={`absolute -right-1.5 -top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-white/30 text-[8px] font-bold text-white ${
          gem.quality === 'perfect'
            ? 'bg-[#ffd54f] text-black'
            : gem.quality === 'refined'
              ? 'bg-[#4488ff]'
              : 'bg-[#666]'
        }`}
      >
        {gem.quality === 'perfect' ? 'P' : gem.quality === 'refined' ? 'R' : 'N'}
      </span>

      {/* Level badge */}
      <span className="absolute -bottom-1.5 -left-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-white/30 bg-black/60 px-1 text-[8px] font-bold text-white">
        Lv.{gem.level}
      </span>
    </button>
  );
}

function GemInventoryItem({
  gem,
  isSelected,
  onClick,
}: {
  gem: Gem;
  isSelected: boolean;
  onClick: () => void;
}) {
  const bonus = calculateGemBonus(gem);
  const color = GEM_COLORS[gem.type];

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center rounded-lg border-2 p-2.5 transition-all duration-150 ${
        isSelected
          ? 'border-[#ffd54f] bg-[#ffd54f]/10 shadow-[0_0_12px_rgba(255,213,79,0.3)]'
          : 'border-white/10 bg-gradient-to-br from-[#1a2744] to-[#0f1f38] hover:border-white/25 hover:bg-[#1a2d4a]'
      }`}
      title={`${GEM_TYPE_LABELS[gem.type]} — Level ${gem.level} — ${QUALITY_LABELS[gem.quality]} — +${bonus} ${GEM_STAT_SHORT[gem.type]}`}
    >
      {/* Gem type icon */}
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold text-white"
        style={{
          borderColor: color,
          background: `${color}33`,
        }}
      >
        {gem.type === 'red' && 'R'}
        {gem.type === 'blue' && 'B'}
        {gem.type === 'green' && 'G'}
        {gem.type === 'yellow' && 'T'}
        {gem.type === 'purple' && 'A'}
      </div>

      {/* Bonus */}
      <span
        className="mt-1 text-[13px] font-extrabold"
        style={{ color }}
      >
        +{bonus}
      </span>

      {/* Labels */}
      <span className="text-[8px] font-bold uppercase tracking-wider text-white/50">
        {GEM_STAT_SHORT[gem.type]}
      </span>

      {/* Level + Quality row */}
      <div className="mt-1 flex items-center gap-1">
        <span className="rounded bg-black/40 px-1 text-[7px] font-bold text-white/70">
          Lv.{gem.level}
        </span>
        <span
          className={`rounded px-1 text-[7px] font-bold ${
            gem.quality === 'perfect'
              ? 'bg-[#ffd54f]/30 text-[#ffd54f]'
              : gem.quality === 'refined'
                ? 'bg-[#4488ff]/30 text-[#64b5f6]'
                : 'bg-white/10 text-white/50'
          }`}
        >
          {QUALITY_LABELS[gem.quality][0]}
        </span>
      </div>
    </button>
  );
}

/* ────────────────────────── Gem Bonus Summary ────────────────────────── */

function GemBonusSummary({ gems }: { gems: (Gem | null)[] }) {
  const bonuses = calculateTotalGemBonuses(gems);

  return (
    <div className="flex items-center justify-center gap-4 rounded-lg border border-[#1976d2]/20 bg-[#081428]/60 px-4 py-2.5">
      <div className="text-center">
        <span className="block text-[10px] uppercase tracking-wider text-[#ff6b6b]">Acc</span>
        <span className="text-[14px] font-extrabold text-white">+{bonuses.accuracy}</span>
      </div>
      <div className="h-6 w-px bg-white/10" />
      <div className="text-center">
        <span className="block text-[10px] uppercase tracking-wider text-[#4488ff]">Spd</span>
        <span className="text-[14px] font-extrabold text-white">+{bonuses.speed}</span>
      </div>
      <div className="h-6 w-px bg-white/10" />
      <div className="text-center">
        <span className="block text-[10px] uppercase tracking-wider text-[#44ff44]">Ddg</span>
        <span className="text-[14px] font-extrabold text-white">+{bonuses.dodge}</span>
      </div>
      <div className="h-6 w-px bg-white/10" />
      <div className="text-center">
        <span className="block text-[10px] uppercase tracking-wider text-[#ffdd44]">Elec</span>
        <span className="text-[14px] font-extrabold text-white">+{bonuses.electron}</span>
      </div>
    </div>
  );
}

/* ────────────────────────── main component ────────────────────────── */

interface Go2GemInterfaceProps {
  equippedGems: (Gem | null)[];
  availableGems: Gem[];
  onEquipGem: (gem: Gem, slotIndex: number) => void;
  onUnequipGem: (slotIndex: number) => void;
  commanderName?: string;
}

export default function Go2GemInterface({
  equippedGems,
  availableGems,
  onEquipGem,
  onUnequipGem,
  commanderName = 'Commander',
}: Go2GemInterfaceProps) {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedGem, setSelectedGem] = useState<Gem | null>(null);

  // Ensure we always have exactly MAX_GEM_SLOTS
  const slots = Array.from(
    { length: MAX_GEM_SLOTS },
    (_, i) => equippedGems[i] ?? null
  );

  const handleSlotClick = useCallback(
    (slotIndex: number) => {
      const existingGem = slots[slotIndex];

      // If there's a gem, unequip it
      if (existingGem) {
        onUnequipGem(slotIndex);
        setSelectedSlot(null);
        return;
      }

      // If a gem is selected from inventory, equip it
      if (selectedGem) {
        onEquipGem(selectedGem, slotIndex);
        setSelectedGem(null);
        setSelectedSlot(null);
        return;
      }

      // Otherwise toggle slot selection
      setSelectedSlot((prev) => (prev === slotIndex ? null : slotIndex));
    },
    [slots, selectedGem, onEquipGem, onUnequipGem]
  );

  const handleGemClick = useCallback(
    (gem: Gem) => {
      // If gem already selected, deselect
      if (selectedGem?.id === gem.id) {
        setSelectedGem(null);
        return;
      }

      // If a slot is selected and empty, equip immediately
      if (selectedSlot !== null && !slots[selectedSlot]) {
        onEquipGem(gem, selectedSlot);
        setSelectedSlot(null);
        setSelectedGem(null);
        return;
      }

      // Otherwise select the gem
      setSelectedGem(gem);
    },
    [selectedGem, selectedSlot, slots, onEquipGem]
  );

  // How many empty slots remain
  const emptySlots = slots.filter((g) => g === null).length;

  return (
    <div className="flex w-[360px] flex-col gap-3 overflow-hidden rounded-xl border border-[#1976d2]/30 bg-gradient-to-b from-[#0a1f44] to-[#060e1f] shadow-2xl">
      {/* ─── Header ─── */}
      <div className="border-b border-[#1976d2]/30 bg-[#0d2b5e]/60 px-4 py-3">
        <h3 className="text-center text-[12px] font-bold uppercase tracking-[0.2em] text-[#64b5f6]">
          {commanderName} — Gems
        </h3>
      </div>

      {/* ─── Equipped Gem Slots ─── */}
      <div className="flex flex-col items-center gap-2 px-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
          Equipped Slots ({MAX_GEM_SLOTS - emptySlots}/{MAX_GEM_SLOTS})
        </span>
        <div className="flex items-center justify-center gap-3 py-1">
          {slots.map((gem, i) => (
            <GemSlot
              key={i}
              gem={gem}
              slotIndex={i}
              isSelected={selectedSlot === i}
              onClick={() => handleSlotClick(i)}
            />
          ))}
        </div>
      </div>

      {/* ─── Bonus Summary ─── */}
      <div className="px-4">
        <GemBonusSummary gems={slots} />
      </div>

      {/* ─── Divider ─── */}
      <div className="mx-4 border-t border-[#1976d2]/20" />

      {/* ─── Available Gems ─── */}
      <div className="flex flex-col gap-2 px-4 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            Available Gems
          </span>
          <span className="text-[10px] text-white/30">
            {availableGems.length} total
          </span>
        </div>

        {availableGems.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 bg-[#081428]/40 py-6 text-center">
            <span className="text-[11px] text-white/30">
              No gems in inventory.
            </span>
            <p className="mt-1 text-[9px] text-white/20">
              Gems can be obtained from events, rewards, and the shop.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 pb-3">
            {availableGems.map((gem) => (
              <GemInventoryItem
                key={gem.id}
                gem={gem}
                isSelected={selectedGem?.id === gem.id}
                onClick={() => handleGemClick(gem)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── Instructions ─── */}
      <div className="border-t border-[#1976d2]/20 bg-[#081428]/40 px-4 py-2.5">
        <p className="text-center text-[9px] leading-relaxed text-white/30">
          Click an empty slot to select it, then click a gem to equip.
          <br />
          Click an equipped gem to remove it back to inventory.
        </p>
      </div>
    </div>
  );
}
