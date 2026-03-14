import { useState, useEffect, useCallback } from 'react';
import { Plus, Eye, X, MapPin, Star, Calendar, DollarSign, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import touristSpotService from '@/services/touristSpotService';
import TouristSpotList from './components/TouristSpotList';
import TouristSpotForm from './components/TouristSpotForm';
import SearchAndFilter from './components/SearchAndFilter';

const TouristSpotsPage = () => {
  // State
  const [spots, setSpots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0
  });

  // Filters
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [type, setType] = useState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSpots();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, region, type, pagination.pageIndex]);

  // Fetch spots
  const fetchSpots = async () => {
    setIsLoading(true);
    try {
      const response = await touristSpotService.getAll({
        search,
        region,
        type,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize
      });

      if (response.success) {
        setSpots(response.data);
        setPagination(prev => ({
          ...prev,
          totalCount: response.pagination?.totalCount || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching spots:', error);
      toast.error('Không thể tải danh sách điểm du lịch');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, pageIndex: page }));
  };

  // Reset filters
  const handleReset = () => {
    setSearch('');
    setRegion('');
    setType('');
    setPagination(prev => ({ ...prev, pageIndex: 1 }));
  };

  // Open form for new
  const handleAddNew = () => {
    setSelectedSpot(null);
    setIsFormOpen(true);
  };

  // Open form for edit
  const handleEdit = (spot) => {
    setSelectedSpot(spot);
    setIsFormOpen(true);
  };

  // View details
  const handleView = (spot) => {
    setSelectedSpot(spot);
    setIsViewOpen(true);
  };

  // Create/Update spot
  const handleSubmitForm = async (data) => {
    try {
      let response;
      if (selectedSpot) {
        response = await touristSpotService.update(selectedSpot.spotId, data);
        toast.success('Cập nhật điểm du lịch thành công');
      } else {
        response = await touristSpotService.create(data);
        toast.success('Thêm mới điểm du lịch thành công');
      }

      if (response.success) {
        setIsFormOpen(false);
        fetchSpots();
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error saving spot:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu');
    }
  };

  // Delete spot
  const handleDelete = async (id) => {
    try {
      const response = await touristSpotService.delete(id);
      if (response.success) {
        toast.success('Xóa điểm du lịch thành công');
        fetchSpots();
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error deleting spot:', error);
      toast.error('Có lỗi xảy ra khi xóa');
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  const getRegionLabel = (region) => {
    const labels = {
      'North': 'Miền Bắc',
      'Central': 'Miền Trung',
      'South': 'Miền Nam'
    };
    return labels[region] || region;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý điểm du lịch</h1>
          <p className="text-gray-500 mt-1">Quản lý và cập nhật các điểm du lịch trong hệ thống</p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Thêm mới
        </button>
      </div>

      {/* Search & Filter */}
      <SearchAndFilter 
        search={search}
        onSearchChange={setSearch}
        region={region}
        onRegionChange={setRegion}
        type={type}
        onTypeChange={setType}
        onReset={handleReset}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-800">{pagination.totalCount}</div>
          <div className="text-sm text-gray-500">Tổng số điểm</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {spots.filter(s => s.region === 'North').length}
          </div>
          <div className="text-sm text-gray-500">Miền Bắc</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-teal-600">
            {spots.filter(s => s.region === 'Central').length}
          </div>
          <div className="text-sm text-gray-500">Miền Trung</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {spots.filter(s => s.region === 'South').length}
          </div>
          <div className="text-sm text-gray-500">Miền Nam</div>
        </div>
      </div>

      {/* List */}
      <TouristSpotList 
        spots={spots}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Form Modal */}
      <TouristSpotForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitForm}
        spot={selectedSpot}
        isLoading={isLoading}
      />

      {/* View Modal */}
      {isViewOpen && selectedSpot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsViewOpen(false)}
          />
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Chi tiết điểm du lịch</h2>
              <button
                onClick={() => setIsViewOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Images */}
              {selectedSpot.images && selectedSpot.images.length > 0 && (
                <div className="mb-6">
                  <div className="grid grid-cols-2 gap-2">
                    {selectedSpot.images.slice(0, 4).map((img, index) => (
                      <div key={index} className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <img 
                          src={img} 
                          alt={`${selectedSpot.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/400x300?text=No+Image';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{selectedSpot.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedSpot.isFeatured && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 mr-1" />
                          Nổi bật
                        </span>
                      )}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                        {selectedSpot.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">{selectedSpot.rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-gray-500">({selectedSpot.reviewCount})</span>
                  </div>
                </div>

                {selectedSpot.description && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">Mô tả</h4>
                    <p className="text-gray-700">{selectedSpot.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{selectedSpot.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span>{getRegionLabel(selectedSpot.region)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span>{formatPrice(selectedSpot.ticketPrice)}</span>
                  </div>
                  {selectedSpot.bestTime && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{selectedSpot.bestTime}</span>
                    </div>
                  )}
                </div>

                {selectedSpot.address && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">Địa chỉ</h4>
                    <p className="text-gray-700">{selectedSpot.address}</p>
                  </div>
                )}

                {selectedSpot.latitude && selectedSpot.longitude && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">Tọa độ</h4>
                    <p className="text-gray-700 font-mono text-sm">
                      {selectedSpot.latitude}, {selectedSpot.longitude}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setIsViewOpen(false);
                  handleEdit(selectedSpot);
                }}
                className="px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                Sửa thông tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TouristSpotsPage;
