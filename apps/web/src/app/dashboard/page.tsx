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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    axios
      .get('/api/empire', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        setEmpire(response.data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        router.push('/');
      });
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
            amount={metal?.amount || 0}
            capacity={metal?.capacity || 0}
            production={metal?.productionPerHour || 0}
            color="text-gray-400"
          />
          <ResourceCard
            name="Plasma"
            amount={plasma?.amount || 0}
            capacity={plasma?.capacity || 0}
            production={plasma?.productionPerHour || 0}
            color="text-purple-400"
          />
          <ResourceCard
            name="Créditos"
            amount={credits?.amount || 0}
            capacity={credits?.capacity || 0}
            production={0}
            color="text-yellow-400"
          />
        </div>

        {/* Planet View */}
        <div className="bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">{mainPlanet.name}</h2>
          
          {/* Building Grid */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
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

        {/* Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ActionButton href="#" label="Astillero" disabled />
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
  amount,
  capacity,
  production,
  color,
}: {
  name: string;
  amount: number;
  capacity: number;
  production: number;
  color: string;
}) {
  const percentage = Math.min((amount / capacity) * 100, 100);
  
  return (
    <div className="bg-slate-800 p-4 rounded-lg">
      <h3 className={`text-sm font-medium ${color}`}>{name}</h3>
      <p className="text-2xl font-bold mt-1">
        {Math.floor(amount).toLocaleString()}
      </p>
      <p className="text-xs text-gray-500">
        / {capacity.toLocaleString()}
      </p>
      {production > 0 && (
        <p className="text-xs text-green-400 mt-1">
          +{production}/h
        </p>
      )}
      <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-current transition-all"
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
  const getBuildingName = (type: string) => {
    const names: Record<string, string> = {
      COMMAND_CENTER: 'Centro de Comando',
      METAL_MINE: 'Mina de Metal',
      PLASMA_EXTRACTOR: 'Extractor de Plasma',
      SHIPYARD: 'Astillero',
      RESEARCH_LAB: 'Laboratorio',
      ACADEMY: 'Academia',
      WAREHOUSE: 'Almacén',
    };
    return names[type] || type;
  };

  if (!building) {
    return (
      <Link
        href={`/planet/${planetId}/build?slot=${index}`}
        className="aspect-square bg-slate-700/50 hover:bg-slate-700 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-600 transition"
      >
        <span className="text-2xl text-slate-500">+</span>
      </Link>
    );
  }

  const isConstructing = building.status === 'CONSTRUCTING' || building.status === 'UPGRADING';
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!isConstructing || !building.constructionEndsAt) return;

    const updateTimeLeft = () => {
      const end = new Date(building.constructionEndsAt!).getTime();
      const now = Date.now();
      const diff = Math.max(0, end - now);
      
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}m ${secs}s`);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [isConstructing, building.constructionEndsAt]);

  return (
    <Link
      href={isConstructing ? '#' : `/planet/${planetId}/build?slot=${index}`}
      className={`aspect-square bg-slate-700 rounded-lg p-3 flex flex-col justify-between border-2 transition ${
        isConstructing ? 'border-yellow-500 cursor-default' : 'border-slate-600 hover:bg-slate-600'
      }`}
    >
      <div>
        <p className="text-xs font-medium text-gray-300">
          {getBuildingName(building.type)}
        </p>
        <p className="text-lg font-bold">Nv. {building.level}</p>
      </div>
      {isConstructing ? (
        <div className="text-xs text-yellow-400">
          <p className="font-medium">En construcción...</p>
          <p>{timeLeft}</p>
        </div>
      ) : (
        <p className="text-xs text-gray-500">Click para mejorar</p>
      )}
    </Link>
  );
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
