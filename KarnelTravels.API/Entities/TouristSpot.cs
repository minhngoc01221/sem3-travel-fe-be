using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KarnelTravels.API.Entities;

public class TouristSpot : BaseEntity
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [MaxLength(100)]
    public string Region { get; set; } = string.Empty; // North, Central, South

    [MaxLength(100)]
    public string Type { get; set; } = string.Empty; // Beach, Mountain, Historical, Waterfall

    [MaxLength(500)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    public double? Latitude { get; set; }

    public double? Longitude { get; set; }

    public string? Images { get; set; } // JSON array of image URLs

    [Column(TypeName = "decimal(18,2)")]
    public decimal? TicketPrice { get; set; }

    [MaxLength(500)]
    public string? BestTime { get; set; }

    public double Rating { get; set; } = 0;

    public int ReviewCount { get; set; } = 0;

    public bool IsFeatured { get; set; } = false;

    // Navigation properties
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}
