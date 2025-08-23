using SportZone_API.Services.Interfaces;
using SportZone_API.Repository.Interfaces;
using SportZone_API.Models;
using SportZone_API.DTOs;

namespace SportZone_API.Services
{
    public class EmailService : IEmailService
    {
        private readonly IEmailRepository _emailRepository;

        public EmailService(IEmailRepository emailRepository)
        {
            _emailRepository = emailRepository;
        }

        public async Task<bool> SendBookingConfirmationEmailAsync(Booking booking, Field field, string userEmail, string userName, string userPhone)
        {
            try
            {
                var subject = "Xác nhận đặt sân thành công - SportZone";
                var body = GenerateBookingConfirmationEmailBody(booking, field, userName, userPhone);

                return await _emailRepository.SendEmailAsync(userEmail, subject, body);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi gửi email xác nhận đặt sân: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> SendBookingConfirmationEmailAsync(BookingDetailDTO bookingEntity, Field fieldWithDetails, string userEmail, string userName, string userPhone)
        {
            try
            {
                var subject = "Xác nhận đặt sân thành công - SportZone";
                var body = GenerateBookingConfirmationEmailBodyFromDTO(bookingEntity, fieldWithDetails, userName, userPhone);

                return await _emailRepository.SendEmailAsync(userEmail, subject, body);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi gửi email xác nhận đặt sân: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> SendEmailAsync(string toEmail, string subject, string body)
        {
            return await _emailRepository.SendEmailAsync(toEmail, subject, body);
        }

        private string GenerateBookingConfirmationEmailBody(Booking booking, Field field, string userName, string userPhone)
        {
            var facilityName = field?.Fac?.Name ?? "Không xác định";
            var fieldName = field?.FieldName ?? "Không xác định";
            var date = booking.Date?.ToString("dd/MM/yyyy") ?? "Không xác định";
            var startTime = booking.StartTime?.ToString("HH:mm") ?? "Không xác định";
            var endTime = booking.EndTime?.ToString("HH:mm") ?? "Không xác định";
            var title = booking.Title ?? "Đặt sân";
            var notes = "Không có ghi chú"; // Booking model không có Notes

            return GenerateEmailBody(facilityName, fieldName, date, startTime, endTime, title, notes, userName, userPhone);
        }

        private string GenerateBookingConfirmationEmailBodyFromDTO(BookingDetailDTO bookingEntity, Field fieldWithDetails, string userName, string userPhone)
        {
            var facilityName = fieldWithDetails?.Fac?.Name ?? "Không xác định";
            var fieldName = fieldWithDetails?.FieldName ?? "Không xác định";
            var date = bookingEntity.Date?.ToString("dd/MM/yyyy") ?? "Không xác định";
            var startTime = bookingEntity.StartTime?.ToString("HH:mm") ?? "Không xác định";
            var endTime = bookingEntity.EndTime?.ToString("HH:mm") ?? "Không xác định";
            var title = bookingEntity.Title ?? "Đặt sân";
            var notes = !string.IsNullOrEmpty(bookingEntity.Notes) ? bookingEntity.Notes : "Không có ghi chú";

            return GenerateEmailBody(facilityName, fieldName, date, startTime, endTime, title, notes, userName, userPhone);
        }

        private string GenerateEmailBody(string facilityName, string fieldName, string date, string startTime, string endTime, string title, string notes, string userName, string userPhone)
        {
            return $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='utf-8'>
                    <title>Xác nhận đặt sân</title>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                        .content {{ background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }}
                        .info-row {{ margin: 10px 0; }}
                        .label {{ font-weight: bold; color: #555; }}
                        .value {{ color: #333; }}
                        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>🎾 Xác nhận đặt sân thành công!</h1>
                        </div>
                        <div class='content'>
                            <p>Xin chào <strong>{userName}</strong>,</p>
                            <p>Cảm ơn bạn đã sử dụng dịch vụ đặt sân của SportZone. Đặt sân của bạn đã được xác nhận thành công!</p>
                            
                            <h3>📋 Thông tin đặt sân:</h3>
                            <div class='info-row'>
                                <span class='label'>Tiêu đề:</span>
                                <span class='value'>{title}</span>
                            </div>
                            <div class='info-row'>
                                <span class='label'>Cơ sở:</span>
                                <span class='value'>{facilityName}</span>
                            </div>
                            <div class='info-row'>
                                <span class='label'>Sân:</span>
                                <span class='value'>{fieldName}</span>
                            </div>
                            <div class='info-row'>
                                <span class='label'>Ngày chơi:</span>
                                <span class='value'>{date}</span>
                            </div>
                            <div class='info-row'>
                                <span class='label'>Thời gian:</span>
                                <span class='value'>{startTime} - {endTime}</span>
                            </div>
                            <div class='info-row'>
                                <span class='label'>Ghi chú:</span>
                                <span class='value'>{notes}</span>
                            </div>
                            
                            <h3>👤 Thông tin người đặt:</h3>
                            <div class='info-row'>
                                <span class='label'>Tên:</span>
                                <span class='value'>{userName}</span>
                            </div>
                            <div class='info-row'>
                                <span class='label'>Số điện thoại:</span>
                                <span class='value'>{userPhone}</span>
                            </div>
                            
                            <p style='margin-top: 20px;'><strong>Lưu ý:</strong></p>
                            <ul>
                                <li>Vui lòng đến sân đúng giờ đã đặt</li>
                                <li>Mang theo giấy tờ tùy thân để xác minh</li>
                                <li>Liên hệ với chúng tôi nếu có thay đổi hoặc câu hỏi</li>
                            </ul>
                            
                            <p>Chúc bạn có những giờ chơi thể thao thú vị!</p>
                        </div>
                        <div class='footer'>
                            <p>SportZone - Nơi thể thao kết nối cộng đồng</p>
                            <p>Email: sportzoneg83@gmail.com | Hotline: 1900-xxxx</p>
                        </div>
                    </div>
                </body>
                </html>";
        }
    }
}

