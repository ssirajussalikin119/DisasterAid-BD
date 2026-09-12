import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, GeoJSON, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { bangladeshDistricts, districtList } from '../../data/bangladeshDistricts';
import { searchLocations } from '../../services/locationSearchService';

const BANGLADESH_CENTER = [23.7, 90.4];
const BANGLADESH_BOUNDS = L.latLngBounds([20.5, 88.0], [26.7, 92.7]);

const pinIcon = L.divIcon({
  className: 'incident-marker-wrapper',
  html: `<span class="incident-marker" style="--marker-color:#dc2626"><span class="incident-marker-dot"></span></span>`,
  iconSize: [34, 44],
  iconAnchor: [17, 42],
  popupAnchor: [0, -38],
});

function MapFlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      map.flyTo(center, zoom, { duration: 0.8 });
    }
  }, [center, zoom, map]);
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

export default function ReportLocationPicker({ latitude, longitude, location, onSelectionChange }) {
  const [query, setQuery] = useState(location || '');
  const [searchResults, setSearchResults] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedDistrictName, setSelectedDistrictName] = useState('');
  const [exactPoint, setExactPoint] = useState(() => {
    if (latitude && longitude) {
      const lat = Number(latitude);
      const lng = Number(longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
    }
    return null;
  });
  const [flyTarget, setFlyTarget] = useState(null);
  const dropdownRef = useRef(null);
  const debounceTimer = useRef(null);

  // Sync prop changes
  useEffect(() => {
    if (location && location !== query) setQuery(location);
    if (latitude && longitude) {
      const lat = Number(latitude);
      const lng = Number(longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        setExactPoint([lat, lng]);
      }
    }
  }, [location, latitude, longitude]);

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

  const handleSelectSearchResult = (result) => {
    const locName = result.displayName;
    setQuery(locName);
    setOpenDropdown(false);
    setExactPoint([result.latitude, result.longitude]);
    setFlyTarget({ center: [result.latitude, result.longitude], zoom: result.type === 'district' ? 10 : 13 });

    if (result.districtName) {
      setSelectedDistrictName(result.districtName);
    } else if (result.type === 'district') {
      setSelectedDistrictName(result.name);
    }

    onSelectionChange({
      location: locName,
      latitude: result.latitude,
      longitude: result.longitude,
    });
  };

  const handleMapClick = useCallback(
    (lat, lng) => {
      const roundedLat = Math.round(lat * 100000) / 100000;
      const roundedLng = Math.round(lng * 100000) / 100000;
      setExactPoint([roundedLat, roundedLng]);

      let selectedLocName = query.trim();

      // Find closest district centroid to determine administrative district name
      let closestDistrict = null;
      let minDistance = Infinity;

      for (const d of districtList) {
        const dist = Math.hypot(d.centroid[0] - roundedLat, d.centroid[1] - roundedLng);
        if (dist < minDistance) {
          minDistance = dist;
          closestDistrict = d;
        }
      }

      if (closestDistrict) {
        setSelectedDistrictName(closestDistrict.name);
        if (!selectedLocName) {
          selectedLocName = `${closestDistrict.name}, ${closestDistrict.division}`;
          setQuery(selectedLocName);
        }
      }

      onSelectionChange({
        location: selectedLocName || (closestDistrict ? `${closestDistrict.name}, ${closestDistrict.division}` : 'Incident Location'),
        latitude: roundedLat,
        longitude: roundedLng,
      });
    },
    [query, onSelectionChange],
  );

  const clearSelection = useCallback(() => {
    setQuery('');
    setExactPoint(null);
    setSelectedDistrictName('');
    setFlyTarget(null);
    onSelectionChange({ location: '', latitude: '', longitude: '' });
  }, [onSelectionChange]);

  // Clean boundary style: no blocky fills or synthetic polygon shapes
  const getDistrictStyle = useCallback(
    (feature) => {
      const isSelected =
        selectedDistrictName &&
        feature.properties.name.toLowerCase() === selectedDistrictName.toLowerCase();

      if (isSelected) {
        return {
          fillColor: '#0ea5e9',
          fillOpacity: 0.08,
          color: '#0ea5e9',
          weight: 1.5,
          opacity: 0.8,
        };
      }

      return {
        fillColor: '#cbd5e1',
        fillOpacity: 0.02,
        color: '#cbd5e1',
        weight: 0.8,
        opacity: 0.4,
      };
    },
    [selectedDistrictName],
  );

  const onEachFeature = useCallback(
    (feature, layer) => {
      layer.on({
        click: (e) => {
          L.DomEvent.stopPropagation(e);
          const name = feature.properties.name;
          const division = feature.properties.division;
          setSelectedDistrictName(name);
          const newLoc = `${name}, ${division}`;
          setQuery(newLoc);

          const lat = e.latlng.lat;
          const lng = e.latlng.lng;
          const roundedLat = Math.round(lat * 100000) / 100000;
          const roundedLng = Math.round(lng * 100000) / 100000;
          setExactPoint([roundedLat, roundedLng]);

          onSelectionChange({
            location: newLoc,
            latitude: roundedLat,
            longitude: roundedLng,
          });
        },
      });
    },
    [onSelectionChange],
  );

  return (
    <div className="space-y-3">
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
            placeholder="Search e.g. Khilgaon, Mirpur, Rajbag, Sylhet, Raypur..."
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

      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-inner">
        <MapContainer
          center={BANGLADESH_CENTER}
          zoom={7}
          minZoom={6}
          maxZoom={18}
          scrollWheelZoom
          maxBounds={BANGLADESH_BOUNDS.pad(0.3)}
          maxBoundsViscosity={0.8}
          className="h-72 w-full sm:h-96"
          preferCanvas
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          {flyTarget ? <MapFlyTo center={flyTarget.center} zoom={flyTarget.zoom} /> : null}
          <ClickHandler onMapClick={handleMapClick} />
          <GeoJSON
            key={selectedDistrictName || 'all-districts'}
            data={bangladeshDistricts}
            style={getDistrictStyle}
            onEachFeature={onEachFeature}
          />
          {exactPoint ? (
            <Marker position={exactPoint} icon={pinIcon}>
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
      </div>

      {(query || exactPoint) ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Selected Location</p>
              <p className="text-sm font-bold text-slate-900">{query || 'Map Pin Selected'}</p>
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
      ) : (
        <p className="text-xs font-semibold text-slate-400">
          Search for a location (e.g. Khilgaon, Mirpur, Rajbag, Sylhet) or tap the map to place an exact incident pin 📍.
        </p>
      )}
    </div>
  );
}
