import api from './api';

export async function getAdminUsers(params = {}) {
  const { data } = await api.get('/admin/users', { params });
  return data.data;
}

export async function getAdminUser(id) {
  const { data } = await api.get(`/admin/users/${id}`);
  return data.data;
}

export async function updateAdminUser(id, payload) {
  const { data } = await api.put(`/admin/users/${id}`, payload);
  return data.data.user;
}

export async function activateAdminUser(id) {
  const { data } = await api.patch(`/admin/users/${id}/activate`);
  return data.data.user;
}

export async function suspendAdminUser(id) {
  const { data } = await api.patch(`/admin/users/${id}/suspend`);
  return data.data.user;
}
