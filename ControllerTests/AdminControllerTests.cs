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
    public class AdminControllerTests
    {
        private readonly Mock<IAdminService> _adminServiceMock;
        private readonly AdminController _controller;

        public AdminControllerTests()
        {
            _adminServiceMock = new Mock<IAdminService>();
            _controller = new AdminController(_adminServiceMock.Object);
        }

        // ===== GET ALL ACCOUNT =====
        [Fact]
        public async Task GetAllAccount_ReturnsOk_WithData()
        {
            // Arrange
            var mockUsers = new List<User>
            {
                new User { UId = 1, UEmail = "a@test.com" },
                new User { UId = 2, UEmail = "b@test.com" },
                new User { UId = 2, UEmail = "b@test.com" },
                new User { UId = 2, UEmail = "b@test.com" },
                new User { UId = 2, UEmail = "b@test.com" }
            };
            _adminServiceMock.Setup(s => s.GetAllAccount())
                .ReturnsAsync(mockUsers);

            // Act
            var result = await _controller.GetAllAccount();

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(ok.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal(5, doc.RootElement.GetProperty("count").GetInt32());
        }

        [Fact]
        public async Task GetAllAccount_ServiceThrows_Returns500()
        {
            // Arrange
            _adminServiceMock.Setup(s => s.GetAllAccount())
                .ThrowsAsync(new Exception("fail"));

            // Act
            var result = await _controller.GetAllAccount();

            // Assert
            var obj = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, obj.StatusCode);
        }

        // ===== SEARCH USERS =====
        [Fact]
        public async Task SearchUsers_ReturnsOk_WithData()
        {
            // Arrange
            var searchDto = new SearchUserDto { Email = "test" };
            var mockUsers = new List<User> { new User { UId = 1, UEmail = "abc@test.com" } };

            _adminServiceMock.Setup(s => s.SearchUsers(searchDto))
                .ReturnsAsync(mockUsers);

            // Act
            var result = await _controller.SearchUsers(searchDto);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(ok.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal(1, doc.RootElement.GetProperty("count").GetInt32());
        }

        [Fact]
        public async Task SearchUsers_NullDto_ReturnsOk_WithEmptyList()
        {
            // Arrange
            _adminServiceMock.Setup(s => s.SearchUsers(It.IsAny<SearchUserDto>()))
                .ReturnsAsync(new List<User>());

            // Act
            var result = await _controller.SearchUsers(null);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(ok.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal(0, doc.RootElement.GetProperty("count").GetInt32());
        }

        [Fact]
        public async Task SearchUsers_ServiceThrows_Returns500()
        {
            // Arrange
            _adminServiceMock.Setup(s => s.SearchUsers(It.IsAny<SearchUserDto>()))
                .ThrowsAsync(new Exception("err"));

            // Act
            var result = await _controller.SearchUsers(new SearchUserDto());

            // Assert
            var obj = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, obj.StatusCode);
        }

        // ===== CREATE ACCOUNT =====
        [Fact]
        public async Task CreateAccount_InvalidModel_ReturnsBadRequest()
        {
            // Arrange
            _controller.ModelState.AddModelError("Email", "Required");

            // Act
            var result = await _controller.CreateAccount(new CreateAccountDto());

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequest.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
        }

        [Fact]
        public async Task CreateAccount_Valid_ReturnsCreated()
        {
            // Arrange
            var createDto = new CreateAccountDto();
            var mockUser = new User
            {
                UId = 10,
                UEmail = "test@test.com",
                RoleId = 3,
                UStatus = "1",
                UCreateDate = DateTime.UtcNow,                
            };
            _adminServiceMock.Setup(s => s.CreateAccount(createDto))
                .ReturnsAsync(mockUser);

            // Act
            var result = await _controller.CreateAccount(createDto);

            // Assert
            var created = Assert.IsType<CreatedAtActionResult>(result);
            var json = JsonSerializer.Serialize(created.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal(10, doc.RootElement.GetProperty("data").GetProperty("userId").GetInt32());
        }

        [Fact]
        public async Task CreateAccount_ServiceThrows_Returns500()
        {
            // Arrange
            _adminServiceMock.Setup(s => s.CreateAccount(It.IsAny<CreateAccountDto>()))
                .ThrowsAsync(new Exception("db fail"));

            // Act
            var result = await _controller.CreateAccount(new CreateAccountDto());

            // Assert
            var obj = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, obj.StatusCode);
        }
    }
}
