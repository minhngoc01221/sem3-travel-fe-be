using System.Security.Claims;
using System.Text.Json;
using KarnelTravels.API.DTOs;
using KarnelTravels.API.Entities;
using KarnelTravels.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KarnelTravels.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly KarnelTravelsDbContext _context;

    public BookingsController(KarnelTravelsDbContext context)
    {
        _context = context;
    }

    [HttpGet("my-orders")]
    public async Task<ActionResult<ApiResponse<List<BookingDto>>>> GetMyOrders(
        [FromQuery] string? type,
        [FromQuery] string? status,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 10)
    {
        var userId = GetUserId();
        var query = _context.Bookings.Where(b => b.UserId == userId).AsQueryable();

        if (!string.IsNullOrEmpty(type))
            query = query.Where(b => b.Type.ToString() == type);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(b => b.Status.ToString() == status);

        var totalCount = await query.CountAsync();
        var items = await query.OrderByDescending(b => b.CreatedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = items.Select(b => new BookingDto
        {
            BookingId = b.Id,
            BookingCode = b.BookingCode,
            Type = b.Type.ToString(),
            Status = b.Status.ToString(),
            ServiceDate = b.ServiceDate,
            EndDate = b.EndDate,
            Quantity = b.Quantity,
            TotalAmount = b.TotalAmount,
            DiscountAmount = b.DiscountAmount,
            FinalAmount = b.FinalAmount,
            PaymentStatus = b.PaymentStatus.ToString(),
            PaymentMethod = b.PaymentMethod,
            PaidAt = b.PaidAt,
            Notes = b.Notes,
            CreatedAt = b.CreatedAt,
            ItemName = GetBookingItemName(b)
        }).ToList();

        return Ok(new ApiResponse<List<BookingDto>>
        {
            Success = true,
            Data = result,
            Pagination = new PaginationInfo
            {
                PageIndex = pageIndex,
                PageSize = pageSize,
                TotalCount = totalCount
            }
        });
    }

    [HttpPost("tour")]
    public async Task<ActionResult<ApiResponse<BookingDto>>> BookTour([FromBody] CreateBookingRequest request)
    {
        var userId = GetUserId();
        var tour = await _context.TourPackages.FindAsync(request.TourPackageId);

        if (tour == null)
        {
            return BadRequest(new ApiResponse<BookingDto>
            {
                Success = false,
                Message = "Tour not found"
            });
        }

        decimal discountAmount = 0;
        Promotion? promotion = null;

        if (!string.IsNullOrEmpty(request.PromoCode))
        {
            promotion = await _context.Promotions
                .FirstOrDefaultAsync(p => p.Code == request.PromoCode && p.IsActive && p.StartDate <= DateTime.UtcNow && p.EndDate >= DateTime.UtcNow);

            if (promotion != null)
            {
                discountAmount = promotion.DiscountType == DiscountType.Percentage
                    ? tour.Price * request.Quantity * promotion.DiscountValue / 100
                    : promotion.DiscountValue;

                if (promotion.MaxDiscountAmount.HasValue && discountAmount > promotion.MaxDiscountAmount.Value)
                    discountAmount = promotion.MaxDiscountAmount.Value;
            }
        }

        var finalAmount = (tour.Price * request.Quantity) - discountAmount;
        var bookingCode = $"KT-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        var booking = new Booking
        {
            UserId = userId,
            TourPackageId = request.TourPackageId,
            Type = BookingType.Tour,
            Status = BookingStatus.Pending,
            ServiceDate = request.ServiceDate,
            Quantity = request.Quantity,
            TotalAmount = tour.Price * request.Quantity,
            DiscountAmount = discountAmount,
            FinalAmount = finalAmount,
            PaymentStatus = PaymentStatus.Pending,
            ContactName = request.ContactName,
            ContactEmail = request.ContactEmail,
            ContactPhone = request.ContactPhone,
            Notes = request.Notes,
            BookingCode = bookingCode,
            PromotionId = promotion?.Id,
            ExpiredAt = DateTime.UtcNow.AddHours(24)
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<BookingDto>
        {
            Success = true,
            Message = "Booking created successfully",
            Data = new BookingDto
            {
                BookingId = booking.Id,
                BookingCode = booking.BookingCode,
                Type = booking.Type.ToString(),
                Status = booking.Status.ToString(),
                ServiceDate = booking.ServiceDate,
                Quantity = booking.Quantity,
                TotalAmount = booking.TotalAmount,
                DiscountAmount = booking.DiscountAmount,
                FinalAmount = booking.FinalAmount,
                PaymentStatus = booking.PaymentStatus.ToString(),
                CreatedAt = booking.CreatedAt,
                ItemName = tour.Name
            }
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<BookingDto>>> GetBooking(Guid id)
    {
        var userId = GetUserId();
        var booking = await _context.Bookings
            .Include(b => b.TourPackage)
            .Include(b => b.Hotel)
            .Include(b => b.Resort)
            .Include(b => b.Transport)
            .Include(b => b.Restaurant)
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (booking == null)
        {
            return NotFound(new ApiResponse<BookingDto>
            {
                Success = false,
                Message = "Booking not found"
            });
        }

        return Ok(new ApiResponse<BookingDto>
        {
            Success = true,
            Data = new BookingDto
            {
                BookingId = booking.Id,
                BookingCode = booking.BookingCode,
                Type = booking.Type.ToString(),
                Status = booking.Status.ToString(),
                ServiceDate = booking.ServiceDate,
                EndDate = booking.EndDate,
                Quantity = booking.Quantity,
                TotalAmount = booking.TotalAmount,
                DiscountAmount = booking.DiscountAmount,
                FinalAmount = booking.FinalAmount,
                PaymentStatus = booking.PaymentStatus.ToString(),
                PaymentMethod = booking.PaymentMethod,
                PaidAt = booking.PaidAt,
                Notes = booking.Notes,
                CreatedAt = booking.CreatedAt,
                ItemName = GetBookingItemName(booking)
            }
        });
    }

    [HttpPost("{id}/cancel")]
    public async Task<ActionResult<ApiResponse<string>>> CancelBooking(Guid id, [FromBody] string reason)
    {
        var userId = GetUserId();
        var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (booking == null)
        {
            return NotFound(new ApiResponse<string>
            {
                Success = false,
                Message = "Booking not found"
            });
        }

        if (booking.Status == BookingStatus.Cancelled)
        {
            return BadRequest(new ApiResponse<string>
            {
                Success = false,
                Message = "Booking already cancelled"
            });
        }

        booking.Status = BookingStatus.Cancelled;
        booking.CancellationReason = reason;
        booking.CancelledAt = DateTime.UtcNow;
        booking.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<string>
        {
            Success = true,
            Message = "Booking cancelled successfully"
        });
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim ?? Guid.Empty.ToString());
    }

    private string GetBookingItemName(Booking booking)
    {
        if (booking.TourPackage != null) return booking.TourPackage.Name;
        if (booking.Hotel != null) return booking.Hotel.Name;
        if (booking.Resort != null) return booking.Resort.Name;
        if (booking.Transport != null) return $"{booking.Transport.Type} - {booking.Transport.Route}";
        if (booking.Restaurant != null) return booking.Restaurant.Name;
        return "Unknown";
    }

    // Hotel Booking
    [HttpPost("hotel")]
    public async Task<ActionResult<ApiResponse<BookingDto>>> BookHotel([FromBody] CreateBookingRequest request)
    {
        var userId = GetUserId();
        var hotel = await _context.Hotels.FindAsync(request.HotelId);

        if (hotel == null)
        {
            return BadRequest(new ApiResponse<BookingDto>
            {
                Success = false,
                Message = "Hotel not found"
            });
        }

        decimal price = 0;
        if (request.HotelRoomId.HasValue)
        {
            var room = await _context.HotelRooms.FindAsync(request.HotelRoomId);
            if (room != null) price = room.PricePerNight;
        }

        var nights = request.EndDate.HasValue && request.ServiceDate.HasValue
            ? (int)(request.EndDate.Value - request.ServiceDate.Value).TotalDays
            : 1;
        price *= nights;

        decimal discountAmount = 0;
        if (!string.IsNullOrEmpty(request.PromoCode))
        {
            var promotion = await _context.Promotions
                .FirstOrDefaultAsync(p => p.Code == request.PromoCode && p.IsActive);
            if (promotion != null)
            {
                discountAmount = promotion.DiscountType == DiscountType.Percentage
                    ? price * promotion.DiscountValue / 100
                    : promotion.DiscountValue;
            }
        }

        var finalAmount = price - discountAmount;
        var bookingCode = $"KB-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        var booking = new Booking
        {
            UserId = userId,
            HotelId = request.HotelId,
            HotelRoomId = request.HotelRoomId,
            Type = BookingType.Hotel,
            Status = BookingStatus.Pending,
            ServiceDate = request.ServiceDate,
            EndDate = request.EndDate,
            Quantity = request.Quantity,
            TotalAmount = price,
            DiscountAmount = discountAmount,
            FinalAmount = finalAmount,
            PaymentStatus = PaymentStatus.Pending,
            ContactName = request.ContactName,
            ContactEmail = request.ContactEmail,
            ContactPhone = request.ContactPhone,
            Notes = request.Notes,
            BookingCode = bookingCode,
            ExpiredAt = DateTime.UtcNow.AddHours(24)
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<BookingDto>
        {
            Success = true,
            Message = "Hotel booking created successfully",
            Data = new BookingDto
            {
                BookingId = booking.Id,
                BookingCode = booking.BookingCode,
                Type = booking.Type.ToString(),
                Status = booking.Status.ToString(),
                ServiceDate = booking.ServiceDate,
                EndDate = booking.EndDate,
                TotalAmount = booking.TotalAmount,
                FinalAmount = booking.FinalAmount,
                PaymentStatus = booking.PaymentStatus.ToString(),
                CreatedAt = booking.CreatedAt,
                ItemName = hotel.Name
            }
        });
    }

    // Resort Booking
    [HttpPost("resort")]
    public async Task<ActionResult<ApiResponse<BookingDto>>> BookResort([FromBody] CreateBookingRequest request)
    {
        var userId = GetUserId();
        var resort = await _context.Resorts.FindAsync(request.ResortId);

        if (resort == null)
        {
            return BadRequest(new ApiResponse<BookingDto>
            {
                Success = false,
                Message = "Resort not found"
            });
        }

        decimal price = 0;
        if (request.ResortRoomId.HasValue)
        {
            var room = await _context.ResortRooms.FindAsync(request.ResortRoomId);
            if (room != null) price = room.PricePerNight;
        }

        var nights = request.EndDate.HasValue && request.ServiceDate.HasValue
            ? (int)(request.EndDate.Value - request.ServiceDate.Value).TotalDays
            : 1;
        price *= nights;

        var bookingCode = $"KR-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        var booking = new Booking
        {
            UserId = userId,
            ResortId = request.ResortId,
            ResortRoomId = request.ResortRoomId,
            Type = BookingType.Resort,
            Status = BookingStatus.Pending,
            ServiceDate = request.ServiceDate,
            EndDate = request.EndDate,
            Quantity = request.Quantity,
            TotalAmount = price,
            FinalAmount = price,
            PaymentStatus = PaymentStatus.Pending,
            ContactName = request.ContactName,
            ContactEmail = request.ContactEmail,
            ContactPhone = request.ContactPhone,
            Notes = request.Notes,
            BookingCode = bookingCode,
            ExpiredAt = DateTime.UtcNow.AddHours(24)
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<BookingDto>
        {
            Success = true,
            Message = "Resort booking created successfully",
            Data = new BookingDto
            {
                BookingId = booking.Id,
                BookingCode = booking.BookingCode,
                Type = booking.Type.ToString(),
                Status = booking.Status.ToString(),
                ServiceDate = booking.ServiceDate,
                TotalAmount = booking.TotalAmount,
                FinalAmount = booking.FinalAmount,
                PaymentStatus = booking.PaymentStatus.ToString(),
                CreatedAt = booking.CreatedAt,
                ItemName = resort.Name
            }
        });
    }

    // Transport Booking
    [HttpPost("transport")]
    public async Task<ActionResult<ApiResponse<BookingDto>>> BookTransport([FromBody] CreateBookingRequest request)
    {
        var userId = GetUserId();
        var transport = await _context.Transports.FindAsync(request.TransportId);

        if (transport == null)
        {
            return BadRequest(new ApiResponse<BookingDto>
            {
                Success = false,
                Message = "Transport not found"
            });
        }

        var price = transport.Price * request.Quantity;
        var bookingCode = $"KT-TRANSPORT-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        var booking = new Booking
        {
            UserId = userId,
            TransportId = request.TransportId,
            Type = BookingType.Transport,
            Status = BookingStatus.Pending,
            ServiceDate = request.ServiceDate,
            Quantity = request.Quantity,
            TotalAmount = price,
            FinalAmount = price,
            PaymentStatus = PaymentStatus.Pending,
            ContactName = request.ContactName,
            ContactEmail = request.ContactEmail,
            ContactPhone = request.ContactPhone,
            Notes = request.Notes,
            BookingCode = bookingCode,
            ExpiredAt = DateTime.UtcNow.AddHours(24)
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<BookingDto>
        {
            Success = true,
            Message = "Transport booking created successfully",
            Data = new BookingDto
            {
                BookingId = booking.Id,
                BookingCode = booking.BookingCode,
                Type = booking.Type.ToString(),
                Status = booking.Status.ToString(),
                ServiceDate = booking.ServiceDate,
                Quantity = booking.Quantity,
                TotalAmount = booking.TotalAmount,
                FinalAmount = booking.FinalAmount,
                PaymentStatus = booking.PaymentStatus.ToString(),
                CreatedAt = booking.CreatedAt,
                ItemName = $"{transport.Type} - {transport.Route}"
            }
        });
    }

    // Restaurant Booking
    [HttpPost("restaurant")]
    public async Task<ActionResult<ApiResponse<BookingDto>>> BookRestaurant([FromBody] CreateBookingRequest request)
    {
        var userId = GetUserId();
        var restaurant = await _context.Restaurants.FindAsync(request.RestaurantId);

        if (restaurant == null)
        {
            return BadRequest(new ApiResponse<BookingDto>
            {
                Success = false,
                Message = "Restaurant not found"
            });
        }

        var bookingCode = $"KRES-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        var booking = new Booking
        {
            UserId = userId,
            RestaurantId = request.RestaurantId,
            Type = BookingType.Restaurant,
            Status = BookingStatus.Pending,
            ServiceDate = request.ServiceDate,
            Quantity = request.Quantity,
            TotalAmount = 0,
            FinalAmount = 0,
            PaymentStatus = PaymentStatus.Pending,
            ContactName = request.ContactName,
            ContactEmail = request.ContactEmail,
            ContactPhone = request.ContactPhone,
            Notes = request.Notes,
            BookingCode = bookingCode,
            ExpiredAt = DateTime.UtcNow.AddHours(24)
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<BookingDto>
        {
            Success = true,
            Message = "Restaurant reservation created successfully",
            Data = new BookingDto
            {
                BookingId = booking.Id,
                BookingCode = booking.BookingCode,
                Type = booking.Type.ToString(),
                Status = booking.Status.ToString(),
                ServiceDate = booking.ServiceDate,
                Quantity = booking.Quantity,
                CreatedAt = booking.CreatedAt,
                ItemName = restaurant.Name
            }
        });
    }
}
