﻿using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Repositories.Interfaces
{
    public interface IAuthRepository
    {
        // Data access methods only
        Task<User?> GetUserByEmailAsync(string email, bool isExternalLogin = false);
        Task<User> CreateUserAsync(User user);
        Task<bool> UpdateUserAsync(User user);
        Task<ExternalLogin?> GetExternalLoginAsync(int userId, string provider);
        Task<ExternalLogin> CreateExternalLoginAsync(ExternalLogin externalLogin);
        Task<bool> UpdateExternalLoginAsync(ExternalLogin externalLogin);
    }
}