using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using System.Linq;
using System.Collections.Generic; 

namespace SportZone_API.Repositories
{
    public class FacilityRepository : IFacilityRepository
    {
        private readonly SportZoneContext _context;

        public FacilityRepository(SportZoneContext context)
        {
            _context = context;
        }

        public async Task<List<Facility>> GetAllAsync(string? searchText = null)
        {
            var query = _context.Facilities.Include(f => f.Images).AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchText))
            {
                query = query.Where(f => (f.Name ?? "").Contains(searchText) ||
                                         (f.Address ?? "").Contains(searchText) ||
                                         (f.Description ?? "").Contains(searchText) ||
                                         (f.Subdescription ?? "").Contains(searchText));
            }

            return await query.ToListAsync();
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
                    else
                    {
                        var entry = _context.Entry(newImage);
                        if (entry.State == EntityState.Detached)
                        {
                            _context.Images.Attach(newImage);
                            entry.State = EntityState.Modified;
                        }
                    }
                }
                _context.Entry(facility).State = EntityState.Modified;
            }
        }

        public async Task DeleteAsync(Facility facility)
        {
            _context.Facilities.Remove(facility);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<List<Facility>> GetByUserIdAsync(int userId)
        {
            return await _context.Facilities
                                 .Include(f => f.Images)
                                 .Where(f => f.UId == userId)
                                 .ToListAsync();
        }

        public async Task<IEnumerable<CategoryField>> GetCategoryFieldsByFacilityIdAsync(int facilityId)
        {
            return await _context.Fields
                                 .Where(f => f.FacId == facilityId && f.Category != null) 
                                 .Select(f => f.Category) 
                                 .Distinct()
                                 .ToListAsync();
        }
    }
}