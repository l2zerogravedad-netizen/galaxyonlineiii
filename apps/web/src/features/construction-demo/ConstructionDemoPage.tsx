'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * ConstructionDemoPage — Loads the 3D planet viewer via iframe.
 * 
 * The 3D scene (Three.js + GLB models) lives in /planet-3d/index.html
 * as a standalone HTML file that loads Three.js from CDN via import map.
 * 
 * This avoids npm-installing Three.js into the Next.js build, preventing
 * the package-lock.json desync issues we had before.
 */

export function ConstructionDemoPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const onLoad = () => setLoading(false);
    iframe.addEventListener('load', onLoad);
    return () => iframe.removeEventListener('load', onLoad);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#050a14' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#8bb3d9',
          fontSize: 16,
          fontFamily: 'system-ui, sans-serif',
          zIndex: 10,
        }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid #1a3a5c',
            borderTopColor: '#4a9eff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: 16,
          }} />
          <div>Cargando planeta 3D...</div>
          <div style={{ fontSize: 12, color: '#4a6a8a', marginTop: 8 }}>Preparando terreno y modelos GLB</div>
          <style jsx>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src="/planet-3d/index.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
        allow="fullscreen"
      />
    </div>
  );
}
