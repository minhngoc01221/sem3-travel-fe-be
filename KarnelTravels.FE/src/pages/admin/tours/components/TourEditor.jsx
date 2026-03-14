import { useState, useEffect } from 'react';
import { X, Save, Upload, Image as ImageIcon, Plus, Trash2, MapPin, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import tourService from '@/services/tourService';

const TourEditor = ({ tour, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    durationDays: 1,
    durationNights: 1,
    basePrice: 0,
    status: 'Draft',
    thumbnailUrl: '',
    highlights: '',
    terms: '',
    cancellationPolicy: '',
    isFeatured: false,
    isDomestic: true
  });

  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (tour) {
      setFormData({
        name: tour.name || '',
        description: tour.description || '',
        durationDays: tour.durationDays || 1,
        durationNights: tour.durationNights || 1,
        basePrice: tour.basePrice || 0,
        status: tour.status || 'Draft',
        thumbnailUrl: tour.thumbnailUrl || '',
        highlights: tour.highlights?.join('\n') || '',
        terms: tour.terms || '',
        cancellationPolicy: tour.cancellationPolicy || '',
        isFeatured: tour.isFeatured || false,
        isDomestic: tour.isDomestic !== undefined ? tour.isDomestic : true
      });
      loadImages();
    }
  }, [tour]);

  const loadImages = async () => {
    if (!tour?.tourId) return;
    try {
      const res = await tourService.getImages(tour.tourId);
      if (res.success) {
        setImages(res.data || []);
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Convert status string to enum int
      const statusMap = {
        'Draft': 0,
        'Published': 1,
        'Active': 2,
        'Paused': 3,
        'Archived': 4
      };

      const submitData = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        durationDays: parseInt(formData.durationDays),
        durationNights: parseInt(formData.durationNights),
        highlights: formData.highlights.split('\n').filter(h => h.trim()),
        status: typeof formData.status === 'number' ? formData.status : (statusMap[formData.status] ?? 0),
        isDomestic: formData.isDomestic === true || formData.isDomestic === 'true'
      };

      let res;
      if (tour?.tourId) {
        res = await tourService.update(tour.tourId, submitData);
      } else {
        res = await tourService.create(submitData);
      }

      if (res.success) {
        toast.success(tour ? 'Cập nhật tour thành công' : 'Tạo tour thành công');
        onSaved?.(res.data);
      } else {
        toast.error(res.message || 'Lỗi khi lưu tour');
      }
    } catch (error) {
      console.error('Error saving tour:', error);
      toast.error('Lỗi khi lưu tour');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddImage = async () => {
    if (!tour?.tourId) {
      toast.error('Vui lòng lưu tour trước khi thêm hình ảnh');
      return;
    }

    const imageUrl = prompt('Nhập URL hình ảnh:');
    if (!imageUrl) return;

    try {
      const res = await tourService.addImage(tour.tourId, {
        imageUrl,
        displayOrder: images.length,
        isPrimary: images.length === 0
      });
      if (res.success) {
        setImages([...images, res.data]);
        toast.success('Thêm hình ảnh thành công');
      }
    } catch (error) {
      toast.error('Lỗi khi thêm hình ảnh');
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Bạn có chắc muốn xóa hình ảnh này?')) return;

    try {
      const res = await tourService.deleteImage(tour.tourId, imageId);
      if (res.success) {
        setImages(images.filter(img => img.imageId !== imageId));
        toast.success('Xóa hình ảnh thành công');
      }
    } catch (error) {
      toast.error('Lỗi khi xóa hình ảnh');
    }
  };

  const handleSetPrimaryImage = async (imageId) => {
    try {
      const res = await tourService.updateImage(tour.tourId, imageId, { isPrimary: true });
      if (res.success) {
        setImages(images.map(img => ({
          ...img,
          isPrimary: img.imageId === imageId
        })));
        toast.success('Đặt ảnh bìa thành công');
      }
    } catch (error) {
      toast.error('Lỗi khi đặt ảnh bìa');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            {tour ? 'Chỉnh sửa Tour' : 'Tạo Tour Mới'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên Tour *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Tour du lịch Đà Nẵng 3 ngày 2 đêm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Mô tả chi tiết về tour..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số ngày *</label>
                <input
                  type="number"
                  name="durationDays"
                  min="1"
                  required
                  value={formData.durationDays}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số đêm *</label>
                <input
                  type="number"
                  name="durationNights"
                  min="0"
                  required
                  value={formData.durationNights}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá sàn (VND) *</label>
              <input
                type="number"
                name="basePrice"
                min="0"
                step="1000"
                required
                value={formData.basePrice}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Draft">Nháp</option>
                <option value="Published">Đã đăng</option>
                <option value="Active">Hoạt động</option>
                <option value="Paused">Tạm dừng</option>
                <option value="Archived">Lưu trữ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại tour</label>
              <select
                name="isDomestic"
                value={String(formData.isDomestic)}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="true">Trong nước</option>
                <option value="false">Quốc tế</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isFeatured"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 text-teal-500 border-gray-300 rounded focus:ring-teal-500"
              />
              <label htmlFor="isFeatured" className="text-sm text-gray-700">Tour nổi bật</label>
            </div>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Hình ảnh bìa</label>
            <div className="flex gap-2">
              <input
                type="url"
                name="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="https://example.com/image.jpg"
              />
              {formData.thumbnailUrl && (
                <div className="w-16 h-12 rounded-lg overflow-hidden border border-gray-200">
                  <img src={formData.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Highlights */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Điểm nổi bật (mỗi dòng một điểm)</label>
            <textarea
              name="highlights"
              rows={4}
              value={formData.highlights}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Tham quan Bà Nà Hills&#10;Nghỉ dưỡng tại biển Mỹ Khê&#10;Khám phá phố cổ Hội An"
            />
          </div>

          {/* Terms & Policy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Điều kiện</label>
              <textarea
                name="terms"
                rows={3}
                value={formData.terms}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Điều kiện áp dụng..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chính sách hủy</label>
              <textarea
                name="cancellationPolicy"
                rows={3}
                value={formData.cancellationPolicy}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Chính sách hủy tour..."
              />
            </div>
          </div>

          {/* Gallery */}
          {tour?.tourId && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Thư viện hình ảnh</label>
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-teal-600 hover:bg-teal-50 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  Thêm hình
                </button>
              </div>
              {images.length > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                  {images.map((img) => (
                    <div key={img.imageId} className="relative group">
                      <img
                        src={img.imageUrl}
                        alt={img.caption || 'Tour image'}
                        className={`w-full h-24 object-cover rounded-lg ${img.isPrimary ? 'ring-2 ring-teal-500' : ''}`}
                      />
                      {img.isPrimary && (
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-teal-500 text-white text-xs rounded">Bìa</span>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        {!img.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(img.imageId)}
                            className="p-1.5 bg-white rounded-lg"
                            title="Đặt làm ảnh bìa"
                          >
                            <Star className="w-4 h-4 text-yellow-500" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.imageId)}
                          className="p-1.5 bg-white rounded-lg"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                  <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Chưa có hình ảnh nào</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu Tour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TourEditor;
