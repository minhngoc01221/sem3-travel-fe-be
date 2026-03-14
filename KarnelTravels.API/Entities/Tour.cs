using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KarnelTravels.API.Entities;

// ==================== TOUR ====================
public class Tour : BaseEntity
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(3000)]
    public string? Description { get; set; }

    public int DurationDays { get; set; }

    public int DurationNights { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal BasePrice { get; set; }

    public TourStatus Status { get; set; } = TourStatus.Draft;

    [MaxLength(500)]
    public string? ThumbnailUrl { get; set; }

    [MaxLength(1000)]
    public string? Highlights { get; set; } // JSON array of highlights

    [MaxLength(500)]
    public string? Terms { get; set; } // Điều kiện

    [MaxLength(500)]
    public string? CancellationPolicy { get; set; } // Chính sách hủy

    public bool IsFeatured { get; set; } = false;

    public bool IsDomestic { get; set; } = true; // Trong nước/Quốc tế

    // Navigation properties
    public virtual ICollection<TourItinerary> Itineraries { get; set; } = new List<TourItinerary>();
    public virtual ICollection<TourDestination> Destinations { get; set; } = new List<TourDestination>();
    public virtual ICollection<TourDeparture> Departures { get; set; } = new List<TourDeparture>();
    public virtual ICollection<TourService> Services { get; set; } = new List<TourService>();
    public virtual ICollection<TourGuide> TourGuides { get; set; } = new List<TourGuide>();
    public virtual ICollection<TourImage> Images { get; set; } = new List<TourImage>();
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}

public enum TourStatus
{
    Draft = 0,        // Nháp
    Published = 1,    // Đã đăng
    Active = 2,       // Đang hoạt động
    Paused = 3,       // Tạm dừng
    Archived = 4      // Lưu trữ
}

// ==================== TOUR ITINERARY ====================
public class TourItinerary : BaseEntity
{
    public int DayNumber { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(5000)]
    public string? Content { get; set; } // Mô tả chi tiết lịch trình

    [MaxLength(1000)]
    public string? Meals { get; set; } // JSON: ["Sáng: Buffet","Trưa: Ăn trưa","Tối: BBQ"]

    [MaxLength(500)]
    public string? Accommodation { get; set; } // Khách sạn ngày này

    [MaxLength(500)]
    public string? Transport { get; set; } // Phương tiện di chuyển

    [MaxLength(1000)]
    public string? Activities { get; set; } // JSON array of activities

    public string? Notes { get; set; } // Ghi chú

    // Foreign key
    public Guid TourId { get; set; }

    [ForeignKey("TourId")]
    public virtual Tour? Tour { get; set; }
}

// ==================== TOUR DESTINATION ====================
public class TourDestination : BaseEntity
{
    public int DisplayOrder { get; set; } // Thứ tự hiển thị

    // Foreign keys
    public Guid TourId { get; set; }
    public Guid TouristSpotId { get; set; }

    [ForeignKey("TourId")]
    public virtual Tour? Tour { get; set; }

    [ForeignKey("TouristSpotId")]
    public virtual TouristSpot? TouristSpot { get; set; }
}

// ==================== TOUR DEPARTURE ====================
public class TourDeparture : BaseEntity
{
    public DateTime DepartureDate { get; set; }

    public int AvailableSeats { get; set; }

    public int TotalSeats { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? DiscountPrice { get; set; }

    public bool IsAvailable { get; set; } = true;

    public string? Notes { get; set; } // Ghi chú đặc biệt

    // Foreign key
    public Guid TourId { get; set; }

    [ForeignKey("TourId")]
    public virtual Tour? Tour { get; set; }

    // Navigation
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}

// ==================== TOUR SERVICE ====================
public class TourService : BaseEntity
{
    [Required]
    [MaxLength(200)]
    public string ServiceName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public bool IsIncluded { get; set; } = true; // true: Bao gồm, false: Không bao gồm

    public ServiceCategory Category { get; set; } // Loại dịch vụ

    // Foreign key
    public Guid TourId { get; set; }

    [ForeignKey("TourId")]
    public virtual Tour? Tour { get; set; }
}

public enum ServiceCategory
{
    Accommodation = 0,  // Lưu trú
    Transport = 1,     // Vận chuyển
    Meal = 2,           // Ăn uống
    Guide = 3,          // Hướng dẫn viên
    Ticket = 4,         // Vé tham quan
    Insurance = 5,      // Bảo hiểm
    Other = 6           // Khác
}

// ==================== TOUR GUIDE ====================
public class TourGuide : BaseEntity
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

    [MaxLength(1000)]
    public string? Specialties { get; set; } // JSON: ["Du lịch biển","Du lịch núi"]

    public int YearsExperience { get; set; }

    public bool IsAvailable { get; set; } = true;

    // Navigation
    public virtual ICollection<Tour> Tours { get; set; } = new List<Tour>();
}

// ==================== TOUR IMAGE ====================
public class TourImage : BaseEntity
{
    [Required]
    [MaxLength(500)]
    public string ImageUrl { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Caption { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsPrimary { get; set; } = false;

    // Foreign key
    public Guid TourId { get; set; }

    [ForeignKey("TourId")]
    public virtual Tour? Tour { get; set; }
}
