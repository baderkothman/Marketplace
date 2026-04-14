using System.Security.Claims;
using MarketplaceApi.Data;
using MarketplaceApi.DTOs.Orders;
using MarketplaceApi.DTOs.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MarketplaceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Vendor")]
public class VendorController : ControllerBase
{
    private readonly AppDbContext _db;
    public VendorController(AppDbContext db) => _db = db;

    private string VendorId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet("services")]
    public async Task<IActionResult> GetMyServices()
    {
        var services = await _db.Services
            .Include(s => s.Category)
            .Include(s => s.Images)
            .Include(s => s.Reviews)
            .Include(s => s.Orders)
            .Where(s => s.VendorId == VendorId)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new ServiceDto
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
                CategoryName = s.Category.Name,
                VendorId = s.VendorId,
                VendorName = "",
                ImageUrls = s.Images.OrderByDescending(i => i.IsPrimary).Select(i => i.Url).ToList()
            })
            .ToListAsync();

        return Ok(services);
    }

    [HttpGet("orders")]
    public async Task<IActionResult> GetMyOrders()
    {
        var orders = await _db.Orders
            .Include(o => o.Customer)
            .Include(o => o.Service).ThenInclude(s => s.Images)
            .Include(o => o.Review)
            .Where(o => o.Service.VendorId == VendorId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderDto
            {
                Id = o.Id,
                Status = o.Status.ToString(),
                TotalPrice = o.TotalPrice,
                Notes = o.Notes,
                CreatedAt = o.CreatedAt,
                UpdatedAt = o.UpdatedAt,
                CustomerId = o.CustomerId,
                CustomerName = o.Customer.FullName,
                CustomerEmail = o.Customer.Email ?? "",
                ServiceId = o.ServiceId,
                ServiceTitle = o.Service.Title,
                ServiceImage = o.Service.Images.Where(i => i.IsPrimary).Select(i => i.Url).FirstOrDefault()
                               ?? o.Service.Images.Select(i => i.Url).FirstOrDefault(),
                VendorId = o.Service.VendorId,
                VendorName = "",
                HasReview = o.Review != null
            })
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var services = await _db.Services
            .Include(s => s.Orders)
            .Include(s => s.Reviews)
            .Where(s => s.VendorId == VendorId)
            .ToListAsync();

        var orders = services.SelectMany(s => s.Orders).ToList();

        return Ok(new
        {
            TotalServices = services.Count,
            ActiveServices = services.Count(s => s.IsActive),
            TotalOrders = orders.Count,
            PendingOrders = orders.Count(o => o.Status == Models.OrderStatus.Pending),
            CompletedOrders = orders.Count(o => o.Status == Models.OrderStatus.Completed),
            TotalEarnings = orders.Where(o => o.Status == Models.OrderStatus.Completed).Sum(o => o.TotalPrice),
            AverageRating = services.SelectMany(s => s.Reviews).Any()
                ? services.SelectMany(s => s.Reviews).Average(r => r.Rating)
                : 0
        });
    }
}
