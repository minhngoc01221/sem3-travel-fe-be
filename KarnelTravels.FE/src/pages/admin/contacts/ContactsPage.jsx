import { useState, useEffect } from 'react';
import { Search, Download, RefreshCw, Mail, MailOpen, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import contactService from '@/services/contactService';
import ContactList from './components/ContactList';
import ContactDetailModal from './components/ContactDetailModal';

const ContactsPage = () => {
  // State
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0
  });

  // Filters
  const [search, setSearch] = useState('');
  const [isRead, setIsRead] = useState('');

  // Modal state
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Statistics
  const [statistics, setStatistics] = useState(null);

  // Debounce fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContacts();
      fetchStatistics();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, isRead, pagination.pageIndex]);

  // Fetch contacts
  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const response = await contactService.getAll({
        search,
        isRead: isRead !== '' ? isRead === 'true' : null,
        page: pagination.pageIndex,
        pageSize: pagination.pageSize
      });

      if (response.success) {
        setContacts(response.data.items || []);
        setPagination(prev => ({
          ...prev,
          totalCount: response.data.totalCount || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Không thể tải danh sách liên hệ');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await contactService.getStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, pageIndex: page }));
  };

  // Handle view details
  const handleViewDetails = async (contact) => {
    setIsDetailLoading(true);
    setIsDetailOpen(true);
    try {
      const response = await contactService.getById(contact.contactId);
      if (response.success) {
        setSelectedContact(response.data);
      }
    } catch (error) {
      console.error('Error fetching contact details:', error);
      toast.error('Không thể tải chi tiết liên hệ');
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Handle mark as read
  const handleMarkAsRead = async (contactId) => {
    try {
      const response = await contactService.markAsRead(contactId);
      if (response.success) {
        toast.success(response.message || 'Cập nhật trạng thái thành công');
        fetchContacts();
        fetchStatistics();
        if (isDetailOpen && selectedContact?.contactId === contactId) {
          setSelectedContact(prev => ({ ...prev, isRead: true, status: response.data.status }));
        }
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  // Handle reply
  const handleReply = async (contactId, replyMessage) => {
    try {
      const response = await contactService.reply(contactId, replyMessage);
      if (response.success) {
        toast.success('Gửi phản hồi thành công');
        fetchContacts();
        fetchStatistics();
        if (isDetailOpen && selectedContact?.contactId === contactId) {
          setSelectedContact(prev => ({ 
            ...prev, 
            isRead: true, 
            status: response.data.status,
            replyMessage: replyMessage,
            repliedAt: new Date().toISOString()
          }));
        }
      }
    } catch (error) {
      console.error('Error replying:', error);
      toast.error(response?.message || 'Không thể gửi phản hồi');
    }
  };

  // Handle delete
  const handleDelete = async (contact) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tin nhắn từ "${contact.fullName}"?`)) return;
    
    try {
      const response = await contactService.delete(contact.contactId);
      if (response.success) {
        toast.success(response.message || 'Xóa liên hệ thành công');
        fetchContacts();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Không thể xóa liên hệ');
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const response = await contactService.export({
        search,
        isRead: isRead !== '' ? isRead === 'true' : null
      });
      
      if (response.success) {
        toast.success('Xuất dữ liệu thành công');
      }
    } catch (error) {
      console.error('Error exporting contacts:', error);
      toast.error('Không thể xuất dữ liệu');
    }
  };

  // Handle reset filters
  const handleReset = () => {
    setSearch('');
    setIsRead('');
    setPagination(prev => ({ ...prev, pageIndex: 1 }));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý liên hệ</h1>
          <p className="text-gray-600 mt-1">F211 - F218: Quản lý tin nhắn liên hệ</p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Download size={20} />
          <span>Xuất Excel</span>
        </button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Mail size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tổng tin nhắn</p>
                <p className="text-xl font-bold text-gray-900">{statistics.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Mail size={24} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Chưa đọc</p>
                <p className="text-xl font-bold text-gray-900">{statistics.unreadCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Đã phản hồi</p>
                <p className="text-xl font-bold text-gray-900">{statistics.repliedCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-lg">
                <MailOpen size={24} className="text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Đã đọc</p>
                <p className="text-xl font-bold text-gray-900">{statistics.readCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-48">
            <select
              value={isRead}
              onChange={(e) => setIsRead(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="false">Chưa đọc</option>
              <option value="true">Đã đọc</option>
            </select>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw size={18} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Contact List */}
      <ContactList
        contacts={contacts}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onViewDetails={handleViewDetails}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
      />

      {/* Contact Detail Modal */}
      <ContactDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        contact={selectedContact}
        onReply={handleReply}
        onMarkAsRead={handleMarkAsRead}
        isLoading={isDetailLoading}
      />
    </div>
  );
};

export default ContactsPage;
