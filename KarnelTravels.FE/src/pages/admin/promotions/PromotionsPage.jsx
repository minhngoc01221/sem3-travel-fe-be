import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Tag, Home, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import promotionService from '@/services/promotionService';
import PromotionList from './components/PromotionList';
import PromotionForm from './components/PromotionForm';

const PromotionsPage = () => {
  // State
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0
  });

  // Filters
  const [isActive, setIsActive] = useState('');
  const [showOnHome, setShowOnHome] = useState('');
  const [targetType, setTargetType] = useState('');

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  // Debounce fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPromotions();
    }, 500);
    return () => clearTimeout(timer);
  }, [isActive, showOnHome, targetType, pagination.pageIndex]);

  // Fetch promotions
  const fetchPromotions = async () => {
    setIsLoading(true);
    try {
      const response = await promotionService.getAll({
        isActive: isActive !== '' ? isActive === 'true' : null,
        showOnHome: showOnHome !== '' ? showOnHome === 'true' : null,
        targetType: targetType !== '' ? parseInt(targetType) : null,
        page: pagination.pageIndex,
        pageSize: pagination.pageSize
      });

      if (response.success) {
        setPromotions(response.data.items || []);
        setPagination(prev => ({
          ...prev,
          totalCount: response.data.totalCount || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('Không thể tải danh sách khuyến mãi');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, pageIndex: page }));
  };

  // Handle add new
  const handleAddNew = () => {
    setSelectedPromotion(null);
    setIsFormOpen(true);
  };

  // Handle edit
  const handleEdit = (promotion) => {
    setSelectedPromotion(promotion);
    setIsFormOpen(true);
  };

  // Handle view details
  const handleViewDetails = (promotion) => {
    setSelectedPromotion(promotion);
    setIsFormOpen(true);
  };

  // Handle delete
  const handleDelete = async (promotion) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa khuyến mãi "${promotion.title}"?`)) return;
    
    try {
      const response = await promotionService.delete(promotion.promotionId);
      if (response.success) {
        toast.success(response.message || 'Xóa khuyến mãi thành công');
        fetchPromotions();
      }
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast.error('Không thể xóa khuyến mãi');
    }
  };

  // Handle toggle show on home
  const handleToggleShowOnHome = async (promotionId) => {
    try {
      const response = await promotionService.toggleShowOnHome(promotionId);
      if (response.success) {
        toast.success(response.message);
        fetchPromotions();
      }
    } catch (error) {
      console.error('Error toggling show on home:', error);
      toast.error('Không thể thay đổi trạng thái');
    }
  };

  // Handle form submit
  const handleFormSubmit = () => {
    fetchPromotions();
  };

  // Handle reset filters
  const handleReset = () => {
    setIsActive('');
    setShowOnHome('');
    setTargetType('');
    setPagination(prev => ({ ...prev, pageIndex: 1 }));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý khuyến mãi</h1>
          <p className="text-gray-600 mt-1">F201 - F210: Quản lý khuyến mãi và giảm giá</p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          <span>Thêm khuyến mãi mới</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Filter */}
          <div className="w-48">
            <select
              value={isActive}
              onChange={(e) => setIsActive(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Hoạt động</option>
              <option value="false">Không hoạt động</option>
            </select>
          </div>

          {/* Show on Home Filter */}
          <div className="w-48">
            <select
              value={showOnHome}
              onChange={(e) => setShowOnHome(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Hiển thị trang chủ</option>
              <option value="true">Có</option>
              <option value="false">Không</option>
            </select>
          </div>

          {/* Target Type Filter */}
          <div className="w-48">
            <select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả loại</option>
              <option value="0">Tất cả dịch vụ</option>
              <option value="1">Tour</option>
              <option value="2">Khách sạn</option>
              <option value="3">Resort</option>
              <option value="4">Phương tiện</option>
              <option value="5">Nhà hàng</option>
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

      {/* Promotion List */}
      <PromotionList
        promotions={promotions}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onViewDetails={handleViewDetails}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleShowOnHome={handleToggleShowOnHome}
      />

      {/* Promotion Form Modal */}
      <PromotionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        promotion={selectedPromotion}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default PromotionsPage;
