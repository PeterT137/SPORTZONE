using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Mappings
{
    public class FacilityProfile : Profile
    {
        public FacilityProfile()
        {
            CreateMap<FacilityDto, Facility>();
        }
    }
}
