'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Asset3DPreview,
  type Asset3DPreviewHandle,
} from '@/components/assets/Asset3DPreview';
import type { ModelMetadata } from '@/lib/assets3d/types';
import { formatBytes, weightTier, WEIGHT_LIMITS } from '@/lib/assets3d/types';

const PLACEHOLDER_URL = '/dev/glb/placeholder-shipyard-preview.glb';

export function GlbViewerClient() {
  const previewRef = useRef<Asset3DPreviewHandle>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('(ninguno)');
  const [fileSizeBytes, setFileSizeBytes] = useState(0);
  const [metadata, setMetadata] = useState<ModelMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const applyFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith('.glb')) {
        setError('Solo se admiten archivos .glb');
        return;
      }
      revokeObjectUrl();
      setError(null);
      setMetadata(null);
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setModelUrl(url);
      setFileName(file.name);
      setFileSizeBytes(file.size);
    },
    [revokeObjectUrl]
  );

  const loadPlaceholder = useCallback(() => {
    revokeObjectUrl();
    setError(null);
    setMetadata(null);
    setModelUrl(PLACEHOLDER_URL);
    setFileName('placeholder-shipyard-preview.glb');
    fetch(PLACEHOLDER_URL, { method: 'HEAD' })
      .then((r) => {
        const len = r.headers.get('content-length');
        setFileSizeBytes(len ? Number(len) : 0);
      })
      .catch(() => setFileSizeBytes(0));
  }, [revokeObjectUrl]);

  useEffect(() => () => revokeObjectUrl(), [revokeObjectUrl]);

  const tier = fileSizeBytes > 0 ? weightTier(fileSizeBytes) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <header className="mb-4 border-b border-cyan-500/20 pb-4">
        <p className="text-[10px] uppercase tracking-widest text-purple-400">
          Herramienta interna · no producción
        </p>
        <h1 className="text-2xl font-bold text-cyan-200">Visor GLB — assets 3D</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Probá modelos generados (Meshy u otros) antes de integrarlos al juego. Los archivos se
          cargan solo en tu navegador; no se suben al servidor.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        <section>
          <div className="flex flex-wrap gap-2 mb-3">
            <label className="game-btn-primary cursor-pointer text-sm">
              Cargar .glb local
              <input
                type="file"
                accept=".glb,model/gltf-binary"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) applyFile(file);
                  e.target.value = '';
                }}
              />
            </label>
            <button
              type="button"
              className="px-3 py-2 rounded-lg border border-cyan-600/40 text-sm hover:bg-cyan-950/40"
              onClick={loadPlaceholder}
            >
              Placeholder de prueba
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-lg border border-slate-600 text-sm hover:bg-slate-800"
              onClick={() => previewRef.current?.resetCamera()}
            >
              Reset cámara
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-lg border border-slate-600 text-sm hover:bg-slate-800"
              onClick={() => {
                revokeObjectUrl();
                setModelUrl(null);
                setFileName('(ninguno)');
                setFileSizeBytes(0);
                setMetadata(null);
                setError(null);
              }}
            >
              Limpiar
            </button>
          </div>

          <Asset3DPreview
            ref={previewRef}
            modelUrl={modelUrl}
            fileName={fileName}
            fileSizeBytes={fileSizeBytes}
            className="h-[min(70vh,640px)]"
            onMetadata={setMetadata}
            onLoading={setLoading}
            onError={setError}
          />

          <p className="text-[11px] text-slate-500 mt-2">
            Controles: arrastrar = rotar · rueda = zoom · clic derecho / shift = pan
          </p>
        </section>

        <aside className="game-panel p-4 space-y-4 text-sm h-fit">
          <div>
            <h2 className="text-cyan-300 font-semibold mb-2">Archivo</h2>
            <dl className="space-y-1 text-xs">
              <Row label="Nombre" value={fileName} />
              <Row
                label="Peso"
                value={fileSizeBytes ? formatBytes(fileSizeBytes) : '—'}
                highlight={
                  tier === 'reject'
                    ? 'text-red-400'
                    : tier === 'warn'
                      ? 'text-amber-300'
                      : undefined
                }
              />
              {tier && (
                <Row
                  label="Política"
                  value={
                    tier === 'reject'
                      ? `> ${WEIGHT_LIMITS.hardMaxMb} MB — no integrar directo`
                      : tier === 'warn'
                        ? `> ${WEIGHT_LIMITS.premiumIdealMb} MB — optimizar antes`
                        : 'Dentro de objetivo premium'
                  }
                />
              )}
            </dl>
          </div>

          {loading && <p className="text-amber-300 text-xs animate-pulse">Cargando modelo…</p>}
          {error && <p className="text-red-300 text-xs">{error}</p>}

          {metadata && (
            <>
              <div>
                <h2 className="text-cyan-300 font-semibold mb-2">Geometría</h2>
                <dl className="space-y-1 text-xs">
                  <Row
                    label="Tamaño (W×H×D)"
                    value={`${metadata.boundingSize.x} × ${metadata.boundingSize.y} × ${metadata.boundingSize.z}`}
                  />
                  <Row label="Meshes" value={String(metadata.meshCount)} />
                </dl>
              </div>

              <div>
                <h2 className="text-cyan-300 font-semibold mb-2">Animaciones</h2>
                <p className="text-xs text-slate-300">
                  {metadata.animationCount === 0
                    ? 'Sin animaciones'
                    : `${metadata.animationCount}: ${metadata.animationNames.join(', ')}`}
                </p>
              </div>

              <div>
                <h2 className="text-cyan-300 font-semibold mb-2">Materiales</h2>
                {metadata.materials.length === 0 ? (
                  <p className="text-xs text-slate-500">—</p>
                ) : (
                  <ul className="text-xs space-y-1 max-h-40 overflow-y-auto">
                    {metadata.materials.map((m) => (
                      <li key={m.name} className="text-slate-300">
                        {m.name}{' '}
                        <span className="text-slate-500">({m.type})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}

          <div className="text-[10px] text-slate-500 border-t border-slate-700 pt-3">
            <p>Objetivo premium: &lt; {WEIGHT_LIMITS.premiumIdealMb} MB</p>
            <p>Objetivo low: &lt; {WEIGHT_LIMITS.lowIdealMb} MB</p>
            <p>Máximo integración: {WEIGHT_LIMITS.hardMaxMb} MB</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: string;
}) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`text-right truncate ${highlight ?? 'text-slate-200'}`}>{value}</dd>
    </div>
  );
}
