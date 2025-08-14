using System;
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
    public class AuthenticationControllerTests
    {
        private readonly Mock<IAuthService> _authServiceMock;
        private readonly AuthenticationController _controller;

        public AuthenticationControllerTests()
        {
            _authServiceMock = new Mock<IAuthService>();
            _controller = new AuthenticationController(_authServiceMock.Object);
        }      


        [Fact]
        public async Task Login_ReturnsBadRequest_OnArgumentException()
        {
            // Arrange
            _authServiceMock
                .Setup(s => s.LoginAsync(It.IsAny<LoginDTO>()))
                .ThrowsAsync(new ArgumentException("invalid"));

            // Act
            var result = await _controller.Login(new LoginDTO());

            // Assert
            var bad = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(bad.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
        }

        [Fact]
        public async Task Login_ReturnsUnauthorized_OnUnauthorizedAccessException()
        {
            // Arrange
            _authServiceMock
                .Setup(s => s.LoginAsync(It.IsAny<LoginDTO>()))
                .ThrowsAsync(new UnauthorizedAccessException("unauth"));

            // Act
            var result = await _controller.Login(new LoginDTO());

            // Assert
            var unauth = Assert.IsType<UnauthorizedObjectResult>(result);
            var json = JsonSerializer.Serialize(unauth.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
        }

        [Fact]
        public async Task Login_Returns500_OnException()
        {
            // Arrange
            _authServiceMock
                .Setup(s => s.LoginAsync(It.IsAny<LoginDTO>()))
                .ThrowsAsync(new Exception("err"));

            // Act
            var result = await _controller.Login(new LoginDTO());

            // Assert
            var obj = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, obj.StatusCode);
        }

        // ===== LOGOUT =====
        [Fact]
        public async Task Logout_ReturnsOk_WhenSuccessful()
        {
            // Arrange
            var dto = new LogoutDTO();
            var mockResp = new LogoutResponseDTO
            {
                Success = true,
                Message = "done",
                LogoutTime = DateTime.UtcNow,
                UserId = 1
            };
            _authServiceMock.Setup(s => s.LogoutAsync(dto))
                .ReturnsAsync(mockResp);

            // Act
            var result = await _controller.Logout(dto);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(ok.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.Equal(1, doc.RootElement.GetProperty("userId").GetInt32());
        }

        [Fact]
        public async Task Logout_ReturnsBadRequest_WhenFailed()
        {
            // Arrange
            var dto = new LogoutDTO();
            var mockResp = new LogoutResponseDTO
            {
                Success = false,
                Message = "fail"
            };
            _authServiceMock.Setup(s => s.LogoutAsync(dto))
                .ReturnsAsync(mockResp);

            // Act
            var result = await _controller.Logout(dto);

            // Assert
            var bad = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(bad.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
        }

        [Fact]
        public async Task Logout_ReturnsBadRequest_OnInvalidModel()
        {
            // Arrange
            _controller.ModelState.AddModelError("x", "y");

            // Act
            var result = await _controller.Logout(new LogoutDTO());

            // Assert
            var bad = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(bad.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
        }

        [Fact]
        public async Task Logout_Returns500_OnException()
        {
            // Arrange
            _authServiceMock.Setup(s => s.LogoutAsync(It.IsAny<LogoutDTO>()))
                .ThrowsAsync(new Exception("err"));

            // Act
            var result = await _controller.Logout(new LogoutDTO());

            // Assert
            var obj = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, obj.StatusCode);
        }

        // ===== VALIDATE TOKEN =====
        [Fact]
        public async Task ValidateToken_ReturnsOk_WhenValid()
        {
            // Arrange
            _authServiceMock.Setup(s => s.ValidateTokenAsync("abc"))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.ValidateToken("abc");

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(ok.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.True(doc.RootElement.GetProperty("isValid").GetBoolean());
        }

        [Fact]
        public async Task ValidateToken_ReturnsOk_WhenInvalid()
        {
            // Arrange
            _authServiceMock.Setup(s => s.ValidateTokenAsync("abc"))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.ValidateToken("abc");

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(ok.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.GetProperty("success").GetBoolean());
            Assert.False(doc.RootElement.GetProperty("isValid").GetBoolean());
        }

        [Fact]
        public async Task ValidateToken_ReturnsBadRequest_WhenEmpty()
        {
            // Act
            var result = await _controller.ValidateToken("");

            // Assert
            var bad = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(bad.Value);
            using var doc = JsonDocument.Parse(json);
            Assert.False(doc.RootElement.GetProperty("success").GetBoolean());
        }

        [Fact]
        public async Task ValidateToken_Returns500_OnException()
        {
            // Arrange
            _authServiceMock.Setup(s => s.ValidateTokenAsync("abc"))
                .ThrowsAsync(new Exception("err"));

            // Act
            var result = await _controller.ValidateToken("abc");

            // Assert
            var obj = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, obj.StatusCode);
        }
    }
}
