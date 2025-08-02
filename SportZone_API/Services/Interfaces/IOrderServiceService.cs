using SportZone_API.Models;
using SportZone_API.DTOs;

namespace SportZone_API.Services.Interfaces
{
    public interface IOrderServiceService
    {
        /// <summary>
        /// Thêm service vào order
        /// </summary>
        Task<OrderServiceDTO> AddServiceToOrderAsync(OrderServiceCreateDTO orderServiceDto);

        /// <summary>
        /// Lấy thông tin OrderService theo ID
        /// </summary>
        Task<OrderServiceDTO?> GetOrderServiceByIdAsync(int orderServiceId);
    }
}
