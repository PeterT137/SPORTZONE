using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Repository.Interfaces
{
    public interface IBookingRepository
    {
        /// <summary>
        /// Tạo booking mới
        /// </summary>
        Task<Booking> CreateBookingAsync(BookingCreateDTO bookingDto);
        /// <summary>
        /// Lấy booking theo ID
        /// </summary>
        Task<BookingDetailDTO?> GetBookingByIdAsync(int bookingId);
        /// <summary>
        /// Kiểm tra conflict thời gian booking
        /// </summary>
        Task<bool> CheckTimeConflictAsync(int fieldId, DateTime startTime, DateTime endTime, int? excludeBookingId = null);
    }
}
