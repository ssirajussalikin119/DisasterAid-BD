import api from './api';

export const getResponseNetwork = async () => {
  const response = await api.get('/response-network');
  return response.data;
};

export const getAssignedVolunteers = async () => {
  const response = await api.get('/response-network/assigned');
  return response.data;
};

export const getAvailableVolunteers = async () => {
  const response = await api.get('/response-network/available');
  return response.data;
};
