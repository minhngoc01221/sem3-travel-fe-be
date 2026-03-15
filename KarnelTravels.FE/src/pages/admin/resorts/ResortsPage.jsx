import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Star, MapPin, Home, Palmtree, Waves, Dumbbell, X, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import resortService from '@/services/resortService';
import SearchAndFilter from '@/components/common/SearchAndFilter/SearchAndFilter';
import CitySelect from '@/components/common/CitySelect/CitySelect';

// Resort Types matching backend enum
const RESORT_TYPES = [
  { value: 0, label: 'Biển', icon: <Waves className="w-4 h-4" /> },
  { value: 1, label: 'Núi', icon: <Palmtree className="w-4 h-4" /> },
  { value: 2, label: 'Hồ', icon: <Waves className="w-4 h-4" /> },
  { value: 3, label: 'Đảo', icon: <Palmtree className="w-4 h-4" /> },
  { value: 4, label: 'Sinh thái', icon: <Palmtree className="w-4 h-4" /> },
  { value: 5, label: 'Spa', icon: <Home className="w-4 h-4" /> },
  { value: 6, label: 'Thành phố', icon: <Home className="w-4 h-4" /> },
  { value: 7, label: 'Miền quê', icon: <Palmtree className="w-4 h-4" /> }
];

// Amenities matching backend enum
const AMENITIES = [
  { value: 0, label: 'Hồ bơi', icon: <Waves className="w-4 h-4" /> },
  { value: 1, label: 'Spa', icon: <Home className="w-4 h-4" /> },
  { value: 2, label: 'Gym', icon: <Dumbbell className="w-4 h-4" /> },
  { value: 3, label: 'Bar', icon: <Home className="w-4 h-4" /> },
  { value: 4, label: 'Kids Club', icon: <Home className="w-4 h-4" /> },
  { value: 5, label: 'Tennis', icon: <Home className="w-4 h-4" /> },
  { value: 6, label: 'Golf', icon: <Home className="w-4 h-4" /> },
  { value: 7, label: 'Biển riêng', icon: <Waves className="w-4 h-4" /> },
  { value: 8, label: 'Room Service', icon: <Home className="w-4 h-4" /> },
  { value: 9, label: 'Wifi', icon: <Home className="w-4 h-4" /> },
  { value: 10, label: 'Bãi đỗ xe', icon: <Home className="w-4 h-4" /> }
];

const ResortsPage = () => {
  const [resorts, setResorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingResort, setEditingResort] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    locationType: 0,
    starRating: 3,
    images: [],
    amenities: [],
    isFeatured: false
  });

  useEffect(() => {
    loadResorts();
  }, []);

  const loadResorts = async () => {
    setLoading(true);
    try {
      const res = await resortService.getAll();
      if (res.success) {
        setResorts(res.data || []);
      }
    } catch (error) {
      console.error('Error loading resorts:', error);
      toast.error('Lỗi khi tải danh sách resort');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    setLoading(true);
    try {
      const res = await resortService.search({ 
        searchTerm: term,
        ...filters 
      });
      if (res.success) {
        setResorts(res.data || []);
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
      const res = await resortService.search({ 
        searchTerm,
        ...newFilters 
      });
      if (res.success) {
        setResorts(res.data || []);
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
        locationType: parseInt(formData.locationType),
        starRating: parseInt(formData.starRating)
      };

      let res;
      if (editingResort) {
        res = await resortService.update(editingResort.resortId, submitData);
      } else {
        res = await resortService.create(submitData);
      }

      if (res.success) {
        toast.success(editingResort ? 'Cập nhật resort thành công' : 'Tạo resort thành công');
        setShowModal(false);
        resetForm();
        loadResorts();
      } else {
        toast.error(res.message || 'Lỗi khi lưu resort');
      }
    } catch (error) {
      console.error('Error saving resort:', error);
      toast.error('Lỗi khi lưu resort');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa resort này?')) return;

    try {
      const res = await resortService.delete(id);
      if (res.success) {
        toast.success('Xóa resort thành công');
        loadResorts();
      } else {
        toast.error(res.message || 'Không thể xóa resort');
      }
    } catch (error) {
      console.error('Error deleting resort:', error);
      toast.error('Lỗi khi xóa resort');
    }
  };

  const handleEdit = (resort) => {
    setEditingResort(resort);
    setFormData({
      name: resort.name || '',
      description: resort.description || '',
      address: resort.address || '',
      city: resort.city || '',
      locationType: RESORT_TYPES.find(r => r.label === resort.locationType)?.value ?? 0,
      starRating: resort.starRating || 3,
      images: resort.images || [],
      amenities: resort.amenities || [],
      isFeatured: resort.isFeatured ?? false
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingResort(null);
    setFormData({
      name: '',
      description: '',
      address: '',
      city: '',
      locationType: 0,
      starRating: 3,
      images: [],
      amenities: [],
      isFeatured: false
    });
  };

  const getLocationTypeLabel = (value) => RESORT_TYPES.find(r => r.value === value)?.label || 'Khác';

  const toggleAmenity = (amenityValue) => {
    const currentAmenities = formData.amenities || [];
    const newAmenities = currentAmenities.includes(amenityValue)
      ? currentAmenities.filter(a => a !== amenityValue)
      : [...currentAmenities, amenityValue];
    setFormData({...formData, amenities: newAmenities});
  };

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
    resortType: {
      label: 'Loại hình',
      type: 'select',
      options: RESORT_TYPES.map(r => ({ value: r.value, label: `${r.label}` }))
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Resort</h1>
          <p className="text-gray-500 mt-1">Quản lý thông tin resort, phòng và tiện nghi</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
        >
          <Plus className="w-5 h-5" />
          Thêm Resort
        </button>
      </div>

      {/* Search and Filter */}
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        filters={filters}
        onFilterChange={handleFilterChange}
        placeholder="Tìm tên resort..."
        filterOptions={filterOptions}
      />

      {/* Resort List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-500">Đang tải...</p>
        </div>
      ) : resorts.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <Palmtree className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có resort nào</p>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="mt-3 text-teal-500 hover:underline"
          >
            Thêm resort đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resorts.map((resort) => (
            <div key={resort.resortId} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="h-40 bg-gray-100 relative">
                {resort.images && resort.images.length > 0 ? (
                  <img src={resort.images[0]} alt={resort.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Palmtree className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                {resort.isFeatured && (
                  <span className="absolute top-2 left-2 px-2 py-1 bg-yellow-400 text-white text-xs font-medium rounded">
                    Nổi bật
                  </span>
                )}
                <span className="absolute top-2 right-2 px-2 py-1 bg-teal-500 text-white text-xs font-medium rounded flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  {resort.starRating}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{resort.name}</h3>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">{resort.rating || 0}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{resort.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palmtree className="w-4 h-4" />
                    <span>{getLocationTypeLabel(parseInt(resort.locationType) || 0)}</span>
                  </div>
                  {resort.amenities && resort.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {resort.amenities.slice(0, 3).map((amenity, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-xs rounded">
                          {amenity}
                        </span>
                      ))}
                      {resort.amenities.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-xs rounded">
                          +{resort.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(resort)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100"
                  >
                    <Edit className="w-4 h-4" />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(resort.resortId)}
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
                {editingResort ? 'Chỉnh sửa resort' : 'Thêm Resort mới'}
              </h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên Resort *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Resort ABC"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Mô tả về resort..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="123 Đường ABC"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại hình</label>
                  <select
                    value={formData.locationType}
                    onChange={(e) => setFormData({...formData, locationType: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {RESORT_TYPES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số sao</label>
                  <select
                    value={formData.starRating}
                    onChange={(e) => setFormData({...formData, starRating: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {[1,2,3,4,5].map(star => (
                      <option key={star} value={star}>{star} sao</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amenities Checkboxes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tiện nghi</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {AMENITIES.map(amenity => (
                    <label key={amenity.value} className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.amenities?.includes(amenity.value) || false}
                        onChange={() => toggleAmenity(amenity.value)}
                        className="w-4 h-4 text-teal-500 rounded border-gray-300 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700">{amenity.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                    className="w-4 h-4 text-teal-500 rounded border-gray-300 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">Resort nổi bật</span>
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
                        <img src={img} alt={`Resort ${index + 1}`} className="w-full h-full object-cover" />
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
                  {editingResort ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResortsPage;
