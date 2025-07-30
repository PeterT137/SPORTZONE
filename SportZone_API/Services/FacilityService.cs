using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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

        public async Task<ServiceResponse<List<FacilityDto>>> GetAllFacilities(string? searchText = null)
        {
            try
            {
                var facilities = await _repository.GetAllAsync(searchText);
                var facilityDtos = _mapper.Map<List<FacilityDto>>(facilities);

                if (facilityDtos == null || !facilityDtos.Any())
                {
                    return new ServiceResponse<List<FacilityDto>>
                    {
                        Success = true,
                        Message = "No facilities found.",
                        Data = new List<FacilityDto>()
                    };
                }

                return new ServiceResponse<List<FacilityDto>>
                {
                    Success = true,
                    Message = "Successfully retrieved facilities.",
                    Data = facilityDtos
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<List<FacilityDto>>
                {
                    Success = false,
                    Message = $"An error occurred while retrieving facilities: {ex.Message}",
                    Data = null
                };
            }
        }

        public async Task<FacilityDto?> GetFacilityById(int id)
        {
            var facility = await _repository.GetByIdAsync(id);
            return _mapper.Map<FacilityDto>(facility);
        }

        public async Task<ServiceResponse<FacilityDto>> CreateFacility(FacilityDto dto)
        {
            try
            {
                var facility = _mapper.Map<Facility>(dto);
                await _repository.AddAsync(facility);
                await _repository.SaveChangesAsync();
                var createdFacility = await _repository.GetByIdAsync(facility.FacId);

                return new ServiceResponse<FacilityDto>
                {
                    Success = true,
                    Message = "Create facility successful.",
                    Data = _mapper.Map<FacilityDto>(createdFacility)
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<FacilityDto>
                {
                    Success = false,
                    Message = $"An error occurred while creating the facility: {ex.Message}",
                    Data = null
                };
            }
        }

        public async Task<ServiceResponse<FacilityDto>> UpdateFacility(int id, FacilityDto dto)
        {
            try
            {
                var facility = await _repository.GetByIdAsync(id);
                if (facility == null)
                    return new ServiceResponse<FacilityDto> { Success = false, Message = "Facility not found." };

                _mapper.Map(dto, facility);
                await _repository.UpdateAsync(facility);
                await _repository.SaveChangesAsync();

                var updatedFacility = await _repository.GetByIdAsync(id);
                return new ServiceResponse<FacilityDto>
                {
                    Success = true,
                    Message = "Update facility successful.",
                    Data = _mapper.Map<FacilityDto>(updatedFacility)
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<FacilityDto>
                {
                    Success = false,
                    Message = $"An error occurred while updating the facility: {ex.Message}",
                    Data = null
                };
            }
        }

        public async Task<ServiceResponse<object>> DeleteFacility(int id)
        {
            try
            {
                var facility = await _repository.GetByIdAsync(id);
                if (facility == null)
                    return new ServiceResponse<object> { Success = false, Message = "Facility not found." };

                await _repository.DeleteAsync(facility);
                await _repository.SaveChangesAsync();

                return new ServiceResponse<object>
                {
                    Success = true,
                    Message = "Delete facility successful."
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<object>
                {
                    Success = false,
                    Message = $"An error occurred while deleting the facility: {ex.Message}"
                };
            }
        }

        public async Task<ServiceResponse<List<FacilityDto>>> GetFacilitiesByUserId(int userId)
        {
            try
            {
                var facilities = await _repository.GetByUserIdAsync(userId);
                var facilityDtos = _mapper.Map<List<FacilityDto>>(facilities);
                if (facilityDtos == null || !facilityDtos.Any())
                {
                    return new ServiceResponse<List<FacilityDto>>
                    {
                        Success = true,
                        Message = $"No facilities found for user ID {userId}.",
                        Data = new List<FacilityDto>()
                    };
                }

                return new ServiceResponse<List<FacilityDto>>
                {
                    Success = true,
                    Message = $"Successfully retrieved facilities for user ID {userId}.",
                    Data = facilityDtos
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<List<FacilityDto>>
                {
                    Success = false,
                    Message = $"An error occurred while retrieving facilities for user ID {userId}: {ex.Message}",
                    Data = null
                };
            }
        }
    }
}
