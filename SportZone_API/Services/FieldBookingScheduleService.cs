using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SportZone_API.Services
{
    public class FieldBookingScheduleService : IFieldBookingScheduleService
    {
        private readonly IFieldBookingScheduleRepository _scheduleRepository;
        private readonly IMapper _mapper;

        public FieldBookingScheduleService(IFieldBookingScheduleRepository scheduleRepository, IMapper mapper)
        {
            _scheduleRepository = scheduleRepository;
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

        public async Task<FieldBookingScheduleDto> CreateFieldBookingScheduleAsync(FieldBookingScheduleCreateDto createDto)
        {
            var schedule = _mapper.Map<FieldBookingSchedule>(createDto);
            await _scheduleRepository.AddScheduleAsync(schedule);
            return _mapper.Map<FieldBookingScheduleDto>(schedule);
        }

        public async Task<IEnumerable<FieldBookingScheduleDto>> GenerateFieldBookingSchedulesAsync(FieldBookingScheduleGenerateDto generateDto)
        {
            var generatedSchedules = new List<FieldBookingSchedule>();

            // Chuyển đổi DateOnly sang DateTime để lặp
            DateTime currentDay = generateDto.StartDate.ToDateTime(TimeOnly.MinValue);
            DateTime endDate = generateDto.EndDate.ToDateTime(TimeOnly.MaxValue);

            while (currentDay <= endDate)
            {
                DateTime slotStartTime = currentDay.Date.Add(generateDto.DailyStartTime);
                while (slotStartTime.TimeOfDay < generateDto.DailyEndTime)
                {
                    DateTime slotEndTime = slotStartTime.Add(generateDto.SlotDuration);
                    if (slotEndTime.TimeOfDay > generateDto.DailyEndTime && slotEndTime.Date == slotStartTime.Date)
                    {
                        // Đảm bảo slot không vượt quá thời gian kết thúc hàng ngày vào cùng một ngày
                        slotEndTime = currentDay.Date.Add(generateDto.DailyEndTime);
                    }

                    generatedSchedules.Add(new FieldBookingSchedule
                    {
                        FieldId = generateDto.FieldId,
                        Date = DateOnly.FromDateTime(currentDay),
                        //StartTime = slotStartTime,
                        //EndTime = slotEndTime,
                        Status = "Available", // Trạng thái mặc định cho các slot được tạo tự động
                        Notes = "Slot được tạo tự động"
                    });

                    slotStartTime = slotEndTime; // Chuyển sang slot tiếp theo
                }
                currentDay = currentDay.AddDays(1); // Chuyển sang ngày tiếp theo
            }

            await _scheduleRepository.AddRangeSchedulesAsync(generatedSchedules);
            return _mapper.Map<IEnumerable<FieldBookingScheduleDto>>(generatedSchedules);
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

        public async Task<bool> DeleteFieldBookingScheduleAsync(int id)
        {
            var schedule = await _scheduleRepository.GetScheduleByIdAsync(id);
            if (schedule == null)
            {
                return false;
            }

            await _scheduleRepository.DeleteScheduleAsync(id);
            return true;
        }

        public async Task<ServiceResponse<FieldBookingScheduleByDateDto>> GetSchedulesByFacilityAndDateAsync(int facilityId, DateOnly date)
        {
            var response = new ServiceResponse<FieldBookingScheduleByDateDto>();

            try
            {
                var result = await _scheduleRepository.GetSchedulesByFacilityAndDateAsync(facilityId, date);
                
                response.Data = result;
                response.Success = true;
                response.Message = $"Lấy lịch đặt sân thành công cho facility {result.FacilityName} ngày {date:dd/MM/yyyy}";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = ex.Message;
            }

            return response;
        }


        }
    }
