'use client';

import Link from 'next/link';
import { Go2BottomNav } from '@/components/game/go2/Go2BottomNav';

export default function GalaxyPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#020814] text-amber-100">
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-xl font-bold">Mapa galaxia</h1>
        <p className="max-w-md text-center text-sm text-stone-400">
          Fase 2 — misma API que planeta. Windsurf/desktop y móvil comparten reglas.
        </p>
        <Link href="/dashboard" className="text-cyan-400 underline">
          Volver al planeta
        </Link>
      </main>
      <Go2BottomNav />
    </div>
  );
}
