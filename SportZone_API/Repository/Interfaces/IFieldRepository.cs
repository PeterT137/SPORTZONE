using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Repository.Interfaces
{
    public interface IFieldRepository
    {
        Task<IEnumerable<FieldResponseDTO>> GetAllFieldsAsync();
        Task<FieldResponseDTO?> GetFieldByIdAsync(int fieldId);
        Task<IEnumerable<FieldResponseDTO>> GetFieldsByFacilityAsync(int facId);
        Task<IEnumerable<FieldResponseDTO>> GetFieldsByCategoryAsync(int categoryId);
        Task<Field> CreateFieldAsync(FieldCreateDTO fieldDto);
        Task<bool> UpdateFieldAsync(int fieldId, FieldUpdateDTO fieldDto);
        Task<bool> DeleteFieldAsync(int fieldId);
        Task<bool> FieldExistsAsync(int fieldId);
        Task<bool> FacilityExistsAsync(int facId);
        Task<bool> CategoryExistsAsync(int categoryId);
    }
}
