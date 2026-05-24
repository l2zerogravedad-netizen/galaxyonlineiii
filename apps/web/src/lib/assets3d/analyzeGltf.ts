import * as THREE from 'three';
import type { MaterialInfo, ModelMetadata } from './types';

export interface GltfLike {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
}

export function analyzeGltfScene(
  gltf: GltfLike,
  fileName: string,
  fileSizeBytes: number
): ModelMetadata {
  const root = gltf.scene;
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);

  const materials = new Map<string, MaterialInfo>();
  let meshCount = 0;

  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    meshCount += 1;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const mat of mats) {
      if (!mat) continue;
      const name = mat.name || 'unnamed';
      if (!materials.has(name)) {
        materials.set(name, { name, type: mat.type });
      }
    }
  });

  const animationNames = gltf.animations.map((clip, i) => clip.name || `clip-${i}`);

  return {
    fileName,
    fileSizeBytes,
    boundingSize: {
      x: round(size.x),
      y: round(size.y),
      z: round(size.z),
    },
    animationCount: gltf.animations.length,
    animationNames,
    materials: Array.from(materials.values()),
    meshCount,
  };
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}
