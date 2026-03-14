import api from './api';

// ==================== Tour Service ====================
export const tourService = {
  // Tour
  getAll: async () => {
    const response = await api.get('/AdminTours');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/AdminTours/${id}`);
    return response.data;
  },

  getWithDetails: async (id) => {
    const response = await api.get(`/AdminTours/${id}/details`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/AdminTours', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/AdminTours/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/AdminTours/${id}`);
    return response.data;
  },

  // Itinerary
  getItineraries: async (tourId) => {
    const response = await api.get(`/AdminTours/${tourId}/itinerary`);
    return response.data;
  },

  createItinerary: async (tourId, data) => {
    const response = await api.post(`/AdminTours/${tourId}/itinerary`, data);
    return response.data;
  },

  updateItinerary: async (tourId, itineraryId, data) => {
    const response = await api.put(`/AdminTours/${tourId}/itinerary/${itineraryId}`, data);
    return response.data;
  },

  deleteItinerary: async (tourId, itineraryId) => {
    const response = await api.delete(`/AdminTours/${tourId}/itinerary/${itineraryId}`);
    return response.data;
  },

  // Destinations
  getDestinations: async (tourId) => {
    const response = await api.get(`/AdminTours/${tourId}/destinations`);
    return response.data;
  },

  addDestination: async (tourId, data) => {
    const response = await api.post(`/AdminTours/${tourId}/destinations`, data);
    return response.data;
  },

  removeDestination: async (tourId, destinationId) => {
    const response = await api.delete(`/AdminTours/${tourId}/destinations/${destinationId}`);
    return response.data;
  },

  // Departures
  getDepartures: async (tourId) => {
    const response = await api.get(`/AdminTours/${tourId}/departures`);
    return response.data;
  },

  createDeparture: async (tourId, data) => {
    const response = await api.post(`/AdminTours/${tourId}/departures`, data);
    return response.data;
  },

  bulkCreateDepartures: async (tourId, data) => {
    const response = await api.post(`/AdminTours/${tourId}/departures/bulk`, data);
    return response.data;
  },

  updateDeparture: async (tourId, departureId, data) => {
    const response = await api.put(`/AdminTours/${tourId}/departures/${departureId}`, data);
    return response.data;
  },

  deleteDeparture: async (tourId, departureId) => {
    const response = await api.delete(`/AdminTours/${tourId}/departures/${departureId}`);
    return response.data;
  },

  // Services (Inclusions)
  getServices: async (tourId) => {
    const response = await api.get(`/AdminTours/${tourId}/services`);
    return response.data;
  },

  createService: async (tourId, data) => {
    const response = await api.post(`/AdminTours/${tourId}/services`, data);
    return response.data;
  },

  updateService: async (tourId, serviceId, data) => {
    const response = await api.put(`/AdminTours/${tourId}/services/${serviceId}`, data);
    return response.data;
  },

  deleteService: async (tourId, serviceId) => {
    const response = await api.delete(`/AdminTours/${tourId}/services/${serviceId}`);
    return response.data;
  },

  // Tour Guides
  getTourGuides: async (tourId) => {
    const response = await api.get(`/AdminTours/${tourId}/guides`);
    return response.data;
  },

  addTourGuide: async (tourId, data) => {
    const response = await api.post(`/AdminTours/${tourId}/guides`, data);
    return response.data;
  },

  updateTourGuide: async (tourId, guideId, data) => {
    const response = await api.put(`/AdminTours/${tourId}/guides/${guideId}`, data);
    return response.data;
  },

  removeTourGuide: async (tourId, guideId) => {
    const response = await api.delete(`/AdminTours/${tourId}/guides/${guideId}`);
    return response.data;
  },

  // Images
  getImages: async (tourId) => {
    const response = await api.get(`/AdminTours/${tourId}/images`);
    return response.data;
  },

  addImage: async (tourId, data) => {
    const response = await api.post(`/AdminTours/${tourId}/images`, data);
    return response.data;
  },

  updateImage: async (tourId, imageId, data) => {
    const response = await api.put(`/AdminTours/${tourId}/images/${imageId}`, data);
    return response.data;
  },

  deleteImage: async (tourId, imageId) => {
    const response = await api.delete(`/AdminTours/${tourId}/images/${imageId}`);
    return response.data;
  },
};

export default tourService;
