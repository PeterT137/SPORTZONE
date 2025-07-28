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
            return await _context.Facilities
                                 .Include(f => f.Images) 
                                 .ToListAsync();
        }

        public async Task<Facility?> GetByIdAsync(int id)
        {
            return await _context.Facilities
                                 .Include(f => f.Images)
                                 .FirstOrDefaultAsync(f => f.FacId == id); 
        }

        public async Task AddAsync(Facility facility)
        {
            await _context.Facilities.AddAsync(facility);
        }

        public async Task UpdateAsync(Facility facility)
        {
            var existingFacility = await _context.Facilities
                                                 .Include(f => f.Images)
                                                 .AsNoTracking() 
                                                 .FirstOrDefaultAsync(f => f.FacId == facility.FacId);
            if (existingFacility != null)
            {
                foreach (var existingImage in existingFacility.Images)
                {
                    if (!facility.Images.Any(i => i.ImgId == existingImage.ImgId))
                    {
                        _context.Images.Remove(existingImage);
                    }
                }
                foreach (var newImage in facility.Images)
                {
                    if (newImage.ImgId == 0) 
                    {
                        _context.Images.Add(newImage);
                    }
                }
                _context.Entry(facility).State = EntityState.Modified;
            }
        }

        public async Task DeleteAsync(Facility facility)
        {
            _context.Facilities.Remove(facility);
        }

        public async Task<List<Facility>> SearchAsync(string text)
        {
            return await _context.Facilities
                                 .Include(f => f.Images)
                                 .Where(f => (f.Name ?? "").Contains(text) ||
                                             (f.Address ?? "").Contains(text) ||
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