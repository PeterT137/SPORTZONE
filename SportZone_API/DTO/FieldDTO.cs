using System.ComponentModel.DataAnnotations;

namespace SportZone_API.DTO
{
    public class FieldCreateDTO
    {
        [Required(ErrorMessage = "Tên sân là bắt buộc")]
        [MaxLength(50, ErrorMessage = "Tên sân không được quá 50 ký tự")]
        public string FieldName { get; set; } = string.Empty;

        [Required(ErrorMessage = "ID cơ sở là bắt buộc")]
        public int FacId { get; set; }

        [Required(ErrorMessage = "Loại sân là bắt buộc")]
        public int CategoryId { get; set; }

        public string? Description { get; set; }

        [Required(ErrorMessage = "Giá thuê sân là bắt buộc")]
        [Range(0, double.MaxValue, ErrorMessage = "Giá thuê sân phải lớn hơn 0")]
        public decimal Price { get; set; }

        public bool IsBookingEnable { get; set; } = true;
    }

    public class FieldUpdateDTO
    {
        [MaxLength(50, ErrorMessage = "Tên sân không được quá 50 ký tự")]
        public string? FieldName { get; set; }

        public int? CategoryId { get; set; }

        public string? Description { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Giá thuê sân phải lớn hơn 0")]
        public decimal? Price { get; set; }

        public bool? IsBookingEnable { get; set; }
    }

    public class FieldResponseDTO
    {
        public int FieldId { get; set; }
        public int? FacId { get; set; }
        public string? FacilityAddress { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? FieldName { get; set; }
        public string? Description { get; set; }
        public decimal? Price { get; set; }
        public bool? IsBookingEnable { get; set; }
    }
}