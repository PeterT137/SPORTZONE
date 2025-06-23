//using Microsoft.AspNetCore.Identity;
//using Microsoft.EntityFrameworkCore;
//using SportZone_API.Models;
//using SportZone_API.DTOs;
//using System.Net;
//using System.Net.Mail;
//using Microsoft.Extensions.Caching.Memory;
//using Microsoft.Extensions.Options;

//namespace SportZone_API.Services
//{
//    public class ForgotPasswordService
//    {
//        private readonly SportZoneContext _context;
//        private readonly IPasswordHasher<User> _passwordHasher;
//        private readonly SendEmail _emailSettings;
//        private readonly IMemoryCache _cache;

//        public ForgotPasswordService(
//            SportZoneContext context,
//            IPasswordHasher<User> passwordHasher,
//            IOptions<SendEmail> emailOptions,
//            IMemoryCache cache)
//        {
//            _context = context;
//            _passwordHasher = passwordHasher;
//            _emailSettings = emailOptions.Value;
//            _cache = cache;
//        }

//        public async Task<ServiceResponse<string>> SendCodeAsync(ForgotPasswordDto dto)
//        {
//            var user = await _context.Users.FirstOrDefaultAsync(u => u.UEmail == dto.Email);
//            if (user == null)
//                return new ServiceResponse<string>{Success = false, Message = "Email does not exist."};

//            var code = new Random().Next(100000, 999999).ToString();
//            var cacheKey = $"ResetCode:{code}";
//            _cache.Set(cacheKey, dto.Email, TimeSpan.FromMinutes(10));

//            var mail = new MailMessage
//            {
//                From = new MailAddress(_emailSettings.Email, _emailSettings.DisplayName),
//                Subject = "Forgot password confirmation code",
//                Body = $"Your confirmation code is: {code}"
//            };
//            mail.To.Add(dto.Email);

//            using (var smtp = new SmtpClient(_emailSettings.Host, _emailSettings.Port))
//            {
//                smtp.Credentials = new NetworkCredential(_emailSettings.Email, _emailSettings.Password);
//                smtp.EnableSsl = true;
//                await smtp.SendMailAsync(mail);
//            }

//            return new ServiceResponse<string>{Success = true, Message = "Confirmation code sent to email."};
//        }

//        public async Task<ServiceResponse<string>> ResetPasswordAsync(VerifyCodeDto dto)
//        {
//            var cacheKey = $"ResetCode:{dto.Code}";

//            if (!_cache.TryGetValue(cacheKey, out string email))
//                return new ServiceResponse<string>{Success = false, Message = "Confirmation code not found or expired."};

//            if (!RegisterService.IsValidPassword(dto.NewPassword))
//                return new ServiceResponse<string>{Success = false, Message = "Password must be at least 10 characters, including uppercase, lowercase, numbers and special characters."};

//            if (dto.NewPassword != dto.ConfirmPassword)
//                return new ServiceResponse<string>{Success = false, Message = "Confirmation password does not match."};

//            var user = await _context.Users.FirstOrDefaultAsync(u => u.UEmail == email);
//            if (user == null)
//                return new ServiceResponse<string>{Success = false, Message = "User not found."};

//            user.UPassword = _passwordHasher.HashPassword(user, dto.NewPassword);
//            await _context.SaveChangesAsync();
//            _cache.Remove(cacheKey);

//            return new ServiceResponse<string>{Success = true, Message = "Password changed successfully.",};
//        }
//    }
//}
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services.Interfaces;
using System.Net;
using System.Net.Mail;

namespace SportZone_API.Services
{
    public class ForgotPasswordService : IForgotPasswordService
    {
        private readonly IForgotPasswordRepository _repository;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly SendEmail _emailSettings;
        private readonly IMemoryCache _cache;

        public ForgotPasswordService(
            IForgotPasswordRepository repository,
            IPasswordHasher<User> passwordHasher,
            IOptions<SendEmail> emailOptions,
            IMemoryCache cache)
        {
            _repository = repository;
            _passwordHasher = passwordHasher;
            _emailSettings = emailOptions.Value;
            _cache = cache;
        }

        public async Task<ServiceResponse<string>> SendCodeAsync(ForgotPasswordDto dto)
        {
            var user = await _repository.GetUserByEmailAsync(dto.Email);
            if (user == null)
                return Fail("Email does not exist.");

            var code = new Random().Next(100000, 999999).ToString();
            var cacheKey = $"ResetCode:{code}";
            _cache.Set(cacheKey, dto.Email, TimeSpan.FromMinutes(10));

            var mail = new MailMessage
            {
                From = new MailAddress(_emailSettings.Email, _emailSettings.DisplayName),
                Subject = "Forgot password confirmation code",
                Body = $"Your confirmation code is: {code}"
            };
            mail.To.Add(dto.Email);

            using (var smtp = new SmtpClient(_emailSettings.Host, _emailSettings.Port))
            {
                smtp.Credentials = new NetworkCredential(_emailSettings.Email, _emailSettings.Password);
                smtp.EnableSsl = true;
                await smtp.SendMailAsync(mail);
            }

            return new ServiceResponse<string> { Success = true, Message = "Confirmation code sent to email." };
        }

        public async Task<ServiceResponse<string>> ResetPasswordAsync(VerifyCodeDto dto)
        {
            var cacheKey = $"ResetCode:{dto.Code}";

            if (!_cache.TryGetValue(cacheKey, out string email))
                return Fail("Confirmation code not found or expired.");

            if (!RegisterService.IsValidPassword(dto.NewPassword))
                return Fail("Password must be at least 10 characters, including uppercase, lowercase, numbers and special characters.");

            if (dto.NewPassword != dto.ConfirmPassword)
                return Fail("Confirmation password does not match.");

            var user = await _repository.GetUserByEmailAsync(email);
            if (user == null)
                return Fail("User not found.");

            user.UPassword = _passwordHasher.HashPassword(user, dto.NewPassword);
            await _repository.SaveUserAsync();
            _cache.Remove(cacheKey);

            return new ServiceResponse<string> { Success = true, Message = "Password changed successfully." };
        }

        private static ServiceResponse<string> Fail(string msg) => new() { Success = false, Message = msg };
    }
}