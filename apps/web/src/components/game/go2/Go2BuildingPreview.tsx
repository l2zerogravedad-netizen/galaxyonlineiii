'use client';

import '@/components/game/go2/go2-building-preview.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { buildingImageSrc } from '@/lib/game-assets';
import { hasHdBuilding } from '@/lib/destockHdAssets';

export interface BuildingPreviewItem {
  catalogId: string;
  name: string;
}

export function Go2BuildingPreview({
  items,
  selectedId,
  onSelect,
}: {
  items: BuildingPreviewItem[];
  selectedId: string;
  onSelect: (catalogId: string) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; panX: number; panY: number }>({
    active: false,
    startX: 0,
    startY: 0,
    panX: 0,
    panY: 0,
  });
  const stageRef = useRef<HTMLDivElement>(null);

  const selected = items.find((i) => i.catalogId === selectedId) ?? items[0];
  const src = selected ? buildingImageSrc(selected.catalogId) : '';

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setImgSize(null);
  }, [selectedId]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (zoom <= 1) return;
      setDragging(true);
      dragRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
      stageRef.current?.setPointerCapture(e.pointerId);
    },
    [zoom, pan]
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    setPan({
      x: dragRef.current.panX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.panY + (e.clientY - dragRef.current.startY),
    });
  }, []);

  const onPointerUp = useCallback(() => {
    dragRef.current.active = false;
    setDragging(false);
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom((z) => Math.min(3, Math.max(0.5, Math.round((z + delta) * 100) / 100)));
  }, []);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const baseDisplay = imgSize ? Math.min(320, Math.max(imgSize.w, imgSize.h)) : 280;

  return (
    <div className="go2-bld-preview-root">
      <p className="go2-bld-preview-hint">
        Vista de prueba con PNG HD. Rueda del ratón o control para zoom; arrastra cuando el zoom es mayor que 1×.
        En el mapa del planeta el mismo edificio se muestra a ~68 px.
      </p>
      <div className="go2-bld-preview-layout">
        <div className="go2-panel" style={{ minHeight: 0 }}>
          <div className="go2-panel-head">Catálogo</div>
          <div className="go2-panel-body go2-bld-preview-list">
            {items.map((item) => (
              <button
                key={item.catalogId}
                type="button"
                className={[
                  'go2-bld-preview-list-btn',
                  selectedId === item.catalogId ? 'go2-bld-preview-list-btn--on' : '',
                ].join(' ')}
                onClick={() => onSelect(item.catalogId)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={buildingImageSrc(item.catalogId)}
                  alt=""
                  className="go2-bld-preview-list-thumb"
                />
                <span>
                  {item.name}
                  {hasHdBuilding(item.catalogId) ? (
                    <span style={{ display: 'block', color: '#4ade80', fontWeight: 600 }}>HD</span>
                  ) : null}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="go2-bld-preview-stage-wrap">
          <div className="go2-bld-preview-toolbar">
            <span style={{ fontWeight: 800, color: '#fef3c7', fontSize: 11 }}>{selected?.name}</span>
            <label>
              Zoom
              <input
                type="range"
                min={50}
                max={300}
                value={Math.round(zoom * 100)}
                onChange={(e) => setZoom(Number(e.target.value) / 100)}
              />
              <span className="go2-bld-preview-zoom-val">{Math.round(zoom * 100)}%</span>
            </label>
            <button type="button" className="go2-header-btn" onClick={resetView}>
              Centrar
            </button>
          </div>

          <div
            ref={stageRef}
            className={['go2-bld-preview-stage', dragging ? 'go2-bld-preview-stage--dragging' : ''].join(' ')}
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            <div
              className="go2-bld-preview-stage-inner"
              style={{
                transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
              }}
            >
              <div className="go2-bld-preview-plinth" aria-hidden />
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={selectedId}
                  src={src}
                  alt={selected?.name ?? 'Edificio'}
                  className="go2-bld-preview-img"
                  style={{ width: baseDisplay }}
                  onLoad={(e) => {
                    const el = e.currentTarget;
                    setImgSize({ w: el.naturalWidth, h: el.naturalHeight });
                  }}
                />
              ) : null}
            </div>
          </div>

          <div className="go2-bld-preview-meta">
            <span>ID: {selected?.catalogId}</span>
            {imgSize ? (
              <span>
                {' · '}
                Textura: {imgSize.w}×{imgSize.h} px · Mapa: ~68 px
              </span>
            ) : null}
            {hasHdBuilding(selected?.catalogId ?? '') ? ' · Asset HD de prueba' : ' · Sin PNG HD (fallback WebP)'}
          </div>
        </div>
      </div>
    </div>
  );
}
