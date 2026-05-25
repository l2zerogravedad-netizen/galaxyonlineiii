"use client";

import type { Building, ResourceKey } from "./game-data";
import { fmt } from "./game-data";
import PlaceholderBuilding from "./PlaceholderBuilding";
import { CornerMarks, ResourceIconSmall, UpArrow, StatIcon } from "./icons";

export default function BuildingDetailPanel({ building }: { building: Building }) {
  const empty = building.type === "empty";
  return (
    <section className="relative flex w-[280px] shrink-0 flex-col overflow-hidden rounded-xl border border-cyan-500/20 bg-[#0a1628]/90 lg:w-[320px]">
      <CornerMarks />
      <div className="flex items-start justify-between border-b border-cyan-500/10 px-3 py-2">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-cyan-400 lg:text-base">{building.name}</h2>
          <p className="text-xs text-slate-400">{empty ? "Espacio disponible" : `Nivel ${building.level}`}</p>
        </div>
        <button className="text-lg text-slate-500 transition hover:text-white">×</button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="relative mb-3 flex h-[140px] items-center justify-center overflow-hidden rounded-lg border border-cyan-500/10 bg-[#060d18] lg:h-[160px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,194,255,0.1),transparent_60%)]" />
          {empty ? (
            <div className="flex flex-col items-center gap-2">
              <PlaceholderBuilding type="empty" size="lg" glow="cyan" className="opacity-50" />
              <p className="text-xs text-cyan-400/40">Espacio disponible</p>
            </div>
          ) : (
            <PlaceholderBuilding
              type={building.type}
              size="lg"
              glow={building.glow}
              className="drop-shadow-[0_0_24px_rgba(0,220,255,0.6)]"
            />
          )}
        </div>

        <p className="text-xs leading-relaxed text-slate-400">{building.description}</p>

        {!empty && (
          <>
            {/* Estado del edificio */}
            <div className="mt-3">
              <h3 className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-400">ESTADO</h3>
              <div className="overflow-hidden rounded-lg border border-cyan-500/10 bg-black/20">
                <StatRow icon="health" label="Salud" value={`${fmt(building.health)} / ${fmt(building.maxHealth)}`} />
                <StatRow icon="level" label="Nivel" value={`${building.level} / ${building.maxLevel}`} />
                {building.consumption?.energy && (
                  <StatRow icon="energy" label="Consumo" value={`-${building.consumption.energy}/h`} />
                )}
              </div>
            </div>

            {/* Producción / Capacidad */}
            {(building.production || building.capacity) && (
              <div className="mt-3">
                <h3 className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-400">
                  {building.production ? 'PRODUCCIÓN' : 'CAPACIDAD'}
                </h3>
                <div className="overflow-hidden rounded-lg border border-cyan-500/10 bg-black/20">
                  {building.production?.metal && (
                    <StatRow icon="production" label="Metal" value={`+${building.production.metal}/h`} positive />
                  )}
                  {building.production?.plasma && (
                    <StatRow icon="production" label="Plasma" value={`+${building.production.plasma}/h`} positive />
                  )}
                  {building.production?.energy && (
                    <StatRow icon="production" label="Energía" value={`+${building.production.energy}/h`} positive />
                  )}
                  {building.production?.credits && (
                    <StatRow icon="production" label="Créditos" value={`+${building.production.credits}/h`} positive />
                  )}
                  {building.capacity?.metal && (
                    <StatRow icon="capacity" label="Cap. Metal" value={`+${fmt(building.capacity.metal)}`} />
                  )}
                  {building.capacity?.plasma && (
                    <StatRow icon="capacity" label="Cap. Plasma" value={`+${fmt(building.capacity.plasma)}`} />
                  )}
                </div>
              </div>
            )}

            {/* Costo de mejora */}
            {building.level < building.maxLevel && (
              <div className="mt-3 rounded-lg border border-cyan-500/15 bg-cyan-500/5 p-3">
                <h3 className="mb-2 text-[10px] font-black uppercase tracking-wider text-cyan-400">MEJORAR AL NIVEL {building.level + 1}</h3>
                <div className="grid grid-cols-3 gap-1.5">
                  <CostBox icon="metal" value={building.upgradeCost?.metal || 0} />
                  <CostBox icon="plasma" value={building.upgradeCost?.plasma || 0} />
                  <CostBox icon="credits" value={building.upgradeCost?.credits || 0} />
                </div>
                <button className="mt-2 flex h-10 w-full items-center justify-center gap-1 rounded-lg border border-cyan-400/30 bg-cyan-500/15 text-sm font-black uppercase tracking-wider text-cyan-300 shadow-[0_0_15px_rgba(0,200,255,0.2)] transition hover:bg-cyan-500/25">
                  <UpArrow /> MEJORAR
                </button>
              </div>
            )}

            {/* Máximo nivel alcanzado */}
            {building.level >= building.maxLevel && (
              <div className="mt-3 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 text-center">
                <span className="text-xs font-bold text-yellow-400">✦ NIVEL MÁXIMO ALCANZADO ✦</span>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function StatRow({ icon, label, value, positive }: { icon: string; label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-cyan-500/5 px-3 py-2 last:border-b-0">
      <div className="flex items-center gap-2">
        <StatIcon type={icon} />
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <span className={`text-xs font-bold ${positive ? "text-emerald-400" : "text-slate-200"}`}>{value}</span>
    </div>
  );
}

function CostBox({ icon, value }: { icon: ResourceKey; value: number }) {
  return (
    <div className="flex h-8 items-center justify-center gap-1.5 rounded border border-cyan-500/10 bg-black/30 text-[10px] font-black lg:text-xs">
      <ResourceIconSmall type={icon} />
      {fmt(value)}
    </div>
  );
}
