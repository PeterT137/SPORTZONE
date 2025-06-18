using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using SportZone_API.Repository.Interfaces;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.HttpResults;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using SportZone_API.DTO;
using Microsoft.AspNetCore.Identity;

namespace SportZone_API.Repository
{
    public class AuthRepository : IAuthRepository
    {
        private readonly SportZoneContext _context;
        private readonly IConfiguration _configuration;
        private readonly PasswordHasher<User> _passwordHasher;

        public AuthRepository(SportZoneContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
            _passwordHasher = new PasswordHasher<User>();
        }

        /// <summary>
        /// Hash password sử dụng ASP.NET Core Identity
        /// </summary>
        private string HashPassword(User user, string password)
        {
            if (string.IsNullOrEmpty(password))
                throw new ArgumentException("Password không được để trống");

            return _passwordHasher.HashPassword(user, password);
        }

        /// <summary>
        /// Verify password với hash đã lưu sử dụng ASP.NET Core Identity
        /// </summary>
        private bool VerifyPassword(User user, string password, string hashedPassword)
        {
            if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(hashedPassword))
                return false;

            try
            {
                var result = _passwordHasher.VerifyHashedPassword(user, hashedPassword, password);
                return result == PasswordVerificationResult.Success || result == PasswordVerificationResult.SuccessRehashNeeded;
            }
            catch (Exception)
            {
                return false;
            }
        }

        /// <summary>
        /// Kiểm tra xem password có phải là hash không (Identity hash thường dài hơn 50 ký tự)
        /// </summary>
        private bool IsPasswordHashed(string password)
        {
            if (string.IsNullOrEmpty(password))
                return false;

            // Identity password hash thường có định dạng đặc biệt và dài
            // Ví dụ: AQAAAAEAACcQAAAAExxxxx... (Base64 encoded)
            return password.Length >= 50 && !password.Contains(" ") && password.All(c => char.IsLetterOrDigit(c) || c == '+' || c == '/' || c == '=');
        }

        public async Task<(string token, User user)> Login([FromBody] LoginDTO user)
        {
            try
            {
                if (user == null || string.IsNullOrEmpty(user.UEmail) || string.IsNullOrEmpty(user.UPassword))
                {
                    throw new ArgumentException("Invalid user credentials.");
                }
                User? existingUser = null;

                // Check if this is a Google login
                if (user.UPassword == "GoogleLogin")
                {
                    // For Google login, find user by email and IsExternalLogin = true
                    existingUser = await _context.Users
                        .FirstOrDefaultAsync(u => u.UEmail == user.UEmail && u.IsExternalLogin == true);
                }
                else
                {
                    // For normal login, tìm user theo email trước
                    var userByEmail = await _context.Users
                        .FirstOrDefaultAsync(u => u.UEmail == user.UEmail && u.IsExternalLogin != true);

                    if (userByEmail != null)
                    {
                        // Kiểm tra password
                        if (IsPasswordHashed(userByEmail.UPassword))
                        {
                            // Password trong DB đã được hash, verify với Identity
                            if (VerifyPassword(userByEmail, user.UPassword, userByEmail.UPassword))
                            {
                                existingUser = userByEmail;
                                
                                // Kiểm tra xem có cần rehash không (nếu thuật toán cũ)
                                var verifyResult = _passwordHasher.VerifyHashedPassword(userByEmail, userByEmail.UPassword, user.UPassword);
                                if (verifyResult == PasswordVerificationResult.SuccessRehashNeeded)
                                {
                                    // Cập nhật password với hash mới hơn
                                    userByEmail.UPassword = HashPassword(userByEmail, user.UPassword);
                                    _context.Users.Update(userByEmail);
                                    await _context.SaveChangesAsync();
                                }
                            }
                        }
                        else
                        {
                            // Password trong DB chưa hash (legacy data), so sánh trực tiếp
                            // và hash password trong DB để bảo mật cho lần sau
                            if (userByEmail.UPassword == user.UPassword)
                            {
                                existingUser = userByEmail;
                                
                                // Hash password trong DB để bảo mật cho lần sau  
                                userByEmail.UPassword = HashPassword(userByEmail, user.UPassword);
                                _context.Users.Update(userByEmail);
                                await _context.SaveChangesAsync();
                            }
                        }
                    }
                }

                if (existingUser == null)
                {
                    return (null, null);
                }

                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "your-256-bit-secret");
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, existingUser.UId.ToString()),
                        new Claim(ClaimTypes.Email, existingUser.UEmail ?? string.Empty),
                        new Claim("Role", existingUser.RoleId?.ToString() ?? "0")
                    }),
                    Expires = DateTime.UtcNow.AddDays(1),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };
                var token = tokenHandler.CreateToken(tokenDescriptor);
                return (tokenHandler.WriteToken(token), existingUser);
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while processing the login request.", ex);
            }
        }

        /// <summary>
        /// Method để hash password cho user mới hoặc đổi password
        /// </summary>
        public string CreateHashedPassword(string plainPassword)
        {
            if (string.IsNullOrEmpty(plainPassword))
                throw new ArgumentException("Password không được để trống");

            // Tạo user tạm thời để hash password
            var tempUser = new User();
            return HashPassword(tempUser, plainPassword);
        }

        public async Task<(string token, User user)> GoogleLogin([FromBody] GoogleLoginDTO googleLoginDto)
        {
            try
            {
                if (googleLoginDto == null || string.IsNullOrEmpty(googleLoginDto.Email))
                {
                    throw new ArgumentException("Email is required.");
                }

                // Check if user already exists with Google login
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.UEmail == googleLoginDto.Email && u.IsExternalLogin == true);

                if (existingUser == null)
                {
                    // Auto-register new Google user with default Customer role
                    // UId will be auto-generated by database
                    existingUser = new User
                    {
                        UEmail = googleLoginDto.Email,
                        UPassword = "GoogleLogin",
                        RoleId = 2, // Default to Customer role
                        UStatus = "Active",
                        UCreateDate = DateTime.UtcNow,
                        IsExternalLogin = true,
                        IsVerify = true
                    };

                    _context.Users.Add(existingUser);
                    await _context.SaveChangesAsync();
                }

                // Check if External_Login record already exists for this user and provider
                var existingExternalLogin = await _context.ExternalLogins
                    .FirstOrDefaultAsync(el => el.UId == existingUser.UId && el.ExternalProvider == "Google");

                if (existingExternalLogin == null)
                {
                    // Create new External_Login record
                    // Id will be auto-generated by database
                    var externalLogin = new ExternalLogin
                    {
                        UId = existingUser.UId,
                        ExternalProvider = "Google",
                        ExternalUserId = googleLoginDto.GoogleUserId,
                        AccessToken = googleLoginDto.AccessToken
                    };

                    _context.ExternalLogins.Add(externalLogin);

                    try
                    {
                        await _context.SaveChangesAsync();
                        Console.WriteLine($"External login saved successfully for user {existingUser.UId}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error saving External login: {ex.Message}");
                        // Don't throw here, continue with login process
                    }
                }
                else
                {
                    // Update existing External_Login record with new access token
                    existingExternalLogin.AccessToken = googleLoginDto.AccessToken;
                    existingExternalLogin.ExternalUserId = googleLoginDto.GoogleUserId;
                    _context.ExternalLogins.Update(existingExternalLogin);

                    try
                    {
                        await _context.SaveChangesAsync();
                        Console.WriteLine($"External login updated successfully for user {existingUser.UId}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error updating External login: {ex.Message}");
                        // Don't throw here, continue with login process
                    }
                }

                // Generate JWT token
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "your-256-bit-secret");
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, existingUser.UId.ToString()),
                        new Claim(ClaimTypes.Email, existingUser.UEmail ?? string.Empty),
                        new Claim("Role", existingUser.RoleId?.ToString() ?? "0")
                    }),
                    Expires = DateTime.UtcNow.AddDays(1),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };
                var token = tokenHandler.CreateToken(tokenDescriptor);
                return (tokenHandler.WriteToken(token), existingUser);
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while processing the Google login request.", ex);
            }
        }
    }
}