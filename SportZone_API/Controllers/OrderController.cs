using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SportZone_API.Attributes;
using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;
using System.Threading.Tasks; 

namespace SportZone_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetOrderDetails(int orderId)
        {
            try
            {
                var response = await _orderService.GetOrderByIdAsync(orderId);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error retrieving order: {ex.Message}");
            }
        }

        [HttpPut("Order/{orderId}/Update/ContentPayment")]

        public async Task<IActionResult> UpdateOrderContentPayment(int orderId, int option)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Invalid data",
                        errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
                    });
                }
                var response = await _orderService.UpdateOrderContentPaymentAsync(orderId,option);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error updating order content payment: {ex.Message}");
            }
        }

        [HttpGet("Owner/{ownerId}/TotalRevenue")]
        public async Task<IActionResult> GetOwnerTotalRevenue(
            int ownerId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] int? facilityId = null)
        {
            try
            {
                var revenueData = await _orderService.GetOwnerTotalRevenueAsync(ownerId, startDate, endDate, facilityId);
                return Ok(new
                {
                    success = true,
                    message = "Lấy tổng doanh thu thành công",
                    data = revenueData
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
                    message = "Có lỗi xảy ra khi lấy tổng doanh thu",
                    error = ex.Message
                });
            }
        }
    }
}