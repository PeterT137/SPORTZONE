using SportZone_API.DTO;
using SportZone_API.Models;

namespace SportZone_API.Repository.Interfaces
{
    public interface IAuthRepository
    {
        Task<(string token, User user)> Login(LoginDTO user);
        Task<(string token, User user)> GoogleLogin(GoogleLoginDTO googleLoginDto);
        string CreateHashedPassword(string plainPassword);
    }
}