import api from './api';

export async function getReportRelationships(mode = 'full', params = {}) {
  const { data } = await api.get('/report-relationships', {
    params: { mode, ...params },
  });
  return data.data;
}

export async function getReportsWithReporters(params = {}) {
  const { data } = await api.get('/report-relationships/reports-with-reporters', { params });
  return data.data;
}

export async function getReportsWithIncidents(params = {}) {
  const { data } = await api.get('/report-relationships/reports-with-incidents', { params });
  return data.data;
}

export async function getIncidentWiseReports(params = {}) {
  const { data } = await api.get('/report-relationships/incident-wise-reports', { params });
  return data.data;
}

export async function getCompleteRelationships(params = {}) {
  const { data } = await api.get('/report-relationships/complete', { params });
  return data.data;
}

export async function getRelationshipSummary() {
  const { data } = await api.get('/report-relationships/summary');
  return data.data.summary;
}
