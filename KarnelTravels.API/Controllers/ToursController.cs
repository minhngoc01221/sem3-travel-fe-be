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
public class ToursController : ControllerBase
{
    private readonly KarnelTravelsDbContext _context;

    public ToursController(KarnelTravelsDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<TourPackageDto>>>> GetTours(
        [FromQuery] string? search,
        [FromQuery] string? destination,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] int? duration,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = _context.TourPackages.Where(t => t.IsActive).AsQueryable();

        if (!string.IsNullOrEmpty(search))
            query = query.Where(t => t.Name.Contains(search) || t.Destination.Contains(search));

        if (!string.IsNullOrEmpty(destination))
            query = query.Where(t => t.Destination == destination);

        if (minPrice.HasValue)
            query = query.Where(t => t.Price >= minPrice.Value);

        if (maxPrice.HasValue)
            query = query.Where(t => t.Price <= maxPrice.Value);

        if (duration.HasValue)
            query = query.Where(t => t.DurationDays == duration.Value);

        var totalCount = await query.CountAsync();
        var items = await query.Skip((pageIndex - 1) * pageSize).Take(pageSize).ToListAsync();

        var result = items.Select(t => new TourPackageDto
        {
            TourId = t.Id,
            Name = t.Name,
            Description = t.Description,
            Destination = t.Destination,
            DurationDays = t.DurationDays,
            Price = t.Price,
            DiscountPrice = t.DiscountPrice,
            Images = string.IsNullOrEmpty(t.Images) ? null : JsonSerializer.Deserialize<List<string>>(t.Images),
            Includes = string.IsNullOrEmpty(t.Includes) ? null : JsonSerializer.Deserialize<List<string>>(t.Includes),
            Excludes = string.IsNullOrEmpty(t.Excludes) ? null : JsonSerializer.Deserialize<List<string>>(t.Excludes),
            AvailableSlots = t.AvailableSlots,
            DepartureDates = string.IsNullOrEmpty(t.DepartureDates) ? null : JsonSerializer.Deserialize<List<string>>(t.DepartureDates),
            Rating = t.Rating,
            ReviewCount = t.ReviewCount,
            IsFeatured = t.IsFeatured,
            IsNewArrival = t.IsNewArrival,
            IsHotDeal = t.IsHotDeal
        }).ToList();

        return Ok(new ApiResponse<List<TourPackageDto>>
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

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<TourPackageDto>>> GetTour(Guid id)
    {
        var tour = await _context.TourPackages
            .Include(t => t.Itineraries)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (tour == null || !tour.IsActive)
        {
            return NotFound(new ApiResponse<TourPackageDto>
            {
                Success = false,
                Message = "Tour not found"
            });
        }

        return Ok(new ApiResponse<TourPackageDto>
        {
            Success = true,
            Data = new TourPackageDto
            {
                TourId = tour.Id,
                Name = tour.Name,
                Description = tour.Description,
                Destination = tour.Destination,
                DurationDays = tour.DurationDays,
                Price = tour.Price,
                DiscountPrice = tour.DiscountPrice,
                Images = string.IsNullOrEmpty(tour.Images) ? null : JsonSerializer.Deserialize<List<string>>(tour.Images),
                Includes = string.IsNullOrEmpty(tour.Includes) ? null : JsonSerializer.Deserialize<List<string>>(tour.Includes),
                Excludes = string.IsNullOrEmpty(tour.Excludes) ? null : JsonSerializer.Deserialize<List<string>>(tour.Excludes),
                AvailableSlots = tour.AvailableSlots,
                DepartureDates = string.IsNullOrEmpty(tour.DepartureDates) ? null : JsonSerializer.Deserialize<List<string>>(tour.DepartureDates),
                Rating = tour.Rating,
                ReviewCount = tour.ReviewCount,
                IsFeatured = tour.IsFeatured,
                IsNewArrival = tour.IsNewArrival,
                IsHotDeal = tour.IsHotDeal,
                Itineraries = tour.Itineraries.Select(i => new TourItineraryDto
                {
                    ItineraryId = i.Id,
                    DayNumber = i.DayNumber,
                    Title = i.Title,
                    Content = i.Content,
                    Activities = string.IsNullOrEmpty(i.Activities) ? null : JsonSerializer.Deserialize<List<string>>(i.Activities)
                }).ToList()
            }
        });
    }
}
