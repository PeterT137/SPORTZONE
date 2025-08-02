using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services.Interfaces;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace SportZone_API.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IMapper _mapper;
        private readonly SportZoneContext _context;

        public OrderService(IOrderRepository orderRepository, IMapper mapper, SportZoneContext context)
        {
            _orderRepository = orderRepository;
            _mapper = mapper;
            _context = context;
        }

        public async Task<OrderDTO> CreateOrderFromBookingAsync(Booking booking)
        {
            try
            {
                // Tính tổng tiền từ booking (tạm thời = 0, sẽ update sau khi add services)
                var totalPrice = await CalculateBookingFieldPriceAsync(booking);

                // Lấy FacId từ Field của booking
                var facId = booking.Field?.FacId ?? 1; // Default facility nếu không có

                var orderCreateDto = new OrderCreateDTO
                {
                    BookingId = booking.BookingId,
                    UId = booking.UId,
                    FacId = facId,
                    GuestName = booking.GuestName,
                    GuestPhone = booking.GuestPhone,
                    TotalPrice = totalPrice,
                    StatusPayment = "Pending",
                    CreateAt = booking.CreateAt ?? DateTime.Now
                };

                var order = await _orderRepository.CreateOrderFromBookingAsync(orderCreateDto);

                // Lấy OrderDTO để return
                var orderDto = await _orderRepository.GetOrderByIdAsync(order.OrderId);
                return orderDto ?? throw new Exception("Không thể lấy thông tin Order vừa tạo");
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tạo Order từ Booking: {ex.Message}", ex);
            }
        }

        public async Task<OrderDTO?> GetOrderByIdAsync(int orderId)
        {
            try
            {
                return await _orderRepository.GetOrderByIdAsync(orderId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy Order: {ex.Message}", ex);
            }
        }

        public async Task<OrderDTO?> GetOrderByBookingIdAsync(int bookingId)
        {
            try
            {
                return await _orderRepository.GetOrderByBookingIdAsync(bookingId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy Order theo BookingId: {ex.Message}", ex);
            }
        }

        private async Task<decimal> CalculateBookingFieldPriceAsync(Booking booking)
        {
            // TODO: Logic tính tiền field price từ slots
            // Hiện tại return 0, sẽ update sau
            await Task.CompletedTask; // Placeholder for async
            return 0;
        }

        //public async Task<ServiceResponse<OrderDTO>> GetOrderDetailsAsync(int orderId)
        //{
        //    var response = new ServiceResponse<OrderDTO>();
        //    var order = await _orderRepository.GetOrderByIdAsync(orderId);
        //    if (order == null)
        //    {
        //        response.Success = false;
        //        response.Message = $"Không tìm thấy Order với OrderId: {orderId}.";
        //        response.Data = new OrderDTO();
        //        return response;
        //    }
        //    if (order.Booking == null)
        //    {
        //        response.Success = false;
        //        response.Message = $"Order với OrderId: {orderId} không có thông tin Booking hợp lệ.";
        //        response.Data = new OrderDTO();
        //        return response;
        //    }
        //    var orderDTO = _mapper.Map<OrderDTO>(order);
        //    orderDTO.TotalServicePrice = order.OrderServices?.Sum(os => (os.Price ?? 0m) * (os.Quantity ?? 0)) ?? 0m;
        //    orderDTO.Deposit = orderDTO.FieldRentalPrice * 0.5m;
        //    orderDTO.TotalPrice = orderDTO.FieldRentalPrice + (orderDTO.TotalServicePrice ?? 0m) - orderDTO.DiscountAmount - orderDTO.Deposit;
        //    await _orderRepository.UpdateOrderTotalPriceAsync(order.OrderId, orderDTO.TotalPrice, orderDTO.TotalServicePrice);

        //    response.Success = true;
        //    response.Message = "Lấy chi tiết đơn hàng thành công.";
        //    response.Data = orderDTO;
        //    return response;
        //}

        //public async Task<bool> AddServiceToOrderAsync(AddServiceToOrderDTO addServiceDto)
        //{
        //    var order = await _orderRepository.GetOrderByIdAsync(addServiceDto.OrderId);
        //    if (order == null)
        //    {
        //        return false;
        //    }
        //    var service = await _orderRepository.GetServiceByIdAsync(addServiceDto.ServiceId);
        //    if (service == null)
        //    {
        //        return false;
        //    }
        //    var existingOrderService = (await _orderRepository.GetOrderServicesByOrderIdAsync(addServiceDto.OrderId))
        //                                         .FirstOrDefault(os => os.ServiceId == addServiceDto.ServiceId);
        //    if (existingOrderService != null)
        //    {
        //        existingOrderService.Quantity = (existingOrderService.Quantity ?? 0) + addServiceDto.Quantity;
        //        if (!await _orderRepository.UpdateOrderServiceAsync(existingOrderService))
        //        {
        //            return false;
        //        }
        //    }
        //    else
        //    {
        //        var newOrderServiceModel = new SportZone_API.Models.OrderService
        //        {
        //            OrderId = addServiceDto.OrderId,
        //            ServiceId = addServiceDto.ServiceId,
        //            Quantity = addServiceDto.Quantity,
        //            Price = service.Price
        //        };
        //        if (!await _orderRepository.AddOrderServiceAsync(newOrderServiceModel))
        //        {
        //            return false;
        //        }
        //    }
        //    await GetOrderDetailsAsync(addServiceDto.OrderId);
        //    return true;
        //}

        //public async Task<bool> RemoveServiceFromOrderAsync(RemoveServiceFromOrderDTO removeServiceDto)
        //{
        //    var order = await _orderRepository.GetOrderByIdAsync(removeServiceDto.OrderId);
        //    if (order == null)
        //    {
        //        return false;
        //    }
        //    if (!await _orderRepository.RemoveOrderServiceAsync(removeServiceDto.OrderId, removeServiceDto.ServiceId))
        //    {
        //        return false;
        //    }
        //    await GetOrderDetailsAsync(removeServiceDto.OrderId);
        //    return true;
        //}
    }
}