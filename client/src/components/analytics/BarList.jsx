import { useState } from 'react';

const DEFAULT_COLORS = ['#0ea5e9', '#f97316', '#166534', '#0d9488', '#7c3aed', '#dc2626'];

export default function BarList({ data, colorMap = {}, unitLabel = 'records' }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data.length) {
    return null;
  }

  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  const maxValue = Math.max(1, ...data.map((entry) => entry.value));

  return (
    <div className="space-y-3" onMouseLeave={() => setHoveredIndex(null)}>
      {data.map((entry, index) => {
        const color = entry.color || colorMap[entry.label] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
        const share = total ? Math.round((entry.value / total) * 100) : 0;

        return (
          <div key={entry.label} className="relative" onMouseEnter={() => setHoveredIndex(index)}>
            <div className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-sm font-semibold text-ink sm:w-36" title={entry.label}>
                {entry.label}
              </span>
              <div className="h-6 flex-1 overflow-hidden rounded-full bg-mist">
                <div
                  className="h-full rounded-full transition-opacity duration-150"
                  style={{
                    width: `${(entry.value / maxValue) * 100}%`,
                    background: color,
                    opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.45,
                  }}
                />
              </div>
              <span className="w-12 text-right text-sm font-bold tabular-nums text-ink">{entry.value}</span>
              <span className="w-11 text-right text-xs font-semibold tabular-nums text-slate-400">{share}%</span>
            </div>
            {hoveredIndex === index ? (
              <div className="pointer-events-none absolute -top-1 left-0 z-20 -translate-y-full whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-lg">
                {entry.label}: {entry.value} {unitLabel} ({share}% of {total})
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
