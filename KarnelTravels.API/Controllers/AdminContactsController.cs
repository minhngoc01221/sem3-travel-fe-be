using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using KarnelTravels.API.Entities;
using KarnelTravels.API.Services;
using KarnelTravels.API.Data;
using KarnelTravels.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KarnelTravels.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminContactsController : ControllerBase
{
    private readonly KarnelTravelsDbContext _context;
    private readonly IEmailService _emailService;

    public AdminContactsController(KarnelTravelsDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    /// <summary>
    /// Lấy danh sách liên hệ có phân trang và lọc (F211, F216, F217)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<PagedResult<AdminContactDto>>>> GetContacts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] bool? isRead = null,
        [FromQuery] ContactStatus? status = null)
    {
        var query = _context.Contacts
            .Include(c => c.User)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(c => 
                c.FullName.Contains(search) || 
                c.Email.Contains(search) ||
                (c.Subject != null && c.Subject.Contains(search)));
        }

        if (isRead.HasValue)
        {
            query = query.Where(c => (c.Status == ContactStatus.Read || c.Status == ContactStatus.Replied || c.Status == ContactStatus.Closed) == isRead.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(c => c.Status == status.Value);
        }

        var totalCount = await query.CountAsync();

        var contacts = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var contactDtos = contacts.Select(c => new AdminContactDto
        {
            ContactId = c.Id,
            FullName = c.FullName,
            Email = c.Email,
            Subject = c.Subject,
            PhoneNumber = c.PhoneNumber,
            Message = c.Message,
            IsRead = c.Status == ContactStatus.Read || c.Status == ContactStatus.Replied || c.Status == ContactStatus.Closed,
            Status = c.Status,
            ReplyMessage = c.ReplyMessage,
            RepliedAt = c.RepliedAt,
            CreatedAt = c.CreatedAt
        }).ToList();

        var pagedResult = new PagedResult<AdminContactDto>
        {
            Items = contactDtos,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };

        return Ok(new ApiResponse<PagedResult<AdminContactDto>>
        {
            Success = true,
            Data = pagedResult
        });
    }

    /// <summary>
    /// Lấy chi tiết một liên hệ (F212)
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<AdminContactDetailDto>>> GetContact(Guid id)
    {
        var contact = await _context.Contacts
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (contact == null)
        {
            return NotFound(new ApiResponse<AdminContactDetailDto>
            {
                Success = false,
                Message = "Không tìm thấy liên hệ"
            });
        }

        var detail = new AdminContactDetailDto
        {
            ContactId = contact.Id,
            FullName = contact.FullName,
            Email = contact.Email,
            Subject = contact.Subject,
            PhoneNumber = contact.PhoneNumber,
            Address = contact.Address,
            ServiceType = contact.ServiceType,
            PreferredDate = contact.PreferredDate,
            NumberOfPeople = contact.NumberOfPeople,
            Message = contact.Message,
            IsRead = contact.Status == ContactStatus.Read || contact.Status == ContactStatus.Replied || contact.Status == ContactStatus.Closed,
            Status = contact.Status,
            ReplyMessage = contact.ReplyMessage,
            RepliedAt = contact.RepliedAt,
            CreatedAt = contact.CreatedAt,
            
            UserName = contact.User?.FullName,
            UserEmail = contact.User?.Email
        };

        return Ok(new ApiResponse<AdminContactDetailDto>
        {
            Success = true,
            Data = detail
        });
    }

    /// <summary>
    /// Cập nhật trạng thái đã đọc (F213)
    /// </summary>
    [HttpPatch("{id}/read-status")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<AdminContactDto>>> UpdateReadStatus(Guid id)
    {
        var contact = await _context.Contacts.FindAsync(id);

        if (contact == null)
        {
            return NotFound(new ApiResponse<AdminContactDto>
            {
                Success = false,
                Message = "Không tìm thấy liên hệ"
            });
        }

        // Toggle read status
        if (contact.Status == ContactStatus.Unread)
        {
            contact.Status = ContactStatus.Read;
        }
        else if (contact.Status == ContactStatus.Read)
        {
            contact.Status = ContactStatus.Unread;
        }

        contact.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var dto = new AdminContactDto
        {
            ContactId = contact.Id,
            FullName = contact.FullName,
            Email = contact.Email,
            Subject = contact.Subject,
            PhoneNumber = contact.PhoneNumber,
            Message = contact.Message,
            IsRead = contact.Status == ContactStatus.Read || contact.Status == ContactStatus.Replied || contact.Status == ContactStatus.Closed,
            Status = contact.Status,
            ReplyMessage = contact.ReplyMessage,
            RepliedAt = contact.RepliedAt,
            CreatedAt = contact.CreatedAt
        };

        return Ok(new ApiResponse<AdminContactDto>
        {
            Success = true,
            Data = dto,
            Message = contact.Status == ContactStatus.Read ? "Đánh dấu đã đọc" : "Đánh dấu chưa đọc"
        });
    }

    /// <summary>
    /// Gửi phản hồi qua email (F214)
    /// </summary>
    [HttpPost("{id}/reply")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<AdminContactDto>>> ReplyContact(Guid id, [FromBody] ReplyContactRequest request)
    {
        var contact = await _context.Contacts.FindAsync(id);

        if (contact == null)
        {
            return NotFound(new ApiResponse<AdminContactDto>
            {
                Success = false,
                Message = "Không tìm thấy liên hệ"
            });
        }

        if (string.IsNullOrWhiteSpace(request.ReplyMessage))
        {
            return BadRequest(new ApiResponse<AdminContactDto>
            {
                Success = false,
                Message = "Nội dung phản hồi không được để trống"
            });
        }

        // Send email
        var emailSent = await _emailService.SendReplyEmailAsync(
            contact.Email,
            contact.FullName,
            contact.Subject ?? "Phản hồi từ Karnel Travels",
            request.ReplyMessage,
            contact.Message
        );

        if (!emailSent)
        {
            return BadRequest(new ApiResponse<AdminContactDto>
            {
                Success = false,
                Message = "Gửi email thất bại. Vui lòng kiểm tra cấu hình email."
            });
        }

        // Update contact
        contact.ReplyMessage = request.ReplyMessage;
        contact.RepliedAt = DateTime.UtcNow;
        contact.Status = ContactStatus.Replied;
        contact.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var dto = new AdminContactDto
        {
            ContactId = contact.Id,
            FullName = contact.FullName,
            Email = contact.Email,
            Subject = contact.Subject,
            PhoneNumber = contact.PhoneNumber,
            Message = contact.Message,
            IsRead = true,
            Status = contact.Status,
            ReplyMessage = contact.ReplyMessage,
            RepliedAt = contact.RepliedAt,
            CreatedAt = contact.CreatedAt
        };

        return Ok(new ApiResponse<AdminContactDto>
        {
            Success = true,
            Data = dto,
            Message = "Gửi phản hồi thành công"
        });
    }

    /// <summary>
    /// Xóa liên hệ (F215)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<string>>> DeleteContact(Guid id)
    {
        var contact = await _context.Contacts.FindAsync(id);

        if (contact == null)
        {
            return NotFound(new ApiResponse<string>
            {
                Success = false,
                Message = "Không tìm thấy liên hệ"
            });
        }

        _context.Contacts.Remove(contact);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<string>
        {
            Success = true,
            Message = "Xóa liên hệ thành công"
        });
    }

    /// <summary>
    /// Xuất danh sách liên hệ (F218)
    /// </summary>
    [HttpGet("export")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult> ExportContacts(
        [FromQuery] string? search = null,
        [FromQuery] bool? isRead = null,
        [FromQuery] ContactStatus? status = null,
        [FromQuery] string format = "csv")
    {
        var query = _context.Contacts.AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(c => 
                c.FullName.Contains(search) || 
                c.Email.Contains(search) ||
                (c.Subject != null && c.Subject.Contains(search)));
        }

        if (isRead.HasValue)
        {
            query = query.Where(c => (c.Status == ContactStatus.Read || c.Status == ContactStatus.Replied || c.Status == ContactStatus.Closed) == isRead.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(c => c.Status == status.Value);
        }

        var contacts = await query.OrderByDescending(c => c.CreatedAt).ToListAsync();

        // Generate CSV content
        var csv = new System.Text.StringBuilder();
        csv.AppendLine("Họ tên,Email,Số điện thoại,Chủ đề,Nội dung,Trạng thái,Ngày gửi,Ngày phản hồi");

        foreach (var c in contacts)
        {
            var statusText = c.Status switch
            {
                ContactStatus.Unread => "Chưa đọc",
                ContactStatus.Read => "Đã đọc",
                ContactStatus.Replied => "Đã phản hồi",
                ContactStatus.Closed => "Đã đóng",
                _ => c.Status.ToString()
            };

            csv.AppendLine($"\"{c.FullName}\",\"{c.Email}\",\"{c.PhoneNumber ?? ""}\",\"{c.Subject ?? ""}\",\"{c.Message.Replace("\"", "\"\"")}\",\"{statusText}\",\"{c.CreatedAt:dd/MM/yyyy}\",\"{c.RepliedAt:dd/MM/yyyy HH:mm}\"");
        }

        var bytes = System.Text.Encoding.UTF8.GetBytes(csv.ToString());
        return File(bytes, "text/csv", $"contacts_export_{DateTime.Now:yyyyMMdd_HHmmss}.csv");
    }

    /// <summary>
    /// Lấy thống kê liên hệ
    /// </summary>
    [HttpGet("statistics")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<ContactStatisticsDto>>> GetStatistics()
    {
        var total = await _context.Contacts.CountAsync();
        var unread = await _context.Contacts.CountAsync(c => c.Status == ContactStatus.Unread);
        var read = await _context.Contacts.CountAsync(c => c.Status == ContactStatus.Read);
        var replied = await _context.Contacts.CountAsync(c => c.Status == ContactStatus.Replied);
        var closed = await _context.Contacts.CountAsync(c => c.Status == ContactStatus.Closed);

        var statistics = new ContactStatisticsDto
        {
            Total = total,
            UnreadCount = unread,
            ReadCount = read,
            RepliedCount = replied,
            ClosedCount = closed
        };

        return Ok(new ApiResponse<ContactStatisticsDto>
        {
            Success = true,
            Data = statistics
        });
    }
}

// ==================== DTOs ====================

public class AdminContactDto
{
    public Guid ContactId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Subject { get; set; }
    public string? PhoneNumber { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public ContactStatus Status { get; set; }
    public string? ReplyMessage { get; set; }
    public DateTime? RepliedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminContactDetailDto : AdminContactDto
{
    public string? Address { get; set; }
    public string? ServiceType { get; set; }
    public DateTime? PreferredDate { get; set; }
    public int? NumberOfPeople { get; set; }
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
}

public class ReplyContactRequest
{
    public string ReplyMessage { get; set; } = string.Empty;
}

public class ContactStatisticsDto
{
    public int Total { get; set; }
    public int UnreadCount { get; set; }
    public int ReadCount { get; set; }
    public int RepliedCount { get; set; }
    public int ClosedCount { get; set; }
}
