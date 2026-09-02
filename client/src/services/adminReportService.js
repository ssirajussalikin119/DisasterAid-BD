import api from './api';

export async function getAdminReports(params = {}) {
  const { data } = await api.get('/admin/reports', { params });
  return data.data;
}

export async function getReportDetail(id) {
  const { data } = await api.get(`/admin/reports/${id}`);
  return data.data.report;
}

export async function verifyReport(id) {
  const { data } = await api.post(`/admin/reports/${id}/verify`);
  return data.data.report;
}

export async function rejectReport(id) {
  const { data } = await api.post(`/admin/reports/${id}/reject`);
  return data.data.report;
}

export async function closeReport(id) {
  const { data } = await api.post(`/admin/reports/${id}/close`);
  return data.data.report;
}

export async function getInnerJoinReports(params = {}) {
  const { data } = await api.get('/admin/reports/sql/inner-join', { params });
  return data.data;
}

export async function getLeftJoinReports(params = {}) {
  const { data } = await api.get('/admin/reports/sql/left-join', { params });
  return data.data;
}

export async function getReportStatistics() {
  const { data } = await api.get('/admin/reports/sql/statistics');
  return data.data;
}

export async function getRecentReports(params = {}) {
  const { data } = await api.get('/admin/reports/sql/recent', { params });
  return data.data;
}
