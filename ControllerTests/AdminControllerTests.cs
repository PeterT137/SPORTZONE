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
        public async Task GetAllAccount_EmptyList_ReturnsOk_WithZeroCount()
        {
            // Arrange
            _adminServiceMock.Setup(s => s.GetAllAccount())
                .ReturnsAsync(new List<User>());

            // Act
            var result = await _controller.GetAllAccount();

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(ok.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal(0, doc.RootElement.GetProperty("count").GetInt32());
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

        [Fact]
        public async Task SearchUsers_EmptySearchDto_ReturnsOk_WithAllUsers()
        {
            // Arrange
            var searchDto = new SearchUserDto();
            var mockUsers = new List<User>
            {
                new User { UId = 1, UEmail = "user1@test.com" },
                new User { UId = 2, UEmail = "user2@test.com" }
            };

            _adminServiceMock.Setup(s => s.SearchUsers(searchDto))
                .ReturnsAsync(mockUsers);

            // Act
            var result = await _controller.SearchUsers(searchDto);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(ok.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal(2, doc.RootElement.GetProperty("count").GetInt32());
        }

        [Fact]
        public async Task SearchUsers_WithEmailFilter_ReturnsOk_WithFilteredData()
        {
            // Arrange
            var searchDto = new SearchUserDto { Email = "admin" };
            var mockUsers = new List<User>
            {
                new User { UId = 1, UEmail = "admin@test.com" },
                new User { UId = 2, UEmail = "superadmin@test.com" }
            };

            _adminServiceMock.Setup(s => s.SearchUsers(searchDto))
                .ReturnsAsync(mockUsers);

            // Act
            var result = await _controller.SearchUsers(searchDto);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(ok.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal(2, doc.RootElement.GetProperty("count").GetInt32());
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

        [Fact]
        public async Task CreateAccount_MultipleValidationErrors_ReturnsBadRequest()
        {
            // Arrange
            _controller.ModelState.AddModelError("Email", "Email is required");
            _controller.ModelState.AddModelError("Password", "Password is required");
            _controller.ModelState.AddModelError("RoleId", "Role is required");

            // Act
            var result = await _controller.CreateAccount(new CreateAccountDto());

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequest.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal("Dữ liệu không hợp lệ", doc.RootElement.GetProperty("message").GetString());
        }

        [Fact]
        public async Task CreateAccount_ValidCustomer_ReturnsCreatedWithCustomerInfo()
        {
            // Arrange
            var createDto = new CreateAccountDto { RoleId = 1 };
            var mockUser = new User
            {
                UId = 10,
                UEmail = "customer@test.com",
                RoleId = 1,
                UStatus = "1",
                UCreateDate = DateTime.UtcNow,
                Customer = new Customer { UId = 1, Name = "Test Customer" }
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
            Assert.Equal(1, doc.RootElement.GetProperty("data").GetProperty("roleId").GetInt32());
        }

        [Fact]
        public async Task CreateAccount_ValidFieldOwner_ReturnsCreatedWithFieldOwnerInfo()
        {
            // Arrange
            var createDto = new CreateAccountDto { RoleId = 2 };
            var mockUser = new User
            {
                UId = 10,
                UEmail = "owner@test.com",
                RoleId = 2,
                UStatus = "1",
                UCreateDate = DateTime.UtcNow,
                FieldOwner = new FieldOwner { UId = 1, Name = "Test Owner" }
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
            Assert.Equal(2, doc.RootElement.GetProperty("data").GetProperty("roleId").GetInt32());
        }

        [Fact]
        public async Task CreateAccount_ValidStaff_ReturnsCreatedWithStaffInfo()
        {
            // Arrange
            var createDto = new CreateAccountDto { RoleId = 4 };
            var mockUser = new User
            {
                UId = 10,
                UEmail = "staff@test.com",
                RoleId = 4,
                UStatus = "1",
                UCreateDate = DateTime.UtcNow,
                Staff = new Staff { UId = 10, Name = "Test Staff" }
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
            Assert.Equal(4, doc.RootElement.GetProperty("data").GetProperty("roleId").GetInt32());
        }

        [Fact]
        public async Task CreateAccount_InvalidRoleId_ReturnsCreatedWithNullRoleInfo()
        {
            // Arrange
            var createDto = new CreateAccountDto { RoleId = 99 };
            var mockUser = new User
            {
                UId = 10,
                UEmail = "invalid@test.com",
                RoleId = 99,
                UStatus = "1",
                UCreateDate = DateTime.UtcNow
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
            Assert.Equal(99, doc.RootElement.GetProperty("data").GetProperty("roleId").GetInt32());
        }

        [Fact]
        public async Task CreateAccount_ServiceThrowsSpecificException_Returns500WithMessage()
        {
            // Arrange
            _adminServiceMock.Setup(s => s.CreateAccount(It.IsAny<CreateAccountDto>()))
                .ThrowsAsync(new ArgumentException("Invalid email format"));

            // Act
            var result = await _controller.CreateAccount(new CreateAccountDto());

            // Assert
            var obj = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, obj.StatusCode);
            var json = JsonSerializer.Serialize(obj.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Contains("Invalid email format", doc.RootElement.GetProperty("message").GetString());
        }
    }
}
