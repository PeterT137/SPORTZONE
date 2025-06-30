using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SportZone_API.Models;
using Microsoft.EntityFrameworkCore;
using SportZone_API.Services.Interfaces;
using SportZone_API.DTOs;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Google;

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
            try
            {
                var (token, loggedInUser) = await _authService.LoginAsync(user);
                return Ok(new
                {
                    success = true,
                    message = "Đăng nhập thành công",
                    token = token,
                    user = loggedInUser
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = ex.Message
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

        [HttpGet("googlelogin")]
        public IActionResult Login()
        {
            Console.WriteLine(">> Login() called");
            var redirectUrl = $"{Request.Scheme}://{Request.Host}/api/Authentication/google-response";
            var properties = new AuthenticationProperties
            {
                RedirectUri = redirectUrl
            };
            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }



        [HttpGet("google-response")]
        public async Task<IActionResult> GoogleResponse()
        {
            try
            {
                var result = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);

                if (!result.Succeeded)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Xác thực Google thất bại",
                        error = result.Failure?.Message
                    });
                }

                var email = result.Principal.FindFirst(ClaimTypes.Email)?.Value;
                var name = result.Principal.FindFirst(ClaimTypes.Name)?.Value;
                var googleUserId = result.Principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var accessToken = result.Properties.GetTokenValue("access_token");

                //Tạo GoogleLoginDTO từ thông tin Google
                var googleLoginDto = new GoogleLoginDTO
                {
                    Email = email,
                    GoogleUserId = googleUserId,
                    AccessToken = accessToken
                };

                // Gọi AuthService để xử lý đăng nhập Google và tạo token
                var (token, loggedInUser) = await _authService.GoogleLoginAsync(googleLoginDto);

                return Ok(new
                {
                    success = true,
                    message = "Đăng nhập Google thành công",
                    token = token,
                    user = loggedInUser
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
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

        [HttpPost("Logout")]
        public async Task<IActionResult> Logout([FromBody] LogoutDTO logoutDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Dữ liệu không hợp lệ",
                        errors = ModelState
                    });
                }

                var result = await _authService.LogoutAsync(logoutDto);

                if (result.Success)
                {
                    return Ok(new
                    {
                        success = true,
                        message = result.Message,
                        logoutTime = result.LogoutTime,
                        userId = result.UserId
                    });
                }
                else
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = result.Message
                    });
                }
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
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

        [HttpPost("ValidateToken")]
        public async Task<IActionResult> ValidateToken([FromBody] string token)
        {
            try
            {
                if (string.IsNullOrEmpty(token))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Token là bắt buộc"
                    });
                }

                var isValid = await _authService.ValidateTokenAsync(token);

                return Ok(new
                {
                    success = true,
                    isValid = isValid,
                    message = isValid ? "Token hợp lệ" : "Token không hợp lệ hoặc đã hết hạn"
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