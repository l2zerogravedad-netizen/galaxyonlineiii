"use client";

import type { Building } from "./game-data";
import PlaceholderBuilding from "./PlaceholderBuilding";

export default function BuildingCard({
  building,
  selected,
  onClick,
}: {
  building: Building;
  selected: boolean;
  onClick: () => void;
}) {
  const empty = building.type === "empty";
  return (
    <button
      onClick={onClick}
      className={[
        "group relative flex flex-col items-center overflow-hidden rounded-lg border p-2 transition lg:p-3",
        selected
          ? "border-cyan-400/50 bg-cyan-500/10 shadow-[0_0_20px_rgba(0,200,255,0.25),inset_0_0_20px_rgba(0,200,255,0.05)]"
          : "border-cyan-500/10 bg-[#0d1b2f]/80 hover:border-cyan-400/30 hover:bg-cyan-500/5",
      ].join(" ")}
    >
      {!empty && (
        <div className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full border border-yellow-400/60 bg-yellow-500 text-[10px] font-black text-black shadow-[0_0_8px_rgba(255,200,50,0.6)]">
          {building.level}
        </div>
      )}
      <div className="mb-1 text-center">
        <p className="text-[9px] font-bold uppercase leading-tight tracking-wider text-slate-300 lg:text-[10px]">{empty ? "" : building.name}</p>
        {!empty && <p className="text-[9px] text-cyan-400/70">Nivel {building.level}</p>}
      </div>
      <div className="relative flex h-[60px] w-full items-center justify-center lg:h-[80px]">
        {empty ? (
          <div className="flex flex-col items-center gap-1">
            <PlaceholderBuilding type="empty" size="md" glow="cyan" className="opacity-60" />
            <p className="text-[9px] font-bold uppercase tracking-wider text-cyan-400/50">CONSTRUIR</p>
          </div>
        ) : (
          <PlaceholderBuilding
            type={building.type}
            size="md"
            glow={building.glow}
            className="drop-shadow-[0_0_16px_rgba(0,220,255,0.5)] transition-all duration-300 group-hover:drop-shadow-[0_0_24px_rgba(0,220,255,0.8)] group-hover:scale-105"
          />
        )}
      </div>
    </button>
  );
}
