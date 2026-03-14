import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  MoreVertical,
  Mail,
  Phone
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    'Pending': { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-700',
      icon: AlertCircle,
      label: 'Chờ xác nhận'
    },
    'Confirmed': { 
      bg: 'bg-blue-100', 
      text: 'text-blue-700',
      icon: CheckCircle2,
      label: 'Đã xác nhận'
    },
    'Completed': { 
      bg: 'bg-green-100', 
      text: 'text-green-700',
      icon: CheckCircle2,
      label: 'Hoàn thành'
    },
    'Cancelled': { 
      bg: 'bg-red-100', 
      text: 'text-red-700',
      icon: XCircle,
      label: 'Đã hủy'
    }
  };

  const config = statusConfig[status] || statusConfig['Pending'];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const TypeBadge = ({ type }) => {
  const typeConfig = {
    'Tour': { bg: 'bg-purple-100', text: 'text-purple-700' },
    'Hotel': { bg: 'bg-blue-100', text: 'text-blue-700' },
    'Resort': { bg: 'bg-teal-100', text: 'text-teal-700' },
    'Transport': { bg: 'bg-orange-100', text: 'text-orange-700' },
    'Restaurant': { bg: 'bg-pink-100', text: 'text-pink-700' }
  };

  const config = typeConfig[type] || { bg: 'bg-gray-100', text: 'text-gray-700' };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {type}
    </span>
  );
};

const RecentBookingsTable = ({ data, loading }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Đơn hàng gần đây</h3>
            <p className="text-sm text-gray-500">5 đơn hàng mới nhất</p>
          </div>
          <a 
            href="/admin/bookings" 
            className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
          >
            Xem tất cả
          </a>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Mã đơn
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Dịch vụ
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tổng tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-6 py-4">
                    <div className="h-6 bg-gray-100 rounded animate-pulse"></div>
                  </td>
                </tr>
              ))
            ) : data?.length > 0 ? (
              data.map((booking, index) => (
                <motion.tr
                  key={booking.bookingId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-teal-600">
                      {booking.bookingCode}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800">
                        {booking.customerName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {booking.customerEmail}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 max-w-[150px] truncate block">
                      {booking.serviceName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TypeBadge type={booking.type} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-800">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        maximumFractionDigits: 0
                      }).format(booking.totalAmount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Chưa có đơn hàng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default RecentBookingsTable;
