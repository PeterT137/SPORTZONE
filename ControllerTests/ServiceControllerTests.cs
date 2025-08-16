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

namespace SportZone_API.Tests.Controllers
{
    public class ServiceControllerTests
    {
        private readonly Mock<IServiceService> _serviceServiceMock;
        private readonly Mock<IOrderServiceService> _orderServiceServiceMock;
        private readonly ServiceController _controller;
        public ServiceControllerTests()
        {
            _serviceServiceMock = new Mock<IServiceService>();
            _orderServiceServiceMock = new Mock<IOrderServiceService>();
            _controller = new ServiceController(_serviceServiceMock.Object, _orderServiceServiceMock.Object);
        }

        // TC_Service(BE)
        [Fact]
        public async Task GetAllServices_ReturnsOk_WithData()
        {
            // Arrange
            var mockServices = new List<ServiceDTO>
            {
                new ServiceDTO { ServiceId = 1, ServiceName = "Dịch vụ A", Price = 100000 },
                new ServiceDTO { ServiceId = 2, ServiceName = "Dịch vụ B", Price = 150000 },
                new ServiceDTO { ServiceId = 3, ServiceName = "Dịch vụ C", Price = 200000 }
            };
            _serviceServiceMock.Setup(s => s.GetAllServicesAsync())
                .ReturnsAsync(mockServices);
            // Act
            var result = await _controller.GetAllServices();
            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal(3, doc.RootElement.GetProperty("count").GetInt32());
        }

        // TC_Service(BE)
        [Fact]
        public async Task GetServiceById_ValidId_ReturnsOk()
        {
            // Arrange
            var mockService = new ServiceResponseDTO
            {
                ServiceId = 1,
                ServiceName = "Dịch vụ A",
                Price = 100000,
                Status = "Active"
            };
            _serviceServiceMock.Setup(s => s.GetServiceByIdAsync(1))
                .ReturnsAsync(mockService);
            // Act
            var result = await _controller.GetServiceById(1);
            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Lấy thông tin dịch vụ thành công", doc.RootElement.GetProperty("message").GetString());

            //var data = doc.RootElement.GetProperty("data");
            //Assert.Equal(1, data.GetProperty("serviceId").GetInt32());
            //Assert.Equal("Dịch vụ A", data.GetProperty("serviceName").GetString());
            //Assert.Equal(100000, data.GetProperty("price").GetInt32());
            //Assert.Equal("Active", data.GetProperty("status").GetString());
        }

        // TC_Service(BE)
        [Fact]
        public async Task GetServiceById_InvalidId_ReturnsNotFound()
        {
            // Arrange
            _serviceServiceMock.Setup(s => s.GetServiceByIdAsync(999))
                .ReturnsAsync((ServiceResponseDTO?)null);
            // Act
            var result = await _controller.GetServiceById(999);
            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var json = JsonSerializer.Serialize(notFoundResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Dịch vụ không tồn tại", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Service_1
        [Fact]
        public async Task GetServicesByFacilityId_ValidId_ReturnsOk()
        {
            // Arrange
            var mockServices = new List<ServiceDTO>
            {
                new ServiceDTO { ServiceId = 1, ServiceName = "Dịch vụ A", FacId = 1 },
                new ServiceDTO { ServiceId = 2, ServiceName = "Dịch vụ B", FacId = 1 }
            };
            _serviceServiceMock.Setup(s => s.GetServicesByFacilityIdAsync(1))
                .ReturnsAsync(mockServices);
            // Act
            var result = await _controller.GetServicesByFacilityId(1);
            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal(2, doc.RootElement.GetProperty("count").GetInt32());
        }

        // TC_Service(BE)
        //[Fact]
        //public async Task GetServicesByFacilityId_InvalidId_ReturnsNotFound()
        //{
        //    // Arrange
        //    _serviceServiceMock.Setup(s => s.GetServicesByFacilityIdAsync(999))
        //        .ReturnsAsync((List<ServiceDTO>?)null);
        //    // Act
        //    var result = await _controller.GetServicesByFacilityId(999);
        //    // Assert
        //    var notFoundResult = Assert.IsType<ObjectResult>(result);
        //    var json = JsonSerializer.Serialize(notFoundResult.Value);
        //    using var doc = JsonDocument.Parse(json);
        //    Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
        //    Assert.Equal("Có lỗi xảy ra khi lấy thông tin dịch vụ the", doc.RootElement.GetProperty("message").GetString());
        //}

        // TC_Service_2
        [Fact]
        public async Task GetServicesByStatus_ValidStatus_Active_ReturnsOk()
        {
            // Arrange
            var mockServices = new List<ServiceDTO>
            {
                new ServiceDTO { ServiceId = 1, ServiceName = "Dịch vụ A", Status = "Active" },
                new ServiceDTO { ServiceId = 2, ServiceName = "Dịch vụ B", Status = "Active" }
            };
            _serviceServiceMock.Setup(s => s.GetServicesByStatusAsync("Active"))
                .ReturnsAsync(mockServices);
            // Act
            var result = await _controller.GetServicesByStatus("Active");
            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal(2, doc.RootElement.GetProperty("count").GetInt32());
        }

        // TC_Service_3
        [Fact]
        public async Task GetServicesByStatus_ValidStatus_Inactive_ReturnsOk()
        {
            // Arrange
            var mockServices = new List<ServiceDTO>
            {
                new ServiceDTO { ServiceId = 1, ServiceName = "Dịch vụ A", Status = "Inactive" },
                new ServiceDTO { ServiceId = 2, ServiceName = "Dịch vụ B", Status = "Inactive" }
            };
            _serviceServiceMock.Setup(s => s.GetServicesByStatusAsync("Inactive"))
                .ReturnsAsync(mockServices);
            // Act
            var result = await _controller.GetServicesByStatus("Inactive");
            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal(2, doc.RootElement.GetProperty("count").GetInt32());
        }

        // TC_Service_4
        [Fact]
        public async Task GetServicesByStatus_InvalidStatus_ReturnsBadRequest()
        {
            // Arrange
            _serviceServiceMock.Setup(s => s.GetServicesByStatusAsync("Invalid"))
                .ThrowsAsync(new ArgumentException("Status phải là 'Active' hoặc 'Inactive'"));
            // Act
            var result = await _controller.GetServicesByStatus("Invalid");
            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Status phải là 'Active' hoặc 'Inactive'", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Service_5
        [Fact]
        public async Task CreateService_ValidData_ReturnsCreated()
        {
            // Arrange
            var createDto = new CreateServiceDTO
            {
                FacId = 1,
                ServiceName = "Dịch vụ mới",
                Price = 100000,
                Status = "Active",
                Description = "Mô tả dịch vụ"
            };
            var mockService = new ServiceResponseDTO
            {
                ServiceId = 1,
                ServiceName = "Dịch vụ mới",
                Price = 100000,
                Status = "Active"
            };
            _serviceServiceMock.Setup(s => s.CreateServiceAsync(createDto))
                .ReturnsAsync(mockService);
            // Act
            var result = await _controller.CreateService(createDto);
            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            var json = JsonSerializer.Serialize(createdResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Tạo dịch vụ thành công", doc.RootElement.GetProperty("message").GetString());
            //var data = doc.RootElement.GetProperty("data");
            //Assert.Equal(1, data.GetProperty("serviceId").GetInt32());
            //Assert.Equal("Dịch vụ mới", data.GetProperty("serviceName").GetString());
            //Assert.Equal(100000, data.GetProperty("price").GetInt32());
            //Assert.Equal("Active", data.GetProperty("status").GetString());
            //Assert.Equal("GetServiceById", createdResult.ActionName);
            //Assert.Equal(1, createdResult.RouteValues["id"]);
        }

        // TC_Service_6
        [Fact]
        public async Task CreateService_WithoutName_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new CreateServiceDTO
            {
                FacId = 1,
                Price = 100000,
                Status = "Active",
                Description = "Mô tả dịch vụ"
            };
            _serviceServiceMock.Setup(s => s.CreateServiceAsync(createDto))
                .ThrowsAsync(new ArgumentException("Tên dịch vụ là bắt buộc"));
            // Act
            var result = await _controller.CreateService(createDto);
            // Assert
            var badRequestResult = Assert.IsType<ObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Có lỗi xảy ra khi tạo dịch vụ", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Service(BE)
        [Fact]
        public async Task CreateService_WithoutFacId_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new CreateServiceDTO
            {
                FacId = 0, 
                ServiceName = "Dịch vụ mới",
                Price = 100000,
                Status = "Active",
                Description = "Mô tả dịch vụ"
            };
            _serviceServiceMock.Setup(s => s.CreateServiceAsync(createDto))
                .ThrowsAsync(new ArgumentException("ID cơ sở là bắt buộc"));
            // Act
            var result = await _controller.CreateService(createDto);
            // Assert
            var badRequestResult = Assert.IsType<ObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Có lỗi xảy ra khi tạo dịch vụ", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Service_7
        [Fact]
        public async Task CreateService_WithoutPrice_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new CreateServiceDTO
            {
                FacId = 1,
                ServiceName = "Dịch vụ mới",
                Price = 0,
                Status = "Active",
                Description = "Mô tả dịch vụ"
            };
            _serviceServiceMock.Setup(s => s.CreateServiceAsync(createDto))
                .ThrowsAsync(new ArgumentException("Giá dịch vụ là bắt buộc và phải lớn hơn 0"));
            // Act
            var result = await _controller.CreateService(createDto);
            // Assert
            var badRequestResult = Assert.IsType<ObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Có lỗi xảy ra khi tạo dịch vụ", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Servic_8
        [Fact]
        public async Task CreateService_WithoutStatus_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new CreateServiceDTO
            {
                FacId = 1,
                ServiceName = "Dịch vụ mới",
                Price = 100000,
                Status = "",
                Description = "Mô tả dịch vụ"
            };
            _serviceServiceMock.Setup(s => s.CreateServiceAsync(createDto))
                .ThrowsAsync(new ArgumentException("Trạng thái dịch vụ là bắt buộc"));
            // Act
            var result = await _controller.CreateService(createDto);
            // Assert
            var badRequestResult = Assert.IsType<ObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Có lỗi xảy ra khi tạo dịch vụ", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Service_9
        [Fact]
        public async Task UpdateService_ValidData_ReturnsOk()
        {
            // Arrange
            var updateDto = new UpdateServiceDTO
            {
                ServiceName = "Dịch vụ cập nhật",
                Price = 150000,
                Status = "Active"
            };
            var mockService = new ServiceResponseDTO
            {
                ServiceId = 1,
                ServiceName = "Dịch vụ cập nhật",
                Price = 150000,
                Status = "Active"
            };
            _serviceServiceMock.Setup(s => s.UpdateServiceAsync(1, updateDto))
                .ReturnsAsync(mockService);
            // Act
            var result = await _controller.UpdateService(1, updateDto);
            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Cập nhật dịch vụ thành công", doc.RootElement.GetProperty("message").GetString());
            //var data = doc.RootElement.GetProperty("data");
            //Assert.Equal(1, data.GetProperty("serviceId").GetInt32());
            //Assert.Equal("Dịch vụ cập nhật", data.GetProperty("serviceName").GetString());
            //Assert.Equal(1050000, data.GetProperty("price").GetInt32());
            //Assert.Equal("Active", data.GetProperty("status").GetString());
        }

        // TC_Service_10
        [Fact]
        public async Task UpdateService_ServiceNotFound_ReturnsNotFound()
        {
            // Arrange
            var updateDto = new UpdateServiceDTO
            {
                ServiceName = "Dịch vụ cập nhật",
                Price = 150000
            };
            _serviceServiceMock.Setup(s => s.UpdateServiceAsync(999, updateDto))
                .ReturnsAsync((ServiceResponseDTO?)null);
            // Act
            var result = await _controller.UpdateService(999, updateDto);
            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var json = JsonSerializer.Serialize(notFoundResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Không tìm thấy dịch vụ để cập nhật", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Service(BE)    
        [Fact]
        public async Task UpdateService_ArgumentException_ReturnsBadRequest()
        {
            // Arrange
            var updateDto = new UpdateServiceDTO
            {
                ServiceName = "Dịch vụ cập nhật",
                Price = 150000
            };
            _serviceServiceMock.Setup(s => s.UpdateServiceAsync(1, updateDto))
                .ThrowsAsync(new ArgumentException("Facility không tồn tại"));
            // Act
            var result = await _controller.UpdateService(1, updateDto);
            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Facility không tồn tại", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Service_11
        [Fact]
        public async Task UpdateService_WithoutName_ReturnsBadRequest()
        {
            // Arrange
            var updateDto = new UpdateServiceDTO
            {
                Price = 150000,
                Status = "Active"
            };
            _serviceServiceMock.Setup(s => s.UpdateServiceAsync(1, updateDto))
                .ThrowsAsync(new ArgumentException("Tên dịch vụ là bắt buộc"));
            // Act
            var result = await _controller.UpdateService(1, updateDto);
            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Tên dịch vụ là bắt buộc", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Service_12
        [Fact]
        public async Task UpdateService_WithoutPrice_ReturnsBadRequest()
        {
            // Arrange
            var updateDto = new UpdateServiceDTO
            {
                ServiceName = "Dịch vụ cập nhật",
                Price = 0,
                Status = "Active"
            };
            _serviceServiceMock.Setup(s => s.UpdateServiceAsync(1, updateDto))
                .ThrowsAsync(new ArgumentException("Giá dịch vụ là bắt buộc và phải lớn hơn 0"));
            // Act
            var result = await _controller.UpdateService(1, updateDto);
            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Giá dịch vụ là bắt buộc và phải lớn hơn 0", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Service_13
        [Fact]
        public async Task UpdateService_WithoutStatus_ReturnsBadRequest()
        {
            // Arrange
            var updateDto = new UpdateServiceDTO
            {
                ServiceName = "Dịch vụ cập nhật",
                Price = 150000,
                Status = ""
            };
            _serviceServiceMock.Setup(s => s.UpdateServiceAsync(1, updateDto))
                .ThrowsAsync(new ArgumentException("Trạng thái dịch vụ là bắt buộc"));
            // Act
            var result = await _controller.UpdateService(1, updateDto);
            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Trạng thái dịch vụ là bắt buộc", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Service_14
        [Fact]
        public async Task DeleteService_ValidId_ReturnsOk()
        {
            // Arrange
            _serviceServiceMock.Setup(s => s.DeleteServiceAsync(1))
                .ReturnsAsync(true);
            // Act
            var result = await _controller.DeleteService(1);
            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Xóa dịch vụ thành công", doc.RootElement.GetProperty("message").GetString());
        }
        
        // TC_Service(BE)
        [Fact]
        public async Task DeleteService_ServiceNotFound_ReturnsNotFound()
        {
            // Arrange
            _serviceServiceMock.Setup(s => s.DeleteServiceAsync(999))
                .ReturnsAsync(false);
            // Act
            var result = await _controller.DeleteService(999);
            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var json = JsonSerializer.Serialize(notFoundResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Không tìm thấy dịch vụ để xóa", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Service_15
        [Fact]
        public async Task DeleteService_InvalidOperationException_ReturnsBadRequest()
        {
            // Arrange
            _serviceServiceMock.Setup(s => s.DeleteServiceAsync(1))
                .ThrowsAsync(new InvalidOperationException("Không thể xóa dịch vụ đang được sử dụng"));
            // Act
            var result = await _controller.DeleteService(1);
            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Không thể xóa dịch vụ đang được sử dụng", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Service_16
        [Fact]
        public async Task GetOrderServices_ValidOrderId_ReturnsOk()
        {
            // Arrange
            int orderId = 1;
            var mockOrderServices = new List<OrderServiceDTO>
            {
                new OrderServiceDTO
                {
                    OrderServiceId = 1,
                    OrderId = 1,
                    ServiceId = 1,
                    ServiceName = "Bóng đá",
                    Price = 50000,
                    Quantity = 2,
                    TotalPrice = 100000
                },
                new OrderServiceDTO
                {
                    OrderServiceId = 2,
                    OrderId = 1,
                    ServiceId = 2,
                    ServiceName = "Nước uống",
                    Price = 25000,
                    Quantity = 1,
                    TotalPrice = 25000
                }
            };

            _orderServiceServiceMock.Setup(s => s.GetOrderServicesByOrderIdAsync(orderId))
                .ReturnsAsync(mockOrderServices);

            // Act
            var result = await _controller.GetOrderServices(orderId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Lấy danh sách dịch vụ trong order thành công", doc.RootElement.GetProperty("message").GetString());
            Assert.Equal(2, doc.RootElement.GetProperty("count").GetInt32());

            var data = doc.RootElement.GetProperty("data");
            Assert.Equal(2, data.GetArrayLength());

            var firstService = data[0];
            Assert.Equal(1, firstService.GetProperty("OrderServiceId").GetInt32());
            Assert.Equal("Bóng đá", firstService.GetProperty("ServiceName").GetString());
            Assert.Equal(50000, firstService.GetProperty("Price").GetDecimal());
            Assert.Equal(2, firstService.GetProperty("Quantity").GetInt32());
            Assert.Equal(100000, firstService.GetProperty("TotalPrice").GetDecimal());
        }

        // TC_Service_17
        [Fact]
        public async Task GetOrderServices_InvalidOrderId_ReturnsBadRequest()
        {
            // Arrange
            int orderId = 999;

            _orderServiceServiceMock.Setup(s => s.GetOrderServicesByOrderIdAsync(orderId))
                .ThrowsAsync(new ArgumentException("Order ID không tồn tại"));

            // Act
            var result = await _controller.GetOrderServices(orderId);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Order ID không tồn tại", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Service_18
        [Fact]
        public async Task GetOrderServices_NegativeOrderId_ReturnsBadRequest()
        {
            // Arrange
            int orderId = -1;

            _orderServiceServiceMock.Setup(s => s.GetOrderServicesByOrderIdAsync(orderId))
                .ThrowsAsync(new ArgumentException("Order ID không hợp lệ"));

            // Act
            var result = await _controller.GetOrderServices(orderId);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Order ID không hợp lệ", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Service_19
        [Fact]
        public async Task GetOrderServices_OrderWithNoServices_ReturnsOk()
        {
            // Arrange
            int orderId = 2;
            var emptyServices = new List<OrderServiceDTO>();

            _orderServiceServiceMock.Setup(s => s.GetOrderServicesByOrderIdAsync(orderId))
                .ReturnsAsync(emptyServices);

            // Act
            var result = await _controller.GetOrderServices(orderId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Lấy danh sách dịch vụ trong order thành công", doc.RootElement.GetProperty("message").GetString());
            Assert.Equal(0, doc.RootElement.GetProperty("count").GetInt32());

            var data = doc.RootElement.GetProperty("data");
            Assert.Equal(0, data.GetArrayLength());
        }

        // TC_Service_20
        [Fact]
        public async Task UpdateOrderService_ValidData_ReturnsOk()
        {
            // Arrange
            int orderServiceId = 1;
            var updateDTO = new OrderServiceUpdateDTO
            {
                Quantity = 3
            };

            var mockUpdatedService = new OrderServiceDTO
            {
                OrderServiceId = 1,
                OrderId = 1,
                ServiceId = 1,
                ServiceName = "Bóng đá",
                Price = 50000,
                Quantity = 3
            };

            _orderServiceServiceMock.Setup(s => s.UpdateOrderServiceAsync(orderServiceId, updateDTO))
                .ReturnsAsync(mockUpdatedService);

            // Act
            var result = await _controller.UpdateOrderServiceAsync(orderServiceId, updateDTO);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Cập nhật dịch vụ trong order thành công", doc.RootElement.GetProperty("message").GetString());

            var data = doc.RootElement.GetProperty("data");
            Assert.Equal(1, data.GetProperty("OrderServiceId").GetInt32());
            Assert.Equal(3, data.GetProperty("Quantity").GetInt32());
            Assert.Equal(150000, data.GetProperty("TotalPrice").GetDecimal());
        }

        // TC_Service_21
        [Fact]
        public async Task UpdateOrderService_InvalidOrderServiceId_ReturnsBadRequest()
        {
            // Arrange
            int orderServiceId = 999;
            var updateDTO = new OrderServiceUpdateDTO
            {
                Quantity = 3
            };

            _orderServiceServiceMock.Setup(s => s.UpdateOrderServiceAsync(orderServiceId, updateDTO))
                .ThrowsAsync(new ArgumentException("OrderService ID không tồn tại"));

            // Act
            var result = await _controller.UpdateOrderServiceAsync(orderServiceId, updateDTO);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("OrderService ID không tồn tại", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Service_22
        [Fact]
        public async Task UpdateOrderService_NegativeQuantity_ReturnsBadRequest()
        {
            // Arrange
            int orderServiceId = 1;
            var updateDTO = new OrderServiceUpdateDTO
            {
                Quantity = -1
            };

            _orderServiceServiceMock.Setup(s => s.UpdateOrderServiceAsync(orderServiceId, updateDTO))
                .ThrowsAsync(new ArgumentException("Số lượng phải lớn hơn 0"));

            // Act
            var result = await _controller.UpdateOrderServiceAsync(orderServiceId, updateDTO);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Số lượng phải lớn hơn 0", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Service_23
        [Fact]
        public async Task UpdateOrderService_ZeroQuantity_ReturnsBadRequest()
        {
            // Arrange
            int orderServiceId = 1;
            var updateDTO = new OrderServiceUpdateDTO
            {
                Quantity = 0
            };

            _orderServiceServiceMock.Setup(s => s.UpdateOrderServiceAsync(orderServiceId, updateDTO))
                .ThrowsAsync(new ArgumentException("Số lượng phải lớn hơn 0"));

            // Act
            var result = await _controller.UpdateOrderServiceAsync(orderServiceId, updateDTO);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Số lượng phải lớn hơn 0", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Service_24
        [Fact]
        public async Task UpdateOrderService_ServiceException_ReturnsInternalServerError()
        {
            // Arrange
            int orderServiceId = 1;
            var updateDTO = new OrderServiceUpdateDTO
            {
                Quantity = 3
            };

            _orderServiceServiceMock.Setup(s => s.UpdateOrderServiceAsync(orderServiceId, updateDTO))
                .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.UpdateOrderServiceAsync(orderServiceId, updateDTO);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);

            var json = JsonSerializer.Serialize(statusCodeResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Có lỗi xảy ra khi cập nhật dịch vụ trong OrderService", doc.RootElement.GetProperty("message").GetString());
        }
    }
}
