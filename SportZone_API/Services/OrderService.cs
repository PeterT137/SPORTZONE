using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using SportZone_API.DTOs;
using SportZone_API.Hubs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services.Interfaces;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using SportZone_API.Repository.Interfaces;

namespace SportZone_API.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IBookingRepository _bookingRepository;
        private readonly IMapper _mapper;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly SportZoneContext _context;

        public OrderService(
            IOrderRepository orderRepository,
            IBookingRepository bookingRepository,
            IMapper mapper,
            IHubContext<NotificationHub> hubContext,
            SportZoneContext context)
        {
            _orderRepository = orderRepository;
            _bookingRepository = bookingRepository;
            _mapper = mapper;
            _hubContext = hubContext;
            _context = context;
        }

        public async Task<ServiceResponse<OrderDTO>> GetOrderDetailsAsync(int orderId)
        {
            var response = new ServiceResponse<OrderDTO>();
            var order = await _orderRepository.GetOrderByIdAsync(orderId);
            if (order == null)
            {
                response.Success = false;
                response.Message = $"Không tìm thấy Order với OrderId: {orderId}.";
                return response;
            }
            if (order.Booking == null)
            {
                response.Success = false;
                response.Message = $"Order với OrderId: {orderId} không có thông tin Booking hợp lệ.";
                return response;
            }

            var orderDTO = _mapper.Map<OrderDTO>(order);

            // Tính toán lại tổng tiền
            orderDTO.TotalServicePrice = order.OrderServices?.Sum(os => (os.Price ?? 0m) * (os.Quantity ?? 0)) ?? 0m;
            orderDTO.Deposit = orderDTO.FieldRentalPrice * 0.5m;
            orderDTO.TotalPrice = orderDTO.FieldRentalPrice + (orderDTO.TotalServicePrice ?? 0m) - orderDTO.DiscountAmount - orderDTO.Deposit;

            // Cập nhật tổng tiền vào DB
            await _orderRepository.UpdateOrderTotalPriceAsync(order.OrderId, orderDTO.TotalPrice, orderDTO.TotalServicePrice);

            response.Success = true;
            response.Message = "Lấy chi tiết đơn hàng thành công.";
            response.Data = orderDTO;
            return response;
        }

        public async Task<bool> AddServiceToOrderAsync(AddServiceToOrderDTO addServiceDto)
        {
            var order = await _orderRepository.GetOrderByIdAsync(addServiceDto.OrderId);
            if (order == null || order.Booking == null)
            {
                return false;
            }

            var service = await _orderRepository.GetServiceByIdAsync(addServiceDto.ServiceId);
            if (service == null)
            {
                return false;
            }

            var existingOrderService = order.OrderServices?
                .FirstOrDefault(os => os.ServiceId == addServiceDto.ServiceId);

            if (existingOrderService != null)
            {
                existingOrderService.Quantity = (existingOrderService.Quantity ?? 0) + addServiceDto.Quantity;
                _context.Update(existingOrderService);
            }
            else
            {
                var newOrderServiceModel = new SportZone_API.Models.OrderService
                {
                    OrderId = addServiceDto.OrderId,
                    ServiceId = addServiceDto.ServiceId,
                    Quantity = addServiceDto.Quantity,
                    Price = service.Price
                };
                _context.Add(newOrderServiceModel);
            }

            var isSuccess = await _context.SaveChangesAsync() > 0;
            if (isSuccess)
            {
                // Cập nhật và lấy chi tiết đơn hàng mới
                var updatedOrderResponse = await GetOrderDetailsAsync(addServiceDto.OrderId);

                // --- Tích hợp SignalR ---
                var facId = order.Booking.FieldBookingSchedules?.FirstOrDefault()?.Field?.FacId;
                if (facId.HasValue)
                {
                    var message = $"Dịch vụ '{service.ServiceName}' đã được thêm/cập nhật vào đơn hàng {order.OrderId}.";

                    // Gửi thông báo đến quản lý cơ sở
                    await _hubContext.Clients.Group($"facility-{facId.Value}").SendAsync("ReceiveNotification", message);

                    // Cập nhật chi tiết đơn hàng real-time
                    await _hubContext.Clients.Group($"facility-{facId.Value}").SendAsync("OrderUpdated", updatedOrderResponse.Data);
                }

                // Gửi thông báo đến khách hàng
                if (order.Booking.UId.HasValue)
                {
                    var customerMessage = $"Đơn hàng của bạn (ID: {order.OrderId}) đã được cập nhật thêm dịch vụ '{service.ServiceName}'.";
                    await _hubContext.Clients.User(order.Booking.UId.Value.ToString()).SendAsync("ReceiveNotification", customerMessage);
                    await _hubContext.Clients.User(order.Booking.UId.Value.ToString()).SendAsync("OrderUpdated", updatedOrderResponse.Data);
                }
            }

            return isSuccess;
        }

        public async Task<bool> RemoveServiceFromOrderAsync(RemoveServiceFromOrderDTO removeServiceDto)
        {
            var order = await _orderRepository.GetOrderByIdAsync(removeServiceDto.OrderId);
            if (order == null || order.Booking == null)
            {
                return false;
            }

            var service = await _orderRepository.GetServiceByIdAsync(removeServiceDto.ServiceId);
            var isSuccess = await _orderRepository.RemoveOrderServiceAsync(removeServiceDto.OrderId, removeServiceDto.ServiceId);

            if (isSuccess)
            {
                // Cập nhật và lấy chi tiết đơn hàng mới
                var updatedOrderResponse = await GetOrderDetailsAsync(removeServiceDto.OrderId);

                // --- Tích hợp SignalR ---
                var facId = order.Booking.FieldBookingSchedules?.FirstOrDefault()?.Field?.FacId;
                if (facId.HasValue)
                {
                    var message = $"Dịch vụ '{service.ServiceName}' đã bị xóa khỏi đơn hàng {order.OrderId}.";

                    // Gửi thông báo đến quản lý cơ sở
                    await _hubContext.Clients.Group($"facility-{facId.Value}").SendAsync("ReceiveNotification", message);

                    // Cập nhật chi tiết đơn hàng real-time
                    await _hubContext.Clients.Group($"facility-{facId.Value}").SendAsync("OrderUpdated", updatedOrderResponse.Data);
                }

                // Gửi thông báo đến khách hàng
                if (order.Booking.UId.HasValue)
                {
                    var customerMessage = $"Đơn hàng của bạn (ID: {order.OrderId}) đã được cập nhật, dịch vụ '{service.ServiceName}' đã bị xóa.";
                    await _hubContext.Clients.User(order.Booking.UId.Value.ToString()).SendAsync("ReceiveNotification", customerMessage);
                    await _hubContext.Clients.User(order.Booking.UId.Value.ToString()).SendAsync("OrderUpdated", updatedOrderResponse.Data);
                }
            }

            return isSuccess;
        }
    }
}