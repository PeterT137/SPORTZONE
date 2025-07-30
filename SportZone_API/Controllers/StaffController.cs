using Microsoft.AspNetCore.Mvc;
using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SportZone_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _staffService;

        public StaffController(IStaffService staffService)
        {
            _staffService = staffService;
        }

        [HttpGet("by-facility/{facilityId}")]
        public async Task<IActionResult> GetStaffByFacilityId(int facilityId)
        {
            var result = await _staffService.GetStaffByFacilityIdAsync(facilityId);
            if (result.Success)
            {
                if (result.Data != null && result.Data.Any())
                {
                    return Ok(result.Data);
                }
                return NotFound(new { message = result.Message });
            }
            return BadRequest(new { error = result.Message });
        }

        [HttpPut("{uId}")]
        public async Task<IActionResult> UpdateStaff(int uId, [FromBody] UpdateStaffDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _staffService.UpdateStaffAsync(uId, dto);
            if (result.Success)
            {
                return Ok(new { message = result.Message });
            }
            return BadRequest(new { error = result.Message });
        }

        [HttpDelete("{uId}")]
        public async Task<IActionResult> DeleteStaff(int uId)
        {
            var result = await _staffService.DeleteStaffAsync(uId);
            if (result.Success)
            {
                return Ok(new { message = result.Message });
            }
            return BadRequest(new { error = result.Message });
        }
    }
}