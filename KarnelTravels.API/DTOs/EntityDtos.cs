namespace KarnelTravels.API.DTOs;

using System.ComponentModel.DataAnnotations;
using KarnelTravels.API.Entities;

// TouristSpot DTOs
public class TouristSpotDto
{
    public Guid SpotId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Region { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? City { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public List<string>? Images { get; set; }
    public decimal? TicketPrice { get; set; }
    public string? BestTime { get; set; }
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public bool IsFeatured { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateTouristSpotRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Region { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? City { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public List<string>? Images { get; set; }
    public decimal? TicketPrice { get; set; }
    public string? BestTime { get; set; }
    public bool IsFeatured { get; set; } = false;
}

public class ImageUploadResult
{
    public string Url { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
}

public class CreateRestaurantRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string City { get; set; } = string.Empty;
    public string CuisineType { get; set; } = string.Empty;
    public string PriceLevel { get; set; } = "Budget";
    public string Style { get; set; } = "Restaurant";
    public string? OpeningTime { get; set; }
    public string? ClosingTime { get; set; }
    public string? ContactPhone { get; set; }
    public List<string>? Images { get; set; }
    public bool HasReservation { get; set; } = true;
    public bool IsFeatured { get; set; } = false;
}

// Hotel DTOs
public class HotelDto
{
    public Guid HotelId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string City { get; set; } = string.Empty;
    public int StarRating { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactEmail { get; set; }
    public List<string>? Images { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public List<string>? Amenities { get; set; }
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public bool IsFeatured { get; set; }
}

public class HotelRoomDto
{
    public Guid RoomId { get; set; }
    public string RoomType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int MaxOccupancy { get; set; }
    public decimal PricePerNight { get; set; }
    public string? BedType { get; set; }
    public List<string>? RoomAmenities { get; set; }
    public List<string>? Images { get; set; }
    public int TotalRooms { get; set; }
    public int AvailableRooms { get; set; }
}

public class CreateHotelRoomRequest
{
    public string RoomType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int MaxOccupancy { get; set; } = 2;
    public decimal PricePerNight { get; set; }
    public string? BedType { get; set; }
    public List<string>? RoomAmenities { get; set; }
    public List<string>? Images { get; set; }
    public int TotalRooms { get; set; }
}

public class CreateHotelRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string City { get; set; } = string.Empty;
    public int StarRating { get; set; } = 3;
    public string? ContactName { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactEmail { get; set; }
    public List<string>? Images { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public List<string>? Amenities { get; set; }
    public string? CancellationPolicy { get; set; }
    public string? CheckInTime { get; set; }
    public string? CheckOutTime { get; set; }
    public bool IsFeatured { get; set; } = false;
    public List<CreateHotelRoomRequest>? Rooms { get; set; }
}

// Restaurant DTOs
public class RestaurantDto
{
    public Guid RestaurantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string City { get; set; } = string.Empty;
    public string CuisineType { get; set; } = string.Empty;
    public string PriceLevel { get; set; } = string.Empty;
    public string Style { get; set; } = string.Empty;
    public string? OpeningTime { get; set; }
    public string? ClosingTime { get; set; }
    public string? ContactPhone { get; set; }
    public List<string>? Images { get; set; }
    public bool HasReservation { get; set; }
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public bool IsFeatured { get; set; }
}

// Resort DTOs
public class ResortDto
{
    public Guid ResortId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string City { get; set; } = string.Empty;
    public string LocationType { get; set; } = string.Empty;
    public int StarRating { get; set; }
    public List<string>? Images { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public List<string>? Amenities { get; set; }
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public bool IsFeatured { get; set; }
}

public class ResortRoomDto
{
    public Guid RoomId { get; set; }
    public string RoomType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int MaxOccupancy { get; set; }
    public decimal PricePerNight { get; set; }
    public string? BedType { get; set; }
    public List<string>? RoomAmenities { get; set; }
    public List<string>? Images { get; set; }
    public int TotalRooms { get; set; }
    public int AvailableRooms { get; set; }
}

public class CreateResortRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string City { get; set; } = string.Empty;
    public string LocationType { get; set; } = string.Empty;
    public int StarRating { get; set; } = 3;
    public List<string>? Images { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public List<string>? Amenities { get; set; }
    public bool IsFeatured { get; set; } = false;
}

public class CreateResortRoomRequest
{
    public string RoomType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int MaxOccupancy { get; set; } = 2;
    public decimal PricePerNight { get; set; }
    public string? BedType { get; set; }
    public List<string>? RoomAmenities { get; set; }
    public List<string>? Images { get; set; }
    public int TotalRooms { get; set; }
}

// Transport DTOs
public class TransportDto
{
    public Guid TransportId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty;
    public string FromCity { get; set; } = string.Empty;
    public string ToCity { get; set; } = string.Empty;
    public string? Route { get; set; }
    public string? DepartureTime { get; set; }
    public string? ArrivalTime { get; set; }
    public int DurationMinutes { get; set; }
    public decimal Price { get; set; }
    public int AvailableSeats { get; set; }
    public List<string>? Amenities { get; set; }
    public List<string>? Images { get; set; }
    public bool IsFeatured { get; set; }
}

public class CreateTransportRequest
{
    public string Type { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty;
    public string FromCity { get; set; } = string.Empty;
    public string ToCity { get; set; } = string.Empty;
    public string? Route { get; set; }
    public string? DepartureTime { get; set; }
    public string? ArrivalTime { get; set; }
    public int DurationMinutes { get; set; }
    public decimal Price { get; set; }
    public int AvailableSeats { get; set; }
    public List<string>? Amenities { get; set; }
    public List<string>? Images { get; set; }
    public bool IsFeatured { get; set; } = false;
}

// Tour Package DTOs
public class TourPackageDto
{
    public Guid TourId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Destination { get; set; } = string.Empty;
    public int DurationDays { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public List<string>? Images { get; set; }
    public List<TourItineraryDto>? Itineraries { get; set; }
    public List<string>? Includes { get; set; }
    public List<string>? Excludes { get; set; }
    public int AvailableSlots { get; set; }
    public List<string>? DepartureDates { get; set; }
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsNewArrival { get; set; }
    public bool IsHotDeal { get; set; }
}

// Booking DTOs
public class BookingDto
{
    public Guid BookingId { get; set; }
    public string BookingCode { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? ServiceDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int Quantity { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal? DiscountAmount { get; set; }
    public decimal FinalAmount { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public string? PaymentMethod { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public string ItemName { get; set; } = string.Empty;
}

public class CreateBookingRequest
{
    public string Type { get; set; } = string.Empty;
    public Guid? TourPackageId { get; set; }
    public Guid? HotelId { get; set; }
    public Guid? HotelRoomId { get; set; }
    public Guid? ResortId { get; set; }
    public Guid? ResortRoomId { get; set; }
    public Guid? TransportId { get; set; }
    public Guid? RestaurantId { get; set; }
    public DateTime? ServiceDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int Quantity { get; set; } = 1;
    public string? PromoCode { get; set; }
    public string ContactName { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

// Promotion DTOs
public class PromotionDto
{
    public Guid PromoId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string DiscountType { get; set; } = string.Empty;
    public decimal DiscountValue { get; set; }
    public decimal? MinOrderAmount { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<string>? ApplicableTo { get; set; }
    public bool IsActive { get; set; }
    public bool ShowOnHome { get; set; }
}

public class CreatePromotionRequest
{
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string DiscountType { get; set; } = "Percentage";
    public decimal DiscountValue { get; set; }
    public decimal? MinOrderAmount { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<string>? ApplicableTo { get; set; }
    public bool ShowOnHome { get; set; } = false;
}

// Contact DTOs
public class ContactDto
{
    public Guid ContactId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string? ServiceType { get; set; }
    public DateTime? PreferredDate { get; set; }
    public int? NumberOfPeople { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateContactRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string? ServiceType { get; set; }
    public DateTime? PreferredDate { get; set; }
    public int? NumberOfPeople { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class UpdateContactRequest
{
    public string? ReplyMessage { get; set; }
    public ContactStatus Status { get; set; }
}

// Review DTOs
public class ReviewDto
{
    public Guid ReviewId { get; set; }
    public int Rating { get; set; }
    public string? Title { get; set; }
    public string? Content { get; set; }
    public List<string>? Images { get; set; }
    public string Type { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string? UserAvatar { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateReviewRequest
{
    public int Rating { get; set; }
    public string? Title { get; set; }
    public string? Content { get; set; }
    public List<string>? Images { get; set; }
    public string Type { get; set; } = string.Empty;
    public Guid? TouristSpotId { get; set; }
    public Guid? HotelId { get; set; }
    public Guid? RestaurantId { get; set; }
    public Guid? ResortId { get; set; }
    public Guid? TourPackageId { get; set; }
    public Guid? BookingId { get; set; }
}

// Favorite DTOs
public class FavoriteDto
{
    public Guid FavoriteId { get; set; }
    public string ItemType { get; set; } = string.Empty;
    public Guid ItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string? ItemImage { get; set; }
    public decimal? ItemPrice { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateFavoriteRequest
{
    public string ItemType { get; set; } = string.Empty;
    public Guid ItemId { get; set; }
}

// ==================== Vehicle Management DTOs ====================

// VehicleType DTOs
public class VehicleTypeDto
{
    public Guid VehicleTypeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateVehicleTypeRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
}

// TransportProvider DTOs
public class TransportProviderDto
{
    public Guid ProviderId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactAddress { get; set; }
    public string? Website { get; set; }
    public string? LogoUrl { get; set; }
    public int VehicleCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateTransportProviderRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactAddress { get; set; }
    public string? Website { get; set; }
    public string? LogoUrl { get; set; }
}

// Route DTOs
public class RouteDto
{
    public Guid RouteId { get; set; }
    public string DepartureLocation { get; set; } = string.Empty;
    public string ArrivalLocation { get; set; } = string.Empty;
    public string? RouteName { get; set; }
    public double? Distance { get; set; }
    public string? Description { get; set; }
    public string? EstimatedDuration { get; set; }
    public int ScheduleCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateRouteRequest
{
    public string DepartureLocation { get; set; } = string.Empty;
    public string ArrivalLocation { get; set; } = string.Empty;
    public string? RouteName { get; set; }
    public double? Distance { get; set; }
    public string? Description { get; set; }
    public string? EstimatedDuration { get; set; }
}

// Vehicle DTOs
public class VehicleDto
{
    public Guid VehicleId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public Guid VehicleTypeId { get; set; }
    public string VehicleTypeName { get; set; } = string.Empty;
    public Guid ProviderId { get; set; }
    public string ProviderName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public List<string>? Amenities { get; set; }
    public string Status { get; set; } = string.Empty;
    public int ScheduleCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateVehicleRequest
{
    public string Name { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public Guid VehicleTypeId { get; set; }
    public Guid ProviderId { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public List<string>? Amenities { get; set; }
    public string Status { get; set; } = "Available";
}

// Schedule DTOs
public class ScheduleDto
{
    public Guid ScheduleId { get; set; }
    public Guid VehicleId { get; set; }
    public string VehicleName { get; set; } = string.Empty;
    public string VehicleLicensePlate { get; set; } = string.Empty;
    public Guid RouteId { get; set; }
    public string RouteName { get; set; } = string.Empty;
    public string DepartureLocation { get; set; } = string.Empty;
    public string ArrivalLocation { get; set; } = string.Empty;
    public TimeSpan DepartureTime { get; set; }
    public TimeSpan? ArrivalTime { get; set; }
    public decimal Price { get; set; }
    public int AvailableSeats { get; set; }
    public int TotalSeats { get; set; }
    public List<DayOfWeek>? OperatingDays { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateScheduleRequest
{
    public Guid VehicleId { get; set; }
    public Guid RouteId { get; set; }
    public TimeSpan DepartureTime { get; set; }
    public TimeSpan? ArrivalTime { get; set; }
    public decimal Price { get; set; }
    public int TotalSeats { get; set; }
    public List<DayOfWeek>? OperatingDays { get; set; }
    public string? Notes { get; set; }
    public ScheduleStatus Status { get; set; } = ScheduleStatus.Active;
}

public class UpdateScheduleRequest
{
    public TimeSpan? DepartureTime { get; set; }
    public TimeSpan? ArrivalTime { get; set; }
    public decimal? Price { get; set; }
    public int? AvailableSeats { get; set; }
    public int? TotalSeats { get; set; }
    public List<DayOfWeek>? OperatingDays { get; set; }
    public string? Notes { get; set; }
    public ScheduleStatus? Status { get; set; }
}

public class UpdateVehicleStatusRequest
{
    public VehicleStatus Status { get; set; }
}

// ==================== Tour Management DTOs ====================

// Tour DTOs
public class TourDto
{
    public Guid TourId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DurationDays { get; set; }
    public int DurationNights { get; set; }
    public decimal BasePrice { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public List<string>? Highlights { get; set; }
    public string? Terms { get; set; }
    public string? CancellationPolicy { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsDomestic { get; set; }
    public int BookingCount { get; set; }
    public int TotalDepartures { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class TourWithDetailsDto : TourDto
{
    public List<TourItineraryDto> Itineraries { get; set; } = new();
    public List<TourDestinationDto> Destinations { get; set; } = new();
    public List<TourDepartureDto> Departures { get; set; } = new();
    public List<TourServiceDto> Services { get; set; } = new();
    public List<TourGuideDto> TourGuides { get; set; } = new();
    public List<TourImageDto> Images { get; set; } = new();
}

public class CreateTourRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(3000)]
    public string? Description { get; set; }

    public int DurationDays { get; set; }
    public int DurationNights { get; set; }
    public decimal BasePrice { get; set; }
    public TourStatus Status { get; set; } = TourStatus.Draft;
    public string? ThumbnailUrl { get; set; }
    public List<string>? Highlights { get; set; }
    public string? Terms { get; set; }
    public string? CancellationPolicy { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsDomestic { get; set; } = true;
}

public class UpdateTourRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public int? DurationDays { get; set; }
    public int? DurationNights { get; set; }
    public decimal? BasePrice { get; set; }
    public TourStatus? Status { get; set; }
    public string? ThumbnailUrl { get; set; }
    public List<string>? Highlights { get; set; }
    public string? Terms { get; set; }
    public string? CancellationPolicy { get; set; }
    public bool? IsFeatured { get; set; }
    public bool? IsDomestic { get; set; }
}

// Tour Itinerary DTOs
public class TourItineraryDto
{
    public Guid ItineraryId { get; set; }
    public int DayNumber { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Content { get; set; }
    public List<string>? Meals { get; set; }
    public string? Accommodation { get; set; }
    public string? Transport { get; set; }
    public List<string>? Activities { get; set; }
    public string? Notes { get; set; }
}

public class CreateTourItineraryRequest
{
    public int DayNumber { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(5000)]
    public string? Content { get; set; }

    public List<string>? Meals { get; set; }
    public string? Accommodation { get; set; }
    public string? Transport { get; set; }
    public List<string>? Activities { get; set; }
    public string? Notes { get; set; }
}

public class UpdateTourItineraryRequest
{
    public int? DayNumber { get; set; }
    public string? Title { get; set; }
    public string? Content { get; set; }
    public List<string>? Meals { get; set; }
    public string? Accommodation { get; set; }
    public string? Transport { get; set; }
    public List<string>? Activities { get; set; }
    public string? Notes { get; set; }
}

// Tour Destination DTOs
public class TourDestinationDto
{
    public Guid TourDestinationId { get; set; }
    public Guid TouristSpotId { get; set; }
    public string TouristSpotName { get; set; } = string.Empty;
    public string? TouristSpotImage { get; set; }
    public int DisplayOrder { get; set; }
}

public class AddTourDestinationRequest
{
    public Guid TouristSpotId { get; set; }
    public int DisplayOrder { get; set; }
}

// Tour Departure DTOs
public class TourDepartureDto
{
    public Guid DepartureId { get; set; }
    public DateTime DepartureDate { get; set; }
    public int AvailableSeats { get; set; }
    public int TotalSeats { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public bool IsAvailable { get; set; }
    public string? Notes { get; set; }
    public int BookedSeats { get; set; }
}

public class CreateTourDepartureRequest
{
    public DateTime DepartureDate { get; set; }
    public int TotalSeats { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public string? Notes { get; set; }
}

public class UpdateTourDepartureRequest
{
    public DateTime? DepartureDate { get; set; }
    public int? TotalSeats { get; set; }
    public decimal? Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public bool? IsAvailable { get; set; }
    public string? Notes { get; set; }
}

public class BulkCreateDepartureRequest
{
    public List<DateTime> Dates { get; set; } = new();
    public int TotalSeats { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public string? Notes { get; set; }
}

// Tour Service DTOs
public class TourServiceDto
{
    public Guid ServiceId { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsIncluded { get; set; }
    public string Category { get; set; } = string.Empty;
}

public class CreateTourServiceRequest
{
    [Required]
    [MaxLength(200)]
    public string ServiceName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public bool IsIncluded { get; set; } = true;
    public ServiceCategory Category { get; set; } = ServiceCategory.Other;
}

public class UpdateTourServiceRequest
{
    public string? ServiceName { get; set; }
    public string? Description { get; set; }
    public bool? IsIncluded { get; set; }
    public ServiceCategory? Category { get; set; }
}

// Tour Guide DTOs
public class TourGuideDto
{
    public Guid GuideId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? PhotoUrl { get; set; }
    public List<string>? Specialties { get; set; }
    public int YearsExperience { get; set; }
    public bool IsAvailable { get; set; }
}

public class CreateTourGuideRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(255)]
    public string? Email { get; set; }

    [MaxLength(500)]
    public string? PhotoUrl { get; set; }

    public List<string>? Specialties { get; set; }
    public int YearsExperience { get; set; }
    public bool IsAvailable { get; set; } = true;
}

public class UpdateTourGuideRequest
{
    public string? Name { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? PhotoUrl { get; set; }
    public List<string>? Specialties { get; set; }
    public int? YearsExperience { get; set; }
    public bool? IsAvailable { get; set; }
}

// Tour Image DTOs
public class TourImageDto
{
    public Guid ImageId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? Caption { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsPrimary { get; set; }
}

public class AddTourImageRequest
{
    [Required]
    public string ImageUrl { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Caption { get; set; }

    public int DisplayOrder { get; set; }
    public bool IsPrimary { get; set; }
}

public class UpdateTourImageRequest
{
    public string? ImageUrl { get; set; }
    public string? Caption { get; set; }
    public int? DisplayOrder { get; set; }
    public bool? IsPrimary { get; set; }
}
