import api from './api';

export async function sendOtp(phone) {
  const { data } = await api.post('/auth/send-otp', { phone });
  return data.data;
}

export async function verifyOtp(payload) {
  const { data } = await api.post('/auth/verify-otp', payload);
  return data.data;
}

export async function logoutUser() {
  const { data } = await api.post('/logout');
  return data;
}

export async function fetchCurrentUser() {
  const { data } = await api.get('/me');
  return data;
}

export async function updateProfileUser(payload) {
  const { data } = await api.patch('/me', payload);
  return data;
}

export async function submitVolunteerApplication(payload) {
  const { data } = await api.post('/applications/volunteer', payload);
  return data;
}

export async function submitNgoApplication(payload) {
  const { data } = await api.post('/applications/ngo', payload);
  return data;
}
