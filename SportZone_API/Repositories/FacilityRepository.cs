using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;

namespace SportZone_API.Repositories
{
    public class FacilityRepository : IFacilityRepository
    {
        private readonly SportZoneContext _context;

        public FacilityRepository(SportZoneContext context)
        {
            _context = context;
        }

        public async Task<List<Facility>> GetAllAsync()
        {
            return await _context.Facilities.ToListAsync();
        }

        public async Task<Facility?> GetByIdAsync(int id)
        {
            return await _context.Facilities.FindAsync(id);
        }

        public async Task AddAsync(Facility facility)
        {
            await _context.Facilities.AddAsync(facility);
        }

        public async Task UpdateAsync(Facility facility)
        {
            _context.Facilities.Update(facility);
        }

        public async Task DeleteAsync(Facility facility)
        {
            _context.Facilities.Remove(facility);
        }

        public async Task<List<Facility>> SearchAsync(string text)
        {
            return await _context.Facilities
                .Where(f => (f.Address ?? "").Contains(text) ||
                            (f.Description ?? "").Contains(text) ||
                            (f.Subdescription ?? "").Contains(text))
                .ToListAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
