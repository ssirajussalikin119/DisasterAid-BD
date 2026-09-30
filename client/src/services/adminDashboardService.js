import api from './api';

export const getAdminDashboardStatistics = async () => {
    const response = await api.get('/admin/dashboard/statistics');
    return response.data;
};

export const getDistrictDisasterSummary = async () => {
    const response = await api.get('/admin/analytics/district-summary');
    return response.data;
};

export const getAdminAnalyticsOverview = async () => {
    const response = await api.get('/admin/analytics/overview');
    return response.data;
};
