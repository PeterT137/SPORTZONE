using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SportZone_API.DTOs;
using SportZone_API.Models;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace SportZone_API.Services
{
    public class RegisterService
    {
        private readonly SportZoneContext _context;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IMapper _mapper;

        public RegisterService(SportZoneContext context, IPasswordHasher<User> passwordHasher, IMapper mapper)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<string>> RegisterAsync(RegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password) || string.IsNullOrWhiteSpace(dto.ConfirmPassword))
                return new ServiceResponse<string> { Success = false, Message = "Vui lòng nhập đầy đủ thông tin." };

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.UEmail == dto.Email);
            if (existingUser != null)
                return new ServiceResponse<string> { Success = false, Message = "Email đã tồn tại." };

            if (!Regex.IsMatch(dto.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                return new ServiceResponse<string> { Success = false, Message = "Email không đúng định dạng." };

            if (!IsValidPassword(dto.Password))
                return new ServiceResponse<string> { Success = false, Message = "Mật khẩu phải ít nhất 10 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt." };

            if (dto.Password != dto.ConfirmPassword)
                return new ServiceResponse<string> { Success = false, Message = "Xác nhận mật khẩu không khớp." };

            var user = _mapper.Map<User>(dto);
            user.RoleId = dto.RoleId;
            user.UPassword = _passwordHasher.HashPassword(user, dto.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var customer = _mapper.Map<Customer>(dto);
            customer.UId = user.UId;
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return new ServiceResponse<string>{Success = true, Message = "Đăng ký tài khoản thành công."};
        }

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
