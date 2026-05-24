'use client';

import React, {
  forwardRef,
  Suspense,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Center, OrbitControls, useGLTF } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { analyzeGltfScene } from '@/lib/assets3d/analyzeGltf';
import type { ModelMetadata } from '@/lib/assets3d/types';

export interface Asset3DPreviewHandle {
  resetCamera: () => void;
}

export interface Asset3DPreviewProps {
  modelUrl: string | null;
  fileName?: string;
  fileSizeBytes?: number;
  className?: string;
  onMetadata?: (metadata: ModelMetadata) => void;
  onLoading?: (loading: boolean) => void;
  onError?: (message: string) => void;
}

const DEFAULT_CAMERA: [number, number, number] = [5, 4, 6];

function PlaceholderMesh() {
  return (
    <mesh>
      <boxGeometry args={[1.2, 0.8, 1.2]} />
      <meshStandardMaterial color="#334155" wireframe />
    </mesh>
  );
}

function LoadedModel({
  url,
  fileName,
  fileSizeBytes,
  onMetadata,
  onError,
}: {
  url: string;
  fileName: string;
  fileSizeBytes: number;
  onMetadata?: (metadata: ModelMetadata) => void;
  onError?: (message: string) => void;
}) {
  const gltf = useGLTF(url);

  useEffect(() => {
    try {
      onMetadata?.(analyzeGltfScene(gltf, fileName, fileSizeBytes));
    } catch (e) {
      onError?.(e instanceof Error ? e.message : 'No se pudo analizar el modelo');
    }
  }, [gltf, fileName, fileSizeBytes, onMetadata, onError]);

  return (
    <Center>
      <primitive object={gltf.scene.clone(true)} />
    </Center>
  );
}

function CameraResetBridge({ onReady }: { onReady: (reset: () => void) => void }) {
  const { camera, controls } = useThree();

  const reset = useCallback(() => {
    camera.position.set(...DEFAULT_CAMERA);
    camera.lookAt(0, 0, 0);
    const orbit = controls as OrbitControlsImpl | null;
    orbit?.target.set(0, 0, 0);
    orbit?.update();
  }, [camera, controls]);

  useEffect(() => {
    onReady(reset);
  }, [onReady, reset]);

  return null;
}

class ModelErrorBoundary extends React.Component<
  { fallback: ReactNode; onError: (msg: string) => void; children: ReactNode },
  { hasError: boolean }
> {
  override state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: Error) {
    this.props.onError(error.message);
  }

  override render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function PreviewScene({
  modelUrl,
  fileName,
  fileSizeBytes,
  onMetadata,
  onError,
  onResetReady,
}: {
  modelUrl: string | null;
  fileName: string;
  fileSizeBytes: number;
  onMetadata?: (metadata: ModelMetadata) => void;
  onError?: (message: string) => void;
  onResetReady: (reset: () => void) => void;
}) {
  return (
    <>
      <color attach="background" args={['#020617']} />
      <fog attach="fog" args={['#020617', 12, 28]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 8, 4]} intensity={1.1} color="#e0f2fe" />
      <pointLight position={[-4, 2, -3]} intensity={0.5} color="#a78bfa" />
      <hemisphereLight args={['#22d3ee', '#0f172a', 0.35]} />

      {modelUrl ? (
        <ModelErrorBoundary
          fallback={<PlaceholderMesh />}
          onError={(msg) => onError?.(msg)}
        >
          <Suspense fallback={<PlaceholderMesh />}>
            <LoadedModel
              url={modelUrl}
              fileName={fileName}
              fileSizeBytes={fileSizeBytes}
              onMetadata={onMetadata}
              onError={onError}
            />
          </Suspense>
        </ModelErrorBoundary>
      ) : (
        <PlaceholderMesh />
      )}

      <gridHelper args={[12, 24, '#164e63', '#0f172a']} position={[0, -0.6, 0]} />
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={1.5}
        maxDistance={40}
        makeDefault
      />
      <CameraResetBridge onReady={onResetReady} />
    </>
  );
}

export const Asset3DPreview = forwardRef<Asset3DPreviewHandle, Asset3DPreviewProps>(
  function Asset3DPreview(
    {
      modelUrl,
      fileName = 'model.glb',
      fileSizeBytes = 0,
      className = '',
      onMetadata,
      onLoading,
      onError,
    },
    ref
  ) {
    const resetRef = useRef<(() => void) | null>(null);

    useImperativeHandle(ref, () => ({
      resetCamera: () => resetRef.current?.(),
    }));

    useEffect(() => {
      if (!modelUrl) {
        onLoading?.(false);
        return;
      }
      onLoading?.(true);
      const t = window.setTimeout(() => onLoading?.(false), 500);
      return () => window.clearTimeout(t);
    }, [modelUrl, onLoading]);

    return (
      <div
        className={`relative w-full overflow-hidden rounded-xl border border-cyan-500/25 bg-slate-950 ${className}`}
        style={{ minHeight: 320 }}
      >
        <Canvas
          camera={{ position: DEFAULT_CAMERA, fov: 45, near: 0.1, far: 200 }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
          style={{ width: '100%', height: '100%', minHeight: 320 }}
        >
          <PreviewScene
            modelUrl={modelUrl}
            fileName={fileName}
            fileSizeBytes={fileSizeBytes}
            onMetadata={onMetadata}
            onError={onError}
            onResetReady={(fn) => {
              resetRef.current = fn;
            }}
          />
        </Canvas>
        {!modelUrl && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="text-xs text-cyan-400/80 bg-slate-950/70 px-3 py-1 rounded">
              Placeholder — cargá un .glb local
            </p>
          </div>
        )}
      </div>
    );
  }
);
