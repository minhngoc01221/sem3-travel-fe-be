import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, DollarSign, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const PriceCalendar = ({ 
  isOpen, 
  onClose, 
  hotelId, 
  room,
  onSave,
  isLoading = false 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [editingPrice, setEditingPrice] = useState(null);
  const [editingRooms, setEditingRooms] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [newRooms, setNewRooms] = useState('');

  useEffect(() => {
    if (isOpen && room) {
      generateCalendarDays();
    }
  }, [isOpen, room, currentMonth]);

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty days for padding
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (date) => {
    if (!date) return;
    const dateStr = date.toISOString().split('T')[0];
    const existing = availability.find(a => a.date === dateStr);
    
    setEditingPrice(existing?.price || room?.pricePerNight || 0);
    setEditingRooms(existing?.availableRooms ?? room?.totalRooms ?? 0);
    setSelectedDates([dateStr]);
  };

  const handleSavePrice = () => {
    const updated = selectedDates.map(dateStr => ({
      date: dateStr,
      price: parseFloat(newPrice) || room?.pricePerNight,
      availableRooms: parseInt(newRooms) || room?.totalRooms || 0
    }));

    const newAvailability = [
      ...availability.filter(a => !selectedDates.includes(a.date)),
      ...updated
    ];

    setAvailability(newAvailability);
    setSelectedDates([]);
    toast.success('Cập nhật giá thành công');
  };

  const getAvailabilityForDate = (date) => {
    if (!date) return null;
    const dateStr = date.toISOString().split('T')[0];
    return availability.find(a => a.date === dateStr);
  };

  const days = generateCalendarDays();
  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h2 className="text-xl font-semibold">Quản lý giá & availability (F186, F187)</h2>
              <p className="text-sm text-gray-500">{room?.roomType} - {room?.hotelName || ''}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded">
                <ChevronLeft size={20} />
              </button>
              <h3 className="text-lg font-semibold">
                {currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
              </h3>
              <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded">
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Week days header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day, idx) => (
                <div key={idx} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, idx) => {
                if (!date) {
                  return <div key={idx} className="h-24" />;
                }

                const avail = getAvailabilityForDate(date);
                const isSelected = selectedDates.includes(date.toISOString().split('T')[0]);
                const isToday = date.toDateString() === new Date().toDateString();
                const isPast = date < new Date().setHours(0, 0, 0, 0);

                return (
                  <button
                    key={idx}
                    onClick={() => handleDateClick(date)}
                    disabled={isPast}
                    className={`h-24 p-2 border rounded-lg text-left transition-colors ${
                      isPast ? 'bg-gray-100 cursor-not-allowed' :
                      isSelected ? 'border-blue-500 bg-blue-50' :
                      'hover:border-gray-300'
                    }`}
                  >
                    <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                      {date.getDate()}
                    </div>
                    {avail ? (
                      <div className="mt-1 text-xs">
                        <div className="font-medium text-blue-600">
                          {new Intl.NumberFormat('vi-VN', { 
                            style: 'currency', 
                            currency: 'VND',
                            maximumFractionDigits: 0 
                          }).format(avail.price)}
                        </div>
                        <div className={`${avail.availableRooms > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {avail.availableRooms} phòng
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-gray-400">
                        <div className="font-medium">
                          {new Intl.NumberFormat('vi-VN', { 
                            style: 'currency', 
                            currency: 'VND',
                            maximumFractionDigits: 0 
                          }).format(room?.pricePerNight || 0)}
                        </div>
                        <div className="text-green-600">
                          {room?.totalRooms || 0} phòng
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Edit panel */}
            {selectedDates.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-3">Cập nhật giá cho {selectedDates.length} ngày</h4>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm mb-1">Giá mới (VND)</label>
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Nhập giá mới"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Số phòng trống</label>
                    <input
                      type="number"
                      value={newRooms}
                      onChange={(e) => setNewRooms(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Số phòng trống"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSavePrice}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Lưu thay đổi
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
              Đóng
            </button>
            <button
              onClick={() => {
                onSave?.(availability);
                onClose();
              }}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Lưu tất cả
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceCalendar;
