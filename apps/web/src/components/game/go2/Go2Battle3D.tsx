/**
 * Go2Battle3D - Real 3D Battle Viewer with GLB Models
 *
 * A React Three Fiber based 3D battle scene that renders spaceship combat
 * using real GLB 3D models. Ships move on a grid, attack with laser beams,
 * and explode when destroyed.
 *
 * Features:
 * - GLB model loading via useGLTF()
 * - Grid-based movement on 10x6 battlefield
 * - Real 3D laser beam attack effects
 * - 3D explosion effects
 * - Floating ship animations
 * - Health bars and ship count labels (Html overlays)
 * - Turn-based battle playback with speed controls
 *
 * IMPORTANT: This file imports Three.js libraries (@react-three/fiber, etc.)
 * It must ONLY be consumed via next/dynamic({ ssr: false }) so the bundler
 * code-splits it away from the main bundle.
 */

import { Canvas, useFrame } from '@react-three/fiber';
import {
  useGLTF,
  OrbitControls,
  Stars,
  Html,
  Grid,
  useAnimations,
} from '@react-three/drei';
import * as THREE from 'three';
import {
  Suspense,
  useRef,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import {
  type GridShip,
  type FrameAction,
  type BattleFrame,
  generateDemoBattleFrames,
  createDefaultFrame,
} from './Go2BattleFrameData';

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------

const CELL_SIZE = 2;
const GRID_WIDTH = 10;
const BATTLEFIELD_LENGTH = 12;

const PLAYER_MODELS = [
  '/models/Spaceship.glb',
  '/models/Spaceship-Jqfed124pQ.glb',
  '/models/Spaceship-VSxUAFhzbA.glb',
  '/models/Spaceship-u105mYHLHU.glb',
];

const ENEMY_MODELS = [
  '/models/Enemy-Flying.glb',
  '/models/Enemy-Large.glb',
  '/models/Enemy-Small.glb',
];

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

// Re-export types from Go2BattleFrameData for backward compatibility
export type { GridShip, FrameAction, BattleFrame } from './Go2BattleFrameData';

// ---------------------------------------------------------------------------
// PRELOAD GLB MODELS
// ---------------------------------------------------------------------------

// Preload all models so they're available when the scene renders
PLAYER_MODELS.forEach((path) => {
  useGLTF.preload(path);
});
ENEMY_MODELS.forEach((path) => {
  useGLTF.preload(path);
});

// ---------------------------------------------------------------------------
// HELPER: Smooth lerp for movement animation
// ---------------------------------------------------------------------------

function useSmoothLerp(
  targetRef: React.MutableRefObject<THREE.Group | null>,
  targetX: number,
  targetZ: number,
  speed: number,
  isDestroyed: boolean
) {
  const currentX = useRef(targetX);
  const currentZ = useRef(targetZ);
  const currentY = useRef(0);
  const tiltRef = useRef(0);

  useFrame((_, delta) => {
    if (!targetRef.current) return;

    const t = Math.min(delta * speed * 3, 1);

    currentX.current += (targetX - currentX.current) * t;
    currentZ.current += (targetZ - currentZ.current) * t;

    if (isDestroyed) {
      currentY.current += (-0.3 - currentY.current) * t;
      tiltRef.current += (Math.PI / 6 - tiltRef.current) * t;
    } else {
      currentY.current += (0 - currentY.current) * t;
      tiltRef.current += (0 - tiltRef.current) * t;
    }

    targetRef.current.position.x = currentX.current;
    targetRef.current.position.z = currentZ.current;
    targetRef.current.position.y = currentY.current;
    targetRef.current.rotation.z = tiltRef.current;
  });
}

// ---------------------------------------------------------------------------
// COMPONENT: FallbackShip - Procedural geometry when GLB fails to load
// ---------------------------------------------------------------------------

function FallbackShip({ isAttacker }: { isAttacker: boolean }) {
  const color = isAttacker ? '#4488ff' : '#ff4444';
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y =
        Math.sin(clock.elapsedTime * 0.5) * 0.15;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[0, isAttacker ? 0 : Math.PI, 0]}>
      <coneGeometry args={[0.5, 1.5, 4]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// COMPONENT: ShipModelGLB - Loads and renders a GLB model
// ---------------------------------------------------------------------------

function ShipModelGLB({
  path,
  isAttacker,
  structure,
}: {
  path: string;
  isAttacker: boolean;
  structure: number;
}) {
  const { scene, animations } = useGLTF(path);
  const meshRef = useRef<THREE.Group>(null);

  // Clone the scene so we can modify materials independently
  const model = useMemo(() => scene.clone(), [scene]);

  // Apply team color and destroyed state
  useMemo(() => {
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = (
            mesh.material as THREE.MeshStandardMaterial
          ).clone();
          if (structure <= 0) {
            mat.transparent = true;
            mat.opacity = 0.3;
          }
          if (isAttacker) {
            mat.emissive = new THREE.Color('#0044aa');
            mat.emissiveIntensity = 0.2;
          } else {
            mat.emissive = new THREE.Color('#aa2200');
            mat.emissiveIntensity = 0.2;
          }
          mesh.material = mat;
        }
      }
    });
  }, [model, isAttacker, structure]);

  // Floating animation + destroyed tilt
  useFrame(({ clock }) => {
    if (meshRef.current && structure > 0) {
      meshRef.current.position.y =
        Math.sin(clock.elapsedTime * 0.5 + meshRef.current.id) * 0.15;
    }
  });

  // Scale based on model type
  const scale = useMemo(() => {
    if (path.includes('Large')) return 0.8;
    if (path.includes('Small')) return 0.5;
    return 0.6;
  }, [path]);

  // Rotation: attackers face right (+x), defenders face left (-x)
  const rotationY = isAttacker ? -Math.PI / 2 : Math.PI / 2;

  return (
    <primitive
      ref={meshRef}
      object={model}
      scale={scale}
      rotation={[0, rotationY, 0]}
    />
  );
}

// ---------------------------------------------------------------------------
// COMPONENT: Ship3D - Individual ship with GLB model, label, and health bar
// ---------------------------------------------------------------------------

function Ship3D({
  ship,
  isAttacker,
  animSpeed,
}: {
  ship: GridShip;
  isAttacker: boolean;
  animSpeed: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Select model path based on side and variant
  const modelPath = useMemo(() => {
    if (isAttacker) {
      return PLAYER_MODELS[ship.modelVariant % PLAYER_MODELS.length];
    }
    return ENEMY_MODELS[ship.modelVariant % ENEMY_MODELS.length];
  }, [isAttacker, ship.modelVariant]);

  // Position based on grid cell
  const targetX = (ship.cell - 5) * CELL_SIZE;
  const targetZ = useMemo(() => {
    // Deterministic spread across z-axis based on ship id
    const hash = ship.id.charCodeAt(ship.id.length - 1) % 5;
    return (hash - 2) * 3;
  }, [ship.id]);

  const isDestroyed = ship.structure <= 0;

  // Smooth movement between grid cells
  useSmoothLerp(
    groupRef,
    targetX,
    targetZ,
    animSpeed,
    isDestroyed
  );

  // Health bar color
  const healthColor =
    ship.structure > 50
      ? '#44ff44'
      : ship.structure > 20
        ? '#ffdd44'
        : '#ff4444';

  return (
    <group ref={groupRef} position={[targetX, 0, targetZ]}>
      {/* GLB Ship Model */}
      <Suspense fallback={<FallbackShip isAttacker={isAttacker} />}>
        <ShipModelGLB
          path={modelPath}
          isAttacker={isAttacker}
          structure={ship.structure}
        />
      </Suspense>

      {/* Ship count label */}
      {!isDestroyed && (
        <Html position={[0, 1.8, 0]} center zIndexRange={[100, 0]}>
          <div
            style={{
              color: isAttacker ? '#44aaff' : '#ff6644',
              fontWeight: 'bold',
              fontSize: '13px',
              fontFamily: 'monospace',
              textShadow:
                '0 0 6px black, 0 0 6px black, 0 0 3px black',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {ship.count.toLocaleString()}
          </div>
        </Html>
      )}

      {/* Health + Shield bar */}
      {!isDestroyed && (
        <Html position={[0, -0.2, 0]} center zIndexRange={[100, 0]}>
          <div
            style={{
              width: '60px',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {/* Shield bar */}
            <div
              style={{
                height: '4px',
                background: '#111',
                borderRadius: '2px',
                marginBottom: '2px',
                border: '1px solid #000',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${ship.shield}%`,
                  background: '#00ccff',
                  borderRadius: '2px',
                  transition: 'width 0.3s ease',
                  boxShadow: '0 0 4px #00ccff',
                }}
              />
            </div>
            {/* Structure bar */}
            <div
              style={{
                height: '4px',
                background: '#111',
                borderRadius: '2px',
                border: '1px solid #000',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${ship.structure}%`,
                  background: healthColor,
                  borderRadius: '2px',
                  transition: 'width 0.3s ease',
                  boxShadow: `0 0 4px ${healthColor}`,
                }}
              />
            </div>
          </div>
        </Html>
      )}

      {/* Destroyed label */}
      {isDestroyed && (
        <Html position={[0, 0.5, 0]} center zIndexRange={[100, 0]}>
          <div
            style={{
              color: '#ff4444',
              fontWeight: 'bold',
              fontSize: '11px',
              fontFamily: 'monospace',
              textShadow:
                '0 0 6px black, 0 0 6px black, 0 0 3px black',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
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
// COMPONENT: LaserBeam - 3D laser beam between two points
// ---------------------------------------------------------------------------

function LaserBeam({
  fromX,
  fromZ,
  toX,
  toZ,
  color = '#ff6600',
}: {
  fromX: number;
  fromZ: number;
  toX: number;
  toZ: number;
  color?: string;
}) {
  const midX = (fromX + toX) / 2;
  const midZ = (fromZ + toZ) / 2;
  const dx = toX - fromX;
  const dz = toZ - fromZ;
  const length = Math.sqrt(dx * dx + dz * dz);
  const angleY = Math.atan2(dx, dz);

  return (
    <mesh
      position={[midX, 0.5, midZ]}
      rotation={[Math.PI / 2, angleY, 0]}
    >
      <cylinderGeometry args={[0.06, 0.06, length, 6]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.85}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// COMPONENT: Explosion3D - 3D explosion particle effect
// ---------------------------------------------------------------------------

function Explosion3D({
  x,
  z,
  onComplete,
}: {
  x: number;
  z: number;
  onComplete: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const startTime = useRef(Date.now());
  const duration = 800; // ms

  useFrame(() => {
    const elapsed = Date.now() - startTime.current;
    const progress = Math.min(elapsed / duration, 1);

    if (groupRef.current) {
      const scale = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;
      groupRef.current.scale.setScalar(Math.max(scale * 2.5, 0.01));
      groupRef.current.rotation.y += 0.1;

      groupRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.MeshBasicMaterial;
          mat.opacity = 1 - progress;
        }
      });
    }

    if (progress >= 1) {
      onComplete();
    }
  });

  // Multiple colored spheres for the explosion
  const colors = ['#ff4400', '#ff8800', '#ffcc00', '#ff2200'];

  return (
    <group ref={groupRef} position={[x, 0.5, z]}>
      {colors.map((c, i) => (
        <mesh
          key={i}
          position={[
            (i % 2 === 0 ? 1 : -1) * i * 0.2,
            (i % 3 === 0 ? 1 : -1) * i * 0.15,
            (i % 2 === 0 ? -1 : 1) * i * 0.1,
          ]}
        >
          <sphereGeometry args={[0.4 + i * 0.15, 8, 8]} />
          <meshBasicMaterial color={c} transparent opacity={0.7} />
        </mesh>
      ))}
      {/* Core flash */}
      <mesh>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// COMPONENT: ActionEffect - Renders attack lasers and explosions
// ---------------------------------------------------------------------------

function ActionEffect({
  action,
  attackerShips,
  defenderShips,
  onComplete,
}: {
  action: FrameAction;
  attackerShips: GridShip[];
  defenderShips: GridShip[];
  onComplete: () => void;
}) {
  // Find ship position helper
  const getShipPos = useCallback(
    (shipId: string): { x: number; z: number } | null => {
      const allShips = [...attackerShips, ...defenderShips];
      const ship = allShips.find((s) => s.id === shipId);
      if (!ship) return null;
      const x = (ship.cell - 5) * CELL_SIZE;
      const hash = ship.id.charCodeAt(ship.id.length - 1) % 5;
      const z = (hash - 2) * 3;
      return { x, z };
    },
    [attackerShips, defenderShips]
  );

  if (action.type === 'attack' && action.shipId && action.targetId) {
    const fromPos = getShipPos(action.shipId);
    const toPos = getShipPos(action.targetId);
    if (!fromPos || !toPos) return null;

    const weaponColor =
      action.weaponType === 'laser'
        ? '#00ccff'
        : action.weaponType === 'cannon'
          ? '#ff4400'
          : '#ffaa00';

    return (
      <LaserBeam
        fromX={fromPos.x}
        fromZ={fromPos.z}
        toX={toPos.x}
        toZ={toPos.z}
        color={weaponColor}
      />
    );
  }

  if (action.type === 'explosion' && action.cell !== undefined) {
    const x = (action.cell - 5) * CELL_SIZE;
    return <Explosion3D x={x} z={0} onComplete={onComplete} />;
  }

  return null;
}

// ---------------------------------------------------------------------------
// COMPONENT: MoveTrail - Visual trail when ships move
// ---------------------------------------------------------------------------

function MoveTrail({
  fromCell,
  toCell,
  shipId,
}: {
  fromCell: number;
  toCell: number;
  shipId: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const fromX = (fromCell - 5) * CELL_SIZE;
  const toX = (toCell - 5) * CELL_SIZE;
  const midX = (fromX + toX) / 2;
  const length = Math.abs(toX - fromX);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.material.opacity =
        0.4 + Math.sin(clock.elapsedTime * 5) * 0.2;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[midX, 0.05, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[length, 0.3]} />
      <meshBasicMaterial
        color="#00ccff"
        transparent
        opacity={0.4}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// COMPONENT: BattleScene - Main 3D scene content
// ---------------------------------------------------------------------------

function BattleScene({
  frame,
  speed,
}: {
  frame: BattleFrame;
  speed: number;
}) {
  const [completedExplosions, setCompletedExplosions] = useState<
    Set<number>
  >(new Set());

  const handleExplosionComplete = useCallback((index: number) => {
    setCompletedExplosions((prev) => new Set(prev).add(index));
  }, []);

  return (
    <>
      {/* ---- Lighting ---- */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        castShadow
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#4488ff" />
      <pointLight
        position={[-10, 3, -5]}
        intensity={0.3}
        color="#ff6644"
      />

      {/* ---- Background ---- */}
      <Stars radius={60} depth={60} count={1500} fade speed={0.5} />
      <fog attach="fog" args={['#000011', 20, 60]} />

      {/* ---- Ground Grid ---- */}
      <Grid
        position={[0, -0.5, 0]}
        args={[24, 14]}
        cellSize={CELL_SIZE}
        cellThickness={0.5}
        cellColor="#0066cc44"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#0066cc88"
        fadeDistance={40}
        fadeStrength={1}
        infiniteGrid
      />

      {/* ---- Attacker Side Indicator ---- */}
      <mesh position={[-8, -0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 10]} />
        <meshBasicMaterial
          color="#0044aa"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ---- Defender Side Indicator ---- */}
      <mesh position={[8, -0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 10]} />
        <meshBasicMaterial
          color="#aa2200"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ---- Attacker ships ---- */}
      {frame.attackerShips.map((ship) => (
        <Ship3D
          key={ship.id}
          ship={ship}
          isAttacker={true}
          animSpeed={speed}
        />
      ))}

      {/* ---- Defender ships ---- */}
      {frame.defenderShips.map((ship) => (
        <Ship3D
          key={ship.id}
          ship={ship}
          isAttacker={false}
          animSpeed={speed}
        />
      ))}

      {/* ---- Action effects (lasers, explosions) ---- */}
      {frame.actions.map((action, i) => {
        if (action.type === 'explosion' && completedExplosions.has(i)) {
          return null;
        }
        return (
          <ActionEffect
            key={`${i}-${frame.round}-${frame.phase}`}
            action={action}
            attackerShips={frame.attackerShips}
            defenderShips={frame.defenderShips}
            onComplete={() => handleExplosionComplete(i)}
          />
        );
      })}

      {/* ---- Orbit Controls ---- */}
      <OrbitControls
        target={[0, 0, 0]}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={5}
        maxDistance={40}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// COMPONENT: PhaseIcon - Phase indicator without emoji
// ---------------------------------------------------------------------------

function PhaseIcon({ phase }: { phase: string }) {
  if (phase === 'move') {
    return (
      <span className="inline-flex items-center gap-1 text-blue-300 text-xs">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 9l4-4 4 4M5 15l4 4 4-4" />
        </svg>
        Movement
      </span>
    );
  }
  if (phase === 'attack') {
    return (
      <span className="inline-flex items-center gap-1 text-red-300 text-xs">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
          <polyline points="14,2 14,8 20,8" />
        </svg>
        Attack
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-green-300 text-xs">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="20,6 9,17 4,12" />
      </svg>
      End
    </span>
  );
}

// ---------------------------------------------------------------------------
// MAIN EXPORT: Go2Battle3D - Complete battle viewer component
// ---------------------------------------------------------------------------

export function Go2Battle3D({
  battleFrames,
  isPaused,
  speed,
  onPauseToggle,
  onSpeedChange,
  onSkip,
  onExit,
}: {
  battleFrames: BattleFrame[];
  isPaused: boolean;
  speed: number;
  onPauseToggle: () => void;
  onSpeedChange: (s: number) => void;
  onSkip: () => void;
  onExit: () => void;
}) {
  const [currentFrame, setCurrentFrame] = useState(0);

  const frame =
    battleFrames[currentFrame] ||
    battleFrames[battleFrames.length - 1] ||
    createDefaultFrame();

  // Total ships on each side
  const attackerCount = frame.attackerShips.reduce(
    (sum, s) => sum + (s.structure > 0 ? s.count : 0),
    0
  );
  const defenderCount = frame.defenderShips.reduce(
    (sum, s) => sum + (s.structure > 0 ? s.count : 0),
    0
  );
  const attackerTotal = frame.attackerShips.reduce(
    (sum, s) => sum + s.count,
    0
  );
  const defenderTotal = frame.defenderShips.reduce(
    (sum, s) => sum + s.count,
    0
  );

  // Auto-advance frames
  useEffect(() => {
    if (isPaused || currentFrame >= battleFrames.length - 1) return;
    const timer = setTimeout(() => {
      setCurrentFrame((f) => f + 1);
    }, 1200 / speed);
    return () => clearTimeout(timer);
  }, [isPaused, currentFrame, battleFrames.length, speed]);

  // Handle skip
  const handleSkip = useCallback(() => {
    setCurrentFrame(battleFrames.length - 1);
    onSkip();
  }, [battleFrames.length, onSkip]);

  // Frame navigation
  const goToFrame = useCallback(
    (idx: number) => {
      setCurrentFrame(Math.max(0, Math.min(idx, battleFrames.length - 1)));
    },
    [battleFrames.length]
  );

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: '100vh', background: '#000011' }}
    >
      {/* ---- 3D Canvas ---- */}
      <Canvas
        camera={{ position: [0, 10, 16], fov: 55, near: 0.1, far: 200 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        style={{ background: '#000011' }}
      >
        <BattleScene frame={frame} speed={speed} />
      </Canvas>

      {/* ---- Top HUD Overlay ---- */}
      <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-4 bg-black/60 border-b-2 border-blue-500/50 backdrop-blur-sm z-10">
        {/* Attacker info */}
        <div className="flex flex-col items-start gap-1 min-w-[160px]">
          <div className="text-blue-400 text-sm font-bold uppercase tracking-wider">
            Attacker
          </div>
          <div className="text-white text-lg font-black">
            {attackerCount.toLocaleString()}
          </div>
          <div className="text-blue-300 text-xs">
            of {attackerTotal.toLocaleString()} ships
          </div>
          <div className="w-full mt-1">
            <div className="h-1.5 bg-gray-800 rounded overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded transition-all duration-500"
                style={{
                  width:
                    attackerTotal > 0
                      ? `${(attackerCount / attackerTotal) * 100}%`
                      : '0%',
                }}
              />
            </div>
          </div>
        </div>

        {/* Center: VS + Round */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-3xl font-black text-yellow-400 tracking-widest">
            VS
          </div>
          <div className="text-blue-300 text-sm font-mono">
            Round {frame.round} /{' '}
            {battleFrames.length > 0
              ? battleFrames[battleFrames.length - 1].round
              : 0}
          </div>
          <PhaseIcon phase={frame.phase} />
          {/* Frame progress bar */}
          <div className="w-32 mt-1">
            <div className="h-1 bg-gray-800 rounded overflow-hidden">
              <div
                className="h-full bg-yellow-500 rounded transition-all duration-300"
                style={{
                  width:
                    battleFrames.length > 1
                      ? `${(currentFrame / (battleFrames.length - 1)) * 100}%`
                      : '100%',
                }}
              />
            </div>
          </div>
        </div>

        {/* Defender info */}
        <div className="flex flex-col items-end gap-1 min-w-[160px]">
          <div className="text-red-400 text-sm font-bold uppercase tracking-wider">
            Defender
          </div>
          <div className="text-white text-lg font-black">
            {defenderCount.toLocaleString()}
          </div>
          <div className="text-red-300 text-xs">
            of {defenderTotal.toLocaleString()} ships
          </div>
          <div className="w-full mt-1">
            <div className="h-1.5 bg-gray-800 rounded overflow-hidden">
              <div
                className="h-full bg-red-500 rounded transition-all duration-500"
                style={{
                  width:
                    defenderTotal > 0
                      ? `${(defenderCount / defenderTotal) * 100}%`
                      : '0%',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ---- Side labels ---- */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <div className="text-blue-500/30 text-6xl font-black tracking-widest -rotate-90 origin-center">
          ATTACKER
        </div>
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <div className="text-red-500/30 text-6xl font-black tracking-widest rotate-90 origin-center">
          DEFENDER
        </div>
      </div>

      {/* ---- Bottom Controls ---- */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-2 p-4 bg-black/60 border-t-2 border-blue-500/50 backdrop-blur-sm z-10">
        {/* Frame timeline scrubber */}
        <div className="w-full max-w-2xl flex items-center gap-2">
          <span className="text-gray-400 text-xs font-mono w-12 text-right">
            {currentFrame + 1}
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(battleFrames.length - 1, 0)}
            value={currentFrame}
            onChange={(e) => goToFrame(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-gray-400 text-xs font-mono w-12">
            {battleFrames.length}
          </span>
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-3">
          {/* Play / Pause */}
          <button
            onClick={onPauseToggle}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-900/80 hover:bg-blue-800 border-2 border-blue-500 rounded-lg text-white font-bold transition-colors"
            title={isPaused ? 'Play' : 'Pause'}
          >
            {isPaused ? (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                Play
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                Pause
              </>
            )}
          </button>

          {/* Speed selector */}
          <select
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="px-4 py-2.5 bg-blue-900/80 hover:bg-blue-800 border-2 border-blue-500 rounded-lg text-white font-bold cursor-pointer transition-colors appearance-none text-center"
            style={{ minWidth: '70px' }}
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>

          {/* Previous frame */}
          <button
            onClick={() => goToFrame(currentFrame - 1)}
            disabled={currentFrame <= 0}
            className="px-4 py-2.5 bg-gray-800/80 hover:bg-gray-700 border-2 border-gray-600 disabled:border-gray-700 disabled:opacity-40 rounded-lg text-white font-bold transition-colors"
            title="Previous Frame"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <polygon points="19,20 9,12 19,4" />
              <rect x="5" y="4" width="2" height="16" />
            </svg>
          </button>

          {/* Next frame */}
          <button
            onClick={() => goToFrame(currentFrame + 1)}
            disabled={currentFrame >= battleFrames.length - 1}
            className="px-4 py-2.5 bg-gray-800/80 hover:bg-gray-700 border-2 border-gray-600 disabled:border-gray-700 disabled:opacity-40 rounded-lg text-white font-bold transition-colors"
            title="Next Frame"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <polygon points="5,4 15,12 5,20" />
              <rect x="17" y="4" width="2" height="16" />
            </svg>
          </button>

          {/* Skip to end */}
          <button
            onClick={handleSkip}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-800/80 hover:bg-gray-700 border-2 border-gray-600 rounded-lg text-white font-bold transition-colors"
            title="Skip to End"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <polygon points="5,4 15,12 5,20" />
              <polygon points="13,4 23,12 13,20" />
            </svg>
            Skip
          </button>

          {/* Exit */}
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-900/80 hover:bg-red-800 border-2 border-red-500 rounded-lg text-white font-bold transition-colors"
            title="Exit Battle"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Exit
          </button>
        </div>

        {/* Ship status summary */}
        <div className="flex gap-6 text-xs text-gray-400 font-mono mt-1">
          <span>
            Attacker ships: {frame.attackerShips.filter((s) => s.structure > 0).length} alive
          </span>
          <span>|</span>
          <span>
            Defender ships: {frame.defenderShips.filter((s) => s.structure > 0).length} alive
          </span>
          <span>|</span>
          <span>Frame: {currentFrame + 1} / {battleFrames.length}</span>
        </div>
      </div>

      {/* ---- Phase overlay flash ---- */}
      <PhaseOverlay phase={frame.phase} round={frame.round} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// COMPONENT: PhaseOverlay - Flash notification when phase changes
// ---------------------------------------------------------------------------

function PhaseOverlay({
  phase,
  round,
}: {
  phase: string;
  round: number;
}) {
  const [visible, setVisible] = useState(false);
  const prevPhase = useRef(phase);
  const prevRound = useRef(round);

  useEffect(() => {
    if (phase !== prevPhase.current || round !== prevRound.current) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 1200);
      prevPhase.current = phase;
      prevRound.current = round;
      return () => clearTimeout(t);
    }
  }, [phase, round]);

  if (!visible) return null;

  const label =
    phase === 'move'
      ? 'MOVEMENT PHASE'
      : phase === 'attack'
        ? 'ATTACK PHASE'
        : 'BATTLE END';

  const colorClass =
    phase === 'move'
      ? 'text-blue-400'
      : phase === 'attack'
        ? 'text-red-400'
        : 'text-green-400';

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
      <div
        className={`text-5xl font-black tracking-widest ${colorClass} animate-pulse`}
        style={{
          textShadow:
            '0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor',
        }}
      >
        {label}
      </div>
    </div>
  );
}

// Re-export helpers from Go2BattleFrameData
export { generateDemoBattleFrames, createDefaultFrame } from './Go2BattleFrameData';

export function Go2Battle3DDemo() {
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);

  const battleFrames = useMemo(() => generateDemoBattleFrames(), []);

  return (
    <Go2Battle3D
      battleFrames={battleFrames}
      isPaused={isPaused}
      speed={speed}
      onPauseToggle={() => setIsPaused((p) => !p)}
      onSpeedChange={setSpeed}
      onSkip={() => setIsPaused(false)}
      onExit={() => console.log('Exit battle')}
    />
  );
}

export default Go2Battle3D;
