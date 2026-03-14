import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { getImageUrl } from '@/utils/imageUtils';
import { 
  X, 
  ImagePlus, 
  Loader2,
  MapPin,
  Star,
  Globe,
  DollarSign,
  Calendar,
  Upload,
  CloudUpload
} from 'lucide-react';
import touristSpotService from '@/services/touristSpotService';
import toast from 'react-hot-toast';

const TouristSpotForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  spot, 
  isLoading 
}) => {
  const [images, setImages] = useState([]);
  const [imageInput, setImageInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset,
    setValue,
    watch
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      region: '',
      type: '',
      address: '',
      city: '',
      latitude: '',
      longitude: '',
      ticketPrice: '',
      bestTime: '',
      isFeatured: false
    }
  });

  const watchedImages = watch('images');

  useEffect(() => {
    if (spot) {
      reset({
        name: spot.name || '',
        description: spot.description || '',
        region: spot.region || '',
        type: spot.type || '',
        address: spot.address || '',
        city: spot.city || '',
        latitude: spot.latitude || '',
        longitude: spot.longitude || '',
        ticketPrice: spot.ticketPrice || '',
        bestTime: spot.bestTime || '',
        isFeatured: spot.isFeatured || false
      });
      setImages(spot.images || []);
    } else {
      reset({
        name: '',
        description: '',
        region: '',
        type: '',
        address: '',
        city: '',
        latitude: '',
        longitude: '',
        ticketPrice: '',
        bestTime: '',
        isFeatured: false
      });
      setImages([]);
    }
  }, [spot, reset, isOpen]);

  const handleAddImage = () => {
    if (imageInput.trim()) {
      const newImages = [...images, imageInput.trim()];
      setImages(newImages);
      setValue('images', newImages);
      setImageInput('');
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setValue('images', newImages);
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(file => touristSpotService.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      
      // Lọc và chỉ lấy các upload thành công (HTTP 2xx và success=true)
      const uploadedUrls = results
        .filter(r => r && r.success === true && r.data?.url)
        .map(r => r.data.url);
      
      if (uploadedUrls.length > 0) {
        const newImages = [...images, ...uploadedUrls];
        setImages(newImages);
        setValue('images', newImages);
        toast.success(`Đã tải lên ${uploadedUrls.length} ảnh`);
      } else {
        // Tất cả đều thất bại
        toast.error('Không thể tải ảnh lên. Vui lòng đăng nhập với tài khoản Admin.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      // Kiểm tra lỗi cụ thể
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Bạn không có quyền tải ảnh lên. Vui lòng đăng nhập với tài khoản Admin.');
      } else {
        toast.error('Lỗi khi tải ảnh lên');
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const submitData = {
        ...data,
        images: images.length > 0 ? images : null,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        ticketPrice: data.ticketPrice ? parseFloat(data.ticketPrice) : null,
        isFeatured: data.isFeatured || false
      };
      await onSubmit(submitData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const regions = [
    { value: 'North', label: 'Miền Bắc' },
    { value: 'Central', label: 'Miền Trung' },
    { value: 'South', label: 'Miền Nam' }
  ];

  const spotTypes = [
    'Beach',
    'Mountain',
    'Historical',
    'Waterfall',
    'Cultural',
    'Adventure',
    'Nature',
    'Urban'
  ];

  const bestTimes = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
    'Spring', 'Summer', 'Autumn', 'Winter', 'All Year'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">
            {spot ? 'Cập nhật điểm du lịch' : 'Thêm mới điểm du lịch'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tên điểm du lịch <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('name', { required: 'Vui lòng nhập tên điểm du lịch' })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập tên điểm du lịch"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mô tả
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Mô tả về điểm du lịch"
              />
            </div>

            {/* Region & Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Vùng miền <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('region', { required: 'Vui lòng chọn vùng miền' })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all ${
                    errors.region ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Chọn vùng miền</option>
                  {regions.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                {errors.region && (
                  <p className="mt-1 text-sm text-red-500">{errors.region.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Loại hình <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('type', { required: 'Vui lòng chọn loại hình' })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all ${
                    errors.type ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Chọn loại hình</option>
                  {spotTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>
            </div>

            {/* Address & City */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Địa chỉ
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    {...register('address')}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                    placeholder="Số nhà, đường, phường/xã"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Thành phố/Tỉnh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('city', { required: 'Vui lòng nhập thành phố/tỉnh' })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ví dụ: Đà Nẵng, Hà Nội"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>
            </div>

            {/* Latitude & Longitude */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Vĩ độ (Latitude)
                </label>
                <input
                  type="number"
                  step="any"
                  {...register('latitude')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ví dụ: 16.0544"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kinh độ (Longitude)
                </label>
                <input
                  type="number"
                  step="any"
                  {...register('longitude')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ví dụ: 108.2022"
                />
              </div>
            </div>

            {/* Ticket Price & Best Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Giá vé (VND)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="1000"
                    {...register('ticketPrice')}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Thời điểm tốt nhất
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    {...register('bestTime')}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                  >
                    <option value="">Chọn thời điểm</option>
                    {bestTimes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Hình ảnh
              </label>
              
              {/* Upload Button */}
              <div className="mb-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 text-gray-600 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang tải ảnh lên...</span>
                    </>
                  ) : (
                    <>
                      <CloudUpload className="w-5 h-5" />
                      <span>Tải ảnh từ máy tính</span>
                    </>
                  )}
                </button>
              </div>

              {/* URL Input */}
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  placeholder="Hoặc nhập URL hình ảnh và nhấn Enter"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <ImagePlus className="w-4 h-4" />
                  Thêm
                </button>
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {images.map((img, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={getImageUrl(img)} 
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/100x100?text=Error';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Is Featured */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isFeatured"
                {...register('isFeatured')}
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                Đánh dấu là điểm du lịch nổi bật
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  {spot ? 'Cập nhật' : 'Thêm mới'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TouristSpotForm;
