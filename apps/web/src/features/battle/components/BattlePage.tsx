/**
 * ========================================================================
 * Galaxy Online 3 — BattlePage (Componente Principal de Integracion)
 * ========================================================================
 * Pagina completa que integra el BattleEngine con la UI visual.
 * Conecta useBattleState con BattleArena, BattleHUD, y todos los
 * componentes visuales para crear una experiencia de batalla jugable.
 *
 * @module battle/components/BattlePage
 * ========================================================================
 */

'use client';

import { useMemo, useState } from 'react';
import { useBattleState } from '../hooks/useBattleState';
import { ALL_PRESETS } from '../data/battlePresets';
import type { BattlePreset } from '../data/battlePresets';

// UI Components
import { BattleArena } from './BattleArena';
import { BattleTopBar } from './BattleTopBar';
import { FloatingDamage } from './FloatingDamage';
import { BattleTimeline } from './BattleTimeline';
import { CommanderPortrait } from './CommanderPortrait';
import { MiniMap } from './MiniMap';
import type { PlayerInfo, MapUnit } from '.';
import type { Commander } from './CommanderPortrait';

// ============================================================================
// RESULT SCREEN COMPONENT
// ============================================================================

function BattleResultScreen({
  winner,
  currentRound,
  totalAttackerShips,
  totalDefenderShips,
  initialAttackerShips,
  initialDefenderShips,
  onReset,
  onNewBattle,
  onSaveBattle,
  battleSaved,
}: {
  winner: 'attacker' | 'defender' | 'draw' | null;
  currentRound: number;
  totalAttackerShips: number;
  totalDefenderShips: number;
  initialAttackerShips: number;
  initialDefenderShips: number;
  onReset: () => void;
  onNewBattle: () => void;
  onSaveBattle?: () => void;
  battleSaved?: boolean;
}) {
  const isVictory = winner === 'attacker';
  const isDefeat = winner === 'defender';

  const attackerLosses = initialAttackerShips - totalAttackerShips;
  const defenderLosses = initialDefenderShips - totalDefenderShips;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className={`rounded-xl border-2 p-8 max-w-md w-full mx-4 text-center ${
          isVictory
            ? 'border-cyan-500 bg-[#0a1a2a] shadow-[0_0_40px_rgba(6,182,212,0.3)]'
            : isDefeat
            ? 'border-rose-500 bg-[#2a0a10] shadow-[0_0_40px_rgba(244,63,94,0.3)]'
            : 'border-yellow-500 bg-[#2a220a] shadow-[0_0_40px_rgba(234,179,8,0.3)]'
        }`}
      >
        {/* Title */}
        <div
          className={`text-4xl font-black mb-2 ${
            isVictory ? 'text-cyan-400' : isDefeat ? 'text-rose-400' : 'text-yellow-400'
          }`}
        >
          {isVictory && 'VICTORY'}
          {isDefeat && 'DEFEAT'}
          {winner === 'draw' && 'DRAW'}
        </div>

        {/* Subtitle */}
        <div className="text-[#6a7a8a] text-sm mb-6">
          {winner === 'draw'
            ? 'Neither fleet was destroyed within the round limit'
            : `The ${winner} fleet prevailed after ${currentRound} rounds of combat`}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#0d1b2f] rounded-lg p-3 border border-[#1a2d4f]">
            <div className="text-cyan-400 text-xs font-bold uppercase mb-1">Attacker</div>
            <div className="text-white text-lg font-bold">
              {totalAttackerShips.toLocaleString()}
            </div>
            <div className="text-[#5a7a9a] text-[10px]">
              Survived / {initialAttackerShips.toLocaleString()} deployed
            </div>
            <div className="text-rose-400 text-[10px] mt-1">
              -{attackerLosses.toLocaleString()} losses
            </div>
          </div>

          <div className="bg-[#2a0d14] rounded-lg p-3 border border-[#3f1e2a]">
            <div className="text-rose-400 text-xs font-bold uppercase mb-1">Defender</div>
            <div className="text-white text-lg font-bold">
              {totalDefenderShips.toLocaleString()}
            </div>
            <div className="text-[#9a5a6a] text-[10px]">
              Survived / {initialDefenderShips.toLocaleString()} deployed
            </div>
            <div className="text-rose-400 text-[10px] mt-1">
              -{defenderLosses.toLocaleString()} losses
            </div>
          </div>
        </div>

        {/* Save Battle button */}
        {onSaveBattle && (
          <button
            onClick={onSaveBattle}
            disabled={battleSaved}
            className={`w-full mb-3 px-4 py-2.5 rounded-lg text-sm font-bold border transition-all ${
              battleSaved
                ? 'bg-green-600/20 border-green-600 text-green-400 cursor-default'
                : 'bg-[#1a2d4f] hover:bg-[#243d6f] text-cyan-400 border-[#2a4a6f]'
            }`}
          >
            {battleSaved ? 'Saved ✓' : 'Save Battle'}
          </button>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onReset}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#1a2d4f] hover:bg-[#243d6f] text-cyan-400 text-sm font-bold border border-[#2a4a6f] transition-colors"
          >
            Restart
          </button>
          <button
            onClick={onNewBattle}
            className="flex-1 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold transition-colors"
          >
            New Battle
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PRESET SELECTOR
// ============================================================================

function PresetSelector({
  onSelect,
}: {
  onSelect: (preset: BattlePreset) => void;
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="rounded-xl border border-[#1e2a4a] bg-[#0a0e1a] p-6 max-w-lg w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-black text-white mb-1">Select Battle</h2>
        <p className="text-[#5a7a9a] text-sm mb-5">
          Choose a preset scenario to begin the battle simulation
        </p>

        {/* Preset list */}
        <div className="space-y-2 mb-6 max-h-64 overflow-y-auto pr-1">
          {ALL_PRESETS.map((preset, idx) => (
            <button
              key={preset.name}
              onClick={() => setSelectedIdx(idx)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                selectedIdx === idx
                  ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                  : 'border-[#1a2535] bg-[#0d1118] hover:border-[#2a3d5f] hover:bg-[#111a28]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-white text-sm font-bold">{preset.name}</div>
                <div className="text-[#4a5a6f] text-[10px]">
                  {preset.attacker.length}v{preset.defender.length}
                </div>
              </div>
              <div className="text-[#5a6a7a] text-xs mt-0.5">{preset.description}</div>
              <div className="flex gap-3 mt-1.5">
                <span className="text-cyan-400 text-[10px]">
                  Atk: {preset.attacker.reduce((s, st) => s + st.totalShips, 0).toLocaleString()} ships
                </span>
                <span className="text-rose-400 text-[10px]">
                  Def: {preset.defender.reduce((s, st) => s + st.totalShips, 0).toLocaleString()} ships
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <button
          onClick={() => onSelect(ALL_PRESETS[selectedIdx])}
          className="w-full px-4 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-colors shadow-[0_0_16px_rgba(6,182,212,0.3)]"
        >
          Start Battle
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN BATTLE PAGE COMPONENT
// ============================================================================

export function BattlePage() {
  const {
    battleState,
    currentRound,
    maxRounds,
    currentPhase,
    attackerStacks,
    defenderStacks,
    events,
    isPaused,
    speed,
    selectedStack,
    floatingDamages,
    initBattle,
    step,
    togglePause,
    setPlaybackSpeed,
    selectStack,
    resetBattle,
    winner,
    isBattleOver,
    totalAttackerShips,
    totalDefenderShips,
    // Backend integration
    battleId,
    battleHistory,
    endBattleWithBackend,
    loadBattleHistory,
  } = useBattleState();

  // Estado para tracking de ships iniciales
  const [initialAttackerShips, setInitialAttackerShips] = useState(0);
  const [initialDefenderShips, setInitialDefenderShips] = useState(0);

  // Estado para mostrar/ocultar selector de preset
  const [showPresetSelector, setShowPresetSelector] = useState(true);

  // Estado para mostrar/ocultar panel de historial
  const [showHistory, setShowHistory] = useState(false);

  // Estado para tracking si la batalla fue guardada
  const [battleSaved, setBattleSaved] = useState(false);

  // Inicializar batalla con preset seleccionado
  const handleSelectPreset = (preset: BattlePreset) => {
    const atkShips = preset.attacker.reduce((s, st) => s + st.totalShips, 0);
    const defShips = preset.defender.reduce((s, st) => s + st.totalShips, 0);
    setInitialAttackerShips(atkShips);
    setInitialDefenderShips(defShips);
    setShowPresetSelector(false);
    initBattle(preset.attacker, preset.defender);
  };

  // Reiniciar con mismo preset
  const handleReset = () => {
    resetBattle();
    setShowPresetSelector(true);
    setBattleSaved(false);
  };

  // Nueva batalla (volver a selector)
  const handleNewBattle = () => {
    resetBattle();
    setShowPresetSelector(true);
    setBattleSaved(false);
  };

  // Guardar resultado de batalla en backend
  const handleSaveBattle = async () => {
    if (!isBattleOver || !winner) return;
    const result: 'WIN' | 'LOSS' | 'DRAW' =
      winner === 'attacker' ? 'WIN' : winner === 'defender' ? 'LOSS' : 'DRAW';
    await endBattleWithBackend(result);
    setBattleSaved(true);
    await loadBattleHistory();
  };

  // Toggle panel de historial
  const handleToggleHistory = () => {
    setShowHistory((prev) => !prev);
    if (!showHistory) {
      loadBattleHistory();
    }
  };

  // --- Derivar datos para UI ---

  // Player info para TopBar
  const attackerInfo: PlayerInfo = useMemo(
    () => ({
      name: 'Attacker Fleet',
      ships: totalAttackerShips,
      maxShips: initialAttackerShips || totalAttackerShips,
    }),
    [totalAttackerShips, initialAttackerShips]
  );

  const defenderInfo: PlayerInfo = useMemo(
    () => ({
      name: 'Defender Fleet',
      ships: totalDefenderShips,
      maxShips: initialDefenderShips || totalDefenderShips,
    }),
    [totalDefenderShips, initialDefenderShips]
  );

  // Comandantes activos para portraits
  const activeAttacker = useMemo((): Commander | null => {
    const stackWithCmd = attackerStacks.find((s) => s.commander);
    if (!stackWithCmd?.commander) return null;
    return {
      id: stackWithCmd.commander.id,
      name: stackWithCmd.commander.name,
      rarity: 'common',
      level: stackWithCmd.commander.level,
      stars: stackWithCmd.commander.stars,
      accuracy: stackWithCmd.commander.accuracy,
      speed: stackWithCmd.commander.speed,
      dodge: stackWithCmd.commander.dodge,
      electron: stackWithCmd.commander.electron,
      skill: stackWithCmd.commander.specialAbility?.name ?? '',
    };
  }, [attackerStacks]);

  const activeDefender = useMemo((): Commander | null => {
    const stackWithCmd = defenderStacks.find((s) => s.commander);
    if (!stackWithCmd?.commander) return null;
    return {
      id: stackWithCmd.commander.id,
      name: stackWithCmd.commander.name,
      rarity: 'common',
      level: stackWithCmd.commander.level,
      stars: stackWithCmd.commander.stars,
      accuracy: stackWithCmd.commander.accuracy,
      speed: stackWithCmd.commander.speed,
      dodge: stackWithCmd.commander.dodge,
      electron: stackWithCmd.commander.electron,
      skill: stackWithCmd.commander.specialAbility?.name ?? '',
    };
  }, [defenderStacks]);

  // MiniMap units
  const mapUnits = useMemo((): MapUnit[] => {
    const units: MapUnit[] = [];

    // Engine ship types -> minimap unit types
    const toMapType = (shipType: string): MapUnit['type'] =>
      shipType === 'battleship' ? 'destroyer' : (shipType as MapUnit['type']);

    attackerStacks.forEach((stack, i) => {
      units.push({
        id: stack.id,
        x: 10 + (i * 15) % 40,
        y: 20 + (i % 3) * 25,
        team: 'ally',
        type: toMapType(stack.shipType),
        isDestroyed: stack.currentShips <= 0,
      });
    });

    defenderStacks.forEach((stack, i) => {
      units.push({
        id: stack.id,
        x: 55 + (i * 15) % 40,
        y: 20 + (i % 3) * 25,
        team: 'enemy',
        type: toMapType(stack.shipType),
        isDestroyed: stack.currentShips <= 0,
      });
    });

    return units;
  }, [attackerStacks, defenderStacks]);

  // Mostrar nombre de fase formateado
  const phaseDisplay = currentPhase.replace(/_/g, ' ');

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="w-full h-screen flex flex-col bg-[#0a0e1a] overflow-hidden select-none">
      {/* ============ PRESET SELECTOR ============ */}
      {showPresetSelector && <PresetSelector onSelect={handleSelectPreset} />}

      {/* ============ TOP BAR ============ */}
      <BattleTopBar
        attacker={attackerInfo}
        defender={defenderInfo}
        currentRound={currentRound}
        maxRounds={maxRounds}
        phase={phaseDisplay}
        battleState={battleState}
      />

      {/* ============ MAIN AREA ============ */}
      <div className="flex-1 relative">
        {/* Canvas Arena */}
        <BattleArena
          attackerStacks={attackerStacks}
          defenderStacks={defenderStacks}
          events={events}
          selectedStackId={selectedStack ?? undefined}
          onStackClick={selectStack}
          phase={currentPhase}
          round={currentRound}
        />

        {/* Floating Damage Overlay */}
        <FloatingDamage damages={floatingDamages} />

        {/* Commander Portraits */}
        {attackerStacks.length > 0 && activeAttacker && (
          <div className="absolute bottom-20 left-4 z-20">
            <CommanderPortrait
              commander={activeAttacker}
              faction="attacker"
              isActive={currentRound > 0 && !isBattleOver}
            />
          </div>
        )}

        {defenderStacks.length > 0 && activeDefender && (
          <div className="absolute bottom-20 right-4 z-20">
            <CommanderPortrait
              commander={activeDefender}
              faction="defender"
              isActive={currentRound > 0 && !isBattleOver}
            />
          </div>
        )}

        {/* MiniMap */}
        {attackerStacks.length > 0 && defenderStacks.length > 0 && (
          <div className="absolute bottom-20 right-48 z-20">
            <MiniMap units={mapUnits} />
          </div>
        )}

        {/* Battle Result Screen */}
        {isBattleOver && winner && (
          <BattleResultScreen
            winner={winner}
            currentRound={currentRound}
            totalAttackerShips={totalAttackerShips}
            totalDefenderShips={totalDefenderShips}
            initialAttackerShips={initialAttackerShips}
            initialDefenderShips={initialDefenderShips}
            onReset={handleReset}
            onNewBattle={handleNewBattle}
            onSaveBattle={handleSaveBattle}
            battleSaved={battleSaved}
          />
        )}
      </div>

      {/* ============ BOTTOM CONTROLS ============ */}
      <div className="h-16 bg-[#12182b] border-t border-[#1e2a4a] flex items-center px-4 gap-4 relative">
        {/* Timeline (izquierda, expande) */}
        <div className="flex-1 min-w-0">
          <BattleTimeline
            round={currentRound}
            maxRounds={maxRounds}
            events={events}
          />
        </div>

        {/* Playback controls (centro) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Play / Pause */}
          <button
            onClick={togglePause}
            disabled={isBattleOver || showPresetSelector}
            className={`w-20 px-3 py-2 rounded-lg text-sm font-bold border transition-all ${
              isBattleOver || showPresetSelector
                ? 'bg-[#1a2030] border-[#2a3040] text-[#4a5060] cursor-not-allowed'
                : isPaused
                ? 'bg-green-600/20 border-green-600 text-green-400 hover:bg-green-600/30'
                : 'bg-yellow-600/20 border-yellow-600 text-yellow-400 hover:bg-yellow-600/30'
            }`}
          >
            {isPaused ? '\u25B6 Play' : '\u23F8 Pause'}
          </button>

          {/* Speed selector */}
          <select
            value={speed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            disabled={isBattleOver || showPresetSelector}
            className={`px-2 py-2 rounded-lg text-sm font-bold border bg-[#0d1325] transition-colors ${
              isBattleOver || showPresetSelector
                ? 'border-[#2a3040] text-[#4a5060] cursor-not-allowed'
                : 'border-[#1e2a4a] text-cyan-400 hover:border-cyan-600'
            }`}
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>

          {/* Step */}
          <button
            onClick={step}
            disabled={isBattleOver || showPresetSelector}
            className={`px-3 py-2 rounded-lg text-sm font-bold border transition-all ${
              isBattleOver || showPresetSelector
                ? 'bg-[#1a2030] border-[#2a3040] text-[#4a5060] cursor-not-allowed'
                : 'bg-[#1a2d4f] border-[#2a4a6f] text-cyan-400 hover:bg-[#243d6f]'
            }`}
          >
            Step
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-lg text-sm font-bold border border-[#3f1e2a] bg-[#2a0d14] text-rose-400 hover:bg-[#3d1220] transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Round counter (derecha) */}
        <div className="text-right shrink-0 ml-2">
          <div className="text-[#4a6a8a] text-[10px] uppercase tracking-wider">Round</div>
          <div className="text-white font-bold text-lg leading-tight">
            {currentRound}
            <span className="text-[#3a5a7a] text-xs font-normal">/{maxRounds}</span>
          </div>
        </div>

        {/* History toggle */}
        <button
          onClick={handleToggleHistory}
          className={`shrink-0 ml-3 px-3 py-2 rounded-lg text-sm font-bold border transition-all ${
            showHistory
              ? 'bg-cyan-600/20 border-cyan-600 text-cyan-400'
              : 'bg-[#1a2d4f] border-[#2a4a6f] text-cyan-400 hover:bg-[#243d6f]'
          }`}
        >
          History
        </button>
      </div>

      {/* ============ HISTORY PANEL OVERLAY ============ */}
      {showHistory && (
        <div className="absolute bottom-16 right-4 z-40 w-80 max-h-96 overflow-y-auto rounded-xl border border-[#1e2a4a] bg-[#0a0e1a]/95 backdrop-blur-sm shadow-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold text-sm">Battle History</h3>
            <button
              onClick={() => setShowHistory(false)}
              className="text-[#5a7a9a] hover:text-white text-xs transition-colors"
            >
              Close
            </button>
          </div>

          {battleHistory.length === 0 ? (
            <div className="text-[#5a7a9a] text-xs text-center py-4">
              No battles recorded yet
            </div>
          ) : (
            <div className="space-y-2">
              {battleHistory.map((battle) => (
                <div
                  key={battle.id}
                  className="rounded-lg border border-[#1a2535] bg-[#0d1118] p-3 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-cyan-400 font-bold">
                      vs {battle.defenderId?.slice(0, 8) ?? 'Unknown'}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        battle.winner === 'attacker'
                          ? 'bg-green-600/20 text-green-400'
                          : battle.winner === 'defender'
                          ? 'bg-rose-600/20 text-rose-400'
                          : 'bg-yellow-600/20 text-yellow-400'
                      }`}
                    >
                      {battle.winner}
                    </span>
                  </div>
                  <div className="text-[#5a6a7a] text-[10px]">
                    Rounds: {battle.roundsPlayed} | Status: {battle.status}
                  </div>
                  <div className="text-[#4a5a6f] text-[10px] mt-1">
                    {new Date(battle.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
