import { useState } from 'react';
import { 
  Pencil, 
  Trash2, 
  Eye, 
  Star, 
  MapPin,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const TouristSpotList = ({ 
  spots, 
  isLoading, 
  pagination, 
  onPageChange,
  onEdit, 
  onDelete,
  onView 
}) => {
  const [deleteId, setDeleteId] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa điểm du lịch này?')) {
      setDeleteId(id);
      await onDelete(id);
      setDeleteId(null);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '-';
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  const getRegionLabel = (region) => {
    const labels = {
      'North': 'Miền Bắc',
      'Central': 'Miền Trung',
      'South': 'Miền Nam'
    };
    return labels[region] || region;
  };

  const totalPages = pagination ? Math.ceil(pagination.totalCount / pagination.pageSize) : 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-100 border-b border-gray-200"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 border-b border-gray-100 bg-gray-50"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!spots || spots.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có điểm du lịch nào</h3>
        <p className="text-gray-500">Hãy thêm mới điểm du lịch đầu tiên của bạn</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">
                STT
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ảnh
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tên điểm du lịch
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Vị trí
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Giá vé
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Đánh giá
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {spots.map((spot, index) => (
              <tr 
                key={spot.spotId} 
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-4 text-sm text-gray-500">
                  {(pagination?.pageIndex - 1) * pagination?.pageSize + index + 1}
                </td>
                <td className="px-4 py-4">
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100">
                    {spot.images && spot.images.length > 0 ? (
                      <img 
                        src={spot.images[0]} 
                        alt={spot.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/100x80?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">{spot.name}</h3>
                    {spot.isFeatured && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                        Nổi bật
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-600">
                    {spot.city && <span>{spot.city}</span>}
                    {spot.region && (
                      <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-xs">
                        {getRegionLabel(spot.region)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                    {spot.type}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm font-medium text-gray-800">
                  {formatPrice(spot.ticketPrice)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium text-gray-800">{spot.rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-xs text-gray-500">({spot.reviewCount})</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onView(spot)}
                      className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(spot)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Sửa"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(spot.spotId)}
                      disabled={deleteId === spot.spotId}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Xóa"
                    >
                      {deleteId === spot.spotId ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Hiển thị {(pagination.pageIndex - 1) * pagination.pageSize + 1} đến{' '}
            {Math.min(pagination.pageIndex * pagination.pageSize, pagination.totalCount)} của{' '}
            {pagination.totalCount} kết quả
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.pageIndex - 1)}
              disabled={pagination.pageIndex === 1}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              const isNearCurrent = Math.abs(page - pagination.pageIndex) <= 2;
              
              if (!isNearCurrent && page !== 1 && page !== totalPages) {
                if (page === 2 || page === totalPages - 1) {
                  return <span key={page} className="text-gray-400">...</span>;
                }
                return null;
              }
              
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                    pagination.pageIndex === page
                      ? 'bg-teal-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(pagination.pageIndex + 1)}
              disabled={pagination.pageIndex === totalPages}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TouristSpotList;
