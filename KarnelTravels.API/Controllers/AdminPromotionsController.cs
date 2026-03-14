using System.ComponentModel.DataAnnotations;
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
public class AdminPromotionsController : ControllerBase
{
    private readonly KarnelTravelsDbContext _context;

    public AdminPromotionsController(KarnelTravelsDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lấy danh sách tất cả khuyến mãi có phân trang và lọc (F201)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<PagedResult<AdminPromotionDto>>>> GetPromotions(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool? isActive = null,
        [FromQuery] bool? showOnHome = null,
        [FromQuery] PromotionTargetType? targetType = null)
    {
        var query = _context.Promotions.AsQueryable();

        // Apply filters
        if (isActive.HasValue)
        {
            query = query.Where(p => p.IsActive == isActive.Value);
        }

        if (showOnHome.HasValue)
        {
            query = query.Where(p => p.ShowOnHome == showOnHome.Value);
        }

        if (targetType.HasValue)
        {
            query = query.Where(p => p.TargetType == targetType.Value);
        }

        var totalCount = await query.CountAsync();

        var promotions = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var promotionDtos = promotions.Select(p => new AdminPromotionDto
        {
            PromotionId = p.Id,
            Code = p.Code,
            Title = p.Title,
            Description = p.Description,
            DiscountType = p.DiscountType,
            DiscountValue = p.DiscountValue,
            MinOrderAmount = p.MinOrderAmount,
            MaxDiscountAmount = p.MaxDiscountAmount,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            IsActive = p.IsActive,
            TargetType = p.TargetType,
            TargetId = p.TargetId,
            ShowOnHome = p.ShowOnHome,
            IsExpired = p.EndDate < DateTime.Now,
            IsUpcoming = p.StartDate > DateTime.Now,
            CreatedAt = p.CreatedAt
        }).ToList();

        var pagedResult = new PagedResult<AdminPromotionDto>
        {
            Items = promotionDtos,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };

        return Ok(new ApiResponse<PagedResult<AdminPromotionDto>>
        {
            Success = true,
            Data = pagedResult
        });
    }

    /// <summary>
    /// Lấy chi tiết một khuyến mãi (F202)
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<AdminPromotionDetailDto>>> GetPromotion(Guid id)
    {
        var promotion = await _context.Promotions.FindAsync(id);

        if (promotion == null)
        {
            return NotFound(new ApiResponse<AdminPromotionDetailDto>
            {
                Success = false,
                Message = "Không tìm thấy khuyến mãi"
            });
        }

        var detail = new AdminPromotionDetailDto
        {
            PromotionId = promotion.Id,
            Code = promotion.Code,
            Title = promotion.Title,
            Description = promotion.Description,
            DiscountType = promotion.DiscountType,
            DiscountValue = promotion.DiscountValue,
            MinOrderAmount = promotion.MinOrderAmount,
            MaxDiscountAmount = promotion.MaxDiscountAmount,
            StartDate = promotion.StartDate,
            EndDate = promotion.EndDate,
            IsActive = promotion.IsActive,
            TargetType = promotion.TargetType,
            TargetId = promotion.TargetId,
            ShowOnHome = promotion.ShowOnHome,
            IsExpired = promotion.EndDate < DateTime.Now,
            IsUpcoming = promotion.StartDate > DateTime.Now,
            CreatedAt = promotion.CreatedAt,
            UpdatedAt = promotion.UpdatedAt
        };

        return Ok(new ApiResponse<AdminPromotionDetailDto>
        {
            Success = true,
            Data = detail
        });
    }

    /// <summary>
    /// Tạo mới khuyến mãi (F201)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<AdminPromotionDto>>> CreatePromotion([FromBody] CreatePromotionRequest request)
    {
        // Validate discount value
        if (request.DiscountValue < 0 || request.DiscountValue > 100)
        {
            return BadRequest(new ApiResponse<AdminPromotionDto>
            {
                Success = false,
                Message = "Giá trị giảm giá phải từ 0 đến 100"
            });
        }

        // Validate date range
        if (request.EndDate < request.StartDate)
        {
            return BadRequest(new ApiResponse<AdminPromotionDto>
            {
                Success = false,
                Message = "Ngày kết thúc không được nhỏ hơn ngày bắt đầu"
            });
        }

        // Check duplicate code
        var existingCode = await _context.Promotions.FirstOrDefaultAsync(p => p.Code == request.Code);
        if (existingCode != null)
        {
            return BadRequest(new ApiResponse<AdminPromotionDto>
            {
                Success = false,
                Message = "Mã khuyến mãi đã tồn tại"
            });
        }

        var promotion = new Promotion
        {
            Id = Guid.NewGuid(),
            Code = request.Code,
            Title = request.Title,
            Description = request.Description,
            DiscountType = request.DiscountType,
            DiscountValue = request.DiscountValue,
            MinOrderAmount = request.MinOrderAmount,
            MaxDiscountAmount = request.MaxDiscountAmount,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            IsActive = request.StartDate <= DateTime.Now && request.EndDate >= DateTime.Now,
            TargetType = request.TargetType,
            TargetId = request.TargetId,
            ShowOnHome = request.ShowOnHome,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Promotions.Add(promotion);
        await _context.SaveChangesAsync();

        var dto = new AdminPromotionDto
        {
            PromotionId = promotion.Id,
            Code = promotion.Code,
            Title = promotion.Title,
            Description = promotion.Description,
            DiscountType = promotion.DiscountType,
            DiscountValue = promotion.DiscountValue,
            MinOrderAmount = promotion.MinOrderAmount,
            MaxDiscountAmount = promotion.MaxDiscountAmount,
            StartDate = promotion.StartDate,
            EndDate = promotion.EndDate,
            IsActive = promotion.IsActive,
            TargetType = promotion.TargetType,
            TargetId = promotion.TargetId,
            ShowOnHome = promotion.ShowOnHome,
            IsExpired = promotion.EndDate < DateTime.Now,
            IsUpcoming = promotion.StartDate > DateTime.Now,
            CreatedAt = promotion.CreatedAt
        };

        return CreatedAtAction(nameof(GetPromotion), new { id = promotion.Id }, new ApiResponse<AdminPromotionDto>
        {
            Success = true,
            Data = dto,
            Message = "Tạo khuyến mãi thành công"
        });
    }

    /// <summary>
    /// Cập nhật khuyến mãi (F203)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<AdminPromotionDto>>> UpdatePromotion(Guid id, [FromBody] UpdatePromotionRequest request)
    {
        var promotion = await _context.Promotions.FindAsync(id);

        if (promotion == null)
        {
            return NotFound(new ApiResponse<AdminPromotionDto>
            {
                Success = false,
                Message = "Không tìm thấy khuyến mãi"
            });
        }

        // Validate discount value
        if (request.DiscountValue < 0 || request.DiscountValue > 100)
        {
            return BadRequest(new ApiResponse<AdminPromotionDto>
            {
                Success = false,
                Message = "Giá trị giảm giá phải từ 0 đến 100"
            });
        }

        // Validate date range
        if (request.EndDate < request.StartDate)
        {
            return BadRequest(new ApiResponse<AdminPromotionDto>
            {
                Success = false,
                Message = "Ngày kết thúc không được nhỏ hơn ngày bắt đầu"
            });
        }

        // Check duplicate code (excluding current)
        var existingCode = await _context.Promotions.FirstOrDefaultAsync(p => p.Code == request.Code && p.Id != id);
        if (existingCode != null)
        {
            return BadRequest(new ApiResponse<AdminPromotionDto>
            {
                Success = false,
                Message = "Mã khuyến mãi đã tồn tại"
            });
        }

        // Update fields
        promotion.Code = request.Code;
        promotion.Title = request.Title;
        promotion.Description = request.Description;
        promotion.DiscountType = request.DiscountType;
        promotion.DiscountValue = request.DiscountValue;
        promotion.MinOrderAmount = request.MinOrderAmount;
        promotion.MaxDiscountAmount = request.MaxDiscountAmount;
        promotion.StartDate = request.StartDate;
        promotion.EndDate = request.EndDate;
        promotion.TargetType = request.TargetType;
        promotion.TargetId = request.TargetId;
        promotion.ShowOnHome = request.ShowOnHome;
        promotion.IsActive = request.StartDate <= DateTime.Now && request.EndDate >= DateTime.Now && promotion.IsActive;
        promotion.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var dto = new AdminPromotionDto
        {
            PromotionId = promotion.Id,
            Code = promotion.Code,
            Title = promotion.Title,
            Description = promotion.Description,
            DiscountType = promotion.DiscountType,
            DiscountValue = promotion.DiscountValue,
            MinOrderAmount = promotion.MinOrderAmount,
            MaxDiscountAmount = promotion.MaxDiscountAmount,
            StartDate = promotion.StartDate,
            EndDate = promotion.EndDate,
            IsActive = promotion.IsActive,
            TargetType = promotion.TargetType,
            TargetId = promotion.TargetId,
            ShowOnHome = promotion.ShowOnHome,
            IsExpired = promotion.EndDate < DateTime.Now,
            IsUpcoming = promotion.StartDate > DateTime.Now,
            CreatedAt = promotion.CreatedAt
        };

        return Ok(new ApiResponse<AdminPromotionDto>
        {
            Success = true,
            Data = dto,
            Message = "Cập nhật khuyến mãi thành công"
        });
    }

    /// <summary>
    /// Xóa khuyến mãi (F204)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<string>>> DeletePromotion(Guid id)
    {
        var promotion = await _context.Promotions.FindAsync(id);

        if (promotion == null)
        {
            return NotFound(new ApiResponse<string>
            {
                Success = false,
                Message = "Không tìm thấy khuyến mãi"
            });
        }

        // Check if promotion is being used
        var hasBookings = await _context.Bookings.AnyAsync(b => b.PromotionId == id);
        if (hasBookings)
        {
            // Soft delete instead
            promotion.IsActive = false;
            promotion.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            
            return Ok(new ApiResponse<string>
            {
                Success = true,
                Message = "Khuyến mãi đã được vô hiệu hóa (đang được sử dụng)"
            });
        }

        _context.Promotions.Remove(promotion);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<string>
        {
            Success = true,
            Message = "Xóa khuyến mãi thành công"
        });
    }

    /// <summary>
    /// Bật/tắt hiển thị trang chủ (F209)
    /// </summary>
    [HttpPatch("{id}/toggle-home")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> ToggleShowOnHome(Guid id)
    {
        var promotion = await _context.Promotions.FindAsync(id);

        if (promotion == null)
        {
            return NotFound(new ApiResponse<bool>
            {
                Success = false,
                Message = "Không tìm thấy khuyến mãi"
            });
        }

        promotion.ShowOnHome = !promotion.ShowOnHome;
        promotion.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = promotion.ShowOnHome,
            Message = promotion.ShowOnHome ? "Đã bật hiển thị trang chủ" : "Đã tắt hiển thị trang chủ"
        });
    }

    /// <summary>
    /// Bật/tắt trạng thái khuyến mãi (F208)
    /// </summary>
    [HttpPatch("{id}/toggle-status")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> ToggleStatus(Guid id)
    {
        var promotion = await _context.Promotions.FindAsync(id);

        if (promotion == null)
        {
            return NotFound(new ApiResponse<bool>
            {
                Success = false,
                Message = "Không tìm thấy khuyến mãi"
            });
        }

        promotion.IsActive = !promotion.IsActive;
        promotion.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = promotion.IsActive,
            Message = promotion.IsActive ? "Khuyến mãi đã được kích hoạt" : "Khuyến mãi đã bị vô hiệu hóa"
        });
    }

    /// <summary>
    /// Lấy danh sách Hotels/Tours cho dropdown chọn đối tượng (F207)
    /// </summary>
    [HttpGet("targets")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<PromotionTargetsDto>>> GetPromotionTargets(
        [FromQuery] PromotionTargetType targetType)
    {
        var targets = new PromotionTargetsDto();

        if (targetType == PromotionTargetType.Hotel || targetType == PromotionTargetType.All)
        {
            var hotels = await _context.Hotels
                .Where(h => !h.IsDeleted && h.IsActive)
                .Select(h => new TargetItem { Id = h.Id, Name = h.Name, Type = "Hotel" })
                .ToListAsync();
            targets.Hotels = hotels;
        }

        if (targetType == PromotionTargetType.Tour || targetType == PromotionTargetType.All)
        {
            var tours = await _context.TourPackages
                .Where(t => !t.IsDeleted && t.IsActive)
                .Select(t => new TargetItem { Id = t.Id, Name = t.Name, Type = "Tour" })
                .ToListAsync();
            targets.Tours = tours;
        }

        if (targetType == PromotionTargetType.Resort || targetType == PromotionTargetType.All)
        {
            var resorts = await _context.Resorts
                .Where(r => !r.IsDeleted && r.IsActive)
                .Select(r => new TargetItem { Id = r.Id, Name = r.Name, Type = "Resort" })
                .ToListAsync();
            targets.Resorts = resorts;
        }

        return Ok(new ApiResponse<PromotionTargetsDto>
        {
            Success = true,
            Data = targets
        });
    }

    /// <summary>
    /// Lấy tất cả Hotels (cho dropdown)
    /// </summary>
    [HttpGet("hotels")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<List<TargetItem>>>> GetHotels()
    {
        var hotels = await _context.Hotels
            .Where(h => !h.IsDeleted && h.IsActive)
            .Select(h => new TargetItem { Id = h.Id, Name = h.Name, Type = "Hotel" })
            .OrderBy(h => h.Name)
            .ToListAsync();

        return Ok(new ApiResponse<List<TargetItem>>
        {
            Success = true,
            Data = hotels
        });
    }

    /// <summary>
    /// Lấy tất cả Tours (cho dropdown)
    /// </summary>
    [HttpGet("tours")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<List<TargetItem>>>> GetTours()
    {
        var tours = await _context.TourPackages
            .Where(t => !t.IsDeleted && t.IsActive)
            .Select(t => new TargetItem { Id = t.Id, Name = t.Name, Type = "Tour" })
            .OrderBy(t => t.Name)
            .ToListAsync();

        return Ok(new ApiResponse<List<TargetItem>>
        {
            Success = true,
            Data = tours
        });
    }
}

// ==================== DTOs ====================

public class AdminPromotionDto
{
    public Guid PromotionId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DiscountType DiscountType { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal? MinOrderAmount { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    public PromotionTargetType TargetType { get; set; }
    public Guid? TargetId { get; set; }
    public bool ShowOnHome { get; set; }
    public bool IsExpired { get; set; }
    public bool IsUpcoming { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminPromotionDetailDto : AdminPromotionDto
{
    public DateTime? UpdatedAt { get; set; }
}

public class CreatePromotionRequest
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

    [System.ComponentModel.DataAnnotations.Range(0, 100)]
    public decimal DiscountValue { get; set; }

    public decimal? MinOrderAmount { get; set; }

    public decimal? MaxDiscountAmount { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public bool IsActive { get; set; } = true;

    public PromotionTargetType TargetType { get; set; } = PromotionTargetType.All;

    public Guid? TargetId { get; set; }

    public bool ShowOnHome { get; set; } = false;
}

public class UpdatePromotionRequest
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

    [System.ComponentModel.DataAnnotations.Range(0, 100)]
    public decimal DiscountValue { get; set; }

    public decimal? MinOrderAmount { get; set; }

    public decimal? MaxDiscountAmount { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public bool IsActive { get; set; }

    public PromotionTargetType TargetType { get; set; } = PromotionTargetType.All;

    public Guid? TargetId { get; set; }

    public bool ShowOnHome { get; set; }
}

public class TargetItem
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
}

public class PromotionTargetsDto
{
    public List<TargetItem> Hotels { get; set; } = new();
    public List<TargetItem> Tours { get; set; } = new();
    public List<TargetItem> Resorts { get; set; } = new();
}
