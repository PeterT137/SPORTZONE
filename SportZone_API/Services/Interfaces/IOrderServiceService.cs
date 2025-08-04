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

        /// <summary>
        /// Lấy tất cả services trong order
        /// </summary>
        Task<IEnumerable<OrderServiceDTO>> GetOrderServicesByOrderIdAsync(int orderId);

        /// <summary>
        /// Xóa service khỏi order
        /// </summary>
        Task<bool> RemoveServiceFromOrderAsync(int orderServiceId);
    }
}
