import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, GeoJSON, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Link } from 'react-router-dom';
import {
  findAreaByPoint,
  getAreaBounds,
  getDistrictFeatures,
  getUpazilaFeatures,
  listDistricts,
  listUpazilas,
  loadAreas,
} from '../../lib/geo';
import { searchLocations } from '../../services/locationSearchService';
import { getMapData } from '../../services/incidentService';
import {
  BANGLADESH_BOUNDS,
  BANGLADESH_CENTER,
  BASEMAPS,
  canonicalDistrictName,
  normalizeSeverityKey,
  SEVERITY_COLORS,
  severityTitle,
} from './mapTheme';

const pinIcon = L.divIcon({
  className: 'incident-marker-wrapper',
  html: `<span class="incident-marker" style="--marker-color:#dc2626"><span class="incident-marker-dot"></span></span>`,
  iconSize: [34, 44],
  iconAnchor: [17, 42],
  popupAnchor: [0, -38],
});

const existingIcon = L.divIcon({
  className: 'incident-marker-wrapper',
  html: `<span style="display:block;width:12px;height:12px;border-radius:9999px;background:#0284c7;border:2px solid #fff;box-shadow:0 1px 5px rgba(15,23,42,.35)"></span>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
  popupAnchor: [0, -8],
});

const existingClusterIcon = (cluster) =>
  L.divIcon({
    className: 'incident-cluster-wrapper',
    html: `<span class="incident-cluster" style="--cluster-color:#0284c7;font-size:11px;width:34px;height:34px;">${cluster.getChildCount()}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

function MapFlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    if (target.bounds) {
      map.fitBounds(target.bounds, { padding: [30, 30], animate: true });
    } else if (target.center) {
      map.flyTo(target.center, target.zoom ?? 11, { duration: 0.8 });
    }
  }, [target, map]);
  return null;
}

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapAutoResize() {
  const map = useMap();
  useEffect(() => {
    let frame = 0;
    let observer = null;

    if (import.meta.env.DEV) {
      const rect = map.getContainer()?.getBoundingClientRect();
      // eslint-disable-next-line no-console
      console.debug('[map] mount diagnostics', {
        containerRect: rect && { width: rect.width, height: rect.height },
        clientWidth: map.getContainer()?.clientWidth,
        clientHeight: map.getContainer()?.clientHeight,
        leafletSize: map.getSize(),
      });
    }

    // Recalculate once the initial layout has settled. Leaflet measures the
    // container at creation time, which can precede flex layout resolution.
    frame = requestAnimationFrame(() => {
      map.invalidateSize();
    });

    // Recalculate whenever the container size changes afterwards (sidebar
    // toggles, responsive breakpoints, visibility changes). invalidateSize
    // never resizes the container itself, so this cannot loop.
    const container = map.getContainer();
    if (container && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        map.invalidateSize();
      });
      observer.observe(container);
    }

    return () => {
      cancelAnimationFrame(frame);
      if (observer) observer.disconnect();
    };
  }, [map]);
  return null;
}

const toFinitePoint = (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
};

export default function ReportLocationPicker({
  latitude,
  longitude,
  location,
  initialDistrictCode = '',
  initialUpazilaCode = '',
  onSelectionChange,
  // Page-specific display config. Defaults reproduce the /incidents/new form
  // map exactly; /map and Home render the same component with form chrome
  // hidden and pin editing disabled.
  showControls = true,
  interactive = true,
  mapClassName = 'h-72 w-full sm:h-96',
  fillHeight = false,
  externalFocus = null,
  onExistingMarkerClick,
}) {
  const [districts, setDistricts] = useState([]);
  const [districtFeatures, setDistrictFeatures] = useState([]);
  const [upazilaOptions, setUpazilaOptions] = useState([]);
  const [upazilaFeatures, setUpazilaFeatures] = useState([]);
  const [districtCode, setDistrictCode] = useState('');
  const [upazilaCode, setUpazilaCode] = useState('');
  const [query, setQuery] = useState(location || '');
  const [searchResults, setSearchResults] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [exactPoint, setExactPoint] = useState(() => toFinitePoint(latitude, longitude));
  const [flyTarget, setFlyTarget] = useState(null);
  const [notice, setNotice] = useState('');
  const [geoError, setGeoError] = useState('');
  const [existingMarkers, setExistingMarkers] = useState([]);
  const [districtSeverity, setDistrictSeverity] = useState([]);
  const [severityTick, setSeverityTick] = useState(0);
  const dropdownRef = useRef(null);
  const debounceTimer = useRef(null);
  const prefilledRef = useRef(false);
  const emitRef = useRef(onSelectionChange);
  emitRef.current = onSelectionChange;

  const emit = useCallback((selection) => {
    emitRef.current?.(selection);
  }, []);

  // Load real boundary data + existing incidents once.
  useEffect(() => {
    let alive = true;
    loadAreas()
      .then(async () => {
        if (!alive) return;
        const [districtList, features] = await Promise.all([listDistricts(), getDistrictFeatures()]);
        if (!alive) return;
        setDistricts(districtList);
        setDistrictFeatures(features);
      })
      .catch(() => {
        if (alive) setGeoError('Boundary data could not be loaded. You can still place a pin by coordinates.');
      });
    getMapData({})
      .then((data) => {
        if (!alive) return;
        setExistingMarkers(data?.markers ?? []);
        setDistrictSeverity(data?.districts ?? []);
        setSeverityTick(Date.now());
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const loadUpazilasFor = useCallback(async (code) => {
    if (!code) {
      setUpazilaOptions([]);
      setUpazilaFeatures([]);
      return;
    }
    try {
      const [options, features] = await Promise.all([listUpazilas(code), getUpazilaFeatures(code)]);
      setUpazilaOptions(options);
      setUpazilaFeatures(features);
    } catch {
      setUpazilaOptions([]);
      setUpazilaFeatures([]);
    }
  }, []);

  const districtNameOf = useCallback(
    (code) => districts.find((d) => d.code === code)?.name_en ?? '',
    [districts],
  );

  const upazilaNameOf = useCallback(
    (code) => upazilaOptions.find((u) => u.code === code)?.name_en ?? '',
    [upazilaOptions],
  );

  // Prefill from query params (e.g. public map "Report an incident here").
  useEffect(() => {
    if (prefilledRef.current || districts.length === 0) return;
    if (!initialDistrictCode) return;
    prefilledRef.current = true;
    const districtName = districts.find((d) => d.code === initialDistrictCode)?.name_en ?? '';
    if (!districtName) return;
    setDistrictCode(initialDistrictCode);
    loadUpazilasFor(initialDistrictCode).then(async () => {
      if (initialUpazilaCode) {
        setUpazilaCode(initialUpazilaCode);
        const bounds = await getAreaBounds(initialUpazilaCode);
        if (bounds) setFlyTarget({ bounds });
      } else {
        const bounds = await getAreaBounds(initialDistrictCode);
        if (bounds) setFlyTarget({ bounds });
      }
      emit({
        location: '',
        latitude: '',
        longitude: '',
        district_code: initialDistrictCode,
        upazila_code: initialUpazilaCode || '',
        district_name: districtName,
        upazila_name: '',
      });
    });
  }, [districts, initialDistrictCode, initialUpazilaCode, loadUpazilasFor, emit]);

  // Sync prop changes (pin moved from outside).
  useEffect(() => {
    if (location && location !== query) setQuery(location);
    const point = toFinitePoint(latitude, longitude);
    if (point) setExactPoint(point);
  }, [location, latitude, longitude]);

  // External focus request (used by embedding pages, e.g. /map deep links).
  useEffect(() => {
    if (externalFocus?.center) {
      setFlyTarget({ center: externalFocus.center, zoom: externalFocus.zoom ?? 12 });
    }
  }, [externalFocus]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!val.trim()) {
      setSearchResults([]);
      setOpenDropdown(false);
      return;
    }

    setLoadingSearch(true);
    setOpenDropdown(true);

    debounceTimer.current = setTimeout(async () => {
      try {
        const results = await searchLocations(val);
        setSearchResults(results);
      } finally {
        setLoadingSearch(false);
      }
    }, 280);
  };

  const applyPoint = useCallback(
    async (lat, lng, { movePin = true, label = '' } = {}) => {
      const roundedLat = Math.round(lat * 100000) / 100000;
      const roundedLng = Math.round(lng * 100000) / 100000;
      let areas = { district: null, upazila: null };
      try {
        areas = await findAreaByPoint(roundedLat, roundedLng);
      } catch {
        // Boundary lookup failed: keep coordinates, leave area codes empty.
      }

      if (!areas.district && !areas.upazila) {
        setNotice('That point is outside Bangladesh. Please choose a location inside the country.');
        return false;
      }

      setNotice('');
      const nextDistrictCode = areas.district?.properties?.code ?? '';
      const nextUpazilaCode = areas.upazila?.properties?.code ?? '';
      const nextDistrictName = areas.district?.properties?.name_en ?? '';
      const nextUpazilaName = areas.upazila?.properties?.name_en ?? '';

      setDistrictCode(nextDistrictCode);
      setUpazilaCode(nextUpazilaCode);
      await loadUpazilasFor(nextDistrictCode);
      if (movePin) setExactPoint([roundedLat, roundedLng]);

      const displayName =
        label || [nextUpazilaName, nextDistrictName].filter(Boolean).join(', ') || query.trim();
      setQuery(displayName);

      emit({
        location: displayName,
        latitude: roundedLat,
        longitude: roundedLng,
        district_code: nextDistrictCode,
        upazila_code: nextUpazilaCode,
        district_name: nextDistrictName,
        upazila_name: nextUpazilaName,
      });
      return true;
    },
    [loadUpazilasFor, query, emit],
  );

  const handleMapClick = useCallback(
    (lat, lng) => {
      applyPoint(lat, lng);
    },
    [applyPoint],
  );

  const handlePinDragEnd = useCallback(
    (event) => {
      const marker = event.target;
      const position = marker.getLatLng();
      applyPoint(position.lat, position.lng);
    },
    [applyPoint],
  );

  const handleSelectDistrict = useCallback(
    async (code) => {
      setDistrictCode(code);
      setUpazilaCode('');
      await loadUpazilasFor(code);
      const name = districts.find((d) => d.code === code)?.name_en ?? '';
      if (code) {
        const bounds = await getAreaBounds(code);
        if (bounds) setFlyTarget({ bounds });
      }
      if (!query.trim() && name) setQuery(name);
      emit({
        location: query.trim() || name,
        latitude: exactPoint?.[0] ?? '',
        longitude: exactPoint?.[1] ?? '',
        district_code: code,
        upazila_code: '',
        district_name: name,
        upazila_name: '',
      });
    },
    [districts, loadUpazilasFor, query, exactPoint, emit],
  );

  const handleSelectUpazila = useCallback(
    async (code) => {
      setUpazilaCode(code);
      const upazila = upazilaOptions.find((u) => u.code === code);
      const name = upazila?.name_en ?? '';
      if (code) {
        const bounds = await getAreaBounds(code);
        if (bounds) setFlyTarget({ bounds });
      }
      const districtName = districtNameOf(districtCode);
      const displayName = [name, districtName].filter(Boolean).join(', ');
      if (displayName && (!query.trim() || query.trim() === districtName)) setQuery(displayName);
      emit({
        location: query.trim() || displayName,
        latitude: exactPoint?.[0] ?? '',
        longitude: exactPoint?.[1] ?? '',
        district_code: districtCode,
        upazila_code: code,
        district_name: districtName,
        upazila_name: name,
      });
    },
    [upazilaOptions, districtCode, districtNameOf, query, exactPoint, emit],
  );

  const handleSelectSearchResult = useCallback(
    async (result) => {
      setOpenDropdown(false);
      setFlyTarget({ center: [result.latitude, result.longitude], zoom: result.type === 'district' ? 10 : 13 });
      // Best-effort area mapping from the search result; pin + coordinates always apply.
      const matchedDistrict = districts.find(
        (d) =>
          d.name_en.toLowerCase() === String(result.districtName ?? '').toLowerCase() ||
          d.name_en.toLowerCase() === String(result.name ?? '').toLowerCase(),
      );
      let matchedUpazila = null;
      if (matchedDistrict) {
        setDistrictCode(matchedDistrict.code);
        const options = await listUpazilas(matchedDistrict.code).catch(() => []);
        setUpazilaOptions(options);
        const features = await getUpazilaFeatures(matchedDistrict.code).catch(() => []);
        setUpazilaFeatures(features);
        matchedUpazila = options.find(
          (u) => u.name_en.toLowerCase() === String(result.name ?? '').toLowerCase(),
        );
        if (matchedUpazila) setUpazilaCode(matchedUpazila.code);
      }
      setQuery(result.displayName);
      setExactPoint([result.latitude, result.longitude]);
      setNotice('');
      emit({
        location: result.displayName,
        latitude: result.latitude,
        longitude: result.longitude,
        district_code: matchedDistrict?.code ?? '',
        upazila_code: matchedUpazila?.code ?? '',
        district_name: matchedDistrict?.name_en ?? result.districtName ?? '',
        upazila_name: matchedUpazila?.name_en ?? '',
      });
    },
    [districts, emit],
  );

  const clearSelection = useCallback(() => {
    setQuery('');
    setExactPoint(null);
    setDistrictCode('');
    setUpazilaCode('');
    setUpazilaOptions([]);
    setUpazilaFeatures([]);
    setFlyTarget(null);
    setNotice('');
    emit({
      location: '',
      latitude: '',
      longitude: '',
      district_code: '',
      upazila_code: '',
      district_name: '',
      upazila_name: '',
    });
  }, [emit]);

  const severityByDistrict = useMemo(() => {
    const map = new Map();
    for (const entry of districtSeverity) {
      map.set(canonicalDistrictName(entry.name), normalizeSeverityKey(entry.severity));
    }
    return map;
  }, [districtSeverity]);

  const districtStyle = useCallback(
    (feature) => {
      const isSelected = feature.properties.code === districtCode;
      if (isSelected) {
        return {
          fillColor: '#0ea5e9',
          fillOpacity: 0.22,
          color: '#0284c7',
          weight: 2.5,
          opacity: 1,
        };
      }
      const severity = severityByDistrict.get(canonicalDistrictName(feature.properties.name_en));
      if (!severity) {
        return {
          fillColor: '#cbd5e1',
          fillOpacity: 0.05,
          color: '#94a3b8',
          weight: 1,
          opacity: 0.7,
        };
      }
      return {
        fillColor: SEVERITY_COLORS[severity],
        fillOpacity: 0.38,
        color: SEVERITY_COLORS[severity],
        weight: 1.2,
        opacity: 0.85,
      };
    },
    [districtCode, severityByDistrict],
  );

  const upazilaStyle = useCallback(
    (feature) => {
      const isSelected = feature.properties.code === upazilaCode;
      return {
        fillColor: isSelected ? '#f59e0b' : '#e2e8f0',
        fillOpacity: isSelected ? 0.35 : 0.08,
        color: isSelected ? '#b45309' : '#64748b',
        weight: isSelected ? 2.5 : 1,
        opacity: isSelected ? 1 : 0.8,
      };
    },
    [upazilaCode],
  );

  const districtKey = useMemo(
    () => `districts:${districtCode || 'none'}:${districtFeatures.length}:sev${severityTick}`,
    [districtCode, districtFeatures, severityTick],
  );
  const upazilaKey = useMemo(
    () => `upazilas:${districtCode || 'none'}:${upazilaCode || 'none'}:${upazilaFeatures.length}`,
    [districtCode, upazilaCode, upazilaFeatures],
  );

  return (
    <div className={fillHeight ? 'flex h-full flex-col gap-2' : 'space-y-3'}>
      {showControls ? (
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-900" htmlFor="report-district">
            District
          </label>
          <select
            id="report-district"
            value={districtCode}
            onChange={(e) => handleSelectDistrict(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            <option value="">Select district…</option>
            {districts.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name_en}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-900" htmlFor="report-upazila">
            Upazila
          </label>
          <select
            id="report-upazila"
            value={upazilaCode}
            onChange={(e) => handleSelectUpazila(e.target.value)}
            disabled={!districtCode}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">{districtCode ? 'Select upazila…' : 'Select a district first…'}</option>
            {upazilaOptions.map((u) => (
              <option key={u.code} value={u.code}>
                {u.name_en}
              </option>
            ))}
          </select>
        </div>
      </div>
      ) : null}
      {showControls && geoError ? (
        <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
          {geoError}
        </p>
      ) : null}

      {showControls ? (
      <div className="relative" ref={dropdownRef}>
        <label className="mb-1.5 block text-sm font-semibold text-slate-900">
          Search Location (District, Upazila, or Neighborhood)
        </label>
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          >
            <path
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => query.trim() && setOpenDropdown(true)}
            placeholder="Search e.g. Khilgaon, Mirpur, Motijheel, Sylhet…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
          {query && (
            <button
              type="button"
              onClick={clearSelection}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>

        {openDropdown && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
            {loadingSearch ? (
              <div className="p-3 text-center text-xs font-semibold text-slate-500">Searching locations…</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((res) => (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="flex w-full items-center gap-3 border-b border-slate-50 px-4 py-2.5 text-left text-sm transition hover:bg-sky-50 last:border-b-0"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-sky-600">
                    <path
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-slate-900">{res.name}</p>
                    <p className="truncate text-xs text-slate-500">{res.displayName}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-slate-500">
                No locations found for "{query}"
              </div>
            )}
          </div>
        )}
      </div>
      ) : null}

      <div className={fillHeight ? 'min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200 shadow-inner' : 'overflow-hidden rounded-xl border border-slate-200 shadow-inner'}>
        <MapContainer
          center={BANGLADESH_CENTER}
          zoom={7}
          minZoom={6}
          maxZoom={18}
          scrollWheelZoom
          maxBounds={BANGLADESH_BOUNDS.pad(0.3)}
          maxBoundsViscosity={0.8}
          className={mapClassName}
          preferCanvas
        >
          <TileLayer
            attribution={BASEMAPS.streets.attribution}
            url={BASEMAPS.streets.url}
            maxZoom={BASEMAPS.streets.maxZoom}
          />
          {flyTarget ? <MapFlyTo target={flyTarget} /> : null}
          <MapAutoResize />
          {interactive ? <ClickHandler onMapClick={handleMapClick} /> : null}
          {districtFeatures.length > 0 ? (
            <GeoJSON key={districtKey} data={districtFeatures} style={districtStyle} />
          ) : null}
          {upazilaFeatures.length > 0 ? (
            <GeoJSON key={upazilaKey} data={upazilaFeatures} style={upazilaStyle} />
          ) : null}
          <MarkerClusterGroup
            chunkedLoading
            showCoverageOnHover={false}
            spiderfyOnMaxZoom
            iconCreateFunction={existingClusterIcon}
          >
            {existingMarkers.map((marker) => (
              <Marker
                key={`existing-${marker.id}`}
                position={[marker.latitude, marker.longitude]}
                icon={existingIcon}
                eventHandlers={onExistingMarkerClick ? { click: () => onExistingMarkerClick(marker) } : undefined}
              >
                <Popup minWidth={180} maxWidth={240}>
                  <div style={{ fontFamily: 'inherit', fontSize: 12 }}>
                    <strong>{marker.title}</strong>
                    <br />
                    <span style={{ color: '#64748b' }}>{marker.location}</span>
                    <br />
                    <Link
                      to={`/incidents?report=${marker.id}`}
                      style={{ fontSize: 11, fontWeight: 700, color: '#0ea5e9', textDecoration: 'none' }}
                    >
                      View Details →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
          {exactPoint ? (
            <Marker position={exactPoint} icon={pinIcon} draggable={interactive} eventHandlers={{ dragend: handlePinDragEnd }}>
              <Popup>
                <div style={{ fontFamily: 'inherit', fontSize: 12 }}>
                  <strong>Incident Pin 📍</strong>
                  <br />
                  {query || 'Selected Location'}
                  <br />
                  Lat: {exactPoint[0]}
                  <br />
                  Lng: {exactPoint[1]}
                </div>
              </Popup>
            </Marker>
          ) : null}
        </MapContainer>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-200 bg-white px-3 py-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Area severity</span>
          {Object.entries(SEVERITY_COLORS).map(([level, color]) => (
            <span key={level} className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              {severityTitle(level)}
            </span>
          ))}
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: '#cbd5e1' }} />
            No reports
          </span>
        </div>
      </div>

      {showControls && notice ? (
        <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
          {notice}
        </p>
      ) : null}

      {showControls && (query || exactPoint) && !notice ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Selected Location</p>
              <p className="text-sm font-bold text-slate-900">{query || 'Map Pin Selected'}</p>
              {(districtNameOf(districtCode) || upazilaNameOf(upazilaCode)) && (
                <p className="mt-0.5 text-xs font-semibold text-sky-700">
                  {[upazilaNameOf(upazilaCode), districtNameOf(districtCode)].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-md px-2.5 py-1 text-xs font-bold text-slate-500 transition hover:bg-slate-200"
            >
              Clear
            </button>
          </div>
          {exactPoint ? (
            <div className="mt-2.5 grid grid-cols-2 gap-3 border-t border-slate-200 pt-2.5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">📍 Latitude</p>
                <p className="font-mono text-xs font-bold text-slate-800">{exactPoint[0]}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">📍 Longitude</p>
                <p className="font-mono text-xs font-bold text-slate-800">{exactPoint[1]}</p>
              </div>
            </div>
          ) : null}
        </div>
      ) : showControls && !notice ? (
        <p className="text-xs font-semibold text-slate-400">
          Search for a location, pick a district/upazila, or tap the map to place an exact incident pin 📍.
        </p>
      ) : null}
    </div>
  );
}
