using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repository.Interfaces;
using SportZone_API.Services.Interfaces;

namespace SportZone_API.Services
{
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository _bookingRepository;

        public BookingService(IBookingRepository bookingRepository)
        {
            _bookingRepository = bookingRepository;
        }

        public async Task<BookingDetailDTO> CreateBookingAsync(BookingCreateDTO bookingDto)
        {
            try
            {
                // Validate business rules
                var validation = await ValidateBookingRulesAsync(bookingDto);
                if (!validation.IsValid)
                    throw new ArgumentException(validation.ErrorMessage);

                // Create booking
                var booking = await _bookingRepository.CreateBookingAsync(bookingDto);

                // Return detailed booking info
                var detail = await _bookingRepository.GetBookingByIdAsync(booking.BookingId);
                return detail ?? throw new Exception("Không thể lấy thông tin booking vừa tạo");
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tạo booking: {ex.Message}", ex);
            }
        }

        public async Task<BookingDetailDTO?> GetBookingDetailAsync(int bookingId)
        {
            try
            {
                if (bookingId <= 0)
                    throw new ArgumentException("Booking ID không hợp lệ");

                return await _bookingRepository.GetBookingByIdAsync(bookingId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy chi tiết booking: {ex.Message}", ex);
            }
        }

        public async Task<(bool IsValid, string ErrorMessage)> ValidateBookingRulesAsync(BookingCreateDTO bookingDto)
        {
            try
            {
                // Basic validation
                if (bookingDto.FieldId <= 0)
                    return (false, "Field ID không hợp lệ");

                if (bookingDto.StartTime >= bookingDto.EndTime)
                    return (false, "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc");

                if (bookingDto.StartTime <= DateTime.Now)
                    return (false, "Không thể đặt sân trong quá khứ");

                // Check advance booking limit (e.g., max 30 days)
                if (bookingDto.StartTime > DateTime.Now.AddDays(30))
                    return (false, "Không thể đặt sân quá 30 ngày trước");

                // Validate customer vs guest
                if (!bookingDto.CustomerId.HasValue)
                {
                    // Chỉ yêu cầu thông tin guest khi không có customer
                    if (string.IsNullOrEmpty(bookingDto.GuestName) || string.IsNullOrEmpty(bookingDto.GuestPhone))
                        return (false, "Cần có thông tin guest (tên và số điện thoại) khi không có customer");

                    // Validate phone format for guest
                    if (!IsValidPhoneNumber(bookingDto.GuestPhone))
                        return (false, "Số điện thoại guest không hợp lệ");
                }
                // Nếu có CustomerId thì sử dụng thông tin customer, bỏ qua guest info

                // Check minimum booking duration (e.g., minimum 1 hour)
                var duration = bookingDto.EndTime - bookingDto.StartTime;
                if (duration.TotalHours < 1)
                    return (false, "Thời gian đặt sân tối thiểu là 1 giờ");

                // Check maximum booking duration (e.g., maximum 8 hours)
                if (duration.TotalHours > 8)
                    return (false, "Thời gian đặt sân tối đa là 8 giờ");

                // Check field availability
                //if (!await _bookingRepository.IsFieldAvailableAsync(bookingDto.FieldId, bookingDto.StartTime, bookingDto.EndTime))
                //    return (false, "Sân đã có người đặt trong thời gian này");

                return (true, "");
            }
            catch (Exception ex)
            {
                return (false, $"Lỗi validation: {ex.Message}");
            }
        }

        private bool IsValidPhoneNumber(string phoneNumber)
        {
            if (string.IsNullOrEmpty(phoneNumber))
                return false;

            // Simple phone validation - chỉ cho phép số và một số ký tự đặc biệt
            // Pattern cho phép: +84123456789, 0123456789, (012) 345-6789, etc.
            var phonePattern = @"^[\+]?[0-9]?[\(\)\-\s\.]*[0-9]{8,15}$";
            return System.Text.RegularExpressions.Regex.IsMatch(phoneNumber, phonePattern);
        }

    }
}
