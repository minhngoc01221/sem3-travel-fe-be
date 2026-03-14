import api from './api';

const promotionService = {
  // Get all promotions with pagination and filters (F201)
  getAll: async ({ 
    page = 1, 
    pageSize = 10, 
    isActive = null, 
    showOnHome = null,
    targetType = null
  } = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('pageSize', pageSize);
    if (isActive !== null) params.append('isActive', isActive);
    if (showOnHome !== null) params.append('showOnHome', showOnHome);
    if (targetType !== null) params.append('targetType', targetType);

    const response = await api.get(`/adminpromotions?${params.toString()}`);
    return response.data;
  },

  // Get promotion by ID (F202)
  getById: async (id) => {
    const response = await api.get(`/adminpromotions/${id}`);
    return response.data;
  },

  // Create promotion (F201)
  create: async (data) => {
    const response = await api.post('/adminpromotions', data);
    return response.data;
  },

  // Update promotion (F203)
  update: async (id, data) => {
    const response = await api.put(`/adminpromotions/${id}`, data);
    return response.data;
  },

  // Delete promotion (F204)
  delete: async (id) => {
    const response = await api.delete(`/adminpromotions/${id}`);
    return response.data;
  },

  // Toggle show on home (F209)
  toggleShowOnHome: async (id) => {
    const response = await api.patch(`/adminpromotions/${id}/toggle-home`);
    return response.data;
  },

  // Toggle status (F208)
  toggleStatus: async (id) => {
    const response = await api.patch(`/adminpromotions/${id}/toggle-status`);
    return response.data;
  },

  // Get targets for dropdown (F207)
  getTargets: async (targetType) => {
    const params = new URLSearchParams();
    if (targetType !== null) params.append('targetType', targetType);
    
    const response = await api.get(`/adminpromotions/targets?${params.toString()}`);
    return response.data;
  },

  // Get all hotels for dropdown
  getHotels: async () => {
    const response = await api.get('/adminpromotions/hotels');
    return response.data;
  },

  // Get all tours for dropdown
  getTours: async () => {
    const response = await api.get('/adminpromotions/tours');
    return response.data;
  }
};

export default promotionService;
