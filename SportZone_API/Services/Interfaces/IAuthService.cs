using System.Threading.Tasks;
using System.Collections.Generic;
using SportZone_API.Models;
using SportZone_API.DTOs;

namespace SportZone_API.Services.Interfaces
{
    public interface IAuthService
    {
        // Business logic methods
        Task<(string token, User user)> LoginAsync(LoginDTO loginDto);
        Task<(string token, User user)> GoogleLoginAsync(GoogleLoginDTO googleLoginDto);

        // Password helper methods
        string HashPassword(string plainPassword);
        bool VerifyPassword(User user, string plainPassword, string hashedPassword);

        // JWT token methods  
        string GenerateJwtToken(User user);
    }
}