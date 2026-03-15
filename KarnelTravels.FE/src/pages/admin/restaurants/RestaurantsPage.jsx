import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Star, MapPin, Phone, Clock, UtensilsCrossed, DollarSign, X, Check, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import restaurantService from '@/services/restaurantService';
import SearchAndFilter from '@/components/common/SearchAndFilter/SearchAndFilter';
import StatusToggle from '@/components/common/StatusToggle/StatusToggle';
import CitySelect from '@/components/common/CitySelect/CitySelect';

// Cuisine Types matching backend enum
const CUISINE_TYPES = [
  { value: 0, label: 'Việt Nam', icon: '🇻🇳' },
  { value: 1, label: 'Trung Quốc', icon: '🇨🇳' },
  { value: 2, label: 'Nhật Bản', icon: '🇯🇵' },
  { value: 3, label: 'Hàn Quốc', icon: '🇰🇷' },
  { value: 4, label: 'Thái Lan', icon: '🇹🇭' },
  { value: 5, label: 'Ấn Độ', icon: '🇮🇳' },
  { value: 6, label: 'Ý', icon: '🇮🇹' },
  { value: 7, label: 'Pháp', icon: '🇫🇷' },
  { value: 8, label: 'Mỹ', icon: '🇺🇸' },
  { value: 9, label: 'Hải sản', icon: '🦐' },
  { value: 10, label: 'Nướng', icon: '🍖' },
  { value: 11, label: 'Buffet', icon: '🍽️' },
  { value: 12, label: 'Cafe', icon: '☕' },
  { value: 13, label: 'Bar', icon: '🍸' },
  { value: 16, label: 'Khác', icon: '🍴' }
];

const PRICE_RANGES = [
  { value: 0, label: 'Bình dân', range: '< 100k' },
  { value: 1, label: 'Trung bình', range: '100k - 300k' },
  { value: 2, label: 'Cao cấp', range: '300k - 500k' },
  { value: 3, label: 'Sang trọng', range: '500k - 1M' },
  { value: 4, label: 'Premium', range: '> 1M' }
];

const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    cuisineType: 0,
    priceLevel: 0,
    openingTime: '',
    closingTime: '',
    contactPhone: '',
    images: [],
    hasReservation: true,
    isFeatured: false
  });

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    setLoading(true);
    try {
      const res = await restaurantService.getAll();
      if (res.success) {
        setRestaurants(res.data || []);
      }
    } catch (error) {
      console.error('Error loading restaurants:', error);
      toast.error('Lỗi khi tải danh sách nhà hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    setLoading(true);
    try {
      const res = await restaurantService.search({ 
        searchTerm: term,
        ...filters 
      });
      if (res.success) {
        setRestaurants(res.data || []);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    setLoading(true);
    try {
      const res = await restaurantService.search({ 
        searchTerm,
        ...newFilters 
      });
      if (res.success) {
        setRestaurants(res.data || []);
      }
    } catch (error) {
      console.error('Error filtering:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        cuisineType: parseInt(formData.cuisineType),
        priceLevel: parseInt(formData.priceLevel),
        openingTime: formData.openingTime || null,
        closingTime: formData.closingTime || null
      };

      let res;
      if (editingRestaurant) {
        res = await restaurantService.update(editingRestaurant.restaurantId, submitData);
      } else {
        res = await restaurantService.create(submitData);
      }

      if (res.success) {
        toast.success(editingRestaurant ? 'Cập nhật nhà hàng thành công' : 'Tạo nhà hàng thành công');
        setShowModal(false);
        resetForm();
        loadRestaurants();
      } else {
        toast.error(res.message || 'Lỗi khi lưu nhà hàng');
      }
    } catch (error) {
      console.error('Error saving restaurant:', error);
      toast.error('Lỗi khi lưu nhà hàng');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa nhà hàng này?')) return;

    try {
      const res = await restaurantService.delete(id);
      if (res.success) {
        toast.success('Xóa nhà hàng thành công');
        loadRestaurants();
      } else {
        toast.error(res.message || 'Không thể xóa nhà hàng');
      }
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast.error('Lỗi khi xóa nhà hàng');
    }
  };

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name || '',
      description: restaurant.description || '',
      address: restaurant.address || '',
      city: restaurant.city || '',
      cuisineType: CUISINE_TYPES.find(c => c.label === restaurant.cuisineType)?.value ?? 0,
      priceLevel: PRICE_RANGES.find(p => p.label === restaurant.priceLevel)?.value ?? 0,
      openingTime: restaurant.openingTime || '',
      closingTime: restaurant.closingTime || '',
      contactPhone: restaurant.contactPhone || '',
      images: restaurant.images || [],
      hasReservation: restaurant.hasReservation ?? true,
      isFeatured: restaurant.isFeatured ?? false
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingRestaurant(null);
    setFormData({
      name: '',
      description: '',
      address: '',
      city: '',
      cuisineType: 0,
      priceLevel: 0,
      openingTime: '',
      closingTime: '',
      contactPhone: '',
      images: [],
      hasReservation: true,
      isFeatured: false
    });
  };

  const getCuisineLabel = (value) => CUISINE_TYPES.find(c => c.value === value)?.label || 'Khác';
  const getPriceLabel = (value) => PRICE_RANGES.find(p => p.value === value)?.label || 'Bình dân';

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formDataImg = new FormData();
      formDataImg.append('file', file);

      const token = localStorage.getItem('token');
      const res = await fetch('https://localhost:5000/api/upload', {
        method: 'POST',
        body: formDataImg,
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      const imageUrl = data.url || data.data?.url;
      
      setFormData({
        ...formData,
        images: [...formData.images, imageUrl]
      });
      toast.success('Tải ảnh thành công');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Lỗi khi tải ảnh');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({...formData, images: newImages});
  };

  const filterOptions = {
    cuisineType: {
      label: 'Loại ẩm thực',
      type: 'select',
      options: CUISINE_TYPES.map(c => ({ value: c.value, label: `${c.icon} ${c.label}` }))
    },
    priceRange: {
      label: 'Mức giá',
      type: 'select',
      options: PRICE_RANGES.map(p => ({ value: p.value, label: `${p.label} (${p.range})` }))
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Nhà hàng</h1>
          <p className="text-gray-500 mt-1">Quản lý thông tin nhà hàng, thực đơn và đặt bàn</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
        >
          <Plus className="w-5 h-5" />
          Thêm nhà hàng
        </button>
      </div>

      {/* Search and Filter */}
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        filters={filters}
        onFilterChange={handleFilterChange}
        placeholder="Tìm tên nhà hàng..."
        filterOptions={filterOptions}
      />

      {/* Restaurant List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-500">Đang tải...</p>
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có nhà hàng nào</p>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="mt-3 text-teal-500 hover:underline"
          >
            Thêm nhà hàng đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map((restaurant) => (
            <div key={restaurant.restaurantId} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="h-40 bg-gray-100 relative">
                {restaurant.images && restaurant.images.length > 0 ? (
                  <img src={restaurant.images[0]} alt={restaurant.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UtensilsCrossed className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                {restaurant.isFeatured && (
                  <span className="absolute top-2 left-2 px-2 py-1 bg-yellow-400 text-white text-xs font-medium rounded">
                    Nổi bật
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{restaurant.name}</h3>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">{restaurant.rating || 0}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{restaurant.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4" />
                    <span>{getCuisineLabel(parseInt(restaurant.cuisineType) || 0)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>{getPriceLabel(parseInt(restaurant.priceLevel) || 0)}</span>
                  </div>
                  {restaurant.openingTime && restaurant.closingTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{restaurant.openingTime} - {restaurant.closingTime}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(restaurant)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100"
                  >
                    <Edit className="w-4 h-4" />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(restaurant.restaurantId)}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingRestaurant ? 'Chỉnh sửa nhà hàng' : 'Thêm nhà hàng mới'}
              </h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhà hàng *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Nhà hàng ABC"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Mô tả về nhà hàng..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="123 Đường ABC, Quận XYZ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố *</label>
                  <CitySelect
                    value={formData.city}
                    onChange={(city) => setFormData({...formData, city})}
                    placeholder="Chọn thành phố"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại ẩm thực</label>
                  <select
                    value={formData.cuisineType}
                    onChange={(e) => setFormData({...formData, cuisineType: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {CUISINE_TYPES.map(c => (
                      <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mức giá</label>
                  <select
                    value={formData.priceLevel}
                    onChange={(e) => setFormData({...formData, priceLevel: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {PRICE_RANGES.map(p => (
                      <option key={p.value} value={p.value}>{p.label} ({p.range})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giờ mở cửa</label>
                  <input
                    type="time"
                    value={formData.openingTime}
                    onChange={(e) => setFormData({...formData, openingTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giờ đóng cửa</label>
                  <input
                    type="time"
                    value={formData.closingTime}
                    onChange={(e) => setFormData({...formData, closingTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0123 456 789"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.hasReservation}
                    onChange={(e) => setFormData({...formData, hasReservation: e.target.checked})}
                    className="w-4 h-4 text-teal-500 rounded border-gray-300 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">Cho phép đặt bàn</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                    className="w-4 h-4 text-teal-500 rounded border-gray-300 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">Nhà hàng nổi bật</span>
                </label>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
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
                      <span>Đang tải...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Tải ảnh lên</span>
                    </>
                  )}
                </button>

                {formData.images && formData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img src={img} alt={`Restaurant ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                >
                  {editingRestaurant ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantsPage;
