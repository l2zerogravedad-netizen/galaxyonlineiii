'use client';

import Link from 'next/link';
import { Go2BottomNav } from '@/components/game/go2/Go2BottomNav';

export default function FleetsPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#020814] text-amber-100">
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-xl font-bold">Flotas</h1>
        <p className="text-sm text-stone-400">Fase 2 — formación y despliegue.</p>
        <Link href="/dashboard" className="text-cyan-400 underline">
          Planeta
        </Link>
      </main>
      <Go2BottomNav />
    </div>
  );
}
