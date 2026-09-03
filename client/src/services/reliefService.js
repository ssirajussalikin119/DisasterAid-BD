import api from './api';

const rows = (payload) => (Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []);

export async function getReliefCenters() {
  const { data } = await api.get('/relief-centers');
  return rows(data);
}

export async function createReliefCenter(payload) {
  const { data } = await api.post('/relief-centers', payload);
  return data.data;
}

export async function updateReliefCenter(id, payload) {
  const { data } = await api.put(`/relief-centers/${id}`, payload);
  return data.data;
}

export async function deleteReliefCenter(id) {
  await api.delete(`/relief-centers/${id}`);
}

export async function getReliefDistributions() {
  const { data } = await api.get('/relief-distributions');
  return rows(data);
}

export async function createReliefDistribution(payload) {
  const { data } = await api.post('/relief-distributions', payload);
  return data.data;
}

export async function getReliefStatistics() {
  const { data } = await api.get('/relief-statistics');
  return data.data;
}
