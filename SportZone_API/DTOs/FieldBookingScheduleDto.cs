using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SportZone_API.DTOs
{
    public class FieldBookingScheduleDto
    {
        public int ScheduleId { get; set; }
        public int FieldId { get; set; }
        public int? BookingId { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public string? Notes { get; set; }
        public DateOnly Date { get; set; }
        public string? Status { get; set; }
        public decimal? Price { get; set; } 
    }

    public class FieldBookingScheduleGenerateDto
    {
        [Required(ErrorMessage = "Mã sân là bắt buộc.")]
        public int FieldId { get; set; }

        [Required(ErrorMessage = "Ngày bắt đầu là bắt buộc.")]
        public DateOnly StartDate { get; set; }

        [Required(ErrorMessage = "Ngày kết thúc là bắt buộc.")]
        public DateOnly EndDate { get; set; }

        //[Required(ErrorMessage = "Thời lượng mỗi slot là bắt buộc (ví dụ: 01:00:00 cho 1 giờ).")]
        //public TimeSpan SlotDuration { get; set; }

        [Required(ErrorMessage = "Thời gian bắt đầu hàng ngày là bắt buộc (ví dụ: 08:00:00).")]
        public TimeSpan DailyStartTime { get; set; }

        [Required(ErrorMessage = "Thời gian kết thúc hàng ngày là bắt buộc (ví dụ: 22:00:00).")]
        public TimeSpan DailyEndTime { get; set; }

        public string? Notes { get; set; }
    }

    public class FieldBookingScheduleUpdateDto
    {
        public TimeOnly? StartTime { get; set; }
        public TimeOnly? EndTime { get; set; }
        public string? Notes { get; set; }
        public string? Status { get; set; }
        public decimal? Price { get; set; }
    }

    public class ScheduleGenerationResponseDto
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}