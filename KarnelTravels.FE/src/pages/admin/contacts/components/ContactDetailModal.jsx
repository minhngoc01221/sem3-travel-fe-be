import { useState, useEffect } from 'react';
import { X, Send, Loader2, Mail, Phone, Calendar, Clock, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  0: { label: 'Chưa đọc', color: 'bg-yellow-100 text-yellow-700' },
  1: { label: 'Đã đọc', color: 'bg-blue-100 text-blue-700' },
  2: { label: 'Đã phản hồi', color: 'bg-green-100 text-green-700' },
  3: { label: 'Đã đóng', color: 'bg-gray-100 text-gray-700' }
};

const ContactDetailModal = ({ 
  isOpen, 
  onClose, 
  contact,
  onReply,
  onMarkAsRead,
  isLoading = false 
}) => {
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    if (contact) {
      setReplyMessage(contact.replyMessage || '');
    }
  }, [contact]);

  if (!isOpen || !contact) return null;

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

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      toast.error('Vui lòng nhập nội dung phản hồi');
      return;
    }

    setIsReplying(true);
    try {
      await onReply?.(contact.contactId, replyMessage);
      setReplyMessage('');
    } catch (error) {
      console.error('Error replying:', error);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Chi tiết liên hệ</h2>
              <p className="text-sm text-gray-500">
                Ngày gửi: {formatDate(contact.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_CONFIG[contact.status]?.color || ''}`}>
                {STATUS_CONFIG[contact.status]?.label || 'Chưa đọc'}
              </span>
              <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-280px)] px-6 py-4 space-y-4">
            {/* Sender Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Mail size={20} className="text-gray-500" />
                Thông tin người gửi
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Họ tên</label>
                  <p className="font-medium">{contact.fullName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">{contact.email}</p>
                </div>
                {contact.phoneNumber && (
                  <div>
                    <label className="text-sm text-gray-500">Số điện thoại</label>
                    <p className="font-medium flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      {contact.phoneNumber}
                    </p>
                  </div>
                )}
                {contact.address && (
                  <div>
                    <label className="text-sm text-gray-500">Địa chỉ</label>
                    <p className="font-medium">{contact.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Message Content */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <MessageSquare size={20} className="text-gray-500" />
                Nội dung tin nhắn
              </h3>
              {contact.subject && (
                <div className="mb-2">
                  <label className="text-sm text-gray-500">Chủ đề:</label>
                  <p className="font-medium">{contact.subject}</p>
                </div>
              )}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{contact.message}</p>
              </div>
            </div>

            {/* Reply Section */}
            {contact.status !== 2 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Send size={20} className="text-gray-500" />
                  Phản hồi
                </h3>
                {contact.replyMessage ? (
                  <div className="space-y-2">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700 font-medium mb-1">
                        Đã phản hồi: {formatDate(contact.repliedAt)}
                      </p>
                      <p className="whitespace-pre-wrap">{contact.replyMessage}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Nhập nội dung phản hồi..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                    />
                    <button
                      onClick={handleReply}
                      disabled={isReplying || !replyMessage.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isReplying ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Đang gửi...</span>
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          <span>Gửi phản hồi</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between gap-3 px-6 py-4 border-t bg-gray-50">
            <button
              onClick={() => onMarkAsRead?.(contact.contactId)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center gap-2"
            >
              <Clock size={18} />
              {contact.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
            </button>
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
  );
};

export default ContactDetailModal;
