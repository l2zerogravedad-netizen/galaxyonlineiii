"use client";

import type { Building } from "./game-data";
import PlaceholderBuilding from "./PlaceholderBuilding";
import { CornerMarks, LockIcon } from "./icons";

export default function StructureLibrary({
  buildings,
  onSelect,
}: {
  buildings: Building[];
  onSelect: (id: string) => void;
}) {
  // Show all non-empty buildings that are NOT built yet (level 0) - both locked and available
  const libraryItems = buildings.filter((b) => b.type !== "empty" && b.level === 0);

  return (
    <section className="relative flex h-20 shrink-0 flex-col overflow-hidden rounded-xl border border-cyan-500/20 bg-[#0a1628]/90 lg:h-24">
      <CornerMarks />
      <div className="flex items-center gap-2 border-b border-cyan-500/10 px-3 py-2">
        <h2 className="text-[10px] font-black uppercase tracking-wider text-cyan-400">ESTRUCTURAS DISPONIBLES</h2>
      </div>
      <div className="flex gap-2 overflow-x-auto p-2 lg:p-3">
        {libraryItems.map((b) => {
          const isLocked = b.status === "locked";
          return (
            <button
              key={b.id}
              onClick={() => !isLocked && onSelect(b.id)}
              disabled={isLocked}
              className={`group flex shrink-0 flex-col items-center gap-1 rounded-lg border p-2 transition ${
                isLocked
                  ? "border-slate-700/50 bg-slate-900/50 opacity-60 cursor-not-allowed"
                  : "border-cyan-500/10 bg-[#0d1b2f]/80 hover:border-cyan-400/30 hover:bg-cyan-500/5"
              }`}
            >
              <div className="relative flex h-12 w-12 items-center justify-center lg:h-14 lg:w-14">
                <PlaceholderBuilding
                  type={b.type}
                  size="md"
                  glow={isLocked ? "none" : b.glow}
                  className={`transition ${isLocked ? "opacity-40 grayscale" : "drop-shadow-[0_0_10px_rgba(0,220,255,0.4)] group-hover:drop-shadow-[0_0_16px_rgba(0,220,255,0.6)]"}`}
                />
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <LockIcon className="h-5 w-5 text-slate-500" />
                  </div>
                )}
              </div>
              <p className={`max-w-[72px] truncate text-[9px] font-bold uppercase tracking-wider ${isLocked ? "text-slate-500" : "text-slate-300"}`}>
                {b.name}
              </p>
              {isLocked && b.unlockRequirement && (
                <p className="max-w-[72px] truncate text-[8px] text-slate-600">
                  Requiere: {b.unlockRequirement.buildingType} {b.unlockRequirement.level}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
