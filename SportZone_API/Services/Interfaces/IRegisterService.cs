using SportZone_API.DTOs;
using System.Threading.Tasks;

namespace SportZone_API.Services.Interfaces
{
    public interface IRegisterService
    {
        Task<ServiceResponse<string>> RegisterAsync(RegisterDto dto); 
        Task<ServiceResponse<string>> RegisterStaffAsync(RegisterStaffDto dto); 
    }
}