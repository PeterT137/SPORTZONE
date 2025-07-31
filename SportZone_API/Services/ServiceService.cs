using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Repository.Interfaces;
using SportZone_API.Services.Interfaces;
using System.Runtime.InteropServices;

namespace SportZone_API.Services
{
    public class ServiceService : IServiceService
    {
        private readonly IServiceRepository _serviceRepository;
        private readonly IMapper _mapper;

        public ServiceService(IServiceRepository serviceRepository, IMapper mapper)
        {
            _serviceRepository = serviceRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ServiceDTO>> GetAllServicesAsync()
        {
            var services = await _serviceRepository.GetAllServicesAsync();
            return _mapper.Map<IEnumerable<ServiceDTO>>(services);
        }

        public async Task<ServiceResponseDTO?> GetServiceByIdAsync(int serviceId)
        {
            var service = await _serviceRepository.GetServiceByIdAsync(serviceId);
            if (service == null)
            {
                return null;
            }
            return _mapper.Map<ServiceResponseDTO>(service);
        }

        public async Task<IEnumerable<ServiceDTO>> GetServicesByFacilityIdAsync(int facilityId)
        {
            var services = await _serviceRepository.GetServicesByFacilityIdAsync(facilityId);
            return _mapper.Map<IEnumerable<ServiceDTO>>(services);
        }

        public async Task<IEnumerable<ServiceDTO>> GetServicesByStatusAsync(string status)
        {
            // Validate status
            if (!IsValidStatus(status))
                throw new ArgumentException("Status phải là 'Active' hoặc 'Inactive'");

            var services = await _serviceRepository.GetServicesByStatusAsync(status);
            return _mapper.Map<IEnumerable<ServiceDTO>>(services);
        }

        private static bool IsValidStatus(string? status)
        {
            return status == "Active" || status == "Inactive";
        }
        public async Task<ServiceResponseDTO> CreateServiceAsync(CreateServiceDTO createServiceDto)
        {
            // Validate facility exists
            if (!await _serviceRepository.FacilityExistsAsync(createServiceDto.FacId))
                throw new ArgumentException("Facility không tồn tại");

            // Validate business rules
            ValidateServiceData(createServiceDto.ServiceName, createServiceDto.Price, createServiceDto.Status);

            var service = _mapper.Map<Service>(createServiceDto);
            var createdService = await _serviceRepository.CreateServiceAsync(service);

            return _mapper.Map<ServiceResponseDTO>(createdService);
        }

        public async Task<ServiceResponseDTO> UpdateServiceAsync(int serviceId, UpdateServiceDTO updateServiceDTO)
        {
            var existingService = await _serviceRepository.GetServiceByIdAsync(serviceId);
            if (existingService == null)
                return null;

            if (updateServiceDTO.FacId.HasValue &&
                !await _serviceRepository.FacilityExistsAsync(updateServiceDTO.FacId.Value))
            {
                throw new ArgumentException("Facility không tồn tại");
            }

            if (!string.IsNullOrWhiteSpace(updateServiceDTO.ServiceName) ||
                updateServiceDTO.Price.HasValue ||
                !string.IsNullOrWhiteSpace(updateServiceDTO.Status))
            {
                ValidateServiceData(
                    updateServiceDTO.ServiceName ?? existingService.ServiceName,
                    updateServiceDTO.Price ?? existingService.Price ?? 0,
                    updateServiceDTO.Status ?? existingService.Status
                );
            }
            _mapper.Map(updateServiceDTO, existingService);

            var updatedService = await _serviceRepository.UpdateServiceAsync(existingService);
            return _mapper.Map<ServiceResponseDTO>(updatedService);
        }
        private static void ValidateServiceData(string? serviceName, decimal price, string? status)
        {
            if (string.IsNullOrWhiteSpace(serviceName))
                throw new ArgumentException("Tên dịch vụ không được để trống");

            if (price < 0)
                throw new ArgumentException("Giá dịch vụ phải lớn hơn hoặc bằng 0");

            if (!IsValidStatus(status))
                throw new ArgumentException("Status phải là 'Active' hoặc 'Inactive'");
        }

        public async Task<bool> DeleteServiceAsync(int serviceId)
        {
            var service = await _serviceRepository.GetServiceByIdAsync(serviceId);
            if (service == null)
            {
                return false; 
            }
            if (service.OrderServices.Any())
            {
                throw new InvalidOperationException("Không thể xóa dịch vụ vì đã có đơn hàng liên quan");
            }
            return await _serviceRepository.DeleteServiceAsync(serviceId);
        }

        public async Task<bool> ServiceExistsByIdAsync(int serviceId)
        {
            return await _serviceRepository.ServiceExistsByIdAsync(serviceId);
        }
        public async Task<int> GetTotalServicesCountAsync()
        {
            return await _serviceRepository.GetTotalServicesCountAsync();
        }

        public async Task<(IEnumerable<ServiceDTO> Services, int TotalCount)> GetServicesWithPaginationAsync(int pageNumber, int pageSize)
        {
            if (pageNumber <= 0 || pageSize <= 0)
                throw new ArgumentException("Page number và page size phải lớn hơn 0");

            var services = await _serviceRepository.GetServicesWithPaginationAsync(pageNumber, pageSize);
            var totalCount = await _serviceRepository.GetTotalServicesCountAsync();

            var servicesDtos = _mapper.Map<IEnumerable<ServiceDTO>>(services);

            return (servicesDtos, totalCount);
        }
    }
}
