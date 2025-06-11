using Microsoft.AspNetCore.Mvc;
using SportZone_API.DTOs;
using SportZone_API.Services;

namespace SportZone_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RegisterController : ControllerBase
    {
        private readonly RegisterService _registerService;

        public RegisterController(RegisterService registerService)
        {
            _registerService = registerService;
        }

        [HttpPost]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var result = await _registerService.RegisterAsync(dto);
            if (result.Success)
                return Ok(new { message = result.Message });
            else
                return BadRequest(new { error = result.Message });
        }
    }
}
