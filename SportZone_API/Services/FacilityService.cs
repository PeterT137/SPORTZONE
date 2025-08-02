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
                        Message = "Không tìm thấy cơ sở nào.", 
                        Data = new List<FacilityDto>()
                    };
                }

                return new ServiceResponse<List<FacilityDto>>
                {
                    Success = true,
                    Message = "Lấy danh sách cơ sở thành công.", 
                    Data = facilityDtos
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<List<FacilityDto>>
                {
                    Success = false,
                    Message = $"Đã xảy ra lỗi khi lấy danh sách cơ sở: {ex.Message}", 
                    Data = null
                };
            }
        }

        public async Task<ServiceResponse<List<FacilityDetailDto>>> GetAllFacilitiesWithDetails(string? searchText = null)
        {
            try
            {
                var facilities = await _repository.GetAllWithDetailsAsync(searchText);
                var facilityDetailDtos = _mapper.Map<List<FacilityDetailDto>>(facilities);

                if (facilityDetailDtos == null || !facilityDetailDtos.Any())
                {
                    return new ServiceResponse<List<FacilityDetailDto>>
                    {
                        Success = true,
                        Message = "Không tìm thấy cơ sở nào.", 
                        Data = new List<FacilityDetailDto>()
                    };
                }

                return new ServiceResponse<List<FacilityDetailDto>>
                {
                    Success = true,
                    Message = "Lấy danh sách cơ sở chi tiết thành công.", 
                    Data = facilityDetailDtos
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<List<FacilityDetailDto>>
                {
                    Success = false,
                    Message = $"Đã xảy ra lỗi khi lấy danh sách cơ sở chi tiết: {ex.Message}", 
                    Data = null
                };
            }
        }

        public async Task<ServiceResponse<List<FacilityDetailDto>>> GetFacilitiesByFilter(string? categoryFieldName = null, string? address = null)
        {
            try
            {
                var facilities = await _repository.GetFacilitiesByFilterAsync(categoryFieldName, address);
                var facilityDetailDtos = _mapper.Map<List<FacilityDetailDto>>(facilities);

                if (facilityDetailDtos == null || !facilityDetailDtos.Any())
                {
                    return new ServiceResponse<List<FacilityDetailDto>>
                    {
                        Success = true,
                        Message = "Không tìm thấy cơ sở nào phù hợp với bộ lọc.", 
                        Data = new List<FacilityDetailDto>()
                    };
                }

                return new ServiceResponse<List<FacilityDetailDto>>
                {
                    Success = true,
                    Message = "Lấy danh sách cơ sở theo bộ lọc thành công.", 
                    Data = facilityDetailDtos
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<List<FacilityDetailDto>>
                {
                    Success = false,
                    Message = $"Đã xảy ra lỗi khi lấy danh sách cơ sở theo bộ lọc: {ex.Message}", 
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
                    Message = "Tạo cơ sở thành công.", 
                    Data = _mapper.Map<FacilityDto>(createdFacility)
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<FacilityDto>
                {
                    Success = false,
                    Message = $"Đã xảy ra lỗi khi tạo cơ sở: {ex.Message}", 
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
                    return new ServiceResponse<FacilityDto> { Success = false, Message = "Không tìm thấy cơ sở." }; 

                _mapper.Map(dto, facility);
                await _repository.UpdateAsync(facility);
                await _repository.SaveChangesAsync();

                var updatedFacility = await _repository.GetByIdAsync(id);
                return new ServiceResponse<FacilityDto>
                {
                    Success = true,
                    Message = "Cập nhật cơ sở thành công.", 
                    Data = _mapper.Map<FacilityDto>(updatedFacility)
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<FacilityDto>
                {
                    Success = false,
                    Message = $"Đã xảy ra lỗi khi cập nhật cơ sở: {ex.Message}", 
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
                    return new ServiceResponse<object> { Success = false, Message = "Không tìm thấy cơ sở." }; 

                await _repository.DeleteAsync(facility);
                await _repository.SaveChangesAsync();

                return new ServiceResponse<object>
                {
                    Success = true,
                    Message = "Xóa cơ sở thành công." 
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<object>
                {
                    Success = false,
                    Message = $"Đã xảy ra lỗi khi xóa cơ sở: {ex.Message}" 
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
                        Message = $"Không tìm thấy cơ sở nào cho người dùng có ID {userId}.", 
                        Data = new List<FacilityDto>()
                    };
                }

                return new ServiceResponse<List<FacilityDto>>
                {
                    Success = true,
                    Message = $"Lấy danh sách cơ sở cho người dùng có ID {userId} thành công.", 
                    Data = facilityDtos
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<List<FacilityDto>>
                {
                    Success = false,
                    Message = $"Đã xảy ra lỗi khi lấy danh sách cơ sở cho người dùng có ID {userId}: {ex.Message}", 
                    Data = null
                };
            }
        }

        public async Task<ServiceResponse<IEnumerable<string>>> GetCategoryFieldNamesByFacilityId(int facilityId)
        {
            var response = new ServiceResponse<IEnumerable<string>>();
            try
            {
                var categoryFields = await _repository.GetCategoryFieldsByFacilityIdAsync(facilityId);

                if (categoryFields == null || !categoryFields.Any())
                {
                    response.Success = false;
                    response.Message = $"Không tìm thấy loại sân nào cho cơ sở với ID {facilityId}.";
                    return response;
                }

                response.Data = categoryFields.Select(cf => cf.CategoryFieldName).ToList()!;
                response.Success = true;
                response.Message = $"Đã lấy tất cả tên loại sân cho cơ sở với ID {facilityId}.";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = "Đã xảy ra lỗi không mong muốn khi lấy tên loại sân theo cơ sở.";
            }
            return response;
        }
    }
}