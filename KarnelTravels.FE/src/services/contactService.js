import api from './api';

const contactService = {
  // Get all contacts with pagination and filters (F211, F216, F217)
  getAll: async ({ 
    page = 1, 
    pageSize = 10, 
    search = '', 
    isRead = null,
    status = null
  } = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('pageSize', pageSize);
    if (search) params.append('search', search);
    if (isRead !== null) params.append('isRead', isRead);
    if (status !== null) params.append('status', status);

    const response = await api.get(`/admincontacts?${params.toString()}`);
    return response.data;
  },

  // Get contact by ID (F212)
  getById: async (id) => {
    const response = await api.get(`/admincontacts/${id}`);
    return response.data;
  },

  // Update read status (F213)
  updateReadStatus: async (id) => {
    const response = await api.patch(`/admincontacts/${id}/read-status`);
    return response.data;
  },

  // Mark as read
  markAsRead: async (id) => {
    return contactService.updateReadStatus(id);
  },

  // Reply to contact (F214)
  reply: async (id, replyMessage) => {
    const response = await api.post(`/admincontacts/${id}/reply`, { replyMessage });
    return response.data;
  },

  // Delete contact (F215)
  delete: async (id) => {
    const response = await api.delete(`/admincontacts/${id}`);
    return response.data;
  },

  // Export contacts (F218)
  export: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.isRead !== null) params.append('isRead', filters.isRead);
    if (filters.status !== null) params.append('status', filters.status);
    params.append('format', 'csv');

    const response = await api.get(`/admincontacts/export?${params.toString()}`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `contacts_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true };
  },

  // Get statistics
  getStatistics: async () => {
    const response = await api.get('/admincontacts/statistics');
    return response.data;
  }
};

export default contactService;
