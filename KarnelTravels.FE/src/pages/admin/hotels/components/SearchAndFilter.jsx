import { Search, Filter, X } from 'lucide-react';

const SearchAndFilter = ({ 
  search = '', 
  onSearchChange,
  city = '',
  onCityChange,
  cities = [],
  starRating = null,
  onStarRatingChange,
  isActive = null,
  onIsActiveChange,
  onReset 
}) => {
  const starRatings = [1, 2, 3, 4, 5];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm khách sạn..."
              value={search}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* City Filter */}
        <div className="w-full lg:w-48">
          <select
            value={city}
            onChange={(e) => onCityChange?.(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">Tất cả thành phố</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Star Rating Filter */}
        <div className="w-full lg:w-40">
          <select
            value={starRating || ''}
            onChange={(e) => onStarRatingChange?.(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">Tất cả sao</option>
            {starRatings.map((star) => (
              <option key={star} value={star}>{star} sao</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full lg:w-40">
          <select
            value={isActive === null ? '' : isActive.toString()}
            onChange={(e) => {
              const value = e.target.value;
              onIsActiveChange?.(value === '' ? null : value === 'true');
            }}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Hoạt động</option>
            <option value="false">Không hoạt động</option>
          </select>
        </div>

        {/* Reset Button */}
        {(search || city || starRating !== null || isActive !== null) && (
          <button
            onClick={onReset}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <X size={18} />
            <span>Xóa lọc</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchAndFilter;
