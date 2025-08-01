using SportZone_API.Models;
using SportZone_API.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SportZone_API.Repositories.Interfaces
{
    public interface IFieldBookingScheduleRepository
    {
        Task<IEnumerable<FieldBookingSchedule>> GetAllSchedulesAsync();
        Task<FieldBookingSchedule?> GetScheduleByIdAsync(int id);
        Task AddScheduleAsync(FieldBookingSchedule schedule);
        Task AddRangeSchedulesAsync(IEnumerable<FieldBookingSchedule> schedules);
        Task UpdateScheduleAsync(FieldBookingSchedule schedule);
        Task DeleteScheduleAsync(int id);
        Task<IEnumerable<FieldBookingSchedule>> GetSchedulesByFieldAndDateRangeAsync(int fieldId, DateOnly startDate, DateOnly endDate);
        Task<FieldBookingScheduleByDateDto> GetSchedulesByFacilityAndDateAsync(int facilityId, DateOnly date);
    }
}