using System.ComponentModel.DataAnnotations;

namespace SportZone_API.DTOs
{
    public class LoginDTO
    {
        public string UEmail { get; set; } = string.Empty;
        public string UPassword { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO cho logout request
    /// </summary>
    public class LogoutDTO
    {
        [Required(ErrorMessage = "User ID là bắt buộc")]
        public int UId { get; set; }

        /// <summary>
        /// JWT Token hiện tại (để invalidate)
        /// </summary>
        public string? Token { get; set; }
    }

    /// <summary>
    /// DTO cho logout response
    /// </summary>
    public class LogoutResponseDTO
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime LogoutTime { get; set; }
        public int UserId { get; set; }
    }
}
