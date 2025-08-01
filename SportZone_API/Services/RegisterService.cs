// SportZone_API/Services/RegisterService.cs
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services.Interfaces;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting; // Cần thêm using này
using SportZone_API.Helpers; // Cần thêm using này
using System.IO;

namespace SportZone_API.Services
{
    public class RegisterService : IRegisterService
    {
        private readonly IRegisterRepository _repository;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IMapper _mapper;
        private readonly IFacilityRepository _facilityRepository;
        private readonly SportZoneContext _context;
        private readonly IWebHostEnvironment _env; // Thêm IWebHostEnvironment

        public RegisterService(
            IRegisterRepository repository,
            IPasswordHasher<User> passwordHasher,
            IMapper mapper,
            IFacilityRepository facilityRepository,
            SportZoneContext context,
            IWebHostEnvironment env) // Cập nhật constructor
        {
            _repository = repository;
            _passwordHasher = passwordHasher;
            _mapper = mapper;
            _facilityRepository = facilityRepository;
            _context = context;
            _env = env; // Gán giá trị
        }

        public async Task<ServiceResponse<string>> RegisterUserAsync(RegisterDto dto)
        {
            if (!IsValidPassword(dto.Password))
            {
                return Fail("Mật khẩu phải dài ít nhất 10 ký tự và bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.");
            }

            var existing = await _repository.GetUserByEmailAsync(dto.Email);
            if (existing != null)
            {
                return Fail("Email đã tồn tại.");
            }

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == dto.RoleName);

            if (role == null)
            {
                return Fail($"Tên vai trò '{dto.RoleName}' không hợp lệ. Vui lòng chọn 'Customer', 'Field Owner' hoặc 'Staff'.");
            }

            if (dto.RoleName == "Customer")
            {
                if (dto.FacId.HasValue || dto.Dob.HasValue || dto.ImageFile != null || dto.StartTime.HasValue || dto.EndTime.HasValue)
                {
                    return Fail("Vai trò 'Customer' không được phép nhập các thông tin của nhân viên.");
                }

                var user = _mapper.Map<User>(dto);
                user.RoleId = role.RoleId;
                user.UPassword = _passwordHasher.HashPassword(user, dto.Password);

                var customer = _mapper.Map<Customer>(dto);
                await _repository.RegisterUserWithCustomerAsync(user, customer);

                return new ServiceResponse<string> { Success = true, Message = "Đăng ký tài khoản khách hàng thành công." };
            }
            else if (dto.RoleName == "Field_Owner")
            {
                if (dto.FacId.HasValue || dto.Dob.HasValue || dto.ImageFile != null || dto.StartTime.HasValue || dto.EndTime.HasValue)
                {
                    return Fail("Vai trò 'Field Owner' không được phép nhập các thông tin của nhân viên.");
                }

                var user = _mapper.Map<User>(dto);
                user.RoleId = role.RoleId;
                user.UStatus = "Active";
                user.UPassword = _passwordHasher.HashPassword(user, dto.Password);

                var fieldOwner = _mapper.Map<FieldOwner>(dto);
                await _repository.RegisterUserWithFieldOwnerAsync(user, fieldOwner);

                return new ServiceResponse<string> { Success = true, Message = "Đăng ký tài khoản chủ sân thành công." };
            }
            else if (dto.RoleName == "Staff")
            {
                if (!dto.FacId.HasValue || dto.FacId.Value <= 0)
                {
                    return Fail("Vui lòng cung cấp FacId hợp lệ cho nhân viên.");
                }

                if (!dto.Dob.HasValue)
                {
                    return Fail("Ngày sinh không được để trống cho nhân viên.");
                }

                if (!dto.StartTime.HasValue)
                {
                    return Fail("Thời gian bắt đầu làm việc không được để trống cho nhân viên.");
                }

                if (dto.StartTime.HasValue && dto.EndTime.HasValue && dto.StartTime.Value > dto.EndTime.Value)
                {
                    return Fail("Thời gian bắt đầu không thể sau thời gian kết thúc.");
                }

                var facility = await _facilityRepository.GetByIdAsync(dto.FacId.Value);
                if (facility == null)
                {
                    return Fail($"Không tìm thấy cơ sở với FacId '{dto.FacId.Value}'. Vui lòng cung cấp FacId hợp lệ.");
                }

                string? imageUrl = null;
                // Xử lý upload file ảnh nếu có
                if (dto.ImageFile != null)
                {
                    const string subFolderName = "StaffImages";
                    var (isValid, errorMessage) = ImageUpload.ValidateImage(dto.ImageFile);
                    if (!isValid)
                    {
                        return Fail(errorMessage);
                    }
                    imageUrl = await ImageUpload.SaveImageAsync(dto.ImageFile, _env.WebRootPath, subFolderName);
                    if (imageUrl == null)
                    {
                        return Fail("Lỗi khi lưu file ảnh.");
                    }
                }

                try
                {
                    var user = _mapper.Map<User>(dto);
                    user.RoleId = role.RoleId;
                    user.UPassword = _passwordHasher.HashPassword(user, dto.Password);
                    user.UStatus = "Active";

                    var staff = _mapper.Map<Staff>(dto);
                    staff.Image = imageUrl; // Gán URL ảnh đã lưu vào model

                    await _repository.RegisterUserWithStaffAsync(user, staff);

                    return new ServiceResponse<string> { Success = true, Message = "Đăng ký tài khoản nhân viên thành công." };
                }
                catch (Exception ex)
                {
                    // Nếu có lỗi DB, xóa file ảnh vừa upload để tránh file rác
                    if (!string.IsNullOrEmpty(imageUrl))
                    {
                        ImageUpload.DeleteImage(imageUrl, _env.WebRootPath);
                    }
                    return Fail($"Đã xảy ra lỗi khi đăng ký: {ex.Message}");
                }
            }
            else
            {
                return Fail("Tên vai trò không hợp lệ.");
            }
        }

        private static ServiceResponse<string> Fail(string msg) => new() { Success = false, Message = msg };

        public static bool IsValidPassword(string password)
        {
            if (password.Length < 10) return false;
            if (!Regex.IsMatch(password, @"[A-Z]")) return false;
            if (!Regex.IsMatch(password, @"[a-z]")) return false;
            if (!Regex.IsMatch(password, @"[0-9]")) return false;
            if (!Regex.IsMatch(password, @"[!@#$%^&*()_+\-=\[\]{}:;""'<>,.?/]")) return false;
            return true;
        }
    }
}