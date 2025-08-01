using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;

public class FacilityProfile : Profile
{
    public FacilityProfile()
    {
        CreateMap<FacilityDto, Facility>()
            .ForMember(dest => dest.Images, opt => opt.MapFrom(src =>
                src.Images != null ? new List<Image>() : new List<Image>()
            ))
            .ForMember(dest => dest.FacId, opt => opt.Ignore())
            .ForMember(dest => dest.UId, opt => opt.MapFrom(src => src.UserId));

        CreateMap<Facility, FacilityDto>()
            .ForMember(dest => dest.Images, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UId));

        CreateMap<FacilityUpdateDto, Facility>()
            .ForMember(dest => dest.UId, opt => opt.MapFrom(src => src.UserId))
            .ForMember(dest => dest.Images, opt => opt.Ignore())
            .ForMember(dest => dest.FacId, opt => opt.Ignore());
    }
}