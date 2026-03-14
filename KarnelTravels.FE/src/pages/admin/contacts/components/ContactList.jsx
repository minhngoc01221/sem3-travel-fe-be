import { useState } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getPaginationRowModel,
  flexRender 
} from '@tanstack/react-table';
import { 
  Eye, Check, Trash2, Mail, MailOpen,
  ChevronLeft, ChevronRight, Search
} from 'lucide-react';

// Status configuration
const STATUS_CONFIG = {
  0: { label: 'Chưa đọc', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  1: { label: 'Đã đọc', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  2: { label: 'Đã phản hồi', color: 'bg-green-100 text-green-700 border-green-200' },
  3: { label: 'Đã đóng', color: 'bg-gray-100 text-gray-700 border-gray-200' }
};

const ContactList = ({ 
  contacts = [], 
  isLoading = false,
  pagination = { pageIndex: 1, pageSize: 10, totalCount: 0 },
  onPageChange,
  onViewDetails,
  onMarkAsRead,
  onDelete
}) => {
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    {
      accessorKey: 'isRead',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const isRead = row.original.isRead;
        return (
          <div className="flex items-center">
            {isRead ? (
              <MailOpen size={20} className="text-gray-400" />
            ) : (
              <Mail size={20} className="text-yellow-600" />
            )}
          </div>
        );
      }
    },
    {
      accessorKey: 'fullName',
      header: 'Người gửi',
      cell: ({ row }) => (
        <div>
          <div className={`font-medium ${!row.original.isRead ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
            {row.original.fullName}
          </div>
          <div className="text-sm text-gray-500">{row.original.email}</div>
        </div>
      )
    },
    {
      accessorKey: 'subject',
      header: 'Chủ đề',
      cell: ({ row }) => (
        <div className={`max-w-[250px] truncate ${!row.original.isRead ? 'font-medium' : ''}`}>
          {row.original.subject || 'Không có chủ đề'}
        </div>
      )
    },
    {
      accessorKey: 'message',
      header: 'Nội dung',
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <p className="text-sm text-gray-600 truncate">{row.original.message}</p>
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const status = STATUS_CONFIG[row.original.status] || STATUS_CONFIG[0];
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}>
            {status.label}
          </span>
        );
      }
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày gửi',
      cell: ({ row }) => (
        <div className="text-sm text-gray-500 whitespace-nowrap">
          {formatDate(row.original.createdAt)}
        </div>
      )
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
          
          {!row.original.isRead && (
            <button
              onClick={() => onMarkAsRead?.(row.original.contactId)}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Đánh dấu đã đọc"
            >
              <Check size={18} />
            </button>
          )}
          
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
    data: contacts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
                    <Mail size={48} className="text-gray-300 mb-2" />
                    <p>Không có tin nhắn nào</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id} 
                  className={`hover:bg-gray-50 transition-colors ${!row.original.isRead ? 'bg-yellow-50/50' : ''}`}
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
            Hiển thị {((pagination.pageIndex - 1) * pagination.pageSize) + 1} - {Math.min(pagination.pageIndex * pagination.pageSize, pagination.totalCount)} của {pagination.totalCount} tin nhắn
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

export default ContactList;
