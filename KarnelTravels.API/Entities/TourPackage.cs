using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KarnelTravels.API.Entities;

public class TourPackage : BaseEntity
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [MaxLength(100)]
    public string Destination { get; set; } = string.Empty;

    public int DurationDays { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? DiscountPrice { get; set; }

    public string? Images { get; set; } // JSON array

    public string? Gallery { get; set; } // JSON array

    public string? Includes { get; set; } // JSON array: Hotel, Meals, Transport, Guide

    public string? Excludes { get; set; } // JSON array

    public int AvailableSlots { get; set; }

    public string? DepartureDates { get; set; } // JSON array of dates

    public double Rating { get; set; } = 0;

    public int ReviewCount { get; set; } = 0;

    public bool IsFeatured { get; set; } = false;

    public bool IsNewArrival { get; set; } = false;

    public bool IsHotDeal { get; set; } = false;

    // Navigation properties
    public virtual ICollection<TourItinerary> Itineraries { get; set; } = new List<TourItinerary>();
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}
