using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;

namespace SportZone_API.Repositories
{
    public class StaffRepository : IStaffRepository
    {
        private readonly SportZoneContext _context;

        public StaffRepository(SportZoneContext context)
        {
            _context = context;
        }

        public async Task<List<Staff>> GetStaffByFieldOwnerIdAsync(int fieldOwnerId)
        {
            try
            {             
                var staff = await _context.Staff
                    .Include(s => s.Fac) 
                    .Include(s => s.UIdNavigation) 
                    .Where(s => s.Fac != null && s.Fac.UId == fieldOwnerId)
                    .ToListAsync();

                return staff;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy danh sách staff của field owner: {ex.Message}", ex);
            }
        }
      
    }
}