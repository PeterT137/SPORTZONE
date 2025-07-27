using AutoMapper;
using Microsoft.AspNetCore.Identity;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services.Interfaces;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System;

namespace SportZone_API.Services
{
    public class RegisterService : IRegisterService
    {
        private readonly IRegisterRepository _repository;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IMapper _mapper;
        private readonly IFacilityRepository _facilityRepository;

        public RegisterService(
            IRegisterRepository repository,
            IPasswordHasher<User> passwordHasher,
            IMapper mapper,
            IFacilityRepository facilityRepository)
        {
            _repository = repository;
            _passwordHasher = passwordHasher;
            _mapper = mapper;
            _facilityRepository = facilityRepository;
        }

        public async Task<ServiceResponse<string>> RegisterAsync(RegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password) || string.IsNullOrWhiteSpace(dto.ConfirmPassword))
                return Fail("Vui lòng nhập đầy đủ thông tin bắt buộc (Email, Mật khẩu, Xác nhận mật khẩu).");

            if (!Regex.IsMatch(dto.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                return Fail("Định dạng email không hợp lệ.");

            if (!IsValidPassword(dto.Password))
                return Fail("Mật khẩu phải dài ít nhất 10 ký tự và bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.");

            if (dto.Password != dto.ConfirmPassword)
                return Fail("Mật khẩu không khớp.");

            var existing = await _repository.GetUserByEmailAsync(dto.Email);
            if (existing != null)
                return Fail("Email đã tồn tại.");

            if (dto.RoleId <= 1 || dto.RoleId > 3) 
            {
                return Fail("RoleId không hợp lệ cho đăng ký chung. Vui lòng cung cấp RoleId đúng (ví dụ: 2 cho Khách hàng, 3 cho Chủ sân).");
            }

            var user = _mapper.Map<User>(dto); 
            user.RoleId = dto.RoleId;
            user.UPassword = _passwordHasher.HashPassword(user, dto.Password);

            if (dto.RoleId == 3) 
            {
                var fieldOwner = _mapper.Map<FieldOwner>(dto);
                await _repository.RegisterUserWithFieldOwnerAsync(user, fieldOwner);
                return new ServiceResponse<string> { Success = true, Message = "Đăng ký tài khoản chủ sân thành công." };
            }
            else 
            {
                var customer = _mapper.Map<Customer>(dto);
                await _repository.RegisterUserWithCustomerAsync(user, customer);
                return new ServiceResponse<string> { Success = true, Message = "Đăng ký tài khoản khách hàng thành công." };
            }
        }

        public async Task<ServiceResponse<string>> RegisterStaffAsync(RegisterStaffDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password) || string.IsNullOrWhiteSpace(dto.ConfirmPassword))
                return Fail("Vui lòng nhập đầy đủ thông tin bắt buộc (Email, Mật khẩu, Xác nhận mật khẩu) cho nhân viên.");

            if (!Regex.IsMatch(dto.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                return Fail("Định dạng email của nhân viên không hợp lệ.");

            if (!IsValidPassword(dto.Password))
                return Fail("Mật khẩu nhân viên phải dài ít nhất 10 ký tự và bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.");

            if (dto.Password != dto.ConfirmPassword)
                return Fail("Mật khẩu nhân viên không khớp.");

            var existing = await _repository.GetUserByEmailAsync(dto.Email);
            if (existing != null)
                return Fail("Email của nhân viên đã tồn tại.");

            if (!dto.FacId.HasValue || dto.FacId.Value <= 0)
            {
                return Fail("Vui lòng cung cấp FacId hợp lệ cho nhân viên.");
            }

            var facility = await _facilityRepository.GetByIdAsync(dto.FacId.Value);
            if (facility == null)
            {
                return Fail($"Không tìm thấy cơ sở với FacId '{dto.FacId.Value}'. Vui lòng cung cấp FacId hợp lệ.");
            }

            var user = _mapper.Map<User>(dto);
            user.RoleId = 4;
            user.UPassword = _passwordHasher.HashPassword(user, dto.Password);
            var staff = _mapper.Map<Staff>(dto); 
            await _repository.RegisterUserWithStaffAsync(user, staff);
            return new ServiceResponse<string> { Success = true, Message = "Đăng ký tài khoản nhân viên thành công." };
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