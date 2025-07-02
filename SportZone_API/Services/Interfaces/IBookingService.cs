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
        /// Validate booking business rules
        /// </summary>
        Task<(bool IsValid, string ErrorMessage)> ValidateBookingRulesAsync(BookingCreateDTO bookingDto);
    }
}
