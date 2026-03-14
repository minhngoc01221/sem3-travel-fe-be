using System.Security.Claims;
using KarnelTravels.API.DTOs;
using KarnelTravels.API.Entities;
using KarnelTravels.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace KarnelTravels.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminHotelsController : ControllerBase
{
    private readonly KarnelTravelsDbContext _context;

    public AdminHotelsController(KarnelTravelsDbContext context)
    {
        _context = context;
    }

    // ==================== HOTEL MANAGEMENT ====================

    /// <summary>
    /// Lấy danh sách tất cả khách sạn có phân trang và lọc (F181)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<PagedResult<AdminHotelDto>>>> GetHotels(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? city = null,
        [FromQuery] int? starRating = null,
        [FromQuery] bool? isActive = null)
    {
        var query = _context.Hotels
            .Where(h => !h.IsDeleted)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(h => (h.Name != null && h.Name.Contains(search)) || (h.Address != null && h.Address.Contains(search)));
        }

        if (!string.IsNullOrEmpty(city))
        {
            query = query.Where(h => h.City == city);
        }

        if (starRating.HasValue)
        {
            query = query.Where(h => h.StarRating == starRating.Value);
        }

        if (isActive.HasValue)
        {
            query = query.Where(h => h.IsActive == isActive.Value);
        }

        var totalCount = await query.CountAsync();

        var hotels = await query
            .OrderByDescending(h => h.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var hotelDtos = hotels.Select(h => new AdminHotelDto
        {
            HotelId = h.Id,
            Name = h.Name,
            Description = h.Description,
            Address = h.Address,
            City = h.City,
            StarRating = h.StarRating,
            ContactPhone = h.ContactPhone,
            ContactEmail = h.ContactEmail,
            Images = string.IsNullOrEmpty(h.Images) ? null : JsonSerializer.Deserialize<List<string>>(h.Images),
            MinPrice = h.MinPrice,
            MaxPrice = h.MaxPrice,
            Amenities = string.IsNullOrEmpty(h.Amenities) ? null : JsonSerializer.Deserialize<List<string>>(h.Amenities),
            Rating = h.Rating,
            ReviewCount = h.ReviewCount,
            IsFeatured = h.IsFeatured,
            IsActive = h.IsActive,
            RoomCount = h.Rooms.Count,
            CreatedAt = h.CreatedAt
        }).ToList();

        var pagedResult = new PagedResult<AdminHotelDto>
        {
            Items = hotelDtos,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };

        return Ok(new ApiResponse<PagedResult<AdminHotelDto>>
        {
            Success = true,
            Data = pagedResult
        });
    }

    /// <summary>
    /// Lấy chi tiết một khách sạn (F181)
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<AdminHotelDetailDto>>> GetHotel(Guid id)
    {
        var hotel = await _context.Hotels
            .Include(h => h.Rooms.Where(r => !r.IsDeleted))
            .FirstOrDefaultAsync(h => h.Id == id && !h.IsDeleted);

        if (hotel == null)
        {
            return NotFound(new ApiResponse<AdminHotelDetailDto>
            {
                Success = false,
                Message = "Không tìm thấy khách sạn"
            });
        }

        var hotelDetail = new AdminHotelDetailDto
        {
            HotelId = hotel.Id,
            Name = hotel.Name,
            Description = hotel.Description,
            Address = hotel.Address,
            City = hotel.City,
            StarRating = hotel.StarRating,
            ContactName = hotel.ContactName,
            ContactPhone = hotel.ContactPhone,
            ContactEmail = hotel.ContactEmail,
            Images = !string.IsNullOrEmpty(hotel.Images)
                ? JsonSerializer.Deserialize<List<string>>(hotel.Images)
                : new List<string>(),
            MinPrice = hotel.MinPrice,
            MaxPrice = hotel.MaxPrice,
            Amenities = !string.IsNullOrEmpty(hotel.Amenities)
                ? JsonSerializer.Deserialize<List<string>>(hotel.Amenities)
                : new List<string>(),
            CancellationPolicy = hotel.CancellationPolicy,
            CheckInTime = hotel.CheckInTime,
            CheckOutTime = hotel.CheckOutTime,
            Rating = hotel.Rating,
            ReviewCount = hotel.ReviewCount,
            IsFeatured = hotel.IsFeatured,
            IsActive = hotel.IsActive,
            Rooms = hotel.Rooms.Select(r => new AdminHotelRoomDto
            {
                RoomId = r.Id,
                RoomType = r.RoomType,
                Description = r.Description,
                MaxOccupancy = r.MaxOccupancy,
                PricePerNight = r.PricePerNight,
                BedType = r.BedType,
                RoomAmenities = r.RoomAmenities != null ? JsonSerializer.Deserialize<List<string>>(r.RoomAmenities) : null,
                Images = r.Images != null ? JsonSerializer.Deserialize<List<string>>(r.Images) : null,
                TotalRooms = r.TotalRooms,
                AvailableRooms = r.AvailableRooms,
                CreatedAt = r.CreatedAt
            }).ToList(),
            CreatedAt = hotel.CreatedAt
        };

        return Ok(new ApiResponse<AdminHotelDetailDto>
        {
            Success = true,
            Data = hotelDetail
        });
    }

    /// <summary>
    /// Tạo mới khách sạn (F182)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<AdminHotelDto>>> CreateHotel([FromBody] CreateHotelRequest request)
    {
        var hotel = new Hotel
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Address = request.Address,
            City = request.City,
            StarRating = request.StarRating,
            ContactName = request.ContactName,
            ContactPhone = request.ContactPhone,
            ContactEmail = request.ContactEmail,
            Images = request.Images != null ? JsonSerializer.Serialize(request.Images) : null,
            MinPrice = request.MinPrice,
            MaxPrice = request.MaxPrice,
            Amenities = request.Amenities != null ? JsonSerializer.Serialize(request.Amenities) : null,
            CancellationPolicy = request.CancellationPolicy,
            CheckInTime = request.CheckInTime,
            CheckOutTime = request.CheckOutTime,
            IsFeatured = request.IsFeatured,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Hotels.Add(hotel);

        // Create rooms if provided
        if (request.Rooms != null && request.Rooms.Any())
        {
            foreach (var roomRequest in request.Rooms)
            {
                var room = new HotelRoom
                {
                    Id = Guid.NewGuid(),
                    HotelId = hotel.Id,
                    RoomType = roomRequest.RoomType,
                    Description = roomRequest.Description,
                    MaxOccupancy = roomRequest.MaxOccupancy,
                    PricePerNight = roomRequest.PricePerNight,
                    BedType = roomRequest.BedType,
                    RoomAmenities = roomRequest.RoomAmenities != null 
                        ? JsonSerializer.Serialize(roomRequest.RoomAmenities) 
                        : null,
                    Images = roomRequest.Images != null 
                        ? JsonSerializer.Serialize(roomRequest.Images) 
                        : null,
                    TotalRooms = roomRequest.TotalRooms,
                    AvailableRooms = roomRequest.TotalRooms,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.HotelRooms.Add(room);
            }
        }

        await _context.SaveChangesAsync();

        // Update min/max price
        if (hotel.MinPrice == null || hotel.MaxPrice == null)
        {
            var prices = await _context.HotelRooms
                .Where(r => r.HotelId == hotel.Id && !r.IsDeleted)
                .Select(r => r.PricePerNight)
                .ToListAsync();

            if (prices.Any())
            {
                hotel.MinPrice = prices.Min();
                hotel.MaxPrice = prices.Max();
                await _context.SaveChangesAsync();
            }
        }

        var hotelDto = new AdminHotelDto
        {
            HotelId = hotel.Id,
            Name = hotel.Name,
            Description = hotel.Description,
            Address = hotel.Address,
            City = hotel.City,
            StarRating = hotel.StarRating,
            ContactPhone = hotel.ContactPhone,
            ContactEmail = hotel.ContactEmail,
            Images = request.Images,
            MinPrice = hotel.MinPrice,
            MaxPrice = hotel.MaxPrice,
            Amenities = request.Amenities,
            Rating = hotel.Rating,
            ReviewCount = hotel.ReviewCount,
            IsFeatured = hotel.IsFeatured,
            IsActive = hotel.IsActive,
            RoomCount = request.Rooms?.Count ?? 0,
            CreatedAt = hotel.CreatedAt
        };

        return CreatedAtAction(nameof(GetHotel), new { id = hotel.Id }, new ApiResponse<AdminHotelDto>
        {
            Success = true,
            Data = hotelDto,
            Message = "Tạo khách sạn thành công"
        });
    }

    /// <summary>
    /// Cập nhật khách sạn (F183)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<AdminHotelDto>>> UpdateHotel(Guid id, [FromBody] UpdateHotelRequest request)
    {
        var hotel = await _context.Hotels.FindAsync(id);

        if (hotel == null || hotel.IsDeleted)
        {
            return NotFound(new ApiResponse<AdminHotelDto>
            {
                Success = false,
                Message = "Không tìm thấy khách sạn"
            });
        }

        // Update fields
        hotel.Name = request.Name;
        hotel.Description = request.Description;
        hotel.Address = request.Address;
        hotel.City = request.City;
        hotel.StarRating = request.StarRating;
        hotel.ContactName = request.ContactName;
        hotel.ContactPhone = request.ContactPhone;
        hotel.ContactEmail = request.ContactEmail;
        hotel.MinPrice = request.MinPrice;
        hotel.MaxPrice = request.MaxPrice;
        hotel.CancellationPolicy = request.CancellationPolicy;
        hotel.CheckInTime = request.CheckInTime;
        hotel.CheckOutTime = request.CheckOutTime;
        hotel.IsFeatured = request.IsFeatured;
        
        if (request.Images != null)
        {
            hotel.Images = JsonSerializer.Serialize(request.Images);
        }

        if (request.Amenities != null)
        {
            hotel.Amenities = JsonSerializer.Serialize(request.Amenities);
        }

        hotel.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var images = !string.IsNullOrEmpty(hotel.Images)
            ? JsonSerializer.Deserialize<List<string>>(hotel.Images)
            : new List<string>();

        var amenities = !string.IsNullOrEmpty(hotel.Amenities)
            ? JsonSerializer.Deserialize<List<string>>(hotel.Amenities)
            : new List<string>();

        var hotelDto = new AdminHotelDto
        {
            HotelId = hotel.Id,
            Name = hotel.Name,
            Description = hotel.Description,
            Address = hotel.Address,
            City = hotel.City,
            StarRating = hotel.StarRating,
            ContactPhone = hotel.ContactPhone,
            ContactEmail = hotel.ContactEmail,
            Images = images,
            MinPrice = hotel.MinPrice,
            MaxPrice = hotel.MaxPrice,
            Amenities = amenities,
            Rating = hotel.Rating,
            ReviewCount = hotel.ReviewCount,
            IsFeatured = hotel.IsFeatured,
            IsActive = hotel.IsActive,
            RoomCount = await _context.HotelRooms.CountAsync(r => r.HotelId == hotel.Id && !r.IsDeleted),
            CreatedAt = hotel.CreatedAt
        };

        return Ok(new ApiResponse<AdminHotelDto>
        {
            Success = true,
            Data = hotelDto,
            Message = "Cập nhật khách sạn thành công"
        });
    }

    /// <summary>
    /// Xóa khách sạn (F184)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<string>>> DeleteHotel(Guid id)
    {
        var hotel = await _context.Hotels.FindAsync(id);

        if (hotel == null || hotel.IsDeleted)
        {
            return NotFound(new ApiResponse<string>
            {
                Success = false,
                Message = "Không tìm thấy khách sạn"
            });
        }

        // Soft delete
        hotel.IsDeleted = true;
        hotel.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<string>
        {
            Success = true,
            Message = "Xóa khách sạn thành công"
        });
    }

    /// <summary>
    /// Thay đổi trạng thái khách sạn (F189)
    /// </summary>
    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> ToggleHotelStatus(Guid id)
    {
        var hotel = await _context.Hotels.FindAsync(id);

        if (hotel == null || hotel.IsDeleted)
        {
            return NotFound(new ApiResponse<bool>
            {
                Success = false,
                Message = "Không tìm thấy khách sạn"
            });
        }

        hotel.IsActive = !hotel.IsActive;
        hotel.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = hotel.IsActive,
            Message = hotel.IsActive ? "Khách sạn đã được kích hoạt" : "Khách sạn đã bị vô hiệu hóa"
        });
    }

    // ==================== ROOM TYPE MANAGEMENT (F185) ====================

    /// <summary>
    /// Lấy danh sách loại phòng của một khách sạn
    /// </summary>
    [HttpGet("{hotelId}/rooms")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<List<AdminHotelRoomDto>>>> GetHotelRooms(Guid hotelId)
    {
        var roomsQuery = await _context.HotelRooms
            .Where(r => r.HotelId == hotelId && !r.IsDeleted)
            .OrderBy(r => r.PricePerNight)
            .ToListAsync();

        var rooms = roomsQuery.Select(r => new AdminHotelRoomDto
        {
            RoomId = r.Id,
            RoomType = r.RoomType,
            Description = r.Description,
            MaxOccupancy = r.MaxOccupancy,
            PricePerNight = r.PricePerNight,
            BedType = r.BedType,
            RoomAmenities = string.IsNullOrEmpty(r.RoomAmenities) ? null : JsonSerializer.Deserialize<List<string>>(r.RoomAmenities),
            Images = string.IsNullOrEmpty(r.Images) ? null : JsonSerializer.Deserialize<List<string>>(r.Images),
            TotalRooms = r.TotalRooms,
            AvailableRooms = r.AvailableRooms,
            CreatedAt = r.CreatedAt
        }).ToList();

        return Ok(new ApiResponse<List<AdminHotelRoomDto>>
        {
            Success = true,
            Data = rooms
        });
    }

    /// <summary>
    /// Tạo mới loại phòng (F185)
    /// </summary>
    [HttpPost("{hotelId}/rooms")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<AdminHotelRoomDto>>> CreateRoomType(Guid hotelId, [FromBody] CreateHotelRoomRequest request)
    {
        var hotel = await _context.Hotels.FindAsync(hotelId);

        if (hotel == null || hotel.IsDeleted)
        {
            return NotFound(new ApiResponse<AdminHotelRoomDto>
            {
                Success = false,
                Message = "Không tìm thấy khách sạn"
            });
        }

        var room = new HotelRoom
        {
            Id = Guid.NewGuid(),
            HotelId = hotelId,
            RoomType = request.RoomType,
            Description = request.Description,
            MaxOccupancy = request.MaxOccupancy,
            PricePerNight = request.PricePerNight,
            BedType = request.BedType,
            RoomAmenities = request.RoomAmenities != null 
                ? JsonSerializer.Serialize(request.RoomAmenities) 
                : null,
            Images = request.Images != null 
                ? JsonSerializer.Serialize(request.Images) 
                : null,
            TotalRooms = request.TotalRooms,
            AvailableRooms = request.TotalRooms,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.HotelRooms.Add(room);

        // Update hotel min/max price
        var allPrices = await _context.HotelRooms
            .Where(r => r.HotelId == hotelId && !r.IsDeleted && r.Id != room.Id)
            .Select(r => r.PricePerNight)
            .ToListAsync();
        
        allPrices.Add(request.PricePerNight);
        
        hotel.MinPrice = allPrices.Min();
        hotel.MaxPrice = allPrices.Max();
        hotel.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var roomDto = new AdminHotelRoomDto
        {
            RoomId = room.Id,
            RoomType = room.RoomType,
            Description = room.Description,
            MaxOccupancy = room.MaxOccupancy,
            PricePerNight = room.PricePerNight,
            BedType = room.BedType,
            RoomAmenities = request.RoomAmenities,
            Images = request.Images,
            TotalRooms = room.TotalRooms,
            AvailableRooms = room.AvailableRooms,
            CreatedAt = room.CreatedAt
        };

        return CreatedAtAction(nameof(GetHotelRooms), new { hotelId }, new ApiResponse<AdminHotelRoomDto>
        {
            Success = true,
            Data = roomDto,
            Message = "Tạo loại phòng thành công"
        });
    }

    /// <summary>
    /// Cập nhật loại phòng (F185)
    /// </summary>
    [HttpPut("{hotelId}/rooms/{roomId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<AdminHotelRoomDto>>> UpdateRoomType(Guid hotelId, Guid roomId, [FromBody] UpdateHotelRoomRequest request)
    {
        var room = await _context.HotelRooms.FindAsync(roomId);

        if (room == null || room.HotelId != hotelId || room.IsDeleted)
        {
            return NotFound(new ApiResponse<AdminHotelRoomDto>
            {
                Success = false,
                Message = "Không tìm thấy loại phòng"
            });
        }

        // Update fields
        room.RoomType = request.RoomType;
        room.Description = request.Description;
        room.MaxOccupancy = request.MaxOccupancy;
        room.PricePerNight = request.PricePerNight;
        room.BedType = request.BedType;
        room.TotalRooms = request.TotalRooms;

        if (request.RoomAmenities != null)
        {
            room.RoomAmenities = JsonSerializer.Serialize(request.RoomAmenities);
        }

        if (request.Images != null)
        {
            room.Images = JsonSerializer.Serialize(request.Images);
        }

        room.UpdatedAt = DateTime.UtcNow;

        // Update hotel min/max price
        var hotel = await _context.Hotels.FindAsync(hotelId);
        if (hotel != null)
        {
            var allPrices = await _context.HotelRooms
                .Where(r => r.HotelId == hotelId && !r.IsDeleted)
                .Select(r => r.PricePerNight)
                .ToListAsync();

            if (allPrices.Any())
            {
                hotel.MinPrice = allPrices.Min();
                hotel.MaxPrice = allPrices.Max();
                hotel.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();

        var roomAmenities = room.RoomAmenities != null
            ? JsonSerializer.Deserialize<List<string>>(room.RoomAmenities)
            : null;

        var images = room.Images != null
            ? JsonSerializer.Deserialize<List<string>>(room.Images)
            : null;

        var roomDto = new AdminHotelRoomDto
        {
            RoomId = room.Id,
            RoomType = room.RoomType,
            Description = room.Description,
            MaxOccupancy = room.MaxOccupancy,
            PricePerNight = room.PricePerNight,
            BedType = room.BedType,
            RoomAmenities = roomAmenities,
            Images = images,
            TotalRooms = room.TotalRooms,
            AvailableRooms = room.AvailableRooms,
            CreatedAt = room.CreatedAt
        };

        return Ok(new ApiResponse<AdminHotelRoomDto>
        {
            Success = true,
            Data = roomDto,
            Message = "Cập nhật loại phòng thành công"
        });
    }

    /// <summary>
    /// Xóa loại phòng (F185)
    /// </summary>
    [HttpDelete("{hotelId}/rooms/{roomId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<string>>> DeleteRoomType(Guid hotelId, Guid roomId)
    {
        var room = await _context.HotelRooms.FindAsync(roomId);

        if (room == null || room.HotelId != hotelId || room.IsDeleted)
        {
            return NotFound(new ApiResponse<string>
            {
                Success = false,
                Message = "Không tìm thấy loại phòng"
            });
        }

        // Soft delete
        room.IsDeleted = true;
        room.UpdatedAt = DateTime.UtcNow;

        // Update hotel min/max price
        var hotel = await _context.Hotels.FindAsync(hotelId);
        if (hotel != null)
        {
            var remainingPrices = await _context.HotelRooms
                .Where(r => r.HotelId == hotelId && !r.IsDeleted && r.Id != roomId)
                .Select(r => r.PricePerNight)
                .ToListAsync();

            if (remainingPrices.Any())
            {
                hotel.MinPrice = remainingPrices.Min();
                hotel.MaxPrice = remainingPrices.Max();
            }
            else
            {
                hotel.MinPrice = null;
                hotel.MaxPrice = null;
            }
            hotel.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<string>
        {
            Success = true,
            Message = "Xóa loại phòng thành công"
        });
    }

    // ==================== ROOM AVAILABILITY & PRICING (F186, F187) ====================

    /// <summary>
    /// Lấy danh sách giá và tình trạng phòng theo ngày
    /// </summary>
    [HttpGet("{hotelId}/rooms/{roomId}/availability")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<List<RoomAvailabilityDto>>>> GetRoomAvailability(
        Guid hotelId, 
        Guid roomId,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        var room = await _context.HotelRooms.FindAsync(roomId);

        if (room == null || room.HotelId != hotelId || room.IsDeleted)
        {
            return NotFound(new ApiResponse<List<RoomAvailabilityDto>>
            {
                Success = false,
                Message = "Không tìm thấy loại phòng"
            });
        }

        // Get existing availability records
        var existingAvailability = await _context.HotelRoomAvailabilities
            .Where(a => a.RoomId == roomId && a.Date >= startDate && a.Date <= endDate)
            .ToListAsync();

        // Generate all dates in range
        var availabilityList = new List<RoomAvailabilityDto>();
        for (var date = startDate.Date; date <= endDate.Date; date = date.AddDays(1))
        {
            var existing = existingAvailability.FirstOrDefault(a => a.Date.Date == date);
            availabilityList.Add(new RoomAvailabilityDto
            {
                Date = date,
                AvailableRooms = existing?.AvailableRooms ?? room.AvailableRooms,
                Price = existing?.Price ?? room.PricePerNight,
                IsAvailable = (existing?.AvailableRooms ?? room.AvailableRooms) > 0
            });
        }

        return Ok(new ApiResponse<List<RoomAvailabilityDto>>
        {
            Success = true,
            Data = availabilityList
        });
    }

    /// <summary>
    /// Cập nhật giá và tình trạng phòng theo ngày (F186, F187)
    /// </summary>
    [HttpPut("{hotelId}/rooms/{roomId}/availability")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<string>>> UpdateRoomAvailability(
        Guid hotelId, 
        Guid roomId,
        [FromBody] UpdateRoomAvailabilityRequest request)
    {
        var room = await _context.HotelRooms.FindAsync(roomId);

        if (room == null || room.HotelId != hotelId || room.IsDeleted)
        {
            return NotFound(new ApiResponse<string>
            {
                Success = false,
                Message = "Không tìm thấy loại phòng"
            });
        }

        foreach (var update in request.Availabilities)
        {
            var existing = await _context.HotelRoomAvailabilities
                .FirstOrDefaultAsync(a => a.RoomId == roomId && a.Date.Date == update.Date.Date);

            if (existing != null)
            {
                existing.AvailableRooms = update.AvailableRooms;
                existing.Price = update.Price;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                var newAvailability = new HotelRoomAvailability
                {
                    Id = Guid.NewGuid(),
                    RoomId = roomId,
                    Date = update.Date.Date,
                    AvailableRooms = update.AvailableRooms,
                    Price = update.Price,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.HotelRoomAvailabilities.Add(newAvailability);
            }
        }

        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<string>
        {
            Success = true,
            Message = "Cập nhật giá và tình trạng phòng thành công"
        });
    }

    // ==================== REVIEWS (F190) ====================

    /// <summary>
    /// Lấy danh sách đánh giá của khách sạn (F190)
    /// </summary>
    [HttpGet("{id}/reviews")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<List<HotelReviewDto>>>> GetHotelReviews(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var hotel = await _context.Hotels.FindAsync(id);

        if (hotel == null || hotel.IsDeleted)
        {
            return NotFound(new ApiResponse<List<HotelReviewDto>>
            {
                Success = false,
                Message = "Không tìm thấy khách sạn"
            });
        }

        var query = _context.Reviews
            .Include(r => r.User)
            .Where(r => r.HotelId == id && !r.IsDeleted)
            .OrderByDescending(r => r.CreatedAt);

        var totalCount = await query.CountAsync();

        var reviewsQuery = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var reviews = reviewsQuery.Select(r => new HotelReviewDto
        {
            ReviewId = r.Id,
            Rating = r.Rating,
            Title = r.Title,
            Content = r.Content,
            Images = string.IsNullOrEmpty(r.Images) ? null : JsonSerializer.Deserialize<List<string>>(r.Images),
            UserName = r.User != null ? r.User.FullName : "Anonymous",
            UserAvatar = r.User != null ? r.User.Avatar : null,
            CreatedAt = r.CreatedAt
        }).ToList();

        var pagedResult = new PagedResult<HotelReviewDto>
        {
            Items = reviews,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };

        return Ok(new ApiResponse<PagedResult<HotelReviewDto>>
        {
            Success = true,
            Data = pagedResult
        });
    }

    /// <summary>
    /// Lấy danh sách các thành phố có khách sạn (cho filter)
    /// </summary>
    [HttpGet("cities")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<List<string>>>> GetCities()
    {
        var cities = await _context.Hotels
            .Where(h => !h.IsDeleted)
            .Select(h => h.City)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return Ok(new ApiResponse<List<string>>
        {
            Success = true,
            Data = cities
        });
    }
}

// ==================== DTOs ====================

public class AdminHotelDto
{
    public Guid HotelId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string City { get; set; } = string.Empty;
    public int StarRating { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactEmail { get; set; }
    public List<string>? Images { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public List<string>? Amenities { get; set; }
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; }
    public int RoomCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminHotelDetailDto : AdminHotelDto
{
    public string? ContactName { get; set; }
    public string? CancellationPolicy { get; set; }
    public string? CheckInTime { get; set; }
    public string? CheckOutTime { get; set; }
    public List<AdminHotelRoomDto>? Rooms { get; set; }
}

public class AdminHotelRoomDto
{
    public Guid RoomId { get; set; }
    public string RoomType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int MaxOccupancy { get; set; }
    public decimal PricePerNight { get; set; }
    public string? BedType { get; set; }
    public List<string>? RoomAmenities { get; set; }
    public List<string>? Images { get; set; }
    public int TotalRooms { get; set; }
    public int AvailableRooms { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateHotelRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string City { get; set; } = string.Empty;
    public int StarRating { get; set; } = 3;
    public string? ContactName { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactEmail { get; set; }
    public List<string>? Images { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public List<string>? Amenities { get; set; }
    public string? CancellationPolicy { get; set; }
    public string? CheckInTime { get; set; }
    public string? CheckOutTime { get; set; }
    public bool IsFeatured { get; set; } = false;
}

public class UpdateHotelRoomRequest
{
    public string RoomType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int MaxOccupancy { get; set; } = 2;
    public decimal PricePerNight { get; set; }
    public string? BedType { get; set; }
    public List<string>? RoomAmenities { get; set; }
    public List<string>? Images { get; set; }
    public int TotalRooms { get; set; }
}

public class RoomAvailabilityDto
{
    public DateTime Date { get; set; }
    public int AvailableRooms { get; set; }
    public decimal Price { get; set; }
    public bool IsAvailable { get; set; }
}

public class UpdateRoomAvailabilityRequest
{
    public List<RoomAvailabilityUpdateItem> Availabilities { get; set; } = new();
}

public class RoomAvailabilityUpdateItem
{
    public DateTime Date { get; set; }
    public int AvailableRooms { get; set; }
    public decimal Price { get; set; }
}

public class HotelReviewDto
{
    public Guid ReviewId { get; set; }
    public int Rating { get; set; }
    public string? Title { get; set; }
    public string? Content { get; set; }
    public List<string>? Images { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? UserAvatar { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}
