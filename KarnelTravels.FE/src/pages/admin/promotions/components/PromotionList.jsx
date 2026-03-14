import { useState } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getPaginationRowModel,
  getSortedRowModel,
  flexRender 
} from '@tanstack/react-table';
import { 
  Edit, Trash2, Eye, Home, ToggleLeft, ToggleRight,
  ChevronLeft, ChevronRight, Tag, Calendar, Percent
} from 'lucide-react';

const STATUS_CONFIG = {
  active: { label: 'Hoạt động', color: 'bg-green-100 text-green-700 border-green-200' },
  expired: { label: 'Hết hạn', color: 'bg-red-100 text-red-700 border-red-200' },
  upcoming: { label: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  inactive: { label: 'Không hoạt động', color: 'bg-gray-100 text-gray-700 border-gray-200' }
};

const TARGET_TYPE_CONFIG = {
  0: { label: 'Tất cả', color: 'text-gray-600' },
  1: { label: 'Tour', color: 'text-purple-600' },
  2: { label: 'Khách sạn', color: 'text-blue-600' },
  3: { label: 'Resort', color: 'text-teal-600' },
  4: { label: 'Phương tiện', color: 'text-orange-600' },
  5: { label: 'Nhà hàng', color: 'text-red-600' }
};

const PromotionList = ({ 
  promotions = [], 
  isLoading = false,
  pagination = { pageIndex: 1, pageSize: 10, totalCount: 0 },
  onPageChange,
  onViewDetails,
  onEdit,
  onDelete,
  onToggleShowOnHome
}) => {
  const [sorting, setSorting] = useState([]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0 
    }).format(price || 0);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusInfo = (promotion) => {
    if (promotion.isExpired) return { key: 'expired', ...STATUS_CONFIG.expired };
    if (promotion.isUpcoming) return { key: 'upcoming', ...STATUS_CONFIG.upcoming };
    if (!promotion.isActive) return { key: 'inactive', ...STATUS_CONFIG.inactive };
    return { key: 'active', ...STATUS_CONFIG.active };
  };

  const columns = [
    {
      accessorKey: 'code',
      header: 'Mã KM',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900 flex items-center gap-2">
          <Tag size={16} className="text-purple-500" />
          {row.original.code}
        </div>
      )
    },
    {
      accessorKey: 'title',
      header: 'Tên khuyến mãi',
      cell: ({ row }) => (
        <div className="max-w-[250px]">
          <div className="font-medium text-gray-900 truncate">{row.original.title}</div>
          {row.original.description && (
            <div className="text-sm text-gray-500 truncate">{row.original.description}</div>
          )}
        </div>
      )
    },
    {
      accessorKey: 'discountValue',
      header: 'Giảm giá',
      cell: ({ row }) => {
        const isPercentage = row.original.discountType === 0;
        return (
          <div className="font-semibold text-gray-900">
            {isPercentage ? (
              <span className="flex items-center gap-1">
                <Percent size={14} className="text-green-600" />
                {row.original.discountValue}%
              </span>
            ) : (
              formatPrice(row.original.discountValue)
            )}
          </div>
        );
      }
    },
    {
      accessorKey: 'startDate',
      header: 'Thời hạn',
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Calendar size={14} className="text-gray-400" />
            <span>{formatDate(row.original.startDate)}</span>
          </div>
          <div className="text-gray-500">→ {formatDate(row.original.endDate)}</div>
        </div>
      )
    },
    {
      accessorKey: 'targetType',
      header: 'Áp dụng cho',
      cell: ({ row }) => {
        const config = TARGET_TYPE_CONFIG[row.original.targetType] || TARGET_TYPE_CONFIG[0];
        return (
          <span className={`font-medium ${config.color}`}>
            {config.label}
          </span>
        );
      }
    },
    {
      accessorKey: 'isActive',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const status = getStatusInfo(row.original);
        return (
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${status.color}`}>
            {status.label}
          </span>
        );
      }
    },
    {
      accessorKey: 'showOnHome',
      header: 'Trang chủ',
      cell: ({ row }) => {
        return (
          <button
            onClick={() => onToggleShowOnHome?.(row.original.promotionId)}
            className={`p-2 rounded-lg transition-colors ${
              row.original.showOnHome 
                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
            title={row.original.showOnHome ? 'Bật hiển thị trang chủ' : 'Tắt hiển thị trang chủ'}
          >
            {row.original.showOnHome ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
          </button>
        );
      }
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onViewDetails?.(row.original)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Xem chi tiết"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={() => onEdit?.(row.original)}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Chỉnh sửa"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => onDelete?.(row.original)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Xóa"
            >
              <Trash2 size={18} />
            </button>
          </div>
        );
      }
    }
  ];

  const table = useReactTable({
    data: promotions,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(pagination.totalCount / pagination.pageSize)
  });

  const handlePreviousPage = () => {
    if (pagination.pageIndex > 1) {
      onPageChange?.(pagination.pageIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.pageIndex < Math.ceil(pagination.totalCount / pagination.pageSize)) {
      onPageChange?.(pagination.pageIndex + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id}
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                  >
                    {header.isPlaceholder 
                      ? null 
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <Tag size={48} className="text-gray-300 mb-2" />
                    <p>Không có khuyến mãi nào</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id} 
                  className={`hover:bg-gray-50 transition-colors ${
                    row.original.isExpired ? 'bg-red-50/50' : 
                    row.original.isUpcoming ? 'bg-blue-50/50' : ''
                  }`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td 
                      key={cell.id}
                      className="px-6 py-4"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalCount > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị {((pagination.pageIndex - 1) * pagination.pageSize) + 1} - {Math.min(pagination.pageIndex * pagination.pageSize, pagination.totalCount)} của {pagination.totalCount} khuyến mãi
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={pagination.pageIndex === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 py-2 text-sm font-medium">
              Trang {pagination.pageIndex} / {Math.ceil(pagination.totalCount / pagination.pageSize)}
            </span>
            <button
              onClick={handleNextPage}
              disabled={pagination.pageIndex >= Math.ceil(pagination.totalCount / pagination.pageSize)}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionList;
