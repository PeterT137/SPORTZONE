using Microsoft.AspNetCore.Mvc;
using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;
using System.Threading.Tasks;

namespace SportZone_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RegisterController : ControllerBase
    {
        private readonly IRegisterService _registerService;

        public RegisterController(IRegisterService registerService)
        {
            _registerService = registerService;
        }

        [HttpPost]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (dto.RoleName != "Customer" && dto.RoleName != "Field_Owner")
            {
                return BadRequest(new { error = "Endpoint này chỉ hỗ trợ đăng ký Customer hoặc Field_Owner." });
            }

            if (dto.Dob.HasValue || dto.ImageFile != null || dto.FacId.HasValue || dto.StartTime.HasValue || dto.EndTime.HasValue)
            {
                return BadRequest(new { error = "Vai trò này không được phép nhập các thông tin của nhân viên." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _registerService.RegisterUserAsync(dto);
            if (result.Success)
                return Ok(new { message = result.Message });
            else
                return BadRequest(new { error = result.Message });
        }


        [HttpPost("staff")]
        public async Task<IActionResult> RegisterStaff([FromForm] RegisterDto dto)
        {
            if (dto.RoleName != "Staff")
            {
                return BadRequest(new { error = "Endpoint này chỉ hỗ trợ đăng ký Staff." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _registerService.RegisterUserAsync(dto);
            if (result.Success)
                return Ok(new { message = result.Message });
            else
                return BadRequest(new { error = result.Message });
        }
    }
}