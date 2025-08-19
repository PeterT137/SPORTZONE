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
    public class DiscountControllerTests
    {
        private readonly Mock<IDiscountService> _discountServiceMock;
        private readonly DiscountController _controller;

        public DiscountControllerTests()
        {
            _discountServiceMock = new Mock<IDiscountService>();
            _controller = new DiscountController(_discountServiceMock.Object);
        }

        // TC_Discount_1
        [Fact]
        public async Task GetAll_ReturnsOk_WithData()
        {
            // Arrange
            var mockDiscounts = new List<Discount>
            {
                new Discount { DiscountId = 1, Description = "Giảm giá 10%", DiscountPercentage = 10 },
                new Discount { DiscountId = 2, Description = "Giảm giá 20%", DiscountPercentage = 20 }
            };
            _discountServiceMock.Setup(s => s.GetAllDiscounts())
                .ReturnsAsync(mockDiscounts);

            // Act
            var result = await _controller.GetAll();

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Discount_2
        [Fact]
        public async Task GetAll_NoData_ReturnsOk_EmptyList()
        {
            // Arrange
            _discountServiceMock.Setup(s => s.GetAllDiscounts())
                .ReturnsAsync(new List<Discount>());

            // Act
            var result = await _controller.GetAll();

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Discount_3
        [Fact]
        public async Task GetById_NotFound_ReturnsNotFound()
        {
            // Arrange
            var id = 999;
            _discountServiceMock.Setup(s => s.GetDiscountById(id))
                .ReturnsAsync((Discount?)null);

            // Act
            var result = await _controller.GetById(id);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        // TC_Discount_4
        [Fact]
        public async Task GetByFacilityId_ReturnsOk_WithData()
        {
            // Arrange
            var facId = 1;
            var mockDiscounts = new List<Discount>
            {
                new Discount { DiscountId = 1, Description = "Giảm giá 10%", DiscountPercentage = 10, FacId = facId },
                new Discount { DiscountId = 2, Description = "Giảm giá 20%", DiscountPercentage = 20, FacId = facId }
            };
            _discountServiceMock.Setup(s => s.GetDiscountsByFacilityId(facId))
                .ReturnsAsync(mockDiscounts);

            // Act
            var result = await _controller.GetByFacilityId(facId);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Discount_5
        [Fact]
        public async Task GetByFacilityId_NoData_ReturnsOk_EmptyList()
        {
            // Arrange
            var facId = 999;
            _discountServiceMock.Setup(s => s.GetDiscountsByFacilityId(facId))
                .ReturnsAsync(new List<Discount>());

            // Act
            var result = await _controller.GetByFacilityId(facId);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Discount_6
        [Fact]
        public async Task GetActiveDiscounts_ReturnsOk_WithData()
        {
            // Arrange
            var mockDiscounts = new List<Discount>
            {
                new Discount { DiscountId = 1, Description = "Giảm giá 10%", DiscountPercentage = 10, IsActive = true },
                new Discount { DiscountId = 2, Description = "Giảm giá 20%", DiscountPercentage = 20, IsActive = true }
            };
            _discountServiceMock.Setup(s => s.GetActiveDiscounts())
                .ReturnsAsync(mockDiscounts);

            // Act
            var result = await _controller.GetActiveDiscounts();

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Discount_7
        [Fact]
        public async Task GetDeActiveDiscounts_ReturnsOk_WithData()
        {
            // Arrange
            var mockDiscounts = new List<Discount>
            {
                new Discount { DiscountId = 1, Description = "Giảm giá 10%", DiscountPercentage = 10, IsActive = false },
                new Discount { DiscountId = 2, Description = "Giảm giá 20%", DiscountPercentage = 20, IsActive = false }
            };
            _discountServiceMock.Setup(s => s.GetActiveDiscounts())
                .ReturnsAsync(mockDiscounts);

            // Act
            var result = await _controller.GetActiveDiscounts();

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Discount_8
        [Fact]
        public async Task GetActiveDiscounts_NoData_ReturnsOk_EmptyList()
        {
            // Arrange
            _discountServiceMock.Setup(s => s.GetActiveDiscounts())
                .ReturnsAsync(new List<Discount>());

            // Act
            var result = await _controller.GetActiveDiscounts();

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Discount_9
        [Fact]
        public async Task GetActiveDiscountsByFacility_ReturnsOk_WithData()
        {
            // Arrange
            var facId = 1;
            var mockDiscounts = new List<Discount>
            {
                new Discount { DiscountId = 1, Description = "Giảm giá 10%", DiscountPercentage = 10, IsActive = true, FacId = facId },
                new Discount { DiscountId = 2, Description = "Giảm giá 20%", DiscountPercentage = 20, IsActive = true, FacId = facId }
            };
            _discountServiceMock.Setup(s => s.GetActiveDiscountsByFacility(facId))
                .ReturnsAsync(mockDiscounts);

            // Act
            var result = await _controller.GetActiveDiscountsByFacility(facId);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Discount_10
        [Fact]
        public async Task GetActiveDiscountsByFacility_NoData_ReturnsOk_EmptyList()
        {
            // Arrange
            var facId = 999;
            _discountServiceMock.Setup(s => s.GetActiveDiscountsByFacility(facId))
                .ReturnsAsync(new List<Discount>());

            // Act
            var result = await _controller.GetActiveDiscountsByFacility(facId);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Discount_11
        [Fact]
        public async Task Search_ReturnsOk_WithData()
        {
            // Arrange
            var searchText = "giảm giá";
            var mockDiscounts = new List<Discount>
            {
                new Discount { DiscountId = 1, Description = "Giảm giá 10%", DiscountPercentage = 10 },
                new Discount { DiscountId = 2, Description = "Giảm giá 20%", DiscountPercentage = 20 }
            };
            _discountServiceMock.Setup(s => s.SearchDiscounts(searchText))
                .ReturnsAsync(mockDiscounts);

            // Act
            var result = await _controller.Search(searchText);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Discount_12
        [Fact]
        public async Task Search_NoResults_ReturnsOk_EmptyList()
        {
            // Arrange
            var searchText = "không tìm thấy";
            _discountServiceMock.Setup(s => s.SearchDiscounts(searchText))
                .ReturnsAsync(new List<Discount>());

            // Act
            var result = await _controller.Search(searchText);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Discount_13
        [Fact]
        public async Task Create_ReturnsOk_WithData()
        {
            // Arrange
            var dto = new DiscountDto { Description = "Giảm giá mới", DiscountPercentage = 15, FacId = 1 };
            var createdDiscount = new Discount { DiscountId = 1, Description = "Giảm giá mới", DiscountPercentage = 15, FacId = 1 };
            _discountServiceMock.Setup(s => s.CreateDiscount(dto))
                .ReturnsAsync(new ServiceResponse<Discount>
                {
                    Success = true,
                    Message = "Tạo giảm giá thành công",
                    Data = createdDiscount
                });

            // Act
            var result = await _controller.Create(dto);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Discount_14
        [Fact]
        public async Task Create_ServiceFails_ReturnsBadRequest()
        {
            // Arrange
            var dto = new DiscountDto { Description = "", DiscountPercentage = -10 };
            _discountServiceMock.Setup(s => s.CreateDiscount(dto))
                .ReturnsAsync(new ServiceResponse<Discount>
                {
                    Success = false,
                    Message = "Tên giảm giá không được để trống"
                });

            // Act
            var result = await _controller.Create(dto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        // TC_Discount_15
        [Fact]
        public async Task Update_ReturnsOk_WithData()
        {
            // Arrange
            var id = 1;
            var dto = new DiscountDto { Description = "Cập nhật giảm giá", DiscountPercentage = 20, FacId = 1 };
            var updatedDiscount = new Discount { DiscountId = id, Description = "Cập nhật giảm giá", DiscountPercentage = 20, FacId = 1 };
            _discountServiceMock.Setup(s => s.UpdateDiscount(id, dto))
                .ReturnsAsync(new ServiceResponse<Discount>
                {
                    Success = true,
                    Message = "Cập nhật giảm giá thành công",
                    Data = updatedDiscount
                });
            // Act
            var result = await _controller.Update(id, dto);
            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Discount_16
        [Fact]
        public async Task Update_ServiceFails_ReturnsBadRequest()
        {
            // Arrange
            var id = 1;
            var dto = new DiscountDto { Description = "", DiscountPercentage = -10 };
            _discountServiceMock.Setup(s => s.UpdateDiscount(id, dto))
                .ReturnsAsync(new ServiceResponse<Discount>
                {
                    Success = false,
                    Message = "Tên giảm giá không được để trống"
                });

            // Act
            var result = await _controller.Update(id, dto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        // TC_Discount_17
        [Fact]
        public async Task Delete_ReturnsOk_WithMessage()
        {
            // Arrange
            var id = 1;
            var deletedDiscount = new Discount { DiscountId = id, Description = "Giảm giá đã xóa" };
            _discountServiceMock.Setup(s => s.DeleteDiscount(id))
                .ReturnsAsync(new ServiceResponse<Discount>
                {
                    Success = true,
                    Message = "Xóa giảm giá thành công",
                    Data = deletedDiscount
                });

            // Act
            var result = await _controller.Delete(id);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_Discount_18
        [Fact]
        public async Task Delete_ServiceFails_ReturnsBadRequest()
        {
            // Arrange
            var id = 999;
            _discountServiceMock.Setup(s => s.DeleteDiscount(id))
                .ReturnsAsync(new ServiceResponse<Discount>
                {
                    Success = false,
                    Message = "Không tìm thấy giảm giá để xóa"
                });

            // Act
            var result = await _controller.Delete(id);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }
    }
}
