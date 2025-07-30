using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Services.Interfaces;
using SportZone_API.Attributes; 
using System.Linq; 

namespace SportZone_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FacilityController : ControllerBase
    {
        private readonly IFacilityService _facilityService;

        public FacilityController(IFacilityService facilityService)
        {
            _facilityService = facilityService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? searchText)
        {
            try
            {
                var result = await _facilityService.GetAllFacilities(searchText);

                if (result.Success)
                {
                    return Ok(result.Data ?? Enumerable.Empty<FacilityDto>());
                }
                return BadRequest(new { error = result.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "An unexpected error occurred while fetching facilities." });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await _facilityService.GetFacilityById(id);
                if (result == null)
                    return NotFound(new { message = $"Facility with ID {id} not found." });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "An unexpected error occurred while fetching the facility." });
            }
        }

        [HttpPost]
        [RoleAuthorize("2")]
        public async Task<IActionResult> Create([FromBody] FacilityDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var create = await _facilityService.CreateFacility(dto);
                if (create.Success)
                    return StatusCode(201, new { create.Message, create.Data });

                return BadRequest(new { create.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "An unexpected error occurred while creating the facility." });
            }
        }

        [HttpPut("{id}")]
        [RoleAuthorize("2")]
        public async Task<IActionResult> Update(int id, [FromBody] FacilityDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var update = await _facilityService.UpdateFacility(id, dto);
                if (update.Success)
                    return Ok(new { update.Message, update.Data });
                else
                {
                    return BadRequest(new { update.Message });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "An unexpected error occurred while updating the facility." });
            }
        }

        [HttpDelete("{id}")]
        [RoleAuthorize("2")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var delete = await _facilityService.DeleteFacility(id);
                if (delete.Success)
                    return Ok(new { delete.Message });
                else
                {
                    return BadRequest(new { delete.Message });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "An unexpected error occurred while deleting the facility." });
            }
        }

        [HttpGet("by-user/{userId}")] 
        [Authorize]
        public async Task<IActionResult> GetFacilitiesByUserId(int userId)
        {
            try
            {
                var result = await _facilityService.GetFacilitiesByUserId(userId);

                if (result.Success)
                {
                    return Ok(result.Data ?? Enumerable.Empty<FacilityDto>());
                }
                return BadRequest(new { error = result.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "An unexpected error occurred while fetching facilities by user ID." });
            }
        }
    }
}
