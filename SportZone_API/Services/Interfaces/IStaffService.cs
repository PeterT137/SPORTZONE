using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Services.Interfaces
{
    public interface IStaffService
    {
        Task<ServiceResponse<List<Staff>>> GetStaffByFieldOwnerIdAsync(int fieldOwnerId);

    }
}