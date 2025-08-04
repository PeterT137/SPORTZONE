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
        // Helper method to combine DateOnly and TimeOnly into DateTime for business logic
        private DateTime CombineDateAndTime(DateOnly date, TimeOnly time)
        {
            return date.ToDateTime(time);
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

        public async Task<bool> CancelBookingAsync(int bookingId)
        {
            try
            {
                if (bookingId <= 0)
                    throw new ArgumentException("Booking ID không hợp lệ");

                var booking = await _bookingRepository.GetBookingEntityByIdAsync(bookingId);
                if (booking == null)
                    throw new KeyNotFoundException("Không tìm thấy booking với ID đã cho");

                var schedule = booking.FieldBookingSchedules?.FirstOrDefault();
                if (schedule?.Date.HasValue == true && schedule?.StartTime.HasValue == true)
                {
                    var bookingDateTime = CombineDateAndTime(schedule.Date.Value, schedule.EndTime.Value);
                    if (bookingDateTime.AddHours(-2) <= DateTime.Now)
                    {
                        throw new InvalidOperationException("Không thể hủy booking trong vòng 2 giờ trước giờ bắt đầu");
                    }
                }
                return await _bookingRepository.CancelBookingAsync(bookingId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi hủy booking: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<BookingResponseDTO>> GetUserBookingsAsync(int userId)
        {
            try
            {
                if (userId <= 0)
                    throw new ArgumentException("User ID không hợp lệ");

                return await _bookingRepository.GetBookingsByUserAsync(userId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy booking của customer: {ex.Message}", ex);
            }
        }

        public async Task<(bool IsValid, string ErrorMessage)> ValidateBookingRulesAsync(BookingCreateDTO bookingDto)
        {
            try
            {

                if (!bookingDto.SelectedSlotIds.Any())
                    return (false, "Phải chọn ít nhất 1 slot thời gian");

                if (!bookingDto.UserId.HasValue)
                {
                    if (string.IsNullOrWhiteSpace(bookingDto.GuestName))
                        return (false, "Tên khách là bắt buộc cho booking khách lẻ");

                    if (string.IsNullOrWhiteSpace(bookingDto.GuestPhone))
                        return (false, "Số điện thoại là bắt buộc cho booking khách lẻ");

                    if (!IsValidPhoneNumber(bookingDto.GuestPhone))
                        return (false, "Số điện thoại không hợp lệ");
                }

                var slotsValidation = await _bookingRepository.ValidateSelectedSlotsAsync(
                    bookingDto.SelectedSlotIds,
                    bookingDto.FieldId,
                    bookingDto.FacilityId);
                if (!slotsValidation.IsValid)
                    return (false, slotsValidation.ErrorMessage);

                return (true, string.Empty);
            }
            catch (Exception ex)
            {
                return (false, $"Lỗi khi kiểm tra quy tắc booking: {ex.Message}");
            }
        }

        private bool IsValidPhoneNumber(string phoneNumber)
        {
            if (string.IsNullOrEmpty(phoneNumber))
                return false;
            var phonePattern = @"^[\+]?[0-9]?[\(\)\-\s\.]*[0-9]{8,15}$";
            return System.Text.RegularExpressions.Regex.IsMatch(phoneNumber, phonePattern);
        }

        public async Task<bool> CheckTimeSlotAvailabilityAsync(int fieldId, DateOnly date, TimeOnly startTime, TimeOnly endTime)
        {
            try
            {
                if (fieldId <= 0)
                    throw new ArgumentException("Field ID không hợp lệ");

                if (startTime >= endTime)
                    throw new ArgumentException("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc");

                // Check if the booking is in the past
                var bookingDateTime = CombineDateAndTime(date, startTime);
                if (bookingDateTime <= DateTime.Now)
                    throw new ArgumentException("Không thể kiểm tra thời gian trong quá khứ");

                return await _bookingRepository.CheckTimeSlotAvailabilityAsync(fieldId, date, startTime, endTime);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi kiểm tra thời gian trống: {ex.Message}", ex);
            }
        }

        public async Task<ServiceResponse<decimal>> CalculateTotalAmount(CalculateAmountDTO calculateDto)
        {
            try
            {
                if (calculateDto.SelectedSlotIds == null || !calculateDto.SelectedSlotIds.Any())
                {
                    return new ServiceResponse<decimal>
                    {
                        Success = false,
                        Message = "Phải chọn ít nhất 1 slot thời gian",
                        Data = 0
                    };
                }

                decimal totalAmount = 0;

                // Tính tiền từ các slot đã chọn
                foreach (var slotId in calculateDto.SelectedSlotIds)
                {
                    var slot = await _bookingRepository.GetFieldBookingScheduleByIdAsync(slotId);
                    if (slot != null && slot.Price.HasValue)
                    {
                        totalAmount += slot.Price.Value;
                    }
                }

                // Tính tiền từ các dịch vụ
                if (calculateDto.ServiceIds != null && calculateDto.ServiceIds.Any())
                {
                    foreach (var serviceId in calculateDto.ServiceIds)
                    {
                        var service = await _bookingRepository.GetServiceByIdAsync(serviceId);
                        if (service != null && service.Price.HasValue)
                        {
                            totalAmount += service.Price.Value;
                        }
                    }
                }

                // Áp dụng giảm giá
                if (calculateDto.DiscountId.HasValue)
                {
                    var discount = await _bookingRepository.GetDiscountByIdAsync(calculateDto.DiscountId.Value);
                    if (discount != null && discount.DiscountPercentage.HasValue)
                    {
                        decimal discountAmount = totalAmount * (discount.DiscountPercentage.Value / 100);
                        totalAmount -= discountAmount;
                    }
                }

                return new ServiceResponse<decimal>
                {
                    Success = true,
                    Message = "Tính toán tổng tiền thành công",
                    Data = totalAmount
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<decimal>
                {
                    Success = false,
                    Message = $"Lỗi khi tính toán tổng tiền: {ex.Message}",
                    Data = 0
                };
            }
        }
    }
}
