import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, GeoJSON, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Link } from 'react-router-dom';
import { bangladeshDistricts } from '../../data/bangladeshDistricts';
import { getMapData } from '../../services/incidentService';
import { searchLocations } from '../../services/locationSearchService';

const BANGLADESH_CENTER = [23.7, 90.4];
const BANGLADESH_BOUNDS = L.latLngBounds([20.5, 88.0], [26.7, 92.7]);

const SEVERITY_COLORS = {
  low: '#16a34a',
  medium: '#eab308',
  high: '#f97316',
  critical: '#dc2626',
};

const SEVERITY_ORDER = { low: 1, medium: 2, high: 3, critical: 4 };

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'resolved', label: 'Resolved' },
];

const SEVERITY_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'high', label: 'High+' },
  { value: 'critical', label: 'Critical' },
];

const makeMarkerIcon = (severity, status) => {
  const color = SEVERITY_COLORS[severity] ?? SEVERITY_COLORS.medium;
  const isPending = status === 'pending';
  const pulseClass = isPending ? 'animate-pulse opacity-90' : '';

  return L.divIcon({
    className: 'incident-marker-wrapper',
    html: `<span class="incident-marker ${pulseClass}" style="--marker-color:${color}"><span class="incident-marker-dot"></span></span>`,
    iconSize: [34, 44],
    iconAnchor: [17, 42],
    popupAnchor: [0, -38],
  });
};

const clusterIcon = (cluster) => {
  const markers = cluster.getAllChildMarkers();
  const highestSeverity = markers.reduce((highest, marker) => {
    const sev = marker.options.disasterSeverity ?? 'medium';
    return (SEVERITY_ORDER[sev] ?? 1) > (SEVERITY_ORDER[highest] ?? 1) ? sev : highest;
  }, 'medium');
  const color = SEVERITY_COLORS[highestSeverity] ?? SEVERITY_COLORS.medium;

  return L.divIcon({
    className: 'incident-cluster-wrapper',
    html: `<span class="incident-cluster" style="--cluster-color:${color}">${markers.length}</span>`,
    iconSize: L.point(48, 48),
  });
};

function MapFlyController({ flyTarget }) {
  const map = useMap();
  useEffect(() => {
    if (flyTarget?.center) {
      map.flyTo(flyTarget.center, flyTarget.zoom || 11, { duration: 0.8 });
    }
  }, [flyTarget, map]);
  return null;
}

function DistrictLayer({ districts, districtData, selectedDistrictName }) {
  const getDistrictSeverity = useCallback(
    (districtName) => {
      const found = districtData.find(
        (d) => d.name.toLowerCase() === districtName.toLowerCase(),
      );
      return found?.severity ?? null;
    },
    [districtData],
  );

  const getDistrictStyle = useCallback(
    (feature) => {
      const name = feature.properties.name;
      const isSelected = selectedDistrictName && selectedDistrictName.toLowerCase() === name.toLowerCase();
      const severity = getDistrictSeverity(name);

      if (isSelected) {
        return {
          fillColor: severity ? SEVERITY_COLORS[severity] : '#0284c7',
          fillOpacity: 0.55,
          color: '#0284c7',
          weight: 3,
          opacity: 1,
        };
      }

      if (!severity) {
        return {
          fillColor: '#cbd5e1',
          fillOpacity: 0.08,
          color: '#94a3b8',
          weight: 1,
          opacity: 0.6,
        };
      }

      return {
        fillColor: SEVERITY_COLORS[severity],
        fillOpacity: 0.42,
        color: SEVERITY_COLORS[severity],
        weight: 1.8,
        opacity: 0.9,
      };
    },
    [getDistrictSeverity, selectedDistrictName],
  );

  const onEachFeature = useCallback(
    (feature, layer) => {
      const name = feature.properties.name;
      const districtInfo = districtData.find(
        (d) => d.name.toLowerCase() === name.toLowerCase(),
      );

      const severityLabel = districtInfo
        ? districtInfo.severity.charAt(0).toUpperCase() + districtInfo.severity.slice(1)
        : 'Safe / Normal';
      const severityColor = districtInfo
        ? SEVERITY_COLORS[districtInfo.severity] ?? '#94a3b8'
        : '#94a3b8';

      layer.bindPopup(
        `
        <div style="min-width:160px;font-family:inherit">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${severityColor}"></span>
            <strong style="font-size:13px;color:#0f172a">${name} District</strong>
          </div>
          <div style="font-size:11px;color:#64748b;line-height:1.6">
            Public Severity: <span style="color:${severityColor};font-weight:700">${severityLabel}</span><br/>
            ${districtInfo ? `Verified Incidents: ${districtInfo.incident_count || 0}<br/>Verified Reports: ${districtInfo.verified_report_count || 0}` : 'No verified active disasters'}
          </div>
        </div>
      `,
        { className: 'district-popup' },
      );
    },
    [districtData],
  );

  const dynamicKey = useMemo(() => {
    const listKey = districtData.map((d) => `${d.name}:${d.severity}`).join('|');
    return `${listKey}|sel:${selectedDistrictName || 'none'}`;
  }, [districtData, selectedDistrictName]);

  return (
    <GeoJSON
      key={dynamicKey}
      data={districts}
      style={getDistrictStyle}
      onEachFeature={onEachFeature}
    />
  );
}

function SeverityBadge({ severity }) {
  const color = SEVERITY_COLORS[severity] ?? SEVERITY_COLORS.medium;
  return (
    <span
      className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm"
      style={{ backgroundColor: color }}
    >
      {severity}
    </span>
  );
}

export default function HomeMap() {
  const [districtData, setDistrictData] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedDistrictName, setSelectedDistrictName] = useState('');
  const [flyTarget, setFlyTarget] = useState(null);

  const filterRef = useRef(null);
  const searchRef = useRef(null);
  const intervalRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const filters = {};
      if (severityFilter) filters.severity = severityFilter;
      if (statusFilter) filters.status = statusFilter;

      const data = await getMapData(filters);
      setDistrictData(data?.districts ?? []);
      setMarkers(data?.markers ?? []);
      setLastUpdated(Date.now());
      setError('');
    } catch {
      setError('Unable to load latest map data.');
    } finally {
      setLoading(false);
    }
  }, [severityFilter, statusFilter]);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 15000); // 15-second refresh interval
    return () => clearInterval(intervalRef.current);
  }, [fetchData]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    setSearchLoading(true);
    setSearchOpen(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchLocations(val);
        setSearchResults(results);
      } finally {
        setSearchLoading(false);
      }
    }, 280);
  };

  const handleSelectSearchResult = (result) => {
    setSearchQuery(result.name);
    setSearchOpen(false);
    setFlyTarget({ center: [result.latitude, result.longitude], zoom: result.type === 'district' ? 10 : 13 });

    if (result.districtName) {
      setSelectedDistrictName(result.districtName);
    } else if (result.type === 'district') {
      setSelectedDistrictName(result.name);
    }
  };

  const timeSinceUpdate = useMemo(() => {
    if (!lastUpdated) return '';
    const seconds = Math.floor((Date.now() - lastUpdated) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  }, [lastUpdated]);

  const hasActiveFilters = severityFilter || statusFilter;

  return (
    <section className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
      <div className="relative" style={{ height: 'clamp(380px, 55vh, 540px)' }}>
        {loading ? (
          <div className="absolute inset-0 z-[850] grid place-items-center bg-white/60 backdrop-blur-sm">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-lg">
              Loading interactive map…
            </div>
          </div>
        ) : null}

        <MapContainer
          center={BANGLADESH_CENTER}
          zoom={7}
          minZoom={6}
          maxZoom={18}
          scrollWheelZoom
          maxBounds={BANGLADESH_BOUNDS.pad(0.3)}
          maxBoundsViscosity={0.8}
          className="h-full w-full"
          preferCanvas
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          <MapFlyController flyTarget={flyTarget} />

          <DistrictLayer
            districts={bangladeshDistricts}
            districtData={districtData}
            selectedDistrictName={selectedDistrictName}
          />

          <MarkerClusterGroup
            chunkedLoading
            showCoverageOnHover={false}
            spiderfyOnMaxZoom
            iconCreateFunction={clusterIcon}
          >
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                position={[marker.latitude, marker.longitude]}
                icon={makeMarkerIcon(marker.severity, marker.status)}
                disasterSeverity={marker.severity}
              >
                <Popup minWidth={230} maxWidth={290}>
                  <div style={{ fontFamily: 'inherit' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 4 }}>
                      <SeverityBadge severity={marker.severity} />
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 4,
                          backgroundColor: marker.verification_status === 'verified' ? '#dcfce7' : '#fef3c7',
                          color: marker.verification_status === 'verified' ? '#15803d' : '#b45309',
                        }}
                      >
                        {marker.verification_status === 'verified' ? 'Verified' : 'Pending Review'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
                      {marker.title}
                    </h3>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#0ea5e9', margin: '0 0 2px' }}>
                      📍 {marker.location}
                    </p>
                    <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 6px' }}>
                      {marker.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: 6, marginTop: 6 }}>
                      <span style={{ fontSize: 10, color: '#94a3b8' }}>
                        {marker.created_at ? new Date(marker.created_at).toLocaleDateString('en-BD', { day: 'numeric', month: 'short' }) : 'Recent'}
                      </span>
                      <Link
                        to={`/incidents?report=${marker.id}`}
                        style={{ fontSize: 11, fontWeight: 700, color: '#0ea5e9', textDecoration: 'none' }}
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>

        {/* Top-left: Report button + live indicator */}
        <div className="pointer-events-none absolute left-3 top-3 z-[800] flex max-w-[calc(100%-3.5rem)] flex-col gap-2 sm:left-4 sm:top-4">
          <Link
            to="/incidents/new"
            className="pointer-events-auto inline-flex w-fit items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-sky-700 sm:px-3.5 sm:py-2.5 sm:text-sm"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            Report an Incident
          </Link>

          {lastUpdated && !error ? (
            <div className="pointer-events-auto inline-flex w-fit items-center gap-1.5 rounded-md border border-white/70 bg-white/90 px-2 py-1 text-[10px] font-bold text-slate-500 shadow backdrop-blur">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE · {timeSinceUpdate}
            </div>
          ) : null}
        </div>

        {/* Top-center / search bar */}
        <div className="pointer-events-auto absolute left-1/2 top-3 z-[800] w-64 -translate-x-1/2 sm:top-4 sm:w-72 md:w-80" ref={searchRef}>
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
              <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.trim() && setSearchOpen(true)}
              placeholder="Search location (Khilgaon, Mirpur...)"
              className="w-full rounded-xl border border-slate-200 bg-white/95 py-2 pl-9 pr-8 text-xs font-semibold text-slate-800 shadow-lg outline-none backdrop-blur transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 sm:py-2.5 sm:text-sm"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSearchResults([]); setSearchOpen(false); setSelectedDistrictName(''); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </button>
            ) : null}
          </div>

          {searchOpen ? (
            <div className="absolute left-0 right-0 top-full mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-2xl">
              {searchLoading ? (
                <div className="p-3 text-center text-xs font-semibold text-slate-500">Searching…</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((res) => (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => handleSelectSearchResult(res)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition hover:bg-sky-50"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-sky-600">
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-slate-900">{res.name}</p>
                      <p className="truncate text-[10px] text-slate-400">{res.displayName}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-500">No locations found</div>
              )}
            </div>
          ) : null}
        </div>

        {/* Top-right: Filter */}
        <div className="pointer-events-auto absolute right-3 top-3 z-[800] sm:right-4 sm:top-4" ref={filterRef}>
          <button
            type="button"
            onClick={() => setFilterOpen(!filterOpen)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold shadow-lg backdrop-blur transition sm:px-3.5 sm:py-2.5 sm:text-sm ${
              hasActiveFilters
                ? 'border-sky-300 bg-sky-50/95 text-sky-700'
                : 'border-white/70 bg-white/90 text-slate-700 hover:bg-white'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-3.5 w-3.5 sm:h-4 sm:w-4">
              <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M10 14v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Filter
            {hasActiveFilters ? (
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-sky-600 text-[9px] font-extrabold text-white sm:h-5 sm:w-5 sm:text-[10px]">
                {[severityFilter, statusFilter].filter(Boolean).length}
              </span>
            ) : null}
          </button>

          {filterOpen ? (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-2xl sm:w-60 sm:p-4">
              <div className="mb-2.5">
                <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Severity</p>
                <div className="flex flex-wrap gap-1">
                  {SEVERITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSeverityFilter(opt.value)}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition ${
                        severityFilter === opt.value
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-2.5">
                <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Incident Status</p>
                <div className="flex flex-wrap gap-1">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStatusFilter(opt.value)}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition ${
                        statusFilter === opt.value
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setSeverityFilter('');
                    setStatusFilter('');
                  }}
                  className="w-full rounded-md bg-slate-100 py-1.5 text-[11px] font-extrabold text-slate-600 transition hover:bg-slate-200"
                >
                  Clear all
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* Compact legend bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 px-3 py-2 sm:px-4 sm:py-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">District Severity</span>
        {Object.entries(SEVERITY_COLORS).map(([level, color]) => (
          <span key={level} className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </span>
        ))}
      </div>
    </section>
  );
}
