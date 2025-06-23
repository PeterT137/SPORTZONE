//using AutoMapper;
//using Microsoft.AspNetCore.Identity;
//using Microsoft.EntityFrameworkCore;
//using SportZone_API.DTOs;
//using SportZone_API.Models;
//using System.Security.Cryptography;
//using System.Text;
//using System.Text.RegularExpressions;

//namespace SportZone_API.Services
//{
//    public class RegisterService
//    {
//        private readonly SportZoneContext _context;
//        private readonly IPasswordHasher<User> _passwordHasher;
//        private readonly IMapper _mapper;

//        public RegisterService(SportZoneContext context, IPasswordHasher<User> passwordHasher, IMapper mapper)
//        {
//            _context = context;
//            _passwordHasher = passwordHasher;
//            _mapper = mapper;
//        }

//        public async Task<ServiceResponse<string>> RegisterAsync(RegisterDto dto)
//        {
//            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password) || string.IsNullOrWhiteSpace(dto.ConfirmPassword))
//                return new ServiceResponse<string> { Success = false, Message = "Vui lòng nhập đầy đủ thông tin." };

//            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.UEmail == dto.Email);
//            if (existingUser != null)
//                return new ServiceResponse<string> { Success = false, Message = "Email đã tồn tại." };

//            if (!Regex.IsMatch(dto.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
//                return new ServiceResponse<string> { Success = false, Message = "Email không đúng định dạng." };

//            if (!IsValidPassword(dto.Password))
//                return new ServiceResponse<string> { Success = false, Message = "Mật khẩu phải ít nhất 10 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt." };

//            if (dto.Password != dto.ConfirmPassword)
//                return new ServiceResponse<string> { Success = false, Message = "Xác nhận mật khẩu không khớp." };

//            var user = _mapper.Map<User>(dto);
//            user.RoleId = dto.RoleId;
//            user.UPassword = _passwordHasher.HashPassword(user, dto.Password);

//            _context.Users.Add(user);
//            await _context.SaveChangesAsync();

//            var customer = _mapper.Map<Customer>(dto);
//            customer.UId = user.UId;
//            _context.Customers.Add(customer);
//            await _context.SaveChangesAsync();

//            return new ServiceResponse<string>{Success = true, Message = "Đăng ký tài khoản thành công."};
//        }

//        public static bool IsValidPassword(string password)
//        {
//            if (password.Length < 10) return false;
//            if (!Regex.IsMatch(password, @"[A-Z]")) return false;
//            if (!Regex.IsMatch(password, @"[a-z]")) return false;
//            if (!Regex.IsMatch(password, @"[0-9]")) return false;
//            if (!Regex.IsMatch(password, @"[!@#$%^&*()_+\-=\[\]{}:;""'<>,.?/]")) return false;
//            return true;
//        }
//    }
//}
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
                return Fail("Email không đúng định dạng.");

            if (!IsValidPassword(dto.Password))
                return Fail("Mật khẩu phải ít nhất 10 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.");

            if (dto.Password != dto.ConfirmPassword)
                return Fail("Xác nhận mật khẩu không khớp.");

            var existing = await _repository.GetUserByEmailAsync(dto.Email);
            if (existing != null)
                return Fail("Email đã tồn tại.");

            var user = _mapper.Map<User>(dto);
            user.RoleId = dto.RoleId;
            user.UPassword = _passwordHasher.HashPassword(user, dto.Password);

            var customer = _mapper.Map<Customer>(dto);

            await _repository.RegisterUserWithCustomerAsync(user, customer);

            return new ServiceResponse<string> { Success = true, Message = "Đăng ký tài khoản thành công." };
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