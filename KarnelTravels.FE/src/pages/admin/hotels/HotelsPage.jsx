import { useState, useEffect, useCallback } from 'react';
import { Plus, Eye, X, MapPin, Star, Calendar, DollarSign, Globe, Bed, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import hotelService from '@/services/hotelService';
import HotelList from './components/HotelList';
import HotelEditor from './components/HotelEditor';
import SearchAndFilter from './components/SearchAndFilter';
import RoomManager from './components/RoomManager';
import PriceCalendar from './components/PriceCalendar';
import HotelReviews from './components/HotelReviews';

const HotelsPage = () => {
  // State
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0
  });

  // Filters
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [cities, setCities] = useState([]);
  const [starRating, setStarRating] = useState(null);
  const [isActive, setIsActive] = useState(null);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isRoomManagerOpen, setIsRoomManagerOpen] = useState(false);
  const [isPriceCalendarOpen, setIsPriceCalendarOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHotels();
      fetchCities();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, city, starRating, isActive, pagination.pageIndex]);

  // Fetch hotels
  const fetchHotels = async () => {
    setIsLoading(true);
    try {
      const response = await hotelService.getAll({
        search,
        city,
        starRating,
        isActive,
        page: pagination.pageIndex,
        pageSize: pagination.pageSize
      });

      if (response.success) {
        setHotels(response.data.items || []);
        setPagination(prev => ({
          ...prev,
          totalCount: response.data.totalCount || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
      toast.error('Không thể tải danh sách khách sạn');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch cities for filter
  const fetchCities = async () => {
    try {
      const response = await hotelService.getCities();
      if (response.success) {
        setCities(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, pageIndex: page }));
  };

  // Reset filters
  const handleReset = () => {
    setSearch('');
    setCity('');
    setStarRating(null);
    setIsActive(null);
    setPagination(prev => ({ ...prev, pageIndex: 1 }));
  };

  // Open form for new
  const handleAddNew = () => {
    setSelectedHotel(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  // Open form for edit
  const handleEdit = (hotel) => {
    setSelectedHotel(hotel);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  // View details
  const handleViewDetails = async (hotel) => {
    try {
      const response = await hotelService.getById(hotel.hotelId);
      if (response.success) {
        setSelectedHotel(response.data);
        setIsViewOpen(true);
      }
    } catch (error) {
      console.error('Error fetching hotel details:', error);
      toast.error('Không thể tải chi tiết khách sạn');
    }
  };

  // Handle form submit
  const handleFormSubmit = async (data) => {
    try {
      if (formMode === 'create') {
        const response = await hotelService.create(data);
        if (response.success) {
          toast.success('Tạo khách sạn thành công');
          setIsFormOpen(false);
          fetchHotels();
        }
      } else {
        const response = await hotelService.update(selectedHotel.hotelId, data);
        if (response.success) {
          toast.success('Cập nhật khách sạn thành công');
          setIsFormOpen(false);
          fetchHotels();
        }
      }
    } catch (error) {
      console.error('Error saving hotel:', error);
      toast.error('Lỗi khi lưu khách sạn');
    }
  };

  // Handle delete
  const handleDelete = async (hotel) => {
    if (confirm(`Bạn có chắc chắn muốn xóa khách sạn "${hotel.name}"?`)) {
      try {
        const response = await hotelService.delete(hotel.hotelId);
        if (response.success) {
          toast.success('Xóa khách sạn thành công');
          fetchHotels();
        }
      } catch (error) {
        console.error('Error deleting hotel:', error);
        toast.error('Lỗi khi xóa khách sạn');
      }
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (hotelId) => {
    try {
      const response = await hotelService.toggleStatus(hotelId);
      if (response.success) {
        toast.success(response.message);
        fetchHotels();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Lỗi khi thay đổi trạng thái');
    }
  };

  // Open room manager
  const handleManageRooms = async (hotel) => {
    try {
      const response = await hotelService.getById(hotel.hotelId);
      if (response.success) {
        setSelectedHotel(response.data);
        setIsRoomManagerOpen(true);
      }
    } catch (error) {
      console.error('Error fetching hotel rooms:', error);
      toast.error('Không thể tải thông tin phòng');
    }
  };

  // Open price calendar
  const handleManagePrices = async (hotel, room) => {
    setSelectedHotel(hotel);
    setSelectedRoom(room);
    setIsPriceCalendarOpen(true);
  };

  // Save room changes
  const handleRoomsChange = async (rooms) => {
    // This would need to sync with backend
    console.log('Rooms changed:', rooms);
  };

  // Open reviews
  const handleViewReviews = (hotel) => {
    setSelectedHotel(hotel);
    setIsReviewsOpen(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý khách sạn</h1>
          <p className="text-gray-600 mt-1">F181 - F190: Quản lý khách sạn, phòng và đánh giá</p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          <span>Thêm khách sạn mới</span>
        </button>
      </div>

      {/* Filters */}
      <SearchAndFilter
        search={search}
        onSearchChange={setSearch}
        city={city}
        onCityChange={setCity}
        cities={cities}
        starRating={starRating}
        onStarRatingChange={setStarRating}
        isActive={isActive}
        onIsActiveChange={setIsActive}
        onReset={handleReset}
      />

      {/* Hotel List */}
      <HotelList
        hotels={hotels}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onViewDetails={handleViewDetails}
      />

      {/* Hotel Form Modal */}
      <HotelEditor
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        hotel={selectedHotel}
        onSubmit={handleFormSubmit}
        mode={formMode}
      />

      {/* View Details Modal */}
      {isViewOpen && selectedHotel && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsViewOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-xl font-semibold">{selectedHotel.name}</h2>
                <button onClick={() => setIsViewOpen(false)} className="p-2 hover:bg-gray-100 rounded">
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-4 space-y-6">
                {/* Image Gallery */}
                {selectedHotel.images && selectedHotel.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {selectedHotel.images.slice(0, 4).map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        alt={`${selectedHotel.name} ${idx + 1}`} 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
                
                {/* Hotel Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Thành phố</label>
                    <p className="font-medium">{selectedHotel.city}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Địa chỉ</label>
                    <p className="font-medium">{selectedHotel.address || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Hạng sao</label>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} size={16} className={idx < selectedHotel.starRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Giá</label>
                    <p className="font-medium text-blue-600">
                      {selectedHotel.minPrice ? 
                        `${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedHotel.minPrice)} - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedHotel.maxPrice)}` 
                        : 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Đánh giá</label>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{selectedHotel.rating?.toFixed(1) || '0.0'}</span>
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-sm text-gray-500">({selectedHotel.reviewCount} đánh giá)</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Trạng thái</label>
                    <span className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${
                      selectedHotel.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedHotel.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {selectedHotel.description && (
                  <div>
                    <label className="text-sm text-gray-500">Mô tả</label>
                    <p className="mt-1">{selectedHotel.description}</p>
                  </div>
                )}

                {/* Amenities */}
                {selectedHotel.amenities && selectedHotel.amenities.length > 0 && (
                  <div>
                    <label className="text-sm text-gray-500">Tiện nghi</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedHotel.amenities.map((amenity, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => {
                      setIsViewOpen(false);
                      handleManageRooms(selectedHotel);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center justify-center gap-2"
                  >
                    <Bed size={18} />
                    <span>Quản lý phòng</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsViewOpen(false);
                      handleViewReviews(selectedHotel);
                    }}
                    className="flex-1 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={18} />
                    <span>Xem đánh giá</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Manager Modal */}
      {isRoomManagerOpen && selectedHotel && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsRoomManagerOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div>
                  <h2 className="text-xl font-semibold">Quản lý phòng</h2>
                  <p className="text-sm text-gray-500">{selectedHotel.name}</p>
                </div>
                <button onClick={() => setIsRoomManagerOpen(false)} className="p-2 hover:bg-gray-100 rounded">
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-4">
                <RoomManager
                  hotelId={selectedHotel.hotelId}
                  rooms={selectedHotel.rooms || []}
                  onRoomsChange={handleRoomsChange}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Calendar Modal */}
      <PriceCalendar
        isOpen={isPriceCalendarOpen}
        onClose={() => setIsPriceCalendarOpen(false)}
        hotelId={selectedHotel?.hotelId}
        room={selectedRoom}
        onSave={(availability) => {
          console.log('Saving availability:', availability);
        }}
      />

      {/* Reviews Modal */}
      <HotelReviews
        isOpen={isReviewsOpen}
        onClose={() => setIsReviewsOpen(false)}
        hotelId={selectedHotel?.hotelId}
        hotelName={selectedHotel?.name}
      />
    </div>
  );
};

export default HotelsPage;
