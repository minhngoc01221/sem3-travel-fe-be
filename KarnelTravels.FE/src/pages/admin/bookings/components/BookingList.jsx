import { useState } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getPaginationRowModel,
  getSortedRowModel,
  flexRender 
} from '@tanstack/react-table';
import { 
  Eye, Check, X, Mail, Download,
  ChevronLeft, ChevronRight, Search, Filter,
  Calendar, DollarSign, Clock, User, Building
} from 'lucide-react';

// Status badge configuration
const STATUS_CONFIG = {
  0: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  1: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Check },
  2: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700 border-green-200', icon: Check },
  3: { label: 'Đã hủy', color: 'bg-red-100 text-red-700 border-red-200', icon: X },
  4: { label: 'Đã hoàn tiền', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: DollarSign }
};

const TYPE_CONFIG = {
  0: { label: 'Tour', icon: Building },
  1: { label: 'Khách sạn', icon: Building },
  2: { label: 'Resort', icon: Building },
  3: { label: 'Phương tiện', icon: Building },
  4: { label: 'Nhà hàng', icon: Building }
};

const PAYMENT_STATUS_CONFIG = {
  0: { label: 'Chờ thanh toán', color: 'text-yellow-600' },
  1: { label: 'Đã thanh toán', color: 'text-green-600' },
  2: { label: 'Thất bại', color: 'text-red-600' },
  3: { label: 'Đã hoàn tiền', color: 'text-purple-600' }
};

const BookingList = ({ 
  bookings = [], 
  isLoading = false,
  pagination = { pageIndex: 1, pageSize: 10, totalCount: 0 },
  onPageChange,
  onViewDetails,
  onConfirm,
  onCancel,
  onSendEmail,
  onExport
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

  const columns = [
    {
      accessorKey: 'bookingCode',
      header: 'Mã đặt',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {row.original.bookingCode}
        </div>
      )
    },
    {
      accessorKey: 'type',
      header: 'Loại',
      cell: ({ row }) => {
        const type = row.original.type;
        const typeConfig = TYPE_CONFIG[type] || TYPE_CONFIG[0];
        const Icon = typeConfig.icon;
        return (
          <div className="flex items-center gap-2">
            <Icon size={16} className="text-gray-500" />
            <span>{typeConfig.label}</span>
          </div>
        );
      }
    },
    {
      accessorKey: 'serviceName',
      header: 'Dịch vụ',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate">
          {row.original.serviceName}
        </div>
      )
    },
    {
      accessorKey: 'contactName',
      header: 'Khách hàng',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.contactName}</div>
          <div className="text-sm text-gray-500">{row.original.contactEmail}</div>
        </div>
      )
    },
    {
      accessorKey: 'serviceDate',
      header: 'Ngày sử dụng',
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Calendar size={14} className="text-gray-400" />
            <span>{formatDate(row.original.serviceDate)}</span>
          </div>
          {row.original.endDate && (
            <div className="text-gray-500">→ {formatDate(row.original.endDate)}</div>
          )}
        </div>
      )
    },
    {
      accessorKey: 'finalAmount',
      header: 'Tổng tiền',
      cell: ({ row }) => (
        <div className="font-semibold text-gray-900">
          {formatPrice(row.original.finalAmount)}
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const status = row.original.status;
        const config = STATUS_CONFIG[status] || STATUS_CONFIG[0];
        const Icon = config.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${config.color}`}>
            <Icon size={14} />
            {config.label}
          </span>
        );
      }
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Thanh toán',
      cell: ({ row }) => {
        const status = row.original.paymentStatus;
        const config = PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG[0];
        return (
          <span className={`text-sm font-medium ${config.color}`}>
            {config.label}
          </span>
        );
      }
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onViewDetails?.(row.original)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Xem chi tiết"
          >
            <Eye size={18} />
          </button>
          
          {/* Quick confirm button - only for pending */}
          {row.original.status === 0 && (
            <button
              onClick={() => onConfirm?.(row.original.bookingId)}
              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
              title="Xác nhận"
            >
              <Check size={18} />
            </button>
          )}
          
          {/* Quick cancel button - only for pending or confirmed */}
          {(row.original.status === 0 || row.original.status === 1) && (
            <button
              onClick={() => onCancel?.(row.original.bookingId)}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Hủy đơn"
            >
              <X size={18} />
            </button>
          )}
          
          {/* Send email button */}
          <button
            onClick={() => onSendEmail?.(row.original.bookingId)}
            className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
            title="Gửi email xác nhận"
          >
            <Mail size={18} />
          </button>
        </div>
      )
    }
  ];

  const table = useReactTable({
    data: bookings,
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
                    <Calendar size={48} className="text-gray-300 mb-2" />
                    <p>Không có đơn đặt nào</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id} 
                  className="hover:bg-gray-50 transition-colors"
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
            Hiển thị {((pagination.pageIndex - 1) * pagination.pageSize) + 1} - {Math.min(pagination.pageIndex * pagination.pageSize, pagination.totalCount)} của {pagination.totalCount} đơn đặt
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

export default BookingList;
