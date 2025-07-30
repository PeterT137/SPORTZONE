using System;
using System.ComponentModel.DataAnnotations;

namespace SportZone_API.DTOs
{
    public class StaffDto
    {
        public int UId { get; set; } // User ID liên kết với nhân viên (và là khóa chính/duy nhất cho Staff)
        public string Email { get; set; } = string.Empty; // Từ model User (UIdNavigation.UEmail)
        public string Name { get; set; } = string.Empty; // Tên của nhân viên (Staff.Name)
        public string Phone { get; set; } = string.Empty; // Số điện thoại của nhân viên (Staff.Phone)
        public DateOnly? Dob { get; set; }
        public string? Image { get; set; }
        public int? FacId { get; set; }
        public DateOnly? StartTime { get; set; }
        public DateOnly? EndTime { get; set; }
        public string Status { get; set; } = string.Empty; // Từ model User (UIdNavigation.UStatus)
        public string RoleName { get; set; } = string.Empty; // Từ vai trò của User (UIdNavigation.Role.RoleName)
        public string? FacilityName { get; set; } // Tên cơ sở (Fac.FacName), có thể null nếu FacId là null
    }

    public class UpdateStaffDto
    {
        [StringLength(100, ErrorMessage = "Tên không được vượt quá 100 ký tự.")]
        public string? Name { get; set; } // Trường này có trong Staff model của bạn

        [Phone(ErrorMessage = "Định dạng số điện thoại không hợp lệ.")]
        [StringLength(20, MinimumLength = 10, ErrorMessage = "Số điện thoại phải từ 10 đến 20 ký tự.")]
        public string? Phone { get; set; } // Trường này có trong Staff model của bạn

        [EmailAddress(ErrorMessage = "Định dạng email không hợp lệ.")]
        [StringLength(100, ErrorMessage = "Email không được vượt quá 100 ký tự.")]
        public string? Email { get; set; } // Trường này KHÔNG có trong Staff model, sẽ bị bỏ qua khi cập nhật Staff

        public DateOnly? Dob { get; set; } // Trường này có trong Staff model của bạn

        [StringLength(255, ErrorMessage = "URL hình ảnh không được vượt quá 255 ký tự.")]
        public string? Image { get; set; } // Trường này có trong Staff model của bạn

        [Range(1, int.MaxValue, ErrorMessage = "FacId phải là một số nguyên dương.")]
        public int? FacId { get; set; } // Trường này có trong Staff model của bạn

        public DateOnly? StartTime { get; set; } // Trường này có trong Staff model của bạn
        public DateOnly? EndTime { get; set; } // Trường này có trong Staff model của bạn
    }
}