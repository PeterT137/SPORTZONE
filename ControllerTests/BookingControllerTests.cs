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
    }
}

