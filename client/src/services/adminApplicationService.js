import api from './api';

export async function getAdminApplications(params = {}) {
  const { data } = await api.get('/admin/applications', { params });
  return data.data;
}

export async function getApplicationDetail(id) {
  const { data } = await api.get(`/admin/applications/${id}`);
  return data.data.application;
}

export async function approveApplication(id, review_notes) {
  const { data } = await api.post(`/admin/applications/${id}/approve`, { review_notes });
  return data.data.application;
}

export async function rejectApplication(id, review_notes) {
  const { data } = await api.post(`/admin/applications/${id}/reject`, { review_notes });
  return data.data.application;
}

export async function getInnerJoinApplications(params = {}) {
  const { data } = await api.get('/admin/applications/sql/inner-join', { params });
  return data.data;
}

export async function getLeftJoinApplications(params = {}) {
  const { data } = await api.get('/admin/applications/sql/left-join', { params });
  return data.data;
}

export async function getUnionApplications(params = {}) {
  const { data } = await api.get('/admin/applications/sql/union', { params });
  return data.data;
}

export async function getIntersectApproved() {
  const { data } = await api.get('/admin/applications/sql/intersect');
  return data.data;
}

export async function getStatistics() {
  const { data } = await api.get('/admin/applications/sql/statistics');
  return data.data;
}

export async function getRecentApplications(params = {}) {
  const { data } = await api.get('/admin/applications/sql/recent', { params });
  return data.data;
}
