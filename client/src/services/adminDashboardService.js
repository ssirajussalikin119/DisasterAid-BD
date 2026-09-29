import api from './api';

export const getAdminDashboardStatistics = async () => {
    const response = await api.get('/admin/dashboard/statistics');
    return response.data;
};
