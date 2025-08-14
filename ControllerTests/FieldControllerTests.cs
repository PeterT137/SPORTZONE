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
            };
            var mockField = new Field
            {
                FieldName = "Sân A",
                FacId = 1,
                CategoryId = 2,
                Description = "Sân cỏ nhân tạo",
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
            Assert.Equal("Sân A", doc.RootElement.GetProperty("data").GetProperty("fieldName").GetString());
        }
    }
}
