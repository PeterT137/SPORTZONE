using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Services.Interfaces;
using AutoMapper;
using Azure.Core.Pipeline;
using SportZone_API.Repositories.Interfaces;

namespace SportZone_API.Services
{
    public class FieldService : IFieldService
    {
        private readonly IFieldRepository _fieldRepository;
        private readonly IMapper _mapper;
        public FieldService(IFieldRepository fieldRepository, IMapper mapper)
        {
            _fieldRepository = fieldRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<FieldResponseDTO>> GetAllFieldsAsync()
        {
            try
            {
                return await _fieldRepository.GetAllFieldsAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi service khi lấy danh sách sân: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<FieldResponseDTO>> GetAllFieldsAsync(string? searchTerm)
        {
            try
            {
                return await _fieldRepository.GetAllFieldsAsync(searchTerm);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi service khi tìm kiếm sân: {ex.Message}", ex);
            }
        }

        public async Task<FieldResponseDTO> GetFieldByIdAsync(int fieldId)
        {
            try
            {
                if (fieldId <= 0)
                    throw new ArgumentException("ID sân phải lớn hơn 0", nameof(fieldId));

                return await _fieldRepository.GetFieldByIdAsync(fieldId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi service khi lấy sân với ID {fieldId}: {ex.Message}", ex);
            }
        }

        public async Task<Field?> GetFieldEntityByIdAsync(int fieldId)
        {
            try
            {
                if (fieldId <= 0)
                    throw new ArgumentException("ID sân phải lớn hơn 0", nameof(fieldId));
                return await _fieldRepository.GetFieldEntityByIdAsync(fieldId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi service khi lấy thực thể sân với ID {fieldId}: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<FieldResponseDTO>> GetFieldsByFacilityAsync(int facId)
        {
            try
            {
                if (facId <= 0)
                    throw new ArgumentException("ID cơ sở không hợp lệ");

                return await _fieldRepository.GetFieldsByFacilityAsync(facId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi service khi lấy danh sách sân theo cơ sở: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<FieldResponseDTO>> GetFieldsByCategoryAsync(int categoryId)
        {
            try
            {
                if (categoryId <= 0)
                    throw new ArgumentException("ID loại sân không hợp lệ");
                return await _fieldRepository.GetFieldsByCategoryAsync(categoryId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi service khi lấy danh sách sân theo loại: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<FieldResponseDTO>> GetFieldsByUserIdAsync(int userId)
        {
            try
            {
                if (userId <= 0)
                    throw new ArgumentException("ID người dùng không hợp lệ");

                return await _fieldRepository.GetFieldsByUserIdAsync(userId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi service khi lấy danh sách sân theo user: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<FieldScheduleDTO>> GetFieldScheduleByFieldIdAsync(int fieldId)
        {
            try
            {
                if (fieldId <= 0)
                    throw new ArgumentException("ID sân không hợp lệ");

                // Kiểm tra sân có tồn tại không
                if (!await _fieldRepository.FieldExistsAsync(fieldId))
                    throw new ArgumentException("Sân không tồn tại");

                return await _fieldRepository.GetFieldScheduleByFieldIdAsync(fieldId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi service khi lấy lịch sân: {ex.Message}", ex);
            }
        }

        public async Task<Field> CreateFieldAsync(FieldCreateDTO fieldDto)
        {
            try
            {
                if (fieldDto == null)
                    throw new ArgumentNullException(nameof(fieldDto), "Dữ liệu sân không được để trống");

                // Validate business rules
                if (string.IsNullOrWhiteSpace(fieldDto.FieldName))
                    throw new ArgumentException("Tên sân là bắt buộc");

                // Kiểm tra tên sân đã tồn tại trong cơ sở này chưa
                if (await _fieldRepository.FieldNameExistsInFacilityAsync(fieldDto.FieldName, fieldDto.FacId))
                    throw new ArgumentException($"Tên sân '{fieldDto.FieldName}' đã tồn tại trong cơ sở này");

                return await _fieldRepository.CreateFieldAsync(fieldDto);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi service khi tạo sân: {ex.Message}", ex);
            }
        }

        public async Task<bool> UpdateFieldAsync(int fieldId, FieldUpdateDTO fieldDto)
        {
            try
            {
                if (fieldId <= 0)
                    throw new ArgumentException("ID sân không hợp lệ");

                if (fieldDto == null)
                    throw new ArgumentNullException(nameof(fieldDto), "Dữ liệu cập nhật không được để trống");

                // Validate business rules
                // Note: Price validation removed as Price is now managed in separate Price table

                // Kiểm tra sân có tồn tại không
                if (!await _fieldRepository.FieldExistsAsync(fieldId))
                    throw new ArgumentException("Sân không tồn tại");

                // Kiểm tra tên sân có bị trùng không (nếu có thay đổi tên)
                if (!string.IsNullOrWhiteSpace(fieldDto.FieldName))
                {
                    var currentField = await _fieldRepository.GetFieldByIdAsync(fieldId);
                    if (currentField != null && currentField.FacId.HasValue)
                    {
                        // Kiểm tra có field nào khác trong cùng facility có tên này không
                        var existingFields = await _fieldRepository.GetFieldsByFacilityAsync(currentField.FacId.Value);
                        if (existingFields.Any(f => f.FieldId != fieldId && f.FieldName == fieldDto.FieldName))
                        {
                            throw new ArgumentException($"Tên sân '{fieldDto.FieldName}' đã tồn tại trong cơ sở này");
                        }
                    }
                }

                return await _fieldRepository.UpdateFieldAsync(fieldId, fieldDto);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi service khi cập nhật sân với ID {fieldId}: {ex.Message}", ex);
            }
        }

        public async Task<bool> DeleteFieldAsync(int fieldId)
        {
            try
            {
                if (fieldId <= 0)
                    throw new ArgumentException("ID sân không hợp lệ", nameof(fieldId));
                if (!await _fieldRepository.FieldExistsAsync(fieldId))
                    throw new Exception("Sân không tồn tại");
                return await _fieldRepository.DeleteFieldAsync(fieldId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi service khi xóa sân với ID {fieldId}: {ex.Message}", ex);
            }
        }
    }
}
