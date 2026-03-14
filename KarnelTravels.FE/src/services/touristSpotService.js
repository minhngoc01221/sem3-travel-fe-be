import api from './api';

const touristSpotService = {
  // Lấy danh sách có phân trang, tìm kiếm và lọc
  getAll: async (params = {}) => {
    const { search, region, type, sortBy, sortOrder = 'ASC', pageIndex = 1, pageSize = 10 } = params;
    
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (region) queryParams.append('region', region);
    if (type) queryParams.append('type', type);
    if (sortBy) queryParams.append('sortBy', sortBy);
    if (sortOrder) queryParams.append('sortOrder', sortOrder);
    queryParams.append('pageIndex', pageIndex.toString());
    queryParams.append('pageSize', pageSize.toString());

    const response = await api.get(`/TouristSpots?${queryParams.toString()}`);
    return response.data;
  },

  // Lấy chi tiết một điểm du lịch
  getById: async (id) => {
    const response = await api.get(`/TouristSpots/${id}`);
    return response.data;
  },

  // Tạo mới điểm du lịch
  create: async (data) => {
    const response = await api.post('/TouristSpots', data);
    return response.data;
  },

  // Cập nhật điểm du lịch
  update: async (id, data) => {
    const response = await api.put(`/TouristSpots/${id}`, data);
    return response.data;
  },

  // Xóa điểm du lịch (xóa mềm)
  delete: async (id) => {
    const response = await api.delete(`/TouristSpots/${id}`);
    return response.data;
  },

  // Upload một ảnh
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/TouristSpots/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload nhiều ảnh
  uploadImages: async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    const response = await api.post('/TouristSpots/upload-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default touristSpotService;
