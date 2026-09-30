import api from './api';

export const getAdminIncidents = async () => {
    const response = await api.get('/admin/incidents');
    return response.data;
};

export const getAdminIncidentById = async (id) => {
    const response = await api.get(`/admin/incidents/${id}`);
    return response.data;
};

export const createAdminIncident = async (data) => {
    const response = await api.post('/admin/incidents', data);
    return response.data;
};

export const updateAdminIncident = async (id, data) => {
    const response = await api.put(`/admin/incidents/${id}`, data);
    return response.data;
};

export const updateAdminIncidentStatus = async (id, status) => {
    const response = await api.patch(`/admin/incidents/${id}/status`, { status });
    return response.data;
};

export const closeAdminIncident = async (id) => {
    const response = await api.patch(`/admin/incidents/${id}/close`);
    return response.data;
};
