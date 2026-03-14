import { useState, useEffect } from 'react';
import { Plus, Map, Clock, DollarSign, Users, Calendar, Edit, Trash2, Eye, Search, Filter, List, Image, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import tourService from '@/services/tourService';

const TourDashboard = ({ onEditTour, onViewDetails, onOpenItinerary, onOpenDeparture, onOpenInclusion }) => {
  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async () => {
    setIsLoading(true);
    try {
      const res = await tourService.getAll();
      if (res.success) {
        setTours(res.data || []);
      }
    } catch (error) {
      console.error('Error loading tours:', error);
      toast.error('Không thể tải danh sách tour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTour = async (tourId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tour này?')) return;

    try {
      const res = await tourService.delete(tourId);
      if (res.success) {
        toast.success('Xóa tour thành công');
        loadTours();
      } else {
        toast.error(res.message || 'Không thể xóa tour');
      }
    } catch (error) {
      console.error('Error deleting tour:', error);
      toast.error('Lỗi khi xóa tour');
    }
  };

  const filteredTours = tours.filter(tour => {
    const matchesSearch = tour.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tour.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      Draft: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Nháp' },
      Published: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Đã đăng' },
      Active: { bg: 'bg-green-100', text: 'text-green-600', label: 'Hoạt động' },
      Paused: { bg: 'bg-yellow-100', text: 'text-yellow-600', label: 'Tạm dừng' },
      Archived: { bg: 'bg-red-100', text: 'text-red-600', label: 'Lưu trữ' }
    };
    const config = statusConfig[status] || statusConfig.Draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Tour</h2>
          <p className="text-gray-500 mt-1">Danh sách và quản lý các tour du lịch</p>
        </div>
        <button
          onClick={() => onEditTour(null)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm Tour Mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tour..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Draft">Nháp</option>
            <option value="Published">Đã đăng</option>
            <option value="Active">Hoạt động</option>
            <option value="Paused">Tạm dừng</option>
            <option value="Archived">Lưu trữ</option>
          </select>
        </div>
      </div>

      {/* Tours Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-500">Đang tải...</p>
          </div>
        ) : filteredTours.length === 0 ? (
          <div className="p-8 text-center">
            <Map className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Không tìm thấy tour nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Thời lượng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Giá sàn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Đặt chỗ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Khởi hành
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTours.map((tour) => (
                  <tr key={tour.tourId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {tour.thumbnailUrl ? (
                          <img
                            src={tour.thumbnailUrl}
                            alt={tour.name}
                            className="w-16 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Map className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{tour.name}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {tour.description?.substring(0, 50)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{tour.durationDays} ngày {tour.durationNights} đêm</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-teal-600 font-semibold">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatPrice(tour.basePrice)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(tour.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{tour.bookingCount || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{tour.totalDepartures || 0} đợt</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewDetails(tour)}
                          className="p-2 text-gray-400 hover:text-teal-500 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onOpenItinerary(tour)}
                          className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Lịch trình"
                        >
                          <List className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onOpenDeparture(tour)}
                          className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Ngày khởi hành"
                        >
                          <Calendar className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onOpenInclusion(tour)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Dịch vụ"
                        >
                          <BookOpen className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onEditTour(tour)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTour(tour.tourId)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TourDashboard;
