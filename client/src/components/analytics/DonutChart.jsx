import { useRef, useState } from 'react';

const DEFAULT_COLORS = ['#0ea5e9', '#f97316', '#166534', '#0d9488', '#7c3aed', '#dc2626'];

function percentage(value, total) {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

export default function DonutChart({ data, centerLabel = 'total' }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const wrapperRef = useRef(null);

  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  if (!data.length || total === 0) {
    return null;
  }

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;
  const segments = data.map((entry, index) => {
    const length = (entry.value / total) * circumference;
    const segment = {
      ...entry,
      color: entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      length,
      offset: accumulated,
    };
    accumulated += length;

    return segment;
  });

  const handlePointer = (event, index) => {
    const bounds = wrapperRef.current?.getBoundingClientRect();
    if (!bounds) {
      return;
    }

    setActiveIndex(index);
    setTooltip({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      index,
    });
  };

  const clearPointer = () => {
    setActiveIndex(null);
    setTooltip(null);
  };

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
      <div ref={wrapperRef} className="relative shrink-0 self-center" onMouseLeave={clearPointer}>
        <svg viewBox="0 0 180 180" className="h-44 w-44" role="img" aria-label="Distribution chart">
          <circle cx="90" cy="90" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="26" />
          {segments.map((segment, index) => {
            const visibleLength = Math.max(segment.length - 2, 1);

            return (
              <circle
                key={segment.label}
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={activeIndex === index ? 32 : 26}
                strokeDasharray={`${visibleLength} ${circumference - visibleLength}`}
                strokeDashoffset={-segment.offset}
                transform="rotate(-90 90 90)"
                style={{ transition: 'stroke-width 150ms ease', cursor: 'pointer' }}
                onMouseMove={(event) => handlePointer(event, index)}
                onMouseEnter={(event) => handlePointer(event, index)}
              />
            );
          })}
          <text x="90" y="87" textAnchor="middle" className="fill-ink font-display text-[28px] font-bold">
            {total}
          </text>
          <text
            x="90"
            y="107"
            textAnchor="middle"
            className="fill-slate-400 text-[9px] font-bold uppercase"
            style={{ letterSpacing: '0.14em' }}
          >
            {centerLabel}
          </text>
        </svg>
        {tooltip ? (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-lg bg-ink px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-lg"
            style={{ left: tooltip.x, top: tooltip.y - 8 }}
          >
            {data[tooltip.index].label}: {data[tooltip.index].value} (
            {percentage(data[tooltip.index].value, total)}%)
          </div>
        ) : null}
      </div>

      <ul className="w-full min-w-0 space-y-2">
        {segments.map((segment, index) => (
          <li
            key={segment.label}
            className="flex items-center gap-2 rounded-lg px-1 py-0.5 text-sm transition-colors hover:bg-mist"
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: segment.color }} />
            <span className="min-w-0 flex-1 truncate font-semibold text-ink" title={segment.label}>
              {segment.label}
            </span>
            <span className="tabular-nums text-slate-600">{segment.value}</span>
            <span className="w-11 text-right font-bold tabular-nums text-ink">
              {percentage(segment.value, total)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
