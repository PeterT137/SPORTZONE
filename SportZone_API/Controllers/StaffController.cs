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

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAllStaff()
        {
            var result = await _staffService.GetAllStaffAsync();
            if (result.Success)
            {
                if (result.Data != null && result.Data.Any())
                {
                    return Ok(new { success = true, message = result.Message, data = result.Data });
                }
                return NotFound(new { success = false, message = result.Message });
            }
            return BadRequest(new { success = false, error = result.Message });
        }

        [HttpGet("by-facility/{facilityId}")]
        public async Task<IActionResult> GetStaffByFacilityId(int facilityId)
        {
            var result = await _staffService.GetStaffByFacilityIdAsync(facilityId);
            if (result.Success)
            {
                if (result.Data != null && result.Data.Any())
                {
                    return Ok(new { success = true, message = result.Message, data = result.Data });
                }
                return NotFound(new { success = false, message = result.Message });
            }
            return BadRequest(new { success = false, error = result.Message });
        }

        [HttpGet("{uId}")]
        public async Task<IActionResult> GetStaffByUId(int uId)
        {
            var result = await _staffService.GetStaffByUIdAsync(uId);
            if (result.Success)
            {
                return Ok(new { success = true, message = result.Message, data = result.Data });
            }
            return NotFound(new { success = false, message = result.Message });
        }

        [HttpPut("{uId}")]
        public async Task<IActionResult> UpdateStaff(int uId, [FromBody] UpdateStaffDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ", errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
            }

            var result = await _staffService.UpdateStaffAsync(uId, dto);
            if (result.Success)
            {
                return Ok(new { success = true, message = result.Message });
            }
            return BadRequest(new { success = false, error = result.Message });
        }

        [HttpDelete("{uId}")]
        public async Task<IActionResult> DeleteStaff(int uId)
        {
            var result = await _staffService.DeleteStaffAsync(uId);
            if (result.Success)
            {
                return Ok(new { success = true, message = result.Message });
            }
            return BadRequest(new { success = false, error = result.Message });
        }

        [HttpGet("field-owner/{fieldOwnerId}")]
        public async Task<IActionResult> GetStaffByFieldOwnerId(int fieldOwnerId)
        {
            if (fieldOwnerId <= 0)
            {
                return BadRequest("Field Owner ID phải lớn hơn 0");
            }

            var result = await _staffService.GetStaffByFieldOwnerIdAsync(fieldOwnerId);
            
            if (result.Success)
            {
                return Ok(result);
            }
            
            return NotFound(result);
        }        
    }
}