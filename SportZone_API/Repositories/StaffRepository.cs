using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SportZone_API.Repositories
{
    public class StaffRepository : IStaffRepository
    {
        private readonly SportZoneContext _context;

        public StaffRepository(SportZoneContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Staff>> GetStaffByFacilityIdAsync(int facilityId)
        {
            return await _context.Staff
                                 .Where(s => s.FacId == facilityId)
                                 .Include(s => s.UIdNavigation)
                                     .ThenInclude(u => u.Role)
                                 .Include(s => s.Fac)
                                 .ToListAsync();
        }

        public async Task UpdateStaffAsync(Staff staff)
        {
            _context.Staff.Update(staff);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteStaffAsync(Staff staff)
        {
            _context.Staff.Remove(staff);
            await _context.SaveChangesAsync();
        }
    }
}