namespace SportZone_API.DTOs
{
    public class OrderDTO
    {
        public int OrderId { get; set; }
        public string? CustomerName { get; set; } 
        public string? CustomerPhone { get; set; }
        public List<string> BookedSlots { get; set; }
        public string? BookingDate { get; set; }
        public decimal FieldRentalPrice { get; set; }
        public decimal? TotalServicePrice { get; set; } 
        public decimal Deposit { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal? TotalPrice { get; set; } 
        public string? PaymentMethod { get; set; }
        public string? PaymentStatus { get; set; }

        public List<OrderDetailServiceDTO> Services { get; set; } = new List<OrderDetailServiceDTO>(); 
    }

    public class OrderDetailServiceDTO
    {
        public int ServiceId { get; set; }
        public string? ServiceName { get; set; }
        public decimal? Price { get; set; }
        public int? Quantity { get; set; } 
        public string? ImageUrl { get; set; } 
    }

    public class AddServiceToOrderDTO
    {
        public int OrderId { get; set; }
        public int ServiceId { get; set; }
        public int Quantity { get; set; }
    }

    public class RemoveServiceFromOrderDTO
    {
        public int OrderId { get; set; }
        public int ServiceId { get; set; }
    }
}