using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using KarnelTravels.API.Entities;

namespace KarnelTravels.API.Entities;

public class Booking : BaseEntity
{
    [Required]
    [MaxLength(50)]
    public string BookingCode { get; set; } = string.Empty;

    public BookingType Type { get; set; } // Tour, Hotel, Resort, Transport

    public BookingStatus Status { get; set; } = BookingStatus.Pending;

    public DateTime? ServiceDate { get; set; }

    public DateTime? EndDate { get; set; }

    public int Quantity { get; set; } = 1;

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? DiscountAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal FinalAmount { get; set; }

    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

    [MaxLength(50)]
    public string? PaymentMethod { get; set; }

    public DateTime? PaidAt { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    [MaxLength(500)]
    public string? CancellationReason { get; set; }

    public DateTime? CancelledAt { get; set; }

    public DateTime? ExpiredAt { get; set; }

    // Contact info
    [Required]
    [MaxLength(100)]
    public string ContactName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string ContactEmail { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string ContactPhone { get; set; } = string.Empty;

    // Foreign keys
    public Guid UserId { get; set; }

    [ForeignKey("UserId")]
    public virtual User? User { get; set; }

    public Guid? TourPackageId { get; set; }

    [ForeignKey("TourPackageId")]
    public virtual TourPackage? TourPackage { get; set; }

    public Guid? HotelId { get; set; }

    [ForeignKey("HotelId")]
    public virtual Hotel? Hotel { get; set; }

    public Guid? HotelRoomId { get; set; }

    [ForeignKey("HotelRoomId")]
    public virtual HotelRoom? HotelRoom { get; set; }

    public Guid? ResortId { get; set; }

    [ForeignKey("ResortId")]
    public virtual Resort? Resort { get; set; }

    public Guid? ResortRoomId { get; set; }

    [ForeignKey("ResortRoomId")]
    public virtual ResortRoom? ResortRoom { get; set; }

    public Guid? TransportId { get; set; }

    [ForeignKey("TransportId")]
    public virtual Transport? Transport { get; set; }

    public Guid? PromotionId { get; set; }

    [ForeignKey("PromotionId")]
    public virtual Promotion? Promotion { get; set; }

    public Guid? RestaurantId { get; set; }

    [ForeignKey("RestaurantId")]
    public virtual Restaurant? Restaurant { get; set; }

    // Navigation property
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}

public enum BookingType
{
    Tour = 0,
    Hotel = 1,
    Resort = 2,
    Transport = 3,
    Restaurant = 4
}

public enum BookingStatus
{
    Pending = 0,
    Confirmed = 1,
    Completed = 2,
    Cancelled = 3,
    Refunded = 4
}

public enum PaymentStatus
{
    Pending = 0,
    Paid = 1,
    Failed = 2,
    Refunded = 3
}
