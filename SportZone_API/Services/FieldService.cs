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

        public async Task<Field> CreateFieldAsync(FieldCreateDTO fieldDto)
        {
            try
            {
                if (fieldDto == null)
                    throw new ArgumentNullException(nameof(fieldDto), "Thông tin sân không được để trống");
                if (string.IsNullOrWhiteSpace(fieldDto.FieldName))
                    throw new ArgumentException("Tên sân không được để trống", nameof(fieldDto.FieldName));
                if (fieldDto.Price <= 0)
                    throw new ArgumentException("Giá thuê sân phải lớn hơn 0", nameof(fieldDto.Price));
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
                    throw new ArgumentException("ID sân không hợp lệ", nameof(fieldId));
                if (fieldDto == null)
                    throw new ArgumentNullException(nameof(fieldDto), "Thông tin cập nhật sân không được để trống");
                if (fieldDto.Price.HasValue && fieldDto.Price <= 0)
                    throw new ArgumentException("Giá thuê sân phải lớn hơn 0", nameof(fieldDto.Price));
                if (!await _fieldRepository.FieldExistsAsync(fieldId))
                    throw new Exception("Sân không tồn tại");
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
