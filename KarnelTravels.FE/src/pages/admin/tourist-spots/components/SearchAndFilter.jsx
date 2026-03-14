import { Search, Filter, X, RotateCcw } from 'lucide-react';

const SearchAndFilter = ({ 
  search, 
  onSearchChange, 
  region, 
  onRegionChange,
  type, 
  onTypeChange,
  onReset 
}) => {
  const regions = [
    { value: '', label: 'Tất cả vùng miền' },
    { value: 'North', label: 'Miền Bắc' },
    { value: 'Central', label: 'Miền Trung' },
    { value: 'South', label: 'Miền Nam' }
  ];

  const types = [
    { value: '', label: 'Tất cả loại hình' },
    { value: 'Beach', label: 'Biển' },
    { value: 'Mountain', label: 'Núi' },
    { value: 'Historical', label: 'Lịch sử' },
    { value: 'Waterfall', label: 'Thác nước' },
    { value: 'Cultural', label: 'Văn hóa' },
    { value: 'Adventure', label: 'Phiêu lưu' },
    { value: 'Nature', label: 'Thiên nhiên' },
    { value: 'Urban', label: 'Đô thị' }
  ];

  const hasFilters = search || region || type;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm theo tên hoặc địa điểm..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Region Filter */}
          <div className="relative">
            <select
              value={region}
              onChange={(e) => onRegionChange(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-white min-w-[160px]"
            >
              {regions.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={type}
              onChange={(e) => onTypeChange(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-white min-w-[160px]"
            >
              {types.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Reset Button */}
          {hasFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Đặt lại</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <span className="text-sm text-gray-500">Lọc:</span>
          {search && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">
              "{search}"
              <button onClick={() => onSearchChange('')} className="hover:text-teal-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {region && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {regions.find(r => r.value === region)?.label}
              <button onClick={() => onRegionChange('')} className="hover:text-blue-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {type && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              {types.find(t => t.value === type)?.label}
              <button onClick={() => onTypeChange('')} className="hover:text-purple-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;
