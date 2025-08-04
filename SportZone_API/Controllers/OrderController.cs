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
            var response = await _orderService.GetOrderByIdAsync(orderId);
            return Ok(response);
        }
    }
}