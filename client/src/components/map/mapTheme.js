import L from 'leaflet';

export const BANGLADESH_CENTER = [23.7, 90.4];
export const BANGLADESH_BOUNDS = L.latLngBounds([20.5, 88.0], [26.7, 92.7]);

export const SEVERITY_COLORS = {
  low: '#16a34a',
  medium: '#eab308',
  high: '#f97316',
  critical: '#dc2626',
};

export const SEVERITY_ORDER = { low: 1, medium: 2, high: 3, critical: 4 };

export const SEVERITY_WEIGHT = { low: 1, medium: 2, high: 4, critical: 7 };

export const NO_DATA_FILL = '#cbd5e1';

export const severityRank = (severity) => SEVERITY_ORDER[String(severity ?? '').toLowerCase()] ?? 1;

export const normalizeSeverityKey = (severity) => {
  const key = String(severity ?? '').toLowerCase();
  return SEVERITY_ORDER[key] ? key : 'medium';
};

export const severityTitle = (severity) => {
  const key = normalizeSeverityKey(severity);
  return key.charAt(0).toUpperCase() + key.slice(1);
};

export const colorForSeverity = (severity) => SEVERITY_COLORS[normalizeSeverityKey(severity)];

export const highestSeverity = (severities) => {
  let best = 'low';
  let bestRank = 0;
  for (const sev of severities) {
    const rank = severityRank(sev);
    if (rank > bestRank) {
      bestRank = rank;
      best = normalizeSeverityKey(sev);
    }
  }
  return best;
};

// Verified key-free 2026-10: OSM standard, OSM Humanitarian (HOT) and
// OpenTopoMap all return real tiles. CARTO light_all/dark_all return an
// identical 2 KB placeholder for land and ocean tiles ("API KEY REQUIRED"),
// so they are NOT listed here.
export const BASEMAPS = {
  streets: {
    label: 'Streets',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  humanitarian: {
    label: 'Humanitarian',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Tiles style by <a href="https://www.hotosm.org/">HOT</a>',
    maxZoom: 19,
  },
  terrain: {
    label: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://opentopomap.org/">OpenTopoMap</a> (CC-BY-SA) | SRTM',
    maxZoom: 17,
  },
};

export const ringContainsPoint = (ring, lng, lat) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
};

export const polygonContainsPoint = (coordinates, lng, lat) => {
  if (!Array.isArray(coordinates) || coordinates.length === 0) return false;
  if (!ringContainsPoint(coordinates[0], lng, lat)) return false;
  for (let h = 1; h < coordinates.length; h += 1) {
    if (ringContainsPoint(coordinates[h], lng, lat)) return false;
  }
  return true;
};

export const findDistrictAtPoint = (districtList, lat, lng) => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  for (const district of districtList) {
    const coords = district?.rawCoords;
    if (Array.isArray(coords) && polygonContainsPoint(coords, lng, lat)) {
      return district;
    }
  }
  let closest = null;
  let minDistance = Infinity;
  for (const district of districtList) {
    const centroid = district?.centroid;
    if (!Array.isArray(centroid)) continue;
    const distance = Math.hypot(centroid[0] - lat, centroid[1] - lng);
    if (distance < minDistance) {
      minDistance = distance;
      closest = district;
    }
  }
  return closest;
};

export const aggregateHotspots = (markers, cellSize = 0.18) => {
  const cells = new Map();
  for (const marker of markers) {
    const lat = Number(marker.latitude);
    const lng = Number(marker.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const key = `${Math.floor(lat / cellSize)}:${Math.floor(lng / cellSize)}`;
    let cell = cells.get(key);
    if (!cell) {
      cell = { sumLat: 0, sumLng: 0, count: 0, weight: 0, severities: [] };
      cells.set(key, cell);
    }
    cell.sumLat += lat;
    cell.sumLng += lng;
    cell.count += 1;
    cell.weight += SEVERITY_WEIGHT[normalizeSeverityKey(marker.severity)] ?? 2;
    cell.severities.push(marker.severity);
  }

  const hotspots = [];
  let maxWeight = 1;
  for (const cell of cells.values()) {
    if (cell.weight > maxWeight) maxWeight = cell.weight;
  }
  for (const cell of cells.values()) {
    hotspots.push({
      latitude: cell.sumLat / cell.count,
      longitude: cell.sumLng / cell.count,
      count: cell.count,
      weight: cell.weight,
      intensity: cell.weight / maxWeight,
      severity: highestSeverity(cell.severities),
    });
  }
  return hotspots;
};

export const countNearby = (markers, lat, lng, radiusDegrees = 0.12) =>
  markers.filter((marker) => {
    const mLat = Number(marker.latitude);
    const mLng = Number(marker.longitude);
    return (
      Number.isFinite(mLat) &&
      Number.isFinite(mLng) &&
      Math.hypot(mLat - lat, mLng - lng) <= radiusDegrees
    );
  });

export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ago`;
};

export const formatReportDate = (value) => {
  if (!value) return 'Recent';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recent';
  return date.toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Normalise district names across spelling variants (old vs official names)
// so GeoJSON names match database district strings from either side.
const DISTRICT_NAME_ALIASES = {
  barisal: 'barishal',
  chittagong: 'chattogram',
  comilla: 'cumilla',
  bogra: 'bogura',
  jessore: 'jashore',
  jhalokati: 'jhalakathi',
};

export const canonicalDistrictName = (name) => {
  const normalized = String(name ?? '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
  return DISTRICT_NAME_ALIASES[normalized] ?? normalized;
};
