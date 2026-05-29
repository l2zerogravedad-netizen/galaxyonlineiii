'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  type Commander,
  type Rarity,
  RARITY_COLORS,
  RARITY_DOT_CLASS,
} from './go2-commander-data';
import {
  getFleets,
  createFleet,
  deleteFleet,
  type FleetData,
  type FormationSlotPayload,
} from '@/lib/game/fleetClient';

/* ═══════════════════════════════════════════════════════════════
   Galaxy Online 2 — Fleet Management System (API Connected)
   Every fleet MUST have a commander assigned, or it cannot deploy.
   ═══════════════════════════════════════════════════════════════ */

/* ─────────────────────── types ─────────────────────── */

export interface ShipInSlot {
  id: string;
  name: string;
  icon: string;
  count: number;
  maxCount: number;
  attack: number;
  shield: number;
  structure: number;
}

export interface FormationSlot {
  index: number;
  ship: ShipInSlot | null;
}

export interface Fleet {
  id: number;
  name: string;
  unlocked: boolean;
  commander: Commander | null;
  formation: FormationSlot[];
}

export interface FleetSystemProps {
  commanders: Commander[];
  fleets?: Fleet[];
  maxFleets?: number;
  onAssignCommander?: (fleetId: number, commanderId: string) => void;
  onRemoveCommander?: (fleetId: number) => void;
  onUpdateFormation?: (fleetId: number, formation: FormationSlot[]) => void;
  onDeployFleet?: (fleetId: number) => void;
  onUnlockFleet?: (fleetId: number) => void;
}

/* ─────────────────────── constants ─────────────────────── */

const BASE_MAX_FLEETS = 5;
const FORMATION_SIZE = 9;
const DEFAULT_UNLOCKED = 2;

const RARITY_STACK_BONUS: Record<Rarity, number> = {
  common: 1.0,
  super: 1.1,
  legendary: 1.2,
  divine: 1.3,
};

/** Calculate effective stack limit based on commander stars + rarity */
function getEffectiveStack(commander: Commander | null): number {
  if (!commander) return 0;
  const base = 500 + commander.stars * 100; // 1★=600, 2★=700 ... 9★=1400
  const bonus = RARITY_STACK_BONUS[commander.rarity] ?? 1.0;
  return Math.floor(base * bonus);
}

/** Get star display for commander */
function StarDisplay({ count, max = 9 }: { count: number; max?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`text-[11px] ${i < count ? 'text-[#ffd54f]' : 'text-white/15'}`}
        >
          ★
        </span>
      ))}
    </span>
  );
}

/* ─────────────────────── API helpers ─────────────────────── */

/** Convert API FleetData to local Fleet format */
function apiFleetToLocal(f: FleetData, index: number): Fleet {
  return {
    id: typeof f.id === 'string' ? parseInt(f.id, 10) || index + 1 : f.id,
    name: f.name || `Fleet ${index + 1}`,
    unlocked: f.unlocked ?? true,
    commander: null,
    formation: Array.from({ length: FORMATION_SIZE }, (_, j) => ({
      index: j,
      ship: null,
    })),
  };
}

/** Build default mock fleets as fallback */
function buildMockFleets(maxFleets: number): Fleet[] {
  return Array.from({ length: maxFleets }, (_, i) => ({
    id: i + 1,
    name: `Fleet ${i + 1}`,
    unlocked: i < DEFAULT_UNLOCKED,
    commander: null,
    formation: Array.from({ length: FORMATION_SIZE }, (_, j) => ({
      index: j,
      ship: null,
    })),
  }));
}

/* ─────────────────────── commander selector modal ─────────────────────── */

function CommanderSelectorModal({
  availableCommanders,
  onSelect,
  onClose,
}: {
  availableCommanders: Commander[];
  onSelect: (commander: Commander) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-[420px] overflow-hidden rounded-sm border-2"
        style={{
          backgroundColor: '#000044',
          borderColor: '#0066CC',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div
          className="border-b-2 px-4 py-2.5 text-center text-sm font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: '#003399', borderColor: '#0066CC' }}
        >
          Assign Commander
        </div>

        {/* commander list */}
        <div className="max-h-[320px] overflow-y-auto p-3">
          {availableCommanders.length === 0 ? (
            <p className="py-6 text-center text-xs text-white/50">
              No available commanders.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {availableCommanders.map((cmd) => {
                const rarityColor = RARITY_COLORS[cmd.rarity];
                return (
                  <button
                    key={cmd.id}
                    className="flex items-center gap-3 border-2 px-3 py-2 text-left transition-colors hover:brightness-125"
                    style={{
                      backgroundColor: '#000066',
                      borderColor: '#0066CC',
                    }}
                    onClick={() => onSelect(cmd)}
                  >
                    {/* portrait */}
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border-2 text-base font-black"
                      style={{
                        borderColor: rarityColor,
                        color: rarityColor,
                        backgroundColor: '#000044',
                      }}
                    >
                      {cmd.name.charAt(0).toUpperCase()}
                    </div>

                    {/* info */}
                    <div className="flex flex-1 flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[13px] font-bold text-white"
                        >
                          {cmd.name}
                        </span>
                        <StarDisplay count={cmd.stars} />
                      </div>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span style={{ color: rarityColor }}>
                          {cmd.rarity.charAt(0).toUpperCase() + cmd.rarity.slice(1)}
                        </span>
                        <span className="text-white/40">Lv.{cmd.level}</span>
                        <span className="text-white/40">Skill: {cmd.skill}</span>
                      </div>
                      <div className="flex gap-3 text-[10px] text-white/50">
                        <span>Acc:{cmd.stats.accuracy}</span>
                        <span>Spd:{cmd.stats.speed}</span>
                        <span>Ddg:{cmd.stats.dodge}</span>
                        <span>Elec:{cmd.stats.electron}</span>
                      </div>
                    </div>

                    {/* rarity dot */}
                    <div
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${RARITY_DOT_CLASS[cmd.rarity]}`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* footer */}
        <div
          className="border-t-2 px-4 py-2.5 text-center"
          style={{ backgroundColor: '#003399', borderColor: '#0066CC' }}
        >
          <button
            className="px-6 py-1.5 text-xs font-bold uppercase text-white"
            style={{ backgroundColor: '#0033AA', border: '2px solid #0066FF' }}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── formation slot ─────────────────────── */

function FormationSlotCell({
  slot,
  stackLimit,
  onClick,
}: {
  slot: FormationSlot;
  stackLimit: number;
  onClick: () => void;
}) {
  return (
    <button
      className="flex flex-col items-center justify-center gap-0.5 border-2 text-xs font-bold transition-colors hover:brightness-110"
      style={{
        width: '60px',
        height: '60px',
        backgroundColor: slot.ship ? '#000088' : '#000066',
        borderColor: slot.ship ? '#0088FF' : '#0066CC',
        color: slot.ship ? '#ffffff' : '#666666',
      }}
      onClick={onClick}
    >
      {slot.ship ? (
        <>
          <span className="text-base">{slot.ship.icon}</span>
          <span className="text-[9px] font-normal text-white/70">
            {slot.ship.count}/{slot.ship.maxCount}
          </span>
        </>
      ) : (
        <span className="text-xl text-white/20">+</span>
      )}
    </button>
  );
}

/* ─────────────────────── fleet tab ─────────────────────── */

function FleetTab({
  fleet,
  isActive,
  onClick,
}: {
  fleet: Fleet;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="flex flex-1 flex-col items-center gap-1 border-b-2 px-3 py-2 text-xs font-bold transition-colors"
      style={{
        backgroundColor: isActive ? '#0033AA' : '#001155',
        borderColor: isActive ? '#0066CC' : '#000033',
        color: fleet.unlocked ? (isActive ? '#ffffff' : '#88aadd') : '#444466',
        cursor: fleet.unlocked ? 'pointer' : 'not-allowed',
        opacity: fleet.unlocked ? 1 : 0.6,
      }}
      onClick={fleet.unlocked ? onClick : undefined}
      disabled={!fleet.unlocked}
    >
      <span>{fleet.name}</span>
      {fleet.unlocked && (
        <span
          className="text-[9px] font-normal"
          style={{ color: fleet.commander ? '#44ff44' : '#ff4444' }}
        >
          {fleet.commander ? '● READY' : '● NO CMDR'}
        </span>
      )}
      {!fleet.unlocked && (
        <span className="text-[9px] font-normal">🔒 LOCKED</span>
      )}
    </button>
  );
}

/* ─────────────────────── main component ─────────────────────── */

export function Go2FleetSystem({
  commanders,
  fleets: propFleets,
  maxFleets = BASE_MAX_FLEETS,
  onAssignCommander,
  onRemoveCommander,
  onUpdateFormation,
  onDeployFleet,
  onUnlockFleet,
}: FleetSystemProps) {
  /* local state for fleet data if not provided externally */
  const [localFleets, setLocalFleets] = useState<Fleet[]>(() => {
    if (propFleets) return propFleets;
    return buildMockFleets(maxFleets);
  });

  /* API state */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  /* Load fleets from API on mount */
  useEffect(() => {
    if (propFleets) return; // Skip if fleets provided externally

    let cancelled = false;
    async function loadFleets() {
      setLoading(true);
      setError(null);
      setUsingFallback(false);
      try {
        const data = await getFleets();
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((f: FleetData, i: number) => apiFleetToLocal(f, i));
          // Fill remaining slots up to maxFleets
          while (mapped.length < maxFleets) {
            mapped.push({
              id: mapped.length + 1,
              name: `Fleet ${mapped.length + 1}`,
              unlocked: false,
              commander: null,
              formation: Array.from({ length: FORMATION_SIZE }, (_, j) => ({
                index: j,
                ship: null,
              })),
            });
          }
          setLocalFleets(mapped.slice(0, maxFleets));
        } else {
          // API returned empty — keep mock fallback
          setUsingFallback(true);
        }
      } catch (err) {
        if (cancelled) return;
        console.warn('[Go2FleetSystem] API error, using mock fallback:', err);
        setError(err instanceof Error ? err.message : 'Failed to load fleets');
        setUsingFallback(true);
        // Keep default mock fleets already in state
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadFleets();
    return () => { cancelled = true; };
  }, [propFleets, maxFleets]);

  const fleets = propFleets ?? localFleets;

  const [activeFleetId, setActiveFleetId] = useState<number>(1);
  const [showCommanderSelector, setShowCommanderSelector] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFleetName, setNewFleetName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const activeFleet = fleets.find((f) => f.id === activeFleetId) ?? fleets[0];

  /* commanders already assigned to other fleets */
  const assignedCommanderIds = useMemo(
    () =>
      new Set(
        fleets
          .filter((f) => f.id !== activeFleetId)
          .map((f) => f.commander?.id)
          .filter(Boolean) as string[]
      ),
    [fleets, activeFleetId]
  );

  /* available commanders = not assigned elsewhere */
  const availableCommanders = useMemo(
    () => commanders.filter((c) => !assignedCommanderIds.has(c.id)),
    [commanders, assignedCommanderIds]
  );

  /* fleet stats derived from commander */
  const fleetStats = useMemo(() => {
    if (!activeFleet?.commander) {
      return {
        movement: '--',
        structure: '--',
        shields: '--',
        attack: '--',
        effectiveStack: 0,
      };
    }
    const cmd = activeFleet.commander;
    return {
      movement: cmd.stats.speed.toFixed(1),
      structure: '0',
      shields: '0',
      attack: '0',
      effectiveStack: getEffectiveStack(cmd),
    };
  }, [activeFleet]);

  /* can deploy = has commander + at least one ship */
  const canDeploy = useMemo(() => {
    if (!activeFleet?.commander) return false;
    const hasShips = activeFleet.formation.some((s) => s.ship !== null);
    return hasShips;
  }, [activeFleet]);

  /* ─── API: create fleet ─── */
  const handleCreateFleet = useCallback(async () => {
    if (!newFleetName.trim()) return;
    setCreating(true);
    try {
      const formationSlots: FormationSlotPayload[] = [];
      const result = await createFleet(newFleetName.trim(), 'home-planet', formationSlots);
      if (result) {
        const newFleet = apiFleetToLocal(result, fleets.filter(f => f.unlocked).length);
        newFleet.unlocked = true;
        setLocalFleets((prev) => {
          const updated = [...prev];
          // Find first locked slot to replace, or append
          const lockedIdx = updated.findIndex((f) => !f.unlocked);
          if (lockedIdx >= 0) {
            updated[lockedIdx] = { ...newFleet, id: updated[lockedIdx].id };
          } else {
            updated.push(newFleet);
          }
          return updated;
        });
        setShowCreateModal(false);
        setNewFleetName('');
      }
    } catch (err) {
      console.error('[Go2FleetSystem] Failed to create fleet:', err);
      setError(err instanceof Error ? err.message : 'Failed to create fleet');
    } finally {
      setCreating(false);
    }
  }, [newFleetName, fleets]);

  /* ─── API: delete fleet ─── */
  const handleDeleteFleet = useCallback(async (fleetId: number) => {
    setDeletingId(fleetId);
    try {
      await deleteFleet(String(fleetId));
      setLocalFleets((prev) =>
        prev.map((f) =>
          f.id === fleetId
            ? { ...f, unlocked: false, commander: null, formation: Array.from({ length: FORMATION_SIZE }, (_, j) => ({ index: j, ship: null })) }
            : f
        )
      );
    } catch (err) {
      console.error('[Go2FleetSystem] Failed to delete fleet:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete fleet');
    } finally {
      setDeletingId(null);
    }
  }, []);

  /* handlers */
  const handleAssignCommander = useCallback(
    (commander: Commander) => {
      if (propFleets) {
        onAssignCommander?.(activeFleetId, commander.id);
      } else {
        setLocalFleets((prev) =>
          prev.map((f) =>
            f.id === activeFleetId ? { ...f, commander } : f
          )
        );
        onAssignCommander?.(activeFleetId, commander.id);
      }
      setShowCommanderSelector(false);
    },
    [activeFleetId, onAssignCommander, propFleets]
  );

  const handleRemoveCommander = useCallback(() => {
    if (propFleets) {
      onRemoveCommander?.(activeFleetId);
    } else {
      setLocalFleets((prev) =>
        prev.map((f) =>
          f.id === activeFleetId ? { ...f, commander: null } : f
        )
      );
      onRemoveCommander?.(activeFleetId);
    }
  }, [activeFleetId, onRemoveCommander, propFleets]);

  const handleSlotClick = useCallback(
    (slotIndex: number) => {
      /* Placeholder: in full implementation this would open ship inventory */
      if (!activeFleet?.commander) return;
      // For now toggle a placeholder ship
      if (propFleets) {
        const newFormation = [...activeFleet.formation];
        const current = newFormation[slotIndex];
        newFormation[slotIndex] = {
          ...current,
          ship: current.ship
            ? null
            : {
                id: `ship-${slotIndex}`,
                name: 'Fighter',
                icon: '🚀',
                count: 100,
                maxCount: getEffectiveStack(activeFleet.commander),
                attack: 10,
                shield: 5,
                structure: 20,
              },
        };
        onUpdateFormation?.(activeFleetId, newFormation);
      } else {
        setLocalFleets((prev) =>
          prev.map((f) => {
            if (f.id !== activeFleetId) return f;
            const newFormation = [...f.formation];
            const current = newFormation[slotIndex];
            newFormation[slotIndex] = {
              ...current,
              ship: current.ship
                ? null
                : {
                    id: `ship-${slotIndex}`,
                    name: 'Fighter',
                    icon: '🚀',
                    count: 100,
                    maxCount: getEffectiveStack(f.commander),
                    attack: 10,
                    shield: 5,
                    structure: 20,
                  },
            };
            return { ...f, formation: newFormation };
          })
        );
        const newFormation = [...activeFleet.formation];
        const current = newFormation[slotIndex];
        newFormation[slotIndex] = {
          ...current,
          ship: current.ship
            ? null
            : {
                id: `ship-${slotIndex}`,
                name: 'Fighter',
                icon: '🚀',
                count: 100,
                maxCount: getEffectiveStack(activeFleet.commander),
                attack: 10,
                shield: 5,
                structure: 20,
              },
        };
        onUpdateFormation?.(activeFleetId, newFormation);
      }
    },
    [activeFleet, activeFleetId, onUpdateFormation, propFleets]
  );

  const handleUnlockFleet = useCallback(() => {
    const lockedFleet = fleets.find((f) => !f.unlocked);
    if (!lockedFleet) return;
    if (propFleets) {
      onUnlockFleet?.(lockedFleet.id);
    } else {
      setLocalFleets((prev) =>
        prev.map((f) =>
          f.id === lockedFleet.id ? { ...f, unlocked: true } : f
        )
      );
      onUnlockFleet?.(lockedFleet.id);
    }
  }, [fleets, onUnlockFleet, propFleets]);

  const handleDeploy = useCallback(() => {
    if (!canDeploy) return;
    onDeployFleet?.(activeFleetId);
  }, [canDeploy, activeFleetId, onDeployFleet]);

  /* ─────────────── render ─────────────── */

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-sm border-2"
      style={{
        backgroundColor: '#000044',
        borderColor: '#0066CC',
      }}
    >
      {/* ═══ header ═══ */}
      <div
        className="flex items-center justify-between border-b-2 px-4 py-2"
        style={{
          backgroundColor: '#003399',
          borderColor: '#0066CC',
        }}
      >
        <span className="text-sm font-bold uppercase tracking-wider text-white">
          Fleet Management
        </span>
        <div className="flex items-center gap-2">
          {loading && (
            <span className="text-[10px] text-yellow-300 animate-pulse">
              Loading...
            </span>
          )}
          {usingFallback && (
            <span className="text-[10px] text-white/40" title="Using local data">
              ● OFFLINE
            </span>
          )}
          <span className="text-[11px] text-white/60">Fleets:</span>
          <span
            className="rounded-sm px-3 py-0.5 text-[11px] font-bold"
            style={{
              backgroundColor: '#000066',
              color: '#ffd54f',
              border: '1px solid #0066CC',
            }}
          >
            {fleets.filter((f) => f.unlocked).length} / {maxFleets}
          </span>
        </div>
      </div>

      {/* ═══ error banner ═══ */}
      {error && (
        <div
          className="px-4 py-1.5 text-[10px] font-bold uppercase text-center"
          style={{
            backgroundColor: '#330000',
            color: '#ff4444',
            borderBottom: '1px solid #CC0000',
          }}
        >
          ⚠ {error}
          <button
            className="ml-3 underline"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ═══ fleet tabs ═══ */}
      <div className="flex border-b-2" style={{ borderColor: '#0066CC' }}>
        {fleets.map((fleet) => (
          <FleetTab
            key={fleet.id}
            fleet={fleet}
            isActive={fleet.id === activeFleetId}
            onClick={() => setActiveFleetId(fleet.id)}
          />
        ))}
        {/* unlock / create buttons */}
        <div className="flex items-center">
          {fleets.some((f) => !f.unlocked) && (
            <button
              className="flex items-center gap-1 px-3 py-2 text-[11px] font-bold uppercase text-white transition-colors hover:brightness-125"
              style={{
                backgroundColor: '#001155',
                borderLeft: '2px solid #000033',
              }}
              onClick={handleUnlockFleet}
            >
              <span className="text-sm">+</span> Unlock
            </button>
          )}
          <button
            className="flex items-center gap-1 px-3 py-2 text-[11px] font-bold uppercase text-white transition-colors hover:brightness-125"
            style={{
              backgroundColor: '#002244',
              borderLeft: '2px solid #000033',
            }}
            onClick={() => setShowCreateModal(true)}
            title="Create new fleet"
          >
            <span className="text-sm">++</span> New
          </button>
        </div>
      </div>

      {/* ═══ main content ═══ */}
      {activeFleet && activeFleet.unlocked ? (
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          {/* ── commander section ── */}
          <div className="flex flex-col gap-2">
            <div
              className="text-xs font-bold uppercase tracking-wider text-white/60"
              style={{ borderBottom: '1px solid #0066CC', paddingBottom: '4px' }}
            >
              Commander
            </div>

            {activeFleet.commander ? (
              <div className="flex items-start gap-3">
                {/* commander portrait */}
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border-2 text-lg font-black"
                  style={{
                    borderColor: RARITY_COLORS[activeFleet.commander.rarity],
                    color: RARITY_COLORS[activeFleet.commander.rarity],
                    backgroundColor: '#000066',
                  }}
                >
                  {activeFleet.commander.name.charAt(0).toUpperCase()}
                </div>

                {/* commander info */}
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-white">
                      {activeFleet.commander.name}
                    </span>
                    <StarDisplay count={activeFleet.commander.stars} />
                    <span
                      className="text-[11px] font-semibold"
                      style={{
                        color: RARITY_COLORS[activeFleet.commander.rarity],
                      }}
                    >
                      {activeFleet.commander.rarity.charAt(0).toUpperCase() +
                        activeFleet.commander.rarity.slice(1)}
                    </span>
                  </div>
                  <div className="flex gap-3 text-[11px]">
                    <span className="text-white/60">
                      Acc:{activeFleet.commander.stats.accuracy}
                    </span>
                    <span className="text-white/60">
                      Spd:{activeFleet.commander.stats.speed}
                    </span>
                    <span className="text-white/60">
                      Ddg:{activeFleet.commander.stats.dodge}
                    </span>
                    <span className="text-white/60">
                      Elec:{activeFleet.commander.stats.electron}
                    </span>
                  </div>
                  <div className="text-[11px] text-white/50">
                    Skill: {activeFleet.commander.skill}
                  </div>
                </div>

                {/* remove button */}
                <button
                  className="shrink-0 px-3 py-1.5 text-[10px] font-bold uppercase text-white"
                  style={{
                    backgroundColor: '#660000',
                    border: '2px solid #CC0000',
                  }}
                  onClick={handleRemoveCommander}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border-2 border-dashed"
                  style={{
                    borderColor: '#333366',
                    backgroundColor: '#000066',
                  }}
                >
                  <span className="text-2xl text-white/10">?</span>
                </div>
                <button
                  className="px-6 py-2.5 text-xs font-bold uppercase text-white"
                  style={{
                    backgroundColor: '#0033AA',
                    border: '2px solid #0066FF',
                  }}
                  onClick={() => setShowCommanderSelector(true)}
                >
                  + Assign Commander
                </button>
              </div>
            )}

            {/* warning: no commander */}
            {!activeFleet.commander && (
              <div
                className="mt-1 px-3 py-2 text-center text-xs font-bold uppercase"
                style={{
                  color: '#FF0000',
                  backgroundColor: '#330000',
                  border: '1px solid #CC0000',
                }}
              >
                ⚠ This fleet has NO COMMANDER and cannot deploy!
              </div>
            )}
          </div>

          {/* ── formation (3x3) ── */}
          <div className="flex flex-col gap-2">
            <div
              className="text-xs font-bold uppercase tracking-wider text-white/60"
              style={{ borderBottom: '1px solid #0066CC', paddingBottom: '4px' }}
            >
              Formation (3x3)
            </div>

            <div className="flex items-center gap-4">
              {/* formation grid */}
              <div className="flex flex-col items-center gap-1.5">
                {[0, 1, 2].map((row) => (
                  <div key={row} className="flex gap-1.5">
                    {[0, 1, 2].map((col) => {
                      const idx = row * 3 + col;
                      return (
                        <FormationSlotCell
                          key={idx}
                          slot={activeFleet.formation[idx]}
                          stackLimit={getEffectiveStack(activeFleet.commander)}
                          onClick={() => handleSlotClick(idx)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* formation info */}
              <div
                className="flex flex-1 flex-col gap-2 rounded-sm border-2 p-3"
                style={{
                  backgroundColor: '#000066',
                  borderColor: '#0066CC',
                }}
              >
                <div className="text-[11px] text-white/40">
                  Slot positions determine attack order in combat.
                </div>
                <div className="text-[11px] text-white/40">
                  Ships in the front row take damage first.
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: '#0088FF' }}
                  />
                  <span className="text-[10px] text-white/40">Occupied</span>
                  <span
                    className="ml-3 h-3 w-3 rounded-full"
                    style={{ backgroundColor: '#000066', border: '1px solid #0066CC' }}
                  />
                  <span className="text-[10px] text-white/40">Empty</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── fleet stats ── */}
          <div className="flex flex-col gap-2">
            <div
              className="text-xs font-bold uppercase tracking-wider text-white/60"
              style={{ borderBottom: '1px solid #0066CC', paddingBottom: '4px' }}
            >
              Fleet Stats
            </div>

            <div
              className="grid grid-cols-2 gap-3 rounded-sm border-2 p-3"
              style={{
                backgroundColor: '#000066',
                borderColor: '#0066CC',
              }}
            >
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-white/50">Movement:</span>
                <span className="font-bold text-white">{fleetStats.movement}</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-white/50">Structure:</span>
                <span className="font-bold text-white">{fleetStats.structure}</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-white/50">Shields:</span>
                <span className="font-bold text-white">{fleetStats.shields}</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-white/50">Attack:</span>
                <span className="font-bold text-white">{fleetStats.attack}</span>
              </div>
              <div className="col-span-2 flex items-center justify-between text-[12px]">
                <span className="text-white/50">Effective Stack:</span>
                {fleetStats.effectiveStack > 0 ? (
                  <span className="font-bold" style={{ color: '#ffd54f' }}>
                    {fleetStats.effectiveStack.toLocaleString()} ships/slot
                    <span className="ml-2 text-[10px] font-normal text-white/40">
                      ({activeFleet?.commander?.stars}★ commander
                      {activeFleet?.commander &&
                        RARITY_STACK_BONUS[activeFleet.commander.rarity] > 1 && (
                          <span>
                            ,{' '}
                            {Math.round(
                              (RARITY_STACK_BONUS[activeFleet.commander.rarity] -
                                1) *
                                100
                            )}
                            % {activeFleet.commander.rarity} bonus
                          </span>
                        )}
                      )
                    </span>
                  </span>
                ) : (
                  <span className="font-bold text-white/30">--</span>
                )}
              </div>
            </div>
          </div>

          {/* ── action buttons ── */}
          <div className="mt-auto flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <button
                className="px-5 py-2 text-[11px] font-bold uppercase text-white transition-colors hover:brightness-110"
                style={{
                  backgroundColor: '#0033AA',
                  border: '2px solid #0066FF',
                }}
              >
                Save Formation
              </button>
              <button
                className="px-3 py-2 text-[10px] font-bold uppercase text-white transition-colors hover:brightness-110"
                style={{
                  backgroundColor: deletingId === activeFleetId ? '#333355' : '#551100',
                  border: '2px solid #CC3300',
                  opacity: deletingId === activeFleetId ? 0.5 : 1,
                }}
                onClick={() => handleDeleteFleet(activeFleetId)}
                disabled={deletingId === activeFleetId}
              >
                {deletingId === activeFleetId ? 'Deleting...' : 'Delete Fleet'}
              </button>
            </div>

            <div className="flex items-center gap-3">
              {!canDeploy && (
                <span className="text-[10px] text-white/30">
                  {!activeFleet.commander
                    ? 'Assign a commander to deploy'
                    : 'Add ships to formation to deploy'}
                </span>
              )}
              <button
                className="px-5 py-2 text-[11px] font-bold uppercase text-white transition-colors"
                style={{
                  backgroundColor: canDeploy ? '#0033AA' : '#222244',
                  border: canDeploy ? '2px solid #0066FF' : '2px solid #333355',
                  color: canDeploy ? '#ffffff' : '#555577',
                  cursor: canDeploy ? 'pointer' : 'not-allowed',
                }}
                onClick={handleDeploy}
                disabled={!canDeploy}
              >
                Deploy to Galaxy
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ═══ locked fleet view ═══ */
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
          <div className="text-4xl text-white/20">🔒</div>
          <p className="text-center text-sm font-bold text-white/30">
            {activeFleet?.name} is locked.
          </p>
          <p className="text-center text-[11px] text-white/20">
            Unlock this fleet slot to assign a commander and deploy ships.
          </p>
          <button
            className="px-6 py-2 text-xs font-bold uppercase text-white"
            style={{
              backgroundColor: '#0033AA',
              border: '2px solid #0066FF',
            }}
            onClick={handleUnlockFleet}
          >
            + Unlock Fleet
          </button>
        </div>
      )}

      {/* ═══ commander selector modal ═══ */}
      {showCommanderSelector && (
        <CommanderSelectorModal
          availableCommanders={availableCommanders}
          onSelect={handleAssignCommander}
          onClose={() => setShowCommanderSelector(false)}
        />
      )}

      {/* ═══ create fleet modal ═══ */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="w-[380px] overflow-hidden rounded-sm border-2"
            style={{
              backgroundColor: '#000044',
              borderColor: '#0066CC',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="border-b-2 px-4 py-2.5 text-center text-sm font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: '#003399', borderColor: '#0066CC' }}
            >
              Create New Fleet
            </div>
            <div className="p-4 flex flex-col gap-3">
              <label className="text-[11px] text-white/60 uppercase font-bold">
                Fleet Name
              </label>
              <input
                type="text"
                value={newFleetName}
                onChange={(e) => setNewFleetName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFleet(); }}
                placeholder="Enter fleet name..."
                className="px-3 py-2 text-xs text-white border-2 rounded-sm"
                style={{
                  backgroundColor: '#000066',
                  borderColor: '#0066CC',
                  outline: 'none',
                }}
                autoFocus
              />
            </div>
            <div
              className="border-t-2 px-4 py-2.5 flex justify-center gap-3"
              style={{ backgroundColor: '#003399', borderColor: '#0066CC' }}
            >
              <button
                className="px-6 py-1.5 text-xs font-bold uppercase text-white"
                style={{ backgroundColor: '#0033AA', border: '2px solid #0066FF' }}
                onClick={handleCreateFleet}
                disabled={creating || !newFleetName.trim()}
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
              <button
                className="px-6 py-1.5 text-xs font-bold uppercase text-white"
                style={{ backgroundColor: '#333355', border: '2px solid #555577' }}
                onClick={() => { setShowCreateModal(false); setNewFleetName(''); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Go2FleetSystem;
