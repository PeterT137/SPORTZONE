using System; 

namespace SportZone_API.DTOs
{
    public class RegisterStaffDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public DateOnly? Dob { get; set; }
        public string? Image { get; set; }

        public int? FacId { get; set; } 
        public DateOnly? StartTime { get; set; }
        public DateOnly? EndTime { get; set; }
    }
}