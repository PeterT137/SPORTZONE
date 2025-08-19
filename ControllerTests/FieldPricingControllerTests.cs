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
    public class FieldPricingControllerTests
    {
        private readonly Mock<IFieldPricingService> _fieldPricingServiceMock;
        private readonly FieldPricingController _controller;

        public FieldPricingControllerTests()
        {
            _fieldPricingServiceMock = new Mock<IFieldPricingService>();
            _controller = new FieldPricingController(_fieldPricingServiceMock.Object);
        }

        // TC_FieldPricing_1
        [Fact]
        public async Task GetAllFieldPricings_ReturnsOk_WithData()
        {
            // Arrange
            var mockPricings = new List<FieldPricingDto>
            {
                new FieldPricingDto { PricingId = 1, FieldId = 1, StartTime = TimeOnly.Parse("08:00"), EndTime = TimeOnly.Parse("10:00"), Price = 200000 },
                new FieldPricingDto { PricingId = 2, FieldId = 1, StartTime = TimeOnly.Parse("10:00"), EndTime = TimeOnly.Parse("12:00"), Price = 250000 }
            };
            _fieldPricingServiceMock.Setup(s => s.GetAllFieldPricingsAsync())
                .ReturnsAsync(mockPricings);

            // Act
            var result = await _controller.GetAllFieldPricings();

            // Assert
            Assert.IsType<OkObjectResult>(result.Result);
        }

        // TC_FieldPricing_2
        [Fact]
        public async Task GetAllFieldPricings_NoData_ReturnsOk_EmptyList()
        {
            // Arrange
            _fieldPricingServiceMock.Setup(s => s.GetAllFieldPricingsAsync())
                .ReturnsAsync(new List<FieldPricingDto>());

            // Act
            var result = await _controller.GetAllFieldPricings();

            // Assert
            Assert.IsType<OkObjectResult>(result.Result);
        }

        // TC_FieldPricing_3
        [Fact]
        public async Task GetFieldPricing_ReturnsOk_WithData()
        {
            // Arrange
            var id = 1;
            var mockPricing = new FieldPricingDto { PricingId = id, FieldId = 1, StartTime = TimeOnly.Parse("08:00"), EndTime = TimeOnly.Parse("10:00"), Price = 200000 };
            _fieldPricingServiceMock.Setup(s => s.GetFieldPricingByIdAsync(id))
                .ReturnsAsync(mockPricing);

            // Act
            var result = await _controller.GetFieldPricing(id);

            // Assert
            Assert.IsType<OkObjectResult>(result.Result);
        }

        // TC_FieldPricing_4
        [Fact]
        public async Task GetFieldPricing_NotFound_ReturnsNotFound()
        {
            // Arrange
            var id = 999;
            _fieldPricingServiceMock.Setup(s => s.GetFieldPricingByIdAsync(id))
                .ReturnsAsync((FieldPricingDto?)null);

            // Act
            var result = await _controller.GetFieldPricing(id);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        // TC_FieldPricing_5
        [Fact]
        public async Task GetFieldPricingsByField_ReturnsOk_WithData()
        {
            // Arrange
            var fieldId = 1;
            var mockPricings = new List<FieldPricingDto>
            {
                new FieldPricingDto { PricingId = fieldId, FieldId = fieldId, StartTime = TimeOnly.Parse("08:00"), EndTime = TimeOnly.Parse("10:00"), Price = 200000 },
                new FieldPricingDto { PricingId = 2, FieldId = fieldId, StartTime = TimeOnly.Parse("10:00"), EndTime = TimeOnly.Parse("12:00"), Price = 250000 }
            };
            _fieldPricingServiceMock.Setup(s => s.GetFieldPricingsByFieldIdAsync(fieldId))
                .ReturnsAsync(mockPricings);

            // Act
            var result = await _controller.GetFieldPricingsByField(fieldId);

            // Assert
            Assert.IsType<OkObjectResult>(result.Result);
        }

        // TC_FieldPricing_6
        [Fact]
        public async Task GetFieldPricingsByField_NoData_ReturnsOk_EmptyList()
        {
            // Arrange
            var fieldId = 999;
            _fieldPricingServiceMock.Setup(s => s.GetFieldPricingsByFieldIdAsync(fieldId))
                .ReturnsAsync(new List<FieldPricingDto>());

            // Act
            var result = await _controller.GetFieldPricingsByField(fieldId);

            // Assert
            Assert.IsType<OkObjectResult>(result.Result);
        }

        // TC_FieldPricing_7
        [Fact]
        public async Task CreateFieldPricing_ReturnsCreated_WithData()
        {
            // Arrange
            var createDto = new FieldPricingCreateDto { FieldId = 1, StartTime = TimeOnly.Parse("08:00"), EndTime = TimeOnly.Parse("10:00"), Price = 200000 };
            var createdPricing = new FieldPricingDto { PricingId = 1, FieldId = 1, StartTime = TimeOnly.Parse("08:00"), EndTime = TimeOnly.Parse("10:00"), Price = 200000 };
            _fieldPricingServiceMock.Setup(s => s.CreateFieldPricingAsync(createDto))
                .ReturnsAsync(createdPricing);

            // Act
            var result = await _controller.CreateFieldPricing(createDto);

            // Assert
            Assert.IsType<CreatedAtActionResult>(result.Result);
        }

        // TC_FieldPricing_8
        [Fact]
        public async Task CreateFieldPricing_InvalidModelState_FieldId_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new FieldPricingCreateDto { FieldId = 1, StartTime = TimeOnly.Parse("08:00"), EndTime = TimeOnly.Parse("10:00"), Price = -1000 };
            _controller.ModelState.AddModelError("Price", "Giá phải lớn hơn 0");

            // Act
            var result = await _controller.CreateFieldPricing(createDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        // TC_FieldPricing_9
        [Fact]
        public async Task CreateFieldPricing_InvalidModelState_Price_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new FieldPricingCreateDto { FieldId = 0, StartTime = TimeOnly.Parse("08:00"), EndTime = TimeOnly.Parse("10:00"), Price = 100000 };
            _controller.ModelState.AddModelError("Price", "Giá phải lớn hơn 0");

            // Act
            var result = await _controller.CreateFieldPricing(createDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        // TC_FieldPricing_10
        [Fact]
        public async Task UpdateFieldPricing_ReturnsOk_WithData()
        {
            // Arrange
            var id = 1;
            var updateDto = new FieldPricingUpdateDto { StartTime = TimeOnly.Parse("09:00"), EndTime = TimeOnly.Parse("11:00"), Price = 220000 };
            var updatedPricing = new FieldPricingDto { PricingId = id, FieldId = 1, StartTime = TimeOnly.Parse("09:00"), EndTime = TimeOnly.Parse("11:00"), Price = 220000 };
            _fieldPricingServiceMock.Setup(s => s.UpdateFieldPricingAsync(id, updateDto))
                .ReturnsAsync(updatedPricing);

            // Act
            var result = await _controller.UpdateFieldPricing(id, updateDto);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        // TC_FieldPricing_11
        [Fact]
        public async Task UpdateFieldPricing_NotFound_ReturnsNotFound()
        {
            // Arrange
            var id = 999;
            var updateDto = new FieldPricingUpdateDto { StartTime = TimeOnly.Parse("09:00"), EndTime = TimeOnly.Parse("11:00"), Price = 220000 };
            _fieldPricingServiceMock.Setup(s => s.UpdateFieldPricingAsync(id, updateDto))
                .ReturnsAsync((FieldPricingDto?)null);

            // Act
            var result = await _controller.UpdateFieldPricing(id, updateDto);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        // TC_FieldPricing_12
        [Fact]
        public async Task UpdateFieldPricing_InvalidModelState_ReturnsBadRequest()
        {
            // Arrange
            var id = 1;
            var updateDto = new FieldPricingUpdateDto { StartTime = TimeOnly.Parse("09:00"), EndTime = TimeOnly.Parse("11:00"), Price = -1000 };
            _controller.ModelState.AddModelError("Price", "Giá phải lớn hơn 0");

            // Act
            var result = await _controller.UpdateFieldPricing(id, updateDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        // TC_FieldPricing_13
        [Fact]
        public async Task DeleteFieldPricing_ReturnsNoContent_WhenSuccess()
        {
            // Arrange
            var id = 1;
            _fieldPricingServiceMock.Setup(s => s.DeleteFieldPricingAsync(id))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.DeleteFieldPricing(id);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        // TC_FieldPricing_14
        [Fact]
        public async Task DeleteFieldPricing_NotFound_ReturnsNotFound()
        {
            // Arrange
            var id = 999;
            _fieldPricingServiceMock.Setup(s => s.DeleteFieldPricingAsync(id))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.DeleteFieldPricing(id);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        // TC_FieldPricing_15
        [Fact]
        public async Task DeleteFieldPricing_InvalidId_ReturnsNotFound()
        {
            // Arrange
            var id = 0;
            _controller.ModelState.AddModelError("id", "ID không hợp lệ");
            // Act
            var result = await _controller.DeleteFieldPricing(id);
            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }        
    }
}
