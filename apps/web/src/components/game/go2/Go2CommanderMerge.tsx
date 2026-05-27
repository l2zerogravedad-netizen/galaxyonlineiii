'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  type Commander,
  type Rarity,
  RARITY_COLORS,
} from './go2-commander-data';

/* ═══════════════════════════════════════════════════════════════
   Galaxy Online 2 - Commander Merge / Combination System
   Gacha probability merge: combine 2 identical cards for +1 star
   ═══════════════════════════════════════════════════════════════ */

/* ────────────────────────── Types ────────────────────────── */

interface Go2CommanderMergeProps {
  commanders: Commander[];
  mergeScrolls?: number;
  onMergeResult?: (result: {
    success: boolean;
    newCommander?: Commander;
    removedIds: string[];
  }) => void;
}

type MergeResult = 'idle' | 'success' | 'fail';

interface InventoryGroup {
  template: Commander;
  cards: Commander[];
}

/* ────────────────────────── Gacha Constants ────────────────────────── */

/** Base success rates per rarity (before star-level penalty) */
const BASE_RATES: Record<Rarity, number> = {
  common: 0.80,    // Skill
  super: 0.60,
  legendary: 0.40,
  divine: 0.25,
};

/** Penalty per target star level (applied as subtraction from base) */
const PENALTY_PER_STAR: Record<Rarity, number> = {
  common: 0.05,
  super: 0.08,
  legendary: 0.10,
  divine: 0.12,
};

/** Cross-rarity merge (different rarities together) */
const CROSS_RARITY_RATE = 0.10;

/** Maximum star level */
const MAX_STARS = 9;

/** Cost per merge attempt */
const MERGE_SCROLL_COST = 1;

/* ────────────────────────── Probability Engine ────────────────────────── */

/**
 * Calculate the success probability for merging 2 commanders.
 * - Same name + same rarity: base rate - penalty per target star
 * - Different rarities: flat 10%
 * - Target > MAX_STARS: 0%
 */
function calcSuccessRate(
  rarity: Rarity,
  currentStars: number,
): number {
  if (currentStars >= MAX_STARS) return 0;
  const base = BASE_RATES[rarity] ?? 0;
  const penalty = PENALTY_PER_STAR[rarity] ?? 0;
  const targetStars = currentStars + 1;
  const rate = base - penalty * (targetStars - 2); // -2 because 1->2 is first merge
  return Math.max(0.01, Math.min(1, rate));
}

function calcCrossRarityRate(): number {
  return CROSS_RARITY_RATE;
}

/* ────────────────────────── Inventory Helpers ────────────────────────── */

/** Group commander cards by name for inventory display */
function groupByCommander(cards: Commander[]): InventoryGroup[] {
  const map = new Map<string, Commander[]>();
  for (const c of cards) {
    if (!map.has(c.name)) map.set(c.name, []);
    map.get(c.name)!.push(c);
  }
  return Array.from(map.entries())
    .map(([name, cards]) => ({
      template: cards[0],
      cards: cards.sort((a, b) => b.stars - a.stars || b.level - a.level),
    }))
    .sort((a, b) => {
      const rarityOrder: Record<Rarity, number> = {
        divine: 4, legendary: 3, super: 2, common: 1,
      };
      return rarityOrder[b.template.rarity] - rarityOrder[a.template.rarity]
        || b.cards.length - a.cards.length;
    });
}

/** Get display rarity label */
function rarityLabel(r: Rarity): string {
  switch (r) {
    case 'common': return 'Skill';
    case 'super': return 'Super';
    case 'legendary': return 'Legendary';
    case 'divine': return 'Divine';
    default: return r;
  }
}

/** Generate a unique ID for a new merged commander */
function genId(): string {
  return `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Create a merged commander (success case) */
function createMergedCommander(base: Commander): Commander {
  return {
    ...base,
    id: genId(),
    stars: Math.min(MAX_STARS, base.stars + 1),
  };
}

/* ────────────────────────── Sub-Components ────────────────────────── */

function StarDisplay({ count, max = MAX_STARS }: { count: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`text-[16px] leading-none ${
            i < count ? 'text-[#ffd54f]' : 'text-white/15'
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function CommanderCardSlot({
  commander,
  label,
  onClick,
  isSelected,
  isEmpty,
}: {
  commander?: Commander;
  label: string;
  onClick: () => void;
  isSelected: boolean;
  isEmpty: boolean;
}) {
  const borderColor = isEmpty
    ? '#004488'
    : commander
      ? RARITY_COLORS[commander.rarity]
      : '#004488';

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center"
      style={{ cursor: 'pointer' }}
    >
      <div
        className="relative flex h-[130px] w-[110px] flex-col items-center justify-center overflow-hidden rounded-[4px]"
        style={{
          backgroundColor: isEmpty ? '#001133' : '#001a44',
          border: `2px solid ${isSelected ? '#00ccff' : borderColor}`,
          boxShadow: isSelected ? '0 0 8px #00ccff' : 'none',
        }}
      >
        {isEmpty ? (
          <>
            <div className="text-[32px] text-[#004488]">+</div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-[#336699]">
              Empty
            </div>
          </>
        ) : commander ? (
          <>
            <div
              className="absolute left-0 right-0 top-0 px-1 py-0.5 text-center text-[9px] font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: RARITY_COLORS[commander.rarity] }}
            >
              {rarityLabel(commander.rarity)}
            </div>
            <div className="mt-4 text-[11px] font-bold text-white">
              {commander.name}
            </div>
            <div className="mt-1">
              <StarDisplay count={commander.stars} />
            </div>
            <div className="mt-1 text-[10px] text-[#88bbdd]">
              Lv.{commander.level}
            </div>
          </>
        ) : null}
      </div>
      <span
        className="mt-1 text-[10px] font-bold uppercase tracking-wider"
        style={{ color: '#446688' }}
      >
        {label}
      </span>
    </button>
  );
}

function ProbabilityBar({ rate }: { rate: number }) {
  const pct = Math.round(rate * 100);
  const filledBlocks = Math.round(rate * 20);
  const color =
    pct >= 60 ? '#00cc44' : pct >= 40 ? '#ffaa00' : pct >= 20 ? '#ff6600' : '#ff2222';

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-bold text-white">{pct}%</span>
        <div
          className="flex h-[14px] flex-1 overflow-hidden rounded-[2px]"
          style={{ backgroundColor: '#001133', border: '1px solid #003366' }}
        >
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="h-full flex-1"
              style={{
                backgroundColor: i < filledBlocks ? color : 'transparent',
                marginRight: i < 19 ? '1px' : '0',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────── Main Component ────────────────────────── */

export default function Go2CommanderMerge({
  commanders,
  mergeScrolls = 999,
  onMergeResult,
}: Go2CommanderMergeProps) {
  const [slot1, setSlot1] = useState<Commander | null>(null);
  const [slot2, setSlot2] = useState<Commander | null>(null);
  const [mergeResult, setMergeResult] = useState<MergeResult>('idle');
  const [resultCommander, setResultCommander] = useState<Commander | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [flashColor, setFlashColor] = useState<string | null>(null);
  const [isMerging, setIsMerging] = useState(false);

  /* ---- inventory grouped by commander name ---- */
  const inventoryGroups = useMemo(() => groupByCommander(commanders), [commanders]);

  /* ---- available cards (not in slots) ---- */
  const usedIds = useMemo(
    () => new Set([slot1?.id, slot2?.id].filter(Boolean)),
    [slot1, slot2],
  );

  /* ---- can we merge? ---- */
  const canMerge = useMemo(() => {
    if (!slot1 || !slot2) return false;
    if (slot1.id === slot2.id) return false;
    if (mergeScrolls < MERGE_SCROLL_COST) return false;
    if (slot1.stars >= MAX_STARS || slot2.stars >= MAX_STARS) return false;
    // Names must match
    if (slot1.name !== slot2.name) return false;
    return true;
  }, [slot1, slot2, mergeScrolls]);

  /* ---- same rarity check ---- */
  const isSameRarity = slot1 && slot2 ? slot1.rarity === slot2.rarity : false;

  /* ---- calculate success rate ---- */
  const successRate = useMemo(() => {
    if (!slot1 || !slot2) return 0;
    if (slot1.name !== slot2.name) return 0;
    if (!isSameRarity) return calcCrossRarityRate();
    return calcSuccessRate(slot1.rarity, slot1.stars);
  }, [slot1, slot2, isSameRarity]);

  /* ---- target star display ---- */
  const targetStars = slot1 ? Math.min(MAX_STARS, slot1.stars + 1) : 0;

  /* ---- select a card into a slot ---- */
  const selectCard = useCallback(
    (card: Commander) => {
      if (usedIds.has(card.id)) return;
      setMergeResult('idle');
      setResultCommander(null);
      if (!slot1) {
        setSlot1(card);
      } else if (!slot2 && slot1.id !== card.id) {
        // auto-validate: must be same name
        if (slot1.name === card.name) {
          setSlot2(card);
        }
      }
    },
    [slot1, slot2, usedIds],
  );

  /* ---- remove a card from a slot ---- */
  const removeSlot = useCallback(
    (which: 1 | 2) => {
      setMergeResult('idle');
      setResultCommander(null);
      if (which === 1) {
        setSlot1(slot2);
        setSlot2(null);
      } else {
        setSlot2(null);
      }
    },
    [slot2],
  );

  /* ---- clear all slots ---- */
  const clearSlots = useCallback(() => {
    setSlot1(null);
    setSlot2(null);
    setMergeResult('idle');
    setResultCommander(null);
  }, []);

  /* ---- PERFORM MERGE (GACHA ROLL) ---- */
  const doMerge = useCallback(() => {
    if (!canMerge || !slot1 || !slot2) return;

    setIsMerging(true);
    setMergeResult('idle');
    setResultCommander(null);

    // Animate the roll
    setTimeout(() => {
      const roll = Math.random();
      const success = roll < successRate;

      if (success) {
        const merged = createMergedCommander(slot1);
        setMergeResult('success');
        setResultCommander(merged);
        setFlashColor('#00ff44');
        onMergeResult?.({
          success: true,
          newCommander: merged,
          removedIds: [slot1.id, slot2.id],
        });
      } else {
        setMergeResult('fail');
        setFlashColor('#ff2222');
        onMergeResult?.({
          success: false,
          removedIds: [slot1.id, slot2.id],
        });
      }

      // Clear slots after result
      setSlot1(null);
      setSlot2(null);
      setIsMerging(false);

      // Clear flash after animation
      setTimeout(() => setFlashColor(null), 800);
    }, 600);
  }, [canMerge, slot1, slot2, successRate, onMergeResult]);

  /* ---- cards available for selection (same name as slot1) ---- */
  const availableCards = useMemo(() => {
    if (!slot1) return commanders.filter((c) => !usedIds.has(c.id));
    return commanders.filter(
      (c) => !usedIds.has(c.id) && c.name === slot1.name,
    );
  }, [commanders, slot1, usedIds]);

  return (
    <div
      className="relative mx-auto w-full max-w-[520px] overflow-hidden rounded-[6px] p-4"
      style={{
        backgroundColor: '#000044',
        border: '2px solid #0066CC',
        fontFamily: '"Tahoma", "Arial", sans-serif',
      }}
    >
      {/* Flash overlay for success/fail */}
      {flashColor && (
        <div
          className="pointer-events-none absolute inset-0 z-20 animate-pulse"
          style={{ backgroundColor: flashColor, opacity: 0.25 }}
        />
      )}

      {/* ── HEADER ── */}
      <div
        className="relative mb-4 flex items-center justify-between rounded-[4px] px-4 py-2.5"
        style={{ backgroundColor: '#003399', border: '1px solid #0066CC' }}
      >
        <h2
          className="text-[14px] font-bold uppercase tracking-widest text-white"
          style={{ textShadow: '1px 1px 0 #000' }}
        >
          Commander Merge Center
        </h2>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="flex h-[22px] w-[22px] items-center justify-center rounded-[3px] text-[12px] font-bold text-white hover:brightness-125"
          style={{
            backgroundColor: '#0033AA',
            border: '1px solid #0066FF',
          }}
        >
          ?
        </button>
      </div>

      {/* ── HELP PANEL ── */}
      {showHelp && (
        <div
          className="mb-4 rounded-[4px] p-3 text-[11px] leading-relaxed"
          style={{
            backgroundColor: '#001155',
            border: '1px solid #0066CC',
            color: '#aaccff',
          }}
        >
          <div className="mb-1 font-bold text-white">Merge Rules:</div>
          <ul className="ml-4 list-disc space-y-0.5">
            <li>Select 2 identical commander cards (same name)</li>
            <li>Each attempt consumes 1 Merge Scroll</li>
            <li>Both cards are consumed regardless of result</li>
            <li>Success: creates a new card with +1 Star</li>
            <li>Failure: both cards are destroyed!</li>
            <li>Maximum star level: 9</li>
          </ul>
          <div className="mt-2 font-bold text-white">Success Rates:</div>
          <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5">
            <span>Skill (Common):</span> <span className="text-[#4caf50]">80% - 5%/star</span>
            <span>Super:</span> <span className="text-[#2196f3]">60% - 8%/star</span>
            <span>Legendary:</span> <span className="text-[#9c27b0]">40% - 10%/star</span>
            <span>Divine:</span> <span className="text-[#ff9800]">25% - 12%/star</span>
          </div>
        </div>
      )}

      {/* ── MERGE SLOTS ── */}
      <div className="mb-4 flex items-center justify-center gap-6">
        <CommanderCardSlot
          commander={slot1 ?? undefined}
          label="Card 1"
          onClick={() => slot1 && removeSlot(1)}
          isSelected={!!slot1}
          isEmpty={!slot1}
        />

        {/* Merge arrow / connector */}
        <div className="flex flex-col items-center">
          <svg width="40" height="20" viewBox="0 0 40 20">
            <line x1="0" y1="10" x2="32" y2="10" stroke="#0066CC" strokeWidth="2" />
            <polygon points="32,5 40,10 32,15" fill="#0066CC" />
          </svg>
        </div>

        <CommanderCardSlot
          commander={slot2 ?? undefined}
          label="Card 2"
          onClick={() => slot2 && removeSlot(2)}
          isSelected={!!slot2}
          isEmpty={!slot2}
        />
      </div>

      {/* ── MERGE BUTTON ── */}
      <div className="mb-4 flex flex-col items-center">
        <button
          onClick={doMerge}
          disabled={!canMerge || isMerging}
          className="relative w-[200px] py-2.5 text-[14px] font-bold uppercase tracking-wider text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            backgroundColor: canMerge ? '#0033AA' : '#001155',
            border: canMerge
              ? '2px solid #0066FF'
              : '2px solid #003366',
            boxShadow: canMerge ? '0 0 10px #0066FF66' : 'none',
            textShadow: '1px 1px 0 #000',
          }}
        >
          {isMerging ? (
            <span className="animate-pulse">Merging...</span>
          ) : (
            'MERGE'
          )}
        </button>
      </div>

      {/* ── MERGE INFO BAR ── */}
      <div
        className="mb-4 rounded-[4px] p-3"
        style={{ backgroundColor: '#001155', border: '1px solid #0066CC' }}
      >
        {/* Merge Scroll count */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#88bbdd]">
            Merge Scroll:
          </span>
          <span className="text-[11px] font-bold text-white">
            {mergeScrolls}{' '}
            <span
              className="text-[10px]"
              style={{
                color:
                  mergeScrolls >= MERGE_SCROLL_COST
                    ? '#00cc44'
                    : '#ff2222',
              }}
            >
              {mergeScrolls >= MERGE_SCROLL_COST ? '✓' : '✗'}
            </span>
          </span>
        </div>

        {/* Success rate */}
        {slot1 && slot2 ? (
          <>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#88bbdd]">
                Success Rate:
              </span>
              <span className="text-[10px] text-[#6688aa]">
                ({rarityLabel(slot1.rarity)} rarity,{' '}
                {slot1.stars}★ → {targetStars}★)
              </span>
            </div>
            <ProbabilityBar rate={successRate} />
            {!isSameRarity && slot1.name === slot2.name && (
              <div className="mt-1 text-[10px] text-[#ffaa00]">
                ⚠ Cross-rarity merge: reduced success rate
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-[11px] italic text-[#446688]">
            Select 2 identical commander cards to see merge rate
          </div>
        )}
      </div>

      {/* ── RESULT AREA ── */}
      {mergeResult !== 'idle' && (
        <div
          className="mb-4 rounded-[4px] p-4 text-center"
          style={{
            backgroundColor:
              mergeResult === 'success' ? '#002211' : '#220000',
            border:
              mergeResult === 'success'
                ? '2px solid #00cc44'
                : '2px solid #ff2222',
          }}
        >
          {mergeResult === 'success' ? (
            <>
              <div
                className="mb-1 text-[16px] font-black uppercase tracking-widest text-[#00ff44]"
                style={{ textShadow: '0 0 8px #00ff4466' }}
              >
                ★ SUCCESS! ★
              </div>
              {resultCommander && (
                <>
                  <div className="mb-2 text-[13px] font-bold text-white">
                    {resultCommander.name}
                  </div>
                  <div className="flex justify-center">
                    <StarDisplay count={resultCommander.stars} />
                  </div>
                  <div className="mt-1 text-[11px] text-[#88ddaa]">
                    {resultCommander.stars} Stars achieved!
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div
                className="mb-1 text-[16px] font-black uppercase tracking-widest text-[#ff4444]"
                style={{ textShadow: '0 0 8px #ff222266' }}
              >
                ✗ FAILED ✗
              </div>
              <div className="text-[12px] text-[#cc8888]">
                Commander cards have been destroyed
              </div>
            </>
          )}
          <button
            onClick={() => {
              setMergeResult('idle');
              setResultCommander(null);
            }}
            className="mt-2 rounded-[3px] px-4 py-1 text-[10px] font-bold uppercase text-white hover:brightness-125"
            style={{
              backgroundColor: '#0033AA',
              border: '1px solid #0066FF',
            }}
          >
            Continue
          </button>
        </div>
      )}

      {/* ── INVENTORY ── */}
      <div
        className="rounded-[4px] overflow-hidden"
        style={{ border: '1px solid #0066CC' }}
      >
        <div
          className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: '#003399' }}
        >
          My Commander Cards
        </div>
        <div
          className="max-h-[200px] overflow-y-auto p-2"
          style={{ backgroundColor: '#000033' }}
        >
          {inventoryGroups.length === 0 ? (
            <div className="py-4 text-center text-[11px] text-[#446688]">
              No commander cards in inventory
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {inventoryGroups.map((group) => {
                const availableCount = group.cards.filter(
                  (c) => !usedIds.has(c.id),
                ).length;
                const isClickable =
                  !slot1 ||
                  (slot1.name === group.template.name && availableCount > 0);

                return (
                  <div
                    key={group.template.name}
                    className="flex flex-col items-center"
                  >
                    <button
                      onClick={() => {
                        if (!isClickable) return;
                        const pick = group.cards.find(
                          (c) => !usedIds.has(c.id),
                        );
                        if (pick) selectCard(pick);
                      }}
                      disabled={!isClickable || availableCount === 0}
                      className="relative flex h-[70px] w-[80px] flex-col items-center justify-center overflow-hidden rounded-[4px] transition-all disabled:cursor-not-allowed disabled:opacity-30 hover:brightness-110"
                      style={{
                        backgroundColor: '#001144',
                        border: `1px solid ${RARITY_COLORS[group.template.rarity]}`,
                      }}
                    >
                      <div
                        className="absolute left-0 right-0 top-0 px-0.5 py-0.5 text-center text-[8px] font-bold uppercase tracking-wider text-white"
                        style={{
                          backgroundColor: RARITY_COLORS[group.template.rarity],
                        }}
                      >
                        {rarityLabel(group.template.rarity)}
                      </div>
                      <div className="mt-2 text-[10px] font-bold text-white">
                        {group.template.name}
                      </div>
                      <div className="mt-0.5">
                        <StarDisplay count={group.cards[0]?.stars ?? 0} max={5} />
                      </div>
                    </button>
                    <span
                      className="mt-0.5 text-[10px] font-bold"
                      style={{ color: availableCount > 0 ? '#88bbdd' : '#334466' }}
                    >
                      x{availableCount}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Selected card detail for picking slot 2 ── */}
      {slot1 && !slot2 && (
        <div
          className="mt-3 rounded-[4px] p-2 text-center text-[11px]"
          style={{
            backgroundColor: '#001155',
            border: '1px solid #0066CC',
            color: '#88bbdd',
          }}
        >
          Select another{' '}
          <span className="font-bold text-white">{slot1.name}</span> card to
          merge (★{slot1.stars} → ★{targetStars})
        </div>
      )}
    </div>
  );
}

/* ────────────────────────── Utility Exports ────────────────────────── */

export { calcSuccessRate, calcCrossRarityRate, MAX_STARS, MERGE_SCROLL_COST };
