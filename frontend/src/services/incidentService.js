import api from './api';

const titleCase = (value) =>
  String(value ?? '')
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const normalizeSeverity = (value) => {
  const normalized = String(value ?? '').toLowerCase();

  if (['critical', 'severe', 'emergency'].includes(normalized)) return 'Critical';
  if (['high', 'major'].includes(normalized)) return 'High';
  if (['medium', 'moderate'].includes(normalized)) return 'Medium';
  return 'Low';
};

const normalizeCoordinate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const normalizeNonNegativeNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === '') return fallback;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
};

const extractRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.incidents)) return payload.incidents;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

export const normalizeIncident = (incident, index = 0) => {
  const latitude = normalizeCoordinate(
    incident.latitude ?? incident.lat ?? incident.location?.lat ?? incident.coordinates?.lat,
  );
  const longitude = normalizeCoordinate(
    incident.longitude ??
      incident.lng ??
      incident.lon ??
      incident.location?.lng ??
      incident.location?.lon ??
      incident.coordinates?.lng ??
      incident.coordinates?.lon,
  );

  const rawType =
    incident.type ?? incident.category ?? incident.disaster_type ?? incident.disasterType;
  const rawLocation =
    incident.location_name ??
    incident.location?.name ??
    incident.address ??
    incident.area ??
    incident.district ??
    incident.location;

  return {
    id: incident.id ?? incident.uuid ?? `incident-${index + 1}`,
    title:
      incident.title ?? incident.name ?? incident.summary ?? `${titleCase(rawType) || 'Disaster'} report`,
    location: typeof rawLocation === 'string' ? rawLocation : 'Location unavailable',
    type: titleCase(rawType) || 'Other',
    severity: normalizeSeverity(incident.severity ?? incident.severity_level),
    status: titleCase(incident.status) || 'Reported',
    source:
      titleCase(
        incident.source?.name ?? incident.source ?? incident.reported_by_type ?? incident.reporter_type,
      ) || 'Community Report',
    reportedAt:
      incident.reported_at ??
      incident.reportedAt ??
      incident.created_at ??
      incident.createdAt ??
      'Recently reported',
    peopleAffected: normalizeNonNegativeNumber(
      incident.people_affected ?? incident.peopleAffected ?? incident.affected_count ?? 0,
    ),
    count: Math.max(1, Math.round(normalizeNonNegativeNumber(incident.count, 1))),
    latitude,
    longitude,
    description:
      incident.description ?? incident.summary ?? incident.details ?? 'No additional incident summary provided.',
  };
};

export async function getMapIncidents() {
  const response = await api.get('/v1/incidents', {
    params: {
      view: 'map',
    },
  });

  return extractRows(response.data)
    .map(normalizeIncident)
    .filter(
      (incident) =>
        incident.latitude !== null &&
        incident.longitude !== null &&
        Math.abs(incident.latitude) <= 90 &&
        Math.abs(incident.longitude) <= 180,
    );
}
