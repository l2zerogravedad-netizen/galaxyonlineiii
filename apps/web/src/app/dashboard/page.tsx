'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

interface Resource {
  id: string;
  type: string;
  amount: number;
  capacity: number;
  productionPerHour: number;
}

interface Building {
  id: string;
  type: string;
  level: number;
  slotIndex: number;
  status: string;
  constructionEndsAt?: string;
}

interface Planet {
  id: string;
  name: string;
  type: string;
  maxBuildingSlots: number;
  buildings: Building[];
}

interface EmpireData {
  id: string;
  name: string;
  level: number;
  experience: number;
  resources: Resource[];
  planets: Planet[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [empire, setEmpire] = useState<EmpireData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSyncAt, setLastSyncAt] = useState<number>(Date.now());

  const fetchEmpire = async (token: string) => {
    const response = await axios.get('/api/empire', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setEmpire(response.data);
    setLastSyncAt(Date.now());
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    fetchEmpire(token)
      .then(() => setLoading(false))
      .catch(() => {
        localStorage.removeItem('token');
        router.push('/');
      });

    // Re-sync resources from server every 30s to prevent drift
    const syncInterval = setInterval(() => {
      const t = localStorage.getItem('token');
      if (t) fetchEmpire(t).catch(() => {});
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Cargando...</p>
      </div>
    );
  }

  if (!empire) return null;

  const mainPlanet = empire.planets[0];
  const metal = empire.resources.find((r) => r.type === 'METAL');
  const plasma = empire.resources.find((r) => r.type === 'PLASMA');
  const credits = empire.resources.find((r) => r.type === 'CREDITS');

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-slate-800 p-4 rounded-lg">
          <div>
            <h1 className="text-2xl font-bold">{empire.name}</h1>
            <p className="text-gray-400">Nivel {empire.level}</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              router.push('/');
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
          >
            Salir
          </button>
        </div>

        {/* Resources */}
        <div className="grid grid-cols-3 gap-4">
          <ResourceCard
            name="Metal"
            initialAmount={metal?.amount || 0}
            capacity={metal?.capacity || 0}
            production={metal?.productionPerHour || 0}
            color="text-gray-400"
            lastSyncAt={lastSyncAt}
          />
          <ResourceCard
            name="Plasma"
            initialAmount={plasma?.amount || 0}
            capacity={plasma?.capacity || 0}
            production={plasma?.productionPerHour || 0}
            color="text-purple-400"
            lastSyncAt={lastSyncAt}
          />
          <ResourceCard
            name="Créditos"
            initialAmount={credits?.amount || 0}
            capacity={credits?.capacity || 0}
            production={0}
            color="text-yellow-400"
            lastSyncAt={lastSyncAt}
          />
        </div>

        {/* Planet View — Isometric Terrain */}
        <div className="bg-slate-800 p-4 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">{mainPlanet.name}</h2>
          <div className="relative mx-auto overflow-hidden rounded-xl" style={{ width: 'fit-content' }}>
            <div
              className="grid grid-cols-3 gap-1 p-4 rounded-xl border-4 border-emerald-900/40"
              style={{
                background:
                  'radial-gradient(circle at 20% 20%, #2f7a28 0%, #1e5a18 40%, #0f3a0b 100%)',
                boxShadow:
                  'inset 0 0 60px rgba(0,0,0,0.6), 0 12px 40px rgba(0,0,0,0.4)',
              }}
            >
              {Array.from({ length: 9 }).map((_, index) => {
                const building = mainPlanet.buildings.find(
                  (b) => b.slotIndex === index
                );
                return (
                  <BuildingSlot
                    key={index}
                    index={index}
                    building={building}
                    planetId={mainPlanet.id}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ActionButton href="/shipyard" label="Astillero" />
          <ActionButton href="/research" label="Investigación" />
          <ActionButton href="#" label="Flotas" disabled />
          <ActionButton href="#" label="Misiones" disabled />
        </div>
      </div>
    </div>
  );
}

function ResourceCard({
  name,
  initialAmount,
  capacity,
  production,
  color,
  lastSyncAt,
}: {
  name: string;
  initialAmount: number;
  capacity: number;
  production: number;
  color: string;
  lastSyncAt: number;
}) {
  const [displayAmount, setDisplayAmount] = useState(initialAmount);

  useEffect(() => {
    setDisplayAmount(initialAmount);
  }, [initialAmount]);

  useEffect(() => {
    if (production <= 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const secondsSinceSync = (now - lastSyncAt) / 1000;
      const produced = (production / 3600) * secondsSinceSync;
      setDisplayAmount(Math.min(initialAmount + produced, capacity));
    }, 1000);

    return () => clearInterval(interval);
  }, [initialAmount, production, capacity, lastSyncAt]);

  const percentage = Math.min((displayAmount / capacity) * 100, 100);

  return (
    <div className="bg-slate-800 p-4 rounded-lg">
      <h3 className={`text-sm font-medium ${color}`}>{name}</h3>
      <p className="text-2xl font-bold mt-1 tabular-nums">
        {Math.floor(displayAmount).toLocaleString()}
      </p>
      <p className="text-xs text-gray-500">
        / {capacity.toLocaleString()}
      </p>
      {production > 0 && (
        <p className="text-xs text-green-400 mt-1">
          +{production.toLocaleString()}/h
        </p>
      )}
      <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-current transition-all duration-1000 ease-linear"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function BuildingSlot({
  index,
  building,
  planetId,
}: {
  index: number;
  building?: Building;
  planetId: string;
}) {
  const isConstructing =
    building?.status === 'CONSTRUCTING' || building?.status === 'UPGRADING';
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!isConstructing || !building?.constructionEndsAt) return;

    const update = () => {
      const diff = Math.max(
        0,
        new Date(building.constructionEndsAt!).getTime() - Date.now()
      );
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}m ${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [isConstructing, building?.constructionEndsAt]);

  if (!building) {
    return (
      <Link
        href={`/planet/${planetId}/build?slot=${index}`}
        className="w-28 h-28 rounded-lg flex items-center justify-center transition hover:brightness-110"
        style={{
          background:
            'linear-gradient(135deg, #3d8f36 0%, #2a7025 50%, #1a4f16 100%)',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.08), 0 3px 6px rgba(0,0,0,0.3)',
        }}
      >
        <span className="text-3xl text-white/20">+</span>
      </Link>
    );
  }

  return (
    <Link
      href={isConstructing ? '#' : `/planet/${planetId}/build?slot=${index}`}
      className="w-28 h-28 rounded-lg relative flex items-center justify-center transition hover:brightness-110"
      style={{
        background:
          'linear-gradient(135deg, #3d8f36 0%, #2a7025 50%, #1a4f16 100%)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.08), 0 3px 6px rgba(0,0,0,0.3)',
      }}
    >
      <BuildingArt type={building.type} level={building.level} />

      {/* Construction overlay */}
      {isConstructing && (
        <div className="absolute inset-0 bg-yellow-500/25 rounded-lg flex flex-col items-center justify-center animate-pulse z-10">
          <div className="bg-slate-900/80 px-2 py-1 rounded text-[10px] text-yellow-300 font-mono font-bold">
            {timeLeft}
          </div>
          <span className="text-[9px] text-yellow-200 mt-0.5 uppercase tracking-wider">
            Construyendo
          </span>
        </div>
      )}
    </Link>
  );
}

function BuildingArt({ type, level }: { type: string; level: number }) {
  const badge = (
    <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-emerald-950 z-20 shadow-md">
      {level}
    </div>
  );

  const shadow = (
    <div className="absolute bottom-1 w-14 h-3 bg-black/25 rounded-full blur-[2px]" />
  );

  switch (type) {
    case 'COMMAND_CENTER':
      return (
        <div className="relative w-full h-full flex items-end justify-center">
          {shadow}
          {badge}
          <div className="relative w-10 h-14 bg-gradient-to-b from-slate-400 to-slate-700 rounded-t-md shadow-xl border-x border-slate-500/50">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-slate-400" />
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <div className="absolute top-2 left-1.5 w-2 h-2.5 bg-cyan-300/80 rounded-[1px]" />
            <div className="absolute top-2 right-1.5 w-2 h-2.5 bg-cyan-300/80 rounded-[1px]" />
            <div className="absolute top-6 left-1.5 w-2 h-2.5 bg-cyan-300/80 rounded-[1px]" />
            <div className="absolute top-6 right-1.5 w-2 h-2.5 bg-cyan-300/80 rounded-[1px]" />
            <div className="absolute bottom-0 w-full h-1.5 bg-slate-800/40" />
          </div>
        </div>
      );

    case 'METAL_MINE':
      return (
        <div className="relative w-full h-full flex items-end justify-center">
          {shadow}
          {badge}
          <div className="relative w-12 h-10 bg-gradient-to-b from-stone-500 to-stone-700 rounded-sm shadow-xl">
            <div className="absolute -top-2 left-2 w-4 h-5 bg-stone-600 rounded-t-sm">
              <div className="absolute -top-1 left-1 w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            </div>
            <div className="absolute -top-2 right-2 w-4 h-5 bg-stone-600 rounded-t-sm">
              <div className="absolute -top-1 left-1 w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            </div>
            <div className="absolute top-3 left-2 right-2 h-3 bg-stone-800/40 rounded-sm" />
          </div>
        </div>
      );

    case 'PLASMA_EXTRACTOR':
      return (
        <div className="relative w-full h-full flex items-end justify-center">
          {shadow}
          {badge}
          <div className="relative w-12 h-11 bg-gradient-to-b from-cyan-600 to-cyan-900 rounded-md shadow-xl">
            <div className="absolute -top-3 left-2 w-6 h-6 rounded-full border-2 border-cyan-300/60 bg-cyan-400/20" />
            <div className="absolute top-3 left-3 w-6 h-5 bg-cyan-950/40 rounded-sm" />
            <div className="absolute bottom-0 w-full h-1.5 bg-cyan-950/40" />
          </div>
          <div className="absolute bottom-3 left-4 w-4 h-8 bg-cyan-300/30 rounded-full blur-md animate-pulse" />
        </div>
      );

    case 'SHIPYARD':
      return (
        <div className="relative w-full h-full flex items-end justify-center">
          {shadow}
          {badge}
          <div className="relative w-14 h-9 bg-gradient-to-b from-slate-500 to-slate-700 rounded-b-lg shadow-xl border-t-2 border-slate-400">
            <div className="absolute -top-1 left-2 right-2 h-2 bg-slate-400 rounded-sm" />
            <div className="absolute top-3 left-3 w-8 h-4 bg-slate-800/40 rounded-sm border border-slate-600/30" />
            <div className="absolute top-4 left-5 w-4 h-0.5 bg-cyan-300/60" />
          </div>
        </div>
      );

    case 'RESEARCH_LAB':
      return (
        <div className="relative w-full h-full flex items-end justify-center">
          {shadow}
          {badge}
          <div className="relative w-10 h-12 bg-gradient-to-b from-indigo-400 to-indigo-700 rounded-t-full shadow-xl">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-6 h-5 bg-indigo-300/30 rounded-full border border-indigo-200/40" />
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-3 bg-indigo-300" />
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-200 rounded-full animate-pulse" />
          </div>
        </div>
      );

    case 'ACADEMY':
      return (
        <div className="relative w-full h-full flex items-end justify-center">
          {shadow}
          {badge}
          <div className="relative w-11 h-11 bg-gradient-to-b from-amber-600 to-amber-800 rounded-sm shadow-xl">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-4 bg-amber-500 rounded-t-full" />
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-amber-400" />
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-4 h-3 bg-amber-950/30 rounded-sm" />
          </div>
        </div>
      );

    case 'WAREHOUSE':
      return (
        <div className="relative w-full h-full flex items-end justify-center">
          {shadow}
          {badge}
          <div className="relative w-12 h-10 bg-gradient-to-b from-orange-700 to-orange-900 rounded-sm shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-orange-600" />
            <div className="absolute top-3 left-2 right-2 h-4 bg-orange-950/30 rounded-sm border border-orange-500/20" />
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-3 h-4 bg-orange-950/40 rounded-sm" />
          </div>
        </div>
      );

    default:
      return (
        <div className="relative w-full h-full flex items-end justify-center">
          {shadow}
          {badge}
          <div className="w-10 h-10 bg-slate-600 rounded shadow-xl" />
        </div>
      );
  }
}

function ActionButton({
  href,
  label,
  disabled,
}: {
  href: string;
  label: string;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div className="bg-slate-800/50 p-4 rounded-lg text-center text-gray-500 cursor-not-allowed">
        {label}
        <span className="block text-xs mt-1">(Próximamente)</span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="bg-slate-800 hover:bg-slate-700 p-4 rounded-lg text-center transition"
    >
      {label}
    </Link>
  );
}
