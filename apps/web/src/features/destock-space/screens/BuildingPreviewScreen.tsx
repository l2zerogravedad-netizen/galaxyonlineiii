'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, Suspense, useCallback } from 'react';
import { Go2BuildingPreview } from '@/components/game/go2/Go2BuildingPreview';
import { Go2BuildingGlbPreview } from '@/components/game/go2/Go2BuildingGlbPreview';
import { BUILDING_CATALOG } from '@/components/game/mockData';
import { DestockGo2Shell } from '../components/DestockGo2Shell';

type PreviewMode = 'png' | 'glb';

function BuildingPreviewInner() {
  const router = useRouter();
  const params = useSearchParams();
  const paramId = params.get('id');
  const mode: PreviewMode = params.get('mode') === 'glb' ? 'glb' : 'png';

  const items = useMemo(
    () =>
      BUILDING_CATALOG.filter((b) => b.level >= 0).map((b) => ({
        catalogId: b.id,
        name: b.name,
      })),
    []
  );

  const selectedId =
    items.find((i) => i.catalogId === paramId)?.catalogId ?? items[0]?.catalogId ?? 'control-center';

  const setMode = useCallback(
    (next: PreviewMode) => {
      const q = new URLSearchParams();
      q.set('id', selectedId);
      if (next === 'glb') q.set('mode', 'glb');
      router.replace(`/destock/building-preview?${q.toString()}`, { scroll: false });
    },
    [router, selectedId]
  );

  const onSelect = (catalogId: string) => {
    const q = new URLSearchParams();
    q.set('id', catalogId);
    if (mode === 'glb') q.set('mode', 'glb');
    router.replace(`/destock/building-preview?${q.toString()}`, { scroll: false });
  };

  return (
    <DestockGo2Shell title="Vista edificio · Prueba HD / GLB">
      <div style={{ marginBottom: 8, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Link href="/destock" className="go2-header-btn" style={{ textDecoration: 'none' }}>
          ← Planeta
        </Link>
        <Link href="/destock/station" className="go2-header-btn" style={{ textDecoration: 'none' }}>
          Estación
        </Link>
        <div className="go2-bld-preview-tabs" style={{ marginLeft: 'auto' }}>
          <button
            type="button"
            className={['go2-bld-preview-tab', mode === 'png' ? 'go2-bld-preview-tab--on' : ''].join(' ')}
            onClick={() => setMode('png')}
          >
            PNG HD (2D)
          </button>
          <button
            type="button"
            className={['go2-bld-preview-tab', mode === 'glb' ? 'go2-bld-preview-tab--on' : ''].join(' ')}
            onClick={() => setMode('glb')}
          >
            GLB Meshy (3D)
          </button>
        </div>
      </div>
      {mode === 'glb' ? (
        <Go2BuildingGlbPreview />
      ) : (
        <Go2BuildingPreview items={items} selectedId={selectedId} onSelect={onSelect} />
      )}
    </DestockGo2Shell>
  );
}

export function BuildingPreviewScreen() {
  return (
    <Suspense
      fallback={
        <div className="go2-screen-root" style={{ padding: 24, color: '#fcd34d' }}>
          Cargando vista…
        </div>
      }
    >
      <BuildingPreviewInner />
    </Suspense>
  );
}
