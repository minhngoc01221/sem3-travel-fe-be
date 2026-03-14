import { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Edit, GripVertical, Calendar, Bed, Bus, Utensils } from 'lucide-react';
import toast from 'react-hot-toast';
import tourService from '@/services/tourService';

const ItineraryBuilder = ({ tourId, itineraries: initialItineraries, onClose, onSaved }) => {
  const [itineraries, setItineraries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (tourId) {
      loadItineraries();
    } else if (initialItineraries) {
      setItineraries(initialItineraries);
    }
  }, [tourId, initialItineraries]);

  const loadItineraries = async () => {
    if (!tourId) return;
    setIsLoading(true);
    try {
      const res = await tourService.getItineraries(tourId);
      if (res.success) {
        setItineraries(res.data || []);
      }
    } catch (error) {
      console.error('Error loading itineraries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDay = () => {
    const newDay = {
      dayNumber: itineraries.length + 1,
      title: '',
      content: '',
      meals: '',
      accommodation: '',
      transport: '',
      activities: '',
      notes: '',
      isNew: true
    };
    setItineraries([...itineraries, newDay]);
    setEditingId('new');
  };

  const handleChange = (index, field, value) => {
    const updated = [...itineraries];
    updated[index] = { ...updated[index], [field]: value };
    setItineraries(updated);
  };

  const handleSave = async (index) => {
    const item = itineraries[index];
    if (!item.title) {
      toast.error('Vui lòng nhập tiêu đề cho ngày');
      return;
    }

    try {
      const data = {
        dayNumber: item.dayNumber,
        title: item.title,
        content: item.content,
        meals: item.meals ? item.meals.split('\n').filter(m => m.trim()) : [],
        accommodation: item.accommodation,
        transport: item.transport,
        activities: item.activities ? item.activities.split('\n').filter(a => a.trim()) : [],
        notes: item.notes
      };

      let res;
      if (item.isNew && !item.itineraryId) {
        res = await tourService.createItinerary(tourId, data);
      } else if (item.itineraryId) {
        res = await tourService.updateItinerary(tourId, item.itineraryId, data);
      }

      if (res?.success) {
        toast.success('Lưu lịch trình thành công');
        loadItineraries();
        setEditingId(null);
      }
    } catch (error) {
      toast.error('Lỗi khi lưu lịch trình');
    }
  };

  const handleDelete = async (index) => {
    const item = itineraries[index];
    if (!confirm('Bạn có chắc muốn xóa ngày này?')) return;

    if (item.itineraryId) {
      try {
        const res = await tourService.deleteItinerary(tourId, item.itineraryId);
        if (res.success) {
          toast.success('Xóa ngày thành công');
          loadItineraries();
        }
      } catch (error) {
        toast.error('Lỗi khi xóa');
      }
    } else {
      setItineraries(itineraries.filter((_, i) => i !== index));
    }
  };

  const handleSaveAll = async () => {
    if (!tourId) {
      onSaved?.(itineraries);
      return;
    }

    for (let i = 0; i < itineraries.length; i++) {
      const item = itineraries[i];
      if (item.isNew && !item.itineraryId && editingId === 'new') {
        await handleSave(i);
      }
    }
    toast.success('Lưu toàn bộ lịch trình thành công');
    onSaved?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Lịch trình Tour</h2>
            <p className="text-sm text-gray-500 mt-1">Xây dựng lịch trình chi tiết cho từng ngày</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : itineraries.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Chưa có lịch trình nào</p>
              <button
                onClick={handleAddDay}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
              >
                <Plus className="w-5 h-5" />
                Thêm ngày đầu tiên
              </button>
            </div>
          ) : (
            <>
              {itineraries.map((day, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Day Header */}
                  <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-white/50 cursor-move" />
                      <span className="text-white font-semibold">Ngày {day.dayNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!editingId || editingId === day.itineraryId || editingId === 'new' && day.isNew ? (
                        <>
                          <button
                            onClick={() => handleSave(index)}
                            className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(index)}
                            className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-white rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditingId(day.itineraryId)}
                          className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Day Content */}
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                      <input
                        type="text"
                        value={day.title}
                        onChange={(e) => handleChange(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Ngày 1: Khám phá Đà Nẵng"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung chi tiết</label>
                      <textarea
                        rows={4}
                        value={day.content}
                        onChange={(e) => handleChange(index, 'content', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Mô tả chi tiết lịch trình trong ngày..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                          <Utensils className="w-4 h-4" />
                          Bữa ăn
                        </label>
                        <textarea
                          rows={2}
                          value={day.meals}
                          onChange={(e) => handleChange(index, 'meals', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                          placeholder="Sáng: Buffet&#10;Trưa: Ăn trưa&#10;Tối: BBQ"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                          <Bed className="w-4 h-4" />
                          Lưu trú
                        </label>
                        <input
                          type="text"
                          value={day.accommodation}
                          onChange={(e) => handleChange(index, 'accommodation', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                          placeholder="Khách sạn 4 sao..."
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                          <Bus className="w-4 h-4" />
                          Di chuyển
                        </label>
                        <input
                          type="text"
                          value={day.transport}
                          onChange={(e) => handleChange(index, 'transport', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                          placeholder="Xe khách, máy bay..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hoạt động (mỗi dòng một hoạt động)</label>
                      <textarea
                        rows={3}
                        value={day.activities}
                        onChange={(e) => handleChange(index, 'activities', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        placeholder="Tham quan Bà Nà Hills&#10;Tắm biển Mỹ Khê&#10;Buffet tối"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                      <input
                        type="text"
                        value={day.notes}
                        onChange={(e) => handleChange(index, 'notes', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        placeholder="Ghi chú đặc biệt..."
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddDay}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-teal-500 hover:text-teal-500 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Thêm ngày tiếp theo
              </button>
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Đóng
          </button>
          <button
            onClick={handleSaveAll}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
          >
            Lưu lịch trình
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryBuilder;
