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
    public class FieldControllerTests
    {
        private readonly Mock<IFieldService> _fieldServiceMock;
        private readonly FieldController _controller;

        public FieldControllerTests()
        {
            _fieldServiceMock = new Mock<IFieldService>();
            _controller = new FieldController(_fieldServiceMock.Object);
        }

        [Fact]
        public async Task GetAllFields_ReturnsOk_WithData()
        {
            // Arrange  
            var mockFields = new List<FieldResponseDTO>
            {
               new FieldResponseDTO { FieldId = 1, FieldName = "Field A" },
               new FieldResponseDTO { FieldId = 2, FieldName = "Field B" },
               new FieldResponseDTO { FieldId = 3, FieldName = "Field C" }
            };
            _fieldServiceMock.Setup(s => s.GetAllFieldsAsync())
                .ReturnsAsync(mockFields);

            // Act  
            var result = await _controller.GetAllFields();

            // Assert  
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal(3, doc.RootElement.GetProperty("count").GetInt32());
        }

        [Fact]
        public async Task SearchFields_ReturnOk_WithData()
        {
            // Arrange  
            var mockFields = new List<FieldResponseDTO>
            {
                new FieldResponseDTO { FieldId = 1, FieldName = "Field A" },
                new FieldResponseDTO { FieldId = 2, FieldName = "Field B" }
            };
            _fieldServiceMock.Setup(s => s.GetAllFieldsAsync("Field"))
                .ReturnsAsync(mockFields);
            // Act  
            var result = await _controller.GetAllFields("Field");
            // Assert  
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal(2, doc.RootElement.GetProperty("count").GetInt32());
        }

        // TC_Field_01
        [Fact]
        public async Task CreateField_Valid_ReturnsCreated()
        {
            // Arrange  
            var createDto = new FieldCreateDTO
            {
                FieldName = "Sân A",
                FacId = 1,
                CategoryId = 2,
                Description = "Sân cỏ nhân tạo",
                IsBookingEnable = true
            };
            var mockField = new Field
            {
                FieldId = 1,
                FieldName = "Sân A",
                FacId = 1,
                CategoryId = 2,
                Description = "Sân cỏ nhân tạo",
                IsBookingEnable = true
            };
            _fieldServiceMock.Setup(s => s.CreateFieldAsync(createDto))
                .ReturnsAsync(mockField);

            // Act  
            var result = await _controller.CreateField(createDto);

            // Assert  
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            var json = JsonSerializer.Serialize(createdResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Tạo sân mới thành công", doc.RootElement.GetProperty("message").GetString());
            var data = doc.RootElement.GetProperty("data");
            Assert.Equal(1, data.GetProperty("FieldId").GetInt32());
            Assert.Equal("Sân A", data.GetProperty("FieldName").GetString());
            Assert.Equal(1, data.GetProperty("FacId").GetInt32());
            Assert.Equal(2, data.GetProperty("CategoryId").GetInt32());
            Assert.Equal("Sân cỏ nhân tạo", data.GetProperty("Description").GetString());
            Assert.Equal("GetFieldByID", createdResult.ActionName);
            Assert.Equal(1, createdResult.RouteValues["id"]);
        }

        // TC_Field_02
        [Fact]
        public async Task CreateField_WithoutName_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new FieldCreateDTO
            {
                FieldName = "",
                FacId = 1,
                CategoryId = 2,
                Description = "Sân cỏ nhân tạo",
            };

            _fieldServiceMock.Setup(s => s.CreateFieldAsync(createDto))
                .ThrowsAsync(new ArgumentException("Tên sân là bắt buộc"));
            // Act
            var result = await _controller.CreateField(createDto);
            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Tên sân là bắt buộc", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Field_03
        [Fact]
        public async Task CreateField_NameTooLong_ReturnsBadRequest()
        {
            // Arrange
            var longName = new string('A', 51);
            var createDto = new FieldCreateDTO
            {
                FieldName = longName,
                FacId = 1,
                CategoryId = 2,
                Description = "Sân cỏ nhân tạo",
            };
            _fieldServiceMock.Setup(s => s.CreateFieldAsync(createDto))
                .ThrowsAsync(new ArgumentException("Tên sân không được vượt quá 50 ký tự"));
            // Act
            var result = await _controller.CreateField(createDto);
            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Tên sân không được vượt quá 50 ký tự", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Field_04
        [Fact]
        public async Task CreateField_WithoutFacId_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new FieldCreateDTO
            {
                FieldName = "Sân A",
                FacId = 0, 
                CategoryId = 2,
                Description = "Sân cỏ nhân tạo",
            };
            _fieldServiceMock.Setup(s => s.CreateFieldAsync(createDto))
                .ThrowsAsync(new ArgumentException("ID cơ sở là bắt buộc"));
            // Act
            var result = await _controller.CreateField(createDto);
            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("ID cơ sở là bắt buộc", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Field_05
        [Fact]
        public async Task CreateField_WithoutCategoryId_ReturnsBadRequets()
        {
            // Arrange
            var createDto = new FieldCreateDTO
            {
                FieldName = "Sân A",
                FacId = 1,
                CategoryId = 0,
                Description = "Sân cỏ nhân tạo",
            };
            _fieldServiceMock.Setup(s => s.CreateFieldAsync(createDto))
                .ThrowsAsync(new ArgumentException("Loại sân là bắt buộc"));
            // Act
            var result = await _controller.CreateField(createDto);
            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Loại sân là bắt buộc", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Field_06
        [Fact]
        public async Task CreateField_DuplicateNameInFacility_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new FieldCreateDTO
            {
                FieldName = "Sân A",
                FacId = 1,
                CategoryId = 2,
                Description = "Sân cỏ nhân tạo",
            };
            _fieldServiceMock.Setup(s => s.CreateFieldAsync(createDto))
                .ThrowsAsync(new ArgumentException("Tên sân 'Sân A' đã tồn tại trong cơ sở này"));
            // Act
            var result = await _controller.CreateField(createDto);
            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Tên sân 'Sân A' đã tồn tại trong cơ sở này", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Field_07
        [Fact]
        public async Task GetFieldById_ValidId_ReturnsOk()
        {
            // Arrange
            var mockField = new FieldResponseDTO
            {
                FieldId = 1,
                FieldName = "Sân A",
                FacId = 1,
                CategoryId = 2,
                CategoryName = "Sân cỏ nhân tạo",
                Description = "Sân cỏ nhân tạo chất lượng cao",
                IsBookingEnable = true,
                FacilityAddress = "123 Đường ABC, Quận 1, TP.HCM"
            };
            _fieldServiceMock.Setup(s => s.GetFieldByIdAsync(1))
                .ReturnsAsync(mockField);
            // Act
            var result = await _controller.GetFieldByID(1);
            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Lấy thông tin sân thành công", doc.RootElement.GetProperty("message").GetString());

            var data = doc.RootElement.GetProperty("data");
            Assert.Equal(1, data.GetProperty("FieldId").GetInt32());
            Assert.Equal("Sân A", data.GetProperty("FieldName").GetString());
            Assert.Equal(1, data.GetProperty("FacId").GetInt32());
            Assert.Equal(2, data.GetProperty("CategoryId").GetInt32());
            Assert.Equal("Sân cỏ nhân tạo", data.GetProperty("CategoryName").GetString());
            Assert.Equal("Sân cỏ nhân tạo chất lượng cao", data.GetProperty("Description").GetString());
            Assert.True(data.GetProperty("IsBookingEnable").GetBoolean());
            Assert.Equal("123 Đường ABC, Quận 1, TP.HCM", data.GetProperty("FacilityAddress").GetString());
        }

        // TC_Field_08
        [Fact]
        public async Task GetFieldById_InvalidId_ReturnsNotFound()
        {
            // Arrange
            _fieldServiceMock.Setup(s => s.GetFieldByIdAsync(999))
                .ReturnsAsync((FieldResponseDTO?)null);
            // Act
            var result = await _controller.GetFieldByID(999);
            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var json = JsonSerializer.Serialize(notFoundResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Không tìm thấy sân", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Field(BE)
        [Fact]
        public async Task GetFieldById_ArgumentException_ReturnsBadRequest()
        {
            // Arrange
            _fieldServiceMock.Setup(s => s.GetFieldByIdAsync(-1))
                .ThrowsAsync(new ArgumentException("ID sân không hợp lệ"));
            // Act
            var result = await _controller.GetFieldByID(-1);
            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("ID sân không hợp lệ", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Field_09
        [Fact]
        public async Task UpdateField_ValidName_ReturnOk()
        {
            // Arrange
            var updateDto = new FieldUpdateDTO
            {
                FieldName = "Sân B",
                Description = "Sân cỏ nhân tạo đã cập nhật"
            };
            _fieldServiceMock.Setup(s => s.UpdateFieldAsync(1, updateDto))
                .ReturnsAsync(true);
            // Act
            var result = await _controller.UpdateField(1, updateDto);
            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Cập nhật sân thành công", doc.RootElement.GetProperty("message").GetString());
            Assert.Equal(1, doc.RootElement.GetProperty("fieldId").GetInt32());
        }

        // TC_Field_10
        [Fact]
        public async Task UpdateField_NameTooLong_ReturnBadsRequest()
        {
            // Arrange
            var longName = new string('B', 51);
            var updateDto = new FieldUpdateDTO
            {
                FieldName = longName,
            };
            _fieldServiceMock.Setup(s => s.UpdateFieldAsync(1, updateDto))
                .ThrowsAsync(new ArgumentException("Tên sân không được quá 50 ký tự"));
            // Act
            var result = await _controller.UpdateField(1, updateDto);
            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Tên sân không được quá 50 ký tự", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Field_11
        [Fact]
        public async Task UpdateField_DisableBooking_ReturnsOk()
        {
            // Arrange
            var updateDto = new FieldUpdateDTO
            {
                IsBookingEnable = false
            };
            _fieldServiceMock.Setup(s => s.UpdateFieldAsync(1, updateDto))
                .ReturnsAsync(true);
            // Act
            var result = await _controller.UpdateField(1, updateDto);
            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Cập nhật sân thành công", doc.RootElement.GetProperty("message").GetString());
            Assert.Equal(1, doc.RootElement.GetProperty("fieldId").GetInt32());
        }

        // TC_Field_12
        [Fact]
        public async Task UpdateField_EnableBooking_ReturnsOk()
        {
            // Arrange
            var updateDto = new FieldUpdateDTO
            {
                IsBookingEnable = true
            };
            _fieldServiceMock.Setup(s => s.UpdateFieldAsync(1, updateDto))
                .ReturnsAsync(true);
            // Act
            var result = await _controller.UpdateField(1, updateDto);
            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Cập nhật sân thành công", doc.RootElement.GetProperty("message").GetString());
            Assert.Equal(1, doc.RootElement.GetProperty("fieldId").GetInt32());
        }

        // TC_Field(BE)
        [Fact]
        public async Task UpdateField_InvalidId_ReturnsNotFound()
        {
            // Arrange
            var updateDto = new FieldUpdateDTO
            {
                FieldName = "Sân B"
            };
            _fieldServiceMock.Setup(s => s.UpdateFieldAsync(999, updateDto))
                .ReturnsAsync(false);
            // Act
            var result = await _controller.UpdateField(999, updateDto);
            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var json = JsonSerializer.Serialize(notFoundResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Không tìm thấy sân để cập nhật", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Field(BE)
        [Fact]
        public async Task UpdateField_FieldNotFound_ReturnsNotFound()
        {
            // Arrange
            var updateDto = new FieldUpdateDTO
            {
                FieldName = "Sân B"
            };
            _fieldServiceMock.Setup(s => s.UpdateFieldAsync(9999, updateDto))
                .ReturnsAsync(false);
            // Act
            var result = await _controller.UpdateField(9999, updateDto);
            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var json = JsonSerializer.Serialize(notFoundResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Không tìm thấy sân để cập nhật", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Field(BE)
        [Fact]
        public async Task UpdateField_ArgumentException_ReturnsBadRequest()
        {
            // Arrange
            var updateDto = new FieldUpdateDTO
            {
                CategoryId = 999
            };
            _fieldServiceMock.Setup(s => s.UpdateFieldAsync(1, updateDto))
                .ThrowsAsync(new ArgumentException("Loại sân với ID 999 không tồn tại"));
            // Act
            var result = await _controller.UpdateField(1, updateDto);
            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Loại sân với ID 999 không tồn tại", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Field_13
        [Fact]
        public async Task DeleteField_ValidId_ReturnsOk()
        {
            // Arrange
            _fieldServiceMock.Setup(s => s.DeleteFieldAsync(1))
                .ReturnsAsync(true);
            // Act
            var result = await _controller.DeleteField(1);
            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Xóa sân thành công", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Field_14
        [Fact]
        public async Task DeleteField_FieldNotFound_ReturnsNotFound()
        {
            // Arrange
            _fieldServiceMock.Setup(s => s.DeleteFieldAsync(999))
                .ReturnsAsync(false);
            // Act
            var result = await _controller.DeleteField(999);
            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var json = JsonSerializer.Serialize(notFoundResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Không tìm thấy sân để xóa", doc.RootElement.GetProperty("message").GetString());
        }

        // TC_Field_15
        [Fact]
        public async Task DeleteField_ArgumentException_ReturnsBadRequest()
        {
            // Arrange
            _fieldServiceMock.Setup(s => s.DeleteFieldAsync(1))
                .ThrowsAsync(new ArgumentException("Không thể xóa sân đang có booking"));
            // Act
            var result = await _controller.DeleteField(1);
            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Không thể xóa sân đang có booking", doc.RootElement.GetProperty("message").GetString());
        }
    }
}
