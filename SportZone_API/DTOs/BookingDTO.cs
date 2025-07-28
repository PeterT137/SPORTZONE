using System.ComponentModel.DataAnnotations;

namespace SportZone_API.DTOs
{
    /// <summary>
    /// DTO để tạo booking mới
    /// </summary>
    public class BookingCreateDTO
    {
        // FieldId không còn bắt buộc - sẽ được lấy từ slot available trong Field_booking_schedule
        public int? FieldId { get; set; }

        // Thêm các filter để thu hẹp lựa chọn slot
        public int? FacilityId { get; set; }
        public int? CategoryId { get; set; }

        public int? UserId { get; set; }

        [MaxLength(100, ErrorMessage = "Tiêu đề không được quá 100 ký tự")]
        public string? Title { get; set; }

        [Required(ErrorMessage = "Ngày đặt sân là bắt buộc")]
        public DateOnly Date { get; set; }

        [Required(ErrorMessage = "Thời gian bắt đầu là bắt buộc")]
        public TimeOnly StartTime { get; set; }

        [Required(ErrorMessage = "Thời gian kết thúc là bắt buộc")]
        public TimeOnly EndTime { get; set; }

        // Guest booking fields
        [MaxLength(100, ErrorMessage = "Tên khách không được quá 100 ký tự")]
        public string? GuestName { get; set; }

        [MaxLength(20, ErrorMessage = "Số điện thoại không được quá 20 ký tự")]
        public string? GuestPhone { get; set; }

        // Optional services and discount
        public List<int>? ServiceIds { get; set; }
        public int? DiscountId { get; set; } // Thay DiscountCode bằng DiscountId

        public string? Notes { get; set; }
    }

    /// <summary>
    /// DTO để cập nhật booking
    /// </summary>
    public class BookingUpdateDTO
    {
        [MaxLength(100, ErrorMessage = "Tiêu đề không được quá 100 ký tự")]
        public string? Title { get; set; }

        public DateOnly? Date { get; set; }

        public TimeOnly? StartTime { get; set; }

        public TimeOnly? EndTime { get; set; }

        public string? Notes { get; set; }
    }

    /// <summary>
    /// DTO response cho booking
    /// </summary>
    public class BookingResponseDTO
    {
        public int BookingId { get; set; }
        public int FieldId { get; set; }
        public string? FieldName { get; set; }
        public string? FacilityName { get; set; }
        public string? FacilityAddress { get; set; }
        public int? UserId { get; set; }
        public string? CustomerName { get; set; }
        public string? Title { get; set; }
        public DateOnly? Date { get; set; }
        public TimeOnly? StartTime { get; set; }
        public TimeOnly? EndTime { get; set; }
        public string? Status { get; set; }
        public string? StatusPayment { get; set; }
        public DateTime? CreateAt { get; set; }
        public string? GuestName { get; set; }
        public string? GuestPhone { get; set; }
        public decimal? FieldPrice { get; set; }
        public decimal? TotalAmount { get; set; }
        public string? Notes { get; set; }

        // Related services
        public List<BookingServiceDTO>? Services { get; set; }
    }

    /// <summary>
    /// DTO chi tiết đầy đủ của booking
    /// </summary>
    public class BookingDetailDTO : BookingResponseDTO
    {
        public FieldInfoDTO? Field { get; set; }
        public CustomerInfoDTO? Customer { get; set; }
        public OrderInfoDTO? Order { get; set; }
    }

    /// <summary>
    /// DTO thông tin sân trong booking
    /// </summary>
    public class FieldInfoDTO
    {
        public int FieldId { get; set; }
        public string? FieldName { get; set; }
        public string? Description { get; set; }
        public decimal? Price { get; set; }
        public string? CategoryName { get; set; }
        public FacilityInfoDTO? Facility { get; set; }
    }

    /// <summary>
    /// DTO thông tin cơ sở trong booking
    /// </summary>
    public class FacilityInfoDTO
    {
        public int FacId { get; set; }
        public string? Address { get; set; }
        public TimeOnly? OpenTime { get; set; }
        public TimeOnly? CloseTime { get; set; }
        public string? Description { get; set; }
    }

    /// <summary>
    /// DTO thông tin khách hàng trong booking
    /// </summary>
    public class CustomerInfoDTO
    {
        public int UserId { get; set; }
        public string? Name { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
    }

    /// <summary>
    /// DTO thông tin đơn hàng trong booking
    /// </summary>
    public class OrderInfoDTO
    {
        public int OrderId { get; set; }
        public decimal? TotalAmount { get; set; }
        public string? StatusPayment { get; set; }
        public string? ContentPayment { get; set; }
        public DateTime? CreateAt { get; set; }
        public List<BookingServiceDTO>? Services { get; set; }
        public DiscountInfoDTO? Discount { get; set; }
    }

    /// <summary>
    /// DTO dịch vụ trong booking
    /// </summary>
    public class BookingServiceDTO
    {
        public int ServiceId { get; set; }
        public string? ServiceName { get; set; }
        public decimal? Price { get; set; }
        public int? Quantity { get; set; }
        public decimal? TotalPrice { get; set; }
    }

    /// <summary>
    /// DTO thông tin giảm giá
    /// </summary>
    public class DiscountInfoDTO
    {
        public int DiscountId { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public string? Description { get; set; }
    }

    /// <summary>
    /// DTO lọc lịch sử booking
    /// </summary>
    public class BookingHistoryFilterDTO
    {
        public int? UserId { get; set; }
        public string? Status { get; set; }
        public DateOnly? DateFrom { get; set; }
        public DateOnly? DateTo { get; set; }
        public int Page { get; set; } = 1;
        public int Limit { get; set; } = 10;
    }
}
