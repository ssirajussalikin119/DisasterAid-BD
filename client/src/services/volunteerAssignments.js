import api from './api';

export async function getMyAssignments() {
  const { data } = await api.get('/volunteer/assignments');
  return data?.data?.assignments ?? [];
}

export async function updateAssignmentStatus(id, status) {
  const { data } = await api.patch(`/volunteer/assignments/${id}/status`, { status });
  return data?.data?.assignment;
}
