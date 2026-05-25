'use client';

/** Formación táctica GO II — grilla 9×9. */
const SIZE = 9;

export function Go2FleetFormation({
  occupied = new Set<number>(),
  onCellClick,
}: {
  occupied?: Set<number>;
  onCellClick?: (index: number) => void;
}) {
  return (
    <div
      className="inline-grid gap-0.5 rounded border-2 border-amber-700/50 bg-slate-950/90 p-2"
      style={{
        gridTemplateColumns: `repeat(${SIZE}, 28px)`,
      }}
    >
      {Array.from({ length: SIZE * SIZE }, (_, i) => {
        const filled = occupied.has(i);
        return (
          <button
            key={i}
            type="button"
            className={[
              'h-7 w-7 rounded-sm border text-[8px] font-bold',
              filled
                ? 'border-cyan-400/60 bg-cyan-900/60 text-cyan-200'
                : 'border-stone-700 bg-stone-900/50 text-stone-600 hover:border-amber-500/50',
            ].join(' ')}
            onClick={() => onCellClick?.(i)}
          >
            {filled ? '●' : ''}
          </button>
        );
      })}
    </div>
  );
}
