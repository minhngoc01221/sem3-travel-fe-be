using KarnelTravels.API.DTOs;
using KarnelTravels.API.Entities;
using KarnelTravels.API.Data;
using Microsoft.EntityFrameworkCore;

namespace KarnelTravels.API.Services;

public interface ITourService
{
    // Tour
    Task<List<TourDto>> GetAllAsync();
    Task<TourDto?> GetByIdAsync(Guid id);
    Task<TourWithDetailsDto?> GetByIdWithDetailsAsync(Guid id);
    Task<TourDto> CreateAsync(CreateTourRequest request);
    Task<TourDto?> UpdateAsync(Guid id, UpdateTourRequest request);
    Task<bool> DeleteAsync(Guid id);
    Task<int> GetBookingCountAsync(Guid tourId);

    // Itinerary
    Task<List<TourItineraryDto>> GetItinerariesAsync(Guid tourId);
    Task<TourItineraryDto?> GetItineraryByIdAsync(Guid tourId, Guid itineraryId);
    Task<TourItineraryDto> CreateItineraryAsync(Guid tourId, CreateTourItineraryRequest request);
    Task<TourItineraryDto?> UpdateItineraryAsync(Guid tourId, Guid itineraryId, UpdateTourItineraryRequest request);
    Task<bool> DeleteItineraryAsync(Guid tourId, Guid itineraryId);

    // Destinations
    Task<List<TourDestinationDto>> GetDestinationsAsync(Guid tourId);
    Task<TourDestinationDto> AddDestinationAsync(Guid tourId, AddTourDestinationRequest request);
    Task<bool> RemoveDestinationAsync(Guid tourId, Guid destinationId);

    // Departures
    Task<List<TourDepartureDto>> GetDeparturesAsync(Guid tourId);
    Task<TourDepartureDto?> GetDepartureByIdAsync(Guid tourId, Guid departureId);
    Task<TourDepartureDto> CreateDepartureAsync(Guid tourId, CreateTourDepartureRequest request);
    Task<List<TourDepartureDto>> BulkCreateDeparturesAsync(Guid tourId, BulkCreateDepartureRequest request);
    Task<TourDepartureDto?> UpdateDepartureAsync(Guid tourId, Guid departureId, UpdateTourDepartureRequest request);
    Task<bool> DeleteDepartureAsync(Guid tourId, Guid departureId);

    // Services (Inclusions)
    Task<List<TourServiceDto>> GetServicesAsync(Guid tourId);
    Task<TourServiceDto> CreateServiceAsync(Guid tourId, CreateTourServiceRequest request);
    Task<TourServiceDto?> UpdateServiceAsync(Guid tourId, Guid serviceId, UpdateTourServiceRequest request);
    Task<bool> DeleteServiceAsync(Guid tourId, Guid serviceId);

    // Tour Guides
    Task<List<TourGuideDto>> GetTourGuidesAsync(Guid tourId);
    Task<TourGuideDto> AddTourGuideAsync(Guid tourId, CreateTourGuideRequest request);
    Task<TourGuideDto?> UpdateTourGuideAsync(Guid tourId, Guid guideId, UpdateTourGuideRequest request);
    Task<bool> RemoveTourGuideAsync(Guid tourId, Guid guideId);

    // Images
    Task<List<TourImageDto>> GetImagesAsync(Guid tourId);
    Task<TourImageDto> AddImageAsync(Guid tourId, AddTourImageRequest request);
    Task<TourImageDto?> UpdateImageAsync(Guid tourId, Guid imageId, UpdateTourImageRequest request);
    Task<bool> DeleteImageAsync(Guid tourId, Guid imageId);
}

public class TourService : ITourService
{
    private readonly KarnelTravelsDbContext _context;

    public TourService(KarnelTravelsDbContext context)
    {
        _context = context;
    }

    #region Tour Operations

    public async Task<List<TourDto>> GetAllAsync()
    {
        return await _context.Tours
            .Where(t => !t.IsDeleted)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TourDto
            {
                TourId = t.Id,
                Name = t.Name,
                Description = t.Description,
                DurationDays = t.DurationDays,
                DurationNights = t.DurationNights,
                BasePrice = t.BasePrice,
                Status = t.Status.ToString(),
                ThumbnailUrl = t.ThumbnailUrl,
                Highlights = string.IsNullOrEmpty(t.Highlights) ? null : System.Text.Json.JsonSerializer.Deserialize<List<string>>(t.Highlights, new System.Text.Json.JsonSerializerOptions()),
                Terms = t.Terms,
                CancellationPolicy = t.CancellationPolicy,
                IsFeatured = t.IsFeatured,
                IsDomestic = t.IsDomestic,
                BookingCount = t.Bookings.Count(b => !b.IsDeleted && b.Type == BookingType.Tour),
                TotalDepartures = t.Departures.Count(d => !d.IsDeleted && d.DepartureDate >= DateTime.Today),
                CreatedAt = t.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<TourDto?> GetByIdAsync(Guid id)
    {
        var tour = await _context.Tours
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);

        if (tour == null) return null;

        return new TourDto
        {
            TourId = tour.Id,
            Name = tour.Name,
            Description = tour.Description,
            DurationDays = tour.DurationDays,
            DurationNights = tour.DurationNights,
            BasePrice = tour.BasePrice,
            Status = tour.Status.ToString(),
            ThumbnailUrl = tour.ThumbnailUrl,
            Highlights = string.IsNullOrEmpty(tour.Highlights) ? null : System.Text.Json.JsonSerializer.Deserialize<List<string>>(tour.Highlights, new System.Text.Json.JsonSerializerOptions()),
            Terms = tour.Terms,
            CancellationPolicy = tour.CancellationPolicy,
            IsFeatured = tour.IsFeatured,
            IsDomestic = tour.IsDomestic,
            BookingCount = tour.Bookings.Count(b => !b.IsDeleted && b.Type == BookingType.Tour),
            TotalDepartures = tour.Departures.Count(d => !d.IsDeleted && d.DepartureDate >= DateTime.Today),
            CreatedAt = tour.CreatedAt
        };
    }

    public async Task<TourWithDetailsDto?> GetByIdWithDetailsAsync(Guid id)
    {
        var tour = await _context.Tours
            .Include(t => t.Itineraries.OrderBy(i => i.DayNumber))
            .Include(t => t.Destinations).ThenInclude(d => d.TouristSpot)
            .Include(t => t.Departures.Where(d => !d.IsDeleted))
            .Include(t => t.Services)
            .Include(t => t.TourGuides)
            .Include(t => t.Images.OrderBy(i => i.DisplayOrder))
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);

        if (tour == null) return null;

        return new TourWithDetailsDto
        {
            TourId = tour.Id,
            Name = tour.Name,
            Description = tour.Description,
            DurationDays = tour.DurationDays,
            DurationNights = tour.DurationNights,
            BasePrice = tour.BasePrice,
            Status = tour.Status.ToString(),
            ThumbnailUrl = tour.ThumbnailUrl,
            Highlights = string.IsNullOrEmpty(tour.Highlights) ? null : System.Text.Json.JsonSerializer.Deserialize<List<string>>(tour.Highlights, new System.Text.Json.JsonSerializerOptions()),
            Terms = tour.Terms,
            CancellationPolicy = tour.CancellationPolicy,
            IsFeatured = tour.IsFeatured,
            IsDomestic = tour.IsDomestic,
            BookingCount = tour.Bookings.Count(b => !b.IsDeleted && b.Type == BookingType.Tour),
            TotalDepartures = tour.Departures.Count(d => !d.IsDeleted && d.DepartureDate >= DateTime.Today),
            CreatedAt = tour.CreatedAt,
            Itineraries = tour.Itineraries.Select(i => new TourItineraryDto
            {
                ItineraryId = i.Id,
                DayNumber = i.DayNumber,
                Title = i.Title,
                Content = i.Content,
                Meals = string.IsNullOrEmpty(i.Meals) ? null : System.Text.Json.JsonSerializer.Deserialize<List<string>>(i.Meals, new System.Text.Json.JsonSerializerOptions()),
                Accommodation = i.Accommodation,
                Transport = i.Transport,
                Activities = string.IsNullOrEmpty(i.Activities) ? null : System.Text.Json.JsonSerializer.Deserialize<List<string>>(i.Activities, new System.Text.Json.JsonSerializerOptions()),
                Notes = i.Notes
            }).ToList(),
            Destinations = tour.Destinations.Select(d => new TourDestinationDto
            {
                TourDestinationId = d.Id,
                TouristSpotId = d.TouristSpotId,
                TouristSpotName = d.TouristSpot != null ? d.TouristSpot.Name : "",
                TouristSpotImage = d.TouristSpot != null ? d.TouristSpot.Images : null,
                DisplayOrder = d.DisplayOrder
            }).ToList(),
            Departures = tour.Departures.Select(d => new TourDepartureDto
            {
                DepartureId = d.Id,
                DepartureDate = d.DepartureDate,
                AvailableSeats = d.AvailableSeats,
                TotalSeats = d.TotalSeats,
                Price = d.Price,
                DiscountPrice = d.DiscountPrice,
                IsAvailable = d.IsAvailable,
                Notes = d.Notes,
                BookedSeats = d.TotalSeats - d.AvailableSeats
            }).ToList(),
            Services = tour.Services.Select(s => new TourServiceDto
            {
                ServiceId = s.Id,
                ServiceName = s.ServiceName,
                Description = s.Description,
                IsIncluded = s.IsIncluded,
                Category = s.Category.ToString()
            }).ToList(),
            TourGuides = tour.TourGuides.Select(g => new TourGuideDto
            {
                GuideId = g.Id,
                Name = g.Name,
                Phone = g.Phone,
                Email = g.Email,
                PhotoUrl = g.PhotoUrl,
                Specialties = string.IsNullOrEmpty(g.Specialties) ? null : System.Text.Json.JsonSerializer.Deserialize<List<string>>(g.Specialties, new System.Text.Json.JsonSerializerOptions()),
                YearsExperience = g.YearsExperience,
                IsAvailable = g.IsAvailable
            }).ToList(),
            Images = tour.Images.Select(i => new TourImageDto
            {
                ImageId = i.Id,
                ImageUrl = i.ImageUrl,
                Caption = i.Caption,
                DisplayOrder = i.DisplayOrder,
                IsPrimary = i.IsPrimary
            }).ToList()
        };
    }

    public async Task<TourDto> CreateAsync(CreateTourRequest request)
    {
        var tour = new Tour
        {
            Name = request.Name,
            Description = request.Description,
            DurationDays = request.DurationDays,
            DurationNights = request.DurationNights,
            BasePrice = request.BasePrice,
            Status = request.Status,
            ThumbnailUrl = request.ThumbnailUrl,
            Highlights = request.Highlights != null ? System.Text.Json.JsonSerializer.Serialize(request.Highlights) : null,
            Terms = request.Terms,
            CancellationPolicy = request.CancellationPolicy,
            IsFeatured = request.IsFeatured,
            IsDomestic = request.IsDomestic
        };

        _context.Tours.Add(tour);
        await _context.SaveChangesAsync();

        return new TourDto
        {
            TourId = tour.Id,
            Name = tour.Name,
            Description = tour.Description,
            DurationDays = tour.DurationDays,
            DurationNights = tour.DurationNights,
            BasePrice = tour.BasePrice,
            Status = tour.Status.ToString(),
            ThumbnailUrl = tour.ThumbnailUrl,
            Highlights = request.Highlights,
            Terms = tour.Terms,
            CancellationPolicy = tour.CancellationPolicy,
            IsFeatured = tour.IsFeatured,
            IsDomestic = tour.IsDomestic,
            BookingCount = 0,
            TotalDepartures = 0,
            CreatedAt = tour.CreatedAt
        };
    }

    public async Task<TourDto?> UpdateAsync(Guid id, UpdateTourRequest request)
    {
        var tour = await _context.Tours.FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);
        if (tour == null) return null;

        if (request.Name != null) tour.Name = request.Name;
        if (request.Description != null) tour.Description = request.Description;
        if (request.DurationDays.HasValue) tour.DurationDays = request.DurationDays.Value;
        if (request.DurationNights.HasValue) tour.DurationNights = request.DurationNights.Value;
        if (request.BasePrice.HasValue) tour.BasePrice = request.BasePrice.Value;
        if (request.Status.HasValue) tour.Status = request.Status.Value;
        if (request.ThumbnailUrl != null) tour.ThumbnailUrl = request.ThumbnailUrl;
        if (request.Highlights != null) tour.Highlights = System.Text.Json.JsonSerializer.Serialize(request.Highlights);
        if (request.Terms != null) tour.Terms = request.Terms;
        if (request.CancellationPolicy != null) tour.CancellationPolicy = request.CancellationPolicy;
        if (request.IsFeatured.HasValue) tour.IsFeatured = request.IsFeatured.Value;
        if (request.IsDomestic.HasValue) tour.IsDomestic = request.IsDomestic.Value;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var tour = await _context.Tours
            .Include(t => t.Bookings)
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);

        if (tour == null) return false;

        // Check if there are active bookings
        var activeBookings = tour.Bookings.Any(b => !b.IsDeleted && b.Type == BookingType.Tour &&
            (b.Status == BookingStatus.Pending || b.Status == BookingStatus.Confirmed));
        if (activeBookings)
        {
            return false; // Cannot delete tour with active bookings
        }

        tour.IsDeleted = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<int> GetBookingCountAsync(Guid tourId)
    {
        return await _context.Bookings
            .CountAsync(b => b.TourPackageId == tourId && !b.IsDeleted && b.Type == BookingType.Tour);
    }

    #endregion

    #region Itinerary Operations

    public async Task<List<TourItineraryDto>> GetItinerariesAsync(Guid tourId)
    {
        return await _context.TourItineraries
            .Where(i => i.TourId == tourId && !i.IsDeleted)
            .OrderBy(i => i.DayNumber)
            .Select(i => new TourItineraryDto
            {
                ItineraryId = i.Id,
                DayNumber = i.DayNumber,
                Title = i.Title,
                Content = i.Content,
                Meals = string.IsNullOrEmpty(i.Meals) ? null : System.Text.Json.JsonSerializer.Deserialize<List<string>>(i.Meals, new System.Text.Json.JsonSerializerOptions()),
                Accommodation = i.Accommodation,
                Transport = i.Transport,
                Activities = string.IsNullOrEmpty(i.Activities) ? null : System.Text.Json.JsonSerializer.Deserialize<List<string>>(i.Activities, new System.Text.Json.JsonSerializerOptions()),
                Notes = i.Notes
            })
            .ToListAsync();
    }

    public async Task<TourItineraryDto?> GetItineraryByIdAsync(Guid tourId, Guid itineraryId)
    {
        var itinerary = await _context.TourItineraries
            .FirstOrDefaultAsync(i => i.Id == itineraryId && i.TourId == tourId && !i.IsDeleted);

        if (itinerary == null) return null;

        return new TourItineraryDto
        {
            ItineraryId = itinerary.Id,
            DayNumber = itinerary.DayNumber,
            Title = itinerary.Title,
            Content = itinerary.Content,
            Meals = string.IsNullOrEmpty(itinerary.Meals) ? null : System.Text.Json.JsonSerializer.Deserialize<List<string>>(itinerary.Meals, new System.Text.Json.JsonSerializerOptions()),
            Accommodation = itinerary.Accommodation,
            Transport = itinerary.Transport,
            Activities = string.IsNullOrEmpty(itinerary.Activities) ? null : System.Text.Json.JsonSerializer.Deserialize<List<string>>(itinerary.Activities, new System.Text.Json.JsonSerializerOptions()),
            Notes = itinerary.Notes
        };
    }

    public async Task<TourItineraryDto> CreateItineraryAsync(Guid tourId, CreateTourItineraryRequest request)
    {
        var itinerary = new TourItinerary
        {
            TourId = tourId,
            DayNumber = request.DayNumber,
            Title = request.Title,
            Content = request.Content,
            Meals = request.Meals != null ? System.Text.Json.JsonSerializer.Serialize(request.Meals) : null,
            Accommodation = request.Accommodation,
            Transport = request.Transport,
            Activities = request.Activities != null ? System.Text.Json.JsonSerializer.Serialize(request.Activities) : null,
            Notes = request.Notes
        };

        _context.TourItineraries.Add(itinerary);
        await _context.SaveChangesAsync();

        return new TourItineraryDto
        {
            ItineraryId = itinerary.Id,
            DayNumber = itinerary.DayNumber,
            Title = itinerary.Title,
            Content = itinerary.Content,
            Meals = request.Meals,
            Accommodation = itinerary.Accommodation,
            Transport = itinerary.Transport,
            Activities = request.Activities,
            Notes = itinerary.Notes
        };
    }

    public async Task<TourItineraryDto?> UpdateItineraryAsync(Guid tourId, Guid itineraryId, UpdateTourItineraryRequest request)
    {
        var itinerary = await _context.TourItineraries
            .FirstOrDefaultAsync(i => i.Id == itineraryId && i.TourId == tourId && !i.IsDeleted);

        if (itinerary == null) return null;

        if (request.DayNumber.HasValue) itinerary.DayNumber = request.DayNumber.Value;
        if (request.Title != null) itinerary.Title = request.Title;
        if (request.Content != null) itinerary.Content = request.Content;
        if (request.Meals != null) itinerary.Meals = System.Text.Json.JsonSerializer.Serialize(request.Meals);
        if (request.Accommodation != null) itinerary.Accommodation = request.Accommodation;
        if (request.Transport != null) itinerary.Transport = request.Transport;
        if (request.Activities != null) itinerary.Activities = System.Text.Json.JsonSerializer.Serialize(request.Activities);
        if (request.Notes != null) itinerary.Notes = request.Notes;

        await _context.SaveChangesAsync();

        return await GetItineraryByIdAsync(tourId, itineraryId);
    }

    public async Task<bool> DeleteItineraryAsync(Guid tourId, Guid itineraryId)
    {
        var itinerary = await _context.TourItineraries
            .FirstOrDefaultAsync(i => i.Id == itineraryId && i.TourId == tourId && !i.IsDeleted);

        if (itinerary == null) return false;

        itinerary.IsDeleted = true;
        await _context.SaveChangesAsync();
        return true;
    }

    #endregion

    #region Destination Operations

    public async Task<List<TourDestinationDto>> GetDestinationsAsync(Guid tourId)
    {
        return await _context.TourDestinations
            .Include(d => d.TouristSpot)
            .Where(d => d.TourId == tourId && !d.IsDeleted)
            .OrderBy(d => d.DisplayOrder)
            .Select(d => new TourDestinationDto
            {
                TourDestinationId = d.Id,
                TouristSpotId = d.TouristSpotId,
                TouristSpotName = d.TouristSpot != null ? d.TouristSpot.Name : "",
                TouristSpotImage = d.TouristSpot != null ? d.TouristSpot.Images : null,
                DisplayOrder = d.DisplayOrder
            })
            .ToListAsync();
    }

    public async Task<TourDestinationDto> AddDestinationAsync(Guid tourId, AddTourDestinationRequest request)
    {
        var destination = new TourDestination
        {
            TourId = tourId,
            TouristSpotId = request.TouristSpotId,
            DisplayOrder = request.DisplayOrder
        };

        _context.TourDestinations.Add(destination);
        await _context.SaveChangesAsync();

        var touristSpot = await _context.TouristSpots.FindAsync(request.TouristSpotId);

        return new TourDestinationDto
        {
            TourDestinationId = destination.Id,
            TouristSpotId = destination.TouristSpotId,
            TouristSpotName = touristSpot?.Name ?? "",
            TouristSpotImage = touristSpot?.Images,
            DisplayOrder = destination.DisplayOrder
        };
    }

    public async Task<bool> RemoveDestinationAsync(Guid tourId, Guid destinationId)
    {
        var destination = await _context.TourDestinations
            .FirstOrDefaultAsync(d => d.Id == destinationId && d.TourId == tourId && !d.IsDeleted);

        if (destination == null) return false;

        destination.IsDeleted = true;
        await _context.SaveChangesAsync();
        return true;
    }

    #endregion

    #region Departure Operations

    public async Task<List<TourDepartureDto>> GetDeparturesAsync(Guid tourId)
    {
        return await _context.TourDepartures
            .Where(d => d.TourId == tourId && !d.IsDeleted)
            .OrderBy(d => d.DepartureDate)
            .Select(d => new TourDepartureDto
            {
                DepartureId = d.Id,
                DepartureDate = d.DepartureDate,
                AvailableSeats = d.AvailableSeats,
                TotalSeats = d.TotalSeats,
                Price = d.Price,
                DiscountPrice = d.DiscountPrice,
                IsAvailable = d.IsAvailable,
                Notes = d.Notes,
                BookedSeats = d.TotalSeats - d.AvailableSeats
            })
            .ToListAsync();
    }

    public async Task<TourDepartureDto?> GetDepartureByIdAsync(Guid tourId, Guid departureId)
    {
        var departure = await _context.TourDepartures
            .FirstOrDefaultAsync(d => d.Id == departureId && d.TourId == tourId && !d.IsDeleted);

        if (departure == null) return null;

        return new TourDepartureDto
        {
            DepartureId = departure.Id,
            DepartureDate = departure.DepartureDate,
            AvailableSeats = departure.AvailableSeats,
            TotalSeats = departure.TotalSeats,
            Price = departure.Price,
            DiscountPrice = departure.DiscountPrice,
            IsAvailable = departure.IsAvailable,
            Notes = departure.Notes,
            BookedSeats = departure.TotalSeats - departure.AvailableSeats
        };
    }

    public async Task<TourDepartureDto> CreateDepartureAsync(Guid tourId, CreateTourDepartureRequest request)
    {
        var departure = new TourDeparture
        {
            TourId = tourId,
            DepartureDate = request.DepartureDate,
            TotalSeats = request.TotalSeats,
            AvailableSeats = request.TotalSeats,
            Price = request.Price,
            DiscountPrice = request.DiscountPrice,
            Notes = request.Notes,
            IsAvailable = request.DepartureDate >= DateTime.Today
        };

        _context.TourDepartures.Add(departure);
        await _context.SaveChangesAsync();

        return new TourDepartureDto
        {
            DepartureId = departure.Id,
            DepartureDate = departure.DepartureDate,
            AvailableSeats = departure.AvailableSeats,
            TotalSeats = departure.TotalSeats,
            Price = departure.Price,
            DiscountPrice = departure.DiscountPrice,
            IsAvailable = departure.IsAvailable,
            Notes = departure.Notes,
            BookedSeats = 0
        };
    }

    public async Task<List<TourDepartureDto>> BulkCreateDeparturesAsync(Guid tourId, BulkCreateDepartureRequest request)
    {
        var departures = request.Dates.Select(date => new TourDeparture
        {
            TourId = tourId,
            DepartureDate = date,
            TotalSeats = request.TotalSeats,
            AvailableSeats = request.TotalSeats,
            Price = request.Price,
            DiscountPrice = request.DiscountPrice,
            Notes = request.Notes,
            IsAvailable = date >= DateTime.Today
        }).ToList();

        _context.TourDepartures.AddRange(departures);
        await _context.SaveChangesAsync();

        return departures.Select(d => new TourDepartureDto
        {
            DepartureId = d.Id,
            DepartureDate = d.DepartureDate,
            AvailableSeats = d.AvailableSeats,
            TotalSeats = d.TotalSeats,
            Price = d.Price,
            DiscountPrice = d.DiscountPrice,
            IsAvailable = d.IsAvailable,
            Notes = d.Notes,
            BookedSeats = 0
        }).ToList();
    }

    public async Task<TourDepartureDto?> UpdateDepartureAsync(Guid tourId, Guid departureId, UpdateTourDepartureRequest request)
    {
        var departure = await _context.TourDepartures
            .FirstOrDefaultAsync(d => d.Id == departureId && d.TourId == tourId && !d.IsDeleted);

        if (departure == null) return null;

        if (request.DepartureDate.HasValue) departure.DepartureDate = request.DepartureDate.Value;
        if (request.TotalSeats.HasValue)
        {
            var diff = request.TotalSeats.Value - departure.TotalSeats;
            departure.TotalSeats = request.TotalSeats.Value;
            departure.AvailableSeats = Math.Max(0, departure.AvailableSeats + diff);
        }
        if (request.Price.HasValue) departure.Price = request.Price.Value;
        if (request.DiscountPrice.HasValue) departure.DiscountPrice = request.DiscountPrice.Value;
        if (request.IsAvailable.HasValue) departure.IsAvailable = request.IsAvailable.Value;
        if (request.Notes != null) departure.Notes = request.Notes;

        await _context.SaveChangesAsync();

        return await GetDepartureByIdAsync(tourId, departureId);
    }

    public async Task<bool> DeleteDepartureAsync(Guid tourId, Guid departureId)
    {
        var departure = await _context.TourDepartures
            .Include(d => d.Bookings)
            .FirstOrDefaultAsync(d => d.Id == departureId && d.TourId == tourId && !d.IsDeleted);

        if (departure == null) return false;

        // Check if there are active bookings
        var activeBookings = departure.Bookings.Any(b => !b.IsDeleted &&
            (b.Status == BookingStatus.Pending || b.Status == BookingStatus.Confirmed));
        if (activeBookings)
        {
            return false;
        }

        departure.IsDeleted = true;
        await _context.SaveChangesAsync();
        return true;
    }

    #endregion

    #region Service Operations

    public async Task<List<TourServiceDto>> GetServicesAsync(Guid tourId)
    {
        return await _context.TourServices
            .Where(s => s.TourId == tourId && !s.IsDeleted)
            .OrderBy(s => s.Category)
            .Select(s => new TourServiceDto
            {
                ServiceId = s.Id,
                ServiceName = s.ServiceName,
                Description = s.Description,
                IsIncluded = s.IsIncluded,
                Category = s.Category.ToString()
            })
            .ToListAsync();
    }

    public async Task<TourServiceDto> CreateServiceAsync(Guid tourId, CreateTourServiceRequest request)
    {
        var service = new Entities.TourService
        {
            TourId = tourId,
            ServiceName = request.ServiceName,
            Description = request.Description,
            IsIncluded = request.IsIncluded,
            Category = request.Category
        };

        _context.TourServices.Add(service);
        await _context.SaveChangesAsync();

        return new TourServiceDto
        {
            ServiceId = service.Id,
            ServiceName = service.ServiceName,
            Description = service.Description,
            IsIncluded = service.IsIncluded,
            Category = service.Category.ToString()
        };
    }

    public async Task<TourServiceDto?> UpdateServiceAsync(Guid tourId, Guid serviceId, UpdateTourServiceRequest request)
    {
        var service = await _context.TourServices
            .FirstOrDefaultAsync(s => s.Id == serviceId && s.TourId == tourId && !s.IsDeleted);

        if (service == null) return null;

        if (request.ServiceName != null) service.ServiceName = request.ServiceName;
        if (request.Description != null) service.Description = request.Description;
        if (request.IsIncluded.HasValue) service.IsIncluded = request.IsIncluded.Value;
        if (request.Category.HasValue) service.Category = request.Category.Value;

        await _context.SaveChangesAsync();

        return new TourServiceDto
        {
            ServiceId = service.Id,
            ServiceName = service.ServiceName,
            Description = service.Description,
            IsIncluded = service.IsIncluded,
            Category = service.Category.ToString()
        };
    }

    public async Task<bool> DeleteServiceAsync(Guid tourId, Guid serviceId)
    {
        var service = await _context.TourServices
            .FirstOrDefaultAsync(s => s.Id == serviceId && s.TourId == tourId && !s.IsDeleted);

        if (service == null) return false;

        service.IsDeleted = true;
        await _context.SaveChangesAsync();
        return true;
    }

    #endregion

    #region Tour Guide Operations

    public async Task<List<TourGuideDto>> GetTourGuidesAsync(Guid tourId)
    {
        return await _context.TourGuides
            .Where(g => g.Tours.Any(t => t.Id == tourId) && !g.IsDeleted)
            .Select(g => new TourGuideDto
            {
                GuideId = g.Id,
                Name = g.Name,
                Phone = g.Phone,
                Email = g.Email,
                PhotoUrl = g.PhotoUrl,
                Specialties = string.IsNullOrEmpty(g.Specialties) ? null : System.Text.Json.JsonSerializer.Deserialize<List<string>>(g.Specialties, new System.Text.Json.JsonSerializerOptions()),
                YearsExperience = g.YearsExperience,
                IsAvailable = g.IsAvailable
            })
            .ToListAsync();
    }

    public async Task<TourGuideDto> AddTourGuideAsync(Guid tourId, CreateTourGuideRequest request)
    {
        // Check if guide exists
        var guide = await _context.TourGuides
            .FirstOrDefaultAsync(g => g.Email == request.Email && !g.IsDeleted);

        if (guide == null)
        {
            // Create new guide
            guide = new TourGuide
            {
                Name = request.Name,
                Phone = request.Phone,
                Email = request.Email,
                PhotoUrl = request.PhotoUrl,
                Specialties = request.Specialties != null ? System.Text.Json.JsonSerializer.Serialize(request.Specialties) : null,
                YearsExperience = request.YearsExperience,
                IsAvailable = request.IsAvailable
            };
            _context.TourGuides.Add(guide);
            await _context.SaveChangesAsync();
        }

        // Add to tour
        var tour = await _context.Tours.FindAsync(tourId);
        if (tour != null && !tour.TourGuides.Contains(guide))
        {
            tour.TourGuides.Add(guide);
            await _context.SaveChangesAsync();
        }

        return new TourGuideDto
        {
            GuideId = guide.Id,
            Name = guide.Name,
            Phone = guide.Phone,
            Email = guide.Email,
            PhotoUrl = guide.PhotoUrl,
            Specialties = request.Specialties,
            YearsExperience = guide.YearsExperience,
            IsAvailable = guide.IsAvailable
        };
    }

    public async Task<TourGuideDto?> UpdateTourGuideAsync(Guid tourId, Guid guideId, UpdateTourGuideRequest request)
    {
        var guide = await _context.TourGuides
            .FirstOrDefaultAsync(g => g.Id == guideId && !g.IsDeleted);

        if (guide == null) return null;

        if (request.Name != null) guide.Name = request.Name;
        if (request.Phone != null) guide.Phone = request.Phone;
        if (request.Email != null) guide.Email = request.Email;
        if (request.PhotoUrl != null) guide.PhotoUrl = request.PhotoUrl;
        if (request.Specialties != null) guide.Specialties = System.Text.Json.JsonSerializer.Serialize(request.Specialties);
        if (request.YearsExperience.HasValue) guide.YearsExperience = request.YearsExperience.Value;
        if (request.IsAvailable.HasValue) guide.IsAvailable = request.IsAvailable.Value;

        await _context.SaveChangesAsync();

        return new TourGuideDto
        {
            GuideId = guide.Id,
            Name = guide.Name,
            Phone = guide.Phone,
            Email = guide.Email,
            PhotoUrl = guide.PhotoUrl,
            Specialties = request.Specialties,
            YearsExperience = guide.YearsExperience,
            IsAvailable = guide.IsAvailable
        };
    }

    public async Task<bool> RemoveTourGuideAsync(Guid tourId, Guid guideId)
    {
        var tour = await _context.Tours
            .Include(t => t.TourGuides)
            .FirstOrDefaultAsync(t => t.Id == tourId && !t.IsDeleted);

        var guide = tour?.TourGuides.FirstOrDefault(g => g.Id == guideId);
        if (guide == null) return false;

        tour!.TourGuides.Remove(guide);
        await _context.SaveChangesAsync();
        return true;
    }

    #endregion

    #region Image Operations

    public async Task<List<TourImageDto>> GetImagesAsync(Guid tourId)
    {
        return await _context.TourImages
            .Where(i => i.TourId == tourId && !i.IsDeleted)
            .OrderBy(i => i.DisplayOrder)
            .Select(i => new TourImageDto
            {
                ImageId = i.Id,
                ImageUrl = i.ImageUrl,
                Caption = i.Caption,
                DisplayOrder = i.DisplayOrder,
                IsPrimary = i.IsPrimary
            })
            .ToListAsync();
    }

    public async Task<TourImageDto> AddImageAsync(Guid tourId, AddTourImageRequest request)
    {
        // If this is set as primary, unset other primaries
        if (request.IsPrimary)
        {
            var existingPrimaries = await _context.TourImages
                .Where(i => i.TourId == tourId && i.IsPrimary && !i.IsDeleted)
                .ToListAsync();
            foreach (var img in existingPrimaries)
            {
                img.IsPrimary = false;
            }
        }

        var image = new TourImage
        {
            TourId = tourId,
            ImageUrl = request.ImageUrl,
            Caption = request.Caption,
            DisplayOrder = request.DisplayOrder,
            IsPrimary = request.IsPrimary
        };

        _context.TourImages.Add(image);
        await _context.SaveChangesAsync();

        return new TourImageDto
        {
            ImageId = image.Id,
            ImageUrl = image.ImageUrl,
            Caption = image.Caption,
            DisplayOrder = image.DisplayOrder,
            IsPrimary = image.IsPrimary
        };
    }

    public async Task<TourImageDto?> UpdateImageAsync(Guid tourId, Guid imageId, UpdateTourImageRequest request)
    {
        var image = await _context.TourImages
            .FirstOrDefaultAsync(i => i.Id == imageId && i.TourId == tourId && !i.IsDeleted);

        if (image == null) return null;

        if (request.IsPrimary == true)
        {
            var existingPrimaries = await _context.TourImages
                .Where(i => i.TourId == tourId && i.IsPrimary && i.Id != imageId && !i.IsDeleted)
                .ToListAsync();
            foreach (var img in existingPrimaries)
            {
                img.IsPrimary = false;
            }
        }

        if (request.ImageUrl != null) image.ImageUrl = request.ImageUrl;
        if (request.Caption != null) image.Caption = request.Caption;
        if (request.DisplayOrder.HasValue) image.DisplayOrder = request.DisplayOrder.Value;
        if (request.IsPrimary.HasValue) image.IsPrimary = request.IsPrimary.Value;

        await _context.SaveChangesAsync();

        return new TourImageDto
        {
            ImageId = image.Id,
            ImageUrl = image.ImageUrl,
            Caption = image.Caption,
            DisplayOrder = image.DisplayOrder,
            IsPrimary = image.IsPrimary
        };
    }

    public async Task<bool> DeleteImageAsync(Guid tourId, Guid imageId)
    {
        var image = await _context.TourImages
            .FirstOrDefaultAsync(i => i.Id == imageId && i.TourId == tourId && !i.IsDeleted);

        if (image == null) return false;

        image.IsDeleted = true;
        await _context.SaveChangesAsync();
        return true;
    }

    #endregion
}
