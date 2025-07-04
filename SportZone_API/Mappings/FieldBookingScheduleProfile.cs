using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Mappings
{
    public class FieldBookingScheduleProfile : Profile
    {
        public FieldBookingScheduleProfile()
        {
            CreateMap<FieldBookingSchedule, FieldBookingScheduleDto>().ReverseMap();
            CreateMap<FieldBookingScheduleCreateDto, FieldBookingSchedule>();
            CreateMap<FieldBookingScheduleUpdateDto, FieldBookingSchedule>();
        }
    }
}
