using System.Security.Claims;
using MarketplaceApi.Data;
using MarketplaceApi.DTOs.Orders;
using MarketplaceApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MarketplaceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;
    public OrdersController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var isAdmin = User.IsInRole("Admin");

        var q = _db.Orders
            .Include(o => o.Customer)
            .Include(o => o.Service).ThenInclude(s => s.Images)
            .Include(o => o.Service).ThenInclude(s => s.Vendor)
            .Include(o => o.Review)
            .AsQueryable();

        if (!isAdmin)
            q = q.Where(o => o.CustomerId == userId);

        var orders = await q
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => MapToDto(o))
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var isAdmin = User.IsInRole("Admin");

        var order = await _db.Orders
            .Include(o => o.Customer)
            .Include(o => o.Service).ThenInclude(s => s.Images)
            .Include(o => o.Service).ThenInclude(s => s.Vendor)
            .Include(o => o.Review)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null) return NotFound();
        if (!isAdmin && order.CustomerId != userId) return Forbid();

        return Ok(MapToDto(order));
    }

    [HttpPost, Authorize(Roles = "Customer")]
    public async Task<IActionResult> Create([FromBody] CreateOrderDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var service = await _db.Services.FindAsync(dto.ServiceId);

        if (service is null || !service.IsActive)
            return BadRequest(new { message = "Service not found or inactive." });

        var order = new Order
        {
            CustomerId = customerId,
            ServiceId = dto.ServiceId,
            TotalPrice = service.Price,
            Notes = dto.Notes
        };

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = order.Id }, new { id = order.Id });
    }

    [HttpPut("{id}/status"), Authorize(Roles = "Vendor,Admin")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var isAdmin = User.IsInRole("Admin");

        var order = await _db.Orders
            .Include(o => o.Service)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null) return NotFound();
        if (!isAdmin && order.Service.VendorId != userId) return Forbid();

        if (!Enum.TryParse<OrderStatus>(dto.Status, true, out var status))
            return BadRequest(new { message = "Invalid status." });

        order.Status = status;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    private static OrderDto MapToDto(Order o) => new()
    {
        Id = o.Id,
        Status = o.Status.ToString(),
        TotalPrice = o.TotalPrice,
        Notes = o.Notes,
        CreatedAt = o.CreatedAt,
        UpdatedAt = o.UpdatedAt,
        CustomerId = o.CustomerId,
        CustomerName = o.Customer?.FullName ?? "",
        CustomerEmail = o.Customer?.Email ?? "",
        ServiceId = o.ServiceId,
        ServiceTitle = o.Service?.Title ?? "",
        ServiceImage = o.Service?.Images.FirstOrDefault(i => i.IsPrimary)?.Url
                       ?? o.Service?.Images.FirstOrDefault()?.Url,
        VendorId = o.Service?.VendorId ?? "",
        VendorName = o.Service?.Vendor?.FullName ?? "",
        HasReview = o.Review is not null
    };
}
