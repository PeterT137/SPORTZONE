using AutoMapper;
using Microsoft.AspNetCore.Identity;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services.Interfaces;
using System.Text.RegularExpressions;

namespace SportZone_API.Services
{
    public class RegisterService : IRegisterService
    {
        private readonly IRegisterRepository _repository;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IMapper _mapper;

        public RegisterService(IRegisterRepository repository, IPasswordHasher<User> passwordHasher, IMapper mapper)
        {
            _repository = repository;
            _passwordHasher = passwordHasher;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<string>> RegisterAsync(RegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password) || string.IsNullOrWhiteSpace(dto.ConfirmPassword))
                return Fail("Vui lòng nhập đầy đủ thông tin.");

            if (!Regex.IsMatch(dto.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                return Fail("Định dạng email không hợp lệ.");

            if (!IsValidPassword(dto.Password))
                return Fail("Mật khẩu phải dài ít nhất 10 ký tự và bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.");

            if (dto.Password != dto.ConfirmPassword)
                return Fail("Mật khẩu không khớp.");

            var existing = await _repository.GetUserByEmailAsync(dto.Email);
            if (existing != null)
                return Fail("Email đã tồn tại.");

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