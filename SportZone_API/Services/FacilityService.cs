using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Services
{
    public class FacilityService
    {
        private readonly SportZoneContext _context;
        private readonly IMapper _mapper; 

        public FacilityService(SportZoneContext context, IMapper mapper) 
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<Facility>> GetAllFacilities()
        {
            return await _context.Facilities.ToListAsync();
        }

        public async Task<Facility?> GetFacilityById(int id)
        {
            return await _context.Facilities.FindAsync(id);
        }

        public async Task<ServiceResponse<Facility>> CreateFacility(FacilityDto dto)
        {
            var facility = _mapper.Map<Facility>(dto);
            _context.Facilities.Add(facility);
            await _context.SaveChangesAsync();
            return new ServiceResponse<Facility>
            {
                Success = true,
                Message = "Create facility successful.",
                Data = facility
            };
        }

        public async Task<ServiceResponse<Facility>> UpdateFacility(int id, FacilityDto dto)
        {
            var facility = await _context.Facilities.FindAsync(id);
            if (facility == null)
            {
                return new ServiceResponse<Facility>{Success = false, Message = "No found facility."};
            }

            _mapper.Map(dto, facility);
            await _context.SaveChangesAsync();
            return new ServiceResponse<Facility>
            {
                Success = true,
                Message = "Update facility successful.",
                Data = facility
            };
        }

        public async Task<ServiceResponse<Facility>> DeleteFacility(int id)
        {
            var facility = await _context.Facilities.FindAsync(id);
            if (facility == null)
            {
                return new ServiceResponse<Facility>{Success = false, Message = "No found facility."};
            }

            _context.Facilities.Remove(facility);
            await _context.SaveChangesAsync();
            return new ServiceResponse<Facility>{Success = true, Message = "Delete facility successful.",};
        }

        public async Task<List<Facility>> SearchFacilities(string text)
        {
            return await _context.Facilities
                .Where(f => (f.Address ?? "").Contains(text) ||
                            (f.Description ?? "").Contains(text) ||
                            (f.Subdescription ?? "").Contains(text))
                .ToListAsync();
        }
    }
}
