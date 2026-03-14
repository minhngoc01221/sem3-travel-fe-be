import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  RefreshCw, 
  TrendingUp, 
  Calendar,
  Users,
  Mail,
  Search
} from 'lucide-react';
import StatsGrid from './components/StatsGrid';
import RevenueChart from './components/RevenueChart';
import RecentBookingsTable from './components/RecentBookingsTable';
import NotificationToast from './components/NotificationToast';
import { dashboardService } from '@/services/dashboardService';

const DashboardPage = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [bookingsData, setBookingsData] = useState([]);
  const [unreadContacts, setUnreadContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, chartRes, bookingsRes, contactsRes] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getRevenueChart(),
        dashboardService.getRecentBookings(),
        dashboardService.getUnreadContacts()
      ]);

      if (summaryRes.success) setSummaryData(summaryRes.data);
      if (chartRes.success) setChartData(chartRes.data);
      if (bookingsRes.success) setBookingsData(bookingsRes.data);
      if (contactsRes.success) setUnreadContacts(contactsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simulate real-time notification (in real app, this would come from SignalR)
  useEffect(() => {
    fetchDashboardData();

    // Simulate a new booking notification after 10 seconds
    const timer = setTimeout(() => {
      const mockNotification = {
        bookingId: 'BK-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        bookingCode: 'BK-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        customerName: 'Nguyễn Văn A',
        serviceName: 'Tour Đà Nẵng - Hội An 4N3Đ',
        totalAmount: 4990000,
        createdAt: new Date().toISOString()
      };
      setNotification(mockNotification);
      setShowNotification(true);

      // Auto hide after 8 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 8000);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Toast */}
      <NotificationToast 
        notification={notification}
        isVisible={showNotification}
        onClose={handleCloseNotification}
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-sm text-gray-500">Tổng quan hệ thống quản lý du lịch</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="pl-10 pr-4 py-2 w-64 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadContacts.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadContacts.length}
                </span>
              )}
            </button>

            {/* Refresh Button */}
            <button 
              onClick={fetchDashboardData}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Stats Grid - F161-F166 */}
        <div className="mb-6">
          <StatsGrid data={summaryData} loading={loading} />
        </div>

        {/* Revenue Chart - F168 */}
        <div className="mb-6">
          <RevenueChart data={chartData} loading={loading} />
        </div>

        {/* Recent Bookings Table - F167 */}
        <div className="mb-6">
          <RecentBookingsTable data={bookingsData} loading={loading} />
        </div>

        {/* Unread Contacts - F169 */}
        {unreadContacts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-800">Liên hệ chưa đọc</h3>
                <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
                  {unreadContacts.length}
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {unreadContacts.slice(0, 3).map((contact, index) => (
                <motion.div
                  key={contact.contactId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-gray-800">{contact.fullName}</h4>
                        <span className="text-xs text-gray-500">
                          {new Date(contact.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{contact.message}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {contact.email}
                        </span>
                        {contact.phoneNumber && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            {contact.phoneNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <a 
                href="/admin/contacts" 
                className="text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                Xem tất cả liên hệ →
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
