using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SportZone_API.Models;
using Microsoft.EntityFrameworkCore;
using SportZone_API.Services.Interfaces;
using SportZone_API.DTO;

namespace SportZone_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticationController : ControllerBase
    {
        private readonly IAuthService _authService;
        public AuthenticationController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO user)
        {
            if (user == null || string.IsNullOrEmpty(user.UEmail) || string.IsNullOrEmpty(user.UPassword))
            {
                return BadRequest("Invalid user credentials.");
            }
            try
            {
                var (token, loggedInUser) = await _authService.Login(user);
                if (loggedInUser == null || string.IsNullOrEmpty(token))
                {
                    return Unauthorized("Invalid email or password.");
                }
                return Ok(new { token, user = loggedInUser });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("GoogleLogin")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDTO googleLoginDto)
        {
            if (googleLoginDto == null)
            {
                return BadRequest("GoogleLoginDTO is required.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (string.IsNullOrEmpty(googleLoginDto.Email))
            {
                return BadRequest("Email is required.");
            }
            try
            {
                var (token, loggedInUser) = await _authService.GoogleLogin(googleLoginDto);
                if (loggedInUser == null || string.IsNullOrEmpty(token))
                {
                    return Unauthorized($"Google login failed. User: {(loggedInUser == null ? "NULL" : loggedInUser.UId.ToString())}, Token: {(string.IsNullOrEmpty(token) ? "NULL" : "EXISTS")}");
                }
                return Ok(new { token, user = loggedInUser, message = "Google login successful" });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Internal server error: {ex.Message}");
            }
        }
    }
}