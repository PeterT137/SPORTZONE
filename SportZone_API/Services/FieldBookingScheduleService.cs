using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace SportZone_API.Services
{
    public class FieldBookingScheduleService : IFieldBookingScheduleService
    {
        private readonly IFieldBookingScheduleRepository _scheduleRepository;
        private readonly IFieldPricingService _fieldPricingService;
        private readonly IFieldRepository _fieldRepository;
        private readonly IFacilityRepository _facilityRepository;
        private readonly IMapper _mapper;
        private static readonly TimeSpan FixedSlotDuration = TimeSpan.FromMinutes(30);

        public FieldBookingScheduleService(
            IFieldBookingScheduleRepository scheduleRepository,
            IFieldPricingService fieldPricingService,
            IFieldRepository fieldRepository,
            IFacilityRepository facilityRepository,
            IMapper mapper)
        {
            _scheduleRepository = scheduleRepository;
            _fieldPricingService = fieldPricingService;
            _fieldRepository = fieldRepository;
            _facilityRepository = facilityRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<FieldBookingScheduleDto>> GetAllFieldBookingSchedulesAsync()
        {
            var schedules = await _scheduleRepository.GetAllSchedulesAsync();
            return _mapper.Map<IEnumerable<FieldBookingScheduleDto>>(schedules);
        }

        public async Task<FieldBookingScheduleDto?> GetFieldBookingScheduleByIdAsync(int id)
        {
            var schedule = await _scheduleRepository.GetScheduleByIdAsync(id);
            return _mapper.Map<FieldBookingScheduleDto>(schedule);
        }

        public async Task<ScheduleGenerationResponseDto> GenerateFieldBookingSchedulesAsync(FieldBookingScheduleGenerateDto generateDto)
        {
            DateOnly today = DateOnly.FromDateTime(DateTime.Now);
            if (generateDto.StartDate < today)
            {
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = "Ngày bắt đầu không được ở trong quá khứ."
                };
            }
            if (generateDto.StartDate > generateDto.EndDate)
            {
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc."
                };
            }

            var field = await _fieldRepository.GetFieldByIdAsync(generateDto.FieldId);
            if (field == null)
            {
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = "Không tìm thấy sân."
                };
            }

            var facility = await _facilityRepository.GetByIdAsync(field.FacId.Value);
            if (facility == null)
            {
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = "Không tìm thấy cơ sở."
                };
            }

            TimeOnly dailyStartTime = TimeOnly.FromTimeSpan(generateDto.DailyStartTime);
            TimeOnly dailyEndTime = TimeOnly.FromTimeSpan(generateDto.DailyEndTime);

            if (dailyStartTime < facility.OpenTime.Value)
            {
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = $"Thời gian bắt đầu trong ngày ({dailyStartTime.ToString(@"HH\:mm")}) không được nhỏ hơn thời gian mở cửa của cơ sở ({facility.OpenTime.Value.ToString(@"HH\:mm")})."
                };
            }

            if (dailyEndTime > facility.CloseTime.Value)
            {
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = $"Thời gian kết thúc trong ngày ({dailyEndTime.ToString(@"HH\:mm")}) không được lớn hơn thời gian đóng cửa của cơ sở ({facility.CloseTime.Value.ToString(@"HH\:mm")})."
                };
            }

            if (dailyStartTime >= dailyEndTime)
            {
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = "Thời gian bắt đầu trong ngày phải nhỏ hơn thời gian kết thúc trong ngày."
                };
            }

            var schedulesToAdd = new List<FieldBookingSchedule>();
            var pricingConfigsForField = (await _fieldPricingService.GetFieldPricingsByFieldIdAsync(generateDto.FieldId)).ToList();

            var existingSchedules = (await _scheduleRepository.GetAllSchedulesAsync())
                                        .Where(s => s.FieldId == generateDto.FieldId &&
                                                    s.Date >= generateDto.StartDate &&
                                                    s.Date <= generateDto.EndDate)
                                        .ToList();

            var duplicateEntriesFound = new List<string>();
            var duplicateDates = new HashSet<DateOnly>();

            DateOnly currentDate = generateDto.StartDate;
            while (currentDate <= generateDto.EndDate)
            {
                DateOnly todayLocal = DateOnly.FromDateTime(DateTime.Now);
                if (currentDate < todayLocal)
                {
                    currentDate = currentDate.AddDays(1);
                    continue;
                }

                TimeOnly slotStartTime = dailyStartTime;
                while (slotStartTime < dailyEndTime)
                {
                    TimeOnly slotEndTime = slotStartTime.Add(FixedSlotDuration);

                    // Nếu slot kết thúc vượt quá DailyEndTime, cắt ngắn slot đó
                    if (slotEndTime > dailyEndTime)
                    {
                        // Nếu phần còn lại của thời gian ít hơn FixedSlotDuration, không tạo slot này
                        if ((dailyEndTime - slotStartTime) < FixedSlotDuration)
                        {
                            // Bỏ qua phần thời gian lẻ cuối cùng nếu không đủ 30 phút
                            break;
                        }
                        slotEndTime = dailyEndTime; // Cắt ngắn slot cuối cùng
                    }

                    if (currentDate == todayLocal)
                    {
                        TimeOnly currentTime = TimeOnly.FromDateTime(DateTime.Now);
                        if (slotEndTime <= currentTime)
                        {
                            slotStartTime = slotEndTime;
                            continue;
                        }
                    }

                    bool scheduleExists = existingSchedules.Any(s =>
                        s.Date == currentDate &&
                        s.StartTime == slotStartTime &&
                        s.EndTime == slotEndTime &&
                        s.FieldId == generateDto.FieldId
                    );

                    if (!scheduleExists)
                    {
                        decimal slotPrice = CalculatePriceForSlot(slotStartTime, pricingConfigsForField);
                        schedulesToAdd.Add(new FieldBookingSchedule
                        {
                            FieldId = generateDto.FieldId,
                            Date = currentDate,
                            StartTime = slotStartTime,
                            EndTime = slotEndTime,
                            Price = slotPrice,
                            Status = "Available",
                            Notes = generateDto.Notes
                        });
                    }
                    else
                    {
                        duplicateEntriesFound.Add($"Slot {currentDate.ToShortDateString()} từ {slotStartTime.ToString(@"HH\:mm")} đến {slotEndTime.ToString(@"HH\:mm")}");
                        duplicateDates.Add(currentDate);
                    }
                    slotStartTime = slotEndTime;
                }
                currentDate = currentDate.AddDays(1);
            }


            if (duplicateEntriesFound.Any())
            {
                var duplicateDatesList = duplicateDates.OrderBy(d => d).ToList();
                string message;

                if (duplicateDatesList.Count == 1)
                {
                    message = $"Không thể tạo lịch. Ngày {duplicateDatesList[0].ToShortDateString()} đã có lịch đặt. Vui lòng kiểm tra lại.";
                }
                else if (duplicateDatesList.Count > 1)
                {
                    var dateRanges = new List<string>();
                    DateOnly rangeStart = duplicateDatesList[0];
                    DateOnly rangeEnd = duplicateDatesList[0];

                    for (int i = 1; i < duplicateDatesList.Count; i++)
                    {
                        if (duplicateDatesList[i] == rangeEnd.AddDays(1))
                        {
                            rangeEnd = duplicateDatesList[i];
                        }
                        else
                        {
                            if (rangeStart == rangeEnd)
                            {
                                dateRanges.Add(rangeStart.ToShortDateString());
                            }
                            else
                            {
                                dateRanges.Add($"{rangeStart.ToShortDateString()} đến {rangeEnd.ToShortDateString()}");
                            }
                            rangeStart = duplicateDatesList[i];
                            rangeEnd = duplicateDatesList[i];
                        }
                    }
                    if (rangeStart == rangeEnd)
                    {
                        dateRanges.Add(rangeStart.ToShortDateString());
                    }
                    else
                    {
                        dateRanges.Add($"{rangeStart.ToShortDateString()} đến {rangeEnd.ToShortDateString()}");
                    }
                    message = $"Không thể tạo lịch. Các ngày sau đã có lịch đặt: {string.Join("; ", dateRanges)}. Vui lòng kiểm tra lại.";
                }
                else
                {
                    message = "Đã xảy ra lỗi không xác định khi kiểm tra trùng lặp lịch.";
                }

                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = message
                };
            }

            if (!schedulesToAdd.Any())
            {
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = "Không có lịch hợp lệ nào được tạo ra. Vui lòng kiểm tra các tham số đầu vào và đảm bảo không có lịch nào đã ở trong quá khứ hoặc trùng lặp, hoặc không nằm trong giờ hoạt động của cơ sở."
                };
            }

            await _scheduleRepository.AddRangeSchedulesAsync(schedulesToAdd);
            return new ScheduleGenerationResponseDto
            {
                IsSuccess = true,
                Message = $"Đã tạo thành công {schedulesToAdd.Count} lịch cho sân {generateDto.FieldId} từ {generateDto.StartDate.ToShortDateString()} đến {generateDto.EndDate.ToShortDateString()}."
            };
        }

        private decimal CalculatePriceForSlot(TimeOnly slotCurrentTime, List<FieldPricingDto> pricingConfigs)
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

        public async Task<FieldBookingScheduleDto?> UpdateFieldBookingScheduleAsync(int id, FieldBookingScheduleUpdateDto updateDto)
        {
            var existingSchedule = await _scheduleRepository.GetScheduleByIdAsync(id);
            if (existingSchedule == null)
            {
                return null;
            }
            _mapper.Map(updateDto, existingSchedule);
            await _scheduleRepository.UpdateScheduleAsync(existingSchedule);
            return _mapper.Map<FieldBookingScheduleDto>(existingSchedule);
        }

        public async Task<ScheduleGenerationResponseDto> DeleteFieldBookingScheduleAsync(int id)
        {
            var scheduleToDelete = await _scheduleRepository.GetScheduleByIdAsync(id);

            if (scheduleToDelete == null)
            {
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = "Không tìm thấy lịch đặt sân để xóa."
                };
            }
            if (scheduleToDelete.BookingId.HasValue)
            {
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = $"Không thể xóa lịch đặt sân này vì nó đã có booking (Booking ID: {scheduleToDelete.BookingId.Value})."
                };
            }
            bool isDeleted = await _scheduleRepository.DeleteScheduleAsync(id);
            if (isDeleted)
            {
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = true,
                    Message = "Lịch đặt sân đã được xóa thành công."
                };
            }
            else
            {
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = "Đã xảy ra lỗi khi xóa lịch đặt sân."
                };
            }
        }
    }
}