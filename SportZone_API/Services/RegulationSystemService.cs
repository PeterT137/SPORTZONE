using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services.Interfaces;

namespace SportZone_API.Services
{
    public class RegulationSystemService : IRegulationSystemService
    {
        private readonly IRegulationSystemRepository _repository;
        private readonly IMapper _mapper;

        public RegulationSystemService(IRegulationSystemRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<RegulationSystem>> GetAllRegulationSystems()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<RegulationSystem?> GetRegulationSystemById(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<ServiceResponse<RegulationSystem>> CreateRegulationSystem(RegulationSystemDto dto)
        {
            var regulationSystem = _mapper.Map<RegulationSystem>(dto);
            await _repository.AddAsync(regulationSystem);
            await _repository.SaveChangesAsync();

            return new ServiceResponse<RegulationSystem>
            {
                Success = true,
                Message = "Tạo quy định hệ thống thành công.",
                Data = regulationSystem
            };
        }

        public async Task<ServiceResponse<RegulationSystem>> UpdateRegulationSystem(int id, RegulationSystemDto dto)
        {
            var regulationSystem = await _repository.GetByIdAsync(id);
            if (regulationSystem == null)
                return new ServiceResponse<RegulationSystem> { Success = false, Message = "Không tìm thấy quy định hệ thống." };

            _mapper.Map(dto, regulationSystem);
            await _repository.UpdateAsync(regulationSystem);
            await _repository.SaveChangesAsync();

            return new ServiceResponse<RegulationSystem>
            {
                Success = true,
                Message = "Cập nhật quy định hệ thống thành công.",
                Data = regulationSystem
            };
        }

        public async Task<ServiceResponse<RegulationSystem>> DeleteRegulationSystem(int id)
        {
            var regulationSystem = await _repository.GetByIdAsync(id);
            if (regulationSystem == null)
                return new ServiceResponse<RegulationSystem> { Success = false, Message = "Không tìm thấy quy định hệ thống." };

            await _repository.DeleteAsync(regulationSystem);
            await _repository.SaveChangesAsync();

            return new ServiceResponse<RegulationSystem>
            {
                Success = true,
                Message = "Xóa quy định hệ thống thành công.",
                Data = regulationSystem
            };
        }

        public async Task<List<RegulationSystem>> SearchRegulationSystems(string text)
        {
            return await _repository.SearchAsync(text);
        }
    }
}