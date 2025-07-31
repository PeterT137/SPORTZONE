using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;
using System.Linq;
using System.Collections.Generic;

namespace SportZone_API.Mappings
{
    public class FacilityProfile : Profile
    {
        public FacilityProfile()
        {
            CreateMap<FacilityDto, Facility>()
                .ForMember(dest => dest.Images, opt => opt.MapFrom(src =>
                    src.ImageUrls != null ? src.ImageUrls.Select(url => new Image { ImageUrl = url }).ToList() : new List<Image>()
                ))
                .ForMember(dest => dest.FacId, opt => opt.Ignore()) 
                .ForMember(dest => dest.UId, opt => opt.MapFrom(src => src.UserId));

            CreateMap<Facility, FacilityDto>()
                .ForMember(dest => dest.ImageUrls, opt => opt.MapFrom(src =>
                    src.Images != null ? src.Images.Select(img => img.ImageUrl).ToList() : new List<string>()
                ))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UId));
        }
    }
}