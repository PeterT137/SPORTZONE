using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;

namespace SportZone_API.Repositories
{
    public class DiscountRepository : IDiscountRepository
    {
        private readonly SportZoneContext _context;

        public DiscountRepository(SportZoneContext context)
        {
            _context = context;
        }

        public async Task<List<Discount>> GetAllAsync()
        {
            return await _context.Discounts
                .Include(d => d.Fac)
                .ToListAsync();
        }

        public async Task<Discount?> GetByIdAsync(int id)
        {
            return await _context.Discounts
                .Include(d => d.Fac)
                .FirstOrDefaultAsync(d => d.DiscountId == id);
        }

        public async Task<List<Discount>> GetByFacilityIdAsync(int facId)
        {
            return await _context.Discounts
                .Include(d => d.Fac)
                .Where(d => d.FacId == facId)
                .ToListAsync();
        }

        public async Task<List<Discount>> GetActiveDiscountsAsync()
        {
            var today = DateOnly.FromDateTime(DateTime.Now);
            return await _context.Discounts
                .Include(d => d.Fac)
                .Where(d => d.IsActive == true &&
                           d.StartDate <= today &&
                           d.EndDate >= today &&
                           d.Quantity > 0)
                .ToListAsync();
        }

        public async Task<List<Discount>> GetActiveDiscountsByFacilityAsync(int facId)
        {
            var today = DateOnly.FromDateTime(DateTime.Now);
            return await _context.Discounts
                .Include(d => d.Fac)
                .Where(d => d.FacId == facId &&
                           d.IsActive == true &&
                           d.StartDate <= today &&
                           d.EndDate >= today &&
                           d.Quantity > 0)
                .ToListAsync();
        }

        public async Task AddAsync(Discount discount)
        {
            await _context.Discounts.AddAsync(discount);
        }

        public async Task UpdateAsync(Discount discount)
        {
            _context.Discounts.Update(discount);
        }

        public async Task DeleteAsync(Discount discount)
        {
            _context.Discounts.Remove(discount);
        }

        public async Task<List<Discount>> SearchAsync(string text)
        {
            return await _context.Discounts
                .Include(d => d.Fac)
                .Where(d => (d.Description ?? "").Contains(text))
                .ToListAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        

    }
}