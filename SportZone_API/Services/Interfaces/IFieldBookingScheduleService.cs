using SportZone_API.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SportZone_API.Services.Interfaces
{
    public interface IFieldBookingScheduleService
    {
        Task<IEnumerable<FieldBookingScheduleDto>> GetAllFieldBookingSchedulesAsync();
        Task<FieldBookingScheduleDto?> GetFieldBookingScheduleByIdAsync(int id);
        Task<ScheduleGenerationResponseDto> GenerateFieldBookingSchedulesAsync(FieldBookingScheduleGenerateDto generateDto);
        Task<ScheduleGenerationResponseDto> UpdateGeneratedFieldBookingSchedulesAsync(FieldBookingScheduleUpdateGenerateDto updateDto);
        Task<ScheduleGenerationResponseDto> DeleteGeneratedFieldBookingSchedulesAsync(FieldBookingScheduleDeleteGenerateDto deleteDto);
        Task<ServiceResponse<FieldBookingScheduleByDateDto>> GetSchedulesByFacilityAndDateAsync(int facilityId, DateOnly date);

    }
}