using SportZone_API.Models;
using SportZone_API.Services.Interfaces;
using SportZone_API.Repository.Interfaces;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using SportZone_API.DTO;

namespace SportZone_API.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository authRepository;
        public AuthService(IAuthRepository authRepository)
        {
            this.authRepository = authRepository;
        }
        public async Task<(string token, User user)> Login(LoginDTO user)
        {
            try
            {
                return await authRepository.Login(user);
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while processing the login request.", ex);
            }
        }

        public async Task<(string token, User user)> GoogleLogin(GoogleLoginDTO googleLoginDto)
        {
            try
            {
                return await authRepository.GoogleLogin(googleLoginDto);
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while processing the Google login request.", ex);
            }
        }
    }
}