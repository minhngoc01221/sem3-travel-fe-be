import { motion } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { DollarSign, TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        <p className="text-sm text-green-600 font-medium">
          Doanh thu: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(payload[0].value)}
        </p>
        <p className="text-sm text-blue-600">
          Đơn hàng: {payload[0].payload.bookingCount}
        </p>
      </div>
    );
  }
  return null;
};

const RevenueChart = ({ data, loading }) => {
  const chartData = data?.monthlyRevenues?.map(item => ({
    ...item,
    revenue: item.revenue
  })) || [];

  const totalRevenue = data?.totalYearRevenue || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Doanh thu 12 tháng</h3>
          <p className="text-sm text-gray-500">Thống kê doanh thu theo từng tháng</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-sm font-semibold text-green-600">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(totalRevenue)}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="h-[300px] bg-gray-100 rounded-lg animate-pulse"></div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="monthName" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickFormatter={(value) => `${value / 1000000}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="revenue" 
              fill="url(#colorRevenue)" 
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
};

export default RevenueChart;
