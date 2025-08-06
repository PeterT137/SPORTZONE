namespace SportZone_API.DTOs
{
    /// <summary>
    /// DTO để tạo Order từ Booking
    /// </summary>
    public class OrderCreateDTO
    {
        public int BookingId { get; set; }
        public int? UId { get; set; }
        public int FacId { get; set; }
        public int? DiscountId { get; set; }
        public string? GuestName { get; set; }
        public string? GuestPhone { get; set; }
        public decimal? TotalPrice { get; set; }
        public string? StatusPayment { get; set; } = "Pending";
        public DateTime? CreateAt { get; set; }
    }

    /// <summary>
    /// DTO response cho Order
    /// </summary>
    public class OrderDTO
    {
        public int OrderId { get; set; }
        public int? UId { get; set; }
        public int FacId { get; set; }
        public int? DiscountId { get; set; }
        public int? BookingId { get; set; }
        public string? GuestName { get; set; }
        public string? GuestPhone { get; set; }
        public decimal? TotalPrice { get; set; }
        public decimal? TotalServicePrice { get; set; }
        public string? ContentPayment { get; set; }
        public string? StatusPayment { get; set; }
        public DateTime? CreateAt { get; set; }

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