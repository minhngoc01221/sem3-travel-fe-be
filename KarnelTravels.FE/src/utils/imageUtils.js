const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

/**
 * Chuyển đổi đường dẫn ảnh tương đối thành đường dẫn tuyệt đối
 * @param {string} url - Đường dẫn ảnh từ backend (vd: /uploads/tourist-spots/xxx.jpg)
 * @returns {string} - Đường dẫn đầy đủ (vd: http://localhost:5000/uploads/tourist-spots/xxx.jpg)
 */
export const getImageUrl = (url) => {
  if (!url) return null;
  
  // Nếu đã là URL đầy đủ (bắt đầu bằng http:// hoặc https://)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Nếu là đường dẫn tương đối, thêm API base URL
  return `${API_BASE_URL}${url}`;
};

/**
 * Lọc và chuyển đổi danh sách ảnh
 * @param {string[]} images - Mảng đường dẫn ảnh
 * @returns {string[]} - Mảng đường dẫn đầy đủ
 */
export const getImageUrls = (images) => {
  if (!Array.isArray(images)) return [];
  return images.map(img => getImageUrl(img));
};
