using System.Security.Claims;
using MarketplaceApi.Data;
using MarketplaceApi.DTOs.Common;
using MarketplaceApi.DTOs.Services;
using MarketplaceApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MarketplaceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
    private readonly AppDbContext _db;
    public ServicesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] ServiceQueryParams query)
    {
        var q = _db.Services
            .Include(s => s.Category)
            .Include(s => s.Vendor)
            .Include(s => s.Images)
            .Include(s => s.Reviews)
            .Include(s => s.Orders)
            .Where(s => s.IsActive)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
            q = q.Where(s => s.Title.Contains(query.Search) || s.Description.Contains(query.Search));

        if (query.CategoryId.HasValue)
            q = q.Where(s => s.CategoryId == query.CategoryId);

        if (query.MinPrice.HasValue)
            q = q.Where(s => s.Price >= query.MinPrice);

        if (query.MaxPrice.HasValue)
            q = q.Where(s => s.Price <= query.MaxPrice);

        q = query.SortBy switch
        {
            "price_asc" => q.OrderBy(s => s.Price),
            "price_desc" => q.OrderByDescending(s => s.Price),
            "rating" => q.OrderByDescending(s => s.Reviews.Average(r => (double?)r.Rating) ?? 0),
            _ => q.OrderByDescending(s => s.CreatedAt)
        };

        var total = await q.CountAsync();
        var items = await q
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(s => MapToDto(s))
            .ToListAsync();

        return Ok(PaginatedResult<ServiceDto>.Create(items, total, query.Page, query.PageSize));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var s = await _db.Services
            .Include(s => s.Category)
            .Include(s => s.Vendor)
            .Include(s => s.Images)
            .Include(s => s.Reviews)
            .Include(s => s.Orders)
            .FirstOrDefaultAsync(s => s.Id == id);

        return s is null ? NotFound() : Ok(MapToDto(s));
    }

    [HttpPost, Authorize(Roles = "Vendor")]
    public async Task<IActionResult> Create([FromBody] CreateServiceDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var vendorId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var category = await _db.Categories.FindAsync(dto.CategoryId);
        if (category is null) return BadRequest(new { message = "Invalid category." });

        var service = new Service
        {
            Title = dto.Title,
            Description = dto.Description,
            Price = dto.Price,
            DeliveryTime = dto.DeliveryTime,
            CategoryId = dto.CategoryId,
            VendorId = vendorId,
            Images = dto.ImageUrls.Select((url, i) => new ServiceImage { Url = url, IsPrimary = i == 0 }).ToList()
        };

        _db.Services.Add(service);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = service.Id }, new { id = service.Id });
    }

    [HttpPut("{id}"), Authorize(Roles = "Vendor,Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateServiceDto dto)
    {
        var vendorId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var isAdmin = User.IsInRole("Admin");

        var service = await _db.Services.Include(s => s.Images).FirstOrDefaultAsync(s => s.Id == id);
        if (service is null) return NotFound();
        if (!isAdmin && service.VendorId != vendorId) return Forbid();

        if (dto.Title is not null) service.Title = dto.Title;
        if (dto.Description is not null) service.Description = dto.Description;
        if (dto.Price.HasValue) service.Price = dto.Price.Value;
        if (dto.DeliveryTime is not null) service.DeliveryTime = dto.DeliveryTime;
        if (dto.CategoryId.HasValue) service.CategoryId = dto.CategoryId.Value;
        if (dto.IsActive.HasValue) service.IsActive = dto.IsActive.Value;
        if (dto.ImageUrls is not null)
        {
            _db.ServiceImages.RemoveRange(service.Images);
            service.Images = dto.ImageUrls.Select((url, i) => new ServiceImage { Url = url, IsPrimary = i == 0, ServiceId = service.Id }).ToList();
        }
        service.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}"), Authorize(Roles = "Vendor,Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var vendorId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var isAdmin = User.IsInRole("Admin");

        var service = await _db.Services.FindAsync(id);
        if (service is null) return NotFound();
        if (!isAdmin && service.VendorId != vendorId) return Forbid();

        _db.Services.Remove(service);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("{id}/reviews")]
    public async Task<IActionResult> GetReviews(int id)
    {
        var reviews = await _db.Reviews
            .Include(r => r.Customer)
            .Where(r => r.ServiceId == id)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id, r.Rating, r.Comment, r.CreatedAt,
                CustomerName = r.Customer.FullName,
                CustomerAvatar = r.Customer.AvatarUrl
            })
            .ToListAsync();

        return Ok(reviews);
    }

    private static ServiceDto MapToDto(Service s) => new()
    {
        Id = s.Id,
        Title = s.Title,
        Description = s.Description,
        Price = s.Price,
        DeliveryTime = s.DeliveryTime,
        IsActive = s.IsActive,
        CreatedAt = s.CreatedAt,
        AverageRating = s.Reviews.Any() ? s.Reviews.Average(r => r.Rating) : 0,
        TotalReviews = s.Reviews.Count,
        TotalOrders = s.Orders.Count,
        CategoryId = s.CategoryId,
        CategoryName = s.Category?.Name ?? "",
        VendorId = s.VendorId,
        VendorName = s.Vendor?.FullName ?? "",
        VendorAvatar = s.Vendor?.AvatarUrl,
        VendorBio = s.Vendor?.Bio,
        ImageUrls = s.Images.OrderByDescending(i => i.IsPrimary).Select(i => i.Url).ToList()
    };
}
