using SportZone_API.Repository.Interfaces;
using SportZone_API.Models;
using Microsoft.EntityFrameworkCore;
using System.Net.Mail;
using System.Net;
using Microsoft.Extensions.Configuration;

namespace SportZone_API.Repositories
{
    public class EmailRepository : IEmailRepository
    {
        private readonly SportZoneContext _context;
        private readonly IConfiguration _configuration;

        public EmailRepository(SportZoneContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<bool> SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                var emailSettings = _configuration.GetSection("SendEmail");
                var fromEmail = emailSettings["Email"];
                var displayName = emailSettings["DisplayName"];
                var password = emailSettings["Password"];
                var host = emailSettings["Host"];
                var port = int.Parse(emailSettings["Port"]);

                using (var client = new SmtpClient(host, port))
                {
                    client.UseDefaultCredentials = false;
                    client.Credentials = new NetworkCredential(fromEmail, password);
                    client.EnableSsl = true;

                    var message = new MailMessage
                    {
                        From = new MailAddress(fromEmail, displayName),
                        Subject = subject,
                        Body = body,
                        IsBodyHtml = true
                    };
                    message.To.Add(toEmail);

                    await client.SendMailAsync(message);
                    return true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi gửi email: {ex.Message}");
                return false;
            }
        }

        public async Task<string> GetUserEmailAsync(int? userId)
        {
            if (!userId.HasValue)
                return string.Empty;

            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.UId == userId);

                return user?.UEmail ?? string.Empty;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi lấy email user: {ex.Message}");
                return string.Empty;
            }
        }

        public async Task<string> GetUserNameAsync(int? userId)
        {
            if (!userId.HasValue)
                return string.Empty;

            try
            {
                var user = await _context.Users
                    .Include(u => u.Customer)
                    .Include(u => u.FieldOwner)
                    .Include(u => u.Staff)
                    .FirstOrDefaultAsync(u => u.UId == userId);

                // Tên được lưu trong các model con (Customer, FieldOwner, Staff)
                if (user?.Customer != null)
                    return user.Customer.Name ?? string.Empty;
                else if (user?.FieldOwner != null)
                    return user.FieldOwner.Name ?? string.Empty;
                else if (user?.Staff != null)
                    return user.Staff.Name ?? string.Empty;

                return string.Empty;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi lấy tên user: {ex.Message}");
                return string.Empty;
            }
        }

        public async Task<string> GetUserPhoneAsync(int? userId)
        {
            if (!userId.HasValue)
                return string.Empty;

            try
            {
                var user = await _context.Users
                    .Include(u => u.Customer)
                    .Include(u => u.FieldOwner)
                    .Include(u => u.Staff)
                    .FirstOrDefaultAsync(u => u.UId == userId);

                // Số điện thoại được lưu trong các model con (Customer, FieldOwner, Staff)
                if (user?.Customer != null)
                    return user.Customer.Phone ?? string.Empty;
                else if (user?.FieldOwner != null)
                    return user.FieldOwner.Phone ?? string.Empty;
                else if (user?.Staff != null)
                    return user.Staff.Phone ?? string.Empty;

                return string.Empty;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi lấy số điện thoại user: {ex.Message}");
                return string.Empty;
            }
        }
    }
}
