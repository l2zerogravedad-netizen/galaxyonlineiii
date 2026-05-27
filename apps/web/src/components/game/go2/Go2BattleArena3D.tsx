/**
 * Go2BattleArena3D.tsx
 * Main 3D battle viewer for Galaxy Online 3.
 * Renders a space battle scene using React Three Fiber with GLB models,
 * laser projectiles, explosion effects, and HUD overlays.
 */
import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Html, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ShipStack3D {
  id: string;
  shipType: 'frigate' | 'cruiser' | 'battleship';
  count: number;
  maxCount: number;
  structure: number; // 0-100%
  shield: number; // 0-100%
  row: number; // 0, 1, 2
  col: number; // 0, 1, 2
  modelVariant: number; // 0-3 for ship variety
}

export interface BattleFleet3D {
  side: 'attacker' | 'defender';
  commander: {
    id: string;
    name: string;
    level: number;
    stars: number;
    portrait: string;
  };
  stacks: ShipStack3D[];
}

export interface BattleAction3D {
  type: 'fire' | 'hit' | 'destroy' | 'skill' | 'move';
  sourceStackId: string;
  targetStackId?: string;
  damage?: number;
  isCritical?: boolean;
  weaponType?: 'ballistic' | 'directional' | 'missile' | 'ship_based';
}

export interface Go2BattleArena3DProps {
  attacker: BattleFleet3D;
  defender: BattleFleet3D;
  currentRound: number;
  maxRounds: number;
  actions: BattleAction3D[];
  isPaused: boolean;
  speed: number; // 0.5, 1, 2, 4
  onPauseToggle: () => void;
  onSpeedChange: (speed: number) => void;
  onSkip: () => void;
  onExit: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GRID_POSITIONS: Record<string, [number, number, number]> = {};

// Build grid positions for 3x3 formation
// Attacker (left side, x < 0): cols at -8, -6, -4
// Defender (right side, x > 0): cols at 4, 6, 8
// Rows share z positions: -4, 0, 4
const buildGridPositions = () => {
  const attackerCols = [-8, -6, -4];
  const defenderCols = [4, 6, 8];
  const rowZ = [-4, 0, 4];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      // Attacker positions
      GRID_POSITIONS[`attacker-${row}-${col}`] = [
        attackerCols[col],
        0,
        rowZ[row],
      ];
      // Defender positions
      GRID_POSITIONS[`defender-${row}-${col}`] = [
        defenderCols[col],
        0,
        rowZ[row],
      ];
    }
  }
};
buildGridPositions();

const SHIP_SCALES: Record<string, number> = {
  frigate: 0.8,
  cruiser: 1.0,
  battleship: 1.3,
};

const WEAPON_COLORS: Record<string, string> = {
  ballistic: '#ff6600',
  directional: '#4488ff',
  missile: '#ff4444',
  ship_based: '#cc44ff',
};

const MODEL_VARIANTS = [
  '/models/Spaceship.glb',
  '/models/Spaceship-Jqfed124pQ.glb',
  '/models/Spaceship-VSxUAFhzbA.glb',
  '/models/Spaceship-u105mYHLHU.glb',
];

const ENEMY_MODELS: Record<string, string> = {
  frigate: '/models/Enemy-Small.glb',
  cruiser: '/models/Enemy-Flying.glb',
  battleship: '/models/Enemy-Large.glb',
};

// ---------------------------------------------------------------------------
// Utility: get stack position in world space
// ---------------------------------------------------------------------------
function getStackPosition(
  side: 'attacker' | 'defender',
  row: number,
  col: number
): THREE.Vector3 {
  const key = `${side}-${row}-${col}`;
  const pos = GRID_POSITIONS[key];
  if (!pos) return new THREE.Vector3(0, 0, 0);
  return new THREE.Vector3(pos[0], pos[1], pos[2]);
}

function getShipScale(shipType: string): number {
  return SHIP_SCALES[shipType] ?? 1.0;
}

function getCountColor(count: number, maxCount: number): string {
  const ratio = maxCount > 0 ? count / maxCount : 0;
  if (ratio > 0.5) return '#ffffff';
  if (ratio > 0.2) return '#ffcc00';
  return '#ff4444';
}

function getStructureColor(structure: number): string {
  if (structure > 50) return '#44ff44';
  if (structure > 20) return '#ffcc00';
  return '#ff4444';
}

function getModelPath(side: 'attacker' | 'defender', shipType: string, variant: number): string {
  if (side === 'defender') {
    return ENEMY_MODELS[shipType] ?? '/models/Enemy-Flying.glb';
  }
  return MODEL_VARIANTS[variant % MODEL_VARIANTS.length];
}

// ---------------------------------------------------------------------------
// Fallback Ship Geometry (when GLB fails to load)
// ---------------------------------------------------------------------------
function FallbackShip({
  shipType,
  side,
}: {
  shipType: 'frigate' | 'cruiser' | 'battleship';
  side: 'attacker' | 'defender';
}) {
  const color = side === 'attacker' ? '#4488ff' : '#ff4444';

  if (shipType === 'frigate') {
    return (
      <mesh>
        <coneGeometry args={[0.3, 1.2, 4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
    );
  }
  if (shipType === 'battleship') {
    return (
      <group>
        <mesh>
          <boxGeometry args={[1.0, 0.4, 1.6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 0.3, 0.4]}>
          <cylinderGeometry args={[0.15, 0.15, 0.4, 6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
      </group>
    );
  }
  // cruiser
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.4, 0.6, 1.4, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
        <boxGeometry args={[0.8, 0.2, 0.8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// GLB Ship Model (internal - handles loading)
// ---------------------------------------------------------------------------
function ShipModelGLB({
  modelPath,
  side,
  isDestroyed,
  floatOffset,
}: {
  modelPath: string;
  side: 'attacker' | 'defender';
  isDestroyed: boolean;
  floatOffset: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useGLTF(modelPath);

  const rotationY = side === 'attacker' ? -Math.PI / 2 : Math.PI / 2;
  const destroyedTilt = isDestroyed ? Math.PI / 4 : 0;

  useFrame((state) => {
    if (!groupRef.current) return;
    if (!isDestroyed) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5 + floatOffset) * 0.2;
    }
  });

  const scene = useMemo(() => {
    if (gltf?.scene) {
      return gltf.scene.clone();
    }
    return null;
  }, [gltf]);

  if (!scene) {
    return (
      <group ref={groupRef} rotation={[destroyedTilt, rotationY, 0]}>
        <FallbackShip shipType="cruiser" side={side} />
      </group>
    );
  }

  return (
    <group ref={groupRef} rotation={[destroyedTilt, rotationY, 0]}>
      <primitive object={scene} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Ship Model with fallback wrapper
// ---------------------------------------------------------------------------
function ShipModel({
  modelPath,
  shipType,
  side,
  isDestroyed,
}: {
  modelPath: string;
  shipType: 'frigate' | 'cruiser' | 'battleship';
  side: 'attacker' | 'defender';
  isDestroyed: boolean;
}) {
  const floatOffset = useMemo(() => Math.random() * 10, []);

  return (
    <Suspense
      fallback={
        <FloatingFallback
          shipType={shipType}
          side={side}
          isDestroyed={isDestroyed}
          floatOffset={floatOffset}
        />
      }
    >
      <ShipModelGLB
        modelPath={modelPath}
        side={side}
        isDestroyed={isDestroyed}
        floatOffset={floatOffset}
      />
    </Suspense>
  );
}

// Floating fallback ship
function FloatingFallback({
  shipType,
  side,
  isDestroyed,
  floatOffset,
}: {
  shipType: 'frigate' | 'cruiser' | 'battleship';
  side: 'attacker' | 'defender';
  isDestroyed: boolean;
  floatOffset: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const rotationY = side === 'attacker' ? -Math.PI / 2 : Math.PI / 2;
  const destroyedTilt = isDestroyed ? Math.PI / 4 : 0;

  useFrame((state) => {
    if (!groupRef.current) return;
    if (!isDestroyed) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5 + floatOffset) * 0.2;
    }
  });

  return (
    <group ref={groupRef} rotation={[destroyedTilt, rotationY, 0]}>
      <FallbackShip shipType={shipType} side={side} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Ship Stack (renders one stack of ships with HUD)
// ---------------------------------------------------------------------------
function ShipStack({
  stack,
  side,
  action,
}: {
  stack: ShipStack3D;
  side: 'attacker' | 'defender';
  action?: BattleAction3D;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [shakeOffset, setShakeOffset] = useState<THREE.Vector3>(new THREE.Vector3());
  const modelPath = getModelPath(side, stack.shipType, stack.modelVariant);
  const scale = getShipScale(stack.shipType);
  const position = getStackPosition(side, stack.row, stack.col);
  const isDestroyed = stack.count === 0;
  const countColor = getCountColor(stack.count, stack.maxCount);
  const structColor = getStructureColor(stack.structure);

  // Shake effect when hit or destroyed
  useEffect(() => {
    if (action && (action.type === 'hit' || action.type === 'destroy') && action.targetStackId === stack.id) {
      let frame = 0;
      const maxFrames = 20;
      const interval = setInterval(() => {
        frame++;
        const intensity = 0.1 * (1 - frame / maxFrames);
        setShakeOffset(
          new THREE.Vector3(
            (Math.random() - 0.5) * intensity * 2,
            (Math.random() - 0.5) * intensity * 2,
            (Math.random() - 0.5) * intensity * 2
          )
        );
        if (frame >= maxFrames) {
          clearInterval(interval);
          setShakeOffset(new THREE.Vector3());
        }
      }, 16);
      return () => clearInterval(interval);
    }
  }, [action, stack.id]);

  return (
    <group
      ref={groupRef}
      position={[position.x + shakeOffset.x, position.y + shakeOffset.y, position.z + shakeOffset.z]}
    >
      <group scale={[scale, scale, scale]}>
        <ShipModel
          modelPath={modelPath}
          shipType={stack.shipType}
          side={side}
          isDestroyed={isDestroyed}
        />
      </group>

      {/* Count display above ship */}
      <Html position={[0, 1.2, 0]} center style={{ pointerEvents: 'none' }}>
        <div
          style={{
            color: countColor,
            fontWeight: 'bold',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            textShadow: '0 0 4px #000',
            whiteSpace: 'nowrap',
            opacity: isDestroyed ? 0.3 : 1,
          }}
        >
          {stack.count}
        </div>
      </Html>

      {/* Health bars below ship */}
      <Html position={[0, -0.8, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '40px' }}>
          {/* Shield bar */}
          <div style={{ width: '100%', height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${stack.shield}%`,
                height: '100%',
                background: '#00ccff',
                borderRadius: '2px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          {/* Structure bar */}
          <div style={{ width: '100%', height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${stack.structure}%`,
                height: '100%',
                background: structColor,
                borderRadius: '2px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </Html>

      {/* Destroyed label */}
      {isDestroyed && (
        <Html position={[0, 0.3, 0]} center style={{ pointerEvents: 'none' }}>
          <div
            style={{
              color: '#ff4444',
              fontWeight: 'bold',
              fontSize: '10px',
              fontFamily: 'Arial, sans-serif',
              textShadow: '0 0 4px #000',
              textTransform: 'uppercase',
            }}
          >
            DESTROYED
          </div>
        </Html>
      )}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Laser / Projectile Effect
// ---------------------------------------------------------------------------
function LaserProjectile({
  action,
  attackerStacks,
  defenderStacks,
}: {
  action: BattleAction3D;
  attackerStacks: ShipStack3D[];
  defenderStacks: ShipStack3D[];
}) {
  const lineRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(0);
  const startRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const endRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const distRef = useRef(0);
  const [done, setDone] = useState(false);

  const color = WEAPON_COLORS[action.weaponType ?? 'ballistic'] ?? '#ff6600';

  useEffect(() => {
    // Find source position
    const allStacks = [...attackerStacks, ...defenderStacks];
    const sourceStack = allStacks.find((s) => s.id === action.sourceStackId);
    const targetStack = action.targetStackId
      ? allStacks.find((s) => s.id === action.targetStackId)
      : null;

    if (sourceStack) {
      const pos = getStackPosition(sourceStack.side ?? 'attacker', sourceStack.row, sourceStack.col);
      startRef.current.set(pos.x, pos.y + 0.5, pos.z);
    }
    if (targetStack) {
      const pos = getStackPosition(targetStack.side ?? 'defender', targetStack.row, targetStack.col);
      endRef.current.set(pos.x, pos.y + 0.5, pos.z);
    }
    distRef.current = startRef.current.distanceTo(endRef.current);
  }, [action, attackerStacks, defenderStacks]);

  useFrame((_, delta) => {
    progressRef.current += delta * 3.5; // ~0.3s duration
    if (progressRef.current >= 1) {
      progressRef.current = 1;
      if (!done) setDone(true);
    }

    if (lineRef.current && distRef.current > 0) {
      lineRef.current.position.lerpVectors(startRef.current, endRef.current, progressRef.current);
      lineRef.current.lookAt(endRef.current);
      const scaleZ = distRef.current * Math.min(progressRef.current, 1);
      lineRef.current.scale.set(1, 1, scaleZ);
      const mat = lineRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 1 - progressRef.current);
    }
  });

  if (done) return null;

  return (
    <mesh ref={lineRef} position={startRef.current.toArray()}>
      <boxGeometry args={[0.06, 0.06, 1]} />
      <meshBasicMaterial color={color} transparent opacity={1} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Explosion Particle Effect
// ---------------------------------------------------------------------------
function ExplosionEffect({
  action,
  attackerStacks,
  defenderStacks,
}: {
  action: BattleAction3D;
  attackerStacks: ShipStack3D[];
  defenderStacks: ShipStack3D[];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef(0);
  const [expired, setExpired] = useState(false);

  // Create particles data
  const particles = useMemo(() => {
    const count = 12;
    return Array.from({ length: count }, () => ({
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3 + 1,
        (Math.random() - 0.5) * 3
      ),
      offset: new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      ),
      size: Math.random() * 0.15 + 0.05,
    }));
  }, []);

  // Find target position
  const targetPosition = useMemo(() => {
    const allStacks = [...attackerStacks, ...defenderStacks];
    const targetStack = action.targetStackId
      ? allStacks.find((s) => s.id === action.targetStackId)
      : null;
    if (targetStack) {
      const pos = getStackPosition(targetStack.side ?? 'defender', targetStack.row, targetStack.col).clone();
      pos.y += 0.5;
      return pos;
    }
    return new THREE.Vector3(0, 0, 0);
  }, [action, attackerStacks, defenderStacks]);

  useFrame((_, delta) => {
    progressRef.current += delta * 2; // 0.5s duration
    if (progressRef.current >= 1) {
      progressRef.current = 1;
      if (!expired) setExpired(true);
    }

    if (!groupRef.current) return;

    const children = groupRef.current.children;
    const t = progressRef.current;
    particles.forEach((p, i) => {
      if (children[i]) {
        const mesh = children[i] as THREE.Mesh;
        mesh.position.x = p.offset.x + p.velocity.x * t;
        mesh.position.y = p.offset.y + p.velocity.y * t - 2 * t * t;
        mesh.position.z = p.offset.z + p.velocity.z * t;
        const scale = 1 - t;
        mesh.scale.setScalar(Math.max(0, scale));
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 1 - t);
      }
    });
  });

  if (expired) return null;

  return (
    <group ref={groupRef} position={targetPosition.toArray()}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.offset.x, p.offset.y, p.offset.z]}>
          <sphereGeometry args={[p.size, 4, 4]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={1} />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Battle Space Scene (3D content)
// ---------------------------------------------------------------------------
function BattleSpaceScene({
  attacker,
  defender,
  actions,
}: {
  attacker: BattleFleet3D;
  defender: BattleFleet3D;
  actions: BattleAction3D[];
}) {
  const { camera } = useThree();

  // Set camera position
  useEffect(() => {
    camera.position.set(0, 12, 18);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Twinkling stars ref
  const starsRef = useRef<any>(null);

  useFrame((state) => {
    // Subtle star twinkle
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.005;
    }
  });

  // Filter active actions for effects
  const fireActions = actions.filter((a) => a.type === 'fire');
  const destroyActions = actions.filter((a) => a.type === 'destroy');

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} color="#1a1a3a" />
      <directionalLight position={[10, 10, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#4488ff" />

      {/* Stars background */}
      <Stars
        ref={starsRef}
        radius={100}
        depth={50}
        count={200}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />

      {/* Background color */}
      <color attach="background" args={['#000011']} />

      {/* Grid helper (subtle) */}
      <gridHelper args={[40, 40, '#111133', '#0a0a1a']} position={[0, -2, 0]} />

      {/* Attacker ships */}
      {attacker.stacks.map((stack) => (
        <ShipStack
          key={`attacker-${stack.id}`}
          stack={stack}
          side="attacker"
          action={actions.find(
            (a) => a.targetStackId === stack.id || a.sourceStackId === stack.id
          )}
        />
      ))}

      {/* Defender ships */}
      {defender.stacks.map((stack) => (
        <ShipStack
          key={`defender-${stack.id}`}
          stack={stack}
          side="defender"
          action={actions.find(
            (a) => a.targetStackId === stack.id || a.sourceStackId === stack.id
          )}
        />
      ))}

      {/* Laser projectiles */}
      {fireActions.map((action, i) => (
        <LaserProjectile
          key={`fire-${i}-${action.sourceStackId}`}
          action={action}
          attackerStacks={attacker.stacks}
          defenderStacks={defender.stacks}
        />
      ))}

      {/* Explosion effects */}
      {destroyActions.map((action, i) => (
        <ExplosionEffect
          key={`explode-${i}-${action.targetStackId}`}
          action={action}
          attackerStacks={attacker.stacks}
          defenderStacks={defender.stacks}
        />
      ))}

      {/* Orbit controls */}
      <OrbitControls
        target={[0, 0, 0]}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={8}
        maxDistance={30}
        enablePan={false}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Top HUD Overlay
// ---------------------------------------------------------------------------
function TopHUD({
  attacker,
  defender,
  currentRound,
  maxRounds,
}: {
  attacker: BattleFleet3D;
  defender: BattleFleet3D;
  currentRound: number;
  maxRounds: number;
}) {
  return (
    <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 bg-black/50 border-b-2 border-blue-500 pointer-events-none z-10">
      {/* Attacker info */}
      <div className="flex items-center gap-3">
        <img
          src={attacker.commander.portrait}
          alt={attacker.commander.name}
          className="w-12 h-12 rounded border-2 border-green-400 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/commanders/default.webp';
          }}
        />
        <div>
          <div className="text-white font-bold">{attacker.commander.name}</div>
          <div className="text-yellow-400 text-sm">
            Lv.{attacker.commander.level}{' '}
            {'\u2605'.repeat(attacker.commander.stars)}
          </div>
        </div>
      </div>

      {/* VS + Round */}
      <div className="text-center">
        <div className="text-3xl font-black text-yellow-400">VS</div>
        <div className="text-blue-300 text-sm">
          Round {currentRound}/{maxRounds}
        </div>
      </div>

      {/* Defender info */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-white font-bold">{defender.commander.name}</div>
          <div className="text-yellow-400 text-sm">
            Lv.{defender.commander.level}{' '}
            {'\u2605'.repeat(defender.commander.stars)}
          </div>
        </div>
        <img
          src={defender.commander.portrait}
          alt={defender.commander.name}
          className="w-12 h-12 rounded border-2 border-red-400 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/commanders/default.webp';
          }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bottom Controls Overlay
// ---------------------------------------------------------------------------
function BottomControls({
  isPaused,
  speed,
  onPauseToggle,
  onSpeedChange,
  onSkip,
  onExit,
}: {
  isPaused: boolean;
  speed: number;
  onPauseToggle: () => void;
  onSpeedChange: (speed: number) => void;
  onSkip: () => void;
  onExit: () => void;
}) {
  return (
    <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 p-4 bg-black/50 border-t-2 border-blue-500 z-10">
      <button
        onClick={onPauseToggle}
        className="px-6 py-2 bg-blue-900 border-2 border-blue-500 rounded text-white font-bold hover:bg-blue-700 transition-colors cursor-pointer"
      >
        {isPaused ? '\u25B6 Play' : '\u23F8 Pause'}
      </button>
      <select
        value={speed}
        onChange={(e) => onSpeedChange(Number(e.target.value))}
        className="px-4 py-2 bg-blue-900 border-2 border-blue-500 rounded text-white cursor-pointer"
      >
        <option value={0.5}>0.5x</option>
        <option value={1}>1x</option>
        <option value={2}>2x</option>
        <option value={4}>4x</option>
      </select>
      <button
        onClick={onSkip}
        className="px-6 py-2 bg-blue-900 border-2 border-blue-500 rounded text-white font-bold hover:bg-blue-700 transition-colors cursor-pointer"
      >
        {'\u23ED'} Skip
      </button>
      <button
        onClick={onExit}
        className="px-6 py-2 bg-red-900 border-2 border-red-500 rounded text-white font-bold hover:bg-red-700 transition-colors cursor-pointer"
      >
        {'\u2715'} Exit
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Go2BattleArena3D Component
// ---------------------------------------------------------------------------
export default function Go2BattleArena3D({
  attacker,
  defender,
  currentRound,
  maxRounds,
  actions,
  isPaused,
  speed,
  onPauseToggle,
  onSpeedChange,
  onSkip,
  onExit,
}: Go2BattleArena3DProps) {
  return (
    <div className="relative w-full h-screen bg-[#000011] overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 12, 18], fov: 60, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#000011' }}
      >
        <Suspense
          fallback={
            <Html center>
              <div className="text-white text-lg font-bold animate-pulse">
                Loading Battle Scene...
              </div>
            </Html>
          }
        >
          <BattleSpaceScene
            attacker={attacker}
            defender={defender}
            actions={actions}
          />
        </Suspense>
      </Canvas>

      {/* Top HUD Overlay */}
      <TopHUD
        attacker={attacker}
        defender={defender}
        currentRound={currentRound}
        maxRounds={maxRounds}
      />

      {/* Bottom Controls Overlay */}
      <BottomControls
        isPaused={isPaused}
        speed={speed}
        onPauseToggle={onPauseToggle}
        onSpeedChange={onSpeedChange}
        onSkip={onSkip}
        onExit={onExit}
      />
    </div>
  );
}
