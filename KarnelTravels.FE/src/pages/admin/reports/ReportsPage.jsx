import { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Calendar, 
  TrendingUp, 
  Users, 
  CalendarDays,
  DollarSign,
  RefreshCw,
  Filter,
  Package,
  MapPin
} from 'lucide-react';
import * as XLSX from 'xlsx';
import bookingService from '@/services/bookingService';
import { dashboardService } from '@/services/dashboardService';
import toast from 'react-hot-toast';

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [bookingsData, setCalendarDayssData] = useState([]);
  const [reportType, setReportType] = useState('overview');

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, revenueRes] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getRevenueChart()
      ]);

      if (summaryRes.success) {
        setStats(summaryRes.data);
      }

      if (revenueRes.success) {
        setRevenueData(revenueRes.data || []);
      }

      // Fetch booking statistics
      const bookingStats = await bookingService.getStatistics({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      if (bookingStats.success) {
        setCalendarDayssData(bookingStats.data?.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      let dataToExport = [];
      let sheetName = '';
      let fileName = '';

      switch (reportType) {
        case 'bookings':
          const bookingRes = await fetch(`https://localhost:5000/api/adminbookings?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          const bookings = await bookingRes.json();
          dataToExport = bookings.data?.map(b => ({
            'Mã đơn': b.bookingId,
            'Khách hàng': b.userName || b.user?.fullName || '-',
            'Email': b.userEmail || b.user?.email || '-',
            'Số điện thoại': b.userPhone || b.user?.phoneNumber || '-',
            'Loại tour': b.tourType || b.type || '-',
            'Tên tour': b.tourName || b.tour?.name || '-',
            'Ngày đặt': new Date(b.bookingDate).toLocaleDateString('vi-VN'),
            'Ngày bắt đầu': b.startDate ? new Date(b.startDate).toLocaleDateString('vi-VN') : '-',
            'Số người lớn': b.adultCount || b.adults || 0,
            'Số trẻ em': b.childCount || b.children || 0,
            'Tổng tiền': b.totalAmount || b.totalPrice || 0,
            'Trạng thái': getStatusLabel(b.status),
            'Thành phố': b.hotelCity || '-'
          })) || [];
          sheetName = 'Danh sách đơn đặt';
          fileName = `danh_sach_don_dat_${dateRange.startDate}_${dateRange.endDate}`;
          break;

        case 'revenue':
          dataToExport = revenueData.map(item => ({
            'Tháng': item.month || item.label,
            'Doanh thu': item.revenue || item.value || 0,
            'Số đơn': item.bookings || 0
          }));
          sheetName = 'Doanh thu theo tháng';
          fileName = `doanh_thu_${dateRange.startDate}_${dateRange.endDate}`;
          break;

        case 'customers':
          const usersRes = await fetch('https://localhost:5000/api/adminusers?pageSize=1000', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          const users = await usersRes.json();
          dataToExport = users.data?.map(u => ({
            'Mã user': u.id,
            'Họ tên': u.fullName,
            'Email': u.email,
            'Số điện thoại': u.phoneNumber || '-',
            'Ngày tạo': new Date(u.createdAt).toLocaleDateString('vi-VN'),
            'Vai trò': u.role,
            'Trạng thái': u.isLocked ? 'Bị khóa' : 'Hoạt động'
          })) || [];
          sheetName = 'Danh sách khách hàng';
          fileName = `danh_sach_khach_hang_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'services':
          // Combined services report
          const hotelsRes = await fetch('https://localhost:5000/api/adminhotels?pageSize=1000', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          const hotels = await hotelsRes.json();
          const hotelsData = hotels.data?.map(h => ({
            'Loại': 'Khách sạn',
            'Tên': h.name,
            'Thành phố': h.city,
            'Số sao': h.starRating,
            'Giá từ': h.minPrice,
            'Trạng thái': h.isActive ? 'Hoạt động' : 'Ngừng'
          })) || [];

          const toursRes = await fetch('https://localhost:5000/api/admintours', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          const tours = await toursRes.json();
          const toursData = tours.data?.map(t => ({
            'Loại': 'Tour',
            'Tên': t.name,
            'Thành phố': t.destination,
            'Số sao': t.rating,
            'Giá từ': t.basePrice,
            'Trạng thái': t.status
          })) || [];

          dataToExport = [...hotelsData, ...toursData];
          sheetName = 'Danh sách dịch vụ';
          fileName = `danh_sach_dich_vu_${new Date().toISOString().split('T')[0]}`;
          break;

        default:
          // Overview
          dataToExport = [{
            'Chỉ tiêu': 'Tổng doanh thu',
            'Giá trị': stats?.totalRevenue || 0
          }, {
            'Chỉ tiêu': 'Số đơn đặt',
            'Giá trị': stats?.totalCalendarDayss || 0
          }, {
            'Chỉ tiêu': 'Số khách hàng',
            'Giá trị': stats?.totalUsers || 0
          }, {
            'Chỉ tiêu': 'Số khách sạn',
            'Giá trị': stats?.totalHotels || 0
          }, {
            'Chỉ tiêu': 'Số tour',
            'Giá trị': stats?.totalTours || 0
          }];
          sheetName = 'Tổng quan';
          fileName = `tong_quan_${dateRange.startDate}_${dateRange.endDate}`;
      }

      // Create Excel file
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      
      // Auto-size columns
      const colWidths = Object.keys(dataToExport[0] || {}).map(key => ({
        wch: Math.max(key.length, ...dataToExport.map(row => String(row[key] || '').length)) + 2
      }));
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, `${fileName}.xlsx`);
      toast.success('Xuất Excel thành công!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Lỗi khi xuất file Excel');
    } finally {
      setExporting(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'Pending': 'Chờ xác nhận',
      'Confirmed': 'Đã xác nhận',
      'Completed': 'Hoàn thành',
      'Cancelled': 'Đã hủy',
      'InProgress': 'Đang thực hiện'
    };
    return labels[status] || status;
  };

  const reportTypes = [
    { id: 'overview', label: 'Tổng quan', icon: TrendingUp },
    { id: 'bookings', label: 'Đơn đặt', icon: CalendarDays },
    { id: 'revenue', label: 'Doanh thu', icon: DollarSign },
    { id: 'customers', label: 'Khách hàng', icon: Users },
    { id: 'services', label: 'Dịch vụ', icon: Package }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
          <p className="text-gray-500">Xem và xuất báo cáo doanh thu, đơn đặt, khách hàng</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          <button
            onClick={exportToExcel}
            disabled={exporting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
          >
            {exporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Từ ngày:</span>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Đến ngày:</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Loại báo cáo:</span>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {reportTypes.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.totalRevenue?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '0 ₫'}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Số đơn đặt</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.totalCalendarDayss || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Khách hàng</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.totalUsers || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tỷ lệ hoàn thành</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.completionRate || 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {reportTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                  reportType === type.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <type.icon className="w-4 h-4" />
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-teal-500" />
            </div>
          ) : (
            <>
              {/* CalendarDayss Report */}
              {reportType === 'bookings' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Danh sách đơn đặt</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">Mã đơn</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">Khách hàng</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">Loại tour</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">Ngày đặt</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">Tổng tiền</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {bookingsData.slice(0, 10).map(booking => (
                          <tr key={booking.bookingId} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{booking.bookingId}</td>
                            <td className="px-4 py-3">{booking.userName || booking.user?.fullName || '-'}</td>
                            <td className="px-4 py-3">{booking.tourType || '-'}</td>
                            <td className="px-4 py-3">
                              {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('vi-VN') : '-'}
                            </td>
                            <td className="px-4 py-3">
                              {(booking.totalAmount || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                booking.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                booking.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {getStatusLabel(booking.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Revenue Report */}
              {reportType === 'revenue' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Doanh thu theo tháng</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {revenueData.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500">{item.month || item.label}</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          {(item.revenue || item.value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.bookings || 0} đơn
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers Report */}
              {reportType === 'customers' && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Chọn "Xuất Excel" để tải danh sách khách hàng</p>
                </div>
              )}

              {/* Services Report */}
              {reportType === 'services' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-teal-50 rounded-lg p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Khách sạn</p>
                        <p className="text-2xl font-bold text-gray-900">{stats?.totalHotels || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tour du lịch</p>
                        <p className="text-2xl font-bold text-gray-900">{stats?.totalTours || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Overview */}
              {reportType === 'overview' && (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Tổng quan hệ thống đã hiển thị ở trên</p>
                  <p className="text-sm text-gray-400 mt-2">Chọn "Xuất Excel" để tải báo cáo tổng quan</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
