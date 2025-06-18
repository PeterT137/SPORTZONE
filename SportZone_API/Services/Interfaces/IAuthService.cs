using System.Threading.Tasks;
using System.Collections.Generic;
using SportZone_API.Models;
using SportZone_API.DTO;

namespace SportZone_API.Services.Interfaces
{
    public interface IAuthService
    {
        Task<(string token, User user)> Login(LoginDTO user);
        Task<(string token, User user)> GoogleLogin(GoogleLoginDTO googleLoginDto);
    }
}