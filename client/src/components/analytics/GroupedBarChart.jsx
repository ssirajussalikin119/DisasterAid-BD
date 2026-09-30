import { useState } from 'react';

function niceScale(maxValue) {
  const step = Math.max(1, Math.ceil(maxValue / 4));
  return { step, max: step * 4 };
}

export default function GroupedBarChart({ categories, series }) {
  const [hover, setHover] = useState(null);

  if (!categories.length || !series.length) {
    return null;
  }

  const rawMax = Math.max(
    1,
    ...categories.flatMap((category) => series.map((entry) => Number(category.values[entry.key]) || 0)),
  );
  const { max, step } = niceScale(rawMax);
  const ticks = [0, 1, 2, 3, 4].map((index) => index * step);

  return (
    <div onMouseLeave={() => setHover(null)}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {series.map((entry) => (
          <span key={entry.key} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: entry.color }} />
            {entry.label}
          </span>
        ))}
      </div>

      <div className="mt-3 flex h-7 items-center">
        {hover ? (
          <span className="rounded-full bg-ink px-3 py-1 text-[11px] font-semibold text-white">
            {hover.category} · {hover.series}: {hover.value}
          </span>
        ) : (
          <span className="text-[11px] font-medium text-slate-400">Hover a bar for exact values</span>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[420px]">
          <div className="relative h-56 pl-9">
            {ticks.map((tick) => (
              <div
                key={tick}
                className={`absolute left-9 right-0 border-t ${tick === 0 ? 'border-slate-300' : 'border-dashed border-slate-200'}`}
                style={{ bottom: `${(tick / max) * 100}%` }}
              >
                <span className="absolute -left-9 top-0 w-7 -translate-y-1/2 text-right text-[10px] font-semibold text-slate-400">
                  {tick}
                </span>
              </div>
            ))}
            <div className="absolute bottom-0 left-9 right-0 top-0 flex items-end">
              {categories.map((category) => (
                <div key={category.label} className="flex h-full flex-1 items-end justify-center gap-0.5 px-0.5">
                  {series.map((entry) => {
                    const value = Number(category.values[entry.key]) || 0;
                    const isHovered = hover?.category === category.label && hover?.seriesKey === entry.key;
                    return (
                      <div
                        key={entry.key}
                        aria-label={`${category.label} ${entry.label}: ${value}`}
                        className="relative flex h-full flex-1 items-end"
                        onMouseEnter={() =>
                          setHover({ category: category.label, series: entry.label, seriesKey: entry.key, value })
                        }
                      >
                        <div
                          className="w-full rounded-t-sm transition-opacity duration-150"
                          style={{
                            height: `${Math.min(100, (value / max) * 100)}%`,
                            minHeight: 2,
                            background: entry.color,
                            opacity: hover && !isHovered ? 0.45 : 1,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 flex pl-9">
            {categories.map((category) => (
              <div key={category.label} className="flex-1 px-1 text-center text-[11px] font-semibold text-slate-500">
                {category.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
