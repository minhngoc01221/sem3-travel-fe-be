using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KarnelTravels.API.Entities;

public class HotelRoomAvailability : BaseEntity
{
    public Guid RoomId { get; set; }

    [ForeignKey("RoomId")]
    public virtual HotelRoom? Room { get; set; }

    [Required]
    public DateTime Date { get; set; }

    public int AvailableRooms { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }
}
