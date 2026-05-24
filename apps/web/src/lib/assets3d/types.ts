export interface MaterialInfo {
  name: string;
  type: string;
}

export interface ModelMetadata {
  fileName: string;
  fileSizeBytes: number;
  boundingSize: { x: number; y: number; z: number };
  animationCount: number;
  animationNames: string[];
  materials: MaterialInfo[];
  meshCount: number;
}

export const WEIGHT_LIMITS = {
  premiumIdealMb: 30,
  lowIdealMb: 10,
  hardMaxMb: 50,
} as const;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function weightTier(bytes: number): 'ok' | 'warn' | 'reject' {
  const mb = bytes / (1024 * 1024);
  if (mb > WEIGHT_LIMITS.hardMaxMb) return 'reject';
  if (mb > WEIGHT_LIMITS.premiumIdealMb) return 'warn';
  return 'ok';
}
