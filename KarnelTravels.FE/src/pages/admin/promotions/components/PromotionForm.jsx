import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2, Calendar, Tag, Percent, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import promotionService from '@/services/promotionService';

const TARGET_TYPE_OPTIONS = [
  { value: 0, label: 'Tất cả dịch vụ' },
  { value: 1, label: 'Tour du lịch' },
  { value: 2, label: 'Khách sạn' },
  { value: 3, label: 'Resort' },
  { value: 4, label: 'Phương tiện' },
  { value: 5, label: 'Nhà hàng' }
];

const PromotionForm = ({ 
  isOpen, 
  onClose, 
  promotion = null,
  onSubmit,
  isLoading = false 
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [tours, setTours] = useState([]);
  const [isLoadingTargets, setIsLoadingTargets] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    defaultValues: {
      code: '',
      title: '',
      description: '',
      discountType: 0,
      discountValue: 0,
      minOrderAmount: '',
      maxDiscountAmount: '',
      startDate: '',
      endDate: '',
      targetType: 0,
      targetId: '',
      showOnHome: false
    }
  });

  const selectedTargetType = watch('targetType');

  // Load targets when target type changes
  useEffect(() => {
    if (isOpen) {
      loadTargets();
    }
  }, [isOpen, selectedTargetType]);

  // Reset form when promotion changes
  useEffect(() => {
    if (promotion) {
      reset({
        code: promotion.code || '',
        title: promotion.title || '',
        description: promotion.description || '',
        discountType: promotion.discountType ?? 0,
        discountValue: promotion.discountValue || 0,
        minOrderAmount: promotion.minOrderAmount || '',
        maxDiscountAmount: promotion.maxDiscountAmount || '',
        startDate: promotion.startDate ? promotion.startDate.split('T')[0] : '',
        endDate: promotion.endDate ? promotion.endDate.split('T')[0] : '',
        targetType: promotion.targetType ?? 0,
        targetId: promotion.targetId || '',
        showOnHome: promotion.showOnHome || false
      });
    } else {
      reset({
        code: '',
        title: '',
        description: '',
        discountType: 0,
        discountValue: 0,
        minOrderAmount: '',
        maxDiscountAmount: '',
        startDate: '',
        endDate: '',
        targetType: 0,
        targetId: '',
        showOnHome: false
      });
    }
  }, [promotion, isOpen]);

  const loadTargets = async () => {
    setIsLoadingTargets(true);
    try {
      const type = parseInt(selectedTargetType);
      if (type === 0 || type === 2) {
        const hotelRes = await promotionService.getHotels();
        if (hotelRes.success) {
          setHotels(hotelRes.data || []);
        }
      }
      if (type === 0 || type === 1) {
        const tourRes = await promotionService.getTours();
        if (tourRes.success) {
          setTours(tourRes.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading targets:', error);
    } finally {
      setIsLoadingTargets(false);
    }
  };

  const onFormSubmit = async (data) => {
    // Validate discount value
    if (data.discountValue < 1 || data.discountValue > 100) {
      toast.error('Giảm giá phải từ 1% đến 100%');
      return;
    }

    // Validate date range
    if (new Date(data.endDate) < new Date(data.startDate)) {
      toast.error('Ngày kết thúc không được nhỏ hơn ngày bắt đầu');
      return;
    }

    setIsSaving(true);
    try {
      const submitData = {
        ...data,
        discountValue: parseFloat(data.discountValue),
        minOrderAmount: data.minOrderAmount ? parseFloat(data.minOrderAmount) : null,
        maxDiscountAmount: data.maxDiscountAmount ? parseFloat(data.maxDiscountAmount) : null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        targetType: parseInt(data.targetType),
        targetId: data.targetId ? data.targetId : null,
        discountType: parseInt(data.discountType)
      };

      let response;
      if (promotion?.promotionId) {
        response = await promotionService.update(promotion.promotionId, submitData);
      } else {
        response = await promotionService.create(submitData);
      }

      if (response.success) {
        toast.success(promotion ? 'Cập nhật khuyến mãi thành công' : 'Tạo khuyến mãi thành công');
        onSubmit?.(response.data);
        onClose();
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast.error('Có lỗi xảy ra khi lưu khuyến mãi');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">
              {promotion ? 'Cập nhật khuyến mãi' : 'Thêm khuyến mãi mới'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onFormSubmit)} className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-4">
            <div className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã khuyến mãi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    {...register('code', { required: 'Mã khuyến mãi là bắt buộc' })}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.code ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="VD: SUMMER2024"
                    disabled={!!promotion}
                  />
                </div>
                {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code.message}</p>}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên khuyến mãi <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('title', { required: 'Tên khuyến mãi là bắt buộc' })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="VD: Giảm giá mùa hè 2024"
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  {...register('description')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Mô tả chi tiết về khuyến mãi..."
                />
              </div>

              {/* Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại giảm giá <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('discountType')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={0}>Phần trăm (%)</option>
                    <option value={1}>Số tiền cố định (VND)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá trị giảm <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    {parseInt(watch('discountType')) === 0 ? (
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    ) : (
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    )}
                    <input
                      type="number"
                      {...register('discountValue', { 
                        required: 'Giá trị giảm là bắt buộc',
                        min: { value: 1, message: 'Giá trị từ 1-100' },
                        max: { value: parseInt(watch('discountType')) === 0 ? 100 : 999999999, message: 'Giá trị không hợp lệ' }
                      })}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.discountValue ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={parseInt(watch('discountType')) === 0 ? 'VD: 10' : 'VD: 100000'}
                    />
                  </div>
                  {errors.discountValue && <p className="mt-1 text-sm text-red-500">{errors.discountValue.message}</p>}
                </div>
              </div>

              {/* Min/Max Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đơn tối thiểu (VND)</label>
                  <input
                    type="number"
                    {...register('minOrderAmount')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="VD: 500000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giảm tối đa (VND)</label>
                  <input
                    type="number"
                    {...register('maxDiscountAmount')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="VD: 500000"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="date"
                      {...register('startDate', { required: 'Ngày bắt đầu là bắt buộc' })}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.startDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày kết thúc <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="date"
                      {...register('endDate', { required: 'Ngày kết thúc là bắt buộc' })}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.endDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.endDate && <p className="mt-1 text-sm text-red-500">{errors.endDate.message}</p>}
                </div>
              </div>

              {/* Target Type & Target */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Áp dụng cho <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('targetType')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {TARGET_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {selectedTargetType === '0' ? 'Chọn dịch vụ cụ thể' : 'Chọn dịch vụ'}
                  </label>
                  <select
                    {...register('targetId')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoadingTargets || parseInt(selectedTargetType) === 0}
                  >
                    <option value="">Tất cả {parseInt(selectedTargetType) === 0 ? 'dịch vụ' : ''}</option>
                    {parseInt(selectedTargetType) === 0 || parseInt(selectedTargetType) === 2 ? (
                      hotels.map(h => (
                        <option key={h.id} value={h.id}>🏨 {h.name}</option>
                      ))
                    ) : null}
                    {parseInt(selectedTargetType) === 0 || parseInt(selectedTargetType) === 1 ? (
                      tours.map(t => (
                        <option key={t.id} value={t.id}>🗺️ {t.name}</option>
                      ))
                    ) : null}
                  </select>
                </div>
              </div>

              {/* Show on Home */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  {...register('showOnHome')}
                  id="showOnHome"
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="showOnHome" className="text-sm font-medium text-gray-700">
                  Hiển thị trên trang chủ
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Lưu</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PromotionForm;
