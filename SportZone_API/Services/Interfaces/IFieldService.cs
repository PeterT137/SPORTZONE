using SportZone_API.DTO;
using SportZone_API.Models;

namespace SportZone_API.Services.Interfaces
{
    public interface IFieldService
    {
        Task<IEnumerable<FieldResponseDTO>> GetAllFieldsAsync();
        Task<FieldResponseDTO?> GetFieldByIdAsync(int fieldId);
        Task<IEnumerable<FieldResponseDTO>> GetFieldsByFacilityAsync(int facId);
        Task<IEnumerable<FieldResponseDTO>> GetFieldsByCategoryAsync(int categoryId);
        Task<Field> CreateFieldAsync(FieldCreateDTO fieldDto);
        Task<bool> UpdateFieldAsync(int fieldId, FieldUpdateDTO fieldDto);
        Task<bool> DeleteFieldAsync(int fieldId);
    }
}
