﻿namespace SportZone_API.DTOs
{
    public class FacilityDto
    {
        public TimeOnly? OpenTime { get; set; }

        public TimeOnly? CloseTime { get; set; }

        public string? Address { get; set; }

        public string? Description { get; set; }

        public string? Subdescription { get; set; }
    }
}
