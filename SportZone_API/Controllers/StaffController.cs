using Microsoft.AspNetCore.Mvc;
using SportZone_API.Services.Interfaces;

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

        /// <summary>
        /// Lấy tất cả staff trong các cơ sở của một field owner
        /// </summary>
        /// <param name="fieldOwnerId">ID của field owner</param>
        /// <returns>Danh sách staff</returns>
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