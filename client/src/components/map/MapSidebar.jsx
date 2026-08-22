import { severityColors } from '../../data/incidents';

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="m21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CollapseIcon({ collapsed = false }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d={collapsed ? 'm9 6 6 6-6 6' : 'm15 6-6 6 6 6'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckboxRow({ label, count, checked, onChange, color }) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
      />
      {color ? (
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      ) : null}
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700 group-hover:text-slate-900">
        {label}
      </span>
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-extrabold text-slate-500">
        {count}
      </span>
    </label>
  );
}

export default function MapSidebar({
  isOpen,
  onClose,
  desktopOpen,
  onDesktopToggle,
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  resultCount,
  totalCount,
  categories,
  selectedCategories,
  onCategoryToggle,
  sources,
  selectedSources,
  onSourceToggle,
  onClear,
}) {
  const hasFilters =
    searchTerm ||
    selectedCategories.size !== categories.length ||
    selectedSources.size !== sources.length;

  return (
    <aside
      className={`absolute inset-y-0 left-0 z-[1000] flex w-[88vw] max-w-[370px] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        desktopOpen
          ? 'lg:relative lg:z-10 lg:w-[370px] lg:shrink-0 lg:translate-x-0 lg:shadow-none'
          : 'lg:absolute lg:z-20 lg:w-[370px] lg:-translate-x-full lg:shadow-xl'
      }`}
    >
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-600">
              Live response map
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-slate-950">
              Disaster Map
            </h1>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 lg:hidden"
            aria-label="Close map filters"
          >
            <CloseIcon />
          </button>
          <button
            type="button"
            onClick={onDesktopToggle}
            className="hidden rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 lg:inline-flex"
            aria-label="Collapse map sidebar"
            title="Collapse sidebar"
          >
            <CollapseIcon />
          </button>
        </div>

        <label className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-slate-500 transition focus-within:border-sky-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-sky-100">
          <SearchIcon />
          <input
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            type="search"
            placeholder="Search reports or locations"
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400"
          />
        </label>
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <p className="text-sm font-extrabold text-slate-950">
            Results: {resultCount}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{totalCount} reports loaded</p>
        </div>
        {hasFilters ? (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-extrabold text-sky-600 transition hover:text-sky-700"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      <div className="flex border-b border-slate-200 px-5">
        {['reports', 'source'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`relative flex-1 px-2 py-3.5 text-sm font-extrabold capitalize transition ${
              activeTab === tab ? 'text-slate-950' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab}
            {activeTab === tab ? (
              <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-amber-400" />
            ) : null}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        {activeTab === 'reports' ? (
          <div>
            <div className="px-3 pb-2 pt-1">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                Disaster category
              </p>
            </div>
            {categories.map((category) => (
              <CheckboxRow
                key={category.name}
                label={category.name}
                count={category.count}
                checked={selectedCategories.has(category.name)}
                onChange={() => onCategoryToggle(category.name)}
              />
            ))}

            <div className="mx-3 my-4 border-t border-slate-100" />
            <div className="px-3 pb-2">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                Severity guide
              </p>
            </div>
            {Object.entries(severityColors).map(([severity, color]) => (
              <div key={severity} className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                {severity}
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="px-3 pb-2 pt-1">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                Report source
              </p>
            </div>
            {sources.map((source) => (
              <CheckboxRow
                key={source.name}
                label={source.name}
                count={source.count}
                checked={selectedSources.has(source.name)}
                onChange={() => onSourceToggle(source.name)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 bg-slate-50/80 px-5 py-4">
        <p className="text-xs leading-5 text-slate-500">
          Marker color shows the highest reported severity. Cluster numbers show reports grouped in the same area.
        </p>
      </div>
    </aside>
  );
}
