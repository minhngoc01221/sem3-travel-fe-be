import { useState, useEffect } from 'react';
import { Plus, Calendar, Trash2, Edit, DollarSign, Users, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import tourService from '@/services/tourService';

const DepartureManager = ({ tourId, tourName, onClose }) => {
  const [departures, setDepartures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    departureDate: '',
    totalSeats: 30,
    price: 0,
    discountPrice: '',
    notes: ''
  });

  useEffect(() => {
    if (tourId) {
      loadDepartures();
    }
  }, [tourId]);

  const loadDepartures = async () => {
    if (!tourId) return;
    setIsLoading(true);
    try {
      const res = await tourService.getDepartures(tourId);
      if (res.success) {
        setDepartures(res.data || []);
      }
    } catch (error) {
      console.error('Error loading departures:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.departureDate) {
      toast.error('Vui lòng chọn ngày khởi hành');
      return;
    }

    if (new Date(formData.departureDate) < new Date(new Date().toDateString())) {
      toast.error('Ngày khởi hành không được ở quá khứ');
      return;
    }

    try {
      const data = {
        departureDate: formData.departureDate,
        totalSeats: parseInt(formData.totalSeats),
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        notes: formData.notes
      };

      let res;
      if (editingId) {
        res = await tourService.updateDeparture(tourId, editingId, data);
        if (res.success) {
          toast.success('Cập nhật ngày khởi hành thành công');
        }
      } else {
        res = await tourService.createDeparture(tourId, data);
        if (res.success) {
          toast.success('Thêm ngày khởi hành thành công');
        }
      }

      if (res.success) {
        loadDepartures();
        resetForm();
      } else {
        toast.error(res.message || 'Lỗi khi lưu');
      }
    } catch (error) {
      console.error('Error saving departure:', error);
      toast.error('Lỗi khi lưu ngày khởi hành');
    }
  };

  const handleEdit = (departure) => {
    setFormData({
      departureDate: departure.departureDate.split('T')[0],
      totalSeats: departure.totalSeats,
      price: departure.price,
      discountPrice: departure.discountPrice || '',
      notes: departure.notes || ''
    });
    setEditingId(departure.departureId);
    setShowAddForm(true);
  };

  const handleDelete = async (departureId) => {
    if (!confirm('Bạn có chắc muốn xóa ngày khởi hành này?')) return;

    try {
      const res = await tourService.deleteDeparture(tourId, departureId);
      if (res.success) {
        toast.success('Xóa ngày khởi hành thành công');
        loadDepartures();
      } else {
        toast.error(res.message || 'Không thể xóa ngày khởi hành');
      }
    } catch (error) {
      console.error('Error deleting departure:', error);
      toast.error('Lỗi khi xóa');
    }
  };

  const resetForm = () => {
    setFormData({
      departureDate: '',
      totalSeats: 30,
      price: 0,
      discountPrice: '',
      notes: ''
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isPastDate = (dateString) => {
    return new Date(dateString) < new Date(new Date().toDateString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Quản lý khởi hành</h2>
            <p className="text-sm text-gray-500 mt-1">{tourName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-4">
                {editingId ? 'Cập nhật ngày khởi hành' : 'Thêm ngày khởi hành'}
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày khởi hành *</label>
                  <input
                    type="date"
                    name="departureDate"
                    value={formData.departureDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tổng số chỗ *</label>
                  <input
                    type="number"
                    name="totalSeats"
                    value={formData.totalSeats}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VND) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá khuyến mãi (VND)</label>
                  <input
                    type="number"
                    name="discountPrice"
                    value={formData.discountPrice}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Nếu có"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Ghi chú đặc biệt..."
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Lưu
                  </button>
                </div>
              </form>
            </div>
          )}

          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mb-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm ngày khởi hành
            </button>
          )}

          {/* Departures List */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : departures.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Chưa có ngày khởi hành nào</p>
              <p className="text-sm text-gray-400 mt-1">Thêm ngày khởi hành để khách hàng có thể đặt tour</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departures.map((departure) => (
                <div
                  key={departure.departureId}
                  className={`border rounded-lg p-4 ${
                    isPastDate(departure.departureDate)
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : departure.availableSeats === 0
                      ? 'bg-red-50 border-red-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-teal-500" />
                      <span className="font-semibold text-gray-900">
                        {formatDate(departure.departureDate)}
                      </span>
                    </div>
                    {isPastDate(departure.departureDate) && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">Đã qua</span>
                    )}
                    {!isPastDate(departure.departureDate) && departure.availableSeats === 0 && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded">Hết chỗ</span>
                    )}
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Giá:</span>
                      <div className="text-right">
                        {departure.discountPrice ? (
                          <>
                            <span className="text-sm text-gray-400 line-through mr-2">
                              {formatPrice(departure.price)}
                            </span>
                            <span className="font-semibold text-teal-600">
                              {formatPrice(departure.discountPrice)}
                            </span>
                          </>
                        ) : (
                          <span className="font-semibold text-teal-600">
                            {formatPrice(departure.price)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Chỗ:
                      </span>
                      <span className={`font-medium ${
                        departure.availableSeats === 0 ? 'text-red-500' : 'text-gray-900'
                      }`}>
                        {departure.availableSeats} / {departure.totalSeats}
                      </span>
                    </div>
                  </div>

                  {departure.notes && (
                    <p className="text-xs text-gray-500 mb-3 italic">{departure.notes}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(departure)}
                      disabled={isPastDate(departure.departureDate)}
                      className="flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Edit className="w-4 h-4 inline mr-1" />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(departure.departureId)}
                      className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartureManager;
