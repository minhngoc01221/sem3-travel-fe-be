import { useState, useEffect } from 'react';
import { X, Star, User, Calendar, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import hotelService from '@/services/hotelService';

const HotelReviews = ({ 
  isOpen, 
  onClose, 
  hotelId, 
  hotelName,
  isLoading = false 
}) => {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, totalCount: 0 });
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  useEffect(() => {
    if (isOpen && hotelId) {
      fetchReviews();
    }
  }, [isOpen, hotelId, pagination.page]);

  const fetchReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const response = await hotelService.getReviews(hotelId, pagination.page, pagination.pageSize);
      
      if (response.success) {
        setReviews(response.data.items || []);
        setPagination(prev => ({
          ...prev,
          totalCount: response.data.totalCount || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, idx) => (
      <Star 
        key={idx} 
        size={16} 
        className={idx < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h2 className="text-xl font-semibold">Đánh giá khách sạn (F190)</h2>
              <p className="text-sm text-gray-500">{hotelName}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-4">
            {isLoadingReviews ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-gray-500">Đang tải đánh giá...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare size={48} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">Chưa có đánh giá nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.reviewId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{review.userName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">{renderStars(review.rating)}</div>
                            <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {review.title && (
                      <p className="mt-3 font-medium text-gray-900">{review.title}</p>
                    )}
                    {review.content && (
                      <p className="mt-2 text-gray-600">{review.content}</p>
                    )}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {review.images.map((img, idx) => (
                          <img 
                            key={idx} 
                            src={img} 
                            alt={`Review ${idx + 1}`} 
                            className="w-20 h-20 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {pagination.totalCount > pagination.pageSize && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
                className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-gray-600">
                Trang {pagination.page} / {Math.ceil(pagination.totalCount / pagination.pageSize)}
              </span>
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page >= Math.ceil(pagination.totalCount / pagination.pageSize)}
                className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelReviews;
