import { X, Calendar, DollarSign, User, Mail, Phone, Building, Clock, Check, XCircle, FileText } from 'lucide-react';

const STATUS_CONFIG = {
  0: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  1: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  2: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700 border-green-200' },
  3: { label: 'Đã hủy', color: 'bg-red-100 text-red-700 border-red-200' },
  4: { label: 'Đã hoàn tiền', color: 'bg-purple-100 text-purple-700 border-purple-200' }
};

const TYPE_CONFIG = {
  0: { label: 'Tour du lịch' },
  1: { label: 'Khách sạn' },
  2: { label: 'Resort' },
  3: { label: 'Phương tiện' },
  4: { label: 'Nhà hàng' }
};

const PAYMENT_STATUS_CONFIG = {
  0: { label: 'Chờ thanh toán', color: 'text-yellow-600' },
  1: { label: 'Đã thanh toán', color: 'text-green-600' },
  2: { label: 'Thất bại', color: 'text-red-600' },
  3: { label: 'Đã hoàn tiền', color: 'text-purple-600' }
};

const BookingDetailModal = ({ 
  isOpen, 
  onClose, 
  booking, 
  isLoading,
  onConfirm,
  onCancel,
  onSendEmail,
  onPrint
}) => {
  if (!isOpen || !booking) return null;

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG[0];
  const typeConfig = TYPE_CONFIG[booking.type] || TYPE_CONFIG[0];
  const paymentConfig = PAYMENT_STATUS_CONFIG[booking.paymentStatus] || PAYMENT_STATUS_CONFIG[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Chi tiết đơn đặt</h2>
              <p className="text-sm text-gray-500">Mã: <span className="font-medium">{booking.bookingCode}</span></p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-4 space-y-6">
            {/* Status Banner */}
            <div className={`flex items-center justify-between p-4 rounded-lg border ${statusConfig.color}`}>
              <div className="flex items-center gap-2">
                {booking.status === 0 && <Clock size={20} />}
                {booking.status === 1 && <Check size={20} />}
                {booking.status === 2 && <Check size={20} />}
                {booking.status === 3 && <XCircle size={20} />}
                {booking.status === 4 && <DollarSign size={20} />}
                <span className="font-semibold">{statusConfig.label}</span>
              </div>
              <span className={`text-sm font-medium ${paymentConfig.color}`}>
                {paymentConfig.label}
              </span>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User size={20} className="text-gray-500" />
                Thông tin khách hàng
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Họ tên</label>
                  <p className="font-medium">{booking.contactName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    {booking.contactEmail}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Số điện thoại</label>
                  <p className="font-medium flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    {booking.contactPhone}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Ngày đặt</label>
                  <p className="font-medium">{formatDate(booking.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Service Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building size={20} className="text-gray-500" />
                Thông tin dịch vụ
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Loại dịch vụ</label>
                  <p className="font-medium">{typeConfig.label}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Tên dịch vụ</label>
                  <p className="font-medium">{booking.serviceName}</p>
                </div>

                {/* Hotel specific info */}
                {booking.type === 1 && (
                  <>
                    <div>
                      <label className="text-sm text-gray-500">Khách sạn</label>
                      <p className="font-medium">{booking.hotelName || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Loại phòng</label>
                      <p className="font-medium">{booking.roomType || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Địa chỉ</label>
                      <p className="font-medium">{booking.hotelAddress || '-'}, {booking.hotelCity || ''}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Giờ check-in/out</label>
                      <p className="font-medium">
                        {booking.checkInTime || '14:00'} - {booking.checkOutTime || '12:00'}
                      </p>
                    </div>
                  </>
                )}

                {/* Tour specific info */}
                {booking.type === 0 && (
                  <div className="col-span-2">
                    <label className="text-sm text-gray-500">Tên tour</label>
                    <p className="font-medium">{booking.tourName || '-'}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm text-gray-500">Ngày bắt đầu</label>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    {formatDate(booking.serviceDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Ngày kết thúc</label>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    {formatDate(booking.endDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Số lượng</label>
                  <p className="font-medium">{booking.quantity}</p>
                </div>
                {booking.promotionCode && (
                  <div>
                    <label className="text-sm text-gray-500">Mã khuyến mãi</label>
                    <p className="font-medium text-green-600">{booking.promotionCode}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Price Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-gray-500" />
                Thông tin thanh toán
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tổng tiền:</span>
                  <span>{formatPrice(booking.totalAmount)}</span>
                </div>
                {booking.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{formatPrice(booking.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                  <span>Thành tiền:</span>
                  <span className="text-blue-600">{formatPrice(booking.finalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-gray-500">Phương thức thanh toán:</span>
                  <span>{booking.paymentMethod || '-'}</span>
                </div>
                {booking.paidAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ngày thanh toán:</span>
                    <span className="text-green-600">{formatDate(booking.paidAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {booking.notes && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <FileText size={20} className="text-gray-500" />
                  Ghi chú
                </h3>
                <p className="text-gray-600">{booking.notes}</p>
              </div>
            )}

            {/* Cancellation Info */}
            {booking.status === 3 && booking.cancellationReason && (
              <div className="bg-red-50 rounded-lg border border-red-200 p-4">
                <h3 className="text-lg font-semibold mb-2 text-red-700">Lý do hủy</h3>
                <p className="text-gray-600">{booking.cancellationReason}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Ngày hủy: {formatDate(booking.cancelledAt)}
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between gap-3 px-6 py-4 border-t bg-gray-50">
            <div className="flex gap-2">
              <button
                onClick={onPrint}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center gap-2"
              >
                <FileText size={18} />
                In
              </button>
              <button
                onClick={() => onSendEmail?.(booking.bookingId)}
                className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 flex items-center gap-2"
              >
                <Mail size={18} />
                Gửi email
              </button>
            </div>
            <div className="flex gap-2">
              {/* Confirm button */}
              {booking.status === 0 && (
                <button
                  onClick={() => onConfirm?.(booking.bookingId)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Check size={18} />
                  Xác nhận
                </button>
              )}
              
              {/* Cancel button */}
              {(booking.status === 0 || booking.status === 1) && (
                <button
                  onClick={() => onCancel?.(booking.bookingId)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <XCircle size={18} />
                  Hủy đơn
                </button>
              )}
              
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailModal;
