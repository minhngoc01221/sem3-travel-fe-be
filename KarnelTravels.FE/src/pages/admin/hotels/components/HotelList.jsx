import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useReactTable, 
  getCoreRowModel, 
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender 
} from '@tanstack/react-table';
import { 
  Eye, Edit, Trash2, Star, MapPin, 
  ChevronLeft, ChevronRight, MoreVertical,
  ToggleLeft, ToggleRight, Bed
} from 'lucide-react';
import toast from 'react-hot-toast';

const HotelList = ({ 
  hotels = [], 
  isLoading = false,
  pagination = { pageIndex: 1, pageSize: 10, totalCount: 0 },
  onPageChange,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewDetails 
}) => {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState([]);

  const columns = [
    {
      accessorKey: 'name',
      header: 'Tên khách sạn',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
            {row.original.images?.[0] ? (
              <img 
                src={row.original.images[0]} 
                alt={row.original.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Star size={20} />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.original.name}</p>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span>{row.original.starRating} sao</span>
            </div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'city',
      header: 'Thành phố',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1 text-gray-600">
          <MapPin size={16} />
          <span>{getValue()}</span>
        </div>
      )
    },
    {
      accessorKey: 'minPrice',
      header: 'Giá',
      cell: ({ row }) => (
        <div className="text-gray-900 font-medium">
          {row.original.minPrice ? (
            <>
              {new Intl.NumberFormat('vi-VN', { 
                style: 'currency', 
                currency: 'VND' 
              }).format(row.original.minPrice)}
              {row.original.maxPrice && row.original.maxPrice !== row.original.minPrice && (
                <span className="text-gray-500 text-sm"> - {new Intl.NumberFormat('vi-VN', { 
                  style: 'currency', 
                  currency: 'VND' 
                }).format(row.original.maxPrice)}</span>
              )}
            </>
          ) : (
            <span className="text-gray-400">Chưa có giá</span>
          )}
        </div>
      )
    },
    {
      accessorKey: 'roomCount',
      header: 'Phòng',
      cell: ({ getValue }) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
          {getValue()} loại phòng
        </span>
      )
    },
    {
      accessorKey: 'rating',
      header: 'Đánh giá',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <span className="font-medium">{row.original.rating?.toFixed(1) || '0.0'}</span>
          <Star size={16} className="text-yellow-400 fill-yellow-400" />
          <span className="text-gray-500 text-sm">({row.original.reviewCount})</span>
        </div>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'Trạng thái',
      cell: ({ row }) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus?.(row.original.hotelId);
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            row.original.isActive 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
          disabled={isLoading}
        >
          {row.original.isActive ? (
            <>
              <ToggleRight size={18} />
              <span>Hoạt động</span>
            </>
          ) : (
            <>
              <ToggleLeft size={18} />
              <span>Không hoạt động</span>
            </>
          )}
        </button>
      )
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/hotels/${row.original.hotelId}/rooms`)}
            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            title="Quản lý phòng"
          >
            <Bed size={18} />
          </button>
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
      )
    }
  ];

  const table = useReactTable({
    data: hotels,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
                    <Star size={48} className="text-gray-300 mb-2" />
                    <p>Không có khách sạn nào</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onViewDetails?.(row.original)}
                >
                  {row.getVisibleCells().map(cell => (
                    <td 
                      key={cell.id}
                      className="px-6 py-4"
                      onClick={(e) => e.stopPropagation()}
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
            Hiển thị {((pagination.pageIndex - 1) * pagination.pageSize) + 1} - {Math.min(pagination.pageIndex * pagination.pageSize, pagination.totalCount)} của {pagination.totalCount} khách sạn
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

export default HotelList;
