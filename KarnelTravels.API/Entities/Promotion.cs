using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KarnelTravels.API.Entities;

public class Promotion : BaseEntity
{
    [Required]
    [MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public DiscountType DiscountType { get; set; } = DiscountType.Percentage;

    [Column(TypeName = "decimal(18,2)")]
    public decimal DiscountValue { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? MinOrderAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? MaxDiscountAmount { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public string? ApplicableTo { get; set; } // Kept for backward compatibility

    public new bool IsActive { get; set; } = true;

    public PromotionTargetType TargetType { get; set; } = PromotionTargetType.All;

    public Guid? TargetId { get; set; }

    public bool ShowOnHome { get; set; } = false;

    // Navigation properties
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}

public enum DiscountType
{
    Percentage = 0,
    FixedAmount = 1
}

public enum PromotionTargetType
{
    All = 0,
    Tour = 1,
    Hotel = 2,
    Resort = 3,
    Transport = 4,
    Restaurant = 5
}
