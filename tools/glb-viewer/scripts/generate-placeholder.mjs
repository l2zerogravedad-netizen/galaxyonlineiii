/**
 * Genera un GLB mínimo para probar el visor (original del repo).
 * Ejecutar: cd apps/web && node ../../tools/glb-viewer/scripts/generate-placeholder.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Blob } from 'node:buffer';

if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class FileReader {
    readAsArrayBuffer(blob) {
      Promise.resolve(blob.arrayBuffer()).then((buf) => {
        this.result = buf;
        this.onload?.({ target: this });
      });
    }
  };
  globalThis.Blob = Blob;
}

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../../../apps/web/public/dev/glb');
const outFile = path.join(outDir, 'placeholder-shipyard-preview.glb');

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const group = new THREE.Group();
  group.name = 'ShipyardPlaceholder';

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.35, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.4, roughness: 0.6 })
  );
  base.position.y = 0.175;

  const tower = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.5, 1.1, 8),
    new THREE.MeshStandardMaterial({ color: 0x22d3ee, metalness: 0.5, roughness: 0.45 })
  );
  tower.position.y = 0.9;

  group.add(base, tower);

  const exporter = new GLTFExporter();

  await new Promise((resolve, reject) => {
    exporter.parse(
      group,
      (buffer) => {
        try {
          fs.writeFileSync(outFile, Buffer.from(buffer));
          const kb = (fs.statSync(outFile).size / 1024).toFixed(1);
          console.log(`Wrote ${outFile} (${kb} KB)`);
          resolve();
        } catch (e) {
          reject(e);
        }
      },
      (err) => reject(err),
      { binary: true }
    );
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
