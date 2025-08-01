using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;
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
    }
}