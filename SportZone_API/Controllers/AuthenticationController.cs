﻿using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SportZone_API.Models;
using Microsoft.EntityFrameworkCore;
using SportZone_API.Services.Interfaces;
using SportZone_API.DTOs;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Google;
using Newtonsoft.Json;

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
                    return Redirect("http://localhost:5173/auth/callback?error=XacThucThatBai");
                }

                var email = result.Principal.FindFirst(ClaimTypes.Email)?.Value;
                var name = result.Principal.FindFirst(ClaimTypes.Name)?.Value;
                var googleUserId = result.Principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var accessToken = result.Properties.GetTokenValue("access_token");

                var googleLoginDto = new GoogleLoginDTO
                {
                    Email = email,
                    GoogleUserId = googleUserId,
                    AccessToken = accessToken
                };

                var (token, loggedInUser) = await _authService.GoogleLoginAsync(googleLoginDto);

                // Serialize user thông tin nếu bạn cần gửi về frontend
                var userJson = Uri.EscapeDataString(JsonConvert.SerializeObject(loggedInUser));

                // Redirect về frontend cùng token và user
                var redirectUrl = $"http://localhost:5173/google-auth-callback?token={token}&user={userJson}";
                return Redirect(redirectUrl);
            }
            catch (Exception ex)
            {
                return Redirect($"http://localhost:5173/google-auth-callback?error={Uri.EscapeDataString(ex.Message)}");
            }
        }

    }
}