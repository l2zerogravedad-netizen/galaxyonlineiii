'use client';

import { useState } from 'react';
import {
  type Commander,
  type EquipmentItem,
  COMMANDERS,
  RARITY_COLORS,
  RARITY_DOT_CLASS,
  QUALITY_COLORS,
} from './go2-commander-data';

/* ────────────────────────── helpers ────────────────────────── */

function EquipmentSlot({ item, index }: { item: EquipmentItem | null; index: number }) {
  if (!item) {
    return (
      <div
        className="relative flex aspect-square flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-white/10 bg-gradient-to-br from-[#1a2744] to-[#0f1f38]"
        key={index}
      >
        <span className="text-xl text-white/10">+</span>
      </div>
    );
  }

  const q = QUALITY_COLORS[item.quality] ?? QUALITY_COLORS.C;

  return (
    <div
      className={`relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-[10px] border-2 ${q.border} bg-gradient-to-br from-[#1a2744] to-[#0f1f38]`}
      key={item.id}
    >
      <span className="mb-0.5 text-[28px]">{item.icon}</span>
      <span
        className={`absolute bottom-1 right-1 flex h-[22px] w-[22px] items-center justify-center rounded-[6px] border border-white/30 text-[11px] font-extrabold text-white ${q.bg}`}
      >
        {item.quality}
      </span>
    </div>
  );
}

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex justify-center gap-1.5 border-b border-t border-[#1976d2]/15 py-2.5">
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className={`text-[22px] ${
            i < count ? 'text-[#ffd54f]' : 'text-white/10'
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

/* ────────────────────────── sub-components ────────────────────────── */

function CommanderList({
  commanders,
  selectedId,
  onSelect,
}: {
  commanders: Commander[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex w-[170px] shrink-0 flex-col overflow-hidden rounded-xl border border-[#1976d2]/30 bg-gradient-to-b from-[#0d47a1]/30 to-[#081428]/80">
      {/* header */}
      <div className="border-b border-[#1976d2]/30 bg-[#1976d2]/20 px-2.5 py-2.5 text-center text-[11px] font-bold uppercase tracking-widest text-[#64b5f6]">
        Commanders
      </div>

      {/* list */}
      <div className="flex-1 overflow-y-auto">
        {commanders.map((cmd) => {
          const isActive = cmd.id === selectedId;
          return (
            <button
              key={cmd.id}
              onClick={() => onSelect(cmd.id)}
              className={`flex w-full items-center gap-2 border-b border-[#1976d2]/10 px-3 py-2 text-left text-xs font-semibold transition-colors ${
                isActive
                  ? 'border-l-[3px] border-l-[#ffd54f] bg-gradient-to-r from-[#ffd54f]/20 to-[#ffb300]/30 font-bold text-[#ffd54f]'
                  : 'border-l-[3px] border-l-transparent text-white/80 hover:bg-[#1976d2]/15'
              }`}
            >
              <img
                src={`/assets/cmd_${cmd.id}.webp`}
                alt={cmd.name}
                className="h-7 w-7 shrink-0 rounded-md border border-white/20 object-cover"
                loading="lazy"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${RARITY_DOT_CLASS[cmd.rarity]}`}
              />
              <span className="truncate">{cmd.name}</span>
              <span className="ml-auto shrink-0 text-[10px] text-white/40">
                Lv.{cmd.level}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CommanderPortrait({ id, name, rarityColor }: { id: string; name: string; rarityColor: string }) {
  return (
    <div
      className="flex h-[90px] w-[90px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] border-2 bg-gradient-to-br from-[#1a2744] to-[#0a1428]"
      style={{ borderColor: `${rarityColor}88` }}
    >
      <img
        src={`/assets/cmd_${id}.webp`}
        alt={name}
        className="h-full w-full object-cover"
        onError={(e) => {
          // Fallback to initial if image fails to load
          const target = e.currentTarget;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `<span style="color:${rarityColor};font-size:40px;font-weight:900;">${name.charAt(0).toUpperCase()}</span>`;
          }
        }}
      />
    </div>
  );
}

function CommanderCard({ commander }: { commander: Commander }) {
  const xpPct = Math.round((commander.exp / commander.expMax) * 100);
  const rarityColor = RARITY_COLORS[commander.rarity];

  return (
    <div className="relative flex min-w-0 flex-1 flex-col gap-2.5 rounded-xl border border-[#1976d2]/25 bg-gradient-to-b from-[#0c2d5c]/60 to-[#060f23]/90 p-4">
      {/* top accent line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#42a5f5] to-transparent" />

      {/* name title */}
      <div className="rounded-lg border border-[#42a5f5]/30 bg-gradient-to-r from-[#0d47a1]/60 via-[#1565c0]/40 to-[#0d47a1]/60 px-5 py-2.5 text-center text-lg font-extrabold text-white">
        {commander.name}
      </div>

      {/* portrait + info */}
      <div className="flex gap-4">
        <CommanderPortrait id={commander.id} name={commander.name} rarityColor={rarityColor} />
        <div className="flex flex-1 flex-col justify-center gap-2">
          <div className="flex items-center gap-2.5 text-[13px]">
            <span className="min-w-[55px] font-semibold text-[#64b5f6]">Skill:</span>
            <span className="font-bold text-white">{commander.skill}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[13px]">
            <span className="min-w-[55px] font-semibold text-[#64b5f6]">Status:</span>
            <span className="rounded-md border border-[#42a5f5]/40 bg-gradient-to-b from-[#1565c0]/60 to-[#0d47a1]/80 px-3.5 py-1 text-xs font-bold text-white">
              {commander.status}
            </span>
          </div>
        </div>
      </div>

      {/* level + xp bar */}
      <div className="flex items-center gap-2.5 rounded-lg border border-[#1976d2]/15 bg-black/20 px-3 py-2">
        <span className="text-xl font-extrabold text-white">LV.</span>
        <span className="rounded-md border border-[#42a5f5] bg-gradient-to-b from-[#1565c0] to-[#0d47a1] px-3.5 py-1 text-xl font-extrabold text-[#ffd54f]">
          {commander.level}
        </span>
        <div className="relative flex h-[22px] flex-1 items-center justify-center overflow-hidden rounded-md border border-[#1976d2]/20 bg-black/30">
          <div
            className="absolute inset-y-0 left-0 rounded-md bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#42a5f5]"
            style={{ width: `${xpPct}%` }}
          />
          <span className="relative z-10 text-[11px] font-bold text-[#90caf9]">
            {commander.exp} / {commander.expMax}
          </span>
        </div>
        <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-[#64b5f6] bg-gradient-to-br from-[#42a5f5] to-[#1976d2] text-lg font-bold text-white">
          +
        </button>
      </div>

      {/* stars */}
      <StarRow count={commander.stars} />

      {/* 4 stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: '🎯', label: 'Acc', value: commander.stats.accuracy },
          { icon: '🚀', label: 'Spd', value: commander.stats.speed },
          { icon: '✈️', label: 'Ddg', value: commander.stats.dodge },
          { icon: '🔲', label: 'Elec', value: commander.stats.electron },
        ].map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center gap-1 rounded-lg border border-[#1976d2]/15 bg-black/25 px-2 py-2.5"
          >
            <span className="text-2xl">{s.icon}</span>
            <span className="text-[22px] font-extrabold text-white">{s.value}</span>
            <span className="text-[9px] uppercase text-white/40">{s.label}</span>
          </div>
        ))}
      </div>

      {/* weapons */}
      <div className="mt-1 text-[10px] uppercase tracking-widest text-white/40">
        Weapons
      </div>
      <div className="grid grid-cols-4 gap-2">
        {commander.equipment.weapons.map((item, i) => (
          <EquipmentSlot key={`w-${i}`} item={item} index={i} />
        ))}
      </div>

      {/* defense */}
      <div className="mt-1 text-[10px] uppercase tracking-widest text-white/40">
        Defense
      </div>
      <div className="grid grid-cols-4 gap-2">
        {commander.equipment.defense.map((item, i) => (
          <EquipmentSlot key={`d-${i}`} item={item} index={i} />
        ))}
      </div>

      {/* actions */}
      <div className="mt-1.5 grid grid-cols-2 gap-3 border-t border-[#1976d2]/15 pt-3">
        <button className="rounded-xl border-2 border-[#1976d2]/50 bg-gradient-to-b from-[#1565c0]/80 to-[#0d47a1]/90 py-3 text-xs font-bold text-white">
          Convertir
        </button>
        <button className="rounded-xl border-2 border-[#1976d2]/50 bg-gradient-to-b from-[#1565c0]/80 to-[#0d47a1]/90 py-3 text-xs font-bold text-white">
          Eliminar
        </button>
      </div>
    </div>
  );
}

function FleetPanel() {
  const [activeTab, setActiveTab] = useState<'min' | 'obj'>('min');

  const slots = Array.from({ length: 9 }, (_, i) => i);

  return (
    <div className="flex w-[240px] shrink-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-[#141428]/80 to-[#0a0a19]/95">
      {/* tabs */}
      <div className="flex">
        <button
          onClick={() => setActiveTab('min')}
          className={`flex-1 border px-2 py-2.5 text-center text-[11px] font-bold ${
            activeTab === 'min'
              ? 'border-[#42a5f5]/30 bg-gradient-to-b from-[#1565c0]/80 to-[#0d47a1]/90 text-white'
              : 'border-white/5 bg-[#141428]/50 text-white/40'
          }`}
          style={{ borderRadius: '12px 0 0 0' }}
        >
          Min. Alcance
        </button>
        <button
          onClick={() => setActiveTab('obj')}
          className={`flex-1 border px-2 py-2.5 text-center text-[11px] font-bold ${
            activeTab === 'obj'
              ? 'border-[#42a5f5]/30 bg-gradient-to-b from-[#1565c0]/80 to-[#0d47a1]/90 text-white'
              : 'border-white/5 bg-[#141428]/50 text-white/40'
          }`}
          style={{ borderRadius: '0 12px 0 0' }}
        >
          Obj. Proximo
        </button>
      </div>

      {/* 3x3 grid */}
      <div className="flex flex-1 flex-col items-center justify-center gap-2.5 p-4">
        <p className="text-center text-[11px] italic text-[#90caf9]/70">
          Consejo: puedes cambiar la formacion aqui.
        </p>
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex gap-2.5">
            {[0, 1, 2].map((col) => {
              const idx = row * 3 + col;
              return (
                <div
                  key={idx}
                  className="flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 border-[#42a5f5]/60 bg-gradient-to-b from-[#1a3a5c]/80 to-[#0d2137]/90 text-2xl text-[#64b5f6]"
                >
                  ⚓
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* fleet stats */}
      <div className="grid grid-cols-2 gap-1.5 border-t border-white/10 bg-black/30 p-3">
        {[
          { label: 'Movim.', value: '--' },
          { label: 'Estructura', value: '--' },
          { label: 'Reservas', value: '--' },
          { label: 'Ataque', value: '--' },
          { label: 'Rondas', value: '--' },
          { label: 'Num.', value: '--' },
        ].map((fs) => (
          <div key={fs.label} className="flex items-center gap-1.5 text-[11px]">
            <span className="font-semibold text-[#64b5f6]">{fs.label}:</span>
            <span className="ml-auto font-bold text-white">{fs.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────── main component ────────────────────────── */

export function Go2CommanderPanel() {
  const [selectedId, setSelectedId] = useState<string>('reggie');

  const selected = COMMANDERS.find((c) => c.id === selectedId) ?? COMMANDERS[0];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* top bar */}
      <div className="flex items-center justify-between border-b-2 border-[#1976d2] bg-gradient-to-b from-[#0d47a1]/80 to-[#0a1e3c]/95 px-5 py-2">
        <span className="bg-gradient-to-r from-[#64b5f6] to-[#90caf9] bg-clip-text text-base font-extrabold text-transparent">
          Commander Fleet
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#90caf9]">Slots:</span>
          <div className="rounded-full border border-[#ffd54f]/30 bg-black/40 px-4 py-1 text-[13px] font-bold text-[#ffd54f]">
            10 / 50
          </div>
        </div>
      </div>

      {/* main 3-panel area */}
      <div className="flex min-h-0 flex-1 gap-3 p-3">
        <CommanderList
          commanders={COMMANDERS}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <CommanderCard commander={selected} />
        <FleetPanel />
      </div>
    </div>
  );
}
