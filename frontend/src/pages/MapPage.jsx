import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Logo from '../components/layout/Logo';
import IncidentMap from '../components/map/IncidentMap';
import MapSidebar from '../components/map/MapSidebar';
import { getMapIncidents } from '../services/incidentService';

const toCountList = (items, key) => {
  const counts = items.reduce((result, item) => {
    const value = item[key] || 'Other';
    result.set(value, (result.get(value) ?? 0) + 1);
    return result;
  }, new Map());

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M10 14v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="m9 18-5 2V6l5-2m0 14 6 2m-6-2V4m6 16 5-2V4l-5 2m0 14V6M9 4l6 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExpandSidebarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiWarning, setApiWarning] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('reports');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedSources, setSelectedSources] = useState(new Set());

  useEffect(() => {
    let active = true;

    const loadIncidents = async () => {
      try {
        const liveIncidents = await getMapIncidents();
        if (!active) return;

        setIncidents(liveIncidents);
        setApiWarning(liveIncidents.length > 0 ? '' : 'No live reports with map coordinates are available yet.');
        setSelectedCategories(new Set(liveIncidents.map((incident) => incident.type)));
        setSelectedSources(new Set(liveIncidents.map((incident) => incident.source)));
      } catch {
        if (!active) return;

        setIncidents([]);
        setSelectedCategories(new Set());
        setSelectedSources(new Set());
        setApiWarning('Live report data is unavailable. Check that the backend is running.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadIncidents();

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => toCountList(incidents, 'type'), [incidents]);
  const sources = useMemo(() => toCountList(incidents, 'source'), [incidents]);

  const filteredIncidents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return incidents.filter((incident) => {
      const matchesSearch =
        !query ||
        [incident.title, incident.location, incident.type, incident.description, incident.source]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      const matchesCategory = selectedCategories.has(incident.type);
      const matchesSource = selectedSources.has(incident.source);

      return matchesSearch && matchesCategory && matchesSource;
    });
  }, [incidents, searchTerm, selectedCategories, selectedSources]);

  const focusedIncident = useMemo(() => {
    const incidentId = searchParams.get('incident');
    if (!incidentId) return null;
    return incidents.find((incident) => String(incident.id) === incidentId) ?? null;
  }, [incidents, searchParams]);

  const toggleSetValue = (setter, value) => {
    setter((current) => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories(new Set(categories.map((category) => category.name)));
    setSelectedSources(new Set(sources.map((source) => source.name)));
  };

  const handleMarkerClick = (incident) => {
    const next = new URLSearchParams(searchParams);
    next.set('incident', incident.id);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="flex h-[100dvh] min-h-[480px] flex-col overflow-hidden bg-slate-100 text-ink">
      <header className="z-[1100] flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
        <div className="flex min-w-0 items-center gap-5">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>
          <div className="hidden h-8 w-px bg-slate-200 sm:block" />
          <div className="hidden min-w-0 sm:block">
            <p className="truncate font-display text-lg font-bold text-slate-950">Interactive Disaster Map</p>
            <p className="truncate text-xs font-semibold text-slate-500">Verified and community incident reports</p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <Link
            to="/incidents"
            className="hidden rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
          >
            Incident list
          </Link>
          <Link
            to="/"
            className="hidden rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 md:inline-flex"
          >
            Home
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
          >
            <FilterIcon />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </nav>
      </header>

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Close map filters"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 z-[900] bg-slate-950/30 backdrop-blur-[1px] lg:hidden"
          />
        ) : null}

        <MapSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          desktopOpen={desktopSidebarOpen}
          onDesktopToggle={() => setDesktopSidebarOpen((open) => !open)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          resultCount={filteredIncidents.length}
          totalCount={incidents.length}
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoryToggle={(category) => toggleSetValue(setSelectedCategories, category)}
          sources={sources}
          selectedSources={selectedSources}
          onSourceToggle={(source) => toggleSetValue(setSelectedSources, source)}
          onClear={clearFilters}
        />

        <main className="relative min-w-0 flex-1 bg-sky-50">
          {!desktopSidebarOpen ? (
            <button
              type="button"
              onClick={() => setDesktopSidebarOpen(true)}
              aria-label="Expand map sidebar"
              title="Expand sidebar"
              className="absolute left-4 top-4 z-[820] hidden h-11 w-11 items-center justify-center rounded-xl border border-white/80 bg-white/95 text-slate-700 shadow-lg backdrop-blur transition hover:bg-white hover:text-slate-950 lg:inline-flex"
            >
              <ExpandSidebarIcon />
            </button>
          ) : null}

          <IncidentMap
            incidents={filteredIncidents}
            focusedIncident={focusedIncident}
            onMarkerClick={handleMarkerClick}
          />

          <div
            className={`pointer-events-none absolute left-4 top-4 z-[800] flex max-w-[calc(100%-2rem)] flex-col gap-2 lg:top-5 ${
              desktopSidebarOpen ? 'lg:left-5' : 'lg:left-20'
            }`}
          >
            <div className="pointer-events-auto inline-flex w-fit items-center gap-2 rounded-xl border border-white/80 bg-white/95 px-3.5 py-2.5 text-sm font-extrabold text-slate-800 shadow-lg backdrop-blur">
              <MapIcon />
              {filteredIncidents.length} report{filteredIncidents.length === 1 ? '' : 's'} visible
            </div>
            {apiWarning ? (
              <div className="pointer-events-auto max-w-sm rounded-xl border border-amber-200 bg-amber-50/95 px-3.5 py-2.5 text-xs font-semibold leading-5 text-amber-900 shadow-lg backdrop-blur">
                {apiWarning}
              </div>
            ) : null}
          </div>

          {loading ? (
            <div className="absolute inset-0 z-[850] grid place-items-center bg-white/55 backdrop-blur-sm">
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-extrabold text-slate-700 shadow-xl">
                Loading incident map…
              </div>
            </div>
          ) : null}

          {!loading && filteredIncidents.length === 0 ? (
            <div className="pointer-events-none absolute inset-x-4 bottom-5 z-[800] flex justify-center">
              <div className="pointer-events-auto max-w-sm rounded-2xl border border-slate-200 bg-white/95 px-5 py-4 text-center shadow-xl backdrop-blur">
                <p className="font-display text-base font-bold text-slate-950">No reports match these filters</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-2 text-sm font-extrabold text-sky-600 hover:text-sky-700"
                >
                  Show all reports
                </button>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
