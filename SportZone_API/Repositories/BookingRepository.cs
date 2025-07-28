using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using SportZone_API.DTOs;
using SportZone_API.Repository.Interfaces;
using AutoMapper;

namespace SportZone_API.Repository
{
    public class BookingRepository : IBookingRepository
    {
        private readonly SportZoneContext _context;
        private readonly IMapper _mapper;

        public BookingRepository(SportZoneContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        private DateTime CombineDateAndTime(DateOnly date, TimeOnly time)
        {
            return date.ToDateTime(time);
        }
        public async Task<Booking> CreateBookingAsync(BookingCreateDTO bookingDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Validate input
                ValidateBookingInput(bookingDto);

                // Tìm slot available trong Field_booking_schedule với Date và Time riêng biệt
                var slotsQuery = _context.FieldBookingSchedules
                    .Include(s => s.Field)
                        .ThenInclude(f => f.Fac)
                    .Where(s => s.Date == bookingDto.Date &&
                               s.StartTime == bookingDto.StartTime &&
                               s.EndTime == bookingDto.EndTime &&
                               (s.BookingId == null || s.Status == "Available")); // Slot chưa được đặt

                // Apply filters nếu có
                if (bookingDto.FieldId.HasValue)
                {
                    // Nếu chỉ định sân cụ thể
                    slotsQuery = slotsQuery.Where(s => s.FieldId == bookingDto.FieldId.Value);
                }
                else
                {
                    // Apply filters để thu hẹp lựa chọn
                    if (bookingDto.FacilityId.HasValue)
                        slotsQuery = slotsQuery.Where(s => s.Field.FacId == bookingDto.FacilityId.Value);

                    if (bookingDto.CategoryId.HasValue)
                        slotsQuery = slotsQuery.Where(s => s.Field.CategoryId == bookingDto.CategoryId.Value);
                }

                var availableSlots = await slotsQuery.ToListAsync();

                if (!availableSlots.Any())
                {
                    // Log để debug
                    var debugInfo = $"Không tìm thấy slot available cho Date={bookingDto.Date}, StartTime={bookingDto.StartTime}, EndTime={bookingDto.EndTime}";
                    if (bookingDto.FieldId.HasValue) debugInfo += $", FieldId={bookingDto.FieldId}";
                    if (bookingDto.FacilityId.HasValue) debugInfo += $", FacilityId={bookingDto.FacilityId}";
                    if (bookingDto.CategoryId.HasValue) debugInfo += $", CategoryId={bookingDto.CategoryId}";

                    throw new ArgumentException($"Không tìm thấy sân trống tại thời gian này. {debugInfo}");
                }

                // Lấy slot đầu tiên (nếu có nhiều sân cùng thời gian)
                var selectedSlot = availableSlots.FirstOrDefault();
                if (selectedSlot?.FieldId == null)
                    throw new ArgumentException("Slot được chọn không có FieldId hợp lệ");

                // Kiểm tra field có tồn tại và cho phép booking không
                var field = await _context.Fields
                    .Include(f => f.Fac)
                    .FirstOrDefaultAsync(f => f.FieldId == selectedSlot.FieldId);

                if (field == null)
                    throw new ArgumentException($"Sân với ID {selectedSlot.FieldId} không tồn tại");

                if (field.IsBookingEnable != true)
                    throw new ArgumentException($"Sân '{field.FieldName}' không cho phép đặt chỗ");

                if (field.Fac == null)
                    throw new ArgumentException($"Sân '{field.FieldName}' không có thông tin cơ sở");

                // Tạo booking với field_id từ slot, lưu Date và Time riêng biệt
                var booking = new Booking
                {
                    FieldId = selectedSlot.FieldId.Value,
                    UserId = bookingDto.UserId,
                    Title = bookingDto.Title,
                    Date = bookingDto.Date,
                    StartTime = bookingDto.StartTime,
                    EndTime = bookingDto.EndTime,
                    Status = "Pending",
                    StatusPayment = "Pending",
                    CreateAt = DateTime.Now,
                    // Nếu có UserId thì không lưu guest info (database constraint) 
                    // Note: UserId maps to customer_id column in database
                    GuestName = bookingDto.UserId.HasValue ? null : bookingDto.GuestName,
                    GuestPhone = bookingDto.UserId.HasValue ? null : bookingDto.GuestPhone
                };

                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();

                // Update BookingId và Status vào slot đã chọn
                selectedSlot.BookingId = booking.BookingId;
                selectedSlot.Status = "Booked";
                selectedSlot.Notes = bookingDto.Notes; // Có thể thêm notes từ booking
                _context.FieldBookingSchedules.Update(selectedSlot);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return booking;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                // Log chi tiết để debug
                var detailMessage = $"Lỗi khi tạo booking: {ex.Message}";
                if (ex.InnerException != null)
                    detailMessage += $" | Inner: {ex.InnerException.Message}";
                if (ex.InnerException?.InnerException != null)
                    detailMessage += $" | Inner2: {ex.InnerException.InnerException.Message}";

                throw new Exception(detailMessage, ex);
            }
        }

        public async Task<BookingDetailDTO?> GetBookingByIdAsync(int bookingId)
        {
            try
            {
                var booking = await _context.Bookings
                    .Include(b => b.Field)
                        .ThenInclude(f => f.Fac)
                    .Include(b => b.Field)
                        .ThenInclude(f => f.Category)
                    .Include(b => b.Field)
                        .ThenInclude(f => f.FieldPricings)
                    .Include(b => b.User)
                        .ThenInclude(u => u.Customer)
                    .Include(b => b.Orders)
                        .ThenInclude(o => o.OrderServices)
                            .ThenInclude(os => os.Service)
                    .Include(b => b.Orders)
                        .ThenInclude(o => o.Discount)
                    .Include(b => b.FieldBookingSchedules)
                    .FirstOrDefaultAsync(b => b.BookingId == bookingId);

                if (booking == null)
                    return null;

                return BookingMapper.MapToBookingDetailDTO(booking);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy chi tiết booking: {ex.Message}", ex);
            }
        }

        public async Task<Booking?> GetBookingEntityByIdAsync(int bookingId)
        {
            try
            {
                return await _context.Bookings
                    .Include(b => b.Field)
                    .FirstOrDefaultAsync(b => b.BookingId == bookingId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy booking entity: {ex.Message}", ex);
            }
        }

        private void ValidateBookingInput(BookingCreateDTO bookingDto)
        {
            if (bookingDto.StartTime >= bookingDto.EndTime)
                throw new ArgumentException("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc");

            // Check if booking is in the past
            var bookingDateTime = CombineDateAndTime(bookingDto.Date, bookingDto.StartTime);
            if (bookingDateTime <= DateTime.Now)
                throw new ArgumentException("Không thể đặt sân trong quá khứ");

            // Validate customer vs guest
            if (!bookingDto.UserId.HasValue)
            {
                // Chỉ yêu cầu thông tin guest khi không có customer
                if (string.IsNullOrEmpty(bookingDto.GuestName) || string.IsNullOrEmpty(bookingDto.GuestPhone))
                    throw new ArgumentException("Cần có thông tin guest (tên và số điện thoại) khi không có customer");
            }
            // Nếu có CustomerId thì sử dụng thông tin customer, bỏ qua guest info

            // Validate filter logic
            if (!bookingDto.FieldId.HasValue && !bookingDto.FacilityId.HasValue && !bookingDto.CategoryId.HasValue)
            {
                
            }
        }

        public async Task<bool> CheckTimeSlotAvailabilityAsync(int fieldId, DateOnly date, TimeOnly startTime, TimeOnly endTime)
        {
            try
            {
                // Kiểm tra slot trong Field_booking_schedule có available không
                var existingSlot = await _context.FieldBookingSchedules
                    .FirstOrDefaultAsync(s => s.FieldId == fieldId &&
                                             s.Date == date &&
                                             s.StartTime == startTime &&
                                             s.EndTime == endTime);

                // Nếu không có slot nào thì không available
                if (existingSlot == null)
                    return false;

                // Slot available nếu chưa có BookingId hoặc Status là Available
                return existingSlot.BookingId == null || existingSlot.Status == "Available";
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi kiểm tra slot availability: {ex.Message}", ex);
            }
        }

        private decimal CalculateBookingAmount(decimal fieldPrice, DateTime startTime, DateTime endTime)
        {
            var duration = endTime - startTime;
            var hours = (decimal)duration.TotalHours;
            return fieldPrice * hours;
        }

        public async Task<bool> CancelBookingAsync(int bookingId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            // Check Slot dddddd
            try
            {
                var booking = await _context.Bookings
                    .Include(b => b.Orders)
                    .FirstOrDefaultAsync(b => b.BookingId == bookingId);
                if (booking == null)
                {
                    return false;
                }
                booking.Status = "Cancelled";
                booking.StatusPayment = "Cancelled";

                var scheduleSlots = await _context.FieldBookingSchedules
                    .Where(s => s.BookingId == bookingId)
                    .ToListAsync();
                foreach(var slot in scheduleSlots)
                {
                    slot.BookingId = null;
                    slot.Status = "Available";
                    slot.Notes = null;
                }

                _context.FieldBookingSchedules.UpdateRange(scheduleSlots);
                _context.Bookings.Update(booking);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch(Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<BookingResponseDTO>> GetBookingsByUserAsync(int userId)
        {
            try
            {
                var bookings = await _context.Bookings
                    .Include(b => b.Field)
                        .ThenInclude(f => f.Fac)
                    .Include(b => b.User)
                    .Include(b => b.FieldBookingSchedules)
                        .ThenInclude(s => s.Price)
                    .Where(b => b.UserId == userId)
                    .OrderByDescending(b => b.CreateAt)
                    .ToListAsync();

                return bookings.Select(BookingMapper.MapToBookingResponseDTO);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy booking theo customer: {ex.Message}", ex);
            }
        }
    }
}
