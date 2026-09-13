import api from './api';

const assignmentService = {
  getInnerJoin: async () => {
    const response = await api.get('/assignments/sql/inner-join');
    return response.data;
  },
  getExceptUnassigned: async () => {
    const response = await api.get('/assignments/sql/except');
    return response.data;
  },
  getAggregateCounts: async () => {
    const response = await api.get('/assignments/sql/aggregate');
    return response.data;
  },
  getFullOuterJoin: async () => {
    const response = await api.get('/assignments/sql/full-outer-join');
    return response.data;
  },
  createAssignment: async (data) => {
    const response = await api.post('/assignments', data);
    return response.data;
  },
  updateAssignment: async (id, data) => {
    const response = await api.put(`/assignments/${id}`, data);
    return response.data;
  },
};

export default assignmentService;
