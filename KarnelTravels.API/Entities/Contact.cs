using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KarnelTravels.API.Entities;

public class Contact : BaseEntity
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Subject { get; set; }

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string? ServiceType { get; set; } // Tour, Hotel, Resort, Transport, General

    public DateTime? PreferredDate { get; set; }

    public int? NumberOfPeople { get; set; }

    [Required]
    public string Message { get; set; } = string.Empty;

    public ContactStatus Status { get; set; } = ContactStatus.Unread;

    [MaxLength(1000)]
    public string? ReplyMessage { get; set; }

    public DateTime? RepliedAt { get; set; }

    // Foreign key
    public Guid? UserId { get; set; }

    [ForeignKey("UserId")]
    public virtual User? User { get; set; }
}

public enum ContactStatus
{
    Unread = 0,
    Read = 1,
    Replied = 2,
    Closed = 3
}
