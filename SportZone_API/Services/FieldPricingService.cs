using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.AspNetCore.SignalR;
using SportZone_API.Hubs; 

namespace SportZone_API.Services
{
    public class FieldPricingService : IFieldPricingService
    {
        private readonly IFieldPricingRepository _fieldPricingRepository;
        private readonly IFieldBookingScheduleRepository _fieldBookingScheduleRepository;
        private readonly IMapper _mapper;
        private readonly IHubContext<NotificationHub> _hubContext;

        public FieldPricingService(
            IFieldPricingRepository fieldPricingRepository,
            IFieldBookingScheduleRepository fieldBookingScheduleRepository,
            IMapper mapper,
            IHubContext<NotificationHub> hubContext) 
        {
            _fieldPricingRepository = fieldPricingRepository;
            _fieldBookingScheduleRepository = fieldBookingScheduleRepository;
            _mapper = mapper;
            _hubContext = hubContext;
        }

        public async Task<IEnumerable<FieldPricingDto>> GetAllFieldPricingsAsync()
        {
            var pricings = await _fieldPricingRepository.GetAllPricingConfigsAsync();
            return _mapper.Map<IEnumerable<FieldPricingDto>>(pricings);
        }

        public async Task<FieldPricingDto?> GetFieldPricingByIdAsync(int id)
        {
            var pricing = await _fieldPricingRepository.GetPricingConfigByIdAsync(id);
            return _mapper.Map<FieldPricingDto>(pricing);
        }

        public async Task<IEnumerable<FieldPricingDto>> GetFieldPricingsByFieldIdAsync(int fieldId)
        {
            var pricings = await _fieldPricingRepository.GetPricingConfigsByFieldIdAsync(fieldId);
            return _mapper.Map<IEnumerable<FieldPricingDto>>(pricings);
        }

        public async Task<FieldPricingDto> CreateFieldPricingAsync(FieldPricingCreateDto createDto)
        {
            var facility = await _fieldPricingRepository.GetFacilityByFieldIdAsync(createDto.FieldId);
            if (facility == null)
            {
                throw new Exception("Không tìm thấy thông tin cơ sở cho sân này.");
            }
            if (createDto.StartTime < facility.OpenTime)
            {
                throw new Exception($"Thời gian bắt đầu phải từ {facility.OpenTime} trở đi.");
            }
            if (createDto.EndTime > facility.CloseTime)
            {
                throw new Exception($"Thời gian kết thúc phải trước hoặc bằng {facility.CloseTime}.");
            }
            if (createDto.StartTime >= createDto.EndTime)
            {
                throw new Exception("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.");
            }

            var isOverlapping = await _fieldPricingRepository.HasOverlappingPricingAsync(createDto.FieldId, createDto.StartTime, createDto.EndTime);
            if (isOverlapping)
            {
                throw new Exception("Khung giờ giá này đã tồn tại hoặc bị chồng chéo với khung giờ khác.");
            }
            var pricing = _mapper.Map<FieldPricing>(createDto);
            await _fieldPricingRepository.AddPricingConfigAsync(pricing);
            await UpdateFieldBookingSchedulesPrice(createDto.FieldId);
            return _mapper.Map<FieldPricingDto>(pricing);
        }

        public async Task<FieldPricingDto?> UpdateFieldPricingAsync(int id, FieldPricingUpdateDto updateDto)
        {
            var existingPricing = await _fieldPricingRepository.GetPricingConfigByIdAsync(id);
            if (existingPricing == null)
            {
                return null;
            }

            var facility = await _fieldPricingRepository.GetFacilityByFieldIdAsync(existingPricing.FieldId);
            if (facility == null)
            {
                throw new Exception("Không tìm thấy thông tin cơ sở cho sân này.");
            }

            var newStartTime = updateDto.StartTime ?? existingPricing.StartTime;
            var newEndTime = updateDto.EndTime ?? existingPricing.EndTime;
            if (newStartTime < facility.OpenTime)
            {
                throw new Exception($"Thời gian bắt đầu phải từ {facility.OpenTime} trở đi.");
            }
            if (newEndTime > facility.CloseTime)
            {
                throw new Exception($"Thời gian kết thúc phải trước hoặc bằng {facility.CloseTime}.");
            }
            if (newStartTime >= newEndTime)
            {
                throw new Exception("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.");
            }
            var isOverlapping = await _fieldPricingRepository.HasOverlappingPricingAsync(existingPricing.FieldId, newStartTime, newEndTime, existingPricing.PricingId);
            if (isOverlapping)
            {
                throw new Exception("Khung giờ giá này đã tồn tại hoặc bị chồng chéo với khung giờ khác.");
            }
            _mapper.Map(updateDto, existingPricing);
            await _fieldPricingRepository.UpdatePricingConfigAsync(existingPricing);
            await UpdateFieldBookingSchedulesPrice(existingPricing.FieldId);
            return _mapper.Map<FieldPricingDto>(existingPricing);
        }

        public async Task<bool> DeleteFieldPricingAsync(int id)
        {
            var configToDelete = await _fieldPricingRepository.GetPricingConfigByIdAsync(id);
            if (configToDelete == null)
            {
                return false;
            }
            var result = await _fieldPricingRepository.DeletePricingConfigAsync(id);
            if (result)
            {
                await UpdateFieldBookingSchedulesPrice(configToDelete.FieldId);
            }
            return result;
        }

        private async Task UpdateFieldBookingSchedulesPrice(int fieldId)
        {
            var allPricingConfigsForField = (await _fieldPricingRepository.GetPricingConfigsByFieldIdAsync(fieldId)).ToList();
            var schedulesToUpdate = (await _fieldBookingScheduleRepository.GetSchedulesByFieldIdAsync(fieldId))
                                                                            .Where(s => s.Status == "Available")
                                                                            .ToList();
            var updatedSchedules = new List<FieldBookingSchedule>();

            foreach (var schedule in schedulesToUpdate)
            {
                if (schedule.StartTime.HasValue)
                {
                    decimal newPrice = CalculatePriceForSlot(schedule.StartTime.Value, allPricingConfigsForField) / 2;
                    if (schedule.Price != newPrice)
                    {
                        schedule.Price = newPrice;
                        updatedSchedules.Add(schedule);
                    }
                }
            }

            if (updatedSchedules.Any())
            {
                await _fieldBookingScheduleRepository.UpdateRangeSchedulesAsync(updatedSchedules);
                await _hubContext.Clients.Group($"field-{fieldId}").SendAsync(
                    "Cập nhật giá thành công",
                    _mapper.Map<IEnumerable<FieldBookingScheduleDto>>(updatedSchedules)
                );
            }
        }

        private decimal CalculatePriceForSlot(TimeOnly slotCurrentTime, List<FieldPricing> pricingConfigs)
        {
            var matchedConfig = pricingConfigs
                .FirstOrDefault(pc =>
                    slotCurrentTime >= pc.StartTime &&
                    slotCurrentTime < pc.EndTime);
            if (matchedConfig != null)
            {
                return matchedConfig.Price;
            }
            return 0m;
        }
    }
}