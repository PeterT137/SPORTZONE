using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Services;
using SportZone_API.Services.Interfaces;
using SportZone_API.Attributes;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

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

        // GET: api/Facility
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _facilityService.GetAllFacilities();
            return Ok(result);
        }

        // GET: api/Facility/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _facilityService.GetFacilityById(id);
            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPost]
        [RoleAuthorize("3")]
        public async Task<IActionResult> Create([FromBody] FacilityDto dto)
        {
            try
            {
                var create = await _facilityService.CreateFacility(dto);
                if (create.Success)
                    return Ok(new { create.Message, create.Data });

                return BadRequest(new { create.Message });
            }
            catch (Exception ex)
            {
                // log ra lỗi để biết chính xác
                Console.WriteLine("Error creating facility: " + ex.Message);
                return StatusCode(500, "Server error: " + ex.Message);
            }
        }


        // PUT: api/Facility/{id}
        [HttpPut("{id}")]
        [RoleAuthorize("3")]
        public async Task<IActionResult> Update(int id, [FromBody] FacilityDto dto)
        {
            var update = await _facilityService.UpdateFacility(id, dto);
            if (update.Success)
                return Ok(new { update.Message, update.Data });
            else
            {
                return BadRequest(new { update.Message });
            }
        }

        // DELETE: api/Facility/{id}
        [HttpDelete("{id}")]
        [RoleAuthorize("3")]
        public async Task<IActionResult> Delete(int id)
        {
            var delete = await _facilityService.DeleteFacility(id);
            if (delete.Success)
                return Ok(new { delete.Message });
            else
            {
                return BadRequest(new { delete.Message });
            }
        }

        // GET: api/Facility/search?text=abc
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string text)
        {
            var results = await _facilityService.SearchFacilities(text);
            return Ok(results);
        }
    }
}
