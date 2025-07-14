using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services.Interfaces;

namespace SportZone_API.Services
{
    public class FacilityService : IFacilityService
    {
        private readonly IFacilityRepository _repository;
        private readonly IMapper _mapper;

        public FacilityService(IFacilityRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<Facility>> GetAllFacilities()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<Facility?> GetFacilityById(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<ServiceResponse<Facility>> CreateFacility(FacilityDto dto)
        {
            var facility = _mapper.Map<Facility>(dto);
            await _repository.AddAsync(facility);
            await _repository.SaveChangesAsync();

            return new ServiceResponse<Facility>
            {
                Success = true,
                Message = "Create facility successful.",
                Data = facility
            };
        }

        public async Task<ServiceResponse<Facility>> UpdateFacility(int id, FacilityDto dto)
        {
            var facility = await _repository.GetByIdAsync(id);
            if (facility == null)
                return new ServiceResponse<Facility> { Success = false, Message = "Facility not found." };

            _mapper.Map(dto, facility);
            await _repository.UpdateAsync(facility);
            await _repository.SaveChangesAsync();

            return new ServiceResponse<Facility>
            {
                Success = true,
                Message = "Update facility successful.",
                Data = facility
            };
        }

        public async Task<ServiceResponse<Facility>> DeleteFacility(int id)
        {
            var facility = await _repository.GetByIdAsync(id);
            if (facility == null)
                return new ServiceResponse<Facility> { Success = false, Message = "Facility not found." };

            await _repository.DeleteAsync(facility);
            await _repository.SaveChangesAsync();

            return new ServiceResponse<Facility>
            {
                Success = true,
                Message = "Delete facility successful."
            };
        }

        public async Task<List<Facility>> SearchFacilities(string text)
        {
            return await _repository.SearchAsync(text);
        }
    }
}
