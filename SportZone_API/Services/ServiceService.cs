using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Helpers;
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
        private readonly IWebHostEnvironment _env; 

        public ServiceService(IServiceRepository serviceRepository, IMapper mapper, IWebHostEnvironment env)
        {
            _serviceRepository = serviceRepository;
            _mapper = mapper;
            _env = env;
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
            if (!await _serviceRepository.FacilityExistsAsync(createServiceDto.FacId))
                throw new ArgumentException("Facility không tồn tại");

            ValidateServiceData(createServiceDto.ServiceName, createServiceDto.Price, createServiceDto.Status);

            var service = _mapper.Map<Service>(createServiceDto);

            // Xử lý upload file ảnh
            if (createServiceDto.ImageFile != null)
            {
                const string subFolderName = "ServiceImages";
                var (isValid, errorMessage) = ImageUpload.ValidateImage(createServiceDto.ImageFile);
                if (!isValid)
                {
                    // Xóa file đã upload thành công nếu có lỗi
                    throw new ArgumentException(errorMessage);
                }
                var imageUrl = await ImageUpload.SaveImageAsync(createServiceDto.ImageFile, _env.WebRootPath, subFolderName);
                if (imageUrl == null)
                {
                    throw new InvalidOperationException("Lỗi khi lưu file ảnh.");
                }
                service.Image = imageUrl;
            }

            try
            {
                var createdService = await _serviceRepository.CreateServiceAsync(service);
                return _mapper.Map<ServiceResponseDTO>(createdService);
            }
            catch (Exception ex)
            {
                // Nếu có lỗi khi lưu vào DB, hãy xóa file đã upload
                if (!string.IsNullOrEmpty(service.Image))
                {
                    ImageUpload.DeleteImage(service.Image, _env.WebRootPath);
                }
                throw new InvalidOperationException($"Lỗi khi tạo dịch vụ: {ex.Message}", ex);
            }
        }

        public async Task<ServiceResponseDTO?> UpdateServiceAsync(int serviceId, UpdateServiceDTO updateServiceDTO)
        {
            var existingService = await _serviceRepository.GetServiceByIdAsync(serviceId);
            if (existingService == null)
                return null;

            if (updateServiceDTO.FacId.HasValue &&
                !await _serviceRepository.FacilityExistsAsync(updateServiceDTO.FacId.Value))
            {
                throw new ArgumentException("Facility không tồn tại");
            }

            // Xử lý cập nhật file ảnh
            if (updateServiceDTO.ImageFile != null)
            {
                const string subFolderName = "ServiceImages";
                var (isValid, errorMessage) = ImageUpload.ValidateImage(updateServiceDTO.ImageFile);
                if (!isValid)
                {
                    throw new ArgumentException(errorMessage);
                }

                var newImageUrl = await ImageUpload.SaveImageAsync(updateServiceDTO.ImageFile, _env.WebRootPath, subFolderName);
                if (newImageUrl == null)
                {
                    throw new InvalidOperationException("Lỗi khi lưu file ảnh mới.");
                }

                // Xóa ảnh cũ nếu có và cập nhật URL ảnh mới
                if (!string.IsNullOrEmpty(existingService.Image))
                {
                    ImageUpload.DeleteImage(existingService.Image, _env.WebRootPath);
                }
                existingService.Image = newImageUrl;
            }
            else if (updateServiceDTO.RemoveImage && updateServiceDTO.ImageFile == null)
            {
                if (!string.IsNullOrEmpty(existingService.Image))
                {
                    ImageUpload.DeleteImage(existingService.Image, _env.WebRootPath);
                    existingService.Image = null; 
                }
            }

            // Validate dữ liệu
            ValidateServiceData(
                updateServiceDTO.ServiceName ?? existingService.ServiceName,
                updateServiceDTO.Price ?? existingService.Price ?? 0,
                updateServiceDTO.Status ?? existingService.Status
            );

            // Map các trường còn lại, bỏ qua trường ảnh đã xử lý ở trên
            _mapper.Map(updateServiceDTO, existingService);

            try
            {
                var updatedService = await _serviceRepository.UpdateServiceAsync(existingService);
                return _mapper.Map<ServiceResponseDTO>(updatedService);
            }
            catch (Exception ex)
            {
                // Nếu có lỗi khi lưu vào DB, hãy xóa ảnh mới đã upload (nếu có)
                if (updateServiceDTO.ImageFile != null)
                {
                    ImageUpload.DeleteImage(existingService.Image!, _env.WebRootPath);
                }
                throw new InvalidOperationException($"Lỗi khi cập nhật dịch vụ: {ex.Message}", ex);
            }
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
