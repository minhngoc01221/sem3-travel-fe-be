namespace KarnelTravels.API.DTOs;

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

public class TourItineraryDto
{
    public Guid ItineraryId { get; set; }
    public int Day { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<string>? Activities { get; set; }
}

public class CreateTourRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Destination { get; set; } = string.Empty;
    public int DurationDays { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public List<string>? Images { get; set; }
    public List<TourItineraryRequest>? Itineraries { get; set; }
    public List<string>? Includes { get; set; }
    public List<string>? Excludes { get; set; }
    public int AvailableSlots { get; set; }
    public List<string>? DepartureDates { get; set; }
    public bool IsFeatured { get; set; } = false;
    public bool IsNewArrival { get; set; } = false;
    public bool IsHotDeal { get; set; } = false;
}

public class TourItineraryRequest
{
    public int Day { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<string>? Activities { get; set; }
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
