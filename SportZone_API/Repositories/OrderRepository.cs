using Microsoft.EntityFrameworkCore; 
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using System.Linq;

namespace SportZone_API.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly SportZoneContext _context;

        public OrderRepository(SportZoneContext context)
        {
            _context = context;
        }

        public async Task<Order?> GetOrderByIdAsync(int orderId)
        {
            return await _context.Orders
                                 .Include(o => o.Booking)
                                     .ThenInclude(b => b.Customer)
                                 .Include(o => o.Booking)
                                     .ThenInclude(b => b.Field)
                                 .Include(o => o.Booking)
                                     .ThenInclude(b => b.FieldBookingSchedules) 
                                 .Include(o => o.Discount)
                                 .Include(o => o.OrderServices) 
                                     .ThenInclude(os => os.Service) 
                                 .FirstOrDefaultAsync(o => o.OrderId == orderId);
        }

        public async Task<bool> AddOrderServiceAsync(OrderService order_Service)
        {
            await _context.OrderServices.AddAsync(order_Service);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> RemoveOrderServiceAsync(int orderId, int serviceId)
        {
            var order_Service = await _context.OrderServices
                                                     .FirstOrDefaultAsync(os => os.OrderId == orderId && os.ServiceId == serviceId);
            if (order_Service == null)
            {
                return false;
            }

            _context.OrderServices.Remove(order_Service);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<List<OrderService>> GetOrderServicesByOrderIdAsync(int orderId)
        {
            return await _context.OrderServices
                                 .Where(os => os.OrderId == orderId)
                                 .Include(os => os.Service)
                                 .ToListAsync();
        }

        public async Task<Service?> GetServiceByIdAsync(int serviceId)
        {
            return await _context.Services.FirstOrDefaultAsync(s => s.ServiceId == serviceId);
        }

        public async Task<Booking?> GetBookingByIdAsync(int bookingId)
        {
            return await _context.Bookings
                                 .Include(b => b.Field)
                                 .Include(b => b.Customer)
                                 .Include(b => b.FieldBookingSchedules)
                                 .FirstOrDefaultAsync(b => b.BookingId == bookingId);
        }

        public async Task<Discount?> GetActiveDiscountByBookingIdAsync(int bookingId)
        {
            return null; 
        }

        public async Task<Field?> GetFieldByIdAsync(int fieldId)
        {
            return await _context.Fields.FirstOrDefaultAsync(f => f.FieldId == fieldId);
        }

        public async Task<bool> UpdateOrderServiceAsync(OrderService order_Service)
        {
            _context.OrderServices.Update(order_Service);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateOrderTotalPriceAsync(int orderId, decimal? newTotalPrice, decimal? newTotalServicePrice)
        {
            var order = await _context.Orders.FirstOrDefaultAsync(o => o.OrderId == orderId);
            if (order == null)
            {
                return false;
            }
            order.TotalPrice = newTotalPrice;
            order.TotalServicePrice = newTotalServicePrice;
            return await _context.SaveChangesAsync() > 0;
        }
    }
}