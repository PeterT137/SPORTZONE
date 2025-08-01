using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Services.Interfaces
{
    public interface IBookingService
    {
        /// <summary>
        /// Tạo booking mới (customer hoặc guest)
        /// </summary>
        Task<BookingDetailDTO> CreateBookingAsync(BookingCreateDTO bookingDto);

        /// <summary>
        /// Lấy chi tiết booking theo ID
        /// </summary>
        Task<BookingDetailDTO?> GetBookingDetailAsync(int bookingId);

        /// <summary>
        /// Hủy booking
        /// </summary>
        Task<bool> CancelBookingAsync(int bookingId);

        /// <summary>
        /// Lấy danh sách booking theo customer
        /// </summary>
        Task<IEnumerable<BookingResponseDTO>> GetUserBookingsAsync(int userId);
        /// <summary>
        /// Validate booking business rules
        /// </summary>
        Task<(bool IsValid, string ErrorMessage)> ValidateBookingRulesAsync(BookingCreateDTO bookingDto);

        /// <summary>
        /// Kiểm tra slot thời gian có trống không với Date và Time riêng biệt
        /// </summary>
        Task<bool> CheckTimeSlotAvailabilityAsync(int fieldId, DateOnly date, TimeOnly startTime, TimeOnly endTime);

        /// <summary>
        /// Tính toán tổng tiền booking với multiple slots (field + services - discount)
        /// </summary>
        Task<decimal> CalculateTotalAmountAsync(List<int> selectedSlotIds, List<int>? serviceIds = null, int? discountId = null);

    }
}
