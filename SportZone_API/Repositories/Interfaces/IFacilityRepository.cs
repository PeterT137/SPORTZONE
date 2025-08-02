using SportZone_API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SportZone_API.Repositories.Interfaces
{
    public interface IFacilityRepository
    {
        Task<List<Facility>> GetAllAsync(string? searchText = null);
        Task<List<Facility>> GetByUserIdAsync(int userId);
        Task<Facility?> GetByIdAsync(int id);
        Task AddAsync(Facility facility);
        Task UpdateAsync(Facility facility);
        Task DeleteAsync(Facility facility);
        Task SaveChangesAsync();
        Task<IEnumerable<CategoryField>> GetCategoryFieldsByFacilityIdAsync(int facilityId);
        Task AddImagesAsync(IEnumerable<Image> images);
    }
}