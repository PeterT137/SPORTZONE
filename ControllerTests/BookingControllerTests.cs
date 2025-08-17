using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Moq;
using SportZone_API.Controllers;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Services.Interfaces;
using Xunit;
using SportZone_API.Repository.Interfaces;

namespace SportZone_API.Tests.Controllers
{
    public class BookingControllerTests
    {
        private readonly Mock<IBookingService> _bookingServiceMock;
        private readonly Mock<IOrderService> _orderServiceMock;
        private readonly Mock<IOrderFieldIdService> _orderFieldIdServiceMock;
        private readonly Mock<IFieldService> _fieldServiceMock;
        private readonly BookingController _controller;

        public BookingControllerTests()
        {
            _bookingServiceMock = new Mock<IBookingService>();
            _orderServiceMock = new Mock<IOrderService>();
            _orderFieldIdServiceMock = new Mock<IOrderFieldIdService>();
            _fieldServiceMock = new Mock<IFieldService>();

            _controller = new BookingController(
                _bookingServiceMock.Object,
                _orderServiceMock.Object,
                _orderFieldIdServiceMock.Object,
                _fieldServiceMock.Object
            );
        }

        // TC_Booking_1
        [Fact]
        public async Task CreateGuestBooking_ValidData_ReturnsCreated()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "Đặt sân A",
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = 1,
                GuestName = "Nguyễn Văn A",
                GuestPhone = "0912345678",
            };

            var mockBooking = new BookingDetailDTO
            {
                BookingId = 1,
                Title = "Đặt sân A",
                GuestName = "Nguyễn Văn A",
                GuestPhone = "0912345678",
                FieldId = 1,
                CreateAt = DateTime.Now,
                BookedSlots = new List<BookingSlotDetailDTO> 
                {
                    new BookingSlotDetailDTO 
                    {
                        ScheduleId = 1,
                        Date = new DateOnly(2025, 8, 5),
                        StartTime = new TimeOnly(8, 0),
                        EndTime = new TimeOnly(9, 0)
                    },
                    new BookingSlotDetailDTO 
                    {
                        ScheduleId = 2,
                        Date = new DateOnly(2025, 8, 5),
                        StartTime = new TimeOnly(9, 0),
                        EndTime = new TimeOnly(10, 0)
                    }
                }
            };

            var mockField = new Field
            {
                FieldId = 1,
                FieldName = "Sân A",
                FacId = 1
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ReturnsAsync(mockBooking);

            _bookingServiceMock.Setup(s => s.GetBookingDetailAsync(1))
                .ReturnsAsync(mockBooking);

            _fieldServiceMock.Setup(s => s.GetFieldEntityByIdAsync(1))
                .ReturnsAsync(mockField);

            _orderServiceMock.Setup(s => s.CreateOrderFromBookingAsync(It.IsAny<Booking>(), It.IsAny<int?>()))
                .ReturnsAsync(new OrderDTO { OrderId = 1, BookingId = 1, FacId = 1, TotalPrice = 200000 });

            _orderFieldIdServiceMock.Setup(s => s.CreateOrderFieldIdAsync(1, 1))
                .ReturnsAsync(new OrderFieldIdDTO { OrderFieldId1 = 1, OrderId = 1, FieldId = 1 });

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            var json = JsonSerializer.Serialize(createdResult.Value);
            using var doc = JsonDocument.Parse(json);

            // Verify success response
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Tạo booking thành công", doc.RootElement.GetProperty("message").GetString());
            var data = doc.RootElement.GetProperty("data");
            Assert.Equal(1, data.GetProperty("BookingId").GetInt32());
            Assert.Equal("Đặt sân A", data.GetProperty("Title").GetString());
            Assert.Equal("Nguyễn Văn A", data.GetProperty("GuestName").GetString());
            Assert.Equal("0912345678", data.GetProperty("GuestPhone").GetString());
            Assert.Equal("GetBookingDetail", createdResult.ActionName);
            Assert.Equal(1, createdResult.RouteValues["id"]);
        }

        // TC_Booking(BE)
        [Fact]
        public async Task CreateGuestBooking_VerifyOrderCreation_ReturnsCreated()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "Đặt sân A",
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = 1,
                GuestName = "Nguyễn Văn A",
                GuestPhone = "0912345678"
            };

            var mockBooking = new BookingDetailDTO
            {
                BookingId = 1,
                Title = "Đặt sân A",
                GuestName = "Nguyễn Văn A",
                GuestPhone = "0912345678",
                FieldId = 1,
                CreateAt = DateTime.Now,
                BookedSlots = new List<BookingSlotDetailDTO>
                {
                    new BookingSlotDetailDTO
                    {
                        ScheduleId = 1,
                        Date = new DateOnly(2025, 8, 5),
                        StartTime = new TimeOnly(8, 0),
                        EndTime = new TimeOnly(9, 0)
                    }
                }
            };

            var mockField = new Field
            {
                FieldId = 1,
                FieldName = "Sân A",
                FacId = 1
            };

            var expectedOrder = new OrderDTO
            {
                OrderId = 1,
                BookingId = 1,
                FacId = 1,
                TotalPrice = 200000,
                CreateAt = DateTime.Now,
                StatusPayment = "Pending"
            };

            var expectedOrderFieldId = new OrderFieldIdDTO
            {
                OrderFieldId1 = 1,
                OrderId = 1,
                FieldId = 1
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ReturnsAsync(mockBooking);

            _bookingServiceMock.Setup(s => s.GetBookingDetailAsync(1))
                .ReturnsAsync(mockBooking);

            _fieldServiceMock.Setup(s => s.GetFieldEntityByIdAsync(1))
                .ReturnsAsync(mockField);

            _orderServiceMock.Setup(s => s.CreateOrderFromBookingAsync(It.IsAny<Booking>(), It.IsAny<int?>()))
                .ReturnsAsync(expectedOrder);

            _orderFieldIdServiceMock.Setup(s => s.CreateOrderFieldIdAsync(1, 1))
                .ReturnsAsync(expectedOrderFieldId);

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);

            _orderServiceMock.Verify(s => s.CreateOrderFromBookingAsync(
                It.Is<Booking>(b => b.BookingId == 1),
                It.IsAny<int?>()), Times.Once);

            _orderFieldIdServiceMock.Verify(s => s.CreateOrderFieldIdAsync(1, 1), Times.Once);

            var json = JsonSerializer.Serialize(createdResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Tạo booking thành công", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking_2
        [Fact]
        public async Task CreateGuestBooking_WithoutGuestName_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "Đặt sân A",
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = 1,
                GuestName = "",
                GuestPhone = "0912345678"
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ThrowsAsync(new ArgumentException("Tên khách là bắt buộc cho booking khách lẻ"));

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Tên khách là bắt buộc cho booking khách lẻ", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking_3
        [Fact]
        public async Task CreateGuestBooking_WithoutGuestPhone_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "Đặt sân A",
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = 1,
                GuestName = "Nguyễn Văn A",
                GuestPhone = ""
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ThrowsAsync(new ArgumentException("Số điện thoại là bắt buộc cho booking khách lẻ"));

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Số điện thoại là bắt buộc cho booking khách lẻ", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking_4
        [Fact]
        public async Task CreateGuestBooking_WithoutGuestNameAndPhone_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "Đặt sân A",
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = 1,
                GuestName = "",
                GuestPhone = "" 
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ThrowsAsync(new ArgumentException("Tên khách và số điện thoại là bắt buộc cho booking khách lẻ"));

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Tên khách và số điện thoại là bắt buộc cho booking khách lẻ", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking_5
        [Fact]
        public async Task CreateGuestBooking_WithoutDate_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "Đặt sân A",
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = 1,
                GuestName = "Nguyễn Văn A",
                GuestPhone = "0912345678"
                // Date is null/empty
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ThrowsAsync(new ArgumentException("Ngày đặt sân là bắt buộc"));

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Ngày đặt sân là bắt buộc", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking(BE)
        [Fact]
        public async Task CreateGuestBooking_WithoutStartTime_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "Đặt sân A",
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = 1,
                GuestName = "Nguyễn Văn A",
                GuestPhone = "0912345678"
                // StartTime is null/empty
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ThrowsAsync(new ArgumentException("Thời gian bắt đầu là bắt buộc"));

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Thời gian bắt đầu là bắt buộc", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking(BE)
        [Fact]
        public async Task CreateGuestBooking_WithoutEndTime_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "Đặt sân A",
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = 1,
                GuestName = "Nguyễn Văn A",
                GuestPhone = "0912345678"
                // EndTime is null/empty
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ThrowsAsync(new ArgumentException("Thời gian kết thúc là bắt buộc"));

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Thời gian kết thúc là bắt buộc", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking(BE)
        [Fact]
        public async Task CreateGuestBooking_EndTimeBeforeStartTime_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "Đặt sân A",
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = 1,
                GuestName = "Nguyễn Văn A",
                GuestPhone = "0912345678"
                // StartTime: 10:00, EndTime: 09:00 
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ThrowsAsync(new ArgumentException("Thời gian kết thúc phải sau thời gian bắt đầu"));

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Thời gian kết thúc phải sau thời gian bắt đầu", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking_6
        [Fact]
        public async Task CreateGuestBooking_TitleTooLong_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "A".PadRight(101, 'A'), 
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = 1,
                GuestName = "Nguyễn Văn A",
                GuestPhone = "0912345678"
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ThrowsAsync(new ArgumentException("Tiêu đề không được quá 100 ký tự"));

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Tiêu đề không được quá 100 ký tự", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking_7
        [Fact]
        public async Task CreateGuestBooking_GuestNameTooLong_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "Đặt sân A",
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = 1,
                GuestName = "B".PadRight(101, 'B'), 
                GuestPhone = "0912345678"
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ThrowsAsync(new ArgumentException("Tên khách không được quá 100 ký tự"));

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Tên khách không được quá 100 ký tự", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking_8
        [Fact]
        public async Task CreateGuestBooking_GuestPhoneTooLong_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "Đặt sân A",
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = 1,
                GuestName = "Nguyễn Văn A",
                GuestPhone = "012345678901234567890" 
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ThrowsAsync(new ArgumentException("Số điện thoại không được quá 20 ký tự"));

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Số điện thoại không được quá 20 ký tự", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking_9
        [Fact]
        public async Task CreateGuestBooking_GuestPhoneWithLetters_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "Đặt sân A",
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = 1,
                GuestName = "Nguyễn Văn A",
                GuestPhone = "0912345678a" 
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ThrowsAsync(new ArgumentException("Số điện thoại chỉ được chứa chữ số"));

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Số điện thoại chỉ được chứa chữ số", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking(BE)
        [Fact]
        public async Task CreateGuestBooking_InvalidFacilityId_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "Đặt sân A",
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = 1,
                GuestName = "Nguyễn Văn A",
                GuestPhone = "0912345678",
                FacilityId = -1 
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ThrowsAsync(new ArgumentException("Facility ID không hợp lệ"));

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Facility ID không hợp lệ", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking(BE)
        [Fact]
        public async Task CreateGuestBooking_InvalidFacilityIdAndFieldId_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "Đặt sân A",
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = -1,
                GuestName = "Nguyễn Văn A",
                GuestPhone = "0912345678",
                FacilityId = -1 
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ThrowsAsync(new ArgumentException("Facility ID và Field ID không hợp lệ"));

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Facility ID và Field ID không hợp lệ", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking_10
        [Fact]
        public async Task CreateCustomerBooking_ValidData_ReturnsCreated()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "Đặt sân A",
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = 1,
                UserId = 1, 
                ServiceIds = new List<int> { 1, 2 }, 
                DiscountId = 1 
            };

            var mockBooking = new BookingDetailDTO
            {
                BookingId = 1,
                Title = "Đặt sân A",
                UserId = 1,
                CustomerName = "Nguyễn Văn A",
                FieldId = 1,
                CreateAt = DateTime.Now,
                BookedSlots = new List<BookingSlotDetailDTO>
                {
                    new BookingSlotDetailDTO
                    {
                        ScheduleId = 1,
                        Date = new DateOnly(2025, 8, 5),
                        StartTime = new TimeOnly(8, 0),
                        EndTime = new TimeOnly(9, 0)
                    },
                    new BookingSlotDetailDTO
                    {
                        ScheduleId = 2,
                        Date = new DateOnly(2025, 8, 5),
                        StartTime = new TimeOnly(9, 0),
                        EndTime = new TimeOnly(10, 0)
                    }
                }
            };

            var mockField = new Field
            {
                FieldId = 1,
                FieldName = "Sân A",
                FacId = 1
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ReturnsAsync(mockBooking);

            _bookingServiceMock.Setup(s => s.GetBookingDetailAsync(1))
                .ReturnsAsync(mockBooking);

            _fieldServiceMock.Setup(s => s.GetFieldEntityByIdAsync(1))
                .ReturnsAsync(mockField);

            _orderServiceMock.Setup(s => s.CreateOrderFromBookingAsync(It.IsAny<Booking>(), It.IsAny<int?>()))
                .ReturnsAsync(new OrderDTO { OrderId = 1, BookingId = 1, FacId = 1, TotalPrice = 200000 });

            _orderFieldIdServiceMock.Setup(s => s.CreateOrderFieldIdAsync(1, 1))
                .ReturnsAsync(new OrderFieldIdDTO { OrderFieldId1 = 1, OrderId = 1, FieldId = 1 });

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            var json = JsonSerializer.Serialize(createdResult.Value);
            using var doc = JsonDocument.Parse(json);

            // Verify success response
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Tạo booking thành công", doc.RootElement.GetProperty("message").GetString());

            // Verify booking data
            var data = doc.RootElement.GetProperty("data");
            Assert.Equal(1, data.GetProperty("BookingId").GetInt32());
            Assert.Equal("Đặt sân A", data.GetProperty("Title").GetString());
            Assert.Equal(1, data.GetProperty("UserId").GetInt32());
            Assert.Equal("Nguyễn Văn A", data.GetProperty("CustomerName").GetString());

            Assert.Equal("GetBookingDetail", createdResult.ActionName);
            Assert.Equal(1, createdResult.RouteValues["id"]);
        }

        // TC_Booking(BE)
        [Fact]
        public async Task CreateCustomerBooking_VerifyOrderCreation_ReturnsCreated()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "Đặt sân A",
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = 1,
                UserId = 1,
                ServiceIds = new List<int> { 1, 2 },
                DiscountId = 1
            };

            var mockBooking = new BookingDetailDTO
            {
                BookingId = 1,
                Title = "Đặt sân A",
                UserId = 1,
                CustomerName = "Nguyễn Văn A",
                FieldId = 1,
                CreateAt = DateTime.Now,
                BookedSlots = new List<BookingSlotDetailDTO>
                {
                    new BookingSlotDetailDTO
                    {
                        ScheduleId = 1,
                        Date = new DateOnly(2025, 8, 5),
                        StartTime = new TimeOnly(8, 0),
                        EndTime = new TimeOnly(9, 0)
                    }
                }
            };

            var mockField = new Field
            {
                FieldId = 1,
                FieldName = "Sân A",
                FacId = 1
            };

            var expectedOrder = new OrderDTO
            {
                OrderId = 1,
                BookingId = 1,
                FacId = 1,
                TotalPrice = 250000, // Higher price due to services
                CreateAt = DateTime.Now,
                StatusPayment = "Pending"
            };

            var expectedOrderFieldId = new OrderFieldIdDTO
            {
                OrderFieldId1 = 1,
                OrderId = 1,
                FieldId = 1
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ReturnsAsync(mockBooking);

            _bookingServiceMock.Setup(s => s.GetBookingDetailAsync(1))
                .ReturnsAsync(mockBooking);

            _fieldServiceMock.Setup(s => s.GetFieldEntityByIdAsync(1))
                .ReturnsAsync(mockField);

            _orderServiceMock.Setup(s => s.CreateOrderFromBookingAsync(It.IsAny<Booking>(), It.IsAny<int?>()))
                .ReturnsAsync(expectedOrder);

            _orderFieldIdServiceMock.Setup(s => s.CreateOrderFieldIdAsync(1, 1))
                .ReturnsAsync(expectedOrderFieldId);

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);

            _orderServiceMock.Verify(s => s.CreateOrderFromBookingAsync(
                It.Is<Booking>(b => b.BookingId == 1),
                It.IsAny<int?>()), Times.Once);

            _orderFieldIdServiceMock.Verify(s => s.CreateOrderFieldIdAsync(1, 1), Times.Once);

            var json = JsonSerializer.Serialize(createdResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Tạo booking thành công", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking(BE)
        [Fact]
        public async Task CreateCustomerBooking_WithoutUserId_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "Đặt sân A",
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = 1
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ThrowsAsync(new ArgumentException("User ID là bắt buộc cho booking khách hàng"));

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("User ID là bắt buộc cho booking khách hàng", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking(BE)
        [Fact]
        public async Task CreateCustomerBooking_InvalidUserId_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "Đặt sân A",
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = 1,
                UserId = -1 // Invalid UserId
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ThrowsAsync(new ArgumentException("User ID không hợp lệ"));

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("User ID không hợp lệ", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking_11
        [Fact]
        public async Task CreateCustomerBooking_WithoutTitle_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "", // Empty title
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = 1,
                UserId = 1
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ThrowsAsync(new ArgumentException("Tiêu đề booking là bắt buộc"));

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Tiêu đề booking là bắt buộc", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking_12
        [Fact]
        public async Task CreateCustomerBooking_TitleTooLong_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "A".PadRight(101, 'A'), 
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = 1,
                UserId = 1
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ThrowsAsync(new ArgumentException("Tiêu đề không được quá 100 ký tự"));

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Tiêu đề không được quá 100 ký tự", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking_13
        [Fact]
        public async Task CreateCustomerBooking_WithoutSelectedSlotIds_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "Đặt sân A",
                SelectedSlotIds = new List<int>(), 
                FieldId = 1,
                UserId = 1
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ThrowsAsync(new ArgumentException("Phải chọn ít nhất 1 slot thời gian"));

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Phải chọn ít nhất 1 slot thời gian", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking(BE)
        [Fact]
        public async Task CreateCustomerBooking_InvalidFieldId_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "Đặt sân A",
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = -1, 
                UserId = 1
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ThrowsAsync(new ArgumentException("Field ID không hợp lệ"));

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Field ID không hợp lệ", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking(BE)
        [Fact]
        public async Task CreateCustomerBooking_InvalidServiceIds_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "Đặt sân A",
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = 1,
                UserId = 1,
                ServiceIds = new List<int> { -1, 999 } // Invalid ServiceIds
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ThrowsAsync(new ArgumentException("Một hoặc nhiều service không tồn tại"));

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Một hoặc nhiều service không tồn tại", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking(BE)
        [Fact]
        public async Task CreateCustomerBooking_InvalidDiscountId_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "Đặt sân A",
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = 1,
                UserId = 1,
                DiscountId = 999 // Invalid DiscountId
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ThrowsAsync(new ArgumentException("Mã giảm giá không tồn tại hoặc đã hết hạn"));

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Mã giảm giá không tồn tại hoặc đã hết hạn", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking_14
        [Fact]
        public async Task CreateCustomerBooking_NotesTooLong_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "Đặt sân A",
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = 1,
                UserId = 1,
                Notes = "C".PadRight(501, 'C') 
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ThrowsAsync(new ArgumentException("Ghi chú không được quá 500 ký tự"));

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Ghi chú không được quá 500 ký tự", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking(BE)
        [Fact]
        public async Task CreateCustomerBooking_InvalidFacilityId_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "Đặt sân A",
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = 1,
                UserId = 1,
                FacilityId = 999 // Invalid FacilityId
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ThrowsAsync(new ArgumentException("Facility ID không tồn tại"));

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Facility ID không tồn tại", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking(BE)
        [Fact]
        public async Task CreateCustomerBooking_InvalidFacilityIdAndFieldId_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new BookingCreateDTO
            {
                Title = "Đặt sân A",
                SelectedSlotIds = new List<int> { 1, 2 },
                FieldId = 999, 
                UserId = 1,
                FacilityId = 999 
            };

            _bookingServiceMock.Setup(s => s.CreateBookingAsync(createDto))
                .ThrowsAsync(new ArgumentException("Facility ID và Field ID không tồn tại"));

            // Act
            var result = await _controller.CreateBooking(createDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Facility ID và Field ID không tồn tại", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking_15
        [Fact]
        public async Task GetBookingById_ValidIdGuestBooking_ReturnsOk()
        {
            // Arrange
            int bookingId = 1;
            var mockBooking = new BookingDetailDTO
            {
                BookingId = 1,
                Title = "Đặt sân A",
                GuestName = "Nguyễn Văn A",
                GuestPhone = "0912345678",
                FieldId = 1,
                CreateAt = DateTime.Now,
                BookedSlots = new List<BookingSlotDetailDTO>
                {
                    new BookingSlotDetailDTO
                    {
                        ScheduleId = 1,
                        Date = new DateOnly(2025, 8, 5),
                        StartTime = new TimeOnly(8, 0),
                        EndTime = new TimeOnly(9, 0)
                    }
                }
            };

            _bookingServiceMock.Setup(s => s.GetBookingDetailAsync(bookingId))
                .ReturnsAsync(mockBooking);

            // Act
            var result = await _controller.GetBookingDetail(bookingId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Lấy chi tiết booking thành công", doc.RootElement.GetProperty("message").GetString());
            var data = doc.RootElement.GetProperty("data");
            Assert.Equal(1, data.GetProperty("BookingId").GetInt32());
            Assert.Equal("Đặt sân A", data.GetProperty("Title").GetString());
            Assert.Equal("Nguyễn Văn A", data.GetProperty("GuestName").GetString());
            Assert.Equal("0912345678", data.GetProperty("GuestPhone").GetString());
            Assert.Equal(1, data.GetProperty("FieldId").GetInt32());
        }

        // TC_Booking_16
        [Fact]
        public async Task GetBookingById_ValidIdCustomerBooking_ReturnsOk()
        {
            // Arrange
            int bookingId = 2;
            var mockBooking = new BookingDetailDTO
            {
                BookingId = 2,
                Title = "Đặt sân B",
                UserId = 1,
                CustomerName = "Trần Thị B",
                FieldId = 2,
                CreateAt = DateTime.Now,
                BookedSlots = new List<BookingSlotDetailDTO>
                {
                    new BookingSlotDetailDTO
                    {
                        ScheduleId = 2,
                        Date = new DateOnly(2025, 8, 6),
                        StartTime = new TimeOnly(14, 0),
                        EndTime = new TimeOnly(16, 0)
                    }
                }
            };

            _bookingServiceMock.Setup(s => s.GetBookingDetailAsync(bookingId))
                .ReturnsAsync(mockBooking);

            // Act
            var result = await _controller.GetBookingDetail(bookingId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Lấy chi tiết booking thành công", doc.RootElement.GetProperty("message").GetString());
            var data = doc.RootElement.GetProperty("data");
            Assert.Equal(2, data.GetProperty("BookingId").GetInt32());
            Assert.Equal("Đặt sân B", data.GetProperty("Title").GetString());
            Assert.Equal(1, data.GetProperty("UserId").GetInt32());
            Assert.Equal("Trần Thị B", data.GetProperty("CustomerName").GetString());
            Assert.Equal(2, data.GetProperty("FieldId").GetInt32());
        }

        // TC_Booking(BE)
        [Fact]
        public async Task GetBookingById_InvalidId_ReturnsNotFound()
        {
            // Arrange
            int bookingId = 999; 

            _bookingServiceMock.Setup(s => s.GetBookingDetailAsync(bookingId))
                .ReturnsAsync((BookingDetailDTO?)null);

            // Act
            var result = await _controller.GetBookingDetail(bookingId);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var json = JsonSerializer.Serialize(notFoundResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Không tìm thấy booking", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking(BE)
        [Fact]
        public async Task GetBookingById_NegativeId_ReturnsBadRequest()
        {
            // Arrange
            int bookingId = -1;

            _bookingServiceMock.Setup(s => s.GetBookingDetailAsync(bookingId))
                .ThrowsAsync(new ArgumentException("Booking ID không hợp lệ"));

            // Act
            var result = await _controller.GetBookingDetail(bookingId);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Booking ID không hợp lệ", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking(BE)
        [Fact]
        public async Task GetBookingById_ZeroId_ReturnsBadRequest()
        {
            // Arrange
            int bookingId = 0;

            _bookingServiceMock.Setup(s => s.GetBookingDetailAsync(bookingId))
                .ThrowsAsync(new ArgumentException("Booking ID không hợp lệ"));

            // Act
            var result = await _controller.GetBookingDetail(bookingId);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Booking ID không hợp lệ", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking_17
        [Fact]
        public async Task GetBookingById_ComplexBookingData_ReturnsOk()
        {
            // Arrange
            int bookingId = 3;
            var mockBooking = new BookingDetailDTO
            {
                BookingId = 3,
                Title = "Đặt sân C với dịch vụ",
                UserId = 2,
                CustomerName = "Lê Văn C",
                FieldId = 3,
                CreateAt = DateTime.Now,
                Notes = "Cần chuẩn bị dụng cụ bóng đá",
                BookedSlots = new List<BookingSlotDetailDTO>
                {
                    new BookingSlotDetailDTO
                    {
                        ScheduleId = 3,
                        Date = new DateOnly(2025, 8, 7),
                        StartTime = new TimeOnly(18, 0),
                        EndTime = new TimeOnly(20, 0)
                    },
                    new BookingSlotDetailDTO
                    {
                        ScheduleId = 4,
                        Date = new DateOnly(2025, 8, 7),
                        StartTime = new TimeOnly(20, 0),
                        EndTime = new TimeOnly(22, 0)
                    }
                },
                Order = new OrderInfoDTO
                {
                    OrderId = 1,
                    TotalAmount = 250000,
                    StatusPayment = "Pending",
                    CreateAt = DateTime.Now,
                    Services = new List<BookingServiceDTO>
                    {
                        new BookingServiceDTO { ServiceId = 1, ServiceName = "Bóng đá", Price = 50000, Quantity = 1, TotalPrice = 50000 },
                        new BookingServiceDTO { ServiceId = 2, ServiceName = "Nước uống", Price = 25000, Quantity = 1, TotalPrice = 25000 }
                    },
                    Discount = new DiscountInfoDTO { DiscountId = 1, DiscountPercentage = 10, Description = "Giảm giá 10%" }
                }
            };

            _bookingServiceMock.Setup(s => s.GetBookingDetailAsync(bookingId))
                .ReturnsAsync(mockBooking);

            // Act
            var result = await _controller.GetBookingDetail(bookingId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);

            // Verify success response
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Lấy chi tiết booking thành công", doc.RootElement.GetProperty("message").GetString());

            // Verify booking data
            var data = doc.RootElement.GetProperty("data");
            Assert.Equal(3, data.GetProperty("BookingId").GetInt32());
            Assert.Equal("Đặt sân C với dịch vụ", data.GetProperty("Title").GetString());
            Assert.Equal(2, data.GetProperty("UserId").GetInt32());
            Assert.Equal("Lê Văn C", data.GetProperty("CustomerName").GetString());
            Assert.Equal(3, data.GetProperty("FieldId").GetInt32());
            Assert.Equal("Cần chuẩn bị dụng cụ bóng đá", data.GetProperty("Notes").GetString());

            // Verify BookedSlots array
            var bookedSlots = data.GetProperty("BookedSlots");
            Assert.Equal(2, bookedSlots.GetArrayLength());

            var firstSlot = bookedSlots[0];
            Assert.Equal(3, firstSlot.GetProperty("ScheduleId").GetInt32());
            Assert.Equal("2025-08-07", firstSlot.GetProperty("Date").GetString());
            Assert.Equal("18:00:00", firstSlot.GetProperty("StartTime").GetString());
            Assert.Equal("20:00:00", firstSlot.GetProperty("EndTime").GetString());

            var secondSlot = bookedSlots[1];
            Assert.Equal(4, secondSlot.GetProperty("ScheduleId").GetInt32());
            Assert.Equal("2025-08-07", secondSlot.GetProperty("Date").GetString());
            Assert.Equal("20:00:00", secondSlot.GetProperty("StartTime").GetString());
            Assert.Equal("22:00:00", secondSlot.GetProperty("EndTime").GetString());
        }

        // TC_Booking_18
        [Fact]
        public async Task GetUserBookings_ValidUserIdWithMultipleBookings_ReturnsOk()
        {
            // Arrange
            int userId = 1;
            var mockBookings = new List<BookingResponseDTO>
            {
                new BookingResponseDTO
                {
                    BookingId = 1,
                    FieldId = 1,
                    FieldName = "Sân A",
                    FacilityName = "SportZone Center",
                    FacilityAddress = "123 Đường ABC, Quận 1, TP.HCM",
                    UserId = 1,
                    CustomerName = "Nguyễn Văn A",
                    Title = "Đặt sân A",
                    Date = new DateOnly(2025, 8, 5),
                    StartTime = new TimeOnly(8, 0),
                    EndTime = new TimeOnly(9, 0),
                    Status = "Confirmed",
                    StatusPayment = "Paid",
                    CreateAt = DateTime.Now.AddDays(-1),
                    FieldPrice = 200000,
                    TotalAmount = 200000,
                    Notes = "Booking đầu tiên"
                },
                new BookingResponseDTO
                {
                    BookingId = 2,
                    FieldId = 2,
                    FieldName = "Sân B",
                    FacilityName = "SportZone Center",
                    FacilityAddress = "123 Đường ABC, Quận 1, TP.HCM",
                    UserId = 1,
                    CustomerName = "Nguyễn Văn A",
                    Title = "Đặt sân B",
                    Date = new DateOnly(2025, 8, 6),
                    StartTime = new TimeOnly(14, 0),
                    EndTime = new TimeOnly(16, 0),
                    Status = "Pending",
                    StatusPayment = "Pending",
                    CreateAt = DateTime.Now,
                    FieldPrice = 300000,
                    TotalAmount = 300000,
                    Notes = "Booking thứ hai"
                }
            };

            _bookingServiceMock.Setup(s => s.GetUserBookingsAsync(userId))
                .ReturnsAsync(mockBookings);

            // Act
            var result = await _controller.GetUserBookings(userId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);

            // Verify success response
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Lấy danh sách booking thành công", doc.RootElement.GetProperty("message").GetString());
            Assert.Equal(1, doc.RootElement.GetProperty("usersId").GetInt32());
            Assert.Equal(2, doc.RootElement.GetProperty("count").GetInt32());

            // Verify bookings data
            var data = doc.RootElement.GetProperty("data");
            Assert.Equal(2, data.GetArrayLength());

            // Verify first booking
            var firstBooking = data[0];
            Assert.Equal(1, firstBooking.GetProperty("BookingId").GetInt32());
            Assert.Equal("Sân A", firstBooking.GetProperty("FieldName").GetString());
            Assert.Equal("SportZone Center", firstBooking.GetProperty("FacilityName").GetString());
            Assert.Equal("Nguyễn Văn A", firstBooking.GetProperty("CustomerName").GetString());
            Assert.Equal("Confirmed", firstBooking.GetProperty("Status").GetString());
            Assert.Equal("Paid", firstBooking.GetProperty("StatusPayment").GetString());

            // Verify second booking
            var secondBooking = data[1];
            Assert.Equal(2, secondBooking.GetProperty("BookingId").GetInt32());
            Assert.Equal("Sân B", secondBooking.GetProperty("FieldName").GetString());
            Assert.Equal("Pending", secondBooking.GetProperty("Status").GetString());
            Assert.Equal("Pending", secondBooking.GetProperty("StatusPayment").GetString());
        }

        // TC_Booking_19
        [Fact]
        public async Task GetUserBookings_ValidUserIdNoBookings_ReturnsNotFound()
        {
            // Arrange
            int userId = 2;
            var emptyBookings = new List<BookingResponseDTO>();

            _bookingServiceMock.Setup(s => s.GetUserBookingsAsync(userId))
                .ReturnsAsync(emptyBookings);

            // Act
            var result = await _controller.GetUserBookings(userId);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var json = JsonSerializer.Serialize(notFoundResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Không tìm thấy booking cho khách hàng này", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking_20
        [Fact]
        public async Task GetUserBookings_ValidUserIdNullBookings_ReturnsNotFound()
        {
            // Arrange
            int userId = 3;

            _bookingServiceMock.Setup(s => s.GetUserBookingsAsync(userId))
                .ReturnsAsync((IEnumerable<BookingResponseDTO>)null);

            // Act
            var result = await _controller.GetUserBookings(userId);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var json = JsonSerializer.Serialize(notFoundResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Không tìm thấy booking cho khách hàng này", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking(BE)
        [Fact]
        public async Task GetUserBookings_NegativeUserId_ReturnsBadRequest()
        {
            // Arrange
            int userId = -1;

            _bookingServiceMock.Setup(s => s.GetUserBookingsAsync(userId))
                .ThrowsAsync(new ArgumentException("User ID không hợp lệ"));

            // Act
            var result = await _controller.GetUserBookings(userId);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("User ID không hợp lệ", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking(BE)
        [Fact]
        public async Task GetUserBookings_ZeroUserId_ReturnsBadRequest()
        {
            // Arrange
            int userId = 0;

            _bookingServiceMock.Setup(s => s.GetUserBookingsAsync(userId))
                .ThrowsAsync(new ArgumentException("User ID không hợp lệ"));

            // Act
            var result = await _controller.GetUserBookings(userId);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("User ID không hợp lệ", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking_21
        [Fact]
        public async Task GetUserBookings_SingleBookingWithServices_ReturnsOk()
        {
            // Arrange
            int userId = 4;
            var mockBookings = new List<BookingResponseDTO>
            {
                new BookingResponseDTO
                {
                    BookingId = 3,
                    FieldId = 3,
                    FieldName = "Sân C",
                    FacilityName = "SportZone Premium",
                    FacilityAddress = "456 Đường XYZ, Quận 2, TP.HCM",
                    UserId = 4,
                    CustomerName = "Trần Thị B",
                    Title = "Đặt sân C với dịch vụ",
                    Date = new DateOnly(2025, 8, 7),
                    StartTime = new TimeOnly(18, 0),
                    EndTime = new TimeOnly(20, 0),
                    Status = "Confirmed",
                    StatusPayment = "Paid",
                    CreateAt = DateTime.Now.AddHours(-2),
                    FieldPrice = 250000,
                    TotalAmount = 325000, // 250000 + 75000 (services)
                    Notes = "Cần chuẩn bị dụng cụ bóng đá",
                    Services = new List<BookingServiceDTO>
                    {
                        new BookingServiceDTO { ServiceId = 1, ServiceName = "Bóng đá", Price = 50000, Quantity = 1, TotalPrice = 50000 },
                        new BookingServiceDTO { ServiceId = 2, ServiceName = "Nước uống", Price = 25000, Quantity = 1, TotalPrice = 25000 }
                    }
                }
            };

            _bookingServiceMock.Setup(s => s.GetUserBookingsAsync(userId))
                .ReturnsAsync(mockBookings);

            // Act
            var result = await _controller.GetUserBookings(userId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);

            // Verify success response
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Lấy danh sách booking thành công", doc.RootElement.GetProperty("message").GetString());
            Assert.Equal(4, doc.RootElement.GetProperty("usersId").GetInt32());
            Assert.Equal(1, doc.RootElement.GetProperty("count").GetInt32());

            // Verify booking data
            var data = doc.RootElement.GetProperty("data");
            Assert.Equal(1, data.GetArrayLength());

            var booking = data[0];
            Assert.Equal(3, booking.GetProperty("BookingId").GetInt32());
            Assert.Equal("Sân C", booking.GetProperty("FieldName").GetString());
            Assert.Equal("SportZone Premium", booking.GetProperty("FacilityName").GetString());
            Assert.Equal("Trần Thị B", booking.GetProperty("CustomerName").GetString());
            Assert.Equal("Confirmed", booking.GetProperty("Status").GetString());
            Assert.Equal("Paid", booking.GetProperty("StatusPayment").GetString());
            Assert.Equal(250000, booking.GetProperty("FieldPrice").GetDecimal());
            Assert.Equal(325000, booking.GetProperty("TotalAmount").GetDecimal());
            Assert.Equal("Cần chuẩn bị dụng cụ bóng đá", booking.GetProperty("Notes").GetString());

            // Verify services
            var services = booking.GetProperty("Services");
            Assert.Equal(2, services.GetArrayLength());

            var firstService = services[0];
            Assert.Equal(1, firstService.GetProperty("ServiceId").GetInt32());
            Assert.Equal("Bóng đá", firstService.GetProperty("ServiceName").GetString());
            Assert.Equal(50000, firstService.GetProperty("Price").GetDecimal());

            var secondService = services[1];
            Assert.Equal(2, secondService.GetProperty("ServiceId").GetInt32());
            Assert.Equal("Nước uống", secondService.GetProperty("ServiceName").GetString());
            Assert.Equal(25000, secondService.GetProperty("Price").GetDecimal());
        }

        // TC_Booking_22
        [Fact]
        public async Task CancelBooking_ValidId_ReturnsOk()
        {
            // Arrange
            int bookingId = 1;

            _bookingServiceMock.Setup(s => s.CancelBookingAsync(bookingId))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.CancelBooking(bookingId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Hủy booking thành công", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking_23
        [Fact]
        public async Task CancelBooking_InvalidId_ReturnsNotFound()
        {
            // Arrange
            int bookingId = 999; // Non-existent booking ID

            _bookingServiceMock.Setup(s => s.CancelBookingAsync(bookingId))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.CancelBooking(bookingId);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var json = JsonSerializer.Serialize(notFoundResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Không tìm thấy booking hoặc không thể hủy", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking(BE)
        [Fact]
        public async Task CancelBooking_NegativeId_ReturnsBadRequest()
        {
            // Arrange
            int bookingId = -1;

            _bookingServiceMock.Setup(s => s.CancelBookingAsync(bookingId))
                .ThrowsAsync(new ArgumentException("Booking ID không hợp lệ"));

            // Act
            var result = await _controller.CancelBooking(bookingId);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Booking ID không hợp lệ", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking(BE)
        [Fact]
        public async Task CancelBooking_ZeroId_ReturnsBadRequest()
        {
            // Arrange
            int bookingId = 0;

            _bookingServiceMock.Setup(s => s.CancelBookingAsync(bookingId))
                .ThrowsAsync(new ArgumentException("Booking ID không hợp lệ"));

            // Act
            var result = await _controller.CancelBooking(bookingId);    

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Booking ID không hợp lệ", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking_24
        [Fact]
        public async Task CancelBooking_TooLateToCancel_ReturnsBadRequest()
        {
            // Arrange
            int bookingId = 1;

            _bookingServiceMock.Setup(s => s.CancelBookingAsync(bookingId))
                .ThrowsAsync(new InvalidOperationException("Không thể hủy booking trong vòng 2 giờ trước giờ bắt đầu"));

            // Act
            var result = await _controller.CancelBooking(bookingId);

            // Assert
            var badRequestResult = Assert.IsType<ObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Không thể hủy booking trong vòng 2 giờ trước giờ bắt đầu", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Booking_25
        [Fact]
        public async Task CancelBooking_RepositoryException_ReturnsInternalServerError()
        {
            // Arrange
            int bookingId = 1;

            _bookingServiceMock.Setup(s => s.CancelBookingAsync(bookingId))
                .ThrowsAsync(new Exception("Lỗi khi hủy booking: Transaction failed"));

            // Act
            var result = await _controller.CancelBooking(bookingId);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);

            var json = JsonSerializer.Serialize(statusCodeResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Lỗi server: Lỗi khi hủy booking: Transaction failed", doc.RootElement.GetProperty("message").GetString());
        }
    }
}

