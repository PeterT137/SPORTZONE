using SportZone_API.Models;

namespace SportZone_API.Repositories.Interfaces
{
    public interface IStaffRepository
    {
        Task<List<Staff>> GetStaffByFieldOwnerIdAsync(int fieldOwnerId);

    }
}