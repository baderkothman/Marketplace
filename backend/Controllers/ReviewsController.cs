using System.Security.Claims;
using MarketplaceApi.Data;
using MarketplaceApi.DTOs.Reviews;
using MarketplaceApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MarketplaceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ReviewsController(AppDbContext db) => _db = db;

    [HttpPost, Authorize(Roles = "Customer")]
    public async Task<IActionResult> Create([FromBody] CreateReviewDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var order = await _db.Orders
            .Include(o => o.Review)
            .FirstOrDefaultAsync(o => o.Id == dto.OrderId);

        if (order is null) return NotFound(new { message = "Order not found." });
        if (order.CustomerId != customerId) return Forbid();
        if (order.Status != OrderStatus.Completed)
            return BadRequest(new { message = "Can only review completed orders." });
        if (order.Review is not null)
            return BadRequest(new { message = "Already reviewed this order." });

        var review = new Review
        {
            Rating = dto.Rating,
            Comment = dto.Comment,
            CustomerId = customerId,
            ServiceId = order.ServiceId,
            OrderId = order.Id
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

        return Ok(new { id = review.Id, message = "Review submitted." });
    }

    [HttpGet("service/{serviceId}")]
    public async Task<IActionResult> GetServiceReviews(int serviceId)
    {
        var reviews = await _db.Reviews
            .Include(r => r.Customer)
            .Where(r => r.ServiceId == serviceId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                CustomerId = r.CustomerId,
                CustomerName = r.Customer.FullName,
                CustomerAvatar = r.Customer.AvatarUrl,
                ServiceId = r.ServiceId,
                OrderId = r.OrderId
            })
            .ToListAsync();

        return Ok(reviews);
    }
}
