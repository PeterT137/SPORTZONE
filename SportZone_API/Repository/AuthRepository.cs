using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using SportZone_API.Repository.Interfaces;

namespace SportZone_API.Repository
{
    public class AuthRepository : IAuthRepository
    {
        private readonly SportZoneContext _context;

        public AuthRepository(SportZoneContext context)
        {
            _context = context;
        }



        public async Task<User?> GetUserByEmailAsync(string email, bool isExternalLogin = false)
        {
            try
            {
                return await _context.Users
                    .FirstOrDefaultAsync(u => u.UEmail == email && u.IsExternalLogin == isExternalLogin);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tìm user theo email: {ex.Message}", ex);
            }
        }

        public async Task<User?> GetUserByIdAsync(int userId)
        {
            try
            {
                return await _context.Users
                    .FirstOrDefaultAsync(u => u.UId == userId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tìm user theo ID: {ex.Message}", ex);
            }
        }

        public async Task<User> CreateUserAsync(User user)
        {
            try
            {
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                return user;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tạo user mới: {ex.Message}", ex);
            }
        }

        public async Task<bool> UpdateUserAsync(User user)
        {
            try
            {
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi cập nhật user: {ex.Message}", ex);
            }
        }

        public async Task<ExternalLogin?> GetExternalLoginAsync(int userId, string provider)
        {
            try
            {
                return await _context.ExternalLogins
                    .FirstOrDefaultAsync(el => el.UId == userId && el.ExternalProvider == provider);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tìm external login: {ex.Message}", ex);
            }
        }

        public async Task<ExternalLogin> CreateExternalLoginAsync(ExternalLogin externalLogin)
        {
            try
            {
                _context.ExternalLogins.Add(externalLogin);
                await _context.SaveChangesAsync();
                return externalLogin;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tạo external login: {ex.Message}", ex);
            }
        }

        public async Task<bool> UpdateExternalLoginAsync(ExternalLogin externalLogin)
        {
            try
            {
                _context.ExternalLogins.Update(externalLogin);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi cập nhật external login: {ex.Message}", ex);
            }
        }
    }
}