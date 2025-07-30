using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services.Interfaces;

namespace SportZone_API.Services
{
    public class RegulationFacilityService : IRegulationFacilityService
    {
        private readonly IRegulationFacilityRepository _repository;
        private readonly IMapper _mapper;

        public RegulationFacilityService(IRegulationFacilityRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<RegulationFacility>> GetAllRegulationFacilities()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<RegulationFacility?> GetRegulationFacilityById(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<List<RegulationFacility>> GetRegulationFacilitiesByFacilityId(int facId)
        {
            return await _repository.GetByFacilityIdAsync(facId);
        }

        public async Task<ServiceResponse<RegulationFacility>> CreateRegulationFacility(RegulationFacilityDto dto)
        {
            var regulationFacility = _mapper.Map<RegulationFacility>(dto);
            await _repository.AddAsync(regulationFacility);
            await _repository.SaveChangesAsync();

            return new ServiceResponse<RegulationFacility>
            {
                Success = true,
                Message = "Tạo quy định cơ sở thành công.",
                Data = regulationFacility
            };
        }

        public async Task<ServiceResponse<RegulationFacility>> UpdateRegulationFacility(int id, RegulationFacilityDto dto)
        {
            var regulationFacility = await _repository.GetByIdAsync(id);
            if (regulationFacility == null)
                return new ServiceResponse<RegulationFacility> { Success = false, Message = "Không tìm thấy quy định cơ sở." };

            _mapper.Map(dto, regulationFacility);
            await _repository.UpdateAsync(regulationFacility);
            await _repository.SaveChangesAsync();

            return new ServiceResponse<RegulationFacility>
            {
                Success = true,
                Message = "Cập nhật quy định cơ sở thành công.",
                Data = regulationFacility
            };
        }

        public async Task<ServiceResponse<RegulationFacility>> DeleteRegulationFacility(int id)
        {
            var regulationFacility = await _repository.GetByIdAsync(id);
            if (regulationFacility == null)
                return new ServiceResponse<RegulationFacility> { Success = false, Message = "Không tìm thấy quy định cơ sở." };

            await _repository.DeleteAsync(regulationFacility);
            await _repository.SaveChangesAsync();

            return new ServiceResponse<RegulationFacility>
            {
                Success = true,
                Message = "Xóa quy định cơ sở thành công.",
                Data = regulationFacility
            };
        }

        public async Task<List<RegulationFacility>> SearchRegulationFacilities(string text)
        {
            return await _repository.SearchAsync(text);
        }
    }
}