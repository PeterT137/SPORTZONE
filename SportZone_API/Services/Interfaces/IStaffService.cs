using SportZone_API.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SportZone_API.Services.Interfaces
{
    public interface IStaffService
    {
        Task<ServiceResponse<IEnumerable<StaffDto>>> GetStaffByFacilityIdAsync(int facilityId);
        Task<ServiceResponse<string>> UpdateStaffAsync(int uId, UpdateStaffDto dto);
        Task<ServiceResponse<string>> DeleteStaffAsync(int uId);
    }
}