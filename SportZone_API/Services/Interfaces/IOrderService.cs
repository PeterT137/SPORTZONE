using SportZone_API.DTOs; 

namespace SportZone_API.Services.Interfaces
{
    public interface IOrderService
    {
        Task<ServiceResponse<OrderDTO>> GetOrderDetailsAsync(int orderId); 
        Task<bool> AddServiceToOrderAsync(AddServiceToOrderDTO addServiceDto);
        Task<bool> RemoveServiceFromOrderAsync(RemoveServiceFromOrderDTO removeServiceDto);
    }
}