using System;
using System.Collections.Generic;
using System.Linq;
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
    public class StaffControllerTests
    {
        private readonly Mock<IStaffService> _staffServiceMock;
        private readonly StaffController _controller;

        public StaffControllerTests()
        {
            _staffServiceMock = new Mock<IStaffService>();
            _controller = new StaffController(_staffServiceMock.Object);
        }

        // TC_Staff_1
        [Fact]
        public async Task GetAllStaff_ReturnsOk_WithData()
        {
            // Arrange
            var mockStaff = new List<StaffDto>
            {
                new StaffDto { UId = 1, Name = "Nhân viên A" },
                new StaffDto { UId = 2, Name = "Nhân viên B" }
            };
            _staffServiceMock.Setup(s => s.GetAllStaffAsync())
                .ReturnsAsync(new ServiceResponse<IEnumerable<StaffDto>>
                {
                    Success = true,
                    Message = "Lấy danh sách nhân viên thành công",
                    Data = mockStaff
                });

            // Act
            var result = await _controller.GetAllStaff();

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Staff_2
        [Fact]
        public async Task GetAllStaff_NoData_ReturnsNotFound()
        {
            // Arrange
            _staffServiceMock.Setup(s => s.GetAllStaffAsync())
                .ReturnsAsync(new ServiceResponse<IEnumerable<StaffDto>>
                {
                    Success = true,
                    Message = "Không có nhân viên nào",
                    Data = new List<StaffDto>()
                });

            // Act
            var result = await _controller.GetAllStaff();

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        // TC_Staff_3
        [Fact]
        public async Task GetAllStaff_ServiceFails_ReturnsBadRequest()
        {
            // Arrange
            _staffServiceMock.Setup(s => s.GetAllStaffAsync())
                .ReturnsAsync(new ServiceResponse<IEnumerable<StaffDto>>
                {
                    Success = false,
                    Message = "Lỗi khi lấy danh sách nhân viên"
                });

            // Act
            var result = await _controller.GetAllStaff();

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        // TC_Staff_4
        [Fact]
        public async Task GetStaffByFacilityId_ReturnsOk_WithData()
        {
            // Arrange
            var facilityId = 1;
            var mockStaff = new List<StaffDto>
            {
                new StaffDto { UId = 1, Name = "Nhân viên A", FacId = facilityId }
            };
            _staffServiceMock.Setup(s => s.GetStaffByFacilityIdAsync(facilityId))
                .ReturnsAsync(new ServiceResponse<IEnumerable<StaffDto>>
                {
                    Success = true,
                    Message = "Lấy danh sách nhân viên theo cơ sở thành công",
                    Data = mockStaff
                });

            // Act
            var result = await _controller.GetStaffByFacilityId(facilityId);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Staff_5
        [Fact]
        public async Task GetStaffByFacilityId_NoData_ReturnsNotFound()
        {
            // Arrange
            var facilityId = 1;
            _staffServiceMock.Setup(s => s.GetStaffByFacilityIdAsync(facilityId))
                .ReturnsAsync(new ServiceResponse<IEnumerable<StaffDto>>
                {
                    Success = true,
                    Message = "Không có nhân viên nào cho cơ sở này",
                    Data = new List<StaffDto>()
                });

            // Act
            var result = await _controller.GetStaffByFacilityId(facilityId);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        // TC_Staff_6
        [Fact]
        public async Task GetStaffByUId_ReturnsOk_WithData()
        {
            // Arrange
            var uId = 1;
            var mockStaff = new StaffDto { UId = uId, Name = "Nhân viên A" };
            _staffServiceMock.Setup(s => s.GetStaffByUIdAsync(uId))
                .ReturnsAsync(new ServiceResponse<StaffDto>
                {
                    Success = true,
                    Message = "Lấy thông tin nhân viên thành công",
                    Data = mockStaff
                });

            // Act
            var result = await _controller.GetStaffByUId(uId);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Staff_7
        [Fact]
        public async Task GetStaffByUId_NotFound_ReturnsNotFound()
        {
            // Arrange
            var uId = 999;
            _staffServiceMock.Setup(s => s.GetStaffByUIdAsync(uId))
                .ReturnsAsync(new ServiceResponse<StaffDto>
                {
                    Success = false,
                    Message = "Không tìm thấy nhân viên với ID này"
                });

            // Act
            var result = await _controller.GetStaffByUId(uId);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        // TC_Staff_8
        [Fact]
        public async Task UpdateStaff_ReturnsOk_WithMessage()
        {
            // Arrange
            var uId = 1;
            var updateDto = new UpdateStaffDto { Name = "Nhân viên cập nhật" };
            _staffServiceMock.Setup(s => s.UpdateStaffAsync(uId, updateDto))
                .ReturnsAsync(new ServiceResponse<string>
                {
                    Success = true,
                    Message = "Cập nhật nhân viên thành công"
                });

            // Act
            var result = await _controller.UpdateStaff(uId, updateDto);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Staff_9
        [Fact]
        public async Task UpdateStaff_ServiceFails_ReturnsBadRequest()
        {
            // Arrange
            var uId = 1;
            var updateDto = new UpdateStaffDto { Name = "" };
            _staffServiceMock.Setup(s => s.UpdateStaffAsync(uId, updateDto))
                .ReturnsAsync(new ServiceResponse<string>
                {
                    Success = false,
                    Message = "Tên nhân viên không được để trống"
                });

            // Act
            var result = await _controller.UpdateStaff(uId, updateDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        // TC_Staff_10
        [Fact]
        public async Task DeleteStaff_ReturnsOk_WithMessage()
        {
            // Arrange
            var uId = 1;
            _staffServiceMock.Setup(s => s.DeleteStaffAsync(uId))
                .ReturnsAsync(new ServiceResponse<string>
                {
                    Success = true,
                    Message = "Xóa nhân viên thành công"
                });

            // Act
            var result = await _controller.DeleteStaff(uId);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Staff_11
        [Fact]
        public async Task GetStaffByFieldOwnerId_ReturnsOk_WithData()
        {
            // Arrange
            var fieldOwnerId = 1;
            var mockStaff = new List<Staff>
            {
                new Staff { UId = 1, Name = "Nhân viên A" },
                new Staff { UId = 2, Name = "Nhân viên B" }
            };
            _staffServiceMock.Setup(s => s.GetStaffByFieldOwnerIdAsync(fieldOwnerId))
                .ReturnsAsync(new ServiceResponse<List<Staff>>
                {
                    Success = true,
                    Message = "Lấy danh sách nhân viên theo chủ sân thành công",
                    Data = mockStaff
                });

            // Act
            var result = await _controller.GetStaffByFieldOwnerId(fieldOwnerId);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Staff_12
        [Fact]
        public async Task GetStaffByFieldOwnerId_NotFound_ReturnsNotFound()
        {
            // Arrange
            var fieldOwnerId = 999;
            _staffServiceMock.Setup(s => s.GetStaffByFieldOwnerIdAsync(fieldOwnerId))
                .ReturnsAsync(new ServiceResponse<List<Staff>>
                {
                    Success = false,
                    Message = "Không tìm thấy nhân viên cho chủ sân này"
                });

            // Act
            var result = await _controller.GetStaffByFieldOwnerId(fieldOwnerId);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        // TC_Staff_13
        [Fact]
        public async Task GetStaffByFieldOwnerId_InvalidId_ReturnsBadRequest()
        {
            // Arrange
            var fieldOwnerId = 0;

            // Act
            var result = await _controller.GetStaffByFieldOwnerId(fieldOwnerId);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        // TC_Staff_14
        [Fact]
        public async Task GetStaffByFieldOwnerId_NegativeId_ReturnsBadRequest()
        {
            // Arrange
            var fieldOwnerId = -1;

            // Act
            var result = await _controller.GetStaffByFieldOwnerId(fieldOwnerId);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }
    }
}
