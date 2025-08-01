namespace SportZone_API.DTOs
{
    public class DiscountDto
    {
        public int FacId { get; set; }

        public decimal? DiscountPercentage { get; set; }

        public DateOnly? StartDate { get; set; }

        public DateOnly? EndDate { get; set; }

        public string? Description { get; set; }

        public bool? IsActive { get; set; }

        public int? Quantity { get; set; }
    }
}