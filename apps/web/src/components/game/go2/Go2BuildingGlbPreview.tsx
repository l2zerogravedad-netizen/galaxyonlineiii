'use client';

import '@/components/game/go2/go2-building-preview.css';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GO2_TEST_GLB_BUILDING } from '@/lib/destockHdAssets';

export interface GlbLoadMetrics {
  fileBytes: number;
  downloadMs: number;
  parseReadyMs: number;
  triangles: number;
  meshCount: number;
  materialCount: number;
}

function countSceneStats(root: THREE.Object3D) {
  let triangles = 0;
  let meshCount = 0;
  const materials = new Set<THREE.Material>();

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    meshCount += 1;
    const geom = mesh.geometry;
    const idx = geom.index;
    if (idx) triangles += idx.count / 3;
    else if (geom.attributes.position) triangles += geom.attributes.position.count / 3;
    const mat = mesh.material;
    if (Array.isArray(mat)) mat.forEach((m) => materials.add(m));
    else if (mat) materials.add(mat);
  });

  return { triangles: Math.round(triangles), meshCount, materialCount: materials.size };
}

function fitObjectToView(root: THREE.Object3D, targetSize = 2.2) {
  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  root.position.sub(center);
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  const scale = targetSize / maxDim;
  root.scale.setScalar(scale);
}

export function Go2BuildingGlbPreview() {
  const test = GO2_TEST_GLB_BUILDING;
  const hostRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<GlbLoadMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    setLoading(true);
    setError(null);
    setMetrics(null);

    const t0 = performance.now();
    let downloadMs = 0;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 2000);
    camera.position.set(4, 3, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0.6, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(8, 12, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xa5b4fc, 0.35);
    fill.position.set(-6, 4, -4);
    scene.add(fill);

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (w < 1 || h < 1) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      controls.update();
      renderer.render(scene, camera);
    };
    tick();

    void (async () => {
      try {
        const res = await fetch(test.url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await res.blob();
        downloadMs = Math.round(performance.now() - t0);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error de red');
        setLoading(false);
      }
    })();

    const loader = new GLTFLoader();
    loader.load(
      test.url,
      (gltf) => {
        fitObjectToView(gltf.scene);
        scene.add(gltf.scene);
        const stats = countSceneStats(gltf.scene);
        const totalMs = Math.round(performance.now() - t0);
        setMetrics({
          fileBytes: test.fileBytes,
          downloadMs: downloadMs || totalMs,
          parseReadyMs: totalMs,
          triangles: stats.triangles,
          meshCount: stats.meshCount,
          materialCount: stats.materialCount,
        });
        setLoading(false);
      },
      undefined,
      (err) => {
        setError(err instanceof Error ? err.message : 'Error al parsear GLB');
        setLoading(false);
      }
    );

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          const mat = mesh.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat?.dispose();
        }
      });
      if (host.contains(renderer.domElement)) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [test.fileBytes, test.url]);

  const fmtMb = (b: number) => `${(b / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="go2-bld-preview-root">
      <p className="go2-bld-preview-hint">
        Visor 3D con Three.js (mismo motor que el mapa del planeta). Archivo de prueba:{' '}
        {fmtMb(test.fileBytes)}. Orbita: clic izquierdo, pan derecho, rueda zoom.
      </p>

      <div className="go2-bld-preview-stage-wrap go2-glb-stage-wrap">
        <div className="go2-bld-preview-toolbar">
          <span style={{ fontWeight: 800, color: '#fef3c7', fontSize: 11 }}>{test.label}</span>
          <span style={{ fontSize: 9, color: '#78716c' }}>→ catálogo: {test.catalogId}</span>
        </div>

        {error ? (
          <div className="go2-glb-error">{error}</div>
        ) : (
          <div className="go2-glb-canvas-host" ref={hostRef}>
            {loading ? <div className="go2-glb-loading-overlay">Cargando GLB…</div> : null}
          </div>
        )}

        <div className="go2-bld-preview-meta go2-glb-metrics">
          <div className="go2-glb-metrics-grid">
            <span>Archivo</span>
            <strong>{test.sourceFile}</strong>
            <span>Tamaño disco</span>
            <strong>{fmtMb(test.fileBytes)}</strong>
            <span>Descarga (fetch)</span>
            <strong>{metrics ? `${metrics.downloadMs} ms` : '…'}</strong>
            <span>Listo en escena</span>
            <strong>{metrics ? `${metrics.parseReadyMs} ms` : '…'}</strong>
            <span>Triángulos</span>
            <strong>{metrics ? metrics.triangles.toLocaleString('es-ES') : '…'}</strong>
            <span>Mallas / materiales</span>
            <strong>
              {metrics ? `${metrics.meshCount} / ${metrics.materialCount}` : '…'}
            </strong>
          </div>
          {metrics && metrics.parseReadyMs > 3000 ? (
            <p className="go2-glb-warn">
              Carga lenta (&gt;3 s). Optimiza el GLB (Draco, texturas) antes del mapa del planeta.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
