using Microsoft.AspNetCore.Mvc;
using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;

namespace SportZone_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet("/get-all-account")]
        public async Task<IActionResult> GetAllAccount()
        {
            try
            {
                var users = await _adminService.GetAllAccount();
                return Ok(new
                {
                    success = true,
                    message = "Lấy danh sách tài khoản thành công",
                    data = users,
                    count = users.Count()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = $"Lỗi server: {ex.Message}"
                });
            }
        }

        [HttpGet("/search-users")]
        public async Task<IActionResult> SearchUsers([FromQuery] SearchUserDto searchDto)
        {
            try
            {
                if (searchDto == null)
                {
                    searchDto = new SearchUserDto();
                }

                var users = await _adminService.SearchUsers(searchDto);

                return Ok(new
                {
                    success = true,
                    message = "Tìm kiếm tài khoản thành công",
                    data = users,
                    count = users.Count()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = $"Lỗi server: {ex.Message}"
                });
            }
        }

        [HttpPost("/create-account")]
        public async Task<IActionResult> CreateAccount([FromBody] CreateAccountDto createAccountDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState
                        .Where(x => x.Value.Errors.Count > 0)
                        .Select(x => new { Field = x.Key, Errors = x.Value.Errors.Select(e => e.ErrorMessage) });

                    return BadRequest(new
                    {
                        success = false,
                        message = "Dữ liệu không hợp lệ",
                        errors = errors
                    });
                }

                var createdUser = await _adminService.CreateAccount(createAccountDto);

                return CreatedAtAction(nameof(CreateAccount), new
                {
                    success = true,
                    message = "Tạo tài khoản thành công",
                    data = new
                    {
                        userId = createdUser.UId,
                        email = createdUser.UEmail,
                        roleId = createdUser.RoleId,
                        status = createdUser.UStatus,
                        createDate = createdUser.UCreateDate,                        
                        roleInfo = (object?)(createdUser.RoleId switch
                        {
                            1 => createdUser.Admin,
                            2 => createdUser.Customer,
                            3 => createdUser.FieldOwner,
                            4 => createdUser.Staff,
                            _ => null
                        })
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = $"Lỗi server: {ex.Message}"
                });
            }
        }
    }
}
