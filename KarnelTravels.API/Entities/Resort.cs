using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KarnelTravels.API.Entities;

public class Resort : BaseEntity
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

    [MaxLength(100)]
    public string LocationType { get; set; } = string.Empty; // Beach, Mountain, Lake, Island, Eco, Spa

    public int StarRating { get; set; } = 3;

    public string? Images { get; set; } // JSON array

    [Column(TypeName = "decimal(18,2)")]
    public decimal? MinPrice { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? MaxPrice { get; set; }

    public string? Amenities { get; set; } // JSON array: Pool, Spa, Gym, Bar, KidsClub

    [MaxLength(1000)]
    public string? Activities { get; set; } // JSON array

    public string? Packages { get; set; } // JSON array

    public double Rating { get; set; } = 0;

    public int ReviewCount { get; set; } = 0;

    public bool IsFeatured { get; set; } = false;

    // Navigation properties
    public virtual ICollection<ResortRoom> Rooms { get; set; } = new List<ResortRoom>();
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}

public class ResortRoom : BaseEntity
{
    [Required]
    [MaxLength(100)]
    public string RoomType { get; set; } = string.Empty; // Bungalow, Villa, Suite

    [MaxLength(500)]
    public string? Description { get; set; }

    public int MaxOccupancy { get; set; } = 2;

    [Column(TypeName = "decimal(18,2)")]
    public decimal PricePerNight { get; set; }

    public string? BedType { get; set; }

    public string? RoomAmenities { get; set; } // JSON array

    public string? Images { get; set; } // JSON array

    public int TotalRooms { get; set; }

    public int AvailableRooms { get; set; }

    // Foreign key
    public Guid ResortId { get; set; }

    [ForeignKey("ResortId")]
    public virtual Resort? Resort { get; set; }

    // Navigation properties
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
