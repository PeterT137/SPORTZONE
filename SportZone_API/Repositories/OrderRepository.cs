using AutoMapper;
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
        private readonly IMapper _mapper;

        public OrderRepository(SportZoneContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Order> CreateOrderFromBookingAsync(OrderCreateDTO orderDto)
        {
            try
            {
                var order = _mapper.Map<Order>(orderDto);
                order.TotalPrice = 0;
                order.TotalServicePrice = 0;
                order.CreateAt = orderDto.CreateAt ?? DateTime.UtcNow;

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                return order;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tạo Order từ Booking: {ex.Message}", ex);
            }
        }

        public async Task<OrderDTO?> GetOrderByBookingIdAsync(int bookingId)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.Booking)
                    .Include(o => o.Fac)
                    .Include(o => o.Discount)
                    .Include(o => o.OrderServices)
                        .ThenInclude(os => os.Service)
                    .FirstOrDefaultAsync(o => o.BookingId == bookingId);

                if (order == null)
                {
                    return null;                   
                }
                return _mapper.Map<OrderDTO>(order);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy Order theo BookingId: {ex.Message}", ex);
            }
        }

        public async Task<OrderDTO?> GetOrderByIdAsync(int orderId)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.Booking)
                    .Include(o => o.Fac)
                    .Include(o => o.Discount)
                    .Include(o => o.OrderServices)
                        .ThenInclude(os => os.Service)
                    .FirstOrDefaultAsync(o => o.OrderId == orderId);

                if (order == null) return null;

                return _mapper.Map<OrderDTO>(order);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy Order: {ex.Message}", ex);
            }
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
                                 .Include(b => b.UIdNavigation) 
                                    .ThenInclude(u => u.Customer)
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