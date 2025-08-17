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
    public class OrderControllerTests
    {
        private readonly Mock<IOrderService> _orderServiceMock;
        private readonly OrderController _controller;

        public OrderControllerTests()
        {
            _orderServiceMock = new Mock<IOrderService>();
            _controller = new OrderController(_orderServiceMock.Object);
        }

        // TC_Order_1
        [Fact]
        public async Task GetOrderDetails_ValidId_ReturnsOk()
        {
            // Arrange
            int orderId = 1;
            var mockOrder = new OrderDTO
            {
                OrderId = 1,
                UId = 1,
                FacId = 1,
                BookingId = 1,
                GuestName = "Nguyễn Văn A",
                GuestPhone = "0912345678",
                TotalPrice = 200000,
                TotalServicePrice = 50000,
                ContentPayment = "VNPay",
                StatusPayment = "Paid",
                CreateAt = DateTime.Now,
                Services = new List<OrderDetailServiceDTO>
                {
                    new OrderDetailServiceDTO
                    {
                        ServiceId = 1,
                        ServiceName = "Bóng đá",
                        Price = 50000,
                        Quantity = 1,
                        ImageUrl = "ball.jpg"
                    }
                }
            };

            _orderServiceMock.Setup(s => s.GetOrderByIdAsync(orderId))
                .ReturnsAsync(mockOrder);

            // Act
            var result = await _controller.GetOrderDetails(orderId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<OrderDTO>(okResult.Value);
            Assert.Equal(1, response.OrderId);
            Assert.Equal("Nguyễn Văn A", response.GuestName);
            Assert.Equal("Paid", response.StatusPayment);
            Assert.Equal(200000, response.TotalPrice);
        }

        // TC_Order_2
        [Fact]
        public async Task GetOrderDetails_InvalidId_ReturnsInternalServerError()
        {
            // Arrange
            int orderId = 999;

            _orderServiceMock.Setup(s => s.GetOrderByIdAsync(orderId))
                .ReturnsAsync((OrderDTO?)null);

            // Act
            var result = await _controller.GetOrderDetails(orderId);

            // Assert
            var statusCodeResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, statusCodeResult.StatusCode);
            Assert.Contains("Error retrieving order", statusCodeResult.Value.ToString());
        }

        // TC_Order_3
        [Fact]
        public async Task GetOrderDetails_ServiceException_ReturnsInternalServerError()
        {
            // Arrange
            int orderId = 1;

            _orderServiceMock.Setup(s => s.GetOrderByIdAsync(orderId))
                .ThrowsAsync(new Exception("Database connection failed"));

            // Act
            var result = await _controller.GetOrderDetails(orderId);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            Assert.Contains("Error retrieving order", statusCodeResult.Value.ToString());
        }

        // TC_Order_4
        [Fact]
        public async Task UpdateOrderContentPayment_ValidData_ReturnsOk()
        {
            // Arrange
            int orderId = 1;
            int option = 1; 
            var mockOrder = new OrderDTO
            {
                OrderId = 1,
                ContentPayment = "Thanh toán tiền mặt",
                StatusPayment = "Pending"
            };

            _orderServiceMock.Setup(s => s.UpdateOrderContentPaymentAsync(orderId, option))
                .ReturnsAsync(mockOrder);

            // Act
            var result = await _controller.UpdateOrderContentPayment(orderId, option);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<OrderDTO>(okResult.Value);
            Assert.Equal(1, response.OrderId);
            Assert.Equal("Thanh toán tiền mặt", response.ContentPayment);
        }

        // TC_Order_5
        [Fact]
        public async Task UpdateOrderContentPayment_InvalidOrderId_ReturnsInternalServerError()
        {
            // Arrange
            int orderId = 999;
            int option = 1;

            _orderServiceMock.Setup(s => s.UpdateOrderContentPaymentAsync(orderId, option))
                .ReturnsAsync((OrderDTO?)null);

            // Act
            var result = await _controller.UpdateOrderContentPayment(orderId, option);

            // Assert
            var statusCodeResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            Assert.Contains("Error updating order content payment", statusCodeResult.Value.ToString());
        }

        // TC_Order_6
        [Fact]
        public async Task UpdateOrderStatusPayment_ValidOrderId_ReturnsOk()
        {
            // Arrange
            int orderId = 1;
            var mockOrder = new OrderDTO
            {
                OrderId = 1,
                StatusPayment = "Success",
                ContentPayment = "Thanh toán tiền mặt"
            };

            _orderServiceMock.Setup(s => s.UpdateOrderStatusPaymentAsync(orderId))
                .ReturnsAsync(mockOrder);

            // Act
            var result = await _controller.UpdateOrderStatusPayment(orderId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<OrderDTO>(okResult.Value);
            Assert.Equal(1, response.OrderId);
            Assert.Equal("Success", response.StatusPayment);
        }

        // TC_Order_7
        [Fact]
        public async Task UpdateOrderStatusPayment_InvalidOrderId_ReturnsInternalServerError()
        {
            // Arrange
            int orderId = 999;

            _orderServiceMock.Setup(s => s.UpdateOrderStatusPaymentAsync(orderId))
                .ReturnsAsync((OrderDTO?)null);

            // Act
            var result = await _controller.UpdateOrderStatusPayment(orderId);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            Assert.Contains("Error updating order status payment", statusCodeResult.Value.ToString());
        }

        // TC_Order_8
        [Fact]
        public async Task GetOwnerTotalRevenue_ValidOwnerId_ReturnsOk()
        {
            // Arrange
            int ownerId = 1;
            var mockRevenue = new OwnerRevenueDTO
            {
                OwnerId = 1,
                OwnerName = "Nguyễn Văn Owner",
                TotalRevenue = 5000000,
                StartDate = DateTime.Now.AddDays(-30),
                EndDate = DateTime.Now,
                Facilities = new List<FacilityRevenueDTO>
                {
                    new FacilityRevenueDTO
                    {
                        FacilityId = 1,
                        FacilityName = "SportZone Center",
                        Revenue = 3000000
                    },
                    new FacilityRevenueDTO
                    {
                        FacilityId = 2,
                        FacilityName = "SportZone Premium",
                        Revenue = 2000000
                    }
                }
            };

            _orderServiceMock.Setup(s => s.GetOwnerTotalRevenueAsync(ownerId, null, null, null))
                .ReturnsAsync(mockRevenue);

            // Act
            var result = await _controller.GetOwnerTotalRevenue(ownerId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Lấy tổng doanh thu thành công", doc.RootElement.GetProperty("message").GetString());

            var data = doc.RootElement.GetProperty("data");
            Assert.Equal(1, data.GetProperty("ownerId").GetInt32());
            Assert.Equal("Nguyễn Văn Owner", data.GetProperty("ownerName").GetString());
            Assert.Equal(5000000, data.GetProperty("totalRevenue").GetDecimal());
        }

        // TC_Order_9
        [Fact]
        public async Task GetOwnerTotalRevenue_WithDateRange_ReturnsOk()
        {
            // Arrange
            int ownerId = 1;
            DateTime startDate = DateTime.Now.AddDays(-7);
            DateTime endDate = DateTime.Now;
            var mockRevenue = new OwnerRevenueDTO
            {
                OwnerId = 1,
                OwnerName = "Nguyễn Văn Owner",
                TotalRevenue = 1000000,
                StartDate = startDate,
                EndDate = endDate,
                Facilities = new List<FacilityRevenueDTO>
                {
                    new FacilityRevenueDTO
                    {
                        FacilityId = 1,
                        FacilityName = "SportZone Center",
                        Revenue = 1000000
                    }
                }
            };

            _orderServiceMock.Setup(s => s.GetOwnerTotalRevenueAsync(ownerId, startDate, endDate, null))
                .ReturnsAsync(mockRevenue);

            // Act
            var result = await _controller.GetOwnerTotalRevenue(ownerId, startDate, endDate);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            var data = doc.RootElement.GetProperty("data");
            Assert.Equal(1000000, data.GetProperty("totalRevenue").GetDecimal());
        }

        // TC_Order_10
        [Fact]
        public async Task GetOwnerTotalRevenue_InvalidOwnerId_ReturnsBadRequest()
        {
            // Arrange
            int ownerId = -1;

            _orderServiceMock.Setup(s => s.GetOwnerTotalRevenueAsync(ownerId, null, null, null))
                .ThrowsAsync(new ArgumentException("Owner ID không hợp lệ"));

            // Act
            var result = await _controller.GetOwnerTotalRevenue(ownerId);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Owner ID không hợp lệ", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Order_11
        [Fact]
        public async Task GetOrderByScheduleId_ValidScheduleId_ReturnsOk()
        {
            // Arrange
            int scheduleId = 1;
            var mockOrderDetail = new OrderDetailByScheduleDTO
            {
                OrderId = 1,
                UId = 1,
                FacId = 1,
                BookingId = 1,
                GuestName = "Nguyễn Văn A",
                GuestPhone = "0912345678",
                TotalPrice = 200000,
                StatusPayment = "Paid",
                CreateAt = DateTime.Now,
                CustomerInfo = new OrderCustomerInfoDTO
                {
                    CustomerType = "Guest",
                    Name = "Nguyễn Văn A",
                    Phone = "0912345678"
                },
                BookedSlots = new List<BookingSlotDTO>
                {
                    new BookingSlotDTO
                    {
                        ScheduleId = 1,
                        FieldId = 1,
                        FieldName = "Sân A",
                        StartTime = new TimeOnly(8, 0),
                        EndTime = new TimeOnly(9, 0),
                        Date = new DateOnly(2025, 8, 5),
                        Price = 200000
                    }
                }
            };

            _orderServiceMock.Setup(s => s.GetOrderByScheduleIdAsync(scheduleId))
                .ReturnsAsync(mockOrderDetail);

            // Act
            var result = await _controller.GetOrderByScheduleId(scheduleId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Lấy thông tin chi tiết Order thành công", doc.RootElement.GetProperty("message").GetString());

            var data = doc.RootElement.GetProperty("data");
            Assert.Equal(1, data.GetProperty("OrderId").GetInt32());
            Assert.Equal("Nguyễn Văn A", data.GetProperty("GuestName").GetString());
            Assert.Equal("Paid", data.GetProperty("StatusPayment").GetString());
        }

        // TC_Order_12
        [Fact]
        public async Task GetOrderByScheduleId_InvalidScheduleId_ReturnsNotFound()
        {
            // Arrange
            int scheduleId = 999;

            _orderServiceMock.Setup(s => s.GetOrderByScheduleIdAsync(scheduleId))
                .ReturnsAsync((OrderDetailByScheduleDTO?)null);

            // Act
            var result = await _controller.GetOrderByScheduleId(scheduleId);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var json = JsonSerializer.Serialize(notFoundResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal($"Không tìm thấy Order cho ScheduleId: {scheduleId}", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Order(BE)
        [Fact]
        public async Task GetOrderByScheduleId_NegativeScheduleId_ReturnsBadRequest()
        {
            // Arrange
            int scheduleId = -1;

            _orderServiceMock.Setup(s => s.GetOrderByScheduleIdAsync(scheduleId))
                .ThrowsAsync(new ArgumentException("Schedule ID không hợp lệ"));

            // Act
            var result = await _controller.GetOrderByScheduleId(scheduleId);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Schedule ID không hợp lệ", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Order_13
        [Fact]
        public async Task GetOrderSlotDetailByScheduleId_ValidScheduleId_ReturnsOk()
        {
            // Arrange
            int scheduleId = 1;
            var mockSlotDetail = new OrderSlotDetailDTO
            {
                Name = "Nguyễn Văn A",
                Phone = "0912345678",
                StartTime = "08:00",
                EndTime = "09:00",
                Date = "2025-08-05"
            };

            _orderServiceMock.Setup(s => s.GetOrderSlotDetailByScheduleIdAsync(scheduleId))
                .ReturnsAsync(mockSlotDetail);

            // Act
            var result = await _controller.GetOrderSlotDetailByScheduleId(scheduleId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Lấy chi tiết giờ đặt thành công", doc.RootElement.GetProperty("message").GetString());

            var data = doc.RootElement.GetProperty("data");
            Assert.Equal("Nguyễn Văn A", data.GetProperty("Name").GetString());
            Assert.Equal("0912345678", data.GetProperty("Phone").GetString());
            Assert.Equal("08:00", data.GetProperty("StartTime").GetString());
            Assert.Equal("09:00", data.GetProperty("EndTime").GetString());
            Assert.Equal("2025-08-05", data.GetProperty("Date").GetString());
        }

        // TC_Order_14
        [Fact]
        public async Task GetOrderSlotDetailByScheduleId_InvalidScheduleId_ReturnsNotFound()
        {
            // Arrange
            int scheduleId = 999;

            _orderServiceMock.Setup(s => s.GetOrderSlotDetailByScheduleIdAsync(scheduleId))
                .ReturnsAsync((OrderSlotDetailDTO?)null);

            // Act
            var result = await _controller.GetOrderSlotDetailByScheduleId(scheduleId);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var json = JsonSerializer.Serialize(notFoundResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal($"Không tìm thấy dữ liệu cho ScheduleId: {scheduleId}", doc.RootElement.GetProperty("message").GetString());
        }
    }
}
