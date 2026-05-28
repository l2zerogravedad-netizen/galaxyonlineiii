// @ts-nocheck
/**
 * Go2Planet3D — Real 3D Planet Viewer with GLB Buildings
 *
 * Features:
 * - Sandy/desert terrain with procedural shader
 * - Real GLB 3D models for each building type
 * - Click-to-place construction system:
 *   1. Click building in panel → ghost attaches to cursor
 *   2. Move mouse → ghost follows terrain raycast, snaps to grid
 *   3. Second click → places building if cell is valid
 *   4. ESC → cancels, R → rotates ghost
 * - Isometric invisible grid for placement logic
 * - Ambient + directional lighting
 * - OrbitControls for camera rotation/zoom
 */

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  useGLTF,
  OrbitControls,
  Html,
  ContactShadows,
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
  BUILDING_CATALOG,
  GRID_COLS,
  GRID_ROWS,
  getCatalogItem,
} from '@/features/construction-demo/catalog';
import {
  buildOccupancyMap,
  canPlaceAt,
  cellKey,
  cellsForPlacement,
  countTypeOnMap,
  footprintSize,
} from '@/features/construction-demo/gridUtils';
import type {
  BuildingTypeId,
  PlacedBuilding,
  Resources,
  Rotation,
} from '@/features/construction-demo/types';

/* ─── GLB PATHS ─── */
const GLB_MAP: Record<BuildingTypeId, string> = {
  metal_mine: '/models/buildings/metal_mine.glb',
  power_plant: '/models/buildings/power_plant.glb',
  warehouse: '/models/buildings/warehouse.glb',
  shipyard: '/models/buildings/shipyard.glb',
  command_center: '/models/buildings/command_center.glb',
};

/* ─── TERRAIN SHADER ─── */
const terrainVertexShader = `
varying vec2 vUv;
varying vec3 vWorldPos;
void main() {
  vUv = uv;
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const terrainFragmentShader = `
varying vec2 vUv;
varying vec3 vWorldPos;

// Simplex-like noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vWorldPos.xz * 0.15;
  float n = fbm(uv);
  float n2 = fbm(uv * 2.0 + vec2(5.3, 1.7));

  // Desert sand colors
  vec3 sand1 = vec3(0.76, 0.70, 0.50); // light sand
  vec3 sand2 = vec3(0.62, 0.55, 0.37); // medium sand
  vec3 sand3 = vec3(0.48, 0.42, 0.28); // dark sand
  vec3 rock  = vec3(0.40, 0.36, 0.30); // rocky patches

  vec3 color = mix(sand1, sand2, n);
  color = mix(color, sand3, n2 * 0.6);
  color = mix(color, rock, smoothstep(0.6, 0.9, n2) * 0.3);

  // Grid lines (subtle)
  float gridX = step(0.95, fract(vWorldPos.x / 3.8 + 0.5));
  float gridZ = step(0.95, fract(vWorldPos.z / 2.2 + 0.5));
  float grid = max(gridX, gridZ) * 0.08;
  color = mix(color, vec3(0.35, 0.30, 0.20), grid);

  gl_FragColor = vec4(color, 1.0);
}
`;

/* ─── TERRAIN COMPONENT ─── */
function Terrain({ onPointerMove, onClick }: {
  onPointerMove?: (pos: THREE.Vector3) => void;
  onClick?: (pos: THREE.Vector3) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: terrainVertexShader,
      fragmentShader: terrainFragmentShader,
      side: THREE.DoubleSide,
    });
  }, []);

  const handlePointerMove = useCallback((e: any) => {
    e.stopPropagation();
    if (onPointerMove) onPointerMove(e.point);
  }, [onPointerMove]);

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    if (onClick) onClick(e.point);
  }, [onClick]);

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.5, 0]}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      receiveShadow
    >
      <planeGeometry args={[60, 40, 1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

/* ─── GRID OVERLAY (semi-transparent isometric) ─── */
function GridOverlay() {
  const lines = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const cw = 3.8; // cell width in world units
    const ch = 2.2; // cell height in world units
    const offsetX = -(GRID_COLS * cw) / 2;
    const offsetZ = -(GRID_ROWS * ch) / 2;

    for (let row = 0; row <= GRID_ROWS; row++) {
      for (let col = 0; col <= GRID_COLS; col++) {
        const x = offsetX + col * cw + (row % 2 === 0 ? 0 : cw * 0.5);
        const z = offsetZ + row * ch;
        pts.push(new THREE.Vector3(x, 0.02, z));
      }
    }
    return pts;
  }, []);

  return (
    <group>
      {lines.map((pt, i) => (
        <mesh key={i} position={[pt.x, pt.y, pt.z]}>
          <boxGeometry args={[3.6, 0.02, 2.0]} />
          <meshBasicMaterial color="#4a7c59" transparent opacity={0.15} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── BUILDING MODEL (GLB) ─── */
function BuildingModel({
  typeId,
  position,
  rotation,
  ghost = false,
}: {
  typeId: BuildingTypeId;
  position: [number, number, number];
  rotation: number;
  ghost?: boolean;
}) {
  const glbPath = GLB_MAP[typeId];
  const { scene } = useGLTF(glbPath);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (ghost) {
          child.material = child.material.clone();
          child.material.transparent = true;
          child.material.opacity = 0.5;
        }
      }
    });
    return clone;
  }, [scene, ghost]);

  // Map building types to appropriate scale/rotation offsets
  const scale: [number, number, number] = useMemo(() => {
    switch (typeId) {
      case 'command_center': return [0.8, 0.8, 0.8];
      case 'shipyard': return [0.6, 0.6, 0.6];
      case 'metal_mine': return [0.7, 0.7, 0.7];
      case 'warehouse': return [0.65, 0.65, 0.65];
      case 'power_plant': return [0.8, 0.8, 0.8];
      default: return [0.7, 0.7, 0.7];
    }
  }, [typeId]);

  const rotRad = (rotation * Math.PI) / 180;

  return (
    <primitive
      object={clonedScene}
      position={position}
      rotation={[0, rotRad, 0]}
      scale={scale}
    />
  );
}

/* ─── WORLD → GRID CONVERSION ─── */
const CELL_W = 3.8;
const CELL_H = 2.2;
const GRID_OFFSET_X = -(GRID_COLS * CELL_W) / 2;
const GRID_OFFSET_Z = -(GRID_ROWS * CELL_H) / 2;

function worldToGrid(worldX: number, worldZ: number): { col: number; row: number } | null {
  const localX = worldX - GRID_OFFSET_X;
  const localZ = worldZ - GRID_OFFSET_Z;
  const row = Math.floor(localZ / (CELL_H * 0.5));
  if (row < 0 || row >= GRID_ROWS) return null;
  const rowOffset = row % 2 === 0 ? 0 : CELL_W * 0.5;
  const col = Math.floor((localX - rowOffset) / CELL_W);
  if (col < 0 || col >= GRID_COLS) return null;
  return { col, row };
}

function gridToWorld(col: number, row: number): [number, number, number] {
  const rowOffset = row % 2 === 0 ? 0 : CELL_W * 0.5;
  const x = GRID_OFFSET_X + col * CELL_W + rowOffset + CELL_W * 0.5;
  const z = GRID_OFFSET_Z + row * (CELL_H * 0.5) + CELL_H * 0.5;
  return [x, 0, z];
}

/* ─── PLACED BUILDINGS RENDERER ─── */
function PlacedBuildings({
  buildings,
}: {
  buildings: PlacedBuilding[];
}) {
  return (
    <>
      {buildings.map((b) => {
        const pos = gridToWorld(b.col, b.row);
        return (
          <BuildingModel
            key={b.instanceId}
            typeId={b.typeId}
            position={pos}
            rotation={b.rotation}
          />
        );
      })}
    </>
  );
}

/* ─── GHOST BUILDING (preview while placing) ─── */
function GhostBuilding({
  typeId,
  gridPos,
  rotation,
  valid,
}: {
  typeId: BuildingTypeId;
  gridPos: { col: number; row: number };
  rotation: Rotation;
  valid: boolean;
}) {
  const pos = gridToWorld(gridPos.col, gridPos.row);

  return (
    <group>
      <BuildingModel
        typeId={typeId}
        position={pos}
        rotation={rotation}
        ghost
      />
      {/* Valid/invalid indicator */}
      <mesh position={[pos[0], 0.01, pos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CELL_W * 0.9, CELL_H * 0.9]} />
        <meshBasicMaterial
          color={valid ? '#00ff44' : '#ff0044'}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

/* ─── SCENE ─── */
function Scene({
  buildings,
  ghostState,
  onTerrainMove,
  onTerrainClick,
}: {
  buildings: PlacedBuilding[];
  ghostState: { typeId: BuildingTypeId; gridPos: { col: number; row: number }; rotation: Rotation; valid: boolean } | null;
  onTerrainMove: (pos: THREE.Vector3) => void;
  onTerrainClick: (pos: THREE.Vector3) => void;
}) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} color="#ffe8cc" />
      <directionalLight
        position={[20, 30, 15]}
        intensity={1.2}
        color="#fff5e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={-40}
        shadow-camera-bottom={40}
      />
      <directionalLight position={[-15, 10, -10]} intensity={0.3} color="#aaccff" />

      {/* Terrain */}
      <Terrain onPointerMove={onTerrainMove} onClick={onTerrainClick} />

      {/* Grid */}
      <GridOverlay />

      {/* Placed buildings */}
      <PlacedBuildings buildings={buildings} />

      {/* Ghost building */}
      {ghostState && (
        <GhostBuilding
          typeId={ghostState.typeId}
          gridPos={ghostState.gridPos}
          rotation={ghostState.rotation}
          valid={ghostState.valid}
        />
      )}

      {/* Contact shadows */}
      <ContactShadows
        position={[0, -0.48, 0]}
        opacity={0.4}
        scale={60}
        blur={2}
        far={10}
      />

      {/* Camera controls */}
      <OrbitControls
        makeDefault
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={10}
        maxDistance={60}
        target={[0, 0, 0]}
      />
    </>
  );
}

/* ─── UI OVERLAY ─── */
function BuildingPanel({
  resources,
  onSelectBuilding,
  canAffordCheck,
  canBuildCheck,
  onDeleteSelected,
  onReset,
  selectedId,
}: {
  resources: Resources;
  onSelectBuilding: (typeId: BuildingTypeId) => void;
  canAffordCheck: (cost: Resources) => boolean;
  canBuildCheck: (typeId: BuildingTypeId) => boolean;
  onDeleteSelected: () => void;
  onReset: () => void;
  selectedId: string | null;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 220,
        background: 'linear-gradient(180deg, #0a1428 0%, #0d1f3c 100%)',
        borderRight: '2px solid #1a3a5c',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
        overflow: 'hidden',
      }}
    >
      {/* Resources */}
      <div style={{ padding: '12px 10px', borderBottom: '1px solid #1a3a5c' }}>
        <div style={{ fontSize: 11, color: '#8bb3d9', marginBottom: 6, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Recursos</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <ResourceBadge icon="M" value={resources.metal} color="#b45309" />
          <ResourceBadge icon="E" value={resources.energy} color="#15803d" />
          <ResourceBadge icon="C" value={resources.crystal} color="#0369a1" />
        </div>
      </div>

      {/* Buildings */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        <div style={{ fontSize: 10, color: '#5a7a9a', marginBottom: 8, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Edificios</div>
        {BUILDING_CATALOG.map((b) => {
          const afford = canAffordCheck(b.cost);
          const canBuild = canBuildCheck(b.id);
          const disabled = !afford || !canBuild;
          return (
            <button
              key={b.id}
              onClick={() => !disabled && onSelectBuilding(b.id)}
              style={{
                width: '100%',
                padding: '8px 10px',
                marginBottom: 6,
                borderRadius: 8,
                border: `2px solid ${disabled ? '#1a2d44' : b.accent}`,
                background: disabled ? '#0d1520' : `linear-gradient(135deg, ${b.color}22, ${b.accent}11)`,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 20 }}>{b.icon}</span>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 'bold', color: disabled ? '#4a5a6a' : '#e0e8f0' }}>{b.name}</div>
                <div style={{ fontSize: 9, color: disabled ? '#3a4a5a' : '#7a9aba' }}>
                  {b.cost.metal}M {b.cost.energy}E {b.cost.crystal}C
                  {b.maxOnMap ? ` · ${b.maxOnMap} max` : ''}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div style={{ padding: '10px', borderTop: '1px solid #1a3a5c', display: 'flex', gap: 6 }}>
        <ActionButton onClick={onDeleteSelected} color="#dc2626">Eliminar</ActionButton>
        <ActionButton onClick={onReset} color="#6b7280">Reiniciar</ActionButton>
      </div>
    </div>
  );
}

function ResourceBadge({ icon, value, color }: { icon: string; value: number; color: string }) {
  return (
    <div style={{
      background: `${color}22`,
      border: `1px solid ${color}44`,
      borderRadius: 6,
      padding: '3px 8px',
      fontSize: 11,
      fontWeight: 'bold',
      color,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    }}>
      {icon} {value.toLocaleString()}
    </div>
  );
}

function ActionButton({ children, onClick, color }: { children: React.ReactNode; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '8px',
        borderRadius: 6,
        border: `1px solid ${color}55`,
        background: `${color}22`,
        color,
        fontSize: 11,
        fontWeight: 'bold',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

/* ─── MAIN COMPONENT ─── */
interface Go2Planet3DProps {
  resources: Resources;
  buildings: PlacedBuilding[];
  onBuild: (typeId: BuildingTypeId, col: number, row: number, rotation: Rotation) => void;
  onDelete: (instanceId: string) => void;
  onReset: () => void;
  canAfford: (cost: Resources) => boolean;
  spendResources: (cost: Resources) => void;
  refundResources: (cost: Resources) => void;
  getBuildingCost: (typeId: BuildingTypeId) => Resources | null;
}

export function Go2Planet3D({
  resources,
  buildings,
  onBuild,
  onDelete,
  onReset,
  canAfford,
}: Go2Planet3DProps) {
  const [placingTypeId, setPlacingTypeId] = useState<BuildingTypeId | null>(null);
  const [placingRotation, setPlacingRotation] = useState<Rotation>(0);
  const [ghostGridPos, setGhostGridPos] = useState<{ col: number; row: number } | null>(null);
  const [ghostValid, setGhostValid] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const occupancy = useMemo(() => buildOccupancyMap(buildings), [buildings]);

  // Ghost state for Scene
  const ghostState = useMemo(() => {
    if (!placingTypeId || !ghostGridPos) return null;
    const def = getCatalogItem(placingTypeId);
    if (!def) return null;
    const { w, h } = footprintSize(def, placingRotation);
    const place = canPlaceAt(ghostGridPos.col, ghostGridPos.row, w, h, occupancy);
    const afford = canAfford(def.cost);
    const maxOk = def.maxOnMap == null || countTypeOnMap(buildings, placingTypeId) < def.maxOnMap;
    const valid = place.ok && afford && maxOk;
    return { typeId: placingTypeId, gridPos: ghostGridPos, rotation: placingRotation, valid };
  }, [placingTypeId, ghostGridPos, placingRotation, occupancy, canAfford, buildings]);

  // Handle terrain pointer move
  const handleTerrainMove = useCallback((pos: THREE.Vector3) => {
    if (!placingTypeId) return;
    const grid = worldToGrid(pos.x, pos.z);
    if (grid) {
      setGhostGridPos(grid);
    }
  }, [placingTypeId]);

  // Handle terrain click
  const handleTerrainClick = useCallback((pos: THREE.Vector3) => {
    if (!placingTypeId || !ghostGridPos) return;

    const def = getCatalogItem(placingTypeId);
    if (!def) return;

    const { w, h } = footprintSize(def, placingRotation);
    const place = canPlaceAt(ghostGridPos.col, ghostGridPos.row, w, h, occupancy);
    const afford = canAfford(def.cost);
    const maxOk = def.maxOnMap == null || countTypeOnMap(buildings, placingTypeId) < def.maxOnMap;

    if (place.ok && afford && maxOk) {
      onBuild(placingTypeId, ghostGridPos.col, ghostGridPos.row, placingRotation);
      showToast(`${def.name} construido`);
      setPlacingTypeId(null);
      setGhostGridPos(null);
    } else {
      showToast(
        !afford ? 'Recursos insuficientes' :
        !maxOk ? 'Limite alcanzado' :
        place.reason
      );
    }
  }, [placingTypeId, ghostGridPos, placingRotation, occupancy, canAfford, buildings, onBuild, showToast]);

  // Select building from panel
  const handleSelectBuilding = useCallback((typeId: BuildingTypeId) => {
    const def = getCatalogItem(typeId);
    if (!def) return;
    if (!canAfford(def.cost)) {
      showToast('Recursos insuficientes');
      return;
    }
    if (def.maxOnMap != null && countTypeOnMap(buildings, typeId) >= def.maxOnMap) {
      showToast(`Maximo ${def.maxOnMap} en el mapa`);
      return;
    }
    setPlacingTypeId(typeId);
    setPlacingRotation(0);
    setGhostGridPos(null);
    showToast(`${def.name}: click en el terreno para colocar (R rotar, ESC cancelar)`);
  }, [canAfford, buildings, showToast]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPlacingTypeId(null);
        setGhostGridPos(null);
        return;
      }
      if ((e.key === 'r' || e.key === 'R') && placingTypeId) {
        setPlacingRotation(r => r === 0 ? 90 : r === 90 ? 180 : r === 180 ? 270 : 0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [placingTypeId]);

  const ghostStateForScene = ghostState || null;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#000' }}>
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [25, 20, 25], fov: 45 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        style={{ position: 'absolute', top: 0, left: 220, right: 0, bottom: 0 }}
      >
        <Suspense fallback={<Html center><div style={{ color: '#8bb3d9', fontSize: 14 }}>Cargando planeta 3D...</div></Html>}>
          <Scene
            buildings={buildings}
            ghostState={ghostStateForScene}
            onTerrainMove={handleTerrainMove}
            onTerrainClick={handleTerrainClick}
          />
        </Suspense>
      </Canvas>

      {/* UI Panel */}
      <BuildingPanel
        resources={resources}
        onSelectBuilding={handleSelectBuilding}
        canAffordCheck={canAfford}
        canBuildCheck={(typeId) => {
          const def = getCatalogItem(typeId);
          if (!def) return false;
          return def.maxOnMap == null || countTypeOnMap(buildings, typeId) < def.maxOnMap;
        }}
        onDeleteSelected={() => {
          if (selectedId) {
            onDelete(selectedId);
            setSelectedId(null);
            showToast('Edificio eliminado');
          }
        }}
        onReset={onReset}
        selectedId={selectedId}
      />

      {/* Instructions overlay */}
      {placingTypeId && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(10, 20, 40, 0.9)',
          border: '1px solid #1a3a5c',
          borderRadius: 8,
          padding: '8px 16px',
          color: '#8bb3d9',
          fontSize: 12,
          zIndex: 20,
          textAlign: 'center',
        }}>
          Click en el terreno para colocar · R rotar · ESC cancelar
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(10, 20, 40, 0.95)',
          border: '1px solid #1a3a5c',
          borderRadius: 8,
          padding: '10px 20px',
          color: '#e0e8f0',
          fontSize: 13,
          zIndex: 20,
          animation: 'fadeInUp 0.2s ease',
        }}>
          {toast}
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Preload all GLBs
Object.values(GLB_MAP).forEach((path) => useGLTF.preload(path));

export default Go2Planet3D;
