using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SportZone_API.Services
{
    public class StaffService : IStaffService
    {
        private readonly IStaffRepository _staffRepository;
        private readonly IFacilityRepository _facilityRepository; 
        private readonly IMapper _mapper;

        public StaffService(
            IStaffRepository staffRepository,
            IFacilityRepository facilityRepository,
            IMapper mapper)
        {
            _staffRepository = staffRepository;
            _facilityRepository = facilityRepository;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<IEnumerable<StaffDto>>> GetAllStaffAsync()
        {
            var staffList = await _staffRepository.GetAllStaffAsync();
            if (staffList == null || !staffList.Any())
            {
                return Fail<IEnumerable<StaffDto>>("Không tìm thấy nhân viên nào.");
            }
            var staffDtos = _mapper.Map<IEnumerable<StaffDto>>(staffList);
            return Success(staffDtos);
        }

        public async Task<ServiceResponse<IEnumerable<StaffDto>>> GetStaffByFacilityIdAsync(int facilityId)
        {
            var facility = await _facilityRepository.GetByIdAsync(facilityId);
            if (facility == null)
            {
                return Fail<IEnumerable<StaffDto>>($"Không tìm thấy cơ sở với ID '{facilityId}'.");
            }

            var staffList = await _staffRepository.GetStaffByFacilityIdAsync(facilityId);
            if (staffList == null || !staffList.Any())
            {
                return Fail<IEnumerable<StaffDto>>($"Không tìm thấy nhân viên nào cho cơ sở ID '{facilityId}'.");
            }
            var staffDtos = _mapper.Map<IEnumerable<StaffDto>>(staffList);
            return Success(staffDtos);
        }

        public async Task<ServiceResponse<StaffDto>> GetStaffByUIdAsync(int uId)
        {
            var staff = await _staffRepository.GetByUIdAsync(uId);
            if (staff == null)
            {
                return Fail<StaffDto>($"Không tìm thấy nhân viên với UId '{uId}'.");
            }
            var staffDto = _mapper.Map<StaffDto>(staff);
            return Success(staffDto);
        }

        public async Task<ServiceResponse<string>> UpdateStaffAsync(int uId, UpdateStaffDto dto)
        {
            var staffToUpdate = await _staffRepository.GetByUIdAsync(uId);
            if (staffToUpdate == null)
            {
                return Fail<string>("Không tìm thấy nhân viên để cập nhật.");
            }

            if (!string.IsNullOrEmpty(dto.Name)) staffToUpdate.Name = dto.Name;
            if (!string.IsNullOrEmpty(dto.Phone)) staffToUpdate.Phone = dto.Phone;
            if (dto.Dob.HasValue) staffToUpdate.Dob = dto.Dob.Value;
            if (!string.IsNullOrEmpty(dto.Image)) staffToUpdate.Image = dto.Image;

            if (dto.FacId.HasValue)
            {
                var facility = await _facilityRepository.GetByIdAsync(dto.FacId.Value);
                if (facility == null)
                {
                    return Fail<string>($"Không tìm thấy cơ sở với FacId '{dto.FacId.Value}'. Vui lòng cung cấp FacId hợp lệ.");
                }
                staffToUpdate.FacId = dto.FacId.Value;
            }
            else if (staffToUpdate.FacId.HasValue)
            {
                staffToUpdate.FacId = null;
            }

            if (dto.StartTime.HasValue) staffToUpdate.StartTime = dto.StartTime.Value;
            else if (staffToUpdate.StartTime.HasValue) { staffToUpdate.StartTime = null; }

            if (dto.EndTime.HasValue) staffToUpdate.EndTime = dto.EndTime.Value;
            else if (staffToUpdate.EndTime.HasValue) { staffToUpdate.EndTime = null; }

            if (staffToUpdate.StartTime.HasValue && staffToUpdate.EndTime.HasValue && staffToUpdate.StartTime.Value > staffToUpdate.EndTime.Value)
            {
                return Fail<string>("Thời gian bắt đầu không thể sau thời gian kết thúc.");
            }

            await _staffRepository.UpdateStaffAsync(staffToUpdate);
            return Success("Cập nhật thông tin nhân viên thành công.");
        }

        public async Task<ServiceResponse<string>> DeleteStaffAsync(int uId)
        {
            var staffToDelete = await _staffRepository.GetByUIdAsync(uId);
            if (staffToDelete == null)
            {
                return Fail<string>("Không tìm thấy nhân viên để xóa.");
            }
            await _staffRepository.DeleteStaffAsync(staffToDelete);
            return Success("Xóa nhân viên thành công.");
        }

        private ServiceResponse<T> Fail<T>(string msg) => new() { Success = false, Message = msg };
        private ServiceResponse<T> Success<T>(T data, string msg = "") => new() { Success = true, Data = data, Message = msg };
        private ServiceResponse<string> Success(string msg) => new() { Success = true, Message = msg };

        public StaffService(IStaffRepository staffRepository)
        {
            _staffRepository = staffRepository;
        }

        public async Task<ServiceResponse<List<Staff>>> GetStaffByFieldOwnerIdAsync(int fieldOwnerId)
        {
            var response = new ServiceResponse<List<Staff>>();

            try
            {
                var staff = await _staffRepository.GetStaffByFieldOwnerIdAsync(fieldOwnerId);
                
                if (staff == null || !staff.Any())
                {
                    response.Success = false;
                    response.Message = "Không tìm thấy staff nào cho field owner này.";
                    return response;
                }

                response.Data = staff;
                response.Message = $"Tìm thấy {staff.Count} staff.";
                response.Success = true;
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