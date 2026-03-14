import { Navigate, Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from '@/layouts/MainLayout/MainLayout';
import AdminLayout from '@/layouts/AdminLayout/AdminLayout';
import AuthLayout from '@/layouts/AuthLayout/AuthLayout';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage/RegisterPage';
import ForbiddenPage from '@/pages/error/ForbiddenPage/ForbiddenPage';

// Pages
import HomePage from '@/pages/home/HomePage/HomePage';

// Admin Dashboard
import DashboardPage from '@/pages/admin/dashboard/DashboardPage';
import TouristSpotsPage from '@/pages/admin/tourist-spots/TouristSpotsPage';

const AboutPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-4xl font-bold text-gray-800">Giới thiệu</h1>
  </div>
);

const SearchPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-4xl font-bold text-gray-800">Tìm kiếm</h1>
  </div>
);

const ContactPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-4xl font-bold text-gray-800">Liên hệ</h1>
  </div>
);

const ProfilePage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-4xl font-bold text-gray-800">Hồ sơ</h1>
  </div>
);

const WishlistPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-4xl font-bold text-gray-800">Danh sách yêu thích</h1>
  </div>
);

const DestinationsPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-4xl font-bold text-gray-800">Điểm du lịch</h1>
  </div>
);

const ToursPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-4xl font-bold text-gray-800">Tour du lịch</h1>
  </div>
);

const HotelsPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-4xl font-bold text-gray-800">Khách sạn</h1>
  </div>
);

const RestaurantsPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-4xl font-bold text-gray-800">Nhà hàng</h1>
  </div>
);

const ResortsPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-4xl font-bold text-gray-800">Resort</h1>
  </div>
);

const TransportsPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-4xl font-bold text-gray-800">Phương tiện</h1>
  </div>
);

// Admin Pages
import AdminHotelsPage from '@/pages/admin/hotels/HotelsPage';
import RoomDetailsPage from '@/pages/admin/hotels/RoomDetailsPage';
import BookingsPage from '@/pages/admin/bookings/BookingsPage';
import PromotionsPage from '@/pages/admin/promotions/PromotionsPage';
import ContactsPage from '@/pages/admin/contacts/ContactsPage';

const AdminDashboard = () => <DashboardPage />;

const AdminUsers = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-4xl font-bold text-gray-800">Quản lý người dùng</h1>
  </div>
);

const AdminBookings = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-4xl font-bold text-gray-800">Quản lý đặt tour</h1>
  </div>
);

const AdminDestinations = () => <TouristSpotsPage />;

const AdminTours = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-4xl font-bold text-gray-800">Quản lý tour</h1>
  </div>
);

const AdminHotels = () => <AdminHotelsPage />;

const AdminRestaurants = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-4xl font-bold text-gray-800">Quản lý nhà hàng</h1>
  </div>
);

const AdminResorts = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-4xl font-bold text-gray-800">Quản lý resort</h1>
  </div>
);

const AdminTransports = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-4xl font-bold text-gray-800">Quản lý phương tiện</h1>
  </div>
);

const AdminReports = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-4xl font-bold text-gray-800">Báo cáo & Thống kê</h1>
  </div>
);

const AdminSettings = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-4xl font-bold text-gray-800">Cài đặt</h1>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* ==================== AUTH LAYOUT (Public - No Protection) ==================== */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* ==================== MAIN LAYOUT (User - Protected) ==================== */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="promotions" element={<PromotionsPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="info/destinations" element={<DestinationsPage />} />
        <Route path="info/tours" element={<ToursPage />} />
        <Route path="info/hotels" element={<HotelsPage />} />
        <Route path="info/restaurants" element={<RestaurantsPage />} />
        <Route path="info/resorts" element={<ResortsPage />} />
        <Route path="info/transports" element={<TransportsPage />} />
      </Route>

      {/* ==================== ADMIN LAYOUT (Admin Only) ==================== */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="destinations" element={<AdminDestinations />} />
        <Route path="tours" element={<AdminTours />} />
        <Route path="hotels" element={<AdminHotels />} />
        <Route path="hotels/:hotelId/rooms" element={<RoomDetailsPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="promotions" element={<PromotionsPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="restaurants" element={<AdminRestaurants />} />
        <Route path="resorts" element={<AdminResorts />} />
        <Route path="transports" element={<AdminTransports />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* ==================== ERROR PAGES ==================== */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
