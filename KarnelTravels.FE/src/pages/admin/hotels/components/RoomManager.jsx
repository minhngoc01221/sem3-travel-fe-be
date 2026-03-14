import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  X, Plus, Trash2, DollarSign, Users, Bed, CheckCircle, Edit, 
  Loader2, Calendar, AlertCircle, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import hotelService from '../../../../services/hotelService';
import PriceCalendar from './PriceCalendar';

const ROOM_AMENITIES = [
  'Wifi', 'TV', 'Air Conditioning', 'Mini Bar', 'Safe', 
  'Hair Dryer', 'Coffee Maker', 'Balcony', 'Ocean View', 'City View'
];

const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Family', 'Presidential'];
const BED_TYPES = ['Single', 'Double', 'Twin', 'Queen', 'King'];

const RoomManager = ({ 
  hotelId,
  rooms = [], 
  onRoomsChange,
  isLoading = false 
}) => {
  const [localRooms, setLocalRooms] = useState(rooms);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [priceCalendarOpen, setPriceCalendarOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: {
      roomType: '',
      description: '',
      maxOccupancy: 2,
      pricePerNight: '',
      bedType: '',
      totalRooms: 1,
      roomAmenities: []
    }
  });

  useEffect(() => {
    setLocalRooms(rooms);
  }, [rooms]);

  // Fetch rooms from API
  const fetchRooms = async () => {
    if (!hotelId) return;
    setLoadingRooms(true);
    try {
      const response = await hotelService.getRooms(hotelId);
      const roomsData = response.data?.data || response.data || [];
      setLocalRooms(roomsData);
      onRoomsChange?.(roomsData);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Không thể tải danh sách phòng');
    } finally {
      setLoadingRooms(false);
    }
  };

  // Load rooms when hotelId changes
  useEffect(() => {
    if (hotelId) {
      fetchRooms();
    }
  }, [hotelId]);

  const handleAddRoom = async (data) => {
    try {
      const roomData = {
        roomType: data.roomType,
        description: data.description,
        maxOccupancy: parseInt(data.maxOccupancy),
        pricePerNight: parseFloat(data.pricePerNight),
        bedType: data.bedType,
        totalRooms: parseInt(data.totalRooms),
        availableRooms: parseInt(data.totalRooms),
        roomAmenities: data.roomAmenities || []
      };

      if (editingRoom?.roomId) {
        // Update existing room
        await hotelService.updateRoom(hotelId, editingRoom.roomId, roomData);
        toast.success('Cập nhật loại phòng thành công');
      } else {
        // Create new room
        await hotelService.createRoom(hotelId, roomData);
        toast.success('Thêm loại phòng thành công');
      }

      await fetchRooms();
      setIsAddModalOpen(false);
      setEditingRoom(null);
      reset();
    } catch (error) {
      console.error('Error saving room:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi lưu phòng');
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setValue('roomType', room.roomType);
    setValue('description', room.description);
    setValue('maxOccupancy', room.maxOccupancy);
    setValue('pricePerNight', room.pricePerNight);
    setValue('bedType', room.bedType);
    setValue('totalRooms', room.totalRooms);
    setValue('roomAmenities', room.roomAmenities || []);
    setIsAddModalOpen(true);
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa loại phòng này?')) return;
    
    try {
      await hotelService.deleteRoom(hotelId, roomId);
      await fetchRooms();
      toast.success('Xóa loại phòng thành công');
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi xóa phòng');
    }
  };

  const handleOpenPriceCalendar = (room) => {
    setSelectedRoom(room);
    setPriceCalendarOpen(true);
  };

  const handleSaveAvailability = async (availability) => {
    if (!selectedRoom || !availability) return;
    
    try {
      await hotelService.updateRoomAvailability(
        hotelId, 
        selectedRoom.roomId, 
        availability
      );
      toast.success('Cập nhật availability thành công');
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Lỗi khi lưu availability');
    }
  };

  const toggleAmenity = (amenity) => {
    const currentAmenities = watch('roomAmenities') || [];
    if (currentAmenities.includes(amenity)) {
      setValue('roomAmenities', currentAmenities.filter(a => a !== amenity));
    } else {
      setValue('roomAmenities', [...currentAmenities, amenity]);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Quản lý loại phòng (F185)</h3>
        <button
          onClick={() => {
            setEditingRoom(null);
            reset();
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Thêm loại phòng</span>
        </button>
      </div>

      {/* Room List */}
      {localRooms.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-500">
          <Bed size={48} className="mx-auto text-gray-300 mb-2" />
          <p>Chưa có loại phòng nào</p>
          <p className="text-sm">Thêm loại phòng để quản lý giá và availability</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {localRooms.map((room) => (
            <div key={room.roomId} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-gray-900">{room.roomType}</h4>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {room.totalRooms} phòng
                    </span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      {room.availableRooms} trống
                    </span>
                  </div>
                  {room.description && (
                    <p className="text-sm text-gray-500 mt-1">{room.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      <span>Tối đa {room.maxOccupancy} người</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Bed size={14} />
                      <span>{room.bedType || 'Giường đôi'}</span>
                    </span>
                  </div>
                  {room.roomAmenities && room.roomAmenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {room.roomAmenities.slice(0, 5).map((amenity, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {amenity}
                        </span>
                      ))}
                      {room.roomAmenities.length > 5 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          +{room.roomAmenities.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-blue-600">
                      {new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND' 
                      }).format(room.pricePerNight)}
                    </p>
                    <p className="text-xs text-gray-500">/đêm</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenPriceCalendar(room)}
                      className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Quản lý giá & availability"
                    >
                      <Calendar size={18} />
                    </button>
                    <button
                      onClick={() => handleEditRoom(room)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.roomId)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsAddModalOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">
                  {editingRoom ? 'Chỉnh sửa loại phòng' : 'Thêm loại phòng mới'}
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit(handleAddRoom)} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Loại phòng <span className="text-red-500">*</span></label>
                  <select
                    {...register('roomType', { required: 'Loại phòng là bắt buộc' })}
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn loại phòng</option>
                    {ROOM_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.roomType && <p className="text-red-500 text-sm mt-1">{errors.roomType.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Mô tả</label>
                  <textarea
                    {...register('description')}
                    rows={2}
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Mô tả về loại phòng"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Giá/đêm (VND) <span className="text-red-500">*</span></label>
                    <input
                      {...register('pricePerNight', { required: 'Giá là bắt buộc', min: 1 })}
                      type="number"
                      className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: 500000"
                    />
                    {errors.pricePerNight && <p className="text-red-500 text-sm mt-1">{errors.pricePerNight.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Số phòng <span className="text-red-500">*</span></label>
                    <input
                      {...register('totalRooms', { required: 'Số phòng là bắt buộc', min: 1 })}
                      type="number"
                      min="1"
                      className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.totalRooms && <p className="text-red-500 text-sm mt-1">{errors.totalRooms.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Số người tối đa</label>
                    <input
                      {...register('maxOccupancy')}
                      type="number"
                      min="1"
                      className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Loại giường</label>
                    <select
                      {...register('bedType')}
                      className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn loại giường</option>
                      {BED_TYPES.map(bed => (
                        <option key={bed} value={bed}>{bed}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tiện nghi phòng</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROOM_AMENITIES.map(amenity => (
                      <label key={amenity} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          value={amenity}
                          {...register('roomAmenities')}
                          className="rounded text-blue-600"
                        />
                        <span className="text-sm">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {editingRoom ? 'Lưu thay đổi' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Price Calendar Modal */}
      <PriceCalendar
        isOpen={priceCalendarOpen}
        onClose={() => {
          setPriceCalendarOpen(false);
          setSelectedRoom(null);
        }}
        hotelId={hotelId}
        room={selectedRoom}
        onSave={handleSaveAvailability}
        isLoading={loadingRooms}
      />
    </div>
  );
};

export default RoomManager;
