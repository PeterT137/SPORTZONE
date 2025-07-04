using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SportZone_API.Repositories
{
    public class FieldBookingScheduleRepository : IFieldBookingScheduleRepository
    {
        private readonly SportZoneContext _context; // Giả sử DbContext của bạn có tên là SportZoneContext

        public FieldBookingScheduleRepository(SportZoneContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<FieldBookingSchedule>> GetAllSchedulesAsync()
        {
            return await _context.FieldBookingSchedules.ToListAsync();
        }

        public async Task<FieldBookingSchedule?> GetScheduleByIdAsync(int id)
        {
            return await _context.FieldBookingSchedules.FindAsync(id);
        }

        public async Task AddScheduleAsync(FieldBookingSchedule schedule)
        {
            await _context.FieldBookingSchedules.AddAsync(schedule);
            await _context.SaveChangesAsync();
        }

        public async Task AddRangeSchedulesAsync(IEnumerable<FieldBookingSchedule> schedules)
        {
            await _context.FieldBookingSchedules.AddRangeAsync(schedules);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateScheduleAsync(FieldBookingSchedule schedule)
        {
            _context.FieldBookingSchedules.Update(schedule);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteScheduleAsync(int id)
        {
            var schedule = await _context.FieldBookingSchedules.FindAsync(id);
            if (schedule != null)
            {
                _context.FieldBookingSchedules.Remove(schedule);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<FieldBookingSchedule>> GetSchedulesByFieldAndDateRangeAsync(int fieldId, DateOnly startDate, DateOnly endDate)
        {
            return await _context.FieldBookingSchedules
                                 .Where(s => s.FieldId == fieldId && s.Date >= startDate && s.Date <= endDate)
                                 .ToListAsync();
        }
    }
}