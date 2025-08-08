using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;
using Swashbuckle.AspNetCore.Annotations;

namespace SportZone_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        // GET: api/Booking/check-pending/{bookingId}
        [HttpGet("check-pending/{bookingId}")]
        [SwaggerOperation(Summary = "Kiểm tra trạng thái booking pending", Description = "Kiểm tra xem booking có đang ở trạng thái pending không")]
        public async Task<IActionResult> CheckPendingBooking(int bookingId)
        {
            try
            {
                var booking = await _bookingService.GetBookingDetailAsync(bookingId);
                if (booking == null)
                {
                    return NotFound(new { error = "Không tìm thấy booking" });
                }

                var isPending = booking.StatusPayment == "Pending";
                return Ok(new
                {
                    bookingId = bookingId,
                    isPending = isPending,
                    statusPayment = booking.StatusPayment,
                    message = isPending ? "Booking đang chờ thanh toán" : "Booking đã được xử lý"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // GET: api/Booking/debug-pending
        [HttpGet("debug-pending")]
        [SwaggerOperation(Summary = "Debug pending bookings", Description = "Lấy danh sách pending bookings để debug")]
        public async Task<IActionResult> DebugPendingBookings()
        {
            try
            {
                var pendingBookings = await _bookingService.GetPendingBookingsAsync();
                return Ok(new
                {
                    count = pendingBookings.Count,
                    pendingBookings = pendingBookings.Select(p => new
                    {
                        orderId = p.OrderId,
                        bookingId = p.BookingId,
                        createdAt = p.CreatedAt,
                        expiresAt = p.ExpiresAt,
                        isExpired = p.ExpiresAt <= DateTime.Now
                    })
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
