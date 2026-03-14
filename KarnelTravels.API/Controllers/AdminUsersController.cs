using System.Security.Claims;
using KarnelTravels.API.DTOs;
using KarnelTravels.API.Entities;
using KarnelTravels.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KarnelTravels.API.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "Admin")]
public class AdminUsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<AdminUsersController> _logger;

    public AdminUsersController(IUserService userService, ILogger<AdminUsersController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    /// <summary>
    /// F219: Lấy danh sách người dùng kèm phân trang và tìm kiếm
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedUserListResponse>>> GetUsers([FromQuery] UserSearchRequest request)
    {
        try
        {
            var result = await _userService.GetUsersAsync(request);
            return Ok(new ApiResponse<PagedUserListResponse>
            {
                Success = true,
                Data = result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting users");
            return StatusCode(500, new ApiResponse<PagedUserListResponse>
            {
                Success = false,
                Message = "Lỗi khi lấy danh sách người dùng"
            });
        }
    }

    /// <summary>
    /// F220: Thêm mới tài khoản Admin/Staff
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<UserListDto>>> CreateUser([FromBody] CreateUserRequest request)
    {
        try
        {
            // Kiểm tra role hợp lệ - chỉ Admin mới có thể tạo Admin/Moderator/Staff
            var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (currentUserRole != "Admin" && (request.Role == UserRole.Admin || request.Role == UserRole.Moderator || request.Role == UserRole.Staff))
            {
                return BadRequest(new ApiResponse<UserListDto>
                {
                    Success = false,
                    Message = "Bạn không có quyền tạo tài khoản với vai trò này"
                });
            }

            // Không cho phép tạo tài khoản có role = User qua API này (chỉ dùng để tạo staff/admin)
            if (request.Role == UserRole.User)
            {
                request.Role = UserRole.Staff;
            }

            var result = await _userService.CreateUserAsync(request);
            return CreatedAtAction(nameof(GetUserById), new { id = result.UserId }, new ApiResponse<UserListDto>
            {
                Success = true,
                Data = result,
                Message = "Tạo tài khoản thành công"
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<UserListDto>
            {
                Success = false,
                Message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return StatusCode(500, new ApiResponse<UserListDto>
            {
                Success = false,
                Message = "Lỗi khi tạo tài khoản"
            });
        }
    }

    /// <summary>
    /// Lấy thông tin chi tiết một người dùng
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<UserListDto>>> GetUserById(Guid id)
    {
        try
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound(new ApiResponse<UserListDto>
                {
                    Success = false,
                    Message = "Không tìm thấy người dùng"
                });
            }

            return Ok(new ApiResponse<UserListDto>
            {
                Success = true,
                Data = user
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user {UserId}", id);
            return StatusCode(500, new ApiResponse<UserListDto>
            {
                Success = false,
                Message = "Lỗi khi lấy thông tin người dùng"
            });
        }
    }

    /// <summary>
    /// F221: Cập nhật thông tin cơ bản
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<UserListDto>>> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        try
        {
            // Kiểm tra role hợp lệ
            var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (currentUserRole != "Admin" && request.Role.HasValue && request.Role.Value != UserRole.Staff)
            {
                return BadRequest(new ApiResponse<UserListDto>
                {
                    Success = false,
                    Message = "Bạn không có quyền thay đổi vai trò này"
                });
            }

            var result = await _userService.UpdateUserAsync(id, request);
            if (result == null)
            {
                return NotFound(new ApiResponse<UserListDto>
                {
                    Success = false,
                    Message = "Không tìm thấy người dùng"
                });
            }

            return Ok(new ApiResponse<UserListDto>
            {
                Success = true,
                Data = result,
                Message = "Cập nhật thông tin thành công"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", id);
            return StatusCode(500, new ApiResponse<UserListDto>
            {
                Success = false,
                Message = "Lỗi khi cập nhật thông tin người dùng"
            });
        }
    }

    /// <summary>
    /// F222: Xóa tài khoản
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<string>>> DeleteUser(Guid id)
    {
        try
        {
            // Không cho phép xóa chính mình
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (currentUserId == id.ToString())
            {
                return BadRequest(new ApiResponse<string>
                {
                    Success = false,
                    Message = "Bạn không thể xóa tài khoản của chính mình"
                });
            }

            var result = await _userService.DeleteUserAsync(id);
            if (!result)
            {
                return NotFound(new ApiResponse<string>
                {
                    Success = false,
                    Message = "Không tìm thấy người dùng"
                });
            }

            return Ok(new ApiResponse<string>
            {
                Success = true,
                Message = "Xóa tài khoản thành công"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}", id);
            return StatusCode(500, new ApiResponse<string>
            {
                Success = false,
                Message = "Lỗi khi xóa tài khoản"
            });
        }
    }

    /// <summary>
    /// F225: Kích hoạt hoặc vô hiệu hóa tài khoản
    /// </summary>
    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<ApiResponse<string>>> UpdateUserStatus(Guid id, [FromBody] UpdateUserStatusRequest request)
    {
        try
        {
            // Không cho phép vô hiệu hóa chính mình
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (currentUserId == id.ToString() && request.IsLocked)
            {
                return BadRequest(new ApiResponse<string>
                {
                    Success = false,
                    Message = "Bạn không thể vô hiệu hóa tài khoản của chính mình"
                });
            }

            var result = await _userService.UpdateUserStatusAsync(id, request.IsLocked);
            if (!result)
            {
                return NotFound(new ApiResponse<string>
                {
                    Success = false,
                    Message = "Không tìm thấy người dùng"
                });
            }

            var message = request.IsLocked ? "Đã vô hiệu hóa tài khoản" : "Đã kích hoạt tài khoản";
            return Ok(new ApiResponse<string>
            {
                Success = true,
                Message = message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user status {UserId}", id);
            return StatusCode(500, new ApiResponse<string>
            {
                Success = false,
                Message = "Lỗi khi cập nhật trạng thái tài khoản"
            });
        }
    }

    /// <summary>
    /// F224: Thay đổi mật khẩu cho người dùng
    /// </summary>
    [HttpPost("{id:guid}/reset-password")]
    public async Task<ActionResult<ApiResponse<string>>> ResetPassword(Guid id, [FromBody] AdminResetPasswordRequest request)
    {
        try
        {
            // Validate password
            if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
            {
                return BadRequest(new ApiResponse<string>
                {
                    Success = false,
                    Message = "Mật khẩu phải có ít nhất 6 ký tự"
                });
            }

            var result = await _userService.ResetPasswordAsync(id, request.NewPassword);
            if (!result)
            {
                return NotFound(new ApiResponse<string>
                {
                    Success = false,
                    Message = "Không tìm thấy người dùng"
                });
            }

            return Ok(new ApiResponse<string>
            {
                Success = true,
                Message = "Đặt lại mật khẩu thành công"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password for user {UserId}", id);
            return StatusCode(500, new ApiResponse<string>
            {
                Success = false,
                Message = "Lỗi khi đặt lại mật khẩu"
            });
        }
    }

    /// <summary>
    /// F226: Xem danh sách đơn đặt của người dùng cụ thể
    /// </summary>
    [HttpGet("{id:guid}/bookings")]
    public async Task<ActionResult<ApiResponse<List<UserBookingHistoryDto>>>> GetUserBookings(Guid id)
    {
        try
        {
            var bookings = await _userService.GetUserBookingsAsync(id);
            return Ok(new ApiResponse<List<UserBookingHistoryDto>>
            {
                Success = true,
                Data = bookings
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting bookings for user {UserId}", id);
            return StatusCode(500, new ApiResponse<List<UserBookingHistoryDto>>
            {
                Success = false,
                Message = "Lỗi khi lấy danh sách đơn đặt"
            });
        }
    }
}
