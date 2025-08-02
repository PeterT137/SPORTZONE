using SportZone_API.Models;
using SportZone_API.Services.Interfaces;
using SportZone_API.DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using SportZone_API.Repositories.Interfaces;

namespace SportZone_API.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly IConfiguration _configuration;
        private readonly PasswordHasher<User> _passwordHasher;

        public AuthService(IAuthRepository authRepository, IConfiguration configuration)
        {
            _authRepository = authRepository;
            _configuration = configuration;
            _passwordHasher = new PasswordHasher<User>();
        }
        public enum UserRole
        {
            Customer = 1,
            FieldOwner = 2,
            Admin = 3,
            Staff = 4
        }
        public bool HasRole(User user, UserRole requiredRole)
        {
            if (user?.RoleId == null) return false;
            return user.RoleId == (int)requiredRole;
        }
        public bool IsAdmin(User user)
        {
            return HasRole(user, UserRole.Admin);
        }
        public bool IsCustomer(User user)
        {
            return HasRole(user, UserRole.Customer);
        }
        public bool IsFieldOwner(User user)
        {
            return HasRole(user, UserRole.FieldOwner);
        }
        public bool IsStaff(User user)
        {
            return HasRole(user, UserRole.Staff);
        }

        public async Task<(string token, User user, FacilityInfoLoginDTO? facilityInfo)> LoginAsync(LoginDTO loginDto)
        {
            try
            {
                // Input validation
                if (loginDto == null || string.IsNullOrEmpty(loginDto.UEmail) || string.IsNullOrEmpty(loginDto.UPassword))
                {
                    throw new ArgumentException("Email và password là bắt buộc");
                }

                User? authenticatedUser = null;

                // Check if this is a Google login
                if (loginDto.UPassword == "GoogleLogin")
                {
                    // For Google login, find user by email and IsExternalLogin = true
                    authenticatedUser = await _authRepository.GetUserByEmailAsync(loginDto.UEmail, isExternalLogin: true);
                }
                else
                {
                    // For normal login, find user by email
                    var user = await _authRepository.GetUserByEmailAsync(loginDto.UEmail, isExternalLogin: false);

                    if (user != null)
                    {
                        // Validate password
                        if (await ValidatePasswordAsync(user, loginDto.UPassword))
                        {
                            authenticatedUser = user;
                        }
                    }
                }

                if (authenticatedUser == null)
                {
                    throw new UnauthorizedAccessException("Email hoặc password không đúng");
                }

                // Generate JWT token
                var token = GenerateJwtToken(authenticatedUser);

                // Get facility information based on user role
                var facilityInfo = await GetUserFacilityInfoAsync(authenticatedUser);

                return (token, authenticatedUser, facilityInfo);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi đăng nhập: {ex.Message}", ex);
            }
        }

        public async Task<(string token, User user)> GoogleLoginAsync(GoogleLoginDTO googleLoginDto)
        {
            try
            {
                // Input validation
                if (googleLoginDto == null || string.IsNullOrEmpty(googleLoginDto.Email))
                {
                    throw new ArgumentException("Email là bắt buộc cho Google login");
                }

                // Check if user already exists with Google login
                var existingUser = await _authRepository.GetUserByEmailAsync(googleLoginDto.Email, isExternalLogin: true);
                var roleCustomer = await _authRepository.GetCustomerRoleIdByNameAsync();
                if (roleCustomer == null)
                {
                    throw new Exception("Không tìm thấy vai trò khách hàng");
                }
                if (existingUser == null)
                {
                    // Auto-register new Google user
                    existingUser = new User
                    {
                        UEmail = googleLoginDto.Email,
                        UPassword = "GoogleLogin",
                        RoleId = roleCustomer.RoleId,
                        UStatus = "Active",
                        UCreateDate = DateTime.UtcNow,
                        IsExternalLogin = true,
                        IsVerify = true
                    };

                    existingUser = await _authRepository.CreateUserAsync(existingUser);
                }

                // Handle External_Login record
                await HandleExternalLoginRecordAsync(existingUser.UId, googleLoginDto);

                // Generate JWT token
                var token = GenerateJwtToken(existingUser);

                return (token, existingUser);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi đăng nhập với Google: {ex.Message}", ex);
            }
        }

        public async Task<LogoutResponseDTO> LogoutAsync(LogoutDTO logoutDto)
        {
            try
            {
                // Input validation
                if (logoutDto == null || logoutDto.UId <= 0)
                {
                    throw new ArgumentException("User ID là bắt buộc");
                }

                // Verify user exists
                var user = await _authRepository.GetUserByIdAsync(logoutDto.UId);
                if (user == null)
                {
                    throw new ArgumentException("User không tồn tại");
                }

                var logoutTime = DateTime.UtcNow;

                // Invalidate current token if provided
                if (!string.IsNullOrEmpty(logoutDto.Token))
                {
                    await InvalidateTokenAsync(logoutDto.Token);
                }

                // Optional: Update last logout time in database
                // You can add a LastLogoutTime field to User model if needed
                // user.LastLogoutTime = logoutTime;
                // await _authRepository.UpdateUserAsync(user);

                // Optional: Log logout activity
                await LogLogoutActivityAsync(logoutDto.UId, logoutTime);

                return new LogoutResponseDTO
                {
                    Success = true,
                    Message = "Đăng xuất thành công",
                    LogoutTime = logoutTime,
                    UserId = logoutDto.UId
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi đăng xuất: {ex.Message}", ex);
            }
        }


        public string HashPassword(string plainPassword)
        {
            if (string.IsNullOrEmpty(plainPassword))
                throw new ArgumentException("Password không được để trống");

            var tempUser = new User();
            return _passwordHasher.HashPassword(tempUser, plainPassword);
        }

        public bool VerifyPassword(User user, string plainPassword, string hashedPassword)
        {
            if (string.IsNullOrEmpty(plainPassword) || string.IsNullOrEmpty(hashedPassword))
                return false;

            try
            {
                var result = _passwordHasher.VerifyHashedPassword(user, hashedPassword, plainPassword);
                return result == PasswordVerificationResult.Success || result == PasswordVerificationResult.SuccessRehashNeeded;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public string GenerateJwtToken(User user)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "your-256-bit-secret");

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, user.UId.ToString()),
                        new Claim(ClaimTypes.Email, user.UEmail ?? string.Empty),
                        new Claim("Role", user.RoleId?.ToString() ?? "0"),

                    }),
                    Expires = DateTime.UtcNow.AddDays(1),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };

                var token = tokenHandler.CreateToken(tokenDescriptor);
                return tokenHandler.WriteToken(token);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tạo JWT token: {ex.Message}", ex);
            }
        }

        // Private helper methods
        /// <summary>
        /// Lấy thông tin facility dựa trên role của user
        /// </summary>
        /// <param name="user">User đã authenticate</param>
        /// <returns>FacilityInfoLoginDTO hoặc null</returns>
        private async Task<FacilityInfoLoginDTO?> GetUserFacilityInfoAsync(User user)
        {
            try
            {
                if (IsStaff(user))
                {
                    // Staff được assign vào 1 facility cụ thể
                    var staff = await _authRepository.GetStaffByUserIdAsync(user.UId);
                    if (staff?.FacId != null)
                    {
                        return new FacilityInfoLoginDTO
                        {
                            FacId = staff.FacId,
                            FacilityName = staff.Fac?.Name
                        };
                    }
                }
                else if (IsFieldOwner(user))
                {
                    // FieldOwner có thể sở hữu nhiều facilities
                    var fieldOwner = await _authRepository.GetFieldOwnerByUserIdAsync(user.UId);
                    if (fieldOwner?.Facilities != null && fieldOwner.Facilities.Any())
                    {
                        var facilityList = fieldOwner.Facilities.Select(f => new FacilityBasicDTO
                        {
                            FacId = f.FacId,
                            Name = f.Name,
                            Address = f.Address,
                            Description = f.Description
                        }).ToList();

                        return new FacilityInfoLoginDTO
                        {
                            Facilities = facilityList
                        };
                    }
                }

                // Customer và Admin không cần facility info
                return null;
            }
            catch (Exception ex)
            {
                // Log error nhưng không throw để không ảnh hưởng đến login process
                Console.WriteLine($"Lỗi khi lấy facility info: {ex.Message}");
                return null;
            }
        }

        // Private helper methods
        private async Task<bool> ValidatePasswordAsync(User user, string plainPassword)
        {
            try
            {
                if (IsPasswordHashed(user.UPassword))
                {
                    // Password đã được hash, verify với Identity
                    if (VerifyPassword(user, plainPassword, user.UPassword))
                    {
                        // Kiểm tra có cần rehash không
                        var verifyResult = _passwordHasher.VerifyHashedPassword(user, user.UPassword, plainPassword);
                        if (verifyResult == PasswordVerificationResult.SuccessRehashNeeded)
                        {
                            // Cập nhật password với hash mới hơn
                            user.UPassword = HashPassword(plainPassword);
                            await _authRepository.UpdateUserAsync(user);
                        }
                        return true;
                    }
                }
                else
                {
                    // Password chưa hash (legacy data), so sánh trực tiếp và hash lại
                    if (user.UPassword == plainPassword)
                    {
                        // Hash password cho lần sau để bảo mật
                        user.UPassword = HashPassword(plainPassword);
                        await _authRepository.UpdateUserAsync(user);
                        return true;
                    }
                }
                return false;
            }
            catch (Exception)
            {
                return false;
            }
        }

        private bool IsPasswordHashed(string password)
        {
            if (string.IsNullOrEmpty(password))
                return false;

            // Identity password hash có định dạng đặc biệt và dài
            return password.Length >= 50 && !password.Contains(" ") &&
                   password.All(c => char.IsLetterOrDigit(c) || c == '+' || c == '/' || c == '=');
        }

        private async Task HandleExternalLoginRecordAsync(int userId, GoogleLoginDTO googleLoginDto)
        {
            try
            {
                var existingExternalLogin = await _authRepository.GetExternalLoginAsync(userId, "Google");

                if (existingExternalLogin == null)
                {
                    // Tạo record External_Login mới
                    var externalLogin = new ExternalLogin
                    {
                        UId = userId,
                        ExternalProvider = "Google",
                        ExternalUserId = googleLoginDto.GoogleUserId,
                        AccessToken = googleLoginDto.AccessToken
                    };

                    await _authRepository.CreateExternalLoginAsync(externalLogin);
                }
                else
                {
                    // Cập nhật record External_Login hiện có
                    existingExternalLogin.AccessToken = googleLoginDto.AccessToken;
                    existingExternalLogin.ExternalUserId = googleLoginDto.GoogleUserId;
                    await _authRepository.UpdateExternalLoginAsync(existingExternalLogin);
                }
            }
            catch (Exception ex)
            {
                // Log error nhưng không throw để không ảnh hưởng đến login process
                Console.WriteLine($"Lỗi khi xử lý External login: {ex.Message}");
            }
        }

        // Token Management Methods
        public async Task<bool> InvalidateTokenAsync(string token)
        {
            try
            {
                if (string.IsNullOrEmpty(token))
                    return false;

                // For JWT tokens, we can implement token blacklisting
                // This is a simplified implementation - in production, you might want to store blacklisted tokens in Redis or database

                // Extract token info
                var tokenHandler = new JwtSecurityTokenHandler();
                if (!tokenHandler.CanReadToken(token))
                    return false;

                var jwtToken = tokenHandler.ReadJwtToken(token);
                var userId = jwtToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userId))
                    return false;

                // Add to blacklist (in memory for now - consider Redis in production)
                await AddTokenToBlacklistAsync(token, jwtToken.ValidTo);

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error invalidating token: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> ValidateTokenAsync(string token)
        {
            try
            {
                if (string.IsNullOrEmpty(token))
                    return false;

                // Check if token is blacklisted
                if (await IsTokenBlacklistedAsync(token))
                    return false;

                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "your-256-bit-secret");

                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> InvalidateAllUserTokensAsync(int userId)
        {
            try
            {
                // In production, you might want to update a user's token version or similar mechanism
                // For now, we'll add a flag to the user or implement a different strategy

                // This is a placeholder - you could implement this by:
                // 1. Adding a TokenVersion field to User model
                // 2. Incrementing it on logout from all devices
                // 3. Validating token version in ValidateTokenAsync

                Console.WriteLine($"Invalidating all tokens for user {userId}");

                // For demonstration, let's just return true
                // In real implementation, you would:
                // - Get user from repository
                // - Update user's security stamp/token version
                // - Save changes

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error invalidating all tokens for user {userId}: {ex.Message}");
                return false;
            }
        }

        // Token Blacklist Management (In-Memory - Consider Redis for production)
        private static readonly HashSet<string> _blacklistedTokens = new HashSet<string>();
        private static readonly Dictionary<string, DateTime> _tokenExpirations = new Dictionary<string, DateTime>();

        private async Task AddTokenToBlacklistAsync(string token, DateTime expiration)
        {
            await Task.Run(() =>
            {
                lock (_blacklistedTokens)
                {
                    _blacklistedTokens.Add(token);
                    _tokenExpirations[token] = expiration;
                }
            });

            // Clean up expired tokens periodically
            await CleanupExpiredTokensAsync();
        }

        private async Task<bool> IsTokenBlacklistedAsync(string token)
        {
            return await Task.Run(() =>
            {
                lock (_blacklistedTokens)
                {
                    return _blacklistedTokens.Contains(token);
                }
            });
        }

        private async Task CleanupExpiredTokensAsync()
        {
            await Task.Run(() =>
            {
                lock (_blacklistedTokens)
                {
                    var now = DateTime.UtcNow;
                    var expiredTokens = _tokenExpirations
                        .Where(kvp => kvp.Value < now)
                        .Select(kvp => kvp.Key)
                        .ToList();

                    foreach (var expiredToken in expiredTokens)
                    {
                        _blacklistedTokens.Remove(expiredToken);
                        _tokenExpirations.Remove(expiredToken);
                    }
                }
            });
        }

        // Logout Activity Logging
        private async Task LogLogoutActivityAsync(int userId, DateTime logoutTime)
        {
            try
            {
                // This is a placeholder for logging logout activity
                // In production, you might want to:
                // 1. Create a UserActivity or AuditLog table
                // 2. Store logout activities for security monitoring

                Console.WriteLine($"User {userId} logged out at {logoutTime}");

                // You could implement this by adding to a logging system:
                // await _authRepository.LogUserActivityAsync(userId, "Logout", logoutTime);

                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error logging logout activity: {ex.Message}");
            }
        }
    }
}