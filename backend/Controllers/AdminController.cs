using MarketplaceApi.Data;
using MarketplaceApi.DTOs.Users;
using MarketplaceApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MarketplaceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;

    public AdminController(AppDbContext db, UserManager<ApplicationUser> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var totalUsers = await _db.Users.CountAsync();
        var totalServices = await _db.Services.CountAsync();
        var totalOrders = await _db.Orders.CountAsync();
        var totalRevenue = await _db.Orders
            .Where(o => o.Status == OrderStatus.Completed)
            .SumAsync(o => o.TotalPrice);

        var ordersByStatus = await _db.Orders
            .GroupBy(o => o.Status)
            .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
            .ToListAsync();

        var recentOrders = await _db.Orders
            .Include(o => o.Customer)
            .Include(o => o.Service)
            .OrderByDescending(o => o.CreatedAt)
            .Take(10)
            .Select(o => new
            {
                o.Id, Status = o.Status.ToString(), o.TotalPrice, o.CreatedAt,
                CustomerName = o.Customer.FullName,
                ServiceTitle = o.Service.Title
            })
            .ToListAsync();

        return Ok(new
        {
            TotalUsers = totalUsers,
            TotalServices = totalServices,
            TotalOrders = totalOrders,
            TotalRevenue = totalRevenue,
            OrdersByStatus = ordersByStatus,
            RecentOrders = recentOrders
        });
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var users = await _userManager.Users
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = new List<UserDto>();
        foreach (var u in users)
        {
            var roles = await _userManager.GetRolesAsync(u);
            result.Add(new UserDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email!,
                AvatarUrl = u.AvatarUrl,
                Bio = u.Bio,
                Role = roles.FirstOrDefault() ?? "Customer",
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            });
        }

        return Ok(new { Items = result, TotalCount = await _userManager.Users.CountAsync(), Page = page, PageSize = pageSize });
    }

    [HttpPut("users/{id}/role")]
    public async Task<IActionResult> UpdateUserRole(string id, [FromBody] UpdateUserRoleDto dto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user is null) return NotFound();

        var allowedRoles = new[] { "Admin", "Vendor", "Customer" };
        if (!allowedRoles.Contains(dto.Role))
            return BadRequest(new { message = "Invalid role." });

        var currentRoles = await _userManager.GetRolesAsync(user);
        await _userManager.RemoveFromRolesAsync(user, currentRoles);
        await _userManager.AddToRoleAsync(user, dto.Role);

        return NoContent();
    }

    [HttpPut("users/{id}/toggle")]
    public async Task<IActionResult> ToggleUserActive(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user is null) return NotFound();

        user.IsActive = !user.IsActive;
        await _userManager.UpdateAsync(user);

        return Ok(new { isActive = user.IsActive });
    }

    [HttpGet("orders")]
    public async Task<IActionResult> GetAllOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? status = null)
    {
        var q = _db.Orders
            .Include(o => o.Customer)
            .Include(o => o.Service).ThenInclude(s => s.Vendor)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<OrderStatus>(status, true, out var s))
            q = q.Where(o => o.Status == s);

        var total = await q.CountAsync();
        var orders = await q
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new
            {
                o.Id, Status = o.Status.ToString(), o.TotalPrice, o.CreatedAt, o.UpdatedAt,
                CustomerName = o.Customer.FullName,
                CustomerEmail = o.Customer.Email,
                ServiceTitle = o.Service.Title,
                VendorName = o.Service.Vendor.FullName
            })
            .ToListAsync();

        return Ok(new { Items = orders, TotalCount = total, Page = page, PageSize = pageSize });
    }
}
