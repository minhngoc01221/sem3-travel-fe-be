import api from './api';

const hotelService = {
  // Get all hotels with pagination and filters (F181)
  getAll: async ({ page = 1, pageSize = 10, search = '', city = '', starRating = null, isActive = null } = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('pageSize', pageSize);
    if (search) params.append('search', search);
    if (city) params.append('city', city);
    if (starRating) params.append('starRating', starRating);
    if (isActive !== null) params.append('isActive', isActive);

    const response = await api.get(`/adminhotels?${params.toString()}`);
    return response.data;
  },

  // Get hotel by ID (F181)
  getById: async (id) => {
    const response = await api.get(`/adminhotels/${id}`);
    return response.data;
  },

  // Create new hotel (F182)
  create: async (data) => {
    const response = await api.post('/adminhotels', data);
    return response.data;
  },

  // Update hotel (F183)
  update: async (id, data) => {
    const response = await api.put(`/adminhotels/${id}`, data);
    return response.data;
  },

  // Delete hotel (F184)
  delete: async (id) => {
    const response = await api.delete(`/adminhotels/${id}`);
    return response.data;
  },

  // Toggle hotel status (F189)
  toggleStatus: async (id) => {
    const response = await api.patch(`/adminhotels/${id}/status`);
    return response.data;
  },

  // Get hotel rooms (F185)
  getRooms: async (hotelId) => {
    const response = await api.get(`/adminhotels/${hotelId}/rooms`);
    return response.data;
  },

  // Create room (F185)
  createRoom: async (hotelId, data) => {
    const response = await api.post(`/adminhotels/${hotelId}/rooms`, data);
    return response.data;
  },

  // Update room (F185)
  updateRoom: async (hotelId, roomId, data) => {
    const response = await api.put(`/adminhotels/${hotelId}/rooms/${roomId}`, data);
    return response.data;
  },

  // Delete room (F185)
  deleteRoom: async (hotelId, roomId) => {
    const response = await api.delete(`/adminhotels/${hotelId}/rooms/${roomId}`);
    return response.data;
  },

  // Get room availability (F186, F187)
  getRoomAvailability: async (hotelId, roomId, startDate, endDate) => {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);

    const response = await api.get(`/adminhotels/${hotelId}/rooms/${roomId}/availability?${params.toString()}`);
    return response.data;
  },

  // Update room availability (F186, F187)
  updateRoomAvailability: async (hotelId, roomId, availabilities) => {
    const response = await api.put(`/adminhotels/${hotelId}/rooms/${roomId}/availability`, {
      availabilities
    });
    return response.data;
  },

  // Get hotel reviews (F190)
  getReviews: async (hotelId, page = 1, pageSize = 10) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('pageSize', pageSize);

    const response = await api.get(`/adminhotels/${hotelId}/reviews?${params.toString()}`);
    return response.data;
  },

  // Get cities for filter
  getCities: async () => {
    const response = await api.get('/adminhotels/cities');
    return response.data;
  }
};

export default hotelService;
