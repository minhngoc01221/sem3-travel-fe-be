using KarnelTravels.API.DTOs;
using KarnelTravels.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KarnelTravels.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminToursController : ControllerBase
{
    private readonly ITourService _tourService;

    public AdminToursController(ITourService tourService)
    {
        _tourService = tourService;
    }

    // ==================== TOUR ====================

    /// <summary>
    /// Lấy danh sách tất cả tour kèm thống kê (F246, F257)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<List<TourDto>>>> GetTours()
    {
        var tours = await _tourService.GetAllAsync();
        return Ok(new ApiResponse<List<TourDto>>
        {
            Data = tours,
            Message = "Lấy danh sách tour thành công"
        });
    }

    /// <summary>
    /// Lấy thông tin tour theo ID (F246)
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<TourDto>>> GetTour(Guid id)
    {
        var tour = await _tourService.GetByIdAsync(id);
        if (tour == null)
        {
            return NotFound(new ApiResponse<TourDto>
            {
                Success = false,
                Message = "Không tìm thấy tour"
            });
        }

        return Ok(new ApiResponse<TourDto>
        {
            Data = tour,
            Message = "Lấy thông tin tour thành công"
        });
    }

    /// <summary>
    /// Lấy thông tin tour đầy đủ chi tiết (F246)
    /// </summary>
    [HttpGet("{id}/details")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<TourWithDetailsDto>>> GetTourWithDetails(Guid id)
    {
        var tour = await _tourService.GetByIdWithDetailsAsync(id);
        if (tour == null)
        {
            return NotFound(new ApiResponse<TourWithDetailsDto>
            {
                Success = false,
                Message = "Không tìm thấy tour"
            });
        }

        return Ok(new ApiResponse<TourWithDetailsDto>
        {
            Data = tour,
            Message = "Lấy thông tin tour chi tiết thành công"
        });
    }

    /// <summary>
    /// Tạo mới tour (F247)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<TourDto>>> CreateTour([FromBody] CreateTourRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<TourDto>
            {
                Success = false,
                Message = "Dữ liệu không hợp lệ"
            });
        }

        var tour = await _tourService.CreateAsync(request);
        return CreatedAtAction(nameof(GetTour), new { id = tour.TourId }, new ApiResponse<TourDto>
        {
            Data = tour,
            Message = "Tạo tour thành công"
        });
    }

    /// <summary>
    /// Cập nhật tour (F248)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<TourDto>>> UpdateTour(Guid id, [FromBody] UpdateTourRequest request)
    {
        var tour = await _tourService.UpdateAsync(id, request);
        if (tour == null)
        {
            return NotFound(new ApiResponse<TourDto>
            {
                Success = false,
                Message = "Không tìm thấy tour"
            });
        }

        return Ok(new ApiResponse<TourDto>
        {
            Data = tour,
            Message = "Cập nhật tour thành công"
        });
    }

    /// <summary>
    /// Xóa tour (F249)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteTour(Guid id)
    {
        var result = await _tourService.DeleteAsync(id);
        if (!result)
        {
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "Không thể xóa tour. Tour có đơn đặt đang chờ xử lý."
            });
        }

        return Ok(new ApiResponse<bool>
        {
            Data = true,
            Message = "Xóa tour thành công"
        });
    }

    // ==================== ITINERARY ====================

    /// <summary>
    /// Lấy lịch trình tour (F250)
    /// </summary>
    [HttpGet("{id}/itinerary")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<List<TourItineraryDto>>>> GetItineraries(Guid id)
    {
        var itineraries = await _tourService.GetItinerariesAsync(id);
        return Ok(new ApiResponse<List<TourItineraryDto>>
        {
            Data = itineraries,
            Message = "Lấy lịch trình tour thành công"
        });
    }

    /// <summary>
    /// Thêm lịch trình tour (F250)
    /// </summary>
    [HttpPost("{id}/itinerary")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<TourItineraryDto>>> CreateItinerary(Guid id, [FromBody] CreateTourItineraryRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<TourItineraryDto>
            {
                Success = false,
                Message = "Dữ liệu không hợp lệ"
            });
        }

        var itinerary = await _tourService.CreateItineraryAsync(id, request);
        return CreatedAtAction(nameof(GetItineraries), new { id }, new ApiResponse<TourItineraryDto>
        {
            Data = itinerary,
            Message = "Thêm lịch trình thành công"
        });
    }

    /// <summary>
    /// Cập nhật lịch trình tour (F250)
    /// </summary>
    [HttpPut("{id}/itinerary/{itineraryId}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<TourItineraryDto>>> UpdateItinerary(Guid id, Guid itineraryId, [FromBody] UpdateTourItineraryRequest request)
    {
        var itinerary = await _tourService.UpdateItineraryAsync(id, itineraryId, request);
        if (itinerary == null)
        {
            return NotFound(new ApiResponse<TourItineraryDto>
            {
                Success = false,
                Message = "Không tìm thấy lịch trình"
            });
        }

        return Ok(new ApiResponse<TourItineraryDto>
        {
            Data = itinerary,
            Message = "Cập nhật lịch trình thành công"
        });
    }

    /// <summary>
    /// Xóa lịch trình tour (F250)
    /// </summary>
    [HttpDelete("{id}/itinerary/{itineraryId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteItinerary(Guid id, Guid itineraryId)
    {
        var result = await _tourService.DeleteItineraryAsync(id, itineraryId);
        if (!result)
        {
            return NotFound(new ApiResponse<bool>
            {
                Success = false,
                Message = "Không tìm thấy lịch trình"
            });
        }

        return Ok(new ApiResponse<bool>
        {
            Data = true,
            Message = "Xóa lịch trình thành công"
        });
    }

    // ==================== DESTINATIONS ====================

    /// <summary>
    /// Lấy danh sách điểm đến (F254)
    /// </summary>
    [HttpGet("{id}/destinations")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<List<TourDestinationDto>>>> GetDestinations(Guid id)
    {
        var destinations = await _tourService.GetDestinationsAsync(id);
        return Ok(new ApiResponse<List<TourDestinationDto>>
        {
            Data = destinations,
            Message = "Lấy danh sách điểm đến thành công"
        });
    }

    /// <summary>
    /// Thêm điểm đến (F254)
    /// </summary>
    [HttpPost("{id}/destinations")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<TourDestinationDto>>> AddDestination(Guid id, [FromBody] AddTourDestinationRequest request)
    {
        var destination = await _tourService.AddDestinationAsync(id, request);
        return CreatedAtAction(nameof(GetDestinations), new { id }, new ApiResponse<TourDestinationDto>
        {
            Data = destination,
            Message = "Thêm điểm đến thành công"
        });
    }

    /// <summary>
    /// Xóa điểm đến (F254)
    /// </summary>
    [HttpDelete("{id}/destinations/{destinationId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> RemoveDestination(Guid id, Guid destinationId)
    {
        var result = await _tourService.RemoveDestinationAsync(id, destinationId);
        if (!result)
        {
            return NotFound(new ApiResponse<bool>
            {
                Success = false,
                Message = "Không tìm thấy điểm đến"
            });
        }

        return Ok(new ApiResponse<bool>
        {
            Data = true,
            Message = "Xóa điểm đến thành công"
        });
    }

    // ==================== DEPARTURES ====================

    /// <summary>
    /// Lấy danh sách ngày khởi hành (F251)
    /// </summary>
    [HttpGet("{id}/departures")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<List<TourDepartureDto>>>> GetDepartures(Guid id)
    {
        var departures = await _tourService.GetDeparturesAsync(id);
        return Ok(new ApiResponse<List<TourDepartureDto>>
        {
            Data = departures,
            Message = "Lấy danh sách ngày khởi hành thành công"
        });
    }

    /// <summary>
    /// Thêm ngày khởi hành (F251, F252)
    /// </summary>
    [HttpPost("{id}/departures")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<TourDepartureDto>>> CreateDeparture(Guid id, [FromBody] CreateTourDepartureRequest request)
    {
        if (request.DepartureDate < DateTime.Today)
        {
            return BadRequest(new ApiResponse<TourDepartureDto>
            {
                Success = false,
                Message = "Ngày khởi hành không được ở quá khứ"
            });
        }

        var departure = await _tourService.CreateDepartureAsync(id, request);
        return CreatedAtAction(nameof(GetDepartures), new { id }, new ApiResponse<TourDepartureDto>
        {
            Data = departure,
            Message = "Thêm ngày khởi hành thành công"
        });
    }

    /// <summary>
    /// Thêm nhiều ngày khởi hành (F251, F252)
    /// </summary>
    [HttpPost("{id}/departures/bulk")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<List<TourDepartureDto>>>> BulkCreateDepartures(Guid id, [FromBody] BulkCreateDepartureRequest request)
    {
        var validDates = request.Dates.Where(d => d >= DateTime.Today).ToList();
        if (!validDates.Any())
        {
            return BadRequest(new ApiResponse<List<TourDepartureDto>>
            {
                Success = false,
                Message = "Không có ngày hợp lệ để tạo"
            });
        }

        request.Dates = validDates;
        var departures = await _tourService.BulkCreateDeparturesAsync(id, request);
        return CreatedAtAction(nameof(GetDepartures), new { id }, new ApiResponse<List<TourDepartureDto>>
        {
            Data = departures,
            Message = $"Thêm {departures.Count} ngày khởi hành thành công"
        });
    }

    /// <summary>
    /// Cập nhật ngày khởi hành (F252)
    /// </summary>
    [HttpPut("{id}/departures/{departureId}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<TourDepartureDto>>> UpdateDeparture(Guid id, Guid departureId, [FromBody] UpdateTourDepartureRequest request)
    {
        if (request.DepartureDate.HasValue && request.DepartureDate.Value < DateTime.Today)
        {
            return BadRequest(new ApiResponse<TourDepartureDto>
            {
                Success = false,
                Message = "Ngày khởi hành không được ở quá khứ"
            });
        }

        var departure = await _tourService.UpdateDepartureAsync(id, departureId, request);
        if (departure == null)
        {
            return NotFound(new ApiResponse<TourDepartureDto>
            {
                Success = false,
                Message = "Không tìm thấy ngày khởi hành"
            });
        }

        return Ok(new ApiResponse<TourDepartureDto>
        {
            Data = departure,
            Message = "Cập nhật ngày khởi hành thành công"
        });
    }

    /// <summary>
    /// Xóa ngày khởi hành (F252)
    /// </summary>
    [HttpDelete("{id}/departures/{departureId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteDeparture(Guid id, Guid departureId)
    {
        var result = await _tourService.DeleteDepartureAsync(id, departureId);
        if (!result)
        {
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "Không thể xóa. Ngày khởi hành có đơn đặt đang chờ."
            });
        }

        return Ok(new ApiResponse<bool>
        {
            Data = true,
            Message = "Xóa ngày khởi hành thành công"
        });
    }

    // ==================== SERVICES (INCLUSIONS) ====================

    /// <summary>
    /// Lấy danh sách dịch vụ (F255)
    /// </summary>
    [HttpGet("{id}/services")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<List<TourServiceDto>>>> GetServices(Guid id)
    {
        var services = await _tourService.GetServicesAsync(id);
        return Ok(new ApiResponse<List<TourServiceDto>>
        {
            Data = services,
            Message = "Lấy danh sách dịch vụ thành công"
        });
    }

    /// <summary>
    /// Thêm dịch vụ (F255)
    /// </summary>
    [HttpPost("{id}/services")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<TourServiceDto>>> CreateService(Guid id, [FromBody] CreateTourServiceRequest request)
    {
        var service = await _tourService.CreateServiceAsync(id, request);
        return CreatedAtAction(nameof(GetServices), new { id }, new ApiResponse<TourServiceDto>
        {
            Data = service,
            Message = "Thêm dịch vụ thành công"
        });
    }

    /// <summary>
    /// Cập nhật dịch vụ (F255)
    /// </summary>
    [HttpPut("{id}/services/{serviceId}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<TourServiceDto>>> UpdateService(Guid id, Guid serviceId, [FromBody] UpdateTourServiceRequest request)
    {
        var service = await _tourService.UpdateServiceAsync(id, serviceId, request);
        if (service == null)
        {
            return NotFound(new ApiResponse<TourServiceDto>
            {
                Success = false,
                Message = "Không tìm thấy dịch vụ"
            });
        }

        return Ok(new ApiResponse<TourServiceDto>
        {
            Data = service,
            Message = "Cập nhật dịch vụ thành công"
        });
    }

    /// <summary>
    /// Xóa dịch vụ (F255)
    /// </summary>
    [HttpDelete("{id}/services/{serviceId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteService(Guid id, Guid serviceId)
    {
        var result = await _tourService.DeleteServiceAsync(id, serviceId);
        if (!result)
        {
            return NotFound(new ApiResponse<bool>
            {
                Success = false,
                Message = "Không tìm thấy dịch vụ"
            });
        }

        return Ok(new ApiResponse<bool>
        {
            Data = true,
            Message = "Xóa dịch vụ thành công"
        });
    }

    // ==================== TOUR GUIDES ====================

    /// <summary>
    /// Lấy danh sách hướng dẫn viên (F258)
    /// </summary>
    [HttpGet("{id}/guides")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<List<TourGuideDto>>>> GetTourGuides(Guid id)
    {
        var guides = await _tourService.GetTourGuidesAsync(id);
        return Ok(new ApiResponse<List<TourGuideDto>>
        {
            Data = guides,
            Message = "Lấy danh sách hướng dẫn viên thành công"
        });
    }

    /// <summary>
    /// Thêm hướng dẫn viên (F258)
    /// </summary>
    [HttpPost("{id}/guides")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<TourGuideDto>>> AddTourGuide(Guid id, [FromBody] CreateTourGuideRequest request)
    {
        var guide = await _tourService.AddTourGuideAsync(id, request);
        return CreatedAtAction(nameof(GetTourGuides), new { id }, new ApiResponse<TourGuideDto>
        {
            Data = guide,
            Message = "Thêm hướng dẫn viên thành công"
        });
    }

    /// <summary>
    /// Cập nhật hướng dẫn viên (F258)
    /// </summary>
    [HttpPut("{id}/guides/{guideId}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<TourGuideDto>>> UpdateTourGuide(Guid id, Guid guideId, [FromBody] UpdateTourGuideRequest request)
    {
        var guide = await _tourService.UpdateTourGuideAsync(id, guideId, request);
        if (guide == null)
        {
            return NotFound(new ApiResponse<TourGuideDto>
            {
                Success = false,
                Message = "Không tìm thấy hướng dẫn viên"
            });
        }

        return Ok(new ApiResponse<TourGuideDto>
        {
            Data = guide,
            Message = "Cập nhật hướng dẫn viên thành công"
        });
    }

    /// <summary>
    /// Xóa hướng dẫn viên (F258)
    /// </summary>
    [HttpDelete("{id}/guides/{guideId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> RemoveTourGuide(Guid id, Guid guideId)
    {
        var result = await _tourService.RemoveTourGuideAsync(id, guideId);
        if (!result)
        {
            return NotFound(new ApiResponse<bool>
            {
                Success = false,
                Message = "Không tìm thấy hướng dẫn viên"
            });
        }

        return Ok(new ApiResponse<bool>
        {
            Data = true,
            Message = "Xóa hướng dẫn viên thành công"
        });
    }

    // ==================== IMAGES ====================

    /// <summary>
    /// Lấy danh sách hình ảnh (F253)
    /// </summary>
    [HttpGet("{id}/images")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<List<TourImageDto>>>> GetImages(Guid id)
    {
        var images = await _tourService.GetImagesAsync(id);
        return Ok(new ApiResponse<List<TourImageDto>>
        {
            Data = images,
            Message = "Lấy danh sách hình ảnh thành công"
        });
    }

    /// <summary>
    /// Thêm hình ảnh (F253)
    /// </summary>
    [HttpPost("{id}/images")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<TourImageDto>>> AddImage(Guid id, [FromBody] AddTourImageRequest request)
    {
        var image = await _tourService.AddImageAsync(id, request);
        return CreatedAtAction(nameof(GetImages), new { id }, new ApiResponse<TourImageDto>
        {
            Data = image,
            Message = "Thêm hình ảnh thành công"
        });
    }

    /// <summary>
    /// Cập nhật hình ảnh (F253)
    /// </summary>
    [HttpPut("{id}/images/{imageId}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<TourImageDto>>> UpdateImage(Guid id, Guid imageId, [FromBody] UpdateTourImageRequest request)
    {
        var image = await _tourService.UpdateImageAsync(id, imageId, request);
        if (image == null)
        {
            return NotFound(new ApiResponse<TourImageDto>
            {
                Success = false,
                Message = "Không tìm thấy hình ảnh"
            });
        }

        return Ok(new ApiResponse<TourImageDto>
        {
            Data = image,
            Message = "Cập nhật hình ảnh thành công"
        });
    }

    /// <summary>
    /// Xóa hình ảnh (F253)
    /// </summary>
    [HttpDelete("{id}/images/{imageId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteImage(Guid id, Guid imageId)
    {
        var result = await _tourService.DeleteImageAsync(id, imageId);
        if (!result)
        {
            return NotFound(new ApiResponse<bool>
            {
                Success = false,
                Message = "Không tìm thấy hình ảnh"
            });
        }

        return Ok(new ApiResponse<bool>
        {
            Data = true,
            Message = "Xóa hình ảnh thành công"
        });
    }
}
