using SportZone_API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using SportZone_API.DTOs;

namespace SportZone_API.Repositories.Interfaces
{
    public interface IFieldBookingScheduleRepository
    {
        Task<IEnumerable<FieldBookingSchedule>> GetAllSchedulesAsync();
        Task<FieldBookingSchedule?> GetScheduleByIdAsync(int id);
        Task AddRangeSchedulesAsync(IEnumerable<FieldBookingSchedule> schedules);
        Task UpdateScheduleAsync(FieldBookingSchedule schedule);
        Task<bool> DeleteScheduleAsync(int id);
        Task<IEnumerable<FieldBookingSchedule>> GetSchedulesByFieldAndDateRangeAsync(int fieldId, DateOnly startDate, DateOnly endDate);
        Task<IEnumerable<FieldBookingSchedule>> GetSchedulesByFieldIdAsync(int fieldId); 
        Task UpdateRangeSchedulesAsync(IEnumerable<FieldBookingSchedule> schedules);
        Task<FieldBookingScheduleByDateDto?> GetSchedulesByFacilityAndDateAsync(int facilityId, DateOnly date);
    }
}