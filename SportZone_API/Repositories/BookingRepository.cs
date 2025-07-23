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
                           (s.BookingId == null || s.Status == "Available"));

                if (bookingDto.FieldId.HasValue)
                {
                    slotsQuery = slotsQuery.Where(s => s.FieldId == bookingDto.FieldId.Value);
                }
                else
                {
                    if (bookingDto.FacilityId.HasValue)
                    {
                        slotsQuery = slotsQuery.Where(s => s.Field.FacId == bookingDto.FacilityId.Value);
                    }
                    if (bookingDto.CategoryId.HasValue)
                    {
                        slotsQuery = slotsQuery.Where(s => s.Field.CategoryId == bookingDto.CategoryId.Value);
                    }
                }
                var availableSlots = await slotsQuery.ToListAsync();

                if (!availableSlots.Any())
                {
                    throw new ArgumentException("Sân đã có người đặt tại thời gian này");
                }
                
                var selectedSlot = availableSlots.FirstOrDefault();
                if (selectedSlot?.FieldId == null)
                {
                    throw new ArgumentException("Không tìm thấy sân phù hợp");
                }

                var field = await _context.Fields
                    .Include(f => f.Fac)
                    .FirstOrDefaultAsync(f => f.FieldId == selectedSlot.FieldId);

                if (field == null)
                {
                    throw new ArgumentException("Sân không tồn tại");
                }
                if (field.IsBookingEnable != true)
                {
                    throw new ArgumentException("Sân này không cho phép đặt chỗ");
                }

                var booking = new Booking
                {
                    FieldId = selectedSlot.FieldId.Value,
                    CustomerId = bookingDto.CustomerId,
                    Title = bookingDto.Title,
                    Date = bookingDto.Date,
                    StartTime = bookingDto.StartTime,
                    EndTime = bookingDto.EndTime,
                    Status = "Pending",
                    StatusPayment = "Pending",
                    CreateAt = DateTime.Now,
                    // Nếu có CustomerId thì không lưu guest info (database constraint)
                    GuestName = bookingDto.CustomerId.HasValue ? null : bookingDto.GuestName,
                    GuestPhone = bookingDto.CustomerId.HasValue ? null : bookingDto.GuestPhone
                };

                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();

                selectedSlot.BookingId = booking.BookingId;
                selectedSlot.Status = "Booked";
                selectedSlot.Notes = bookingDto.Notes;
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
                    .Include(b => b.Customer)
                        .ThenInclude(c => c.UIdNavigation)
                    .Include(b => b.Orders)
                        .ThenInclude(o => o.OrderServices)
                            .ThenInclude(os => os.Service)
                    .Include(b => b.Orders)
                        .ThenInclude(o => o.Discount)
                    .Include(b => b.FieldBookingSchedules)
                        .ThenInclude(s => s.Prices)
                    .FirstOrDefaultAsync(b => b.BookingId == bookingId);

                if (booking == null)
                    return null;

                return MapToBookingDetailDTO(booking);
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
            if (!bookingDto.CustomerId.HasValue)
            {
                // Chỉ yêu cầu thông tin guest khi không có customer
                if (string.IsNullOrEmpty(bookingDto.GuestName) || string.IsNullOrEmpty(bookingDto.GuestPhone))
                    throw new ArgumentException("Cần có thông tin guest (tên và số điện thoại) khi không có customer");
            }
            // Nếu có CustomerId thì sử dụng thông tin customer, bỏ qua guest info

            // Validate filter logic
            if (!bookingDto.FieldId.HasValue && !bookingDto.FacilityId.HasValue && !bookingDto.CategoryId.HasValue)
            {
                // Nếu không chỉ định sân cụ thể thì phải có ít nhất một filter
                // hoặc cho phép tìm bất kỳ sân nào available (tuỳ business logic)
                // Ở đây tôi cho phép không có filter nào (tìm sân bất kỳ)
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

        public async Task<IEnumerable<BookingResponseDTO>> GetBookingsByCustomerAsync(int customerId)
        {
            try
            {
                var bookings = await _context.Bookings
                    .Include(b => b.Field)
                        .ThenInclude(f => f.Fac)
                    .Include(b => b.Customer)
                    .Include(b => b.FieldBookingSchedules)
                        .ThenInclude(s => s.Prices)
                    .Where(b => b.CustomerId == customerId)
                    .OrderByDescending(b => b.CreateAt)
                    .ToListAsync();

                return bookings.Select(MapToBookingResponseDTO);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy booking theo customer: {ex.Message}", ex);
            }
        }

        private BookingResponseDTO MapToBookingResponseDTO(Booking booking)
        {
            var schedule = booking.FieldBookingSchedules?.FirstOrDefault();
            return new BookingResponseDTO
            {
                BookingId = booking.BookingId,
                FieldId = booking.FieldId,
                FieldName = booking.Field?.FieldName,
                FacilityName = booking.Field?.Fac != null ? $"Cơ sở {booking.Field.FacId}" : null,
                FacilityAddress = booking.Field?.Fac?.Address,
                CustomerId = booking.CustomerId,
                CustomerName = booking.Customer?.Name,
                Title = booking.Title,
                Date = booking.Date,
                StartTime = booking.StartTime,
                EndTime = booking.EndTime,
                Status = booking.Status,
                StatusPayment = booking.StatusPayment,
                CreateAt = booking.CreateAt,
                GuestName = booking.GuestName,
                GuestPhone = booking.GuestPhone,
                FieldPrice = schedule?.Prices?.FirstOrDefault()?.Price1,
                Notes = schedule?.Notes
            };
        }
        private BookingDetailDTO MapToBookingDetailDTO(Booking booking)
        {
            var responseDto = MapToBookingResponseDTO(booking);

            return new BookingDetailDTO
            {
                BookingId = responseDto.BookingId,
                FieldId = responseDto.FieldId,
                FieldName = responseDto.FieldName,
                FacilityName = responseDto.FacilityName,
                FacilityAddress = responseDto.FacilityAddress,
                CustomerId = responseDto.CustomerId,
                CustomerName = responseDto.CustomerName,
                Title = responseDto.Title,
                Date = responseDto.Date,
                StartTime = responseDto.StartTime,
                EndTime = responseDto.EndTime,
                Status = responseDto.Status,
                StatusPayment = responseDto.StatusPayment,
                CreateAt = responseDto.CreateAt,
                GuestName = responseDto.GuestName,
                GuestPhone = responseDto.GuestPhone,
                FieldPrice = responseDto.FieldPrice,
                Notes = responseDto.Notes,

                Field = booking.Field != null ? new FieldInfoDTO
                {
                    FieldId = booking.Field.FieldId,
                    FieldName = booking.Field.FieldName,
                    Description = booking.Field.Description,
                    Price = booking.FieldBookingSchedules?.FirstOrDefault()?.Prices?.FirstOrDefault()?.Price1,
                    CategoryName = booking.Field.Category?.CategoryFieldName,
                    Facility = booking.Field.Fac != null ? new FacilityInfoDTO
                    {
                        FacId = booking.Field.Fac.FacId,
                        Address = booking.Field.Fac.Address,
                        OpenTime = booking.Field.Fac.OpenTime,
                        CloseTime = booking.Field.Fac.CloseTime,
                        Description = booking.Field.Fac.Description
                    } : null
                } : null,

                Customer = booking.Customer != null ? new CustomerInfoDTO
                {
                    CustomerId = booking.Customer.CustomerId,
                    Name = booking.Customer.Name,
                    Phone = booking.Customer.Phone,
                    Email = booking.Customer.UIdNavigation?.UEmail
                } : null,

                Order = booking.Orders?.FirstOrDefault() != null ? new OrderInfoDTO
                {
                    OrderId = booking.Orders.First().OrderId,
                    TotalAmount = booking.Orders.First().TotalAmount,
                    StatusPayment = booking.Orders.First().StatusPayment,
                    ContentPayment = booking.Orders.First().ContentPayment,
                    CreateAt = booking.Orders.First().CreateAt,
                    Services = booking.Orders.First().OrderServices?.Select(os => new BookingServiceDTO
                    {
                        ServiceId = os.Service?.ServiceId ?? 0,
                        ServiceName = os.Service?.ServiceName,
                        Price = os.Service?.Price,
                        Quantity = os.Quantity,
                        TotalPrice = (os.Service?.Price ?? 0) * (os.Quantity ?? 1)
                    }).ToList(),
                    Discount = booking.Orders.First().Discount != null ? new DiscountInfoDTO
                    {
                        DiscountId = booking.Orders.First().Discount.DiscountId,
                        DiscountPercentage = booking.Orders.First().Discount.DiscountPercentage,
                        Description = booking.Orders.First().Discount.Description
                    } : null
                } : null
            };
        }
    }
}
