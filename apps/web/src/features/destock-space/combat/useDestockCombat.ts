'use client';

import { createSeededRng } from './seededRng';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getActiveFleetUnits } from './destockFleetStorage';
import type { Go2CombatMission } from './destockCombatData';
import { getCombatMission } from './destockCombatData';

export interface CombatUnit {
  uid: string;
  side: 'player' | 'enemy';
  cell: number;
  name: string;
  attack: number;
  defense: number;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
}

export interface CombatBeam {
  id: string;
  fromCell: number;
  toCell: number;
  side: 'player' | 'enemy';
  kind: 'ballistic' | 'directional' | 'crit';
}

export interface CombatLogLine {
  id: string;
  text: string;
  tone: 'info' | 'hit' | 'crit' | 'kill' | 'warn';
}

export type CombatPhase = 'deploy' | 'fighting' | 'victory' | 'defeat';

function spawnWave(
  wave: { cell: number; template: { name: string; attack: number; defense: number; hp: number; shield: number } }[],
  prefix: string
): CombatUnit[] {
  return wave.map((w, i) => ({
    uid: `${prefix}-${i}`,
    side: 'enemy' as const,
    cell: w.cell,
    name: w.template.name,
    attack: w.template.attack,
    defense: w.template.defense,
    hp: w.template.hp,
    maxHp: w.template.hp,
    shield: w.template.shield,
    maxShield: w.template.shield,
  }));
}

function initPlayer(mission: Go2CombatMission): CombatUnit[] {
  const fleet = getActiveFleetUnits();
  if (fleet.length) return fleet;
  return mission.playerStarter.map((p, i) => ({
    uid: `p-${i}`,
    side: 'player' as const,
    cell: p.cell,
    name: p.template.name,
    attack: p.template.attack,
    defense: p.template.defense,
    hp: p.template.hp,
    maxHp: p.template.hp,
    shield: p.template.shield,
    maxShield: p.template.shield,
  }));
}

function alive(units: CombatUnit[], side: 'player' | 'enemy') {
  return units.filter((u) => u.hp > 0 && u.side === side);
}

function pickTarget(attacker: CombatUnit, enemies: CombatUnit[], focusCell: number | null): CombatUnit | null {
  const pool = enemies.filter((e) => e.hp > 0);
  if (!pool.length) return null;
  if (focusCell != null) {
    const f = pool.find((e) => e.cell === focusCell);
    if (f) return f;
  }
  return pool.reduce((best, cur) => (cur.attack > best.attack ? cur : best), pool[0]);
}

export function useDestockCombat(missionId: number) {
  const mission = getCombatMission(missionId) ?? getCombatMission(1)!;
  const seed = useMemo(() => missionId * 9973 + 42, [missionId]);
  const rngRef = useRef(createSeededRng(seed));

  const [phase, setPhase] = useState<CombatPhase>('deploy');
  const [round, setRound] = useState(0);
  const [auto, setAuto] = useState(true);
  const [focusCell, setFocusCell] = useState<number | null>(null);
  const [units, setUnits] = useState<CombatUnit[]>(() => initPlayer(mission));
  const [waveIndex, setWaveIndex] = useState(0);
  const [beams, setBeams] = useState<CombatBeam[]>([]);
  const [log, setLog] = useState<CombatLogLine[]>([]);
  const logId = useRef(0);
  const beamId = useRef(0);
  const battleSnapshot = useRef<{
    player: CombatUnit[];
    enemies: CombatUnit[];
  } | null>(null);

  const phaseRef = useRef(phase);
  const waveIndexRef = useRef(waveIndex);
  const focusRef = useRef(focusCell);
  const roundRef = useRef(round);
  const unitsRef = useRef(units);
  phaseRef.current = phase;
  waveIndexRef.current = waveIndex;
  focusRef.current = focusCell;
  roundRef.current = round;
  unitsRef.current = units;

  const playerDeployCount = useMemo(
    () => units.filter((u) => u.side === 'player').length,
    [units]
  );

  const refreshFleet = useCallback(() => {
    setUnits(initPlayer(mission));
    setWaveIndex(0);
    waveIndexRef.current = 0;
  }, [mission]);

  const pushLog = useCallback((text: string, tone: CombatLogLine['tone'] = 'info') => {
    logId.current += 1;
    setLog((prev) => [{ id: `l-${logId.current}`, text, tone }, ...prev].slice(0, 80));
  }, []);

  const buildEnemySnapshot = useCallback(() => {
    const all: CombatUnit[] = [];
    mission.waves.forEach((wave, wi) => {
      all.push(...spawnWave(wave, `snap-e-${wi}`));
    });
    return all;
  }, [mission.waves]);

  const appendWave = useCallback(
    (currentUnits: CombatUnit[], wi: number): { units: CombatUnit[]; spawned: CombatUnit[] } | null => {
      const wave = mission.waves[wi];
      if (!wave) return null;
      const spawned = spawnWave(wave, `w${wi}`);
      return { units: [...currentUnits, ...spawned], spawned };
    },
    [mission.waves]
  );

  const resolveHit = useCallback((attacker: CombatUnit, defender: CombatUnit) => {
    const rng = rngRef.current;
    const crit = rng() < 0.12;
    let raw = attacker.attack * (crit ? 1.6 : 1) - defender.defense * 0.35;
    raw = Math.max(4, Math.round(raw));
    const shieldLoss = Math.min(defender.shield, raw);
    const hpLoss = Math.max(0, raw - defender.shield);
    return { crit, shieldLoss, hpLoss };
  }, []);

  const processRound = useCallback(() => {
    if (phaseRef.current !== 'fighting') return;

    // Cómputo 100% síncrono leyendo de unitsRef.current. NO mutar dentro de un
    // updater de setUnits: React no garantiza que el updater corra síncrono (y en
    // StrictMode lo invoca 2 veces), por lo que leer efectos justo después daba
    // datos vacíos/duplicados → la ronda quedaba congelada. Aquí calculamos todo,
    // luego aplicamos un único setUnits(valor) + efectos con datos ya válidos.
    const currentUnits = unitsRef.current;
    const players = alive(currentUnits, 'player');
    const enemies = alive(currentUnits, 'enemy');

    if (!players.length) {
      setPhase('defeat');
      phaseRef.current = 'defeat';
      pushLog('Flota destruida. Retirada forzosa.', 'warn');
      return;
    }

    if (!enemies.length) {
      const wi = waveIndexRef.current;
      if (wi < mission.waves.length) {
        const added = appendWave(currentUnits, wi);
        if (added) {
          waveIndexRef.current = wi + 1;
          setWaveIndex(wi + 1);
          unitsRef.current = added.units;
          setUnits(added.units);
          const cornerHint = mission.mode === 'base_defense' ? ' (esquinas)' : '';
          pushLog(`Oleada ${wi + 1}${cornerHint} — ${added.spawned.length} contactos`, 'warn');
          return;
        }
      }
      setPhase('victory');
      phaseRef.current = 'victory';
      pushLog('Objetivo cumplido. Misión completada.', 'info');
      return;
    }

    const nextRound = roundRef.current + 1;
    if (nextRound > mission.maxRounds) {
      setPhase('defeat');
      phaseRef.current = 'defeat';
      pushLog('Tiempo agotado — misión fallida.', 'warn');
      return;
    }

    const next = currentUnits.map((u) => ({ ...u }));
    const focus = focusRef.current;
    const logLines: { text: string; tone: CombatLogLine['tone'] }[] = [];
    const roundBeams: CombatBeam[] = [];

    const act = (
      attacker: CombatUnit,
      targets: CombatUnit[],
      focusCell: number | null,
      side: 'player' | 'enemy'
    ) => {
      const liveTargets = targets.filter((t) => t.hp > 0);
      const target = pickTarget(attacker, liveTargets, side === 'player' ? focusCell : null);
      if (!target) return;
      const att = next.find((x) => x.uid === attacker.uid);
      const def = next.find((x) => x.uid === target.uid);
      if (!att || !def || att.hp <= 0 || def.hp <= 0) return;

      const { crit, shieldLoss, hpLoss } = resolveHit(att, def);
      def.shield = Math.max(0, def.shield - shieldLoss);
      def.hp = Math.max(0, def.hp - hpLoss);

      beamId.current += 1;
      roundBeams.push({
        id: `b-${beamId.current}`,
        fromCell: att.cell,
        toCell: def.cell,
        side,
        kind: crit ? 'crit' : att.side === 'player' ? 'directional' : 'ballistic',
      });

      const msg = crit
        ? `${att.name} CRÍTICO → ${def.name} (−${hpLoss + shieldLoss})`
        : `${att.name} → ${def.name} (−${hpLoss + shieldLoss})`;
      logLines.push({ text: msg, tone: crit ? 'crit' : 'hit' });
      if (def.hp <= 0) logLines.push({ text: `${def.name} destruido`, tone: 'kill' });
    };

    for (const p of players) act(p, enemies, focus, 'player');
    for (const e of enemies) act(e, players, null, 'enemy');

    unitsRef.current = next;
    setUnits(next);
    roundRef.current = nextRound;
    setRound(nextRound);
    for (const line of logLines) pushLog(line.text, line.tone);
    if (roundBeams.length) {
      setBeams(roundBeams);
      setTimeout(() => setBeams([]), 480);
    }
  }, [appendWave, mission.maxRounds, mission.mode, mission.waves.length, pushLog, resolveHit]);

  const processRoundRef = useRef(processRound);
  processRoundRef.current = processRound;

  const startBattle = useCallback(() => {
    const players = units.filter((u) => u.side === 'player');
    if (!players.length) {
      pushLog('Sin naves — configura la flota en /destock/fleets', 'warn');
      return;
    }

    battleSnapshot.current = {
      player: players.map((p) => ({ ...p })),
      enemies: buildEnemySnapshot(),
    };

    rngRef.current = createSeededRng(seed);
    waveIndexRef.current = 0;
    setWaveIndex(0);

    let deployed = players;
    const first = appendWave(players, 0);
    if (first) {
      deployed = first.units;
      waveIndexRef.current = 1;
      setWaveIndex(1);
    }

    unitsRef.current = deployed;
    setUnits(deployed);
    setPhase('fighting');
    phaseRef.current = 'fighting';
    setRound(0);
    roundRef.current = 0;

    pushLog(`${mission.title}: ${mission.subtitle}`, 'info');
    if (first) {
      const cornerHint = mission.mode === 'base_defense' ? ' (esquinas)' : '';
      pushLog(`Oleada 1${cornerHint} — ${first.spawned.length} contactos`, 'warn');
    }
    if (getActiveFleetUnits().length) {
      pushLog(`Flota activa: ${players.length} naves desplegadas`, 'info');
    }

    window.setTimeout(() => processRoundRef.current(), 80);
  }, [units, seed, mission, pushLog, buildEnemySnapshot, appendWave]);

  useEffect(() => {
    if (phase !== 'fighting' || !auto) return;
    const id = setInterval(() => processRoundRef.current(), 700);
    return () => clearInterval(id);
  }, [phase, auto]);

  const reset = useCallback(() => {
    setPhase('deploy');
    phaseRef.current = 'deploy';
    setRound(0);
    roundRef.current = 0;
    setWaveIndex(0);
    waveIndexRef.current = 0;
    setUnits(initPlayer(mission));
    setBeams([]);
    setLog([]);
    setFocusCell(null);
    rngRef.current = createSeededRng(seed);
  }, [mission, seed]);

  return {
    mission,
    phase,
    round,
    auto,
    setAuto,
    focusCell,
    setFocusCell,
    units,
    beams,
    log,
    playerDeployCount,
    refreshFleet,
    startBattle,
    tick: processRound,
    reset,
    combatSeed: seed,
    getBattleSnapshot: () => battleSnapshot.current,
  };
}
