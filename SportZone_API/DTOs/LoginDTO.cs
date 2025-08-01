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

    /// <summary>
    /// DTO cho thông tin facility của user sau khi login
    /// </summary>
    public class FacilityInfoLoginDTO
    {
        /// <summary>
        /// Facility ID cho Staff (Staff được assign vào 1 facility cụ thể)
        /// </summary>
        public int? FacId { get; set; }

        /// <summary>
        /// Tên facility (cho Staff)
        /// </summary>
        public string? FacilityName { get; set; }

        /// <summary>
        /// Danh sách facilities cho FieldOwner (FieldOwner có thể sở hữu nhiều facility)
        /// </summary>
        public List<FacilityBasicDTO>? Facilities { get; set; }
    }

    /// <summary>
    /// DTO cơ bản cho facility information
    /// </summary>
    public class FacilityBasicDTO
    {
        public int FacId { get; set; }
        public string? Name { get; set; }
        public string? Address { get; set; }
        public string? Description { get; set; }
    }
}
