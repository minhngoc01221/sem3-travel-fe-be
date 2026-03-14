import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, X, Save, Check, Bed, Bus, Utensils, User, Ticket, Shield, MoreHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import tourService from '@/services/tourService';

const SERVICE_CATEGORIES = [
  { value: 0, label: 'Lưu trú', icon: Bed },
  { value: 1, label: 'Vận chuyển', icon: Bus },
  { value: 2, label: 'Ăn uống', icon: Utensils },
  { value: 3, label: 'Hướng dẫn viên', icon: User },
  { value: 4, label: 'Vé tham quan', icon: Ticket },
  { value: 5, label: 'Bảo hiểm', icon: Shield },
  { value: 6, label: 'Khác', icon: MoreHorizontal }
];

const InclusionManager = ({ tourId, tourName, onClose }) => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('included'); // 'included' or 'excluded'
  const [formData, setFormData] = useState({
    serviceName: '',
    description: '',
    isIncluded: true,
    category: 6 // Other
  });

  useEffect(() => {
    if (tourId) {
      loadServices();
    }
  }, [tourId]);

  const loadServices = async () => {
    if (!tourId) return;
    setIsLoading(true);
    try {
      const res = await tourService.getServices(tourId);
      if (res.success) {
        setServices(res.data || []);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'category' ? parseInt(value) : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.serviceName.trim()) {
      toast.error('Vui lòng nhập tên dịch vụ');
      return;
    }

    try {
      const data = {
        serviceName: formData.serviceName,
        description: formData.description,
        isIncluded: formData.isIncluded,
        category: formData.category
      };

      let res;
      if (editingId) {
        res = await tourService.updateService(tourId, editingId, data);
        if (res.success) {
          toast.success('Cập nhật dịch vụ thành công');
        }
      } else {
        res = await tourService.createService(tourId, data);
        if (res.success) {
          toast.success('Thêm dịch vụ thành công');
        }
      }

      if (res.success) {
        loadServices();
        resetForm();
      } else {
        toast.error(res.message || 'Lỗi khi lưu');
      }
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Lỗi khi lưu dịch vụ');
    }
  };

  const handleEdit = (service) => {
    setFormData({
      serviceName: service.serviceName,
      description: service.description || '',
      isIncluded: service.isIncluded,
      category: service.category
    });
    setEditingId(service.serviceId);
    setShowAddForm(true);
  };

  const handleDelete = async (serviceId) => {
    if (!confirm('Bạn có chắc muốn xóa dịch vụ này?')) return;

    try {
      const res = await tourService.deleteService(tourId, serviceId);
      if (res.success) {
        toast.success('Xóa dịch vụ thành công');
        loadServices();
      } else {
        toast.error(res.message || 'Lỗi khi xóa');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Lỗi khi xóa dịch vụ');
    }
  };

  const resetForm = () => {
    setFormData({
      serviceName: '',
      description: '',
      isIncluded: true,
      category: 6 // Other
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const getCategoryIcon = (category) => {
    const cat = SERVICE_CATEGORIES.find(c => c.value === category);
    const Icon = cat?.icon || MoreHorizontal;
    return <Icon className="w-4 h-4" />;
  };

  const getCategoryLabel = (category) => {
    const cat = SERVICE_CATEGORIES.find(c => c.value === category);
    return cat?.label || 'Khác';
  };

  const includedServices = services.filter(s => s.isIncluded);
  const excludedServices = services.filter(s => !s.isIncluded);

  const displayedServices = activeTab === 'included' ? includedServices : excludedServices;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Quản lý dịch vụ</h2>
            <p className="text-sm text-gray-500 mt-1">{tourName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('included')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'included'
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Check className="w-4 h-4" />
              Bao gồm ({includedServices.length})
            </button>
            <button
              onClick={() => setActiveTab('excluded')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'excluded'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <X className="w-4 h-4" />
              Không bao gồm ({excludedServices.length})
            </button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-4">
                {editingId ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên dịch vụ *</label>
                    <input
                      type="text"
                      name="serviceName"
                      value={formData.serviceName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Ví dụ: Khách sạn 4 sao"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại dịch vụ</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {SERVICE_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Mô tả chi tiết dịch vụ..."
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="isIncluded"
                      value={true}
                      checked={formData.isIncluded === true}
                      onChange={() => setFormData(prev => ({ ...prev, isIncluded: true }))}
                      className="w-4 h-4 text-teal-500"
                    />
                    <span className="text-sm text-gray-700">Bao gồm trong tour</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="isIncluded"
                      value={false}
                      checked={formData.isIncluded === false}
                      onChange={() => setFormData(prev => ({ ...prev, isIncluded: false }))}
                      className="w-4 h-4 text-red-500"
                    />
                    <span className="text-sm text-gray-700">Không bao gồm</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2">
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
              Thêm dịch vụ
            </button>
          )}

          {/* Services List */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : displayedServices.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              {activeTab === 'included' ? (
                <>
                  <Check className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Chưa có dịch vụ bao gồm nào</p>
                  <p className="text-sm text-gray-400 mt-1">Thêm các dịch vụ có trong tour</p>
                </>
              ) : (
                <>
                  <X className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Chưa có dịch vụ ngoại trú nào</p>
                  <p className="text-sm text-gray-400 mt-1">Thêm các dịch vụ không bao gồm trong tour</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {displayedServices.map((service) => (
                <div
                  key={service.serviceId}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    service.isIncluded
                      ? 'bg-teal-50 border-teal-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      service.isIncluded
                        ? 'bg-teal-100 text-teal-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {getCategoryIcon(service.category)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{service.serviceName}</h4>
                      {service.description && (
                        <p className="text-sm text-gray-500">{service.description}</p>
                      )}
                      <span className="text-xs text-gray-400">{getCategoryLabel(service.category)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"
                      title="Sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(service.serviceId)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      title="Xóa"
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

export default InclusionManager;
