using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Services.Interfaces
{
    public interface IEmailService
    {
        Task<bool> SendBookingConfirmationEmailAsync(Booking booking, Field field, string userEmail, string userName, string userPhone);
        Task<bool> SendBookingConfirmationEmailAsync(BookingDetailDTO bookingEntity, Field fieldWithDetails, string userEmail, string userName, string userPhone);
        Task<bool> SendEmailAsync(string toEmail, string subject, string body);
    }
}
