using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;
using SportZone_API.DTOs;

namespace SportZone_API.Repositories
{
    public class FieldBookingScheduleRepository : IFieldBookingScheduleRepository
    {
        private readonly SportZoneContext _context;

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

        public async Task<bool> DeleteScheduleAsync(int id)
        {
            var schedule = await _context.FieldBookingSchedules.FindAsync(id);
            if (schedule == null)
            {
                return false;
            }
            _context.FieldBookingSchedules.Remove(schedule);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<FieldBookingSchedule>> GetSchedulesByFieldAndDateRangeAsync(int fieldId, DateOnly startDate, DateOnly endDate)
        {
            return await _context.FieldBookingSchedules
                                 .Where(s => s.FieldId == fieldId && s.Date >= startDate && s.Date <= endDate)
                                 .ToListAsync();
        }

        public async Task<IEnumerable<FieldBookingSchedule>> GetSchedulesByFieldIdAsync(int fieldId)
        {
            return await _context.FieldBookingSchedules
                                 .Where(s => s.FieldId == fieldId)
                                 .ToListAsync();
        }

        public async Task UpdateRangeSchedulesAsync(IEnumerable<FieldBookingSchedule> schedules)
        {
            _context.FieldBookingSchedules.UpdateRange(schedules);
            await _context.SaveChangesAsync();
        }

        public Task<FieldBookingScheduleByDateDto?> GetSchedulesByFacilityAndDateAsync(int facilityId, DateOnly date)
        {
            throw new NotImplementedException();
        }
    }
}