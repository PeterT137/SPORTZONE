using Microsoft.AspNetCore.Mvc;
using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SportZone_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FieldBookingScheduleController : ControllerBase
    {
        private readonly IFieldBookingScheduleService _scheduleService;

        public FieldBookingScheduleController(IFieldBookingScheduleService scheduleService)
        {
            _scheduleService = scheduleService;
        }

        // GET: api/FieldBookingSchedule
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FieldBookingScheduleDto>>> GetFieldBookingSchedules()
        {
            var schedules = await _scheduleService.GetAllFieldBookingSchedulesAsync();
            return Ok(schedules);
        }

        // GET: api/FieldBookingSchedule/5
        [HttpGet("{id}")]
        public async Task<ActionResult<FieldBookingScheduleDto>> GetFieldBookingSchedule(int id)
        {
            var schedule = await _scheduleService.GetFieldBookingScheduleByIdAsync(id);
            if (schedule == null)
            {
                return NotFound("Không tìm thấy lịch đặt sân.");
            }
            return Ok(schedule);
        }

        // POST: api/FieldBookingSchedule
        [HttpPost]
        public async Task<ActionResult<FieldBookingScheduleDto>> CreateFieldBookingSchedule(FieldBookingScheduleCreateDto createDto)
        {
            var createdSchedule = await _scheduleService.CreateFieldBookingScheduleAsync(createDto);
            return CreatedAtAction(nameof(GetFieldBookingSchedule), new { id = createdSchedule.ScheduleId }, createdSchedule);
        }

        // POST: api/FieldBookingSchedule/generate
        [HttpPost("generate")]
        public async Task<ActionResult<IEnumerable<FieldBookingScheduleDto>>> GenerateFieldBookingSchedules(FieldBookingScheduleGenerateDto generateDto)
        {
            var generatedSchedules = await _scheduleService.GenerateFieldBookingSchedulesAsync(generateDto);
            return Ok(generatedSchedules);
        }

        // PUT: api/FieldBookingSchedule/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFieldBookingSchedule(int id, FieldBookingScheduleUpdateDto updateDto)
        {
            var updatedSchedule = await _scheduleService.UpdateFieldBookingScheduleAsync(id, updateDto);
            if (updatedSchedule == null)
            {
                return NotFound("Không tìm thấy lịch đặt sân để cập nhật.");
            }
            return Ok(updatedSchedule);
        }

        // DELETE: api/FieldBookingSchedule/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFieldBookingSchedule(int id)
        {
            var result = await _scheduleService.DeleteFieldBookingScheduleAsync(id);
            if (!result)
            {
                return NotFound("Không tìm thấy lịch đặt sân để xóa.");
            }
            return NoContent(); 
        }

        // GET: api/FieldBookingSchedule/facility/{facilityId}/date/{date}
        [HttpGet("facility/{facilityId}/date/{date}")]
        public async Task<ActionResult<ServiceResponse<FieldBookingScheduleByDateDto>>> GetSchedulesByFacilityAndDate(int facilityId, DateOnly date)
        {
            if (facilityId <= 0)
            {
                return BadRequest("Facility ID phải lớn hơn 0");
            }

            var result = await _scheduleService.GetSchedulesByFacilityAndDateAsync(facilityId, date);
            
            if (result.Success)
            {
                return Ok(result);
            }
            
            return NotFound(result);
        }
    }
}