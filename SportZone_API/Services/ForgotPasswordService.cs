using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using SportZone_API.DTOs;
using System.Net;
using System.Net.Mail;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace SportZone_API.Services
{
    public class ForgotPasswordService
    {
        private readonly SportZoneContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly SendEmail _emailSettings;

        public ForgotPasswordService(
            SportZoneContext context,
            IHttpContextAccessor httpContextAccessor,
            IPasswordHasher<User> passwordHasher,
            IOptions<SendEmail> emailOptions)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _passwordHasher = passwordHasher;
            _emailSettings = emailOptions.Value;
        }

        public async Task<(bool Success, string Message)> SendCodeAsync(ForgotPasswordDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UEmail == dto.Email);
            if (user == null)
                return (false, "Email does not exist.");

            var code = new Random().Next(100000, 999999).ToString();
            var expire = DateTime.Now.AddMinutes(10);

            var session = _httpContextAccessor.HttpContext?.Session;
            session?.SetString("ResetEmail", dto.Email);
            session?.SetString("ResetCode", code);
            session?.SetString("ResetExpire", expire.ToString("O"));

            var mail = new MailMessage();
            mail.From = new MailAddress(_emailSettings.Email, _emailSettings.DisplayName);
            mail.To.Add(dto.Email);
            mail.Subject = "Forgot password confirmation code";
            mail.Body = $"Your confirmation code is: {code}";

            using (var smtp = new SmtpClient(_emailSettings.Host, _emailSettings.Port))
            {
                smtp.Credentials = new NetworkCredential(_emailSettings.Email, _emailSettings.Password);
                smtp.EnableSsl = true;
                await smtp.SendMailAsync(mail);
            }
            return (true, "Confirmation code sent to email.");
        }

        public async Task<(bool Success, string Message)> ResetPasswordAsync(VerifyCodeDto dto)
        {
            var session = _httpContextAccessor.HttpContext?.Session;
            var sessionEmail = session?.GetString("ResetEmail");
            var sessionCode = session?.GetString("ResetCode");
            var sessionExpireStr = session?.GetString("ResetExpire");

            if (sessionEmail == null || sessionCode == null || sessionExpireStr == null)
                return (false, "No confirmation code found in session.");

            if (sessionCode != dto.Code)
                return (false, "Incorrect confirmation code.");

            if (!DateTime.TryParse(sessionExpireStr, out var expire) || expire < DateTime.Now)
                return (false, "Verification code has expired.");

            if (!RegisterService.IsValidPassword(dto.NewPassword))
                return (false, "Password must be at least 8 characters, including uppercase, lowercase, numbers and special characters.");

            if (dto.NewPassword != dto.ConfirmPassword)
                return (false, "Confirmation password does not match.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UEmail == sessionEmail);
            user.UPassword = _passwordHasher.HashPassword(user, dto.NewPassword);
            await _context.SaveChangesAsync();

            session.Remove("ResetEmail");
            session.Remove("ResetCode");
            session.Remove("ResetExpire");
            return (true, "Password changed successfully.");
        }
    }
}
