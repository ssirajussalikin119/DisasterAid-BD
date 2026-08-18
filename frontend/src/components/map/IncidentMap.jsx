import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { severityColors, severityOrder } from '../../data/incidents';

const BANGLADESH_CENTER = [23.685, 90.3563];

const tileProviders = {
  openstreetmap: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
};

const getTileProvider = () => {
  const providerName = String(
    import.meta.env.VITE_MAP_PROVIDER ?? import.meta.env.MAP_PROVIDER ?? 'openstreetmap',
  ).toLowerCase();
  const provider = tileProviders[providerName] ?? tileProviders.openstreetmap;

  return {
    url: import.meta.env.VITE_MAP_TILE_URL ?? provider.url,
    attribution: import.meta.env.VITE_MAP_ATTRIBUTION ?? provider.attribution,
  };
};

const makeMarkerIcon = (severity, count = 1) => {
  const color = severityColors[severity] ?? severityColors.Low;

  if (count > 1) {
    return L.divIcon({
      className: 'incident-cluster-wrapper',
      html: `<span class="incident-cluster" style="--cluster-color:${color}">${count}</span>`,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      popupAnchor: [0, -20],
    });
  }

  return L.divIcon({
    className: 'incident-marker-wrapper',
    html: `<span class="incident-marker" style="--marker-color:${color}"><span class="incident-marker-dot"></span></span>`,
    iconSize: [34, 44],
    iconAnchor: [17, 42],
    popupAnchor: [0, -38],
  });
};

const clusterIcon = (cluster) => {
  const markers = cluster.getAllChildMarkers();
  const highestSeverity = markers.reduce((highest, marker) => {
    const severity = marker.options.disasterSeverity ?? 'Low';
    return (severityOrder[severity] ?? 1) > (severityOrder[highest] ?? 1)
      ? severity
      : highest;
  }, 'Low');

  const color = severityColors[highestSeverity] ?? severityColors.Low;

  const incidentCount = markers.reduce(
    (total, marker) => total + Math.max(1, Number(marker.options.incidentCount) || 1),
    0,
  );

  return L.divIcon({
    className: 'incident-cluster-wrapper',
    html: `<span class="incident-cluster" style="--cluster-color:${color}">${incidentCount}</span>`,
    iconSize: L.point(48, 48),
  });
};

function MapViewportController({ incidents, focusedIncident }) {
  const map = useMap();

  useEffect(() => {
    if (focusedIncident) {
      map.flyTo([focusedIncident.latitude, focusedIncident.longitude], 12, {
        duration: 0.8,
      });
      return;
    }

    if (incidents.length === 0) return;

    const bounds = L.latLngBounds(
      incidents.map((incident) => [incident.latitude, incident.longitude]),
    );

    map.fitBounds(bounds, {
      padding: [45, 45],
      maxZoom: 9,
      animate: true,
    });
  }, [focusedIncident, incidents, map]);

  return null;
}

function SeverityBadge({ severity }) {
  return (
    <span
      className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white"
      style={{ backgroundColor: severityColors[severity] ?? severityColors.Low }}
    >
      {severity}
    </span>
  );
}

export default function IncidentMap({ incidents, focusedIncident, onMarkerClick }) {
  const tileProvider = useMemo(getTileProvider, []);

  return (
    <MapContainer
      center={BANGLADESH_CENTER}
      zoom={7}
      minZoom={6}
      maxZoom={18}
      scrollWheelZoom
      className="h-full w-full"
      preferCanvas
    >
      <TileLayer
        attribution={tileProvider.attribution}
        url={tileProvider.url}
        maxZoom={19}
      />

      <MapViewportController
        incidents={incidents}
        focusedIncident={focusedIncident}
      />

      <MarkerClusterGroup
        chunkedLoading
        showCoverageOnHover={false}
        spiderfyOnMaxZoom
        iconCreateFunction={clusterIcon}
      >
        {incidents.map((incident) => (
          <Marker
            key={incident.id}
            position={[incident.latitude, incident.longitude]}
            icon={makeMarkerIcon(incident.severity, incident.count)}
            disasterSeverity={incident.severity}
            incidentCount={incident.count}
            eventHandlers={{
              click: () => onMarkerClick?.(incident),
            }}
          >
            <Popup minWidth={260} maxWidth={320}>
              <article className="incident-popup-card">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <SeverityBadge severity={incident.severity} />
                  <span className="text-[11px] font-bold text-slate-500">
                    {incident.status}
                  </span>
                </div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-sky-600">
                  {incident.type}
                </p>
                <h3 className="mt-1 text-base font-extrabold leading-6 text-slate-900">
                  {incident.title}
                </h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {incident.location}
                </p>
                <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-600">
                  {incident.description}
                </p>
                {incident.count > 1 ? (
                  <p className="mt-3 text-xs font-extrabold text-slate-600">
                    {incident.count} reports grouped at this location
                  </p>
                ) : null}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs font-bold text-slate-500">
                    {incident.peopleAffected > 0
                      ? `${incident.peopleAffected.toLocaleString()} affected`
                      : 'Affected count pending'}
                  </span>
                  <Link
                    to={`/incidents?incident=${encodeURIComponent(incident.id)}`}
                    className="text-xs font-extrabold text-sky-600 hover:text-sky-700"
                  >
                    View details →
                  </Link>
                </div>
              </article>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
