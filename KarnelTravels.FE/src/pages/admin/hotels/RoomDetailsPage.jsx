import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Bed, Calendar, DollarSign, Users, Plus, 
  Edit, Trash2, X, Save, Loader2, RefreshCw, Check, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import hotelService from '@/services/hotelService';

const RoomDetailsPage = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('rooms');
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // Room form state
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false);
  const [roomForm, setRoomForm] = useState({
    roomType: '',
    description: '',
    pricePerNight: '',
    totalRooms: '',
    maxOccupancy: '',
    bedType: '',
    roomSize: '',
    amenities: []
  });
  const [isSavingRoom, setIsSavingRoom] = useState(false);

  // Availability state
  const [availability, setAvailability] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [editPrice, setEditPrice] = useState('');
  const [editRooms, setEditRooms] = useState('');
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  useEffect(() => {
    fetchHotelDetails();
  }, [hotelId]);

  useEffect(() => {
    if (hotel) {
      fetchRooms();
    }
  }, [hotel]);

  useEffect(() => {
    if (activeTab === 'availability' && selectedRoom) {
      fetchAvailability();
    }
  }, [activeTab, selectedRoom, currentMonth]);

  useEffect(() => {
    if (activeTab === 'bookings' && selectedRoom) {
      fetchBookings();
    }
  }, [activeTab, selectedRoom]);

  const fetchHotelDetails = async () => {
    try {
      const response = await hotelService.getById(hotelId);
      if (response.success) {
        setHotel(response.data);
      }
    } catch (error) {
      console.error('Error fetching hotel:', error);
      toast.error('Không thể tải thông tin khách sạn');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await hotelService.getRooms(hotelId);
      if (response.success) {
        setRooms(response.data || []);
        if (!selectedRoom && response.data?.length > 0) {
          setSelectedRoom(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Không thể tải danh sách phòng');
    }
  };

  const fetchAvailability = async () => {
    if (!selectedRoom) return;
    
    setIsLoadingAvailability(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

      const response = await hotelService.getRoomAvailability(
        hotelId, 
        selectedRoom.roomId, 
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

  const fetchBookings = async () => {
    if (!selectedRoom) return;
    
    setIsLoadingBookings(true);
    try {
      // Mock bookings data - in real app would call API
      const mockBookings = generateMockBookings(selectedRoom.roomId);
      setBookings(mockBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const generateMockBookings = (roomId) => {
    const bookings = [];
    const now = new Date();
    
    for (let i = -10; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      
      if (Math.random() > 0.7) {
        bookings.push({
          date: date.toISOString().split('T')[0],
          guestName: ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E'][Math.floor(Math.random() * 5)],
          status: 'confirmed',
          guests: Math.floor(Math.random() * 3) + 1
        });
      }
    }
    
    return bookings;
  };

  const handleSaveRoom = async () => {
    setIsSavingRoom(true);
    try {
      const data = {
        ...roomForm,
        pricePerNight: parseFloat(roomForm.pricePerNight),
        totalRooms: parseInt(roomForm.totalRooms),
        maxOccupancy: parseInt(roomForm.maxOccupancy)
      };

      if (roomForm.isEdit) {
        const response = await hotelService.updateRoom(hotelId, roomForm.roomId, data);
        if (response.success) {
          toast.success('Cập nhật phòng thành công');
        }
      } else {
        const response = await hotelService.createRoom(hotelId, data);
        if (response.success) {
          toast.success('Thêm phòng thành công');
        }
      }
      
      setIsRoomFormOpen(false);
      fetchRooms();
    } catch (error) {
      console.error('Error saving room:', error);
      toast.error('Lỗi khi lưu phòng');
    } finally {
      setIsSavingRoom(false);
    }
  };

  const handleDeleteRoom = async (room) => {
    if (confirm(`Bạn có chắc chắn muốn xóa phòng "${room.roomType}"?`)) {
      try {
        const response = await hotelService.deleteRoom(hotelId, room.roomId);
        if (response.success) {
          toast.success('Xóa phòng thành công');
          if (selectedRoom?.roomId === room.roomId) {
            setSelectedRoom(null);
          }
          fetchRooms();
        }
      } catch (error) {
        console.error('Error deleting room:', error);
        toast.error('Lỗi khi xóa phòng');
      }
    }
  };

  const openRoomForm = (room = null) => {
    if (room) {
      setRoomForm({ ...room, isEdit: true });
    } else {
      setRoomForm({
        roomType: '',
        description: '',
        pricePerNight: '',
        totalRooms: '',
        maxOccupancy: '',
        bedType: '',
        roomSize: '',
        amenities: [],
        isEdit: false
      });
    }
    setIsRoomFormOpen(true);
  };

  const handleDateClick = (date) => {
    if (!date) return;
    const dateStr = date.toISOString().split('T')[0];
    const existing = availability.find(a => a.date === dateStr);
    
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter(d => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
      setEditPrice(existing?.price?.toString() || selectedRoom?.pricePerNight?.toString() || '0');
      setEditRooms(existing?.availableRooms?.toString() || selectedRoom?.totalRooms?.toString() || '0');
    }
  };

  const handleSavePrice = () => {
    if (selectedDates.length === 0) return;

    const updated = selectedDates.map(dateStr => ({
      date: dateStr,
      price: parseFloat(editPrice) || selectedRoom?.pricePerNight,
      availableRooms: parseInt(editRooms) || selectedRoom?.totalRooms || 0
    }));

    const newAvailability = [
      ...availability.filter(a => !selectedDates.includes(a.date)),
      ...updated
    ];

    setAvailability(newAvailability);
    setSelectedDates([]);
    setEditPrice('');
    setEditRooms('');
    toast.success('Cập nhật giá thành công');
  };

  const handleSaveAllAvailability = async () => {
    if (!selectedRoom) return;
    
    setIsSavingAvailability(true);
    try {
      await hotelService.updateRoomAvailability(hotelId, selectedRoom.roomId, availability);
      toast.success('Lưu availability thành công');
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Lỗi khi lưu availability');
    } finally {
      setIsSavingAvailability(false);
    }
  };

  const getAvailabilityForDate = (date) => {
    if (!date) return null;
    const dateStr = date.toISOString().split('T')[0];
    return availability.find(a => a.date === dateStr);
  };

  const getBookingForDate = (date) => {
    if (!date) return null;
    const dateStr = date.toISOString().split('T')[0];
    return bookings.find(b => b.date === dateStr);
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0 
    }).format(price || 0);
  };

  const tabs = [
    { id: 'rooms', label: 'Danh sách phòng', icon: Bed },
    { id: 'availability', label: 'Giá & Availability', icon: DollarSign },
    { id: 'bookings', label: 'Lịch đặt phòng', icon: Calendar }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/hotels')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{hotel?.name}</h1>
          <p className="text-gray-600">Quản lý phòng - F185, F186, F187</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            {hotel?.city}
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            {rooms.length} phòng
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Room Selector */}
      {rooms.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {rooms.map(room => (
            <button
              key={room.roomId}
              onClick={() => setSelectedRoom(room)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg border-2 transition-colors ${
                selectedRoom?.roomId === room.roomId
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{room.roomType}</div>
              <div className="text-sm text-gray-500">{formatPrice(room.pricePerNight)}</div>
            </button>
          ))}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'rooms' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => openRoomForm()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Thêm phòng mới</span>
            </button>
          </div>

          {rooms.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Bed size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Chưa có phòng nào. Thêm phòng để bắt đầu.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {rooms.map(room => (
                <div key={room.roomId} className="bg-white border rounded-lg p-4 flex items-center gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Bed size={32} className="text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{room.roomType}</h3>
                    <p className="text-gray-600 text-sm">{room.description || 'Không có mô tả'}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>{room.totalRooms} phòng</span>
                      <span>Tối đa {room.maxOccupancy} người</span>
                      <span>Giường: {room.bedType}</span>
                      {room.roomSize && <span>{room.roomSize}m²</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-600">{formatPrice(room.pricePerNight)}</div>
                    <div className="text-sm text-gray-500">/đêm</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openRoomForm(room)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit size={18} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'availability' && selectedRoom && (
        <AvailabilityTab
          room={selectedRoom}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          availability={availability}
          isLoadingAvailability={isLoadingAvailability}
          selectedDates={selectedDates}
          editPrice={editPrice}
          editRooms={editRooms}
          setEditPrice={setEditPrice}
          setEditRooms={setEditRooms}
          handleDateClick={handleDateClick}
          handleSavePrice={handleSavePrice}
          handleSaveAll={handleSaveAllAvailability}
          isSavingAvailability={isSavingAvailability}
          fetchAvailability={fetchAvailability}
          formatPrice={formatPrice}
          getAvailabilityForDate={getAvailabilityForDate}
        />
      )}

      {activeTab === 'bookings' && selectedRoom && (
        <BookingsTab
          room={selectedRoom}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          bookings={bookings}
          isLoadingBookings={isLoadingBookings}
          formatPrice={formatPrice}
          getBookingForDate={getBookingForDate}
          fetchBookings={fetchBookings}
        />
      )}

      {/* Room Form Modal */}
      {isRoomFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsRoomFormOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-xl font-semibold">
                  {roomForm.isEdit ? 'Cập nhật phòng' : 'Thêm phòng mới'}
                </h2>
                <button onClick={() => setIsRoomFormOpen(false)} className="p-2 hover:bg-gray-100 rounded">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Loại phòng *</label>
                  <input
                    type="text"
                    value={roomForm.roomType}
                    onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="VD: Phòng Deluxe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mô tả</label>
                  <textarea
                    value={roomForm.description}
                    onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    placeholder="Mô tả về phòng..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Giá/đêm (VND) *</label>
                    <input
                      type="number"
                      value={roomForm.pricePerNight}
                      onChange={(e) => setRoomForm({ ...roomForm, pricePerNight: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="VD: 1000000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Số phòng *</label>
                    <input
                      type="number"
                      value={roomForm.totalRooms}
                      onChange={(e) => setRoomForm({ ...roomForm, totalRooms: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="VD: 10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Số người tối đa *</label>
                    <input
                      type="number"
                      value={roomForm.maxOccupancy}
                      onChange={(e) => setRoomForm({ ...roomForm, maxOccupancy: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="VD: 2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Loại giường</label>
                    <select
                      value={roomForm.bedType}
                      onChange={(e) => setRoomForm({ ...roomForm, bedType: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Chọn loại giường</option>
                      <option value="Single">Giường đơn</option>
                      <option value="Double">Giường đôi</option>
                      <option value="Twin">Giường twin</option>
                      <option value="Queen">Giường Queen</option>
                      <option value="King">Giường King</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Diện tích (m²)</label>
                  <input
                    type="number"
                    value={roomForm.roomSize}
                    onChange={(e) => setRoomForm({ ...roomForm, roomSize: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="VD: 30"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t">
                <button
                  onClick={() => setIsRoomFormOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveRoom}
                  disabled={isSavingRoom || !roomForm.roomType || !roomForm.pricePerNight}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingRoom ? (
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Availability Tab Component
const AvailabilityTab = ({
  room,
  currentMonth,
  setCurrentMonth,
  availability,
  isLoadingAvailability,
  selectedDates,
  editPrice,
  editRooms,
  setEditPrice,
  setEditRooms,
  handleDateClick,
  handleSavePrice,
  handleSaveAll,
  isSavingAvailability,
  fetchAvailability,
  formatPrice,
  getAvailabilityForDate
}) => {
  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const days = (() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const result = [];
    for (let i = 0; i < firstDay.getDay(); i++) result.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) result.push(new Date(year, month, i));
    return result;
  })();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{room.roomType}</h3>
          <span className="text-gray-500">- {formatPrice(room.pricePerNight)}/đêm</span>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={isSavingAvailability}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {isSavingAvailability ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>Lưu tất cả</span>
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">
            {currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
          </h3>
          <button 
            onClick={fetchAvailability}
            className="p-1.5 hover:bg-gray-100 rounded"
            disabled={isLoadingAvailability}
          >
            <RefreshCw size={16} className={isLoadingAvailability ? 'animate-spin' : ''} />
          </button>
        </div>
        <button 
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <ArrowLeft size={20} className="rotate-180" />
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
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, idx) => {
            if (!date) return <div key={idx} className="h-24" />;
            
            const avail = getAvailabilityForDate(date);
            const dateStr = date.toISOString().split('T')[0];
            const isSelected = selectedDates.includes(dateStr);
            const isPast = date < new Date().setHours(0, 0, 0, 0);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isToday = date.toDateString() === new Date().toDateString();

            let bgClass = 'bg-white hover:border-gray-300';
            if (isPast) bgClass = 'bg-gray-50 opacity-50 cursor-not-allowed';
            else if (isSelected) bgClass = 'bg-blue-50 border-blue-500 ring-2 ring-blue-200';
            else if (isWeekend) bgClass = 'bg-amber-50';

            return (
              <button
                key={idx}
                onClick={() => !isPast && handleDateClick(date)}
                disabled={isPast}
                className={`h-24 p-2 border rounded-lg text-left transition-all ${bgClass}`}
                type="button"
              >
                <div className={`text-sm font-medium flex items-center justify-between ${isToday ? 'text-blue-600' : ''}`}>
                  <span>{date.getDate()}</span>
                  {isToday && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
                </div>
                <div className="mt-1 text-xs">
                  <div className={avail ? 'font-medium text-blue-600' : 'text-gray-500'}>
                    {formatPrice(avail?.price || room.pricePerNight)}
                  </div>
                  <div className={avail?.availableRooms > 0 ? 'text-green-600' : 'text-red-600'}>
                    {avail?.availableRooms || room.totalRooms} phòng
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedDates.length > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Cập nhật giá cho {selectedDates.length} ngày</h4>
            <button
              onClick={() => { setSelectedDates([]); setEditPrice(''); setEditRooms(''); }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Bỏ chọn
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm mb-1">Giá mới (VND)</label>
              <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Số phòng trống</label>
              <input
                type="number"
                value={editRooms}
                onChange={(e) => setEditRooms(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <button
            onClick={handleSavePrice}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Lưu thay đổi
          </button>
        </div>
      )}
    </div>
  );
};

// Bookings Tab Component
const BookingsTab = ({
  room,
  currentMonth,
  setCurrentMonth,
  bookings,
  isLoadingBookings,
  formatPrice,
  getBookingForDate,
  fetchBookings
}) => {
  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const days = (() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const result = [];
    for (let i = 0; i < firstDay.getDay(); i++) result.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) result.push(new Date(year, month, i));
    return result;
  })();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{room.roomType}</h3>
          <span className="text-gray-500">- {formatPrice(room.pricePerNight)}/đêm</span>
        </div>
        <button
          onClick={fetchBookings}
          disabled={isLoadingBookings}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <RefreshCw size={18} className={isLoadingBookings ? 'animate-spin' : ''} />
          <span>Tải lại</span>
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <ArrowLeft size={20} />
        </button>
        <h3 className="text-lg font-semibold">
          {currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
        </h3>
        <button 
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <ArrowLeft size={20} className="rotate-180" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, idx) => (
          <div key={idx} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {isLoadingBookings ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, idx) => {
            if (!date) return <div key={idx} className="h-24" />;
            
            const booking = getBookingForDate(date);
            const isPast = date < new Date().setHours(0, 0, 0, 0);
            const isToday = date.toDateString() === new Date().toDateString();
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            let bgClass = 'bg-white';
            let statusIcon = null;
            
            if (booking) {
              bgClass = 'bg-green-50 border-green-300';
              statusIcon = <Check size={14} className="text-green-600" />;
            } else if (isPast) {
              bgClass = 'bg-gray-50 opacity-50';
            } else if (isWeekend) {
              bgClass = 'bg-amber-50';
            }

            return (
              <div
                key={idx}
                className={`h-24 p-2 border rounded-lg text-left ${bgClass}`}
              >
                <div className={`text-sm font-medium flex items-center justify-between ${isToday ? 'text-blue-600' : ''}`}>
                  <span>{date.getDate()}</span>
                  {isToday && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
                </div>
                {booking && (
                  <div className="mt-1 text-xs">
                    <div className="flex items-center gap-1 text-green-700 font-medium">
                      {statusIcon}
                      <span className="truncate">{booking.guestName}</span>
                    </div>
                    <div className="text-gray-500 flex items-center gap-1">
                      <Users size={10} />
                      <span>{booking.guests} khách</span>
                    </div>
                  </div>
                )}
                {!booking && !isPast && (
                  <div className="mt-1 text-xs text-gray-400">
                    <div>Trống</div>
                    <div>{room.totalRooms} phòng</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Chú thích</h4>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border border-green-300 rounded"></div>
            <span>Đã đặt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
            <span>Còn trống</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-50 border border-amber-200 rounded"></div>
            <span>Cuối tuần</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsPage;
