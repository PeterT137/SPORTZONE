using SportZone_API.DTOs;

namespace SportZone_API.Services.Interfaces
{
    public interface IForgotPasswordService
    {
        Task<ServiceResponse<string>> SendCodeAsync(ForgotPasswordDto dto);
        Task<ServiceResponse<string>> VerifyCodeAsync(VerifyCodeDto dto);
        Task<ServiceResponse<string>> ResetPasswordAsync(ResetPasswordDto dto);
    }
}