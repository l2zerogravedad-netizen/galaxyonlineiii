// RNG determinista sembrado para el combate DESTOCK (réplica GO II).
// Misma semilla → misma secuencia → batalla reproducible.
// Definido localmente porque @galaxy/shared no expone createSeededRng en esta rama.
// Contrato IDÉNTICO al original (packages/shared/src/go2/combatSim.ts): devuelve una
// función () => number que produce floats en [0, 1). El combate la usa como `rng()`.
// LCG (Numerical Recipes): s = (1664525·s + 1013904223) mod 2^32.

export function createSeededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}
