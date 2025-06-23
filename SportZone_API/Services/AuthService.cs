using SportZone_API.Models;
using SportZone_API.Services.Interfaces;
using SportZone_API.Repository.Interfaces;
using SportZone_API.DTO;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

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

        public async Task<(string token, User user)> LoginAsync(LoginDTO loginDto)
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

                return (token, authenticatedUser);
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

                if (existingUser == null)
                {
                    // Auto-register new Google user
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
                        new Claim("Role", user.RoleId?.ToString() ?? "0")
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
    }
}