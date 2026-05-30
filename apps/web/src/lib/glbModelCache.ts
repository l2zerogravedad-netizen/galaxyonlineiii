import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const templates = new Map<string, THREE.Group>();
const loading = new Map<string, Promise<THREE.Group>>();

function normalizeRoot(root: THREE.Group, targetSize = 1) {
  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  root.position.sub(center);
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  root.scale.setScalar(targetSize / maxDim);
}

export function getGlbTemplate(url: string): Promise<THREE.Group> {
  const cached = templates.get(url);
  if (cached) return Promise.resolve(cached.clone());

  const pending = loading.get(url);
  if (pending) return pending.then((g) => g.clone());

  const promise = new Promise<THREE.Group>((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const root = gltf.scene;
        normalizeRoot(root, 1);
        templates.set(url, root);
        loading.delete(url);
        resolve(root.clone());
      },
      undefined,
      (err) => {
        loading.delete(url);
        reject(err);
      }
    );
  });

  loading.set(url, promise);
  return promise;
}

export function preloadGlb(url: string): void {
  void getGlbTemplate(url).catch(() => undefined);
}
