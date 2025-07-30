using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using SportZone_API.DTOs;
using AutoMapper;
using SportZone_API.Repositories.Interfaces;

namespace SportZone_API.Repositories
{
    public class FieldRepository : IFieldRepository
    {
        private readonly SportZoneContext _context;
        private readonly IMapper _mapper;
        public FieldRepository(SportZoneContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        public async Task<IEnumerable<FieldResponseDTO>> GetAllFieldsAsync()
        {
            var fields = await _context.Fields
                .Include(f => f.Fac)
                .Include(f => f.Category)
                .ToListAsync();
            return _mapper.Map<IEnumerable<FieldResponseDTO>>(fields);
        }

        public async Task<FieldResponseDTO?> GetFieldByIdAsync(int fieldId)
        {
            try
            {
                var field = await _context.Fields
                    .Include(f => f.Fac)
                    .Include(f => f.Category)
                    .FirstOrDefaultAsync(f => f.FieldId == fieldId);
                return field != null ? _mapper.Map<FieldResponseDTO>(field) : null;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy sân với ID {fieldId}: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<FieldResponseDTO>> GetFieldsByFacilityAsync(int facId)
        {
            try
            {
                var fields = await _context.Fields
                    .Include(f => f.Fac)
                    .Include(f => f.Category)
                    .Where(f => f.FacId == facId)
                    .ToListAsync();
                return _mapper.Map<IEnumerable<FieldResponseDTO>>(fields);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy danh sách sân theo cơ sở với ID {facId}: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<FieldResponseDTO>> GetFieldsByCategoryAsync(int categoryId)
        {
            try
            {
                var fields = await _context.Fields
                    .Include(f => f.Fac)
                    .Include(f => f.Category)
                    .Where(f => f.CategoryId == categoryId)
                    .ToListAsync();
                return _mapper.Map<IEnumerable<FieldResponseDTO>>(fields);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy danh sách sân theo loại với ID {categoryId}: {ex.Message}", ex);
            }
        }

        public async Task<Field> CreateFieldAsync(FieldCreateDTO fieldDto)
        {
            try
            {
                if (!await FacilityExistsAsync(fieldDto.FacId))
                {
                    throw new ArgumentException($"Cơ sở với ID {fieldDto.FacId} không tồn tại.");
                }
                if (!await CategoryExistAsync(fieldDto.CategoryId))
                {
                    throw new ArgumentException($"Loại sân với ID {fieldDto.CategoryId} không tồn tại.");
                }
                var field = _mapper.Map<Field>(fieldDto);
                field.IsBookingEnable = false;
                _context.Fields.Add(field);
                await _context.SaveChangesAsync();
                return field;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tạo sân: {ex.Message}", ex);
            }
        }

        public async Task<bool> UpdateFieldAsync(int fieldId, FieldUpdateDTO fieldDto)
        {
            try
            {
                var field = await _context.Fields.FindAsync(fieldId);
                if (field == null)
                {
                    return false;
                }
                if (fieldDto.CategoryId.HasValue && !await CategoryExistAsync(fieldDto.CategoryId.Value))
                {
                    throw new ArgumentException($"Loại sân với ID {fieldDto.CategoryId.Value} không tồn tại.");
                }
                _mapper.Map(fieldDto, field);
                _context.Fields.Update(field);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi cập nhật sân với ID {fieldId}: {ex.Message}", ex);
            }
        }

        public async Task<bool> DeleteFieldAsync(int fieldId)
        {
            try
            {
                var field = await _context.Fields.FindAsync(fieldId);
                if (field == null)
                {
                    return false;
                }
                _context.Fields.Remove(field);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi xóa sân với ID {fieldId}: {ex.Message}", ex);
            }
        }
        public async Task<bool> FieldExistsAsync(int fieldId)
        {
            return await _context.Fields.AnyAsync(f => f.FieldId == fieldId);
        }

        public async Task<bool> FacilityExistsAsync(int facId)
        {
            return await _context.Facilities.AnyAsync(f => f.FacId == facId);
        }

        public async Task<bool> CategoryExistAsync(int categoryId)
        {
            return await _context.CategoryFields.AnyAsync(c => c.CategoryFieldId == categoryId);
        }

        public Task<bool> CategoryExistsAsync(int categoryId)
        {
            throw new NotImplementedException();
        }
    }
}