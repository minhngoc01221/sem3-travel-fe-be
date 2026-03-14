import { useState, useEffect } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Save, 
  Loader2, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import hotelService from '../../../../services/hotelService';

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
  const [newPrice, setNewPrice] = useState('');
  const [newRooms, setNewRooms] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  useEffect(() => {
    if (isOpen && hotelId && room?.roomId) {
      fetchAvailability();
    }
  }, [isOpen, hotelId, room?.roomId, currentMonth]);

  const fetchAvailability = async () => {
    if (!hotelId || !room?.roomId) return;
    
    setIsLoadingAvailability(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

      const response = await hotelService.getRoomAvailability(
        hotelId, 
        room.roomId, 
        startDate, 
        endDate
      );
      
      const data = response.data?.data || response.data || [];
      setAvailability(data);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Không thể tải dữ liệu availability');
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

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
    
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter(d => d !== dateStr));
      if (selectedDates.length === 1) {
        setNewPrice('');
        setNewRooms('');
      }
    } else {
      setSelectedDates([...selectedDates, dateStr]);
      setNewPrice(existing?.price?.toString() || room?.pricePerNight?.toString() || '0');
      setNewRooms(existing?.availableRooms?.toString() || room?.totalRooms?.toString() || '0');
    }
  };

  const handleClearSelection = () => {
    setSelectedDates([]);
    setNewPrice('');
    setNewRooms('');
  };

  const handleSavePrice = () => {
    if (selectedDates.length === 0) return;

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
    setNewPrice('');
    setNewRooms('');
    toast.success('Cập nhật giá thành công');
  };

  const handleSaveAll = async () => {
    if (!hotelId || !room?.roomId) return;
    
    setIsSaving(true);
    try {
      await hotelService.updateRoomAvailability(hotelId, room.roomId, availability);
      toast.success('Lưu availability thành công');
      onSave?.(availability);
      onClose();
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Lỗi khi lưu availability');
    } finally {
      setIsSaving(false);
    }
  };

  const getAvailabilityForDate = (date) => {
    if (!date) return null;
    const dateStr = date.toISOString().split('T')[0];
    return availability.find(a => a.date === dateStr);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0 
    }).format(price || 0);
  };

  const days = generateCalendarDays();
  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  if (!isOpen) return null;

  const renderCalendarDay = (date, idx) => {
    if (!date) {
      return <div key={idx} className="h-24" />;
    }

    const avail = getAvailabilityForDate(date);
    const dateStr = date.toISOString().split('T')[0];
    const isSelected = selectedDates.includes(dateStr);
    const isToday = date.toDateString() === new Date().toDateString();
    const isPast = date < new Date().setHours(0, 0, 0, 0);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    let containerClass = 'h-24 p-2 border rounded-lg text-left transition-all ';
    if (isPast) {
      containerClass += 'bg-gray-100 cursor-not-allowed opacity-60';
    } else if (isSelected) {
      containerClass += 'border-blue-500 bg-blue-50 ring-2 ring-blue-200';
    } else if (isWeekend) {
      containerClass += 'bg-amber-50 hover:border-amber-300';
    } else {
      containerClass += 'hover:border-gray-300';
    }

    return (
      <button
        key={idx}
        onClick={() => handleDateClick(date)}
        disabled={isPast}
        className={containerClass}
        type="button"
      >
        <div className={`text-sm font-medium flex items-center justify-between ${isToday ? 'text-blue-600' : ''}`}>
          <span>{date.getDate()}</span>
          {isToday && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
        </div>
        <div className="mt-1 text-xs">
          <div className={avail ? 'font-medium text-blue-600' : 'font-medium text-gray-500'}>
            {formatPrice(avail?.price || room?.pricePerNight)}
          </div>
          <div className={avail && avail.availableRooms > 0 ? 'text-green-600' : 'text-red-600'}>
            {avail?.availableRooms || room?.totalRooms || 0} phòng
          </div>
        </div>
      </button>
    );
  };

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
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded" type="button">
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={handlePrevMonth} 
                className="p-2 hover:bg-gray-100 rounded"
                disabled={isLoadingAvailability}
                type="button"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">
                  {currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                </h3>
                <button 
                  onClick={fetchAvailability}
                  className="p-1.5 hover:bg-gray-100 rounded"
                  title="Tải lại dữ liệu"
                  disabled={isLoadingAvailability}
                  type="button"
                >
                  <RefreshCw size={16} className={isLoadingAvailability ? 'animate-spin' : ''} />
                </button>
              </div>
              <button 
                onClick={handleNextMonth} 
                className="p-2 hover:bg-gray-100 rounded"
                disabled={isLoadingAvailability}
                type="button"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day, idx) => (
                <div key={idx} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {isLoadingAvailability ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="text-blue-600 animate-spin" />
                <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {days.map(renderCalendarDay)}
              </div>
            )}

            {selectedDates.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Cập nhật giá cho {selectedDates.length} ngày đã chọn</h4>
                  <button
                    onClick={handleClearSelection}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    type="button"
                  >
                    <X size={14} />
                    Bỏ chọn
                  </button>
                </div>
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
                  type="button"
                >
                  <Save size={18} />
                  Lưu thay đổi
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-100" type="button">
              Đóng
            </button>
            <button
              onClick={handleSaveAll}
              disabled={isSaving || isLoadingAvailability}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              type="button"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Lưu tất cả</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceCalendar;
