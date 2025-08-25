using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Moq;
using SportZone_API.Controllers;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Services.Interfaces;
using Xunit;


namespace SportZone_API.Tests.Controllers
{
    public class FacilityControllerTests
    {
        private readonly Mock<IFacilityService> _facilityServiceMock;
        private readonly FacilityController _controller;

        public FacilityControllerTests()
        {
            _facilityServiceMock = new Mock<IFacilityService>();
            _controller = new FacilityController(_facilityServiceMock.Object);
        }

        // TC_Facility_01
        [Fact]
        public async Task GetAll_ReturnsOk_WithData()
        {
            // Arrange
            var mockFacilities = new List<FacilityDto>
            {
                new FacilityDto { Name = "Sân bóng đá A", Address = "Hà Nội" },
                new FacilityDto { Name = "Sân bóng đá B", Address = "TP.HCM" }
            };
            _facilityServiceMock.Setup(s => s.GetAllFacilities(It.IsAny<string>()))
                .ReturnsAsync(new ServiceResponse<List<FacilityDto>>
                {
                    Success = true,
                    Data = mockFacilities
                });

            // Act
            var result = await _controller.GetAll(null);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Facility_02
        [Fact]
        public async Task GetAll_WithSearchText_ReturnsOk_WithFilteredData()
        {
            // Arrange
            var searchText = "bóng đá";
            var mockFacilities = new List<FacilityDto>
            {
                new FacilityDto { Name = "Sân bóng đá A", Address = "Hà Nội" }
            };
            _facilityServiceMock.Setup(s => s.GetAllFacilities(searchText))
                .ReturnsAsync(new ServiceResponse<List<FacilityDto>>
                {
                    Success = true,
                    Data = mockFacilities
                });

            // Act
            var result = await _controller.GetAll(searchText);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Facility_03
        [Fact]
        public async Task GetAllWithDetails_ReturnsOk_WithData()
        {
            // Arrange
            var mockFacilities = new List<FacilityDetailDto>
            {
                new FacilityDetailDto { FacId = 1, Name = "Sân bóng đá A", Address = "Hà Nội" },
                new FacilityDetailDto { FacId = 2, Name = "Sân bóng đá B", Address = "TP.HCM" }
            };
            _facilityServiceMock.Setup(s => s.GetAllFacilitiesWithDetails(It.IsAny<string>()))
                .ReturnsAsync(new ServiceResponse<List<FacilityDetailDto>>
                {
                    Success = true,
                    Data = mockFacilities
                });

            // Act
            var result = await _controller.GetAllWithDetails(null);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Facility_04
        [Fact]
        public async Task GetAllWithDetails_WithSearchText_ReturnsOk_WithFilteredData()
        {
            // Arrange
            var searchText = "bóng đá";
            var mockFacilities = new List<FacilityDetailDto>
            {
                new FacilityDetailDto { FacId = 1, Name = "Sân bóng đá A", Address = "Hà Nội" }
            };
            _facilityServiceMock.Setup(s => s.GetAllFacilitiesWithDetails(searchText))
                .ReturnsAsync(new ServiceResponse<List<FacilityDetailDto>>
                {
                    Success = true,
                    Data = mockFacilities
                });

            // Act
            var result = await _controller.GetAllWithDetails(searchText);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Facility_05
        [Fact]
        public async Task GetFacilitiesByFilter_ReturnsOk_WithData()
        {
            // Arrange
            var categoryFieldName = "Bóng đá";
            var address = "Hà Nội";
            var mockFacilities = new List<FacilityDetailDto>
            {
                new FacilityDetailDto { FacId = 1, Name = "Sân bóng đá A", Address = "Hà Nội" }
            };
            _facilityServiceMock.Setup(s => s.GetFacilitiesByFilter(categoryFieldName, address))
                .ReturnsAsync(new ServiceResponse<List<FacilityDetailDto>>
                {
                    Success = true,
                    Data = mockFacilities
                });

            // Act
            var result = await _controller.GetFacilitiesByFilter(categoryFieldName, address);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Facility_06
        [Fact]
        public async Task GetById_ReturnsOk_WithData()
        {
            // Arrange
            var mockFacility = new FacilityDto { Name = "Sân bóng đá A", Address = "Hà Nội" };
            _facilityServiceMock.Setup(s => s.GetFacilityById(1))
                .ReturnsAsync(mockFacility);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var facility = Assert.IsType<FacilityDto>(okResult.Value);
            Assert.Equal("Sân bóng đá A", facility.Name);
            Assert.Equal("Hà Nội", facility.Address);
        }

        // TC_Facility_07
        [Fact]
        public async Task GetById_NotFound_ReturnsNotFound()
        {
            // Arrange
            _facilityServiceMock.Setup(s => s.GetFacilityById(999))
                .ReturnsAsync((FacilityDto)null);

            // Act
            var result = await _controller.GetById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        // TC_Facility_08
        [Fact]
        public async Task Create_ReturnsCreated_WithData()
        {
            // Arrange
            var facilityDto = new FacilityDto { Name = "Sân bóng đá mới", Address = "Hà Nội" };
            var createdFacility = new FacilityDto { Name = "Sân bóng đá mới", Address = "Hà Nội" };
            _facilityServiceMock.Setup(s => s.CreateFacility(facilityDto))
                .ReturnsAsync(new ServiceResponse<FacilityDto>
                {
                    Success = true,
                    Message = "Tạo cơ sở thành công",
                    Data = createdFacility
                });

            // Act
            var result = await _controller.Create(facilityDto);

            // Assert
            var createdResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(201, createdResult.StatusCode);
        }

        // TC_Facility_09
        [Fact]
        public async Task Create_ServiceFails_ReturnsBadRequest()
        {
            // Arrange
            var facilityDto = new FacilityDto { Name = "" };
            _facilityServiceMock.Setup(s => s.CreateFacility(facilityDto))
                .ReturnsAsync(new ServiceResponse<FacilityDto>
                {
                    Success = false,
                    Message = "Tên cơ sở không được để trống"
                });

            // Act
            var result = await _controller.Create(facilityDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        // TC_Facility_10
        [Fact]
        public async Task Update_ReturnsOk_WithData()
        {
            // Arrange
            var facilityUpdateDto = new FacilityUpdateDto { Name = "Sân bóng đá cập nhật", Address = "TP.HCM" };
            var updatedFacility = new FacilityDto { Name = "Sân bóng đá cập nhật", Address = "TP.HCM" };
            _facilityServiceMock.Setup(s => s.UpdateFacility(1, facilityUpdateDto))
                .ReturnsAsync(new ServiceResponse<FacilityDto>
                {
                    Success = true,
                    Message = "Cập nhật cơ sở thành công",
                    Data = updatedFacility
                });

            // Act
            var result = await _controller.Update(1, facilityUpdateDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
        }

        // TC_Facility_11
        [Fact]
        public async Task Update_ServiceFails_ReturnsBadRequest()
        {
            // Arrange
            var facilityUpdateDto = new FacilityUpdateDto { Name = "" };
            _facilityServiceMock.Setup(s => s.UpdateFacility(1, facilityUpdateDto))
                .ReturnsAsync(new ServiceResponse<FacilityDto>
                {
                    Success = false,
                    Message = "Tên cơ sở không được để trống"
                });

            // Act
            var result = await _controller.Update(1, facilityUpdateDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        // TC_Facility_12
        [Fact]
        public async Task Delete_ReturnsOk_WithMessage()
        {
            // Arrange
            _facilityServiceMock.Setup(s => s.DeleteFacility(1))
                .ReturnsAsync(new ServiceResponse<object>
                {
                    Success = true,
                    Message = "Xóa cơ sở thành công"
                });

            // Act
            var result = await _controller.Delete(1);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Facility_13
        [Fact]
        public async Task Delete_ServiceFails_ReturnsBadRequest()
        {
            // Arrange
            _facilityServiceMock.Setup(s => s.DeleteFacility(1))
                .ReturnsAsync(new ServiceResponse<object>
                {
                    Success = false,
                    Message = "Không thể xóa cơ sở đang có sân"
                });

            // Act
            var result = await _controller.Delete(1);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        // TC_Facility_14
        //[Fact]
        //public async Task GetFacilitiesByUserId_ReturnsOk_WithData()
        //{
        //    // Arrange
        //    var mockFacilities = new List<FacilityDto>
        //    {
        //        new FacilityDto { Name = "Sân bóng đá A", Address = "Hà Nội" },
        //        new FacilityDto { Name = "Sân bóng đá B", Address = "TP.HCM" }
        //    };
        //    _facilityServiceMock.Setup(s => s.GetFacilitiesByUserId(1))
        //        .ReturnsAsync(new ServiceResponse<List<FacilityDto>>
        //        {
        //            Success = true,
        //            Data = mockFacilities
        //        });

        //    // Act
        //    var result = await _controller.GetFacilitiesByUserId(1);

        //    // Assert
        //    Assert.IsType<OkObjectResult>(result);
        //}

        // TC_Facility_15
        //[Fact]
        //public async Task GetFacilitiesByUserId_ServiceFails_ReturnsBadRequest()
        //{
        //    // Arrange
        //    _facilityServiceMock.Setup(s => s.GetFacilitiesByUserId(1))
        //        .ReturnsAsync(new ServiceResponse<List<FacilityDto>>
        //        {
        //            Success = false,
        //            Message = "Lỗi khi lấy danh sách cơ sở theo ID người dùng"
        //        });

        //    // Act
        //    var result = await _controller.GetFacilitiesByUserId(1);

        //    // Assert
        //    Assert.IsType<BadRequestObjectResult>(result);
        //}
    }
}
