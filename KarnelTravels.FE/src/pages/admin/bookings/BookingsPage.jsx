import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Download, RefreshCw, Calendar, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import bookingService from '@/services/bookingService';
import BookingList from './components/BookingList';
import BookingDetailModal from './components/BookingDetailModal';

const BookingsPage = () => {
  // State
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0
  });

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal state
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Statistics
  const [statistics, setStatistics] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings();
      fetchStatistics();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, status, type, startDate, endDate, pagination.pageIndex]);

  // Fetch bookings
  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await bookingService.getAll({
        search,
        status: status || null,
        type: type || null,
        startDate: startDate || null,
        endDate: endDate || null,
        page: pagination.pageIndex,
        pageSize: pagination.pageSize
      });

      if (response.success) {
        setBookings(response.data.items || []);
        setPagination(prev => ({
          ...prev,
          totalCount: response.data.totalCount || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Không thể tải danh sách đơn đặt');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await bookingService.getStatistics({
        startDate: startDate || null,
        endDate: endDate || null,
        type: type || null
      });

      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, pageIndex: page }));
  };

  // Handle view details
  const handleViewDetails = async (booking) => {
    setIsDetailLoading(true);
    setIsDetailOpen(true);
    try {
      const response = await bookingService.getById(booking.bookingId);
      if (response.success) {
        setSelectedBooking(response.data);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Không thể tải chi tiết đơn đặt');
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Handle confirm
  const handleConfirm = async (bookingId) => {
    if (!confirm('Bạn có chắc chắn muốn xác nhận đơn đặt này?')) return;
    
    try {
      const response = await bookingService.confirm(bookingId);
      if (response.success) {
        toast.success('Xác nhận đơn đặt thành công');
        fetchBookings();
        if (isDetailOpen && selectedBooking?.bookingId === bookingId) {
          setSelectedBooking(prev => ({ ...prev, status: 1 }));
        }
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast.error(response.message || 'Không thể xác nhận đơn đặt');
    }
  };

  // Handle cancel
  const handleCancel = async (bookingId) => {
    const reason = prompt('Nhập lý do hủy đơn:');
    if (reason === null) return; // User cancelled prompt
    
    try {
      const response = await bookingService.cancel(bookingId, reason || 'Không có lý do');
      if (response.success) {
        toast.success('Hủy đơn đặt thành công');
        fetchBookings();
        if (isDetailOpen && selectedBooking?.bookingId === bookingId) {
          setSelectedBooking(prev => ({ ...prev, status: 3, cancellationReason: reason }));
        }
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(response.message || 'Không thể hủy đơn đặt');
    }
  };

  // Handle send email
  const handleSendEmail = async (bookingId) => {
    try {
      const response = await bookingService.sendConfirmation(bookingId);
      if (response.success) {
        toast.success('Gửi email xác nhận thành công');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Không thể gửi email xác nhận');
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const response = await bookingService.export({
        search,
        status: status || null,
        type: type || null,
        startDate: startDate || null,
        endDate: endDate || null
      });
      
      if (response.success) {
        toast.success('Xuất dữ liệu thành công');
      }
    } catch (error) {
      console.error('Error exporting bookings:', error);
      toast.error('Không thể xuất dữ liệu');
    }
  };

  // Handle reset filters
  const handleReset = () => {
    setSearch('');
    setStatus('');
    setType('');
    setStartDate('');
    setEndDate('');
    setPagination(prev => ({ ...prev, pageIndex: 1 }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0 
    }).format(price || 0);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn đặt</h1>
          <p className="text-gray-600 mt-1">F191 - F200: Quản lý đơn đặt và thống kê</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download size={20} />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Doanh thu</p>
                <p className="text-xl font-bold text-gray-900">{formatPrice(statistics.totalRevenue)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock size={24} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Chờ xác nhận</p>
                <p className="text-xl font-bold text-gray-900">{statistics.pendingCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CheckCircle size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Đã xác nhận</p>
                <p className="text-xl font-bold text-gray-900">{statistics.confirmedCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Hoàn thành</p>
                <p className="text-xl font-bold text-gray-900">{statistics.completedCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle size={24} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Đã hủy</p>
                <p className="text-xl font-bold text-gray-900">{statistics.cancelledCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, email, mã đặt..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-48">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="0">Chờ xác nhận</option>
              <option value="1">Đã xác nhận</option>
              <option value="2">Hoàn thành</option>
              <option value="3">Đã hủy</option>
              <option value="4">Đã hoàn tiền</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="w-48">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả loại</option>
              <option value="0">Tour</option>
              <option value="1">Khách sạn</option>
              <option value="2">Resort</option>
              <option value="3">Phương tiện</option>
              <option value="4">Nhà hàng</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Từ ngày"
              />
            </div>
            <span className="text-gray-400">-</span>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Đến ngày"
              />
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw size={18} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Booking List */}
      <BookingList
        bookings={bookings}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onViewDetails={handleViewDetails}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onSendEmail={handleSendEmail}
        onExport={handleExport}
      />

      {/* Booking Detail Modal */}
      <BookingDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        booking={selectedBooking}
        isLoading={isDetailLoading}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onSendEmail={handleSendEmail}
      />
    </div>
  );
};

export default BookingsPage;
