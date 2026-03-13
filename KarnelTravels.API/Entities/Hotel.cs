using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KarnelTravels.API.Entities;

public class Hotel : BaseEntity
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string City { get; set; } = string.Empty;

    public int StarRating { get; set; } = 3;

    [MaxLength(100)]
    public string? ContactName { get; set; }

    [MaxLength(50)]
    public string? ContactPhone { get; set; }

    [MaxLength(255)]
    public string? ContactEmail { get; set; }

    public string? Images { get; set; } // JSON array

    [Column(TypeName = "decimal(18,2)")]
    public decimal? MinPrice { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? MaxPrice { get; set; }

    public string? Amenities { get; set; } // JSON array: Wifi, Pool, Restaurant, Gym, Spa

    [MaxLength(1000)]
    public string? CancellationPolicy { get; set; }

    [MaxLength(500)]
    public string? CheckInTime { get; set; }

    [MaxLength(500)]
    public string? CheckOutTime { get; set; }

    public double Rating { get; set; } = 0;

    public int ReviewCount { get; set; } = 0;

    public bool IsFeatured { get; set; } = false;

    // Navigation properties
    public virtual ICollection<HotelRoom> Rooms { get; set; } = new List<HotelRoom>();
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}

public class HotelRoom : BaseEntity
{
    [Required]
    [MaxLength(100)]
    public string RoomType { get; set; } = string.Empty; // Standard, Deluxe, Suite

    [MaxLength(500)]
    public string? Description { get; set; }

    public int MaxOccupancy { get; set; } = 2;

    [Column(TypeName = "decimal(18,2)")]
    public decimal PricePerNight { get; set; }

    public string? BedType { get; set; } // Single, Double, Twin

    public string? RoomAmenities { get; set; } // JSON array

    public string? Images { get; set; } // JSON array

    public int TotalRooms { get; set; }

    public int AvailableRooms { get; set; }

    // Foreign key
    public Guid HotelId { get; set; }

    [ForeignKey("HotelId")]
    public virtual Hotel? Hotel { get; set; }

    // Navigation properties
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
