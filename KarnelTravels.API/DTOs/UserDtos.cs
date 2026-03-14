namespace KarnelTravels.API.DTOs;

using KarnelTravels.API.Entities;

// ==================== User Management DTOs ====================

/// <summary>
/// DTO cho danh sách người dùng (có phân trang)
/// </summary>
public class UserListDto
{
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Avatar { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public UserRole Role { get; set; }
    public string RoleName => Role.ToString();
    public bool IsLocked { get; set; }
    public bool IsEmailVerified { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Request tạo mới user (Admin/Staff)
/// </summary>
public class CreateUserRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public UserRole Role { get; set; } = UserRole.User;
}

/// <summary>
/// Request cập nhật thông tin user
/// </summary>
public class UpdateUserRequest
{
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public UserRole? Role { get; set; }
}

/// <summary>
/// Request thay đổi mật khẩu (Admin đặt lại)
/// </summary>
public class AdminResetPasswordRequest
{
    public string NewPassword { get; set; } = string.Empty;
}

/// <summary>
/// Request thay đổi trạng thái user (kích hoạt/vô hiệu hóa)
/// </summary>
public class UpdateUserStatusRequest
{
    public bool IsLocked { get; set; }
}

/// <summary>
/// DTO cho lịch sử đơn đặt của user
/// </summary>
public class UserBookingHistoryDto
{
    public Guid BookingId { get; set; }
    public string BookingCode { get; set; } = string.Empty;
    public BookingType Type { get; set; }
    public string TypeName => Type.ToString();
    public BookingStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public DateTime? ServiceDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int Quantity { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal? DiscountAmount { get; set; }
    public decimal FinalAmount { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public string PaymentStatusName => PaymentStatus.ToString();
    public string? PaymentMethod { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? ItemName { get; set; }
    public Guid? ItemId { get; set; }
}

/// <summary>
/// Phản hồi phân trang cho danh sách user
/// </summary>
public class PagedUserListResponse
{
    public List<UserListDto> Users { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
}

/// <summary>
/// Request tìm kiếm và phân trang user
/// </summary>
public class UserSearchRequest
{
    public string? SearchTerm { get; set; }
    public UserRole? Role { get; set; }
    public bool? IsLocked { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SortBy { get; set; } = "CreatedAt";
    public bool SortDescending { get; set; } = true;
}
