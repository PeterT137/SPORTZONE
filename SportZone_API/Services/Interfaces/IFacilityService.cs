using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Services.Interfaces
{
    public interface IFacilityService
    {
        Task<List<Facility>> GetAllFacilities();
        Task<Facility?> GetFacilityById(int id);
        Task<ServiceResponse<Facility>> CreateFacility(FacilityDto dto);
        Task<ServiceResponse<Facility>> UpdateFacility(int id, FacilityDto dto);
        Task<ServiceResponse<Facility>> DeleteFacility(int id);
        Task<List<Facility>> SearchFacilities(string text);
    }
}
