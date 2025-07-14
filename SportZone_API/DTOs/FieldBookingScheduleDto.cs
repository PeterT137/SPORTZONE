using System.ComponentModel.DataAnnotations;

namespace SportZone_API.DTOs
{
    public class FieldBookingScheduleDto
    {
        public int ScheduleId { get; set; }
        public int FieldId { get; set; }
        public int? BookingId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string? Notes { get; set; }
        public DateOnly Date { get; set; }
        public string? Status { get; set; }
    }
    public class FieldBookingScheduleCreateDto
    {
        [Required(ErrorMessage = "Mã sân là bắt buộc.")]
        public int FieldId { get; set; }
        [Required(ErrorMessage = "Thời gian bắt đầu là bắt buộc.")]
        public DateTime StartTime { get; set; }
        [Required(ErrorMessage = "Thời gian kết thúc là bắt buộc.")]
        public DateTime EndTime { get; set; }
        public string? Notes { get; set; }
        [Required(ErrorMessage = "Ngày là bắt buộc.")]
        public DateOnly Date { get; set; }
        public string? Status { get; set; } = "Available";
    }
    public class FieldBookingScheduleGenerateDto
    {
        [Required(ErrorMessage = "Mã sân là bắt buộc.")]
        public int FieldId { get; set; }
        [Required(ErrorMessage = "Ngày bắt đầu là bắt buộc.")]
        public DateOnly StartDate { get; set; }
        [Required(ErrorMessage = "Ngày kết thúc là bắt buộc.")]
        public DateOnly EndDate { get; set; }
        [Required(ErrorMessage = "Thời lượng mỗi slot là bắt buộc (ví dụ: 01:00:00 cho 1 giờ).")]
        public TimeSpan SlotDuration { get; set; }
        [Required(ErrorMessage = "Thời gian bắt đầu hàng ngày là bắt buộc (ví dụ: 08:00:00).")]
        public TimeSpan DailyStartTime { get; set; }
        [Required(ErrorMessage = "Thời gian kết thúc hàng ngày là bắt buộc (ví dụ: 22:00:00).")]
        public TimeSpan DailyEndTime { get; set; }
    }
    public class FieldBookingScheduleUpdateDto
    {
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string? Notes { get; set; }
        public string? Status { get; set; }
    }
}
