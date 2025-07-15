using SportZone_API.DTOs;

namespace SportZone_API.Services.Interfaces
{
    public interface IRegisterService
    {
        Task<ServiceResponse<string>> RegisterAsync(RegisterDto dto);
    }
}