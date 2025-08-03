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

        //[HttpGet("{orderId}")]
        //public async Task<IActionResult> GetOrderDetails(int orderId)
        //{
        //    var response = await _orderService.GetOrderDetailsAsync(orderId);
        //    if (!response.Success)
        //    {
        //        return NotFound(response); 
        //    }
        //    return Ok(response);
        //}

        //[HttpPost("add-service")]
        //public async Task<IActionResult> AddServiceToOrder([FromBody] AddServiceToOrderDTO addServiceDto)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }
        //    var success = await _orderService.AddServiceToOrderAsync(addServiceDto);
        //    if (!success)
        //    {
        //        return BadRequest(new ServiceResponse<OrderDTO>
        //        {
        //            Success = false,
        //            Message = "Không thể thêm dịch vụ vào đơn hàng. Kiểm tra ID đơn hàng hoặc dịch vụ.",
        //            Data = null 
        //        });
        //    }
        //    var updatedOrderResponse = await _orderService.GetOrderDetailsAsync(addServiceDto.OrderId);
        //    if (!updatedOrderResponse.Success)
        //    {
        //        return StatusCode(StatusCodes.Status500InternalServerError, updatedOrderResponse);
        //    }
        //    return Ok(updatedOrderResponse);
        //}

        //[HttpDelete("remove-service")]
        //public async Task<IActionResult> RemoveServiceFromOrder([FromQuery] RemoveServiceFromOrderDTO removeServiceDto)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }
        //    var success = await _orderService.RemoveServiceFromOrderAsync(removeServiceDto);
        //    if (!success)
        //    {
        //        return NotFound(new ServiceResponse<OrderDTO> 
        //        {
        //            Success = false,
        //            Message = "Không thể xóa dịch vụ khỏi đơn hàng. Kiểm tra ID đơn hàng hoặc dịch vụ.",
        //            Data = null 
        //        });
        //    }
        //    var updatedOrderResponse = await _orderService.GetOrderDetailsAsync(removeServiceDto.OrderId);
        //    if (!updatedOrderResponse.Success)
        //    {
        //        return StatusCode(StatusCodes.Status500InternalServerError, updatedOrderResponse);
        //    }
        //    return Ok(updatedOrderResponse);
        //}
    }
}