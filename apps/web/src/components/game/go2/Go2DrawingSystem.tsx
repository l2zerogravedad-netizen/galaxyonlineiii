// ============================================================
// GO2 COMMANDER DRAWING SYSTEM (Gacha)
// ============================================================
// Players draw random commander cards using Corsairs' Gold.
//
// Draw Pools:
//   Skill Draw:    150 CG -> 100% Skill (random commander)
//   Super Draw:    300 CG -> 100% Super
//   Legendary Draw: 600 CG -> 100% Legendary
//   Divine Draw:   600 CG -> 100% Divine
//   Mixed Draw:    150 CG -> 70% Skill, 20% Super, 8% Legendary, 2% Divine
// ============================================================

import React, { useState, useCallback } from 'react';
import { Rarity, COMMANDERS, RARITY_COLORS } from './go2-commander-data';
import { ScrollRarity } from './go2-scroll-system';

// ------------------------------------------------------------------
// TYPES
// ------------------------------------------------------------------

export type DrawPool = 'skill' | 'super' | 'legendary' | 'divine' | 'mixed';

export interface DrawConfig {
  pool: DrawPool;
  cost: number;
  label: string;
  description: string;
  rates: Record<Rarity, number>;
}

export interface DrawResult {
  commanderId: string;
  commanderName: string;
  rarity: Rarity;
  isNew: boolean;
}

// ------------------------------------------------------------------
// DRAW CONFIGURATION
// ------------------------------------------------------------------

export const DRAW_CONFIGS: Record<DrawPool, DrawConfig> = {
  skill: {
    pool: 'skill',
    cost: 150,
    label: 'Skill Draw',
    description: '100% Skill commander',
    rates: { common: 1.0, super: 0, legendary: 0, divine: 0 },
  },
  super: {
    pool: 'super',
    cost: 300,
    label: 'Super Draw',
    description: '100% Super commander',
    rates: { common: 0, super: 1.0, legendary: 0, divine: 0 },
  },
  legendary: {
    pool: 'legendary',
    cost: 600,
    label: 'Legendary Draw',
    description: '100% Legendary commander',
    rates: { common: 0, super: 0, legendary: 1.0, divine: 0 },
  },
  divine: {
    pool: 'divine',
    cost: 600,
    label: 'Divine Draw',
    description: '100% Divine commander',
    rates: { common: 0, super: 0, legendary: 0, divine: 1.0 },
  },
  mixed: {
    pool: 'mixed',
    cost: 150,
    label: 'Mixed Draw',
    description: 'Random rarity mix',
    rates: { common: 0.70, super: 0.20, legendary: 0.08, divine: 0.02 },
  },
};

// ------------------------------------------------------------------
// DRAW RARITY COLORS for the UI
// ------------------------------------------------------------------

const DRAW_CARD_COLORS: Record<DrawPool, string> = {
  skill: '#4caf50',
  super: '#2196f3',
  legendary: '#9c27b0',
  divine: '#ff9800',
  mixed: '#607d8b',
};

const DRAW_CARD_BG: Record<DrawPool, string> = {
  skill: 'linear-gradient(135deg, #1b3a1b 0%, #2d5a2d 100%)',
  super: 'linear-gradient(135deg, #0d2b45 0%, #1a4a7a 100%)',
  legendary: 'linear-gradient(135deg, #2d0d3a 0%, #5a1a7a 100%)',
  divine: 'linear-gradient(135deg, #3a2500 0%, #7a5500 100%)',
  mixed: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d5a 100%)',
};

// ------------------------------------------------------------------
// RANDOMIZATION / PROBABILITY ENGINE
// ------------------------------------------------------------------

/**
 * Weighted random selection from a set of options.
 * @param weights — map of option -> probability (must sum to <= 1)
 * @returns the selected option key
 */
export function weightedRandom<T extends string>(weights: Record<T, number>): T {
  const roll = Math.random();
  let cumulative = 0;
  for (const [key, prob] of Object.entries(weights) as [T, number][]) {
    cumulative += prob;
    if (roll < cumulative) return key;
  }
  // Fallback: return first key with non-zero weight
  for (const [key, prob] of Object.entries(weights) as [T, number][]) {
    if (prob > 0) return key;
  }
  throw new Error('weightedRandom: all weights are zero');
}

/**
 * Perform a single gacha draw from the specified pool.
 * @param pool — which draw pool to use
 * @param ownedIds — set of commander IDs the player already owns
 * @returns the DrawResult with commander info
 */
export function performDraw(pool: DrawPool, ownedIds: Set<string>): DrawResult {
  const config = DRAW_CONFIGS[pool];

  // 1. Determine rarity via weighted roll
  const drawnRarity = weightedRandom<Rarity>(config.rates);

  // 2. Pick a random commander of that rarity
  const poolCommanders = COMMANDERS.filter(c => c.rarity === drawnRarity);
  if (poolCommanders.length === 0) {
    throw new Error(`No commanders found for rarity: ${drawnRarity}`);
  }
  const commander = poolCommanders[Math.floor(Math.random() * poolCommanders.length)];

  return {
    commanderId: commander.id,
    commanderName: commander.name,
    rarity: drawnRarity,
    isNew: !ownedIds.has(commander.id),
  };
}

/**
 * Perform a multi-draw (batch of N draws from the same pool).
 */
export function performMultiDraw(
  pool: DrawPool,
  count: number,
  ownedIds: Set<string>,
): DrawResult[] {
  const results: DrawResult[] = [];
  const updatedOwned = new Set(ownedIds);

  for (let i = 0; i < count; i++) {
    const result = performDraw(pool, updatedOwned);
    results.push(result);
    updatedOwned.add(result.commanderId);
  }

  return results;
}

// ------------------------------------------------------------------
// DRAW COST HELPERS
// ------------------------------------------------------------------

/** Get total cost for a draw */
export function getDrawCost(pool: DrawPool): number {
  return DRAW_CONFIGS[pool].cost;
}

/** Check if player can afford a draw */
export function canAffordDraw(pool: DrawPool, corsairsGold: number): boolean {
  return corsairsGold >= DRAW_CONFIGS[pool].cost;
}

// ------------------------------------------------------------------
// UI COMPONENT
// ------------------------------------------------------------------

interface Go2DrawingSystemProps {
  /** Player's current Corsairs' Gold balance */
  corsairsGold: number;
  /** Set of commander IDs the player already owns */
  ownedCommanderIds: Set<string>;
  /** Callback when a draw is performed */
  onDraw: (pool: DrawPool, results: DrawResult[], totalCost: number) => void;
  /** Callback when player wants to close the drawing panel */
  onClose: () => void;
}

export function Go2DrawingSystem({
  corsairsGold,
  ownedCommanderIds,
  onDraw,
  onClose,
}: Go2DrawingSystemProps) {
  const [lastResults, setLastResults] = useState<DrawResult[] | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDraw = useCallback(
    (pool: DrawPool) => {
      setError(null);

      if (!canAffordDraw(pool, corsairsGold)) {
        setError(`Not enough Corsairs' Gold! Need ${DRAW_CONFIGS[pool].cost} CG.`);
        return;
      }

      setIsAnimating(true);

      // Simulate draw animation delay
      setTimeout(() => {
        const result = performDraw(pool, ownedCommanderIds);
        const cost = DRAW_CONFIGS[pool].cost;

        setLastResults([result]);
        setIsAnimating(false);
        onDraw(pool, [result], cost);
      }, 600);
    },
    [corsairsGold, ownedCommanderIds, onDraw],
  );

  const handleMultiDraw = useCallback(
    (pool: DrawPool) => {
      setError(null);
      const count = 10;
      const totalCost = DRAW_CONFIGS[pool].cost * count;

      if (corsairsGold < totalCost) {
        setError(`Not enough Corsairs' Gold! Need ${totalCost} CG for 10 draws.`);
        return;
      }

      setIsAnimating(true);
      setTimeout(() => {
        const results = performMultiDraw(pool, count, ownedCommanderIds);
        setLastResults(results);
        setIsAnimating(false);
        onDraw(pool, results, totalCost);
      }, 1200);
    },
    [corsairsGold, ownedCommanderIds, onDraw],
  );

  const poolButtons: DrawPool[] = ['skill', 'super', 'legendary', 'divine', 'mixed'];

  return (
    <div
      style={{
        width: 480,
        background: '#000044',
        border: '2px solid #0066CC',
        borderRadius: 8,
        padding: '16px 20px',
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: '#ffffff',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #0066CC',
          paddingBottom: 10,
          marginBottom: 14,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18, color: '#ffd54f', letterSpacing: 1 }}>
          COMMANDER DRAW
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: '1px solid #666',
            borderRadius: 4,
            color: '#ccc',
            fontSize: 14,
            padding: '2px 10px',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>

      {/* Corsairs' Gold Balance */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 16,
          fontSize: 16,
          color: '#ffd54f',
        }}
      >
        <span style={{ fontSize: 20 }}>💰</span>
        <span>
          Your Corsairs' Gold:{" "}
          <strong style={{ fontSize: 18 }}>{corsairsGold.toLocaleString()}</strong>
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            background: 'rgba(255, 0, 0, 0.15)',
            border: '1px solid #e53935',
            borderRadius: 6,
            padding: '8px 12px',
            marginBottom: 12,
            fontSize: 13,
            color: '#ff5252',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      {/* Drawing Animation Overlay */}
      {isAnimating && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 68, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            borderRadius: 8,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              border: '4px solid #0066CC',
              borderTop: '4px solid #ffd54f',
              borderRadius: '50%',
              animation: 'go2-spin 0.8s linear infinite',
            }}
          />
          <p style={{ marginTop: 16, fontSize: 16, color: '#ffd54f' }}>Drawing...</p>
          <style>{`@keyframes go2-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Draw Result Display */}
      {lastResults && !isAnimating && (
        <div
          style={{
            background: 'rgba(0, 102, 204, 0.12)',
            border: '1px solid #0066CC',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 14,
            maxHeight: 180,
            overflowY: 'auto',
          }}
        >
          <div style={{ fontSize: 12, color: '#aaa', marginBottom: 6 }}>
            Draw Results ({lastResults.length}):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {lastResults.map((r, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(0,0,0,0.3)',
                  border: `2px solid ${RARITY_COLORS[r.rarity]}`,
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: 13,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: RARITY_COLORS[r.rarity],
                    display: 'inline-block',
                  }}
                />
                <span style={{ fontWeight: 'bold', color: RARITY_COLORS[r.rarity] }}>
                  {r.commanderName}
                </span>
                {r.isNew && (
                  <span
                    style={{
                      background: '#e53935',
                      color: '#fff',
                      fontSize: 9,
                      padding: '1px 5px',
                      borderRadius: 4,
                      fontWeight: 900,
                    }}
                  >
                    NEW
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Draw Pool Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        {(['skill', 'super', 'legendary', 'divine'] as DrawPool[]).map(pool => (
          <DrawCard
            key={pool}
            pool={pool}
            canAfford={canAffordDraw(pool, corsairsGold)}
            onDraw={() => handleDraw(pool)}
            onMultiDraw={() => handleMultiDraw(pool)}
          />
        ))}
      </div>

      {/* Mixed Draw — Full Width */}
      <MixedDrawCard
        canAfford={canAffordDraw('mixed', corsairsGold)}
        onDraw={() => handleDraw('mixed')}
        onMultiDraw={() => handleMultiDraw('mixed')}
      />

      {/* Drop Rates Info */}
      <div
        style={{
          marginTop: 14,
          padding: '10px 12px',
          background: 'rgba(0, 0, 0, 0.25)',
          borderRadius: 6,
          border: '1px solid #333366',
        }}
      >
        <div style={{ fontSize: 11, color: '#aaa', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
          Mixed Drop Rates:
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
          <RateBadge label="Skill" rate="70%" color="#4caf50" />
          <RateBadge label="Super" rate="20%" color="#2196f3" />
          <RateBadge label="Legendary" rate="8%" color="#9c27b0" />
          <RateBadge label="Divine" rate="2%" color="#ff9800" />
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// SUB-COMPONENTS
// ------------------------------------------------------------------

function DrawCard({
  pool,
  canAfford,
  onDraw,
  onMultiDraw,
}: {
  pool: DrawPool;
  canAfford: boolean;
  onDraw: () => void;
  onMultiDraw: () => void;
}) {
  const config = DRAW_CONFIGS[pool];
  const color = DRAW_CARD_COLORS[pool];

  return (
    <div
      style={{
        background: DRAW_CARD_BG[pool],
        border: `2px solid ${color}`,
        borderRadius: 8,
        padding: '12px 8px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        opacity: canAfford ? 1 : 0.5,
        transition: 'opacity 0.2s',
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 900, color, textTransform: 'uppercase' }}>
        {config.label}
      </div>
      <div style={{ fontSize: 13, color: '#ffd54f' }}>
        💰 {config.cost.toLocaleString()}
      </div>
      <div style={{ fontSize: 10, color: '#aaa' }}>{config.description}</div>

      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <DrawButton onClick={onDraw} disabled={!canAfford} label="Draw" />
        <DrawButton onClick={onMultiDraw} disabled={!canAfford} label="x10" small />
      </div>
    </div>
  );
}

function MixedDrawCard({
  canAfford,
  onDraw,
  onMultiDraw,
}: {
  canAfford: boolean;
  onDraw: () => void;
  onMultiDraw: () => void;
}) {
  const config = DRAW_CONFIGS.mixed;

  return (
    <div
      style={{
        background: DRAW_CARD_BG.mixed,
        border: '2px solid #607d8b',
        borderRadius: 8,
        padding: '12px 14px',
        textAlign: 'center',
        opacity: canAfford ? 1 : 0.5,
        transition: 'opacity 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#607d8b', textTransform: 'uppercase' }}>
            {config.label}
          </div>
          <div style={{ fontSize: 13, color: '#ffd54f' }}>
            💰 {config.cost.toLocaleString()}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, fontSize: 10 }}>
          <span style={{ color: '#4caf50' }}>70%S</span>
          <span style={{ color: '#666' }}>|</span>
          <span style={{ color: '#2196f3' }}>20%Sp</span>
          <span style={{ color: '#666' }}>|</span>
          <span style={{ color: '#9c27b0' }}>8%L</span>
          <span style={{ color: '#666' }}>|</span>
          <span style={{ color: '#ff9800' }}>2%D</span>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <DrawButton onClick={onDraw} disabled={!canAfford} label="Draw" />
          <DrawButton onClick={onMultiDraw} disabled={!canAfford} label="x10" small />
        </div>
      </div>
    </div>
  );
}

function DrawButton({
  onClick,
  disabled,
  label,
  small,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? '#333366' : 'linear-gradient(180deg, #0066CC 0%, #004499 100%)',
        border: '1px solid #0088ff',
        borderRadius: 6,
        color: '#fff',
        fontSize: small ? 11 : 13,
        fontWeight: 900,
        padding: small ? '5px 12px' : '6px 18px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textTransform: 'uppercase',
        letterSpacing: 1,
        opacity: disabled ? 0.4 : 1,
        transition: 'transform 0.1s, opacity 0.2s',
      }}
      onMouseDown={e => !disabled && (e.currentTarget.style.transform = 'scale(0.95)')}
      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {label}
    </button>
  );
}

function RateBadge({ label, rate, color }: { label: string; rate: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
      <span style={{ color }}>{label}:</span>
      <span style={{ color: '#fff', fontWeight: 'bold' }}>{rate}</span>
    </div>
  );
}
