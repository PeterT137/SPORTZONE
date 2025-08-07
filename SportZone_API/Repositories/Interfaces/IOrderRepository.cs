using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Repositories.Interfaces
{
    public interface IOrderRepository
    {
        /// <summary>
        /// Tạo Order từ Booking
        /// </summary>
        Task<Order> CreateOrderFromBookingAsync(OrderCreateDTO orderDto);
        /// <summary>
        /// Lấy Order theo BookingId
        /// </summary>
        Task<OrderDTO?> GetOrderByBookingIdAsync(int bookingId);

        Task<OrderDTO?> UpdateOrderContentPaymentAsync(int orderId, int option);
        Task<OrderDTO?> GetOrderByIdAsync(int orderId);

        /// <summary>
        /// Lấy tổng doanh thu của chủ sân
        /// </summary>
        Task<OwnerRevenueDTO> GetOwnerTotalRevenueAsync(int ownerId, DateTime? startDate = null, DateTime? endDate = null, int? facilityId = null);

        //Task<bool> AddOrderServiceAsync(OrderService order_Service);
        //Task<bool> RemoveOrderServiceAsync(int orderId, int serviceId);
        //Task<List<OrderService>> GetOrderServicesByOrderIdAsync(int orderId);
        //Task<Service?> GetServiceByIdAsync(int serviceId);
        //Task<Booking?> GetBookingByIdAsync(int bookingId);
        //Task<Discount?> GetActiveDiscountByBookingIdAsync(int bookingId);
        //Task<Field?> GetFieldByIdAsync(int fieldId);

        //Task<bool> UpdateOrderServiceAsync(OrderService order_Service);
        //Task<bool> UpdateOrderTotalPriceAsync(int orderId, decimal? newTotalPrice, decimal? newTotalServicePrice);
    }
}