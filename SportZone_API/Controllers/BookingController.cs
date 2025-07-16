using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SportZone_API.Models;
using SportZone_API.Services.Interfaces;
using SportZone_API.DTOs;

namespace SportZone_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        public BookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        /// <summary>
        /// Tạo booking mới
        /// </summary>
        /// 
        [HttpPost("CreateBooking")]
        public async Task<IActionResult> CreateBooking([FromBody] BookingCreateDTO bookingDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Thông tin booking không hợp lệ",
                        errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
                    });
                }

                var booking = await _bookingService.CreateBookingAsync(bookingDto);
                 
                return CreatedAtAction(nameof(GetBookingDetail), new { id = booking.BookingId }, new
                {
                    success = true,
                    message = "Tạo booking thành công",
                    data = booking
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = $"Lỗi server: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Lấy chi tiết booking theo ID
        /// </summary>
        [HttpGet("GetBookingById/{id}")]
        public async Task<IActionResult> GetBookingDetail(int id)
        {
            try
            {
                var booking = await _bookingService.GetBookingDetailAsync(id);
                if (booking == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy booking"
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Lấy chi tiết booking thành công",
                    data = booking
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = $"Lỗi server: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Hủy booking
        /// </summary>
        [HttpDelete("CancelBooking/{id}")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            try
            {
                var result = await _bookingService.CancelBookingAsync(id);
                if (!result)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy booking để hủy"
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Hủy booking thành công"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = $"Lỗi server: {ex.Message}"
                });
            }
        }
    }
}
