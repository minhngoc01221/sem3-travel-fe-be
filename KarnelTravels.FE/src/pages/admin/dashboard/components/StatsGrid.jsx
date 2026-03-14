import { motion } from 'framer-motion';
import { 
  MapPin, 
  Building2, 
  Utensils, 
  Palmtree, 
  Receipt,
  Users,
  Ticket,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const stats = [
  {
    id: 'destinations',
    title: 'Điểm du lịch',
    value: 0,
    icon: MapPin,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600'
  },
  {
    id: 'hotels',
    title: 'Khách sạn',
    value: 0,
    icon: Building2,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600'
  },
  {
    id: 'restaurants',
    title: 'Nhà hàng',
    value: 0,
    icon: Utensils,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600'
  },
  {
    id: 'resorts',
    title: 'Resort',
    value: 0,
    icon: Palmtree,
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-50',
    iconColor: 'text-teal-600'
  },
  {
    id: 'todayBookings',
    title: 'Đơn hàng hôm nay',
    value: 0,
    icon: Receipt,
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-50',
    iconColor: 'text-cyan-600'
  },
  {
    id: 'monthlyRevenue',
    title: 'Doanh thu tháng',
    value: 0,
    icon: TrendingUp,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    isCurrency: true
  }
];

const StatsGrid = ({ data, loading }) => {
  const statsData = [
    {
      ...stats[0],
      value: data?.totalDestinations || 0
    },
    {
      ...stats[1],
      value: data?.totalHotels || 0
    },
    {
      ...stats[2],
      value: data?.totalRestaurants || 0
    },
    {
      ...stats[3],
      value: data?.totalResorts || 0
    },
    {
      ...stats[4],
      value: data?.todayBookingsCount || 0
    },
    {
      ...stats[5],
      value: data?.monthlyRevenue || 0,
      isCurrency: true
    }
  ];

  const formatValue = (value, isCurrency) => {
    if (isCurrency) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
      }).format(value);
    }
    return value?.toLocaleString('vi-VN') || '0';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statsData.map((stat, index) => (
        <motion.div
          key={stat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className={`${stat.bgColor} p-3 rounded-lg`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-green-600">
              <ArrowUpRight className="w-3 h-3" />
              <span>12%</span>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
            {loading ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
            ) : (
              <p className={`text-2xl font-bold text-gray-800 mt-1 ${stat.isCurrency ? 'text-green-600' : ''}`}>
                {formatValue(stat.value, stat.isCurrency)}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsGrid;
