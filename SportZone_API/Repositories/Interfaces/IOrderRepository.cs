using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Repositories.Interfaces
{
    public interface IOrderRepository
    {
        Task<Order?> GetOrderByIdAsync(int orderId);
        Task<bool> AddOrderServiceAsync(OrderService order_Service);
        Task<bool> RemoveOrderServiceAsync(int orderId, int serviceId);
        Task<List<OrderService>> GetOrderServicesByOrderIdAsync(int orderId);
        Task<Service?> GetServiceByIdAsync(int serviceId);
        Task<Booking?> GetBookingByIdAsync(int bookingId);
        Task<Discount?> GetActiveDiscountByBookingIdAsync(int bookingId);
        Task<Field?> GetFieldByIdAsync(int fieldId);

        Task<bool> UpdateOrderServiceAsync(OrderService order_Service);
        Task<bool> UpdateOrderTotalPriceAsync(int orderId, decimal? newTotalPrice, decimal? newTotalServicePrice);
    }
}