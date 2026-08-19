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
  return 'Medium';
};

const normalizeStatus = (value) => titleCase(value) || 'Pending';

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
  if (Array.isArray(payload?.data?.reports)) return payload.data.reports;
  if (Array.isArray(payload?.reports)) return payload.reports;
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

  const rawType = incident.type ?? incident.category ?? 'Community report';
  const rawLocation = incident.location;

  return {
    id: incident.id ?? incident.uuid ?? `incident-${index + 1}`,
    title:
      incident.title ?? incident.name ?? incident.summary ?? `${titleCase(rawType) || 'Disaster'} report`,
    location: typeof rawLocation === 'string' ? rawLocation : 'Location unavailable',
    type: titleCase(rawType) || 'Community Report',
    severity: normalizeSeverity(incident.severity ?? incident.severity_level),
    status: normalizeStatus(incident.status),
    source:
      titleCase(
        incident.user?.name ?? incident.source?.name ?? incident.source,
      ) || 'Community Report',
    reportedAt:
      incident.reported_at ??
      incident.reportedAt ??
      incident.created_at ??
      incident.createdAt ??
      'Recently reported',
    peopleAffected: normalizeNonNegativeNumber(incident.people_affected ?? incident.peopleAffected ?? 0),
    count: Math.max(1, Math.round(normalizeNonNegativeNumber(incident.count, 1))),
    latitude,
    longitude,
    description:
      incident.description ?? 'No additional incident summary provided.',
    userId: incident.user_id ?? incident.user?.id ?? null,
  };
};

export async function getIncidents() {
  const response = await api.get('/reports');

  return extractRows(response.data).map(normalizeIncident);
}

export async function getMapIncidents() {
  return getIncidents()
    .filter(
      (incident) =>
        incident.latitude !== null &&
        incident.longitude !== null &&
        Math.abs(incident.latitude) <= 90 &&
        Math.abs(incident.longitude) <= 180,
    );
}

export async function createReport(payload) {
  const { data } = await api.post('/reports', payload);
  return data.data.report;
}

export async function updateReport(id, payload) {
  const { data } = await api.put(`/reports/${id}`, payload);
  return data.data.report;
}

export async function deleteReport(id) {
  const { data } = await api.delete(`/reports/${id}`);
  return data;
}
