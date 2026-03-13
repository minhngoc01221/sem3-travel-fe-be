using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KarnelTravels.API.Entities;

public class Transport : BaseEntity
{
    [Required]
    [MaxLength(100)]
    public string Type { get; set; } = string.Empty; // Flight, Bus, Train, Car, Limousine

    [Required]
    [MaxLength(200)]
    public string Provider { get; set; } = string.Empty; // Vietnam Airlines, Mai Linh, etc.

    [Required]
    [MaxLength(100)]
    public string FromCity { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string ToCity { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Route { get; set; } // e.g., "SGN - DAD"

    public TimeSpan? DepartureTime { get; set; }

    public TimeSpan? ArrivalTime { get; set; }

    public int DurationMinutes { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    public int AvailableSeats { get; set; }

    public string? Amenities { get; set; } // JSON array: WiFi, Meal, Entertainment

    public string? Images { get; set; } // JSON array

    public bool IsFeatured { get; set; } = false;

    // Navigation properties
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
