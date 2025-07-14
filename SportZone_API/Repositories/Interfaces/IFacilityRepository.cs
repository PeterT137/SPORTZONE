using SportZone_API.Models;

namespace SportZone_API.Repositories.Interfaces
{
    public interface IFacilityRepository
    {
        Task<List<Facility>> GetAllAsync();
        Task<Facility?> GetByIdAsync(int id);
        Task AddAsync(Facility facility);
        Task UpdateAsync(Facility facility);
        Task DeleteAsync(Facility facility);
        Task<List<Facility>> SearchAsync(string text);
        Task SaveChangesAsync();
    }
}
