using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services.Interfaces;

namespace SportZone_API.Services
{
    public class StaffService : IStaffService
    {
        private readonly IStaffRepository _staffRepository;

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