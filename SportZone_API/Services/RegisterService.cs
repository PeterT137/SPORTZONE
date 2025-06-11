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

        public RegisterService(SportZoneContext context, IPasswordHasher<User> passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        public async Task<(bool Success, string Message)> RegisterAsync(RegisterDto dto)
        {
            if (dto.RoleId != 2 && dto.RoleId != 3)
                return (false, "Invalid role.");
           
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password) || string.IsNullOrWhiteSpace(dto.ConfirmPassword))
                return (false, "All fields are required.");
            
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.UEmail == dto.Email);
            if (existingUser != null)
                return (false, "Email already exists.");
            
            if (!Regex.IsMatch(dto.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                return (false, "Email is not in correct format.");
            
            if (!IsValidPassword(dto.Password))
                return (false, "Password must be at least 8 characters, including uppercase, lowercase, numbers and special characters.");
            
            if (dto.Password != dto.ConfirmPassword)
                return (false, "Passwords do not match.");
            
            var user = new User
            {
                UEmail = dto.Email,
                RoleId = dto.RoleId,
                UCreateDate = DateTime.Now,
            };
            user.UPassword = _passwordHasher.HashPassword(user, dto.Password);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            if (dto.RoleId == 2)
            {
                var customer = new Customer
                {
                    UId = user.UId,
                    Name = dto.Name,
                    Phone = dto.Phone
                };
                _context.Customers.Add(customer);
            }
            else if (dto.RoleId == 3)
            {
                var fieldOwner = new FieldOwner
                {
                    UId = user.UId,
                    Name = dto.Name,
                    Phone = dto.Phone
                };
                _context.FieldOwners.Add(fieldOwner);
            }
            await _context.SaveChangesAsync();
            return (true, "Registration successful.");
        }

        public static bool IsValidPassword(string password)
        {
            if (password.Length < 8) return false;
            if (!Regex.IsMatch(password, @"[A-Z]")) return false;
            if (!Regex.IsMatch(password, @"[a-z]")) return false;
            if (!Regex.IsMatch(password, @"[0-9]")) return false;
            if (!Regex.IsMatch(password, @"[!@#$%^&*()_+\-=\[\]{}:;""'<>,.?/]")) return false;
            return true;
        }
    }
}
