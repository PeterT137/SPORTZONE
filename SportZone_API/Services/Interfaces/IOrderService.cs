using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Services.Interfaces
{
    public interface IOrderService
    {
        /// <summary>
        /// Tạo Order từ Booking data
        /// </summary>
        Task<OrderDTO> CreateOrderFromBookingAsync(Booking booking);

        /// <summary>
        /// Lấy Order theo ID
        /// </summary>
        Task<OrderDTO?> GetOrderByIdAsync(int orderId);

        /// <summary>
        /// Lấy Order theo BookingId
        /// </summary>
        Task<OrderDTO?> GetOrderByBookingIdAsync(int bookingId);
        //Task<ServiceResponse<OrderDTO>> GetOrderDetailsAsync(int orderId); 
        //Task<bool> AddServiceToOrderAsync(AddServiceToOrderDTO addServiceDto);
        //Task<bool> RemoveServiceFromOrderAsync(RemoveServiceFromOrderDTO removeServiceDto);
    }
}