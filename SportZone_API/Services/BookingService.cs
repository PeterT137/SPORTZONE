using Microsoft.AspNetCore.SignalR;
using SportZone_API.DTOs;
using SportZone_API.Hubs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Repository.Interfaces;
using SportZone_API.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SportZone_API.Services
{
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IFieldRepository _fieldRepository;
        private readonly IHubContext<NotificationHub> _hubContext;

        public BookingService(IBookingRepository bookingRepository, IFieldRepository fieldRepository, IHubContext<NotificationHub> hubContext)
        {
            _bookingRepository = bookingRepository;
            _fieldRepository = fieldRepository;
            _hubContext = hubContext;
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
                if (detail == null)
                    throw new Exception("Không thể lấy thông tin booking vừa tạo");

                // Lấy thông tin cơ sở từ sân đã đặt
                var field = await _fieldRepository.GetFieldByIdAsync(bookingDto.FieldId.Value);
                if (field != null)
                {
                    var facId = field.FacId;

                    // Gửi thông báo đến người quản lý cơ sở
                    var managerMessage = $"Một booking mới (ID: {detail.BookingId}) đã được tạo cho sân '{field.FieldName}' vào lúc {bookingDto.StartTime.ToString("HH:mm")} ngày {bookingDto.Date.ToString("dd-MM-yyyy")}.";
                    await _hubContext.Clients.Group($"facility-{facId}").SendAsync("ReceiveNotification", managerMessage);

                    // Cập nhật trạng thái sân cho tất cả người dùng đang xem lịch trong cùng cơ sở
                    await _hubContext.Clients.Group($"facility-{facId}").SendAsync("BookingCreated", detail);
                }

                // Gửi thông báo cho khách hàng
                if (detail.UserId.HasValue)
                {
                    var userMessage = $"Booking của bạn (ID: {detail.BookingId}) đã được xác nhận thành công.";
                    await _hubContext.Clients.User(detail.UserId.Value.ToString()).SendAsync("ReceiveNotification", userMessage);
                }

                return detail;
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

                var isCancelled = await _bookingRepository.CancelBookingAsync(bookingId);

                if (isCancelled)
                {
                    // Lấy thông tin sân và cơ sở để gửi thông báo
                    var field = booking.FieldBookingSchedules?.FirstOrDefault()?.Field;
                    if (field != null)
                    {
                        var facId = field.FacId;

                        // Gửi thông báo đến người quản lý cơ sở
                        var managerMessage = $"Booking (ID: {bookingId}) cho sân '{field.FieldName}' đã được hủy.";
                        await _hubContext.Clients.Group($"facility-{facId}").SendAsync("ReceiveNotification", managerMessage);

                        // Cập nhật trạng thái sân cho tất cả người dùng đang xem lịch
                        await _hubContext.Clients.Group($"facility-{facId}").SendAsync("BookingCancelled", bookingId);
                    }

                    // Gửi thông báo cho khách hàng
                    if (booking.UId.HasValue)
                    {
                        var userMessage = $"Booking (ID: {bookingId}) của bạn đã được hủy thành công.";
                        await _hubContext.Clients.User(booking.UId.Value.ToString()).SendAsync("ReceiveNotification", userMessage);
                    }
                }
                return isCancelled;
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
                // Basic validation
                if (bookingDto.StartTime >= bookingDto.EndTime)
                    return (false, "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc");

                // Check if booking is not in the past
                var bookingDateTime = CombineDateAndTime(bookingDto.Date, bookingDto.StartTime);
                if (bookingDateTime <= DateTime.Now)
                    return (false, "Không thể đặt thời gian trong quá khứ");

                // Check if it's not too far in the future (e.g., max 3 months)
                if (bookingDateTime > DateTime.Now.AddMonths(3))
                    return (false, "Không thể đặt sân quá 3 tháng trước");

                // Validate guest booking requirements
                if (!bookingDto.UserId.HasValue)
                {
                    if (string.IsNullOrWhiteSpace(bookingDto.GuestName))
                        return (false, "Tên khách là bắt buộc cho booking khách lẻ");

                    if (string.IsNullOrWhiteSpace(bookingDto.GuestPhone))
                        return (false, "Số điện thoại là bắt buộc cho booking khách lẻ");

                    if (!IsValidPhoneNumber(bookingDto.GuestPhone))
                        return (false, "Số điện thoại không hợp lệ");
                }

                // Check field availability if specified
                if (bookingDto.FieldId.HasValue)
                {
                    var isAvailable = await CheckTimeSlotAvailabilityAsync(
                        bookingDto.FieldId.Value,
                        bookingDto.Date,
                        bookingDto.StartTime,
                        bookingDto.EndTime);

                    if (!isAvailable)
                        return (false, "Thời gian đã được đặt, vui lòng chọn thời gian khác");
                }

                // Additional business rules can be added here
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

            // Simple phone validation
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
    }
}