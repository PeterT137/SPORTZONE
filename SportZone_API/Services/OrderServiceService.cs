using Microsoft.AspNetCore.Mvc;
using SportZone_API.DTOs;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Repository.Interfaces;
using SportZone_API.Services.Interfaces;

namespace SportZone_API.Services
{
    public class OrderServiceService : IOrderServiceService
    {
        private readonly IOrderServiceRepository _orderServiceRepository;

        public OrderServiceService(IOrderServiceRepository orderServiceRepository)
        {
            _orderServiceRepository = orderServiceRepository;
        }

        public async Task<OrderServiceDTO> AddServiceToOrderAsync(OrderServiceCreateDTO orderServiceDto)
        {
            try
            {
                if (orderServiceDto.Quantity <= 0)
                    throw new ArgumentException("Số lượng dịch vụ phải lớn hơn 0");

                var orderService = await _orderServiceRepository.CreateOrderServiceAsync(orderServiceDto);
                return orderService;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi thêm dịch vụ vào đơn hàng: {ex.Message}", ex);
            }
        }

        public async Task<OrderServiceDTO?> GetOrderServiceByIdAsync(int orderServiceId)
        {
            try
            {
                if (orderServiceId <= 0)
                    throw new ArgumentException("OrderService ID không hợp lệ");

                return await _orderServiceRepository.GetOrderServiceByIdAsync(orderServiceId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy thông tin OrderService: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<OrderServiceDTO>> GetOrderServicesByOrderIdAsync(int orderId)
        {
            try
            {
                if (orderId <= 0)
                    throw new ArgumentException("Order ID không hợp lệ");

                return await _orderServiceRepository.GetOrderServicesByOrderIdAsync(orderId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy danh sách services trong order: {ex.Message}", ex);
            }
        }


        public async Task<bool> RemoveServiceFromOrderAsync(int orderServiceId)
        {
            try
            {
                if (orderServiceId <= 0)
                    throw new ArgumentException("OrderService ID không hợp lệ");

                // Kiểm tra OrderService có tồn tại không
                var existingOrderService = await _orderServiceRepository.GetOrderServiceByIdAsync(orderServiceId);
                if (existingOrderService == null)
                    throw new ArgumentException("OrderService không tồn tại");

                // Xóa OrderService và tự động tính toán lại tổng tiền
                var result = await _orderServiceRepository.DeleteOrderServiceAsync(orderServiceId);

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi xóa service khỏi order: {ex.Message}", ex);
            }
        }
    }
}
