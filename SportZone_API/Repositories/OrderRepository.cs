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
                order.TotalPrice = orderDto.TotalPrice ?? 0;
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


        public async Task<OrderDTO?> UpdateOrderContentPaymentAsync(int orderId, int option)
        {
            try
            {
                var order = await _context.Orders
                    .FirstOrDefaultAsync(o => o.OrderId == orderId);
                if (order == null)
                {
                    return null;
                }
                if (option == 1)
                {
                    order.ContentPayment = "Thanh toán tiền mặt";
                }
                else if (option == 2)
                {
                    order.ContentPayment = "Thanh toán qua ví điện tử";
                }
                _context.Orders.Update(order);
                await _context.SaveChangesAsync();
                return _mapper.Map<OrderDTO>(order);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi cập nhật nội dung thanh toán của Order: {ex.Message}", ex);
            }
        }

        public async Task<OwnerRevenueDTO> GetOwnerTotalRevenueAsync(int ownerId,
                                                                     DateTime? startDate = null,
                                                                     DateTime? endDate = null,
                                                                     int? facilityId = null)
        {
            try
            {
                var owner = await _context.FieldOwners
                .Include(fo => fo.Facilities)
                .FirstOrDefaultAsync(fo => fo.UId == ownerId);
                if (owner == null)
                {
                    throw new Exception("Chủ sân không tồn tại");
                }

                var ordersQuery = _context.Orders
                    .Include(o => o.Fac)
                    .Where(o => o.Fac.UId == ownerId);
                //(o.StatusPayment == "Comleted" || o.StatusPayment == "Paid")
                if (startDate.HasValue)
                {
                    ordersQuery = ordersQuery.Where(o => o.CreateAt >= startDate.Value);
                }
                if (endDate.HasValue)
                {
                    ordersQuery = ordersQuery.Where(o => o.CreateAt <= endDate.Value);
                }

                if (facilityId.HasValue)
                {
                    ordersQuery = ordersQuery.Where(o => o.FacId == facilityId.Value);
                }

                var orders = await ordersQuery.ToListAsync();

                var totalRevenue = orders.Sum(o => o.TotalPrice) ?? 0;
                var totalFieldRevenue = orders.Sum(o => o.TotalPrice ?? 0) - orders.Sum(o => o.TotalServicePrice ?? 0);
                var totalServiceRevenue = orders.Sum(o => o.TotalServicePrice) ?? 0;
                var totalOrders = orders.Count;

                var facilityRevenuesData = await ordersQuery
                    .GroupBy(o => new
                    {
                        o.FacId,
                        o.Fac.Name
                    })
                    .Select(g => new
                    {
                        FacilityId = g.Key.FacId,
                        FacilityName = g.Key.Name,
                        Revenue = g.Sum(o => o.TotalPrice) ?? 0,
                        FieldRevenue = g.Sum(o => o.TotalPrice ?? 0) - g.Sum(o => o.TotalServicePrice ?? 0),
                        ServiceRevenue = g.Sum(o => o.TotalServicePrice) ?? 0,
                        OrderCount = g.Count()
                    })
                    .ToListAsync();

                var facilityRevenues = facilityRevenuesData.Select(r => new FacilityRevenueDTO
                {
                    FacilityId = r.FacilityId,
                    FacilityName = r.FacilityName,
                    Revenue = r.Revenue,
                    FieldRevenue = r.FieldRevenue,
                    ServiceRevenue = r.ServiceRevenue,
                    OrderCount = r.OrderCount
                })
                .ToList();

                var monthlyRevenueData = await ordersQuery
                    .GroupBy(o => new
                    {
                        Year = o.CreateAt.Value.Year,
                        Month = o.CreateAt.Value.Month
                    })
                    .Select(g => new
                    {
                        Year = g.Key.Year,
                        Month = g.Key.Month,
                        Revenue = g.Sum(o => o.TotalPrice) ?? 0,
                        FieldRevenue = g.Sum(o => o.TotalPrice ?? 0) - g.Sum(o => o.TotalServicePrice ?? 0),
                        ServiceRevenue = g.Sum(o => o.TotalServicePrice) ?? 0,
                        OrderCount = g.Count()
                    })
                    .OrderBy(r => r.Year).ThenBy(r => r.Month).ToListAsync();

                var monthlyRevenue = monthlyRevenueData.Select(r => new TimeRevenueDTO
                {
                    Period = $"{r.Year}-{r.Month:D2}",
                    Revenue = r.Revenue,
                    FieldRevenue = r.FieldRevenue,
                    ServiceRevenue = r.ServiceRevenue,
                    OrderCount = r.OrderCount
                })
                .ToList();

                var yearlyRevenueData = await ordersQuery
                    .GroupBy(o => o.CreateAt.Value.Year)
                    .Select(g => new
                    {
                        Year = g.Key,
                        Revenue = g.Sum(o => o.TotalPrice) ?? 0,
                        FieldRevenue = g.Sum(o => o.TotalPrice ?? 0) - g.Sum(o => o.TotalServicePrice ?? 0),
                        ServiceRevenue = g.Sum(o => o.TotalServicePrice) ?? 0,
                        OrderCount = g.Count()
                    })
                    .OrderBy(r => r.Year).ToListAsync();

                var yearlyRevenue = yearlyRevenueData.Select(r => new TimeRevenueDTO
                {
                    Period = r.Year.ToString(),
                    Revenue = r.Revenue,
                    FieldRevenue = r.FieldRevenue,
                    ServiceRevenue = r.ServiceRevenue,
                    OrderCount = r.OrderCount
                })
                .ToList();

                return new OwnerRevenueDTO
                {
                    OwnerId = ownerId,
                    OwnerName = owner.Name,
                    TotalRevenue = totalRevenue,
                    TotalFieldRevenue = totalFieldRevenue,
                    TotalServiceRevenue = totalServiceRevenue,
                    TotalOrders = totalOrders,
                    StartDate = startDate,
                    EndDate = endDate,
                    Facilities = facilityRevenues,
                    MonthlyRevenue = monthlyRevenue,
                    YearlyRevenue = yearlyRevenue
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy doanh thu tổng của chủ sân: {ex.Message}", ex);
            }
        }



















        //public async Task<bool> AddOrderServiceAsync(OrderService order_Service)
        //{
        //    await _context.OrderServices.AddAsync(order_Service);
        //    return await _context.SaveChangesAsync() > 0;
        //}

        //public async Task<bool> RemoveOrderServiceAsync(int orderId, int serviceId)
        //{
        //    var order_Service = await _context.OrderServices
        //                                             .FirstOrDefaultAsync(os => os.OrderId == orderId && os.ServiceId == serviceId);
        //    if (order_Service == null)
        //    {
        //        return false;
        //    }

        //    _context.OrderServices.Remove(order_Service);
        //    return await _context.SaveChangesAsync() > 0;
        //}

        //public async Task<List<OrderService>> GetOrderServicesByOrderIdAsync(int orderId)
        //{
        //    return await _context.OrderServices
        //                         .Where(os => os.OrderId == orderId)
        //                         .Include(os => os.Service)
        //                         .ToListAsync();
        //}

        //public async Task<Service?> GetServiceByIdAsync(int serviceId)
        //{
        //    return await _context.Services.FirstOrDefaultAsync(s => s.ServiceId == serviceId);
        //}

        //public async Task<Booking?> GetBookingByIdAsync(int bookingId)
        //{
        //    return await _context.Bookings
        //                         .Include(b => b.Field)
        //                         .Include(b => b.UIdNavigation) 
        //                            .ThenInclude(u => u.Customer)
        //                         .Include(b => b.FieldBookingSchedules)
        //                         .FirstOrDefaultAsync(b => b.BookingId == bookingId);
        //}

        //public async Task<Discount?> GetActiveDiscountByBookingIdAsync(int bookingId)
        //{
        //    return null;
        //}

        //public async Task<Field?> GetFieldByIdAsync(int fieldId)
        //{
        //    return await _context.Fields.FirstOrDefaultAsync(f => f.FieldId == fieldId);
        //}

        //public async Task<bool> UpdateOrderServiceAsync(OrderService order_Service)
        //{
        //    _context.OrderServices.Update(order_Service);
        //    return await _context.SaveChangesAsync() > 0;
        //}

        //public async Task<bool> UpdateOrderTotalPriceAsync(int orderId, decimal? newTotalPrice, decimal? newTotalServicePrice)
        //{
        //    var order = await _context.Orders.FirstOrDefaultAsync(o => o.OrderId == orderId);
        //    if (order == null)
        //    {
        //        return false;
        //    }
        //    order.TotalPrice = newTotalPrice;
        //    order.TotalServicePrice = newTotalServicePrice;
        //    return await _context.SaveChangesAsync() > 0;
        //}
    }
}