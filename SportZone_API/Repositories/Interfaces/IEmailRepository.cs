using SportZone_API.Models;

namespace SportZone_API.Repository.Interfaces
{
    public interface IEmailRepository
    {
        Task<bool> SendEmailAsync(string toEmail, string subject, string body);
        Task<string> GetUserEmailAsync(int? userId);
        Task<string> GetUserNameAsync(int? userId);
        Task<string> GetUserPhoneAsync(int? userId);
    }
}
