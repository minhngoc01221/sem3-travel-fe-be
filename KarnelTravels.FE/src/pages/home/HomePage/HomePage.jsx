import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Plane,
  Search,
  MapPin,
  Palmtree,
  Building2,
  Utensils,
  Bus,
  Star,
  ArrowRight,
  Calendar,
  Users,
  Heart,
  CheckCircle,
  Mountain,
  Waves,
  Sun,
  Camera
} from 'lucide-react';

const destinations = [
  {
    id: 1,
    name: 'Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80',
    description: 'Thành phố đáng sống nhất Việt Nam',
    hotels: 234,
    tours: 56
  },
  {
    id: 2,
    name: 'Phú Quốc',
    image: 'https://images.unsplash.com/photo-1536682961021-145f3053a224?w=800&q=80',
    description: 'Đảo ngọc xanh bình yên',
    hotels: 189,
    tours: 42
  },
  {
    id: 3,
    name: 'Sa Pa',
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80',
    description: 'Thị trấn sương mù huyền bí',
    hotels: 156,
    tours: 38
  },
  {
    id: 4,
    name: 'Nha Trang',
    image: 'https://images.unsplash.com/photo-1540883470104-2f9a8a57e5a3?w=800&q=80',
    description: 'Thiên đường biển đảo',
    hotels: 287,
    tours: 63
  }
];

const tours = [
  {
    id: 1,
    name: 'Tour Đà Nẵng - Hội An 4N3Đ',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80',
    price: '4.990.000',
    duration: '4 ngày 3 đêm',
    rating: 4.8,
    reviews: 127
  },
  {
    id: 2,
    name: 'Tour Phú Quốc 3N2Đ',
    image: 'https://images.unsplash.com/photo-1536682961021-145f3053a224?w=800&q=80',
    price: '3.490.000',
    duration: '3 ngày 2 đêm',
    rating: 4.9,
    reviews: 89
  },
  {
    id: 3,
    name: 'Tour Sa Pa - Fansipan 2N1Đ',
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80',
    price: '2.990.000',
    duration: '2 ngày 1 đêm',
    rating: 4.7,
    reviews: 156
  }
];

const categories = [
  { icon: MapPin, name: 'Điểm du lịch', count: 156 },
  { icon: Palmtree, name: 'Tour du lịch', count: 89 },
  { icon: Building2, name: 'Khách sạn', count: 234 },
  { icon: Utensils, name: 'Nhà hàng', count: 178 },
  { icon: Bus, name: 'Thuê xe', count: 45 },
  { icon: Plane, name: 'Vé máy bay', count: 12 }
];

const features = [
  {
    icon: CheckCircle,
    title: 'Giá tốt nhất',
    description: 'Cam kết giá tốt nhất thị trường'
  },
  {
    icon: Users,
    title: 'Hỗ trợ 24/7',
    description: 'Đội ngũ hỗ trợ nhiệt tình'
  },
  {
    icon: Star,
    title: 'Đánh giá cao',
    description: 'Hơn 10,000+ đánh giá 5 sao'
  },
  {
    icon: Heart,
    title: 'Uy tín',
    description: 'Nhiều năm kinh nghiệm'
  }
];

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1920&q=80"
            alt="Travel"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Plane className="w-4 h-4" />
              <span className="text-sm font-medium">Khám phá Việt Nam cùng KarnelTravels</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Hành trình của bạn
              <span className="block text-teal-400">bắt đầu tại đây</span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Khám phá những điểm đến tuyệt vời nhất Việt Nam và thế giới.
              Trải nghiệm dịch vụ chuyên nghiệp, giá cả hợp lý
            </p>

            {/* Search Box */}
            <div className="bg-white rounded-2xl p-2 md:p-3 shadow-2xl max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="md:col-span-2 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Bạn muốn đi đâu?"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border-0 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Ngày khởi hành"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border-0 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button size="lg" className="w-full h-full min-h-[52px]">
                  <Search className="w-5 h-5 mr-2" />
                  Tìm kiếm
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/info/${category.name.toLowerCase().replace(/ /g, '-')}`}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50/50 transition-all duration-300 text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <category.icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.count} địa điểm</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Điểm đến phổ biến
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Khám phá những địa điểm du lịch hấp dẫn nhất được nhiều du khách lựa chọn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((destination) => (
              <Link key={destination.id} to={`/info/destinations/${destination.id}`}>
                <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-sm font-medium text-gray-800">
                      {destination.name}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-1">{destination.name}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{destination.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {destination.hotels} khách sạn
                      </span>
                      <span className="flex items-center gap-1">
                        <Palmtree className="w-4 h-4" />
                        {destination.tours} tours
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" size="lg" asChild>
              <Link to="/info/destinations">
                Xem tất cả điểm đến
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Tour du lịch nổi bật
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Những tour được đánh giá cao và được nhiều khách hàng lựa chọn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <Card key={tour.id} className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={tour.image}
                    alt={tour.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2 py-1 bg-teal-500 text-white rounded-lg text-sm font-medium flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    {tour.rating}
                  </div>
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{tour.duration}</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">{tour.name}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-teal-600">{tour.price}</span>
                      <span className="text-muted-foreground text-sm">/người</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{tour.reviews} đánh giá</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button size="lg" asChild>
              <Link to="/info/tours">
                Xem tất cả tour
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-cyan-700 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tại sao chọn KarnelTravels?
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Chúng tôi cam kết mang đến cho bạn trải nghiệm du lịch tốt nhất
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Types */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Trải nghiệm đa dạng
            </h2>
            <p className="text-muted-foreground text-lg">
              Khám phá nhiều loại hình du lịch phong phú
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="group overflow-hidden border-0 shadow-md">
              <div className="relative h-64">
                <img
                  src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80"
                  alt="Biển đảo"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <Waves className="w-8 h-8 mb-2" />
                  <h3 className="font-bold text-xl">Du lịch biển đảo</h3>
                  <p className="text-white/80 text-sm">Khám phá những bờ biển đẹp nhất</p>
                </div>
              </div>
            </Card>

            <Card className="group overflow-hidden border-0 shadow-md">
              <div className="relative h-64">
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
                  alt="Núi rừng"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <Mountain className="w-8 h-8 mb-2" />
                  <h3 className="font-bold text-xl">Du lịch núi rừng</h3>
                  <p className="text-white/80 text-sm">Chinh phục đỉnh cao hùng vĩ</p>
                </div>
              </div>
            </Card>

            <Card className="group overflow-hidden border-0 shadow-md">
              <div className="relative h-64">
                <img
                  src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80"
                  alt="Văn hóa"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <Sun className="w-8 h-8 mb-2" />
                  <h3 className="font-bold text-xl">Du lịch văn hóa</h3>
                  <p className="text-white/80 text-sm">Trải nghiệm bản sắc văn hóa</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <Card className="overflow-hidden border-0 shadow-2xl">
            <div className="grid md:grid-cols-2">
              <div className="relative h-64 md:h-auto">
                <img
                  src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80"
                  alt="Bắt đầu hành trình"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Sẵn sàng cho chuyến đi?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Hãy để chúng tôi giúp bạn lên kế hoạch cho chuyến du lịch hoàn hảo.
                  Liên hệ ngay để được tư vấn miễn phí!
                </p>
                <div className="flex gap-4">
                  <Button size="lg" asChild>
                    <Link to="/contact">
                      Liên hệ ngay
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/search">
                      Tìm kiếm tour
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
