'use client';

import dynamic from 'next/dynamic';

const GlbViewerClient = dynamic(
  () => import('./GlbViewerClient').then((m) => m.GlbViewerClient),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-cyan-300">
        Iniciando visor 3D…
      </div>
    ),
  }
);

export function GlbViewerShell() {
  return <GlbViewerClient />;
}
