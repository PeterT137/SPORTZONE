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

        public async Task<Booking> CreateBookingAsync(BookingCreateDTO bookingDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Validate input
                ValidateBookingInput(bookingDto);

                // Kiểm tra field availability với lock
                var field = await _context.Fields
                    .Include(f => f.Fac)
                    .FirstOrDefaultAsync(f => f.FieldId == bookingDto.FieldId);

                if (field == null)
                    throw new ArgumentException("Sân không tồn tại");

                if (field.IsBookingEnable != true)
                    throw new ArgumentException("Sân này không cho phép đặt chỗ");

                // Kiểm tra conflict
                if (await CheckTimeConflictAsync(bookingDto.FieldId, bookingDto.StartTime, bookingDto.EndTime))
                    throw new ArgumentException("Thời gian đã có người đặt");

                // Tạo booking
                var booking = new Booking
                {
                    FieldId = bookingDto.FieldId,
                    CustomerId = bookingDto.CustomerId,
                    Title = bookingDto.Title,
                    StartTime = bookingDto.StartTime,
                    EndTime = bookingDto.EndTime,
                    Status = "Confirmed",
                    StatusPayment = "Pending",
                    CreateAt = DateTime.Now,
                    // Nếu có CustomerId thì không lưu guest info (database constraint)
                    GuestName = bookingDto.CustomerId.HasValue ? null : bookingDto.GuestName,
                    GuestPhone = bookingDto.CustomerId.HasValue ? null : bookingDto.GuestPhone
                };

                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();

                // Tạo schedule
                var schedule = new FieldBookingSchedule
                {
                    FieldId = bookingDto.FieldId,
                    BookingId = booking.BookingId,
                    StartTime = bookingDto.StartTime,
                    EndTime = bookingDto.EndTime,
                    Notes = bookingDto.Notes
                };

                _context.FieldBookingSchedules.Add(schedule);

                // Tạo order
                var totalAmount = CalculateBookingAmount(field.Price ?? 0, bookingDto.StartTime, bookingDto.EndTime);

                var order = new Order
                {
                    CustomerId = bookingDto.CustomerId,
                    FacId = (int)field.FacId,
                    BookingId = booking.BookingId,
                    // Nếu có CustomerId thì không lưu guest info (database constraint)
                    GuestName = bookingDto.CustomerId.HasValue ? null : bookingDto.GuestName,
                    GuestPhone = bookingDto.CustomerId.HasValue ? null : bookingDto.GuestPhone,
                    TotalAmount = totalAmount,
                    StatusPayment = "Pending",
                    CreateAt = DateTime.Now
                };

                _context.Orders.Add(order);

                // Save để có OrderId
                await _context.SaveChangesAsync();

                // Tạo order field link sau khi có OrderId
                var orderField = new OrderFieldId
                {
                    OrderId = order.OrderId,
                    FieldId = bookingDto.FieldId
                };

                _context.OrderFieldIds.Add(orderField);
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

        private void ValidateBookingInput(BookingCreateDTO bookingDto)
        {
            if (bookingDto.StartTime >= bookingDto.EndTime)
                throw new ArgumentException("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc");

            if (bookingDto.StartTime <= DateTime.Now)
                throw new ArgumentException("Không thể đặt sân trong quá khứ");

            // Validate customer vs guest
            if (!bookingDto.CustomerId.HasValue)
            {
                // Chỉ yêu cầu thông tin guest khi không có customer
                if (string.IsNullOrEmpty(bookingDto.GuestName) || string.IsNullOrEmpty(bookingDto.GuestPhone))
                    throw new ArgumentException("Cần có thông tin guest (tên và số điện thoại) khi không có customer");
            }
            // Nếu có CustomerId thì sử dụng thông tin customer, bỏ qua guest info
        }

        public async Task<bool> CheckTimeConflictAsync(int fieldId, DateTime startTime, DateTime endTime, int? excludeBookingId = null)
        {
            try
            {
                var query = _context.FieldBookingSchedules
                    .Where(s => s.FieldId == fieldId &&
                                s.StartTime < endTime &&
                                s.EndTime > startTime);
                if (excludeBookingId.HasValue)
                {
                    query = query.Where(s => s.BookingId != excludeBookingId.Value);
                }
                return await query.AnyAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("Error checking time conflict: " + ex.Message);
            }
        }

        private decimal CalculateBookingAmount(decimal fieldPrice, DateTime startTime, DateTime endTime)
        {
            var duration = endTime - startTime;
            var hours = (decimal)duration.TotalHours;
            return fieldPrice * hours;
        }

        private BookingResponseDTO MapToBookingResponseDTO(Booking booking)
        {
            return new BookingResponseDTO
            {
                BookingId = booking.BookingId,
                FieldId = booking.FieldId,
                FieldName = booking.Field?.FieldName,
                FacilityName = $"Cơ sở {booking.Field?.FacId}",
                FacilityAddress = booking.Field?.Fac?.Address,
                CustomerId = booking.CustomerId,
                CustomerName = booking.Customer?.Name,
                Title = booking.Title,
                StartTime = booking.StartTime,
                EndTime = booking.EndTime,
                Status = booking.Status,
                StatusPayment = booking.StatusPayment,
                CreateAt = booking.CreateAt,
                GuestName = booking.GuestName,
                GuestPhone = booking.GuestPhone,
                FieldPrice = booking.Field?.Price,
                TotalAmount = booking.Orders?.FirstOrDefault()?.TotalAmount
            };
        }
        private BookingDetailDTO MapToBookingDetailDTO(Booking booking)
        {
            var detail = new BookingDetailDTO();

            // Map basic properties from booking response
            var basicData = MapToBookingResponseDTO(booking);
            detail.BookingId = basicData.BookingId;
            detail.FieldId = basicData.FieldId;
            detail.FieldName = basicData.FieldName;
            detail.FacilityName = basicData.FacilityName;
            detail.FacilityAddress = basicData.FacilityAddress;
            detail.CustomerId = basicData.CustomerId;
            detail.CustomerName = basicData.CustomerName;
            detail.Title = basicData.Title;
            detail.StartTime = basicData.StartTime;
            detail.EndTime = basicData.EndTime;
            detail.Status = basicData.Status;
            detail.StatusPayment = basicData.StatusPayment;
            detail.CreateAt = basicData.CreateAt;
            detail.GuestName = basicData.GuestName;
            detail.GuestPhone = basicData.GuestPhone;
            detail.FieldPrice = basicData.FieldPrice;
            detail.TotalAmount = basicData.TotalAmount;

            // Map additional details
            if (booking.Field != null)
            {
                detail.Field = new FieldInfoDTO
                {
                    FieldId = booking.Field.FieldId,
                    FieldName = booking.Field.FieldName,
                    Description = booking.Field.Description,
                    Price = booking.Field.Price,
                    CategoryName = booking.Field.Category?.CategoryFieldName,
                    Facility = booking.Field.Fac != null ? new FacilityInfoDTO
                    {
                        FacId = booking.Field.Fac.FacId,
                        Address = booking.Field.Fac.Address,
                        OpenTime = booking.Field.Fac.OpenTime,
                        CloseTime = booking.Field.Fac.CloseTime,
                        Description = booking.Field.Fac.Description
                    } : null
                };
            }

            if (booking.Customer != null)
            {
                detail.Customer = new CustomerInfoDTO
                {
                    CustomerId = booking.Customer.CustomerId,
                    Name = booking.Customer.Name,
                    Phone = booking.Customer.Phone,
                    Email = booking.Customer.UIdNavigation?.UEmail
                };
            }

            var order = booking.Orders?.FirstOrDefault();
            if (order != null)
            {
                detail.Order = new OrderInfoDTO
                {
                    OrderId = order.OrderId,
                    TotalAmount = order.TotalAmount,
                    StatusPayment = order.StatusPayment,
                    ContentPayment = order.ContentPayment,
                    CreateAt = order.CreateAt,
                    Services = order.OrderServices?.Select(os => new BookingServiceDTO
                    {
                        ServiceId = os.ServiceId ?? 0,
                        ServiceName = os.Service?.ServiceName,
                        Price = os.Price,
                        Quantity = os.Quantity,
                        TotalPrice = os.Price * os.Quantity
                    }).ToList(),
                    Discount = order.Discount != null ? new DiscountInfoDTO
                    {
                        DiscountId = order.Discount.DiscountId,
                        DiscountPercentage = order.Discount.DiscountPercentage,
                        Description = order.Discount.Description
                    } : null
                };
            }

            return detail;
        }
    }
}
