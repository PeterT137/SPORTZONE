using System.ComponentModel.DataAnnotations;

namespace SportZone_API.DTOs
{
    public class UpdateUserStatusDto
    {
        [Required(ErrorMessage = "Trạng thái không được để trống")]
        [RegularExpression("^(Active|Inactive)$", ErrorMessage = "Trạng thái chỉ có thể là 'Active' hoặc 'Inactive'")]
        public string Status { get; set; } = string.Empty;
    }
}
