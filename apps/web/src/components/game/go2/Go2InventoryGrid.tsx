// ============================================================
// GO2 COMMANDER INVENTORY GRID
// ============================================================
// Full inventory display showing all commander cards in a
// scrollable grid with:
//   - Filter by rarity dropdown
//   - Sort dropdown (level, name, rarity, stars)
//   - Slot counter (45/100)
//   - 7-column icon grid
//   - Selected commander detail panel at bottom
//   - Action buttons: Use, Merge, Equip, Dismiss
//
// Layout:
//   ┌─ COMMANDER INVENTORY ───────────────────┐
//   │  [Filter ▼] [Sort ▼]        45/100     │
//   │                                          │
//   │  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐  │
//   │  │R5│ │G3│ │A1│ │T7│ │D4│ │P2│ │S3│  │
//   │  │x3│ │x1│ │x2│ │x1│ │x5│ │x1│ │x2│  │
//   │  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘  │
//   │                                          │
//   │  Selected: Reggie (LV.5, 3★, Skill)    │
//   │  [Use] [Merge] [Equip] [Dismiss]       │
//   └──────────────────────────────────────────┘
// ============================================================

import React, { useState, useMemo } from 'react';
import { Commander, Rarity, RARITY_COLORS } from './go2-commander-data';
import { CommanderInventoryIcon } from './Go2InventoryIcons';
import { MergeScroll, canMerge } from './go2-scroll-system';

// ------------------------------------------------------------------
// TYPES
// ------------------------------------------------------------------

export type InventoryFilter = 'all' | Rarity;

export type InventorySort = 'name' | 'level' | 'rarity' | 'stars' | 'recent';

export interface InventoryEntry {
  commander: Commander;
  count: number;
  acquiredAt: number; // timestamp for "recent" sort
}

export interface Go2InventoryGridProps {
  /** All commander inventory entries */
  entries: InventoryEntry[];
  /** Maximum inventory capacity */
  capacity?: number;
  /** Current merge scrolls (for merge button availability) */
  scrolls?: MergeScroll[];
  /** Callbacks for actions */
  onUse: (entry: InventoryEntry) => void;
  onMerge: (entry: InventoryEntry) => void;
  onEquip: (entry: InventoryEntry) => void;
  onDismiss: (entry: InventoryEntry) => void;
  /** Optional: called when the grid should close */
  onClose?: () => void;
  /** Initial filter selection */
  initialFilter?: InventoryFilter;
  /** Initial sort selection */
  initialSort?: InventorySort;
}

// ------------------------------------------------------------------
// RARITY ORDER for sorting (ascending rarity)
// ------------------------------------------------------------------

const RARITY_ORDER: Record<Rarity, number> = {
  common: 1,
  super: 2,
  legendary: 3,
  divine: 4,
};

const RARITY_LABELS: Record<InventoryFilter, string> = {
  all: 'All',
  common: 'Skill',
  super: 'Super',
  legendary: 'Legendary',
  divine: 'Divine',
};

const SORT_LABELS: Record<InventorySort, string> = {
  name: 'Name',
  level: 'Level',
  rarity: 'Rarity',
  stars: 'Stars',
  recent: 'Recent',
};

// ------------------------------------------------------------------
// GRID COMPONENT
// ------------------------------------------------------------------

export function Go2InventoryGrid({
  entries,
  capacity = 100,
  scrolls = [],
  onUse,
  onMerge,
  onEquip,
  onDismiss,
  onClose,
  initialFilter = 'all',
  initialSort = 'rarity',
}: Go2InventoryGridProps) {
  const [filter, setFilter] = useState<InventoryFilter>(initialFilter);
  const [sort, setSort] = useState<InventorySort>(initialSort);
  const [selectedEntry, setSelectedEntry] = useState<InventoryEntry | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // ---- Filter & Sort ----
  const filteredAndSorted = useMemo(() => {
    let result = [...entries];

    // Apply rarity filter
    if (filter !== 'all') {
      result = result.filter(e => e.commander.rarity === filter);
    }

    // Apply sort
    result.sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.commander.name.localeCompare(b.commander.name);
        case 'level':
          return b.commander.level - a.commander.level;
        case 'rarity': {
          const rDiff = RARITY_ORDER[b.commander.rarity] - RARITY_ORDER[a.commander.rarity];
          return rDiff !== 0 ? rDiff : a.commander.name.localeCompare(b.commander.name);
        }
        case 'stars':
          return b.commander.stars - a.commander.stars;
        case 'recent':
          return b.acquiredAt - a.acquiredAt;
        default:
          return 0;
      }
    });

    return result;
  }, [entries, filter, sort]);

  // ---- Handlers ----
  const handleSelect = (entry: InventoryEntry) => {
    setSelectedEntry(prev =>
      prev?.commander.id === entry.commander.id ? null : entry,
    );
  };

  const handleAction = (action: 'use' | 'merge' | 'equip' | 'dismiss') => {
    if (!selectedEntry) return;
    switch (action) {
      case 'use':
        onUse(selectedEntry);
        break;
      case 'merge':
        onMerge(selectedEntry);
        break;
      case 'equip':
        onEquip(selectedEntry);
        break;
      case 'dismiss':
        onDismiss(selectedEntry);
        break;
    }
  };

  const totalCount = entries.reduce((sum, e) => sum + e.count, 0);
  const canMergeSelected = selectedEntry ? canMerge(selectedEntry.commander.rarity, scrolls) : false;
  const selectedRarityColor = selectedEntry
    ? RARITY_COLORS[selectedEntry.commander.rarity]
    : '#666';

  return (
    <div
      style={{
        width: 520,
        background: '#000044',
        border: '2px solid #0066CC',
        borderRadius: 8,
        padding: '14px 16px',
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: '#ffffff',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #0066CC',
          paddingBottom: 10,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 17, color: '#ffd54f', letterSpacing: 1 }}>
          COMMANDER INVENTORY
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: '1px solid #666',
                borderRadius: 4,
                color: '#ccc',
                fontSize: 12,
                padding: '2px 10px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
          {/* Filter Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowFilterDropdown(!showFilterDropdown);
                setShowSortDropdown(false);
              }}
              style={{
                background: 'linear-gradient(180deg, #004488 0%, #002255 100%)',
                border: '1px solid #0066CC',
                borderRadius: 5,
                color: '#fff',
                fontSize: 12,
                padding: '5px 24px 5px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <FilterIcon />
              Filter: {RARITY_LABELS[filter]}
              <span style={{ marginLeft: 4, fontSize: 8 }}>▼</span>
            </button>
            {showFilterDropdown && (
              <DropdownMenu
                items={(['all', 'common', 'super', 'legendary', 'divine'] as InventoryFilter[]).map(
                  f => ({
                    label: RARITY_LABELS[f],
                    value: f,
                    color: f === 'all' ? '#aaa' : RARITY_COLORS[f],
                  }),
                )}
                onSelect={val => {
                  setFilter(val as InventoryFilter);
                  setShowFilterDropdown(false);
                }}
                onClose={() => setShowFilterDropdown(false)}
              />
            )}
          </div>

          {/* Sort Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowSortDropdown(!showSortDropdown);
                setShowFilterDropdown(false);
              }}
              style={{
                background: 'linear-gradient(180deg, #004488 0%, #002255 100%)',
                border: '1px solid #0066CC',
                borderRadius: 5,
                color: '#fff',
                fontSize: 12,
                padding: '5px 24px 5px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <SortIcon />
              Sort: {SORT_LABELS[sort]}
              <span style={{ marginLeft: 4, fontSize: 8 }}>▼</span>
            </button>
            {showSortDropdown && (
              <DropdownMenu
                items={(['name', 'level', 'rarity', 'stars', 'recent'] as InventorySort[]).map(
                  s => ({
                    label: SORT_LABELS[s],
                    value: s,
                    color: '#aaa',
                  }),
                )}
                onSelect={val => {
                  setSort(val as InventorySort);
                  setShowSortDropdown(false);
                }}
                onClose={() => setShowSortDropdown(false)}
              />
            )}
          </div>
        </div>

        {/* Capacity Counter */}
        <div
          style={{
            fontSize: 13,
            color: totalCount >= capacity ? '#e53935' : '#ffd54f',
            fontWeight: 900,
          }}
        >
          {totalCount}
          <span style={{ color: '#666' }}>/{capacity}</span>
          {totalCount >= capacity && (
            <span style={{ color: '#e53935', fontSize: 10, marginLeft: 4 }}>FULL</span>
          )}
        </div>
      </div>

      {/* ── ICON GRID ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 8,
          maxHeight: 300,
          overflowY: 'auto',
          padding: '4px 2px',
          // Custom scrollbar
          scrollbarWidth: 'thin' as const,
          scrollbarColor: '#0066CC #000044',
        }}
      >
        {filteredAndSorted.map(entry => (
          <div
            key={entry.commander.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <CommanderInventoryIcon
              commander={entry.commander}
              count={entry.count}
              isSelected={selectedEntry?.commander.id === entry.commander.id}
              onClick={() => handleSelect(entry)}
            />
            <div
              style={{
                fontSize: 9,
                color: '#aaa',
                textAlign: 'center',
                maxWidth: 64,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={entry.commander.name}
            >
              {entry.commander.name}
            </div>
          </div>
        ))}

        {/* Empty slots placeholder */}
        {Array.from({ length: Math.max(0, 7 - (filteredAndSorted.length % 7 || 7)) }).map(
          (_, i) => (
            <div key={`empty-${i}`} style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  border: '2px dashed #1a1a5a',
                  borderRadius: 8,
                  background: 'rgba(0,0,68,0.2)',
                  opacity: 0.3,
                }}
              />
            </div>
          ),
        )}
      </div>

      {/* ── SELECTED DETAIL PANEL ── */}
      {selectedEntry && (
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: `1px solid ${selectedRarityColor}`,
            borderRadius: 8,
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {/* Selected info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: selectedRarityColor,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: selectedRarityColor }}>
                {selectedEntry.commander.name}
              </div>
              <div style={{ fontSize: 11, color: '#aaa' }}>
                LV.{selectedEntry.commander.level} · {selectedEntry.commander.stars}★ ·{' '}
                {RARITY_LABELS[selectedEntry.commander.rarity as InventoryFilter]}
                {selectedEntry.count > 1 && (
                  <span style={{ color: '#ffd54f', marginLeft: 6 }}>
                    x{selectedEntry.count} copies
                  </span>
                )}
              </div>
              <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                Skill: {selectedEntry.commander.skill}
              </div>
            </div>
            {/* Mini stat preview */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto auto',
                gap: '2px 8px',
                fontSize: 10,
                color: '#888',
              }}
            >
              <span>ACC</span>
              <span style={{ color: '#ffd54f' }}>{selectedEntry.commander.stats.accuracy}</span>
              <span>SPD</span>
              <span style={{ color: '#ffd54f' }}>{selectedEntry.commander.stats.speed}</span>
              <span>DDG</span>
              <span style={{ color: '#ffd54f' }}>{selectedEntry.commander.stats.dodge}</span>
              <span>ELE</span>
              <span style={{ color: '#ffd54f' }}>{selectedEntry.commander.stats.electron}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <ActionButton
              label="Use"
              onClick={() => handleAction('use')}
              color="#4caf50"
            />
            <ActionButton
              label="Merge"
              onClick={() => handleAction('merge')}
              color="#2196f3"
              disabled={!canMergeSelected}
              title={
                canMergeSelected
                  ? 'Merge this commander'
                  : 'No merge scroll available for this rarity'
              }
            />
            <ActionButton
              label="Equip"
              onClick={() => handleAction('equip')}
              color="#ff9800"
            />
            <ActionButton
              label="Dismiss"
              onClick={() => handleAction('dismiss')}
              color="#e53935"
            />
          </div>
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {entries.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '30px 0',
            color: '#444488',
            fontSize: 14,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
          <div>No commanders in inventory.</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>
            Use Commander Draw to obtain commanders.
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// SUB-COMPONENTS
// ------------------------------------------------------------------

function ActionButton({
  label,
  onClick,
  color,
  disabled = false,
  title,
}: {
  label: string;
  onClick: () => void;
  color: string;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        flex: 1,
        background: disabled
          ? '#222244'
          : `linear-gradient(180deg, ${color}dd 0%, ${color}88 100%)`,
        border: `1px solid ${disabled ? '#333' : color}`,
        borderRadius: 6,
        color: disabled ? '#555' : '#fff',
        fontSize: 12,
        fontWeight: 900,
        padding: '7px 0',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textTransform: 'uppercase',
        letterSpacing: 1,
        transition: 'transform 0.1s',
        opacity: disabled ? 0.4 : 1,
      }}
      onMouseDown={e => !disabled && (e.currentTarget.style.transform = 'scale(0.95)')}
      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {label}
    </button>
  );
}

interface DropdownItem<T> {
  label: string;
  value: T;
  color: string;
}

function DropdownMenu<T extends string>({
  items,
  onSelect,
  onClose,
}: {
  items: DropdownItem<T>[];
  onSelect: (val: T) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: 4,
          background: '#000044',
          border: '1px solid #0066CC',
          borderRadius: 6,
          zIndex: 50,
          minWidth: 140,
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}
      >
        {items.map(item => (
          <div
            key={item.value}
            onClick={() => onSelect(item.value)}
            style={{
              padding: '7px 12px',
              fontSize: 12,
              color: item.color,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'background 0.1s',
              borderBottom: '1px solid #111133',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#001155')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: item.color,
                display: 'inline-block',
              }}
            />
            {item.label}
          </div>
        ))}
      </div>
    </>
  );
}

// ------------------------------------------------------------------
// ICONS (inline SVG)
// ------------------------------------------------------------------

function FilterIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M1 2h10M3 6h6M5 10h2"
        stroke="#fff"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 4L6 1L9 4" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M3 8L6 11L9 8" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// ------------------------------------------------------------------
// UTILITY: Group raw commanders into inventory entries
// ------------------------------------------------------------------

/**
 * Convert a flat list of commander instances into grouped inventory entries.
 * Duplicate commanders (by id) are stacked with incremented count.
 */
export function groupCommandersIntoEntries(
  commanders: Commander[],
  getTimestamp?: (cmd: Commander) => number,
): InventoryEntry[] {
  const map = new Map<string, { commander: Commander; count: number; latestTs: number }>();

  for (const cmd of commanders) {
    const existing = map.get(cmd.id);
    const ts = getTimestamp?.(cmd) ?? Date.now();
    if (existing) {
      existing.count++;
      existing.latestTs = Math.max(existing.latestTs, ts);
    } else {
      map.set(cmd.id, { commander: cmd, count: 1, latestTs: ts });
    }
  }

  return Array.from(map.values()).map(v => ({
    commander: v.commander,
    count: v.count,
    acquiredAt: v.latestTs,
  }));
}
