using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services.Interfaces;

namespace SportZone_API.Services
{
    public class DiscountService : IDiscountService
    {
        private readonly IDiscountRepository _repository;
        private readonly IMapper _mapper;

        public DiscountService(IDiscountRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<Discount>> GetAllDiscounts()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<Discount?> GetDiscountById(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<List<Discount>> GetDiscountsByFacilityId(int facId)
        {
            return await _repository.GetByFacilityIdAsync(facId);
        }

        public async Task<List<Discount>> GetActiveDiscounts()
        {
            return await _repository.GetActiveDiscountsAsync();
        }

        public async Task<List<Discount>> GetActiveDiscountsByFacility(int facId)
        {
            return await _repository.GetActiveDiscountsByFacilityAsync(facId);
        }

        public async Task<ServiceResponse<Discount>> CreateDiscount(DiscountDto dto)
        {
            var discount = _mapper.Map<Discount>(dto);
            await _repository.AddAsync(discount);
            await _repository.SaveChangesAsync();

            return new ServiceResponse<Discount>
            {
                Success = true,
                Message = "Tạo giảm giá thành công.",
                Data = discount
            };
        }

        public async Task<ServiceResponse<Discount>> UpdateDiscount(int id, DiscountDto dto)
        {
            var discount = await _repository.GetByIdAsync(id);
            if (discount == null)
                return new ServiceResponse<Discount> { Success = false, Message = "Không tìm thấy giảm giá." };

            _mapper.Map(dto, discount);
            await _repository.UpdateAsync(discount);
            await _repository.SaveChangesAsync();

            return new ServiceResponse<Discount>
            {
                Success = true,
                Message = "Cập nhật giảm giá thành công.",
                Data = discount
            };
        }

        public async Task<ServiceResponse<Discount>> DeleteDiscount(int id)
        {
            var discount = await _repository.GetByIdAsync(id);
            if (discount == null)
                return new ServiceResponse<Discount> { Success = false, Message = "Không tìm thấy giảm giá." };

            await _repository.DeleteAsync(discount);
            await _repository.SaveChangesAsync();

            return new ServiceResponse<Discount>
            {
                Success = true,
                Message = "Xóa giảm giá thành công.",
                Data = discount
            };
        }

        public async Task<List<Discount>> SearchDiscounts(string text)
        {
            return await _repository.SearchAsync(text);
        }

        public async Task<decimal> CalculateDiscountedPriceAsync(decimal originalPrice, int? discountId, int facId)
        {
            try
            {
                if (!discountId.HasValue)
                    return originalPrice;

                // Validate discount
                var isValidDiscount = await _repository.ValidateDiscountAsync(discountId.Value, facId);
                if (!isValidDiscount)
                {
                    throw new ArgumentException($"Discount ID {discountId} không hợp lệ hoặc không áp dụng được cho Facility {facId}");
                }

                // Lấy thông tin discount
                var discount = await _repository.GetDiscountByIdAsync(discountId.Value);
                if (discount == null)
                {
                    throw new ArgumentException($"Không tìm thấy Discount với ID {discountId}");
                }

                // Tính giá sau discount
                var discountAmount = originalPrice * (discount.DiscountPercentage ?? 0) / 100;
                var discountedPrice = originalPrice - discountAmount;

                return discountedPrice;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tính giá sau discount: {ex.Message}", ex);
            }
        }

        public async Task<bool> DecreaseDiscountQuantityAsync(int discountId)
        {
            try
            {
                return await _repository.DecreaseDiscountQuantityAsync(discountId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi giảm quantity discount: {ex.Message}", ex);
            }
        }
    }
}